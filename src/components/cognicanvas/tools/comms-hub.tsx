
"use client";

import type { ToolProps } from '@/components/cognicanvas/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AgentStream } from '@/components/cognicanvas/agent-stream';
import { SmartSuggestions } from '@/components/cognicanvas/smart-suggestions';
import { 
  Mail, Users, Video, ArrowLeft, MessageSquare, Send, Inbox, Archive, 
  Rss, AtSign, PlusSquare, MicOff, VideoOff, PhoneOff, ScreenShare, UserCircle
} from 'lucide-react';
import React, { useState } from 'react';

interface CommsFeature {
  id: 'email' | 'social' | 'video';
  name: string;
  description: string;
  icon: React.ElementType;
}

const commsFeatures: CommsFeature[] = [
  {
    id: 'email',
    name: 'Email Client',
    description: 'Manage your emails efficiently with AI sorting and drafting.',
    icon: Mail,
  },
  {
    id: 'social',
    name: 'Social Hub',
    description: 'Stay connected with your networks and manage social media interactions.',
    icon: Users,
  },
  {
    id: 'video',
    name: 'Video Calls',
    description: 'Start or join video meetings with AI-powered summaries and transcriptions.',
    icon: Video,
  },
];

export const CommsHub: React.FC<ToolProps> = ({ tool, onContentChange }) => {
  const [selectedFeature, setSelectedFeature] = useState<CommsFeature | null>(null);

  const handleFeatureSelect = (feature: CommsFeature) => {
    setSelectedFeature(feature);
  };

  const handleBackToSelection = () => {
    setSelectedFeature(null);
  };

  const renderFeatureSelection = () => (
    <div className="flex flex-col items-center justify-center h-full p-4 md:p-6">
      <div className="mb-6 text-center">
        <MessageSquare className="w-12 h-12 mx-auto mb-3 text-primary/70" />
        <h2 className="text-2xl font-semibold text-foreground">Communication Tools</h2>
        <p className="text-muted-foreground">Select a communication tool below to get started.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
        {commsFeatures.map((feature) => (
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
                <Button variant="outline" size="sm" className="w-full">Open {feature.name.split(' ')[0]}</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSelectedFeature = () => {
    if (!selectedFeature) return null;

    const commonLayoutClasses = "w-full h-full p-4 flex flex-col bg-background"; // Added bg-background

    const header = (
      <>
        <Button
          variant="ghost"
          onClick={handleBackToSelection}
          className="absolute top-4 left-4 text-sm z-10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex flex-col items-center justify-center pt-8 pb-4 text-center relative">
          <selectedFeature.icon className="w-12 h-12 mb-3 text-primary" />
          <h2 className="text-2xl font-semibold text-foreground">{selectedFeature.name}</h2>
        </div>
      </>
    );

    if (selectedFeature.id === 'email') {
      return (
        <div className={commonLayoutClasses}>
          {header}
          <div className="flex-grow flex rounded-md border bg-card text-card-foreground shadow">
            <div className="w-1/4 border-r p-4 space-y-2">
              <Button variant="default" className="w-full justify-start">
                <PlusSquare className="mr-2 h-4 w-4" /> Compose
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Inbox className="mr-2 h-4 w-4" /> Inbox
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Send className="mr-2 h-4 w-4" /> Sent
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Archive className="mr-2 h-4 w-4" /> Archive
              </Button>
            </div>
            <div className="w-3/4 p-4">
              <h3 className="text-lg font-semibold mb-2">Inbox</h3>
              <div className="space-y-3">
                {[
                  { sender: 'Alice Wonderland', subject: 'Project Update', snippet: 'Just wanted to share the latest progress...' },
                  { sender: 'Bob The Builder', subject: 'Meeting Reminder', snippet: 'Friendly reminder about our meeting tomorrow...' },
                  { sender: 'Carol Danvers', subject: 'Weekend Plans?', snippet: 'Hey, any plans for the upcoming weekend?' },
                ].map((email, i) => (
                  <div key={i} className="p-3 border rounded-md hover:bg-accent cursor-pointer">
                    <p className="font-semibold text-sm">{email.sender}</p>
                    <p className="text-xs text-muted-foreground">{email.subject}</p>
                    <p className="text-xs truncate">{email.snippet}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (selectedFeature.id === 'social') {
      return (
        <div className={commonLayoutClasses}>
          {header}
          <div className="flex-grow flex rounded-md border bg-card text-card-foreground shadow">
            <div className="w-1/4 border-r p-4 space-y-2">
              <Button variant="default" className="w-full justify-start">
                <PlusSquare className="mr-2 h-4 w-4" /> New Post
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Rss className="mr-2 h-4 w-4" /> Feed
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <AtSign className="mr-2 h-4 w-4" /> Mentions
              </Button>
            </div>
            <div className="w-3/4 p-4 space-y-4 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-2">Feed</h3>
              {[
                { user: 'TechGuru', avatar: '/avatars/01.png', content: 'Just unboxed the new AI gadget! #AI #Tech #Innovation' },
                { user: 'FoodieFan', avatar: '/avatars/02.png', content: 'Trying out a new recipe tonight. Wish me luck! 🍲 #Food #Cooking' },
                { user: 'TravelExplorer', avatar: '/avatars/03.png', content: 'Exploring the beautiful mountains of Switzerland! 🏔️ #Travel #Adventure' },
              ].map((post, i) => (
                <Card key={i} className="bg-background">
                  <CardHeader className="p-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={post.avatar} alt={post.user} />
                        <AvatarFallback>{post.user.substring(0,2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{post.user}</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <p className="text-sm">{post.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (selectedFeature.id === 'video') {
      return (
        <div className={commonLayoutClasses}>
          {header}
          <div className="flex-grow flex flex-col rounded-md border bg-card text-card-foreground shadow overflow-hidden">
            <div className="flex-grow bg-muted/40 flex items-center justify-center relative p-2">
              <div className="w-full h-full bg-black rounded flex items-center justify-center text-white">
                Main Video Feed (Participant A)
              </div>
              <div className="absolute bottom-2 right-2 grid grid-cols-2 gap-1">
                {[1, 2, 3].map(p => (
                  <div key={p} className="w-24 h-16 bg-slate-700 rounded flex items-center justify-center text-white text-xs p-1">
                    User {String.fromCharCode(65 + p)}
                  </div>
                ))}
                 <div className="w-24 h-16 bg-slate-800 rounded flex items-center justify-center text-white text-xs p-1">
                    You
                  </div>
              </div>
            </div>
            <div className="border-t p-3 bg-card flex justify-center items-center space-x-2">
              <Button variant="outline" size="icon" className="bg-red-500 hover:bg-red-600 text-white">
                <PhoneOff className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon">
                <MicOff className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon">
                <VideoOff className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon">
                <ScreenShare className="h-5 w-5" />
              </Button>
               <Button variant="outline" size="icon">
                <Users className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Fallback for any other feature or if logic is missing (should not happen with current setup)
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        {header}
        <p className="text-muted-foreground mb-4">
          The interface for {selectedFeature.name} is under construction.
        </p>
        <div className="w-full max-w-md p-8 border border-dashed rounded-lg bg-background shadow-inner">
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
        {/* Main Comms Hub content area */}
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
        {selectedFeature ? `Manage your ${selectedFeature.name.toLowerCase()} with AI.` : `${tool.name} - Your central communication point.`}
      </CardFooter>
    </Card>
  );
};
