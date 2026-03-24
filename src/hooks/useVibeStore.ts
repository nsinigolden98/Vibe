import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Aura, Drop, Pulse, Space, UserSettings, Mood } from '@/types';
import mockBackend from '@/services/mockBackend';

// Sound effects
const playSound = (type: 'feel' | 'echo' | 'vibe' | 'flow' | 'notification') => {
  const state = useVibeStore.getState();
  if (!state.settings.soundEffects) return;
  
  // Simple beep using Web Audio API
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    const frequencies: Record<string, number> = {
      feel: 523.25, // C5
      echo: 659.25, // E5
      vibe: 783.99, // G5
      flow: 440.00, // A4
      notification: 880.00, // A5
    };
    
    oscillator.frequency.value = frequencies[type] || 440;
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (e) {
    // Audio not supported
  }
};

interface VibeState {
  // Auth
  currentUser: Aura | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  hasAcceptedTerms: boolean;
  showTermsModal: boolean;
  showPrivacyModal: boolean;
  showIdentityModal: boolean;
  
  // Data
  drops: Drop[];
  pulses: Pulse[];
  spaces: Space[];
  selectedDrop: Drop | null;
  isDropDetailOpen: boolean;
  
  // UI State
  activeTab: string;
  isDropCreatorOpen: boolean;
  dropCreatorCategory: 'stream' | 'pulse' | 'spaces';
  settings: UserSettings;
  searchQuery: string;
  searchSuggestions: string[];
  
  // Actions
  loginWithGoogle: () => void;
  loginAsGuest: () => void;
  logout: () => void;
  acceptTerms: () => void;
  acceptPrivacy: () => void;
  showIdentity: () => void;
  closeIdentityModal: () => void;
  
  // Data Actions - FIXED: ensure immediate UI updates
  refreshDrops: () => void;
  refreshPulses: () => void;
  refreshSpaces: () => void;
  createDrop: (content: string, mood: Mood, category: 'stream' | 'pulse' | 'spaces', isGhost: boolean, fadeMinutes?: number, imageUrl?: string) => Drop;
  toggleFeel: (dropId: string) => void;
  addEcho: (dropId: string, content: string) => void;
  flowDrop: (dropId: string) => void;
  votePulse: (pulseId: string, optionId: string) => void;
  joinSpace: (spaceId: string) => void;
  leaveSpace: (spaceId: string) => void;
  sendSpaceMessage: (spaceId: string, content: string) => void;
  toggleVibe: (userId: string) => void;
  isVibing: (userId: string) => boolean;
  hideDrop: (dropId: string) => void;
  reportDrop: (dropId: string, reason: string) => void;
  blockUser: (userId: string) => void;
  
  // Drop Detail
  openDropDetail: (drop: Drop) => void;
  closeDropDetail: () => void;
  
  // Search
  setSearchQuery: (query: string) => void;
  search: (query: string) => { drops: Drop[]; auras: Aura[]; spaces: Space[] };
  
  // UI Actions
  setActiveTab: (tab: string) => void;
  openDropCreator: (category?: 'stream' | 'pulse' | 'spaces') => void;
  closeDropCreator: () => void;
  toggleTheme: () => void;
  toggleNotifications: () => void;
  toggleSoundEffects: () => void;
  deleteAccount: () => void;
  clearAllData: () => void;
  
  // Sound
  playSound: (type: 'feel' | 'echo' | 'vibe' | 'flow' | 'notification') => void;
}

export const useVibeStore = create<VibeState>()(
  persist(
    (set, get) => ({
      // Initial State
      currentUser: null,
      isAuthenticated: false,
      isGuest: false,
      hasAcceptedTerms: false,
      showTermsModal: false,
      showPrivacyModal: false,
      showIdentityModal: false,
      drops: [],
      pulses: [],
      spaces: [],
      selectedDrop: null,
      isDropDetailOpen: false,
      activeTab: 'stream',
      isDropCreatorOpen: false,
      dropCreatorCategory: 'stream',
      searchQuery: '',
      searchSuggestions: [],
      settings: {
        theme: 'dark',
        notifications: true,
        soundEffects: true,
      },

      // Auth Actions
      loginWithGoogle: () => {
        const user = mockBackend.loginWithGoogle();
        set({ 
          currentUser: user, 
          isAuthenticated: true, 
          isGuest: false,
          showTermsModal: true,
        });
        get().refreshDrops();
        get().refreshPulses();
        get().refreshSpaces();
      },

      loginAsGuest: () => {
        const user = mockBackend.loginAsGuest();
        set({ 
          currentUser: user, 
          isAuthenticated: true, 
          isGuest: true,
          showTermsModal: true,
        });
        get().refreshDrops();
        get().refreshPulses();
        get().refreshSpaces();
      },

      logout: () => {
        mockBackend.logout();
        set({ 
          currentUser: null, 
          isAuthenticated: false, 
          isGuest: false,
          hasAcceptedTerms: false,
          drops: [],
          pulses: [],
          spaces: [],
        });
      },

      acceptTerms: () => {
        set({ 
          hasAcceptedTerms: true,
          showTermsModal: false,
          showPrivacyModal: true,
        });
      },

      acceptPrivacy: () => {
        set({ 
          showPrivacyModal: false,
          showIdentityModal: true,
        });
      },

      showIdentity: () => {
        set({ showIdentityModal: true });
      },

      closeIdentityModal: () => {
        set({ showIdentityModal: false });
      },

      // Data Actions - FIXED: ensure immediate UI updates
      refreshDrops: () => {
        const drops = mockBackend.getDrops();
        set({ drops });
      },

      refreshPulses: () => {
        const pulses = mockBackend.getPulses();
        set({ pulses });
      },

      refreshSpaces: () => {
        const spaces = mockBackend.getSpaces();
        set({ spaces });
      },

      createDrop: (content, mood, category, isGhost, fadeMinutes, imageUrl) => {
        const newDrop = mockBackend.createDrop(content, mood, category, isGhost, fadeMinutes, imageUrl);
        // Immediately update the drops list in state
        set(state => ({ 
          drops: [newDrop, ...state.drops],
        }));
        get().playSound('echo');
        return newDrop;
      },

      toggleFeel: (dropId) => {
        const result = mockBackend.toggleFeel(dropId);
        if (result) {
          get().playSound('feel');
        }
        // Immediately refresh to show updated state
        get().refreshDrops();
      },

      addEcho: (dropId, content) => {
        mockBackend.addEcho(dropId, content);
        get().playSound('echo');
        get().refreshDrops();
      },

      flowDrop: (dropId) => {
        mockBackend.flowDrop(dropId);
        get().playSound('flow');
        get().refreshDrops();
      },

      votePulse: (pulseId, optionId) => {
        mockBackend.votePulse(pulseId, optionId);
        get().refreshPulses();
      },

      joinSpace: (spaceId) => {
        mockBackend.joinSpace(spaceId);
        get().refreshSpaces();
      },

      leaveSpace: (spaceId) => {
        mockBackend.leaveSpace(spaceId);
        get().refreshSpaces();
      },

      sendSpaceMessage: (spaceId, content) => {
        mockBackend.sendSpaceMessage(spaceId, content);
        get().refreshSpaces();
      },

      toggleVibe: (userId) => {
        const result = mockBackend.toggleVibe(userId);
        if (result) {
          get().playSound('vibe');
        }
        set(state => ({
          currentUser: state.currentUser ? {
            ...state.currentUser,
            vibingCount: mockBackend.isVibing(userId) 
              ? state.currentUser.vibingCount + 1 
              : Math.max(0, state.currentUser.vibingCount - 1)
          } : null
        }));
      },

      isVibing: (userId) => {
        return mockBackend.isVibing(userId);
      },

      hideDrop: (dropId) => {
        mockBackend.hideDrop(dropId);
        get().refreshDrops();
      },

      reportDrop: (dropId, reason) => {
        mockBackend.reportDrop(dropId, reason);
        get().refreshDrops();
      },

      blockUser: (userId) => {
        mockBackend.blockUser(userId);
        get().refreshDrops();
      },

      // Drop Detail
      openDropDetail: (drop) => {
        set({ selectedDrop: drop, isDropDetailOpen: true });
      },

      closeDropDetail: () => {
        set({ selectedDrop: null, isDropDetailOpen: false });
      },

      // Search
      setSearchQuery: (query) => {
        set({ searchQuery: query });
        if (query.trim()) {
          const suggestions = mockBackend.searchSuggestions(query);
          set({ searchSuggestions: suggestions });
        } else {
          set({ searchSuggestions: [] });
        }
      },

      search: (query) => {
        return mockBackend.search(query);
      },

      // UI Actions
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      openDropCreator: (category = 'stream') => set({ 
        isDropCreatorOpen: true,
        dropCreatorCategory: category,
      }),
      
      closeDropCreator: () => set({ isDropCreatorOpen: false }),

      toggleTheme: () => set(state => ({
        settings: { ...state.settings, theme: state.settings.theme === 'dark' ? 'light' : 'dark' }
      })),

      toggleNotifications: () => set(state => ({
        settings: { ...state.settings, notifications: !state.settings.notifications }
      })),

      toggleSoundEffects: () => set(state => ({
        settings: { ...state.settings, soundEffects: !state.settings.soundEffects }
      })),

      deleteAccount: () => {
        mockBackend.deleteAccount();
        set({
          currentUser: null,
          isAuthenticated: false,
          isGuest: false,
          hasAcceptedTerms: false,
          drops: [],
          pulses: [],
          spaces: [],
        });
      },

      clearAllData: () => {
        mockBackend.clearAllData();
        set({
          drops: [],
          pulses: [],
          spaces: [],
        });
      },

      playSound: (type) => {
        playSound(type);
      },
    }),
    {
      name: 'vibe-storage',
      partialize: (state) => ({ 
        settings: state.settings,
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        isGuest: state.isGuest,
        hasAcceptedTerms: state.hasAcceptedTerms,
      }),
    }
  )
);

export default useVibeStore;
