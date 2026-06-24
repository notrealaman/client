'use client';
import { usePwaInstall } from '@/lib/usePwaInstall';

export default function PwaInstallPrompt() {
  const { canInstall, install, dismiss } = usePwaInstall();

  if (!canInstall) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 md:bottom-8 md:left-auto md:right-8 md:w-80">
      <div className="bg-dark-800 border border-dark-600 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-lg font-bold text-white">
            GB
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-dark-50">GymBuddy</p>
            <p className="text-xs text-dark-400">Install for app-like experience</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={dismiss}
            className="flex-1 px-3 py-2 text-sm rounded-xl bg-dark-700 text-dark-300 hover:bg-dark-600 transition-colors"
          >
            Not now
          </button>
          <button
            onClick={install}
            className="flex-1 px-3 py-2 text-sm rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
