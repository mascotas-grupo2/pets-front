"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { io, type Socket } from "socket.io-client";
import { useAppSelector } from "@/redux/hooks";
import {
  getNotifications,
  getUnreadCount,
  getWsToken,
  markNotificationRead,
  markAllNotificationsRead,
  type Notification,
} from "@/services/notifications";

// El polling queda como FALLBACK; el push en tiempo real lo da el websocket.
const POLL_MS = 60000;
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001";

type State = { items: Notification[]; unread: number; loading: boolean };

let state: State = { items: [], unread: 0, loading: false };
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}
function setState(patch: Partial<State>) {
  state = { ...state, ...patch };
  emit();
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
const getSnapshot = () => state;

async function pollCount() {
  const res = await getUnreadCount();
  if (res.ok && res.data) setState({ unread: res.data.unread });
}

async function refresh() {
  const res = await getNotifications(20);
  if (res.ok && res.data) {
    setState({ items: res.data.items, unread: res.data.unread });
  }
}

async function load() {
  setState({ loading: true });
  await refresh();
  setState({ loading: false });
}

async function markRead(id: number) {
  await markNotificationRead(id);
  setState({
    items: state.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
    unread: Math.max(0, state.unread - 1),
  });
}

async function markAll() {
  await markAllNotificationsRead();
  setState({
    items: state.items.map((n) => ({ ...n, read: true })),
    unread: 0,
  });
}

// Una sola tanda de polling compartida, con conteo de referencias: arranca con
// el primer consumidor montado y se frena cuando se desmonta el último.
let pollTimer: ReturnType<typeof setInterval> | null = null;
let refCount = 0;

let socket: Socket | null = null;
let socketRetry: ReturnType<typeof setTimeout> | null = null;

async function connectSocket() {
  if (socket) return;
  const res = await getWsToken();
  // Si nos desmontamos mientras pedíamos el token, no creamos un socket huérfano.
  if (refCount === 0) return;
  if (!res.ok || !res.data?.token) {
    // El backend pudo estar reiniciándose: reintentamos (el polling cubre mientras
    // tanto). socket.io ya reconecta solo una vez establecida la conexión; esto
    // cubre el caso en que falla el PRIMER pedido del token.
    if (socketRetry) clearTimeout(socketRetry);
    socketRetry = setTimeout(() => {
      socketRetry = null;
      if (refCount > 0 && !socket) void connectSocket();
    }, 5000);
    return;
  }
  socket = io(WS_URL, {
    auth: { token: res.data.token },
    transports: ["websocket", "polling"],
    withCredentials: true,
  });
  // Push: al llegar una notificación nueva, refrescamos lista + contador al instante.
  socket.on("notification:new", () => void refresh());
}

function disconnectSocket() {
  if (socketRetry) {
    clearTimeout(socketRetry);
    socketRetry = null;
  }
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

function startPolling() {
  refCount += 1;
  if (refCount === 1) {
    void pollCount();
    void connectSocket();
    pollTimer = setInterval(() => void pollCount(), POLL_MS);
  }
}
function stopPolling() {
  refCount = Math.max(0, refCount - 1);
  if (refCount === 0) {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    disconnectSocket();
  }
}

export function useNotifications() {
  const isLoggedIn = useAppSelector((s) => s.user.isLoggedIn);
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (!isLoggedIn) {
      setState({ items: [], unread: 0 });
      return;
    }
    startPolling();
    return () => stopPolling();
  }, [isLoggedIn]);

  return {
    items: snap.items,
    unread: snap.unread,
    loading: snap.loading,
    load: useCallback(load, []),
    refresh: useCallback(refresh, []),
    markRead: useCallback(markRead, []),
    markAll: useCallback(markAll, []),
  };
}
