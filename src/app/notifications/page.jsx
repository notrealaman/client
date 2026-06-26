'use client';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useNotifications } from '@/hooks/useNotifications';
import { notifications as notificationsApi } from '@/lib/api';
import { Bell, CheckCheck, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

function NotificationsContent() {
  const { list, fetchList, fetchUnread } = useNotifications();

  const markAllRead = async () => {
    await notificationsApi.markAllRead();
    fetchList();
    fetchUnread();
  };

  const markRead = async (id) => {
    await notificationsApi.markRead(id);
    fetchList();
    fetchUnread();
  };

  const typeIcon = (type) => {
    switch (type) {
      case 'NEW_MESSAGE': return '💬';
      case 'STREAK': return '🔥';
      case 'GYM_TIME': return '🏋️';
      case 'PROFILE_COMPLETE': return '✅';
      default: return '🔔';
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 pt-20 pb-24 px-4">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 text-dark-400 hover:text-white rounded-lg hover:bg-dark-800/50 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-white">Notifications</h1>
          </div>
          {list.some(n => !n.read) && (
            <button onClick={markAllRead} className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 transition-colors">
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
          )}
        </div>

        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-dark-500">
            <Bell className="w-12 h-12 mb-4" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {list.map((n) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${n.read ? 'bg-dark-900/30 border-dark-800/30' : 'bg-dark-900/60 border-dark-700/60'}`}
                onClick={() => !n.read && markRead(n.id)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">{typeIcon(n.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${n.read ? 'text-dark-400' : 'text-white font-medium'}`}>{n.title}</p>
                    <p className="text-xs text-dark-500 mt-0.5 line-clamp-2">{n.body || n.message}</p>
                    <p className="text-[10px] text-dark-600 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-primary-500 mt-2 shrink-0" />}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <NotificationsContent />
    </ProtectedRoute>
  );
}
