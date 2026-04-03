/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js';
import type { User, Drop, Echo, Space, SpaceMessage, PostEngagement, UserInteraction, Subscription, Badge, UserBadge, VibeRelationship, Notification } from '@/types';

// DEMO MODE: Import demo storage
import {
  isDemoMode as checkDemoMode,
  setDemoUser,
  getDemoDrops,
  saveDemoDrop,
  getDemoSpaces,
  saveDemoSpace,
  getDemoMessages,
  saveDemoMessage,
  feelDemoDrop,
  hasFeltDemoDrop,
  getDemoFeelCount,
  getDemoEchoes,
  saveDemoEcho,
  saveDemoPulse,
  getDemoPulses,
  voteDemoPulse,
  saveDemoEvent,
  getDemoEventForSpace,
  saveDemoTicket,
  hasDemoTicket,
  getDemoStats,
  getDemoUserVibes,
  followDemoVibe,
  unfollowDemoVibe,
  PREDEFINED_VIBES,
  clearDemoData
} from './demoStorage';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// DEMO MODE: Export functions for demo storage
export { setDemoUser, clearDemoData, checkDemoMode };

// DEMO MODE: Check if in demo mode
export const isDemoMode = (): boolean => {
  return checkDemoMode();
};

// DEMO MODE: Helper to simulate success response
const demoSuccess = <T>(data?: T): { data: T | null; error: null } => ({
  data: data || null,
  error: null
});

// Auth functions
export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  });
  return { data, error };
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return { data, error };
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// User functions
export const createUserProfile = async (userId: string, email: string) => {
  const username = generateRandomUsername();
  const avatar = generateRandomAvatar(username);
  
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: userId,
      email,
      username,
      avatar,
      premium: false,
      xp: 0,
      level: 1,
      streak: 0,
      sound_enabled: true
    })
    .select()
    .single();
  
  return { data, error };
};

export const getUserProfile = async (userId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data as User;
};

export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  // DEMO MODE: Skip DB writes
  if (isDemoMode()) {
    return demoSuccess({ ...updates, id: userId });
  }
  
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  return { data, error };
};

// Drop functions
export const createDrop = async (drop: Omit<Drop, 'id' | 'created_at' | 'user'>) => {
  // DEMO MODE: Use localStorage
  if (isDemoMode()) {
    const newDrop = saveDemoDrop(drop);
    return demoSuccess(newDrop);
  }
  
  const { data, error } = await supabase
    .from('drops')
    .insert(drop)
    .select()
    .single();
  
  if (!error && data) {
    // Create engagement row
    await supabase.from('post_engagement').insert({
      post_id: data.id,
      feel_count: 0,
      echo_count: 0,
      share_count: 0,
      view_count: 0
    });
    
    // Add XP for posting
    await addXP(drop.user_id, 10);
    
    // Update streak
    await updateStreak(drop.user_id);
  }
  
  return { data, error };
};

export const getDrops = async (limit = 20, offset = 0): Promise<Drop[]> => {
  // DEMO MODE: Get from localStorage
  if (isDemoMode()) {
    const drops = getDemoDrops();
    return drops.slice(offset, offset + limit);
  }
  
  const { data, error } = await supabase
    .from('drops')
    .select(`
      *,
      user:users(*),
      engagement:post_engagement(*)
    `)
    .is('expires_at', null)
    .or(`expires_at.gt.${new Date().toISOString()}`)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) {
    console.error('Error fetching drops:', error);
    return [];
  }
  
  return data as Drop[] || [];
};

export const getFeedDrops = async (userId: string, limit = 20): Promise<Drop[]> => {
  // DEMO MODE: Get from localStorage
  if (isDemoMode()) {
    return getDemoDrops().slice(0, limit);
  }
  
  // Get drops with algorithmic sorting
  const { data, error } = await supabase
    .rpc('get_feed_drops', {
      p_user_id: userId,
      p_limit: limit
    });
  
  if (error) {
    console.error('Error fetching feed:', error);
    // Fallback to simple query
    return getDrops(limit);
  }
  
  return data as Drop[] || [];
};

export const getUserDrops = async (userId: string, limit = 20): Promise<Drop[]> => {
  // DEMO MODE: Get from localStorage
  if (isDemoMode()) {
    return getDemoDrops().slice(0, limit);
  }
  
  const { data, error } = await supabase
    .from('drops')
    .select(`
      *,
      engagement:post_engagement(*)
    `)
    .eq('user_id', userId)
    .is('expires_at', null)
    .or(`expires_at.gt.${new Date().toISOString()}`)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching user drops:', error);
    return [];
  }
  
  return data as Drop[] || [];
};

// Pulse functions
export const createPulse = async (drop: Omit<Drop, 'id' | 'created_at' | 'user'>, options: string[]) => {
  // DEMO MODE: Use localStorage
  if (isDemoMode()) {
    const pulse = saveDemoPulse(drop, options);
    return demoSuccess(pulse);
  }
  
  const { data, error } = await supabase
    .from('drops')
    .insert({ ...drop, category: 'pulse' })
    .select()
    .single();
  
  if (!error && data) {
    // Create pulse options
    const optionInserts = options.map(text => ({
      post_id: data.id,
      option_text: text,
      vote_count: 0
    }));
    
    await supabase.from('pulse_options').insert(optionInserts);
    
    // Create engagement row
    await supabase.from('post_engagement').insert({
      post_id: data.id,
      feel_count: 0,
      echo_count: 0,
      share_count: 0,
      view_count: 0
    });
  }
  
  return { data, error };
};

export const getPulseOptions = async (postId: string): Promise<any[]> => {
  // DEMO MODE: Get from localStorage
  if (isDemoMode()) {
    const pulses = getDemoPulses();
    const pulse = pulses.find(p => p.id === postId);
    return pulse?.options || [];
  }
  
  const { data, error } = await supabase
    .from('pulse_options')
    .select('*')
    .eq('post_id', postId);
  
  if (error) {
    console.error('Error fetching pulse options:', error);
    return [];
  }
  
  return data || [];
};

export const votePulse = async (optionId: string, userId: string, pulseId?: string): Promise<{ action: 'added' | 'removed' }> => {
  // DEMO MODE: Use localStorage
  if (isDemoMode()) {
    // Extract pulseId from optionId if not provided
    const actualPulseId = pulseId || optionId.split('-opt-')[0];
    if (actualPulseId) {
      voteDemoPulse(optionId, actualPulseId);
    }
    return { action: 'added' };
  }
  
  // Check if user already voted on this pulse
  const { data: existingVote } = await supabase
    .from('pulse_votes')
    .select('*, option:pulse_options(post_id)')
    .eq('user_id', userId)
    .eq('option_id', optionId)
    .single();
  
  if (existingVote) {
    // Remove vote (toggle)
    await supabase.from('pulse_votes').delete().eq('id', existingVote.id);
    await supabase.rpc('decrement_pulse_vote', { p_option_id: optionId });
    return { action: 'removed' };
  }
  
  // Check if user voted on different option in same pulse
  const { data: otherVote } = await supabase
    .from('pulse_votes')
    .select('*, option:pulse_options!inner(post_id)')
    .eq('user_id', userId)
    .eq('option.pulse_options.post_id', existingVote?.option?.post_id)
    .single();
  
  if (otherVote) {
    // Remove old vote
    await supabase.from('pulse_votes').delete().eq('id', otherVote.id);
    await supabase.rpc('decrement_pulse_vote', { p_option_id: otherVote.option_id });
  }
  
  // Add new vote
  await supabase.from('pulse_votes').insert({
    option_id: optionId,
    user_id: userId
  });
  
  await supabase.rpc('increment_pulse_vote', { p_option_id: optionId });
  
  // Add XP for voting
  await addXP(userId, 2);
  
  return { action: 'added' };
};

// Echo functions
export const createEcho = async (echo: Omit<Echo, 'id' | 'created_at' | 'user'>) => {
  // DEMO MODE: Use localStorage
  if (isDemoMode()) {
    const newEcho = saveDemoEcho(echo.post_id, echo.content);
    return demoSuccess(newEcho);
  }
  
  const { data, error } = await supabase
    .from('echoes')
    .insert(echo)
    .select()
    .single();
  
  if (!error) {
    // Update engagement count
    await supabase.rpc('increment_echo_count', { p_post_id: echo.post_id });
    
    // Add XP for commenting
    await addXP(echo.user_id, 5);
  }
  
  return { data, error };
};

export const getEchoes = async (postId: string): Promise<Echo[]> => {
  // DEMO MODE: Get from localStorage
  if (isDemoMode()) {
    return getDemoEchoes(postId);
  }
  
  const { data, error } = await supabase
    .from('echoes')
    .select(`
      *,
      user:users(*)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching echoes:', error);
    return [];
  }
  
  return data as Echo[] || [];
};

// Feel (like) functions
export const feelDrop = async (postId: string, userId: string) => {
  // DEMO MODE: Use localStorage
  if (isDemoMode()) {
    return feelDemoDrop(postId);
  }
  
  // Check if already felt
  const { data: existing } = await supabase
    .from('user_interactions')
    .select('*')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .eq('type', 'like')
    .single();
  
  if (existing) {
    // Remove feel (unlike)
    await supabase.from('user_interactions').delete().eq('id', existing.id);
    await supabase.rpc('decrement_feel_count', { p_post_id: postId });
    return { action: 'removed' };
  }
  
  // Add feel
  await supabase.from('user_interactions').insert({
    user_id: userId,
    post_id: postId,
    type: 'like'
  });
  
  await supabase.rpc('increment_feel_count', { p_post_id: postId });
  
  // Add XP for liking
  await addXP(userId, 1);
  
  return { action: 'added' };
};

export const hasFeltDrop = async (postId: string, userId: string): Promise<boolean> => {
  // DEMO MODE: Check localStorage
  if (isDemoMode()) {
    return hasFeltDemoDrop(postId);
  }
  
  const { data } = await supabase
    .from('user_interactions')
    .select('*')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .eq('type', 'like')
    .single();
  
  return !!data;
};

// Vibe (follow) functions
export const vibeWith = async (followerId: string, followingId: string) => {
  // DEMO MODE: Skip
  if (isDemoMode()) {
    return { action: 'added' };
  }
  
  const { data: existing } = await supabase
    .from('vibe_relationships')
    .select('*')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .single();
  
  if (existing) {
    // Unvibe
    await supabase.from('vibe_relationships').delete().eq('id', existing.id);
    return { action: 'removed' };
  }
  
  // Vibe
  await supabase.from('vibe_relationships').insert({
    follower_id: followerId,
    following_id: followingId
  });
  
  return { action: 'added' };
};

export const getVibing = async (userId: string): Promise<User[]> => {
  // DEMO MODE: Return empty
  if (isDemoMode()) {
    return [];
  }
  
  const { data, error } = await supabase
    .from('vibe_relationships')
    .select('following:users!vibe_relationships_following_id_fkey(*)')
    .eq('follower_id', userId);
  
  if (error) {
    console.error('Error fetching vibing:', error);
    return [];
  }
  
  return (data as any[])?.map(d => d.following) || [];
};

export const getVibers = async (userId: string): Promise<User[]> => {
  // DEMO MODE: Return empty
  if (isDemoMode()) {
    return [];
  }
  
  const { data, error } = await supabase
    .from('vibe_relationships')
    .select('follower:users!vibe_relationships_follower_id_fkey(*)')
    .eq('following_id', userId);
  
  if (error) {
    console.error('Error fetching vibers:', error);
    return [];
  }
  
  return (data as any[])?.map(d => d.follower) || [];
};

export const isVibing = async (followerId: string, followingId: string): Promise<boolean> => {
  // DEMO MODE: Return false
  if (isDemoMode()) {
    return false;
  }
  
  const { data } = await supabase
    .from('vibe_relationships')
    .select('*')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .single();
  
  return !!data;
};

// Space functions
export const createSpace = async (space: Omit<Space, 'id' | 'created_at' | 'user' | 'member_count'>) => {
  // DEMO MODE: Use localStorage
  if (isDemoMode()) {
    const newSpace = saveDemoSpace(space);
    return demoSuccess(newSpace);
  }
  
  const { data, error } = await supabase
    .from('spaces')
    .insert(space)
    .select()
    .single();
  
  return { data, error };
};

export const getSpaces = async (limit = 20): Promise<Space[]> => {
  // DEMO MODE: Use localStorage
  if (isDemoMode()) {
    return getDemoSpaces().slice(0, limit);
  }
  
  const { data, error } = await supabase
    .from('spaces')
    .select(`
      *,
      user:users(*)
    `)
    .is('expires_at', null)
    .or(`expires_at.gt.${new Date().toISOString()}`)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching spaces:', error);
    return [];
  }
  
  return data as Space[] || [];
};

export const getSpaceMessages = async (spaceId: string, limit = 50): Promise<SpaceMessage[]> => {
  // DEMO MODE: Use localStorage
  if (isDemoMode()) {
    return getDemoMessages(spaceId);
  }
  
  const { data, error } = await supabase
    .from('space_messages')
    .select(`
      *,
      user:users(*)
    `)
    .eq('space_id', spaceId)
    .order('created_at', { ascending: true })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching space messages:', error);
    return [];
  }
  
  return data as SpaceMessage[] || [];
};

export const sendSpaceMessage = async (message: Omit<SpaceMessage, 'id' | 'created_at' | 'user'>) => {
  // DEMO MODE: Use localStorage
  if (isDemoMode()) {
    const newMessage = saveDemoMessage(message);
    return demoSuccess(newMessage);
  }
  
  const { data, error } = await supabase
    .from('space_messages')
    .insert(message)
    .select()
    .single();
  
  return { data, error };
};

// Event functions
export const createEvent = async (event: any) => {
  // DEMO MODE: Use localStorage
  if (isDemoMode()) {
    const newEvent = saveDemoEvent(event);
    return demoSuccess(newEvent);
  }
  
  const { data, error } = await supabase
    .from('events')
    .insert(event)
    .select()
    .single();
  
  return { data, error };
};

export const getEventForSpace = async (spaceId: string) => {
  // DEMO MODE: Use localStorage
  if (isDemoMode()) {
    return getDemoEventForSpace(spaceId);
  }
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('space_id', spaceId)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error) return null;
  return data;
};

// Ticket functions
export const createTicket = async (eventId: string, userId: string, paymentReference: string) => {
  // DEMO MODE: Use localStorage
  if (isDemoMode()) {
    const ticket = saveDemoTicket(eventId, paymentReference);
    return demoSuccess(ticket);
  }
  
  const { data, error } = await supabase
    .from('tickets')
    .insert({
      event_id: eventId,
      user_id: userId,
      payment_reference: paymentReference,
      status: 'active'
    })
    .select()
    .single();
  
  return { data, error };
};

export const hasTicket = async (eventId: string, userId: string): Promise<boolean> => {
  // DEMO MODE: Use localStorage
  if (isDemoMode()) {
    return hasDemoTicket(eventId);
  }
  
  const { data } = await supabase
    .from('tickets')
    .select('*')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();
  
  return !!data;
};

// Vibes system
export const getPredefinedVibes = () => PREDEFINED_VIBES;

export const getUserVibes = async (userId: string): Promise<string[]> => {
  // DEMO MODE: Use localStorage
  if (isDemoMode()) {
    return getDemoUserVibes();
  }
  
  const { data, error } = await supabase
    .from('user_vibes')
    .select('vibe_id')
    .eq('user_id', userId);
  
  if (error) return [];
  return data?.map(d => d.vibe_id) || [];
};

export const followVibe = async (userId: string, vibeId: string) => {
  // DEMO MODE: Use localStorage
  if (isDemoMode()) {
    followDemoVibe(vibeId);
    return { success: true };
  }
  
  const { error } = await supabase
    .from('user_vibes')
    .insert({ user_id: userId, vibe_id: vibeId });
  
  return { success: !error };
};

export const unfollowVibe = async (userId: string, vibeId: string) => {
  // DEMO MODE: Use localStorage
  if (isDemoMode()) {
    unfollowDemoVibe(vibeId);
    return { success: true };
  }
  
  const { error } = await supabase
    .from('user_vibes')
    .delete()
    .eq('user_id', userId)
    .eq('vibe_id', vibeId);
  
  return { success: !error };
};

// User stats
export const getUserStats = async (userId: string) => {
  // DEMO MODE: Use localStorage
  if (isDemoMode()) {
    return getDemoStats();
  }
  
  // Get user's drops count
  const { data: drops, error: dropsError } = await supabase
    .from('drops')
    .select('id')
    .eq('user_id', userId);
  
  // Get total feels received
  const { data: engagement, error: engError } = await supabase
    .from('post_engagement')
    .select('feel_count')
    .in('post_id', drops?.map(d => d.id) || []);
  
  const totalFeels = engagement?.reduce((sum, e) => sum + (e.feel_count || 0), 0) || 0;
  
  return {
    dropsCreated: drops?.length || 0,
    totalFeels,
    reach: (drops?.length || 0) * 12 + totalFeels * 3
  };
};

// Gamification functions
export const addXP = async (userId: string, amount: number) => {
  // DEMO MODE: Skip
  if (isDemoMode()) {
    return;
  }
  
  const { data: user } = await supabase
    .from('users')
    .select('xp, level')
    .eq('id', userId)
    .single();
  
  if (!user) return;
  
  const newXP = (user.xp || 0) + amount;
  const newLevel = Math.floor(newXP / 100) + 1;
  
  await supabase
    .from('users')
    .update({
      xp: newXP,
      level: newLevel > (user.level || 1) ? newLevel : user.level
    })
    .eq('id', userId);
};

export const updateStreak = async (userId: string) => {
  // DEMO MODE: Skip
  if (isDemoMode()) {
    return;
  }
  
  const { data: user } = await supabase
    .from('users')
    .select('streak, last_post_date')
    .eq('id', userId)
    .single();
  
  if (!user) return;
  
  const today = new Date().toDateString();
  const lastPost = user.last_post_date ? new Date(user.last_post_date).toDateString() : null;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  let newStreak = user.streak || 0;
  
  if (lastPost === today) {
    // Already posted today, no change
    return;
  } else if (lastPost === yesterday) {
    // Posted yesterday, increment streak
    newStreak += 1;
  } else {
    // Streak broken, reset to 1
    newStreak = 1;
  }
  
  await supabase
    .from('users')
    .update({
      streak: newStreak,
      last_post_date: new Date().toISOString()
    })
    .eq('id', userId);
};

export const getUserBadges = async (userId: string): Promise<UserBadge[]> => {
  // DEMO MODE: Return demo badges
  if (isDemoMode()) {
    return [
      {
        id: 'demo-badge-1',
        user_id: userId,
        badge_id: 'early-bird',
        earned_at: new Date().toISOString(),
        badge: {
          id: 'early-bird',
          name: 'Early Bird',
          description: 'Joined VIBE in demo mode',
          icon: '🐦',
          requirement: 'demo'
        }
      }
    ];
  }
  
  const { data, error } = await supabase
    .from('user_badges')
    .select(`
      *,
      badge:badges(*)
    `)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error fetching badges:', error);
    return [];
  }
  
  return data as UserBadge[] || [];
};

// Search functions
export const searchDrops = async (query: string, limit = 20): Promise<Drop[]> => {
  // DEMO MODE: Search localStorage
  if (isDemoMode()) {
    const drops = getDemoDrops();
    return drops.filter(d => 
      d.content.toLowerCase().includes(query.toLowerCase())
    ).slice(0, limit);
  }
  
  const { data, error } = await supabase
    .from('drops')
    .select(`
      *,
      user:users(*),
      engagement:post_engagement(*)
    `)
    .ilike('content', `%${query}%`)
    .limit(limit);
  
  if (error) {
    console.error('Error searching drops:', error);
    return [];
  }
  
  return data as Drop[] || [];
};

export const searchUsers = async (query: string, limit = 20): Promise<User[]> => {
  // DEMO MODE: Return empty
  if (isDemoMode()) {
    return [];
  }
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .ilike('username', `%${query}%`)
    .limit(limit);
  
  if (error) {
    console.error('Error searching users:', error);
    return [];
  }
  
  return data as User[] || [];
};

// Upload functions
export const uploadImage = async (file: File, folder: string): Promise<string | null> => {
  // DEMO MODE: Return data URL
  if (isDemoMode()) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;
  
  const { error } = await supabase.storage
    .from('vibe-uploads')
    .upload(filePath, file);
  
  if (error) {
    console.error('Error uploading image:', error);
    return null;
  }
  
  const { data } = supabase.storage
    .from('vibe-uploads')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

// Helper functions
function generateRandomUsername(): string {
  const adjectives = ['Cosmic', 'Neon', 'Cyber', 'Digital', 'Quantum', 'Solar', 'Lunar', 'Stellar', 'Aurora', 'Nebula'];
  const nouns = ['Vibe', 'Wave', 'Pulse', 'Echo', 'Flow', 'Drift', 'Spark', 'Glow', 'Flux', 'Zen'];
  const numbers = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${numbers}`;
}

function generateRandomAvatar(username: string): string {
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
  
  const initial = username.charAt(0).toUpperCase();
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  const gradient = gradients[Math.floor(Math.random() * gradients.length)];
  
  return JSON.stringify({ initial, symbol, gradient });
}

// Real-time subscriptions
export const subscribeToSpace = (spaceId: string, callback: (message: SpaceMessage) => void) => {
  return supabase
    .channel(`space:${spaceId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'space_messages',
      filter: `space_id=eq.${spaceId}`
    }, (payload: any) => {
      callback(payload.new as SpaceMessage);
    })
    .subscribe();
};

export const subscribeToTyping = (spaceId: string, callback: (typing: any) => void) => {
  return supabase
    .channel(`typing:${spaceId}`)
    .on('broadcast', { event: 'typing' }, (payload) => {
      callback(payload.payload);
    })
    .subscribe();
};

export const broadcastTyping = async (spaceId: string, user: User) => {
  await supabase.channel(`typing:${spaceId}`).send({
    type: 'broadcast',
    event: 'typing',
    payload: {
      user_id: user.id,
      username: user.username,
      avatar: user.avatar,
      typing_at: new Date().toISOString()
    }
  });
};
