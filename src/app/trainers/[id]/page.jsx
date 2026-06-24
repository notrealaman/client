'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth';
import { trainers as trainersApi, sessions as sessionsApi, messages as messagesApi, reviews as reviewsApi } from '@/lib/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  MapPin, Star, Award, DollarSign, Clock, Calendar, Check, X,
  MessageSquare, Shield, Loader2, ChevronLeft, GraduationCap, Send
} from 'lucide-react';

function TrainerDetailContent() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [bookingStartDate, setBookingStartDate] = useState('');
  const [bookingEndDate, setBookingEndDate] = useState('');
  const [bookingDays, setBookingDays] = useState(1);
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageLoading, setMessageLoading] = useState(false);

  const isTrainer = user?.role === 'TRAINER' || user?.role === 'BOTH';
  const [completedSessions, setCompletedSessions] = useState([]);

  useEffect(() => {
    loadTrainer();
    if (!isTrainer) loadCompletedSessions();
  }, [id]);

  const loadTrainer = async () => {
    try {
      const data = await trainersApi.get(id);
      setTrainer(data);
    } catch (err) {
      toast.error('Trainer not found');
      router.push('/trainers');
    } finally {
      setLoading(false);
    }
  };

  const loadCompletedSessions = async () => {
    try {
      const data = await sessionsApi.list({ status: 'COMPLETED' });
      setCompletedSessions(data.filter(s => s.trainerId === trainer?.userId));
    } catch {}
  };

  const handleStartDateChange = (val) => {
    setBookingStartDate(val);
    if (val && bookingDays) {
      const d = new Date(val);
      d.setDate(d.getDate() + bookingDays - 1);
      setBookingEndDate(d.toISOString().split('T')[0]);
    }
  };

  const handleDaysChange = (val) => {
    const days = parseInt(val) || 1;
    setBookingDays(days);
    if (bookingStartDate) {
      const d = new Date(bookingStartDate);
      d.setDate(d.getDate() + days - 1);
      setBookingEndDate(d.toISOString().split('T')[0]);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!bookingStartDate || !bookingDays) {
      toast.error('Please select start date and number of days');
      return;
    }
    setBookingLoading(true);
    try {
      await sessionsApi.create({
        trainerId: trainer.userId,
        startDate: new Date(bookingStartDate).toISOString(),
        endDate: new Date(bookingEndDate).toISOString(),
        totalDays: bookingDays,
        notes: bookingNotes,
      });
      toast.success('Session booked successfully!');
      setBookingOpen(false);
      setBookingStartDate('');
      setBookingEndDate('');
      setBookingDays(1);
      setBookingNotes('');
    } catch (err) {
      toast.error(err.message || 'Failed to book session');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    try {
      const sessionId = completedSessions[0]?.id;
      if (!sessionId) {
        toast.error('No completed session found to review');
        return;
      }
      await reviewsApi.create({ sessionId, rating: reviewRating, comment: reviewComment });
      toast.success('Review submitted!');
      setReviewOpen(false);
      loadTrainer();
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleMessage = async () => {
    if (!messageText.trim()) return;
    setMessageLoading(true);
    try {
      const conv = await messagesApi.createConversation(trainer.userId);
      await messagesApi.sendMessage(conv.id, messageText);
      toast.success('Message sent!');
      setMessageText('');
      router.push(`/messages/${conv.id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to send message');
    } finally {
      setMessageLoading(false);
    }
  };

  const totalCost = trainer?.hourlyRate ? bookingDays * trainer.hourlyRate : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  if (!trainer) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-dark-400 hover:text-white mb-6 transition-all">
        <ChevronLeft className="w-4 h-4" /> Back to trainers
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-dark-800/30 border border-dark-700/30 rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-3xl font-bold text-white flex-shrink-0">
                {trainer.user?.name?.charAt(0)}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white">{trainer.user?.name}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  {trainer.location && (
                    <span className="text-sm text-dark-400 flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {trainer.location}
                    </span>
                  )}
                  {trainer.avgRating && (
                    <span className="text-sm text-amber-400 flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current" /> {trainer.avgRating.toFixed(1)} ({trainer.reviewCount} reviews)
                    </span>
                  )}
                  <span className="text-sm text-dark-400 flex items-center gap-1">
                    <Award className="w-4 h-4" /> {trainer.experience} years experience
                  </span>
                </div>
                <p className="text-dark-300 mt-4 leading-relaxed">{trainer.user?.bio}</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-dark-800/30 border border-dark-700/30 rounded-2xl p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-white mb-4">Specialties</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {trainer.specialties?.map((s) => (
                <span key={s} className="px-3 py-1.5 text-sm rounded-xl bg-primary-500/10 text-primary-400 border border-primary-500/20">
                  {s}
                </span>
              ))}
            </div>
            {trainer.trainingStyle && (
              <div className="flex items-center gap-2 pt-3 border-t border-dark-700/30">
                <span className="text-xs text-dark-400">Focus:</span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  trainer.trainingStyle === 'BULK' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  trainer.trainingStyle === 'LEAN' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}>
                  {trainer.trainingStyle === 'BOTH' ? 'Bulk & Lean' : trainer.trainingStyle}
                </span>
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-dark-800/30 border border-dark-700/30 rounded-2xl p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-white mb-4">Certifications</h2>
            <div className="flex flex-wrap gap-2">
              {trainer.certifications?.map((c) => (
                <span key={c} className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <GraduationCap className="w-4 h-4" /> {c}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-dark-800/30 border border-dark-700/30 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Reviews ({trainer.reviewCount})</h2>
              {trainer.avgRating && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} className={`w-4 h-4 ${star <= Math.round(trainer.avgRating) ? 'text-amber-400 fill-amber-400' : 'text-dark-600'}`} />
                    ))}
                  </div>
                  <span className="text-dark-300 font-medium">{trainer.avgRating.toFixed(1)}</span>
                </div>
              )}
            </div>

            <div className="space-y-4 mb-6">
              {[5,4,3,2,1].map((star) => {
                const count = trainer.ratingDist?.[star] || 0;
                const pct = trainer.reviewCount > 0 ? (count / trainer.reviewCount) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3 text-sm">
                    <span className="w-8 text-dark-400 text-right">{star}</span>
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400/70 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 text-dark-400">{count}</span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-4">
              {trainer.reviews?.slice(0, 5).map((review) => (
                <div key={review.id} className="p-4 bg-dark-800/30 border border-dark-700/30 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-xs font-bold text-white">
                      {review.reviewer?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{review.reviewer?.name}</p>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map((star) => (
                          <Star key={star} className={`w-3 h-3 ${star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-dark-600'}`} />
                        ))}
                      </div>
                    </div>
                    <span className="ml-auto text-xs text-dark-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && <p className="text-sm text-dark-300">{review.comment}</p>}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-dark-800/30 border border-dark-700/30 rounded-2xl p-6 sticky top-24">
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-primary-400">${trainer.hourlyRate}</div>
              <div className="text-sm text-dark-400">per session day</div>
            </div>

            {!isTrainer && user?.id !== trainer.userId && (
              <div className="space-y-3">
                <button
                  onClick={() => setBookingOpen(true)}
                  className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Book a Session
                </button>
                <button
                  onClick={() => setMessageOpen(true)}
                  className="w-full py-3 bg-dark-800/50 border border-dark-700/50 hover:border-dark-600 text-dark-200 font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Send Message
                </button>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-dark-700/30">
              <div className="flex items-center gap-2 text-sm text-dark-400 mb-4">
                <Shield className="w-4 h-4 text-primary-400" />
                Verified Trainer
              </div>
              {trainer.availability && (
                <div className="text-sm text-dark-400">
                  <p className="font-medium text-dark-300 mb-2">Availability</p>
                  {Object.entries(trainer.availability).map(([day, slots]) => (
                    <div key={day} className="flex justify-between py-1 border-b border-dark-700/20 last:border-0">
                      <span className="capitalize">{day.slice(0, 3)}</span>
                      <span className="text-dark-300">{slots?.join(', ') || 'Off'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {bookingOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" onClick={() => setBookingOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full sm:max-w-md bg-dark-800 border border-dark-700 rounded-t-3xl sm:rounded-3xl p-6 sm:p-8"
          >
            <button onClick={() => setBookingOpen(false)} className="absolute top-4 right-4 text-dark-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-6">Book a Session</h2>
            <p className="text-sm text-dark-400 mb-2">with <span className="text-white font-medium">{trainer.user?.name}</span> — ${trainer.hourlyRate}/day</p>

            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Start Date</label>
                <input
                  type="date"
                  value={bookingStartDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Number of Days</label>
                <input
                  type="number"
                  value={bookingDays}
                  onChange={(e) => handleDaysChange(e.target.value)}
                  min={1}
                  max={90}
                  className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  required
                />
              </div>
              {bookingEndDate && (
                <div className="p-3 bg-primary-500/5 border border-primary-500/20 rounded-xl text-sm">
                  <div className="flex justify-between text-dark-300 mb-1">
                    <span>End Date</span>
                    <span className="text-white">{new Date(bookingEndDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between text-dark-300">
                    <span>Total Cost</span>
                    <span className="text-primary-400 font-semibold">${totalCost.toFixed(2)}</span>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Notes (optional)</label>
                <textarea
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="Any specific goals or focus areas..."
                  rows={3}
                  className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {bookingLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calendar className="w-5 h-5" />}
                {bookingLoading ? 'Booking...' : `Confirm Booking — $${totalCost.toFixed(0)}`}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {messageOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" onClick={() => { setMessageOpen(false); setMessageText(''); }} />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full sm:max-w-md bg-dark-800 border border-dark-700 rounded-t-3xl sm:rounded-3xl p-6 sm:p-8"
          >
            <button onClick={() => { setMessageOpen(false); setMessageText(''); }} className="absolute top-4 right-4 text-dark-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-2">Message {trainer.user?.name}</h2>
            <p className="text-sm text-dark-400 mb-6">Send a direct message to this trainer.</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                onKeyDown={(e) => e.key === 'Enter' && handleMessage()}
              />
              <button
                onClick={handleMessage}
                disabled={messageLoading || !messageText.trim()}
                className="px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-xl transition-all disabled:opacity-50"
              >
                {messageLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function TrainerDetailPage() {
  return (
    <ProtectedRoute>
      <TrainerDetailContent />
    </ProtectedRoute>
  );
}
