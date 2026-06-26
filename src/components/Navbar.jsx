'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Dumbbell, Menu, X, User, LogOut, LayoutDashboard, CalendarDays, MessageSquare, Users, Apple, Calendar, Settings, UserCheck, Bell } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isTrainer = user && (user.role === 'TRAINER' || user.role === 'BOTH');

  const baseLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/workout-planner', label: 'Workouts', icon: Dumbbell },
    { href: '/calendar', label: 'Schedule', icon: Calendar },
    { href: '/sessions', label: 'Sessions', icon: CalendarDays },
    { href: '/diet-plan', label: 'Diet', icon: Apple },
  ];

  const trainerLinks = isTrainer ? [
    { href: '/trainer/trainees', label: 'Trainees', icon: UserCheck },
    { href: '/trainer/profile', label: 'Trainer Profile', icon: User },
  ] : [];

  const navLinks = user ? [...baseLinks, ...trainerLinks] : [];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white hidden sm:block">
                Gym<span className="text-primary-400">Buddy</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {user && navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-800/50 rounded-lg transition-all"
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <NotificationBell />
                  <Link
                    href="/messages"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-800/50 rounded-lg transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="hidden lg:inline">Messages</span>
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-800/50 rounded-lg transition-all"
                  >
                    <Settings className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-800/50 rounded-lg transition-all"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-xs font-bold text-white">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <span className="max-w-[100px] truncate">{user.name}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-dark-400 hover:text-red-400 hover:bg-dark-800/50 rounded-lg transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-800/50 rounded-lg transition-all"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 rounded-lg transition-all shadow-lg shadow-primary-500/20"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-dark-300 hover:text-white rounded-lg"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-dark-800/50 bg-dark-950/95 backdrop-blur-xl animate-slide-down">
            <div className="px-4 py-3 space-y-1">
              {user && navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 text-sm text-dark-300 hover:text-white hover:bg-dark-800/50 rounded-lg transition-all"
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}
              <hr className="border-dark-800 my-2" />
              {user ? (
                <>
                  <Link
                    href="/notifications"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 text-sm text-dark-300 hover:text-white hover:bg-dark-800/50 rounded-lg transition-all"
                  >
                    <Bell className="w-5 h-5" />
                    Notifications
                  </Link>
                  <Link
                    href="/messages"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 text-sm text-dark-300 hover:text-white hover:bg-dark-800/50 rounded-lg transition-all"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Messages
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 text-sm text-dark-300 hover:text-white hover:bg-dark-800/50 rounded-lg transition-all"
                  >
                    <Settings className="w-5 h-5" />
                    Settings
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 text-sm text-dark-300 hover:text-white hover:bg-dark-800/50 rounded-lg transition-all"
                  >
                    <User className="w-5 h-5" />
                    Profile
                  </Link>
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="flex items-center gap-3 px-3 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-dark-800/50 rounded-lg transition-all w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 text-sm text-dark-300 hover:text-white hover:bg-dark-800/50 rounded-lg transition-all"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg transition-all text-center"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {user && (
        <>
          {/* Floating Chat Button */}
          <Link
            href="/messages"
            className="fixed bottom-20 md:bottom-6 right-4 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30 flex items-center justify-center hover:scale-105 transition-transform"
          >
            <MessageSquare className="w-6 h-6 text-white" />
          </Link>

          {/* Mobile Bottom Nav */}
          <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-dark-950/95 backdrop-blur-xl border-t border-dark-800/50 safe-area-bottom">
            <div className="flex items-center justify-around px-2 py-1">
              {[...baseLinks.slice(0, 3), ...(isTrainer ? trainerLinks.slice(0, 1) : []), ...baseLinks.slice(3, 4)].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex flex-col items-center gap-0.5 px-2 py-2 text-[10px] text-dark-400 hover:text-primary-400 transition-colors"
                >
                  <link.icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="h-16" />
      {user && <div className="h-16 md:hidden" />}
      {user && <div className="h-6 md:hidden" />}
    </>
  );
}
