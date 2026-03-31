import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export type InteractionType = 'view' | 'like' | 'click' | 'share' | 'comment' | 'vote';

export function useUserTracking() {
  const { user } = useAuth();

  const trackInteraction = useCallback(async (
    postId: string,
    type: InteractionType,
    metadata?: Record<string, any>
  ) => {
    if (!user) return;

    try {
      await supabase.from('user_interactions').insert({
        user_id: user.id,
        post_id: postId,
        type,
        metadata: metadata || {},
      });

      await updateUserPreferences(postId, type);
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  }, [user]);

  const updateUserPreferences = useCallback(async (
    postId: string,
    type: InteractionType
  ) => {
    if (!user) return;

    try {
      const { data: post } = await supabase
        .from('drops')
        .select('mood, category')
        .eq('id', postId)
        .maybeSingle();

      if (!post) return;

      const { data: existingPrefs } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const likedTopics = existingPrefs?.liked_topics || {};
      const interactionScore = existingPrefs?.interaction_score || {};

      if (post.mood) {
        likedTopics[post.mood] = (likedTopics[post.mood] || 0) + (type === 'like' ? 2 : 1);
      }

      interactionScore[type] = (interactionScore[type] || 0) + 1;

      if (existingPrefs) {
        await supabase
          .from('user_preferences')
          .update({
            liked_topics: likedTopics,
            interaction_score: interactionScore,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
      } else {
        await supabase.from('user_preferences').insert({
          user_id: user.id,
          liked_topics: likedTopics,
          interaction_score: interactionScore,
        });
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  }, [user]);

  const trackView = useCallback((postId: string) => {
    return trackInteraction(postId, 'view');
  }, [trackInteraction]);

  const trackLike = useCallback((postId: string) => {
    return trackInteraction(postId, 'like');
  }, [trackInteraction]);

  const trackShare = useCallback((postId: string) => {
    return trackInteraction(postId, 'share');
  }, [trackInteraction]);

  const trackComment = useCallback((postId: string) => {
    return trackInteraction(postId, 'comment');
  }, [trackInteraction]);

  const trackVote = useCallback((postId: string) => {
    return trackInteraction(postId, 'vote');
  }, [trackInteraction]);

  return {
    trackInteraction,
    trackView,
    trackLike,
    trackShare,
    trackComment,
    trackVote,
  };
}
