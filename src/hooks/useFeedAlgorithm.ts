import { useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface FeedItem {
  id: string;
  type: 'drop' | 'pulse';
  created_at: string;
  feels_count?: number;
  echoes_count?: number;
  seen_count?: number;
  mood?: string | null;
  user_id: string;
  [key: string]: any;
}

interface ScoreWeights {
  engagement: number;
  recency: number;
  preference: number;
  trending: number;
}

const DEFAULT_WEIGHTS: ScoreWeights = {
  engagement: 0.35,
  recency: 0.30,
  preference: 0.20,
  trending: 0.15,
};

export function useFeedAlgorithm() {
  const { user } = useAuth();

  const calculateEngagementScore = useCallback((item: FeedItem): number => {
    const likes = item.feels_count || 0;
    const comments = item.echoes_count || 0;
    const views = item.seen_count || 0;
    
    const likeWeight = 2;
    const commentWeight = 3;
    const viewWeight = 0.1;
    
    const score = (likes * likeWeight) + (comments * commentWeight) + (views * viewWeight);
    return Math.min(score / 100, 1);
  }, []);

  const calculateRecencyScore = useCallback((item: FeedItem): number => {
    const now = Date.now();
    const created = new Date(item.created_at).getTime();
    const hoursSinceCreation = (now - created) / (1000 * 60 * 60);
    
    const decayFactor = 0.95;
    const score = Math.pow(decayFactor, hoursSinceCreation);
    
    return Math.max(score, 0.1);
  }, []);

  const calculatePreferenceScore = useCallback(async (item: FeedItem): Promise<number> => {
    if (!user) return 0.5;

    try {
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('liked_topics')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!preferences?.liked_topics || !item.mood) return 0.5;

      const likedTopics = preferences.liked_topics as Record<string, number>;
      const moodScore = likedTopics[item.mood] || 0;
      const maxScore = Math.max(...Object.values(likedTopics), 1);
      
      return Math.min(moodScore / maxScore, 1);
    } catch {
      return 0.5;
    }
  }, [user]);

  const calculateTrendingScore = useCallback((items: FeedItem[], targetItem: FeedItem): number => {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    const recentItems = items.filter(item => {
      const created = new Date(item.created_at).getTime();
      return (now - created) < oneHour;
    });

    if (recentItems.length === 0) return 0.5;

    const avgEngagement = recentItems.reduce((sum, item) => {
      return sum + (item.feels_count || 0) + (item.echoes_count || 0);
    }, 0) / recentItems.length;

    const targetEngagement = (targetItem.feels_count || 0) + (targetItem.echoes_count || 0);
    
    if (avgEngagement === 0) return 0.5;
    
    const ratio = targetEngagement / avgEngagement;
    return Math.min(ratio, 1);
  }, []);

  const calculateItemScore = useCallback(async (
    item: FeedItem,
    allItems: FeedItem[],
    weights: ScoreWeights = DEFAULT_WEIGHTS
  ): Promise<number> => {
    const [engagementScore, recencyScore, preferenceScore, trendingScore] = await Promise.all([
      Promise.resolve(calculateEngagementScore(item)),
      Promise.resolve(calculateRecencyScore(item)),
      calculatePreferenceScore(item),
      Promise.resolve(calculateTrendingScore(allItems, item)),
    ]);

    return (
      engagementScore * weights.engagement +
      recencyScore * weights.recency +
      preferenceScore * weights.preference +
      trendingScore * weights.trending
    );
  }, [calculateEngagementScore, calculateRecencyScore, calculatePreferenceScore, calculateTrendingScore]);

  const sortFeed = useCallback(async (
    items: FeedItem[],
    weights?: ScoreWeights
  ): Promise<FeedItem[]> => {
    const scoredItems = await Promise.all(
      items.map(async (item) => ({
        item,
        score: await calculateItemScore(item, items, weights),
      }))
    );

    scoredItems.sort((a, b) => b.score - a.score);

    return scoredItems.map(si => si.item);
  }, [calculateItemScore]);

  const filterByFeedType = useCallback((
    items: FeedItem[],
    feedType: 'all' | 'stream' | 'pulse' | 'spaces'
  ): FeedItem[] => {
    switch (feedType) {
      case 'stream':
        return items.filter(item => item.type === 'drop' && item.category === 'stream');
      case 'pulse':
        return items.filter(item => item.type === 'pulse');
      case 'spaces':
        return items.filter(item => item.type === 'drop' && item.category === 'spaces');
      case 'all':
      default:
        return items;
    }
  }, []);

  const filterByMood = useCallback((
    items: FeedItem[],
    mood: string | null
  ): FeedItem[] => {
    if (!mood || mood === 'All') return items;
    return items.filter(item => item.mood === mood);
  }, []);

  const filterExpired = useCallback((items: FeedItem[]): FeedItem[] => {
    const now = new Date().toISOString();
    return items.filter(item => {
      if (!item.expires_at) return true;
      return item.expires_at > now;
    });
  }, []);

  return useMemo(() => ({
    sortFeed,
    filterByFeedType,
    filterByMood,
    filterExpired,
    calculateItemScore,
    DEFAULT_WEIGHTS,
  }), [sortFeed, filterByFeedType, filterByMood, filterExpired, calculateItemScore]);
}
