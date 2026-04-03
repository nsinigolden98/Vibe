import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart2, MessageSquare, User as UserIcon, Search, Plus, Crown, Bell, Menu } from 'lucide-react';
import type { User } from '@/types';
import PremiumModal from './PremiumModal';
import SideDrawer from './SideDrawer';
import { soundManager } from '@/sounds/SoundManager';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  currentUser: User | null;
  onCreateDrop: () => void;
  onUpgrade: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentUser, onCreateDrop, onUpgrade }) => {
  const location = useLocation();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showSideDrawer, setShowSideDrawer] = useState(false);
  const { logout } = useAuth();

  const navItems = [
    { path: '/', icon: Home, label: 'Stream' },
    { path: '/pulse', icon: BarChart2, label: 'Pulse' },
    { path: '/spaces', icon: MessageSquare, label: 'Spaces' },
    { path: '/discover', icon: Search, label: 'Discover' },
    { path: '/aura', icon: UserIcon, label: 'Aura' }
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleNavClick = () => {
    soundManager.playClick();
  };

  const parseAvatar = (avatarStr: string) => {
    try {
      return JSON.parse(avatarStr);
    } catch {
      return { initial: '?', symbol: '◆', gradient: 'from-gray-500 to-gray-600' };
    }
  };

  const avatar = currentUser ? parseAvatar(currentUser.avatar) : null;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 bg-gray-900/95 backdrop-blur-lg border-r border-white/10 z-40">
        {/* Logo */}
        <div className="p-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" onClick={handleNavClick}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff2e2e] to-[#ff6b35] flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <span className="text-2xl font-bold text-white">VIBE</span>
          </Link>
          <button 
            onClick={() => {
              setShowSideDrawer(true);
              soundManager.playClick();
            }}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Menu className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Create Drop Button */}
        <div className="px-4 mb-6">
          <button
            onClick={onCreateDrop}
            className="w-full py-3 bg-[#ff2e2e] hover:bg-[#ff2e2e]/80 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Drop
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive(item.path)
                  ? 'bg-[#ff2e2e]/20 text-[#ff2e2e]'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Premium CTA */}
        {!currentUser?.premium && (
          <div className="p-4">
            <button
              onClick={() => setShowPremiumModal(true)}
              className="w-full p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl hover:from-yellow-500/30 hover:to-orange-500/30 transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold text-white">Go Premium</span>
              </div>
              <p className="text-xs text-white/60">Unlock exclusive features</p>
            </button>
          </div>
        )}

        {/* User Profile */}
        {currentUser && (
          <div className="p-4 border-t border-white/10">
            <Link 
              to="/aura" 
              className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-xl transition-colors"
              onClick={handleNavClick}
            >
              {avatar && (
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatar.gradient} flex items-center justify-center`}>
                  <span className="text-white font-bold text-sm">{avatar.initial}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{currentUser.username}</p>
                <p className="text-xs text-white/50">Level {currentUser.level}</p>
              </div>
              {currentUser.premium && (
                <Crown className="w-5 h-5 text-yellow-400" />
              )}
            </Link>
          </div>
        )}
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-b border-white/10 z-40 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" onClick={handleNavClick}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ff2e2e] to-[#ff6b35] flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="text-xl font-bold text-white">VIBE</span>
          </Link>
          <button 
            onClick={() => {
              setShowSideDrawer(true);
              soundManager.playClick();
            }}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-white/10 z-40 safe-area-pb">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'text-[#ff2e2e]'
                  : 'text-white/50'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Floating Action Button (Mobile) */}
      <button
        onClick={onCreateDrop}
        className="lg:hidden fixed bottom-20 right-4 w-14 h-14 bg-[#ff2e2e] hover:bg-[#ff2e2e]/80 text-white rounded-full shadow-lg shadow-[#ff2e2e]/30 flex items-center justify-center transition-transform hover:scale-110 z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Premium Modal */}
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        currentUser={currentUser}
        onUpgrade={onUpgrade}
      />

      {/* Side Drawer */}
      <SideDrawer
        isOpen={showSideDrawer}
        onClose={() => setShowSideDrawer(false)}
        currentUser={currentUser}
        onLogout={logout}
      />
    </>
  );
};

export default Navbar;
