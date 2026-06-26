'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth';
import { sessions as sessionsApi, reviews as reviewsApi } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  CalendarDays, Clock, MapPin, Star, Loader2, Check, X as XIcon,
  MessageSquare, ChevronDown, Dumbbell
} from 'lucide-react';

function SessionsContent() {
  const { user } = useAuth();
  const [sessionList, setSessionList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const isTrainer = user?.role === 'TRAINER' || user?.role === 'BOTH';

  useEffect(() => { loadSessions(); }, []);

  const loadSessions = async () => {
    try {
      const data = await sessionsApi.list();
      setSessionList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await sessionsApi.update(id, { status });
      toast.success(`Session ${status.toLowerCase()}`);
      loadSessions();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewModal) return;
    setReviewLoading(true);
    try {
      await reviewsApi.create({ sessionId: reviewModal.id, rating: reviewRating, comment: reviewComment });
      toast.success('Review submitted!');
      setReviewModal(null);
      setReviewComment('');
      setReviewRating(5);
      loadSessions();
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const now = new Date();

  const filtered = sessionList.filter(s => {
    if (activeTab === 'upcoming') return (s.status === 'PENDING' || s.status === 'CONFIRMED') && new Date(s.endDate) >= now;
    if (activeTab === 'completed') return s.status === 'COMPLETED';
    if (activeTab === 'cancelled') return s.status === 'CANCELLED';
    return true;
  });

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">My <span className="text-gradient">Sessions</span></h1>
          <p className="text-dark-400 mt-1">{isTrainer ? 'Manage your training sessions' : 'View your booked sessions'}</p>
        </div>
      </div>

      <div className="flex gap-1 bg-dark-800/50 border border-dark-700/50 rounded-xl p-1 mb-6 overflow-x-auto">
        {['upcoming', 'completed', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all capitalize ${
              activeTab === tab
                ? 'bg-primary-500/20 text-primary-400 shadow-sm'
                : 'text-dark-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <CalendarDays className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No {activeTab} sessions</h3>
          <p className="text-dark-400">When you book sessions, they&apos;ll appear here.</p>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((session) => {
              const otherPerson = isTrainer ? session.trainee : session.trainer;
              const doneDays = session.workoutDays?.filter(d => d.completed).length || 0;
              const totalDays = session.totalDays || 1;
              const progress = Math.round((doneDays / totalDays) * 100);
              const statusColors = {
                PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                CONFIRMED: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
                COMPLETED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
              };

              return (
                <motion.div
                  key={session.id}
                  variants={item}
                  layout
                  className="bg-dark-800/30 border border-dark-700/30 rounded-2xl p-5 card-hover"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
                      {otherPerson?.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                        <h3 className="text-base font-semibold text-white truncate">{otherPerson?.name}</h3>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full inline-block w-fit border ${statusColors[session.status] || 'bg-dark-700 text-dark-300'}`}>
                          {session.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-dark-400">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {new Date(session.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          {session.endDate && ` - ${new Date(session.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {totalDays} {totalDays === 1 ? 'day' : 'days'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Dumbbell className="w-3.5 h-3.5" />
                          {doneDays}/{totalDays} days done
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      {session.notes && (
                        <p className="text-sm text-dark-400 mt-2 italic">&ldquo;{session.notes}&rdquo;</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isTrainer && session.status === 'PENDING' && (
                        <>
                          <button onClick={() => updateStatus(session.id, 'CONFIRMED')} className="p-2 bg-primary-500/10 border border-primary-500/20 rounded-lg text-primary-400 hover:bg-primary-500/20 transition-all">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => updateStatus(session.id, 'CANCELLED')} className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 transition-all">
                            <XIcon className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {!isTrainer && session.status === 'CONFIRMED' && (
                        <button onClick={() => updateStatus(session.id, 'CANCELLED')} className="px-3 py-1.5 text-xs font-medium bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 transition-all">
                          Cancel
                        </button>
                      )}
                      {!isTrainer && session.status === 'COMPLETED' && !session.review && (
                        <button onClick={() => setReviewModal(session)} className="px-3 py-1.5 text-xs font-medium bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 hover:bg-amber-500/20 transition-all flex items-center gap-1">
                          <Star className="w-3 h-3" /> Review
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {reviewModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pb-4 sm:pb-0">
          <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" onClick={() => setReviewModal(null)} />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full sm:max-w-md bg-dark-800 border border-dark-700 rounded-2xl p-6 sm:p-8 mx-4 sm:mx-0 max-h-[90vh] overflow-y-auto"
          >
            <button onClick={() => setReviewModal(null)} className="absolute top-4 right-4 text-dark-400 hover:text-white">
              <XIcon className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-6">Rate Your Session</h2>
            <form onSubmit={submitReview} className="space-y-5">
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-dark-400">How was your session?</p>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map((star) => (
                    <button key={star} type="button" onClick={() => setReviewRating(star)} className="transition-all hover:scale-110">
                      <Star className={`w-10 h-10 ${star <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-dark-600'} transition-colors`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Comment (optional)</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience..."
                  rows={3}
                  className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={reviewLoading}
                className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {reviewLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Star className="w-5 h-5" />}
                {reviewLoading ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function SessionsPage() {
  return <ProtectedRoute><SessionsContent /></ProtectedRoute>;
}
