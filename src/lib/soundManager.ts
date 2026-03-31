type SoundType = 'click' | 'like' | 'post' | 'notification' | 'navigation' | 'vote' | 'comment' | 'share';

interface SoundConfig {
  frequency: number;
  duration: number;
  type: OscillatorType;
  volume: number;
}

const SOUND_CONFIGS: Record<SoundType, SoundConfig> = {
  click: { frequency: 800, duration: 50, type: 'sine', volume: 0.1 },
  like: { frequency: 600, duration: 100, type: 'sine', volume: 0.15 },
  post: { frequency: 440, duration: 200, type: 'triangle', volume: 0.2 },
  notification: { frequency: 880, duration: 150, type: 'sine', volume: 0.2 },
  navigation: { frequency: 400, duration: 80, type: 'sine', volume: 0.1 },
  vote: { frequency: 520, duration: 100, type: 'sine', volume: 0.15 },
  comment: { frequency: 700, duration: 120, type: 'sine', volume: 0.15 },
  share: { frequency: 500, duration: 100, type: 'triangle', volume: 0.15 },
};

class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private soundPack: string = 'default';

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    const savedSound = localStorage.getItem('soundEnabled');
    this.enabled = savedSound !== null ? JSON.parse(savedSound) : true;
    
    const savedPack = localStorage.getItem('soundPack');
    this.soundPack = savedPack || 'default';
  }

  private getAudioContext(): AudioContext | null {
    if (!this.enabled) return null;
    
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch {
        return null;
      }
    }
    
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    return this.audioContext;
  }

  public play(soundType: SoundType) {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const config = SOUND_CONFIGS[soundType];
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = config.type;
    oscillator.frequency.setValueAtTime(config.frequency, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(config.volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + config.duration / 1000);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + config.duration / 1000);
  }

  public playClick() { this.play('click'); }
  public playLike() { this.play('like'); }
  public playPost() { this.play('post'); }
  public playNotification() { this.play('notification'); }
  public playNavigation() { this.play('navigation'); }
  public playVote() { this.play('vote'); }
  public playComment() { this.play('comment'); }
  public playShare() { this.play('share'); }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    localStorage.setItem('soundEnabled', JSON.stringify(enabled));
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setSoundPack(pack: string) {
    this.soundPack = pack;
    localStorage.setItem('soundPack', pack);
  }

  public getSoundPack(): string {
    return this.soundPack;
  }
}

export const soundManager = new SoundManager();
