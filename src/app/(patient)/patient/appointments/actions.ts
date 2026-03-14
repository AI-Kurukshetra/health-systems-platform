"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listProviderDirectory, parseBookingFormData } from "@/modules/appointments/server";

function redirectWithStatus(status: string): never {
  redirect(`/patient/appointments?status=${status}`);
}

export async function bookAppointmentAction(formData: FormData) {
  const { user } = await requireRole(["patient"]);
  const parsed = parseBookingFormData(formData);

  if (parsed.error || !parsed.data) {
    redirectWithStatus("invalid");
  }

  const booking = parsed.data;

  const providers = await listProviderDirectory();
  if (!providers.some((provider) => provider.id === booking.providerUserId)) {
    redirectWithStatus("provider-missing");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("appointment_bookings")
    .insert({
      patient_user_id: user.id,
      provider_user_id: booking.providerUserId,
      scheduled_at: booking.scheduledAt,
      reason: booking.reason,
    })
    .select("id")
    .single();

  if (error || !data) {
    redirectWithStatus("book-error");
  }

  const appointment = data;

  revalidatePath("/patient/appointments");
  redirect(`/patient/appointments?appointmentId=${appointment.id}&status=booked`);
}
