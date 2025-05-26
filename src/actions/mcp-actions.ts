
'use server';

import { MCPManager } from '@/lib/mcp-manager';
import { MCP_SERVER_CONFIGS } from '@/config/mcp-servers';
import type { McpTool, McpServerConfig } from '@/types/mcp';

let mcpManagerInstance: MCPManager | null = null;
let managerInitializationPromise: Promise<void> | null = null;

// Ensures the MCPManager is initialized once and returns the instance.
async function getInitializedManager(): Promise<MCPManager> {
  if (mcpManagerInstance && mcpManagerInstance.isManagerInitialized()) {
    return mcpManagerInstance;
  }

  if (!managerInitializationPromise) {
    console.log('MCP Actions: MCPManager instance or initialization promise not found. Creating new one.');
    mcpManagerInstance = new MCPManager(); // Create instance first
    managerInitializationPromise = mcpManagerInstance.initialize(MCP_SERVER_CONFIGS)
      .then(() => {
        console.log('MCP Actions: MCPManager initialized successfully.');
      })
      .catch((error) => {
        console.error('MCP Actions: MCPManager initialization failed:', error);
        // In case of error, reset instance and promise to allow retry on next call
        mcpManagerInstance = null; 
        managerInitializationPromise = null;
        throw error; // Re-throw to propagate the error to the caller
      });
  } else {
    console.log('MCP Actions: Waiting for existing MCPManager initialization promise to complete.');
  }
  
  await managerInitializationPromise;

  if (!mcpManagerInstance) {
    throw new Error('MCP Actions: MCPManager instance is null after initialization attempt.');
  }
  return mcpManagerInstance;
}

export async function initializeAndListToolsAction(): Promise<{ tools: McpTool[]; connectedServerIds: string[] }> {
  try {
    const manager = await getInitializedManager();
    const tools = manager.listAllAvailableTools();
    const connectedServersData = manager.getConnectedServersInfo(MCP_SERVER_CONFIGS);
    const connectedServerIds = connectedServersData.map(s => s.id);
    return { tools, connectedServerIds };
  } catch (error) {
    console.error('Error in initializeAndListToolsAction:', error);
    return { tools: [], connectedServerIds: [] }; // Return empty on error to prevent app crash
  }
}

export async function executeMcpToolAction(serverId: string, toolName: string, args: any): Promise<any> {
  try {
    const manager = await getInitializedManager();
    return await manager.executeTool(serverId, toolName, args);
  } catch (error) {
    console.error(`Error in executeMcpToolAction for ${toolName} on ${serverId}:`, error);
    throw error; // Re-throw to be handled by the caller
  }
}

export async function getConnectedMcpServersInfoAction(): Promise<Array<Pick<McpServerConfig, 'id' | 'name' | 'description' | 'icon' | 'tags'> & {toolsCount: number}>> {
    try {
        const manager = await getInitializedManager();
        return manager.getConnectedServersInfo(MCP_SERVER_CONFIGS);
    } catch (error) {
        console.error('Error in getConnectedMcpServersInfoAction:', error);
        return []; // Return empty on error
    }
}

export async function disconnectAllMcpServersAction(): Promise<void> {
  // This action is more for manual triggering if needed, e.g. in development.
  // Be cautious with this in a production environment if manager is shared.
  if (mcpManagerInstance) {
    try {
      await mcpManagerInstance.disconnectAll();
      mcpManagerInstance = null;
      managerInitializationPromise = null; // Reset promise
      console.log('MCP Actions: All MCP servers disconnected and manager reset.');
    } catch (error) {
      console.error('Error in disconnectAllMcpServersAction:', error);
      throw error;
    }
  } else {
    console.log('MCP Actions: No MCP manager instance to disconnect.');
  }
}

// Note: Proper handling of the MCPManager lifecycle, especially in a serverless environment
// or with multiple concurrent requests/users, can be complex.
// The singleton approach here is simplified for the current context.
// In a real production app, consider where and how often the manager should be truly "reset".

    