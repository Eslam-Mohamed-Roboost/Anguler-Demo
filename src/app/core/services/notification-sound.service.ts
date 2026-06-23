import { Injectable } from '@angular/core';

type AudioContextConstructor = new () => AudioContext;
type SoundKind = 'message' | 'notification';

@Injectable({ providedIn: 'root' })
export class NotificationSoundService {
  private audioContext: AudioContext | null = null;
  private lastPlayedAt = 0;

  constructor() {
    this.registerUnlockListeners();
  }

  play(kind: SoundKind = 'message'): void {
    const now = Date.now();
    if (now - this.lastPlayedAt < 450) return;

    this.lastPlayedAt = now;
    void this.playAsync(kind);
  }

  unlock(): void {
    const context = this.getAudioContext();
    if (context?.state === 'suspended') {
      void context.resume();
    }
  }

  private async playAsync(kind: SoundKind): Promise<void> {
    const context = this.getAudioContext();
    if (!context) return;

    if (context.state === 'suspended') {
      try {
        await context.resume();
      } catch {
        return;
      }
    }

    if (context.state !== 'running') return;

    const now = context.currentTime;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.22, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
    gain.connect(context.destination);

    this.playTone(context, gain, kind === 'message' ? 740 : 540, now, 0.16);
    this.playTone(context, gain, kind === 'message' ? 1040 : 760, now + 0.15, 0.2);
  }

  private playTone(
    context: AudioContext,
    destination: AudioNode,
    frequency: number,
    startTime: number,
    duration: number,
  ): void {
    const oscillator = context.createOscillator();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.connect(destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  private getAudioContext(): AudioContext | null {
    if (this.audioContext) return this.audioContext;
    if (typeof window === 'undefined') return null;

    const win = window as Window & typeof globalThis & {
      webkitAudioContext?: AudioContextConstructor;
    };
    const AudioContextCtor = win.AudioContext ?? win.webkitAudioContext;
    if (!AudioContextCtor) return null;

    this.audioContext = new AudioContextCtor();
    return this.audioContext;
  }

  private registerUnlockListeners(): void {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      this.unlock();
    };

    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock);
  }
}
