import React, { useState, useEffect } from 'react';
import { Clock, Users, BarChart3 } from 'lucide-react';
import type { Drop, User, PulseOption } from '@/types';
import { MOOD_COLORS, MOOD_EMOJIS } from '@/types';
import { getPulseOptions, votePulse } from '@/services/supabaseClient';
import { soundManager } from '@/sounds/SoundManager';
import { formatDistanceToNow } from 'date-fns';

interface PulseCardProps {
  pulse: Drop;
  currentUser: User | null;
  onVote: () => void;
}

const PulseCard: React.FC<PulseCardProps> = ({ pulse, currentUser, onVote }) => {
  const [options, setOptions] = useState<PulseOption[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOptions();
  }, [pulse.id]);

  const loadOptions = async () => {
    const opts = await getPulseOptions(pulse.id);
    setOptions(opts);
    const total = opts.reduce((sum, opt) => sum + (opt.vote_count || 0), 0);
    setTotalVotes(total);
    setHasVoted(opts.some(opt => opt.has_voted));
    setLoading(false);
  };

  const handleVote = async (optionId: string) => {
    if (!currentUser) return;
    
    const result = await votePulse(optionId, currentUser.id, pulse.id);
    
    if (result.action === 'added') {
      soundManager.playClick();
    }
    
    await loadOptions();
    onVote();
  };

  const parseAvatar = (avatarStr: string) => {
    try {
      return JSON.parse(avatarStr);
    } catch {
      return { initial: '?', symbol: '◆', gradient: 'from-gray-500 to-gray-600' };
    }
  };

  const avatar = pulse.user ? parseAvatar(pulse.user.avatar) : null;
  const moodColor = MOOD_COLORS[pulse.mood];
  const moodEmoji = MOOD_EMOJIS[pulse.mood];

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-4 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-12 bg-white/10 rounded"></div>
          <div className="h-12 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 mb-4 overflow-hidden"
      style={{ '--mood-glow': moodColor } as React.CSSProperties}
    >
      {/* Mood glow effect */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ 
          background: `radial-gradient(circle at top left, ${moodColor}, transparent 60%)`,
        }}
      />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          {pulse.ghost_mode ? (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
              <span className="text-lg">👻</span>
            </div>
          ) : avatar ? (
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatar.gradient} flex items-center justify-center`}>
              <span className="text-white font-bold text-sm">{avatar.initial}</span>
            </div>
          ) : null}
          
          <div>
            <span className="font-semibold text-white block">
              {pulse.ghost_mode ? 'Ghost' : pulse.user?.username}
            </span>
            <div className="flex items-center gap-2 text-xs text-white/50">
              <span>{formatDistanceToNow(new Date(pulse.created_at), { addSuffix: true })}</span>
              <span className="flex items-center gap-1" style={{ color: moodColor }}>
                {moodEmoji} {pulse.mood}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-white/50 text-sm">
          <BarChart3 className="w-4 h-4" />
          <span>{totalVotes} votes</span>
        </div>
      </div>
      
      {/* Question */}
      <div className="relative z-10 mb-4">
        <h3 className="text-lg font-semibold text-white">{pulse.content}</h3>
      </div>
      
      {/* Options */}
      <div className="space-y-2 relative z-10">
        {options.map((option) => {
          const percentage = totalVotes > 0 ? Math.round((option.vote_count / totalVotes) * 100) : 0;
          const isSelected = option.has_voted;
          
          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={!currentUser}
              className={`w-full relative overflow-hidden rounded-xl transition-all duration-300 ${
                isSelected 
                  ? 'ring-2 ring-[#ff2e2e]' 
                  : 'hover:bg-white/10'
              }`}
            >
              {/* Progress bar background */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-[#ff2e2e]/30 to-[#ff2e2e]/10 transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
              
              <div className="relative flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  {option.image_url && (
                    <img 
                      src={option.image_url} 
                      alt="" 
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  )}
                  <span className="text-white font-medium">{option.option_text}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-white/70 text-sm">{percentage}%</span>
                  <span className="text-white/50 text-xs">({option.vote_count})</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10 relative z-10">
        <div className="flex items-center gap-2 text-white/40 text-xs">
          <Users className="w-4 h-4" />
          <span>{totalVotes} people voted</span>
        </div>
        
        {pulse.expires_at && (
          <div className="flex items-center gap-1 text-white/40 text-xs">
            <Clock className="w-4 h-4" />
            <span>Ends {formatDistanceToNow(new Date(pulse.expires_at), { addSuffix: true })}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PulseCard;
