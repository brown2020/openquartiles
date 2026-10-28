import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  clientAddress,
  consumeRateLimit,
  resetRateLimits,
} from "./rate-limit";

describe("consumeRateLimit", () => {
  it("allows a burst up to the limit and then rejects", () => {
    resetRateLimits();
    const now = 1_700_000_000_000;
    for (let i = 0; i < 3; i++) {
      assert.equal(consumeRateLimit("puzzle:10.0.0.1", now, 3, 60_000), true);
    }
    assert.equal(consumeRateLimit("puzzle:10.0.0.1", now, 3, 60_000), false);
  });

  it("tracks keys independently and opens the window again after it expires", () => {
    resetRateLimits();
    const now = 1_700_000_000_000;
    assert.equal(consumeRateLimit("puzzle:a", now, 1, 1_000), true);
    assert.equal(consumeRateLimit("puzzle:a", now, 1, 1_000), false);
    assert.equal(consumeRateLimit("puzzle:b", now, 1, 1_000), true);
    assert.equal(consumeRateLimit("puzzle:a", now + 1_000, 1, 1_000), true);
  });
});

describe("clientAddress", () => {
  it("uses the first forwarded address", () => {
    assert.equal(clientAddress("203.0.113.5, 10.0.0.1", null), "203.0.113.5");
  });

  it("falls back to x-real-ip and otherwise a shared bucket", () => {
    assert.equal(clientAddress(null, "2001:db8::1"), "2001:db8::1");
    assert.equal(clientAddress("   ", null), "unknown");
  });

  it("strips characters that are not part of an IP", () => {
    assert.equal(clientAddress("10.0.0.9 evil", null), "10.0.0.9evil");
  });
});
