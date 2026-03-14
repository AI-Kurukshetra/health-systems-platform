import { Sparkles } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { listProviderPatients } from "@/modules/patients/server";
import { listProviderMedicalRecords } from "@/modules/records/server";

import { ClinicalNotesForm } from "./clinical-notes-form";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function DoctorRecordsPage() {
  const [patients, records] = await Promise.all([listProviderPatients(), listProviderMedicalRecords()]);

  return (
    <div className="space-y-6">
      <section className="app-surface px-6 py-6">
        <p className="section-kicker">Documentation</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">Structured records and AI notes</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Capture quick clinical notes, then keep structured patient record outputs in a cleaner review surface.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>AI Clinical Notes</CardTitle>
            <CardDescription>Write a quick note and save AI-structured JSON into the patient&apos;s medical record.</CardDescription>
          </CardHeader>
          <CardContent>
            <ClinicalNotesForm patients={patients} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medical Records</CardTitle>
            <CardDescription>Structured notes generated for patients in your roster.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {records.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="No medical records saved yet"
                description="Generated notes will appear here as soon as they are created."
              />
            ) : (
              records.map((record) => (
                <div key={record.id} className="rounded-3xl border border-border bg-white p-5 shadow-[0_12px_24px_-22px_rgba(15,23,42,0.3)]">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-base font-semibold text-foreground">{record.patientName}</p>
                      <p className="text-sm leading-6 text-muted">{record.notes}</p>
                    </div>
                    <p className="text-xs text-muted">{formatDateTime(record.createdAt)}</p>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm leading-6 text-muted">
                    <p>
                      <span className="font-medium text-foreground">Condition:</span> {record.structuredData.condition}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Duration:</span> {record.structuredData.duration}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Severity:</span> {record.structuredData.severity}
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
