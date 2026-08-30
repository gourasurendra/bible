const KEY = "bibleverse-v1";
const defaults = {
  bookmarks: [],
  notes: {},
  highlights: {},
  collections: { "Favorite Verses": [] },
  completed: [],
  history: [],
  streak: { current: 0, longest: 0, totalDays: 0, lastDate: null },
  goal: 2,
  daily: { date: null, count: 0 },
  plans: {},
  settings: { fontSize: 19, lineHeight: 1.85, width: 720, font: "serif", theme: "light" }
};

export function loadStore() {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return structuredClone(defaults);
  }
}
export function saveStore(store) {
  localStorage.setItem(KEY, JSON.stringify(store));
}
export function today() {
  return new Date().toISOString().slice(0,10);
}
export function markRead(store, ref) {
  const next = structuredClone(store);
  next.history = [ref, ...next.history.filter(x => x !== ref)].slice(0, 30);
  if (next.daily.date !== today()) next.daily = { date: today(), count: 0 };
  return next;
}
export function completeChapter(store, ref) {
  const next = structuredClone(store);
  if (!next.completed.includes(ref)) next.completed.push(ref);
  if (next.daily.date !== today()) next.daily = { date: today(), count: 0 };
  next.daily.count += 1;
  const last = next.streak.lastDate;
  const now = today();
  if (last !== now) {
    const prev = new Date();
    prev.setDate(prev.getDate() - 1);
    const yesterday = prev.toISOString().slice(0,10);
    next.streak.current = last === yesterday ? next.streak.current + 1 : 1;
    next.streak.longest = Math.max(next.streak.longest, next.streak.current);
    next.streak.totalDays += 1;
    next.streak.lastDate = now;
  }
  return next;
}