import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DropCard } from '../components/drops/DropCard';
import { PulseCard } from '../components/drops/PulseCard';
import { FullPostView } from '../components/drops/FullPostView';
import { Loader2 } from 'lucide-react';

interface Drop {
  id: string;
  user_id: string;
  content: string | null;
  image_url: string | null;
  mood: string | null;
  category: string;
  is_ghost: boolean;
  seen_count: number;
  created_at: string;
  users: {
    username: string;
    avatar_symbol: string;
    avatar_gradient: string;
  };
  feels_count?: number;
  echoes_count?: number;
  user_has_felt?: boolean;
}

interface Pulse {
  id: string;
  user_id: string;
  question: string;
  options: Array<{ text: string }>;
  mood: string | null;
  seen_count: number;
  created_at: string;
  users: {
    username: string;
    avatar_symbol: string;
    avatar_gradient: string;
  };
}

type FeedItem = (Drop & { type: 'drop' }) | (Pulse & { type: 'pulse' });

export function StreamPage() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDropId, setSelectedDropId] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string>('All');

  const MOODS = ['All', 'Happy', 'Excited', 'Chill', 'Thoughtful', 'Creative', 'Energetic', 'Peaceful', 'Mysterious'];

  useEffect(() => {
    loadFeed();

    const dropsChannel = supabase
      .channel('drops_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drops' }, () => {
        loadFeed();
      })
      .subscribe();

    const pulsesChannel = supabase
      .channel('pulses_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pulses' }, () => {
        loadFeed();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(dropsChannel);
      supabase.removeChannel(pulsesChannel);
    };
  }, []);

  async function loadFeed() {
    try {
      const now = new Date().toISOString();

      const { data: dropsData, error: dropsError } = await supabase
        .from('drops')
        .select(`
          *,
          users (username, avatar_symbol, avatar_gradient)
        `)
        .eq('category', 'stream')
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (dropsError) throw dropsError;

      const { data: pulsesData, error: pulsesError } = await supabase
        .from('pulses')
        .select(`
          *,
          users (username, avatar_symbol, avatar_gradient)
        `)
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (pulsesError) throw pulsesError;

      const { data: { user } } = await supabase.auth.getUser();

      const dropsWithCounts = await Promise.all(
        (dropsData || []).map(async (drop) => {
          const [feelsResult, echoesResult, userFeelResult] = await Promise.all([
            supabase.from('feels').select('id', { count: 'exact', head: true }).eq('drop_id', drop.id),
            supabase.from('echoes').select('id', { count: 'exact', head: true }).eq('drop_id', drop.id),
            user
              ? supabase.from('feels').select('id').eq('drop_id', drop.id).eq('user_id', user.id).maybeSingle()
              : { data: null },
          ]);

          return {
            ...drop,
            type: 'drop' as const,
            feels_count: feelsResult.count || 0,
            echoes_count: echoesResult.count || 0,
            user_has_felt: !!userFeelResult.data,
          };
        })
      );

      const pulsesTyped = (pulsesData || []).map(pulse => ({
        ...pulse,
        type: 'pulse' as const,
      }));

      const allItems = [...dropsWithCounts, ...pulsesTyped];
      allItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const filtered = selectedMood === 'All'
        ? allItems
        : allItems.filter(item => item.mood === selectedMood);

      setFeed(filtered);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Stream</h1>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {MOODS.map((mood) => (
              <button
                key={mood}
                onClick={() => setSelectedMood(mood)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  selectedMood === mood
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {feed.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No posts yet. Be the first to create one!
          </div>
        ) : (
          feed.map((item) => (
            <div key={item.id}>
              {item.type === 'drop' ? (
                <DropCard
                  drop={item}
                  onRefresh={loadFeed}
                  onOpenFull={() => setSelectedDropId(item.id)}
                />
              ) : (
                <PulseCard
                  pulse={item}
                  onRefresh={loadFeed}
                />
              )}
            </div>
          ))
        )}
      </div>

      {selectedDropId && (
        <FullPostView
          dropId={selectedDropId}
          onClose={() => setSelectedDropId(null)}
          onRefresh={loadFeed}
        />
      )}
    </div>
  );
}
