import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { singleFlight } from "./daily-cache";

describe("singleFlight", () => {
  it("runs the producer once for concurrent callers", async () => {
    const flights = new Map<string, Promise<string>>();
    let calls = 0;
    const produce = () => {
      calls += 1;
      return Promise.resolve("board");
    };
    const [first, second] = await Promise.all([
      singleFlight(flights, "2026-10-28", produce),
      singleFlight(flights, "2026-10-28", produce),
    ]);
    assert.equal(first, "board");
    assert.equal(second, "board");
    assert.equal(calls, 1);
  });

  it("allows a new attempt after a failure", async () => {
    const flights = new Map<string, Promise<string>>();
    let calls = 0;
    const produce = () => {
      calls += 1;
      return calls === 1 ? Promise.reject(new Error("boom")) : Promise.resolve("ok");
    };
    await assert.rejects(() => singleFlight(flights, "day", produce), /boom/);
    assert.equal(await singleFlight(flights, "day", produce), "ok");
    assert.equal(calls, 2);
  });
});
