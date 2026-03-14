export type DiagnosisUrgency = "low" | "medium" | "high" | "emergency";

export interface AIDiagnosis {
  possibleConditions: string[];
  urgencyLevel: DiagnosisUrgency;
  recommendedSpecialist: string;
}

export interface SymptomSubmissionInput {
  symptoms: string;
  age: number;
  gender: string;
}

export interface SymptomEntry extends SymptomSubmissionInput {
  id: string;
  patientUserId: string;
  aiDiagnosis: AIDiagnosis | null;
  createdAt: string;
  updatedAt: string;
}
