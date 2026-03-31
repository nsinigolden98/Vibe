import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Heart, MessageCircle, Send, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from '../../lib/utils';
import { soundManager } from '../../lib/soundManager';
import { useOptimisticComment } from '../../hooks/useOptimisticUpdate';
import { useGamification } from '../../hooks/useGamification';
import { useUserTracking } from '../../hooks/useUserTracking';

interface FullPostViewProps {
  dropId: string;
  onClose: () => void;
  onRefresh: () => void;
}

interface Echo {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  users: {
    username: string;
    avatar_symbol: string;
    avatar_gradient: string;
  };
  isOptimistic?: boolean;
}

export function FullPostView({ dropId, onClose, onRefresh }: FullPostViewProps) {
  const { user, profile } = useAuth();
  const { addXP } = useGamification();
  const { trackComment } = useUserTracking();
  const { addComment } = useOptimisticComment();
  
  const [drop, setDrop] = useState<any>(null);
  const [echoes, setEchoes] = useState<Echo[]>([]);
  const [newEcho, setNewEcho] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [localLikeState, setLocalLikeState] = useState({ hasLiked: false, count: 0 });
  const echoesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDropAndEchoes();
    incrementViewCount();

    const channel = supabase
      .channel(`drop_${dropId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'echoes', filter: `drop_id=eq.${dropId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newEcho = payload.new as Echo;
          if (!newEcho.id.startsWith('temp-')) {
            setEchoes(prev => {
              const exists = prev.some(e => e.id === newEcho.id);
              if (exists) return prev;
              return [...prev.filter(e => !e.isOptimistic), newEcho];
            });
          }
        } else if (payload.eventType === 'DELETE') {
          setEchoes(prev => prev.filter(e => e.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feels', filter: `drop_id=eq.${dropId}` }, () => {
        loadDrop();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dropId]);

  useEffect(() => {
    echoesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [echoes]);

  async function incrementViewCount() {
    try {
      await supabase.rpc('increment_drop_views', { drop_id: dropId });
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  }

  async function loadDrop() {
    const { data: dropData } = await supabase
      .from('drops')
      .select(`
        *,
        users (username, avatar_symbol, avatar_gradient)
      `)
      .eq('id', dropId)
      .single();

    if (dropData && user) {
      const [feelsResult, userFeelResult] = await Promise.all([
        supabase.from('feels').select('id', { count: 'exact', head: true }).eq('drop_id', dropId),
        supabase.from('feels').select('id').eq('drop_id', dropId).eq('user_id', user.id).maybeSingle(),
      ]);

      setDrop({
        ...dropData,
        feels_count: feelsResult.count || 0,
        user_has_felt: !!userFeelResult.data,
      });
      setLocalLikeState({
        hasLiked: !!userFeelResult.data,
        count: feelsResult.count || 0,
      });
    }
  }

  async function loadEchoes() {
    const { data: echoesData } = await supabase
      .from('echoes')
      .select(`
        *,
        users (username, avatar_symbol, avatar_gradient)
      `)
      .eq('drop_id', dropId)
      .order('created_at', { ascending: true });

    setEchoes(echoesData || []);
  }

  async function loadDropAndEchoes() {
    setLoading(true);
    await Promise.all([loadDrop(), loadEchoes()]);
    setLoading(false);
  }

  async function handleFeel() {
    if (!user || !drop) return;

    const previousState = { ...localLikeState };
    
    const newState = {
      hasLiked: !localLikeState.hasLiked,
      count: localLikeState.hasLiked ? localLikeState.count - 1 : localLikeState.count + 1,
    };
    
    setLocalLikeState(newState);
    soundManager.playLike();

    try {
      if (localLikeState.hasLiked) {
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
      onRefresh();
    } catch (error) {
      setLocalLikeState(previousState);
      console.error('Error toggling feel:', error);
    }
  }

  const handleSubmitEcho = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newEcho.trim() || submitting) return;

    const content = newEcho.trim();
    setNewEcho('');

    const tempComment = {
      content,
      users: {
        username: profile?.username || 'You',
        avatar_symbol: profile?.avatar_symbol || '🌀',
        avatar_gradient: profile?.avatar_gradient || 'from-gray-400 to-gray-500',
      },
    };

    await addComment(
      dropId,
      content,
      tempComment,
      (comment) => {
        setEchoes(prev => [...prev, { ...comment, isOptimistic: true }]);
      },
      (tempId, realComment) => {
        setEchoes(prev => prev.map(e => e.id === tempId ? { ...realComment, isOptimistic: false } : e));
      },
      (tempId) => {
        setEchoes(prev => prev.filter(e => e.id !== tempId));
      }
    );

    await addXP('comment');
    await trackComment(dropId);
    onRefresh();
  }, [user, newEcho, submitting, profile, dropId, addComment, addXP, trackComment, onRefresh]);

  async function handleDeleteEcho(echoId: string) {
    if (!user) return;
    if (!confirm('Delete this comment?')) return;

    try {
      await supabase.from('echoes').delete().eq('id', echoId);
      setEchoes(prev => prev.filter(e => e.id !== echoId));
    } catch (error) {
      console.error('Error deleting echo:', error);
    }
  }

  if (loading || !drop) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-auto">
        <div className="bg-white dark:bg-gray-900 w-full md:max-w-2xl md:rounded-2xl rounded-t-3xl max-h-[90vh] flex flex-col pointer-events-auto p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-50 pointer-events-auto" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-gray-900 w-full md:max-w-2xl md:rounded-2xl rounded-t-3xl max-h-[90vh] flex flex-col pointer-events-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Drop</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-start gap-3 mb-6">
            <div className={`w-12 h-12 bg-gradient-to-br ${drop.users.avatar_gradient} rounded-full flex items-center justify-center text-xl flex-shrink-0`}>
              {drop.users.avatar_symbol}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {drop.users.username}
                </span>
                {drop.mood && (
                  <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-full">
                    {drop.mood}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {formatDistanceToNow(drop.created_at)}
              </p>
              {drop.content && (
                <p className="text-gray-900 dark:text-white mb-3">{drop.content}</p>
              )}
              {drop.image_url && (
                <img
                  src={drop.image_url}
                  alt="Drop"
                  className="w-full rounded-xl mb-3"
                />
              )}
              {drop.video_url && (
                <video
                  src={drop.video_url}
                  controls
                  muted
                  playsInline
                  className="w-full rounded-xl mb-3"
                />
              )}
              <div className="flex items-center gap-6 text-gray-500 dark:text-gray-400 mb-4">
                <button
                  onClick={handleFeel}
                  className={`flex items-center gap-1.5 transition-colors ${
                    localLikeState.hasLiked ? 'text-red-500' : 'hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${localLikeState.hasLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">{localLikeState.count}</span>
                </button>
                <div className="flex items-center gap-1.5">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{echoes.length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Echoes</h3>
            {echoes.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No echoes yet. Be the first!</p>
            ) : (
              echoes.map((echo) => (
                <div key={echo.id} className="flex items-start gap-3 group">
                  <div className={`w-8 h-8 bg-gradient-to-br ${echo.users.avatar_gradient} rounded-full flex items-center justify-center text-sm flex-shrink-0`}>
                    {echo.users.avatar_symbol}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {echo.users.username}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(echo.created_at)}
                      </span>
                      {echo.isOptimistic && (
                        <span className="text-xs text-gray-400">Sending...</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{echo.content}</p>
                  </div>
                  {user && echo.user_id === user.id && !echo.isOptimistic && (
                    <button
                      onClick={() => handleDeleteEcho(echo.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            )}
            <div ref={echoesEndRef} />
          </div>
        </div>

        <form onSubmit={handleSubmitEcho} className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newEcho}
              onChange={(e) => setNewEcho(e.target.value)}
              placeholder="Add an echo..."
              className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-full text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500"
            />
            <button
              type="submit"
              disabled={!newEcho.trim() || submitting}
              className="p-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
