import { createClient } from '@supabase/supabase-js';
import type { Drop, Echo, Pulse, Space, SpaceMessage, Aura, Mood, Notification } from '@/types';
import { AVATAR_INITIALS, AVATAR_SYMBOLS, AVATAR_GRADIENTS, BANNER_GRADIENTS } from '@/types';

// ===================== SUPABASE INIT =====================
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

// ===================== HELPERS =====================
export const generateAvatar = (): Aura['avatar'] => ({
  initial: AVATAR_INITIALS[Math.floor(Math.random() * AVATAR_INITIALS.length)],
  symbol: AVATAR_SYMBOLS[Math.floor(Math.random() * AVATAR_SYMBOLS.length)],
  gradient: AVATAR_GRADIENTS[Math.floor(Math.random() * AVATAR_GRADIENTS.length)],
});

export const generateUsername = (): string => {
  const p = ['Void','Neon','Echo','Pulse','Flux','Nova','Zen','Vibe','Aura','Wave'];
  const s = ['Walker','Drifter','Seeker','Dreamer','Rider','Caster','Weaver','Runner','Shaper','Maker'];
  const n = Math.floor(Math.random()*9999).toString().padStart(4,'0');
  return `${p[Math.random()*p.length|0]}${s[Math.random()*s.length|0]}${n}`;
};

const generateAura = (): Aura => ({
  id: '',
  username: generateUsername(),
  avatar: generateAvatar(),
  vibeCount: 0,
  vibingCount: 0,
  drops: [],
  pulses: [],
  joinedSpaces: [],
  isGuest: false,
  banner: BANNER_GRADIENTS[Math.floor(Math.random()*BANNER_GRADIENTS.length)]
});

// ===================== BACKEND =====================
class MockBackend {
  private currentUser: Aura | null = null;

  // ================= AUTH =================
  async loginWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
    return data;
  }

  async loginAsGuest() {
    this.currentUser = generateAura();
    return this.currentUser;
  }

  async getSessionUser() {
    const { data } = await supabase.auth.getUser();
    return data.user;
  }

  async logout() {
    await supabase.auth.signOut();
    this.currentUser = null;
  }

  // ================= PROFILE =================
  async ensureProfile(user: any) {
    const username = generateUsername();
    const avatar = generateAvatar();
    const banner = BANNER_GRADIENTS[Math.floor(Math.random()*BANNER_GRADIENTS.length)];

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        username,
        avatar,
        banner
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ================= DROPS =================
  async getDrops(): Promise<Drop[]> {
    const { data, error } = await supabase
      .from('drops')
      .select('*, profiles(username, avatar)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getDropById(id: string) {
    const { data } = await supabase
      .from('drops')
      .select('*')
      .eq('id', id)
      .single();

    return data;
  }

  async createDrop(
    content: string,
    mood: Mood,
    category: 'stream' | 'pulse' | 'spaces',
    isGhost = false,
    fadeMinutes?: number,
    imageUrl?: string
  ) {
    const user = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('drops')
      .insert({
        author_id: user.data.user?.id,
        content,
        mood,
        category,
        is_ghost: isGhost,
        fade_at: fadeMinutes ? new Date(Date.now() + fadeMinutes * 60000) : null,
        image_url: imageUrl
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async feelDrop(dropId: string) {
    const user = await supabase.auth.getUser();

    await supabase.from('drop_feels').upsert({
      user_id: user.data.user?.id,
      drop_id: dropId
    });

    await supabase.rpc('increment_feel', { drop_id: dropId });
  }

  async flowDrop(dropId: string) {
    await supabase.rpc('increment_flow', { drop_id: dropId });
  }

  // ================= ECHO =================
  async addEcho(dropId: string, content: string) {
    const user = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('echoes')
      .insert({
        drop_id: dropId,
        author_id: user.data.user?.id,
        content
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ================= VIBING (FOLLOW) =================
  async vibeWith(userId: string) {
    const user = await supabase.auth.getUser();

    const { error } = await supabase.from('vibes').upsert({
      follower_id: user.data.user?.id,
      following_id: userId
    });

    if (error) throw error;
  }

  async unvibe(userId: string) {
    const user = await supabase.auth.getUser();

    await supabase
      .from('vibes')
      .delete()
      .match({
        follower_id: user.data.user?.id,
        following_id: userId
      });
  }

  // ================= SPACES =================
  async getSpaces(): Promise<Space[]> {
    const { data } = await supabase.from('spaces').select('*');
    return data || [];
  }

  async createSpace(name: string, description: string) {
    const user = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('spaces')
      .insert({
        name,
        description,
        creator_id: user.data.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async sendSpaceMessage(spaceId: string, content: string) {
    const user = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('space_messages')
      .insert({
        space_id: spaceId,
        author_id: user.data.user?.id,
        content,
        expires_at: new Date(Date.now() + 3600000)
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ================= PULSES =================
  async votePulse(pulseId: string, optionId: string) {
    const user = await supabase.auth.getUser();

    const { error } = await supabase.rpc('vote_pulse', {
      pulse_id: pulseId,
      option_id: optionId,
      user_id: user.data.user?.id
    });

    if (error) throw error;
  }

  // ================= NOTIFICATIONS =================
  async getNotifications(): Promise<Notification[]> {
    const user = await supabase.auth.getUser();

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.data.user?.id)
      .order('created_at', { ascending: false });

    return data || [];
  }

  async markNotificationRead(id: string) {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
  }

  // ================= SEARCH =================
  async search(query: string) {
    const lower = `%${query.toLowerCase()}%`;

    const [drops, spaces] = await Promise.all([
      supabase.from('drops').select('*').ilike('content', lower),
      supabase.from('spaces').select('*').ilike('name', lower)
    ]);

    return {
      drops: drops.data || [],
      spaces: spaces.data || []
    };
  }

  // ================= ACCOUNT =================
  async deleteAccount() {
    const user = await supabase.auth.getUser();

    await supabase.from('profiles').delete().eq('id', user.data.user?.id);

    await supabase.auth.signOut();
    this.currentUser = null;
  }
}

export const mockBackend = new MockBackend();
export default mockBackend;