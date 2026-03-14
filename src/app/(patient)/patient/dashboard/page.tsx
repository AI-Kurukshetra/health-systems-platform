import { CalendarDays, MessageCircleMore } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";

export default function PatientDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="app-surface grid gap-6 px-6 py-6 md:grid-cols-[minmax(0,1.2fr)_320px]">
        <div className="space-y-3">
          <p className="section-kicker">Care overview</p>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">Your health dashboard</h2>
          <p className="max-w-2xl text-sm leading-6 text-muted">
            Review upcoming appointments, recent communications, and the tools available for your care journey.
          </p>
        </div>
        <Card className="bg-[linear-gradient(135deg,rgba(36,193,191,0.14),rgba(255,255,255,0.72),rgba(255,198,58,0.08))]">
          <CardHeader>
            <CardTitle>Care readiness</CardTitle>
            <CardDescription>Keep appointments and messages organized in one place.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted">
            Your dashboard is designed to reduce friction during follow-up care and routine communication.
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <StatCard title="Upcoming Appointments" value={2} description="Visits currently scheduled" icon={CalendarDays} tone="primary" />
        <StatCard title="Unread Messages" value={3} description="New secure messages from care teams" icon={MessageCircleMore} tone="accent" />
      </div>
    </div>
  );
}
