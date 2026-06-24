'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { LayoutDashboard, Users, CalendarDays, MessageSquare, User } from 'lucide-react';

export default function BottomNav() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const tabs = [
    { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { href: '/trainers', label: 'Trainers', icon: Users },
    { href: '/sessions', label: 'Sessions', icon: CalendarDays },
    { href: '/messages', label: 'Chat', icon: MessageSquare },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-dark-950/95 backdrop-blur-xl border-t border-dark-800/50 safe-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg transition-all min-w-[56px] ${
                isActive
                  ? 'text-primary-400'
                  : 'text-dark-400 hover:text-dark-200'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${isActive ? 'drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]' : ''}`} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
