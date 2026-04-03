import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, Sparkles, TrendingUp, Droplets } from 'lucide-react';
import type { Drop, User } from '@/types';
import { getDrops, getFeedDrops } from '@/services/supabaseClient';
import DropCard from '@/components/DropCard';
import EchoModal from '@/components/EchoModal';
import ShareCard from '@/components/ShareCard';
import { soundManager } from '@/sounds/SoundManager';

interface StreamProps {
  currentUser: User | null;
}

// Loading Skeleton Component
const DropSkeleton: React.FC = () => (
  <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 mb-4 animate-pulse">
    <div className="flex items-start gap-3 mb-3">
      <div className="w-10 h-10 rounded-full bg-white/10" />
      <div className="flex-1">
        <div className="h-4 w-24 bg-white/10 rounded mb-2" />
        <div className="h-3 w-16 bg-white/10 rounded" />
      </div>
    </div>
    <div className="space-y-2 mb-3">
      <div className="h-4 w-full bg-white/10 rounded" />
      <div className="h-4 w-3/4 bg-white/10 rounded" />
    </div>
    <div className="flex items-center gap-4">
      <div className="h-8 w-16 bg-white/10 rounded-full" />
      <div className="h-8 w-16 bg-white/10 rounded-full" />
      <div className="h-8 w-16 bg-white/10 rounded-full" />
    </div>
  </div>
);

const Stream: React.FC<StreamProps> = ({ currentUser }) => {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedDrop, setSelectedDrop] = useState<Drop | null>(null);
  const [showEchoModal, setShowEchoModal] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [shareDrop, setShareDrop] = useState<Drop | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState<'for-you' | 'trending'>('for-you');
  const [error, setError] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const loadDrops = useCallback(async (reset = false) => {
    if (reset) {
      setLoading(true);
      setError(null);
      setOffset(0);
    } else {
      setLoadingMore(true);
    }

    try {
      let newDrops: Drop[];
      
      if (activeTab === 'for-you' && currentUser) {
        newDrops = await getFeedDrops(currentUser.id, 20);
      } else {
        newDrops = await getDrops(20, reset ? 0 : offset);
      }

      if (reset) {
        setDrops(newDrops);
      } else {
        setDrops(prev => [...prev, ...newDrops]);
      }

      setHasMore(newDrops.length === 20);
      setOffset(prev => reset ? 20 : prev + 20);
    } catch (err: any) {
      console.error('Error loading drops:', err);
      setError('Failed to load drops. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeTab, currentUser, offset]);

  useEffect(() => {
    loadDrops(true);
  }, [activeTab]);

  useEffect(() => {
    // Set up intersection observer for infinite scroll
    if (loadMoreRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !loadingMore) {
            loadDrops();
          }
        },
        { threshold: 0.5 }
      );
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadingMore, loadDrops]);

  const handleEcho = (drop: Drop) => {
    setSelectedDrop(drop);
    setShowEchoModal(true);
  };

  const handleFlow = (drop: Drop) => {
    // Open share card modal
    setShareDrop(drop);
    setShowShareCard(true);
    soundManager.playFlow();
  };

  const handleVibe = () => {
    // Refresh drops to show updated vibe status
    loadDrops(true);
  };

  const handleView = (drop: Drop) => {
    // Navigate to drop detail
    console.log('View drop:', drop.id);
  };

  // Toast notification
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Loading skeletons
  if (loading && drops.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur-lg border-b border-white/10 px-4 py-3">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#ff2e2e]" />
            Stream
          </h1>
        </div>
        {/* Skeletons */}
        <div className="p-4 pb-24 lg:pb-4">
          <DropSkeleton />
          <DropSkeleton />
          <DropSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-gray-800 border border-white/10 rounded-full shadow-lg animate-in fade-in slide-in-from-top">
          <p className="text-sm text-white">{toast}</p>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur-lg border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#ff2e2e]" />
            Stream
          </h1>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-4">
          <button
            onClick={() => {
              setActiveTab('for-you');
              soundManager.playClick();
            }}
            className={`relative pb-2 text-sm font-medium transition-colors ${
              activeTab === 'for-you' ? 'text-white' : 'text-white/50'
            }`}
          >
            For You
            {activeTab === 'for-you' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff2e2e] rounded-full" />
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('trending');
              soundManager.playClick();
            }}
            className={`relative pb-2 text-sm font-medium transition-colors ${
              activeTab === 'trending' ? 'text-white' : 'text-white/50'
            }`}
          >
            <span className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              WAVE
            </span>
            {activeTab === 'trending' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff2e2e] rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <p className="text-red-400 text-sm text-center">{error}</p>
          <button 
            onClick={() => loadDrops(true)}
            className="mt-2 w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Drops List */}
      <div className="p-4 pb-24 lg:pb-4">
        {drops.length === 0 && !loading ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#ff2e2e]/20 to-purple-500/20 flex items-center justify-center">
              <Droplets className="w-10 h-10 text-[#ff2e2e]/50" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No drops yet</h3>
            <p className="text-white/50 mb-6 max-w-xs mx-auto">
              Be the first to share your vibe with the community!
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-white/40">
              <span className="w-2 h-2 bg-[#ff2e2e] rounded-full animate-pulse" />
              Tap the + button to create your first drop
            </div>
          </div>
        ) : (
          <>
            {drops.map((drop) => (
              <DropCard
                key={drop.id}
                drop={drop}
                currentUser={currentUser}
                onEcho={handleEcho}
                onFlow={handleFlow}
                onVibe={handleVibe}
                onView={handleView}
              />
            ))}
            
            {/* Load More Trigger */}
            <div ref={loadMoreRef} className="py-4 flex justify-center">
              {loadingMore && (
                <Loader2 className="w-6 h-6 text-[#ff2e2e] animate-spin" />
              )}
              {!hasMore && drops.length > 0 && (
                <p className="text-white/30 text-sm">You've reached the end</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Echo Modal */}
      <EchoModal
        isOpen={showEchoModal}
        onClose={() => {
          setShowEchoModal(false);
          setSelectedDrop(null);
        }}
        drop={selectedDrop}
        currentUser={currentUser}
      />

      {/* Share Card Modal */}
      <ShareCard
        drop={shareDrop}
        isOpen={showShareCard}
        onClose={() => {
          setShowShareCard(false);
          setShareDrop(null);
        }}
      />
    </div>
  );
};

export default Stream;
