import { requireRole } from "@/lib/auth";
import { parseAppRole } from "@/lib/roles";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Appointment } from "@/modules/appointments/types";

export const APPOINTMENT_STATUSES = ["scheduled", "completed", "cancelled"] as const;

type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

interface AuthDirectoryUser {
  id: string;
  email?: string;
  role: string | null;
  fullName: string | null;
}

function toNullableString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeDateTimeLocal(value: string | null) {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(normalized) ? normalized : null;
}

function toIsoDateTime(value: string) {
  return new Date(value).toISOString();
}

function mapAppointment(row: {
  id: string;
  patient_user_id: string;
  provider_user_id: string;
  scheduled_at: string;
  reason: string | null;
  status: AppointmentStatus;
  created_at: string;
  updated_at: string;
}): Appointment {
  return {
    id: row.id,
    patientUserId: row.patient_user_id,
    providerUserId: row.provider_user_id,
    scheduledAt: row.scheduled_at,
    reason: row.reason ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mergeDirectory(appointments: Appointment[], users: Map<string, AuthDirectoryUser>) {
  return appointments.map((appointment) => {
    const patient = users.get(appointment.patientUserId);
    const provider = users.get(appointment.providerUserId);

    return {
      ...appointment,
      patientName: patient?.fullName ?? patient?.email ?? "Patient",
      patientEmail: patient?.email,
      providerName: provider?.fullName ?? provider?.email ?? "Doctor",
      providerEmail: provider?.email,
    };
  });
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
      fullName:
        typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : typeof user.user_metadata?.name === "string"
            ? user.user_metadata.name
            : null,
    }));

    users.push(...batch);

    if (batch.length < 200) {
      break;
    }

    page += 1;
  }

  return users;
}

export async function listProviderDirectory() {
  const users = await listAuthUsers();

  return users
    .filter((user) => user.role === "provider")
    .sort((left, right) => (left.fullName ?? left.email ?? "").localeCompare(right.fullName ?? right.email ?? ""))
    .map((user) => ({
      id: user.id,
      fullName: user.fullName ?? user.email ?? "Doctor",
      email: user.email ?? "",
    }));
}

export function parseBookingFormData(formData: FormData): { data?: { providerUserId: string; scheduledAt: string; reason: string | null }; error?: string } {
  const providerUserId = toNullableString(formData.get("providerUserId"));
  const scheduledAtInput = normalizeDateTimeLocal(toNullableString(formData.get("scheduledAt")));
  const reason = toNullableString(formData.get("reason"));

  if (!providerUserId) {
    return { error: "Choose a doctor before booking." };
  }

  if (!scheduledAtInput) {
    return { error: "Choose a valid appointment date and time." };
  }

  const scheduledAt = toIsoDateTime(scheduledAtInput);
  if (Number.isNaN(new Date(scheduledAt).getTime())) {
    return { error: "Choose a valid appointment date and time." };
  }

  if (new Date(scheduledAt).getTime() <= Date.now()) {
    return { error: "Appointments must be booked in the future." };
  }

  return {
    data: {
      providerUserId,
      scheduledAt,
      reason,
    },
  };
}

export function parseStatusFormData(formData: FormData): { data?: { appointmentId: string; status: AppointmentStatus }; error?: string } {
  const appointmentId = toNullableString(formData.get("appointmentId"));
  const status = toNullableString(formData.get("status"));

  if (!appointmentId) {
    return { error: "Missing appointment." };
  }

  if (!status || !APPOINTMENT_STATUSES.includes(status as AppointmentStatus)) {
    return { error: "Choose a valid appointment status." };
  }

  return {
    data: {
      appointmentId,
      status: status as AppointmentStatus,
    },
  };
}

export async function listPatientAppointments() {
  const { user } = await requireRole(["patient"]);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("appointment_bookings")
    .select("id, patient_user_id, provider_user_id, scheduled_at, reason, status, created_at, updated_at")
    .eq("patient_user_id", user.id)
    .order("scheduled_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const appointments = (data ?? []).map(mapAppointment);
  const directory = await listAuthUsers();
  return mergeDirectory(appointments, new Map(directory.map((entry) => [entry.id, entry])));
}

export async function listDoctorAppointments() {
  const { user } = await requireRole(["provider"]);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("appointment_bookings")
    .select("id, patient_user_id, provider_user_id, scheduled_at, reason, status, created_at, updated_at")
    .eq("provider_user_id", user.id)
    .order("scheduled_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const appointments = (data ?? []).map(mapAppointment);
  const directory = await listAuthUsers();
  return mergeDirectory(appointments, new Map(directory.map((entry) => [entry.id, entry])));
}
