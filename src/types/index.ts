// VIBE Platform Types

export interface User {
  id: string;
  email: string;
  username: string;
  avatar: string;
  premium: boolean;
  premium_expires_at?: string;
  xp: number;
  level: number;
  streak: number;
  last_post_date?: string;
  created_at: string;
  theme?: string;
  sound_enabled: boolean;
}

export type Mood = 'happy' | 'sad' | 'angry' | 'excited' | 'chill' | 'anxious' | 'loved' | 'bored' | 'confused' | 'grateful';

export interface Drop {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  mood: Mood;
  category: 'stream' | 'pulse' | 'spaces';
  expires_at?: string;
  ghost_mode: boolean;
  created_at: string;
  user?: User;
  engagement?: PostEngagement;
  has_felt?: boolean;
  pulse_options?: PulseOption[];
}

export interface PulseOption {
  id: string;
  post_id: string;
  option_text: string;
  image_url?: string;
  vote_count: number;
  has_voted?: boolean;
}

export interface Echo {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: User;
}

export interface PostEngagement {
  post_id: string;
  feel_count: number;
  echo_count: number;
  share_count: number;
  view_count: number;
}

export interface UserInteraction {
  id: string;
  user_id: string;
  post_id: string;
  type: 'like' | 'view' | 'share' | 'vote' | 'post';
  created_at: string;
}

export interface Space {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  expires_at?: string;
  is_private: boolean;
  created_at: string;
  user?: User;
  member_count?: number;
}

export interface SpaceMessage {
  id: string;
  space_id: string;
  user_id: string;
  message: string;
  reply_to?: string;
  created_at: string;
  user?: User;
}

export interface UserPreferences {
  user_id: string;
  liked_topics: string[];
  interaction_score: Record<string, number>;
  preferred_moods?: Mood[];
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: 'monthly' | '6months' | 'yearly';
  status: 'active' | 'cancelled' | 'expired';
  started_at: string;
  expires_at: string;
  paystack_reference?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

export interface VibeRelationship {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface TypingIndicator {
  space_id: string;
  user_id: string;
  username: string;
  avatar: string;
  typing_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'feel' | 'echo' | 'vibe' | 'mention' | 'pulse';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  created_at: string;
}

export const MOOD_COLORS: Record<Mood, string> = {
  happy: '#FFD93D',
  sad: '#6B7FD7',
  angry: '#FF2E2E',
  excited: '#FF6B35',
  chill: '#4ECDC4',
  anxious: '#9B59B6',
  loved: '#FF6B9D',
  bored: '#95A5A6',
  confused: '#F39C12',
  grateful: '#27AE60'
};

export const MOOD_EMOJIS: Record<Mood, string> = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  excited: '🤩',
  chill: '😌',
  anxious: '😰',
  loved: '🥰',
  bored: '😴',
  confused: '😕',
  grateful: '🙏'
};

export const PREMIUM_PRICES = {
  monthly: 4,
  '6months': 20.4, // 15% discount
  yearly: 33.6 // 30% discount
};
