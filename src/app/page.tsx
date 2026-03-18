"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";
import { demoGoal, demoStreak, demoSessions } from "@/lib/demo-data";
import { BookOpen, Target, Flame, BarChart3, Bell, ChevronRight, Play } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const setDemoMode = useAppStore((s) => s.setDemoMode);

  function startDemo() {
    setDemoMode(true, { goal: demoGoal, streak: demoStreak, sessions: demoSessions });
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">Quran Habit</Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">Sign in</Link>
            <Button asChild size="sm"><Link href="/signup">Get started</Link></Button>
          </div>
        </div>
      </nav>

      <section className="relative pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 text-center">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-sm font-medium text-primary mb-4">Habit-building for Quran reading</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl max-w-3xl mx-auto leading-tight">
            Build a routine that brings you closer, one day at a time
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
            Set your daily goal, track streaks, and stay consistent with gentle reminders and progress you can see.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-10 flex flex-col items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={startDemo} size="lg" variant="secondary" className="gap-2">
                <Play className="h-5 w-5" /> Try demo — no sign up
              </Button>
              <Button asChild size="lg"><Link href="/signup">Get started for free <ChevronRight className="ml-1 h-5 w-5" /></Link></Button>
            </div>
            <Button asChild variant="outline" size="lg"><Link href="/login">I already have an account</Link></Button>
          </motion.div>
        </div>
      </section>

      <section className="py-20 border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="text-sm text-muted-foreground">Join thousands building a consistent habit</p>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Everything you need to stay consistent</h2>
          <p className="text-muted-foreground text-center max-w-xl mx-auto mb-16">The most beloved deed is that which is regular and constant, even if it is little.</p>
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Target, title: "Daily goals", desc: "Set how much you want to read each day—by pages, verses, minutes, or surahs." },
              { icon: Flame, title: "Streak tracking", desc: "Build momentum with daily streaks. See your current and longest streak." },
              { icon: BarChart3, title: "Progress analytics", desc: "Weekly and monthly views show how consistent you are." },
              { icon: BookOpen, title: "Session logging", desc: "Log each reading session, add optional notes, mark when you hit your goal." },
              { icon: Bell, title: "Gentle reminders", desc: "Choose when you want a nudge to read. Supportive, not overwhelming." },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="rounded-xl border bg-card p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4"><item.icon className="h-5 w-5" /></div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">Your reading journey starts today</h2>
          <p className="mt-4 text-muted-foreground">Create a free account, set your goal, and we&apos;ll guide you through a short setup.</p>
          <Button asChild size="lg" className="mt-8"><Link href="/signup">Get started — it&apos;s free</Link></Button>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Quran Habit.</p>
          <div className="flex gap-6">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">Sign in</Link>
            <Link href="/signup" className="text-sm text-muted-foreground hover:text-foreground">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
