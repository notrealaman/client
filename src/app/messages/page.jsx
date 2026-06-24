'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { messages as messagesApi } from '@/lib/api';
import { motion } from 'framer-motion';
import { MessageSquare, Loader2, ChevronRight } from 'lucide-react';

function MessagesContent() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadConversations(); }, []);

  const loadConversations = async () => {
    try {
      const data = await messagesApi.conversations();
      setConversations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Messages</h1>
        <p className="text-dark-400 mt-1">Chat with your trainers and trainees</p>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-20">
          <MessageSquare className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No conversations yet</h3>
          <p className="text-dark-400">Start by browsing trainers and sending a message.</p>
          <Link
            href="/trainers"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-primary-500/10 border border-primary-500/20 text-primary-400 rounded-xl text-sm font-medium hover:bg-primary-500/20 transition-all"
          >
            Browse Trainers
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv, i) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/messages/${conv.id}`}
                className="flex items-center gap-4 p-4 bg-dark-800/30 border border-dark-700/30 rounded-2xl hover:border-dark-600 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
                  {conv.otherUser?.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-white truncate">{conv.otherUser?.name}</h3>
                    {conv.lastMessage && (
                      <span className="text-xs text-dark-500 flex-shrink-0 ml-2">
                        {new Date(conv.lastMessageAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-dark-400 truncate">
                    {conv.lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-dark-500 group-hover:text-dark-300 transition-colors flex-shrink-0" />
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <ProtectedRoute>
      <MessagesContent />
    </ProtectedRoute>
  );
}
