import React, { useState } from 'react';
import { 
  X, User, Search, Bookmark, Mail, Sparkles, 
  Ghost, Flame, Heart, Settings, Crown, Zap,
  LogOut, ChevronRight
} from 'lucide-react';
import type { User as UserType } from '@/types';
import { soundManager } from '@/sounds/SoundManager';
import { useNavigate } from 'react-router-dom';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType | null;
  onLogout: () => void;
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: number;
  premium?: boolean;
  new?: boolean;
}

const SideDrawer: React.FC<SideDrawerProps> = ({ isOpen, onClose, currentUser, onLogout }) => {
  const navigate = useNavigate();
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const parseAvatar = (avatarStr: string) => {
    try {
      return JSON.parse(avatarStr);
    } catch {
      return { initial: '?', symbol: '◆', gradient: 'from-gray-500 to-gray-600' };
    }
  };

  const avatar = currentUser ? parseAvatar(currentUser.avatar) : null;

  const mainMenuItems: MenuItem[] = [
    { icon: User, label: 'Aura', path: '/aura' },
    { icon: Search, label: 'Discover', path: '/discover' },
    { icon: Bookmark, label: 'Saved Drops', path: '/saved' },
  ];

  const newFeatures: MenuItem[] = [
    { icon: Mail, label: 'Signals', path: '/signals', badge: 3, new: true },
    { icon: Sparkles, label: 'Masks', path: '/masks', new: true },
    { icon: Ghost, label: 'Void Wall', path: '/void', new: true },
    { icon: Heart, label: 'Vibe Match', path: '/match', new: true },
    { icon: Flame, label: 'Truth or Void', path: '/truth', new: true },
  ];

  const handleNavigate = (path: string, premium?: boolean) => {
    soundManager.playClick();
    if (premium && !currentUser?.premium) {
      setShowPremiumModal(true);
      return;
    }
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    soundManager.playClick();
    onLogout();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-gray-900 border-r border-white/10 z-50 animate-in slide-in-from-left duration-300 flex flex-col">
        {/* Header - User Profile */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Menu</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>

          {currentUser && (
            <div 
              className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => handleNavigate('/aura')}
            >
              {avatar && (
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatar.gradient} flex items-center justify-center relative`}>
                  <span className="text-white font-bold">{avatar.initial}</span>
                  {currentUser.premium && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Crown className="w-3 h-3 text-gray-900" />
                    </div>
                  )}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{currentUser.username}</p>
                <p className="text-xs text-white/50">Level {currentUser.level}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/40" />
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-4">
          {/* Main Menu */}
          <div className="px-4 mb-6">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-2 px-3">Main</p>
            {mainMenuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path, item.premium)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 bg-[#ff2e2e] text-white text-xs rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* New Features */}
          <div className="px-4 mb-6">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-2 px-3">New Features</p>
            {newFeatures.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path, item.premium)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-colors group"
              >
                <item.icon className="w-5 h-5 group-hover:text-[#ff2e2e] transition-colors" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.new && (
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                    NEW
                  </span>
                )}
                {item.badge && (
                  <span className="px-2 py-0.5 bg-[#ff2e2e] text-white text-xs rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Settings */}
          <div className="px-4">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-2 px-3">System</p>
            <button
              onClick={() => handleNavigate('/settings')}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span className="flex-1 text-left">Settings</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          {!currentUser?.premium && (
            <button 
              onClick={() => setShowPremiumModal(true)}
              className="w-full p-3 mb-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl hover:from-yellow-500/30 hover:to-orange-500/30 transition-all"
            >
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold text-white">Upgrade to Premium</span>
              </div>
              <p className="text-xs text-white/60 mt-1">Unlock exclusive features</p>
            </button>
          )}

          {currentUser && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Premium Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowPremiumModal(false)} />
          <div className="relative w-full max-w-md bg-gradient-to-b from-gray-900 to-black border border-[#ff2e2e]/30 rounded-3xl p-6 animate-in zoom-in">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Premium Feature</h3>
              <p className="text-white/60 mb-6">Upgrade to Premium to unlock this feature and more!</p>
              <button 
                onClick={() => {
                  setShowPremiumModal(false);
                  navigate('/aura');
                  onClose();
                }}
                className="w-full py-3 bg-gradient-to-r from-[#ff2e2e] to-[#ff6b35] text-white font-semibold rounded-xl"
              >
                View Premium Plans
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SideDrawer;
