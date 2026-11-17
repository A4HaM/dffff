let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;

  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    sharedAudioCtx = new AudioCtx();
  }
  return sharedAudioCtx;
}

function scheduleChimeNote(
  ctx: AudioContext,
  destination: AudioNode,
  freq: number,
  startTime: number,
  duration: number,
  peakGain: number
) {
  // Fundamental warm bell tone
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(freq, startTime);
  gain1.gain.setValueAtTime(0.0001, startTime);
  gain1.gain.linearRampToValueAtTime(peakGain, startTime + 0.005);
  gain1.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc1.connect(gain1);
  gain1.connect(destination);
  osc1.start(startTime);
  osc1.stop(startTime + duration + 0.02);

  // Octave shimmer harmonic
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(freq * 2, startTime);
  gain2.gain.setValueAtTime(0.0001, startTime);
  gain2.gain.linearRampToValueAtTime(peakGain * 0.3, startTime + 0.004);
  gain2.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.55);
  osc2.connect(gain2);
  gain2.connect(destination);
  osc2.start(startTime);
  osc2.stop(startTime + duration * 0.6 + 0.02);

  // Subtle percussive mallet transient
  const osc3 = ctx.createOscillator();
  const gain3 = ctx.createGain();
  osc3.type = 'triangle';
  osc3.frequency.setValueAtTime(freq * 3, startTime);
  gain3.gain.setValueAtTime(0.0001, startTime);
  gain3.gain.linearRampToValueAtTime(peakGain * 0.1, startTime + 0.003);
  gain3.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.065);
  osc3.connect(gain3);
  gain3.connect(destination);
  osc3.start(startTime);
  osc3.stop(startTime + 0.08);
}

function scheduleFanfareNote(
  ctx: AudioContext,
  destination: AudioNode,
  freq: number,
  startTime: number,
  duration: number,
  peakGain: number
) {
  // Rich warm fundamental + soft triangle body
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'triangle';
  osc1.frequency.setValueAtTime(freq, startTime);
  gain1.gain.setValueAtTime(0.0001, startTime);
  gain1.gain.linearRampToValueAtTime(peakGain, startTime + 0.012);
  gain1.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc1.connect(gain1);
  gain1.connect(destination);
  osc1.start(startTime);
  osc1.stop(startTime + duration + 0.03);

  // Pure sine reinforcement for roundness
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(freq, startTime);
  gain2.gain.setValueAtTime(0.0001, startTime);
  gain2.gain.linearRampToValueAtTime(peakGain * 0.65, startTime + 0.01);
  gain2.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 1.05);
  osc2.connect(gain2);
  gain2.connect(destination);
  osc2.start(startTime);
  osc2.stop(startTime + duration * 1.1 + 0.03);

  // Bright bell overtone shimmer
  const osc3 = ctx.createOscillator();
  const gain3 = ctx.createGain();
  osc3.type = 'sine';
  osc3.frequency.setValueAtTime(freq * 2, startTime);
  gain3.gain.setValueAtTime(0.0001, startTime);
  gain3.gain.linearRampToValueAtTime(peakGain * 0.25, startTime + 0.006);
  gain3.gain.exponentialRampToValueAtTime(0.0001, startTime + Math.min(duration * 0.55, 0.35));
  osc3.connect(gain3);
  gain3.connect(destination);
  osc3.start(startTime);
  osc3.stop(startTime + duration + 0.03);
}

function runWithAudio(fn: (ctx: AudioContext) => void): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      void ctx.resume().then(() => fn(ctx)).catch(() => {});
    } else {
      fn(ctx);
    }
  } catch {
    // Ignore Web Audio unavailability
  }
}

/**
 * Plays a bright two-note ascending bell chime inspired by Khan Academy's correct-answer sound.
 */
export function playCorrectAnswerSound(): void {
  runWithAudio((ctx) => {
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.85, ctx.currentTime);
    master.connect(ctx.destination);

    const now = ctx.currentTime + 0.005;
    // Bright two-note ascending chime (B5 -> E6)
    scheduleChimeNote(ctx, master, 987.77, now, 0.24, 0.22);
    scheduleChimeNote(ctx, master, 1318.51, now + 0.095, 0.52, 0.26);
  });
}

/**
 * Plays a warm ascending victory fanfare at the end of a completed quiz.
 */
export function playQuizVictorySound(delaySeconds = 0): void {
  runWithAudio((ctx) => {
    const compressor = ctx.createDynamicsCompressor();
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.8, ctx.currentTime);
    compressor.connect(master);
    master.connect(ctx.destination);

    const t0 = ctx.currentTime + 0.01 + delaySeconds;
    // Ascending C major victory arpeggio resolving into a warm triad
    scheduleFanfareNote(ctx, compressor, 523.25, t0, 0.22, 0.2); // C5
    scheduleFanfareNote(ctx, compressor, 659.25, t0 + 0.1, 0.22, 0.2); // E5
    scheduleFanfareNote(ctx, compressor, 783.99, t0 + 0.2, 0.24, 0.22); // G5

    // Final resolved chord (C5 + E5 + G5 + C6)
    scheduleFanfareNote(ctx, compressor, 523.25, t0 + 0.32, 0.65, 0.13);
    scheduleFanfareNote(ctx, compressor, 659.25, t0 + 0.32, 0.65, 0.13);
    scheduleFanfareNote(ctx, compressor, 783.99, t0 + 0.32, 0.65, 0.14);
    scheduleChimeNote(ctx, compressor, 1046.5, t0 + 0.32, 0.78, 0.22); // C6 bell top
  });
}

/**
 * Plays a grand, sparkling championship fanfare when achieving 100% on a quiz.
 */
export function playPerfectScoreSound(delaySeconds = 0): void {
  runWithAudio((ctx) => {
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-14, ctx.currentTime);
    compressor.knee.setValueAtTime(18, ctx.currentTime);
    compressor.ratio.setValueAtTime(4, ctx.currentTime);

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.9, ctx.currentTime);
    compressor.connect(master);
    master.connect(ctx.destination);

    const t0 = ctx.currentTime + 0.01 + delaySeconds;

    // 1. Energetic ascending pickup flourish (C5 -> E5 -> G5 -> C6)
    scheduleFanfareNote(ctx, compressor, 523.25, t0, 0.18, 0.19);
    scheduleFanfareNote(ctx, compressor, 659.25, t0 + 0.08, 0.18, 0.2);
    scheduleFanfareNote(ctx, compressor, 783.99, t0 + 0.16, 0.2, 0.21);
    scheduleChimeNote(ctx, compressor, 1046.5, t0 + 0.24, 0.26, 0.23);

    // 2. Heroic lift (G5 -> A5 -> B5) into grand climax chord
    scheduleFanfareNote(ctx, compressor, 783.99, t0 + 0.36, 0.16, 0.18);
    scheduleFanfareNote(ctx, compressor, 880.0, t0 + 0.45, 0.16, 0.19);
    scheduleFanfareNote(ctx, compressor, 987.77, t0 + 0.54, 0.18, 0.2);

    // 3. Full lush major climax chord (C4 bass + C5 + E5 + G5 + C6 + E6)
    const chordStart = t0 + 0.64;
    scheduleFanfareNote(ctx, compressor, 261.63, chordStart, 1.05, 0.16); // C4 warm bass
    scheduleFanfareNote(ctx, compressor, 523.25, chordStart, 1.0, 0.16); // C5
    scheduleFanfareNote(ctx, compressor, 659.25, chordStart, 1.0, 0.15); // E5
    scheduleFanfareNote(ctx, compressor, 783.99, chordStart, 1.0, 0.16); // G5
    scheduleChimeNote(ctx, compressor, 1046.5, chordStart, 1.1, 0.24); // C6 lead

    // 4. Sparkling celestial glockenspiel cascade over the ringing chord
    scheduleChimeNote(ctx, compressor, 1318.51, chordStart + 0.08, 0.75, 0.17); // E6
    scheduleChimeNote(ctx, compressor, 1567.98, chordStart + 0.17, 0.85, 0.17); // G6
    scheduleChimeNote(ctx, compressor, 2093.0, chordStart + 0.27, 1.05, 0.19); // C7 crown sparkle
  });
}

/**
 * Plays a crisp, soft cardstock swipe sound when opening a new flashcard.
 */
export function playCardSwipeSound(delaySeconds = 0): void {
  runWithAudio((ctx) => {
    const startTime = ctx.currentTime + 0.005 + delaySeconds;
    const duration = 0.115;
    const bufferSize = Math.ceil(ctx.sampleRate * (duration + 0.03));
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(380, startTime);

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.Q.setValueAtTime(1.8, startTime);
    bandpass.frequency.setValueAtTime(950, startTime);
    bandpass.frequency.exponentialRampToValueAtTime(2600, startTime + duration * 0.45);
    bandpass.frequency.exponentialRampToValueAtTime(1350, startTime + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(0.16, startTime + 0.016);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    noise.connect(highpass);
    highpass.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(ctx.destination);

    noise.start(startTime);
    noise.stop(startTime + duration + 0.02);
  });
}

function scheduleSoftErrorNote(
  ctx: AudioContext,
  destination: AudioNode,
  freq: number,
  startTime: number,
  duration: number,
  peakGain: number
) {
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(950, startTime);
  filter.connect(destination);

  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'triangle';
  osc1.frequency.setValueAtTime(freq, startTime);
  gain1.gain.setValueAtTime(0.0001, startTime);
  gain1.gain.linearRampToValueAtTime(peakGain, startTime + 0.008);
  gain1.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc1.connect(gain1);
  gain1.connect(filter);
  osc1.start(startTime);
  osc1.stop(startTime + duration + 0.02);

  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(freq, startTime);
  gain2.gain.setValueAtTime(0.0001, startTime);
  gain2.gain.linearRampToValueAtTime(peakGain * 0.55, startTime + 0.008);
  gain2.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc2.connect(gain2);
  gain2.connect(filter);
  osc2.start(startTime);
  osc2.stop(startTime + duration + 0.02);
}

/**
 * Plays a muted descending two-note tone when a question is answered incorrectly.
 */
export function playWrongAnswerSound(): void {
  runWithAudio((ctx) => {
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.75, ctx.currentTime);
    master.connect(ctx.destination);

    const now = ctx.currentTime + 0.005;
    // Gentle descending minor interval (Eb4 -> Bb3)
    scheduleSoftErrorNote(ctx, master, 311.13, now, 0.14, 0.2);
    scheduleSoftErrorNote(ctx, master, 233.08, now + 0.105, 0.24, 0.22);
  });
}

function scheduleTromboneNote(
  ctx: AudioContext,
  destination: AudioNode,
  startFreq: number,
  endFreq: number | null,
  startTime: number,
  duration: number,
  peakGain: number,
  withVibrato = false
) {
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.setValueAtTime(2.2, startTime);
  filter.frequency.setValueAtTime(340, startTime);
  filter.frequency.linearRampToValueAtTime(980, startTime + 0.05);
  filter.frequency.exponentialRampToValueAtTime(360, startTime + duration);
  filter.connect(destination);

  const oscSaw = ctx.createOscillator();
  const oscTri = ctx.createOscillator();
  oscSaw.type = 'sawtooth';
  oscTri.type = 'triangle';

  oscSaw.frequency.setValueAtTime(startFreq, startTime);
  oscTri.frequency.setValueAtTime(startFreq * 0.5, startTime);

  if (endFreq !== null) {
    oscSaw.frequency.setValueAtTime(startFreq, startTime + 0.12);
    oscSaw.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration * 0.92);
    oscTri.frequency.setValueAtTime(startFreq * 0.5, startTime + 0.12);
    oscTri.frequency.exponentialRampToValueAtTime(endFreq * 0.5, startTime + duration * 0.92);
  }

  let lfo: OscillatorNode | null = null;
  if (withVibrato) {
    lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(5.5, startTime);
    lfoGain.gain.setValueAtTime(5, startTime);
    lfo.connect(lfoGain);
    lfoGain.connect(oscSaw.frequency);
    lfo.start(startTime + 0.08);
    lfo.stop(startTime + duration + 0.04);
  }

  const gainSaw = ctx.createGain();
  gainSaw.gain.setValueAtTime(0.0001, startTime);
  gainSaw.gain.linearRampToValueAtTime(peakGain, startTime + 0.03);
  gainSaw.gain.setValueAtTime(peakGain * 0.85, startTime + duration * 0.68);
  gainSaw.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  const gainTri = ctx.createGain();
  gainTri.gain.setValueAtTime(0.0001, startTime);
  gainTri.gain.linearRampToValueAtTime(peakGain * 0.75, startTime + 0.03);
  gainTri.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscSaw.connect(gainSaw);
  gainSaw.connect(filter);
  oscTri.connect(gainTri);
  gainTri.connect(filter);

  oscSaw.start(startTime);
  oscSaw.stop(startTime + duration + 0.04);
  oscTri.start(startTime);
  oscTri.stop(startTime + duration + 0.04);
}

/**
 * Plays a dramatic descending "sad trombone" extreme failure sound when quiz accuracy is <= 10%.
 */
export function playExtremeFailureSound(delaySeconds = 0): void {
  runWithAudio((ctx) => {
    const compressor = ctx.createDynamicsCompressor();
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.85, ctx.currentTime);
    compressor.connect(master);
    master.connect(ctx.destination);

    const t0 = ctx.currentTime + 0.01 + delaySeconds;
    // Classic 4-note descending sad trombone (D4 -> C#4 -> C4 -> B3 sagging down)
    scheduleTromboneNote(ctx, compressor, 293.66, null, t0, 0.25, 0.18);
    scheduleTromboneNote(ctx, compressor, 277.18, null, t0 + 0.28, 0.25, 0.18);
    scheduleTromboneNote(ctx, compressor, 261.63, null, t0 + 0.56, 0.25, 0.18);
    scheduleTromboneNote(ctx, compressor, 246.94, 202.0, t0 + 0.85, 0.92, 0.2, true);
  });
}

function scheduleFmChimeNote(
  ctx: AudioContext,
  destination: AudioNode,
  freq: number,
  startTime: number,
  duration: number,
  peakGain: number
) {
  const carrier = ctx.createOscillator();
  const mod = ctx.createOscillator();
  const modGain = ctx.createGain();
  const env = ctx.createGain();

  carrier.type = 'sine';
  carrier.frequency.setValueAtTime(freq, startTime);

  // Classic DX-style 2:1 FM bell modulation that brightens the attack and warms as it rings
  mod.type = 'sine';
  mod.frequency.setValueAtTime(freq * 2, startTime);
  modGain.gain.setValueAtTime(freq * 2.2, startTime);
  modGain.gain.exponentialRampToValueAtTime(Math.max(1, freq * 0.22), startTime + 0.18);

  mod.connect(modGain);
  modGain.connect(carrier.frequency);

  env.gain.setValueAtTime(0.0001, startTime);
  env.gain.linearRampToValueAtTime(peakGain, startTime + 0.004);
  env.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  carrier.connect(env);
  env.connect(destination);

  carrier.start(startTime);
  mod.start(startTime);
  carrier.stop(startTime + duration + 0.03);
  mod.stop(startTime + duration + 0.03);
}

/**
 * Plays an FM-synthesized Japanese EAS / NHK Earthquake Early Warning alarm chime
 * (the signature C7#9 -> C#7#9 ascending arpeggio sequence repeated twice).
 */
export function playJapaneseEasAlarmSound(delaySeconds = 0): void {
  runWithAudio((ctx) => {
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-14, ctx.currentTime);
    compressor.ratio.setValueAtTime(5, ctx.currentTime);

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.85, ctx.currentTime);

    // Subtle broadcast studio echo
    const delay = ctx.createDelay(0.5);
    delay.delayTime.setValueAtTime(0.15, ctx.currentTime);
    const delayFeedback = ctx.createGain();
    delayFeedback.gain.setValueAtTime(0.22, ctx.currentTime);
    const delayTone = ctx.createBiquadFilter();
    delayTone.type = 'lowpass';
    delayTone.frequency.setValueAtTime(3200, ctx.currentTime);
    const wetGain = ctx.createGain();
    wetGain.gain.setValueAtTime(0.24, ctx.currentTime);

    delay.connect(delayTone);
    delayTone.connect(delayFeedback);
    delayFeedback.connect(delay);
    delayTone.connect(wetGain);
    wetGain.connect(master);

    compressor.connect(master);
    compressor.connect(delay);
    master.connect(ctx.destination);

    const t0 = ctx.currentTime + 0.01 + delaySeconds;

    // C7#9 voicing: G4 -> C5 -> E5 -> Bb5 -> D#6
    const chord1 = [392.0, 523.25, 659.25, 932.33, 1244.51];
    // C#7#9 voicing (+1 semitone): G#4 -> C#5 -> F5 -> B5 -> E6
    const chord2 = [415.3, 554.37, 698.46, 987.77, 1318.51];

    const step = 0.056;
    const playArpeggio = (notes: number[], start: number, tailDuration: number) => {
      notes.forEach((freq, idx) => {
        const isTop = idx === notes.length - 1;
        const noteDur = isTop ? tailDuration : 0.56;
        const noteGain = isTop ? 0.22 : 0.14 + idx * 0.012;
        scheduleFmChimeNote(ctx, compressor, freq, start + idx * step, noteDur, noteGain);
      });
    };

    // Cycle 1
    playArpeggio(chord1, t0, 0.72);
    playArpeggio(chord2, t0 + 0.62, 0.85);

    // Cycle 2
    playArpeggio(chord1, t0 + 1.46, 0.72);
    playArpeggio(chord2, t0 + 2.08, 1.05);
  });
}
