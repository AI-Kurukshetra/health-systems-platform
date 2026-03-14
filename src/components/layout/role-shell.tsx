"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Building2,
  CalendarDays,
  FileHeart,
  LayoutDashboard,
  MessageCircleMore,
  ShieldPlus,
  Users,
} from "lucide-react";

import { AuthenticatedUserNav } from "@/components/layout/authenticated-user-nav";
import { cn } from "@/lib/utils";

interface RoleShellProps {
  role: "Admin" | "Doctor" | "Patient";
  email: string;
  roleLabel: string;
  links: Array<{ href: string; label: string }>;
  children: React.ReactNode;
}

const roleCopy = {
  Admin: {
    eyebrow: "Operations Console",
  },
  Doctor: {
    eyebrow: "Clinical Workspace",
  },
  Patient: {
    eyebrow: "Patient Portal",
  },
} as const;

const linkIcons = {
  Dashboard: LayoutDashboard,
  Patients: Users,
  Appointments: CalendarDays,
  Records: FileHeart,
  Chat: MessageCircleMore,
  Organizations: Building2,
  Providers: ShieldPlus,
  Symptoms: Activity,
} as const;

export function RoleShell({ role, email, roleLabel, links, children }: RoleShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(236,250,250,0.92),rgba(229,247,247,0.9))] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--secondary),var(--primary),var(--accent))] text-white shadow-[0_18px_34px_-22px_rgba(20,131,136,0.38)]">
              <Activity className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <p className="section-kicker">{roleCopy[role].eyebrow}</p>
              <h1 className="text-xl font-semibold tracking-tight text-foreground">Healthcare Infrastructure | {role}</h1>
            </div>
          </div>
          <div className="lg:ml-auto">
            <AuthenticatedUserNav email={email} roleLabel={roleLabel} />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="app-surface h-fit overflow-hidden bg-[linear-gradient(180deg,rgba(36,193,191,0.12),rgba(255,255,255,0.96),rgba(236,250,250,0.92))]">
          <div className="border-b border-border px-5 py-5">
            <span className="eyebrow-chip">{role} workspace</span>
            <p className="mt-3 text-sm leading-6 text-muted">
              A calmer, consistent care interface across dashboards, forms, and operational views.
            </p>
          </div>
          <nav className="space-y-1 p-3">
            {links.map((link) => {
              const Icon = linkIcons[link.label as keyof typeof linkIcons] ?? LayoutDashboard;
              const isActive =
                pathname === link.href ||
                pathname.startsWith(`${link.href}/`) ||
                (link.href === "/chat" && pathname === "/chat");

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition",
                    isActive
                      ? "bg-[linear-gradient(135deg,rgba(36,193,191,0.18),rgba(255,198,58,0.16))] text-foreground shadow-[0_14px_30px_-24px_rgba(20,131,136,0.22)]"
                      : "text-[color:var(--foreground)]/80 hover:bg-white/80 hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl transition",
                      isActive
                        ? "bg-white text-primary shadow-sm"
                        : "bg-primary/10 text-[color:var(--secondary)] group-hover:bg-white group-hover:text-primary",
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="flex-1">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}
