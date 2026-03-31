import { useState, useEffect, useCallback } from 'react';
import { Search, Hash, User, Sparkles, TrendingUp, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from '../lib/utils';
import { soundManager } from '../lib/soundManager';
import { FeedSkeleton } from '../components/ui/SkeletonLoader';

interface SearchResult {
  id: string;
  type: 'drop' | 'pulse' | 'user';
  content?: string;
  question?: string;
  username?: string;
  avatar_symbol?: string;
  avatar_gradient?: string;
  mood?: string;
  created_at: string;
  feels_count?: number;
  echoes_count?: number;
}

interface TrendingTopic {
  tag: string;
  count: number;
}

export function DiscoverPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<'all' | 'users' | 'posts'>('all');

  const MOODS = ['Happy', 'Excited', 'Chill', 'Thoughtful', 'Creative', 'Energetic', 'Peaceful', 'Mysterious'];

  useEffect(() => {
    loadTrendingTopics();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim() || selectedMood) {
        performSearch();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, selectedMood, searchType]);

  const loadTrendingTopics = async () => {
    try {
      const { data: drops } = await supabase
        .from('drops')
        .select('content')
        .not('content', 'is', null)
        .order('created_at', { ascending: false })
        .limit(100);

      const hashtagCounts: Record<string, number> = {};

      drops?.forEach(drop => {
        const hashtags = drop.content?.match(/#\w+/g) || [];
        hashtags.forEach(tag => {
          hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
        });
      });

      const sorted = Object.entries(hashtagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setTrendingTopics(sorted);
    } catch (error) {
      console.error('Error loading trending topics:', error);
    }
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      const searchResults: SearchResult[] = [];
      const searchQuery = query.trim().toLowerCase();

      if (searchType === 'all' || searchType === 'users') {
        const { data: users } = await supabase
          .from('users')
          .select('id, username, avatar_symbol, avatar_gradient, created_at')
          .ilike('username', `%${searchQuery}%`)
          .limit(10);

        users?.forEach(u => {
          searchResults.push({
            id: u.id,
            type: 'user',
            username: u.username,
            avatar_symbol: u.avatar_symbol,
            avatar_gradient: u.avatar_gradient,
            created_at: u.created_at,
          });
        });
      }

      if (searchType === 'all' || searchType === 'posts') {
        let dropsQuery = supabase
          .from('drops')
          .select(`
            *,
            users (username, avatar_symbol, avatar_gradient),
            feels_count:feels(count),
            echoes_count:echoes(count)
          `)
          .order('created_at', { ascending: false })
          .limit(20);

        if (searchQuery) {
          dropsQuery = dropsQuery.or(`content.ilike.%${searchQuery}%,mood.ilike.%${searchQuery}%`);
        }

        if (selectedMood) {
          dropsQuery = dropsQuery.eq('mood', selectedMood);
        }

        const { data: drops } = await dropsQuery;

        drops?.forEach(drop => {
          searchResults.push({
            id: drop.id,
            type: 'drop',
            content: drop.content,
            mood: drop.mood,
            created_at: drop.created_at,
            username: drop.users?.username,
            avatar_symbol: drop.users?.avatar_symbol,
            avatar_gradient: drop.users?.avatar_gradient,
            feels_count: (drop as any).feels_count?.[0]?.count || 0,
            echoes_count: (drop as any).echoes_count?.[0]?.count || 0,
          });
        });

        const { data: pulses } = await supabase
          .from('pulses')
          .select(`
            *,
            users (username, avatar_symbol, avatar_gradient)
          `)
          .ilike('question', `%${searchQuery}%`)
          .order('created_at', { ascending: false })
          .limit(10);

        pulses?.forEach(pulse => {
          searchResults.push({
            id: pulse.id,
            type: 'pulse',
            question: pulse.question,
            mood: pulse.mood,
            created_at: pulse.created_at,
            username: pulse.users?.username,
            avatar_symbol: pulse.users?.avatar_symbol,
            avatar_gradient: pulse.users?.avatar_gradient,
          });
        });
      }

      searchResults.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setResults(searchResults);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    soundManager.playClick();
  };

  const handleMoodClick = (mood: string) => {
    setSelectedMood(selectedMood === mood ? null : mood);
    soundManager.playClick();
  };

  const clearSearch = () => {
    setQuery('');
    setSelectedMood(null);
    setResults([]);
    soundManager.playClick();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Discover</h1>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users, posts, moods..."
              className="w-full pl-10 pr-10 py-3 bg-gray-100 dark:bg-gray-800 border-none rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500"
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          <div className="flex gap-2 mb-4">
            {(['all', 'users', 'posts'] as const).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setSearchType(type);
                  soundManager.playClick();
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${
                  searchType === type
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {MOODS.map((mood) => (
              <button
                key={mood}
                onClick={() => handleMoodClick(mood)}
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

      <div className="p-4">
        {!query && !selectedMood && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Trending Topics</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingTopics.map(({ tag, count }) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:border-red-500 dark:hover:border-red-500 transition-colors"
                >
                  <Hash className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{tag.slice(1)}</span>
                  <span className="text-xs text-gray-400">{count}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <FeedSkeleton count={3} />
        ) : results.length > 0 ? (
          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={`${result.type}-${result.id}`}
                className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow"
              >
                {result.type === 'user' && (
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${result.avatar_gradient} rounded-full flex items-center justify-center text-xl`}>
                      {result.avatar_symbol}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">@{result.username}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Joined {formatDistanceToNow(result.created_at)}
                      </p>
                    </div>
                    <User className="w-5 h-5 text-gray-400 ml-auto" />
                  </div>
                )}

                {result.type === 'drop' && (
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${result.avatar_gradient} rounded-full flex items-center justify-center text-lg flex-shrink-0`}>
                      {result.avatar_symbol}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 dark:text-white">{result.username}</span>
                        {result.mood && (
                          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-full">
                            {result.mood}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">{result.content}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>{formatDistanceToNow(result.created_at)}</span>
                        <span>{result.feels_count} likes</span>
                        <span>{result.echoes_count} comments</span>
                      </div>
                    </div>
                  </div>
                )}

                {result.type === 'pulse' && (
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${result.avatar_gradient} rounded-full flex items-center justify-center text-lg flex-shrink-0`}>
                      {result.avatar_symbol}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 dark:text-white">{result.username}</span>
                        <Sparkles className="w-4 h-4 text-purple-500" />
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">{result.question}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDistanceToNow(result.created_at)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (query || selectedMood) ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No results found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try different keywords or moods</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
