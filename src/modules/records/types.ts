export interface MedicalRecord {
  id: string;
  patientProfileId: string;
  providerUserId: string;
  patientName: string;
  notes: string;
  structuredData: ClinicalNoteStructuredData;
  createdAt: string;
  updatedAt: string;
}

export interface ClinicalNoteStructuredData {
  condition: string;
  duration: string;
  severity: string;
}

export interface ClinicalNoteInput {
  patientProfileId: string;
  note: string;
}
