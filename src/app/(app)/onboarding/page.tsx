"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store/useAppStore";
import type { OnboardingPreferences, ReadingUnit, PlanIntensity, ConsistencyLevel } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

const STEPS = 6;
const GOAL_OPTIONS = ["Build a daily habit", "Finish the Quran in a year", "Read with meaning", "Consistency over quantity", "Other"];
const UNITS: { value: ReadingUnit; label: string }[] = [
  { value: "pages", label: "Pages" },
  { value: "ayahs", label: "Verses (ayahs)" },
  { value: "minutes", label: "Minutes" },
  { value: "surahs", label: "Surahs" },
];
const CONSISTENCY: { value: ConsistencyLevel; label: string }[] = [
  { value: "new", label: "Just starting" },
  { value: "sometimes", label: "Sometimes" },
  { value: "regular", label: "A few times a week" },
  { value: "daily", label: "Already daily" },
];
const INTENSITY: { value: PlanIntensity; label: string; desc: string }[] = [
  { value: "gentle", label: "Gentle", desc: "Small steps" },
  { value: "moderate", label: "Moderate", desc: "Steady and achievable" },
  { value: "ambitious", label: "Ambitious", desc: "Challenge yourself" },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [prefs, setPrefs] = useState<Partial<OnboardingPreferences>>({
    goal: "Build a daily habit",
    dailyAmount: 5,
    unit: "pages",
    reminderTime: "08:00",
    consistencyLevel: "sometimes",
    planIntensity: "moderate",
  });
  const router = useRouter();
  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch {
      return undefined;
    }
  }, []);
  const setOnboardingPreferences = useAppStore((s) => s.setOnboardingPreferences);
  const setUserGoal = useAppStore((s) => s.setUserGoal);

  const progress = (step / STEPS) * 100;

  const handleNext = () => {
    if (step < STEPS) setStep(step + 1);
    else handleComplete();
  };

  async function handleComplete() {
    const full: OnboardingPreferences = {
      goal: prefs.goal!,
      dailyAmount: prefs.dailyAmount ?? 5,
      unit: prefs.unit!,
      reminderTime: prefs.reminderTime ?? null,
      consistencyLevel: prefs.consistencyLevel!,
      planIntensity: prefs.planIntensity!,
    };
    setOnboardingPreferences(full);
    let userId: string | undefined;
    try {
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
        if (user) {
          await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", user.id);
          await supabase.from("reading_goals").upsert({ user_id: user.id, daily_amount: full.dailyAmount, unit: full.unit, intensity: full.planIntensity });
        }
      }
    } catch {}
    setUserGoal({
      id: "goal-1",
      userId: userId ?? "local",
      dailyAmount: full.dailyAmount,
      unit: full.unit,
      intensity: full.planIntensity,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    router.push("/onboarding/complete");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 border-b">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link href="/" className="text-sm text-muted-foreground">Exit</Link>
          <Progress value={progress} className="w-24 h-1.5" />
          <span className="text-sm text-muted-foreground w-8 text-right">{step}/{STEPS}</span>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="1" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="w-full space-y-6">
              <Card>
                <CardHeader><CardTitle>What&apos;s your main goal?</CardTitle><CardDescription>We&apos;ll tailor your plan.</CardDescription></CardHeader>
                <CardContent className="space-y-2">
                  {GOAL_OPTIONS.map((opt) => (
                    <button key={opt} type="button" onClick={() => setPrefs((p) => ({ ...p, goal: opt }))} className={`w-full text-left rounded-lg border p-3 text-sm ${prefs.goal === opt ? "border-primary bg-primary/10" : "border-border hover:bg-muted/50"}`}>{opt}</button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="2" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="w-full space-y-6">
              <Card>
                <CardHeader><CardTitle>How much per day?</CardTitle><CardDescription>Start small.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4 items-end">
                    <div className="flex-1"><Label>Amount</Label><Input type="number" min={1} max={100} value={prefs.dailyAmount ?? 5} onChange={(e) => setPrefs((p) => ({ ...p, dailyAmount: parseInt(e.target.value, 10) || 1 }))} /></div>
                    <div className="w-32"><Label>Unit</Label><Select value={prefs.unit ?? "pages"} onValueChange={(v) => setPrefs((p) => ({ ...p, unit: v as ReadingUnit }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{UNITS.map((u) => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}</SelectContent></Select></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          {step === 3 && (
            <motion.div key="3" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="w-full space-y-6">
              <Card>
                <CardHeader><CardTitle>Reminder time?</CardTitle><CardDescription>Pick a time that fits.</CardDescription></CardHeader>
                <CardContent>
                  <Select value={prefs.reminderTime ?? "08:00"} onValueChange={(v) => setPrefs((p) => ({ ...p, reminderTime: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["06:00", "07:00", "08:00", "09:00", "12:00", "20:00"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
                </CardContent>
              </Card>
            </motion.div>
          )}
          {step === 4 && (
            <motion.div key="4" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="w-full space-y-6">
              <Card>
                <CardHeader><CardTitle>How consistent are you now?</CardTitle><CardDescription>Be honest.</CardDescription></CardHeader>
                <CardContent className="space-y-2">
                  {CONSISTENCY.map((c) => (
                    <button key={c.value} type="button" onClick={() => setPrefs((p) => ({ ...p, consistencyLevel: c.value }))} className={`w-full text-left rounded-lg border p-3 text-sm ${prefs.consistencyLevel === c.value ? "border-primary bg-primary/10" : "border-border hover:bg-muted/50"}`}>{c.label}</button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
          {step === 5 && (
            <motion.div key="5" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="w-full space-y-6">
              <Card>
                <CardHeader><CardTitle>What kind of plan?</CardTitle><CardDescription>Gentle, moderate, or ambitious.</CardDescription></CardHeader>
                <CardContent className="space-y-2">
                  {INTENSITY.map((i) => (
                    <button key={i.value} type="button" onClick={() => setPrefs((p) => ({ ...p, planIntensity: i.value }))} className={`w-full text-left rounded-lg border p-3 text-sm ${prefs.planIntensity === i.value ? "border-primary bg-primary/10" : "border-border hover:bg-muted/50"}`}><span className="font-medium">{i.label}</span><span className="block text-muted-foreground text-xs mt-0.5">{i.desc}</span></button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
          {step === 6 && (
            <motion.div key="6" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="w-full space-y-6">
              <Card>
                <CardHeader><CardTitle>Here&apos;s your plan</CardTitle><CardDescription>You can change this in settings.</CardDescription></CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                    <p><strong>Goal:</strong> {prefs.goal}</p>
                    <p><strong>Daily:</strong> {prefs.dailyAmount} {UNITS.find((u) => u.value === prefs.unit)?.label}</p>
                    <p><strong>Plan:</strong> {INTENSITY.find((i) => i.value === prefs.planIntensity)?.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex gap-3 w-full mt-8">
          {step > 1 && <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="flex-1">Back</Button>}
          <Button onClick={handleNext} className={step === 1 ? "w-full" : "flex-1"}>{step === STEPS ? "Create my plan" : "Continue"}</Button>
        </div>
      </main>
    </div>
  );
}
