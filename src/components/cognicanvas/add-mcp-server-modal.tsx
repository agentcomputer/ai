
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Server, Search, PlugZap, Wifi, Briefcase, Terminal, Lightbulb, Brain, MessageSquare, Workflow, Loader2 } from 'lucide-react'; // Added Loader2
import { cn } from '@/lib/utils';
import { useMCPContext } from '@/contexts/mcp-context';
import type { McpServerConfig } from '@/types/mcp';

// Updated interface to align with what getConnectedMcpServersInfoAction provides
interface ConnectedMcpServerInfo extends Pick<McpServerConfig, 'id' | 'name' | 'description' | 'icon' | 'tags'> {
  toolsCount: number;
  status?: 'Online' | 'Offline' | 'Experimental';
  type?: 'Official' | 'Community' | 'Private' | 'Utility';
  region?: string;
}


interface AddMcpServerModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export const AddMcpServerModal: React.FC<AddMcpServerModalProps> = ({ isOpen, onOpenChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { connectedServers: rawConnectedServersData, isReady: mcpIsReady, isConnecting: mcpIsConnecting } = useMCPContext();
  
  const [displayServers, setDisplayServers] = useState<ConnectedMcpServerInfo[]>([]);

  useEffect(() => {
    if (mcpIsReady && rawConnectedServersData) {
      const formattedServers: ConnectedMcpServerInfo[] = rawConnectedServersData.map(server => ({
        ...server,
        status: 'Online', // If it's in connectedServers, it's online
        type: server.tags?.includes('Official') ? 'Official' : 
              server.tags?.includes('Community') ? 'Community' :
              server.tags?.includes('Private') ? 'Private' :
              server.tags?.includes('Utility') ? 'Utility' : 'Official',
        region: server.tags?.find(tag => tag.toLowerCase().includes('region')) || 'Global',
      }));
      setDisplayServers(formattedServers);
    } else {
      setDisplayServers([]);
    }
  }, [mcpIsReady, rawConnectedServersData]);


  const filteredServers = useMemo(() => {
    if (!searchTerm.trim()) {
      return displayServers;
    }
    return displayServers.filter(server =>
      server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      server.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (server.type && server.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (server.region && server.region.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (server.tags && server.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  }, [searchTerm, displayServers]);

  const getStatusIcon = (status?: ConnectedMcpServerInfo['status']) => {
    if (status === 'Online') return <Wifi className="h-4 w-4 text-green-500" />;
    return <Wifi className="h-4 w-4 text-muted-foreground" />;
  };

  const getTypeIcon = (type?: ConnectedMcpServerInfo['type'], customIcon?: React.ElementType) => {
    const IconComponent = customIcon || Server;
    if (customIcon) {
        return <IconComponent className="h-5 w-5 text-primary" />;
    }
    switch (type) {
        case 'Official': return <Briefcase className="h-5 w-5 text-blue-500" />;
        case 'Community': return <MessageSquare className="h-5 w-5 text-purple-500" />;
        case 'Private': return <Terminal className="h-5 w-5 text-gray-500" />;
        case 'Utility': return <Workflow className="h-5 w-5 text-teal-500" />;
        default: return <Server className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="flex items-center text-xl font-semibold">
            <PlugZap className="mr-3 h-6 w-6 text-primary" />
            Connected MCP Servers
          </DialogTitle>
          <DialogDescription className="pt-1">
            View and manage your connected Multi-Context Processing (MCP) servers. New servers can be added via configuration.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search connected servers..."
              className="pl-10 h-10 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-grow min-h-0 px-6 py-4">
          {mcpIsConnecting && (
            <div className="text-center py-10 text-muted-foreground">
              <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
              <p>Loading connected MCP servers...</p>
            </div>
          )}
          {!mcpIsConnecting && mcpIsReady && filteredServers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredServers.map((server) => (
                <Card key={server.id} className="shadow-md hover:shadow-lg transition-shadow bg-card flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(server.type, server.icon)}
                        <CardTitle className="text-base font-semibold">{server.name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {getStatusIcon(server.status)}
                        <span>{server.status || 'Online'}</span>
                      </div>
                    </div>
                    <CardDescription className="text-xs pt-1">
                      ID: {server.id} &bull; Tools: {server.toolsCount}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground flex-grow pb-3">
                    {server.description}
                    {server.tags && server.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {server.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">{tag}</span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0 pb-4">
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      disabled
                    >
                      Details (Connection Managed)
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          {!mcpIsConnecting && (!mcpIsReady || filteredServers.length === 0) && (
            <div className="text-center py-10 text-muted-foreground">
              <Server className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>No MCP servers found or connected.</p>
              <p className="text-xs">Configure servers in `src/config/mcp-servers.ts` and ensure they are running.</p>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="p-6 border-t">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

