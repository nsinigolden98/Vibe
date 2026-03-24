import { useEffect, useState, useRef, useCallback } from 'react';
import { useVibeStore } from '@/hooks/useVibeStore';
import { BarChart3, Check, Users, Clock, ChevronUp, ChevronDown } from 'lucide-react';
import { formatTimeAgo, formatNumber } from '@/lib/utils';
import mockBackend from '@/services/mockBackend';
import type { Pulse } from '@/types';

export default function PulsePage() {
  const { pulses, settings, votePulse } = useVibeStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animatedOptions, setAnimatedOptions] = useState<Set<string>>(new Set());
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDark = settings.theme === 'dark';

  // Minimum swipe distance
  const minSwipeDistance = 50;

  useEffect(() => {
    const handlePulseUpdate = () => {
      useVibeStore.getState().refreshPulses();
    };
    mockBackend.on('pulseUpdated', handlePulseUpdate);
    return () => {
      mockBackend.off('pulseUpdated', handlePulseUpdate);
    };
  }, []);

  const handleVote = (pulseId: string, optionId: string) => {
    votePulse(pulseId, optionId);
    setAnimatedOptions(prev => new Set(prev).add(`${pulseId}-${optionId}`));
    setTimeout(() => {
      setAnimatedOptions(prev => {
        const next = new Set(prev);
        next.delete(`${pulseId}-${optionId}`);
        return next;
      });
    }, 500);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || isTransitioning) return;
    
    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > minSwipeDistance;
    const isDownSwipe = distance < -minSwipeDistance;

    if (isUpSwipe && currentIndex < pulses.length - 1) {
      goToNext();
    } else if (isDownSwipe && currentIndex > 0) {
      goToPrev();
    }
  };

  const goToNext = useCallback(() => {
    if (currentIndex < pulses.length - 1 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex(prev => prev + 1);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  }, [currentIndex, pulses.length, isTransitioning]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex(prev => prev - 1);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  }, [currentIndex, isTransitioning]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        goToPrev();
      } else if (e.key === 'ArrowDown') {
        goToNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev]);

  return (
    <div 
      ref={containerRef}
      className="h-screen overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Header - Fixed */}
      <div className={`fixed top-0 left-0 right-0 z-30 ${isDark ? 'bg-[#0a0a0a]/95' : 'bg-[#f5f5f5]/95'} backdrop-blur-xl border-b ${isDark ? 'border-white/10' : 'border-gray-200'} px-4 py-4`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Pulse</h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Swipe to explore</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {currentIndex + 1} / {pulses.length}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-20 flex gap-1">
        {pulses.map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentIndex ? 'bg-[#ff2e2e] w-6' : isDark ? 'bg-white/20' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Swipe Navigation Buttons (Desktop) */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-20 hidden lg:flex flex-col gap-2">
        <button
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-white/10' : 'bg-white'} disabled:opacity-30 shadow-lg`}
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <button
          onClick={goToNext}
          disabled={currentIndex === pulses.length - 1}
          className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-white/10' : 'bg-white'} disabled:opacity-30 shadow-lg`}
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Pulse Cards Container */}
      <div 
        className="h-full pt-20 pb-4 transition-transform duration-300 ease-out"
        style={{ transform: `translateY(-${currentIndex * 100}vh)` }}
      >
        {pulses.length === 0 ? (
          <div className={`h-full flex items-center justify-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#ff2e2e]/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <p className="text-lg font-medium mb-2">No pulses yet</p>
              <p className="text-sm">Check back later for new polls!</p>
            </div>
          </div>
        ) : (
          pulses.map((pulse, index) => (
            <div 
              key={pulse.id}
              className="h-screen w-full flex items-center justify-center p-4"
              style={{ 
                opacity: index === currentIndex ? 1 : 0.3,
                transform: index === currentIndex ? 'scale(1)' : 'scale(0.95)',
                transition: 'opacity 0.3s, transform 0.3s'
              }}
            >
              <PulseCard 
                pulse={pulse} 
                isDark={isDark}
                onVote={handleVote}
                animatedOptions={animatedOptions}
              />
            </div>
          ))
        )}
      </div>

      {/* Swipe Hint */}
      <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-20 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        Swipe up/down or use arrow keys
      </div>
    </div>
  );
}

interface PulseCardProps {
  pulse: Pulse;
  isDark: boolean;
  onVote: (pulseId: string, optionId: string) => void;
  animatedOptions: Set<string>;
}

function PulseCard({ pulse, isDark, onVote, animatedOptions }: PulseCardProps) {
  // Calculate time remaining
  const expiryTime = new Date(pulse.createdAt.getTime() + 24 * 60 * 60 * 1000);
  const timeLeft = Math.max(0, expiryTime.getTime() - Date.now());
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));

  return (
    <div 
      className={`w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 rounded-3xl ${isDark ? 'bg-white/5' : 'bg-white'} border ${isDark ? 'border-white/10' : 'border-gray-200'} shadow-2xl`}
    >
      {/* Author Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${pulse.author.avatar.gradient} flex items-center justify-center`}>
          <span className="text-white font-bold">{pulse.author.avatar.initial}</span>
        </div>
        <div className="flex-1">
          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {pulse.author.username}
          </p>
          <p className="text-xs text-gray-500">
            {formatTimeAgo(pulse.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <Clock className="w-3 h-3" />
          <span className="text-xs">{hoursLeft}h left</span>
        </div>
      </div>

      {/* Question */}
      <div className="flex items-start gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-[#ff2e2e]/20 flex items-center justify-center flex-shrink-0">
          <BarChart3 className="w-6 h-6 text-[#ff2e2e]" />
        </div>
        <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} leading-tight`}>
          {pulse.question}
        </h3>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {pulse.options.map((option, idx) => {
          const isSelected = pulse.userVote === option.id;
          const hasVoted = pulse.hasVoted || false;
          const isAnimated = animatedOptions.has(`${pulse.id}-${option.id}`);
          
          return (
            <button
              key={option.id}
              onClick={() => onVote(pulse.id, option.id)}
              className={`w-full relative overflow-hidden rounded-xl transition-all ${
                isAnimated ? 'scale-[1.02]' : ''
              }`}
            >
              {/* Progress Bar Background */}
              {hasVoted && (
                <div className="absolute inset-0">
                  <div 
                    className={`h-full ${isSelected ? 'bg-[#ff2e2e]/20' : isDark ? 'bg-white/5' : 'bg-gray-100'}`}
                  >
                    <div 
                      className={`h-full ${isSelected ? 'bg-[#ff2e2e]/30' : isDark ? 'bg-white/10' : 'bg-gray-200'} transition-all duration-500`}
                      style={{ width: `${option.percentage}%` }}
                    />
                  </div>
                </div>
              )}
              
              {/* Option Image (if exists) */}
              {option.imageUrl && (
                <div className="relative h-32 w-full">
                  <img 
                    src={option.imageUrl} 
                    alt={option.text} 
                    className="w-full h-full object-cover rounded-t-xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              )}
              
              {/* Content */}
              <div className={`relative flex items-center justify-between p-4 border-2 rounded-xl transition-all ${
                isSelected 
                  ? 'border-[#ff2e2e]' 
                  : isDark ? 'border-white/10 hover:border-white/30' : 'border-gray-200 hover:border-gray-300'
              } ${!hasVoted && isDark ? 'bg-white/5 hover:bg-white/10' : !hasVoted ? 'bg-gray-50 hover:bg-gray-100' : ''} ${option.imageUrl ? 'rounded-t-none border-t-0' : ''}`}>
                <div className="flex items-center gap-3">
                  {/* Option Number */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isSelected 
                      ? 'bg-[#ff2e2e] text-white' 
                      : isDark ? 'bg-white/10 text-gray-400' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  
                  {hasVoted && isSelected && (
                    <div className="w-6 h-6 rounded-full bg-[#ff2e2e] flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {option.text}
                  </span>
                </div>
                
                {hasVoted && (
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${isSelected ? 'text-[#ff2e2e]' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {option.percentage}%
                    </span>
                  </div>
                )}
              </div>
              
              {/* Vote count below */}
              {hasVoted && (
                <div className={`text-right text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {formatNumber(option.votes)} votes
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-dashed border-gray-500/30">
        <div className="flex items-center gap-2 text-gray-500">
          <Users className="w-4 h-4" />
          <span className="text-sm">{formatNumber(pulse.totalVotes)} votes</span>
        </div>
        {pulse.hasVoted && (
          <span className="text-sm text-[#ff2e2e] font-medium">You voted! Tap to change</span>
        )}
      </div>
    </div>
  );
}
