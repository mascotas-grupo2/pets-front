"use client";

import { Loader2, Send, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { userMessage } from "@/services/messages.services";
import { useConversation } from "../hook/messages/useConversation";
import { initials } from "../dashboard/dashboard.data";

type Props = {
  conversationData: ReturnType<typeof useConversation>;
  activeUserMessage: userMessage | null;
};

type Tab = "mensajes" | "perfil" | "evaluacion" | "notas";

const TABS: { id: Tab; label: string }[] = [
  { id: "mensajes", label: "Mensajes" },
  { id: "perfil", label: "Perfil" },
  { id: "evaluacion", label: "Evaluación" },
  { id: "notas", label: "Notas" },
];

function Campo({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="vdrawer-field">
      <span className="vdrawer-field-label">{label}</span>
      <span className="vdrawer-field-value">{value || "—"}</span>
    </div>
  );
}

export default function ConversationView({
  conversationData,
  activeUserMessage,
}: Props) {
  const currentUser = useAppSelector((state) => state.user);
  const endRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState<Tab>("mensajes");

  const profile = conversationData.profile;

  useEffect(() => {
    if (tab === "mensajes") {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversationData.messages, tab]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setSending(true);
    const ok = await conversationData.send(text);
    if (ok) setDraft("");
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
          {(profile?.context || activeUserMessage?.context) && (
            <p>{profile?.context ?? activeUserMessage?.context}</p>
          )}
        </div>
      </header>

      <div className="msg-tabs msg-chat-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`msg-tab${tab === t.id ? " is-active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "mensajes" && (
        <>
          <div className="msg-thread">
            {conversationData.loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
              </div>
            ) : conversationData.messages.length === 0 ? (
              <div className="text-center p-8 text-gray-500">No hay mensajes.</div>
            ) : (
              conversationData.messages.map((m) => {
                const isMine = m.senderId === currentUser.id;
                return (
                  <div
                    key={m.id}
                    className={`msg-bubble-row ${isMine ? "is-mine" : "is-theirs"}`}
                  >
                    {!isMine &&
                      (activeUserMessage?.photo ? (
                        <img
                          src={activeUserMessage.photo}
                          alt={activeUserMessage.name}
                          className="msg-avatar msg-avatar-sm object-cover"
                        />
                      ) : (
                        <span className="msg-avatar msg-avatar-sm">
                          {initials(activeUserMessage?.name || "U")}
                        </span>
                      ))}

                    <div className="msg-bubble">
                      <p>{m.content}</p>
                      <time>
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                    </div>

                    <button
                      type="button"
                      className="msg-delete"
                      aria-label="Eliminar mensaje"
                      title="Eliminar mensaje"
                      onClick={() => conversationData.remove(m.id)}
                    >
                      <Trash2 size={14} />
                    </button>
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
        </>
      )}

      {tab === "perfil" && (
        <div className="msg-tab-content">
          {profile ? (
            <div className="vdrawer-section">
              <Campo label="Nombre" value={profile.name} />
              <Campo label="Email" value={profile.email} />
              <Campo label="Teléfono" value={profile.phone} />
              <Campo label="Localidad" value={profile.town} />
              <Campo label="Estado" value={profile.status} />
              <Campo label="Solicitud" value={profile.context} />
            </div>
          ) : (
            <p className="msg-tab-empty">Sin datos de perfil (conversación interna).</p>
          )}
        </div>
      )}

      {tab === "evaluacion" && (
        <div className="msg-tab-content">
          {profile?.evaluationNote ? (
            <p className="msg-eval-note">{profile.evaluationNote}</p>
          ) : (
            <p className="msg-tab-empty">Sin evaluación cargada.</p>
          )}
        </div>
      )}

      {tab === "notas" && (
        <div className="msg-tab-content">
          {profile?.notes && profile.notes.length > 0 ? (
            <ul className="msg-notes">
              {profile.notes.map((n) => (
                <li key={n.id} className="msg-note">
                  <p>{n.text}</p>
                  <span className="msg-note-meta">
                    {n.author ? `${n.author} · ` : ""}
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="msg-tab-empty">Sin notas.</p>
          )}
        </div>
      )}
    </section>
  );
}
