'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth';
import { users } from '@/lib/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Settings, Ruler, Weight, Dumbbell, Target, Calendar, Heart, Loader2, ChevronLeft, Camera, MapPin, Crosshair, Download } from 'lucide-react';
import { usePwaInstall } from '@/lib/usePwaInstall';
import Link from 'next/link';

function SettingsContent() {
  const { user, loadUser } = useAuth();
  const { canInstall, install } = usePwaInstall();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', username: '', email: '', phone: '', bio: '', avatar: '', location: '', latitude: '', longitude: '',
    weight: '', age: '', dateOfBirth: '', height: '', bmi: '', goal: 'BULK',
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        location: user.location || '',
        latitude: user.latitude?.toString() || '',
        longitude: user.longitude?.toString() || '',
        weight: user.weight?.toString() || '',
        age: user.age?.toString() || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        height: user.height?.toString() || '',
        bmi: user.bmi?.toString() || '',
        goal: user.goal || 'BULK',
      });
    }
  }, [user]);

  const calculateBMI = (w, h) => {
    if (!w || !h) return null;
    const hInM = h / 100;
    return Math.round((w / (hInM * hInM)) * 10) / 10;
  };

  const handleWeightChange = (v) => {
    const height = parseFloat(form.height);
    const bmi = calculateBMI(parseFloat(v), height);
    setForm({ ...form, weight: v, bmi: bmi ? bmi.toString() : '' });
  };

  const handleHeightChange = (v) => {
    const weight = parseFloat(form.weight);
    const bmi = calculateBMI(weight, parseFloat(v));
    setForm({ ...form, height: v, bmi: bmi ? bmi.toString() : '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await users.update({
        name: form.name,
        username: form.username || undefined,
        bio: form.bio || undefined,
        phone: form.phone || undefined,
        avatar: form.avatar || undefined,
        location: form.location || undefined,
        latitude: form.latitude ? parseFloat(form.latitude) : undefined,
        longitude: form.longitude ? parseFloat(form.longitude) : undefined,
        weight: form.weight ? parseFloat(form.weight) : undefined,
        age: form.age ? parseInt(form.age) : undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        height: form.height ? parseFloat(form.height) : undefined,
        bmi: form.bmi ? parseFloat(form.bmi) : undefined,
        goal: form.goal,
      });
      toast.success('Settings saved');
      await loadUser();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const bmiValue = form.bmi ? parseFloat(form.bmi) : null;
  const category = bmiValue < 18.5 ? 'Underweight' : bmiValue < 25 ? 'Normal' : bmiValue < 30 ? 'Overweight' : 'Obese';
  const catColor = bmiValue < 18.5 ? 'text-amber-400' : bmiValue < 25 ? 'text-green-400' : bmiValue < 30 ? 'text-orange-400' : 'text-red-400';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="p-2 bg-dark-800/50 border border-dark-700/30 rounded-xl text-dark-400 hover:text-white transition-all">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-dark-400 mt-1">Manage your profile and fitness preferences</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-dark-800/30 border border-dark-700/30 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Heart className="w-5 h-5 text-primary-400" /> Profile</h2>

          <div className="flex items-center gap-4 pb-4 border-b border-dark-700/30">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
                {form.avatar ? <img src={form.avatar} alt="" className="w-full h-full object-cover" /> : (user?.name?.charAt(0) || 'U')}
              </div>
              <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-dark-800 border border-dark-600 flex items-center justify-center cursor-pointer hover:bg-dark-700 transition-all">
                <Camera className="w-3.5 h-3.5 text-dark-300" />
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 5 * 1024 * 1024) return toast.error('File too large (max 5MB)');
                  const reader = new FileReader();
                  reader.onload = async (ev) => {
                    const base64 = ev.target.result;
                    try {
                      await users.update({ avatar: base64 });
                      toast.success('Photo updated');
                      await loadUser();
                    } catch (err) { toast.error(err.message); }
                  };
                  reader.readAsDataURL(file);
                }} />
              </label>
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-dark-400">Click camera to upload photo</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1">Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1">Username</label>
              <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s+/g, '_') })} className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1">Email</label>
              <input type="email" value={form.email} disabled className="w-full px-4 py-3 bg-dark-900/30 border border-dark-700 rounded-xl text-dark-400 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1">Phone</label>
              <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 234 567 8900" className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-dark-300">Location</label>
                <button type="button" onClick={() => {
                  if (!navigator.geolocation) return toast.error('Geolocation not supported');
                  navigator.geolocation.getCurrentPosition(async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setForm({ ...form, latitude: latitude.toString(), longitude: longitude.toString() });
                    try {
                      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
                      const data = await res.json();
                      const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state || '';
                      if (city) setForm(f => ({ ...f, location: city, latitude: latitude.toString(), longitude: longitude.toString() }));
                    } catch { toast.success('Coordinates set'); }
                    toast.success('Location detected');
                  }, () => toast.error('Could not detect'), { enableHighAccuracy: true });
                }} className="text-[10px] text-primary-400 hover:text-primary-300 flex items-center gap-0.5">
                  <Crosshair className="w-3 h-3" /> Detect
                </button>
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, Country" className="w-full pl-9 pr-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
              </div>
              {form.latitude && form.longitude && (
                <p className="text-[10px] text-green-400 mt-1">Coordinates: {parseFloat(form.latitude).toFixed(4)}, {parseFloat(form.longitude).toFixed(4)}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1">Date of Birth</label>
              <input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-dark-300 mb-1">Bio</label>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={2} className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none" />
          </div>
        </div>

        <div className="bg-dark-800/30 border border-dark-700/30 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Target className="w-5 h-5 text-primary-400" /> Fitness Profile</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1">Weight (kg)</label>
              <div className="relative">
                <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input type="number" step="0.1" value={form.weight} onChange={(e) => handleWeightChange(e.target.value)} placeholder="70" className="w-full pl-9 pr-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1">Height (cm)</label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input type="number" step="0.1" value={form.height} onChange={(e) => handleHeightChange(e.target.value)} placeholder="175" className="w-full pl-9 pr-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1">Age</label>
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 hidden" />
              <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="25" className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
            </div>
          </div>

          {bmiValue && (
            <div className="bg-dark-900/50 border border-dark-700/50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-dark-400">Your BMI</p>
                <p className={`text-lg font-bold ${catColor}`}>{category}</p>
              </div>
              <p className="text-3xl font-bold text-white">{bmiValue}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-dark-300 mb-2">Fitness Goal</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setForm({ ...form, goal: 'BULK' })} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${form.goal === 'BULK' ? 'border-primary-500 bg-primary-500/10 text-primary-400' : 'border-dark-700 bg-dark-900/50 text-dark-400 hover:text-dark-200'}`}>
                <Dumbbell className="w-4 h-4" /> Bulk (Gain Mass)
              </button>
              <button type="button" onClick={() => setForm({ ...form, goal: 'LEAN' })} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${form.goal === 'LEAN' ? 'border-primary-500 bg-primary-500/10 text-primary-400' : 'border-dark-700 bg-dark-900/50 text-dark-400 hover:text-dark-200'}`}>
                <Weight className="w-4 h-4" /> Lean (Lose Fat)
              </button>
            </div>
          </div>
        </div>

        {canInstall && (
          <div className="bg-dark-800/30 border border-dark-700/30 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Download className="w-5 h-5 text-cyan-400" /> App</h2>
            <p className="text-sm text-dark-400">Install GymBuddy on your device for a faster, app-like experience.</p>
            <button type="button" onClick={install} className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Install App
            </button>
          </div>
        )}

        <button type="submit" disabled={saving} className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl hover:from-primary-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Settings className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}

export default function SettingsPage() {
  return <ProtectedRoute><SettingsContent /></ProtectedRoute>;
}
