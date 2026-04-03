import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Mail, Send, Heart, Zap, Eye, Trash2, 
  Sparkles, MessageSquare
} from 'lucide-react';
import type { User } from '@/types';
import { 
  getDemoSignals, 
  sendDemoSignal, 
  markSignalAsRead, 
  getUnreadSignalCount,
  SIGNAL_MOODS,
  type DemoSignal 
} from '@/services/demoStorage';
import { soundManager } from '@/sounds/SoundManager';
import { formatDistanceToNow } from 'date-fns';

interface SignalsProps {
  currentUser: User | null;
}

const Signals: React.FC<SignalsProps> = ({ currentUser }) => {
  const [signals, setSignals] = useState<DemoSignal[]>([]);
  const [showCompose, setShowCompose] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState<DemoSignal | null>(null);
  const [composeData, setComposeData] = useState({
    receiverId: '',
    content: '',
    mood: 'thoughtful' as DemoSignal['mood']
  });

  useEffect(() => {
    if (currentUser) {
      loadSignals();
    }
  }, [currentUser]);

  const loadSignals = () => {
    if (!currentUser) return;
    const userSignals = getDemoSignals(currentUser.id);
    setSignals(userSignals);
  };

  const handleSendSignal = () => {
    if (!composeData.content.trim()) return;
    
    // In demo mode, send to self for testing
    const receiverId = currentUser?.id || 'demo-user';
    sendDemoSignal(receiverId, composeData.content, composeData.mood);
    soundManager.playPost();
    
    setComposeData({ receiverId: '', content: '', mood: 'thoughtful' });
    setShowCompose(false);
    loadSignals();
  };

  const handleOpenSignal = (signal: DemoSignal) => {
    if (!signal.read) {
      markSignalAsRead(signal.id, currentUser?.id || 'demo-user');
      loadSignals();
    }
    setSelectedSignal(signal);
  };

  const handleDropResponse = () => {
    // Navigate to create drop with reference to signal
    soundManager.playClick();
    window.location.href = '/?response=' + selectedSignal?.id;
  };

  const unreadCount = currentUser ? getUnreadSignalCount(currentUser.id) : 0;

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
                <Mail className="w-5 h-5 text-[#ff2e2e]" />
                Signals
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-[#ff2e2e] text-white text-xs rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h1>
              <p className="text-xs text-white/50">Anonymous messages</p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowCompose(true);
              soundManager.playClick();
            }}
            className="p-2 bg-[#ff2e2e] hover:bg-[#ff2e2e]/80 rounded-full transition-colors"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-24">
        {signals.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#ff2e2e]/20 to-purple-500/20 flex items-center justify-center">
              <Mail className="w-10 h-10 text-[#ff2e2e]/50" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No signals yet</h3>
            <p className="text-white/50 mb-6">Send an anonymous signal to someone</p>
            <button
              onClick={() => setShowCompose(true)}
              className="px-6 py-3 bg-[#ff2e2e] hover:bg-[#ff2e2e]/80 text-white font-medium rounded-full transition-colors"
            >
              Send Signal
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {signals.map((signal) => {
              const mood = SIGNAL_MOODS[signal.mood];
              return (
                <button
                  key={signal.id}
                  onClick={() => handleOpenSignal(signal)}
                  className={`w-full p-4 rounded-2xl text-left transition-all ${
                    signal.read 
                      ? 'bg-white/5 hover:bg-white/10' 
                      : 'bg-[#ff2e2e]/10 border border-[#ff2e2e]/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${mood.color}20` }}
                    >
                      {mood.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span 
                          className="text-sm font-medium"
                          style={{ color: mood.color }}
                        >
                          {mood.label}
                        </span>
                        {!signal.read && (
                          <span className="w-2 h-2 bg-[#ff2e2e] rounded-full" />
                        )}
                      </div>
                      <p className="text-white/80 line-clamp-2">{signal.content}</p>
                      <p className="text-white/40 text-xs mt-2">
                        {formatDistanceToNow(new Date(signal.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowCompose(false)} />
          <div className="relative w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl p-6 animate-in zoom-in">
            <h3 className="text-xl font-bold text-white mb-4">Send Signal</h3>
            
            {/* Mood Selection */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {(Object.keys(SIGNAL_MOODS) as DemoSignal['mood'][]).map((mood) => (
                <button
                  key={mood}
                  onClick={() => setComposeData({ ...composeData, mood })}
                  className={`p-3 rounded-xl border transition-all ${
                    composeData.mood === mood
                      ? 'border-[#ff2e2e] bg-[#ff2e2e]/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="text-2xl">{SIGNAL_MOODS[mood].emoji}</span>
                  <p className="text-white text-sm mt-1">{SIGNAL_MOODS[mood].label}</p>
                </button>
              ))}
            </div>

            {/* Message Input */}
            <textarea
              value={composeData.content}
              onChange={(e) => setComposeData({ ...composeData, content: e.target.value })}
              placeholder="Write your anonymous signal..."
              className="w-full h-32 bg-white/10 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/40 resize-none focus:outline-none focus:border-[#ff2e2e]/50 mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowCompose(false)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendSignal}
                disabled={!composeData.content.trim()}
                className="flex-1 py-3 bg-[#ff2e2e] hover:bg-[#ff2e2e]/80 disabled:opacity-50 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signal Detail Modal */}
      {selectedSignal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedSignal(null)} />
          <div className="relative w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl p-6 animate-in zoom-in">
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center text-3xl"
                style={{ backgroundColor: `${SIGNAL_MOODS[selectedSignal.mood].color}20` }}
              >
                {SIGNAL_MOODS[selectedSignal.mood].emoji}
              </div>
              <div>
                <p className="text-white font-medium">{SIGNAL_MOODS[selectedSignal.mood].label}</p>
                <p className="text-white/50 text-sm">
                  {formatDistanceToNow(new Date(selectedSignal.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <p className="text-white text-lg">{selectedSignal.content}</p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
              <p className="text-yellow-400 text-sm flex items-center gap-2">
                <Eye className="w-4 h-4" />
                This is an anonymous signal. You cannot reply directly.
              </p>
            </div>

            <button
              onClick={handleDropResponse}
              className="w-full py-3 bg-[#ff2e2e] hover:bg-[#ff2e2e]/80 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Drop Response (Public)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signals;
