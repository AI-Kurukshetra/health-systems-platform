"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parsePatientFormData } from "@/modules/patients/server";

function redirectWithStatus(path: string, status: string): never {
  redirect(`${path}${path.includes("?") ? "&" : "?"}status=${status}`);
}

export async function createPatientAction(formData: FormData) {
  const { user } = await requireRole(["provider"]);
  const parsed = parsePatientFormData(formData);

  if (parsed.error || !parsed.data) {
    redirectWithStatus("/doctor/patients", "invalid");
  }

  const patient = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("patient_profiles")
    .insert({
      provider_user_id: user.id,
      full_name: patient.fullName,
      email: patient.email,
      phone: patient.phone,
      dob: patient.dateOfBirth,
      gender: patient.gender,
      address: patient.address,
      medical_notes: patient.medicalNotes,
      emergency_contact_name: patient.emergencyContactName,
      emergency_contact_phone: patient.emergencyContactPhone,
    })
    .select("id")
    .single();

  if (error || !data) {
    redirectWithStatus("/doctor/patients", "create-error");
  }

  const createdPatient = data;

  revalidatePath("/doctor/patients");
  redirect(`/doctor/patients?patientId=${createdPatient.id}&status=created`);
}

export async function updatePatientAction(formData: FormData) {
  const { user } = await requireRole(["provider"]);
  const patientId = formData.get("patientId");
  const parsed = parsePatientFormData(formData);

  if (typeof patientId !== "string" || !patientId || parsed.error || !parsed.data) {
    redirectWithStatus("/doctor/patients", "invalid");
  }

  const patient = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("patient_profiles")
    .update({
      full_name: patient.fullName,
      email: patient.email,
      phone: patient.phone,
      dob: patient.dateOfBirth,
      gender: patient.gender,
      address: patient.address,
      medical_notes: patient.medicalNotes,
      emergency_contact_name: patient.emergencyContactName,
      emergency_contact_phone: patient.emergencyContactPhone,
      updated_at: new Date().toISOString(),
    })
    .eq("id", patientId)
    .eq("provider_user_id", user.id);

  if (error) {
    redirect(`/doctor/patients?patientId=${patientId}&status=update-error`);
  }

  revalidatePath("/doctor/patients");
  redirect(`/doctor/patients?patientId=${patientId}&status=updated`);
}
