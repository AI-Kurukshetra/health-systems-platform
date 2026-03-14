import { RoleShell } from "@/components/layout/role-shell";
import { getRoleLabel } from "@/lib/roles";
import { requireRole } from "@/lib/auth";

const patientLinks = [
  { href: "/patient", label: "Dashboard" },
  { href: "/patient/symptoms", label: "Symptoms" },
  { href: "/patient/appointments", label: "Appointments" },
  { href: "/chat", label: "Chat" },
];

const providerLinks = [
  { href: "/doctor", label: "Dashboard" },
  { href: "/doctor/patients", label: "Patients" },
  { href: "/doctor/appointments", label: "Appointments" },
  { href: "/doctor/records", label: "Records" },
  { href: "/chat", label: "Chat" },
];

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
  const { user, role } = await requireRole(["patient", "provider"]);
  const isPatient = role === "patient";

  return (
    <RoleShell
      role={isPatient ? "Patient" : "Doctor"}
      email={user.email ?? "Unknown user"}
      roleLabel={getRoleLabel(role)}
      links={isPatient ? patientLinks : providerLinks}
    >
      {children}
    </RoleShell>
  );
}
