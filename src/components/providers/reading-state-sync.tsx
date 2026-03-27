"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";

/** Debounced sync of local reading state to Supabase (authenticated users only). */
export function ReadingStateSync() {
  const userId = useAppStore((s) => s.persistedAuthUserId);
  const isDemo = useAppStore((s) => s.isDemo);
  const visitedPages = useAppStore((s) => s.visitedPages);
  const completedPages = useAppStore((s) => s.completedPages);
  const lastReadPosition = useAppStore((s) => s.lastReadPosition);
  const streak = useAppStore((s) => s.streak);
  const sessions = useAppStore((s) => s.sessions);
  const bookmarks = useAppStore((s) => s.bookmarks);
  const readerPreferences = useAppStore((s) => s.readerPreferences);
  const todayProgress = useAppStore((s) => s.todayProgress);
  const todayStatus = useAppStore((s) => s.todayStatus);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!userId || isDemo) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const s = useAppStore.getState();
      try {
        await fetch("/api/reading-state", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            visited_pages: s.visitedPages,
            completed_pages: s.completedPages,
            last_read_page: s.lastReadPosition?.page ?? null,
            streak: s.streak,
            sessions: s.sessions,
            bookmarks: s.bookmarks,
            reader_preferences: s.readerPreferences,
            today_progress: s.todayProgress,
            today_status: s.todayStatus,
          }),
        });
      } catch {
        /* offline / non-blocking */
      }
    }, 2800);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [
    userId,
    isDemo,
    visitedPages,
    completedPages,
    lastReadPosition,
    streak,
    sessions,
    bookmarks,
    readerPreferences,
    todayProgress,
    todayStatus,
  ]);

  return null;
}
