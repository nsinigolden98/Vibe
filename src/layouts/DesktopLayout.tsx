import { useVibeStore } from '@/hooks/useVibeStore';
import { Home, BarChart3, Users, User, Settings, Search, Zap, Flame, TrendingUp } from 'lucide-react';
import StreamPage from '@/pages/StreamPage';
import PulsePage from '@/pages/PulsePage';
import SpacesPage from '@/pages/SpacesPage';
import AuraPage from '@/pages/AuraPage';
import SettingsPage from '@/pages/SettingsPage';
import DiscoverPage from '@/pages/DiscoverPage';
import { formatNumber } from '@/lib/utils';

type PageType = 'stream' | 'pulse' | 'spaces' | 'aura' | 'settings' | 'discover';

interface DesktopLayoutProps {
  onNavigate: (page: 'main' | 'terms' | 'privacy') => void;
}

export default function DesktopLayout({ onNavigate }: DesktopLayoutProps) {
  const { activeTab, setActiveTab, openDropCreator, currentUser, settings } = useVibeStore();
  const isDark = settings.theme === 'dark';

  const navItems: { id: PageType; icon: typeof Home; label: string }[] = [
    { id: 'stream', icon: Home, label: 'Stream' },
    { id: 'discover', icon: Search, label: 'Discover' },
    { id: 'pulse', icon: BarChart3, label: 'Pulse' },
    { id: 'spaces', icon: Users, label: 'Spaces' },
    { id: 'aura', icon: User, label: 'Aura' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const trendingTopics = [
    { tag: '#LateNightThoughts', count: 12453 },
    { tag: '#VibeCheck', count: 8932 },
    { tag: '#AnonymousConfessions', count: 7654 },
    { tag: '#MidnightMusic', count: 5432 },
    { tag: '#CoffeeThoughts', count: 4321 },
  ];

  const suggestedAuras = [
    { username: 'NeonDreamer2847', vibeCount: 2341 },
    { username: 'VoidWalker9921', vibeCount: 1892 },
    { username: 'EchoCaster4456', vibeCount: 1567 },
  ];

  const renderPage = () => {
    switch (activeTab) {
      case 'stream':
        return <StreamPage />;
      case 'pulse':
        return <PulsePage />;
      case 'spaces':
        return <SpacesPage />;
      case 'aura':
        return <AuraPage />;
      case 'settings':
        return <SettingsPage onNavigate={onNavigate} />;
      case 'discover':
        return <DiscoverPage />;
      default:
        return <StreamPage />;
    }
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#f5f5f5]'}`}>
      {/* Left Sidebar - Navigation */}
      <aside className={`w-64 fixed left-0 top-0 bottom-0 ${isDark ? 'bg-[#0a0a0a]/90' : 'bg-white/90'} backdrop-blur-xl border-r ${isDark ? 'border-white/10' : 'border-gray-200'} z-50`}>
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff2e2e] to-[#b91c1c] flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" fill="white" />
          </div>
          <span className="text-2xl font-bold tracking-wider">VIBE</span>
        </div>

        {/* Navigation */}
        <nav className="px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? `${isDark ? 'bg-white/10' : 'bg-gray-100'} text-[#ff2e2e]` 
                    : `${isDark ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`
                }`}
              >
                <Icon className="w-5 h-5" fill={isActive ? '#ff2e2e' : 'none'} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Drop Creator Button */}
        <div className="px-4 mt-6">
          <button
            onClick={() => openDropCreator('stream')}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#ff2e2e] text-white font-semibold rounded-xl hover:bg-[#e62929] transition-colors glow-red"
          >
            <Zap className="w-5 h-5" fill="white" />
            Create Drop
          </button>
        </div>

        {/* User Profile */}
        {currentUser && (
          <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${currentUser.avatar.gradient} flex items-center justify-center`}>
                <span className="text-white font-bold">{currentUser.avatar.initial}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {currentUser.username}
                </p>
                <p className="text-xs text-gray-500">
                  {formatNumber(currentUser.vibeCount)} Vibers
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Center Content */}
      <main className={`flex-1 ml-64 mr-80 min-h-screen ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#f5f5f5]'}`}>
        {renderPage()}
      </main>

      {/* Right Sidebar - Waves & Suggestions */}
      <aside className={`w-80 fixed right-0 top-0 bottom-0 ${isDark ? 'bg-[#0a0a0a]/90' : 'bg-white/90'} backdrop-blur-xl border-l ${isDark ? 'border-white/10' : 'border-gray-200'} z-50 overflow-y-auto hide-scrollbar`}>
        {/* Waves (Trending) */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-[#ff2e2e]" />
            <h2 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Waves</h2>
          </div>
          <div className="space-y-3">
            {trendingTopics.map((topic, index) => (
              <div 
                key={topic.tag} 
                className={`p-3 rounded-xl ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'} cursor-pointer transition-colors`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[#ff2e2e] font-bold text-sm">{index + 1}</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{topic.tag}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatNumber(topic.count)} Drops
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Auras */}
        <div className="px-6 pb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[#ff2e2e]" />
            <h2 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Suggested Auras</h2>
          </div>
          <div className="space-y-3">
            {suggestedAuras.map((aura) => (
              <div 
                key={aura.username}
                className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center`}>
                    <span className="text-white font-bold text-sm">
                      {aura.username.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {aura.username}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatNumber(aura.vibeCount)} Vibers
                    </p>
                  </div>
                </div>
                <button className="px-3 py-1.5 bg-[#ff2e2e] text-white text-xs font-medium rounded-full hover:bg-[#e62929] transition-colors">
                  Vibe
                </button>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
