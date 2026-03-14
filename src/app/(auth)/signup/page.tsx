"use client";

import { HeartPulse, Loader2, UserRoundPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { APP_ROLES, type AppRole } from "@/lib/roles";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AppRole>("patient");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role },
        },
      });

      setStatus(error ? error.message : "Account created. Please verify your email.");
    } catch (error) {
      if (error instanceof TypeError) {
        setStatus("Network error: cannot reach Supabase. Check NEXT_PUBLIC_SUPABASE_URL and internet connectivity.");
      } else if (error instanceof Error) {
        setStatus(error.message);
      } else {
        setStatus("Unexpected error while creating account.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[440px_minmax(0,1fr)]">
        <Card className="w-full">
          <CardHeader>
            <span className="section-kicker">Create access</span>
            <CardTitle>Create account</CardTitle>
            <CardDescription>Create a new role-based account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full-name">Full name</Label>
                <Input id="full-name" placeholder="Jane Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input id="signup-email" type="email" placeholder="you@clinic.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select id="role" value={role} onChange={(e) => setRole(e.target.value as AppRole)}>
                  {APP_ROLES.map((availableRole) => (
                    <option key={availableRole} value={availableRole}>
                      {availableRole}
                    </option>
                  ))}
                </Select>
              </div>
              {status ? <Alert variant={status.includes("created") ? "success" : "warning"}>{status}</Alert> : null}
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                {loading ? "Creating account..." : "Create account"}
              </Button>
              <p className="text-center text-sm text-muted">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-primary transition hover:text-primary-strong">
                  Login
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>

        <section className="app-surface grid-pattern hidden overflow-hidden px-8 py-10 lg:block">
          <div className="max-w-xl space-y-5">
            <span className="eyebrow-chip">Healthcare onboarding</span>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground">Bring each role into a cleaner care platform.</h1>
            <p className="text-base leading-7 text-muted">
              Onboard patients, providers, and administrators into the same design system with clearer forms and stronger feedback states.
            </p>
            <div className="grid gap-4 pt-4 md:grid-cols-2">
              <div className="app-muted-surface px-4 py-4">
                <UserRoundPlus className="h-5 w-5 text-primary" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold text-foreground">Role-ready accounts</p>
                <p className="mt-1 text-sm leading-6 text-muted">Create patient, provider, or admin access with the same flow.</p>
              </div>
              <div className="app-muted-surface px-4 py-4">
                <HeartPulse className="h-5 w-5 text-accent" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold text-foreground">Better first-run UX</p>
                <p className="mt-1 text-sm leading-6 text-muted">Soft backgrounds, accessible states, and more trustworthy visual rhythm.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
