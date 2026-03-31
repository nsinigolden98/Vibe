// Sound Manager for VIBE

type SoundType = 'click' | 'like' | 'post' | 'notification' | 'vibe' | 'echo' | 'flow';

class SoundManager {
  private sounds: Map<SoundType, HTMLAudioElement> = new Map();
  private enabled: boolean = true;
  private initialized: boolean = false;

  constructor() {
    this.loadSounds();
  }

  private loadSounds() {
    // Create synthetic sounds using Web Audio API
    this.initialized = true;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.enabled) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }

  play(sound: SoundType) {
    if (!this.enabled) return;

    switch (sound) {
      case 'click':
        this.playTone(800, 0.05, 'sine');
        break;
      case 'like':
        this.playTone(600, 0.1, 'sine');
        setTimeout(() => this.playTone(800, 0.15, 'sine'), 50);
        break;
      case 'post':
        this.playTone(400, 0.1, 'sine');
        setTimeout(() => this.playTone(600, 0.1, 'sine'), 100);
        setTimeout(() => this.playTone(800, 0.2, 'sine'), 200);
        break;
      case 'notification':
        this.playTone(500, 0.1, 'sine');
        setTimeout(() => this.playTone(700, 0.2, 'sine'), 100);
        break;
      case 'vibe':
        this.playTone(300, 0.1, 'triangle');
        setTimeout(() => this.playTone(450, 0.15, 'triangle'), 100);
        break;
      case 'echo':
        this.playTone(550, 0.08, 'sine');
        setTimeout(() => this.playTone(650, 0.12, 'sine'), 80);
        break;
      case 'flow':
        this.playTone(700, 0.05, 'sine');
        setTimeout(() => this.playTone(900, 0.1, 'sine'), 50);
        break;
    }
  }

  playClick() {
    this.play('click');
  }

  playLike() {
    this.play('like');
  }

  playPost() {
    this.play('post');
  }

  playNotification() {
    this.play('notification');
  }

  playVibe() {
    this.play('vibe');
  }

  playEcho() {
    this.play('echo');
  }

  playFlow() {
    this.play('flow');
  }
}

export const soundManager = new SoundManager();
export default soundManager;
