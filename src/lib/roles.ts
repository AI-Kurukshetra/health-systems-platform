export const APP_ROLES = ["admin", "provider", "patient"] as const;

export type AppRole = (typeof APP_ROLES)[number];

interface RoleCarrier {
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}

export function parseAppRole(value: unknown): AppRole | null {
  if (value === "doctor") {
    return "provider";
  }

  return typeof value === "string" && APP_ROLES.includes(value as AppRole) ? (value as AppRole) : null;
}

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && APP_ROLES.includes(value as AppRole);
}

export function extractRole(user: RoleCarrier | null | undefined): AppRole | null {
  if (!user) {
    return null;
  }

  return parseAppRole(user.user_metadata?.role ?? user.app_metadata?.role);
}

export function getRoleLabel(role: AppRole) {
  if (role === "provider") return "Doctor";
  if (role === "patient") return "Patient";
  return "Admin";
}

export function getDashboardPathByRole(role: AppRole) {
  if (role === "admin") return "/admin";
  if (role === "provider") return "/doctor";
  return "/patient";
}
