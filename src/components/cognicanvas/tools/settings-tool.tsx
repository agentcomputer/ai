
"use client";

import type { ToolProps } from '@/components/cognicanvas/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AgentStream } from '@/components/cognicanvas/agent-stream';
import { SmartSuggestions } from '@/components/cognicanvas/smart-suggestions';
import { Settings, Palette, User, Bell, Puzzle, Keyboard, Info } from 'lucide-react';
import React, { useState } from 'react';

type SettingsCategory = 'appearance' | 'account' | 'notifications' | 'integrations' | 'keyboard' | 'about';

interface CategoryItem {
  id: SettingsCategory;
  name: string;
  icon: React.ElementType;
}

const settingCategories: CategoryItem[] = [
  { id: 'appearance', name: 'Appearance', icon: Palette },
  { id: 'account', name: 'Account', icon: User },
  { id: 'notifications', name: 'Notifications', icon: Bell },
  { id: 'integrations', name: 'Integrations', icon: Puzzle },
  { id: 'keyboard', name: 'Keyboard Shortcuts', icon: Keyboard },
  { id: 'about', name: 'About', icon: Info },
];

export const SettingsTool: React.FC<ToolProps> = ({ tool, onContentChange }) => {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('appearance');

  const renderCategoryContent = () => {
    switch (activeCategory) {
      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Theme</h3>
              <Select defaultValue="system">
                <SelectTrigger className="w-full md:w-1/2">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Choose how CogniCanvas looks to you.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Font Size</h3>
              <RadioGroup defaultValue="medium" className="flex space-x-4">
                <div>
                  <RadioGroupItem value="small" id="font-small" />
                  <Label htmlFor="font-small" className="ml-2 cursor-pointer">Small</Label>
                </div>
                <div>
                  <RadioGroupItem value="medium" id="font-medium" />
                  <Label htmlFor="font-medium" className="ml-2 cursor-pointer">Medium</Label>
                </div>
                <div>
                  <RadioGroupItem value="large" id="font-large" />
                  <Label htmlFor="font-large" className="ml-2 cursor-pointer">Large</Label>
                </div>
              </RadioGroup>
               <p className="text-xs text-muted-foreground mt-1">Adjust the font size for better readability.</p>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Email Notifications</h3>
              <div className="flex items-center space-x-2">
                <Switch id="email-notifications" defaultChecked />
                <Label htmlFor="email-notifications" className="cursor-pointer">Enable Email Notifications</Label>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Receive updates and alerts via email.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Push Notifications</h3>
              <div className="flex items-center space-x-2">
                <Switch id="push-notifications" />
                <Label htmlFor="push-notifications" className="cursor-pointer">Enable Push Notifications</Label>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Get real-time alerts directly on your device.</p>
            </div>
             <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Notification Sound</h3>
              <div className="flex items-center space-x-2">
                <Switch id="sound-notifications" defaultChecked/>
                <Label htmlFor="sound-notifications" className="cursor-pointer">Enable Sound</Label>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Play a sound for new notifications.</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <settingCategories.find(cat => cat.id === activeCategory)?.icon 
              className="w-16 h-16 mb-4 text-primary/30" />
            <h2 className="text-xl font-semibold mb-2 text-foreground">
              {settingCategories.find(cat => cat.id === activeCategory)?.name} Settings
            </h2>
            <p className="text-muted-foreground">
              Settings for this category will be displayed here.
            </p>
          </div>
        );
    }
  };

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
        <div className="flex-grow flex flex-row bg-background">
          {/* Sidebar for Settings Categories */}
          <div className="w-60 bg-card border-r p-3 space-y-1">
            {settingCategories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "secondary" : "ghost"}
                className="w-full justify-start text-sm"
                onClick={() => setActiveCategory(category.id)}
              >
                <category.icon className="mr-2 h-4 w-4" />
                {category.name}
              </Button>
            ))}
          </div>

          {/* Main Settings Area */}
          <div className="flex-grow p-6 overflow-y-auto">
            {renderCategoryContent()}
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
