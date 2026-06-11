"use client";

import { Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { Message, ConversationProfile, userMessage } from "@/services/messages.services";
import { useConversation } from "../hook/messages/useConversation";
import { initials } from "../dashboard/dashboard.data";

type Props = {
  conversationData: ReturnType<typeof useConversation>;
  activeUserMessage: userMessage | null;
};

export default function ConversationView({
  conversationData,
  activeUserMessage,
}: Props) {
  const currentUser = useAppSelector((state) => state.user);
  const endRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    endRef.current?.scrollIntoView({ //
      behavior: "smooth",
    });
  }, [conversationData.messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const text = draft.trim();

    if (!text) {
      return;
    }

    setSending(true);

    const ok = await conversationData.send(text);

    if (ok) {
      setDraft("");
    }

    setSending(false);
  }

  return (
    <section className="msg-chat-panel">
      <header className="msg-chat-head">
        {activeUserMessage?.photo ? (
          <img
            src={activeUserMessage.photo}
            alt={activeUserMessage.name}
            className="msg-avatar object-cover"
          />
        ) : (
          <span className="msg-avatar">{initials(activeUserMessage?.name || "U")}</span>
        )}

        <div className="msg-chat-head-info">
          <h3>{activeUserMessage?.name || "Usuario"}</h3>
        </div>
      </header>

      <div className="msg-thread">
        {conversationData.loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
          </div>
        ) : conversationData.messages.length === 0 ? (
          <div className="text-center p-8 text-gray-500">No hay mensajes.</div> //
        ) : (
          conversationData.messages.map((m) => {
            const isMine = m.senderId === currentUser.id;

            return (
              <div
                key={m.id}
                className={`msg-bubble-row ${isMine ? "is-mine" : "is-theirs"}`} //
              >
                {!isMine && (
                  <>
                    {activeUserMessage?.photo ? (
                      <img
                        src={activeUserMessage.photo}
                        alt={activeUserMessage.name}
                        className="msg-avatar msg-avatar-sm object-cover"
                      />
                    ) : (
                      <span className="msg-avatar msg-avatar-sm">
                        {initials(activeUserMessage?.name || "U")}
                      </span>
                    )}
                  </>
                )}

                <div className="msg-bubble">
                  <p>{m.content}</p>

                  <time>
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
              </div>
            );
          })
        )}

        <div ref={endRef} />
      </div>

      <form onSubmit={handleSubmit} className="msg-composer">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Escribí un mensaje..."
        />

        <button
          type="submit"
          disabled={!draft.trim() || sending}
          className="msg-send"
        >
          {sending ? (
            <Loader2 className="animate-spin w-4 h-4" />
          ) : (
            <Send size={16} />
          )}
        </button>
      </form>
    </section>
  );
}
