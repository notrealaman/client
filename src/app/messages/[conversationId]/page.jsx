'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth';
import { messages as messagesApi } from '@/lib/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Send, Loader2, ChevronLeft, MessageSquare } from 'lucide-react';

function ConversationContent() {
  const { conversationId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversation();
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversation = async () => {
    try {
      const [messagesData, convList] = await Promise.all([
        messagesApi.getMessages(conversationId),
        messagesApi.conversations(),
      ]);
      setMessages(messagesData);
      const conv = convList.find(c => c.id === conversationId);
      setConversation(conv || null);
    } catch (err) {
      toast.error('Failed to load conversation');
      router.push('/messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      const msg = await messagesApi.sendMessage(conversationId, newMessage);
      setMessages(prev => [...prev, msg]);
      setNewMessage('');
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="bg-dark-800/30 border border-dark-700/30 rounded-2xl overflow-hidden flex flex-col h-[calc(100vh-12rem)] sm:h-[600px]">
        <div className="flex items-center gap-3 p-4 border-b border-dark-700/30 bg-dark-800/50">
          <button onClick={() => router.push('/messages')} className="sm:hidden p-1 text-dark-400 hover:text-white">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-base font-bold text-white flex-shrink-0">
            {conversation?.otherUser?.name?.charAt(0) || '?'}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">{conversation?.otherUser?.name || 'Unknown'}</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare className="w-12 h-12 text-dark-600 mb-3" />
              <p className="text-dark-400 text-sm">No messages yet. Send a message to start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMe = msg.senderId === user?.id;
              const showAvatar = i === 0 || messages[i - 1]?.senderId !== msg.senderId;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}
                >
                  {showAvatar ? (
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${isMe ? 'ml-0' : 'mr-0'}`}>
                      {msg.sender?.name?.charAt(0) || (isMe ? user?.name?.charAt(0) : '?')}
                    </div>
                  ) : (
                    <div className="w-8 flex-shrink-0" />
                  )}
                  <div className={`max-w-[80%] sm:max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-tr-md'
                        : 'bg-dark-700/50 text-dark-100 rounded-tl-md'
                    }`}>
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-dark-500 mt-1 px-1">
                      {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="p-4 border-t border-dark-700/30 bg-dark-800/50">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ConversationPage() {
  return (
    <ProtectedRoute>
      <ConversationContent />
    </ProtectedRoute>
  );
}
