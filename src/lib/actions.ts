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

// Common English words that might be formed from tile combinations
// This helps validate shorter words
const COMMON_WORDS = new Set([
  // 2-3 letter combinations that are words
  "TO",
  "ON",
  "AT",
  "IT",
  "AN",
  "OR",
  "AS",
  "BE",
  "WE",
  "ME",
  "HE",
  "SO",
  "NO",
  "GO",
  "DO",
  "THE",
  "AND",
  "FOR",
  "ARE",
  "BUT",
  "NOT",
  "YOU",
  "ALL",
  "CAN",
  "HER",
  "WAS",
  "ONE",
  "OUR",
  // Sports related
  "BAT",
  "BAR",
  "BET",
  "RUN",
  "HIT",
  "WIN",
  "TIE",
  "NET",
  "SET",
  "ACE",
  "BALL",
  "TEAM",
  "GAME",
  "PLAY",
  "GOAL",
  "RACE",
  "KICK",
  "PASS",
  "SHOT",
  "SCORE",
  "MATCH",
  "SPORT",
  "COURT",
  "FIELD",
  // Nature related
  "SUN",
  "SKY",
  "SEA",
  "AIR",
  "TREE",
  "LEAF",
  "RAIN",
  "SNOW",
  "WIND",
  "RIVER",
  "OCEAN",
  "STORM",
  "CLOUD",
  "EARTH",
  // Food related
  "EAT",
  "CUT",
  "MIX",
  "FRY",
  "BAKE",
  "COOK",
  "MEAL",
  "DISH",
  "FOOD",
  "CAKE",
  "RICE",
  "MEAT",
  "FISH",
  "SOUP",
  "SALT",
  // Animals
  "CAT",
  "DOG",
  "BAT",
  "ANT",
  "BEE",
  "COW",
  "PIG",
  "HEN",
  "OWL",
  "BEAR",
  "LION",
  "FISH",
  "BIRD",
  "DEER",
  "FROG",
  // General common words
  "ABLE",
  "ALSO",
  "BACK",
  "BEEN",
  "COME",
  "DOWN",
  "EACH",
  "EVEN",
  "FIND",
  "FIRST",
  "FROM",
  "GOOD",
  "GREAT",
  "HAND",
  "HAVE",
  "HERE",
  "HIGH",
  "HOME",
  "INTO",
  "JUST",
  "KNOW",
  "LAST",
  "LEFT",
  "LIFE",
  "LIKE",
  "LINE",
  "LITTLE",
  "LONG",
  "LOOK",
  "MADE",
  "MAKE",
  "MAN",
  "MANY",
  "MAY",
  "MORE",
  "MOST",
  "MUCH",
  "MUST",
  "NAME",
  "NEVER",
  "NEW",
  "NEXT",
  "NOW",
  "NUMBER",
  "OFF",
  "OLD",
  "ONLY",
  "OTHER",
  "OUT",
  "OVER",
  "OWN",
  "PART",
  "PEOPLE",
  "PLACE",
  "POINT",
  "RIGHT",
  "SAME",
  "SAY",
  "SEE",
  "SHE",
  "SIDE",
  "SMALL",
  "SOME",
  "STILL",
  "SUCH",
  "TAKE",
  "TELL",
  "THAN",
  "THAT",
  "THEIR",
  "THEM",
  "THEN",
  "THERE",
  "THESE",
  "THEY",
  "THING",
  "THINK",
  "THIS",
  "THREE",
  "TIME",
  "TURN",
  "UNDER",
  "USE",
  "VERY",
  "WANT",
  "WAY",
  "WELL",
  "WHAT",
  "WHEN",
  "WHERE",
  "WHICH",
  "WHILE",
  "WHO",
  "WHY",
  "WILL",
  "WITH",
  "WORD",
  "WORK",
  "WORLD",
  "WOULD",
  "WRITE",
  "YEAR",
  "YOUR",
  // Longer common words
  "ABOUT",
  "AFTER",
  "AGAIN",
  "BEING",
  "BETWEEN",
  "BOTH",
  "CHANGE",
  "COULD",
  "DIFFERENT",
  "DOES",
  "DURING",
  "EVERY",
  "FOUND",
  "GIVE",
  "GROUP",
  "HOUSE",
  "IMPORTANT",
  "LARGE",
  "LATER",
  "LEARN",
  "LIVE",
  "LOCAL",
  "MOVE",
  "NEED",
  "NIGHT",
  "ORDER",
  "PLAY",
  "POSSIBLE",
  "POWER",
  "PRESENT",
  "PROVIDE",
  "PUBLIC",
  "QUESTION",
  "READ",
  "REAL",
  "SEEM",
  "SHOW",
  "SINCE",
  "SOMETHING",
  "SOUND",
  "START",
  "STATE",
  "STUDY",
  "SYSTEM",
  "THOUGHT",
  "THROUGH",
  "TODAY",
  "TRUE",
  "UNTIL",
  "WATER",
  "WEEK",
  "WITHOUT",
  "YOUNG",
]);

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
 * Check if a word is in our common words list
 */
function isCommonWord(word: string): boolean {
  return COMMON_WORDS.has(word.toUpperCase());
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
 * Also generates valid shorter words from tile combinations
 */
function buildPuzzleFromWords(theme: string, words: AIWordData[]): Puzzle {
  // Collect all tiles (chunks) from all words
  const tiles: string[] = [];
  const quartiles: ValidWord[] = [];
  const validWords: ValidWord[] = [];
  const foundWordSet = new Set<string>(); // Prevent duplicates

  let tileIndex = 0;

  // First pass: add all quartile words and their tiles
  const wordTileMap: { word: string; tileIds: string[]; chunks: string[] }[] =
    [];

  words.forEach((wordData) => {
    const startIndex = tileIndex;
    const tileIds = wordData.chunks.map(() => `tile-${tileIndex++}`);

    // Add tiles
    wordData.chunks.forEach((chunk) => tiles.push(chunk));

    // Store for later processing
    wordTileMap.push({
      word: wordData.word,
      tileIds,
      chunks: wordData.chunks,
    });

    // Create the quartile entry (4-tile word)
    const quartile: ValidWord = {
      word: wordData.word,
      tileIds,
      tileCount: wordData.chunks.length,
      points:
        wordData.chunks.length >= 4 ? 8 : wordData.chunks.length === 3 ? 4 : 2,
      isQuartile: wordData.chunks.length >= 4,
    };

    quartiles.push(quartile);
    validWords.push(quartile);
    foundWordSet.add(wordData.word);
  });

  // Second pass: generate valid shorter words from tile combinations
  wordTileMap.forEach(({ chunks, tileIds }) => {
    const numChunks = chunks.length;

    // Generate 1-tile words (single tiles that are valid words)
    for (let i = 0; i < numChunks; i++) {
      const word1 = chunks[i];
      if (!foundWordSet.has(word1) && isCommonWord(word1)) {
        validWords.push({
          word: word1,
          tileIds: [tileIds[i]],
          tileCount: 1,
          points: 1,
          isQuartile: false,
        });
        foundWordSet.add(word1);
      }
    }

    // Generate 2-tile combinations (consecutive)
    for (let i = 0; i < numChunks - 1; i++) {
      const word2 = chunks[i] + chunks[i + 1];
      if (!foundWordSet.has(word2) && isCommonWord(word2)) {
        validWords.push({
          word: word2,
          tileIds: [tileIds[i], tileIds[i + 1]],
          tileCount: 2,
          points: 2,
          isQuartile: false,
        });
        foundWordSet.add(word2);
      }
    }

    // Generate 3-tile combinations (consecutive)
    for (let i = 0; i < numChunks - 2; i++) {
      const word3 = chunks[i] + chunks[i + 1] + chunks[i + 2];
      if (!foundWordSet.has(word3) && isCommonWord(word3)) {
        validWords.push({
          word: word3,
          tileIds: [tileIds[i], tileIds[i + 1], tileIds[i + 2]],
          tileCount: 3,
          points: 4,
          isQuartile: false,
        });
        foundWordSet.add(word3);
      }
    }
  });

  // Third pass: check for cross-word combinations (tiles from different original words)
  // Generate all possible 2-tile combinations across all tiles
  for (let i = 0; i < tiles.length; i++) {
    for (let j = 0; j < tiles.length; j++) {
      if (i !== j) {
        const word2 = tiles[i] + tiles[j];
        if (!foundWordSet.has(word2) && isCommonWord(word2)) {
          validWords.push({
            word: word2,
            tileIds: [`tile-${i}`, `tile-${j}`],
            tileCount: 2,
            points: 2,
            isQuartile: false,
          });
          foundWordSet.add(word2);
        }
      }
    }
  }

  // Calculate max possible score
  const maxScore = validWords.reduce((sum, w) => sum + w.points, 0) + 40;

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
 * Daily themes - one for each day of the year cycle
 */
const DAILY_THEMES = [
  "nature", "technology", "food", "travel", "science",
  "sports", "music", "animals", "weather", "ocean",
  "space", "kitchen", "garden", "holidays", "transportation",
  "fashion", "architecture", "literature", "mythology", "geography",
  "history", "medicine", "education", "business", "art",
  "movies", "television", "books", "games", "photography",
];

/**
 * Get today's date string for daily puzzle
 */
function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Get a seeded theme for daily puzzle based on date
 */
function getDailyTheme(dateString: string): string {
  // Simple hash of date string to get consistent daily theme
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const index = Math.abs(hash) % DAILY_THEMES.length;
  return DAILY_THEMES[index];
}

/**
 * Generate the daily puzzle (same for everyone on the same day)
 */
export async function generateDailyPuzzle(): Promise<Puzzle> {
  const today = getTodayDateString();
  const dailyTheme = getDailyTheme(today);

  const puzzle = await generatePuzzle(dailyTheme);

  // Override with daily-specific ID and date
  return {
    ...puzzle,
    id: `daily-${today}`,
    date: today,
    theme: `Daily: ${dailyTheme}`,
  };
}

/**
 * Get a random theme for puzzle generation
 */
function getRandomTheme(): string {
  const themes = DAILY_THEMES;
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
