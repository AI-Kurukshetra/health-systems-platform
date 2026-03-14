import { CalendarPlus2, Clock3, Stethoscope } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { StatCard } from "@/components/ui/stat-card";
import { Textarea } from "@/components/ui/textarea";
import { listPatientAppointments, listProviderDirectory } from "@/modules/appointments/server";

import { bookAppointmentAction } from "./actions";

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
    case "booked":
      return "Appointment booked successfully.";
    case "invalid":
      return "Please review the booking details and try again.";
    case "provider-missing":
      return "The selected doctor is no longer available.";
    case "book-error":
      return "Unable to book the appointment right now.";
    default:
      return null;
  }
}

function getStatusClasses(status: string) {
  if (status === "completed") return "bg-secondary/10 text-secondary";
  if (status === "cancelled") return "bg-rose-100 text-rose-700";
  return "bg-primary/10 text-primary";
}

export default async function PatientAppointmentsPage({ searchParams }: { searchParams?: SearchParams }) {
  const params = searchParams ? await searchParams : undefined;
  const [appointments, providers] = await Promise.all([listPatientAppointments(), listProviderDirectory()]);
  const statusMessage = renderStatus(readSearchParam(params?.status));

  return (
    <div className="space-y-6">
      <section className="app-surface grid gap-6 px-6 py-6 xl:grid-cols-[minmax(0,1.15fr)_320px]">
        <div className="space-y-3">
          <p className="section-kicker">Appointment center</p>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">Schedule care with less friction</h2>
          <p className="max-w-2xl text-sm leading-6 text-muted">
            Book visits with your provider network, then keep every appointment status visible in one place.
          </p>
        </div>
        <StatCard
          title="Scheduled Appointments"
          value={appointments.filter((appointment) => appointment.status === "scheduled").length}
          description="Upcoming visits on your calendar"
          icon={Clock3}
        />
      </section>

      {statusMessage ? <Alert variant={statusMessage.includes("successfully") ? "success" : "warning"}>{statusMessage}</Alert> : null}

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Book Appointment</CardTitle>
            <CardDescription>Select a doctor, date, and reason for the visit.</CardDescription>
          </CardHeader>
          <CardContent>
            {providers.length === 0 ? (
              <EmptyState
                icon={Stethoscope}
                title="No doctors available"
                description="Create a provider account before booking your first appointment."
              />
            ) : (
              <form action={bookAppointmentAction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="provider-user-id">Doctor</Label>
                  <Select id="provider-user-id" name="providerUserId" required defaultValue="">
                    <option value="" disabled>
                      Select a doctor
                    </option>
                    {providers.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.fullName} {provider.email ? `(${provider.email})` : ""}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduled-at">Date and Time</Label>
                  <Input id="scheduled-at" name="scheduledAt" type="datetime-local" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea
                    id="reason"
                    name="reason"
                    rows={4}
                    placeholder="Describe the reason for your visit."
                  />
                </div>
                <Button type="submit" className="w-full">
                  <CalendarPlus2 className="h-4 w-4" aria-hidden="true" />
                  Book Appointment
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Appointments</CardTitle>
            <CardDescription>All appointments booked under your patient account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {appointments.length === 0 ? (
              <EmptyState
                icon={CalendarPlus2}
                title="No appointments booked yet"
                description="Your upcoming visits will appear here after you schedule them."
              />
            ) : (
              appointments.map((appointment) => (
                <div key={appointment.id} className="rounded-3xl border border-border bg-white p-5 shadow-[0_12px_24px_-22px_rgba(15,23,42,0.3)]">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-base font-semibold text-foreground">{appointment.providerName}</p>
                      <p className="text-sm text-muted">{appointment.providerEmail ?? "Doctor account"}</p>
                    </div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm leading-6 text-muted">
                    <p>
                      <span className="font-medium text-foreground">Scheduled:</span> {formatDateTime(appointment.scheduledAt)}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Reason:</span> {appointment.reason ?? "No reason provided."}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Last Updated:</span> {formatDateTime(appointment.updatedAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
