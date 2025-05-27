
"use client";

import type { ToolProps } from '@/components/cognicanvas/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AgentStream } from '@/components/cognicanvas/agent-stream';
import { SmartSuggestions } from '@/components/cognicanvas/smart-suggestions';
import { 
  Table, Bold, Italic, Palette as FillColorIcon, Combine, ArrowDownAZ, Sigma, PlusSquare, Sparkles
} from 'lucide-react';
import React, { useState } from 'react';

const NUM_ROWS = 20;
const NUM_COLS = 10; // A-J

export const SpreadsheetTool: React.FC<ToolProps> = ({ tool, onContentChange }) => {
  const [selectedCell, setSelectedCell] = useState<string | null>('A1');
  const [formula, setFormula] = useState<string>('');
  const [sheets, setSheets] = useState(['Sheet1', 'Sheet2']);
  const [activeSheet, setActiveSheet] = useState('Sheet1');

  const dummyData: { [key: string]: string | number } = {
    'A1': 'Name', 'B1': 'Sales', 'C1': 'Date',
    'A2': 'Product A', 'B2': 1500, 'C2': '2024-07-01',
    'A3': 'Product B', 'B3': 2200, 'C3': '2024-07-02',
    'A4': 'Product C', 'B4': 800, 'C4': '2024-07-03',
    'B5': '=SUM(B2:B4)',
  };

  const renderCellContent = (rowIndex: number, colIndex: number) => {
    const cellId = `${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`;
    return dummyData[cellId] || '';
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
        <div className="flex-grow flex flex-col bg-muted/30 text-sm">
          {/* Toolbar */}
          <div className="bg-card border-b p-1.5 flex items-center space-x-1 overflow-x-auto">
            <Button variant="ghost" size="icon_sm"><Bold className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon_sm"><Italic className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon_sm"><FillColorIcon className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon_sm"><Combine className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon_sm"><ArrowDownAZ className="h-4 w-4" /></Button>
            <div className="border-l h-5 mx-1"></div>
            <Button variant="ghost" size="icon_sm"><Sigma className="h-4 w-4" /></Button>
             <div className="flex-grow" />
            <Button variant="ghost" size="sm"><Sparkles className="mr-2 h-4 w-4 text-yellow-500" /> AI Formula</Button>
          </div>

          {/* Formula Bar */}
          <div className="bg-card border-b p-1.5 flex items-center">
            <div className="px-2 py-0.5 border-r text-xs text-muted-foreground font-mono mr-2">{selectedCell || 'A1'}</div>
            <span className="text-muted-foreground italic font-mono text-sm mr-1.5">fx</span>
            <Input 
              type="text" 
              placeholder="Enter formula or value" 
              className="h-7 text-xs flex-grow focus-visible:ring-transparent ring-offset-0 border-0 shadow-none p-1"
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              onFocus={() => {
                const cellValue = selectedCell ? (dummyData[selectedCell] || '') : '';
                setFormula(String(cellValue));
              }}
            />
          </div>

          {/* Spreadsheet Grid */}
          <div className="flex-grow overflow-auto p-2 bg-background shadow-inner">
            <table className="table-fixed border-collapse border border-slate-300">
              <thead>
                <tr>
                  <th className="sticky top-0 left-0 z-20 bg-slate-100 border border-slate-300 w-10 h-6 text-xs font-normal text-muted-foreground"></th>
                  {Array.from({ length: NUM_COLS }).map((_, colIndex) => (
                    <th 
                      key={colIndex} 
                      className="sticky top-0 bg-slate-100 border border-slate-300 min-w-[80px] h-6 text-xs font-normal text-muted-foreground"
                    >
                      {String.fromCharCode(65 + colIndex)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: NUM_ROWS }).map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className="sticky left-0 bg-slate-100 border border-slate-300 w-10 h-6 text-center text-xs font-normal text-muted-foreground">
                      {rowIndex + 1}
                    </td>
                    {Array.from({ length: NUM_COLS }).map((_, colIndex) => {
                      const cellId = `${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`;
                      return (
                        <td 
                          key={colIndex} 
                          className={`border border-slate-300 p-0.5 min-w-[80px] h-6 text-xs cursor-cell
                                      ${selectedCell === cellId ? 'ring-2 ring-primary ring-inset z-10' : ''}
                                      ${typeof dummyData[cellId] === 'number' ? 'text-right' : 'text-left'}
                                      ${String(dummyData[cellId]).startsWith('=') ? 'italic text-blue-600' : ''}`}
                          onClick={() => {
                            setSelectedCell(cellId);
                            setFormula(String(dummyData[cellId] || ''));
                          }}
                        >
                          {renderCellContent(rowIndex, colIndex)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Bar (Sheet Tabs) */}
          <div className="bg-card border-t p-1.5 flex items-center space-x-1 text-xs">
            {sheets.map(sheetName => (
              <Button 
                key={sheetName} 
                variant={activeSheet === sheetName ? "secondary" : "ghost"} 
                size="sm"
                className={`h-7 px-3 ${activeSheet === sheetName ? 'font-semibold' : ''}`}
                onClick={() => setActiveSheet(sheetName)}
              >
                {sheetName}
              </Button>
            ))}
            <Button variant="ghost" size="icon_sm" onClick={() => setSheets([...sheets, `Sheet${sheets.length + 1}`])}>
              <PlusSquare className="h-4 w-4" />
            </Button>
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
