"use client";

import { useEffect, useState, useRef, use } from "react";
import { getConversation, sendMessage, Message, ConversationProfile } from "@/services/messages.services";
import { request } from "@/services/request";
import axiosInstance from "@/services/axios";
import { UserCircle2, Send, ArrowLeft } from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ChatPage({ params }: { params: Promise<{ userId: string }> }) {
  const resolvedParams = use(params);
  const otherUserId = Number(resolvedParams.userId);
  const user = useAppSelector((state) => state.user);
  const router = useRouter();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [profileData, setProfileData] = useState<ConversationProfile | null>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [content, setContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversation = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const response = await getConversation(otherUserId);
      if (response.ok && response.data) {
        setMessages(response.data.messages || []);
        if (response.data.profile) {
          setProfileData(response.data.profile);
        }
      }
    } catch (err) {
      console.error("Error fetching conversation", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchOtherUser = async () => {
    try {
      // Usar request para buscar detalles del otro usuario
      // Se asume que existe un endpoint de usuario publico, o lo extraemos de los mensajes si es posible.
      // Por simplicidad usaremos un endpoint get común si existe, o dejaremos el nombre genérico
      const response = await request<any>(() => axiosInstance.get(`/user/common/${otherUserId}`));
      if (response.ok && response.data) {
        setOtherUser(response.data);
      }
    } catch (err) {
      console.error("Error fetching other user info", err);
    }
  };

  useEffect(() => {
    if (!user.isLoggedIn) {
      router.push("/login");
      return;
    }
    
    fetchOtherUser();
    fetchConversation(true);
    
    const interval = setInterval(() => fetchConversation(false), 5000);
    return () => clearInterval(interval);
  }, [user, otherUserId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sending) return;

    setSending(true);
    try {
      const response = await sendMessage(otherUserId, content);
      if (response.ok && response.data) {
        setMessages([...messages, response.data]);
        setContent("");
      } else {
        toast.error("No se pudo enviar el mensaje");
      }
    } catch (err) {
      toast.error("Error de conexión");
    } finally {
      setSending(false);
    }
  };

  if (loading && user.isLoggedIn) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-3xl flex flex-col h-[85vh]">
      {/* Header */}
      <div className="bg-white p-4 flex items-center gap-4 rounded-t-xl border border-gray-200 border-b-0 shadow-sm">
        <Link href="/messages" className="text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        {otherUser?.photo ? (
          <img src={otherUser.photo} alt={otherUser.name} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <UserCircle2 className="w-10 h-10 text-gray-400" />
        )}
        <h2 className="text-lg font-semibold text-gray-800">
          {otherUser?.name || profileData?.name || "Usuario"}
        </h2>
      </div>

      {profileData && (
        <div className="bg-blue-50 border-x border-b border-blue-200 p-3 text-sm flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-blue-900">Estado:</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              profileData.status?.toLowerCase() === 'activo' ? 'bg-green-100 text-green-700' :
              profileData.status?.toLowerCase() === 'bloqueado' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {profileData.status || "Desconocido"}
            </span>
          </div>
          <div className="flex-1 text-blue-800">
            <span className="font-semibold">Nota de evaluación: </span>
            {profileData.evaluationNote || <span className="italic opacity-70">Sin notas</span>}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 bg-gray-50 p-4 overflow-y-auto border-x border-gray-200 flex flex-col gap-3">
        {messages.map((msg) => {
          const isMine = msg.senderId === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  isMine 
                    ? "bg-blue-600 text-white rounded-br-sm" 
                    : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                <div className={`text-[10px] mt-1 text-right ${isMine ? "text-blue-100" : "text-gray-400"}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {isMine && (
                    <span className="ml-1">
                      {msg.read ? "✓✓" : "✓"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            <p>No hay mensajes en esta conversación.</p>
            <p className="text-sm mt-1">¡Escribe el primer mensaje!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form 
        onSubmit={handleSend}
        className="bg-white p-3 md:p-4 rounded-b-xl border border-gray-200 shadow-sm flex items-end gap-2"
      >
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 max-h-32 min-h-[44px] p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
        />
        <button
          type="submit"
          disabled={!content.trim() || sending}
          className="bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
