import React from 'react';
import { Users, Lock, Clock, ArrowRight } from 'lucide-react';
import type { Space, User } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface SpaceCardProps {
  space: Space;
  currentUser: User | null;
  onJoin: (space: Space) => void;
}

const SpaceCard: React.FC<SpaceCardProps> = ({ space, currentUser, onJoin }) => {
  const parseAvatar = (avatarStr: string) => {
    try {
      return JSON.parse(avatarStr);
    } catch {
      return { initial: '?', symbol: '◆', gradient: 'from-gray-500 to-gray-600' };
    }
  };

  const avatar = space.user ? parseAvatar(space.user.avatar) : null;

  return (
    <div 
      className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 mb-4 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
      onClick={() => onJoin(space)}
    >
      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
        style={{ 
          background: 'radial-gradient(circle at top right, #ff2e2e, transparent 50%)',
        }}
      />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff2e2e]/30 to-purple-500/30 flex items-center justify-center">
              <span className="text-2xl">💬</span>
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white">{space.name}</h3>
                {space.is_private && (
                  <Lock className="w-4 h-4 text-white/50" />
                )}
              </div>
              <span className="text-xs text-white/50">
                Created {formatDistanceToNow(new Date(space.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onJoin(space);
            }}
            className="flex items-center gap-1 px-4 py-2 bg-[#ff2e2e] hover:bg-[#ff2e2e]/80 text-white rounded-full text-sm font-medium transition-colors"
          >
            Join
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        {/* Description */}
        {space.description && (
          <p className="text-white/70 text-sm mb-3 line-clamp-2">{space.description}</p>
        )}
        
        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {avatar && (
              <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${avatar.gradient} flex items-center justify-center`}>
                <span className="text-white text-xs font-bold">{avatar.initial}</span>
              </div>
            )}
            <span className="text-xs text-white/50">
              by {space.user?.username}
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-white/40 text-xs">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {space.member_count || 0} active
            </span>
            
            {space.expires_at && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Expires {formatDistanceToNow(new Date(space.expires_at), { addSuffix: true })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpaceCard;
