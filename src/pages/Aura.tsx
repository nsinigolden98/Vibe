import React, { useState, useEffect } from 'react';
import { Loader2, Settings, Crown, Zap, Flame, Award, Users, UserPlus, LogOut, Edit3, Palette, Volume2, VolumeX } from 'lucide-react';
import type { User, Drop, Badge } from '@/types';
import { getUserDrops, getVibing, getVibers, getUserBadges, updateUserProfile, signOut } from '@/services/supabaseClient';
import { soundManager } from '@/sounds/SoundManager';
import DropCard from '@/components/DropCard';
import Modal from '@/components/Modal';
import PremiumModal from '@/components/PremiumModal';
import { useNavigate } from 'react-router-dom';

interface AuraProps {
  currentUser: User | null;
  onUpdate: () => void;
}

const Aura: React.FC<AuraProps> = ({ currentUser, onUpdate }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'drops' | 'vibing' | 'vibers' | 'badges'>('drops');
  const [drops, setDrops] = useState<Drop[]>([]);
  const [vibing, setVibing] = useState<User[]>([]);
  const [vibers, setVibers] = useState<User[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedDrop, setSelectedDrop] = useState<Drop | null>(null);
  const [showEchoModal, setShowEchoModal] = useState(false);

  const gradients = [
    'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-purple-500',
    'from-rose-500 to-orange-500',
    'from-teal-500 to-blue-500',
    'from-yellow-500 to-green-500',
    'from-pink-500 to-rose-500',
    'from-cyan-500 to-blue-500'
  ];

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser, activeTab]);

  const loadData = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      switch (activeTab) {
        case 'drops':
          const userDrops = await getUserDrops(currentUser.id);
          setDrops(userDrops);
          break;
        case 'vibing':
          const vibingList = await getVibing(currentUser.id);
          setVibing(vibingList);
          break;
        case 'vibers':
          const vibersList = await getVibers(currentUser.id);
          setVibers(vibersList);
          break;
        case 'badges':
          const userBadges = await getUserBadges(currentUser.id);
          setBadges(userBadges);
          break;
      }
    } catch (error) {
      console.error('Error loading aura data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGradientSelect = async (gradient: string) => {
    if (!currentUser) return;
    
    const avatar = JSON.stringify({
      initial: currentUser.username.charAt(0).toUpperCase(),
      symbol: '◆',
      gradient
    });
    
    await updateUserProfile(currentUser.id, { avatar });
    onUpdate();
    soundManager.playClick();
  };

  const handleSoundToggle = async () => {
    if (!currentUser) return;
    
    if (!currentUser.premium && currentUser.sound_enabled) {
      setShowPremiumModal(true);
      return;
    }
    
    const newValue = !currentUser.sound_enabled;
    await updateUserProfile(currentUser.id, { sound_enabled: newValue });
    soundManager.setEnabled(newValue);
    onUpdate();
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const parseAvatar = (avatarStr: string) => {
    try {
      return JSON.parse(avatarStr);
    } catch {
      return { initial: '?', symbol: '◆', gradient: 'from-gray-500 to-gray-600' };
    }
  };

  const avatar = currentUser ? parseAvatar(currentUser.avatar) : null;

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-white/50">Please sign in to view your aura</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Profile Header */}
      <div className="relative">
        {/* Background */}
        <div className={`h-32 bg-gradient-to-r ${avatar?.gradient || 'from-gray-600 to-gray-800'}`} />
        
        {/* Avatar & Info */}
        <div className="px-4 pb-4">
          <div className="relative -mt-12 mb-3">
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${avatar?.gradient || 'from-gray-500 to-gray-600'} flex items-center justify-center border-4 border-gray-900`}>
              <span className="text-white font-bold text-2xl">{avatar?.initial}</span>
              <span className="absolute -bottom-1 -right-1 text-xl">{avatar?.symbol}</span>
            </div>
            {currentUser.premium && (
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center border-4 border-gray-900">
                <Crown className="w-4 h-4 text-gray-900" />
              </div>
            )}
          </div>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                {currentUser.username}
                {currentUser.premium && (
                  <span className="text-xs px-2 py-0.5 bg-yellow-400/20 text-yellow-400 rounded-full">
                    PREMIUM
                  </span>
                )}
              </h1>
              <p className="text-white/50">Level {currentUser.level} • {currentUser.xp} XP</p>
            </div>
            <button
              onClick={() => {
                setShowSettings(true);
                soundManager.playClick();
              }}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <Settings className="w-5 h-5 text-white/50" />
            </button>
          </div>
          
          {/* Stats */}
          <div className="flex gap-6 mt-4">
            <div className="text-center">
              <p className="text-lg font-bold text-white">{drops.length}</p>
              <p className="text-xs text-white/50">Drops</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">{vibing.length}</p>
              <p className="text-xs text-white/50">Vibing</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">{vibers.length}</p>
              <p className="text-xs text-white/50">Vibers</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">{currentUser.streak}</p>
              <p className="text-xs text-white/50">Streak</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur-lg border-b border-white/10 px-4">
        <div className="flex gap-6">
          {(['drops', 'vibing', 'vibers', 'badges'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                soundManager.playClick();
              }}
              className={`relative py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab ? 'text-white' : 'text-white/50'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff2e2e] rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-24 lg:pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#ff2e2e] animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'drops' && (
              drops.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-white/50">No drops yet</p>
                </div>
              ) : (
                drops.map((drop) => (
                  <DropCard
                    key={drop.id}
                    drop={drop}
                    currentUser={currentUser}
                    onEcho={(d) => {
                      setSelectedDrop(d);
                      setShowEchoModal(true);
                    }}
                    onFlow={() => {}}
                    onVibe={() => {}}
                    onView={() => {}}
                  />
                ))
              )
            )}

            {activeTab === 'vibing' && (
              vibing.length === 0 ? (
                <div className="text-center py-12">
                  <UserPlus className="w-12 h-12 mx-auto text-white/30 mb-3" />
                  <p className="text-white/50">Not vibing with anyone yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {vibing.map((user) => {
                    const userAvatar = parseAvatar(user.avatar);
                    return (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
                      >
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${userAvatar.gradient} flex items-center justify-center`}>
                          <span className="text-white font-bold">{userAvatar.initial}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white">{user.username}</p>
                          <p className="text-xs text-white/50">Level {user.level}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {activeTab === 'vibers' && (
              vibers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-white/30 mb-3" />
                  <p className="text-white/50">No vibers yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {vibers.map((user) => {
                    const userAvatar = parseAvatar(user.avatar);
                    return (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
                      >
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${userAvatar.gradient} flex items-center justify-center`}>
                          <span className="text-white font-bold">{userAvatar.initial}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white">{user.username}</p>
                          <p className="text-xs text-white/50">Level {user.level}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {activeTab === 'badges' && (
              badges.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="w-12 h-12 mx-auto text-white/30 mb-3" />
                  <p className="text-white/50">No badges yet</p>
                  <p className="text-white/30 text-sm mt-1">Keep engaging to earn badges!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {badges.map((badge) => (
                    <div
                      key={badge.id}
                      className="p-4 bg-white/5 rounded-xl text-center"
                    >
                      <div className="text-3xl mb-2">{badge.badge?.icon || '🏆'}</div>
                      <p className="font-medium text-white text-sm">{badge.badge?.name}</p>
                      <p className="text-xs text-white/50">{badge.badge?.description}</p>
                    </div>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>

      {/* Settings Modal */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Settings"
      >
        <div className="space-y-6">
          {/* Avatar Customization */}
          <div>
            <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Aura Color
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {gradients.map((gradient) => (
                <button
                  key={gradient}
                  onClick={() => handleGradientSelect(gradient)}
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} ${
                    avatar?.gradient === gradient ? 'ring-2 ring-white' : ''
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Sound Settings */}
          <div>
            <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              {currentUser.sound_enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              Sound
              {!currentUser.premium && (
                <span className="text-xs px-2 py-0.5 bg-yellow-400/20 text-yellow-400 rounded-full ml-auto">
                  PREMIUM
                </span>
              )}
            </h3>
            <button
              onClick={handleSoundToggle}
              className={`flex items-center justify-between w-full p-3 rounded-xl transition-colors ${
                currentUser.sound_enabled ? 'bg-[#ff2e2e]/20' : 'bg-white/5'
              }`}
            >
              <span className="text-white">Sound Effects</span>
              <div className={`w-12 h-6 rounded-full transition-colors ${
                currentUser.sound_enabled ? 'bg-[#ff2e2e]' : 'bg-white/20'
              }`}>
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  currentUser.sound_enabled ? 'translate-x-6' : 'translate-x-0.5'
                } mt-0.5`} />
              </div>
            </button>
          </div>

          {/* Premium CTA */}
          {!currentUser.premium && (
            <button
              onClick={() => {
                setShowSettings(false);
                setShowPremiumModal(true);
              }}
              className="w-full p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl"
            >
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold text-white">Upgrade to Premium</span>
              </div>
              <p className="text-xs text-white/60">Unlock exclusive features</p>
            </button>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-red-400 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </Modal>

      {/* Premium Modal */}
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        currentUser={currentUser}
        onUpgrade={() => {
          onUpdate();
          setShowPremiumModal(false);
        }}
      />
    </div>
  );
};

export default Aura;
