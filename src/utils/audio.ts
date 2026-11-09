// Subtle Web Audio API sound generator for tactile feedback
class AudioManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Creating an AudioContext blocks the main thread for ~200ms. Doing it lazily inside the first
    // hover sound made the first project reveal stutter. So create it (suspended) a couple of
    // seconds after load, when the page is idle, and let the first user gesture just resume it.
    if (typeof window === 'undefined') return;

    const warm = () => {
      const create = () => this.createCtx();
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(create, { timeout: 4000 });
      } else {
        setTimeout(create, 100);
      }
    };
    const afterLoad = () => setTimeout(warm, 2000);
    if (document.readyState === 'complete') afterLoad();
    else window.addEventListener('load', afterLoad, { once: true });

    const unlock = () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
      this.resumeIfNeeded();
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock);
    window.addEventListener('touchstart', unlock, { passive: true });
  }

  private createCtx() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      this.ctx = new AudioCtx();
    }
  }

  // Never creates the context (that happens once, early and idle: see constructor)
  private resumeIfNeeded() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (!this.isMuted) {
      this.playTick();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // The only sound on the site is "Hall": a low, warm chord that blooms slowly and fades into a soft room.
  // It plays when a project opens, and more quietly when one closes. Hovers, ticks and confirmations are silent.
  private room: ConvolverNode | null = null;

  private getRoom(): ConvolverNode | null {
    if (!this.ctx) return null;
    if (this.room) return this.room;
    // a short decaying noise burst, so the chord sits in a room and does not sound dry
    const len = Math.floor(this.ctx.sampleRate * 1.8);
    const ir = this.ctx.createBuffer(2, len, this.ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
    }
    const conv = this.ctx.createConvolver();
    conv.buffer = ir;
    const wet = this.ctx.createGain();
    wet.gain.value = 0.32;
    conv.connect(wet);
    wet.connect(this.ctx.destination);
    this.room = conv;
    return conv;
  }

  public playTick() {
    /* silent */
  }

  public playSelect() {
    /* silent */
  }

  public playOpen() {
    this.hall(1);
  }

  // closing: the same chord, but quieter and shorter, so it reads as the page settling back
  public playClose() {
    this.hall(0.6);
  }

  // the film opening: the same chord, but it swells in slowly (about a second) and rings on, instead of striking at once
  public playSwell() {
    this.hall(1.15, true);
  }

  private hall(level: number, swell = false) {
    if (this.isMuted) return;
    try {
      this.resumeIfNeeded();
      const ctx = this.ctx;
      const room = this.getRoom();
      if (!ctx || !room) return;
      const t = ctx.currentTime + 0.02;

      const voice = (freq: number, delay: number, attack: number, decay: number, peak: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const lp = ctx.createBiquadFilter();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + delay);
        gain.gain.setValueAtTime(0.0001, t + delay);
        gain.gain.linearRampToValueAtTime(peak, t + delay + attack);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + attack + decay);
        lp.type = 'lowpass';
        lp.frequency.value = 1400;
        osc.connect(gain);
        gain.connect(lp);
        lp.connect(ctx.destination);
        const send = ctx.createGain();
        send.gain.value = 0.7;
        lp.connect(send);
        send.connect(room);
        osc.start(t + delay);
        osc.stop(t + delay + attack + decay + 0.05);
      };
      const d = 0.7 + 0.3 * level; // closing rings for a shorter time
      const a = swell ? 3.4 : 1; // a swell takes about three times as long to arrive
      const r = swell ? 1.25 : 1;
      voice(196.0, 0, 0.28 * a, 1.7 * d * r, 0.05 * level);
      voice(293.66, 0.03, 0.3 * a, 1.6 * d * r, 0.032 * level);
      voice(392.0, 0.06, 0.32 * a, 1.5 * d * r, 0.018 * level);
    } catch {
      // Audio context may be restricted by browser policy
    }
  }
}

export const soundFx = new AudioManager();
