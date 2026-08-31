export function deepFreeze<T>(value: T): T {
  const seen = new WeakSet<object>();

  const freeze = (candidate: unknown): void => {
    if (candidate === null || typeof candidate !== "object" || seen.has(candidate)) return;
    seen.add(candidate);
    for (const key of Reflect.ownKeys(candidate)) {
      freeze(Reflect.get(candidate, key));
    }
    Object.freeze(candidate);
  };

  freeze(value);
  return value;
}
