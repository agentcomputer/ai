
"use client";

import type { ToolProps } from '@/components/cognicanvas/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AgentStream } from '@/components/cognicanvas/agent-stream';
import { SmartSuggestions } from '@/components/cognicanvas/smart-suggestions';
import { Presentation, PlusSquare, Type, Image as ImageIcon, Palette, Play, Sparkles } from 'lucide-react';

export const PresentationBuilder: React.FC<ToolProps> = ({ tool, onContentChange }) => {
  const slides = [
    { id: 1, title: "Introduction", content: "Welcome to the presentation!" },
    { id: 2, title: "Key Points", content: "Discussing main topics here." },
    { id: 3, title: "Visuals", content: "Showing some charts and images." },
    { id: 4, title: "Conclusion", content: "Summary and Q&A." },
  ];
  const [currentSlide, setCurrentSlide] = React.useState(slides[0]);

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
        <div className="flex-grow flex flex-col bg-muted/30">
          {/* Top Bar */}
          <div className="bg-card border-b p-2 flex items-center space-x-1">
            <Button variant="ghost" size="sm"><PlusSquare className="mr-2 h-4 w-4" /> New Slide</Button>
            <Button variant="ghost" size="sm"><Type className="mr-2 h-4 w-4" /> Textbox</Button>
            <Button variant="ghost" size="sm"><ImageIcon className="mr-2 h-4 w-4" /> Image</Button>
            <Button variant="ghost" size="sm"><Palette className="mr-2 h-4 w-4" /> Themes</Button>
            <div className="flex-grow" />
            <Button variant="ghost" size="sm"><Sparkles className="mr-2 h-4 w-4 text-yellow-500" /> AI Assist</Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <Play className="mr-2 h-4 w-4" /> Present
            </Button>
          </div>

          {/* Main Content Area (Sidebar + Current Slide) */}
          <div className="flex-grow flex flex-row overflow-hidden">
            {/* Sidebar for Slide Thumbnails */}
            <div className="w-48 bg-card border-r p-2 space-y-2 overflow-y-auto">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  onClick={() => setCurrentSlide(slide)}
                  className={`p-2 border rounded-md cursor-pointer aspect-[16/9] flex flex-col justify-center items-center text-xs
                              ${currentSlide.id === slide.id ? 'bg-primary/20 border-primary shadow-md' : 'bg-muted hover:bg-muted/80'}`}
                >
                  <span className="font-semibold text-muted-foreground mb-1">Slide {index + 1}</span>
                  <p className="text-center text-muted-foreground/80 truncate w-full px-1">{slide.title}</p>
                </div>
              ))}
            </div>

            {/* Current Slide Area */}
            <div className="flex-grow p-4 md:p-8 flex items-center justify-center">
              <div className="w-full aspect-[16/9] bg-white shadow-xl rounded-lg p-6 md:p-10 flex flex-col items-center justify-center border">
                <h2 className="text-xl md:text-3xl font-semibold text-gray-800 mb-4 text-center">{currentSlide.title}</h2>
                <p className="text-sm md:text-base text-gray-600 text-center">{currentSlide.content}</p>
                <div className="mt-auto text-xs text-gray-400">Slide {slides.findIndex(s => s.id === currentSlide.id) + 1} of {slides.length}</div>
              </div>
            </div>
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
