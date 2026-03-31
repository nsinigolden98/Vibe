import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { DropCard } from '../components/drops/DropCard';
import { PulseCard } from '../components/drops/PulseCard';
import { FullPostView } from '../components/drops/FullPostView';
import { FeedSkeleton, ShimmerCard } from '../components/ui/SkeletonLoader';
import { useFeedAlgorithm } from '../hooks/useFeedAlgorithm';
import { soundManager } from '../lib/soundManager';
import { Filter, Sparkles, Flame, MessageSquare, Layers } from 'lucide-react';

interface Drop {
  id: string;
  user_id: string;
  content: string | null;
  image_url: string | null;
  video_url?: string | null;
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
type FeedType = 'all' | 'stream' | 'pulse' | 'spaces';

export function StreamPage() {
  const { user } = useAuth();
  const { sortFeed, filterByFeedType, filterByMood, filterExpired } = useFeedAlgorithm();
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDropId, setSelectedDropId] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string>('All');
  const [feedType, setFeedType] = useState<FeedType>('all');
  const [isSorting, setIsSorting] = useState(false);

  const MOODS = ['All', 'Happy', 'Excited', 'Chill', 'Thoughtful', 'Creative', 'Energetic', 'Peaceful', 'Mysterious'];

  const feedTypeOptions: { id: FeedType; label: string; icon: typeof Filter }[] = [
    { id: 'all', label: 'All', icon: Layers },
    { id: 'stream', label: 'Stream', icon: Flame },
    { id: 'pulse', label: 'Pulse', icon: Sparkles },
    { id: 'spaces', label: 'Spaces', icon: MessageSquare },
  ];

  useEffect(() => {
    loadFeed();

    const dropsChannel = supabase
      .channel('drops_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drops' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          handleNewDrop(payload.new as Drop);
        } else {
          loadFeed();
        }
      })
      .subscribe();

    const pulsesChannel = supabase
      .channel('pulses_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pulses' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          handleNewPulse(payload.new as Pulse);
        } else {
          loadFeed();
        }
      })
      .subscribe();

    const feelsChannel = supabase
      .channel('feels_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feels' }, () => {
        loadFeed();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(dropsChannel);
      supabase.removeChannel(pulsesChannel);
      supabase.removeChannel(feelsChannel);
    };
  }, []);

  const handleNewDrop = async (newDrop: Drop) => {
    if (!user) return;
    
    const { data: userData } = await supabase
      .from('users')
      .select('username, avatar_symbol, avatar_gradient')
      .eq('id', newDrop.user_id)
      .single();

    const dropWithUser: FeedItem = {
      ...newDrop,
      type: 'drop',
      users: userData || { username: 'Unknown', avatar_symbol: '🌀', avatar_gradient: 'from-gray-400 to-gray-500' },
      feels_count: 0,
      echoes_count: 0,
      user_has_felt: false,
    };

    setFeed(prev => [dropWithUser, ...prev]);
  };

  const handleNewPulse = async (newPulse: Pulse) => {
    if (!user) return;
    
    const { data: userData } = await supabase
      .from('users')
      .select('username, avatar_symbol, avatar_gradient')
      .eq('id', newPulse.user_id)
      .single();

    const pulseWithUser: FeedItem = {
      ...newPulse,
      type: 'pulse',
      users: userData || { username: 'Unknown', avatar_symbol: '🌀', avatar_gradient: 'from-gray-400 to-gray-500' },
    };

    setFeed(prev => [pulseWithUser, ...prev]);
  };

  async function loadFeed() {
    try {
      setLoading(true);
      const now = new Date().toISOString();

      const [dropsResult, pulsesResult] = await Promise.all([
        supabase
          .from('drops')
          .select(`
            *,
            users (username, avatar_symbol, avatar_gradient)
          `)
          .or(`expires_at.is.null,expires_at.gt.${now}`)
          .order('created_at', { ascending: false })
          .limit(50),
        
        supabase
          .from('pulses')
          .select(`
            *,
            users (username, avatar_symbol, avatar_gradient)
          `)
          .or(`expires_at.is.null,expires_at.gt.${now}`)
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      if (dropsResult.error) throw dropsResult.error;
      if (pulsesResult.error) throw pulsesResult.error;

      const { data: { user: currentUser } } = await supabase.auth.getUser();

      const dropsWithCounts = await Promise.all(
        (dropsResult.data || []).map(async (drop) => {
          const [feelsResult, echoesResult, userFeelResult] = await Promise.all([
            supabase.from('feels').select('id', { count: 'exact', head: true }).eq('drop_id', drop.id),
            supabase.from('echoes').select('id', { count: 'exact', head: true }).eq('drop_id', drop.id),
            currentUser
              ? supabase.from('feels').select('id').eq('drop_id', drop.id).eq('user_id', currentUser.id).maybeSingle()
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

      const pulsesTyped = (pulsesResult.data || []).map(pulse => ({
        ...pulse,
        type: 'pulse' as const,
      }));

      const allItems = [...dropsWithCounts, ...pulsesTyped];
      allItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setFeed(allItems);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  }

  const processedFeed = useMemo(() => {
    let filtered = [...feed];

    filtered = filterExpired(filtered);
    filtered = filterByFeedType(filtered, feedType);
    filtered = filterByMood(filtered, selectedMood === 'All' ? null : selectedMood);

    return filtered;
  }, [feed, feedType, selectedMood, filterExpired, filterByFeedType, filterByMood]);

  const handleSortByAlgorithm = async () => {
    if (isSorting) return;
    setIsSorting(true);
    soundManager.playClick();
    
    const sorted = await sortFeed(feed);
    setFeed(sorted);
    setIsSorting(false);
  };

  const handleMoodChange = (mood: string) => {
    setSelectedMood(mood);
    soundManager.playClick();
  };

  const handleFeedTypeChange = (type: FeedType) => {
    setFeedType(type);
    soundManager.playClick();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
          <div className="px-4 py-4">
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
            <div className="flex gap-2 overflow-x-auto pb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse flex-shrink-0" />
              ))}
            </div>
          </div>
        </div>
        <FeedSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stream</h1>
            <button
              onClick={handleSortByAlgorithm}
              disabled={isSorting}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isSorting ? 'Sorting...' : 'Smart Sort'}
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-3">
            {feedTypeOptions.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleFeedTypeChange(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  feedType === id
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {MOODS.map((mood) => (
              <button
                key={mood}
                onClick={() => handleMoodChange(mood)}
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
        {processedFeed.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12">
            <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No posts found</p>
            <p className="text-sm mt-1">Try adjusting your filters or be the first to post!</p>
          </div>
        ) : (
          processedFeed.map((item) => (
            <div key={`${item.type}-${item.id}`}>
              {item.type === 'drop' ? (
                <DropCard
                  drop={item}
                  onRefresh={loadFeed}
                  onOpenFull={() => {
                    soundManager.playClick();
                    setSelectedDropId(item.id);
                  }}
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
