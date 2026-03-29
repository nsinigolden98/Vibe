import { Waves, Zap, MessageSquare, User, Settings, Search } from 'lucide-react';
import { useNavigation } from '../../contexts/NavigationContext';
import { useAuth } from '../../contexts/AuthContext';

export function DesktopSidebar() {
  const { currentView, setCurrentView } = useNavigation();
  const { profile } = useAuth();

  const navItems = [
    { id: 'stream' as const, icon: Waves, label: 'Stream' },
    { id: 'pulse' as const, icon: Zap, label: 'Pulse' },
    { id: 'spaces' as const, icon: MessageSquare, label: 'Spaces' },
    { id: 'discover' as const, icon: Search, label: 'Discover' },
    { id: 'aura' as const, icon: User, label: 'Aura' },
    { id: 'settings' as const, icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="hidden md:block fixed left-0 top-0 w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-40">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-2xl">🌀</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">VIBE</h1>
        </div>

        {profile && (
          <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${profile.avatar_gradient} rounded-full flex items-center justify-center text-xl`}>
                {profile.avatar_symbol}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {profile.username}
                </p>
              </div>
            </div>
          </div>
        )}

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
