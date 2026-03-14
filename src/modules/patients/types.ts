export interface Patient {
  id: string;
  providerUserId: string;
  fullName: string;
  dateOfBirth: string | null;
  email?: string;
  phone?: string;
  gender?: string;
  address?: string;
  medicalNotes?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  createdAt: string;
  updatedAt: string;
}
