import { useState, useEffect, useRef } from 'react';
import { Plus, MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from '../lib/utils';

interface Space {
  id: string;
  creator_id: string;
  name: string;
  description: string;
  created_at: string;
  users?: {
    username: string;
    avatar_symbol: string;
    avatar_gradient: string;
  };
}

interface Message {
  id: string;
  space_id: string;
  user_id: string;
  content: string;
  created_at: string;
  users: {
    username: string;
    avatar_symbol: string;
    avatar_gradient: string;
  };
}

export function SpacesPage() {
  const { user } = useAuth();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [spaceName, setSpaceName] = useState('');
  const [spaceDescription, setSpaceDescription] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSpaces();
  }, []);

  useEffect(() => {
    if (selectedSpace) {
      loadMessages();
      const channel = supabase
        .channel(`space_${selectedSpace.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'space_messages', filter: `space_id=eq.${selectedSpace.id}` }, () => {
          loadMessages();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedSpace]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadSpaces() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('spaces')
        .select(`
          *,
          users (username, avatar_symbol, avatar_gradient)
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSpaces(data || []);
    } catch (error) {
      console.error('Error loading spaces:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages() {
    if (!selectedSpace) return;

    try {
      const { data, error } = await supabase
        .from('space_messages')
        .select(`
          *,
          users (username, avatar_symbol, avatar_gradient)
        `)
        .eq('space_id', selectedSpace.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }

  async function handleCreateSpace(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !spaceName.trim() || submitting) return;

    setSubmitting(true);
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const { data, error } = await supabase
        .from('spaces')
        .insert({
          creator_id: user.id,
          name: spaceName.trim(),
          description: spaceDescription.trim() || null,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setSpaceName('');
      setSpaceDescription('');
      setShowCreateForm(false);
      await loadSpaces();

      if (data) {
        setSelectedSpace(data);
      }
    } catch (error) {
      console.error('Error creating space:', error);
      alert('Failed to create space. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !selectedSpace || !newMessage.trim() || submitting) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('space_messages')
        .insert({
          space_id: selectedSpace.id,
          user_id: user.id,
          content: messageContent,
        })
        .select(`
          *,
          users (username, avatar_symbol, avatar_gradient)
        `)
        .single();

      if (error) throw error;

      if (data) {
        setMessages(prev => [...prev, data]);
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (selectedSpace) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 flex flex-col z-40">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedSpace.name}</h2>
            {selectedSpace.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{selectedSpace.description}</p>
            )}
          </div>
          <button
            onClick={() => setSelectedSpace(null)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 text-sm">No messages yet. Start the conversation!</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-3">
                <div className={`w-8 h-8 bg-gradient-to-br ${msg.users.avatar_gradient} rounded-full flex items-center justify-center text-sm flex-shrink-0`}>
                  {msg.users.avatar_symbol}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {msg.users.username}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(msg.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Send a message..."
              className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-full text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || submitting}
              className="p-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 md:pb-0">
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between z-10">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Spaces</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="p-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-full transition-all"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 w-full md:max-w-md md:rounded-2xl rounded-t-3xl p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create a Space</h2>
            <form onSubmit={handleCreateSpace} className="space-y-4">
              <input
                type="text"
                value={spaceName}
                onChange={(e) => setSpaceName(e.target.value)}
                placeholder="Space name"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500"
              />
              <textarea
                value={spaceDescription}
                onChange={(e) => setSpaceDescription(e.target.value)}
                placeholder="Description (optional)"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 resize-none h-20"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setSpaceName('');
                    setSpaceDescription('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!spaceName.trim() || submitting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="p-4 space-y-3 max-w-2xl mx-auto">
        {spaces.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No spaces yet. Create one to get started!</p>
          </div>
        ) : (
          spaces.map((space) => (
            <button
              key={space.id}
              onClick={() => setSelectedSpace(space)}
              className="w-full p-4 bg-white dark:bg-gray-800 rounded-xl hover:shadow-lg transition-all text-left border border-gray-200 dark:border-gray-700"
            >
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">{space.name}</h3>
              {space.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{space.description}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {formatDistanceToNow(space.created_at)}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
