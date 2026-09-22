// src/lib/puzzle.ts — pure puzzle helpers (no server / AI)
import { Puzzle, ValidWord } from "./types";

export const MAX_THEME_LENGTH = 64;

/** Common English words used to validate shorter tile combinations */
export const COMMON_WORDS = new Set([
  "TO","ON","AT","IT","AN","OR","AS","BE","WE","ME","HE","SO","NO","GO","DO",
  "THE","AND","FOR","ARE","BUT","NOT","YOU","ALL","CAN","HER","WAS","ONE","OUR",
  "BAT","BAR","BET","RUN","HIT","WIN","TIE","NET","SET","ACE","BALL","TEAM","GAME",
  "PLAY","GOAL","RACE","KICK","PASS","SHOT","SCORE","MATCH","SPORT","COURT","FIELD",
  "SUN","SKY","SEA","AIR","TREE","LEAF","RAIN","SNOW","WIND","RIVER","OCEAN","STORM",
  "CLOUD","EARTH","EAT","CUT","MIX","FRY","BAKE","COOK","MEAL","DISH","FOOD","CAKE",
  "RICE","MEAT","FISH","SOUP","SALT","CAT","DOG","ANT","BEE","COW","PIG","HEN","OWL",
  "BEAR","LION","BIRD","DEER","FROG","ABLE","ALSO","BACK","BEEN","COME","DOWN","EACH",
  "EVEN","FIND","FIRST","FROM","GOOD","GREAT","HAND","HAVE","HERE","HIGH","HOME",
  "INTO","JUST","KNOW","LAST","LEFT","LIFE","LIKE","LINE","LITTLE","LONG","LOOK",
  "MADE","MAKE","MAN","MANY","MAY","MORE","MOST","MUCH","MUST","NAME","NEVER","NEW",
  "NEXT","NOW","NUMBER","OFF","OLD","ONLY","OTHER","OUT","OVER","OWN","PART","PEOPLE",
  "PLACE","POINT","RIGHT","SAME","SAY","SEE","SHE","SIDE","SMALL","SOME","STILL",
  "SUCH","TAKE","TELL","THAN","THAT","THEIR","THEM","THEN","THERE","THESE","THEY",
  "THING","THINK","THIS","THREE","TIME","TURN","UNDER","USE","VERY","WANT","WAY",
  "WELL","WHAT","WHEN","WHERE","WHICH","WHILE","WHO","WHY","WILL","WITH","WORD",
  "WORK","WORLD","WOULD","WRITE","YEAR","YOUR","ABOUT","AFTER","AGAIN","BEING",
  "BETWEEN","BOTH","CHANGE","COULD","DIFFERENT","DOES","DURING","EVERY","FOUND",
  "GIVE","GROUP","HOUSE","IMPORTANT","LARGE","LATER","LEARN","LIVE","LOCAL","MOVE",
  "NEED","NIGHT","ORDER","POSSIBLE","POWER","PRESENT","PROVIDE","PUBLIC","QUESTION",
  "READ","REAL","SEEM","SHOW","SINCE","SOMETHING","SOUND","START","STATE","STUDY",
  "SYSTEM","THOUGHT","THROUGH","TODAY","TRUE","UNTIL","WATER","WEEK","WITHOUT","YOUNG",
]);

export const DAILY_THEMES = [
  "nature","technology","food","travel","science","sports","music","animals","weather",
  "ocean","space","kitchen","garden","holidays","transportation","fashion","architecture",
  "literature","mythology","geography","history","medicine","education","business","art",
  "movies","television","books","games","photography",
] as const;

export interface AIWordData {
  word: string;
  chunks: string[];
}

/** Sanitize theme input for server actions — reject empty/oversized payloads. */
export function sanitizeTheme(theme: unknown): string | null {
  if (theme === undefined || theme === null || theme === "") return null;
  if (typeof theme !== "string") return null;
  const trimmed = theme.trim().slice(0, MAX_THEME_LENGTH);
  if (!trimmed) return null;
  // Allow letters, numbers, spaces, hyphens, apostrophes
  if (!/^[\w\s\-']+$/u.test(trimmed)) return null;
  return trimmed;
}

export function isCommonWord(word: string): boolean {
  return COMMON_WORDS.has(word.toUpperCase());
}

/** Smart chunk splitting — ensures all chunks are at least 2 letters when possible. */
export function smartSplitWord(word: string): string[] {
  const upperWord = word.toUpperCase();
  const length = upperWord.length;

  if (length < 8) {
    const chunkSize = Math.floor(length / 3);
    return [
      upperWord.slice(0, chunkSize),
      upperWord.slice(chunkSize, chunkSize * 2),
      upperWord.slice(chunkSize * 2),
    ].filter((c) => c.length >= 2);
  }

  const baseSize = Math.floor(length / 4);
  const remainder = length % 4;
  const chunks: string[] = [];
  let pos = 0;

  for (let i = 0; i < 4; i++) {
    const size = baseSize + (i < remainder ? 1 : 0);
    chunks.push(upperWord.slice(pos, pos + size));
    pos += size;
  }

  const result: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    if (chunks[i].length < 2 && result.length > 0) {
      result[result.length - 1] += chunks[i];
    } else if (chunks[i].length < 2 && i < chunks.length - 1) {
      chunks[i + 1] = chunks[i] + chunks[i + 1];
    } else {
      result.push(chunks[i]);
    }
  }
  return result;
}

export function buildPuzzleFromWords(theme: string, words: AIWordData[]): Puzzle {
  const tiles: string[] = [];
  const quartiles: ValidWord[] = [];
  const validWords: ValidWord[] = [];
  const foundWordSet = new Set<string>();
  let tileIndex = 0;

  const wordTileMap: { word: string; tileIds: string[]; chunks: string[] }[] = [];

  words.forEach((wordData) => {
    const tileIds = wordData.chunks.map(() => `tile-${tileIndex++}`);
    wordData.chunks.forEach((chunk) => tiles.push(chunk));
    wordTileMap.push({ word: wordData.word, tileIds, chunks: wordData.chunks });

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

  wordTileMap.forEach(({ chunks, tileIds }) => {
    const numChunks = chunks.length;
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

export function getFallbackPuzzle(theme: string): Puzzle {
  const fallbackWords: AIWordData[] = [
    { word: "ADVENTURE", chunks: smartSplitWord("ADVENTURE") },
    { word: "DISCOVERY", chunks: smartSplitWord("DISCOVERY") },
    { word: "BEAUTIFUL", chunks: smartSplitWord("BEAUTIFUL") },
    { word: "WONDERFUL", chunks: smartSplitWord("WONDERFUL") },
    { word: "FANTASTIC", chunks: smartSplitWord("FANTASTIC") },
  ];
  return buildPuzzleFromWords(theme || "general", fallbackWords);
}

export function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export function getDailyTheme(dateString: string): string {
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  const index = Math.abs(hash) % DAILY_THEMES.length;
  return DAILY_THEMES[index];
}

export function getRandomTheme(): string {
  return DAILY_THEMES[Math.floor(Math.random() * DAILY_THEMES.length)];
}

/** Points for a submitted tile count (mirrors store scoring). */
export function pointsForTileCount(tileCount: number): number {
  if (tileCount >= 4) return 8;
  if (tileCount === 3) return 4;
  if (tileCount === 2) return 2;
  return 1;
}
