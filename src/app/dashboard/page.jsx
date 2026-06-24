'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth';
import { sessions as sessionsApi, calories as caloriesApi, diet as dietApi, trainers as trainersApi, users as usersApi } from '@/lib/api';
import { motion } from 'framer-motion';
import {
  CalendarDays, Users, TrendingUp, ArrowRight,
  Dumbbell, Calendar, MessageSquare, Plus, Loader2,
  Apple, Flame, Zap, Target, Ruler, Weight, Activity, ChevronRight,
  Star, UserCheck, Clock, BarChart3, UserPlus, Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getWeekBounds() {
  const now = new Date();
  const day = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function getDatesInRange(start, end) {
  const dates = [];
  const cur = new Date(start);
  while (cur <= end) {
    dates.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function StarRating({ rating, size = 'sm' }) {
  const s = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`${s} ${i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-dark-600'}`} />
      ))}
    </div>
  );
}

function TrainerDashboard({ user }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [statsData, sessionsData, profileData] = await Promise.all([
        trainersApi.stats(),
        sessionsApi.list({ role: 'trainer' }),
        usersApi.profile(),
      ]);
      setStats(statsData);
      setSessions(sessionsData.filter(s => s.status === 'ACTIVE' || s.status === 'PENDING'));
      setProfile(profileData);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
    </div>
  );

  const avgRating = stats?.avgRating || 0;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const tp = profile?.trainerProfile;

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
        <motion.div variants={item}>
          <h1 className="text-3xl font-bold text-white">
            Trainer Dashboard, <span className="text-gradient">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-dark-400 mt-1">Manage your clients, track performance, and grow your training business.</p>
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Rating', value: avgRating > 0 ? avgRating.toFixed(1) : '--', icon: Star, color: 'from-amber-500 to-amber-600', suffix: avgRating > 0 ? '/5' : 'No reviews', extra: avgRating > 0 ? <StarRating rating={avgRating} size="sm" /> : null },
            { label: 'Clients', value: stats?.clients ?? 0, icon: Users, color: 'from-blue-500 to-blue-600', suffix: 'total' },
            { label: 'Upcoming', value: stats?.upcomingCount ?? 0, icon: Clock, color: 'from-emerald-500 to-emerald-600', suffix: 'sessions' },
            { label: 'Completed', value: stats?.completedCount ?? 0, icon: BarChart3, color: 'from-purple-500 to-purple-600', suffix: 'sessions' },
          ].map((stat, i) => (
            <div key={i} className="bg-dark-800/50 border border-dark-700/50 rounded-2xl p-5 card-hover">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-dark-400">{stat.label}</span>
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white">
                {stat.value}
                {stat.suffix && <span className="text-sm font-normal text-dark-400 ml-1">{stat.suffix}</span>}
              </div>
              {stat.extra && <div className="mt-1">{stat.extra}</div>}
            </div>
          ))}
        </motion.div>

        <motion.div variants={item} className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-dark-800/30 border border-dark-700/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-400" /> Upcoming Sessions
              </h3>
              <Link href="/trainer/trainees" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
                All trainees <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-dark-500 text-sm">No upcoming sessions</div>
            ) : (
              <div className="space-y-3 max-h-[320px] overflow-y-auto">
                {sessions.slice(0, 8).map(s => (
                  <Link key={s.id} href={`/trainer/trainees/${s.traineeId}`}
                    className="flex items-center justify-between p-3 bg-dark-800/30 border border-dark-700/30 rounded-xl hover:border-primary-500/30 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-xs font-bold text-white">
                        {s.trainee?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white group-hover:text-primary-400 transition-colors">{s.trainee?.name || 'Unknown'}</p>
                        <p className="text-xs text-dark-400">{new Date(s.startDate).toLocaleDateString()} - {new Date(s.endDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      s.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {s.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="bg-dark-800/30 border border-dark-700/30 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary-400" /> Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs p-3 bg-dark-800/30 border border-dark-700/20 rounded-lg">
                <span className="text-dark-400">Consistency</span>
                <span className="text-white font-semibold">{stats?.streak || 0} sessions completed</span>
              </div>
              <div className="flex items-center justify-between text-xs p-3 bg-dark-800/30 border border-dark-700/20 rounded-lg">
                <span className="text-dark-400">Reviews</span>
                <span className="text-white font-semibold">{stats?.reviewCount || 0} total</span>
              </div>
              <div className="flex items-center justify-between text-xs p-3 bg-dark-800/30 border border-dark-700/20 rounded-lg">
                <span className="text-dark-400">Training Style</span>
                <span className="text-white font-semibold">{tp?.trainingStyle || 'BOTH'}</span>
              </div>
              <div className="flex items-center justify-between text-xs p-3 bg-dark-800/30 border border-dark-700/20 rounded-lg">
                <span className="text-dark-400">Hourly Rate</span>
                <span className="text-white font-semibold">${tp?.hourlyRate || 0}/hr</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="grid lg:grid-cols-4 gap-4">
          <Link href="/trainer/trainees" className="bg-dark-800/30 border border-dark-700/30 rounded-2xl p-5 card-hover hover:border-primary-500/30 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mb-3">
              <UserPlus className="w-5 h-5 text-primary-400" />
            </div>
            <p className="text-sm font-semibold text-white group-hover:text-primary-400 transition-colors">Manage Trainees</p>
            <p className="text-xs text-dark-400 mt-1">Diet, schedule & sessions</p>
          </Link>
          <Link href="/trainer/profile" className="bg-dark-800/30 border border-dark-700/30 rounded-2xl p-5 card-hover hover:border-amber-500/30 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
              <Settings className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">Trainer Profile</p>
            <p className="text-xs text-dark-400 mt-1">Cover, bio, achievements</p>
          </Link>
          <Link href="/workout-planner" className="bg-dark-800/30 border border-dark-700/30 rounded-2xl p-5 card-hover hover:border-emerald-500/30 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
              <Dumbbell className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">Workout Planner</p>
            <p className="text-xs text-dark-400 mt-1">Build training routines</p>
          </Link>
          <Link href="/messages" className="bg-dark-800/30 border border-dark-700/30 rounded-2xl p-5 card-hover hover:border-blue-500/30 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3">
              <MessageSquare className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">Messages</p>
            <p className="text-xs text-dark-400 mt-1">Chat with clients</p>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

function TraineeDashboard({ user }) {
  const [loading, setLoading] = useState(true);
  const [weeklyCalories, setWeeklyCalories] = useState(0);
  const [dailyCalories, setDailyCalories] = useState({});
  const [streak, setStreak] = useState(0);
  const [trainerName, setTrainerName] = useState(null);
  const [trainerAvatar, setTrainerAvatar] = useState(null);
  const [activeSessions, setActiveSessions] = useState(0);
  const [weekPct, setWeekPct] = useState(0);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { start, end } = getWeekBounds();
      const startStr = formatDate(start);
      const endStr = formatDate(end);

      const [sessionsData, logsData, plansData] = await Promise.all([
        sessionsApi.list(),
        caloriesApi.list({ startDate: startStr, endDate: endStr }),
        dietApi.list('mine'),
      ]);

      const activeCalLogs = logsData || [];

      const calByDate = {};
      let total = 0;
      activeCalLogs.forEach(log => {
        const d = log.date ? log.date.split('T')[0] : '';
        if (d) {
          calByDate[d] = (calByDate[d] || 0) + (log.totalCalories || 0);
          total += (log.totalCalories || 0);
        }
      });
      setDailyCalories(calByDate);
      setWeeklyCalories(total);

      const weekGoal = (user?.goal === 'BULK' ? 3200 : 2200) * 7;
      setWeekPct(weekGoal > 0 ? Math.min(100, Math.round((total / weekGoal) * 100)) : 0);

      let streakCount = 0;
      const cur = new Date();
      cur.setHours(0, 0, 0, 0);
      for (let i = 0; i < 60; i++) {
        const d = formatDate(cur);
        const hasCal = calByDate[d] > 0;
        const hasPlan = plansData.some(p => {
          if (!p.startDate) return false;
          const s = new Date(p.startDate);
          const sStr = formatDate(s);
          return sStr <= d;
        });
        if (hasCal || hasPlan) {
          streakCount++;
          cur.setDate(cur.getDate() - 1);
        } else break;
      }
      setStreak(streakCount);

      const now = new Date();
      const mySessions = sessionsData.filter(s =>
        s.status === 'CONFIRMED' && new Date(s.endDate) > now
      );
      setActiveSessions(mySessions.length);

      if (mySessions.length > 0 && mySessions[0].trainer) {
        setTrainerName(mySessions[0].trainer.name);
        setTrainerAvatar(mySessions[0].trainer.avatar);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
    </div>
  );

  const dates = getDatesInRange(getWeekBounds().start, getWeekBounds().end);
  const maxDailyCal = Math.max(...dates.map(d => dailyCalories[formatDate(d)] || 0), 1);
  const bmiValue = user?.bmi;
  const bmiCat = bmiValue < 18.5 ? 'Underweight' : bmiValue < 25 ? 'Normal' : bmiValue < 30 ? 'Overweight' : 'Obese';
  const bmiColor = bmiValue < 18.5 ? 'text-amber-400' : bmiValue < 25 ? 'text-green-400' : bmiValue < 30 ? 'text-orange-400' : 'text-red-400';

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
        <motion.div variants={item}>
          <h1 className="text-3xl font-bold text-white">
            Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-dark-400 mt-1">Stay on track with your fitness journey.</p>
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Week Calories', value: `${weeklyCalories}`, icon: Flame, color: 'from-amber-500 to-amber-600', suffix: 'kcal' },
            { label: 'Streak', value: streak, icon: Zap, color: 'from-primary-500 to-primary-600', suffix: 'days' },
            { label: trainerName || 'No Trainer', value: trainerName ? '' : '', icon: Users, color: 'from-blue-500 to-blue-600', suffix: '', isTrainerInfo: !!trainerName },
            { label: user?.goal === 'BULK' ? 'Bulk Mode' : 'Lean Mode', value: bmiValue ? `${bmiValue}` : '--', icon: Target, color: 'from-purple-500 to-purple-600', suffix: bmiValue ? bmiCat : 'Set goal', bmiColor },
          ].map((stat, i) => (
            <div key={i} className="bg-dark-800/50 border border-dark-700/50 rounded-2xl p-5 card-hover">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-dark-400">{stat.label}</span>
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
              </div>
              {stat.isTrainerInfo ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {trainerName?.charAt(0) || 'T'}
                  </div>
                  <span className="text-sm font-medium text-white truncate">{trainerName}</span>
                </div>
              ) : (
                <div className="text-3xl font-bold text-white">
                  {stat.value}
                  {stat.suffix && <span className="text-sm font-normal text-dark-400 ml-1">{stat.suffix}</span>}
                </div>
              )}
              {stat.bmiColor && bmiValue && (
                <p className={`text-xs font-medium mt-0.5 ${stat.bmiColor}`}>{bmiCat}</p>
              )}
              {stat.isTrainerInfo && <p className="text-xs text-dark-400 mt-0.5">Your trainer</p>}
            </div>
          ))}
        </motion.div>

        <motion.div variants={item} className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-dark-800/30 border border-dark-700/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" /> Weekly Calories
              </h3>
              <Link href="/diet-plan" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
                Details <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex items-end gap-2 sm:gap-3 h-40">
              {dates.map((d, i) => {
                const key = formatDate(d);
                const cal = dailyCalories[key] || 0;
                const pct = Math.max(3, Math.round((cal / maxDailyCal) * 100));
                const isToday = formatDate(new Date()) === key;
                return (
                  <div key={key} className="flex-1 flex flex-col items-center gap-1.5 justify-end">
                    <span className="text-[10px] text-dark-500 font-medium">{cal > 0 ? cal : ''}</span>
                    <div className={`w-full rounded-lg transition-all duration-500 ${isToday ? 'bg-gradient-to-t from-primary-500 to-primary-400' : 'bg-primary-500/50'} ${cal > 0 ? 'opacity-100' : 'opacity-20'}`}
                      style={{ height: `${pct}%` }}
                    />
                    <span className={`text-[10px] font-medium ${isToday ? 'text-primary-400' : 'text-dark-500'}`}>{DAYS[d.getDay()]}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-dark-400">Total: <strong className="text-white">{weeklyCalories}</strong> kcal</span>
              <span className="text-dark-400">Goal: <strong className="text-white">{Math.round(weekPct * (user?.goal === 'BULK' ? 3200 : 2200) * 7 / 100)}</strong> kcal</span>
              <span className={`font-medium ${weekPct >= 80 ? 'text-green-400' : weekPct >= 50 ? 'text-amber-400' : 'text-dark-400'}`}>{weekPct}%</span>
            </div>
          </div>

          <div className="bg-dark-800/30 border border-dark-700/30 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary-400" /> This Week
            </h3>
            <div className="grid grid-cols-7 gap-1.5 mb-4">
              {dates.map((d, i) => {
                const key = formatDate(d);
                const hasCal = dailyCalories[key] > 0;
                const isToday = formatDate(new Date()) === key;
                return (
                  <div key={key} className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-dark-500">{DAYS[d.getDay()]}</span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                      isToday ? 'ring-2 ring-primary-500' : ''
                    } ${
                      hasCal ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-dark-800/50 text-dark-600 border border-dark-700/30'
                    }`}>
                      {d.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs p-2.5 bg-dark-800/30 border border-dark-700/20 rounded-lg">
                <span className="text-dark-400">Consistency</span>
                <span className="text-white font-semibold">{streak} day streak</span>
              </div>
              {trainerName && (
                <div className="flex items-center justify-between text-xs p-2.5 bg-dark-800/30 border border-dark-700/20 rounded-lg">
                  <span className="text-dark-400">Trainer</span>
                  <span className="text-white font-semibold">{trainerName}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs p-2.5 bg-dark-800/30 border border-dark-700/20 rounded-lg">
                <span className="text-dark-400">Goal</span>
                <span className="text-white font-semibold">{user?.goal === 'BULK' ? 'Bulk' : 'Lean'}</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 bg-dark-800/30 border border-dark-700/20 rounded-lg">
                <span className="text-dark-400">Active Plans</span>
                <span className="text-white font-semibold">{activeSessions} sessions</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="grid lg:grid-cols-4 gap-4">
          <Link href="/workout-planner" className="bg-dark-800/30 border border-dark-700/30 rounded-2xl p-5 card-hover hover:border-primary-500/30 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
              <Dumbbell className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-white group-hover:text-primary-400 transition-colors">Workout Planner</p>
            <p className="text-xs text-dark-400 mt-1">Build your daily routines</p>
          </Link>
          <Link href="/diet-plan" className="bg-dark-800/30 border border-dark-700/30 rounded-2xl p-5 card-hover hover:border-amber-500/30 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
              <Apple className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">Diet Plan</p>
            <p className="text-xs text-dark-400 mt-1">Track meals & calories</p>
          </Link>
          <Link href="/calendar" className="bg-dark-800/30 border border-dark-700/30 rounded-2xl p-5 card-hover hover:border-blue-500/30 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3">
              <CalendarDays className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">Schedule</p>
            <p className="text-xs text-dark-400 mt-1">View weekly plan</p>
          </Link>
          <Link href="/settings" className="bg-dark-800/30 border border-dark-700/30 rounded-2xl p-5 card-hover hover:border-purple-500/30 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-3">
              <Target className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-sm font-semibold text-white group-hover:text-purple-400 transition-colors">Settings</p>
            <p className="text-xs text-dark-400 mt-1">Weight, goal & profile</p>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const isTrainer = user?.role === 'TRAINER' || user?.role === 'BOTH';

  if (isTrainer) return <TrainerDashboard user={user} />;
  return <TraineeDashboard user={user} />;
}

export default function DashboardPage() {
  return <ProtectedRoute><DashboardContent /></ProtectedRoute>;
}