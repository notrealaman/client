'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { notifications as notificationsApi } from '@/lib/api';

function wssUrl() {
  if (typeof window === 'undefined') return '';
  const u = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
  return `${u.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:')}/ws`;
}

export function useNotifications() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [list, setList] = useState([]);
  const wsRef = useRef(null);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await notificationsApi.unreadCount();
      setUnreadCount(res.count);
    } catch { /* ignore */ }
  }, []);

  const fetchList = useCallback(async () => {
    try {
      const res = await notificationsApi.list();
      setList(res);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchUnread();
    fetchList();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user, fetchUnread, fetchList]);

  // WebSocket listener for real-time notification events
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    let ws;
    let reconnectTimer;

    const connect = () => {
      if (ws) ws.close();
      try {
        ws = new WebSocket(`${wssUrl()}?token=${token}`);
        wsRef.current = ws;
        ws.onmessage = (e) => {
          try {
            const d = JSON.parse(e.data);
            if (d.type === 'notification') {
              setUnreadCount(prev => prev + 1);
              setList(prev => [d.notification, ...prev]);
            }
          } catch {}
        };
        ws.onclose = () => {
          reconnectTimer = setTimeout(connect, 5000);
        };
        ws.onerror = () => ws.close();
      } catch {
        reconnectTimer = setTimeout(connect, 5000);
      }
    };

    connect();
    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimer);
    };
  }, [user]);

  return { unreadCount, list, fetchUnread, fetchList };
}
