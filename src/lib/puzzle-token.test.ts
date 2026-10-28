import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { getFallbackPuzzle } from "./puzzle";
import { gradeAnswer, hintFromAnswers, openPuzzle, sealPuzzle } from "./puzzle-token";

const TEST_SECRET = "unit-test-puzzle-secret";
const previous = process.env.PUZZLE_TOKEN_SECRET;

afterEach(() => {
  if (previous === undefined) delete process.env.PUZZLE_TOKEN_SECRET;
  else process.env.PUZZLE_TOKEN_SECRET = previous;
});

describe("sealed puzzle answers", () => {
  it("omits solution words from the client payload", () => {
    process.env.PUZZLE_TOKEN_SECRET = TEST_SECRET;
    const full = getFallbackPuzzle("nature");
    const clientPuzzle = sealPuzzle(full);
    const encoded = JSON.stringify(clientPuzzle);
    assert.equal("validWords" in clientPuzzle, false);
    assert.equal("quartiles" in clientPuzzle, false);
    for (const word of full.quartiles) {
      assert.equal(encoded.includes(word.word), false);
    }
    assert.deepEqual(clientPuzzle.tiles, full.tiles);
  });

  it("grades a sealed word and rejects tampering", () => {
    process.env.PUZZLE_TOKEN_SECRET = TEST_SECRET;
    const full = getFallbackPuzzle("nature");
    const clientPuzzle = sealPuzzle(full);
    const quartile = full.quartiles[0];
    assert.deepEqual(gradeAnswer(clientPuzzle.answerToken, quartile.word.toLowerCase()), {
      status: "correct",
      points: quartile.points,
      isQuartile: true,
      tileCount: quartile.tileCount,
    });
    assert.equal(gradeAnswer(clientPuzzle.answerToken, "NOTAWORD").status, "incorrect");
    assert.equal(gradeAnswer(`${clientPuzzle.answerToken}x`, quartile.word).status, "incorrect");
  });

  it("hints with a prefix and fails closed when the secret does not match", () => {
    process.env.PUZZLE_TOKEN_SECRET = TEST_SECRET;
    const full = getFallbackPuzzle("nature");
    const clientPuzzle = sealPuzzle(full);
    const hint = hintFromAnswers(clientPuzzle.answerToken, []);
    assert.ok(hint);
    assert.match(hint, /^[A-Z]{4}\.\.\.$/);
    assert.equal(full.quartiles.some((word) => word.word.startsWith(hint.slice(0, 4))), true);
    assert.equal(full.quartiles.some((word) => hint.includes(word.word)), false);

    process.env.PUZZLE_TOKEN_SECRET = "different-secret-value";
    assert.equal(openPuzzle(clientPuzzle.answerToken), null);
    assert.equal(gradeAnswer(clientPuzzle.answerToken, full.quartiles[0].word).status, "incorrect");
  });
});
