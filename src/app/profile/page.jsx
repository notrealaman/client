'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth';
import { users as usersApi } from '@/lib/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { User, Mail, Phone, MapPin, DollarSign, Award, Loader2, Save, GraduationCap, Plus, X, Crosshair } from 'lucide-react';

function ProfileContent() {
  const { user, loadUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    name: '', bio: '', phone: '', location: '',
    specialties: [], experience: '', certifications: [],
    hourlyRate: '', trainingStyle: 'BOTH', trainerLocation: '', trainerLatitude: '', trainerLongitude: '', availability: '{}',
  });
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newCert, setNewCert] = useState('');

  const isTrainer = user?.role === 'TRAINER' || user?.role === 'BOTH';

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await usersApi.profile();
      setProfile(data);
      setForm({
        name: data.name || '',
        bio: data.bio || '',
        phone: data.phone || '',
        location: data.location || '',
        specialties: data.trainerProfile?.specialties || [],
        experience: data.trainerProfile?.experience?.toString() || '',
        certifications: data.trainerProfile?.certifications || [],
        hourlyRate: data.trainerProfile?.hourlyRate?.toString() || '',
        trainingStyle: data.trainerProfile?.trainingStyle || 'BOTH',
        trainerLocation: data.trainerProfile?.location || '',
        trainerLatitude: data.trainerProfile?.latitude?.toString() || '',
        trainerLongitude: data.trainerProfile?.longitude?.toString() || '',
        availability: JSON.stringify(data.trainerProfile?.availability || {}, null, 2),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        name: form.name,
        bio: form.bio,
        phone: form.phone,
        location: form.location || undefined,
      };
      if (isTrainer) {
        body.specialties = form.specialties;
        body.experience = parseInt(form.experience) || 0;
        body.certifications = form.certifications;
        body.hourlyRate = parseFloat(form.hourlyRate) || 0;
        body.trainingStyle = form.trainingStyle;
        body.trainerLocation = form.trainerLocation;
        body.trainerLatitude = form.trainerLatitude ? parseFloat(form.trainerLatitude) : undefined;
        body.trainerLongitude = form.trainerLongitude ? parseFloat(form.trainerLongitude) : undefined;
        try { body.availability = JSON.parse(form.availability); } catch { body.availability = {}; }
      }
      await usersApi.update(body);
      toast.success('Profile updated!');
      setEditMode(false);
      loadProfile();
      loadUser();
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const addSpecialty = () => {
    if (newSpecialty && !form.specialties.includes(newSpecialty)) {
      setForm({ ...form, specialties: [...form.specialties, newSpecialty] });
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (s) => {
    setForm({ ...form, specialties: form.specialties.filter(x => x !== s) });
  };

  const addCert = () => {
    if (newCert && !form.certifications.includes(newCert)) {
      setForm({ ...form, certifications: [...form.certifications, newCert] });
      setNewCert('');
    }
  };

  const removeCert = (c) => {
    setForm({ ...form, certifications: form.certifications.filter(x => x !== c) });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Profile</h1>
          <p className="text-dark-400 mt-1">Manage your account and preferences</p>
        </div>
        <button
          onClick={() => setEditMode(!editMode)}
          className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
            editMode
              ? 'bg-dark-700 text-dark-300 hover:text-white'
              : 'bg-primary-500/10 border border-primary-500/20 text-primary-400 hover:bg-primary-500/20'
          }`}
        >
          {editMode ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-dark-800/30 border border-dark-700/30 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-2xl font-bold text-white">
            {profile?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{profile?.name}</h2>
            <p className="text-sm text-dark-400 capitalize">{profile?.role?.toLowerCase()}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled={!editMode}
                className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-60 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Email</label>
              <div className="w-full px-4 py-3 bg-dark-900/30 border border-dark-700 rounded-xl text-dark-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {profile?.email}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              disabled={!editMode}
              rows={3}
              placeholder="Tell others about yourself..."
              className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-60 resize-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                disabled={!editMode}
                placeholder="+1-555-0000"
                className="w-full pl-10 pr-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-60 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                disabled={!editMode} placeholder="City, Country"
                className="w-full pl-10 pr-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-60 transition-all" />
            </div>
          </div>

          {isTrainer && (
            <>
              <hr className="border-dark-700/50" />
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-primary-400" />
                Trainer Profile
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Experience (years)</label>
                  <input
                    type="number"
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    disabled={!editMode}
                    className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-60 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Hourly Rate ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                    <input
                      type="number"
                      value={form.hourlyRate}
                      onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                      disabled={!editMode}
                      step="0.01"
                      className="w-full pl-10 pr-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-60 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Training Focus</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'BOTH', label: 'Bulk & Lean' },
                    { value: 'BULK', label: 'Bulk' },
                    { value: 'LEAN', label: 'Lean' },
                  ].map(opt => (
                    <button key={opt.value} type="button" onClick={() => setForm({ ...form, trainingStyle: opt.value })}
                      disabled={!editMode}
                      className={`px-3 py-2.5 text-xs font-medium rounded-xl border transition-all ${
                        form.trainingStyle === opt.value
                          ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                          : 'border-dark-700 bg-dark-900/50 text-dark-400 hover:text-dark-200'
                      } disabled:opacity-60`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-dark-300">Location</label>
                  {editMode && (
                    <button type="button" onClick={() => {
                      if (!navigator.geolocation) return;
                      navigator.geolocation.getCurrentPosition(async (pos) => {
                        const { latitude, longitude } = pos.coords;
                        setForm({ ...form, trainerLatitude: latitude.toString(), trainerLongitude: longitude.toString() });
                        try {
                          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
                          const data = await res.json();
                          const city = data.address?.city || data.address?.town || data.address?.village || '';
                          if (city) setForm(f => ({ ...f, trainerLocation: city }));
                        } catch {}
                        toast.success('Location set');
                      }, () => toast.error('Could not detect'), { enableHighAccuracy: true });
                    }} className="text-[10px] text-primary-400 hover:text-primary-300 flex items-center gap-0.5">
                      <Crosshair className="w-3 h-3" /> Detect
                    </button>
                  )}
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                  <input type="text" value={form.trainerLocation}
                    onChange={(e) => setForm({ ...form, trainerLocation: e.target.value })}
                    disabled={!editMode} placeholder="City, State"
                    className="w-full pl-10 pr-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-60 transition-all" />
                </div>
                {form.trainerLatitude && form.trainerLongitude && (
                  <p className="text-[10px] text-green-400 mt-1">Coords: {parseFloat(form.trainerLatitude).toFixed(4)}, {parseFloat(form.trainerLongitude).toFixed(4)}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Specialties</label>
                {editMode && (
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      placeholder="Add specialty..."
                      className="flex-1 px-4 py-2 bg-dark-900/50 border border-dark-700 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
                    />
                    <button type="button" onClick={addSpecialty} className="px-3 py-2 bg-primary-500/10 border border-primary-500/20 rounded-xl text-primary-400 hover:bg-primary-500/20 transition-all">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {form.specialties.map((s) => (
                    <span key={s} className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-xl bg-primary-500/10 text-primary-400 border border-primary-500/20">
                      {s}
                      {editMode && (
                        <button type="button" onClick={() => removeSpecialty(s)} className="hover:text-red-400 ml-1">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                  {form.specialties.length === 0 && <span className="text-sm text-dark-500">No specialties added</span>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Certifications</label>
                {editMode && (
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newCert}
                      onChange={(e) => setNewCert(e.target.value)}
                      placeholder="Add certification..."
                      className="flex-1 px-4 py-2 bg-dark-900/50 border border-dark-700 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCert())}
                    />
                    <button type="button" onClick={addCert} className="px-3 py-2 bg-primary-500/10 border border-primary-500/20 rounded-xl text-primary-400 hover:bg-primary-500/20 transition-all">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {form.certifications.map((c) => (
                    <span key={c} className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <GraduationCap className="w-3.5 h-3.5" />
                      {c}
                      {editMode && (
                        <button type="button" onClick={() => removeCert(c)} className="hover:text-red-400 ml-1">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                  {form.certifications.length === 0 && <span className="text-sm text-dark-500">No certifications added</span>}
                </div>
              </div>
            </>
          )}

          {editMode && (
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
