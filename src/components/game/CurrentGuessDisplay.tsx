// src/components/game/CurrentGuessDisplay.tsx
import { GameChunk } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CurrentGuessDisplayProps {
  selectedChunks: GameChunk[];
  onClear: () => void;
}

export function CurrentGuessDisplay({
  selectedChunks,
  onClear,
}: CurrentGuessDisplayProps) {
  return (
    <Card className="p-4 mb-4">
      <div className="h-[88px]">
        <div className="flex justify-between items-center mb-2 h-8">
          <h3 className="font-medium">Current Guess</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className={cn(
              "h-8 px-2 transition-opacity duration-200",
              selectedChunks.length === 0 ? "opacity-0" : "opacity-100"
            )}
            disabled={selectedChunks.length === 0}
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-2 h-12">
          {Array(4)
            .fill(null)
            .map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-12 border-2 rounded-md flex items-center justify-center transition-all duration-200",
                  selectedChunks[i]
                    ? "border-primary bg-primary/10"
                    : "border-dashed border-gray-300"
                )}
              >
                {selectedChunks[i]?.text || ""}
              </div>
            ))}
        </div>
      </div>
    </Card>
  );
}
