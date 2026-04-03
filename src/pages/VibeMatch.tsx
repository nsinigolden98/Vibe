import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Zap, Heart, X, MessageCircle, Clock,
  Sparkles, Users, Radio, Wind, Flame, Droplets
} from 'lucide-react';
import type { User } from '@/types';
import { 
  getActiveMatch,
  createDemoMatch,
  endMatch,
  type VibeMatch
} from '@/services/demoStorage';
import { soundManager } from '@/sounds/SoundManager';
import { formatDistanceToNow } from 'date-fns';

interface VibeMatchProps {
  currentUser: User | null;
}

const MOOD_OPTIONS = [
  { id: 'chill', name: 'Chill', emoji: '🌊', color: '#4ECDC4', icon: Droplets },
  { id: 'deep', name: 'Deep', emoji: '🌙', color: '#6B7FD7', icon: Wind },
  { id: 'wild', name: 'Wild', emoji: '🔥', color: '#FF6B35', icon: Flame },
  { id: 'random', name: 'Random', emoji: '✨', color: '#9F7AEA', icon: Sparkles }
];

const FAKE_MESSAGES = [
  { text: "Hey, what's your vibe today?", delay: 2000 },
  { text: "Just vibing, you know?", delay: 5000 },
  { text: "Same here. This platform is pretty cool", delay: 8000 },
  { text: "Yeah, I love the anonymity", delay: 12000 }
];

const VibeMatchPage: React.FC<VibeMatchProps> = ({ currentUser }) => {
  const [match, setMatch] = useState<VibeMatch | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ text: string; isMe: boolean; time: Date }>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const active = getActiveMatch(currentUser.id);
      if (active) {
        setMatch(active);
        startFakeConversation();
      }
    }
  }, [currentUser]);

  const startFakeConversation = () => {
    FAKE_MESSAGES.forEach((msg, i) => {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          text: msg.text,
          isMe: i % 2 === 1,
          time: new Date()
        }]);
        if (i % 2 === 0) {
          soundManager.playNotification();
        }
      }, msg.delay);
    });
  };

  const handleStartMatch = () => {
    if (!selectedMood || !currentUser) return;
    
    setIsSearching(true);
    soundManager.playClick();
    
    // Simulate finding a match
    setTimeout(() => {
      const newMatch = createDemoMatch(currentUser.id, selectedMood);
      if (newMatch) {
        setMatch(newMatch);
        setIsSearching(false);
        soundManager.playPost();
        startFakeConversation();
      }
    }, 3000);
  };

  const handleEndMatch = () => {
    if (match) {
      endMatch(match.id);
      setMatch(null);
      setMessages([]);
      setShowEndConfirm(false);
      soundManager.playClick();
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    setMessages(prev => [...prev, {
      text: inputMessage,
      isMe: true,
      time: new Date()
    }]);
    soundManager.playEcho();
    setInputMessage('');

    // Simulate reply
    setTimeout(() => {
      const replies = ["Interesting...", "I feel that", "Same vibe", "Tell me more", "👀"];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      setMessages(prev => [...prev, {
        text: randomReply,
        isMe: false,
        time: new Date()
      }]);
      soundManager.playMessage();
    }, 2000 + Math.random() * 3000);
  };

  const getMoodOption = (moodId: string) => {
    return MOOD_OPTIONS.find(m => m.id === moodId) || MOOD_OPTIONS[0];
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
                <Zap className="w-5 h-5 text-[#ff2e2e]" />
                Vibe Match
              </h1>
              <p className="text-xs text-white/50">Connect with similar souls</p>
            </div>
          </div>
          {match && (
            <button
              onClick={() => setShowEndConfirm(true)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="pb-24">
        {!match ? (
          <div className="p-4">
            {isSearching ? (
              /* Searching State */
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative mb-8">
                  <div className="w-24 h-24 rounded-full bg-[#ff2e2e]/20 flex items-center justify-center animate-pulse">
                    <Radio className="w-10 h-10 text-[#ff2e2e]" />
                  </div>
                  <div className="absolute inset-0 w-24 h-24 rounded-full border-2 border-[#ff2e2e]/50 animate-ping" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Scanning the Vibe Pool...</h3>
                <p className="text-white/50 text-center max-w-xs">
                  Looking for someone who matches your {selectedMood && getMoodOption(selectedMood).name} energy
                </p>
                <button
                  onClick={() => setIsSearching(false)}
                  className="mt-8 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              /* Mood Selection */
              <>
                <div className="text-center py-8">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#ff2e2e]/20 to-purple-500/20 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-[#ff2e2e]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">What's Your Vibe?</h3>
                  <p className="text-white/50">Choose your energy to find your match</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  {MOOD_OPTIONS.map((mood) => {
                    const MoodIcon = mood.icon;
                    return (
                      <button
                        key={mood.id}
                        onClick={() => setSelectedMood(mood.id)}
                        className={`p-5 rounded-2xl border transition-all ${
                          selectedMood === mood.id
                            ? 'border-[#ff2e2e] bg-[#ff2e2e]/10'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center mb-3 mx-auto"
                          style={{ backgroundColor: `${mood.color}30` }}
                        >
                          <MoodIcon className="w-6 h-6" style={{ color: mood.color }} />
                        </div>
                        <p className="text-white font-medium">{mood.name}</p>
                        <p className="text-2xl mt-1">{mood.emoji}</p>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleStartMatch}
                  disabled={!selectedMood}
                  className="w-full py-4 bg-[#ff2e2e] hover:bg-[#ff2e2e]/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  Find My Vibe Match
                </button>

                <div className="mt-6 p-4 bg-white/5 rounded-xl">
                  <p className="text-white/50 text-sm text-center flex items-center justify-center gap-2">
                    <Users className="w-4 h-4" />
                    {Math.floor(Math.random() * 500 + 1000)} users vibing right now
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          /* Active Match Chat */
          <div className="flex flex-col h-[calc(100vh-180px)]">
            {/* Match Info */}
            <div className="px-4 py-3 bg-white/5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff2e2e] to-purple-500 flex items-center justify-center">
                  <span className="text-white text-lg">?</span>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Anonymous Vibe</p>
                  <p className="text-white/50 text-sm flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    Matched on {getMoodOption(match.mood).name}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-white/40 text-sm">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(match.expires_at), { addSuffix: true })}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="text-center py-4">
                <span className="px-4 py-2 bg-white/5 rounded-full text-white/40 text-sm">
                  Vibe Match Started
                </span>
              </div>
              
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                      msg.isMe
                        ? 'bg-[#ff2e2e] text-white rounded-br-md'
                        : 'bg-white/10 text-white rounded-bl-md'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.isMe ? 'text-white/60' : 'text-white/40'}`}>
                      {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Send a message..."
                  className="flex-1 bg-white/10 border border-white/10 rounded-full px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#ff2e2e]/50"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="p-3 bg-[#ff2e2e] hover:bg-[#ff2e2e]/80 disabled:opacity-50 text-white rounded-full transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* End Match Confirmation */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowEndConfirm(false)} />
          <div className="relative w-full max-w-sm bg-gray-900 border border-white/10 rounded-2xl p-6 animate-in zoom-in">
            <h3 className="text-xl font-bold text-white mb-2">End Vibe Match?</h3>
            <p className="text-white/50 mb-6">
              This connection will be lost forever. You'll never match with this soul again.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
              >
                Keep Vibing
              </button>
              <button
                onClick={handleEndMatch}
                className="flex-1 py-3 bg-[#ff2e2e] hover:bg-[#ff2e2e]/80 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                End Match
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VibeMatchPage;
