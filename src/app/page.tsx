import { ArrowRight, Brain, CalendarRange, LayoutDashboard, ShieldCheck, Stethoscope, UserRound } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getCurrentAuthState } from "@/lib/auth";

const features = [
  {
    title: "AI symptom triage",
    description: "Capture symptom details and turn them into clearer triage guidance with AI-assisted diagnosis flows.",
    icon: Brain,
  },
  {
    title: "Doctor workspaces",
    description: "Give care teams cleaner dashboards for appointments, patient review, and AI-generated clinical notes.",
    icon: LayoutDashboard,
  },
  {
    title: "Patient records",
    description: "Keep patient profiles, medical notes, and follow-up details organized in one healthcare platform.",
    icon: Stethoscope,
  },
  {
    title: "Appointment operations",
    description: "Manage scheduling, status updates, and visit visibility across patient and doctor experiences.",
    icon: CalendarRange,
  },
];

const steps = [
  {
    title: "Sign in securely",
    description: "Supabase authentication keeps access role-aware and directs each user to the correct workspace automatically.",
  },
  {
    title: "Work from one system",
    description: "Doctors, patients, and administrators get tailored experiences without manually switching between internal portals.",
  },
  {
    title: "Move care faster",
    description: "Use AI features, scheduling, chat, and records from one calm interface built for healthcare operations.",
  },
];

export default async function HomePage() {
  const auth = await getCurrentAuthState();

  if (auth.dashboardPath) {
    redirect(auth.dashboardPath);
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex items-center justify-between rounded-full border border-border/80 bg-white/88 px-4 py-3 shadow-[0_12px_30px_-24px_rgba(17,72,75,0.14)] backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--secondary),var(--primary),var(--accent))] text-white shadow-[0_16px_28px_-20px_rgba(20,131,136,0.28)]">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">AI Healthcare Infrastructure Platform</p>
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Healthcare SaaS</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              Login
            </Link>
            <Link href="/signup" className={buttonVariants({ size: "sm" })}>
              Sign Up
            </Link>
          </div>
        </header>

        <section className="app-surface grid-pattern overflow-hidden bg-[linear-gradient(135deg,rgba(36,193,191,0.12),rgba(255,255,255,0.96),rgba(232,249,249,0.9))] px-6 py-10 md:px-10 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_380px] lg:items-center">
            <div className="space-y-5">
              <span className="eyebrow-chip">Modern AI healthcare operations</span>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
                  AI Healthcare Infrastructure Platform
                </h1>
                <p className="max-w-2xl text-base leading-7 text-muted md:text-lg">
                  A role-based healthcare platform for patient care, doctor operations, AI-assisted diagnosis, clinical notes,
                  secure messaging, and appointment workflows.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/login" className={buttonVariants({ size: "lg" })}>
                  Login
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="/signup" className={buttonVariants({ size: "lg", variant: "outline" })}>
                  Sign Up
                </Link>
              </div>
            </div>

            <Card className="bg-[linear-gradient(135deg,rgba(36,193,191,0.14),rgba(255,255,255,0.72),rgba(255,198,58,0.08))]">
              <CardHeader>
                <CardTitle>Built like a real SaaS platform</CardTitle>
                <CardDescription>
                  Public marketing experience for guests, then automatic routing into the correct healthcare workspace after login.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-3xl border border-border/70 bg-white/80 p-4">
                  <p className="text-sm font-medium text-foreground">For doctors</p>
                  <p className="mt-1 text-sm leading-6 text-muted">Patient dashboards, appointment review, and AI documentation tools.</p>
                </div>
                <div className="rounded-3xl border border-border/70 bg-white/80 p-4">
                  <p className="text-sm font-medium text-foreground">For patients</p>
                  <p className="mt-1 text-sm leading-6 text-muted">Appointments, symptom submissions, and secure communication with providers.</p>
                </div>
                <div className="rounded-3xl border border-border/70 bg-white/80 p-4">
                  <p className="text-sm font-medium text-foreground">For admins</p>
                  <p className="mt-1 text-sm leading-6 text-muted">Organization oversight, provider operations, and platform visibility.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-4">
          <div className="space-y-2">
            <p className="section-kicker">Features</p>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">Core workflows for modern healthcare teams</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <Card key={feature.title} className="h-full">
                  <CardHeader>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(36,193,191,0.16),rgba(255,198,58,0.18))] text-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <CardTitle className="pt-2">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px]">
          <Card>
            <CardHeader>
              <p className="section-kicker">How it works</p>
              <CardTitle>One authentication flow, role-aware routing, cleaner care operations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.title} className="flex gap-4 rounded-3xl border border-border/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.82),rgba(237,250,250,0.78),rgba(255,252,238,0.68))] p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--secondary),var(--primary))] text-sm font-semibold text-white">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{step.title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted">{step.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ready to get started?</CardTitle>
              <CardDescription>Authenticate once and the platform routes you directly into the correct workspace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/login" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
                Login
              </Link>
              <Link href="/signup" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "w-full")}>
                Sign Up
              </Link>
              <div className="rounded-3xl border border-border/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.8),rgba(237,250,250,0.76),rgba(255,252,238,0.68))] p-4">
                <div className="flex items-start gap-3">
                  <UserRound className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
                  <p className="text-sm leading-6 text-muted">
                    Users no longer pick internal portals manually. Access is determined automatically from their authenticated role.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
