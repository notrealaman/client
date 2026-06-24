'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth';
import { workouts as workoutsApi, sessions as sessionsApi } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { ChevronLeft, Dumbbell, Plus, X, Loader2, CheckCircle2, Circle, Save, Trash2, Edit3 } from 'lucide-react';

function SessionWorkoutsContent() {
  const { sessionId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [days, setDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addExerciseOpen, setAddExerciseOpen] = useState(false);
  const [newExercise, setNewExercise] = useState({ name: '', sets: 3, reps: 10, weight: '', notes: '' });
  const [showLib, setShowLib] = useState(false);
  const [libExercises, setLibExercises] = useState([]);
  const [libCategory, setLibCategory] = useState('');
  const [libCategories, setLibCategories] = useState([]);
  const [saving, setSaving] = useState(false);

  const isTrainer = user?.role === 'TRAINER' || user?.role === 'BOTH';

  useEffect(() => { loadData(); }, [sessionId]);

  const loadData = async () => {
    try {
      const [sessions, workoutDays] = await Promise.all([
        sessionsApi.list(),
        workoutsApi.getDays(sessionId),
      ]);
      const s = sessions.find(x => x.id === sessionId);
      setSession(s);
      setDays(workoutDays);
      if (workoutDays.length > 0) setSelectedDay(workoutDays[0].id);
      const cats = await workoutsApi.getCategories();
      setLibCategories(cats);
    } catch (err) {
      toast.error('Failed to load workout data');
      router.push('/workout-planner');
    } finally { setLoading(false); }
  };

  const loadLibrary = async (category) => {
    try {
      const data = await workoutsApi.getLibrary(category);
      setLibExercises(data);
    } catch { setLibExercises([]); }
  };

  const handleDayClick = (dayId) => {
    setSelectedDay(dayId);
    setAddExerciseOpen(false);
  };

  const handleAddExercise = async (e) => {
    e?.preventDefault();
    if (!newExercise.name.trim()) return toast.error('Exercise name is required');
    setSaving(true);
    try {
      await workoutsApi.addExercise(selectedDay, { ...newExercise, weight: newExercise.weight ? parseFloat(newExercise.weight) : null, isCustom: !showLib });
      toast.success('Exercise added');
      setNewExercise({ name: '', sets: 3, reps: 10, weight: '', notes: '' });
      const workoutDays = await workoutsApi.getDays(sessionId);
      setDays(workoutDays);
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const pickFromLib = (ex) => {
    setNewExercise(prev => ({ ...prev, name: ex.name }));
    setShowLib(false);
  };

  const deleteExercise = async (dayId, exerciseId) => {
    try {
      await workoutsApi.deleteExercise(dayId, exerciseId);
      toast.success('Exercise removed');
      const workoutDays = await workoutsApi.getDays(sessionId);
      setDays(workoutDays);
    } catch (err) { toast.error(err.message); }
  };

  const toggleDayComplete = async (dayId, current) => {
    try {
      await workoutsApi.updateDay(dayId, { completed: !current });
      const workoutDays = await workoutsApi.getDays(sessionId);
      setDays(workoutDays);
    } catch (err) { toast.error(err.message); }
  };

  const currentDay = days.find(d => d.id === selectedDay);
  const dayExercises = currentDay?.exercises || [];

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-400" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => router.push('/workout-planner')} className="flex items-center gap-1 text-sm text-dark-400 hover:text-white mb-4 transition-all">
        <ChevronLeft className="w-4 h-4" /> Back to workouts
      </button>

      {session && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Workout Plan</h1>
          <p className="text-dark-400 text-sm mt-1">
            {new Date(session.startDate).toLocaleDateString()} - {new Date(session.endDate).toLocaleDateString()} ({session.totalDays} days)
            {isTrainer ? ' — Create exercises for each day' : ' — View your daily exercises'}
          </p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-dark-800/30 border border-dark-700/30 rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Days</h3>
            <div className="space-y-1">
              {days.map((day) => (
                <button key={day.id} onClick={() => handleDayClick(day.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left ${selectedDay === day.id ? 'bg-primary-500/10 border border-primary-500/20 text-primary-400' : 'text-dark-300 hover:bg-dark-700/50'}`}>
                  {day.completed ? <CheckCircle2 className="w-4 h-4 text-primary-400 flex-shrink-0" /> : <Circle className="w-4 h-4 text-dark-500 flex-shrink-0" />}
                  <div className="min-w-0">
                    <div className="font-medium">Day {day.dayNumber}</div>
                    <div className="text-xs text-dark-500 truncate">{day.focusArea || new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {!currentDay ? (
            <div className="text-center py-20 text-dark-400">Select a day to view exercises</div>
          ) : (
            <div className="bg-dark-800/30 border border-dark-700/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-white">Day {currentDay.dayNumber}</h2>
                  <p className="text-sm text-dark-400">{new Date(currentDay.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
                <button onClick={() => toggleDayComplete(currentDay.id, currentDay.completed)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-xl transition-all ${currentDay.completed ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' : 'bg-dark-700/50 text-dark-300 hover:bg-dark-700'}`}>
                  {currentDay.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                  {currentDay.completed ? 'Completed' : 'Mark Complete'}
                </button>
              </div>

              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {dayExercises.map((ex, i) => (
                    <motion.div key={ex.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -10 }}
                      className="bg-dark-800/50 border border-dark-700/30 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-dark-400 font-mono">#{i + 1}</span>
                            <h4 className="text-sm font-semibold text-white">{ex.name}</h4>
                            {ex.isCustom && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">Custom</span>}
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-dark-300">
                            <span><span className="text-dark-500">Sets:</span> {ex.sets}</span>
                            <span><span className="text-dark-500">Reps:</span> {ex.reps}</span>
                            {ex.weight && <span><span className="text-dark-500">Weight:</span> {ex.weight} kg</span>}
                            {ex.restTime && <span><span className="text-dark-500">Rest:</span> {ex.restTime}s</span>}
                          </div>
                          {ex.notes && <p className="text-xs text-dark-400 mt-1 italic">{ex.notes}</p>}
                        </div>
                        <button onClick={() => deleteExercise(currentDay.id, ex.id)} className="p-1.5 text-dark-500 hover:text-red-400 rounded-lg hover:bg-dark-700/50 transition-all flex-shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {dayExercises.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-dark-700/50 rounded-xl">
                  <Dumbbell className="w-10 h-10 text-dark-600 mx-auto mb-2" />
                  <p className="text-dark-500 text-sm">No exercises yet</p>
                  {isTrainer && <p className="text-dark-600 text-xs mt-1">Add exercises for this day</p>}
                </div>
              )}

              {isTrainer && (
                <div className="mt-6 pt-6 border-t border-dark-700/30">
                  {addExerciseOpen ? (
                    <form onSubmit={handleAddExercise} className="space-y-4">
                      <div className="flex gap-2">
                        <input type="text" value={newExercise.name} onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                          placeholder="Exercise name..." className="flex-1 px-4 py-2.5 bg-dark-900/50 border border-dark-700 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50" required />
                        <button type="button" onClick={() => { setShowLib(!showLib); if (!showLib) loadLibrary(''); }}
                          className="px-3 py-2 text-sm bg-dark-700/50 border border-dark-700 rounded-xl text-dark-300 hover:text-white transition-all">Library</button>
                      </div>

                      {showLib && (
                        <div className="bg-dark-900/50 border border-dark-700/50 rounded-xl p-3">
                          <select value={libCategory} onChange={(e) => { setLibCategory(e.target.value); loadLibrary(e.target.value); }}
                            className="w-full mb-2 px-3 py-1.5 bg-dark-800 border border-dark-700 rounded-lg text-sm text-white focus:outline-none">
                            <option value="">All Categories</option>
                            {libCategories.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <div className="max-h-40 overflow-y-auto space-y-0.5">
                            {libExercises.map(ex => (
                              <button key={ex.id} type="button" onClick={() => pickFromLib(ex)}
                                className="w-full text-left px-3 py-1.5 text-sm text-dark-300 hover:text-white hover:bg-dark-700/50 rounded-lg transition-all">{ex.name}</button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-3">
                        <div><label className="block text-xs text-dark-400 mb-1">Sets</label>
                          <input type="number" value={newExercise.sets} onChange={(e) => setNewExercise({ ...newExercise, sets: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 bg-dark-900/50 border border-dark-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" /></div>
                        <div><label className="block text-xs text-dark-400 mb-1">Reps</label>
                          <input type="number" value={newExercise.reps} onChange={(e) => setNewExercise({ ...newExercise, reps: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 bg-dark-900/50 border border-dark-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" /></div>
                        <div><label className="block text-xs text-dark-400 mb-1">Weight (kg)</label>
                          <input type="number" value={newExercise.weight} onChange={(e) => setNewExercise({ ...newExercise, weight: e.target.value })}
                            className="w-full px-3 py-2 bg-dark-900/50 border border-dark-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" /></div>
                      </div>
                      <div>
                        <label className="block text-xs text-dark-400 mb-1">Notes</label>
                        <input type="text" value={newExercise.notes} onChange={(e) => setNewExercise({ ...newExercise, notes: e.target.value })}
                          placeholder="Optional notes..." className="w-full px-3 py-2 bg-dark-900/50 border border-dark-700 rounded-lg text-sm text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button type="button" onClick={() => setAddExerciseOpen(false)} className="px-4 py-2 text-sm text-dark-400 hover:text-white bg-dark-700/50 rounded-xl transition-all">Cancel</button>
                        <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl hover:from-primary-500 transition-all disabled:opacity-50">
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add Exercise
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button onClick={() => setAddExerciseOpen(true)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-primary-400 bg-primary-500/10 border border-primary-500/20 rounded-xl hover:bg-primary-500/20 transition-all">
                      <Plus className="w-4 h-4" /> Add Exercise
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SessionWorkoutsPage() {
  return <ProtectedRoute><SessionWorkoutsContent /></ProtectedRoute>;
}
