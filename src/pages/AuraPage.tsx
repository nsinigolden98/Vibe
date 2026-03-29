import { useState, useEffect } from 'react';
import { Users, Heart, MessageCircle, Loader2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from '../lib/utils';
import { FullPostView } from '../components/drops/FullPostView';

interface Drop {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  mood: string | null;
  created_at: string;
  users: {
    username: string;
    avatar_symbol: string;
    avatar_gradient: string;
  };
}

interface Pulse {
  id: string;
  question: string;
  options: Array<{ text: string }>;
  created_at: string;
}

export function AuraPage() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'drops' | 'pulses' | 'vibing' | 'vibers'>('drops');
  const [drops, setDrops] = useState<Drop[]>([]);
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [vibing, setVibing] = useState<any[]>([]);
  const [vibers, setVibers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDropId, setSelectedDropId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    if (activeTab === 'drops') loadDrops();
    else if (activeTab === 'pulses') loadPulses();
    else if (activeTab === 'vibing') loadVibing();
    else if (activeTab === 'vibers') loadVibers();
  }, [activeTab, user]);

  async function loadDrops() {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('drops')
        .select(`
          *,
          users (username, avatar_symbol, avatar_gradient)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDrops(data || []);
    } catch (error) {
      console.error('Error loading drops:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadPulses() {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pulses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPulses(data || []);
    } catch (error) {
      console.error('Error loading pulses:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadVibing() {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vibes')
        .select(`
          following_id,
          users:following_id (id, username, avatar_symbol, avatar_gradient)
        `)
        .eq('follower_id', user.id);

      if (error) throw error;
      setVibing(data || []);
    } catch (error) {
      console.error('Error loading vibing:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadVibers() {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vibes')
        .select(`
          follower_id,
          users:follower_id (id, username, avatar_symbol, avatar_gradient)
        `)
        .eq('following_id', user.id);

      if (error) throw error;
      setVibers(data || []);
    } catch (error) {
      console.error('Error loading vibers:', error);
    } finally {
      setLoading(false);
    }
  }

  if (selectedDropId) {
    return (
      <FullPostView
        dropId={selectedDropId}
        onClose={() => setSelectedDropId(null)}
        onRefresh={() => loadDrops()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 md:pb-0">
      <div className="bg-gradient-to-r from-red-500 to-pink-500 h-32 md:h-48 relative">
        <div className="absolute -bottom-12 left-4 md:left-8">
          <div className={`w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br ${profile?.avatar_gradient} rounded-full flex items-center justify-center text-5xl md:text-6xl shadow-lg border-4 border-white dark:border-gray-900`}>
            {profile?.avatar_symbol}
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 mt-16 md:mt-20 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{profile?.username}</h1>
        <p className="text-gray-600 dark:text-gray-400">Anonymous Viber</p>
      </div>

      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-10">
        <div className="flex items-center gap-1 max-w-4xl mx-auto px-4">
          {(['drops', 'pulses', 'vibing', 'vibers'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-3 font-medium capitalize border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-red-500 text-red-500'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          </div>
        ) : activeTab === 'drops' ? (
          <div className="p-4 space-y-4">
            {drops.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No drops yet</p>
            ) : (
              drops.map((drop) => (
                <button
                  key={drop.id}
                  onClick={() => setSelectedDropId(drop.id)}
                  className="w-full p-4 bg-white dark:bg-gray-800 rounded-xl hover:shadow-lg transition-all text-left border border-gray-200 dark:border-gray-700"
                >
                  {drop.content && <p className="text-gray-900 dark:text-white mb-2">{drop.content}</p>}
                  {drop.image_url && (
                    <img
                      src={drop.image_url}
                      alt="Drop"
                      className="w-full h-48 object-cover rounded-lg mb-2"
                    />
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>{formatDistanceToNow(drop.created_at)}</span>
                    {drop.mood && <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded text-xs">{drop.mood}</span>}
                  </div>
                </button>
              ))
            )}
          </div>
        ) : activeTab === 'pulses' ? (
          <div className="p-4 space-y-4">
            {pulses.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No pulses yet</p>
            ) : (
              pulses.map((pulse) => (
                <div
                  key={pulse.id}
                  className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{pulse.question}</h3>
                  <div className="space-y-2 mb-2">
                    {pulse.options.map((option, idx) => (
                      <div key={idx} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300">
                        {option.text}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatDistanceToNow(pulse.created_at)}</p>
                </div>
              ))
            )}
          </div>
        ) : activeTab === 'vibing' ? (
          <div className="p-4 space-y-3">
            {vibing.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">Not vibing with anyone yet</p>
            ) : (
              vibing.map((item) => (
                <div key={item.following_id} className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className={`w-12 h-12 bg-gradient-to-br ${item.users?.[0]?.avatar_gradient} rounded-full flex items-center justify-center text-xl flex-shrink-0`}>
                    {item.users?.[0]?.avatar_symbol}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{item.users?.[0]?.username}</p>
                  </div>
                  <Users className="w-5 h-5 text-gray-400" />
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {vibers.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No vibers yet</p>
            ) : (
              vibers.map((item) => (
                <div key={item.follower_id} className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className={`w-12 h-12 bg-gradient-to-br ${item.users?.[0]?.avatar_gradient} rounded-full flex items-center justify-center text-xl flex-shrink-0`}>
                    {item.users?.[0]?.avatar_symbol}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{item.users?.[0]?.username}</p>
                  </div>
                  <Users className="w-5 h-5 text-red-500" />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
