import OpenAI from "openai";

import { requireRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AIDiagnosis, DiagnosisUrgency, SymptomEntry, SymptomSubmissionInput } from "@/modules/symptoms/types";

const DIAGNOSIS_MODEL = process.env.OPENAI_DIAGNOSIS_MODEL ?? "gpt-5";
const URGENCY_LEVELS: DiagnosisUrgency[] = ["low", "medium", "high", "emergency"];

const diagnosisSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    possibleConditions: {
      type: "array",
      items: { type: "string" },
    },
    urgencyLevel: {
      type: "string",
      enum: URGENCY_LEVELS,
    },
    recommendedSpecialist: {
      type: "string",
    },
  },
  required: ["possibleConditions", "urgencyLevel", "recommendedSpecialist"],
} as const;

function toNullableTrimmedString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseAge(value: unknown) {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return null;
  }

  return value >= 0 && value <= 120 ? value : null;
}

function parseDiagnosis(value: unknown): AIDiagnosis | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const possibleConditions = Array.isArray(candidate.possibleConditions)
    ? candidate.possibleConditions.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
  const urgencyLevel = candidate.urgencyLevel;
  const recommendedSpecialist = toNullableTrimmedString(candidate.recommendedSpecialist);

  if (possibleConditions.length === 0 || !recommendedSpecialist || !URGENCY_LEVELS.includes(urgencyLevel as DiagnosisUrgency)) {
    return null;
  }

  return {
    possibleConditions,
    urgencyLevel: urgencyLevel as DiagnosisUrgency,
    recommendedSpecialist,
  };
}

function mapSymptomEntry(row: {
  id: string;
  patient_user_id: string;
  description: string;
  age: number;
  gender: string;
  ai_diagnosis: string | null;
  created_at: string;
  updated_at: string;
}): SymptomEntry {
  let aiDiagnosis: AIDiagnosis | null = null;

  if (row.ai_diagnosis) {
    try {
      aiDiagnosis = parseDiagnosis(JSON.parse(row.ai_diagnosis));
    } catch {
      aiDiagnosis = null;
    }
  }

  return {
    id: row.id,
    patientUserId: row.patient_user_id,
    symptoms: row.description,
    age: row.age,
    gender: row.gender,
    aiDiagnosis,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function parseSymptomSubmission(payload: unknown): { data?: SymptomSubmissionInput; error?: string } {
  if (!payload || typeof payload !== "object") {
    return { error: "Request body must be a JSON object." };
  }

  const input = payload as Record<string, unknown>;
  const symptoms = toNullableTrimmedString(input.symptoms);
  const gender = toNullableTrimmedString(input.gender);
  const age = parseAge(input.age);

  if (!symptoms || symptoms.length < 5) {
    return { error: "Symptoms must be at least 5 characters long." };
  }

  if (age === null) {
    return { error: "Age must be a whole number between 0 and 120." };
  }

  if (!gender) {
    return { error: "Gender is required." };
  }

  return {
    data: {
      symptoms,
      age,
      gender,
    },
  };
}

function createOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  return new OpenAI({ apiKey });
}

export async function generateAIDiagnosis(input: SymptomSubmissionInput) {
  const client = createOpenAIClient();
  const response = await client.responses.create({
    model: DIAGNOSIS_MODEL,
    instructions:
      "You are a medical triage assistant. Return only likely, non-definitive possibilities based on the provided symptoms. Do not claim certainty. Prefer concise output suitable for a patient portal.",
    input: `Symptoms: ${input.symptoms}\nAge: ${input.age}\nGender: ${input.gender}`,
    text: {
      format: {
        type: "json_schema",
        name: "ai_diagnosis",
        strict: true,
        schema: diagnosisSchema,
      },
    },
  });

  const diagnosis = parseDiagnosis(JSON.parse(response.output_text));

  if (!diagnosis) {
    throw new Error("OpenAI returned an invalid diagnosis payload.");
  }

  return diagnosis;
}

export async function listPatientSymptomEntries() {
  const { user } = await requireRole(["patient"]);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("symptoms")
    .select("id, patient_user_id, description, age, gender, ai_diagnosis, created_at, updated_at")
    .eq("patient_user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapSymptomEntry);
}
