'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth';
import { workouts as workoutsApi } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Loader2, ChevronLeft, ChevronRight, AlertCircle, ArrowRight, Clock, CheckCircle } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_KEY = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const STORAGE_KEY = 'gymbuddy_weekly_schedule';
const MUSCLES = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'];

const DIFFS = ['BASIC', 'MEDIUM', 'HARD'];
const DIFF_LABEL = { BASIC: 'Basic', MEDIUM: 'Medium', HARD: 'Hard' };
const DIFF_BG = { BASIC: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', MEDIUM: 'bg-amber-500/10 border-amber-500/20 text-amber-400', HARD: 'bg-red-500/10 border-red-500/20 text-red-400' };
const DIFF_DOT = { BASIC: 'bg-emerald-500', MEDIUM: 'bg-amber-500', HARD: 'bg-red-500' };

function WorkoutContent() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun
  const todayIdx = dayOfWeek === 0 || dayOfWeek === 6 ? 0 : dayOfWeek - 1; // Mon=0..Sat=5, Sun/Sat→Mon

  const [schedule, setSchedule] = useState(null);
  const [selectedDay, setSelectedDay] = useState(todayIdx);
  const [exercises, setExercises] = useState({});
  const [loading, setLoading] = useState(true);
  const [workedExercises, setWorkedExercises] = useState({});

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    try { setSchedule(stored ? JSON.parse(stored) : null); } catch { setSchedule(null); }
    const handler = () => {
      const s = localStorage.getItem(STORAGE_KEY);
      try { setSchedule(s ? JSON.parse(s) : null); } catch { setSchedule(null); }
    };
    window.addEventListener('schedule-update', handler);
    // Load worked exercises from localStorage
    const w = localStorage.getItem('gymbuddy_worked_exercises');
    try { if (w) setWorkedExercises(JSON.parse(w)); } catch {}
    return () => window.removeEventListener('schedule-update', handler);
  }, []);

  useEffect(() => {
    if (schedule) loadExercises();
    else setLoading(false);
  }, [schedule, selectedDay]);

  const loadExercises = async () => {
    setLoading(true);
    try {
      const dayData = schedule?.[DAY_KEY[selectedDay]];
      if (!dayData) { setExercises({}); setLoading(false); return; }
      const muscles = getDayMuscles(dayData);
      const results = {};
      for (const m of muscles) {
        const data = await workoutsApi.getLibrary(m);
        results[m] = data;
      }
      setExercises(results);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const dayData = schedule?.[DAY_KEY[selectedDay]];

  const getDayMuscles = (d) => {
    const m = [d.muscle];
    if (d.isDouble) m.push(d.secondMuscle || MUSCLES.find(x => x !== d.muscle) || 'Chest');
    return m;
  };

  const toggleWorked = (exId) => {
    const key = `${DAY_KEY[selectedDay]}_${exId}`;
    const updated = { ...workedExercises, [key]: !workedExercises[key] };
    setWorkedExercises(updated);
    localStorage.setItem('gymbuddy_worked_exercises', JSON.stringify(updated));
  };

  const groupedExercises = {};
  if (dayData) {
    const muscles = getDayMuscles(dayData);
    for (const m of muscles) {
      const exs = exercises[m] || [];
      for (const d of DIFFS) {
        const filtered = exs.filter(e => e.difficulty === d);
        if (filtered.length > 0) {
          if (!groupedExercises[d]) groupedExercises[d] = [];
          groupedExercises[d].push(...filtered.map(e => ({ ...e, muscle: m })));
        }
      }
    }
  }

  if (!schedule) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-20">
          <Dumbbell className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Weekly Schedule Yet</h3>
          <p className="text-dark-400 mb-6">Set up your muscle split on the Calendar page first.</p>
          <Link href="/calendar" className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/20 transition-all hover:from-primary-500">
            Go to Schedule <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Workout <span className="text-gradient">Planner</span></h1>
        <p className="text-dark-400 mt-1">Exercises grouped by difficulty for each day of the week</p>
      </div>

      {/* Day selector */}
      <div className="flex gap-1 bg-dark-800/50 border border-dark-700/50 rounded-xl p-1 mb-6 overflow-x-auto">
        {DAYS.map((day, i) => {
          const isToday = i === todayIdx;
          const isActive = i === selectedDay;
          return (
            <button key={day} onClick={() => setSelectedDay(i)}
              className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-all ${isActive ? 'bg-primary-500/20 text-primary-400 shadow-sm' : isToday ? 'text-dark-200' : 'text-dark-400 hover:text-white'}`}>
              {day.slice(0, 3)}{isToday && <span className="ml-1 w-1.5 h-1.5 rounded-full bg-primary-400 inline-block" />}
            </button>
          );
        })}
      </div>

      {/* Day header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
            <div>
            <h2 className="text-xl font-bold text-white">{DAYS[selectedDay]}</h2>
            <p className="text-sm text-dark-400">
              {getDayMuscles(dayData).join(' + ')}{dayData.isDouble ? ' (Double)' : ''}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setSelectedDay(Math.max(0, selectedDay - 1))} disabled={selectedDay === 0}
            className="p-2 text-dark-400 hover:text-white bg-dark-800/50 border border-dark-700/50 rounded-lg disabled:opacity-30 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setSelectedDay(Math.min(5, selectedDay + 1))} disabled={selectedDay === 5}
            className="p-2 text-dark-400 hover:text-white bg-dark-800/50 border border-dark-700/50 rounded-lg disabled:opacity-30 transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Exercises by difficulty */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-400" /></div>
      ) : (
        <div className="space-y-6">
          {DIFFS.map(diff => {
            const items = groupedExercises[diff] || [];
            if (items.length === 0) return null;
            return (
              <div key={diff}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${DIFF_DOT[diff]}`} />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-dark-300">{DIFF_LABEL[diff]}</h3>
                  <span className="text-xs text-dark-500">({items.length})</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {items.map((ex) => {
                    const workedKey = `${DAY_KEY[selectedDay]}_${ex.id}`;
                    const isWorked = workedExercises[workedKey];
                    return (
                      <motion.button key={ex.id} layout onClick={() => toggleWorked(ex.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${isWorked ? 'bg-primary-500/10 border-primary-500/30' : 'bg-dark-800/30 border-dark-700/30 hover:border-dark-600'}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${isWorked ? 'bg-primary-500 text-white' : 'bg-dark-700/50 text-dark-400'}`}>
                          {isWorked ? <CheckCircle className="w-4 h-4" /> : <Dumbbell className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{ex.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${DIFF_BG[diff]}`}>
                              {DIFF_LABEL[diff]}
                            </span>
                            {ex.muscle !== dayData.muscle && (
                              <span className="text-[10px] text-dark-500">{ex.muscle}</span>
                            )}
                            {ex.equipment && (
                              <span className="text-[10px] text-dark-500 flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" /> {ex.equipment}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {Object.keys(groupedExercises).length === 0 && (
            <div className="text-center py-16 bg-dark-800/20 border border-dark-700/30 rounded-2xl">
              <AlertCircle className="w-10 h-10 text-dark-600 mx-auto mb-2" />
              <p className="text-dark-400">No exercises found for {dayData.muscle}{dayData.secondMuscle ? ` + ${dayData.secondMuscle}` : ''}.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function WorkoutPlannerPage() {
  return <ProtectedRoute><WorkoutContent /></ProtectedRoute>;
}
