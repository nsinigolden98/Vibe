import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from '../lib/utils';

interface Pulse {
  id: string;
  user_id: string;
  question: string;
  options: Array<{ text: string; image?: string }>;
  mood: string | null;
  created_at: string;
  users: {
    username: string;
    avatar_symbol: string;
    avatar_gradient: string;
  };
}

export function PulsePage() {
  const { user } = useAuth();
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});
  const [votePercentages, setVotePercentages] = useState<Record<string, number[]>>({});

  useEffect(() => {
    loadPulses();
  }, []);

  useEffect(() => {
    if (pulses.length > 0 && currentIndex < pulses.length) {
      loadVoteData(pulses[currentIndex].id);
    }
  }, [currentIndex, pulses]);

  async function loadPulses() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pulses')
        .select(`
          *,
          users (username, avatar_symbol, avatar_gradient)
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setPulses(data || []);

      if (data && data.length > 0 && user) {
        const { data: votesData } = await supabase
          .from('pulse_votes')
          .select('pulse_id, option_index')
          .eq('user_id', user.id)
          .in('pulse_id', data.map(p => p.id));

        const votesMap: Record<string, number> = {};
        votesData?.forEach(vote => {
          votesMap[vote.pulse_id] = vote.option_index;
        });
        setUserVotes(votesMap);
      }
    } catch (error) {
      console.error('Error loading pulses:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadVoteData(pulseId: string) {
    try {
      const { data: votes } = await supabase
        .from('pulse_votes')
        .select('option_index')
        .eq('pulse_id', pulseId);

      if (!votes) return;

      const pulse = pulses.find(p => p.id === pulseId);
      if (!pulse) return;

      const totalVotes = votes.length;
      const optionCounts = new Array(pulse.options.length).fill(0);

      votes.forEach(vote => {
        if (vote.option_index < pulse.options.length) {
          optionCounts[vote.option_index]++;
        }
      });

      const percentages = optionCounts.map(count =>
        totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0
      );

      setVotePercentages(prev => ({ ...prev, [pulseId]: percentages }));
    } catch (error) {
      console.error('Error loading vote data:', error);
    }
  }

  async function handleVote(pulseId: string, optionIndex: number) {
    if (!user) return;

    try {
      const existingVote = userVotes[pulseId];

      if (existingVote === optionIndex) {
        await supabase
          .from('pulse_votes')
          .delete()
          .eq('pulse_id', pulseId)
          .eq('user_id', user.id);

        setUserVotes(prev => {
          const updated = { ...prev };
          delete updated[pulseId];
          return updated;
        });
      } else if (existingVote !== undefined) {
        await supabase
          .from('pulse_votes')
          .update({ option_index: optionIndex })
          .eq('pulse_id', pulseId)
          .eq('user_id', user.id);

        setUserVotes(prev => ({ ...prev, [pulseId]: optionIndex }));
      } else {
        await supabase
          .from('pulse_votes')
          .insert({
            pulse_id: pulseId,
            user_id: user.id,
            option_index: optionIndex,
          });

        setUserVotes(prev => ({ ...prev, [pulseId]: optionIndex }));
      }

      await loadVoteData(pulseId);
    } catch (error) {
      console.error('Error voting:', error);
    }
  }

  function handleNext() {
    if (currentIndex < pulses.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }

  function handlePrevious() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (pulses.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen p-4">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No pulses available</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">Check back later for new polls!</p>
        </div>
      </div>
    );
  }

  const currentPulse = pulses[currentIndex];
  const userVote = userVotes[currentPulse.id];
  const percentages = votePercentages[currentPulse.id] || [];
  const hasVoted = userVote !== undefined;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-red-500 via-pink-500 to-orange-500 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto px-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 bg-gradient-to-br ${currentPulse.users.avatar_gradient} rounded-full flex items-center justify-center text-xl`}>
              {currentPulse.users.avatar_symbol}
            </div>
            <div>
              <p className="font-semibold text-white">{currentPulse.users.username}</p>
              <p className="text-xs text-white/70">{formatDistanceToNow(currentPulse.created_at)}</p>
            </div>
            {currentPulse.mood && (
              <span className="ml-auto px-3 py-1 bg-white/20 text-white text-xs rounded-full">
                {currentPulse.mood}
              </span>
            )}
          </div>

          <h2 className="text-2xl font-bold text-white mb-6">{currentPulse.question}</h2>

          <div className="space-y-3 mb-6">
            {currentPulse.options.map((option, index) => {
              const percentage = percentages[index] || 0;
              const isSelected = userVote === index;

              return (
                <button
                  key={index}
                  onClick={() => handleVote(currentPulse.id, index)}
                  className={`w-full p-4 rounded-xl transition-all relative overflow-hidden ${
                    isSelected
                      ? 'bg-white/30 border-2 border-white shadow-lg'
                      : 'bg-white/10 border-2 border-white/20 hover:bg-white/20'
                  }`}
                >
                  {hasVoted && (
                    <div
                      className="absolute inset-0 bg-white/20 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  )}
                  <div className="relative flex items-center justify-between">
                    <span className="font-medium text-white">{option.text}</span>
                    {hasVoted && (
                      <span className="text-sm font-bold text-white">{percentage}%</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-white/70 text-sm">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span>
              {currentIndex + 1} / {pulses.length}
            </span>
            <button
              onClick={handleNext}
              disabled={currentIndex === pulses.length - 1}
              className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
