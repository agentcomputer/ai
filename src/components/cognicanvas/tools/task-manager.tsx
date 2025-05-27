
"use client";

import type { ToolProps } from '@/components/cognicanvas/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AgentStream } from '@/components/cognicanvas/agent-stream';
import { SmartSuggestions } from '@/components/cognicanvas/smart-suggestions';
import { ListChecks, PlusSquare, CalendarDays, Flag, Filter, ArrowDownUp, Sparkles } from 'lucide-react'; 
import React, { useState } from 'react';

interface Task {
  id: string;
  name: string;
  completed: boolean;
  dueDate?: string;
  priority?: 'high' | 'medium' | 'low';
}

const initialTasks: Task[] = [
  { id: '1', name: 'Draft Q3 report for marketing team', completed: false, dueDate: '2024-08-15', priority: 'high' },
  { id: '2', name: 'Schedule a follow-up meeting with Client X', completed: true, dueDate: '2024-08-10' },
  { id: '3', name: 'Brainstorm new feature ideas for Project Alpha', completed: false, priority: 'medium' },
  { id: '4', name: 'Update design system documentation', completed: false, dueDate: '2024-08-20', priority: 'low' },
  { id: '5', name: 'Review and approve expense reports', completed: true },
];


export const TaskManager: React.FC<ToolProps> = ({ tool, onContentChange }) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTaskName, setNewTaskName] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const handleAddTask = () => {
    if (newTaskName.trim() === '') return;
    const newTask: Task = {
      id: String(Date.now()),
      name: newTaskName.trim(),
      completed: false,
    };
    setTasks([newTask, ...tasks]);
    setNewTaskName('');
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };
  
  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const PriorityFlag = ({ priority }: { priority?: 'high' | 'medium' | 'low' }) => {
    if (!priority) return null;
    const color = priority === 'high' ? 'text-red-500' : priority === 'medium' ? 'text-yellow-500' : 'text-green-500';
    return <Flag className={`h-4 w-4 ${color}`} />;
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
        <div className="flex-grow flex flex-col bg-muted/30 p-4 space-y-4">
          {/* Add Task Input */}
          <div className="flex space-x-2">
            <Input 
              placeholder="Enter new task..." 
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
              className="bg-card"
            />
            <Button onClick={handleAddTask} className="whitespace-nowrap">
              <PlusSquare className="mr-2 h-4 w-4" /> Add Task
            </Button>
            <Button variant="ghost" size="icon" className="text-yellow-500 hover:text-yellow-600">
              <Sparkles className="h-5 w-5" />
            </Button>
          </div>

          {/* Filters and Sort */}
          <div className="flex items-center justify-between space-x-2 text-sm">
            <div className="flex items-center space-x-1">
              <Button variant={filter === 'all' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('all')}>All</Button>
              <Button variant={filter === 'pending' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('pending')}>Pending</Button>
              <Button variant={filter === 'completed' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('completed')}>Completed</Button>
            </div>
            <Button variant="ghost" size="sm">
              <ArrowDownUp className="mr-2 h-4 w-4" /> Sort
            </Button>
          </div>

          {/* Task List */}
          <div className="flex-grow overflow-y-auto space-y-2 pr-1">
            {filteredTasks.map(task => (
              <Card key={task.id} className="p-3 bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    id={`task-${task.id}`} 
                    checked={task.completed} 
                    onCheckedChange={() => toggleTaskCompletion(task.id)}
                  />
                  <label 
                    htmlFor={`task-${task.id}`}
                    className={`flex-grow text-sm cursor-pointer ${task.completed ? 'line-through text-muted-foreground' : 'text-card-foreground'}`}
                  >
                    {task.name}
                  </label>
                  {task.dueDate && (
                    <Badge variant="outline" className="text-xs whitespace-nowrap">
                      <CalendarDays className="mr-1.5 h-3 w-3" />
                      {task.dueDate}
                    </Badge>
                  )}
                  <PriorityFlag priority={task.priority} />
                </div>
              </Card>
            ))}
             {filteredTasks.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <ListChecks className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p>No tasks {filter !== 'all' ? `in "${filter}"` : ''} here!</p>
              </div>
            )}
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
