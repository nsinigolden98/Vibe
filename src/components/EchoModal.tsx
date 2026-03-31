import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Heart } from 'lucide-react';
import type { Drop, Echo, User } from '@/types';
import { MOOD_COLORS, MOOD_EMOJIS } from '@/types';
import { getEchoes, createEcho } from '@/services/supabaseClient';
import { soundManager } from '@/sounds/SoundManager';
import { formatDistanceToNow } from 'date-fns';

interface EchoModalProps {
  isOpen: boolean;
  onClose: () => void;
  drop: Drop | null;
  currentUser: User | null;
}

const EchoModal: React.FC<EchoModalProps> = ({
  isOpen,
  onClose,
  drop,
  currentUser
}) => {
  const [echoes, setEchoes] = useState<Echo[]>([]);
  const [newEcho, setNewEcho] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && drop) {
      loadEchoes();
    }
  }, [isOpen, drop]);

  useEffect(() => {
    // Scroll to bottom when new echoes arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [echoes]);

  const loadEchoes = async () => {
    if (!drop) return;
    setLoading(true);
    const data = await getEchoes(drop.id);
    setEchoes(data);
    setLoading(false);
  };

  const handleSendEcho = async () => {
    if (!currentUser || !drop || !newEcho.trim()) return;

    setSending(true);
    const { data, error } = await createEcho({
      post_id: drop.id,
      user_id: currentUser.id,
      content: newEcho.trim()
    });

    if (!error && data) {
      soundManager.playEcho();
      setNewEcho('');
      await loadEchoes();
    }
    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendEcho();
    }
  };

  const parseAvatar = (avatarStr: string) => {
    try {
      return JSON.parse(avatarStr);
    } catch {
      return { initial: '?', symbol: '◆', gradient: 'from-gray-500 to-gray-600' };
    }
  };

  if (!isOpen || !drop) return null;

  const dropAvatar = drop.user ? parseAvatar(drop.user.avatar) : null;
  const moodColor = MOOD_COLORS[drop.mood];
  const moodEmoji = MOOD_EMOJIS[drop.mood];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            Echoes
            <span className="text-white/50 text-sm">({echoes.length})</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white/50" />
          </button>
        </div>
        
        {/* Original Drop */}
        <div className="p-4 border-b border-white/10 bg-white/5">
          <div className="flex items-start gap-3">
            {drop.ghost_mode ? (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">👻</span>
              </div>
            ) : dropAvatar ? (
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${dropAvatar.gradient} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white font-bold text-sm">{dropAvatar.initial}</span>
              </div>
            ) : null}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-white">
                  {drop.ghost_mode ? 'Ghost' : drop.user?.username}
                </span>
                <span className="text-xs text-white/50">
                  {formatDistanceToNow(new Date(drop.created_at), { addSuffix: true })}
                </span>
                <span style={{ color: moodColor }}>{moodEmoji}</span>
              </div>
              <p className="text-white/80 text-sm line-clamp-3">{drop.content}</p>
            </div>
          </div>
        </div>
        
        {/* Echoes List */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px] max-h-[400px]"
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-white/20 border-t-[#ff2e2e] rounded-full animate-spin" />
            </div>
          ) : echoes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/40">No echoes yet</p>
              <p className="text-white/30 text-sm mt-1">Be the first to echo!</p>
            </div>
          ) : (
            echoes.map((echo) => {
              const echoAvatar = echo.user ? parseAvatar(echo.user.avatar) : null;
              const isCurrentUser = currentUser?.id === echo.user_id;
              
              return (
                <div 
                  key={echo.id} 
                  className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                >
                  {echoAvatar && (
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${echoAvatar.gradient} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white text-xs font-bold">{echoAvatar.initial}</span>
                    </div>
                  )}
                  
                  <div className={`max-w-[75%] ${isCurrentUser ? 'text-right' : ''}`}>
                    <div className={`inline-block px-4 py-2 rounded-2xl ${
                      isCurrentUser 
                        ? 'bg-[#ff2e2e] text-white rounded-br-sm' 
                        : 'bg-white/10 text-white rounded-bl-sm'
                    }`}>
                      <p className="text-sm">{echo.content}</p>
                    </div>
                    <p className="text-xs text-white/40 mt-1">
                      {formatDistanceToNow(new Date(echo.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {/* Input */}
        {currentUser && (
          <div className="p-4 border-t border-white/10 bg-gray-900">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newEcho}
                onChange={(e) => setNewEcho(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add your echo..."
                className="flex-1 bg-white/10 border border-white/10 rounded-full px-4 py-2.5 text-white placeholder:text-white/40 focus:outline-none focus:border-[#ff2e2e]/50"
              />
              <button
                onClick={handleSendEcho}
                disabled={!newEcho.trim() || sending}
                className="p-2.5 bg-[#ff2e2e] hover:bg-[#ff2e2e]/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-colors"
              >
                {sending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EchoModal;
