import { AppNav } from "@/components/app-nav";
import { DemoBanner } from "@/components/demo-banner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 md:pb-0">
      <DemoBanner />
      <main className="flex-1">{children}</main>
      <AppNav />
    </div>
  );
}
