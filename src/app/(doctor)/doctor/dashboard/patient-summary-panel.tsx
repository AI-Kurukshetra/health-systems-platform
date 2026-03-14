"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { Patient } from "@/modules/patients/types";

interface PatientSummaryPanelProps {
  patients: Patient[];
}

interface PatientSummaryResponse {
  patientProfileId: string;
  patientName: string;
  summary: string;
  keyRisks: string[];
  suggestedNextActions: string[];
  sourceCounts: {
    medicalRecords: number;
    symptoms: number;
    appointments: number;
  };
}

export function PatientSummaryPanel({ patients }: PatientSummaryPanelProps) {
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PatientSummaryResponse | null>(null);

  async function handleGenerate() {
    if (!selectedPatientId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/patient-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ patientProfileId: selectedPatientId }),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } & PatientSummaryResponse;

      if (!response.ok) {
        setError(payload?.error ?? "Unable to generate patient summary.");
        return;
      }

      setResult(payload);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unexpected error while generating summary.");
    } finally {
      setLoading(false);
    }
  }

  if (patients.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="No patients available"
        description="Create a patient profile before generating AI patient summaries."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="patient-summary-select">Patient</Label>
        <Select id="patient-summary-select" value={selectedPatientId} onChange={(event) => setSelectedPatientId(event.target.value)}>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.fullName}
            </option>
          ))}
        </Select>
      </div>
      <p className="text-xs leading-5 text-muted">
        The summary uses available medical records and attempts to include symptoms and appointments when the patient profile
        email matches a patient account.
      </p>
      <Button type="button" onClick={handleGenerate} disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
        {loading ? "Generating summary..." : "Generate AI Summary"}
      </Button>
      {error ? <Alert variant="error">{error}</Alert> : null}
      {result ? (
        <div className="rounded-[28px] border border-primary/15 bg-[linear-gradient(135deg,rgba(36,193,191,0.1),rgba(255,255,255,0.72),rgba(255,198,58,0.08))] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">{result.patientName}</p>
              <p className="text-xs text-muted">
                Sources: {result.sourceCounts.medicalRecords} records, {result.sourceCounts.symptoms} symptoms,{" "}
                {result.sourceCounts.appointments} appointments
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-4 text-sm text-muted">
            <div>
              <p className="font-medium text-foreground">Summary</p>
              <p className="mt-1 leading-6">{result.summary}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Key Risks</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 leading-6">
                {result.keyRisks.length === 0 ? (
                  <li>No major risks identified from the available data.</li>
                ) : (
                  result.keyRisks.map((risk) => <li key={risk}>{risk}</li>)
                )}
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground">Suggested Next Actions</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 leading-6">
                {result.suggestedNextActions.length === 0 ? (
                  <li>No specific next actions identified from the available data.</li>
                ) : (
                  result.suggestedNextActions.map((action) => <li key={action}>{action}</li>)
                )}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
