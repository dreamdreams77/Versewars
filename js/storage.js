// Verse Wars: storage
//
// Wraps localStorage so meta-progression (Scrip + unlocks) survives between
// sessions in a real deployment, while degrading quietly to an in-memory
// object anywhere localStorage isn't available (private browsing, a
// sandboxed preview, etc.) instead of throwing.

window.VW = window.VW || {};

(function () {
  const KEY = 'verse-wars-meta-v1';
  let memoryFallback = null;

  function hasLocalStorage() {
    try {
      const testKey = '__vw_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  const useLocalStorage = hasLocalStorage();

  function defaultMeta() {
    return {
      totalScrip: 0,
      unlockedIds: window.VW.STARTER_UNLOCKED.slice(),
      achievements: [],
      riskyWinsLifetime: 0,
    };
  }

  function loadMeta() {
    if (useLocalStorage) {
      try {
        const raw = window.localStorage.getItem(KEY);
        if (!raw) return defaultMeta();
        const parsed = JSON.parse(raw);
        if (!parsed || !Array.isArray(parsed.unlockedIds) || typeof parsed.totalScrip !== 'number') {
          return defaultMeta();
        }
        // Merge onto the defaults so a save from before a new field existed
        // (achievements, riskyWinsLifetime, ...) picks it up safely instead
        // of leaving it undefined.
        return Object.assign({}, defaultMeta(), parsed);
      } catch (e) {
        return defaultMeta();
      }
    }
    if (!memoryFallback) memoryFallback = defaultMeta();
    return memoryFallback;
  }

  function saveMeta(meta) {
    if (useLocalStorage) {
      try {
        window.localStorage.setItem(KEY, JSON.stringify(meta));
        return;
      } catch (e) {
        // fall through to memory fallback below
      }
    }
    memoryFallback = meta;
  }

  window.VW.storage = { loadMeta, saveMeta, defaultMeta };
})();
