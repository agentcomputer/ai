
"use client";

import React, { createContext, useContext, type ReactNode } from 'react';
import { useMCP, type UseMCPState } from '@/hooks/use-mcp';
import { MCP_SERVER_CONFIGS } from '@/config/mcp-servers'; // Ensure this path is correct

// Define a default state that matches UseMCPState structure
const defaultMCPState: UseMCPState = {
  tools: [],
  executeTool: async () => { throw new Error('MCPContext not yet initialized'); },
  isConnecting: true,
  error: null,
  isReady: false,
  connectedServers: [],
};

const MCPContext = createContext<UseMCPState>(defaultMCPState);

export const MCPProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const mcpState = useMCP(MCP_SERVER_CONFIGS); // Pass the configurations here

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
