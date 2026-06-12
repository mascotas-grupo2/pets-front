"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import {
  sendChatbotMessage,
  type ChatbotMessage,
  type QuickReply,
} from "@/services/chatbot";
import "@/styles/chatbot.css";

const SESSION_STORAGE_KEY = "chatbot_session_id";

/**
 * Welcome replies hardcoded en el frontend. Solo se muestran cuando NO hay
 * conversación todavía (estado pre-primer-mensaje). Son atajos que guían al
 * usuario a uno de los tres flujos principales del dominio.
 *
 * Nota futura: el tipo QuickReply y el campo `quickReplies` en la response
 * del backend siguen existiendo. Cuando se quiera agregar quick replies
 * contextuales dinámicas (sugeridas por el LLM en el medio de la
 * conversación), solo hay que agregar la tool suggestQuickReplies al
 * backend y leer `result.data.quickReplies` acá.
 */
const WELCOME_QUICK_REPLIES: QuickReply[] = [
  { label: "Perdí una mascota", value: "Perdí a mi mascota, ¿qué hago?" },
  { label: "Encontré una mascota", value: "Encontré una mascota en la calle" },
  { label: "Quiero adoptar", value: "¿Cómo hago para adoptar una mascota?" },
];

type DisplayMessage = ChatbotMessage | { role: "error"; type: "text"; text: string };

/**
 * Widget de chatbot flotante.
 *
 * Features:
 * - Burbujas user/assistant con auto-scroll.
 * - Indicador "escribiendo..." durante la espera.
 * - Welcome quick replies al inicio (frontend, sin backend).
 * - sessionId persistido en localStorage.
 * - Auth automática vía cookie auth_token (proxy de Next.js).
 * - Botón "nueva conversación" que resetea todo.
 */
export function ChatbotWidget() {
  // El widget se monta globalmente en el root layout, así que aparece en
  // todas las pantallas. En el panel de administrador la burbuja flotante
  // se superpone a modales y formularios, así que lo ocultamos ahí.
  const pathname = usePathname();
  const hiddenOnAdmin = pathname?.startsWith("/admin") ?? false;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  // Quick replies CONTEXTUALES (las que vienen del backend, ej: cuando se
  // activa el auth gate y queremos ofrecer "Buscar reportes" / "Iniciar
  // sesión"). Se muestran hasta que el usuario manda un nuevo mensaje.
  const [contextualReplies, setContextualReplies] = useState<QuickReply[]>([]);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cargar sessionId persistido al montar
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) setSessionId(stored);
  }, []);

  // Auto-scroll cada vez que llegan mensajes nuevos o aparece typing
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Focus en el input al abrir el panel
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      // Optimistic: agregar el mensaje del usuario inmediatamente
      setMessages((prev) => [
        ...prev,
        { role: "user", type: "text", text: trimmed },
      ]);
      setInput("");
      setIsTyping(true);
      // Las quick replies contextuales previas dejan de aplicar apenas el
      // usuario decide enviar algo, sea tocando un botón o tipeando.
      setContextualReplies([]);

      const result = await sendChatbotMessage({
        sessionId,
        message: trimmed,
      });

      setIsTyping(false);

      if (!result.ok || !result.data) {
        setMessages((prev) => [
          ...prev,
          {
            role: "error",
            type: "text",
            text: result.error || "No se pudo enviar el mensaje.",
          },
        ]);
        return;
      }

      // Guardar sessionId si es nuevo o cambió
      if (result.data.sessionId && result.data.sessionId !== sessionId) {
        setSessionId(result.data.sessionId);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            SESSION_STORAGE_KEY,
            result.data.sessionId,
          );
        }
      }

      // Agregar respuesta del asistente
      const assistantMessages = result.data.messages || [];
      setMessages((prev) => [...prev, ...assistantMessages]);

      // Si el backend mandó quick replies contextuales (ej. auth gate),
      // las guardamos para mostrarlas debajo del último mensaje.
      if (result.data.quickReplies && result.data.quickReplies.length > 0) {
        setContextualReplies(result.data.quickReplies);
      }
    },
    [sessionId, isTyping],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickReply = (qr: QuickReply) => {
    sendMessage(qr.value);
  };

  const handleReset = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    }
    setSessionId(null);
    setMessages([]);
    setInput("");
    setContextualReplies([]);
    toast.info("Conversación reiniciada");
  };

  // Welcome replies solo al inicio (sin conversación todavía)
  const conversationNotStarted = messages.length === 0;
  const showWelcomeReplies = conversationNotStarted && !isTyping;

  // No renderizamos nada en el panel de administrador. El return va después
  // de los hooks para no violar las reglas de hooks de React.
  if (hiddenOnAdmin) return null;

  return (
    <>
      {/* FAB (botón flotante cerrado) */}
      {!isOpen && (
        <button
          className="chatbot-fab"
          onClick={() => setIsOpen(true)}
          aria-label="Abrir chat"
          title="Chatear con el asistente"
        >
          💬
        </button>
      )}

      {/* Panel abierto */}
      {isOpen && (
        <div
          className="chatbot-panel"
          role="dialog"
          aria-label="Asistente de Huellitas Unidas"
        >
          <div className="chatbot-header">
            <div className="chatbot-header-title">
              <span className="chatbot-header-status" aria-hidden="true" />
              Asistente
            </div>
            <div className="chatbot-header-actions">
              <button
                className="chatbot-header-btn"
                onClick={handleReset}
                title="Nueva conversación"
                aria-label="Nueva conversación"
              >
                ↻
              </button>
              <button
                className="chatbot-header-btn"
                onClick={() => setIsOpen(false)}
                title="Cerrar"
                aria-label="Cerrar chat"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="chatbot-body" ref={bodyRef}>
            {conversationNotStarted && !isTyping && (
              <div className="chatbot-empty">
                <div className="chatbot-empty-icon" aria-hidden="true">
                  🐾
                </div>
                ¡Hola! Te puedo ayudar a buscar mascotas perdidas, encontradas
                o iniciar una adopción.
                <br />
                Escribime algo para empezar o tocá una opción.
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chatbot-message ${msg.role}`}
              >
                {msg.text}
              </div>
            ))}

            {isTyping && (
              <div className="chatbot-typing" aria-label="Escribiendo">
                <span />
                <span />
                <span />
              </div>
            )}
          </div>

          {showWelcomeReplies && (
            <div className="chatbot-quick-replies">
              {WELCOME_QUICK_REPLIES.map((qr) => (
                <button
                  key={qr.value}
                  className="chatbot-quick-reply"
                  onClick={() => handleQuickReply(qr)}
                  disabled={isTyping}
                >
                  {qr.label}
                </button>
              ))}
            </div>
          )}

          {/* Quick replies CONTEXTUALES enviadas por el backend (ej. auth gate). */}
          {contextualReplies.length > 0 && !isTyping && (
            <div className="chatbot-quick-replies">
              {contextualReplies.map((qr) => (
                <button
                  key={qr.value}
                  className="chatbot-quick-reply"
                  onClick={() => handleQuickReply(qr)}
                  disabled={isTyping}
                >
                  {qr.label}
                </button>
              ))}
            </div>
          )}

          <form className="chatbot-input-row" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              className="chatbot-input"
              placeholder="Escribí tu mensaje..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
              maxLength={2000}
              aria-label="Mensaje"
            />
            <button
              type="submit"
              className="chatbot-send"
              disabled={isTyping || !input.trim()}
              aria-label="Enviar"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}
