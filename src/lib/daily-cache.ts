/** Collapse concurrent misses for the same key into one producer call. */
export function singleFlight<T>(
  flights: Map<string, Promise<T>>,
  key: string,
  produce: () => Promise<T>
): Promise<T> {
  const existing = flights.get(key);
  if (existing) return existing;

  const pending = produce().catch((error: unknown) => {
    flights.delete(key);
    throw error;
  });
  flights.set(key, pending);
  return pending;
}
