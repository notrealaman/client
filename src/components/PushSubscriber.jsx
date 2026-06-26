'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { subscribeUser } from '@/lib/push';
import { Bell, X } from 'lucide-react';

export default function PushSubscriber() {
  const { user } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const done = useRef(false);

  // On desktop only: auto-request permission on login
  useEffect(() => {
    if (!user || done.current) return;
    if (typeof window === 'undefined') return;

    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const hasPush = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

    if (!hasPush) return; // iOS Safari / unsupported

    if (isMobile) {
      // Mobile: show prompt instead of auto-request (browsers block auto permission)
      if (Notification.permission === 'default' && !dismissed) {
        setShowPrompt(true);
      } else if (Notification.permission === 'granted') {
        done.current = true;
        subscribeUser().catch(() => {});
      }
    } else {
      // Desktop: auto-request works
      done.current = true;
      if (Notification.permission === 'granted') {
        subscribeUser().catch(() => {});
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then((perm) => {
          if (perm === 'granted') subscribeUser().catch(() => {});
        });
      }
    }
  }, [user, dismissed]);

  const handleEnable = async () => {
    setShowPrompt(false);
    done.current = true;
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      await subscribeUser();
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[70] animate-slide-up">
      <div className="bg-dark-800 border border-dark-700 rounded-2xl p-4 shadow-xl backdrop-blur-xl">
        <button onClick={handleDismiss} className="absolute top-3 right-3 text-dark-500 hover:text-white">
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4 text-primary-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">Get notified</p>
            <p className="text-xs text-dark-400 mt-0.5">Messages, gym reminders &amp; streak alerts even when you&apos;re away.</p>
            <button onClick={handleEnable} className="mt-3 w-full py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl text-sm hover:from-primary-500 transition-all">
              Enable Notifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
