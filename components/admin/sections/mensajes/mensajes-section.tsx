"use client";

import { useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useConversation } from "../hook/messages/useConversation";
import { useInbox } from "../hook/messages/useInbox";
import { useMessages } from "../hook/messages/useMessages";
import ConversationView from "./ConversationView";
import EmptyState from "./EmptyState";
import InboxList from "./InboxList";
import NewMessageView from "./NewMessageView";
import { AlertsCarousel } from "./AlertsCarousel";
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

  const { updateUnreadCount } = inbox;
  const handleOpenConversation = useCallback(
    (userId: number) => {
      openConversation(userId);
      updateUnreadCount(userId, 0);
    },
    [openConversation, updateUnreadCount],
  );

  // Abrir directo la conversación cuando se llega con ?user=<id>
  // (ej. desde "Ir a la conversación" en el drawer de una solicitud).
  const searchParams = useSearchParams();
  useEffect(() => {
    const u = Number(searchParams?.get("user"));
    if (Number.isInteger(u) && u > 0) handleOpenConversation(u);
  }, [searchParams, handleOpenConversation]);

  return (
    <div
      className={`msg-layout msg-layout--switch${
        panelMode !== "idle" ? " has-detail" : ""
      }`}
    >
      <InboxList
        conversations={inbox.conversations}
        loading={inbox.loading}
        query={inbox.query}
        setQuery={inbox.setQuery}
        tipo={inbox.tipo}
        setTipo={inbox.setTipo}
        counts={inbox.counts}
        activeUserId={activeUserId}
        onSelect={handleOpenConversation}
        onNew={openNewMessage}
      />

      <div className="msg-main">
        {/* Solo visible en móvil (master-detail): vuelve a la bandeja. */}
        <button type="button" className="msg-back" onClick={closePanel}>
          <ChevronLeft size={16} aria-hidden /> Volver a la bandeja
        </button>

        <AlertsCarousel highlightUserId={activeUserId} />

        <div className="msg-panel-area">
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
                inbox.conversations.find((c) => c.user.id === activeUserId)
                  ?.user || null
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
