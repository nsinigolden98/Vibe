import { useState, useEffect } from 'react';
import { useVibeStore } from '@/hooks/useVibeStore';
import { Users, UserPlus, MessageSquare, BarChart3, Radio, FileText, Heart, Share2, Eye } from 'lucide-react';
import { formatNumber, formatTimeAgo } from '@/lib/utils';
import { MOOD_CONFIG } from '@/types';
import mockBackend from '@/services/mockBackend';
import type { Drop, Pulse, Aura } from '@/types';

type TabType = 'drops' | 'pulses' | 'spaces' | 'vibing' | 'vibers';

export default function AuraPage() {
  const { currentUser, settings, toggleVibe, isVibing, openDropDetail } = useVibeStore();
  const [activeTab, setActiveTab] = useState<TabType>('drops');
  const [userDrops, setUserDrops] = useState<Drop[]>([]);
  const [userPulses, setUserPulses] = useState<Pulse[]>([]);
  const [vibing, setVibing] = useState<Aura[]>([]);
  const [vibers, setVibers] = useState<Aura[]>([]);
  const isDark = settings.theme === 'dark';

  useEffect(() => {
    if (currentUser) {
      setUserDrops(mockBackend.getUserDrops(currentUser.id));
      setUserPulses(mockBackend.getUserPulses(currentUser.id));
      setVibing(mockBackend.getVibing());
      setVibers(mockBackend.getVibers());
    }
  }, [currentUser]);

  // Refresh data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentUser) {
        setUserDrops(mockBackend.getUserDrops(currentUser.id));
        setUserPulses(mockBackend.getUserPulses(currentUser.id));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#f5f5f5]'}`}>
        <p className="text-gray-500">Please log in to view your Aura</p>
      </div>
    );
  }

  const tabs: { id: TabType; label: string; icon: typeof FileText; count: number }[] = [
    { id: 'drops', label: 'Drops', icon: FileText, count: userDrops.length },
    { id: 'pulses', label: 'Pulses', icon: BarChart3, count: userPulses.length },
    { id: 'spaces', label: 'Spaces', icon: Radio, count: currentUser.joinedSpaces.length },
    { id: 'vibing', label: 'Vibing', icon: UserPlus, count: currentUser.vibingCount },
    { id: 'vibers', label: 'Vibers', icon: Users, count: currentUser.vibeCount },
  ];

  return (
    <div className="min-h-screen">
      {/* Profile Header with Banner */}
      <div className="relative">
        {/* Banner */}
        <div className={`h-40 bg-gradient-to-r ${currentUser.banner || 'from-[#ff2e2e] via-[#ff6b6b] to-[#b91c1c]'}`} />
        
        {/* Avatar & Info - Centered */}
        <div className="px-4 -mt-16">
          <div className="flex flex-col items-center">
            <div className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${currentUser.avatar.gradient} flex items-center justify-center border-4 ${isDark ? 'border-[#0a0a0a]' : 'border-[#f5f5f5]'} shadow-xl`}>
              <span className="text-white text-4xl font-bold">{currentUser.avatar.initial}</span>
            </div>
            
            <div className="mt-4 text-center">
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {currentUser.username}
              </h1>
              <div className="flex items-center justify-center gap-6 mt-3">
                <div className="text-center">
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatNumber(currentUser.vibeCount)}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Vibers</p>
                </div>
                <div className="w-px h-8 bg-gray-500/30" />
                <div className="text-center">
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatNumber(currentUser.vibingCount)}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Vibing</p>
                </div>
                <div className="w-px h-8 bg-gray-500/30" />
                <div className="text-center">
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatNumber(userDrops.length)}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Drops</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`sticky top-0 z-30 mt-6 ${isDark ? 'bg-[#0a0a0a]/95' : 'bg-[#f5f5f5]/95'} backdrop-blur-xl border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <div className="flex overflow-x-auto hide-scrollbar px-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 whitespace-nowrap border-b-2 transition-colors ${
                  isActive 
                    ? 'border-[#ff2e2e] text-[#ff2e2e]' 
                    : `border-transparent ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 py-4 max-w-2xl mx-auto">
        {activeTab === 'drops' && (
          <div className="space-y-4">
            {userDrops.length === 0 ? (
              <EmptyState 
                message="No drops yet" 
                subMessage="Create your first drop to see it here" 
                isDark={isDark} 
                icon="📝"
              />
            ) : (
              userDrops.map((drop) => (
                <DropCard 
                  key={drop.id} 
                  drop={drop} 
                  isDark={isDark} 
                  onClick={() => openDropDetail(drop)}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'pulses' && (
          <div className="space-y-4">
            {userPulses.length === 0 ? (
              <EmptyState 
                message="No pulses yet" 
                subMessage="Create a pulse to see it here" 
                isDark={isDark}
                icon="📊"
              />
            ) : (
              userPulses.map((pulse) => (
                <PulseCard key={pulse.id} pulse={pulse} isDark={isDark} />
              ))
            )}
          </div>
        )}

        {activeTab === 'spaces' && (
          <EmptyState 
            message="No spaces joined" 
            subMessage="Join a space to see it here" 
            isDark={isDark}
            icon="🚀"
          />
        )}

        {activeTab === 'vibing' && (
          <div className="space-y-3">
            {vibing.length === 0 ? (
              <EmptyState 
                message="Not vibing with anyone" 
                subMessage="Vibe with others to see them here" 
                isDark={isDark}
                icon="💫"
              />
            ) : (
              vibing.map((aura) => (
                <AuraCard 
                  key={aura.id} 
                  aura={aura} 
                  isDark={isDark} 
                  isVibing={isVibing(aura.id)}
                  onToggleVibe={() => toggleVibe(aura.id)}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'vibers' && (
          <div className="space-y-3">
            {vibers.length === 0 ? (
              <EmptyState 
                message="No vibers yet" 
                subMessage="People who vibe with you will appear here" 
                isDark={isDark}
                icon="⭐"
              />
            ) : (
              vibers.map((aura) => (
                <AuraCard 
                  key={aura.id} 
                  aura={aura} 
                  isDark={isDark}
                  isVibing={isVibing(aura.id)}
                  onToggleVibe={() => toggleVibe(aura.id)}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ message, subMessage, isDark, icon }: { message: string; subMessage: string; isDark: boolean; icon: string }) {
  return (
    <div className="text-center py-12">
      <div className={`w-20 h-20 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'} flex items-center justify-center mx-auto mb-4`}>
        <span className="text-3xl">{icon}</span>
      </div>
      <p className={`font-medium text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{message}</p>
      <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{subMessage}</p>
    </div>
  );
}

function DropCard({ drop, isDark, onClick }: { drop: Drop; isDark: boolean; onClick: () => void }) {
  const mood = MOOD_CONFIG[drop.mood];
  
  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-white'} border ${isDark ? 'border-white/10' : 'border-gray-200'} cursor-pointer hover:scale-[1.01] transition-transform`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span 
          className="text-xs px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${mood.color}20`, color: mood.color }}
        >
          {mood.emoji} {mood.label}
        </span>
        <span className="text-xs text-gray-500">{formatTimeAgo(drop.createdAt)}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
          {drop.category}
        </span>
      </div>
      <p className={`mb-3 line-clamp-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{drop.content}</p>
      {drop.imageUrl && (
        <div className="mb-3 rounded-xl overflow-hidden">
          <img src={drop.imageUrl} alt="Drop content" className="w-full h-auto max-h-60 object-cover" />
        </div>
      )}
      <div className="flex items-center gap-4 text-gray-500">
        <div className="flex items-center gap-1">
          <Heart className="w-4 h-4" fill={drop.hasFelt ? '#ff2e2e' : 'none'} />
          <span className="text-sm">{formatNumber(drop.feelCount)}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageSquare className="w-4 h-4" />
          <span className="text-sm">{formatNumber(drop.echoCount)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Share2 className="w-4 h-4" />
          <span className="text-sm">{formatNumber(drop.flowCount)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="w-4 h-4" />
          <span className="text-sm">{formatNumber(drop.seenCount)}</span>
        </div>
      </div>
    </div>
  );
}

function PulseCard({ pulse, isDark }: { pulse: Pulse; isDark: boolean }) {
  return (
    <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-white'} border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 className="w-4 h-4 text-[#ff2e2e]" />
        <span className="text-xs text-gray-500">{formatTimeAgo(pulse.createdAt)}</span>
      </div>
      <p className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{pulse.question}</p>
      <div className="space-y-2">
        {pulse.options.map((option) => (
          <div key={option.id} className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{option.text}</span>
              <span className="text-sm font-medium">{option.percentage}%</span>
            </div>
            <div className={`h-1.5 rounded-full mt-1 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
              <div 
                className="h-full bg-[#ff2e2e] rounded-full transition-all"
                style={{ width: `${option.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className={`text-xs mt-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        {formatNumber(pulse.totalVotes)} votes
      </p>
    </div>
  );
}

function AuraCard({ aura, isDark, isVibing, onToggleVibe }: { aura: Aura; isDark: boolean; isVibing: boolean; onToggleVibe: () => void }) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white'} border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${aura.avatar.gradient} flex items-center justify-center`}>
          <span className="text-white font-bold">{aura.avatar.initial}</span>
        </div>
        <div>
          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{aura.username}</p>
          <p className="text-xs text-gray-500">{formatNumber(aura.vibeCount)} Vibers</p>
        </div>
      </div>
      <button 
        onClick={onToggleVibe}
        className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
          isVibing 
            ? 'bg-[#ff2e2e]/20 text-[#ff2e2e]' 
            : 'bg-[#ff2e2e] text-white hover:bg-[#e62929]'
        }`}
      >
        {isVibing ? 'Vibing' : 'Vibe'}
      </button>
    </div>
  );
}
