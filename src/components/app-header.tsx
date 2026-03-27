"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";

const hidePaths = ["/onboarding", "/onboarding/complete"];

export function AppHeader() {
  const pathname = usePathname();
  if (hidePaths.some((p) => pathname.startsWith(p))) return null;

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4 md:mx-auto md:max-w-4xl">
        <Logo size="sm" tone="auto" collapseWordmarkOnMobile />
        <nav className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
          <Link href="/dashboard" className="transition hover:text-foreground">
            Today
          </Link>
          <Link href="/reader" className="transition hover:text-foreground">
            Read
          </Link>
          <Link href="/analytics" className="transition hover:text-foreground">
            Progress
          </Link>
        </nav>
      </div>
    </header>
  );
}
