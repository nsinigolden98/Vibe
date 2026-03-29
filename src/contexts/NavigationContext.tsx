import { createContext, useContext, useState, ReactNode } from 'react';

type View = 'stream' | 'pulse' | 'spaces' | 'aura' | 'settings' | 'discover';

interface NavigationContextType {
  currentView: View;
  setCurrentView: (view: View) => void;
  showDropCreator: boolean;
  setShowDropCreator: (show: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState<View>('stream');
  const [showDropCreator, setShowDropCreator] = useState(false);

  return (
    <NavigationContext.Provider
      value={{ currentView, setCurrentView, showDropCreator, setShowDropCreator }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
