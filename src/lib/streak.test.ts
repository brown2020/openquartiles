import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { advanceStreak, previousUtcDate } from "./streak";

describe("advanceStreak", () => {
  it("starts at one, continues across consecutive UTC days, and ignores a second win the same day", () => {
    const first = advanceStreak(
      { currentStreak: 0, longestStreak: 0, lastPlayedDate: null },
      "2026-10-28"
    );
    assert.deepEqual(first, {
      currentStreak: 1,
      longestStreak: 1,
      lastPlayedDate: "2026-10-28",
    });

    const sameDay = advanceStreak(first, "2026-10-28");
    assert.equal(sameDay.currentStreak, 1);

    const nextDay = advanceStreak(first, "2026-10-29");
    assert.equal(nextDay.currentStreak, 2);
    assert.equal(nextDay.longestStreak, 2);
  });

  it("resets after a missed day and keeps the previous longest streak", () => {
    assert.equal(previousUtcDate("2026-03-01"), "2026-02-28");
    const afterGap = advanceStreak(
      { currentStreak: 4, longestStreak: 9, lastPlayedDate: "2026-10-20" },
      "2026-10-28"
    );
    assert.deepEqual(afterGap, {
      currentStreak: 1,
      longestStreak: 9,
      lastPlayedDate: "2026-10-28",
    });
  });
});
