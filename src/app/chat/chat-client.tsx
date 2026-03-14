"use client";

import { SendHorizonal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Textarea } from "@/components/ui/textarea";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import type { ChatContact, ChatMessage } from "@/modules/messages/types";

interface ChatClientProps {
  currentUserId: string;
  currentRole: "patient" | "provider";
  contacts: ChatContact[];
  initialMessages: ChatMessage[];
  initialContactId?: string;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function upsertMessage(messages: ChatMessage[], nextMessage: ChatMessage) {
  if (messages.some((message) => message.id === nextMessage.id)) {
    return messages;
  }

  return [...messages, nextMessage].sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

function formatChatError(message?: string | null) {
  if (!message) {
    return "Unable to send message.";
  }

  if (message.includes("row-level security policy")) {
    return "Messaging is blocked by database access policy. Apply the latest Supabase migration and sign in again.";
  }

  return message;
}

export function ChatClient({ currentUserId, currentRole, contacts, initialMessages, initialContactId }: ChatClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedContactId = searchParams.get("contact") ?? initialContactId ?? contacts[0]?.id ?? "";
  const selectedContact = contacts.find((contact) => contact.id === selectedContactId) ?? null;

  useEffect(() => {
    if (!selectedContactId) {
      return;
    }

    let cancelled = false;

    async function loadMessages() {
      const { data, error: selectError } = await supabase
        .from("messages")
        .select("id, sender_id, receiver_id, content, created_at")
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${selectedContactId}),and(sender_id.eq.${selectedContactId},receiver_id.eq.${currentUserId})`)
        .order("created_at", { ascending: true });

      if (cancelled) {
        return;
      }

      if (selectError) {
        setError(selectError.message);
        return;
      }

      setMessages(
        (data ?? []).map((row) => ({
          id: row.id,
          senderId: row.sender_id,
          receiverId: row.receiver_id,
          content: row.content,
          createdAt: row.created_at,
        })),
      );
    }

    void loadMessages();

    return () => {
      cancelled = true;
    };
  }, [currentUserId, selectedContactId, supabase]);

  useEffect(() => {
    const channel = supabase
      .channel(`chat-messages-${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            sender_id: string;
            receiver_id: string;
            content: string;
            created_at: string;
          };

          const message: ChatMessage = {
            id: row.id,
            senderId: row.sender_id,
            receiverId: row.receiver_id,
            content: row.content,
            createdAt: row.created_at,
          };

          if (message.senderId !== currentUserId && message.receiverId !== currentUserId) {
            return;
          }

          if (message.senderId === selectedContactId || message.receiverId === selectedContactId) {
            setMessages((current) => upsertMessage(current, message));
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [currentUserId, selectedContactId, supabase]);

  async function handleSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = content.trim();
    if (!selectedContactId || trimmed.length === 0) {
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from("messages")
      .insert({
        sender_id: currentUserId,
        receiver_id: selectedContactId,
        content: trimmed,
      })
      .select("id, sender_id, receiver_id, content, created_at")
      .single();

    setLoading(false);

    if (insertError || !data) {
      setError(formatChatError(insertError?.message));
      return;
    }

    setMessages((current) =>
      upsertMessage(current, {
        id: data.id,
        senderId: data.sender_id,
        receiverId: data.receiver_id,
        content: data.content,
        createdAt: data.created_at,
      }),
    );
    setContent("");
  }

  function handleSelectContact(contactId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("contact", contactId);
    router.replace(`/chat?${params.toString()}`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="app-surface p-4">
        <div className="mb-4">
          <p className="section-kicker">{currentRole === "patient" ? "Doctors" : "Patients"}</p>
          <p className="mt-1 text-lg font-semibold text-foreground">Conversations</p>
        </div>
        <div className="space-y-2">
          {contacts.length === 0 ? (
            <EmptyState
              icon={SendHorizonal}
              title="No chat contacts available"
              description="Contacts will appear here once messaging is available for your account."
            />
          ) : (
            contacts.map((contact) => {
              const active = contact.id === selectedContactId;

              return (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => handleSelectContact(contact.id)}
                  className={`w-full rounded-3xl border px-4 py-3 text-left transition ${
                    active
                      ? "border-primary/30 bg-[linear-gradient(135deg,rgba(36,193,191,0.16),rgba(255,198,58,0.14))]"
                      : "border-border bg-white/80 hover:border-primary/20 hover:bg-primary/5"
                  }`}
                >
                  <p className="font-semibold text-foreground">{contact.fullName}</p>
                  <p className="text-sm text-muted">{contact.email ?? contact.role}</p>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <section className="app-surface flex min-h-[640px] flex-col overflow-hidden">
        <div className="border-b border-border/80 px-6 py-4">
          <p className="section-kicker">Secure chat</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{selectedContact ? selectedContact.fullName : "Select a conversation"}</p>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto bg-[linear-gradient(180deg,rgba(255,255,255,0.76),rgba(237,250,250,0.82),rgba(255,252,238,0.64))] px-6 py-5">
          {!selectedContact ? (
            <EmptyState
              icon={SendHorizonal}
              title="Choose a conversation"
              description="Select a contact to start exchanging secure messages."
            />
          ) : messages.length === 0 ? (
            <EmptyState
              icon={SendHorizonal}
              title="No messages yet"
              description="Send the first message to begin this secure conversation."
            />
          ) : (
            messages.map((message) => {
              const mine = message.senderId === currentUserId;

              return (
                <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-[24px] px-4 py-3 text-sm shadow-sm ${
                      mine
                        ? "bg-[linear-gradient(135deg,var(--secondary),var(--primary),var(--accent))] text-white shadow-[0_18px_28px_-20px_rgba(20,131,136,0.32)]"
                        : "border border-border bg-white/90 text-foreground"
                    }`}
                  >
                    <p className="leading-6">{message.content}</p>
                    <p className={`mt-2 text-xs ${mine ? "text-white/75" : "text-muted"}`}>{formatTime(message.createdAt)}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form onSubmit={handleSend} className="border-t border-border/80 bg-white/85 px-6 py-4">
          {error ? <Alert className="mb-3" variant="error">{error}</Alert> : null}
          <div className="flex gap-3">
            <Textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={2}
              disabled={!selectedContact || loading}
              className="min-h-[56px] flex-1"
              placeholder={selectedContact ? "Write a secure message..." : "Select a contact first"}
            />
            <Button type="submit" disabled={!selectedContact || loading || content.trim().length === 0}>
              <SendHorizonal className="h-4 w-4" aria-hidden="true" />
              {loading ? "Sending..." : "Send"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
