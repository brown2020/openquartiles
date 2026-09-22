import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildPuzzleFromWords,
  getFallbackPuzzle,
  pointsForTileCount,
  sanitizeTheme,
  smartSplitWord,
} from "./puzzle";
import { calculateRank, SCORING } from "./types";

describe("smartSplitWord", () => {
  it("splits 8+ letter words into 4 chunks of 2+", () => {
    const chunks = smartSplitWord("ADVENTURE");
    assert.equal(chunks.length, 4);
    assert.equal(chunks.join(""), "ADVENTURE");
    assert.ok(chunks.every((c) => c.length >= 2));
  });

  it("handles longer words", () => {
    const chunks = smartSplitWord("INGREDIENTS");
    assert.equal(chunks.join(""), "INGREDIENTS");
    assert.ok(chunks.length >= 3);
  });
});

describe("sanitizeTheme", () => {
  it("accepts normal themes", () => {
    assert.equal(sanitizeTheme("nature"), "nature");
    assert.equal(sanitizeTheme("  food  "), "food");
  });

  it("rejects empty and invalid", () => {
    assert.equal(sanitizeTheme(""), null);
    assert.equal(sanitizeTheme("   "), null);
    assert.equal(sanitizeTheme(123), null);
    assert.equal(sanitizeTheme("<script>"), null);
  });

  it("truncates oversized themes", () => {
    const long = "a".repeat(100);
    const out = sanitizeTheme(long);
    assert.ok(out);
    assert.equal(out.length, 64);
  });
});

describe("buildPuzzleFromWords / fallback", () => {
  it("builds five quartiles", () => {
    const puzzle = getFallbackPuzzle("test");
    assert.equal(puzzle.quartiles.length, 5);
    assert.equal(puzzle.tiles.length >= 15, true);
    assert.ok(puzzle.validWords.length >= 5);
  });

  it("reconstructs from custom words", () => {
    const words = [
      { word: "ADVENTURE", chunks: smartSplitWord("ADVENTURE") },
      { word: "DISCOVERY", chunks: smartSplitWord("DISCOVERY") },
      { word: "BEAUTIFUL", chunks: smartSplitWord("BEAUTIFUL") },
      { word: "WONDERFUL", chunks: smartSplitWord("WONDERFUL") },
      { word: "FANTASTIC", chunks: smartSplitWord("FANTASTIC") },
    ];
    const puzzle = buildPuzzleFromWords("demo", words);
    assert.equal(puzzle.theme, "demo");
    assert.equal(puzzle.quartiles.every((q) => q.isQuartile), true);
  });
});

describe("scoring helpers", () => {
  it("maps tile counts to points", () => {
    assert.equal(pointsForTileCount(1), SCORING.ONE_TILE);
    assert.equal(pointsForTileCount(2), SCORING.TWO_TILES);
    assert.equal(pointsForTileCount(3), SCORING.THREE_TILES);
    assert.equal(pointsForTileCount(4), SCORING.FOUR_TILES);
  });

  it("calculates ranks", () => {
    assert.equal(calculateRank(0, 0), "Beginner");
    assert.equal(calculateRank(100, 5), "Genius");
    assert.equal(calculateRank(100, 3), "Master");
  });
});
