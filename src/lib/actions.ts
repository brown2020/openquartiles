"use server";

import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { Puzzle } from "./types";
import {
  AIWordData,
  buildPuzzleFromWords,
  getDailyTheme,
  getFallbackPuzzle,
  getRandomTheme,
  getTodayDateString,
  sanitizeTheme,
  smartSplitWord,
} from "./puzzle";

const MAX_RETRIES = 5;

interface AIResponse {
  theme: string;
  words: AIWordData[];
}

/**
 * Generate a Quartiles puzzle using AI when OPENAI_API_KEY is set.
 * Falls back to a local puzzle when the key is missing or AI fails —
 * so CI/SSG never hard-fail on empty secrets.
 */
export async function generatePuzzle(theme?: string): Promise<Puzzle> {
  const sanitized = sanitizeTheme(theme);
  // Invalid non-empty theme → reject (server-side contract)
  if (theme !== undefined && theme !== null && theme !== "" && sanitized === null) {
    throw new Error("Invalid theme");
  }
  const puzzleTheme = sanitized || getRandomTheme();

  if (!process.env.OPENAI_API_KEY) {
    return getFallbackPuzzle(puzzleTheme);
  }

  let retries = 0;
  while (retries < MAX_RETRIES) {
    try {
      // Deferred client init — only when a key exists
      const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const model = openai("gpt-4.1");

      const { text } = await generateText({
        model,
        system:
          "You are a word game assistant. Generate 5 themed English words. Return ONLY valid JSON.",
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

      const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
      const data = JSON.parse(cleanText) as AIResponse;

      if (!data.theme || !Array.isArray(data.words) || data.words.length < 5) {
        throw new Error("Invalid response structure");
      }

      const validatedWords: AIWordData[] = [];
      for (const wordData of data.words.slice(0, 5)) {
        if (!wordData.word) continue;
        const word = wordData.word.toUpperCase().replace(/[^A-Z]/g, "");
        if (word.length < 8) continue;
        const chunks = smartSplitWord(word);
        if (chunks.join("") !== word) continue;
        validatedWords.push({ word, chunks });
      }

      if (validatedWords.length < 5) {
        throw new Error(`Only got ${validatedWords.length} valid words`);
      }

      return buildPuzzleFromWords(puzzleTheme, validatedWords.slice(0, 5));
    } catch {
      retries++;
      if (retries >= MAX_RETRIES) {
        return getFallbackPuzzle(puzzleTheme);
      }
    }
  }

  return getFallbackPuzzle(puzzleTheme);
}

/** Daily puzzle — same theme seed for everyone on the same UTC date. */
export async function generateDailyPuzzle(): Promise<Puzzle> {
  const today = getTodayDateString();
  const dailyTheme = getDailyTheme(today);
  const puzzle = await generatePuzzle(dailyTheme);
  return {
    ...puzzle,
    id: `daily-${today}`,
    date: today,
    theme: `Daily: ${dailyTheme}`,
  };
}
