import { supabase } from './supabase';

const AVATAR_SYMBOLS = ['🌀', '⚡', '🔥', '💫', '✨', '🌊', '🎭', '🎨', '🎪', '🎯', '🎲', '🎮', '🎸', '🎹', '🎺', '🎻', '🌈', '🌙', '⭐', '🌟', '💎', '🔮', '🎴', '🏆', '👑'];

const GRADIENTS = [
  'from-red-500 to-orange-500',
  'from-orange-500 to-yellow-500',
  'from-yellow-500 to-green-500',
  'from-green-500 to-teal-500',
  'from-teal-500 to-cyan-500',
  'from-cyan-500 to-blue-500',
  'from-blue-500 to-indigo-500',
  'from-pink-500 to-rose-500',
  'from-fuchsia-500 to-pink-500',
  'from-violet-500 to-purple-500',
];

const ADJECTIVES = ['Swift', 'Bright', 'Silent', 'Cosmic', 'Mystic', 'Wild', 'Bold', 'Cool', 'Epic', 'Stellar', 'Neon', 'Cyber', 'Quantum', 'Nova', 'Lunar'];
const NOUNS = ['Wave', 'Spark', 'Echo', 'Vibe', 'Ghost', 'Storm', 'Flame', 'Shadow', 'Dream', 'Phoenix', 'Dragon', 'Wolf', 'Tiger', 'Hawk', 'Fox'];

function generateUsername(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const number = Math.floor(Math.random() * 9999);
  return `${adjective}${noun}${number}`;
}

function generateAvatar() {
  const symbol = AVATAR_SYMBOLS[Math.floor(Math.random() * AVATAR_SYMBOLS.length)];
  const gradient = GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)];
  return { symbol, gradient };
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/page/streampage`,
    },
  });
  return { data, error };
}

export async function signInAsGuest() {
  const randomEmail = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}@vibe.guest`;
  const randomPassword = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);

  const { data, error } = await supabase.auth.signUp({
    email: randomEmail,
    password: randomPassword,
  });

  if (error) {
    return { data: null, error };
  }

  if (data.user) {
    await createUserProfile(data.user.id);
  }

  return { data, error: null };
}


export async function createUserProfile(userId: string) {
  let username = generateUsername();
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const { data: existingUser } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (!existingUser) break;

    username = generateUsername();
    attempts++;
  }

  const avatar = generateAvatar();

  // ✅ Check if user already exists
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (existing) {
    return { data: existing, error: null };
  }

  // ✅ Create new user
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: userId,
      username,
      avatar_symbol: avatar.symbol,
      avatar_gradient: avatar.gradient,
    })
    .select()
    .single();

  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  return profile;
}
