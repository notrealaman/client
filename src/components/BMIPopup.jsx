'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { users } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Loader2, Ruler, Weight, Dumbbell, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BMIPopup() {
  const { user, loadUser } = useAuth();
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [goal, setGoal] = useState('BULK');
  const [gymTime, setGymTime] = useState('');
  const [saving, setSaving] = useState(false);
  const [bmi, setBmi] = useState(null);

  if (!user || user.weight) return null;

  const calculateBMI = (w, h) => {
    const hInM = h / 100;
    return Math.round((w / (hInM * hInM)) * 10) / 10;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!weight || !height || !age) return toast.error('All fields required');
    setSaving(true);
    try {
      const bmiValue = calculateBMI(parseFloat(weight), parseFloat(height));
      await users.update({
        weight: parseFloat(weight),
        height: parseFloat(height),
        age: parseInt(age),
        bmi: bmiValue,
        goal,
        gymTime: gymTime || undefined,
      });
      toast.success('Profile updated!');
      await loadUser();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleWeightChange = (v) => {
    setWeight(v);
    if (v && height) setBmi(calculateBMI(parseFloat(v), parseFloat(height)));
    else setBmi(null);
  };

  const handleHeightChange = (v) => {
    setHeight(v);
    if (weight && v) setBmi(calculateBMI(parseFloat(weight), parseFloat(v)));
    else setBmi(null);
  };

  const category = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
  const catColor = bmi < 18.5 ? 'text-amber-400' : bmi < 25 ? 'text-green-400' : bmi < 30 ? 'text-orange-400' : 'text-red-400';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-sm mx-4 bg-dark-800 border border-dark-700 rounded-3xl p-6 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-primary-600 to-primary-500 rounded-2xl flex items-center justify-center">
            <Ruler className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Complete Your Profile</h2>
          <p className="text-sm text-dark-400 mt-1">We need a few details to personalize your experience</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1">Weight (kg)</label>
              <div className="relative">
                <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input type="number" step="0.1" value={weight} onChange={(e) => handleWeightChange(e.target.value)} placeholder="70" className="w-full pl-9 pr-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1">Height (cm)</label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input type="number" step="0.1" value={height} onChange={(e) => handleHeightChange(e.target.value)} placeholder="175" className="w-full pl-9 pr-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50" required />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-dark-300 mb-1">Age</label>
            <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="25" className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50" required />
          </div>

          <div>
            <label className="block text-xs font-medium text-dark-300 mb-1">Gym Time (optional)</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input type="time" value={gymTime} onChange={(e) => setGymTime(e.target.value)} className="w-full pl-9 pr-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
            </div>
          </div>

          {bmi && (
            <div className="bg-dark-900/50 border border-dark-700/50 rounded-xl p-3 text-center">
              <p className="text-xs text-dark-400">Your BMI</p>
              <p className="text-2xl font-bold text-white">{bmi}</p>
              <p className={`text-xs font-medium ${catColor}`}>{category}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-dark-300 mb-2">Fitness Goal</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setGoal('BULK')} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${goal === 'BULK' ? 'border-primary-500 bg-primary-500/10 text-primary-400' : 'border-dark-700 bg-dark-900/50 text-dark-400 hover:text-dark-200'}`}>
                <Dumbbell className="w-4 h-4" /> Bulk
              </button>
              <button type="button" onClick={() => setGoal('LEAN')} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${goal === 'LEAN' ? 'border-primary-500 bg-primary-500/10 text-primary-400' : 'border-dark-700 bg-dark-900/50 text-dark-400 hover:text-dark-200'}`}>
                <Weight className="w-4 h-4" /> Lean
              </button>
            </div>
          </div>

          <button type="submit" disabled={saving} className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl hover:from-primary-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null} {saving ? 'Saving...' : 'Save & Continue'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
