
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { McpTool, McpServerRegistry, McpServerConfig } from '@/types/mcp';
import {
  initializeAndListToolsAction,
  executeMcpToolAction,
  getConnectedMcpServersInfoAction, // Added this action
} from '@/actions/mcp-actions';
import { MCP_SERVER_CONFIGS } from '@/config/mcp-servers';


// Updated type for connectedServers to match what getConnectedMcpServersInfoAction returns
export type ConnectedServerInfo = Pick<McpServerConfig, 'id' | 'name' | 'description' | 'icon' | 'tags'> & {toolsCount: number};

export interface UseMCPState {
  tools: McpTool[];
  executeTool: (serverId: string, toolName: string, args: any) => Promise<any>;
  isConnecting: boolean; 
  error: string | null;
  isReady: boolean; 
  connectedServers: ConnectedServerInfo[]; // Updated type
}

export const useMCP = (
  _serverConfigs: McpServerRegistry = MCP_SERVER_CONFIGS 
): UseMCPState => {
  const [tools, setTools] = useState<McpTool[]>([]);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectedServers, setConnectedServers] = useState<ConnectedServerInfo[]>([]); // Updated type

  const initializeAndLoadData = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      console.log("useMCP: Calling initializeAndListToolsAction and getConnectedMcpServersInfoAction...");
      // Fetch tools and basic connected server IDs first
      const toolsResult = await initializeAndListToolsAction();
      if (toolsResult.tools) {
        setTools(toolsResult.tools);
        console.log(`useMCP: Tools loaded: ${toolsResult.tools.length}`);
      } else {
        console.warn("useMCP: initializeAndListToolsAction did not return tools.", toolsResult);
        // setError("MCP initialization did not return tools."); // Keep error for server info
        setTools([]);
      }

      // Then fetch detailed connected server info
      const serversInfo = await getConnectedMcpServersInfoAction();
      setConnectedServers(serversInfo);
      console.log(`useMCP: Connected servers info loaded: ${serversInfo.length}`);

      if (!toolsResult.tools && serversInfo.length === 0) {
        setError("MCP initialization failed to load tools or connect to servers.");
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize MCP and load data.';
      console.error("useMCP: Error during initialization:", errorMessage, err);
      setError(errorMessage);
      setTools([]);
      setConnectedServers([]);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  useEffect(() => {
    initializeAndLoadData();
  }, [initializeAndLoadData]);

  const executeMcpTool = useCallback(async (
    serverId: string,
    toolName: string,
    args: any
  ): Promise<any> => {
    if (!connectedServers.some(s => s.id === serverId)) {
        console.error(`useMCP: Attempt to execute tool on non-connected server ${serverId}`);
        throw new Error(`MCP Server ${serverId} is not listed as connected.`);
    }
    try {
      return await executeMcpToolAction(serverId, toolName, args);
    } catch (err) {
      console.error(`useMCP: Error executing tool ${toolName} on ${serverId} via action:`, err);
      throw err; 
    }
  }, [connectedServers]); // Dependency on connectedServers for the check

  return {
    tools,
    executeTool: executeMcpTool,
    isConnecting,
    error,
    isReady: !isConnecting && error === null, // Simplified readiness, actual server connection check is per server
    connectedServers,
  };
};

