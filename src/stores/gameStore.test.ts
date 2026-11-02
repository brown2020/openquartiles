import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getFallbackPuzzle } from "../lib/puzzle";
import { sealPuzzle } from "../lib/puzzle-token";
import { SCORING } from "../lib/types";
import { useGameStore } from "./gameStore";

function selectWord(tileIds: string[]) {
  for (const id of tileIds) useGameStore.getState().selectTile(id);
}

describe("submitWord feedback", () => {
  it("keeps an incorrect result after clearing the selection", async () => {
    const full = getFallbackPuzzle("nature");
    useGameStore.getState().initializePuzzle(sealPuzzle(full));
    useGameStore.getState().selectTile("tile-0");
    await useGameStore.getState().submitWord();
    const state = useGameStore.getState();
    assert.equal(state.lastAttemptResult, "incorrect");
    assert.equal(state.lastAttemptedWord, full.tiles[0]);
    assert.equal(state.selectedTileIds.length, 0);
    assert.equal("validWords" in (state.puzzle ?? {}), false);
  });

  it("keeps an already-found result after clearing the selection", async () => {
    const full = getFallbackPuzzle("nature");
    const short = full.validWords.find((word) => !word.isQuartile);
    assert.ok(short);
    useGameStore.getState().initializePuzzle(sealPuzzle(full));
    selectWord(short.tileIds);
    await useGameStore.getState().submitWord();
    selectWord(short.tileIds);
    await useGameStore.getState().submitWord();
    const state = useGameStore.getState();
    assert.equal(state.lastAttemptResult, "already-found");
    assert.equal(state.lastAttemptedWord, short.word);
    assert.equal(state.selectedTileIds.length, 0);
    assert.equal(state.foundWords.length, 1);
  });

  it("scores a correct word, retires quartile tiles, and finishes the board", async () => {
    const full = getFallbackPuzzle("nature");
    const short = full.validWords.find((word) => !word.isQuartile);
    assert.ok(short);
    useGameStore.getState().initializePuzzle(sealPuzzle(full));
    const before = useGameStore.getState().stats;

    selectWord(short.tileIds);
    await useGameStore.getState().submitWord();
    let state = useGameStore.getState();
    assert.equal(state.lastAttemptResult, "correct");
    assert.equal(state.lastAttemptedWord, short.word);
    assert.equal(state.score, short.points);
    assert.equal(state.quartilesFound, 0);
    assert.equal(state.isComplete, false);
    assert.equal(state.foundWords.length, 1);
    assert.equal(
      state.tiles.some((tile) => tile.isUsed),
      false
    );

    for (const quartile of full.quartiles) {
      selectWord(quartile.tileIds);
      await useGameStore.getState().submitWord();
    }

    state = useGameStore.getState();
    const quartilePoints = full.quartiles.reduce((sum, word) => sum + word.points, 0);
    const finalScore = short.points + quartilePoints + SCORING.ALL_QUARTILES_BONUS;
    assert.equal(state.lastAttemptResult, "correct");
    assert.equal(state.quartilesFound, 5);
    assert.equal(state.isComplete, true);
    assert.equal(state.score, finalScore);
    assert.equal(state.foundWords.length, 6);
    assert.equal(
      state.tiles.filter((tile) => tile.isUsed).length,
      full.quartiles.reduce((count, word) => count + word.tileIds.length, 0)
    );
    assert.equal(state.selectedTileIds.length, 0);
    assert.equal(state.stats.gamesPlayed, before.gamesPlayed + 1);
    assert.equal(state.stats.gamesCompleted, before.gamesCompleted + 1);
    assert.equal(state.stats.totalScore, before.totalScore + finalScore);
    assert.equal(state.stats.bestScore, Math.max(before.bestScore, finalScore));
    assert.equal(state.stats.quartilesFound, before.quartilesFound + 5);
    assert.equal(state.stats.currentStreak >= 1, true);
    assert.equal(state.stats.rankHistory.at(-1), "Expert");
    assert.equal(state.getRank(), "Expert");
  });
});
