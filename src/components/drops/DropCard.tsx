import { useState, useEffect, useCallback } from 'react';
import { Heart, MessageCircle, Eye, Clock, UserPlus, UserCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from '../../lib/utils';
import { soundManager } from '../../lib/soundManager';
import { ShareMenu } from './ShareMenu';
import { useOptimisticLike } from '../../hooks/useOptimisticUpdate';
import { useGamification } from '../../hooks/useGamification';
import { useUserTracking } from '../../hooks/useUserTracking';

interface DropCardProps {
  drop: {
    id: string;
    user_id: string;
    content: string | null;
    image_url: string | null;
    video_url?: string | null;
    mood: string | null;
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
  };
  onRefresh: () => void;
  onOpenFull: () => void;
}

export function DropCard({ drop, onRefresh, onOpenFull }: DropCardProps) {
  const { user, profile } = useAuth();
  const { addXP } = useGamification();
  const { trackLike, trackView } = useUserTracking();
  const { toggleLike } = useOptimisticLike();
  
  const [isVibingWith, setIsVibingWith] = useState(false);
  const [vibingLoading, setVibingLoading] = useState(false);
  const [localLikeState, setLocalLikeState] = useState({
    hasLiked: drop.user_has_felt || false,
    count: drop.feels_count || 0,
  });
  const [isHidden, setIsHidden] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (user && drop.user_id !== user.id) {
      checkVibeStatus();
    }
    trackView(drop.id);
  }, [user, drop.user_id, drop.id]);

  useEffect(() => {
    setLocalLikeState({
      hasLiked: drop.user_has_felt || false,
      count: drop.feels_count || 0,
    });
  }, [drop.user_has_felt, drop.feels_count]);

  async function checkVibeStatus() {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('vibes')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', drop.user_id)
        .maybeSingle();
      setIsVibingWith(!!data);
    } catch (error) {
      console.error('Error checking vibe status:', error);
    }
  }

  const handleFeel = useCallback(async () => {
    if (!user) return;

    const previousState = { ...localLikeState };
    
    await toggleLike(
      drop.id,
      localLikeState,
      (newState) => setLocalLikeState(newState),
      () => setLocalLikeState(previousState)
    );

    if (!localLikeState.hasLiked) {
      await addXP('like');
      await trackLike(drop.id);
    }
    
    onRefresh();
  }, [user, drop.id, localLikeState, toggleLike, addXP, trackLike, onRefresh]);

  async function handleVibeWith() {
    if (!user || drop.user_id === user.id || vibingLoading) return;

    setVibingLoading(true);
    soundManager.playClick();
    
    try {
      if (isVibingWith) {
        await supabase
          .from('vibes')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', drop.user_id);
        setIsVibingWith(false);
      } else {
        await supabase
          .from('vibes')
          .insert({
            follower_id: user.id,
            following_id: drop.user_id,
          });
        setIsVibingWith(true);
      }
    } catch (error) {
      console.error('Error toggling vibe:', error);
    } finally {
      setVibingLoading(false);
    }
  }

  async function handleDelete() {
    if (!user || user.id !== drop.user_id) return;
    if (!confirm('Delete this drop? This cannot be undone.')) return;

    try {
      await supabase.from('drops').delete().eq('id', drop.id);
      onRefresh();
    } catch (error) {
      console.error('Error deleting drop:', error);
      alert('Failed to delete drop');
    }
  }

  const handleOpenFull = () => {
    soundManager.playClick();
    onOpenFull();
  };

  if (isHidden) return null;

  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 bg-gradient-to-br ${drop.users.avatar_gradient} rounded-full flex items-center justify-center text-xl flex-shrink-0`}>
          {drop.users.avatar_symbol}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 dark:text-white">
                {drop.users.username}
              </span>
              {drop.mood && (
                <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-full">
                  {drop.mood}
                </span>
              )}
            </div>
            {user && drop.user_id !== user.id && (
              <button
                onClick={handleVibeWith}
                disabled={vibingLoading}
                className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
                  isVibingWith
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {isVibingWith ? (
                  <><UserCheck className="w-3 h-3" /> Vibing</>
                ) : (
                  <><UserPlus className="w-3 h-3" /> Vibe</>
                )}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(drop.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {drop.seen_count}
            </span>
          </div>

          {drop.content && (
            <p
              onClick={handleOpenFull}
              className="text-gray-900 dark:text-white mb-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              {drop.content}
            </p>
          )}

          {drop.image_url && (
            <div className="relative mb-3">
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              )}
              <img
                src={drop.image_url}
                alt="Drop"
                onClick={handleOpenFull}
                onLoad={() => setImageLoaded(true)}
                className={`w-full rounded-xl cursor-pointer hover:opacity-90 transition-all ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </div>
          )}

          {drop.video_url && (
            <video
              src={drop.video_url}
              controls
              muted
              playsInline
              className="w-full rounded-xl mb-3"
              onClick={(e) => e.stopPropagation()}
            />
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={handleFeel}
                className={`flex items-center gap-1.5 transition-colors ${
                  localLikeState.hasLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-red-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${localLikeState.hasLiked ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">{localLikeState.count}</span>
              </button>

              <button
                onClick={handleOpenFull}
                className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{drop.echoes_count || 0}</span>
              </button>

              <ShareMenu
                postId={drop.id}
                postType="drop"
                username={drop.users.username}
                preview={drop.content || undefined}
                onHide={() => setIsHidden(true)}
              />
            </div>

            {user && user.id === drop.user_id && (
              <button
                onClick={handleDelete}
                className="text-xs px-2 py-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
