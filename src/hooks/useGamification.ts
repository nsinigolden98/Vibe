import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface UserGamification {
  xp: number;
  level: number;
  streak: number;
  lastActive: string | null;
  badges: string[];
}

const XP_REWARDS = {
  post: 10,
  like: 2,
  comment: 5,
  vote: 3,
  share: 5,
  dailyLogin: 5,
};

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000];

const BADGES = [
  { id: 'first_post', name: 'First Drop', description: 'Created your first drop', condition: (xp: number, stats: any) => stats.posts >= 1 },
  { id: 'social_butterfly', name: 'Social Butterfly', description: 'Liked 10 posts', condition: (xp: number, stats: any) => stats.likes >= 10 },
  { id: 'commenter', name: 'Commenter', description: 'Left 5 comments', condition: (xp: number, stats: any) => stats.comments >= 5 },
  { id: 'voter', name: 'Democracy', description: 'Voted on 5 polls', condition: (xp: number, stats: any) => stats.votes >= 5 },
  { id: 'week_warrior', name: 'Week Warrior', description: '7 day streak', condition: (xp: number, stats: any) => stats.streak >= 7 },
  { id: 'month_master', name: 'Month Master', description: '30 day streak', condition: (xp: number, stats: any) => stats.streak >= 30 },
  { id: 'rising_star', name: 'Rising Star', description: 'Reached level 5', condition: (xp: number, stats: any) => stats.level >= 5 },
  { id: 'vibe_legend', name: 'VIBE Legend', description: 'Reached level 10', condition: (xp: number, stats: any) => stats.level >= 10 },
];

export function useGamification() {
  const { user, profile } = useAuth();
  const [gamification, setGamification] = useState<UserGamification>({
    xp: 0,
    level: 1,
    streak: 0,
    lastActive: null,
    badges: [],
  });

  useEffect(() => {
    if (user) {
      loadGamificationData();
    }
  }, [user]);

  const loadGamificationData = async () => {
    if (!user) return;

    try {
      const { data: userProfile } = await supabase
        .from('users')
        .select('xp, level, streak, last_active')
        .eq('id', user.id)
        .maybeSingle();

      const { data: userBadges } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', user.id);

      setGamification({
        xp: userProfile?.xp || 0,
        level: userProfile?.level || 1,
        streak: userProfile?.streak || 0,
        lastActive: userProfile?.last_active,
        badges: userBadges?.map(ub => ub.badge_id) || [],
      });
    } catch (error) {
      console.error('Error loading gamification data:', error);
    }
  };

  const calculateLevel = (xp: number): number => {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xp >= LEVEL_THRESHOLDS[i]) {
        return i + 1;
      }
    }
    return 1;
  };

  const addXP = useCallback(async (action: keyof typeof XP_REWARDS) => {
    if (!user) return;

    const xpToAdd = XP_REWARDS[action];

    try {
      const { data: currentProfile } = await supabase
        .from('users')
        .select('xp, level')
        .eq('id', user.id)
        .single();

      const newXP = (currentProfile?.xp || 0) + xpToAdd;
      const newLevel = calculateLevel(newXP);

      await supabase
        .from('users')
        .update({
          xp: newXP,
          level: newLevel,
        })
        .eq('id', user.id);

      setGamification(prev => ({
        ...prev,
        xp: newXP,
        level: newLevel,
      }));

      if (newLevel > (currentProfile?.level || 1)) {
        return { leveledUp: true, newLevel };
      }

      return { leveledUp: false, newLevel };
    } catch (error) {
      console.error('Error adding XP:', error);
      return { leveledUp: false, newLevel: gamification.level };
    }
  }, [user, gamification.level]);

  const updateStreak = useCallback(async () => {
    if (!user) return;

    try {
      const { data: currentProfile } = await supabase
        .from('users')
        .select('streak, last_active')
        .eq('id', user.id)
        .single();

      const lastActive = currentProfile?.last_active ? new Date(currentProfile.last_active) : null;
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const lastActiveDay = lastActive ? new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate()) : null;

      let newStreak = currentProfile?.streak || 0;

      if (!lastActiveDay || lastActiveDay < today) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastActiveDay && lastActiveDay.getTime() === yesterday.getTime()) {
          newStreak += 1;
        } else if (!lastActiveDay || lastActiveDay < yesterday) {
          newStreak = 1;
        }

        await supabase
          .from('users')
          .update({
            streak: newStreak,
            last_active: now.toISOString(),
          })
          .eq('id', user.id);

        setGamification(prev => ({
          ...prev,
          streak: newStreak,
          lastActive: now.toISOString(),
        }));
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  }, [user]);

  const checkAndAwardBadges = useCallback(async () => {
    if (!user) return;

    try {
      const { data: stats } = await supabase
        .from('users')
        .select(`
          xp,
          level,
          streak,
          drops_count:drops(count),
          likes_count:feels(count),
          comments_count:echoes(count),
          votes_count:pulse_votes(count)
        `)
        .eq('id', user.id)
        .single();

      const userStats = {
        xp: stats?.xp || 0,
        level: stats?.level || 1,
        streak: stats?.streak || 0,
        posts: (stats as any)?.drops_count?.[0]?.count || 0,
        likes: (stats as any)?.likes_count?.[0]?.count || 0,
        comments: (stats as any)?.comments_count?.[0]?.count || 0,
        votes: (stats as any)?.votes_count?.[0]?.count || 0,
      };

      const { data: existingBadges } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', user.id);

      const ownedBadges = new Set(existingBadges?.map(b => b.badge_id) || []);

      for (const badge of BADGES) {
        if (!ownedBadges.has(badge.id) && badge.condition(userStats.xp, userStats)) {
          await supabase.from('user_badges').insert({
            user_id: user.id,
            badge_id: badge.id,
          });

          setGamification(prev => ({
            ...prev,
            badges: [...prev.badges, badge.id],
          }));
        }
      }
    } catch (error) {
      console.error('Error checking badges:', error);
    }
  }, [user]);

  const getXPToNextLevel = (): number => {
    const nextLevel = gamification.level;
    if (nextLevel >= LEVEL_THRESHOLDS.length) return 0;
    return LEVEL_THRESHOLDS[nextLevel] - gamification.xp;
  };

  const getProgressPercentage = (): number => {
    const currentLevelXP = LEVEL_THRESHOLDS[gamification.level - 1] || 0;
    const nextLevelXP = LEVEL_THRESHOLDS[gamification.level] || currentLevelXP + 1000;
    const xpInLevel = gamification.xp - currentLevelXP;
    const xpNeeded = nextLevelXP - currentLevelXP;
    return Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));
  };

  return {
    ...gamification,
    addXP,
    updateStreak,
    checkAndAwardBadges,
    getXPToNextLevel,
    getProgressPercentage,
    refresh: loadGamificationData,
  };
}
