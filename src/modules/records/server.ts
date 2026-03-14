import OpenAI from "openai";

import { requireRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ClinicalNoteInput, ClinicalNoteStructuredData, MedicalRecord } from "@/modules/records/types";

const CLINICAL_NOTES_MODEL = process.env.OPENAI_CLINICAL_NOTES_MODEL ?? process.env.OPENAI_DIAGNOSIS_MODEL ?? "gpt-5";

const clinicalNotesSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    condition: { type: "string" },
    duration: { type: "string" },
    severity: { type: "string" },
  },
  required: ["condition", "duration", "severity"],
} as const;

function toTrimmedString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function parseStructuredClinicalNote(value: unknown): ClinicalNoteStructuredData | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const condition = toTrimmedString(candidate.condition);
  const duration = toTrimmedString(candidate.duration);
  const severity = toTrimmedString(candidate.severity);

  if (!condition || !duration || !severity) {
    return null;
  }

  return { condition, duration, severity };
}

function createOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  return new OpenAI({ apiKey });
}

export function parseClinicalNoteInput(payload: unknown): { data?: ClinicalNoteInput; error?: string } {
  if (!payload || typeof payload !== "object") {
    return { error: "Request body must be a JSON object." };
  }

  const input = payload as Record<string, unknown>;
  const patientProfileId = toTrimmedString(input.patientProfileId);
  const note = toTrimmedString(input.note);

  if (!patientProfileId) {
    return { error: "patientProfileId is required." };
  }

  if (!note || note.length < 5) {
    return { error: "note must be at least 5 characters long." };
  }

  return {
    data: {
      patientProfileId,
      note,
    },
  };
}

export async function generateStructuredClinicalNote(note: string) {
  const client = createOpenAIClient();
  const response = await client.responses.create({
    model: CLINICAL_NOTES_MODEL,
    instructions:
      "You convert short clinician notes into concise structured medical JSON. Extract only what is explicitly stated or directly implied. If the source note does not include a detail, return a conservative summary such as 'not specified' rather than inventing information.",
    input: note,
    text: {
      format: {
        type: "json_schema",
        name: "clinical_note_structured_data",
        strict: true,
        schema: clinicalNotesSchema,
      },
    },
  });

  const structuredData = parseStructuredClinicalNote(JSON.parse(response.output_text));

  if (!structuredData) {
    throw new Error("OpenAI returned an invalid clinical note payload.");
  }

  return structuredData;
}

function mapMedicalRecord(row: {
  id: string;
  patient_profile_id: string;
  provider_user_id: string;
  notes: string;
  structured_data: unknown;
  created_at: string;
  updated_at: string;
  patient_profiles: { full_name: string } | { full_name: string }[] | null;
}): MedicalRecord {
  const patientProfile = Array.isArray(row.patient_profiles) ? row.patient_profiles[0] : row.patient_profiles;

  return {
    id: row.id,
    patientProfileId: row.patient_profile_id,
    providerUserId: row.provider_user_id,
    patientName: patientProfile?.full_name ?? "Patient",
    notes: row.notes,
    structuredData: parseStructuredClinicalNote(row.structured_data) ?? {
      condition: "not specified",
      duration: "not specified",
      severity: "not specified",
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listProviderMedicalRecords() {
  const { user } = await requireRole(["provider"]);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("medical_records")
    .select(
      "id, patient_profile_id, provider_user_id, notes, structured_data, created_at, updated_at, patient_profiles(full_name)",
    )
    .eq("provider_user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapMedicalRecord);
}
