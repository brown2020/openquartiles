import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { initialStats, sanitizeStats } from "./stats";

describe("sanitizeStats", () => {
  it("replaces garbage with a safe default", () => {
    assert.deepEqual(sanitizeStats(null), initialStats);
    assert.deepEqual(sanitizeStats("nope"), initialStats);
  });

  it("keeps valid fields and drops a missing or hostile rank history", () => {
    const sanitized = sanitizeStats({
      gamesPlayed: 3.9,
      gamesCompleted: -2,
      totalScore: 80,
      bestScore: Number.POSITIVE_INFINITY,
      quartilesFound: 5,
      currentStreak: 2,
      longestStreak: 4,
      lastPlayedDate: "2026-10-28",
      rankHistory: ["Expert", "nope", "Genius", 3],
    });
    assert.equal(sanitized.gamesPlayed, 3);
    assert.equal(sanitized.gamesCompleted, 0);
    assert.equal(sanitized.bestScore, 0);
    assert.equal(sanitized.lastPlayedDate, "2026-10-28");
    assert.deepEqual(sanitized.rankHistory, ["Expert", "Genius"]);
  });

  it("does not throw when rankHistory is missing", () => {
    const sanitized = sanitizeStats({ gamesPlayed: 1 });
    assert.deepEqual(sanitized.rankHistory, []);
    const extended = [...sanitized.rankHistory, "Expert" as const];
    assert.deepEqual(extended, ["Expert"]);
  });
});
