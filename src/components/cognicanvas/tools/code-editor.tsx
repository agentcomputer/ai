
"use client";

import type { ToolProps } from '@/components/cognicanvas/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AgentStream } from '@/components/cognicanvas/agent-stream';
import { SmartSuggestions } from '@/components/cognicanvas/smart-suggestions';
import { Code, Play, Save, FileCog } from 'lucide-react';

export const CodeEditor: React.FC<ToolProps> = ({ tool, onContentChange }) => {
  const sampleCode = `
function greet(name: string) {
  console.log(\`Hello, \${name}!\`);
}

greet('World');
  `.trim();

  return (
    <Card className="h-full flex flex-col shadow-xl rounded-lg overflow-hidden border-border bg-card">
      <CardHeader className="bg-card border-b p-4">
        <CardTitle className="text-lg font-semibold flex items-center text-card-foreground">
          <tool.icon className="mr-2 h-5 w-5 text-primary" />
          {tool.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-grow flex flex-row overflow-hidden">
        {/* Main Tool content area */}
        <div className="flex-grow flex flex-col p-4 bg-background">
          <div className="flex items-center justify-end mb-2 space-x-2">
            <Button variant="outline" size="sm">
              <Play className="mr-2 h-4 w-4" />
              Run
            </Button>
            <Button variant="outline" size="sm">
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button variant="outline" size="sm">
              <FileCog className="mr-2 h-4 w-4" />
              Format
            </Button>
          </div>
          <div className="flex-grow rounded-md border border-input bg-card p-4 overflow-auto">
            <pre className="text-sm text-card-foreground">
              <code>{sampleCode}</code>
            </pre>
          </div>
        </div>
        {/* Agent Stream + Smart Suggestions part */}
        <div className="w-[340px] md:w-[380px] lg:w-[420px] border-l border-border flex flex-col bg-sidebar text-sidebar-foreground shrink-0">
          <AgentStream
            activeTool={tool}
            currentContent={tool.content || ''}
            onContentUpdate={(newContent) => {
              if (onContentChange) onContentChange(newContent);
            }}
          />
          <SmartSuggestions activeToolName={tool.name} />
        </div>
      </CardContent>
      <CardFooter className="border-t p-3 text-xs text-muted-foreground bg-card">
        {tool.name} - Powered by Agent-Computer.
      </CardFooter>
    </Card>
  );
};
