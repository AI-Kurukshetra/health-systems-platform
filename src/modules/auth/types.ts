export type Role = "admin" | "provider" | "patient";

export interface AuthUserProfile {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  organizationId?: string;
}
