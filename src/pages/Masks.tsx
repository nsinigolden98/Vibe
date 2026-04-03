import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Plus, Sparkles, Clock, User as UserIcon, Power,
  Trash2, AlertCircle
} from 'lucide-react';
import type { User as UserType } from '@/types';
import { 
  getDemoMasks, 
  getActiveMask,
  createDemoMask, 
  activateMask,
  deactivateMask,
  type DemoMask 
} from '@/services/demoStorage';
import { soundManager } from '@/sounds/SoundManager';
import { formatDistanceToNow } from 'date-fns';

interface MasksProps {
  currentUser: UserType | null;
}

const VIBE_OPTIONS = [
  { id: 'mysterious', name: 'Mysterious', emoji: '🌑', color: '#4A5568' },
  { id: 'playful', name: 'Playful', emoji: '🎭', color: '#F6AD55' },
  { id: 'rebel', name: 'Rebel', emoji: '⚡', color: '#FF6B35' },
  { id: 'dreamer', name: 'Dreamer', emoji: '✨', color: '#9F7AEA' },
  { id: 'shadow', name: 'Shadow', emoji: '🌙', color: '#2D3748' },
  { id: 'chaos', name: 'Chaos', emoji: '🔥', color: '#E53E3E' }
];

const DURATION_OPTIONS = [
  { value: 1, label: '1 Hour', icon: Clock },
  { value: 24, label: '24 Hours', icon: Clock },
  { value: null, label: 'Manual', icon: User }
];

const Masks: React.FC<MasksProps> = ({ currentUser }) => {
  const [masks, setMasks] = useState<DemoMask[]>([]);
  const [activeMask, setActiveMask] = useState<DemoMask | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createData, setCreateData] = useState({
    name: '',
    vibe: 'mysterious',
    duration: null as number | null
  });

  useEffect(() => {
    loadMasks();
  }, []);

  const loadMasks = () => {
    const userMasks = getDemoMasks();
    const current = getActiveMask();
    setMasks(userMasks);
    setActiveMask(current);
  };

  const handleCreateMask = () => {
    if (!createData.name.trim()) return;
    
    createDemoMask(createData.name, createData.vibe, createData.duration || undefined);
    soundManager.playPost();
    
    setCreateData({ name: '', vibe: 'mysterious', duration: null });
    setShowCreate(false);
    loadMasks();
  };

  const handleActivate = (maskId: string) => {
    activateMask(maskId);
    soundManager.playClick();
    loadMasks();
  };

  const handleDeactivate = () => {
    deactivateMask();
    soundManager.playClick();
    loadMasks();
  };

  const getVibeOption = (vibeId: string) => {
    return VIBE_OPTIONS.find(v => v.id === vibeId) || VIBE_OPTIONS[0];
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
                <Sparkles className="w-5 h-5 text-[#ff2e2e]" />
                Masks
              </h1>
              <p className="text-xs text-white/50">Temporary identities</p>
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

      {/* Active Mask Banner */}
      {activeMask && (
        <div className="mx-4 mt-4 p-4 bg-gradient-to-r from-[#ff2e2e]/20 to-purple-500/20 border border-[#ff2e2e]/30 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#ff2e2e] to-purple-500 flex items-center justify-center text-2xl font-bold text-white">
              {JSON.parse(activeMask.avatar).initial}
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold">{activeMask.name}</p>
              <p className="text-white/60 text-sm flex items-center gap-1">
                <Power className="w-3 h-3 text-green-400" />
                Active Now
                {activeMask.expires_at && (
                  <span className="ml-2">
                    • Expires {formatDistanceToNow(new Date(activeMask.expires_at), { addSuffix: true })}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={handleDeactivate}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-full transition-colors"
            >
              Deactivate
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4 pb-24">
        {masks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#ff2e2e]/20 to-purple-500/20 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-[#ff2e2e]/50" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No masks yet</h3>
            <p className="text-white/50 mb-6">Create a temporary identity for anonymous expression</p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-3 bg-[#ff2e2e] hover:bg-[#ff2e2e]/80 text-white font-medium rounded-full transition-colors"
            >
              Create Mask
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {masks.map((mask) => {
              const vibe = getVibeOption(mask.vibe);
              const avatar = JSON.parse(mask.avatar);
              const isActive = activeMask?.id === mask.id;
              
              return (
                <div
                  key={mask.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isActive 
                      ? 'bg-[#ff2e2e]/10 border-[#ff2e2e]/30' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white"
                      style={{ background: `linear-gradient(135deg, ${vibe.color}80, ${vibe.color}40)` }}
                    >
                      {avatar.initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-semibold">{mask.name}</p>
                        <span className="text-lg">{vibe.emoji}</span>
                      </div>
                      <p className="text-white/50 text-sm">{vibe.name}</p>
                      {mask.expires_at && (
                        <p className="text-white/40 text-xs mt-1">
                          Expires {formatDistanceToNow(new Date(mask.expires_at), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => isActive ? handleDeactivate() : handleActivate(mask.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[#ff2e2e] text-white'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {isActive ? 'Active' : 'Activate'}
                    </button>
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
            <h3 className="text-xl font-bold text-white mb-4">Create New Mask</h3>
            
            {/* Name Input */}
            <div className="mb-4">
              <label className="text-white/60 text-sm mb-2 block">Mask Name</label>
              <input
                type="text"
                value={createData.name}
                onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                placeholder="Enter a mysterious name..."
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#ff2e2e]/50"
                maxLength={20}
              />
            </div>

            {/* Vibe Selection */}
            <div className="mb-4">
              <label className="text-white/60 text-sm mb-2 block">Choose Vibe</label>
              <div className="grid grid-cols-3 gap-2">
                {VIBE_OPTIONS.map((vibe) => (
                  <button
                    key={vibe.id}
                    onClick={() => setCreateData({ ...createData, vibe: vibe.id })}
                    className={`p-3 rounded-xl border transition-all ${
                      createData.vibe === vibe.id
                        ? 'border-[#ff2e2e] bg-[#ff2e2e]/10'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-2xl">{vibe.emoji}</span>
                    <p className="text-white text-xs mt-1">{vibe.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Selection */}
            <div className="mb-6">
              <label className="text-white/60 text-sm mb-2 block">Duration</label>
              <div className="flex gap-2">
                {DURATION_OPTIONS.map((option) => (
                  <button
                    key={option.label}
                    onClick={() => setCreateData({ ...createData, duration: option.value })}
                    className={`flex-1 p-3 rounded-xl border transition-all ${
                      createData.duration === option.value
                        ? 'border-[#ff2e2e] bg-[#ff2e2e]/10'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <option.icon className="w-4 h-4 mx-auto mb-1 text-white/60" />
                    <p className="text-white text-xs">{option.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMask}
                disabled={!createData.name.trim()}
                className="flex-1 py-3 bg-[#ff2e2e] hover:bg-[#ff2e2e]/80 disabled:opacity-50 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Masks;
