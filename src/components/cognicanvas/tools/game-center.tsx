
"use client";

import type { ToolProps } from '@/components/cognicanvas/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AgentStream } from '@/components/cognicanvas/agent-stream';
import { SmartSuggestions } from '@/components/cognicanvas/smart-suggestions';
import { 
  Gamepad2, Puzzle, Spade, ArrowLeft, LayoutGrid, RotateCcw, Lightbulb, PlusCircle, 
  Heart, Club, Diamond, MinusCircle, CheckCircle, XCircle, CircleDollarSign
} from 'lucide-react';
import React, { useState } from 'react';

interface Game {
  id: 'chess' | 'poker';
  name: string;
  description: string;
  icon: React.ElementType;
}

const games: Game[] = [
  {
    id: 'chess',
    name: 'Chess vs. AI',
    description: 'Challenge an AI opponent in a classic game of strategy. Sharpen your mind and master the board.',
    icon: Puzzle,
  },
  {
    id: 'poker',
    name: 'Poker vs. AI',
    description: 'Test your skills against AI players. Can you bluff your way to victory in this card game classic?',
    icon: Spade,
  },
];

export const GameCenter: React.FC<ToolProps> = ({ tool, onContentChange }) => {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const handleGameSelect = (game: Game) => {
    setSelectedGame(game);
  };

  const handleBackToSelection = () => {
    setSelectedGame(null);
  };

  const renderGameSelection = () => (
    <div className="flex flex-col items-center justify-center h-full p-4 md:p-6">
      <div className="mb-6 text-center">
        <LayoutGrid className="w-12 h-12 mx-auto mb-3 text-primary/70" />
        <h2 className="text-2xl font-semibold text-foreground">Choose Your Game</h2>
        <p className="text-muted-foreground">Select a game below to start playing against an AI opponent.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {games.map((game) => (
          <Card 
            key={game.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer bg-card hover:bg-accent/10 flex flex-col"
            onClick={() => handleGameSelect(game)}
          >
            <CardHeader className="items-center p-4">
              <game.icon className="w-10 h-10 text-primary mb-2" />
              <CardTitle className="text-lg text-center">{game.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-grow">
              <p className="text-sm text-muted-foreground text-center">{game.description}</p>
            </CardContent>
            <CardFooter className="p-4 justify-center">
                <Button variant="outline" size="sm" className="w-full">Play {game.name.split(' ')[0]}</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSelectedGame = () => {
    if (!selectedGame) return null;

    const commonLayoutClasses = "w-full h-full p-4 flex flex-col items-center justify-center bg-card text-card-foreground";
    
    const header = (
      <div className="w-full relative text-center mb-4">
        <Button
          variant="ghost"
          onClick={handleBackToSelection}
          className="absolute top-0 left-0 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex flex-col items-center justify-center pt-2">
          <selectedGame.icon className="w-10 h-10 mb-2 text-primary" />
          <h2 className="text-2xl font-semibold">{selectedGame.name}</h2>
        </div>
      </div>
    );

    if (selectedGame.id === 'chess') {
      const boardSize = 8;
      const initialBoard = [
        ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
        ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
        ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'],
      ];

      return (
        <div className={commonLayoutClasses}>
          {header}
          <div className="flex flex-col items-center">
            <div className="grid grid-cols-8 w-[320px] h-[320px] md:w-[400px] md:h-[400px] border border-foreground shadow-xl">
              {Array.from({ length: boardSize * boardSize }).map((_, i) => {
                const row = Math.floor(i / boardSize);
                const col = i % boardSize;
                const isLightSquare = (row + col) % 2 === 0;
                const piece = initialBoard[row]?.[col];
                return (
                  <div
                    key={i}
                    className={`flex items-center justify-center text-2xl md:text-3xl 
                                ${isLightSquare ? 'bg-yellow-100' : 'bg-yellow-600'}
                                ${piece && (row < 2) ? 'text-black' : 'text-white'}`}
                  >
                    {piece}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex space-x-2">
              <Button variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> New Game</Button>
              <Button variant="outline"><Lightbulb className="mr-2 h-4 w-4" /> Hint</Button>
              <Button variant="outline"><RotateCcw className="mr-2 h-4 w-4" /> Undo Move</Button>
            </div>
          </div>
        </div>
      );
    }

    if (selectedGame.id === 'poker') {
      const CardPlaceholder = ({ suit, rank }: { suit?: React.ElementType, rank?: string }) => (
        <div className="w-14 h-20 md:w-16 md:h-24 bg-white border border-gray-300 rounded-md flex flex-col items-center justify-center shadow-sm text-gray-700">
          {suit && <suit className="h-6 w-6 md:h-8 md:w-8 mb-1" />}
          {rank && <span className="text-lg md:text-xl font-bold">{rank}</span>}
          {!suit && !rank && <div className="w-full h-full bg-gray-100 rounded-md" />}
        </div>
      );

      return (
        <div className={commonLayoutClasses}>
          {header}
          <div className="w-full max-w-2xl flex flex-col items-center bg-green-700 p-4 md:p-6 rounded-xl shadow-2xl border-4 border-green-800">
            {/* Community Cards */}
            <div className="mb-4 md:mb-6">
              <h3 className="text-sm text-yellow-200 uppercase tracking-wider mb-2 text-center">Community Cards</h3>
              <div className="flex space-x-2">
                <CardPlaceholder suit={Spade} rank="A" />
                <CardPlaceholder suit={Heart} rank="K" />
                <CardPlaceholder suit={Club} rank="Q" />
                <CardPlaceholder />
                <CardPlaceholder />
              </div>
            </div>

            {/* Player Areas */}
            <div className="w-full flex justify-between items-end mb-4 md:mb-6">
              {/* Opponent Hand */}
              <div className="flex flex-col items-center">
                <div className="flex space-x-1">
                  <CardPlaceholder />
                  <CardPlaceholder />
                </div>
                <span className="text-xs text-yellow-100 mt-1">AI Opponent</span>
                <div className="mt-1 bg-red-600 text-white px-2 py-0.5 text-xs rounded-full shadow">Bet: $100</div>
              </div>
              {/* Pot */}
              <div className="flex flex-col items-center">
                  <CircleDollarSign className="h-8 w-8 text-yellow-400 mb-1"/>
                  <span className="text-lg font-bold text-white bg-black/30 px-3 py-1 rounded">Pot: $250</span>
              </div>
              {/* Player Hand */}
              <div className="flex flex-col items-center">
                <div className="flex space-x-1">
                  <CardPlaceholder suit={Diamond} rank="7" />
                  <CardPlaceholder suit={Heart} rank="2" />
                </div>
                <span className="text-xs text-yellow-100 mt-1">Your Hand</span>
                <div className="mt-1 bg-blue-600 text-white px-2 py-0.5 text-xs rounded-full shadow">Bet: $50</div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="secondary" className="bg-blue-500 hover:bg-blue-600 text-white shadow-md">
                <PlusCircle className="mr-2 h-4 w-4" /> Deal
              </Button>
              <Button variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-black shadow-md">
                <CircleDollarSign className="mr-2 h-4 w-4" /> Bet/Raise
              </Button>
              <Button variant="secondary" className="bg-gray-200 hover:bg-gray-300 text-black shadow-md">
                <CheckCircle className="mr-2 h-4 w-4" /> Check
              </Button>
              <Button variant="secondary" className="bg-red-500 hover:bg-red-600 text-white shadow-md">
                <XCircle className="mr-2 h-4 w-4" /> Fold
              </Button>
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
          The interface for {selectedGame.name} is under construction.
        </p>
        <div className="w-full max-w-md p-8 border border-dashed rounded-lg bg-card shadow-inner">
          <p className="text-sm text-muted-foreground">
            AI assistance for {selectedGame.name.toLowerCase()} is available via the agent panel.
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
            {tool.name} {selectedGame ? `- ${selectedGame.name}` : ''}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-grow flex flex-row overflow-hidden">
        {/* Main Game Center content area */}
        <div className="flex-grow flex flex-col bg-background text-card-foreground relative overflow-y-auto">
          {selectedGame ? renderSelectedGame() : renderGameSelection()}
        </div>
        {/* Agent Stream + Smart Suggestions part */}
        <div className="w-[340px] md:w-[380px] lg:w-[420px] border-l border-border flex flex-col bg-sidebar text-sidebar-foreground shrink-0">
          <AgentStream
            activeTool={tool}
            currentContent={selectedGame ? `Playing ${selectedGame.name}` : tool.content || "Game Center"}
            onContentUpdate={(newContent) => {
              if (onContentChange) onContentChange(newContent);
            }}
          />
          <SmartSuggestions activeToolName={selectedGame ? selectedGame.name : tool.name} />
        </div>
      </CardContent>
      <CardFooter className="border-t p-3 text-xs text-muted-foreground bg-card">
        {selectedGame ? `Enjoy your game of ${selectedGame.name}!` : `${tool.name} - Powered by Agent-Computer.`}
      </CardFooter>
    </Card>
  );
};
