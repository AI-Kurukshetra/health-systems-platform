import { RoleShell } from "@/components/layout/role-shell";
import { getRoleLabel } from "@/lib/roles";
import { requireRole } from "@/lib/auth";

const links = [
  { href: "/doctor", label: "Dashboard" },
  { href: "/doctor/patients", label: "Patients" },
  { href: "/doctor/appointments", label: "Appointments" },
  { href: "/doctor/records", label: "Records" },
  { href: "/chat", label: "Chat" },
];

export default async function DoctorLayout({ children }: { children: React.ReactNode }) {
  const { user, role } = await requireRole(["provider"]);

  return (
    <RoleShell role="Doctor" email={user.email ?? "Unknown user"} roleLabel={getRoleLabel(role)} links={links}>
      {children}
    </RoleShell>
  );
}
