import type { Drop, Echo, Pulse, Space, SpaceMessage, Aura, Avatar, Mood, Notification } from '@/types';
import { AVATAR_INITIALS, AVATAR_SYMBOLS, AVATAR_GRADIENTS, BANNER_GRADIENTS } from '@/types';

// Generate random avatar
export const generateAvatar = (): Avatar => ({
  initial: AVATAR_INITIALS[Math.floor(Math.random() * AVATAR_INITIALS.length)],
  symbol: AVATAR_SYMBOLS[Math.floor(Math.random() * AVATAR_SYMBOLS.length)],
  gradient: AVATAR_GRADIENTS[Math.floor(Math.random() * AVATAR_GRADIENTS.length)],
});

// Generate random username
export const generateUsername = (): string => {
  const prefixes = ['Void', 'Neon', 'Echo', 'Pulse', 'Flux', 'Nova', 'Zen', 'Vibe', 'Aura', 'Wave'];
  const suffixes = ['Walker', 'Drifter', 'Seeker', 'Dreamer', 'Rider', 'Caster', 'Weaver', 'Runner', 'Shaper', 'Maker'];
  const numbers = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}${numbers}`;
};

// Generate random aura (user)
export const generateAura = (isGuest = false): Aura => ({
  id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  username: generateUsername(),
  avatar: generateAvatar(),
  vibeCount: Math.floor(Math.random() * 5000),
  vibingCount: Math.floor(Math.random() * 500),
  drops: [],
  pulses: [],
  joinedSpaces: [],
  isGuest,
  banner: BANNER_GRADIENTS[Math.floor(Math.random() * BANNER_GRADIENTS.length)],
});

// Generate random drop
export const generateDrop = (author?: Aura, content?: string, mood?: Mood): Drop => {
  const moods: Mood[] = ['angry', 'happy', 'sad', 'thoughtful', 'funny', 'neutral'];
  const selectedMood = mood || moods[Math.floor(Math.random() * moods.length)];
  const dropAuthor = author || generateAura();
  
  const sampleContents = [
    'The city never sleeps, but sometimes I wish it would just take a nap.',
    'Found a coffee shop that plays only jazz from the 50s. My new sanctuary.',
    'Why do we always want what we can\'t have? The human condition is exhausting.',
    'Just witnessed the most beautiful sunset. Nature really knows how to show off.',
    'Sometimes the best conversations happen in complete silence.',
    'Lost my keys, found myself. Worth it? Jury\'s still out.',
    'The algorithm knows me better than I know myself. Creepy or convenient?',
    'Midnight thoughts hit different when you\'re alone with your playlist.',
    'Adulting is just googling how to do things you should already know.',
    'Therapy session #47: I\'m starting to understand why I do the things I do.',
    'Is it just me or is time moving faster lately?',
    'Found an old photo today. Nostalgia hits hard.',
    'The moon looks especially beautiful tonight.',
    'Why do small things feel so heavy sometimes?',
    'Coffee first, decisions later.',
  ];
  
  return {
    id: `drop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    content: content || sampleContents[Math.floor(Math.random() * sampleContents.length)],
    mood: selectedMood,
    category: 'stream',
    author: dropAuthor,
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 86400000)),
    feelCount: Math.floor(Math.random() * 1000),
    echoCount: Math.floor(Math.random() * 100),
    flowCount: Math.floor(Math.random() * 50),
    seenCount: Math.floor(Math.random() * 5000),
    isGhost: false,
    echoes: [],
    hasFelt: false,
    hasVibed: false,
  };
};

// Generate random pulse (poll)
export const generatePulse = (author?: Aura): Pulse => {
  const questions = [
    'Coffee or tea to start your day?',
    'Night owl or early bird?',
    'Mountains or beach for vacation?',
    'Cats or dogs?',
    'Summer or winter?',
    'Text or call?',
    'Pizza or burgers?',
    'City life or countryside?',
    'Early bird or night owl?',
    'Sweet or savory?',
    'Books or movies?',
    'Rainy days or sunny days?',
    'What\'s your favorite season?',
    'Which superpower would you choose?',
  ];
  
  const twoOptions = [
    [{ id: '1', text: 'Coffee', votes: 342, percentage: 68 }, { id: '2', text: 'Tea', votes: 161, percentage: 32 }],
    [{ id: '1', text: 'Night Owl', votes: 289, percentage: 57 }, { id: '2', text: 'Early Bird', votes: 214, percentage: 43 }],
    [{ id: '1', text: 'Mountains', votes: 198, percentage: 45 }, { id: '2', text: 'Beach', votes: 242, percentage: 55 }],
    [{ id: '1', text: 'Cats', votes: 267, percentage: 52 }, { id: '2', text: 'Dogs', votes: 246, percentage: 48 }],
    [{ id: '1', text: 'Summer', votes: 312, percentage: 61 }, { id: '2', text: 'Winter', votes: 199, percentage: 39 }],
    [{ id: '1', text: 'Text', votes: 378, percentage: 75 }, { id: '2', text: 'Call', votes: 126, percentage: 25 }],
    [{ id: '1', text: 'Pizza', votes: 298, percentage: 58 }, { id: '2', text: 'Burgers', votes: 216, percentage: 42 }],
    [{ id: '1', text: 'City', votes: 234, percentage: 48 }, { id: '2', text: 'Countryside', votes: 254, percentage: 52 }],
  ];
  
  const threeOptions = [
    [{ id: '1', text: 'Spring', votes: 234, percentage: 35 }, { id: '2', text: 'Summer', votes: 312, percentage: 47 }, { id: '3', text: 'Fall', votes: 120, percentage: 18 }],
    [{ id: '1', text: 'Flying', votes: 456, percentage: 52 }, { id: '2', text: 'Invisibility', votes: 234, percentage: 27 }, { id: '3', text: 'Super Strength', votes: 183, percentage: 21 }],
  ];
  
  const fourOptions = [
    [{ id: '1', text: 'Red', votes: 234, percentage: 25 }, { id: '2', text: 'Blue', votes: 312, percentage: 33 }, { id: '3', text: 'Green', votes: 198, percentage: 21 }, { id: '4', text: 'Yellow', votes: 199, percentage: 21 }],
    [{ id: '1', text: 'Action', votes: 234, percentage: 28 }, { id: '2', text: 'Comedy', votes: 312, percentage: 37 }, { id: '3', text: 'Drama', votes: 156, percentage: 19 }, { id: '4', text: 'Horror', votes: 134, percentage: 16 }],
  ];
  
  // Randomly choose 2, 3, or 4 options
  const optionSets = [twoOptions, threeOptions, fourOptions];
  const randomOptionSet = optionSets[Math.floor(Math.random() * optionSets.length)];
  const randomIndex = Math.floor(Math.random() * randomOptionSet.length);
  const randomQuestionIndex = Math.floor(Math.random() * questions.length);
  
  return {
    id: `pulse_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    question: questions[randomQuestionIndex],
    options: randomOptionSet[randomIndex],
    totalVotes: randomOptionSet[randomIndex].reduce((acc, opt) => acc + opt.votes, 0),
    author: author || generateAura(),
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 86400000)),
    hasVoted: false,
  };
};

// Generate random space
export const generateSpace = (): Space => {
  const spaceNames = [
    'Late Night Thoughts',
    'Coffee & Code',
    'Music Discovery',
    'Random Chats',
    'Deep Discussions',
    'Vibe Check',
    'Midnight Confessions',
    'Creative Corner',
    'Mental Health Matters',
    'Book Club',
  ];
  
  const descriptions = [
    'A space for those who think too much at 2am',
    'Developers, designers, and caffeine enthusiasts unite',
    'Share what you\'re listening to right now',
    'No topic is off limits here',
    'Philosophy, life, and everything in between',
    'How are you really feeling?',
    'Say what you can\'t say elsewhere',
    'Art, writing, and creative expression',
    'A safe space to talk about mental health',
    'For book lovers and literary discussions',
  ];
  
  const randomIndex = Math.floor(Math.random() * spaceNames.length);
  
  return {
    id: `space_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: spaceNames[randomIndex],
    description: descriptions[randomIndex],
    activeUsers: Math.floor(Math.random() * 200) + 10,
    messages: [],
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 604800000)),
    isLive: true,
  };
};

// Generate space message
export const generateSpaceMessage = (_spaceId: string): SpaceMessage => {
  const messages = [
    'Anyone else feeling restless tonight?',
    'Just discovered this amazing artist!',
    'The vibes here are immaculate',
    'Can we talk about how fast this year is going?',
    'Who else is procrastinating right now?',
    'Sometimes I feel like I\'m living in a simulation',
    'Just had the weirdest dream last night',
    'Why is adulting so hard?',
    'Sending good vibes to everyone here',
    'This space is exactly what I needed',
    'Anyone want to talk about life?',
    'I need some advice...',
    'What\'s everyone up to?',
    'Feeling grateful today',
    'Small wins matter too',
  ];
  
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    content: messages[Math.floor(Math.random() * messages.length)],
    author: generateAura(),
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 3600000), // Expires in 1 hour
  };
};

// Mock Backend Service
class MockBackend {
  private currentUser: Aura | null = null;
  private drops: Drop[] = [];
  private pulses: Pulse[] = [];
  private spaces: Space[] = [];
  private notifications: Notification[] = [];
  private vibing: Set<string> = new Set();
  private feltDrops: Set<string> = new Set();
  private hiddenDrops: Set<string> = new Set();
  private blockedUsers: Set<string> = new Set();
  private listeners: Map<string, Function[]> = new Map();
  private simulationInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Load from localStorage if available
    this.loadFromStorage();
    
    // Initialize with sample data if empty
    if (this.drops.length === 0) {
      this.initializeData();
    }
    
    this.startSimulation();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      const storedDrops = localStorage.getItem('vibe_drops');
      const storedPulses = localStorage.getItem('vibe_pulses');
      const storedSpaces = localStorage.getItem('vibe_spaces');
      const storedVibing = localStorage.getItem('vibe_vibing');
      const storedFelt = localStorage.getItem('vibe_felt');
      
      if (storedDrops) this.drops = JSON.parse(storedDrops);
      if (storedPulses) this.pulses = JSON.parse(storedPulses);
      if (storedSpaces) this.spaces = JSON.parse(storedSpaces);
      if (storedVibing) this.vibing = new Set(JSON.parse(storedVibing));
      if (storedFelt) this.feltDrops = new Set(JSON.parse(storedFelt));
    } catch (e) {
      console.error('Failed to load from storage:', e);
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('vibe_drops', JSON.stringify(this.drops));
      localStorage.setItem('vibe_pulses', JSON.stringify(this.pulses));
      localStorage.setItem('vibe_spaces', JSON.stringify(this.spaces));
      localStorage.setItem('vibe_vibing', JSON.stringify(Array.from(this.vibing)));
      localStorage.setItem('vibe_felt', JSON.stringify(Array.from(this.feltDrops)));
    } catch (e) {
      console.error('Failed to save to storage:', e);
    }
  }

  private initializeData() {
    // Generate initial drops
    for (let i = 0; i < 20; i++) {
      this.drops.push(generateDrop());
    }
    
    // Generate initial pulses
    for (let i = 0; i < 12; i++) {
      this.pulses.push(generatePulse());
    }
    
    // Generate initial spaces
    for (let i = 0; i < 8; i++) {
      const space = generateSpace();
      // Add some messages to each space
      for (let j = 0; j < 5; j++) {
        space.messages.push(generateSpaceMessage(space.id));
      }
      this.spaces.push(space);
    }
    
    this.saveToStorage();
  }

  private startSimulation() {
    // Simulate real-time activity
    this.simulationInterval = setInterval(() => {
      const now = new Date();
      
      // Remove expired drops (ghost drops with fadeAt)
      const expiredDrops = this.drops.filter(d => d.fadeAt && new Date(d.fadeAt) <= now);
      if (expiredDrops.length > 0) {
        this.drops = this.drops.filter(d => !d.fadeAt || new Date(d.fadeAt) > now);
        expiredDrops.forEach(drop => this.emit('dropExpired', drop));
      }
      
      // Remove expired space messages
      this.spaces.forEach(space => {
        const beforeCount = space.messages.length;
        space.messages = space.messages.filter(m => new Date(m.expiresAt) > now);
        if (space.messages.length !== beforeCount) {
          this.emit('spaceUpdated', space);
        }
      });
      
      // Randomly increment feel counts
      this.drops.forEach(drop => {
        if (Math.random() < 0.1) {
          drop.feelCount += Math.floor(Math.random() * 5);
          this.emit('dropUpdated', drop);
        }
      });
      
      // Randomly add new messages to spaces
      this.spaces.forEach(space => {
        if (Math.random() < 0.05) {
          const newMessage = generateSpaceMessage(space.id);
          space.messages.push(newMessage);
          if (space.messages.length > 20) {
            space.messages.shift();
          }
          space.activeUsers = Math.max(5, space.activeUsers + Math.floor(Math.random() * 5) - 2);
          this.emit('spaceUpdated', space);
        }
      });
      
      // Randomly update pulse votes
      this.pulses.forEach(pulse => {
        if (Math.random() < 0.08) {
          const randomOption = pulse.options[Math.floor(Math.random() * pulse.options.length)];
          randomOption.votes += Math.floor(Math.random() * 3);
          pulse.totalVotes = pulse.options.reduce((acc, opt) => acc + opt.votes, 0);
          pulse.options.forEach(opt => {
            opt.percentage = Math.round((opt.votes / pulse.totalVotes) * 100);
          });
          this.emit('pulseUpdated', pulse);
        }
      });
      
      this.saveToStorage();
    }, 3000);
  }

  stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }

  // Event system
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }
  }

  // Authentication
  loginWithGoogle(): Aura {
    this.currentUser = generateAura(false);
    return this.currentUser;
  }

  loginAsGuest(): Aura {
    this.currentUser = generateAura(true);
    return this.currentUser;
  }

  getCurrentUser(): Aura | null {
    return this.currentUser;
  }

  logout() {
    this.currentUser = null;
    this.vibing.clear();
    this.feltDrops.clear();
    this.saveToStorage();
  }

  // Drops
  getDrops(): Drop[] {
    const now = new Date();
    return this.drops
      .filter(d => !this.hiddenDrops.has(d.id) && !this.blockedUsers.has(d.author.id))
      .filter(d => !d.fadeAt || new Date(d.fadeAt) > now)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getDropById(dropId: string): Drop | undefined {
    return this.drops.find(d => d.id === dropId);
  }

  createDrop(content: string, mood: Mood, category: 'stream' | 'pulse' | 'spaces', isGhost: boolean, fadeMinutes?: number, imageUrl?: string): Drop {
    const drop: Drop = {
      id: `drop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      mood,
      category,
      author: this.currentUser || generateAura(),
      createdAt: new Date(),
      feelCount: 0,
      echoCount: 0,
      flowCount: 0,
      seenCount: 0,
      isGhost,
      fadeAt: fadeMinutes ? new Date(Date.now() + fadeMinutes * 60000) : undefined,
      echoes: [],
      hasFelt: false,
      hasVibed: false,
      imageUrl,
    };
    
    this.drops.unshift(drop);
    this.emit('dropCreated', drop);
    this.saveToStorage();
    return drop;
  }

  feelDrop(dropId: string): boolean {
    const drop = this.drops.find(d => d.id === dropId);
    if (drop && !this.feltDrops.has(dropId)) {
      drop.feelCount++;
      drop.hasFelt = true;
      this.feltDrops.add(dropId);
      this.emit('dropUpdated', drop);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  unfeelDrop(dropId: string): boolean {
    const drop = this.drops.find(d => d.id === dropId);
    if (drop && this.feltDrops.has(dropId)) {
      drop.feelCount = Math.max(0, drop.feelCount - 1);
      drop.hasFelt = false;
      this.feltDrops.delete(dropId);
      this.emit('dropUpdated', drop);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  toggleFeel(dropId: string): boolean {
    if (this.feltDrops.has(dropId)) {
      return this.unfeelDrop(dropId);
    } else {
      return this.feelDrop(dropId);
    }
  }

  addEcho(dropId: string, content: string): Echo | null {
    const drop = this.drops.find(d => d.id === dropId);
    if (drop) {
      const echo: Echo = {
        id: `echo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content,
        author: this.currentUser || generateAura(),
        createdAt: new Date(),
        feelCount: 0,
      };
      drop.echoes = drop.echoes || [];
      drop.echoes.push(echo);
      drop.echoCount++;
      this.emit('dropUpdated', drop);
      this.saveToStorage();
      return echo;
    }
    return null;
  }

  flowDrop(dropId: string): boolean {
    const drop = this.drops.find(d => d.id === dropId);
    if (drop) {
      drop.flowCount++;
      this.emit('dropUpdated', drop);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  hideDrop(dropId: string): boolean {
    this.hiddenDrops.add(dropId);
    this.emit('dropUpdated', { id: dropId, hidden: true });
    this.saveToStorage();
    return true;
  }

  reportDrop(dropId: string, reason: string): boolean {
    // In a real app, this would send to a moderation queue
    console.log(`Drop ${dropId} reported: ${reason}`);
    this.hideDrop(dropId);
    return true;
  }

  // Pulses
  getPulses(): Pulse[] {
    return this.pulses;
  }

  votePulse(pulseId: string, optionId: string): boolean {
    const pulse = this.pulses.find(p => p.id === pulseId);
    if (pulse) {
      // If already voted, remove previous vote
      if (pulse.hasVoted && pulse.userVote) {
        const prevOption = pulse.options.find(o => o.id === pulse.userVote);
        if (prevOption) {
          prevOption.votes = Math.max(0, prevOption.votes - 1);
        }
      }
      
      const option = pulse.options.find(o => o.id === optionId);
      if (option) {
        option.votes++;
        pulse.totalVotes = pulse.options.reduce((acc, opt) => acc + opt.votes, 0);
        pulse.options.forEach(opt => {
          opt.percentage = Math.round((opt.votes / pulse.totalVotes) * 100);
        });
        pulse.hasVoted = true;
        pulse.userVote = optionId;
        this.emit('pulseUpdated', pulse);
        this.saveToStorage();
        return true;
      }
    }
    return false;
  }

  changePulseVote(pulseId: string, newOptionId: string): boolean {
    return this.votePulse(pulseId, newOptionId);
  }

  // Spaces
  getSpaces(): Space[] {
    return this.spaces;
  }

  getSpaceById(spaceId: string): Space | undefined {
    return this.spaces.find(s => s.id === spaceId);
  }

  joinSpace(spaceId: string): Space | null {
    const space = this.spaces.find(s => s.id === spaceId);
    if (space) {
      space.activeUsers++;
      this.emit('spaceUpdated', space);
      this.saveToStorage();
    }
    return space || null;
  }

  leaveSpace(spaceId: string): boolean {
    const space = this.spaces.find(s => s.id === spaceId);
    if (space) {
      space.activeUsers = Math.max(0, space.activeUsers - 1);
      this.emit('spaceUpdated', space);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  sendSpaceMessage(spaceId: string, content: string): SpaceMessage | null {
    const space = this.spaces.find(s => s.id === spaceId);
    if (space) {
      const message: SpaceMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content,
        author: this.currentUser || generateAura(),
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
      };
      space.messages.push(message);
      if (space.messages.length > 20) {
        space.messages.shift();
      }
      this.emit('spaceUpdated', space);
      this.saveToStorage();
      return message;
    }
    return null;
  }

  createSpace(name: string, description: string, expiryMinutes: number = 1440): Space {
    const space: Space = {
      id: `space_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      activeUsers: 1,
      messages: [],
      createdAt: new Date(),
      isLive: true,
      creatorId: this.currentUser?.id,
      expiryMinutes,
    };
    
    this.spaces.unshift(space);
    this.emit('spaceCreated', space);
    this.saveToStorage();
    return space;
  }

  deleteSpace(spaceId: string): boolean {
    const index = this.spaces.findIndex(s => s.id === spaceId);
    if (index > -1) {
      this.spaces.splice(index, 1);
      this.emit('spaceDeleted', { id: spaceId });
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Vibe With (Follow)
  vibeWith(userId: string): boolean {
    if (!this.vibing.has(userId)) {
      this.vibing.add(userId);
      if (this.currentUser) {
        this.currentUser.vibingCount++;
      }
      this.emit('vibeChanged', { userId, vibing: true });
      this.saveToStorage();
      return true;
    }
    return false;
  }

  unvibe(userId: string): boolean {
    if (this.vibing.has(userId)) {
      this.vibing.delete(userId);
      if (this.currentUser) {
        this.currentUser.vibingCount = Math.max(0, this.currentUser.vibingCount - 1);
      }
      this.emit('vibeChanged', { userId, vibing: false });
      this.saveToStorage();
      return true;
    }
    return false;
  }

  toggleVibe(userId: string): boolean {
    if (this.vibing.has(userId)) {
      return this.unvibe(userId);
    } else {
      return this.vibeWith(userId);
    }
  }

  isVibing(userId: string): boolean {
    return this.vibing.has(userId);
  }

  blockUser(userId: string): boolean {
    this.blockedUsers.add(userId);
    this.saveToStorage();
    return true;
  }

  unblockUser(userId: string): boolean {
    this.blockedUsers.delete(userId);
    this.saveToStorage();
    return true;
  }

  // Search
  search(query: string): { drops: Drop[]; auras: Aura[]; spaces: Space[] } {
    const lowerQuery = query.toLowerCase();
    const uniqueAuras = new Map<string, Aura>();
    
    // Collect unique auras from drops
    this.drops.forEach(d => {
      if (!uniqueAuras.has(d.author.id)) {
        uniqueAuras.set(d.author.id, d.author);
      }
    });
    
    return {
      drops: this.drops.filter(d => 
        d.content.toLowerCase().includes(lowerQuery) ||
        d.author.username.toLowerCase().includes(lowerQuery)
      ),
      auras: Array.from(uniqueAuras.values()).filter(a => 
        a.username.toLowerCase().includes(lowerQuery)
      ),
      spaces: this.spaces.filter(s => 
        s.name.toLowerCase().includes(lowerQuery) || 
        s.description.toLowerCase().includes(lowerQuery)
      ),
    };
  }

  searchSuggestions(query: string): string[] {
    const lowerQuery = query.toLowerCase();
    const suggestions: string[] = [];
    
    // Add matching usernames
    this.drops.forEach(d => {
      if (d.author.username.toLowerCase().includes(lowerQuery) && 
          !suggestions.includes(d.author.username)) {
        suggestions.push(d.author.username);
      }
    });
    
    // Add matching space names
    this.spaces.forEach(s => {
      if (s.name.toLowerCase().includes(lowerQuery) && 
          !suggestions.includes(s.name)) {
        suggestions.push(s.name);
      }
    });
    
    return suggestions.slice(0, 5);
  }

  // Notifications
  getNotifications(): Notification[] {
    return this.notifications;
  }

  markNotificationRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  // User Profile
  getUserDrops(userId: string): Drop[] {
    return this.drops.filter(d => d.author.id === userId);
  }

  getUserPulses(userId: string): Pulse[] {
    return this.pulses.filter(p => p.author.id === userId);
  }

  getVibing(): Aura[] {
    return Array.from(this.vibing).map(() => generateAura());
  }

  getVibers(): Aura[] {
    return Array.from({ length: Math.floor(Math.random() * 50) + 10 }, () => generateAura());
  }

  // Delete account
  deleteAccount(): boolean {
    // Clear all user data
    if (this.currentUser) {
      this.drops = this.drops.filter(d => d.author.id !== this.currentUser!.id);
      this.pulses = this.pulses.filter(p => p.author.id !== this.currentUser!.id);
    }
    this.logout();
    this.saveToStorage();
    return true;
  }

  // Clear all data (for testing)
  clearAllData(): boolean {
    this.drops = [];
    this.pulses = [];
    this.spaces = [];
    this.vibing.clear();
    this.feltDrops.clear();
    this.hiddenDrops.clear();
    this.blockedUsers.clear();
    this.notifications = [];
    this.logout();
    this.saveToStorage();
    return true;
  }
}

export const mockBackend = new MockBackend();
export default mockBackend;
