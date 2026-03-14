import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import type { Patient } from "@/modules/patients/types";

export interface PatientFormValues {
  fullName: string;
  email: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  address: string | null;
  medicalNotes: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
}

function toNullableString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeDate(value: string | null) {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : null;
}

export function parsePatientFormData(formData: FormData): { data?: PatientFormValues; error?: string } {
  const fullName = toNullableString(formData.get("fullName"));

  if (!fullName) {
    return { error: "Patient name is required." };
  }

  const email = toNullableString(formData.get("email"));
  if (email && !email.includes("@")) {
    return { error: "Enter a valid email address." };
  }

  const dateOfBirth = normalizeDate(toNullableString(formData.get("dateOfBirth")));
  if (toNullableString(formData.get("dateOfBirth")) && !dateOfBirth) {
    return { error: "Date of birth must use YYYY-MM-DD." };
  }

  return {
    data: {
      fullName,
      email,
      phone: toNullableString(formData.get("phone")),
      dateOfBirth,
      gender: toNullableString(formData.get("gender")),
      address: toNullableString(formData.get("address")),
      medicalNotes: toNullableString(formData.get("medicalNotes")),
      emergencyContactName: toNullableString(formData.get("emergencyContactName")),
      emergencyContactPhone: toNullableString(formData.get("emergencyContactPhone")),
    },
  };
}

function mapPatient(row: {
  id: string;
  provider_user_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  dob: string | null;
  gender: string | null;
  address: string | null;
  medical_notes: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  created_at: string;
  updated_at: string;
}): Patient {
  return {
    id: row.id,
    providerUserId: row.provider_user_id,
    fullName: row.full_name,
    dateOfBirth: row.dob,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    gender: row.gender ?? undefined,
    address: row.address ?? undefined,
    medicalNotes: row.medical_notes ?? undefined,
    emergencyContactName: row.emergency_contact_name ?? undefined,
    emergencyContactPhone: row.emergency_contact_phone ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listProviderPatients() {
  const { user } = await requireRole(["provider"]);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("patient_profiles")
    .select(
      "id, provider_user_id, full_name, email, phone, dob, gender, address, medical_notes, emergency_contact_name, emergency_contact_phone, created_at, updated_at",
    )
    .eq("provider_user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapPatient);
}
