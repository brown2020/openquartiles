// lib/actions.ts
"use server";

import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { Puzzle, ValidWord } from "./types";

// Maximum number of retries when word validation fails
const MAX_RETRIES = 5;

interface AIWordData {
  word: string;
  chunks: string[];
}

interface AIResponse {
  theme: string;
  words: AIWordData[];
}

/**
 * Smart chunk splitting - ensures all chunks are at least 2 letters
 */
function smartSplitWord(word: string): string[] {
  const upperWord = word.toUpperCase();
  const length = upperWord.length;

  // For words of different lengths, calculate optimal chunk sizes
  // Goal: 4 chunks, each at least 2 letters
  if (length < 8) {
    // Word too short for 4 chunks of 2+ letters each
    // Split into 3 chunks instead
    const chunkSize = Math.floor(length / 3);
    return [
      upperWord.slice(0, chunkSize),
      upperWord.slice(chunkSize, chunkSize * 2),
      upperWord.slice(chunkSize * 2),
    ].filter((c) => c.length >= 2);
  }

  // Calculate chunk sizes for 4 chunks
  const baseSize = Math.floor(length / 4);
  const remainder = length % 4;

  const chunks: string[] = [];
  let pos = 0;

  for (let i = 0; i < 4; i++) {
    // Distribute remainder among first chunks
    const size = baseSize + (i < remainder ? 1 : 0);
    chunks.push(upperWord.slice(pos, pos + size));
    pos += size;
  }

  // Ensure no single-letter chunks by merging with neighbors
  const result: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    if (chunks[i].length < 2 && result.length > 0) {
      // Merge with previous chunk
      result[result.length - 1] += chunks[i];
    } else if (chunks[i].length < 2 && i < chunks.length - 1) {
      // Merge with next chunk
      chunks[i + 1] = chunks[i] + chunks[i + 1];
    } else {
      result.push(chunks[i]);
    }
  }

  return result;
}

/**
 * Generate a Quartiles puzzle using AI
 * Creates 5 words that will be split into tiles
 */
export async function generatePuzzle(theme?: string): Promise<Puzzle> {
  const puzzleTheme = theme || getRandomTheme();
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const openai = createOpenAI();
      const model = openai("gpt-4.1");

      const { text } = await generateText({
        model,
        system: `You are a word game assistant. Generate 5 themed English words. Return ONLY valid JSON.`,
        prompt: `Generate 5 common English words related to "${puzzleTheme}".

Requirements:
- Each word must be 8-12 letters long
- Words must be common, recognizable English words
- Words should relate to the theme "${puzzleTheme}"

Return this exact JSON format (no markdown, no explanation):
{
  "theme": "${puzzleTheme}",
  "words": [
    {"word": "RESTAURANT", "chunks": ["RES", "TAU", "RAN", "T"]},
    {"word": "INGREDIENTS", "chunks": ["ING", "RED", "IEN", "TS"]},
    {"word": "VEGETABLES", "chunks": ["VEG", "ETA", "BLE", "S"]},
    {"word": "DELICIOUS", "chunks": ["DEL", "ICI", "OU", "S"]},
    {"word": "BREAKFAST", "chunks": ["BRE", "AKF", "AS", "T"]}
  ]
}

Just give me 5 words related to "${puzzleTheme}". I will split them into chunks myself.`,
      });

      console.log("Raw AI Response:", text);

      // Clean the response
      const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
      console.log("Cleaned Response:", cleanText);

      const data = JSON.parse(cleanText) as AIResponse;

      // Validate structure
      if (!data.theme || !Array.isArray(data.words) || data.words.length < 5) {
        throw new Error("Invalid response structure");
      }

      // Process each word - use our smart splitting
      const validatedWords: AIWordData[] = [];

      for (const wordData of data.words.slice(0, 5)) {
        if (!wordData.word) continue;

        const word = wordData.word.toUpperCase().replace(/[^A-Z]/g, "");
        if (word.length < 8) continue;

        // Use smart splitting instead of AI chunks
        const chunks = smartSplitWord(word);

        // Verify chunks reconstruct the word
        const reconstructed = chunks.join("");
        if (reconstructed !== word) {
          console.log(`Chunk mismatch for ${word}: ${reconstructed}`);
          continue;
        }

        validatedWords.push({
          word,
          chunks,
        });
      }

      if (validatedWords.length < 5) {
        throw new Error(`Only got ${validatedWords.length} valid words`);
      }

      // Build the puzzle
      const puzzle = buildPuzzleFromWords(
        puzzleTheme,
        validatedWords.slice(0, 5)
      );
      return puzzle;
    } catch (error) {
      console.error("Generate Puzzle Error:", error);
      retries++;

      if (retries >= MAX_RETRIES) {
        // Return a fallback puzzle
        console.log("Using fallback puzzle");
        return getFallbackPuzzle(puzzleTheme);
      }

      console.log(`Retrying (${retries}/${MAX_RETRIES})...`);
    }
  }

  return getFallbackPuzzle(puzzleTheme);
}

/**
 * Build a Puzzle object from validated word data
 */
function buildPuzzleFromWords(theme: string, words: AIWordData[]): Puzzle {
  // Collect all tiles (chunks) from all words
  const tiles: string[] = [];
  const quartiles: ValidWord[] = [];
  const validWords: ValidWord[] = [];

  let tileIndex = 0;

  words.forEach((wordData) => {
    const tileIds = wordData.chunks.map(() => `tile-${tileIndex++}`);

    // Add tiles
    wordData.chunks.forEach((chunk) => tiles.push(chunk));

    // Create the quartile entry
    const quartile: ValidWord = {
      word: wordData.word,
      tileIds,
      tileCount: wordData.chunks.length as 2 | 3 | 4,
      points:
        wordData.chunks.length === 4 ? 8 : wordData.chunks.length === 3 ? 4 : 2,
      isQuartile: wordData.chunks.length === 4,
    };

    quartiles.push(quartile);
    validWords.push(quartile);
  });

  // Calculate max possible score
  const maxScore = quartiles.reduce((sum, q) => sum + q.points, 0) + 40;

  return {
    id: `ai-puzzle-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    tiles,
    validWords,
    quartiles,
    maxScore,
    theme,
  };
}

/**
 * Get a fallback puzzle when AI fails
 */
function getFallbackPuzzle(theme: string): Puzzle {
  const fallbackWords: AIWordData[] = [
    { word: "ADVENTURE", chunks: smartSplitWord("ADVENTURE") },
    { word: "DISCOVERY", chunks: smartSplitWord("DISCOVERY") },
    { word: "BEAUTIFUL", chunks: smartSplitWord("BEAUTIFUL") },
    { word: "WONDERFUL", chunks: smartSplitWord("WONDERFUL") },
    { word: "FANTASTIC", chunks: smartSplitWord("FANTASTIC") },
  ];

  return buildPuzzleFromWords(theme || "general", fallbackWords);
}

/**
 * Get a random theme for puzzle generation
 */
function getRandomTheme(): string {
  const themes = [
    "nature",
    "technology",
    "food",
    "travel",
    "science",
    "sports",
    "music",
    "animals",
    "weather",
    "ocean",
    "space",
    "kitchen",
    "garden",
    "holidays",
    "transportation",
    "fashion",
    "architecture",
    "literature",
    "mythology",
    "geography",
  ];
  return themes[Math.floor(Math.random() * themes.length)];
}

// Keep legacy export for backwards compatibility
export async function getThemeWords(theme: string) {
  const puzzle = await generatePuzzle(theme);
  return {
    theme: puzzle.theme || theme,
    words: puzzle.quartiles.map((q) => ({
      word: q.word,
      chunks: puzzle.tiles.slice(
        parseInt(q.tileIds[0].replace("tile-", "")),
        parseInt(q.tileIds[q.tileIds.length - 1].replace("tile-", "")) + 1
      ),
    })),
  };
}
