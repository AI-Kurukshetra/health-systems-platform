import { RoleShell } from "@/components/layout/role-shell";
import { getRoleLabel } from "@/lib/roles";
import { requireRole } from "@/lib/auth";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/organizations", label: "Organizations" },
  { href: "/admin/providers", label: "Providers" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, role } = await requireRole(["admin"]);

  return (
    <RoleShell role="Admin" email={user.email ?? "Unknown user"} roleLabel={getRoleLabel(role)} links={links}>
      {children}
    </RoleShell>
  );
}
