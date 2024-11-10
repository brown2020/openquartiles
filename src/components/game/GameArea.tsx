// src/components/game/GameArea.tsx
"use client";

import { CurrentGuessDisplay } from "./CurrentGuessDisplay";
import { GameHeader } from "./GameHeader";
import { GameBoard } from "./GameBoard";
import { useGameLogic } from "@/hooks/useGameLogic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";

export default function GameArea() {
  const {
    theme,
    setTheme,
    gameWords,
    gameChunks,
    selectedChunks,
    foundWords,
    loading,
    error,
    isGameComplete,
    startNewGame,
    resetGame,
    playAgain,
    handleChunkClick,
    clearCurrentGuess,
  } = useGameLogic();

  // Initial game setup screen
  if (!gameWords) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-center mb-6">
            Quartiles Word Game
          </h1>
          <div className="flex gap-4 mb-4">
            <Input
              type="text"
              placeholder="Enter theme (e.g., 'space', 'food', 'science')"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="flex-1"
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && theme.trim() && !loading) {
                  startNewGame();
                }
              }}
            />
            <Button onClick={startNewGame} disabled={loading || !theme.trim()}>
              {loading ? "Loading..." : "New Game"}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mt-6 text-sm text-muted-foreground">
            <h2 className="font-semibold mb-2">How to Play:</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Enter a theme to generate 5 related words</li>
              <li>Each word is split into 4 chunks</li>
              <li>Click chunks to build words</li>
              <li>Press Enter to check your word</li>
              <li>Press Escape to clear your selection</li>
              <li>Find all 5 words to win!</li>
            </ul>
          </div>
        </Card>
      </div>
    );
  }

  // Main game screen
  return (
    <div className="w-full max-w-2xl mx-auto">
      {isGameComplete ? (
        <Card className="p-4 mb-4">
          <div className="h-[88px]">
            <div className="flex justify-between items-center mb-2 h-8">
              <h3 className="font-medium">🎉 Congratulations!</h3>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={playAgain}>
                Play Again (Same Theme)
              </Button>
              <Button variant="outline" className="flex-1" onClick={resetGame}>
                Try New Theme
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <CurrentGuessDisplay
          selectedChunks={selectedChunks}
          onClear={clearCurrentGuess}
        />
      )}

      <Card className="p-4">
        <GameHeader
          theme={gameWords.theme}
          foundWords={foundWords}
          onReset={resetGame}
        />

        <GameBoard
          gameChunks={gameChunks}
          selectedChunks={selectedChunks}
          foundWords={foundWords}
          onChunkClick={handleChunkClick}
        />
      </Card>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isGameComplete && (
        <div className="mt-4 text-sm text-center text-muted-foreground">
          Press Enter to check word • Press Escape to clear selection
        </div>
      )}
    </div>
  );
}
