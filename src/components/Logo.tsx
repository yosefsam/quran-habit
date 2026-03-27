"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

/** Official Hidayah mark — `/public/logo/hidayah-logo.png` (1024×682, dark-background artwork). */
export const LOGO_SRC = "/logo/hidayah-logo.png";
const NATURAL_W = 1024;
const NATURAL_H = 682;

export type LogoSize = "sm" | "md" | "lg";

const heightClass: Record<LogoSize, string> = {
  sm: "h-7",
  md: "h-9",
  lg: "h-11",
};

const iconBoxClass: Record<LogoSize, string> = {
  sm: "h-7 w-7",
  md: "h-9 w-9",
  lg: "h-11 w-11",
};

export type LogoTone = "onDark" | "onLight" | "auto";

function useLogoTone(tone: LogoTone): "onDark" | "onLight" {
  const storeTheme = useAppStore((s) => s.theme);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (tone !== "auto") return;
    const sync = () => setIsDark(document.documentElement.classList.contains("dark"));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onMq = () => sync();
    mq.addEventListener("change", onMq);
    return () => {
      obs.disconnect();
      mq.removeEventListener("change", onMq);
    };
  }, [tone, storeTheme]);

  if (tone === "onDark") return "onDark";
  if (tone === "onLight") return "onLight";
  return isDark ? "onDark" : "onLight";
}

export type LogoProps = {
  className?: string;
  size?: LogoSize;
  /** Full horizontal logo vs icon-only (left crop: crescent + book). */
  withWordmark?: boolean;
  /** Show icon-only on small screens; full logo from `sm` and up (navbar). */
  collapseWordmarkOnMobile?: boolean;
  href?: string | null;
  tone?: LogoTone;
  priority?: boolean;
};

/**
 * Hidayah brand logo — approved PNG; `w-auto` preserves aspect ratio (no stretching).
 * On light UI, optional dark chip keeps white wordmark readable.
 */
export function Logo({
  className,
  size = "md",
  withWordmark = true,
  collapseWordmarkOnMobile = false,
  href = "/",
  tone = "onDark",
  priority = false,
}: LogoProps) {
  const resolved = useLogoTone(tone);
  const needsChip = resolved === "onLight";

  const imgFull = (
    <Image
      src={LOGO_SRC}
      alt="Hidayah"
      width={NATURAL_W}
      height={NATURAL_H}
      priority={priority}
      className={cn(
        heightClass[size],
        "w-auto max-w-[10.5rem] object-contain object-left sm:max-w-[14rem]",
        className
      )}
      sizes="(max-width: 640px) 180px, 240px"
    />
  );

  const imgIcon = (
    <div className={cn("relative shrink-0 overflow-hidden rounded-lg", iconBoxClass[size], className)} aria-hidden>
      <Image
        src={LOGO_SRC}
        alt=""
        fill
        priority={priority}
        className="object-cover object-left"
        sizes="44px"
      />
    </div>
  );

  let content: ReactNode;
  if (collapseWordmarkOnMobile && withWordmark) {
    content = (
      <>
        <span className="hidden sm:inline-flex">{imgFull}</span>
        <span className="sm:hidden">{imgIcon}</span>
      </>
    );
  } else {
    content = withWordmark ? imgFull : imgIcon;
  }

  const inner = (
    <span className="inline-flex items-center">
      {needsChip ? (
        <span className="inline-flex items-center rounded-lg bg-zinc-950 px-2 py-1 ring-1 ring-black/5 dark:bg-transparent dark:p-0 dark:ring-0">
          {content}
        </span>
      ) : (
        content
      )}
    </span>
  );

  if (href === null) {
    return inner;
  }

  return (
    <Link
      href={href}
      className="outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
    >
      {inner}
    </Link>
  );
}
