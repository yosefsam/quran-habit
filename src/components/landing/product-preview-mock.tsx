"use client";

import { motion } from "framer-motion";
import { Flame, BookOpen, Target } from "lucide-react";

/** Decorative mock dashboard card for hero / visual sections */
export function ProductPreviewMock({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className={className}
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-5 shadow-2xl shadow-emerald-950/40 ring-1 ring-white/5">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-teal-500/10 blur-2xl" />

        <div className="relative flex items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-400/90">Today</p>
            <p className="text-lg font-semibold text-white">Reading goal</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
            <Target className="h-6 w-6" />
          </div>
        </div>

        <div className="relative mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/5">
            <Flame className="mb-2 h-4 w-4 text-orange-400" />
            <p className="text-xs text-zinc-400">Streak</p>
            <p className="text-xl font-bold text-white">12 days</p>
          </div>
          <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/5">
            <BookOpen className="mb-2 h-4 w-4 text-emerald-400" />
            <p className="text-xs text-zinc-400">Pages</p>
            <p className="text-xl font-bold text-white">2 / 3</p>
          </div>
        </div>

        <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" />
        </div>
        <p className="relative mt-2 text-center text-[11px] text-zinc-500">Preview — your stats sync when you sign up</p>
      </div>
    </motion.div>
  );
}
