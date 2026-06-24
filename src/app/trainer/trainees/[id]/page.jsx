'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth';
import { sessions as sessionsApi, diet as dietApi, messages as messagesApi } from '@/lib/api';
import { motion } from 'framer-motion';
import {
  Loader2, ArrowLeft, Calendar, MessageSquare, Apple,
  Dumbbell, Clock, Plus, ChevronDown, Send, User,
  CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

function ManageTraineeContent() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [trainee, setTrainee] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [activeTab, setActiveTab] = useState('sessions');
  const [saving, setSaving] = useState(false);
  const [assigningDiet, setAssigningDiet] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [sessionsData, convoData] = await Promise.all([
        sessionsApi.list({ role: 'trainer', traineeId: id }),
        messagesApi.conversations().catch(() => []),
      ]);
      setSessions(sessionsData);

      if (sessionsData.length > 0) {
        const first = sessionsData[0];
        setTrainee(first.trainee || { id, name: 'Loading...' });
      } else {
        const { default: request } = await import('@/lib/api');
        const userData = await request(`/users/profile`);
        setTrainee({ id, name: 'Trainee', avatar: null });
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      toast.error('Could not load trainee data');
    }
  };

  const handleSchedule = async () => {
    const startDate = prompt('Start date (YYYY-MM-DD):');
    if (!startDate) return;
    const endDate = prompt('End date (YYYY-MM-DD):');
    if (!endDate) return;
    const totalDays = prompt('Total training days:');
    if (!totalDays) return;

    setSaving(true);
    try {
      await sessionsApi.create({
        trainerId: user.id,
        startDate,
        endDate,
        totalDays: parseInt(totalDays),
        notes: `Created by trainer ${user.name}`,
      });
      toast.success('Session scheduled!');
      load();
    } catch (err) {
      toast.error(err.message);
    } finally { setSaving(false); }
  };

  const handleChat = async () => {
    try {
      const convo = await messagesApi.createConversation(id);
      router.push('/messages');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDietPlan = async () => {
    const body = prompt('Calorie goal (e.g., 2500) or leave empty for auto:');
    setAssigningDiet(true);
    try {
      const goal = parseInt(body);
      const plan = await dietApi.generate({
        dietType: 'Vegetarian',
        calorieGoal: goal || undefined,
        traineeId: id,
      });
      toast.success('Diet plan created!');
      router.push('/diet-plan');
    } catch (err) {
      toast.error(err.message);
    } finally { setAssigningDiet(false); }
  };

  const handleStatusUpdate = async (sessionId, status) => {
    try {
      await sessionsApi.update(sessionId, { status });
      toast.success(`Session ${status.toLowerCase()}`);
      load();
    } catch (err) { toast.error(err.message); }
  };

  const tabs = [
    { key: 'sessions', label: 'Sessions', icon: Calendar },
    { key: 'diet', label: 'Diet Plans', icon: Apple },
    { key: 'notes', label: 'Notes', icon: User },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => router.push('/trainer/trainees')}
        className="flex items-center gap-1.5 text-sm text-dark-400 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to trainees
      </button>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-xl font-bold text-white">
            {trainee?.name?.charAt(0) || '?'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{trainee?.name || 'Trainee'}</h1>
            <p className="text-dark-400 text-sm">{sessions.length} session{sessions.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleChat}
            className="flex items-center gap-1.5 text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg px-3 py-2 hover:bg-blue-500/20 transition-colors">
            <MessageSquare className="w-3.5 h-3.5" /> Chat
          </button>
          <button onClick={handleSchedule} disabled={saving}
            className="flex items-center gap-1.5 text-xs font-medium bg-primary-500/10 text-primary-400 border border-primary-500/20 rounded-lg px-3 py-2 hover:bg-primary-500/20 transition-colors disabled:opacity-50">
            <Plus className="w-3.5 h-3.5" /> {saving ? 'Adding...' : 'Schedule'}
          </button>
          <button onClick={handleDietPlan} disabled={assigningDiet}
            className="flex items-center gap-1.5 text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg px-3 py-2 hover:bg-amber-500/20 transition-colors disabled:opacity-50">
            <Apple className="w-3.5 h-3.5" /> {assigningDiet ? 'Creating...' : 'Diet Plan'}
          </button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-dark-700/30 mb-6">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-all ${
              activeTab === t.key
                ? 'text-primary-400 border-primary-500'
                : 'text-dark-400 border-transparent hover:text-dark-300'
            }`}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'sessions' && (
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center py-12 text-dark-500">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No sessions yet. Schedule one!</p>
            </div>
          ) : sessions.map(s => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-dark-800/30 border border-dark-700/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    s.status === 'ACTIVE' ? 'bg-emerald-500/10' : s.status === 'COMPLETED' ? 'bg-blue-500/10' : 'bg-amber-500/10'
                  }`}>
                    {s.status === 'ACTIVE' ? <Clock className="w-4 h-4 text-emerald-400" /> : s.status === 'COMPLETED' ? <CheckCircle2 className="w-4 h-4 text-blue-400" /> : <AlertCircle className="w-4 h-4 text-amber-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{s.totalDays} day session</p>
                    <p className="text-xs text-dark-400">{new Date(s.startDate).toLocaleDateString()} - {new Date(s.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {s.status === 'PENDING' && (
                    <>
                      <button onClick={() => handleStatusUpdate(s.id, 'ACTIVE')}
                        className="text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg px-2 py-1 hover:bg-emerald-500/20 transition-colors">
                        Approve
                      </button>
                      <button onClick={() => handleStatusUpdate(s.id, 'CANCELLED')}
                        className="text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg px-2 py-1 hover:bg-red-500/20 transition-colors">
                        Cancel
                      </button>
                    </>
                  )}
                  {s.status === 'ACTIVE' && (
                    <button onClick={() => handleStatusUpdate(s.id, 'COMPLETED')}
                      className="text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg px-2 py-1 hover:bg-blue-500/20 transition-colors">
                      Complete
                    </button>
                  )}
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    s.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : s.status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : s.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>{s.status}</span>
                </div>
              </div>
              <Link href={`/workout-planner${s.id ? `?sessionId=${s.id}` : ''}`}
                className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 transition-colors">
                <Dumbbell className="w-3 h-3" /> Manage workout days
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'diet' && (
        <div className="text-center py-12">
          <Apple className="w-12 h-12 mx-auto mb-3 text-dark-600" />
          <p className="text-dark-400 text-sm mb-4">Generate an AI diet plan for this trainee</p>
          <button onClick={handleDietPlan} disabled={assigningDiet}
            className="flex items-center gap-2 mx-auto text-sm font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl px-5 py-2.5 hover:bg-amber-500/20 transition-colors disabled:opacity-50">
            <Plus className="w-4 h-4" /> {assigningDiet ? 'Creating...' : 'Create Diet Plan'}
          </button>
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="bg-dark-800/30 border border-dark-700/30 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Session Notes</h3>
          {sessions.filter(s => s.notes).length === 0 ? (
            <p className="text-dark-500 text-sm">No notes recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {sessions.filter(s => s.notes).map(s => (
                <div key={s.id} className="p-3 bg-dark-800/30 border border-dark-700/20 rounded-lg">
                  <p className="text-xs text-dark-400 mb-1">{new Date(s.startDate).toLocaleDateString()} - {s.totalDays} day session</p>
                  <p className="text-sm text-white">{s.notes}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ManageTraineePage() {
  return <ProtectedRoute><ManageTraineeContent /></ProtectedRoute>;
}