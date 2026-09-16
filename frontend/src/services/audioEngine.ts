// High-Performance 2050 Cybernetic WebAudio Engine for KAUSIC
// Features: 5-Band Biquad Hardware-Level Equalizer, Analyser for Visualizers,
// and a Safe Pre-Amp Volume Booster with Dynamic Limiter to prevent clipping.

export interface EQBandValues {
  band60: number;   // Sub-bass (60Hz)
  band250: number;  // Warmth (250Hz)
  band1k: number;   // Vocal core (1kHz)
  band4k: number;   // Presence (4kHz)
  band12k: number;  // Air & Treble (12kHz)
}

export type EQPresetName = 'bass_overdrive' | 'cyber_surround' | 'vocal_precision' | 'treble_crisp' | 'electronic' | 'pure_flat';

export const EQ_PRESETS: Record<EQPresetName, { name: string; description: string; values: EQBandValues }> = {
  bass_overdrive: {
    name: 'Bass Overdrive',
    description: 'Deep mechanical sub-bass thrust with controlled resonance',
    values: { band60: 9, band250: 4, band1k: -1, band4k: 1, band12k: 3 }
  },
  cyber_surround: {
    name: 'Cyber-Surround',
    description: '3D spatial acoustic widening with elevated highs',
    values: { band60: 5, band250: 1, band1k: 3, band4k: 6, band12k: 8 }
  },
  vocal_precision: {
    name: 'Vocal Precision',
    description: 'Forward clarity focused on human voice and acoustic instruments',
    values: { band60: -2, band250: 1, band1k: 7, band4k: 4, band12k: 0 }
  },
  treble_crisp: {
    name: 'Treble Crisp',
    description: 'Hyper-detailed metallic shimmer and ultra-high clarity',
    values: { band60: 0, band250: 0, band1k: 2, band4k: 7, band12k: 10 }
  },
  electronic: {
    name: 'Electronic / Mecha',
    description: 'Punchy transient response for synthwave and electronic beats',
    values: { band60: 8, band250: 3, band1k: 0, band4k: 5, band12k: 6 }
  },
  pure_flat: {
    name: 'Pure Flat',
    description: 'Reference studio linear frequency response',
    values: { band60: 0, band250: 0, band1k: 0, band4k: 0, band12k: 0 }
  }
};

class AudioEngine {
  private ctx: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private filters: BiquadFilterNode[] = [];
  private boostGainNode: GainNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;
  public analyserNode: AnalyserNode | null = null;
  private isInitialized = false;

  public init(audioElement: HTMLAudioElement) {
    if (this.isInitialized) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();

      // Create Analyser Node for 60fps futuristic visualizers
      this.analyserNode = this.ctx.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.analyserNode.smoothingTimeConstant = 0.8;

      // Create 5-Band Biquad Filters
      const frequencies = [60, 250, 1000, 4000, 12000];
      const types: BiquadFilterType[] = ['lowshelf', 'peaking', 'peaking', 'peaking', 'highshelf'];

      this.filters = frequencies.map((freq, index) => {
        const filter = this.ctx!.createBiquadFilter();
        filter.type = types[index];
        filter.frequency.value = freq;
        filter.gain.value = 0;
        if (types[index] === 'peaking') {
          filter.Q.value = 1.4;
        }
        return filter;
      });

      // Pre-Amp Volume Booster Node (1.0 = 100%, 2.0 = 200%)
      this.boostGainNode = this.ctx.createGain();
      this.boostGainNode.gain.value = 1.0;

      // Dynamics Compressor Limiter (Guards hardware against clipping/distortion)
      this.compressorNode = this.ctx.createDynamicsCompressor();
      this.compressorNode.threshold.value = -6.0;  // dB
      this.compressorNode.knee.value = 10.0;       // dB
      this.compressorNode.ratio.value = 12.0;
      this.compressorNode.attack.value = 0.003;    // sec
      this.compressorNode.release.value = 0.25;    // sec

      // Connect HTML Audio -> Source
      this.sourceNode = this.ctx.createMediaElementSource(audioElement);

      // Chaining: Source -> Filter 0 -> Filter 1 -> ... -> Filter 4 -> Boost -> Limiter -> Analyser -> Output
      let previousNode: AudioNode = this.sourceNode;
      for (const filter of this.filters) {
        previousNode.connect(filter);
        previousNode = filter;
      }

      previousNode.connect(this.boostGainNode);
      this.boostGainNode.connect(this.compressorNode);
      this.compressorNode.connect(this.analyserNode);
      this.analyserNode.connect(this.ctx.destination);

      this.isInitialized = true;
    } catch (err) {
      console.warn('WebAudio initialization postponed until user gesture:', err);
    }
  }

  public async resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
        console.log('[KAUSIC AudioEngine] AudioContext resumed');
      } catch (err) {
        console.warn('[KAUSIC AudioEngine] AudioContext resume warning:', err);
      }
    }
  }

  public setEQ(values: EQBandValues) {
    if (!this.isInitialized || this.filters.length < 5) return;
    this.filters[0].gain.value = values.band60;
    this.filters[1].gain.value = values.band250;
    this.filters[2].gain.value = values.band1k;
    this.filters[3].gain.value = values.band4k;
    this.filters[4].gain.value = values.band12k;
  }

  public setVolumeBoost(multiplier: number) {
    if (!this.boostGainNode) return;
    // Clamp between 1.0 (normal) and 2.0 (200% cyber boost)
    const clamped = Math.max(1.0, Math.min(2.0, multiplier));
    this.boostGainNode.gain.value = clamped;
  }

  public getFrequencyData(array: Uint8Array<ArrayBuffer>) {
    if (this.analyserNode) {
      this.analyserNode.getByteFrequencyData(array);
    }
  }

  // Play subtle mechanical sound effect for robotic UI feedback
  public playRoboticTick() {
    try {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {
      // ignore
    }
  }
}

export const audioEngine = new AudioEngine();
