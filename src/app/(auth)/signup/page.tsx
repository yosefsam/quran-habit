"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { normalizeAuthEmail } from "@/lib/auth/email";
import { createClient, SupabaseEnvError } from "@/lib/supabase/client";
import { getAuthSiteUrl } from "@/lib/site-url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { HidayahLogo } from "@/components/brand/hidayah-logo";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    let supabase;
    try {
      supabase = createClient();
    } catch (err) {
      setError(err instanceof SupabaseEnvError ? err.message : "Could not initialize Supabase client.");
      return;
    }
    setError(null);
    setLoading(true);
    const emailNormalized = normalizeAuthEmail(email);
    if (!emailNormalized) {
      setLoading(false);
      setError("Please enter a valid email.");
      return;
    }
    const { error: signUpError } = await supabase.auth.signUp({
      email: emailNormalized,
      password,
      options: {
        emailRedirectTo: `${getAuthSiteUrl()}/auth/callback?next=/onboarding`,
      },
    });
    setLoading(false);
    if (signUpError) { setError(signUpError.message); return; }
    router.push("/onboarding");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <HidayahLogo size="md" tone="auto" />
        </div>
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Create your account</CardTitle>
            <CardDescription>Start building a consistent reading habit today</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">{error}</p>}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input id="confirmPassword" type="password" placeholder="Confirm" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" size="lg" disabled={loading}>{loading ? "Creating…" : "Create account"}</Button>
              <p className="text-sm text-muted-foreground text-center">Already have an account? <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link></p>
            </CardFooter>
          </form>
        </Card>
        <p className="text-center mt-6"><Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to home</Link></p>
      </motion.div>
    </div>
  );
}
