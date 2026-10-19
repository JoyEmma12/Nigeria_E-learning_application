// src/lib/learning.js
// Pure functions only (no React, no network), so every screen can share them and they are easy to test.

/* ---------- 1. Checking typed answers (tone marks and dots matter in Yoruba, Igbo, Efik...) ---------- */

const TONE = /[\u0300\u0301\u0304\u0302\u030C]/g; // grave, acute, macron, circumflex, caron
const ANY_MARK = /[\u0300-\u036f]/g;              // all combining marks, including the dot below (ẹ ọ ṣ ụ ị)

const clean = (s) =>
  String(s ?? "").normalize("NFC").toLowerCase().replace(/[.,!?;:'"“”‘’]/g, "").replace(/\s+/g, " ").trim();
const noTone = (s) => s.normalize("NFD").replace(TONE, "").normalize("NFC");
const noMarks = (s) => s.normalize("NFD").replace(ANY_MARK, "").normalize("NFC");

function distance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

/**
 * Compare what the learner typed with the right answer.
 * Returns { ok, level, hint }.  level: "exact" | "tone" | "marks" | "typo" | "wrong"
 * Missing tone marks or dots still count as correct, but the learner is told what to improve.
 */
export function checkAnswer(input, expected) {
  const a = clean(input), b = clean(expected);
  if (!a) return { ok: false, level: "wrong", hint: "" };
  if (a === b) return { ok: true, level: "exact", hint: "" };
  if (noTone(a) === noTone(b)) return { ok: true, level: "tone", hint: `Right word. Mind the tone marks: ${expected}` };
  if (noMarks(a) === noMarks(b)) return { ok: true, level: "marks", hint: `Right word. Spelling with the special letters: ${expected}` };
  const x = noMarks(a), y = noMarks(b);
  if (y.length >= 5 && distance(x, y) === 1) return { ok: true, level: "typo", hint: `Almost. It is spelled: ${expected}` };
  return { ok: false, level: "wrong", hint: `Correct answer: ${expected}` };
}

/* ---------- 2. Building exercises from vocabulary ---------- */

const shuffle = (arr, rnd = Math.random) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

/**
 * items: [{ id, word, meaning, audio? }]   (word = the Nigerian-language term, meaning = English)
 * Order: pick the meaning -> pick the word -> listen (if audio) -> type it.
 * Every item gets taught first, then tested in increasingly hard ways.
 */
export function buildExercises(items, { rnd = Math.random } = {}) {
  const options = (item, key) => {
    const distractors = shuffle(items.filter((i) => i.id !== item.id && i[key] !== item[key]), rnd).slice(0, 3).map((i) => i[key]);
    return shuffle([item[key], ...distractors], rnd);
  };
  const pool = shuffle(items, rnd);
  const out = [];
  pool.forEach((it) => out.push({ type: "learn", item: it }));
  pool.forEach((it) => out.push({ type: "pick-meaning", item: it, prompt: it.word, answer: it.meaning, options: options(it, "meaning") }));
  shuffle(pool, rnd).forEach((it) => out.push({ type: "pick-word", item: it, prompt: it.meaning, answer: it.word, options: options(it, "word") }));
  shuffle(pool.filter((i) => i.audio), rnd).forEach((it) => out.push({ type: "listen", item: it, audio: it.audio, answer: it.meaning, options: options(it, "meaning") }));
  shuffle(pool, rnd).forEach((it) => out.push({ type: "type-word", item: it, prompt: it.meaning, answer: it.word }));
  return out;
}

/* ---------- 3. Spaced repetition (Leitner boxes) ---------- */

const DAY = 86400000;
const INTERVAL_DAYS = [0, 1, 3, 7, 14, 30]; // box 0 is new, box 5 is mastered

/** card = { id, box, due }. Correct answers move up a box, wrong answers drop back to box 1. */
export function review(card, correct, now = Date.now()) {
  const box = correct ? Math.min((card?.box ?? 0) + 1, 5) : 1;
  return { id: card.id, box, due: now + INTERVAL_DAYS[box] * DAY };
}
export const dueCards = (cards, now = Date.now()) => cards.filter((c) => c.due <= now).sort((a, b) => a.due - b.due);
export const isMastered = (card) => card.box >= 5;

/* ---------- 4. Scoring ---------- */

export const PASS_MARK = 0.7;

export function scoreLesson({ correct, total, firstTime = false }) {
  const pct = total ? correct / total : 0;
  const passed = pct >= PASS_MARK;
  const stars = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : pct >= 0.5 ? 1 : 0;
  let xp = correct * 2;
  if (passed) xp += 10;
  if (pct === 1) xp += 10;
  if (passed && firstTime) xp += 5;
  return { pct: Math.round(pct * 100), passed, stars, xp };
}

/* ---------- 5. Daily streak ---------- */

const dayKey = (t = Date.now()) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** streak = { count, best, last } where last is "YYYY-MM-DD". Call it whenever the learner finishes something. */
export function updateStreak(streak = { count: 0, best: 0, last: null }, now = Date.now()) {
  const today = dayKey(now), yesterday = dayKey(now - DAY);
  if (streak.last === today) return streak;
  const count = streak.last === yesterday ? streak.count + 1 : 1;
  return { count, best: Math.max(streak.best || 0, count), last: today };
}
/** What to show on screen: a streak that was not continued yesterday or today is already broken. */
export function activeStreak(streak, now = Date.now()) {
  if (!streak?.last) return 0;
  return streak.last === dayKey(now) || streak.last === dayKey(now - DAY) ? streak.count : 0;
}

/* ---------- 6. Which lessons are open ---------- */

/**
 * lessons: ordered [{ id, ... }]   progress: { [lessonId]: { passed, stars, pct } }
 * A lesson opens when the one before it has been passed.
 * Returns each lesson with state: "done" | "current" | "locked" and its saved result.
 */
export function lessonPath(lessons, progress = {}) {
  let open = true, currentSet = false;
  return lessons.map((l) => {
    const p = progress[l.id];
    const done = !!p?.passed;
    let state = "locked";
    if (done) state = "done";
    else if (open) { state = currentSet ? "locked" : "current"; currentSet = true; }
    open = open && done;
    return { ...l, state, result: p || null };
  });
}
export const nextLesson = (path) => path.find((l) => l.state === "current") || null;
