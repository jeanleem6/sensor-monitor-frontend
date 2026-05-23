// Deterministic pseudo-random number generator for DEMO data.
// Both panels previously duplicated this — centralised here.
// Replace the callers with real API fetches when data is available.

export const seedOf = (str, key) => {
  const s = str + '|' + key
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = ((h ^ s.charCodeAt(i)) * 16777619) >>> 0
  return h
}

export const rand01 = (str, key) => seedOf(str, key) / 0xffffffff
