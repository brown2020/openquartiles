/** In-process sliding-window limiter for server actions. */

const buckets = new Map<string, number[]>();

export const PUZZLE_RATE_LIMIT = 8;
export const PUZZLE_RATE_WINDOW_MS = 10 * 60 * 1000;

export const GRADE_RATE_LIMIT = 60;
export const GRADE_RATE_WINDOW_MS = 60 * 1000;

export const HINT_RATE_LIMIT = 20;
export const HINT_RATE_WINDOW_MS = 60 * 1000;

const MAX_BUCKETS = 5000;

function prune(stamps: number[], now: number, windowMs: number): number[] {
  return stamps.filter((stamp) => now - stamp < windowMs);
}

/**
 * Record one hit for `key`. Returns false when the window is already full.
 * `now` is injectable so tests can simulate a window without sleeping.
 */
export function consumeRateLimit(
  key: string,
  now = Date.now(),
  limit = PUZZLE_RATE_LIMIT,
  windowMs = PUZZLE_RATE_WINDOW_MS
): boolean {
  if (buckets.size > MAX_BUCKETS) buckets.clear();

  const recent = prune(buckets.get(key) ?? [], now, windowMs);
  if (recent.length >= limit) {
    buckets.set(key, recent);
    return false;
  }
  recent.push(now);
  buckets.set(key, recent);
  return true;
}

export function resetRateLimits(): void {
  buckets.clear();
}

/** First address in X-Forwarded-For, else X-Real-IP, else a shared bucket. */
export function clientAddress(
  forwardedFor: string | null,
  realIp: string | null
): string {
  const raw = forwardedFor?.split(",")[0]?.trim() || realIp?.trim() || "unknown";
  const cleaned = raw.replace(/[^\w.:]/g, "").slice(0, 64);
  return cleaned || "unknown";
}
