export interface PatientHistorySummary {
  summary: string;
  keyRisks: string[];
  suggestedNextActions: string[];
}

export interface PatientHistoryContext {
  patientProfileId: string;
  patientName: string;
  patientEmail?: string;
  demographics: {
    dateOfBirth?: string | null;
    gender?: string;
    phone?: string;
  };
  medicalNotes?: string;
  appointments: Array<{
    scheduledAt: string;
    status: string;
    reason?: string;
  }>;
  symptoms: Array<{
    description: string;
    age: number;
    gender: string;
    createdAt: string;
    aiDiagnosis?: string | null;
  }>;
  medicalRecords: Array<{
    createdAt: string;
    notes: string;
    structuredData: {
      condition: string;
      duration: string;
      severity: string;
    };
  }>;
}
