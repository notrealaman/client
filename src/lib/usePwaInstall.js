'use client';
import { useState, useEffect, useCallback } from 'react';

let deferredPrompt = null;
const listeners = new Set();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    listeners.forEach(fn => fn(true));
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    listeners.forEach(fn => fn(false));
  });
}

export function usePwaInstall() {
  const [canInstall, setCanInstall] = useState(!!deferredPrompt);

  useEffect(() => {
    const fn = (val) => setCanInstall(val);
    listeners.add(fn);
    return () => listeners.delete(fn);
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      deferredPrompt = null;
      setCanInstall(false);
      return true;
    }
    deferredPrompt = null;
    setCanInstall(false);
    return false;
  }, []);

  const dismiss = useCallback(() => {
    setCanInstall(false);
  }, []);

  return { canInstall, install, dismiss };
}
