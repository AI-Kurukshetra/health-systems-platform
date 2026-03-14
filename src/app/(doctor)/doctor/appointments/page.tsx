import { CalendarRange, CheckCircle2, Clock3 } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
import { StatCard } from "@/components/ui/stat-card";
import { APPOINTMENT_STATUSES, listDoctorAppointments } from "@/modules/appointments/server";

import { updateAppointmentStatusAction } from "./actions";

type SearchParams = Promise<{
  appointmentId?: string | string[];
  status?: string | string[];
}>;

function readSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function renderStatus(status?: string) {
  switch (status) {
    case "updated":
      return "Appointment status updated.";
    case "invalid":
      return "Please choose a valid appointment status.";
    case "update-error":
      return "Unable to update that appointment right now.";
    default:
      return null;
  }
}

function getStatusClasses(status: string) {
  if (status === "completed") return "bg-secondary/10 text-secondary";
  if (status === "cancelled") return "bg-rose-100 text-rose-700";
  return "bg-primary/10 text-primary";
}

export default async function DoctorAppointmentsPage({ searchParams }: { searchParams?: SearchParams }) {
  const params = searchParams ? await searchParams : undefined;
  const appointments = await listDoctorAppointments();
  const selectedAppointmentId = readSearchParam(params?.appointmentId) ?? appointments[0]?.id;
  const statusMessage = renderStatus(readSearchParam(params?.status));

  return (
    <div className="space-y-6">
      <section className="app-surface grid gap-4 px-6 py-6 lg:grid-cols-3">
        <StatCard title="Total" value={appointments.length} description="All booked visits" icon={CalendarRange} />
        <StatCard
          title="Scheduled"
          value={appointments.filter((item) => item.status === "scheduled").length}
          description="Upcoming patient sessions"
          icon={Clock3}
          tone="accent"
        />
        <StatCard
          title="Completed"
          value={appointments.filter((item) => item.status === "completed").length}
          description="Visits already closed"
          icon={CheckCircle2}
          tone="secondary"
        />
      </section>

      {statusMessage ? <Alert variant={statusMessage.includes("updated") ? "success" : "warning"}>{statusMessage}</Alert> : null}

      <Card>
        <CardHeader>
          <CardTitle>Appointments</CardTitle>
          <CardDescription>Review patient bookings and update their current status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {appointments.length === 0 ? (
            <EmptyState
              icon={CalendarRange}
              title="No appointments yet"
              description="Patient bookings will appear here as soon as they are scheduled with you."
            />
          ) : (
            appointments.map((appointment) => {
              const isSelected = appointment.id === selectedAppointmentId;

              return (
                <div
                  key={appointment.id}
                  className={`rounded-3xl border p-5 transition ${
                    isSelected
                      ? "border-primary/30 bg-[linear-gradient(135deg,rgba(42,110,242,0.08),rgba(6,182,212,0.06))]"
                      : "border-border bg-white"
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <p className="text-base font-semibold text-foreground">{appointment.patientName}</p>
                      <p className="text-sm text-muted">{appointment.patientEmail ?? "Patient account"}</p>
                      <p className="text-sm text-muted">Scheduled: {formatDateTime(appointment.scheduledAt)}</p>
                      <p className="text-sm text-muted">Reason: {appointment.reason ?? "No reason provided."}</p>
                    </div>
                    <div className="flex min-w-[230px] flex-col items-start gap-3">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(appointment.status)}`}>
                        {appointment.status}
                      </span>
                      <form action={updateAppointmentStatusAction} className="flex w-full flex-col gap-2">
                        <input type="hidden" name="appointmentId" value={appointment.id} />
                        <Select name="status" defaultValue={appointment.status}>
                          {APPOINTMENT_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </Select>
                        <Button type="submit" variant="outline">
                          Update Status
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
