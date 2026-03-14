"use client";

import { FileText, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Patient } from "@/modules/patients/types";
import type { ClinicalNoteStructuredData } from "@/modules/records/types";

interface ClinicalNotesFormProps {
  patients: Patient[];
}

interface ClinicalNotesResponse {
  id: string;
  patientProfileId: string;
  patientName: string;
  notes: string;
  structuredData: ClinicalNoteStructuredData;
  createdAt: string;
}

export function ClinicalNotesForm({ patients }: ClinicalNotesFormProps) {
  const router = useRouter();
  const [patientProfileId, setPatientProfileId] = useState(patients[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClinicalNotesResponse | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/clinical-notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientProfileId,
          note,
        }),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } & ClinicalNotesResponse;

      if (!response.ok) {
        setError(payload?.error ?? "Unable to generate clinical notes.");
        return;
      }

      setResult(payload);
      setNote("");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unexpected error while generating clinical notes.");
    } finally {
      setLoading(false);
    }
  }

  if (patients.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No patient profiles yet"
        description="Create a patient profile before generating AI clinical notes."
      />
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="patient-profile-id">Patient</Label>
          <Select
            id="patient-profile-id"
            value={patientProfileId}
            onChange={(event) => setPatientProfileId(event.target.value)}
            required
          >
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.fullName}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="quick-note">Quick Note</Label>
          <Textarea
            id="quick-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={5}
            placeholder="Patient complains of chest pain for 2 days"
            required
          />
        </div>
        {error ? <Alert variant="error">{error}</Alert> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <FileText className="h-4 w-4" aria-hidden="true" />}
          {loading ? "Generating structured note..." : "Generate Clinical Note"}
        </Button>
      </form>

      {result ? (
        <div className="rounded-[28px] border border-primary/15 bg-[linear-gradient(135deg,rgba(36,193,191,0.1),rgba(255,255,255,0.72),rgba(255,198,58,0.08))] p-4 text-sm text-muted">
          <p className="font-medium text-foreground">Latest Structured Note</p>
          <div className="mt-3 grid gap-2 leading-6">
            <p>
              <span className="font-medium text-foreground">Condition:</span> {result.structuredData.condition}
            </p>
            <p>
              <span className="font-medium text-foreground">Duration:</span> {result.structuredData.duration}
            </p>
            <p>
              <span className="font-medium text-foreground">Severity:</span> {result.structuredData.severity}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
