// Apollo's cache lives in memory, so every launch of the PWA started from
// nothing and swept skeletons over the whole screen while the socket connected
// and the first queries came back. The data is small and barely changes between
// launches, so it is kept in localStorage and put back before the first render.
// The screens then paint immediately and the network refreshes them underneath.
//
// Deliberately not apollo3-cache-persist: this needs a read, a write and a
// version check, and the lockfile in this project is delicate enough that a
// dependency is the more expensive of the two options.

const KEY = 'picape.apollo.cache';
const VERSION_KEY = 'picape.apollo.version';

// Bump when the shape of what is cached changes in a way that old entries
// cannot satisfy. Anything stored under a different version is dropped rather
// than restored into a cache that no longer understands it.
const VERSION = '1';

// localStorage gives about 5MB and throws when full. Well under that, a write
// is cheap and a quota error impossible.
const MAX_BYTES = 1_000_000;

function storage() {
  try {
    // Safari in private browsing has the object and throws on use.
    const store = window.localStorage;
    store.getItem(VERSION_KEY);
    return store;
  } catch {
    return null;
  }
}

export function restoreCache(cache) {
  const store = storage();
  if (!store) return false;

  try {
    if (store.getItem(VERSION_KEY) !== VERSION) {
      store.removeItem(KEY);
      return false;
    }
    const saved = store.getItem(KEY);
    if (!saved) return false;
    cache.restore(JSON.parse(saved));
    return true;
  } catch {
    // A truncated or unparseable entry is worth exactly nothing; drop it and
    // start cold rather than let it break the launch.
    try {
      store.removeItem(KEY);
    } catch {
      /* nothing left to try */
    }
    return false;
  }
}

export function persistCacheOnChange(cache, { debounceMs = 1000 } = {}) {
  const store = storage();
  if (!store) return () => {};

  let timer = null;

  const write = () => {
    timer = null;
    try {
      const serialized = JSON.stringify(cache.extract());
      if (serialized.length > MAX_BYTES) return;
      store.setItem(KEY, serialized);
      store.setItem(VERSION_KEY, VERSION);
    } catch {
      // Out of quota, or the cache holds something that will not serialize.
      // Losing the next launch's head start is not worth an error.
    }
  };

  const schedule = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(write, debounceMs);
  };

  // InMemoryCache has no "something changed" event, so the two methods that
  // change it are wrapped. Every query result and every mutation lands in one
  // of them. Writes come in bursts, so the actual save is debounced to one per
  // quiet second rather than one per change.
  const patched = ['write', 'evict', 'modify'].map((name) => {
    const original = cache[name].bind(cache);
    cache[name] = (...args) => {
      const result = original(...args);
      schedule();
      return result;
    };
    return () => {
      cache[name] = original;
    };
  });

  // Leaving the app is the moment the next launch depends on, and a debounce
  // that has not fired yet would be lost.
  const flush = () => {
    if (timer) {
      clearTimeout(timer);
      write();
    }
  };
  window.addEventListener('pagehide', flush);

  return () => {
    if (timer) clearTimeout(timer);
    window.removeEventListener('pagehide', flush);
    patched.forEach((restore) => restore());
  };
}
