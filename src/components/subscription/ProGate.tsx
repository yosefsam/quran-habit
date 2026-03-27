"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { requireProUser, type ProStatus } from "@/lib/subscription/requireProUser";

export function ProGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const proStatus = useAppStore((s) => s.proStatus) as ProStatus;

  useEffect(() => {
    // Drive redirect from an effect so we don't fight React render ordering.
    requireProUser({
      proStatus,
      router,
      nextPath: pathname,
    });
  }, [proStatus, pathname, router]);

  if (proStatus === "unknown") {
    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">Verifying Pro status…</CardContent>
        </Card>
      </div>
    );
  }

  if (proStatus !== "pro") {
    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <Card>
          <CardContent className="py-10 space-y-4 text-center">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span>This feature requires Pro.</span>
            </div>
            <Button asChild variant="default">
              <Link href={`/pricing?next=${encodeURIComponent(pathname)}`}>Upgrade to Pro</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

