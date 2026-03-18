import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ReadingGoal, ReadingSession, Streak, Reminder, OnboardingPreferences, DailyStatus, Bookmark, LastReadPosition, ReaderPreferences } from "@/types";

interface AppState {
  theme: "light" | "dark" | "system";
  setTheme: (t: "light" | "dark" | "system") => void;
  isDemo: boolean;
  setDemoMode: (on: boolean, data?: { goal: ReadingGoal; streak: Streak; sessions: ReadingSession[] }) => void;
  userGoal: ReadingGoal | null;
  setUserGoal: (g: ReadingGoal | null) => void;
  sessions: ReadingSession[];
  setSessions: (s: ReadingSession[]) => void;
  addSession: (s: ReadingSession) => void;
  streak: Streak | null;
  setStreak: (s: Streak | null) => void;
  reminder: Reminder | null;
  setReminder: (r: Reminder | null) => void;
  onboardingPreferences: OnboardingPreferences | null;
  setOnboardingPreferences: (p: OnboardingPreferences | null) => void;
  todayStatus: DailyStatus;
  setTodayStatus: (s: DailyStatus) => void;
  todayProgress: number;
  setTodayProgress: (n: number) => void;

  lastReadPosition: LastReadPosition | null;
  setLastReadPosition: (p: LastReadPosition) => void;
  bookmarks: Bookmark[];
  toggleBookmark: (page: number) => void;
  readerPreferences: ReaderPreferences;
  setReaderPreferences: (p: Partial<ReaderPreferences>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: "system",
      setTheme: (theme) => set({ theme }),
      isDemo: false,
      setDemoMode: (isDemo, initialData) => {
        if (isDemo && initialData) set({ isDemo: true, userGoal: initialData.goal, streak: initialData.streak, sessions: initialData.sessions });
        else set({ isDemo: false });
      },
      userGoal: null,
      setUserGoal: (userGoal) => set({ userGoal }),
      sessions: [],
      setSessions: (sessions) => set({ sessions }),
      addSession: (session) => set((s) => ({ sessions: [session, ...s.sessions] })),
      streak: null,
      setStreak: (streak) => set({ streak }),
      reminder: null,
      setReminder: (reminder) => set({ reminder }),
      onboardingPreferences: null,
      setOnboardingPreferences: (onboardingPreferences) => set({ onboardingPreferences }),
      todayStatus: "none",
      setTodayStatus: (todayStatus) => set({ todayStatus }),
      todayProgress: 0,
      setTodayProgress: (todayProgress) => set({ todayProgress }),

      lastReadPosition: null,
      setLastReadPosition: (pos) => set({ lastReadPosition: pos }),
      bookmarks: [],
      toggleBookmark: (page) =>
        set((s) => {
          const existing = s.bookmarks.find((b) => b.page === page);
          if (existing) return { bookmarks: s.bookmarks.filter((b) => b.page !== page) };
          const b: Bookmark = { id: `bm-${Date.now()}`, userId: "user-1", page, createdAt: new Date().toISOString() };
          return { bookmarks: [b, ...s.bookmarks] };
        }),
      readerPreferences: { focusMode: false, showTranslation: false, fontScale: 1 },
      setReaderPreferences: (p) => set((s) => ({ readerPreferences: { ...s.readerPreferences, ...p } })),
    }),
    {
      name: "quranly-app",
      partialize: (s) => ({
        theme: s.theme,
        isDemo: s.isDemo,
        userGoal: s.isDemo ? s.userGoal : undefined,
        sessions: s.isDemo ? s.sessions : undefined,
        streak: s.isDemo ? s.streak : undefined,
        lastReadPosition: s.isDemo ? s.lastReadPosition : undefined,
        bookmarks: s.isDemo ? s.bookmarks : undefined,
        readerPreferences: s.readerPreferences,
      }),
    }
  )
);
