"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { UserSessionProvider } from "@/components/providers/user-session-provider";
import { ReadingStateSync } from "@/components/providers/reading-state-sync";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <UserSessionProvider>
        <ReadingStateSync />
        {children}
      </UserSessionProvider>
    </ThemeProvider>
  );
}
