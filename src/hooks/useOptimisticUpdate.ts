import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { soundManager } from '../lib/soundManager';

interface OptimisticState<T> {
  data: T;
  isPending: boolean;
  error: Error | null;
}

export function useOptimisticLike() {
  const { user } = useAuth();

  const toggleLike = useCallback(async (
    dropId: string,
    currentState: { hasLiked: boolean; count: number },
    onOptimisticUpdate: (newState: { hasLiked: boolean; count: number }) => void,
    onRevert: () => void
  ) => {
    if (!user) return;

    const newState = {
      hasLiked: !currentState.hasLiked,
      count: currentState.hasLiked ? currentState.count - 1 : currentState.count + 1,
    };

    onOptimisticUpdate(newState);
    soundManager.playLike();

    try {
      if (currentState.hasLiked) {
        await supabase
          .from('feels')
          .delete()
          .eq('drop_id', dropId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('feels')
          .insert({ drop_id: dropId, user_id: user.id });
      }
    } catch (error) {
      onRevert();
      console.error('Error toggling like:', error);
    }
  }, [user]);

  return { toggleLike };
}

export function useOptimisticVote() {
  const { user } = useAuth();

  const toggleVote = useCallback(async (
    pulseId: string,
    optionIndex: number,
    currentVotes: Record<number, number>,
    userVote: number | null,
    onOptimisticUpdate: (newVotes: Record<number, number>, newUserVote: number | null) => void,
    onRevert: () => void
  ) => {
    if (!user) return;

    const newVotes = { ...currentVotes };
    let newUserVote: number | null = optionIndex;

    if (userVote === optionIndex) {
      newVotes[optionIndex] = (newVotes[optionIndex] || 0) - 1;
      newUserVote = null;
    } else {
      if (userVote !== null) {
        newVotes[userVote] = (newVotes[userVote] || 0) - 1;
      }
      newVotes[optionIndex] = (newVotes[optionIndex] || 0) + 1;
    }

    onOptimisticUpdate(newVotes, newUserVote);
    soundManager.playVote();

    try {
      if (userVote === optionIndex) {
        await supabase
          .from('pulse_votes')
          .delete()
          .eq('pulse_id', pulseId)
          .eq('user_id', user.id);
      } else {
        if (userVote !== null) {
          await supabase
            .from('pulse_votes')
            .delete()
            .eq('pulse_id', pulseId)
            .eq('user_id', user.id);
        }
        await supabase
          .from('pulse_votes')
          .insert({
            pulse_id: pulseId,
            user_id: user.id,
            option_index: optionIndex,
          });
      }
    } catch (error) {
      onRevert();
      console.error('Error toggling vote:', error);
    }
  }, [user]);

  return { toggleVote };
}

export function useOptimisticComment() {
  const { user } = useAuth();

  const addComment = useCallback(async (
    dropId: string,
    content: string,
    tempComment: any,
    onOptimisticAdd: (comment: any) => void,
    onConfirm: (tempId: string, realComment: any) => void,
    onRevert: (tempId: string) => void
  ) => {
    if (!user) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticComment = {
      ...tempComment,
      id: tempId,
      content,
      created_at: new Date().toISOString(),
    };

    onOptimisticAdd(optimisticComment);
    soundManager.playComment();

    try {
      const { data, error } = await supabase
        .from('echoes')
        .insert({
          drop_id: dropId,
          user_id: user.id,
          content: content.trim(),
        })
        .select(`
          *,
          users (username, avatar_symbol, avatar_gradient)
        `)
        .single();

      if (error) throw error;

      onConfirm(tempId, data);
    } catch (error) {
      onRevert(tempId);
      console.error('Error adding comment:', error);
    }
  }, [user]);

  return { addComment };
}

export function useOptimisticFollow() {
  const { user } = useAuth();

  const toggleFollow = useCallback(async (
    targetUserId: string,
    currentState: boolean,
    onOptimisticUpdate: (newState: boolean) => void,
    onRevert: () => void
  ) => {
    if (!user || user.id === targetUserId) return;

    onOptimisticUpdate(!currentState);
    soundManager.playClick();

    try {
      if (currentState) {
        await supabase
          .from('vibes')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);
      } else {
        await supabase
          .from('vibes')
          .insert({
            follower_id: user.id,
            following_id: targetUserId,
          });
      }
    } catch (error) {
      onRevert();
      console.error('Error toggling follow:', error);
    }
  }, [user]);

  return { toggleFollow };
}
