import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, Sparkles, TrendingUp } from 'lucide-react';
import type { Drop, User } from '@/types';
import { getDrops, getFeedDrops } from '@/services/supabaseClient';
import DropCard from '@/components/DropCard';
import EchoModal from '@/components/EchoModal';
import { soundManager } from '@/sounds/SoundManager';

interface StreamProps {
  currentUser: User | null;
}

const Stream: React.FC<StreamProps> = ({ currentUser }) => {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedDrop, setSelectedDrop] = useState<Drop | null>(null);
  const [showEchoModal, setShowEchoModal] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState<'for-you' | 'trending'>('for-you');
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const loadDrops = useCallback(async (reset = false) => {
    if (reset) {
      setLoading(true);
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
    } catch (error) {
      console.error('Error loading drops:', error);
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
    // Share functionality
    if (navigator.share) {
      navigator.share({
        title: 'VIBE Drop',
        text: drop.content,
        url: `${window.location.origin}/drop/${drop.id}`
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/drop/${drop.id}`);
      alert('Link copied to clipboard!');
    }
  };

  const handleVibe = () => {
    // Refresh drops to show updated vibe status
    loadDrops(true);
  };

  const handleView = (drop: Drop) => {
    // Navigate to drop detail
    console.log('View drop:', drop.id);
  };

  if (loading && drops.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-[#ff2e2e] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
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

      {/* Drops List */}
      <div className="p-4 pb-24 lg:pb-4">
        {drops.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white/30" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No drops yet</h3>
            <p className="text-white/50">Be the first to drop something!</p>
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
    </div>
  );
};

export default Stream;
