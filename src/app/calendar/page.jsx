'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Dumbbell, Save, Check, Loader2 } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_KEY = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const MUSCLES = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'];
const STORAGE_KEY = 'gymbuddy_weekly_schedule';

const defaultSchedule = () => {
  const defaults = ['Legs', 'Chest', 'Back', 'Shoulders', 'Arms', 'Core'];
  return DAY_KEY.reduce((acc, k, i) => ({
    ...acc,
    [k]: { muscle: defaults[i], isDouble: false, secondMuscle: MUSCLES.find(m => m !== defaults[i]) || 'Chest' },
  }), {});
};

function CalendarContent() {
  const [schedule, setSchedule] = useState(null);
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    try { setSchedule(stored ? JSON.parse(stored) : defaultSchedule()); }
    catch { setSchedule(defaultSchedule()); }
  }, []);

  const update = (key, field, value) => {
    setSchedule(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
    setSaved(false);
  };

  const toggleDouble = (key, val) => {
    setSchedule(prev => {
      const day = prev[key];
      if (val && !day.secondMuscle) {
        const fallback = MUSCLES.find(m => m !== day.muscle) || 'Chest';
        return { ...prev, [key]: { ...day, isDouble: true, secondMuscle: fallback } };
      }
      if (!val) return { ...prev, [key]: { ...day, isDouble: false, secondMuscle: null } };
      return { ...prev, [key]: { ...day, isDouble: val } };
    });
    setSaved(false);
  };

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
    setSaved(true);
    toast.success('Weekly schedule saved!');
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('schedule-update'));
  };

  const reset = () => {
    setSchedule(defaultSchedule());
    setSaved(false);
  };

  if (!schedule) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-400" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Weekly <span className="text-gradient">Schedule</span></h1>
          <p className="text-dark-400 mt-1">Set muscle groups for each day — Single or Double muscle workout</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={reset} className="px-3 py-2 text-xs text-dark-400 hover:text-white bg-dark-800/50 border border-dark-700/50 rounded-xl hover:border-dark-600 transition-all">
            Reset
          </button>
          <button onClick={save} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all shadow-lg ${saved ? 'bg-primary-500/20 text-primary-400 border border-primary-500/20' : 'text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 shadow-primary-500/20'}`}>
            {saved ? <><Check className="w-4 h-4" /> Saved</> : <><Save className="w-4 h-4" /> Save Schedule</>}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {DAYS.map((day, i) => {
          const k = DAY_KEY[i];
          const d = schedule[k];
          return (
            <motion.div key={k} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`bg-dark-800/30 border rounded-2xl p-4 sm:p-5 transition-all ${d.isDouble ? 'border-primary-500/20' : 'border-dark-700/30'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-3 min-w-[130px]">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center flex-shrink-0">
                    <Dumbbell className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">{day}</h3>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                  <div className="flex bg-dark-900/50 border border-dark-700 rounded-lg p-0.5 self-start sm:self-auto">
                    <button onClick={() => toggleDouble(k, false)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${!d.isDouble ? 'bg-primary-500/20 text-primary-400 shadow-sm' : 'text-dark-400 hover:text-white'}`}>
                      Single
                    </button>
                    <button onClick={() => toggleDouble(k, true)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${d.isDouble ? 'bg-primary-500/20 text-primary-400 shadow-sm' : 'text-dark-400 hover:text-white'}`}>
                      Double
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-1">
                    <select value={d.muscle} onChange={(e) => update(k, 'muscle', e.target.value)}
                      className="flex-1 min-w-0 px-3 py-2 bg-dark-900/50 border border-dark-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none cursor-pointer">
                      {MUSCLES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    {d.isDouble && (
                      <>
                        <span className="text-dark-500 font-medium flex-shrink-0">+</span>
                        <select value={d.secondMuscle || MUSCLES.find(m => m !== d.muscle)} onChange={(e) => update(k, 'secondMuscle', e.target.value)}
                          className="flex-1 min-w-0 px-3 py-2 bg-dark-900/50 border border-dark-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none cursor-pointer">
                          {MUSCLES.filter(m => m !== d.muscle).map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-dark-800/20 border border-dark-700/30 rounded-2xl text-sm text-dark-400">
        <p className="font-medium text-dark-300 mb-1">How it works</p>
        <p>Set your weekly training split here. Choose <strong className="text-white">Single</strong> for one muscle group per day, or <strong className="text-white">Double</strong> for two (e.g. Leg + Shoulder).</p>
        <p className="mt-1">Your exercises will appear grouped by <span className="text-emerald-400">Basic</span>, <span className="text-amber-400">Medium</span>, and <span className="text-red-400">Hard</span> difficulty on the Workout page.</p>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  return <ProtectedRoute><CalendarContent /></ProtectedRoute>;
}
