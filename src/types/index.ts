export type ReadingUnit = "pages" | "ayahs" | "minutes" | "surahs";
export type PlanIntensity = "gentle" | "moderate" | "ambitious";
export type ConsistencyLevel = "new" | "sometimes" | "regular" | "daily";
export type ReadingSource = "reader" | "manual";

export interface OnboardingPreferences {
  goal: string;
  dailyAmount: number;
  unit: ReadingUnit;
  reminderTime: string | null;
  consistencyLevel: ConsistencyLevel;
  planIntensity: PlanIntensity;
}

export interface ReadingGoal {
  id: string;
  userId: string;
  dailyAmount: number;
  unit: ReadingUnit;
  intensity: PlanIntensity;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingSession {
  id: string;
  userId: string;
  amount: number;
  unit: ReadingUnit;
  completedAt: string;
  note?: string | null;
  goalCompleted: boolean;
  hasanat?: number;
  source?: ReadingSource;
  pageStart?: number | null;
  pageEnd?: number | null;
  durationSeconds?: number | null;
}

export interface Streak {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  userId: string;
  enabled: boolean;
  time: string;
  tone: "gentle" | "moderate" | "motivating";
  frequency: "daily" | "weekdays" | "custom";
  updatedAt: string;
}

export type DailyStatus = "complete" | "in_progress" | "missed" | "none";

export interface QuranSurahMeta {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  ayahCount: number;
  startPage: number;
}

export interface Bookmark {
  id: string;
  userId: string;
  page: number;
  label?: string | null;
  createdAt: string;
}

export interface LastReadPosition {
  userId: string;
  page: number;
  updatedAt: string;
}

export interface ReaderPreferences {
  focusMode: boolean;
  showTranslation: boolean;
  /** Selected verified translation source used in reader UI. */
  translationKey: "sahih" | "pickthall" | "yusufali";
  fontScale: number; // 0.9 - 1.3
}
