"use client";

import { useEffect, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store/useAppStore";
import type { Bookmark, ReaderPreferences, ReadingSession, Streak } from "@/types";

export function UserSessionProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch {
      return undefined;
    }
  }, []);
  const setPersistedAuthUserId = useAppStore((s) => s.setPersistedAuthUserId);
  const clearDataForUserSwitch = useAppStore((s) => s.clearDataForUserSwitch);
  const persistedAuthUserId = useAppStore((s) => s.persistedAuthUserId);
  const isDemo = useAppStore((s) => s.isDemo);
  const setProStatus = useAppStore((s) => s.setProStatus);
  const setVisitedPages = useAppStore((s) => s.setVisitedPages);
  const setCompletedPages = useAppStore((s) => s.setCompletedPages);
  const setLastReadPosition = useAppStore((s) => s.setLastReadPosition);
  const setSessions = useAppStore((s) => s.setSessions);
  const setStreak = useAppStore((s) => s.setStreak);
  const setReaderPreferences = useAppStore((s) => s.setReaderPreferences);
  const setTodayProgress = useAppStore((s) => s.setTodayProgress);
  const setTodayStatus = useAppStore((s) => s.setTodayStatus);
  const loadedForUser = useRef<string | null>(null);

  useEffect(() => {
    if (!supabase) return;

    const reconcile = (nextId: string | null) => {
      const prev = useAppStore.getState().persistedAuthUserId;
      if (nextId && prev && nextId !== prev) {
        clearDataForUserSwitch();
      }
      setPersistedAuthUserId(nextId);
    };

    supabase.auth.getUser().then(({ data: { user } }) => {
      reconcile(user?.id ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const id = session?.user?.id ?? null;
      if (event === "SIGNED_OUT") {
        setPersistedAuthUserId(null);
        loadedForUser.current = null;
        return;
      }
      reconcile(id);
    });

    return () => subscription.unsubscribe();
  }, [supabase, clearDataForUserSwitch, setPersistedAuthUserId]);

  useEffect(() => {
    if (!supabase || isDemo || !persistedAuthUserId) return;
    if (loadedForUser.current === persistedAuthUserId) return;
    let cancelled = false;
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;
      const res = await fetch("/api/reading-state", { credentials: "include" });
      if (!res.ok || cancelled) return;
      const row = await res.json();
      if (!row || row.error || cancelled) return;
      if (Array.isArray(row.visited_pages)) setVisitedPages(row.visited_pages);
      if (Array.isArray(row.completed_pages)) setCompletedPages(row.completed_pages);
      if (row.subscription?.isPro === true) setProStatus("pro");
      else if (row.subscription?.isPro === false) setProStatus("free");
      if (row.last_read_page && typeof row.last_read_page === "number") {
        setLastReadPosition({
          userId: persistedAuthUserId,
          page: row.last_read_page,
          updatedAt: new Date().toISOString(),
        });
      }
      if (row.streak) setStreak(row.streak as Streak);
      if (Array.isArray(row.sessions)) setSessions(row.sessions as ReadingSession[]);
      if (row.reader_preferences && typeof row.reader_preferences === "object") {
        setReaderPreferences(row.reader_preferences as Partial<ReaderPreferences>);
      }
      if (typeof row.today_progress === "number") setTodayProgress(row.today_progress);
      if (row.today_status) setTodayStatus(row.today_status as "complete" | "in_progress" | "missed" | "none");
      if (Array.isArray(row.bookmarks)) {
        const mapped: Bookmark[] = row.bookmarks.map((b: { id?: string; page: number; createdAt?: string }) => ({
          id: b.id ?? `bm-${b.page}`,
          userId: persistedAuthUserId,
          page: b.page,
          createdAt: b.createdAt ?? new Date().toISOString(),
        }));
        useAppStore.setState({ bookmarks: mapped });
      }
      loadedForUser.current = persistedAuthUserId;
    })();
    return () => {
      cancelled = true;
    };
  }, [
    supabase,
    isDemo,
    persistedAuthUserId,
    setVisitedPages,
    setCompletedPages,
    setLastReadPosition,
    setSessions,
    setStreak,
    setProStatus,
    setReaderPreferences,
    setTodayProgress,
    setTodayStatus,
  ]);

  useEffect(() => {
    if (!supabase || isDemo || !persistedAuthUserId) return;
    const refreshPro = async () => {
      const res = await fetch("/api/reading-state", { credentials: "include" });
      if (!res.ok) return;
      const row = (await res.json()) as { subscription?: { isPro?: boolean } };
      if (row.subscription?.isPro === true) setProStatus("pro");
      else if (row.subscription?.isPro === false) setProStatus("free");
    };
    const onVis = () => {
      if (document.visibilityState === "visible") void refreshPro();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [supabase, isDemo, persistedAuthUserId, setProStatus]);

  return <>{children}</>;
}
