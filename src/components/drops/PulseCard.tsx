import { useState, useEffect, useCallback } from 'react';
import { Heart, Share2, Eye, Trash2, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from '../../lib/utils';
import { soundManager } from '../../lib/soundManager';
import { ShareMenu } from './ShareMenu';
import { useOptimisticVote } from '../../hooks/useOptimisticUpdate';
import { useGamification } from '../../hooks/useGamification';
import { useUserTracking } from '../../hooks/useUserTracking';

interface PulseCardProps {
  pulse: {
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
  };
  onRefresh: () => void;
}

export function PulseCard({ pulse, onRefresh }: PulseCardProps) {
  const { user } = useAuth();
  const { addXP } = useGamification();
  const { trackVote } = useUserTracking();
  const { toggleVote } = useOptimisticVote();
  
  const [votes, setVotes] = useState<Record<number, number>>({});
  const [userVote, setUserVote] = useState<number | null>(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    loadVotes();
  }, [pulse.id]);

  async function loadVotes() {
    try {
      const { data: voteData } = await supabase
        .from('pulse_votes')
        .select('option_index')
        .eq('pulse_id', pulse.id);

      if (voteData) {
        const voteCounts: Record<number, number> = {};
        pulse.options.forEach((_, idx) => {
          voteCounts[idx] = voteData.filter(v => v.option_index === idx).length;
        });
        setVotes(voteCounts);
        setTotalVotes(voteData.length);
      }

      if (user) {
        const { data: userVoteData } = await supabase
          .from('pulse_votes')
          .select('option_index')
          .eq('pulse_id', pulse.id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (userVoteData) {
          setUserVote(userVoteData.option_index);
        }
      }
    } catch (error) {
      console.error('Error loading votes:', error);
    }
  }

  const handleVote = useCallback(async (optionIndex: number) => {
    if (!user || loading) return;

    const previousVotes = { ...votes };
    const previousUserVote = userVote;
    const previousTotal = totalVotes;

    await toggleVote(
      pulse.id,
      optionIndex,
      votes,
      userVote,
      (newVotes, newUserVote) => {
        setVotes(newVotes);
        setUserVote(newUserVote);
        setTotalVotes(Object.values(newVotes).reduce((a, b) => a + b, 0));
      },
      () => {
        setVotes(previousVotes);
        setUserVote(previousUserVote);
        setTotalVotes(previousTotal);
      }
    );

    if (userVote !== optionIndex) {
      await addXP('vote');
      await trackVote(pulse.id);
    }

    onRefresh();
  }, [user, pulse.id, votes, userVote, totalVotes, toggleVote, addXP, trackVote, onRefresh, loading]);

  const getPercentage = (optionIndex: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes[optionIndex] || 0) / totalVotes * 100);
  };

  async function handleDelete() {
    if (!user || user.id !== pulse.user_id) return;
    if (!confirm('Delete this poll? This cannot be undone.')) return;

    try {
      await supabase.from('pulses').delete().eq('id', pulse.id);
      onRefresh();
    } catch (error) {
      console.error('Error deleting pulse:', error);
      alert('Failed to delete poll');
    }
  }

  if (isHidden) return null;

  const hasVoted = userVote !== null;

  return (
    <div className="w-full p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${pulse.users.avatar_gradient} rounded-full flex items-center justify-center text-xl flex-shrink-0`}>
          {pulse.users.avatar_symbol}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900 dark:text-white">
              {pulse.users.username}
            </span>
            <Sparkles className="w-4 h-4 text-purple-500" />
            {pulse.mood && (
              <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs rounded-full">
                {pulse.mood}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(pulse.created_at)}
          </p>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        {pulse.question}
      </h3>

      <div className="space-y-2 mb-4">
        {pulse.options.map((option, idx) => {
          const percentage = getPercentage(idx);
          const isSelected = userVote === idx;
          const count = votes[idx] || 0;

          return (
            <button
              key={idx}
              onClick={() => handleVote(idx)}
              disabled={loading}
              className={`w-full p-3 rounded-lg transition-all text-left relative overflow-hidden disabled:opacity-70 ${
                isSelected
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {hasVoted && (
                <div
                  className={`absolute inset-0 transition-all ${
                    isSelected ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  style={{ width: `${percentage}%`, opacity: 0.3 }}
                />
              )}
              <div className="relative flex items-center justify-between">
                <span className="font-medium">{option.text}</span>
                {hasVoted && (
                  <span className="text-sm opacity-90">
                    {percentage}% ({count})
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            {totalVotes} votes
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {pulse.seen_count}
          </div>
          <ShareMenu
            postId={pulse.id}
            postType="pulse"
            username={pulse.users.username}
            preview={pulse.question}
            onHide={() => setIsHidden(true)}
          />
        </div>

        {user && user.id === pulse.user_id && (
          <button
            onClick={handleDelete}
            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded p-1 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
