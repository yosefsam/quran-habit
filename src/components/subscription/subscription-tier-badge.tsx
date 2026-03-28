"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type Tier = "unknown" | "free" | "pro";

export function SubscriptionTierBadge({
  tier,
  syncing,
  className,
}: {
  tier: Tier;
  syncing?: boolean;
  className?: string;
}) {
  if (syncing) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border border-muted-foreground/25 bg-muted/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground",
          className
        )}
      >
        <Loader2 className="h-3 w-3 animate-spin" />
        Syncing
      </span>
    );
  }
  if (tier === "pro") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300",
          className
        )}
      >
        Pro
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-muted-foreground/30 bg-muted/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground",
        className
      )}
    >
      Free
    </span>
  );
}
