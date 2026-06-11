"use client";

import { MessageSquare } from "lucide-react";

export default function EmptyState() {
  return (
    <section className="msg-chat-panel">
      <div className="msg-empty">
        <MessageSquare
          className="w-12 h-12 mx-auto mb-3 text-gray-300"
        />

        <p>
          Seleccioná una conversación
          para comenzar.
        </p>
      </div>
    </section>
  );
}
