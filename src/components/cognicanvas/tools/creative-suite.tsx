
"use client";

import type { ToolProps } from '@/components/cognicanvas/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AgentStream } from '@/components/cognicanvas/agent-stream';
import { SmartSuggestions } from '@/components/cognicanvas/smart-suggestions';
import { 
  ImageIcon, Music, Film, ArrowLeft, Palette, Wand2, Sparkles,
  Brush, Pencil, Eraser, Type as TypeIcon, AlignLeft,
  Play as PlayIcon, Mic, PlusSquare, GripVertical, Waves,
  FileVideo, Scissors, CaseSensitive, UploadCloud, SlidersHorizontal
} from 'lucide-react';
import React, { useState } from 'react';

interface CreativeFeature {
  id: 'image' | 'music' | 'video';
  name: string;
  description: string;
  icon: React.ElementType;
}

const creativeFeatures: CreativeFeature[] = [
  {
    id: 'image',
    name: 'Image Creation',
    description: 'Generate and edit stunning visuals with AI assistance. Bring your ideas to life.',
    icon: ImageIcon,
  },
  {
    id: 'music',
    name: 'Music Creation',
    description: 'Compose unique soundtracks and melodies. Explore AI-driven musical possibilities.',
    icon: Music,
  },
  {
    id: 'video',
    name: 'Video Creation',
    description: 'Produce compelling video content. From storyboarding to simple edits, powered by AI.',
    icon: Film,
  },
];

export const CreativeSuite: React.FC<ToolProps> = ({ tool, onContentChange }) => {
  const [selectedFeature, setSelectedFeature] = useState<CreativeFeature | null>(null);

  const handleFeatureSelect = (feature: CreativeFeature) => {
    setSelectedFeature(feature);
  };

  const handleBackToSelection = () => {
    setSelectedFeature(null);
  };

  const renderFeatureSelection = () => (
    <div className="flex flex-col items-center justify-center h-full p-4 md:p-6">
      <div className="mb-6 text-center">
        <Palette className="w-12 h-12 mx-auto mb-3 text-primary/70" />
        <h2 className="text-2xl font-semibold text-foreground">Creative Tools</h2>
        <p className="text-muted-foreground">Select a creative tool below to begin your project.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
        {creativeFeatures.map((feature) => (
          <Card 
            key={feature.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer bg-card hover:bg-accent/10 flex flex-col"
            onClick={() => handleFeatureSelect(feature)}
          >
            <CardHeader className="items-center p-4">
              <feature.icon className="w-10 h-10 text-primary mb-2" />
              <CardTitle className="text-lg text-center">{feature.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-grow">
              <p className="text-sm text-muted-foreground text-center">{feature.description}</p>
            </CardContent>
            <CardFooter className="p-4 justify-center">
                <Button variant="outline" size="sm" className="w-full">Open {feature.name.split(' ')[0]} Tool</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSelectedFeature = () => {
    if (!selectedFeature) return null;

    const commonLayoutClasses = "w-full h-full p-4 flex flex-col bg-card text-card-foreground";

    const header = (
      <>
        <Button
          variant="ghost"
          onClick={handleBackToSelection}
          className="absolute top-4 left-4 text-sm z-10 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex flex-col items-center justify-center pt-8 pb-4 text-center relative mb-2">
          <selectedFeature.icon className="w-12 h-12 mb-3 text-primary" />
          <h2 className="text-2xl font-semibold">{selectedFeature.name}</h2>
        </div>
      </>
    );

    if (selectedFeature.id === 'image') {
      return (
        <div className={commonLayoutClasses}>
          {header}
          <div className="flex-grow flex rounded-md border shadow-inner overflow-hidden">
            <div className="w-16 bg-muted/30 border-r p-2 flex flex-col items-center space-y-3">
              {[Brush, Pencil, Eraser, TypeIcon, AlignLeft, Wand2].map((Icon, i) => (
                <Button key={i} variant="ghost" size="icon" className="hover:bg-primary/10">
                  <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                </Button>
              ))}
            </div>
            <div className="flex-grow flex flex-col">
              <div className="flex-grow bg-muted/20 flex items-center justify-center p-4">
                <div className="w-full h-full border-2 border-dashed border-input rounded-lg flex items-center justify-center text-muted-foreground">
                  Canvas Area
                </div>
              </div>
              <div className="p-2 border-t bg-muted/30 flex justify-end">
                <Button>
                  <Sparkles className="mr-2 h-4 w-4" /> Generate Image
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (selectedFeature.id === 'music') {
      return (
        <div className={commonLayoutClasses}>
          {header}
          <div className="flex-grow flex flex-col rounded-md border shadow-inner overflow-hidden">
            <div className="p-3 border-b bg-muted/30 flex items-center space-x-2">
              <Button variant="ghost" size="icon"><PlayIcon className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon"><Mic className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon"><PlusSquare className="h-5 w-5" /></Button>
              <span className="text-sm text-muted-foreground ml-auto">00:00 / 00:00</span>
            </div>
            <div className="flex-grow p-4 space-y-3 overflow-y-auto bg-muted/20">
              {['Synth Lead', 'Drum Beat', 'Bass Line', 'Ambient Pad'].map((trackName, i) => (
                <div key={i} className="p-3 border rounded-md bg-card flex items-center shadow-sm">
                  <GripVertical className="h-5 w-5 text-muted-foreground mr-2 cursor-grab" />
                  <Waves className="h-5 w-5 text-primary mr-3" />
                  <span className="text-sm font-medium flex-grow">{trackName}</span>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
             <div className="p-2 border-t bg-muted/30 flex justify-end">
                <Button>
                  <Sparkles className="mr-2 h-4 w-4" /> Generate Music
                </Button>
              </div>
          </div>
        </div>
      );
    }

    if (selectedFeature.id === 'video') {
      return (
        <div className={commonLayoutClasses}>
          {header}
          <div className="flex-grow grid grid-rows-[2fr_1fr] gap-2 rounded-md border shadow-inner overflow-hidden">
            <div className="bg-muted/20 flex items-center justify-center p-2">
              <div className="w-full h-full border-2 border-dashed border-input rounded-lg flex items-center justify-center text-muted-foreground">
                Video Preview
              </div>
            </div>
            <div className="flex flex-col bg-muted/30 border-t overflow-hidden">
              <div className="p-2 border-b flex items-center space-x-2">
                <Button variant="outline" size="sm"><UploadCloud className="mr-2 h-4 w-4" /> Import</Button>
                <Button variant="outline" size="sm"><Scissors className="mr-2 h-4 w-4" /> Split</Button>
                <Button variant="outline" size="sm"><CaseSensitive className="mr-2 h-4 w-4" /> Text</Button>
                 <Button variant="outline" size="sm" className="ml-auto"><Sparkles className="mr-2 h-4 w-4" /> Auto Edit</Button>
              </div>
              <div className="flex-grow p-2 space-x-1 bg-muted/10 overflow-x-auto whitespace-nowrap">
                {['Clip1.mp4', 'Transition', 'Clip2.mp4', 'Title.mov', 'Music.mp3'].map((item, i) => (
                  <div key={i} className={`inline-block h-full p-2 rounded-md text-xs items-center justify-center flex
                    ${item.includes('Clip') || item.includes('mov') ? 'bg-primary/20 text-primary-foreground w-24' : ''} 
                    ${item.includes('Transition') ? 'bg-accent text-accent-foreground w-16' : ''}
                    ${item.includes('Music') ? 'bg-green-500/20 text-green-700 w-32' : ''} `}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Fallback
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        {header}
        <p className="text-muted-foreground mb-4">
          The interface for {selectedFeature.name} is under construction.
        </p>
        <div className="w-full max-w-md p-8 border border-dashed rounded-lg bg-card shadow-inner">
          <p className="text-sm text-muted-foreground">
            AI assistance for {selectedFeature.name.toLowerCase()} is available via the agent panel.
          </p>
        </div>
      </div>
    );
  };

  return (
    <Card className="h-full flex flex-col shadow-xl rounded-lg overflow-hidden border-border bg-card">
      <CardHeader className="bg-card border-b p-4 flex flex-row items-center justify-between">
        <div className="flex items-center">
          <tool.icon className="mr-2 h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-semibold text-card-foreground">
            {tool.name} {selectedFeature ? `- ${selectedFeature.name}` : ''}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-grow flex flex-row overflow-hidden">
        {/* Main Creative Suite content area */}
        <div className="flex-grow flex flex-col bg-background text-card-foreground relative overflow-y-auto">
          {selectedFeature ? renderSelectedFeature() : renderFeatureSelection()}
        </div>
        {/* Agent Stream + Smart Suggestions part */}
        <div className="w-[340px] md:w-[380px] lg:w-[420px] border-l border-border flex flex-col bg-sidebar text-sidebar-foreground shrink-0">
          <AgentStream
            activeTool={tool}
            currentContent={selectedFeature ? `Using ${selectedFeature.name}` : tool.content || tool.name}
            onContentUpdate={(newContent) => {
              if (onContentChange) onContentChange(newContent);
            }}
          />
          <SmartSuggestions activeToolName={selectedFeature ? selectedFeature.name : tool.name} />
        </div>
      </CardContent>
      <CardFooter className="border-t p-3 text-xs text-muted-foreground bg-card">
        {selectedFeature ? `Create something amazing with ${selectedFeature.name}!` : `${tool.name} - Powered by Agent-Computer.`}
      </CardFooter>
    </Card>
  );
};
