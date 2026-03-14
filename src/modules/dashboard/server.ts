import OpenAI from "openai";

import { requireRole } from "@/lib/auth";
import { parseAppRole } from "@/lib/roles";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseStructuredClinicalNote } from "@/modules/records/server";
import type { PatientHistoryContext, PatientHistorySummary } from "@/modules/dashboard/types";

const PATIENT_SUMMARY_MODEL = process.env.OPENAI_PATIENT_SUMMARY_MODEL ?? process.env.OPENAI_DIAGNOSIS_MODEL ?? "gpt-5";

const patientSummarySchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: { type: "string" },
    keyRisks: {
      type: "array",
      items: { type: "string" },
    },
    suggestedNextActions: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["summary", "keyRisks", "suggestedNextActions"],
} as const;

interface AuthDirectoryUser {
  id: string;
  email?: string;
  role: string | null;
}

function toTrimmedString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parsePatientSummary(value: unknown): PatientHistorySummary | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const summary = toTrimmedString(candidate.summary);
  const keyRisks = Array.isArray(candidate.keyRisks)
    ? candidate.keyRisks.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
  const suggestedNextActions = Array.isArray(candidate.suggestedNextActions)
    ? candidate.suggestedNextActions.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];

  if (!summary) {
    return null;
  }

  return {
    summary,
    keyRisks,
    suggestedNextActions,
  };
}

function createOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  return new OpenAI({ apiKey });
}

async function listAuthUsers() {
  const admin = createSupabaseAdminClient();
  const users: AuthDirectoryUser[] = [];
  let page = 1;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });

    if (error) {
      throw new Error(error.message);
    }

    const batch = (data?.users ?? []).map((user) => ({
      id: user.id,
      email: user.email,
      role: parseAppRole(user.user_metadata?.role ?? user.app_metadata?.role),
    }));

    users.push(...batch);

    if (batch.length < 200) {
      break;
    }

    page += 1;
  }

  return users;
}

export async function buildPatientHistoryContext(patientProfileId: string): Promise<PatientHistoryContext> {
  const { user } = await requireRole(["provider"]);
  const supabase = await createSupabaseServerClient();

  const { data: patientProfile, error: patientError } = await supabase
    .from("patient_profiles")
    .select("id, full_name, email, dob, gender, phone, medical_notes")
    .eq("id", patientProfileId)
    .eq("provider_user_id", user.id)
    .single();

  if (patientError || !patientProfile) {
    throw new Error("Patient profile not found.");
  }

  const { data: medicalRecords, error: medicalRecordError } = await supabase
    .from("medical_records")
    .select("created_at, notes, structured_data")
    .eq("patient_profile_id", patientProfile.id)
    .eq("provider_user_id", user.id)
    .order("created_at", { ascending: false });

  if (medicalRecordError) {
    throw new Error(medicalRecordError.message);
  }

  let patientUserId: string | null = null;

  if (patientProfile.email) {
    const users = await listAuthUsers();
    const matchingPatient = users.find(
      (entry) => entry.role === "patient" && entry.email?.toLowerCase() === patientProfile.email?.toLowerCase(),
    );
    patientUserId = matchingPatient?.id ?? null;
  }

  let appointments: PatientHistoryContext["appointments"] = [];
  let symptoms: PatientHistoryContext["symptoms"] = [];

  if (patientUserId) {
    const [{ data: appointmentRows, error: appointmentError }, { data: symptomRows, error: symptomError }] = await Promise.all([
      supabase
        .from("appointment_bookings")
        .select("scheduled_at, status, reason")
        .eq("provider_user_id", user.id)
        .eq("patient_user_id", patientUserId)
        .order("scheduled_at", { ascending: false }),
      supabase
        .from("symptoms")
        .select("description, age, gender, created_at, ai_diagnosis")
        .eq("patient_user_id", patientUserId)
        .order("created_at", { ascending: false }),
    ]);

    if (appointmentError) {
      throw new Error(appointmentError.message);
    }

    if (symptomError) {
      throw new Error(symptomError.message);
    }

    appointments = (appointmentRows ?? []).map((row) => ({
      scheduledAt: row.scheduled_at,
      status: row.status,
      reason: row.reason ?? undefined,
    }));

    symptoms = (symptomRows ?? []).map((row) => ({
      description: row.description,
      age: row.age,
      gender: row.gender,
      createdAt: row.created_at,
      aiDiagnosis: row.ai_diagnosis,
    }));
  }

  return {
    patientProfileId: patientProfile.id,
    patientName: patientProfile.full_name,
    patientEmail: patientProfile.email ?? undefined,
    demographics: {
      dateOfBirth: patientProfile.dob,
      gender: patientProfile.gender ?? undefined,
      phone: patientProfile.phone ?? undefined,
    },
    medicalNotes: patientProfile.medical_notes ?? undefined,
    appointments,
    symptoms,
    medicalRecords: (medicalRecords ?? []).map((row) => ({
      createdAt: row.created_at,
      notes: row.notes,
      structuredData: parseStructuredClinicalNote(row.structured_data) ?? {
        condition: "not specified",
        duration: "not specified",
        severity: "not specified",
      },
    })),
  };
}

export async function generatePatientHistorySummary(context: PatientHistoryContext) {
  const client = createOpenAIClient();
  const response = await client.responses.create({
    model: PATIENT_SUMMARY_MODEL,
    instructions:
      "You are a clinical summarization assistant for doctors. Summarize the patient history conservatively using only the supplied data. Identify key risks and practical next actions. If information is limited, say so instead of inventing details.",
    input: JSON.stringify(context, null, 2),
    text: {
      format: {
        type: "json_schema",
        name: "patient_history_summary",
        strict: true,
        schema: patientSummarySchema,
      },
    },
  });

  const summary = parsePatientSummary(JSON.parse(response.output_text));

  if (!summary) {
    throw new Error("OpenAI returned an invalid patient summary payload.");
  }

  return summary;
}
