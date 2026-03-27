"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ResetReadingProgressDialog({
  triggerLabel = "Reset reading progress",
  variant = "outline" as const,
  className,
}: {
  triggerLabel?: string;
  variant?: "outline" | "destructive" | "ghost";
  className?: string;
}) {
  const router = useRouter();
  const resetReadingProgress = useAppStore((s) => s.resetReadingProgress);
  const [open, setOpen] = useState(false);

  function confirm() {
    resetReadingProgress();
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant={variant} className={className}>
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset reading progress?</DialogTitle>
          <DialogDescription className="text-left space-y-2 pt-1">
            <span className="block">
              Are you sure you want to reset your reading progress? This will clear tracked reading progress and
              completion data (sessions, streak, visited and completed pages, resume position, and activity-based
              hasanat totals). Your bookmarks are kept.
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={confirm}>
            Reset progress
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
