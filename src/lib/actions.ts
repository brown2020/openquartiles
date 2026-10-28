"use server";

import { unstable_cache } from "next/cache";
import { headers } from "next/headers";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { singleFlight } from "./daily-cache";
import { Puzzle } from "./types";
import {
  AIWordData,
  buildPuzzleFromWords,
  getDailyTheme,
  getFallbackPuzzle,
  getRandomTheme,
  getTodayDateString,
  normalizeAiWords,
  sanitizeTheme,
  withDailyIdentity,
} from "./puzzle";
import { clientAddress, consumeRateLimit } from "./rate-limit";

/** Two model calls at most. The SDK's own retries are disabled below. */
const MAX_RETRIES = 2;
const MODEL_TIMEOUT_MS = 10_000;
const MAX_OUTPUT_TOKENS = 500;

interface AIResponse {
  theme: string;
  words: AIWordData[];
}

/**
 * Generate a Quartiles puzzle using AI when OPENAI_API_KEY is set.
 * Falls back to a local puzzle when the key is missing or AI fails —
 * so CI/SSG never hard-fail on empty secrets.
 */
async function generatePuzzleForTheme(puzzleTheme: string): Promise<Puzzle> {
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
        maxRetries: 0,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        timeout: MODEL_TIMEOUT_MS,
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
      const validatedWords = normalizeAiWords(data?.words);

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
  const headerList = await headers();
  const caller = clientAddress(
    headerList.get("x-forwarded-for"),
    headerList.get("x-real-ip")
  );
  if (!consumeRateLimit(`puzzle:${caller}`)) {
    throw new Error("Too many puzzles. Please wait a few minutes and try again.");
  }

  return generatePuzzleForTheme(puzzleTheme);
}

const DAILY_REVALIDATE_SECONDS = 60 * 60 * 24;
const dailyFlights = new Map<string, Promise<Puzzle>>();

const loadCachedDailyPuzzle = unstable_cache(
  async (date: string) => {
    const theme = getDailyTheme(date);
    const puzzle = await generatePuzzleForTheme(theme);
    return withDailyIdentity(puzzle, date, theme);
  },
  ["daily-puzzle-v1"],
  { revalidate: DAILY_REVALIDATE_SECONDS }
);

/** One shared board per UTC date. Later callers reuse the cached puzzle. */
export async function generateDailyPuzzle(): Promise<Puzzle> {
  const today = getTodayDateString();
  return singleFlight(dailyFlights, today, () => loadCachedDailyPuzzle(today));
}
