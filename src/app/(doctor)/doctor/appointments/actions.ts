"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseStatusFormData } from "@/modules/appointments/server";

function redirectWithStatus(status: string, appointmentId?: string): never {
  const suffix = appointmentId ? `&appointmentId=${appointmentId}` : "";
  redirect(`/doctor/appointments?status=${status}${suffix}`);
}

export async function updateAppointmentStatusAction(formData: FormData) {
  const { user } = await requireRole(["provider"]);
  const parsed = parseStatusFormData(formData);

  if (parsed.error || !parsed.data) {
    redirectWithStatus("invalid");
  }

  const update = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("appointment_bookings")
    .update({
      status: update.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", update.appointmentId)
    .eq("provider_user_id", user.id);

  if (error) {
    redirectWithStatus("update-error", update.appointmentId);
  }

  revalidatePath("/doctor/appointments");
  redirectWithStatus("updated", update.appointmentId);
}
