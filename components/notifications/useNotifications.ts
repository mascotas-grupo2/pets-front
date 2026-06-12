"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useAppSelector } from "@/redux/hooks";
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  type Notification,
} from "@/services/notifications";

const POLL_MS = 20000;

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

function startPolling() {
  refCount += 1;
  if (refCount === 1) {
    void pollCount();
    pollTimer = setInterval(() => void pollCount(), POLL_MS);
  }
}
function stopPolling() {
  refCount = Math.max(0, refCount - 1);
  if (refCount === 0 && pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
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
