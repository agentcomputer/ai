
import { Brain } from 'lucide-react';
import type { McpServerRegistry } from '@/types/mcp';

export const MCP_SERVER_CONFIGS: McpServerRegistry = {
  'sequential-thinking': {
    id: 'sequential-thinking',
    name: 'Sequential Thinking MCP',
    description: 'An MCP server for dynamic and reflective problem-solving through a structured thinking process.',
    processConfig: {
      command: 'npx', // Using npx to ensure tsx is resolved
      args: ['tsx', 'src/mcp-servers/sequential-thinking-server.ts'],
      // cwd: process.cwd(), // Optional: specify current working directory if needed
    },
    icon: Brain,
    tags: ['Problem Solving', 'AI', 'Reflection'],
    autoConnect: true, // Attempt to connect to this server on application startup
  },
  // Future MCP server configurations can be added here.
  // Example:
  // 'filesystem': {
  //   id: 'filesystem',
  //   name: 'Filesystem MCP',
  //   description: 'Provides tools for interacting with the local filesystem.',
  //   processConfig: {
  //     command: 'npx',
  //     args: ['@modelcontextprotocol/server-filesystem', './workspace'], // Example path
  //   },
  //   icon: Folder, 
  //   tags: ['Files', 'Storage', 'Local'],
  //   autoConnect: false,
  // },
};
