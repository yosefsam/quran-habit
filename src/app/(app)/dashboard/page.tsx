"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { demoGoal, demoStreak, demoSessions, motivationalQuotes, weeklyCompletionData } from "@/lib/demo-data";
import { getHasanatForSession, formatHasanat } from "@/lib/hasanat";
import type { ReadingSession } from "@/types";
import { ProgressRing } from "@/components/progress-ring";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Check, Circle, ChevronRight, Award, Bookmark } from "lucide-react";
import { cn, isSameDay } from "@/lib/utils";
import { useEffect } from "react";

const unitLabel: Record<string, string> = { pages: "pages", ayahs: "verses", minutes: "minutes", surahs: "surahs" };

function sessionHasanat(s: ReadingSession): number {
  return s.hasanat ?? getHasanatForSession(s.amount, s.unit);
}

export default function DashboardPage() {
  const isDemo = useAppStore((s) => s.isDemo);
  const userGoal = useAppStore((s) => s.userGoal);
  const streak = useAppStore((s) => s.streak);
  const sessions = useAppStore((s) => s.sessions);
  const setUserGoal = useAppStore((s) => s.setUserGoal);
  const setStreak = useAppStore((s) => s.setStreak);
  const setSessions = useAppStore((s) => s.setSessions);
  const setTodayProgress = useAppStore((s) => s.setTodayProgress);
  const setTodayStatus = useAppStore((s) => s.setTodayStatus);
  const lastReadPosition = useAppStore((s) => s.lastReadPosition);
  const bookmarks = useAppStore((s) => s.bookmarks);

  const goal = userGoal ?? demoGoal;
  const streakData = streak ?? demoStreak;
  const sessionList = sessions.length > 0 ? sessions : demoSessions;

  useEffect(() => {
    if (!isDemo && !userGoal) setUserGoal(demoGoal);
    if (!isDemo && !streak) setStreak(demoStreak);
    if (!isDemo && sessions.length === 0) setSessions(demoSessions);
  }, [isDemo, userGoal, streak, sessions.length, setUserGoal, setStreak, setSessions]);

  const todaySessions = sessionList.filter((s) => isSameDay(new Date(s.completedAt), new Date()));
  const todayTotal = todaySessions.reduce((a, s) => a + s.amount, 0);
  const todayHasanat = todaySessions.reduce((a, s) => a + sessionHasanat(s), 0);
  const totalHasanat = sessionList.reduce((a, s) => a + sessionHasanat(s), 0);
  const progress = todayTotal;
  const target = goal.dailyAmount;
  const isComplete = progress >= target;

  useEffect(() => {
    setTodayProgress(progress);
    setTodayStatus(isComplete ? "complete" : progress > 0 ? "in_progress" : "none");
  }, [progress, isComplete, setTodayProgress, setTodayStatus]);

  const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-semibold">Today</h1>
        <p className="text-sm text-muted-foreground">
          {isComplete ? "Goal completed — well done!" : progress > 0 ? `${target - progress} ${unitLabel[goal.unit]} to go` : `Your goal: ${target} ${unitLabel[goal.unit]}`}
        </p>
      </motion.header>

      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <ProgressRing value={progress} max={target} size={100} strokeWidth={6} />
              <div className="flex-1 text-center sm:text-left">
                <p className="text-2xl font-bold tabular-nums">{progress} <span className="text-muted-foreground font-normal">/ {target}</span></p>
                <p className="text-sm text-muted-foreground capitalize">{unitLabel[goal.unit]} today</p>
                <Button asChild size="lg" className="mt-4 w-full sm:w-auto">
                  <Link href={lastReadPosition?.page ? `/reader?page=${lastReadPosition.page}` : "/reader"}>{isComplete ? "Read more" : "Continue reading"} <ChevronRight className="ml-1 h-4 w-4" /></Link>
                </Button>
                {lastReadPosition?.page ? (
                  <p className="text-xs text-muted-foreground mt-2">Resume from page {lastReadPosition.page}</p>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 gap-3">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary"><Award className="h-5 w-5" /></div>
          <div><p className="font-semibold">{formatHasanat(totalHasanat)}</p><p className="text-xs text-muted-foreground">Total hasanat</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400"><Flame className="h-5 w-5" /></div>
          <div><p className="font-semibold">{streakData.currentStreak} day streak</p><p className="text-xs text-muted-foreground">Longest: {streakData.longestStreak}</p></div>
        </CardContent></Card>
      </motion.section>

      {(bookmarks?.length ?? 0) > 0 && (
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Bookmarks</CardTitle>
              <CardDescription>Quick resume points</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {bookmarks.slice(0, 6).map((b) => (
                  <Button key={b.id} variant="outline" size="sm" asChild>
                    <Link href={`/reader?page=${b.page}`} className="inline-flex items-center gap-2">
                      <Bookmark className="h-4 w-4" />
                      Page {b.page}
                    </Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>
      )}

      {todayHasanat > 0 && (
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <Card className="border-primary/20 bg-primary/5"><CardContent className="p-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Today&apos;s hasanat</span>
            <span className="text-lg font-semibold text-primary">{formatHasanat(todayHasanat)}</span>
          </CardContent></Card>
        </motion.section>
      )}

      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">This week</CardTitle><CardDescription>Daily completion</CardDescription></CardHeader>
          <CardContent>
            <div className="flex justify-between gap-1">
              {weeklyCompletionData.map((d) => (
                <div key={d.day} className="flex flex-col items-center gap-1 flex-1" title={`${d.day}: ${d.completed ? d.amount : 0}`}>
                  <div className={cn("w-full rounded-t min-h-[32px] max-w-[36px]", d.completed ? "bg-primary" : "bg-muted")} style={{ height: d.completed ? 24 + d.amount * 4 : 8 }} />
                  <span className="text-[10px] text-muted-foreground">{d.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-dashed"><CardContent className="p-4">
          <p className="text-sm text-muted-foreground italic">&ldquo;{quote.text}&rdquo;</p>
          <p className="text-xs text-muted-foreground mt-2">— {quote.source}</p>
        </CardContent></Card>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div><CardTitle className="text-base">Recent sessions</CardTitle><CardDescription>Your latest reading</CardDescription></div>
            <Link href="/analytics" className="text-sm text-primary font-medium hover:underline">View all</Link>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {sessionList.slice(0, 5).map((s) => (
                <li key={s.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  <div className="flex items-center gap-3">
                    {s.goalCompleted ? <Check className="h-4 w-4 text-primary" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                    <span>{s.amount} {unitLabel[s.unit]} <span className="text-primary font-medium ml-1">+{formatHasanat(sessionHasanat(s))} hasanat</span></span>
                  </div>
                  <span className="text-muted-foreground text-xs">{new Date(s.completedAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
}
