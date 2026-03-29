import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, UserPlus, Eye, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from '../../lib/utils';

interface DropCardProps {
  drop: {
    id: string;
    user_id: string;
    content: string | null;
    image_url: string | null;
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
  const [isVibingWith, setIsVibingWith] = useState(false);
  const [vibingLoading, setVibingLoading] = useState(false);

  useEffect(() => {
    if (user && drop.user_id !== user.id) {
      checkVibeStatus();
    }
  }, [user, drop.user_id]);

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

  async function handleFeel() {
    if (!user) return;

    try {
      if (drop.user_has_felt) {
        await supabase
          .from('feels')
          .delete()
          .eq('drop_id', drop.id)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('feels')
          .insert({ drop_id: drop.id, user_id: user.id });
      }
      onRefresh();
    } catch (error) {
      console.error('Error toggling feel:', error);
    }
  }

  async function handleVibeWith() {
    if (!user || drop.user_id === user.id || vibingLoading) return;

    setVibingLoading(true);
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

  async function handleFlow() {
    const link = window.location.href.includes('drop')
      ? window.location.href
      : `${window.location.origin}?drop=${drop.id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check this out on VIBE',
          url: link,
        });
      } else {
        await navigator.clipboard.writeText(link);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }

  async function handleDelete() {
    if (!user || user.id !== drop.user_id) return;
    if (!confirm('Delete this drop? This cannot be undone.')) return;

    try {
      await supabase
        .from('drops')
        .delete()
        .eq('id', drop.id);
      onRefresh();
    } catch (error) {
      console.error('Error deleting drop:', error);
      alert('Failed to delete drop');
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
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
                className={`text-xs font-medium px-3 py-1 rounded-full transition-all ${
                  isVibingWith
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {isVibingWith ? 'Vibing' : 'Vibe With'}
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
              onClick={onOpenFull}
              className="text-gray-900 dark:text-white mb-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
            >
              {drop.content}
            </p>
          )}

          {drop.image_url && (
            <img
              src={drop.image_url}
              alt="Drop"
              onClick={onOpenFull}
              className="w-full rounded-xl mb-3 cursor-pointer hover:opacity-90 transition-opacity"
            />
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-gray-500 dark:text-gray-400">
              <button
                onClick={handleFeel}
                className={`flex items-center gap-1.5 hover:text-red-500 transition-colors ${
                  drop.user_has_felt ? 'text-red-500' : ''
                }`}
              >
                <Heart className={`w-5 h-5 ${drop.user_has_felt ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">{drop.feels_count || 0}</span>
              </button>

              <button
                onClick={onOpenFull}
                className="flex items-center gap-1.5 hover:text-blue-500 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{drop.echoes_count || 0}</span>
              </button>

              <button
                onClick={handleFlow}
                className="flex items-center gap-1.5 hover:text-green-500 transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
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
