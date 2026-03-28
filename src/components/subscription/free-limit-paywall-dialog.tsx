"use client";

import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  used: number;
  limit: number;
  /** Encoded path for post-login / pricing flow */
  nextPath?: string;
};

export function FreeLimitPaywallDialog({ open, onOpenChange, used, limit, nextPath = "/reader" }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Daily free limit reached</DialogTitle>
          <DialogDescription className="text-left space-y-2 pt-1">
            <span>
              You&apos;ve used {used} of {limit} free reader/session actions today. Pro removes this cap so you can
              read without interruption.
            </span>
            <span className="block text-foreground/90">
              Pro includes unlimited guided reading and sessions, premium features as we ship them, and billing
              managed from your profile.
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button className="w-full" asChild>
            <Link href={`/pricing?next=${encodeURIComponent(nextPath)}`} onClick={() => onOpenChange(false)}>
              Upgrade to Pro
            </Link>
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={() => onOpenChange(false)}>
            Maybe later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
