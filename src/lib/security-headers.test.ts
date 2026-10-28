import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CONTENT_SECURITY_POLICY, SECURITY_HEADERS } from "./security-headers";

describe("security headers", () => {
  it("sets frame, transport, referrer, and content-type protections", () => {
    const headers = Object.fromEntries(SECURITY_HEADERS.map((header) => [header.key, header.value]));
    assert.equal(headers["X-Frame-Options"], "DENY");
    assert.equal(headers["X-Content-Type-Options"], "nosniff");
    assert.equal(headers["Referrer-Policy"], "strict-origin-when-cross-origin");
    assert.match(headers["Strict-Transport-Security"], /max-age=\d+/);
    assert.match(headers["Content-Security-Policy"], /frame-ancestors 'none'/);
  });

  it("allows the Google font stylesheet used by the root layout", () => {
    assert.match(CONTENT_SECURITY_POLICY, /https:\/\/fonts\.googleapis\.com/);
    assert.match(CONTENT_SECURITY_POLICY, /https:\/\/fonts\.gstatic\.com/);
    assert.match(CONTENT_SECURITY_POLICY, /object-src 'none'/);
  });
});
