import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Users } from 'lucide-react';
import { soundManager } from '@/sounds/SoundManager';
import { isDemoMode } from '@/services/supabaseClient';

interface LiveEnergyBarProps {
  onEnterFlow?: () => void;
  isLoggedIn?: boolean;
}

interface ActiveUser {
  id: string;
  username: string;
  avatar: string;
}

// Generate fake users for demo mode
const generateFakeUsers = (count: number): ActiveUser[] => {
  const names = ['Nova', 'Echo', 'Pulse', 'Vibe', 'Flow', 'Spark', 'Glow', 'Wave', 'Drift', 'Flux'];
  const gradients = [
    'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-purple-500',
    'from-rose-500 to-orange-500',
    'from-teal-500 to-blue-500',
    'from-yellow-500 to-green-500'
  ];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `fake-${i}`,
    username: names[i % names.length] + Math.floor(Math.random() * 99),
    avatar: JSON.stringify({
      initial: names[i % names.length][0],
      symbol: '◆',
      gradient: gradients[i % gradients.length]
    })
  }));
};

const parseAvatar = (avatarStr: string) => {
  try {
    return JSON.parse(avatarStr);
  } catch {
    return { initial: '?', symbol: '◆', gradient: 'from-gray-500 to-gray-600' };
  }
};

const LiveEnergyBar: React.FC<LiveEnergyBarProps> = ({ onEnterFlow, isLoggedIn }) => {
  const [activeCount, setActiveCount] = useState(0);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [prevCount, setPrevCount] = useState(0);

  // Simulate real-time active users
  useEffect(() => {
    const updateActiveUsers = () => {
      let count: number;
      let users: ActiveUser[];
      
      if (isDemoMode()) {
        // Demo mode: simulate with fake data
        count = Math.floor(Math.random() * 50) + 80;
        users = generateFakeUsers(Math.min(5, Math.floor(count / 20)));
      } else {
        // Real mode: would fetch from Supabase
        // For now, simulate
        count = Math.floor(Math.random() * 100) + 150;
        users = generateFakeUsers(5);
      }
      
      // Play sound if count increased significantly
      if (count > prevCount + 5) {
        soundManager.playNotification();
      }
      
      setPrevCount(activeCount);
      setActiveCount(count);
      setActiveUsers(users);
    };

    updateActiveUsers();
    const interval = setInterval(updateActiveUsers, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [activeCount, prevCount]);

  const handleEnterFlow = () => {
    soundManager.playClick();
    onEnterFlow?.();
  };

  const visibleUsers = activeUsers.slice(0, 5);
  const remainingCount = Math.max(0, activeCount - visibleUsers.length * 20);

  return (
    <div className="w-full">
      <div className="glass-card p-4 rounded-2xl border border-[#ff2e2e]/20">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Avatar Stack */}
          <div className="flex items-center">
            <div className="flex -space-x-3">
              {visibleUsers.map((user, index) => {
                const avatar = parseAvatar(user.avatar);
                return (
                  <div
                    key={user.id}
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatar.gradient} flex items-center justify-center border-2 border-gray-900 relative`}
                    style={{ zIndex: visibleUsers.length - index }}
                    title={user.username}
                  >
                    <span className="text-white text-sm font-bold">{avatar.initial}</span>
                    {/* Online indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
                  </div>
                );
              })}
              {remainingCount > 0 && (
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border-2 border-gray-900">
                  <span className="text-white text-xs font-medium">+{Math.min(99, remainingCount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Text Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Users className="w-4 h-4 text-[#ff2e2e]" />
              <span className="text-white font-semibold">
                {activeCount.toLocaleString()} Active Vibes
              </span>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
            <p className="text-white/50 text-sm mt-0.5">
              Flowing through the Energy Pool
            </p>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleEnterFlow}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#ff2e2e] to-[#ff6b35] hover:from-[#ff4545] hover:to-[#ff7b45] text-white font-medium rounded-full transition-all hover:scale-105 shadow-lg shadow-[#ff2e2e]/20"
          >
            <Zap className="w-4 h-4" />
            Enter the Flow
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveEnergyBar;
