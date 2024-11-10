// src/components/game/useGameLogic.ts
import { useState, useEffect, useCallback } from "react";
import { getThemeWords } from "@/lib/actions";
import { GameWords, WordData, GameChunk } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export function useGameLogic() {
  const { toast } = useToast();
  const [theme, setTheme] = useState("");
  const [gameWords, setGameWords] = useState<GameWords | null>(null);
  const [gameChunks, setGameChunks] = useState<GameChunk[]>([]);
  const [selectedChunks, setSelectedChunks] = useState<GameChunk[]>([]);
  const [foundWords, setFoundWords] = useState<WordData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGameComplete, setIsGameComplete] = useState(false);

  // Initialize game chunks when gameWords changes
  useEffect(() => {
    if (gameWords) {
      const chunks = gameWords.words
        .flatMap((w) => w.chunks)
        .map((chunk, index) => ({
          id: index,
          text: chunk,
          isFound: false,
        }));
      setGameChunks(chunks.sort(() => Math.random() - 0.5));
      setFoundWords([]);
      setSelectedChunks([]);
      setIsGameComplete(false);
    }
  }, [gameWords]);

  const startNewGame = async () => {
    setLoading(true);
    setError(null);
    try {
      const words = await getThemeWords(theme);
      setGameWords(words);
      setTheme("");
      toast({
        title: "Game Started!",
        description: `Theme: ${words.theme}. Find all 5 words to win!`,
      });
    } catch (error: unknown) {
      console.error("Error in startNewGame:", error);
      let errorMessage = "Failed to generate words. Please try another theme.";

      if (error instanceof Error) {
        if (error.message.includes("Invalid word format")) {
          errorMessage =
            "Unable to generate appropriate words for this theme. Please try another theme.";
        } else if (error.message.includes("Failed to parse")) {
          errorMessage = "Something went wrong. Please try again.";
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
      setGameWords(null);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const playAgain = async () => {
    setLoading(true);
    setError(null);
    try {
      const words = await getThemeWords(gameWords?.theme || "");
      setGameWords(words);
      setIsGameComplete(false);
      toast({
        title: "New Game Started",
        description: "Same theme, new words. Good luck!",
      });
    } catch (error: unknown) {
      console.error("Error in playAgain:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to generate words. Please try again.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetGame = () => {
    setGameWords(null);
    setGameChunks([]);
    setSelectedChunks([]);
    setFoundWords([]);
    setError(null);
    setIsGameComplete(false);
    setTheme("");
  };

  const handleChunkClick = useCallback((chunk: GameChunk) => {
    if (chunk.isFound) return;

    setSelectedChunks((prev) => {
      if (prev.includes(chunk)) {
        return prev.filter((c) => c !== chunk);
      }
      if (prev.length < 4) {
        return [...prev, chunk];
      }
      return prev;
    });
  }, []);

  const checkWord = useCallback(
    (e?: KeyboardEvent) => {
      // If this was triggered by a keyboard event, prevent any other handlers
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      console.log("checkWord called, chunks:", selectedChunks.length);

      if (selectedChunks.length === 0) return;

      if (selectedChunks.length !== 4) {
        toast({
          title: "Incomplete Word",
          description: "Select 4 chunks to make a complete word.",
          variant: "destructive",
        });
        setSelectedChunks([]); // Clear incomplete attempt
        return;
      }

      if (!gameWords) return;

      const attemptedWord = selectedChunks.map((chunk) => chunk.text).join("");
      const foundWord = gameWords.words.find(
        (w) => w.chunks.join("") === attemptedWord && !foundWords.includes(w)
      );

      if (foundWord) {
        const newFoundWords = [...foundWords, foundWord];
        setFoundWords(newFoundWords);
        setGameChunks((prev) =>
          prev
            .filter((chunk) => !selectedChunks.includes(chunk))
            .sort(() => Math.random() - 0.5)
        );
        setSelectedChunks([]);

        toast({
          title: "Word Found!",
          description: `Found "${foundWord.word}"! ${
            5 - newFoundWords.length
          } words remaining.`,
        });

        if (newFoundWords.length === 5) {
          setIsGameComplete(true);
          toast({
            title: "Congratulations!",
            description: "You've found all the words! 🎉",
          });
        }
      } else {
        const wasAlreadyFound = gameWords.words.find(
          (w) => w.chunks.join("") === attemptedWord && foundWords.includes(w)
        );

        toast({
          title: "Incorrect Word",
          description: wasAlreadyFound
            ? "You've already found this word!"
            : "This word is not in the list. Try again!",
          variant: "destructive",
        });

        // Use requestAnimationFrame to ensure this happens after current event loop
        requestAnimationFrame(() => {
          setSelectedChunks([]);
        });
      }
    },
    [gameWords, selectedChunks, foundWords, toast]
  );

  const clearCurrentGuess = useCallback(() => {
    setSelectedChunks([]);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        checkWord(e);
      } else if (e.key === "Escape") {
        clearCurrentGuess();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [checkWord, clearCurrentGuess]);

  return {
    // State
    theme,
    gameWords,
    gameChunks,
    selectedChunks,
    foundWords,
    loading,
    error,
    isGameComplete,

    // Actions
    setTheme,
    startNewGame,
    resetGame,
    playAgain,
    handleChunkClick,
    clearCurrentGuess,
    checkWord,
  };
}
