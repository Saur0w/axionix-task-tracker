type Listener = () => void;

export interface PersistentStore<T> {
  /** Current client value (cached, referentially stable between writes). */
  get: () => T;
  /** Value used during SSR and hydration. Always the fallback. */
  getServer: () => T;
  /** Write a new value (or updater) and notify subscribers synchronously. */
  set: (next: T | ((prev: T) => T)) => void;
  /** Subscribe to changes, including writes from other browser tabs. */
  subscribe: (listener: Listener) => () => void;
}

/**
 * A tiny localStorage-backed store for `useSyncExternalStore`.
 *
 * - SSR and hydration always see `fallback`, so markup never mismatches.
 * - After hydration React re-renders with the persisted client value.
 * - Reads are cached, so `get()` returns the same reference until the next write.
 */
export function createPersistentStore<T>(
  key: string,
  fallback: T,
  isValid: (value: unknown) => value is T = (v): v is T => v !== null && v !== undefined
): PersistentStore<T> {
  let cache: T | undefined;
  const listeners = new Set<Listener>();

  const read = (): T => {
    if (cache !== undefined) return cache;
    if (typeof window === 'undefined') return fallback;

    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(key);
      if (raw === null) {
        cache = fallback;
      } else {
        const parsed: unknown = JSON.parse(raw);
        cache = isValid(parsed) ? parsed : fallback;
      }
    } catch {
      // Legacy plain-string values (e.g. `dark` saved without JSON quotes).
      cache = raw !== null && isValid(raw) ? raw : fallback;
    }
    return cache as T;
  };

  const notify = () => listeners.forEach((listener) => listener());

  const set: PersistentStore<T>['set'] = (next) => {
    const value = typeof next === 'function' ? (next as (prev: T) => T)(read()) : next;
    cache = value;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or unavailable (private mode). Keep the in-memory value.
    }
    notify();
  };

  const subscribe: PersistentStore<T>['subscribe'] = (listener) => {
    listeners.add(listener);

    // Keep multiple tabs in sync.
    const onStorage = (event: StorageEvent) => {
      if (event.key !== key) return;
      cache = undefined;
      listener();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      listeners.delete(listener);
      window.removeEventListener('storage', onStorage);
    };
  };

  return { get: read, getServer: () => fallback, set, subscribe };
}
