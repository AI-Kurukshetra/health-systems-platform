export interface Appointment {
  id: string;
  patientUserId: string;
  providerUserId: string;
  scheduledAt: string;
  reason?: string;
  status: "scheduled" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
  patientName?: string;
  patientEmail?: string;
  providerName?: string;
  providerEmail?: string;
}
