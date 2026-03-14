"use client";

import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

interface AuthenticatedUserNavProps {
  email: string;
  roleLabel: string;
}

export function AuthenticatedUserNav({ email, roleLabel }: AuthenticatedUserNavProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-3 rounded-3xl border border-border bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(237,250,250,0.82),rgba(255,252,238,0.74))] px-4 py-3 text-left shadow-[0_16px_32px_-26px_rgba(17,72,75,0.16)] backdrop-blur sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{email}</p>
        <p className="text-xs uppercase tracking-[0.2em] text-primary">{roleLabel}</p>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={handleLogout} disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LogOut className="h-4 w-4" aria-hidden="true" />}
        {loading ? "Logging out..." : "Logout"}
      </Button>
    </div>
  );
}
