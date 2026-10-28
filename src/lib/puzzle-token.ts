import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import type { ClientPuzzle, Puzzle } from "./types";

export interface SealedWord {
  word: string;
  points: number;
  isQuartile: boolean;
  tileCount: number;
}

interface SealedAnswers {
  validWords: SealedWord[];
}

/** Used only when PUZZLE_TOKEN_SECRET is unset. Set the env var in production. */
const BUILTIN_KEY_MATERIAL = "openquartiles-builtin-puzzle-key";

export type GradeResult =
  | { status: "correct"; points: number; isQuartile: boolean; tileCount: number }
  | { status: "incorrect" }
  | { status: "limited" };

function encryptionKey(): Buffer {
  const configured = process.env.PUZZLE_TOKEN_SECRET;
  const material =
    typeof configured === "string" && configured.length >= 16
      ? configured
      : BUILTIN_KEY_MATERIAL;
  return createHash("sha256").update(material).digest();
}

/** Encrypt solution words so the action response only carries tiles plus a token. */
export function sealPuzzle(puzzle: Puzzle): ClientPuzzle {
  const payload: SealedAnswers = {
    validWords: puzzle.validWords.map((word) => ({
      word: word.word,
      points: word.points,
      isQuartile: word.isQuartile,
      tileCount: word.tileCount,
    })),
  };
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return {
    id: puzzle.id,
    date: puzzle.date,
    tiles: puzzle.tiles,
    maxScore: puzzle.maxScore,
    theme: puzzle.theme,
    answerToken: Buffer.concat([iv, tag, ciphertext]).toString("base64url"),
  };
}

export function openPuzzle(token: string): SealedAnswers | null {
  try {
    if (token.length > 8000) return null;
    const buf = Buffer.from(token, "base64url");
    if (buf.length < 12 + 16 + 1) return null;
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const ciphertext = buf.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), iv);
    decipher.setAuthTag(tag);
    const json = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
    const data = JSON.parse(json) as SealedAnswers;
    if (!data || !Array.isArray(data.validWords)) return null;
    return data;
  } catch {
    return null;
  }
}

export function gradeAnswer(token: string, word: string): Exclude<GradeResult, { status: "limited" }> {
  const answers = openPuzzle(token);
  if (!answers) return { status: "incorrect" };
  const normalized = word.toUpperCase().replace(/[^A-Z]/g, "");
  if (!normalized || normalized.length > 64) return { status: "incorrect" };
  const match = answers.validWords.find((entry) => entry.word === normalized);
  if (!match || typeof match.points !== "number" || typeof match.tileCount !== "number") {
    return { status: "incorrect" };
  }
  return {
    status: "correct",
    points: match.points,
    isQuartile: match.isQuartile === true,
    tileCount: match.tileCount,
  };
}

/** First four letters of one unfound quartile. The full word stays sealed. */
export function hintFromAnswers(token: string, foundWords: string[]): string | null {
  const answers = openPuzzle(token);
  if (!answers) return null;
  const found = new Set(foundWords.map((word) => word.toUpperCase()));
  const remaining = answers.validWords.filter(
    (word) => word.isQuartile && !found.has(word.word)
  );
  if (remaining.length === 0) return null;
  const pick = remaining[Math.floor(Math.random() * remaining.length)];
  return `${pick.word.slice(0, 4)}...`;
}
