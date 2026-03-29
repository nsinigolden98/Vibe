import { useState, useEffect, useRef } from 'react';
import { X, Heart, MessageCircle, Share2, Send, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from '../../lib/utils';

interface FullPostViewProps {
  dropId: string;
  onClose: () => void;
  onRefresh: () => void;
}

export function FullPostView({ dropId, onClose, onRefresh }: FullPostViewProps) {
  const { user } = useAuth();
  const [drop, setDrop] = useState<any>(null);
  const [echoes, setEchoes] = useState<any[]>([]);
  const [newEcho, setNewEcho] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const echoesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDropAndEchoes();

    const channel = supabase
      .channel(`drop_${dropId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'echoes', filter: `drop_id=eq.${dropId}` }, () => {
        loadEchoes();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feels', filter: `drop_id=eq.${dropId}` }, () => {
        loadDrop();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dropId]);

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

    try {
      if (drop.user_has_felt) {
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
      loadDrop();
      onRefresh();
    } catch (error) {
      console.error('Error toggling feel:', error);
    }
  }

  async function handleSubmitEcho(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !newEcho.trim() || submitting) return;

    setSubmitting(true);
    try {
      await supabase
        .from('echoes')
        .insert({
          drop_id: dropId,
          user_id: user.id,
          content: newEcho.trim(),
        });

      setNewEcho('');
      onRefresh();
    } catch (error) {
      console.error('Error submitting echo:', error);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !drop) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-auto">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
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
              <div className="flex items-center gap-6 text-gray-500 dark:text-gray-400 mb-4">
                <button
                  onClick={handleFeel}
                  className={`flex items-center gap-1.5 hover:text-red-500 transition-colors ${
                    drop.user_has_felt ? 'text-red-500' : ''
                  }`}
                >
                  <Heart className={`w-5 h-5 ${drop.user_has_felt ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">{drop.feels_count || 0}</span>
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
                <div key={echo.id} className="flex items-start gap-3">
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
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{echo.content}</p>
                  </div>
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
