// VIBE Platform Types

// Platform Language Types
export type Drop = {
  id: string;
  content: string;
  mood: Mood;
  category: 'stream' | 'pulse' | 'spaces';
  author: Aura;
  createdAt: Date;
  feelCount: number;
  echoCount: number;
  flowCount: number;
  seenCount: number;
  isGhost: boolean;
  fadeAt?: Date;
  echoes?: Echo[];
  hasFelt?: boolean;
  hasVibed?: boolean;
  imageUrl?: string;
};

export type Echo = {
  id: string;
  content: string;
  author: Aura;
  createdAt: Date;
  feelCount: number;
};

export type Pulse = {
  id: string;
  question: string;
  options: PulseOption[];
  totalVotes: number;
  author: Aura;
  createdAt: Date;
  hasVoted?: boolean;
  userVote?: string;
};

export type PulseOption = {
  id: string;
  text: string;
  votes: number;
  percentage: number;
  imageUrl?: string;
};

export type Space = {
  id: string;
  name: string;
  description: string;
  activeUsers: number;
  messages: SpaceMessage[];
  createdAt: Date;
  isLive: boolean;
  creatorId?: string;
  expiryMinutes?: number;
};

export type SpaceMessage = {
  id: string;
  content: string;
  author: Aura;
  createdAt: Date;
  expiresAt: Date;
};

export type Aura = {
  id: string;
  username: string;
  avatar: Avatar;
  vibeCount: number;
  vibingCount: number;
  drops: Drop[];
  pulses: Pulse[];
  joinedSpaces: string[];
  isGuest?: boolean;
  banner?: string;
};

export type Avatar = {
  initial: string;
  symbol: string;
  gradient: string;
};

export type Mood = 'angry' | 'happy' | 'sad' | 'thoughtful' | 'funny' | 'neutral';

export type Notification = {
  id: string;
  type: 'feel' | 'echo' | 'vibe' | 'flow';
  message: string;
  createdAt: Date;
  read: boolean;
};

export type Theme = 'dark' | 'light';

export type UserSettings = {
  theme: Theme;
  notifications: boolean;
  soundEffects: boolean;
};

// Navigation
export type Tab = 'stream' | 'pulse' | 'spaces' | 'aura' | 'settings' | 'discover';

// Mood Config
export const MOOD_CONFIG: Record<Mood, { label: string; color: string; emoji: string }> = {
  angry: { label: 'Angry', color: '#ff4444', emoji: '😠' },
  happy: { label: 'Happy', color: '#44ff88', emoji: '😊' },
  sad: { label: 'Sad', color: '#4488ff', emoji: '😢' },
  thoughtful: { label: 'Thoughtful', color: '#ffaa44', emoji: '🤔' },
  funny: { label: 'Funny', color: '#ff44ff', emoji: '😂' },
  neutral: { label: 'Neutral', color: '#aaaaaa', emoji: '😐' },
};

// Avatar Generation
export const AVATAR_INITIALS = ['V', 'X', 'Z', 'K', 'R', 'N', 'M', 'L', 'S', 'T'];
export const AVATAR_SYMBOLS = ['◆', '●', '▲', '■', '★', '✦', '✹', '✻', '✽', '❋'];
export const AVATAR_GRADIENTS = [
  'from-red-500 to-orange-500',
  'from-blue-500 to-purple-500',
  'from-green-500 to-teal-500',
  'from-pink-500 to-rose-500',
  'from-yellow-500 to-amber-500',
  'from-indigo-500 to-cyan-500',
  'from-violet-500 to-fuchsia-500',
  'from-emerald-500 to-lime-500',
];

// Banner gradients for Aura
export const BANNER_GRADIENTS = [
  'from-[#ff2e2e] via-[#ff6b6b] to-[#b91c1c]',
  'from-[#4f46e5] via-[#7c3aed] to-[#9333ea]',
  'from-[#059669] via-[#10b981] to-[#34d399]',
  'from-[#db2777] via-[#ec4899] to-[#f472b6]',
  'from-[#d97706] via-[#f59e0b] to-[#fbbf24]',
  'from-[#0891b2] via-[#06b6d4] to-[#22d3ee]',
];
