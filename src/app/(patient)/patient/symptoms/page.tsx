import { Activity } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { listPatientSymptomEntries } from "@/modules/symptoms/server";

import { SymptomDiagnosisForm } from "./symptom-diagnosis-form";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function PatientSymptomsPage() {
  const symptoms = await listPatientSymptomEntries();

  return (
    <div className="space-y-6">
      <section className="app-surface px-6 py-6">
        <p className="section-kicker">Symptom triage</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">Capture symptoms in a clearer flow</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Submit symptom details, review AI triage guidance, and revisit prior submissions in a calmer patient workspace.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>AI Symptom Diagnosis</CardTitle>
            <CardDescription>
              Submit symptoms and receive AI-generated possible conditions, urgency, and specialist guidance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SymptomDiagnosisForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Symptom Submissions</CardTitle>
            <CardDescription>Your previously saved symptom entries and AI diagnosis responses.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {symptoms.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="No symptom submissions yet"
                description="Your recent symptom check-ins will appear here after you send your first one."
              />
            ) : (
              symptoms.map((entry) => (
                <div key={entry.id} className="rounded-3xl border border-border bg-white p-5 shadow-[0_12px_24px_-22px_rgba(15,23,42,0.3)]">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-base font-semibold text-foreground">{entry.symptoms}</p>
                      <p className="text-sm text-muted">
                        Age {entry.age}, {entry.gender}
                      </p>
                    </div>
                    <p className="text-xs text-muted">{formatDateTime(entry.createdAt)}</p>
                  </div>
                  {entry.aiDiagnosis ? (
                    <div className="mt-4 grid gap-2 text-sm leading-6 text-muted">
                      <p>
                        <span className="font-medium text-foreground">Possible conditions:</span>{" "}
                        {entry.aiDiagnosis.possibleConditions.join(", ")}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">Urgency level:</span> {entry.aiDiagnosis.urgencyLevel}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">Recommended specialist:</span>{" "}
                        {entry.aiDiagnosis.recommendedSpecialist}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-muted">
                      No AI diagnosis saved for this submission.
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
