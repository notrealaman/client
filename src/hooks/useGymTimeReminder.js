'use client';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { notifications as notificationsApi } from '@/lib/api';

export function useGymTimeReminder() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.gymTime) return;

    const poll = () => {
      notificationsApi.gymTimeCheck().catch(() => {});
    };

    poll();
    const interval = setInterval(poll, 60000);
    return () => clearInterval(interval);
  }, [user]);
}
