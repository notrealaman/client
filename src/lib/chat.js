'use client';
import { useRef, useCallback, useEffect } from 'react';
import { messages as api } from './api';

function wssUrl() {
  const u = process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/, '');
  return `${u.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:')}/ws`;
}

export function useChatRealtime(conversationId, token, onMessage) {
  const ws = useRef(null);
  const timer = useRef(null);
  const knownIds = useRef(new Set());
  const handler = useRef(onMessage);
  handler.current = onMessage;

  useEffect(() => {
    if (!conversationId || !token) return;

    const connect = () => {
      ws.current?.close();
      try {
        const s = new WebSocket(`${wssUrl()}?token=${token}`);
        ws.current = s;
        s.onopen = () => { clearInterval(timer.current); timer.current = null; };
        s.onmessage = (e) => {
          try {
            const d = JSON.parse(e.data);
            if (d.type === 'new_message') {
              const id = d.id || Date.now().toString();
              if (knownIds.current.has(id)) return;
              knownIds.current.add(id);
              handler.current({ id, senderId: d.senderId, sender: d.sender, content: d.content, conversationId: d.conversationId, createdAt: d.createdAt });
            }
          } catch {}
        };
        s.onclose = () => { setTimeout(connect, 3000); poll(); };
        s.onerror = () => s.close();
      } catch { poll(); }
    };

    const poll = () => {
      if (timer.current) return;
      const tick = async () => {
        try {
          const msgs = await api.getMessages(conversationId);
          const newMsgs = msgs.filter(m => !knownIds.current.has(m.id));
          for (const m of newMsgs) {
            knownIds.current.add(m.id);
            handler.current(m);
          }
        } catch {}
      };
      tick();
      timer.current = setInterval(tick, 3000);
    };

    connect();
    return () => { ws.current?.close(); clearInterval(timer.current); };
  }, [conversationId, token]);

  return useCallback((receiverId, content) => {
    if (ws.current?.readyState === WebSocket.OPEN)
      ws.current.send(JSON.stringify({ type: 'message', receiverId, content, conversationId }));
  }, [conversationId]);
}
