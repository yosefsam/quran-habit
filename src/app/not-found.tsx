import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="text-center max-w-sm">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground mb-6">
          <BookOpen className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground mt-2">This page doesn&apos;t exist or was moved. Head back to your dashboard.</p>
        <Button asChild className="mt-8"><Link href="/dashboard">Go to dashboard</Link></Button>
        <p className="mt-4"><Link href="/" className="text-sm text-muted-foreground hover:text-foreground">Or return home</Link></p>
      </div>
    </div>
  );
}
