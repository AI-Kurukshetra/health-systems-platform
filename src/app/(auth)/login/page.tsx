"use client";

import { Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { extractRole, getDashboardPathByRole } from "@/lib/roles";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      const role = extractRole(data.user);
      if (!role) {
        setError("Role is missing on this account. Contact support.");
        return;
      }

      router.push(getDashboardPathByRole(role));
      router.refresh();
    } catch (error) {
      if (error instanceof TypeError) {
        setError("Network error: cannot reach Supabase. Check NEXT_PUBLIC_SUPABASE_URL and internet connectivity.");
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Unexpected error while signing in.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[minmax(0,1.1fr)_440px]">
        <section className="app-surface grid-pattern hidden overflow-hidden px-8 py-10 lg:block">
          <div className="max-w-xl space-y-5">
            <span className="eyebrow-chip">Secure access</span>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground">Sign in to your healthcare workspace.</h1>
            <p className="text-base leading-7 text-muted">
              Access a calmer, modern interface for appointments, patient records, messaging, and operational visibility.
            </p>
            <div className="grid gap-4 pt-4 md:grid-cols-2">
              <div className="app-muted-surface px-4 py-4">
                <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold text-foreground">Protected access</p>
                <p className="mt-1 text-sm leading-6 text-muted">Role-based routing keeps clinical and patient views separated.</p>
              </div>
              <div className="app-muted-surface px-4 py-4">
                <LockKeyhole className="h-5 w-5 text-secondary" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold text-foreground">Trust-first design</p>
                <p className="mt-1 text-sm leading-6 text-muted">Sharper hierarchy, softer surfaces, and accessible interactions.</p>
              </div>
            </div>
          </div>
        </section>

        <Card className="w-full">
          <CardHeader>
            <span className="section-kicker">Welcome back</span>
            <CardTitle>Login</CardTitle>
            <CardDescription>Sign in with your organization account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@clinic.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error ? <Alert variant="error">{error}</Alert> : null}
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                {loading ? "Signing in..." : "Sign in"}
              </Button>
              <p className="text-center text-sm text-muted">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-medium text-primary transition hover:text-primary-strong">
                  Sign up
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
