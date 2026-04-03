import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Plus, Ghost, Heart, Clock, Sparkles,
  Flame, Cloud, Moon, Sun, Zap
} from 'lucide-react';
import type { User } from '@/types';
import { 
  getVoidPosts, 
  createVoidPost, 
  feelVoidPost,
  type VoidPost 
} from '@/services/demoStorage';
import { soundManager } from '@/sounds/SoundManager';
import { formatDistanceToNow } from 'date-fns';

interface VoidWallProps {
  currentUser: User | null;
}

const VOID_MOODS = [
  { id: 'whisper', name: 'Whisper', emoji: '🌫️', color: '#A0AEC0', icon: Cloud },
  { id: 'burn', name: 'Burn', emoji: '🔥', color: '#FF6B35', icon: Flame },
  { id: 'glow', name: 'Glow', emoji: '✨', color: '#F6E05E', icon: Sun },
  { id: 'shadow', name: 'Shadow', emoji: '🌙', color: '#4A5568', icon: Moon },
  { id: 'spark', name: 'Spark', emoji: '⚡', color: '#9F7AEA', icon: Zap }
];

const VoidWall: React.FC<VoidWallProps> = ({ currentUser }) => {
  const [posts, setPosts] = useState<VoidPost[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [createData, setCreateData] = useState({
    content: '',
    mood: 'whisper'
  });

  useEffect(() => {
    loadPosts();
    const interval = setInterval(loadPosts, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadPosts = () => {
    const voidPosts = getVoidPosts();
    setPosts(voidPosts);
  };

  const handleCreatePost = () => {
    if (!createData.content.trim()) return;
    
    createVoidPost(createData.content, createData.mood);
    soundManager.playPost();
    
    setCreateData({ content: '', mood: 'whisper' });
    setShowCreate(false);
    loadPosts();
  };

  const handleFeel = (postId: string) => {
    feelVoidPost(postId);
    soundManager.playLike();
    loadPosts();
  };

  const getMoodOption = (moodId: string) => {
    return VOID_MOODS.find(m => m.id === moodId) || VOID_MOODS[0];
  };

  return (
    <div className="max-w-2xl mx-auto min-h-screen bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur-lg border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => window.history.back()} className="p-2 hover:bg-white/10 rounded-full">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Ghost className="w-5 h-5 text-[#ff2e2e]" />
                Void Wall
              </h1>
              <p className="text-xs text-white/50">Anonymous confessions that vanish in 24h</p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowCreate(true);
              soundManager.playClick();
            }}
            className="p-2 bg-[#ff2e2e] hover:bg-[#ff2e2e]/80 rounded-full transition-colors"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mx-4 mt-4 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-white font-medium">The Void Remembers Nothing</p>
            <p className="text-white/50 text-sm">Posts disappear after 24 hours. No usernames. No traces.</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-24">
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <Ghost className="w-10 h-10 text-purple-400/50" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">The void is silent</h3>
            <p className="text-white/50 mb-6">Be the first to whisper into the darkness</p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-3 bg-[#ff2e2e] hover:bg-[#ff2e2e]/80 text-white font-medium rounded-full transition-colors"
            >
              Whisper to Void
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const mood = getMoodOption(post.mood);
              const MoodIcon = mood.icon;
              
              return (
                <div
                  key={post.id}
                  className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                  style={{ borderLeftColor: mood.color, borderLeftWidth: '3px' }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${mood.color}20` }}
                    >
                      <MoodIcon className="w-5 h-5" style={{ color: mood.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-white/80 whitespace-pre-wrap">{post.content}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleFeel(post.id)}
                        className="flex items-center gap-1.5 text-white/40 hover:text-[#ff2e2e] transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        <span className="text-sm">{post.feel_count}</span>
                      </button>
                      <span className="text-white/30 text-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(post.expires_at), { addSuffix: true })}
                      </span>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/40">
                      {mood.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowCreate(false)} />
          <div className="relative w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl p-6 animate-in zoom-in">
            <div className="flex items-center gap-3 mb-4">
              <Ghost className="w-6 h-6 text-[#ff2e2e]" />
              <h3 className="text-xl font-bold text-white">Whisper to the Void</h3>
            </div>
            
            {/* Mood Selection */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              {VOID_MOODS.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => setCreateData({ ...createData, mood: mood.id })}
                  className={`p-2 rounded-xl border transition-all ${
                    createData.mood === mood.id
                      ? 'border-[#ff2e2e] bg-[#ff2e2e]/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="text-xl">{mood.emoji}</span>
                </button>
              ))}
            </div>

            {/* Content Input */}
            <textarea
              value={createData.content}
              onChange={(e) => setCreateData({ ...createData, content: e.target.value })}
              placeholder="Pour your thoughts into the void..."
              className="w-full h-40 bg-white/10 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/40 resize-none focus:outline-none focus:border-[#ff2e2e]/50 mb-4"
              maxLength={500}
            />
            <p className="text-white/30 text-xs text-right mb-4">{createData.content.length}/500</p>

            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 mb-4">
              <p className="text-purple-400 text-sm flex items-center gap-2">
                <Ghost className="w-4 h-4" />
                Your identity remains hidden. This post will vanish in 24 hours.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePost}
                disabled={!createData.content.trim()}
                className="flex-1 py-3 bg-[#ff2e2e] hover:bg-[#ff2e2e]/80 disabled:opacity-50 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Ghost className="w-4 h-4" />
                Whisper
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoidWall;
