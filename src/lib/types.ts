// src/components/game/types.ts
export interface WordData {
  word: string;
  chunks: string[];
}

export interface GameWords {
  theme: string;
  words: WordData[];
}

export interface GameChunk {
  id: number;
  text: string;
  isFound?: boolean;
  foundIndex?: number;
}
