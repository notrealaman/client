'use client';
import { useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { subscribeUser, unsubscribeUser } from '@/lib/push';

export default function PushSubscriber() {
  const { user } = useAuth();
  const done = useRef(false);

  useEffect(() => {
    if (!user || done.current) return;
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) return;

    done.current = true;

    const init = async () => {
      try {
        await navigator.serviceWorker.ready;
        const existing = await navigator.serviceWorker.ready.then(r => r.pushManager.getSubscription());

        if (!existing) {
          const perm = await Notification.requestPermission();
          if (perm === 'granted') {
            await subscribeUser();
          }
        }
      } catch {}
    };

    init();
  }, [user]);

  return null;
}
