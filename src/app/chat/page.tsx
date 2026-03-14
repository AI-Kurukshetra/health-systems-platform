import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listChatContacts, listConversationMessages } from "@/modules/messages/server";

import { ChatClient } from "./chat-client";

type SearchParams = Promise<{
  contact?: string | string[];
}>;

function readSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ChatPage({ searchParams }: { searchParams?: SearchParams }) {
  const params = searchParams ? await searchParams : undefined;
  const { currentUserId, currentRole, contacts } = await listChatContacts();
  const selectedContactId = readSearchParam(params?.contact) ?? contacts[0]?.id;
  const initialMessages = await listConversationMessages(selectedContactId);

  return (
    <div className="px-4 py-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <Card className="overflow-hidden">
          <CardHeader>
            <span className="section-kicker">Realtime messaging</span>
            <CardTitle>Patient-provider chat</CardTitle>
            <CardDescription>Secure conversations powered by Supabase Realtime.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChatClient
              currentUserId={currentUserId}
              currentRole={currentRole}
              contacts={contacts}
              initialMessages={initialMessages}
              initialContactId={selectedContactId}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
