"use client";

import { HeartPulse, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AIDiagnosis } from "@/modules/symptoms/types";

interface DiagnosisResponse {
  id: string;
  symptoms: string;
  age: number;
  gender: string;
  aiDiagnosis: AIDiagnosis;
  createdAt: string;
}

export function SymptomDiagnosisForm() {
  const router = useRouter();
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnosisResponse | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/diagnosis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptoms,
          age: age === "" ? null : Number(age),
          gender,
        }),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } & DiagnosisResponse;

      if (!response.ok) {
        setError(payload?.error ?? "Unable to generate diagnosis.");
        return;
      }

      setResult(payload);
      setSymptoms("");
      setAge("");
      setGender("");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unexpected error while calling AI diagnosis.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="symptoms">Symptoms</Label>
          <Textarea
            id="symptoms"
            value={symptoms}
            onChange={(event) => setSymptoms(event.target.value)}
            rows={5}
            placeholder="Describe your symptoms, when they started, and any relevant details."
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input id="age" type="number" min="0" max="120" value={age} onChange={(event) => setAge(event.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Input id="gender" value={gender} onChange={(event) => setGender(event.target.value)} placeholder="Female" required />
          </div>
        </div>
        {error ? <Alert variant="error">{error}</Alert> : null}
        <p className="text-xs leading-5 text-muted">AI output is informational only and should not replace professional medical care.</p>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <HeartPulse className="h-4 w-4" aria-hidden="true" />}
          {loading ? "Generating diagnosis..." : "Get AI Diagnosis"}
        </Button>
      </form>

      {result ? (
        <div className="rounded-[28px] border border-primary/15 bg-[linear-gradient(135deg,rgba(36,193,191,0.1),rgba(255,255,255,0.72),rgba(255,198,58,0.08))] p-4">
          <p className="text-sm font-medium text-foreground">Latest AI Triage Result</p>
          <div className="mt-3 space-y-2 text-sm leading-6 text-muted">
            <p>
              <span className="font-medium text-foreground">Possible conditions:</span> {result.aiDiagnosis.possibleConditions.join(", ")}
            </p>
            <p>
              <span className="font-medium text-foreground">Urgency level:</span> {result.aiDiagnosis.urgencyLevel}
            </p>
            <p>
              <span className="font-medium text-foreground">Recommended specialist:</span> {result.aiDiagnosis.recommendedSpecialist}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
