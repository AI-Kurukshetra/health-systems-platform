import Link from "next/link";
import { PlusCircle, UserRound, Users } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatCard } from "@/components/ui/stat-card";
import { Textarea } from "@/components/ui/textarea";
import { listProviderPatients } from "@/modules/patients/server";

import { createPatientAction, updatePatientAction } from "./actions";

type SearchParams = Promise<{
  patientId?: string | string[];
  status?: string | string[];
}>;

function readSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Not provided";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
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
    case "created":
      return "Patient profile created.";
    case "updated":
      return "Patient profile updated.";
    case "invalid":
      return "Please review the form fields and try again.";
    case "create-error":
      return "Unable to create the patient profile.";
    case "update-error":
      return "Unable to update the patient profile.";
    default:
      return null;
  }
}

export default async function DoctorPatientsPage({ searchParams }: { searchParams?: SearchParams }) {
  const params = searchParams ? await searchParams : undefined;
  const patients = await listProviderPatients();
  const selectedPatientId = readSearchParam(params?.patientId) ?? patients[0]?.id;
  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId) ?? patients[0] ?? null;
  const statusMessage = renderStatus(readSearchParam(params?.status));

  return (
    <div className="space-y-6">
      <section className="app-surface grid gap-4 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_280px_280px]">
        <div className="space-y-3">
          <p className="section-kicker">Patient directory</p>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">Create, review, and update patient profiles</h2>
          <p className="max-w-2xl text-sm leading-6 text-muted">
            The refreshed directory keeps intake, profile review, and editing in a cleaner clinical management flow.
          </p>
        </div>
        <StatCard title="Total Patients" value={patients.length} description="Profiles assigned to you" icon={Users} />
        <StatCard
          title="Last Updated"
          value={patients[0] ? formatDateTime(patients[0].updatedAt) : "No profiles yet"}
          description="Most recent profile activity"
          icon={UserRound}
          tone="accent"
        />
      </section>

      {statusMessage ? <Alert variant={statusMessage.includes("created") || statusMessage.includes("updated") ? "success" : "warning"}>{statusMessage}</Alert> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_380px]">
        <Card>
          <CardHeader>
            <CardTitle>Patient Directory</CardTitle>
            <CardDescription>Browse every patient profile assigned to you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {patients.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No patients yet"
                description="Use the create form to add your first patient profile."
              />
            ) : (
              patients.map((patient) => {
                const isActive = patient.id === selectedPatient?.id;

                return (
                  <Link
                    key={patient.id}
                    href={`/doctor/patients?patientId=${patient.id}`}
                    className={`block rounded-3xl border p-5 transition ${
                      isActive
                        ? "border-primary/30 bg-[linear-gradient(135deg,rgba(42,110,242,0.08),rgba(6,182,212,0.06))]"
                        : "border-border bg-white hover:border-primary/20 hover:bg-slate-50/70"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{patient.fullName}</p>
                        <p className="text-sm text-muted">{patient.email ?? "No email on file"}</p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          isActive ? "bg-white text-primary" : "bg-slate-100 text-muted"
                        }`}
                      >
                        {patient.gender ?? "Profile"}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-1 text-sm leading-6 text-muted">
                      <p>DOB: {formatDate(patient.dateOfBirth)}</p>
                      <p>Phone: {patient.phone ?? "Not provided"}</p>
                      <p>Updated: {formatDateTime(patient.updatedAt)}</p>
                    </div>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create Patient</CardTitle>
            <CardDescription>Add a new patient profile to your roster.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createPatientAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-full-name">Full Name</Label>
                <Input id="create-full-name" name="fullName" placeholder="Jane Doe" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-email">Email</Label>
                <Input id="create-email" name="email" type="email" placeholder="jane@example.com" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="create-phone">Phone</Label>
                  <Input id="create-phone" name="phone" placeholder="+1 555 123 4567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-dob">Date of Birth</Label>
                  <Input id="create-dob" name="dateOfBirth" type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-gender">Gender</Label>
                <Input id="create-gender" name="gender" placeholder="Female" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-address">Address</Label>
                <Textarea id="create-address" name="address" rows={3} placeholder="123 Main Street, Springfield" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="create-emergency-name">Emergency Contact</Label>
                  <Input id="create-emergency-name" name="emergencyContactName" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-emergency-phone">Emergency Phone</Label>
                  <Input id="create-emergency-phone" name="emergencyContactPhone" placeholder="+1 555 999 0000" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-medical-notes">Medical Notes</Label>
                <Textarea
                  id="create-medical-notes"
                  name="medicalNotes"
                  rows={4}
                  placeholder="Allergies, chronic conditions, or intake notes."
                />
              </div>
              <Button type="submit" className="w-full">
                <PlusCircle className="h-4 w-4" aria-hidden="true" />
                Create Patient Profile
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Patient Profile</CardTitle>
            <CardDescription>Review the selected patient record.</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedPatient ? (
              <div className="space-y-5">
                <div>
                  <p className="text-2xl font-semibold text-foreground">{selectedPatient.fullName}</p>
                  <p className="mt-1 text-sm text-muted">{selectedPatient.email ?? "No email provided"}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-border bg-slate-50/70 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-muted">Date of Birth</p>
                    <p className="mt-2 text-sm font-medium text-foreground">{formatDate(selectedPatient.dateOfBirth)}</p>
                  </div>
                  <div className="rounded-3xl border border-border bg-slate-50/70 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-muted">Phone</p>
                    <p className="mt-2 text-sm font-medium text-foreground">{selectedPatient.phone ?? "Not provided"}</p>
                  </div>
                  <div className="rounded-3xl border border-border bg-slate-50/70 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-muted">Gender</p>
                    <p className="mt-2 text-sm font-medium text-foreground">{selectedPatient.gender ?? "Not provided"}</p>
                  </div>
                  <div className="rounded-3xl border border-border bg-slate-50/70 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-muted">Emergency Contact</p>
                    <p className="mt-2 text-sm font-medium text-foreground">
                      {selectedPatient.emergencyContactName ?? "Not provided"}
                    </p>
                    <p className="mt-1 text-sm text-muted">{selectedPatient.emergencyContactPhone ?? "No phone listed"}</p>
                  </div>
                </div>
                <div className="rounded-3xl border border-border bg-slate-50/70 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted">Address</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">{selectedPatient.address ?? "Not provided"}</p>
                </div>
                <div className="rounded-3xl border border-border bg-slate-50/70 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted">Medical Notes</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">
                    {selectedPatient.medicalNotes ?? "No medical notes available."}
                  </p>
                </div>
                <p className="text-xs text-muted">Created {formatDateTime(selectedPatient.createdAt)}</p>
              </div>
            ) : (
              <EmptyState
                icon={UserRound}
                title="No patient selected"
                description="Select a patient from the directory to view the full profile."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update Patient</CardTitle>
            <CardDescription>Edit demographic and clinical intake details.</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedPatient ? (
              <form action={updatePatientAction} className="space-y-4">
                <input type="hidden" name="patientId" value={selectedPatient.id} />
                <div className="space-y-2">
                  <Label htmlFor="edit-full-name">Full Name</Label>
                  <Input id="edit-full-name" name="fullName" defaultValue={selectedPatient.fullName} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input id="edit-email" name="email" type="email" defaultValue={selectedPatient.email ?? ""} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Phone</Label>
                    <Input id="edit-phone" name="phone" defaultValue={selectedPatient.phone ?? ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-dob">Date of Birth</Label>
                    <Input id="edit-dob" name="dateOfBirth" type="date" defaultValue={selectedPatient.dateOfBirth ?? ""} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-gender">Gender</Label>
                  <Input id="edit-gender" name="gender" defaultValue={selectedPatient.gender ?? ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-address">Address</Label>
                  <Textarea id="edit-address" name="address" rows={3} defaultValue={selectedPatient.address ?? ""} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-emergency-name">Emergency Contact</Label>
                    <Input
                      id="edit-emergency-name"
                      name="emergencyContactName"
                      defaultValue={selectedPatient.emergencyContactName ?? ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-emergency-phone">Emergency Phone</Label>
                    <Input
                      id="edit-emergency-phone"
                      name="emergencyContactPhone"
                      defaultValue={selectedPatient.emergencyContactPhone ?? ""}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-medical-notes">Medical Notes</Label>
                  <Textarea id="edit-medical-notes" name="medicalNotes" rows={4} defaultValue={selectedPatient.medicalNotes ?? ""} />
                </div>
                <Button type="submit" className="w-full">
                  Save Changes
                </Button>
              </form>
            ) : (
              <EmptyState
                icon={PlusCircle}
                title="Nothing to edit yet"
                description="Create or select a patient to edit the profile."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
