import { RoleShell } from "@/components/layout/role-shell";
import { getRoleLabel } from "@/lib/roles";
import { requireRole } from "@/lib/auth";

const links = [
  { href: "/patient", label: "Dashboard" },
  { href: "/patient/symptoms", label: "Symptoms" },
  { href: "/patient/appointments", label: "Appointments" },
  { href: "/chat", label: "Chat" },
];

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
  const { user, role } = await requireRole(["patient"]);

  return (
    <RoleShell role="Patient" email={user.email ?? "Unknown user"} roleLabel={getRoleLabel(role)} links={links}>
      {children}
    </RoleShell>
  );
}
