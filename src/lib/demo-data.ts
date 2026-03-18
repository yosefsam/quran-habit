import type { ReadingSession, Streak, ReadingGoal } from "@/types";
import { getHasanatForSession } from "@/lib/hasanat";

export const demoGoal: ReadingGoal = {
  id: "goal-1",
  userId: "user-1",
  dailyAmount: 5,
  unit: "pages",
  intensity: "moderate",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const demoStreak: Streak = {
  id: "streak-1",
  userId: "user-1",
  currentStreak: 7,
  longestStreak: 14,
  lastCompletedDate: new Date().toISOString().split("T")[0],
  updatedAt: new Date().toISOString(),
};

const _sessions: Omit<ReadingSession, "hasanat">[] = [
  { id: "s1", userId: "user-1", amount: 5, unit: "pages", completedAt: new Date().toISOString(), goalCompleted: true, note: "Fajr reading" },
  { id: "s2", userId: "user-1", amount: 4, unit: "pages", completedAt: new Date(Date.now() - 86400000).toISOString(), goalCompleted: true },
  { id: "s3", userId: "user-1", amount: 5, unit: "pages", completedAt: new Date(Date.now() - 86400000 * 2).toISOString(), goalCompleted: true },
  { id: "s4", userId: "user-1", amount: 3, unit: "pages", completedAt: new Date(Date.now() - 86400000 * 3).toISOString(), goalCompleted: false },
  { id: "s5", userId: "user-1", amount: 5, unit: "pages", completedAt: new Date(Date.now() - 86400000 * 4).toISOString(), goalCompleted: true },
];

export const demoSessions: ReadingSession[] = _sessions.map((s) => ({
  ...s,
  hasanat: getHasanatForSession(s.amount, s.unit),
}));

export const weeklyCompletionData = [
  { day: "Mon", completed: true, amount: 5 },
  { day: "Tue", completed: true, amount: 5 },
  { day: "Wed", completed: true, amount: 4 },
  { day: "Thu", completed: false, amount: 0 },
  { day: "Fri", completed: true, amount: 5 },
  { day: "Sat", completed: true, amount: 6 },
  { day: "Sun", completed: true, amount: 5 },
];

export const monthlyChartData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  completed: Math.random() > 0.2 ? 1 : 0,
  amount: Math.random() > 0.2 ? Math.floor(Math.random() * 8) + 2 : 0,
}));

export const motivationalQuotes = [
  { text: "The most beloved deed to Allah is that which is regular and constant, even if it is little.", source: "Hadith" },
  { text: "Read the Quran, for it will come as an intercessor for its reciters on the Day of Resurrection.", source: "Hadith" },
];
