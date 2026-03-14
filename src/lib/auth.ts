import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { extractRole, getDashboardPathByRole, getRoleLabel, type AppRole } from "@/lib/roles";

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function getCurrentAuthState() {
  const user = await getCurrentUser();
  const role = user ? extractRole(user) : null;

  return {
    isAuthenticated: Boolean(user),
    user,
    role,
    email: user?.email ?? null,
    roleLabel: role ? getRoleLabel(role) : null,
    dashboardPath: role ? getDashboardPathByRole(role) : null,
  };
}

export async function requireAuth() {
  const { user } = await getCurrentAuthState();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireRole(allowed: AppRole[]) {
  const user = await requireAuth();
  const role = extractRole(user);

  if (!role) {
    redirect("/login");
  }

  if (!allowed.includes(role)) {
    redirect(getDashboardPathByRole(role));
  }

  return { user, role };
}
