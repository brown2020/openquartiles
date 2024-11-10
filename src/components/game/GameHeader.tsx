// src/components/game/GameHeader.tsx

import { Button } from "@/components/ui/button";
import { WordData } from "@/lib/types";

interface GameHeaderProps {
  theme: string;
  foundWords: WordData[];
  onReset: () => void;
}

export function GameHeader({ theme, foundWords, onReset }: GameHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h2 className="text-xl font-bold">Theme: {theme}</h2>
        <p className="text-sm text-muted-foreground">
          Found {foundWords.length} of 5 words
        </p>
      </div>
      <Button onClick={onReset} variant="outline">
        New Theme
      </Button>
    </div>
  );
}
