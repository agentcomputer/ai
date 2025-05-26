
"use client";

import { useState, useEffect, useCallback } from 'react';
import { getMcpManager, type MCPManager } from '@/lib/mcp-manager';
import type { McpTool, McpServerConfig, McpServerRegistry } from '@/types/mcp';
import { MCP_SERVER_CONFIGS } from '@/config/mcp-servers';

export interface UseMCPState {
  tools: McpTool[];
  executeTool: (serverId: string, toolName: string, args: any) => Promise<any>;
  isConnecting: boolean;
  error: string | null;
  isReady: boolean;
  connectedServers: string[];
}

export const useMCP = (serverConfigs: McpServerRegistry = MCP_SERVER_CONFIGS): UseMCPState => {
  const [mcpManagerInstance, setMcpManagerInstance] = useState<MCPManager | null>(null);
  const [tools, setTools] = useState<McpTool[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectedServers, setConnectedServers] = useState<string[]>([]);

  const initializeMCP = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    setTools([]);
    setConnectedServers([]);

    const manager = getMcpManager(); // Use the singleton instance

    try {
      const autoConnectPromises = Object.entries(serverConfigs)
        .filter(([_, config]) => config.autoConnect)
        .map(async ([serverId, config]) => {
          try {
            await manager.connectServer(serverId, config.processConfig);
            return serverId; // Return serverId on successful connection
          } catch (connectError) {
            console.warn(`MCP: Could not auto-connect to ${serverId}:`, connectError);
            return null; // Return null or handle error as needed for this server
          }
        });
      
      const successfulConnections = (await Promise.all(autoConnectPromises)).filter(id => id !== null) as string[];
      setConnectedServers(successfulConnections);

      if (successfulConnections.length > 0) {
        const availableTools = await manager.listAvailableTools();
        setTools(availableTools);
      } else if (Object.values(serverConfigs).some(c => c.autoConnect)) {
         console.warn("MCP: No auto-connect servers established a connection.");
      }
      
      setMcpManagerInstance(manager);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize MCP';
      console.error("MCP Initialization Error:", errorMessage, err);
      setError(errorMessage);
      setMcpManagerInstance(null); // Ensure manager is null on error
    } finally {
      setIsConnecting(false);
    }
  }, [serverConfigs]);

  useEffect(() => {
    initializeMCP();

    return () => {
      // Cleanup: Get the current manager instance and disconnect all servers
      // This needs careful handling if multiple useMCP instances exist,
      // but with a singleton manager, this should be okay.
      const manager = getMcpManager();
      manager.disconnectAll().catch(e => console.error("Error during MCP disconnectAll:", e));
    };
  }, [initializeMCP]); // Re-run if serverConfigs changes, though typically it won't

  const executeTool = useCallback(async (
    serverId: string,
    toolName: string,
    args: any
  ): Promise<any> => {
    if (!mcpManagerInstance) {
      throw new Error('MCP Manager not initialized or connection failed.');
    }
    if (!connectedServers.includes(serverId)){
      throw new Error(`MCP Server ${serverId} is not connected or ready.`);
    }

    try {
      return await mcpManagerInstance.executeTool(serverId, toolName, args);
    } catch (err) {
      console.error(`MCP Tool execution failed for ${toolName} on ${serverId}:`, err);
      throw err; // Re-throw to be handled by the caller
    }
  }, [mcpManagerInstance, connectedServers]);

  return {
    tools,
    executeTool,
    isConnecting,
    error,
    isReady: !!mcpManagerInstance && !isConnecting && connectedServers.length > 0,
    connectedServers,
  };
};
