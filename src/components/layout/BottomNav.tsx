import { Waves, Zap, MessageSquare, User, Settings } from 'lucide-react';
import { useNavigation } from '../../contexts/NavigationContext';

export function BottomNav() {
  const { currentView, setCurrentView } = useNavigation();

  const navItems = [
    { id: 'stream' as const, icon: Waves, label: 'Stream' },
    { id: 'pulse' as const, icon: Zap, label: 'Pulse' },
    { id: 'spaces' as const, icon: MessageSquare, label: 'Spaces' },
    { id: 'aura' as const, icon: User, label: 'Aura' },
    { id: 'settings' as const, icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 md:hidden z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'text-red-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
