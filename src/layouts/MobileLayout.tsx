import { useVibeStore } from '@/hooks/useVibeStore';
import { Home, BarChart3, Users, User, Settings, Zap } from 'lucide-react';
import StreamPage from '@/pages/StreamPage';
import PulsePage from '@/pages/PulsePage';
import SpacesPage from '@/pages/SpacesPage';
import AuraPage from '@/pages/AuraPage';
import SettingsPage from '@/pages/SettingsPage';
import DiscoverPage from '@/pages/DiscoverPage';

type PageType = 'stream' | 'pulse' | 'spaces' | 'aura' | 'settings' | 'discover';

interface MobileLayoutProps {
  onNavigate: (page: 'main' | 'terms' | 'privacy') => void;
}

export default function MobileLayout({ onNavigate }: MobileLayoutProps) {
  const { activeTab, setActiveTab, openDropCreator, settings } = useVibeStore();
  const isDark = settings.theme === 'dark';

  const navItems: { id: PageType; icon: typeof Home; label: string }[] = [
    { id: 'stream', icon: Home, label: 'Stream' },
    { id: 'pulse', icon: BarChart3, label: 'Pulse' },
    { id: 'spaces', icon: Users, label: 'Spaces' },
    { id: 'aura', icon: User, label: 'Aura' },
    { id: 'settings', icon: Settings, label: 'Settings' },
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
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#f5f5f5]'}`}>
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto hide-scrollbar pb-24">
        {renderPage()}
      </main>

      {/* Floating Drop Creator Button */}
      <button
        onClick={() => openDropCreator()}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-14 h-14 rounded-full bg-[#ff2e2e] flex items-center justify-center floating-btn touch-feedback"
        style={{ transform: 'translateX(-50%) translateY(-50%)' }}
      >
        <Zap className="w-6 h-6 text-white" fill="white" />
      </button>

      {/* Bottom Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 z-40 safe-bottom ${isDark ? 'bg-[#0a0a0a]/90' : 'bg-white/90'} backdrop-blur-xl border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <div className="flex items-center justify-around py-2 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all touch-feedback ${
                  isActive 
                    ? 'text-[#ff2e2e]' 
                    : isDark ? 'text-gray-500' : 'text-gray-400'
                }`}
              >
                <Icon 
                  className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} 
                  fill={isActive ? '#ff2e2e' : 'none'} 
                />
                <span className={`text-[10px] font-medium ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
