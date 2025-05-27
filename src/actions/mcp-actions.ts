
'use server';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn, type ChildProcess } from 'child_process';
import type { ToolDefinition as SdkToolDefinition } from '@modelcontextprotocol/sdk/types.js'; // Renamed to avoid conflict if McpTool is also named ToolDefinition
import { MCP_SERVER_CONFIGS } from '@/config/mcp-servers';
import type { McpServerConfig, McpServerRegistry, McpTool } from '@/types/mcp';

// Utility function for promise with timeout
function promiseWithTimeout<T>(promise: Promise<T>, ms: number, timeoutError = new Error('Operation timed out')): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(timeoutError);
    }, ms);

    promise
      .then(value => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch(err => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// Define ToolDefinition locally if it's just a subset or re-export from SDK
// For now, assuming McpTool from @/types/mcp is sufficient for internal mapping,
// and SdkToolDefinition is what the SDK provides.

interface MCPConnection {
  client: Client;
  process: ChildProcess;
  tools: SdkToolDefinition[]; // Tools as defined by the MCP SDK
  serverConfig: McpServerConfig; // Store the original config for reference
}

class MCPManager {
  private connections = new Map<string, MCPConnection>();
  private managerIsInitialized = false;

  constructor() {
    // Constructor is clean of Node.js process global event listeners
  }

  public isManagerInitialized(): boolean {
    return this.managerIsInitialized;
  }

  public async initialize(serverRegistry: McpServerRegistry): Promise<void> {
    if (this.managerIsInitialized) {
      console.log('MCPManager already initialized.');
      return;
    }
    console.log('MCPManager: Initializing...');
    const connectionPromises = Object.values(serverRegistry)
      .filter(config => config.autoConnect)
      .map(config => this.connectServer(config));
    
    await Promise.allSettled(connectionPromises);
    this.managerIsInitialized = true;
    console.log('MCPManager: Initialization complete. Connected servers:', Array.from(this.connections.keys()));
  }

  async connectServer(serverConfig: McpServerConfig): Promise<void> {
    if (this.connections.has(serverConfig.id)) {
      console.log(`MCPManager: Server ${serverConfig.id} is already connected or connection attempt in progress.`);
      return;
    }

    console.log(`MCPManager: Attempting to connect to ${serverConfig.name} (ID: ${serverConfig.id})...`);

    let serverProcess: ChildProcess;

    try {
      serverProcess = spawn(serverConfig.processConfig.command, serverConfig.processConfig.args, {
        stdio: ['pipe', 'pipe', 'pipe'], 
        env: { ...process.env, ...serverConfig.processConfig.env, NODE_ENV: process.env.NODE_ENV },
        cwd: serverConfig.processConfig.cwd,
      });
      
      serverProcess.stderr?.on('data', (data) => {
        console.error(`MCP Server [${serverConfig.id}] stderr: ${data.toString().trim()}`);
      });

      serverProcess.on('error', (err) => {
        console.error(`MCPManager: Failed to start server process for ${serverConfig.id}:`, err);
        this.connections.delete(serverConfig.id); 
      });

      serverProcess.on('exit', (code, signal) => {
        console.log(`MCPManager: Server process ${serverConfig.id} exited with code ${code} and signal ${signal}`);
        this.connections.delete(serverConfig.id);
      });
      
      const transport = new StdioClientTransport({
        reader: serverProcess.stdout,
        writer: serverProcess.stdin,
      });

      const client = new Client(
        { name: 'agent-computer-client', version: '1.0.0' }, 
        { capabilities: {} } 
      );

      await client.connect(transport);
      console.log(`MCPManager: Successfully established transport with ${serverConfig.name}.`);

      let tools: SdkToolDefinition[] = [];
      try {
        const toolsListPromise = client.request<{ tools: SdkToolDefinition[] }>({ method: 'tools/list' }, {});
        // Added timeout for tools/list request
        const toolsResponse = await promiseWithTimeout(
          toolsListPromise, 
          15000, // 15 second timeout
          new Error(`MCPManager: Tools list request timed out for ${serverConfig.name}`)
        );
        tools = toolsResponse?.tools || [];
        console.log(`MCPManager: Fetched ${tools.length} tools from ${serverConfig.name}.`);
      } catch (toolError) { // This catch block now handles timeouts for tools/list as well
        console.error(`MCPManager: Failed to list tools for ${serverConfig.name}:`, toolError);
        // Re-throw to be caught by the outer catch in connectServer for consistent cleanup
        // The outer catch will handle client.close(), serverProcess.kill(), and this.connections.delete()
        throw toolError; 
      }

      this.connections.set(serverConfig.id, {
        client,
        process: serverProcess,
        tools,
        serverConfig 
      });

      console.log(`✓ MCPManager: Connected to ${serverConfig.name} (ID: ${serverConfig.id}).`);
    } catch (error) {
      console.error(`✗ MCPManager: Failed to connect to ${serverConfig.name} (ID: ${serverConfig.id}):`, error);
      if (serverProcess && !serverProcess.killed) {
        serverProcess.kill();
      }
      this.connections.delete(serverConfig.id);
      // Do not re-throw here if initialize is called with allSettled,
      // as individual connection failures are handled by allSettled.
      // However, if connectServer is called directly, re-throwing might be desired.
      // For now, let's assume initialize handles aggregation of results/errors.
    }
  }

  listTools(serverId: string): SdkToolDefinition[] {
    const connection = this.connections.get(serverId);
    if (!connection) {
      throw new Error(`MCPManager: Server ${serverId} not connected or connection lost.`);
    }
    return connection.tools;
  }

  listAllAvailableTools(): McpTool[] {
    const allTools: McpTool[] = [];
    for (const [serverId, connection] of this.connections.entries()) {
      const serverTools = connection.tools || [];
      allTools.push(...serverTools.map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema || {}, 
        serverId: serverId,
      })));
    }
    return allTools;
  }
  
  getConnectedServersInfo(serverRegistryInput: McpServerRegistry): Array<Pick<McpServerConfig, 'id' | 'name' | 'description' | 'icon' | 'tags'> & {toolsCount: number}> {
    const info: Array<Pick<McpServerConfig, 'id' | 'name' | 'description' | 'icon' | 'tags'> & {toolsCount: number}> = [];
     for (const [serverId, connection] of this.connections.entries()) {
        const originalConfig = connection.serverConfig;
        info.push({
            id: serverId,
            name: originalConfig.name, 
            description: originalConfig.description,
            icon: originalConfig.icon,
            tags: originalConfig.tags,
            toolsCount: connection.tools.length,
        });
    }
    return info;
  }

  async executeTool(serverId: string, toolName: string, args: any = {}): Promise<any> {
    const connection = this.connections.get(serverId);
    if (!connection) {
      throw new Error(`MCPManager: Server ${serverId} not connected or connection lost.`);
    }

    console.log(`MCPManager: Executing tool "${toolName}" on server "${serverId}" with args:`, args);
    try {
      const response = await connection.client.request(
        { method: 'tools/call' },
        { name: toolName, arguments: args }
      );
      console.log(`MCPManager: Tool "${toolName}" executed successfully on "${serverId}". Response:`, response);
      return response;
    } catch (error) {
      console.error(`MCPManager: Error executing tool "${toolName}" on server "${serverId}":`, error);
      throw error;
    }
  }

  async disconnect(serverId: string): Promise<void> {
    const connection = this.connections.get(serverId);
    if (connection) {
      console.log(`MCPManager: Disconnecting from server ${serverId}...`);
      try {
        await connection.client.close();
      } catch (closeError) {
        console.error(`MCPManager: Error closing client for ${serverId}:`, closeError);
      }
      if (connection.process && !connection.process.killed) {
        connection.process.kill('SIGTERM'); 
        await new Promise(resolve => setTimeout(resolve, 200)); 
        if (connection.process && !connection.process.killed) {
            console.log(`MCPManager: Server process ${serverId} did not terminate with SIGTERM, sending SIGKILL.`);
            connection.process.kill('SIGKILL');
        }
      }
      this.connections.delete(serverId);
      console.log(`MCPManager: Disconnected from server ${serverId}.`);
    }
  }

  async disconnectAll(): Promise<void> {
    console.log('MCPManager: Disconnecting all server connections...');
    const disconnectionPromises = Array.from(this.connections.keys()).map(serverId => this.disconnect(serverId));
    await Promise.allSettled(disconnectionPromises);
    this.connections.clear();
    console.log('MCPManager: All server connections closed and processes terminated.');
    this.managerIsInitialized = false;
  }
}


// Singleton instance management for MCPManager within this server module
let mcpManagerInstance: MCPManager | null = null;
let managerInitializationPromise: Promise<void> | null = null;

async function getInitializedManager(): Promise<MCPManager> {
  if (mcpManagerInstance && mcpManagerInstance.isManagerInitialized()) {
    return mcpManagerInstance;
  }

  if (!managerInitializationPromise) {
    console.log('MCP Actions: MCPManager instance or initialization promise not found. Creating new one.');
    if (!mcpManagerInstance) { // Create instance only if it truly doesn't exist
        mcpManagerInstance = new MCPManager();
    }
    managerInitializationPromise = mcpManagerInstance.initialize(MCP_SERVER_CONFIGS)
      .then(() => {
        console.log('MCP Actions: MCPManager initialized successfully.');
      })
      .catch((error) => {
        console.error('MCP Actions: MCPManager initialization failed:', error);
        mcpManagerInstance = null; 
        managerInitializationPromise = null;
        throw error; 
      });
  } else {
    console.log('MCP Actions: Waiting for existing MCPManager initialization promise to complete.');
  }
  
  await managerInitializationPromise;

  if (!mcpManagerInstance) { // Check again after await
    throw new Error('MCP Actions: MCPManager instance is null after initialization attempt.');
  }
  return mcpManagerInstance;
}

export async function initializeAndListToolsAction(): Promise<{ tools: McpTool[]; connectedServerIds: string[] }> {
  try {
    const manager = await getInitializedManager();
    const tools = manager.listAllAvailableTools();
    // Get connected server IDs from the manager's connections map keys
    const connectedServerIds = Array.from(manager['connections'].keys());
    return { tools, connectedServerIds };
  } catch (error) {
    console.error('Error in initializeAndListToolsAction:', error);
    return { tools: [], connectedServerIds: [] }; 
  }
}

export async function executeMcpToolAction(serverId: string, toolName: string, args: any): Promise<any> {
  try {
    const manager = await getInitializedManager();
    return await manager.executeTool(serverId, toolName, args);
  } catch (error) {
    console.error(`Error in executeMcpToolAction for ${toolName} on ${serverId}:`, error);
    throw error; 
  }
}

export async function getConnectedMcpServersInfoAction(): Promise<Array<Pick<McpServerConfig, 'id' | 'name' | 'description' | 'icon' | 'tags'> & {toolsCount: number}>> {
    try {
        const manager = await getInitializedManager();
        return manager.getConnectedServersInfo(MCP_SERVER_CONFIGS);
    } catch (error) {
        console.error('Error in getConnectedMcpServersInfoAction:', error);
        return [];
    }
}

export async function disconnectAllMcpServersAction(): Promise<void> {
  if (mcpManagerInstance) {
    try {
      await mcpManagerInstance.disconnectAll();
      mcpManagerInstance = null;
      managerInitializationPromise = null; 
      console.log('MCP Actions: All MCP servers disconnected and manager reset.');
    } catch (error) {
      console.error('Error in disconnectAllMcpServersAction:', error);
      throw error;
    }
  } else {
    console.log('MCP Actions: No MCP manager instance to disconnect.');
  }
}
