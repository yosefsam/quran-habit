import { AppNav } from "@/components/app-nav";
import { AppHeader } from "@/components/app-header";
import { DemoBanner } from "@/components/demo-banner";
import { MigrateReaderStore } from "@/components/migrate-reader-store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 md:pb-0">
      <MigrateReaderStore />
      <DemoBanner />
      <AppHeader />
      <main className="flex-1">{children}</main>
      <AppNav />
    </div>
  );
}
