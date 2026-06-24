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
  const lastId = useRef(null);
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
            if (d.type === 'new_message') handler.current({ id: d.id || Date.now().toString(), senderId: d.senderId, content: d.content, conversationId: d.conversationId, createdAt: d.createdAt });
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
          const last = msgs[msgs.length - 1];
          if (last && last.id !== lastId.current) { lastId.current = last.id; handler.current(last); }
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
