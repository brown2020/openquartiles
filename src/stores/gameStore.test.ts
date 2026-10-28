import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getFallbackPuzzle } from "../lib/puzzle";
import { useGameStore } from "./gameStore";

function selectWord(tileIds: string[]) {
  for (const id of tileIds) useGameStore.getState().selectTile(id);
}

describe("submitWord feedback", () => {
  it("keeps an incorrect result after clearing the selection", () => {
    const puzzle = getFallbackPuzzle("nature");
    useGameStore.getState().initializePuzzle(puzzle);
    useGameStore.getState().selectTile("tile-0");
    useGameStore.getState().submitWord();
    const state = useGameStore.getState();
    assert.equal(state.lastAttemptResult, "incorrect");
    assert.equal(state.lastAttemptedWord, puzzle.tiles[0]);
    assert.equal(state.selectedTileIds.length, 0);
  });

  it("keeps an already-found result after clearing the selection", () => {
    const puzzle = getFallbackPuzzle("nature");
    const short = puzzle.validWords.find((word) => !word.isQuartile);
    assert.ok(short);
    useGameStore.getState().initializePuzzle(puzzle);
    selectWord(short.tileIds);
    useGameStore.getState().submitWord();
    selectWord(short.tileIds);
    useGameStore.getState().submitWord();
    const state = useGameStore.getState();
    assert.equal(state.lastAttemptResult, "already-found");
    assert.equal(state.lastAttemptedWord, short.word);
    assert.equal(state.selectedTileIds.length, 0);
    assert.equal(state.foundWords.length, 1);
  });
});
