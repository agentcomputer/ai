
import type React from 'react';
import type { LucideIcon } from 'lucide-react';

/**
 * Configuration for spawning an MCP server process.
 */
export interface McpServerProcessConfig {
  command: string; // The command to execute (e.g., 'node', 'npx', 'python')
  args?: string[]; // Arguments for the command
  env?: Record<string, string>; // Environment variables for the server process
  cwd?: string; // Current working directory for the spawned process
}

/**
 * Configuration for an individual MCP server.
 */
export interface McpServerConfig {
  id: string; // Unique identifier for the server
  name: string; // User-friendly display name
  description: string; // Description of the server's purpose and capabilities
  processConfig: McpServerProcessConfig; // Configuration for how to run the server
  icon?: LucideIcon | React.ElementType; // Icon for display in UI
  tags?: string[]; // Tags for categorization and search
  autoConnect?: boolean; // Whether the MCPManager should attempt to connect to this server on startup
}

/**
 * A registry mapping server IDs to their configurations.
 */
export type McpServerRegistry = Record<string, McpServerConfig>;

/**
 * Represents a tool provided by an MCP server, augmented with server information.
 */
export interface McpTool {
  serverId: string; // ID of the server providing the tool
  name: string; // Name of the tool
  description: string; // Description of the tool
  inputSchema?: any; // JSON schema for the tool's input arguments
  // Add any other relevant properties from the MCP SDK's tool definition
}
