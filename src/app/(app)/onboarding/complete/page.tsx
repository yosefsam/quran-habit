"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function OnboardingCompletePage() {
  const onboardingPreferences = useAppStore((s) => s.onboardingPreferences);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
        <Card className="border-0 shadow-xl text-center overflow-hidden">
          <div className="bg-primary/10 py-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }} className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Sparkles className="h-8 w-8" />
            </motion.div>
          </div>
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl">You&apos;re all set</CardTitle>
            <CardDescription>Your plan is ready. Start today and we&apos;ll help you stay consistent.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {onboardingPreferences && (
              <p className="text-sm text-muted-foreground">Daily goal: <strong className="text-foreground">{onboardingPreferences.dailyAmount} {onboardingPreferences.unit}</strong></p>
            )}
            <p className="text-xs text-muted-foreground">Open the Quran from the dashboard to read and track progress.</p>
            <Button asChild size="lg" className="w-full"><Link href="/dashboard">Go to dashboard</Link></Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
