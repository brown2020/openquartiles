// src/components/game/GameBoard.tsx

import { Button } from "@/components/ui/button";
import { GameChunk, WordData } from "@/lib/types";

interface GameBoardProps {
  gameChunks: GameChunk[];
  selectedChunks: GameChunk[];
  foundWords: WordData[];
  onChunkClick: (chunk: GameChunk) => void;
}

export function GameBoard({
  gameChunks,
  selectedChunks,
  foundWords,
  onChunkClick,
}: GameBoardProps) {
  // Active row with remaining chunks
  const renderActiveRow = () => (
    <div className="grid grid-cols-4 gap-2">
      {gameChunks.map((chunk) => (
        <Button
          key={`chunk-${chunk.id}`}
          variant={selectedChunks.includes(chunk) ? "default" : "outline"}
          className="h-12"
          onClick={() => onChunkClick(chunk)}
        >
          {chunk.text}
        </Button>
      ))}
    </div>
  );

  // Found words rows
  const renderFoundWords = () =>
    foundWords.map((word, index) => (
      <div key={index} className="grid grid-cols-4 gap-2">
        {word.chunks.map((chunk, chunkIndex) => (
          <div
            key={`${word.word}-${chunkIndex}`}
            className="h-12 flex items-center justify-center bg-green-100 rounded-md font-medium"
          >
            {chunk}
          </div>
        ))}
      </div>
    ));

  return (
    <div className="space-y-2">
      {gameChunks.length > 0 && renderActiveRow()}
      {renderFoundWords()}
    </div>
  );
}
