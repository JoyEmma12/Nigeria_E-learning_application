// src/lib/stats.js
import { useCallback, useEffect, useState } from "react";
import { get, post } from "../api";

export const DAILY_GOAL = 20;
const EMPTY = { xp: 0, streak: 0, bestStreak: 0, todayXp: 0, goal: DAILY_GOAL, cards: {} };

/** The learner's local date as YYYY-MM-DD (the server uses it to count streaks in the learner's own timezone). */
export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** Words whose review time has come. cards = { wordId: { box, due } } */
export const dueCount = (cards, now = Date.now()) => Object.values(cards || {}).filter((c) => c.due <= now).length;

/** Loads { xp, streak, bestStreak, todayXp, goal, cards }. stats is null while loading; error is true if the server could not be reached. */
export function useStats(username) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(false);

  const refresh = useCallback(() => {
    if (!username) return;
    get(`/stats/${encodeURIComponent(username)}?day=${today()}`)
      .then((s) => { setStats(s); setError(false); })
      .catch(() => { setStats(EMPTY); setError(true); });
  }, [username]);

  useEffect(() => { refresh(); }, [refresh]);
  return { stats, error, refresh };
}

/** Call when a lesson, quiz or review ends: await recordActivity(xpEarned, updatedCards) */
export const recordActivity = (xp, cards) => post("/activity", { day: today(), xp, cards });