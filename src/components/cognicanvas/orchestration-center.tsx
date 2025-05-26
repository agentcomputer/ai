
"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Tool } from './types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Send, Sparkles, MessageSquare, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { orchestrateTask, type OrchestrateTaskInput, type ToolInfo } from '@/ai/flows/orchestrate-task-flow';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useMCPContext } from '@/contexts/mcp-context';
import { ALL_TOOLS } from '@/components/cognicanvas/constants'; // UI tools

interface OrchestrationCenterProps {
  tools: Tool[]; // These are the UI tools, ALL_TOOLS will be used directly
  onSelectTool: (tool: Tool) => void;
  userName?: string;
}

interface OrchestrationMessage {
  id: string;
  sender: 'user' | 'agent' | 'log' | 'error';
  text: string;
  timestamp: Date;
  planSteps?: string[];
  identifiedToolIds?: string[];
  isPlan?: boolean;
  toolExecutionResult?: any;
}

const MCP_TOOL_ID_PREFIX = "mcp:";

const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const OrchestrationCenter: React.FC<OrchestrationCenterProps> = ({ tools: uiTools, onSelectTool, userName = "User" }) => {
  const [userInput, setUserInput] = useState('');
  const [conversation, setConversation] = useState<OrchestrationMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientReady, setClientReady] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<{ planSteps: string[], identifiedToolIds: string[], userGoal: string } | null>(null);

  const { tools: mcpTools, executeTool: mcpExecuteTool, isReady: mcpIsReady, error: mcpError } = useMCPContext();

  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setClientReady(true);
  }, []);
  
  useEffect(() => {
    if (clientReady && conversation.length === 0) {
      const initialMessages: OrchestrationMessage[] = [
        { id: generateUniqueId() + '-initial-agent', sender: 'agent', text: `Hello ${userName}, I'm your Orchestration Agent. How can I help you orchestrate a task or project today?`, timestamp: new Date() }
      ];
      if (mcpError) {
        initialMessages.push({ id: generateUniqueId() + '-mcp-error', sender: 'error', text: `MCP Error: ${mcpError}`, timestamp: new Date() });
      } else if (!mcpIsReady) {
        initialMessages.push({ id: generateUniqueId() + '-mcp-loading', sender: 'log', text: `Connecting to MCP servers...`, timestamp: new Date() });
      } else if (mcpTools.length > 0) {
         initialMessages.push({ id: generateUniqueId() + '-mcp-ready', sender: 'log', text: `Successfully connected to MCP servers. ${mcpTools.length} MCP tool(s) available.`, timestamp: new Date() });
      } else {
         initialMessages.push({ id: generateUniqueId() + '-mcp-no-tools', sender: 'log', text: `MCP servers connected, but no tools found.`, timestamp: new Date() });
      }
      setConversation(initialMessages);
    }
  }, [userName, clientReady, mcpIsReady, mcpError, mcpTools.length]);


  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversation, scrollToBottom]);

  const addMessage = useCallback((sender: OrchestrationMessage['sender'], text: string, details?: Partial<Omit<OrchestrationMessage, 'id' | 'sender' | 'text' | 'timestamp'>>) => {
    setConversation(prev => [...prev, { id: generateUniqueId(), sender, text, timestamp: new Date(), ...details }]);
  }, []);

  const combinedAvailableTools = useMemo((): ToolInfo[] => {
    const uiToolInfos: ToolInfo[] = ALL_TOOLS.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
    }));
    const mcpToolInfos: ToolInfo[] = mcpTools.map(t => ({
      id: `${MCP_TOOL_ID_PREFIX}${t.serverId}/${t.name}`, // Special ID format for MCP tools
      name: t.name,
      description: t.description,
    }));
    return [...uiToolInfos, ...mcpToolInfos];
  }, [mcpTools]);


  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const currentInput = userInput;
    addMessage('user', currentInput);
    setUserInput('');
    setIsProcessing(true);
    setCurrentPlan(null); 

    addMessage('log', 'Orchestration Agent is analyzing your request with available tools...');

    try {
      const orchestrationInput: OrchestrateTaskInput = { 
        userGoal: currentInput, 
        availableTools: combinedAvailableTools 
      };
      const result = await orchestrateTask(orchestrationInput);

      if (result.agentThoughtProcess) {
        addMessage('log', `Agent's thought: ${result.agentThoughtProcess}`);
      }

      if (result.clarificationQuestion) {
        addMessage('agent', result.clarificationQuestion);
      } else if (result.planSteps && result.planSteps.length > 0) {
        addMessage('agent', "Here's the plan I've formulated:", { planSteps: result.planSteps, identifiedToolIds: result.identifiedToolIds, isPlan: true });
        setCurrentPlan({ planSteps: result.planSteps, identifiedToolIds: result.identifiedToolIds, userGoal: currentInput });
      } else {
        addMessage('agent', "I'm not sure how to proceed with that. Could you please provide more details or clarify your goal?");
      }

    } catch (error: any) {
      console.error('Orchestration Error:', error);
      addMessage('error', `Sorry, an error occurred while planning: ${error.message || "Please try again."}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecutePlan = async () => {
    if (!currentPlan || currentPlan.identifiedToolIds.length === 0) {
      addMessage('log', 'No plan or tools identified to execute.');
      setCurrentPlan(null);
      return;
    }
  
    const firstToolIdInPlan = currentPlan.identifiedToolIds[0];
    addMessage('log', `Attempting to execute first step using tool ID: ${firstToolIdInPlan}...`);
    setIsProcessing(true);
  
    try {
      if (firstToolIdInPlan.startsWith(MCP_TOOL_ID_PREFIX)) {
        const mcpToolId = firstToolIdInPlan.substring(MCP_TOOL_ID_PREFIX.length);
        const [serverId, toolName] = mcpToolId.split('/');
  
        if (!serverId || !toolName) {
          throw new Error(`Invalid MCP tool ID format: ${firstToolIdInPlan}`);
        }
  
        const mcpTool = mcpTools.find(t => t.serverId === serverId && t.name === toolName);
        if (!mcpTool) {
          throw new Error(`MCP tool ${toolName} on server ${serverId} not found in context.`);
        }
  
        addMessage('log', `Executing MCP tool: ${toolName} on server ${serverId}.`);
        
        let args: any = {};
        // Specific argument preparation for 'sequential-thinking/start_reflective_process'
        if (serverId === 'sequential-thinking' && toolName === 'start_reflective_process') {
          args = { problem_statement: currentPlan.userGoal };
          addMessage('log', `Using user goal as problem_statement: "${currentPlan.userGoal}"`);
        }
  
        const result = await mcpExecuteTool(serverId, toolName, args);
        addMessage('agent', `Result from ${toolName}:`, { toolExecutionResult: result });
        // Optionally, proceed with next steps of the plan or re-evaluate
        
      } else {
        // Handle UI tool
        const toolToOpen = ALL_TOOLS.find(t => t.id === firstToolIdInPlan);
        if (toolToOpen) {
          addMessage('log', `Opening UI tool: ${toolToOpen.name}...`);
          onSelectTool(toolToOpen);
        } else {
          throw new Error(`UI tool with ID ${firstToolIdInPlan} not found.`);
        }
      }
    } catch (error: any) {
      console.error('Plan Execution Error:', error);
      addMessage('error', `Error executing plan step: ${error.message || "Unknown error"}`);
    } finally {
      setCurrentPlan(null); // Clear plan after attempting execution (or first step)
      setIsProcessing(false);
    }
  };

  const handleRefineTask = () => {
    addMessage('agent', "Okay, please rephrase your task or provide more details for a new plan.");
    setCurrentPlan(null);
    setUserInput(''); 
  };
  
  return (
    <div className="flex flex-col h-full p-4 md:p-6 lg:p-8 bg-background text-foreground overflow-hidden">
      <Card className="shadow-xl border-border flex flex-col flex-grow min-h-0"> {/* Chat Card takes all available space */}
        <CardHeader className="border-b p-4">
          <CardTitle className="text-xl flex items-center">
            <Sparkles className="mr-3 h-6 w-6 text-primary" />
            Orchestration Agent
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-grow flex flex-col overflow-hidden">
          <ScrollArea className="flex-grow" viewportRef={scrollViewportRef}>
            <div className="p-6 space-y-4">
              {conversation.map((msg) => (
                <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} ${msg.sender === 'log' || msg.sender === 'error' ? 'my-1' : 'my-2'}`}>
                  {msg.sender === 'agent' && (
                    <Avatar className="h-7 w-7 self-start mr-2 border border-border shrink-0">
                      <AvatarFallback className="bg-primary/10">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                   {msg.sender === 'error' && (
                    <Avatar className="h-7 w-7 self-start mr-2 border border-border shrink-0">
                      <AvatarFallback className="bg-destructive/10">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`p-3 rounded-lg text-sm shadow-sm max-w-[85%] md:max-w-[75%] ${
                    msg.sender === 'user' ? 'bg-primary text-primary-foreground ml-auto rounded-br-none' 
                    : msg.sender === 'agent' ? 'bg-card border border-border rounded-bl-none' 
                    : msg.sender === 'log' ? 'text-xs text-muted-foreground italic w-full text-center py-1.5 px-2 bg-transparent shadow-none'
                    : msg.sender === 'error' ? 'text-xs text-destructive italic w-full text-center py-1.5 px-2 bg-destructive/5 shadow-none border border-destructive/20'
                    : ''
                  }`}>
                    {msg.text}
                    {msg.isPlan && msg.planSteps && msg.planSteps.length > 0 && (
                      <div className="mt-2.5 pt-2.5 border-t border-border/50">
                        <h4 className="font-semibold mb-1.5 text-sm">Proposed Plan:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {msg.planSteps.map((step, index) => <li key={index}>{step}</li>)}
                        </ul>
                      </div>
                    )}
                    {msg.toolExecutionResult && (
                        <div className="mt-2.5 pt-2.5 border-t border-border/50">
                            <h4 className="font-semibold mb-1.5 text-sm">Tool Execution Result:</h4>
                            <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto">
                                {JSON.stringify(msg.toolExecutionResult, null, 2)}
                            </pre>
                        </div>
                    )}
                    {(msg.sender === 'agent' || msg.sender === 'user') && (
                      <p className={`text-xs mt-1.5 ${msg.sender === 'user' ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground/70'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                  {msg.sender === 'user' && (
                     <Avatar className="h-7 w-7 self-start ml-2 border border-border shrink-0">
                        <AvatarFallback className="bg-accent/20">
                           <MessageSquare className="h-4 w-4 text-accent" />
                        </AvatarFallback>
                     </Avatar>
                  )}
                </div>
              ))}
              {isProcessing && (
                 <div className="flex justify-start my-2">
                    <Avatar className="h-7 w-7 self-start mr-2 border border-border shrink-0">
                        <AvatarFallback className="bg-primary/10">
                           <Sparkles className="h-4 w-4 text-primary" />
                        </AvatarFallback>
                    </Avatar>
                    <div className="p-3 rounded-lg bg-card border border-border text-sm shadow-sm">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          {currentPlan && !isProcessing && (
            <div className="p-4 border-t bg-card flex flex-col sm:flex-row gap-2 justify-end">
              <Button variant="outline" onClick={handleRefineTask} className="w-full sm:w-auto">Refine Task</Button>
              <Button onClick={handleExecutePlan} className="w-full sm:w-auto">
                <CheckCircle className="mr-2 h-4 w-4"/> Execute First Step
              </Button>
            </div>
          )}
          <div className="p-3 border-t bg-card">
            <div className="flex items-start gap-2">
              <Textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Describe the task (e.g., 'Plan a weekend trip to the mountains')"
                rows={1}
                className="flex-grow resize-none min-h-[42px] max-h-[150px] text-sm bg-background focus-visible:ring-primary rounded-lg"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isProcessing || !mcpIsReady && !mcpError}
              />
              <Button onClick={handleSendMessage} disabled={isProcessing || !userInput.trim() || (!mcpIsReady && !mcpError)} size="icon" className="h-auto p-2.5 aspect-square shrink-0 rounded-lg">
                <Send className="h-5 w-5" />
              </Button>
            </div>
             {(!mcpIsReady && !mcpError && !isProcessing) && (
                <p className="text-xs text-muted-foreground mt-1.5 text-center">Waiting for MCP server connection to enable input...</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
    


      