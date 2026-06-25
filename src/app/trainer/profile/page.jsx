'use client';

import { useState, useEffect, useRef } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth';
import { users as usersApi } from '@/lib/api';
import { motion } from 'framer-motion';
import {
  Loader2, Camera, Plus, X, Save, Image,
  Trophy, User, Dumbbell, FileImage, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function uploadImage(base64) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/upload/photo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: JSON.stringify({ image: base64 }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Upload failed');
  return data.url;
}

function TrainerProfileContent() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);

  const [bio, setBio] = useState('');
  const [specialties, setSpecialties] = useState([]);
  const [experience, setExperience] = useState(0);
  const [hourlyRate, setHourlyRate] = useState(0);
  const [trainingStyle, setTrainingStyle] = useState('BOTH');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const [coverImage, setCoverImage] = useState('');
  const [achievements, setAchievements] = useState([]);
  const [physique, setPhysique] = useState('');
  const [photos, setPhotos] = useState([]);
  const [avatar, setAvatar] = useState('');

  const [newAchievement, setNewAchievement] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');
  const coverInput = useRef(null);
  const photoInput = useRef(null);
  const avatarInput = useRef(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const data = await usersApi.profile();
      setProfile(data);
      const tp = data.trainerProfile || {};
      setBio(data.bio || '');
      setAvatar(data.avatar || '');
      setCoverImage(tp.coverImage || '');
      setAchievements(tp.achievements || []);
      setPhysique(tp.physique || '');
      setPhotos(tp.photos || []);
      setSpecialties(tp.specialties || []);
      setExperience(tp.experience || 0);
      setHourlyRate(tp.hourlyRate || 0);
      setTrainingStyle(tp.trainingStyle || 'BOTH');
      setLocation(tp.location || '');
      setLatitude(tp.latitude || '');
      setLongitude(tp.longitude || '');
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCoverImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatar(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotos(prev => [...prev, ev.target.result]);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const addAchievement = () => {
    const val = newAchievement.trim();
    if (!val) return;
    setAchievements(prev => [...prev, val]);
    setNewAchievement('');
  };

  const addSpecialty = () => {
    const val = newSpecialty.trim();
    if (!val) return;
    setSpecialties(prev => [...prev, val]);
    setNewSpecialty('');
  };

  const detectLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLatitude(pos.coords.latitude.toString());
        setLongitude(pos.coords.longitude.toString());
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || '';
          const country = data.address?.country || '';
          setLocation(city ? `${city}, ${country}` : country);
          toast.success('Location detected');
        } catch { toast.success('Coordinates detected'); }
      },
      () => toast.error('Location access denied'),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let finalAvatar = avatar;
      let finalCover = coverImage;
      let finalPhotos = photos;

      if (avatar && avatar.startsWith('data:')) {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/upload/avatar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
          body: JSON.stringify({ image: avatar }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Avatar upload failed');
        finalAvatar = data.avatar;
      }

      if (coverImage && coverImage.startsWith('data:')) {
        finalCover = await uploadImage(coverImage);
      }

      if (photos.some(p => p.startsWith('data:'))) {
        finalPhotos = await Promise.all(photos.map(p => p.startsWith('data:') ? uploadImage(p) : p));
      }

      const payload = {
        bio, avatar: finalAvatar, coverImage: finalCover, physique,
        achievements, photos: finalPhotos,
        specialties, experience, hourlyRate,
        trainingStyle, trainerLocation: location,
        trainerLatitude: latitude, trainerLongitude: longitude,
      };
      await usersApi.update(payload);
      await refreshUser();
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Trainer Profile</h1>
          <p className="text-dark-400 mt-1">Showcase your expertise, achievements and physique</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-1.5 text-sm font-medium bg-primary-500/10 text-primary-400 border border-primary-500/20 rounded-xl px-4 py-2 hover:bg-primary-500/20 transition-colors disabled:opacity-50">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

        <div className="bg-dark-800/30 border border-dark-700/30 rounded-2xl overflow-hidden">
          <div className="relative h-48 sm:h-64 bg-gradient-to-br from-dark-700 to-dark-900">
            {coverImage ? (
              <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-dark-600">
                <Image className="w-12 h-12" />
              </div>
            )}
            <button onClick={() => coverInput.current?.click()}
              className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs font-medium bg-dark-900/70 text-white border border-dark-600/50 rounded-lg px-3 py-1.5 hover:bg-dark-900/90 transition-colors backdrop-blur-sm">
              <Camera className="w-3.5 h-3.5" /> {coverImage ? 'Change' : 'Add'} Cover
            </button>
            <input ref={coverInput} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
          </div>

          <div className="px-6 pb-6">
            <div className="flex items-end -mt-12 mb-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-dark-800 bg-dark-700 overflow-hidden">
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-dark-500">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <button onClick={() => avatarInput.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary-500 border-2 border-dark-800 flex items-center justify-center hover:bg-primary-400 transition-colors">
                  <Camera className="w-3 h-3 text-white" />
                </button>
                <input ref={avatarInput} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-dark-400 mb-1 block">Bio / About Me</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                  className="w-full bg-dark-800/50 border border-dark-700/30 rounded-xl p-3 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-primary-500/50 transition-colors"
                  placeholder="Tell trainees about yourself..." />
              </div>
              <div>
                <label className="text-xs text-dark-400 mb-1 block">Physique Details</label>
                <textarea value={physique} onChange={e => setPhysique(e.target.value)} rows={3}
                  className="w-full bg-dark-800/50 border border-dark-700/30 rounded-xl p-3 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-primary-500/50 transition-colors"
                  placeholder="Height, weight, body fat %, competition stats..." />
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-dark-800/30 border border-dark-700/30 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
              <Trophy className="w-4 h-4 text-amber-400" /> Achievements
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {achievements.map((a, i) => (
                <span key={i} className="flex items-center gap-1 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full px-2.5 py-1">
                  {a}
                  <button onClick={() => setAchievements(prev => prev.filter((_, j) => j !== i))}
                    className="hover:text-red-400 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newAchievement} onChange={e => setNewAchievement(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addAchievement()}
                placeholder="Add achievement..." maxLength={60}
                className="flex-1 bg-dark-800/50 border border-dark-700/30 rounded-lg px-3 py-1.5 text-xs text-white placeholder-dark-500 focus:outline-none focus:border-primary-500/50" />
              <button onClick={addAchievement}
                className="text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg px-3 py-1.5 hover:bg-amber-500/20 transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="bg-dark-800/30 border border-dark-700/30 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-primary-400" /> Expertise & Details
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-dark-400 mb-1 block">Specialties</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {specialties.map((s, i) => (
                    <span key={i} className="flex items-center gap-1 text-xs bg-primary-500/10 text-primary-400 border border-primary-500/20 rounded-full px-2.5 py-1">
                      {s}
                      <button onClick={() => setSpecialties(prev => prev.filter((_, j) => j !== i))}
                        className="hover:text-red-400 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={newSpecialty} onChange={e => setNewSpecialty(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addSpecialty()}
                    placeholder="Add specialty..." maxLength={40}
                    className="flex-1 bg-dark-800/50 border border-dark-700/30 rounded-lg px-3 py-1.5 text-xs text-white placeholder-dark-500 focus:outline-none focus:border-primary-500/50" />
                  <button onClick={addSpecialty}
                    className="text-xs font-medium bg-primary-500/10 text-primary-400 border border-primary-500/20 rounded-lg px-3 py-1.5 hover:bg-primary-500/20 transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-dark-400 mb-1 block">Experience (years)</label>
                  <input type="number" min="0" value={experience}
                    onChange={e => setExperience(parseInt(e.target.value) || 0)}
                    className="w-full bg-dark-800/50 border border-dark-700/30 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary-500/50" />
                </div>
                <div>
                  <label className="text-xs text-dark-400 mb-1 block">Hourly Rate ($)</label>
                  <input type="number" min="0" step="1" value={hourlyRate}
                    onChange={e => setHourlyRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-dark-800/50 border border-dark-700/30 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary-500/50" />
                </div>
              </div>
              <div>
                <label className="text-xs text-dark-400 mb-1 block">Training Style</label>
                <div className="flex gap-2">
                  {['BULK', 'LEAN', 'BOTH'].map(style => (
                    <button key={style} onClick={() => setTrainingStyle(style)}
                      className={`flex-1 text-xs font-medium rounded-lg py-1.5 border transition-colors ${
                        trainingStyle === style
                          ? 'bg-primary-500/10 text-primary-400 border-primary-500/30'
                          : 'bg-dark-800/50 text-dark-400 border-dark-700/30 hover:border-dark-500'
                      }`}>
                      {style === 'BULK' ? 'Bulk' : style === 'LEAN' ? 'Lean' : 'Both'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-dark-400 mb-1 block">Location</label>
                <div className="flex gap-2">
                  <input value={location} onChange={e => setLocation(e.target.value)}
                    placeholder="City, Country"
                    className="flex-1 bg-dark-800/50 border border-dark-700/30 rounded-lg px-3 py-1.5 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-primary-500/50" />
                  <button onClick={detectLocation}
                    className="text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg px-3 py-1.5 hover:bg-blue-500/20 transition-colors whitespace-nowrap">
                    Detect
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-dark-400 mb-1 block">Latitude</label>
                  <input type="number" step="any" value={latitude}
                    onChange={e => setLatitude(e.target.value)}
                    className="w-full bg-dark-800/50 border border-dark-700/30 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary-500/50" />
                </div>
                <div>
                  <label className="text-xs text-dark-400 mb-1 block">Longitude</label>
                  <input type="number" step="any" value={longitude}
                    onChange={e => setLongitude(e.target.value)}
                    className="w-full bg-dark-800/50 border border-dark-700/30 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary-500/50" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-dark-800/30 border border-dark-700/30 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
            <Dumbbell className="w-4 h-4 text-emerald-400" /> Physique Photos
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((photo, i) => (
              <div key={i} className="relative aspect-[3/4] rounded-xl overflow-hidden bg-dark-800/50 border border-dark-700/30 group">
                <img src={photo} alt={`Physique ${i+1}`} className="w-full h-full object-cover" />
                <button onClick={() => removePhoto(i)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
            <button onClick={() => photoInput.current?.click()}
              className="aspect-[3/4] rounded-xl border-2 border-dashed border-dark-600/50 flex flex-col items-center justify-center gap-1 hover:border-primary-500/50 transition-colors group">
              <Plus className="w-6 h-6 text-dark-500 group-hover:text-primary-400 transition-colors" />
              <span className="text-[10px] text-dark-500 group-hover:text-primary-400 transition-colors">Add Photo</span>
            </button>
          </div>
          <input ref={photoInput} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
        </div>

      </motion.div>
    </div>
  );
}

export default function TrainerProfilePage() {
  return <ProtectedRoute><TrainerProfileContent /></ProtectedRoute>;
}