import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Clock, Eye } from 'lucide-react';
import type { Drop, User } from '@/types';
import { MOOD_COLORS, MOOD_EMOJIS } from '@/types';
import { feelDrop, hasFeltDrop, vibeWith, isVibing } from '@/services/supabaseClient';
import { soundManager } from '@/sounds/SoundManager';
import { formatDistanceToNow } from 'date-fns';

interface DropCardProps {
  drop: Drop;
  currentUser: User | null;
  onEcho: (drop: Drop) => void;
  onFlow: (drop: Drop) => void;
  onVibe: (userId: string) => void;
  onView: (drop: Drop) => void;
}

const DropCard: React.FC<DropCardProps> = ({
  drop,
  currentUser,
  onEcho,
  onFlow,
  onVibe,
  onView
}) => {
  const [hasFelt, setHasFelt] = useState(false);
  const [feelCount, setFeelCount] = useState(drop.engagement?.feel_count || 0);
  const [isVibingUser, setIsVibingUser] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    if (currentUser) {
      checkFeelStatus();
      checkVibeStatus();
    }
  }, [currentUser, drop.id]);

  const checkFeelStatus = async () => {
    if (!currentUser) return;
    const felt = await hasFeltDrop(drop.id, currentUser.id);
    setHasFelt(felt);
  };

  const checkVibeStatus = async () => {
    if (!currentUser || !drop.user) return;
    const vibing = await isVibing(currentUser.id, drop.user.id);
    setIsVibingUser(vibing);
  };

  const handleFeel = async () => {
    if (!currentUser) return;
    
    const result = await feelDrop(drop.id, currentUser.id);
    
    if (result.action === 'added') {
      setHasFelt(true);
      setFeelCount(prev => prev + 1);
      soundManager.playLike();
    } else {
      setHasFelt(false);
      setFeelCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleVibe = async () => {
    if (!currentUser || !drop.user) return;
    
    const result = await vibeWith(currentUser.id, drop.user.id);
    
    if (result.action === 'added') {
      setIsVibingUser(true);
      soundManager.playVibe();
    } else {
      setIsVibingUser(false);
    }
    
    onVibe(drop.user.id);
  };

  const handleEcho = () => {
    soundManager.playClick();
    onEcho(drop);
  };

  const handleFlow = () => {
    soundManager.playFlow();
    onFlow(drop);
  };

  const handleView = () => {
    onView(drop);
  };

  const parseAvatar = (avatarStr: string) => {
    try {
      return JSON.parse(avatarStr);
    } catch {
      return { initial: '?', symbol: '◆', gradient: 'from-gray-500 to-gray-600' };
    }
  };

  const avatar = drop.user ? parseAvatar(drop.user.avatar) : null;
  const moodColor = MOOD_COLORS[drop.mood];
  const moodEmoji = MOOD_EMOJIS[drop.mood];

  return (
    <div 
      className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 mb-4 hover:bg-white/10 transition-all duration-300"
      style={{ '--mood-glow': moodColor } as React.CSSProperties}
    >
      {/* Mood glow effect */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-10 pointer-events-none"
        style={{ 
          background: `radial-gradient(circle at top right, ${moodColor}, transparent 50%)`,
          boxShadow: `0 0 30px ${moodColor}20`
        }}
      />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-3 relative z-10">
        <div className="flex items-center gap-3">
          {drop.ghost_mode ? (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
              <span className="text-lg">👻</span>
            </div>
          ) : avatar ? (
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatar.gradient} flex items-center justify-center`}>
              <span className="text-white font-bold text-sm">{avatar.initial}</span>
              <span className="absolute -bottom-1 -right-1 text-xs">{avatar.symbol}</span>
            </div>
          ) : null}
          
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">
                {drop.ghost_mode ? 'Ghost' : drop.user?.username}
              </span>
              {!drop.ghost_mode && drop.user && currentUser && drop.user.id !== currentUser.id && (
                <button
                  onClick={handleVibe}
                  className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                    isVibingUser 
                      ? 'bg-[#ff2e2e] text-white' 
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {isVibingUser ? 'Vibing' : 'Vibe With'}
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-white/50">
              <span>{formatDistanceToNow(new Date(drop.created_at), { addSuffix: true })}</span>
              <span className="flex items-center gap-1" style={{ color: moodColor }}>
                {moodEmoji} {drop.mood}
              </span>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <MoreHorizontal className="w-5 h-5 text-white/50" />
          </button>
          
          {showOptions && (
            <div className="absolute right-0 top-full mt-1 bg-gray-900 border border-white/10 rounded-lg shadow-xl z-20 min-w-[150px]">
              <button
                onClick={() => {
                  handleView();
                  setShowOptions(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-white/70 hover:bg-white/10 first:rounded-t-lg"
              >
                View Drop
              </button>
              <button
                onClick={() => {
                  handleFlow();
                  setShowOptions(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-white/70 hover:bg-white/10 last:rounded-b-lg"
              >
                Flow (Share)
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 mb-3">
        <p className="text-white/90 whitespace-pre-wrap">{drop.content}</p>
        
        {drop.image_url && (
          <div className="mt-3 rounded-xl overflow-hidden bg-black/20">
            <img 
              src={drop.image_url} 
              alt="Drop content" 
              className="w-full max-h-[500px] object-contain"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
      
      {/* Engagement */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={handleFeel}
            className={`flex items-center gap-1.5 transition-colors ${
              hasFelt ? 'text-[#ff2e2e]' : 'text-white/50 hover:text-white/70'
            }`}
          >
            <Heart className={`w-5 h-5 ${hasFelt ? 'fill-current' : ''}`} />
            <span className="text-sm">{feelCount > 0 ? feelCount : 'FEEL'}</span>
          </button>
          
          <button
            onClick={handleEcho}
            className="flex items-center gap-1.5 text-white/50 hover:text-white/70 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm">
              {(drop.engagement?.echo_count || 0) > 0 ? drop.engagement?.echo_count : 'ECHO'}
            </span>
          </button>
          
          <button
            onClick={handleFlow}
            className="flex items-center gap-1.5 text-white/50 hover:text-white/70 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-sm">
              {(drop.engagement?.share_count || 0) > 0 ? drop.engagement?.share_count : 'FLOW'}
            </span>
          </button>
        </div>
        
        <div className="flex items-center gap-3 text-white/30 text-xs">
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {drop.engagement?.view_count || 0}
          </span>
          {drop.expires_at && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Expires {formatDistanceToNow(new Date(drop.expires_at), { addSuffix: true })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DropCard;
