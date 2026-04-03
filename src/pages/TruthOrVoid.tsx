import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Eye, EyeOff, Send, RefreshCw, Users,
  Flame, HelpCircle, Zap, Sparkles, Clock
} from 'lucide-react';
import type { User } from '@/types';
import { 
  getCurrentTruthSession,
  getTruthResponses,
  createTruthSession,
  submitTruthResponse,
  type TruthSession,
  type TruthResponse
} from '@/services/demoStorage';
import { soundManager } from '@/sounds/SoundManager';
import { formatDistanceToNow } from 'date-fns';

interface TruthOrVoidProps {
  currentUser: User | null;
}

const TRUTH_TYPES = {
  confession: { emoji: '💭', label: 'Confession', color: '#9F7AEA', icon: Eye },
  question: { emoji: '❓', label: 'Question', color: '#4ECDC4', icon: HelpCircle },
  dare: { emoji: '🔥', label: 'Dare', color: '#FF6B35', icon: Flame }
};

const TruthOrVoid: React.FC<TruthOrVoidProps> = ({ currentUser }) => {
  const [session, setSession] = useState<TruthSession | null>(null);
  const [responses, setResponses] = useState<TruthResponse[]>([]);
  const [showSubmit, setShowSubmit] = useState(false);
  const [responseContent, setResponseContent] = useState('');
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSession();
    const interval = setInterval(loadSession, 10000); // Check for new session every 10s
    return () => clearInterval(interval);
  }, []);

  const loadSession = () => {
    const current = getCurrentTruthSession();
    if (current) {
      setSession(current);
      const sessionResponses = getTruthResponses(current.id);
      setResponses(sessionResponses);
    } else {
      // Create new session if none exists
      const newSession = createTruthSession();
      setSession(newSession);
      setResponses([]);
    }
  };

  const handleSubmitResponse = () => {
    if (!session || !responseContent.trim()) return;
    
    submitTruthResponse(session.id, responseContent);
    soundManager.playPost();
    
    setResponseContent('');
    setShowSubmit(false);
    loadSession();
  };

  const toggleReveal = (responseId: string) => {
    const newRevealed = new Set(revealed);
    if (newRevealed.has(responseId)) {
      newRevealed.delete(responseId);
    } else {
      newRevealed.add(responseId);
      soundManager.playClick();
    }
    setRevealed(newRevealed);
  };

  const handleRefresh = () => {
    soundManager.playClick();
    loadSession();
  };

  const getTypeInfo = (type: string) => {
    return TRUTH_TYPES[type as keyof typeof TRUTH_TYPES] || TRUTH_TYPES.confession;
  };

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#ff2e2e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const typeInfo = getTypeInfo(session.type);
  const TypeIcon = typeInfo.icon;

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
                <Sparkles className="w-5 h-5 text-[#ff2e2e]" />
                Truth or Void
              </h1>
              <p className="text-xs text-white/50">Anonymous revelations</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Current Session */}
      <div className="p-4 pb-24">
        {/* Prompt Card */}
        <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-[#ff2e2e]/20 via-purple-500/10 to-blue-500/20 border border-[#ff2e2e]/30">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${typeInfo.color}30` }}
            >
              <TypeIcon className="w-6 h-6" style={{ color: typeInfo.color }} />
            </div>
            <div>
              <span 
                className="text-sm font-medium"
                style={{ color: typeInfo.color }}
              >
                {typeInfo.emoji} {typeInfo.label}
              </span>
              <p className="text-white/50 text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Expires {formatDistanceToNow(new Date(session.expires_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">{session.prompt}</h2>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setShowSubmit(true);
                soundManager.playClick();
              }}
              className="flex-1 py-3 bg-[#ff2e2e] hover:bg-[#ff2e2e]/80 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Share Truth
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl">
              <Users className="w-4 h-4 text-white/60" />
              <span className="text-white text-sm">{session.response_count}</span>
            </div>
          </div>
        </div>

        {/* Responses */}
        <div className="space-y-3">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-white/60" />
            Anonymous Responses
          </h3>
          
          {responses.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-white/5 border border-white/10 border-dashed">
              <Sparkles className="w-10 h-10 mx-auto mb-3 text-white/30" />
              <p className="text-white/50">No truths shared yet</p>
              <p className="text-white/30 text-sm">Be the first to reveal</p>
            </div>
          ) : (
            responses.map((response) => {
              const isRevealed = revealed.has(response.id);
              
              return (
                <div
                  key={response.id}
                  onClick={() => toggleReveal(response.id)}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff2e2e]/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                      {isRevealed ? (
                        <Eye className="w-5 h-5 text-[#ff2e2e]" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-white/40" />
                      )}
                    </div>
                    <div className="flex-1">
                      {isRevealed ? (
                        <>
                          <p className="text-white whitespace-pre-wrap">{response.content}</p>
                          <p className="text-white/40 text-xs mt-2">
                            {formatDistanceToNow(new Date(response.created_at), { addSuffix: true })}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-white/40 italic">Tap to reveal this anonymous truth...</p>
                          <p className="text-white/30 text-xs mt-2 flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            Click to unveil
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Submit Modal */}
      {showSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowSubmit(false)} />
          <div className="relative w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl p-6 animate-in zoom-in">
            <h3 className="text-xl font-bold text-white mb-2">Share Your Truth</h3>
            <p className="text-white/50 text-sm mb-4">{session.prompt}</p>
            
            <textarea
              value={responseContent}
              onChange={(e) => setResponseContent(e.target.value)}
              placeholder="Pour your heart out..."
              className="w-full h-40 bg-white/10 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/40 resize-none focus:outline-none focus:border-[#ff2e2e]/50 mb-4"
              maxLength={500}
            />
            <p className="text-white/30 text-xs text-right mb-4">{responseContent.length}/500</p>

            <div className="bg-[#ff2e2e]/10 border border-[#ff2e2e]/30 rounded-xl p-4 mb-4">
              <p className="text-[#ff2e2e] text-sm flex items-center gap-2">
                <EyeOff className="w-4 h-4" />
                Your identity is completely hidden. No one will know this is you.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmit(false)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitResponse}
                disabled={!responseContent.trim()}
                className="flex-1 py-3 bg-[#ff2e2e] hover:bg-[#ff2e2e]/80 disabled:opacity-50 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Share Truth
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TruthOrVoid;
