type Listener = () => void;

export interface PersistentStore<T> {
  get: () => T;
  getServer: () => T;
  set: (next: T | ((prev: T) => T)) => void;
  subscribe: (listener: Listener) => () => void;
}

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
    }
    notify();
  };

  const subscribe: PersistentStore<T>['subscribe'] = (listener) => {
    listeners.add(listener);

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
