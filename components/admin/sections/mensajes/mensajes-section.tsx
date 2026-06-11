"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useConversation } from "../hook/messages/useConversation";
import { useInbox } from "../hook/messages/useInbox";
import { useMessages } from "../hook/messages/useMessages";
import ConversationView from "./ConversationView";
import EmptyState from "./EmptyState";
import InboxList from "./InboxList";
import NewMessageView from "./NewMessageView";
export default function MensajesSection() {
  const inbox = useInbox();

  const {
    panelMode,
    activeUserId,
    openConversation,
    openNewMessage,
    closePanel,
  } = useMessages();

  const conversation = useConversation(activeUserId);

  // Abrir directo la conversación cuando se llega con ?user=<id>
  // (ej. desde "Ir a la conversación" en el drawer de una solicitud).
  const searchParams = useSearchParams();
  useEffect(() => {
    const u = Number(searchParams.get("user"));
    if (Number.isInteger(u) && u > 0) openConversation(u);
  }, [searchParams, openConversation]);

  return (
    <div className="msg-layout">
      <InboxList
        conversations={inbox.conversations}
        loading={inbox.loading}
        query={inbox.query}
        setQuery={inbox.setQuery}
        tipo={inbox.tipo}
        setTipo={inbox.setTipo}
        counts={inbox.counts}
        activeUserId={activeUserId}
        onSelect={openConversation}
        onNew={openNewMessage}
      />

      {panelMode === "idle" && <EmptyState />}

      {panelMode === "new" && (
        <NewMessageView
          inboxUserIds={inbox.conversations.map((c) => c.user.id)}
          onCancel={() => {
            closePanel();
          }}
          onCreated={(user) => {
            inbox.reload();

            openConversation(user.id);
          }}
        />
      )}

      {panelMode === "chat" && activeUserId && (
        <ConversationView
          conversationData={conversation}
          activeUserMessage={
            inbox.conversations.find((c) => c.user.id === activeUserId)?.user ||
            null
          }
        />
      )}
    </div>
  );
}
