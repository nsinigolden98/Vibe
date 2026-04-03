// DEMO MODE: LocalStorage-based storage for demo users
// This file can be completely removed when demo mode is no longer needed

import type { Drop, Space, SpaceMessage, User, Mood } from '@/types';
import { MOOD_COLORS, MOOD_EMOJIS } from '@/types';

// DEMO MODE: Global state for demo user
let currentDemoUser: User | null = null;

export const setDemoUser = (user: User | null) => {
  currentDemoUser = user;
};

export const isDemoMode = (): boolean => {
  return currentDemoUser?.id === 'demo-user';
};

// Alias for compatibility
export const checkDemoMode = isDemoMode;

// Storage keys
const KEYS = {
  USER: 'vibe_demo_user',
  DROPS: 'vibe_demo_drops',
  SPACES: 'vibe_demo_spaces',
  MESSAGES: 'vibe_demo_messages',
  EVENTS: 'vibe_demo_events',
  TICKETS: 'vibe_demo_tickets',
  PULSES: 'vibe_demo_pulses',
  ECHOES: 'vibe_demo_echoes',
  ENGAGEMENT: 'vibe_demo_engagement',
  INTERACTIONS: 'vibe_demo_interactions',
  VIBES: 'vibe_demo_vibes',
  USER_VIBES: 'vibe_demo_user_vibes',
  STREAK: 'vibe_demo_streak',
  LAST_ACTIVE: 'vibe_demo_last_active',
  // New features
  SIGNALS: 'vibe_demo_signals',
  MASKS: 'vibe_demo_masks',
  ACTIVE_MASK: 'vibe_demo_active_mask',
  VOID_POSTS: 'vibe_demo_void_posts',
  TRUTH_SESSIONS: 'vibe_demo_truth_sessions',
  TRUTH_RESPONSES: 'vibe_demo_truth_responses',
  MATCHES: 'vibe_demo_matches',
  SAVED_DROPS: 'vibe_demo_saved_drops'
};

// Generate random demo user
export const generateDemoUser = (): User => {
  const adjectives = ['Cosmic', 'Neon', 'Cyber', 'Digital', 'Quantum', 'Solar', 'Lunar', 'Stellar', 'Aurora', 'Nebula'];
  const nouns = ['Vibe', 'Wave', 'Pulse', 'Echo', 'Flow', 'Drift', 'Spark', 'Glow', 'Flux', 'Zen'];
  const numbers = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  const gradients = [
    'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-purple-500',
    'from-rose-500 to-orange-500',
    'from-teal-500 to-blue-500',
    'from-yellow-500 to-green-500'
  ];
  const symbols = ['◆', '●', '▲', '■', '★', '✦', '✹', '✻'];
  
  const username = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${numbers}`;
  const initial = username.charAt(0).toUpperCase();
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  const gradient = gradients[Math.floor(Math.random() * gradients.length)];
  
  const user: User = {
    id: 'demo-user',
    email: 'demo@vibe.app',
    username,
    avatar: JSON.stringify({ initial, symbol, gradient }),
    premium: true,
    xp: 1250,
    level: 13,
    streak: 7,
    sound_enabled: true,
    created_at: new Date().toISOString()
  };
  
  localStorage.setItem(KEYS.USER, JSON.stringify(user));
  return user;
};

// Get demo user
export const getDemoUser = (): User | null => {
  const stored = localStorage.getItem(KEYS.USER);
  if (stored) {
    return JSON.parse(stored);
  }
  return generateDemoUser();
};

// Clear all demo data
export const clearDemoData = () => {
  Object.values(KEYS).forEach(key => localStorage.removeItem(key));
};

// ============================================
// DROPS (Posts)
// ============================================

export const getDemoDrops = (): Drop[] => {
  const stored = localStorage.getItem(KEYS.DROPS);
  return stored ? JSON.parse(stored) : [];
};

export const saveDemoDrop = (drop: Omit<Drop, 'id' | 'created_at' | 'user'>): Drop => {
  const drops = getDemoDrops();
  const user = getDemoUser()!;
  
  const newDrop: Drop = {
    ...drop,
    id: `demo-drop-${Date.now()}`,
    created_at: new Date().toISOString(),
    user
  };
  
  drops.unshift(newDrop);
  localStorage.setItem(KEYS.DROPS, JSON.stringify(drops));
  
  // Create engagement record
  const engagement = getDemoEngagement();
  engagement[newDrop.id] = {
    post_id: newDrop.id,
    feel_count: 0,
    echo_count: 0,
    share_count: 0,
    view_count: 0
  };
  localStorage.setItem(KEYS.ENGAGEMENT, JSON.stringify(engagement));
  
  // Update streak
  updateDemoStreak();
  
  return newDrop;
};

// ============================================
// SPACES
// ============================================

export const getDemoSpaces = (): Space[] => {
  const stored = localStorage.getItem(KEYS.SPACES);
  return stored ? JSON.parse(stored) : [];
};

export const saveDemoSpace = (space: Omit<Space, 'id' | 'created_at' | 'user' | 'member_count'>): Space => {
  const spaces = getDemoSpaces();
  const user = getDemoUser()!;
  
  const newSpace: Space = {
    ...space,
    id: `demo-space-${Date.now()}`,
    created_at: new Date().toISOString(),
    user,
    member_count: 1
  };
  
  spaces.unshift(newSpace);
  localStorage.setItem(KEYS.SPACES, JSON.stringify(spaces));
  
  return newSpace;
};

// ============================================
// MESSAGES
// ============================================

export const getDemoMessages = (spaceId: string): SpaceMessage[] => {
  const stored = localStorage.getItem(KEYS.MESSAGES);
  const allMessages = stored ? JSON.parse(stored) : {};
  return allMessages[spaceId] || [];
};

export const saveDemoMessage = (message: Omit<SpaceMessage, 'id' | 'created_at' | 'user'>): SpaceMessage => {
  const allMessages = JSON.parse(localStorage.getItem(KEYS.MESSAGES) || '{}');
  const user = getDemoUser()!;
  
  const newMessage: SpaceMessage = {
    ...message,
    id: `demo-msg-${Date.now()}`,
    created_at: new Date().toISOString(),
    user
  };
  
  if (!allMessages[message.space_id]) {
    allMessages[message.space_id] = [];
  }
  
  allMessages[message.space_id].push(newMessage);
  localStorage.setItem(KEYS.MESSAGES, JSON.stringify(allMessages));
  
  return newMessage;
};

// ============================================
// ENGAGEMENT (Likes, Comments, Shares)
// ============================================

export const getDemoEngagement = (): Record<string, any> => {
  const stored = localStorage.getItem(KEYS.ENGAGEMENT);
  return stored ? JSON.parse(stored) : {};
};

export const feelDemoDrop = (postId: string): { action: 'added' | 'removed' } => {
  const interactions = JSON.parse(localStorage.getItem(KEYS.INTERACTIONS) || '{}');
  const engagement = getDemoEngagement();
  const userId = 'demo-user';
  
  const key = `${userId}-${postId}-like`;
  
  if (interactions[key]) {
    // Remove feel
    delete interactions[key];
    if (engagement[postId]) {
      engagement[postId].feel_count = Math.max(0, engagement[postId].feel_count - 1);
    }
    localStorage.setItem(KEYS.INTERACTIONS, JSON.stringify(interactions));
    localStorage.setItem(KEYS.ENGAGEMENT, JSON.stringify(engagement));
    return { action: 'removed' };
  }
  
  // Add feel
  interactions[key] = { user_id: userId, post_id: postId, type: 'like' };
  if (!engagement[postId]) {
    engagement[postId] = { post_id: postId, feel_count: 0, echo_count: 0, share_count: 0, view_count: 0 };
  }
  engagement[postId].feel_count++;
  
  localStorage.setItem(KEYS.INTERACTIONS, JSON.stringify(interactions));
  localStorage.setItem(KEYS.ENGAGEMENT, JSON.stringify(engagement));
  
  return { action: 'added' };
};

export const hasFeltDemoDrop = (postId: string): boolean => {
  const interactions = JSON.parse(localStorage.getItem(KEYS.INTERACTIONS) || '{}');
  const key = `demo-user-${postId}-like`;
  return !!interactions[key];
};

export const getDemoFeelCount = (postId: string): number => {
  const engagement = getDemoEngagement();
  return engagement[postId]?.feel_count || 0;
};

// ============================================
// ECHOES (Comments)
// ============================================

export const getDemoEchoes = (postId: string): any[] => {
  const stored = localStorage.getItem(KEYS.ECHOES);
  const allEchoes = stored ? JSON.parse(stored) : {};
  return allEchoes[postId] || [];
};

export const saveDemoEcho = (postId: string, content: string): any => {
  const allEchoes = JSON.parse(localStorage.getItem(KEYS.ECHOES) || '{}');
  const user = getDemoUser()!;
  
  if (!allEchoes[postId]) {
    allEchoes[postId] = [];
  }
  
  const newEcho = {
    id: `demo-echo-${Date.now()}`,
    post_id: postId,
    user_id: user.id,
    content,
    created_at: new Date().toISOString(),
    user
  };
  
  allEchoes[postId].push(newEcho);
  localStorage.setItem(KEYS.ECHOES, JSON.stringify(allEchoes));
  
  // Update engagement
  const engagement = getDemoEngagement();
  if (!engagement[postId]) {
    engagement[postId] = { post_id: postId, feel_count: 0, echo_count: 0, share_count: 0, view_count: 0 };
  }
  engagement[postId].echo_count++;
  localStorage.setItem(KEYS.ENGAGEMENT, JSON.stringify(engagement));
  
  return newEcho;
};

// ============================================
// EVENTS
// ============================================

export interface DemoEvent {
  id: string;
  space_id: string;
  name: string;
  description: string;
  location: string;
  event_time: string;
  expires_at: string;
  ticket_price: number;
  max_slots?: number;
  is_paid: boolean;
  created_by: string;
  created_at: string;
}

export const getDemoEvents = (): DemoEvent[] => {
  const stored = localStorage.getItem(KEYS.EVENTS);
  return stored ? JSON.parse(stored) : [];
};

export const getDemoEventForSpace = (spaceId: string): DemoEvent | null => {
  const events = getDemoEvents();
  return events.find(e => e.space_id === spaceId && new Date(e.expires_at) > new Date()) || null;
};

export const saveDemoEvent = (event: Omit<DemoEvent, 'id' | 'created_at'>): DemoEvent => {
  const events = getDemoEvents();
  const user = getDemoUser()!;
  
  const newEvent: DemoEvent = {
    ...event,
    id: `demo-event-${Date.now()}`,
    created_at: new Date().toISOString()
  };
  
  events.unshift(newEvent);
  localStorage.setItem(KEYS.EVENTS, JSON.stringify(events));
  
  return newEvent;
};

// ============================================
// TICKETS
// ============================================

export interface DemoTicket {
  id: string;
  event_id: string;
  user_id: string;
  payment_reference: string;
  status: 'active' | 'used' | 'cancelled';
  created_at: string;
}

export const getDemoTickets = (): DemoTicket[] => {
  const stored = localStorage.getItem(KEYS.TICKETS);
  return stored ? JSON.parse(stored) : [];
};

export const hasDemoTicket = (eventId: string): boolean => {
  const tickets = getDemoTickets();
  return tickets.some(t => t.event_id === eventId && t.user_id === 'demo-user' && t.status === 'active');
};

export const saveDemoTicket = (eventId: string, paymentReference: string): DemoTicket => {
  const tickets = getDemoTickets();
  
  const newTicket: DemoTicket = {
    id: `demo-ticket-${Date.now()}`,
    event_id: eventId,
    user_id: 'demo-user',
    payment_reference: paymentReference,
    status: 'active',
    created_at: new Date().toISOString()
  };
  
  tickets.push(newTicket);
  localStorage.setItem(KEYS.TICKETS, JSON.stringify(tickets));
  
  return newTicket;
};

// ============================================
// VIBES SYSTEM
// ============================================

export const PREDEFINED_VIBES = [
  { id: 'late-night', name: 'Late Night', emoji: '🌙', color: '#6B7FD7' },
  { id: 'chaos', name: 'Chaos', emoji: '⚡', color: '#FF6B35' },
  { id: 'soft', name: 'Soft', emoji: '💫', color: '#FFB6C1' },
  { id: 'deep', name: 'Deep', emoji: '🧠', color: '#4ECDC4' },
  { id: 'funny', name: 'Funny', emoji: '😂', color: '#FFD93D' }
];

export const getDemoUserVibes = (): string[] => {
  const stored = localStorage.getItem(KEYS.USER_VIBES);
  return stored ? JSON.parse(stored) : [];
};

export const followDemoVibe = (vibeId: string): boolean => {
  const vibes = getDemoUserVibes();
  if (!vibes.includes(vibeId)) {
    vibes.push(vibeId);
    localStorage.setItem(KEYS.USER_VIBES, JSON.stringify(vibes));
    return true;
  }
  return false;
};

export const unfollowDemoVibe = (vibeId: string): boolean => {
  const vibes = getDemoUserVibes();
  const index = vibes.indexOf(vibeId);
  if (index > -1) {
    vibes.splice(index, 1);
    localStorage.setItem(KEYS.USER_VIBES, JSON.stringify(vibes));
    return true;
  }
  return false;
};

// ============================================
// STREAK & STATS
// ============================================

export const getDemoStreak = (): number => {
  const stored = localStorage.getItem(KEYS.STREAK);
  return stored ? parseInt(stored) : 0;
};

export const updateDemoStreak = (): number => {
  const lastActive = localStorage.getItem(KEYS.LAST_ACTIVE);
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  let streak = getDemoStreak();
  
  if (lastActive === today) {
    // Already active today
  } else if (lastActive === yesterday) {
    // Continue streak
    streak++;
  } else {
    // Reset streak
    streak = 1;
  }
  
  localStorage.setItem(KEYS.STREAK, streak.toString());
  localStorage.setItem(KEYS.LAST_ACTIVE, today);
  
  return streak;
};

export const getDemoStats = () => {
  const drops = getDemoDrops();
  const totalFeels = drops.reduce((sum, drop) => {
    const engagement = getDemoEngagement()[drop.id];
    return sum + (engagement?.feel_count || 0);
  }, 0);
  
  return {
    dropsCreated: drops.length,
    totalFeels,
    streak: getDemoStreak(),
    reach: drops.length * 12 + totalFeels * 3 // Simulated reach
  };
};

// ============================================
// PULSE (Polls)
// ============================================

export const saveDemoPulse = (pulse: any, options: string[]): any => {
  const pulses = JSON.parse(localStorage.getItem(KEYS.PULSES) || '[]');
  const user = getDemoUser()!;
  
  const newPulse = {
    ...pulse,
    id: `demo-pulse-${Date.now()}`,
    created_at: new Date().toISOString(),
    user,
    options: options.map((text, i) => ({
      id: `demo-opt-${Date.now()}-${i}`,
      post_id: `demo-pulse-${Date.now()}`,
      option_text: text,
      vote_count: 0
    }))
  };
  
  pulses.unshift(newPulse);
  localStorage.setItem(KEYS.PULSES, JSON.stringify(pulses));
  
  return newPulse;
};

export const getDemoPulses = (): any[] => {
  const stored = localStorage.getItem(KEYS.PULSES);
  return stored ? JSON.parse(stored) : [];
};

export const voteDemoPulse = (optionId: string, pulseId: string): void => {
  const pulses = getDemoPulses();
  const pulseIndex = pulses.findIndex((p: any) => p.id === pulseId || p.id === optionId.split('-opt-')[0]);
  
  if (pulseIndex >= 0) {
    const option = pulses[pulseIndex].options.find((o: any) => o.id === optionId);
    if (option) {
      option.vote_count = (option.vote_count || 0) + 1;
      localStorage.setItem(KEYS.PULSES, JSON.stringify(pulses));
    }
  }
};

// ============================================
// SIGNALS (Anonymous Messages)
// ============================================

export interface DemoSignal {
  id: string;
  receiver_id: string;
  content: string;
  mood: 'thoughtful' | 'confession' | 'bold' | 'curious';
  created_at: string;
  read: boolean;
}

export const SIGNAL_MOODS = {
  thoughtful: { emoji: '💭', label: 'Thoughtful', color: '#6B7FD7' },
  confession: { emoji: '❤️', label: 'Confession', color: '#FF6B9D' },
  bold: { emoji: '⚡', label: 'Bold', color: '#FF6B35' },
  curious: { emoji: '👀', label: 'Curious', color: '#4ECDC4' }
};

export const getDemoSignals = (receiverId: string): DemoSignal[] => {
  const stored = localStorage.getItem(KEYS.SIGNALS);
  const allSignals = stored ? JSON.parse(stored) : {};
  return allSignals[receiverId] || [];
};

export const sendDemoSignal = (receiverId: string, content: string, mood: DemoSignal['mood']): DemoSignal => {
  const allSignals = JSON.parse(localStorage.getItem(KEYS.SIGNALS) || '{}');
  
  const newSignal: DemoSignal = {
    id: `demo-signal-${Date.now()}`,
    receiver_id: receiverId,
    content,
    mood,
    created_at: new Date().toISOString(),
    read: false
  };
  
  if (!allSignals[receiverId]) {
    allSignals[receiverId] = [];
  }
  
  allSignals[receiverId].unshift(newSignal);
  localStorage.setItem(KEYS.SIGNALS, JSON.stringify(allSignals));
  
  return newSignal;
};

export const markSignalAsRead = (signalId: string, receiverId: string): void => {
  const allSignals = JSON.parse(localStorage.getItem(KEYS.SIGNALS) || '{}');
  const signals = allSignals[receiverId] || [];
  const signal = signals.find((s: DemoSignal) => s.id === signalId);
  if (signal) {
    signal.read = true;
    localStorage.setItem(KEYS.SIGNALS, JSON.stringify(allSignals));
  }
};

export const getUnreadSignalCount = (receiverId: string): number => {
  const signals = getDemoSignals(receiverId);
  return signals.filter(s => !s.read).length;
};

// ============================================
// MASKS (Temporary Identities)
// ============================================

export interface DemoMask {
  id: string;
  user_id: string;
  name: string;
  avatar: string;
  vibe: string;
  expires_at: string | null;
  created_at: string;
  is_active: boolean;
}

export const getDemoMasks = (): DemoMask[] => {
  const stored = localStorage.getItem(KEYS.MASKS);
  return stored ? JSON.parse(stored) : [];
};

export const getActiveMask = (): DemoMask | null => {
  const stored = localStorage.getItem(KEYS.ACTIVE_MASK);
  if (!stored) return null;
  
  const mask: DemoMask = JSON.parse(stored);
  // Check if expired
  if (mask.expires_at && new Date(mask.expires_at) < new Date()) {
    localStorage.removeItem(KEYS.ACTIVE_MASK);
    return null;
  }
  return mask;
};

export const createDemoMask = (name: string, vibe: string, durationHours?: number): DemoMask => {
  const masks = getDemoMasks();
  const user = getDemoUser()!;
  
  const gradients = [
    'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500'
  ];
  
  const newMask: DemoMask = {
    id: `demo-mask-${Date.now()}`,
    user_id: user.id,
    name,
    avatar: JSON.stringify({
      initial: name.charAt(0).toUpperCase(),
      symbol: '◆',
      gradient: gradients[Math.floor(Math.random() * gradients.length)]
    }),
    vibe,
    expires_at: durationHours ? new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString() : null,
    created_at: new Date().toISOString(),
    is_active: true
  };
  
  masks.push(newMask);
  localStorage.setItem(KEYS.MASKS, JSON.stringify(masks));
  localStorage.setItem(KEYS.ACTIVE_MASK, JSON.stringify(newMask));
  
  return newMask;
};

export const activateMask = (maskId: string): void => {
  const masks = getDemoMasks();
  const mask = masks.find(m => m.id === maskId);
  if (mask) {
    // Deactivate others
    masks.forEach(m => m.is_active = false);
    mask.is_active = true;
    localStorage.setItem(KEYS.MASKS, JSON.stringify(masks));
    localStorage.setItem(KEYS.ACTIVE_MASK, JSON.stringify(mask));
  }
};

export const deactivateMask = (): void => {
  localStorage.removeItem(KEYS.ACTIVE_MASK);
  const masks = getDemoMasks();
  masks.forEach(m => m.is_active = false);
  localStorage.setItem(KEYS.MASKS, JSON.stringify(masks));
};

// ============================================
// VOID WALL (Anonymous Board)
// ============================================

export interface VoidPost {
  id: string;
  content: string;
  mood: string;
  created_at: string;
  expires_at: string;
  feel_count: number;
}

export const getVoidPosts = (): VoidPost[] => {
  const stored = localStorage.getItem(KEYS.VOID_POSTS);
  const posts = stored ? JSON.parse(stored) : [];
  // Filter out expired posts
  const now = new Date().toISOString();
  return posts.filter((p: VoidPost) => p.expires_at > now);
};

export const createVoidPost = (content: string, mood: string): VoidPost => {
  const posts = getVoidPosts();
  
  const newPost: VoidPost = {
    id: `void-${Date.now()}`,
    content,
    mood,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    feel_count: 0
  };
  
  posts.unshift(newPost);
  localStorage.setItem(KEYS.VOID_POSTS, JSON.stringify(posts));
  
  return newPost;
};

export const feelVoidPost = (postId: string): void => {
  const posts = getVoidPosts();
  const post = posts.find(p => p.id === postId);
  if (post) {
    post.feel_count++;
    localStorage.setItem(KEYS.VOID_POSTS, JSON.stringify(posts));
  }
};

// ============================================
// TRUTH OR VOID (Anonymous Game)
// ============================================

export interface TruthSession {
  id: string;
  prompt: string;
  type: 'confession' | 'question' | 'dare';
  created_at: string;
  expires_at: string;
  response_count: number;
}

export interface TruthResponse {
  id: string;
  session_id: string;
  content: string;
  created_at: string;
}

const TRUTH_PROMPTS = {
  confession: [
    'Confess something you\'ve never told anyone',
    'What\'s your biggest secret?',
    'Tell us something you regret'
  ],
  question: [
    'What\'s the most embarrassing thing you\'ve done?',
    'What do you think about when you\'re alone?',
    'What\'s your wildest dream?'
  ],
  dare: [
    'Share a truth that scares you',
    'Tell us what you really think about love',
    'Reveal your hidden talent'
  ]
};

export const getTruthSessions = (): TruthSession[] => {
  const stored = localStorage.getItem(KEYS.TRUTH_SESSIONS);
  const sessions = stored ? JSON.parse(stored) : [];
  const now = new Date().toISOString();
  return sessions.filter((s: TruthSession) => s.expires_at > now);
};

export const getCurrentTruthSession = (): TruthSession | null => {
  const sessions = getTruthSessions();
  return sessions[0] || null;
};

export const createTruthSession = (): TruthSession => {
  const sessions = getTruthSessions();
  const types = ['confession', 'question', 'dare'] as const;
  const type = types[Math.floor(Math.random() * types.length)];
  const prompts = TRUTH_PROMPTS[type];
  const prompt = prompts[Math.floor(Math.random() * prompts.length)];
  
  const newSession: TruthSession = {
    id: `truth-${Date.now()}`,
    prompt,
    type,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
    response_count: 0
  };
  
  sessions.unshift(newSession);
  localStorage.setItem(KEYS.TRUTH_SESSIONS, JSON.stringify(sessions));
  
  return newSession;
};

export const getTruthResponses = (sessionId: string): TruthResponse[] => {
  const stored = localStorage.getItem(KEYS.TRUTH_RESPONSES);
  const allResponses = stored ? JSON.parse(stored) : {};
  return allResponses[sessionId] || [];
};

export const submitTruthResponse = (sessionId: string, content: string): TruthResponse => {
  const allResponses = JSON.parse(localStorage.getItem(KEYS.TRUTH_RESPONSES) || '{}');
  
  const newResponse: TruthResponse = {
    id: `response-${Date.now()}`,
    session_id: sessionId,
    content,
    created_at: new Date().toISOString()
  };
  
  if (!allResponses[sessionId]) {
    allResponses[sessionId] = [];
  }
  
  allResponses[sessionId].push(newResponse);
  localStorage.setItem(KEYS.TRUTH_RESPONSES, JSON.stringify(allResponses));
  
  // Update session response count
  const sessions = getTruthSessions();
  const session = sessions.find(s => s.id === sessionId);
  if (session) {
    session.response_count++;
    localStorage.setItem(KEYS.TRUTH_SESSIONS, JSON.stringify(sessions));
  }
  
  return newResponse;
};

// ============================================
// VIBE MATCH (Anonymous Matching)
// ============================================

export interface VibeMatch {
  id: string;
  user1_id: string;
  user2_id: string;
  space_id: string;
  mood: string;
  created_at: string;
  expires_at: string;
  status: 'active' | 'ended';
}

export const getDemoMatches = (): VibeMatch[] => {
  const stored = localStorage.getItem(KEYS.MATCHES);
  const matches = stored ? JSON.parse(stored) : [];
  const now = new Date().toISOString();
  return matches.filter((m: VibeMatch) => m.expires_at > now && m.status === 'active');
};

export const getActiveMatch = (userId: string): VibeMatch | null => {
  const matches = getDemoMatches();
  return matches.find(m => m.user1_id === userId || m.user2_id === userId) || null;
};

export const createDemoMatch = (userId: string, mood: string): VibeMatch | null => {
  // Check if already in a match
  if (getActiveMatch(userId)) return null;
  
  const matches = getDemoMatches();
  
  // Find an unmatched user (simulated)
  const fakeUserId = `fake-user-${Math.floor(Math.random() * 100)}`;
  
  const newMatch: VibeMatch = {
    id: `match-${Date.now()}`,
    user1_id: userId,
    user2_id: fakeUserId,
    space_id: `match-space-${Date.now()}`,
    mood,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
    status: 'active'
  };
  
  matches.push(newMatch);
  localStorage.setItem(KEYS.MATCHES, JSON.stringify(matches));
  
  return newMatch;
};

export const endMatch = (matchId: string): void => {
  const matches = getDemoMatches();
  const match = matches.find(m => m.id === matchId);
  if (match) {
    match.status = 'ended';
    localStorage.setItem(KEYS.MATCHES, JSON.stringify(matches));
  }
};

// ============================================
// SAVED DROPS
// ============================================

export const getSavedDrops = (): string[] => {
  const stored = localStorage.getItem(KEYS.SAVED_DROPS);
  return stored ? JSON.parse(stored) : [];
};

export const saveDrop = (dropId: string): void => {
  const saved = getSavedDrops();
  if (!saved.includes(dropId)) {
    saved.push(dropId);
    localStorage.setItem(KEYS.SAVED_DROPS, JSON.stringify(saved));
  }
};

export const unsaveDrop = (dropId: string): void => {
  const saved = getSavedDrops();
  const index = saved.indexOf(dropId);
  if (index > -1) {
    saved.splice(index, 1);
    localStorage.setItem(KEYS.SAVED_DROPS, JSON.stringify(saved));
  }
};

export const isDropSaved = (dropId: string): boolean => {
  return getSavedDrops().includes(dropId);
};
