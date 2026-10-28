import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getFallbackPuzzle } from "../lib/puzzle";
import { sealPuzzle } from "../lib/puzzle-token";
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
});
