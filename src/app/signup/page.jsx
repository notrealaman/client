'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Dumbbell, Eye, EyeOff, Loader2, User, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('TRAINEE');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !username || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await signup(name, email, password, role, username);
      toast.success('Account created successfully!');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-3xl p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Gym<span className="text-primary-400">Buddy</span></span>
            </Link>
            <h1 className="text-2xl font-bold text-white">Create your account</h1>
            <p className="text-dark-400 mt-1">Join the fitness community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('TRAINEE')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                    role === 'TRAINEE'
                      ? 'bg-primary-500/10 border-primary-500/30 text-primary-400'
                      : 'bg-dark-900/50 border-dark-700 text-dark-300 hover:border-dark-600'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium">Trainee</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('TRAINER')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                    role === 'TRAINER'
                      ? 'bg-primary-500/10 border-primary-500/30 text-primary-400'
                      : 'bg-dark-900/50 border-dark-700 text-dark-300 hover:border-dark-600'
                  }`}
                >
                  <GraduationCap className="w-5 h-5" />
                  <span className="text-sm font-medium">Trainer</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                placeholder="johndoe"
                className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-dark-400">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-400 hover:text-primary-300 font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
