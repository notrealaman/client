'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Dumbbell, Search, Calendar, MessageSquare, Star, ArrowRight, Users, Shield, Clock, Zap } from 'lucide-react';
import { useAuth } from '@/lib/auth';

const features = [
  { icon: Search, title: 'Find Trainers', description: 'Browse certified trainers by specialty, location, and rates.' },
  { icon: Calendar, title: 'Book Sessions', description: 'Schedule one-on-one sessions at your convenience.' },
  { icon: MessageSquare, title: 'Chat Instantly', description: 'Message your trainer directly for quick questions.' },
  { icon: Star, title: 'Read Reviews', description: 'See real reviews from other trainees before booking.' },
];

const stats = [
  { icon: Users, value: '50+', label: 'Expert Trainers' },
  { icon: Shield, title: '100%', label: 'Verified Pros' },
  { icon: Clock, value: '500+', label: 'Sessions Booked' },
  { icon: Zap, value: '95%', label: 'Satisfaction Rate' },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 via-transparent to-transparent" />
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              Your Personal Fitness Partner
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
              Find Your Perfect
              <span className="text-gradient block mt-2">Gym Trainer</span>
            </h1>

            <p className="text-lg sm:text-xl text-dark-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Connect with expert trainers, book personalized sessions, and stay consistent
              with your fitness journey. Your transformation starts here.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <Link
                  href="/trainers"
                  className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 rounded-xl transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
                >
                  Find Trainers
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 rounded-xl transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-8 py-4 text-base font-medium text-dark-200 bg-dark-800/50 hover:bg-dark-800 border border-dark-700/50 hover:border-dark-600 rounded-xl transition-all"
                  >
                    I&apos;m a Trainer
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map((stat, i) => (
            <div key={i} className="bg-dark-800/50 border border-dark-700/50 rounded-2xl p-6 text-center card-hover">
              <stat.icon className="w-8 h-8 text-primary-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{stat.value || stat.title}</div>
              <div className="text-sm text-dark-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-dark-400 text-lg max-w-xl mx-auto">
            Four simple steps to start your fitness transformation
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Sign Up', desc: 'Create your account as a trainee or trainer in seconds.' },
            { step: '02', title: 'Browse Trainers', desc: 'Filter by specialty, location, experience, and rates.' },
            { step: '03', title: 'Book a Session', desc: 'Pick a time that works for you and confirm instantly.' },
            { step: '04', title: 'Get Fit', desc: 'Train consistently and track your progress with your coach.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-dark-800/30 border border-dark-700/30 rounded-2xl p-6 hover:border-primary-500/30 transition-all group"
            >
              <div className="text-4xl font-bold text-primary-500/30 group-hover:text-primary-500/50 transition-colors mb-4">{item.step}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-dark-400 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Everything You <span className="text-gradient">Need</span>
        </h2>
        <p className="text-dark-400 text-lg max-w-xl mx-auto">
          Workout plans, diet tracking, and expert guidance — all in one place
        </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-dark-800/30 border border-dark-700/30 rounded-2xl p-6 card-hover"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-dark-400 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-r from-primary-600/10 via-primary-500/5 to-transparent border-t border-primary-500/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Fitness Journey?
            </h2>
            <p className="text-dark-400 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of people who found their perfect trainer on Gym Buddy.
            </p>
            {user ? (
              <Link
                href="/trainers"
                className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 rounded-xl transition-all shadow-lg shadow-primary-500/25"
              >
                Find Your Trainer
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 rounded-xl transition-all shadow-lg shadow-primary-500/25"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-dark-800/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-primary-400" />
            <span className="text-sm text-dark-400">Gym Buddy</span>
          </div>
          <p className="text-sm text-dark-500">Built for the fitness community.</p>
        </div>
      </footer>
    </div>
  );
}
