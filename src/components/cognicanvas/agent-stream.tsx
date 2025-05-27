
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ActiveToolInstance, AgentMessage, WebSummaryPreviewData } from './types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Brain, User, Sparkles, Loader2, CheckCircle, RotateCcw, Globe, Edit3, CheckSquare } from 'lucide-react'; // Added Edit3, CheckSquare
import { aiAssistedDrafting, type AiAssistedDraftingInput } from '@/ai/flows/ai-assisted-drafting';
import { summarizeWebpage } from '@/ai/flows/web-navigator-summarization';
import { generalToolAgentFlow, type GeneralToolAgentInput } from '@/ai/flows/general-tool-agent';
import { refineDraftFlow, type RefineDraftInput } from '@/ai/flows/refine-draft'; // Added
import { cn } from '@/lib/utils';

interface AgentStreamProps {
  activeTool: ActiveToolInstance;
  currentContent?: string;
  onContentUpdate: (newContent: string, previewData?: WebSummaryPreviewData) => void; // Modified to include previewData
}

// Basic URL validation regex (simplified)
const URL_REGEX = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/i;

const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const AgentStream: React.FC<AgentStreamProps> = ({ activeTool, currentContent, onContentUpdate }) => {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // State for "Modify" workflow
  const [isModifying, setIsModifying] = useState(false);
  const [modificationInput, setModificationInput] = useState('');
  const [draftToModify, setDraftToModify] = useState<string | null>(null);

  // State for "Approve" button
  const [hasPendingApproval, setHasPendingApproval] = useState(false);

  const contentBeforeLastAIEditRef = useRef<string | undefined>();

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Effect for when the tool instance changes: reset chat and undo state.
  useEffect(() => {
    setMessages([
      { id: generateUniqueId(), type: 'agent', content: `Agent ready for ${activeTool.name}. How can I assist?`, timestamp: new Date() }
    ]);
    setInput('');
    contentBeforeLastAIEditRef.current = undefined;
    // Reset modification and approval state when tool changes
    setIsModifying(false);
    setModificationInput('');
    setDraftToModify(null);
    setHasPendingApproval(false);
  }, [activeTool.instanceId, activeTool.name]);

  const addMessage = useCallback((type: AgentMessage['type'], content: string, previewData?: any) => {
    setMessages(prev => [...prev, { id: generateUniqueId(), type, content, timestamp: new Date(), previewData }]);
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim()) return;

    const userInput = input;
    addMessage('user', userInput);
    setInput('');
    setIsLoading(true);
    
    // For Document Processor, capture the content *just before* the AI modification for undo.
    if (activeTool.id === 'document-processor') {
        contentBeforeLastAIEditRef.current = currentContent; 
    }

    try {
      addMessage('log', `Processing request for ${activeTool.name}...`);

    if (activeTool.id === 'document-processor') {
      addMessage('log', `Engaging Document Processor AI...`);
      const draftInput: AiAssistedDraftingInput = {
        prompt: currentContent ? `Context:\n${currentContent}\n\nUser request: ${userInput}` : userInput,
      };
      const result = await aiAssistedDrafting(draftInput);
      addMessage('log', `AI draft received.`);
      addMessage('agent', result.draft);
      onContentUpdate(result.draft);
      setHasPendingApproval(true); // An AI suggestion is made, ready for approval
    } else if (activeTool.id === 'web-navigator') {
      const isUrl = URL_REGEX.test(userInput.trim());
      const summarizeCommand = userInput.toLowerCase().startsWith("summarize ");
      let urlToSummarize: string | null = null;

      if (isUrl) {
        urlToSummarize = userInput.trim();
      } else if (summarizeCommand) {
        const potentialUrl = userInput.substring("summarize ".length).trim();
        if (URL_REGEX.test(potentialUrl)) {
          urlToSummarize = potentialUrl;
        }
      }

      if (urlToSummarize) {
        addMessage('log', `Attempting to summarize URL: ${urlToSummarize}`);
        try {
          // Basic client-side validation for protocol, matching web-navigator.tsx
          let validatedUrl = urlToSummarize;
          if (!validatedUrl.startsWith('http://') && !validatedUrl.startsWith('https://')) {
             validatedUrl = 'https://' + validatedUrl; // Default to https
          }
          new URL(validatedUrl); // This will throw if still invalid

          const result = await summarizeWebpage({ url: validatedUrl });
          const summaryPreview: WebSummaryPreviewData = { type: 'web-summary', url: validatedUrl, summaryText: result.summary };
          addMessage('preview', `Summary for ${validatedUrl}:\n${result.summary}`, summaryPreview);
          onContentUpdate(result.summary, summaryPreview);
        } catch (e: any) {
          console.error("Error summarizing webpage from AgentStream:", e);
          const errorMsg = e instanceof TypeError && e.message.includes("Invalid URL") ?
            "Invalid URL provided for summarization. Please ensure it starts with http:// or https://" :
            (e.message || 'Failed to summarize webpage.');
          const errorPreview: WebSummaryPreviewData = { type: 'web-summary', url: urlToSummarize, summaryText: '', error: errorMsg };
          addMessage('agent', `Error summarizing ${urlToSummarize}: ${errorMsg}`, errorPreview);
          onContentUpdate(errorMsg, errorPreview);
        }
      } else {
        addMessage('log', `Simulating AI response for ${activeTool.name}...`);
        await new Promise(resolve => setTimeout(resolve, 800));
        addMessage('agent', `For ${activeTool.name}: You can ask me to summarize a URL by typing 'summarize <URL>' or just pasting a URL. Otherwise, how can I help you with web navigation tasks or general queries? Your request was: "${userInput}"`);
      }
    } else {
      // Handle other tools with the generalToolAgentFlow
      addMessage('log', `Engaging general AI assistant for ${activeTool.name}...`);
      const agentInput: GeneralToolAgentInput = {
        toolName: activeTool.name,
        userPrompt: userInput,
      };
      try {
        const result = await generalToolAgentFlow(agentInput);
        addMessage('agent', result.agentResponse);
      } catch (flowError: any) {
        console.error(`Error in generalToolAgentFlow for ${activeTool.name}:`, flowError);
        addMessage('agent', `Sorry, I encountered an issue while assisting with ${activeTool.name}. Please try again.`);
      }
    }

  } catch (error: any) {
    console.error('AI Error:', error);
    addMessage('agent', `Sorry, an error occurred: ${error.message || "Please try again."}`);
  } finally {
    setIsLoading(false);
  }
  }, [input, addMessage, activeTool, currentContent, onContentUpdate]);

  const handleUndo = useCallback(() => {
    if (activeTool.id === 'document-processor' && contentBeforeLastAIEditRef.current !== undefined) {
      onContentUpdate(contentBeforeLastAIEditRef.current);
      addMessage('log', `Reverted to previous content for ${activeTool.name}.`);
      setHasPendingApproval(false); // After undo, there's no new AI suggestion to approve
    } else {
      addMessage('log', 'Undo action is primarily for Document Processor content or not applicable here.');
    }
  }, [activeTool.id, activeTool.name, onContentUpdate, addMessage]);

  const handleModifyClick = useCallback(() => {
    const lastAgentMessage = messages.slice().reverse().find(m => m.type === 'agent');
    const contentToModify = lastAgentMessage ? lastAgentMessage.content : currentContent;

    if (contentToModify) {
      setIsModifying(true);
      setDraftToModify(contentToModify);
      addMessage('log', "Please type your modification instructions below and press Enter or click 'Submit Modification'.");
      setInput(''); // Clear main input
    } else {
      addMessage('log', "No content available to modify. Please generate some content first.");
    }
  }, [messages, currentContent, addMessage]);

  const handleModificationSubmit = useCallback(async () => {
    if (!modificationInput.trim() || !draftToModify) {
      addMessage('log', "Modification instructions are empty or no draft was selected. Please try again.");
      return;
    }

    const userModInput = modificationInput;
    addMessage('user', `Modification request: ${userModInput}`);
    
    setIsLoading(true);
    // contentBeforeLastAIEditRef.current = draftToModify; // Capture content *before* this specific modification

    try {
      addMessage('log', `Refining draft for ${activeTool.name}...`);
      const refineInput: RefineDraftInput = {
        originalDraft: draftToModify,
        modificationInstructions: userModInput,
      };
      const result = await refineDraftFlow(refineInput);
      
      contentBeforeLastAIEditRef.current = draftToModify; // Set undo point to the draft *before* this successful modification
      
      onContentUpdate(result.refinedDraft);
      addMessage('agent', result.refinedDraft);
      addMessage('log', "Draft refined successfully.");
      setHasPendingApproval(true); // A refined draft is an AI suggestion, ready for approval
    } catch (error: any) {
      console.error('Refine Draft Error:', error);
      addMessage('agent', `Sorry, an error occurred while refining the draft: ${error.message || "Please try again."}`);
      // Optionally, do not clear draftToModify if refinement fails, allowing user to retry or adjust.
      // For now, we clear it as per original plan.
    } finally {
      setIsLoading(false);
      setIsModifying(false);
      setModificationInput('');
      setDraftToModify(null); // Clear after attempt
    }
  }, [modificationInput, draftToModify, addMessage, activeTool.name, onContentUpdate]);

  const handleApproveClick = useCallback(() => {
    if (activeTool.id === 'document-processor') {
      addMessage('log', "User approved the AI's last suggestion. This version is now the baseline.");
      contentBeforeLastAIEditRef.current = undefined; // Clear the undo history for this change
      setHasPendingApproval(false); // The suggestion has been approved
    }
  }, [activeTool.id, addMessage]);
  
  const showDocumentProcessorActions = activeTool.id === 'document-processor' && messages.some(m => m.type === 'agent') && !isLoading && !isModifying;

  return (
    <div className="flex flex-col h-full bg-inherit text-foreground">
      <ScrollArea className="flex-grow p-3 space-y-3" ref={scrollAreaRef}>
        {/* Message rendering (same as before) */}
        {messages.map((msg) => (
          <div key={msg.id} className={cn('flex mb-2', msg.type === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn('flex items-end gap-2 max-w-[85%]', msg.type === 'log' ? 'w-full' : '')}>
              {msg.type !== 'user' && msg.type !== 'log' && (
                <Avatar className="h-7 w-7 self-start border border-border">
                  <AvatarFallback className="bg-muted">
                    {msg.type === 'agent' && <Brain className="h-3.5 w-3.5 text-primary" />}
                    {msg.type === 'preview' && (msg.previewData?.type === 'web-summary' ? <Globe className="h-3.5 w-3.5 text-blue-500" /> : <Sparkles className="h-3.5 w-3.5 text-accent" />)}
                  </AvatarFallback>
                </Avatar>
              )}
              {msg.type === 'user' && (
                <Avatar className="h-7 w-7 self-start border border-border order-2">
                  <AvatarFallback className="bg-accent/20">
                    <User className="h-3.5 w-3.5 text-accent" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn('p-2.5 rounded-xl shadow-sm text-sm leading-relaxed',
                  msg.type === 'user' ? 'bg-accent text-accent-foreground rounded-br-none order-1' : '',
                  msg.type === 'agent' ? 'bg-card text-card-foreground rounded-bl-none border border-border' : '',
                  msg.type === 'log' ? 'text-xs text-muted-foreground italic w-full text-center py-1 px-2 bg-transparent shadow-none' : '',
                  msg.type === 'preview' && msg.previewData?.type === 'web-summary' ? 'border border-blue-500/30 bg-blue-500/5 p-3' :
                  msg.type === 'preview' ? 'border border-border bg-background p-2' : ''
                )}
              >
                {msg.previewData?.type === 'web-summary' && (
                  <div className="space-y-1.5">
                    <p className="font-medium text-blue-700 dark:text-blue-400">Web Summary:</p>
                    <a href={msg.previewData.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 dark:text-blue-500 hover:underline truncate block">
                      {msg.previewData.url}
                    </a>
                    {msg.previewData.summaryText && <p className="whitespace-pre-wrap">{msg.previewData.summaryText}</p>}
                    {msg.previewData.error && <p className="text-red-600 dark:text-red-500">Error: {msg.previewData.error}</p>}
                  </div>
                )}
                {(!msg.previewData || msg.previewData?.type !== 'web-summary') && msg.content}
                {msg.type === 'log' && (
                  <span className="text-xs ml-2 text-muted-foreground/60">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && !isModifying && ( // Show loading indicator only if not in modification input mode (or handle separately)
          <div className="flex justify-start mb-2">
             <div className="flex items-end gap-2 max-w-[85%]">
                <Avatar className="h-7 w-7 self-start border border-border">
                  <AvatarFallback className="bg-muted">
                     <Brain className="h-3.5 w-3.5 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div className="p-2.5 rounded-xl shadow-sm text-sm bg-card text-card-foreground rounded-bl-none border border-border">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
             </div>
          </div>
        )}
      </ScrollArea>
      
      <div className="border-t border-border p-3 space-y-2.5 bg-inherit">
        {showDocumentProcessorActions && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleApproveClick} className="flex-1 text-xs" disabled={!hasPendingApproval}>
              <CheckSquare className="mr-1.5 h-3.5 w-3.5" /> Approve
            </Button>
            <Button variant="outline" size="sm" onClick={handleUndo} className="flex-1 text-xs" disabled={contentBeforeLastAIEditRef.current === undefined || isModifying || !hasPendingApproval}>
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Undo
            </Button>
             <Button variant="outline" size="sm" onClick={handleModifyClick} className="flex-1 text-xs" disabled={!hasPendingApproval && contentBeforeLastAIEditRef.current === undefined}>
              <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Modify
            </Button>
          </div>
        )}

        {isModifying && (
          <div className="space-y-2">
            <Textarea
              value={modificationInput}
              onChange={(e) => setModificationInput(e.target.value)}
              placeholder="Enter your modification instructions..."
              rows={2}
              className="flex-grow resize-none text-sm bg-card focus-visible:ring-primary"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleModificationSubmit();
                }
              }}
              disabled={isLoading}
              aria-label="Modification instructions input"
            />
            <div className="flex gap-2">
              <Button onClick={handleModificationSubmit} disabled={isLoading || !modificationInput.trim()} size="sm" className="flex-1">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Submit Modification
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setIsModifying(false); setModificationInput(''); setDraftToModify(null); addMessage('log', 'Modification cancelled.');}} disabled={isLoading} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {!isModifying && (
          <div className="flex items-center gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Message ${activeTool.name} AI...`}
              rows={1}
              className="flex-grow resize-none min-h-[40px] max-h-[120px] text-sm bg-card focus-visible:ring-primary"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isLoading || isModifying} // Disable if loading or modifying
              aria-label="Chat input for AI agent"
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !input.trim() || isModifying} size="icon" className="h-10 w-10 shrink-0 rounded-full">
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
