'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth';
import { trainers as trainersApi, sessions as sessionsApi } from '@/lib/api';
import { motion } from 'framer-motion';
import {
  Users, Loader2, Search, MessageSquare, Calendar,
  ChevronRight, User, Dumbbell, Clock
} from 'lucide-react';

function TraineesContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [trainees, setTrainees] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const data = await trainersApi.trainees();
      setTrainees(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
    </div>
  );

  const filtered = trainees.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">My Trainees</h1>
          <p className="text-dark-400 mt-1">{trainees.length} trainee{trainees.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
        <input
          type="text" placeholder="Search trainees..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-dark-800/50 border border-dark-700/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-primary-500/50 transition-colors"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-dark-500">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No trainees found</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Link href={`/trainer/trainees/${t.id}`}
                className="block bg-dark-800/30 border border-dark-700/30 rounded-2xl p-5 card-hover hover:border-primary-500/30 transition-all group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-lg font-bold text-white">
                    {t.name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white group-hover:text-primary-400 transition-colors truncate">
                      {t.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-dark-400 truncate">{t.email}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-dark-600 group-hover:text-primary-400 transition-colors" />
                </div>
                <div className="flex items-center gap-4 text-xs text-dark-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {t.totalSessions} sessions
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {t.activeSessions} active
                  </span>
                </div>
                {t.lastSession && (
                  <p className="text-xs text-dark-500 mt-2">
                    Last session: {new Date(t.lastSession).toLocaleDateString()}
                  </p>
                )}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default function TraineesPage() {
  return <ProtectedRoute><TraineesContent /></ProtectedRoute>;
}