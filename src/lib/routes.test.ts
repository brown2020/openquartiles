import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.join(here, "../app");

describe("route security", () => {
  it("ships no API route handlers under app/", () => {
    const walk = (dir: string): string[] => {
      if (!fs.existsSync(dir)) return [];
      const out: string[] = [];
      for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, ent.name);
        if (ent.isDirectory()) out.push(...walk(p));
        else out.push(p);
      }
      return out;
    };
    const files = walk(appDir).map((f) => path.relative(appDir, f));
    assert.equal(files.some((f) => /(^|\/)route\.(ts|js|tsx|jsx)$/.test(f)), false);
  });

  it("keeps puzzle generation behind use server actions", () => {
    const actions = fs.readFileSync(
      path.join(here, "actions.ts"),
      "utf8"
    );
    assert.match(actions, /["']use server["']/);
    assert.match(actions, /OPENAI_API_KEY/);
    assert.match(actions, /sanitizeTheme/);
  });
});
