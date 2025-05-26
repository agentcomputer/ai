
"use client";

import React, { createContext, useContext, type ReactNode } from 'react';
import { useMCP, type UseMCPState } from '@/hooks/use-mcp';
import { MCP_SERVER_CONFIGS } from '@/config/mcp-servers'; 
import type { McpServerConfig } from '@/types/mcp'; // Import McpServerConfig

// Define a default state that matches UseMCPState structure
const defaultMCPState: UseMCPState = {
  tools: [],
  executeTool: async () => { throw new Error('MCPContext not yet initialized'); },
  isConnecting: true,
  error: null,
  isReady: false,
  // Ensure connectedServers in default state matches the expected type.
  // The type is Array<Pick<McpServerConfig, 'id' | 'name' | 'description' | 'icon' | 'tags'> & {toolsCount: number}>
  connectedServers: [], 
};

const MCPContext = createContext<UseMCPState>(defaultMCPState);

export const MCPProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // useMCP doesn't strictly need MCP_SERVER_CONFIGS passed if actions always use the central one,
  // but passing it aligns with its signature and allows flexibility if needed.
  const mcpState = useMCP(MCP_SERVER_CONFIGS); 

  return (
    <MCPContext.Provider value={mcpState}>
      {children}
    </MCPContext.Provider>
  );
};

export const useMCPContext = (): UseMCPState => {
  const context = useContext(MCPContext);
  if (context === undefined) {
    throw new Error('useMCPContext must be used within an MCPProvider');
  }
  return context;
};

