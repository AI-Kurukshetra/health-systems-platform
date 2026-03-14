import { CalendarClock, FileText, Users } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { listDoctorAppointments } from "@/modules/appointments/server";
import { listProviderPatients } from "@/modules/patients/server";
import { listProviderMedicalRecords } from "@/modules/records/server";

import { PatientSummaryPanel } from "./patient-summary-panel";

function isSameUtcDate(left: Date, right: Date) {
  return (
    left.getUTCFullYear() === right.getUTCFullYear() &&
    left.getUTCMonth() === right.getUTCMonth() &&
    left.getUTCDate() === right.getUTCDate()
  );
}

export default async function DoctorDashboardPage() {
  const [appointments, patients, medicalRecords] = await Promise.all([
    listDoctorAppointments(),
    listProviderPatients(),
    listProviderMedicalRecords(),
  ]);
  const today = new Date();
  const todayAppointments = appointments.filter((appointment) => isSameUtcDate(new Date(appointment.scheduledAt), today));

  return (
    <div className="space-y-6">
      <section className="app-surface grid gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1.2fr)_360px]">
        <div className="space-y-3">
          <p className="section-kicker">Clinical overview</p>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">Today&apos;s care workload</h2>
          <p className="max-w-2xl text-sm leading-6 text-muted">
            Keep patient context, appointments, and AI summaries visible in a cleaner doctor workflow.
          </p>
        </div>
        <Card className="bg-[linear-gradient(135deg,rgba(20,131,136,0.12),rgba(255,255,255,0.74),rgba(255,198,58,0.08))]">
          <CardHeader>
            <CardTitle>Shift snapshot</CardTitle>
            <CardDescription>Focus on schedule, patient volume, and documentation throughput.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted">
            The refreshed dashboard highlights the metrics you need first, then keeps AI tools and records nearby.
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Today Appointments" value={todayAppointments.length} description="Visits on today&apos;s schedule" icon={CalendarClock} />
        <StatCard title="Patient Profiles" value={patients.length} description="Active patients in your roster" icon={Users} tone="accent" />
        <StatCard title="Medical Records" value={medicalRecords.length} description="Structured notes on file" icon={FileText} tone="secondary" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Patient Summary</CardTitle>
          <CardDescription>Generate a concise summary of patient history, key risks, and next actions from records, symptoms, and appointments.</CardDescription>
        </CardHeader>
        <CardContent>
          <PatientSummaryPanel patients={patients} />
        </CardContent>
      </Card>
    </div>
  );
}
