"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  sendChatbotMessage,
  type ChatbotMessage,
  type QuickReply,
} from "@/services/chatbot";
import "@/styles/chatbot.css";

const SESSION_STORAGE_KEY = "chatbot_session_id";

/**
 * Quick replies de bienvenida.
 *
 * Vienen del frontend (no del backend) por una razón de UX: solo tienen
 * sentido cuando el usuario abre el widget y todavía no escribió nada.
 * Una vez que la conversación arranca, los atajos de "perdí/encontré/adopto"
 * dejan de aplicar y solo distraen.
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
 * - Burbujas user/assistant con auto-scroll
 * - Indicador "escribiendo..." durante la espera
 * - Quick replies de bienvenida (solo cuando el historial está vacío)
 * - sessionId persistido en localStorage (sobrevive a navegación)
 * - Auth automática vía cookie auth_token (gestionada por el proxy de Next)
 * - Botón "nueva conversación" que resetea el contexto
 */
export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cargar sessionId persistido al montar
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) setSessionId(stored);
  }, []);

  // Auto-scroll al final cada vez que llegan mensajes nuevos o aparece typing
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Focus en el input cuando se abre el panel
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

      // Guardar sessionId en localStorage (primera vez o si cambió)
      if (result.data.sessionId && result.data.sessionId !== sessionId) {
        setSessionId(result.data.sessionId);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            SESSION_STORAGE_KEY,
            result.data.sessionId,
          );
        }
      }

      // Agregar respuesta(s) del asistente
      const assistantMessages = result.data.messages || [];
      setMessages((prev) => [...prev, ...assistantMessages]);
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
    toast.info("Conversación reiniciada");
  };

  // Las welcome replies solo se muestran cuando no hay conversación aún
  const showWelcomeReplies = messages.length === 0 && !isTyping;

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
            {messages.length === 0 && !isTyping && (
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

          {/* Quick replies de bienvenida: solo cuando no hay conversación */}
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
