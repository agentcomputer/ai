
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { McpTool, McpServerRegistry } from '@/types/mcp'; // McpServerConfig removed as it's not directly used here
import {
  initializeAndListToolsAction,
  executeMcpToolAction,
  // getConnectedMcpServersInfoAction, // We can add this later if needed for UI display
} from '@/actions/mcp-actions';
import { MCP_SERVER_CONFIGS } from '@/config/mcp-servers';


export interface UseMCPState {
  tools: McpTool[];
  executeTool: (serverId: string, toolName: string, args: any) => Promise<any>;
  isConnecting: boolean; // Represents initial connection/loading state
  error: string | null;
  isReady: boolean; // True when initial tools are loaded and manager is ready on server
  connectedServers: string[]; // IDs of successfully connected servers
}

export const useMCP = (
  // serverConfigs parameter is kept for potential future use but not directly passed to actions currently
  // as actions use the centrally defined MCP_SERVER_CONFIGS.
  _serverConfigs: McpServerRegistry = MCP_SERVER_CONFIGS 
): UseMCPState => {
  const [tools, setTools] = useState<McpTool[]>([]);
  const [isConnecting, setIsConnecting] = useState(true); // Start as true for initial load
  const [error, setError] = useState<string | null>(null);
  const [connectedServers, setConnectedServers] = useState<string[]>([]);

  const initializeAndLoadTools = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      console.log("useMCP: Calling initializeAndListToolsAction...");
      const result = await initializeAndListToolsAction();
      if (result.tools && result.connectedServerIds) {
        setTools(result.tools);
        setConnectedServers(result.connectedServerIds);
        console.log(`useMCP: Initialization successful. Tools: ${result.tools.length}, Connected Servers: ${result.connectedServerIds.join(', ')}`);
      } else {
        console.warn("useMCP: initializeAndListToolsAction returned unexpected data.", result);
        setError("MCP initialization returned incomplete data.");
        setTools([]);
        setConnectedServers([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize MCP and list tools.';
      console.error("useMCP: Error during initializeAndListToolsAction:", errorMessage, err);
      setError(errorMessage);
      setTools([]);
      setConnectedServers([]);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  useEffect(() => {
    initializeAndLoadTools();
    // No explicit cleanup needed here for disconnectAll, as that's typically an app-level concern
    // or handled by the server actions layer if needed (e.g. on app shutdown, if possible from server actions)
  }, [initializeAndLoadTools]);

  const executeMcpTool = useCallback(async (
    serverId: string,
    toolName: string,
    args: any
  ): Promise<any> => {
    if (!connectedServers.includes(serverId)) {
        // This check is client-side. The server action will also validate.
        console.error(`useMCP: Attempt to execute tool on non-connected server ${serverId}`);
        throw new Error(`MCP Server ${serverId} is not listed as connected.`);
    }
    try {
      return await executeMcpToolAction(serverId, toolName, args);
    } catch (err) {
      console.error(`useMCP: Error executing tool ${toolName} on ${serverId} via action:`, err);
      // Potentially set an error state here if you want to display it in the UI
      throw err; // Re-throw to be handled by the caller UI component
    }
  }, [connectedServers]);

  return {
    tools,
    executeTool: executeMcpTool,
    isConnecting,
    error,
    isReady: !isConnecting && error === null && connectedServers.length > 0, // Adjusted readiness logic
    connectedServers,
  };
};
