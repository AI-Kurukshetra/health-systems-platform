import { Building2, ShieldPlus, Users } from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="app-surface px-6 py-6">
        <p className="section-kicker">System overview</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">Admin operations dashboard</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Track the scale of your healthcare network with clearer visual hierarchy and softer operational surfaces.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Organizations" value="24" description="Healthcare groups onboarded" icon={Building2} />
        <StatCard title="Providers" value="116" description="Verified clinical staff accounts" icon={ShieldPlus} tone="accent" />
        <StatCard title="Patients" value="8,420" description="Patients currently managed" icon={Users} tone="secondary" />
      </div>
    </div>
  );
}
