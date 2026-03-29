import { ReactNode, useState } from 'react';
import { Waves, Zap, MessageSquare, User, Settings, Search, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { DropCreator } from '../drops/DropCreator';

type Page = 'stream' | 'pulse' | 'spaces' | 'aura' | 'settings' | 'discover';

interface MainLayoutProps {
  children: ReactNode;
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

export function MainLayout({ children, currentPage, onPageChange }: MainLayoutProps) {
  const { profile } = useAuth();
  const [showDropCreator, setShowDropCreator] = useState(false);
  const [dropRefresh, setDropRefresh] = useState(false);

  const navItems = [
    { id: 'stream' as const, icon: Waves, label: 'Stream' },
    { id: 'pulse' as const, icon: Zap, label: 'Pulse' },
    { id: 'spaces' as const, icon: MessageSquare, label: 'Spaces' },
    { id: 'discover' as const, icon: Search, label: 'Discover' },
    { id: 'aura' as const, icon: User, label: 'Aura' },
    { id: 'settings' as const, icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="flex">
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
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onPageChange(item.id)}
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

        <main className="flex-1 pb-24 md:pb-4 md:ml-64 lg:mr-80 min-h-screen">
          <div className="max-w-2xl mx-auto w-full">
            {children}
          </div>
        </main>

        <div className="hidden lg:block fixed right-0 top-0 w-80 h-screen border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-y-auto">
          <div className="p-4 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Wave</h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Trending content appears here. Check back frequently for new vibes!
            </div>
          </div>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 md:hidden z-40 shadow-lg">
        <div className="flex items-center justify-around py-2 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <button
        onClick={() => setShowDropCreator(true)}
        className="fixed bottom-24 right-6 md:bottom-6 w-14 h-14 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-200 hover:scale-110 z-40 animate-pulse"
      >
        <Plus className="w-7 h-7" />
      </button>

      {showDropCreator && (
        <DropCreator
          onClose={() => setShowDropCreator(false)}
          onSuccess={() => {
            setShowDropCreator(false);
            setDropRefresh(!dropRefresh);
          }}
        />
      )}
    </div>
  );
}
