import { requireRole } from "@/lib/auth";
import { parseAppRole } from "@/lib/roles";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ChatContact, ChatMessage } from "@/modules/messages/types";

interface AuthDirectoryUser {
  id: string;
  email?: string;
  role: string | null;
  fullName: string | null;
}

interface AppDirectoryUser {
  id: string;
  email: string;
  role: string;
}

function mapMessage(row: {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}): ChatMessage {
  return {
    id: row.id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    content: row.content,
    createdAt: row.created_at,
  };
}

async function listAuthUsers() {
  const admin = createSupabaseAdminClient();
  const users: AuthDirectoryUser[] = [];
  let page = 1;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });

    if (error) {
      throw new Error(error.message);
    }

    const batch = (data?.users ?? []).map((user) => ({
      id: user.id,
      email: user.email,
      role: parseAppRole(user.user_metadata?.role ?? user.app_metadata?.role),
      fullName:
        typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : typeof user.user_metadata?.name === "string"
            ? user.user_metadata.name
            : null,
    }));

    users.push(...batch);

    if (batch.length < 200) {
      break;
    }

    page += 1;
  }

  return users;
}

export async function listChatContacts() {
  const { user, role } = await requireRole(["patient", "provider"]);
  const targetRole = role === "patient" ? "provider" : "patient";
  const [authUsers, supabase] = await Promise.all([listAuthUsers(), createSupabaseServerClient()]);
  const { data: appUsers, error } = await supabase.from("users").select("id, email, role").eq("role", targetRole);

  if (error) {
    throw new Error(error.message);
  }

  const authUserMap = new Map(authUsers.map((entry) => [entry.id, entry]));

  const contacts: ChatContact[] = ((appUsers ?? []) as AppDirectoryUser[])
    .filter((entry) => entry.id !== user.id)
    .map((entry) => {
      const authEntry = authUserMap.get(entry.id);

      return {
        id: entry.id,
        fullName: authEntry?.fullName ?? authEntry?.email ?? entry.email ?? (targetRole === "provider" ? "Doctor" : "Patient"),
        email: authEntry?.email ?? entry.email,
        role: targetRole,
      };
    })
    .sort((left, right) => (left.fullName ?? left.email ?? "").localeCompare(right.fullName ?? right.email ?? ""))
    .map((entry) => ({
      id: entry.id,
      fullName: entry.fullName,
      email: entry.email,
      role: targetRole,
    }));

  return {
    currentUserId: user.id,
    currentRole: role as "patient" | "provider",
    contacts,
  };
}

export async function listConversationMessages(contactId?: string) {
  const { user } = await requireRole(["patient", "provider"]);

  if (!contactId) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("messages")
    .select("id, sender_id, receiver_id, content, created_at")
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${user.id})`)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapMessage);
}
