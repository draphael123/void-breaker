/**
 * Space-themed sound effects using Web Audio API (no external files).
 * Call init() on first user gesture (e.g. "Launch Mission"), then play*() as needed.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  return ctx;
}

/** Call on first user interaction so playback works in modern browsers */
export function init(): void {
  const c = getCtx();
  if (c?.state === "suspended") c.resume();
}

function oneShot(
  duration: number,
  fn: (ctx: AudioContext, now: number, gain: GainNode) => void
): void {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const g = c.createGain();
  g.connect(c.destination);
  g.gain.setValueAtTime(0.2, now);
  g.gain.exponentialRampToValueAtTime(0.01, now + duration);
  fn(c, now, g);
  setTimeout(() => {
    g.disconnect();
  }, (duration + 0.1) * 1000);
}

export function playShoot(): void {
  oneShot(0.06, (c, now, gain) => {
    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.04);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.06);
  });
}

export function playEnemyHit(): void {
  oneShot(0.08, (c, now, gain) => {
    const osc = c.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.06);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.08);
  });
}

export function playEnemyDeath(): void {
  oneShot(0.2, (c, now, gain) => {
    const osc = c.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.18);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.2);
    const osc2 = c.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(150, now);
    osc2.frequency.exponentialRampToValueAtTime(60, now + 0.15);
    osc2.connect(gain);
    osc2.start(now);
    osc2.stop(now + 0.15);
  });
}

export function playPlayerHit(): void {
  oneShot(0.15, (c, now, gain) => {
    const osc = c.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.12);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.15);
  });
}

export function playDash(): void {
  oneShot(0.08, (c, now, gain) => {
    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.06);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.08);
  });
}

export function playOverdrive(): void {
  oneShot(0.25, (c, now, gain) => {
    [200, 300, 400].forEach((f, i) => {
      const osc = c.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(f, now + i * 0.06);
      osc.connect(gain);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.15);
    });
  });
}

export function playShieldHit(): void {
  oneShot(0.1, (c, now, gain) => {
    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.1);
  });
}

export function playLevelUp(): void {
  oneShot(0.35, (c, now, gain) => {
    [523, 659, 784].forEach((f, i) => {
      const osc = c.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, now + i * 0.08);
      osc.connect(gain);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.2);
    });
  });
}

export function playSkillPick(): void {
  oneShot(0.12, (c, now, gain) => {
    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.12);
  });
}

export function playBossSpawn(): void {
  oneShot(0.6, (c, now, gain) => {
    const osc = c.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.linearRampToValueAtTime(45, now + 0.5);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.6);
  });
}

export function playBossHit(): void {
  oneShot(0.1, (c, now, gain) => {
    const osc = c.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.08);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.1);
  });
}

export function playBossDeath(): void {
  oneShot(0.5, (c, now, gain) => {
    const osc = c.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.45);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.5);
  });
}

export function playLevelComplete(): void {
  oneShot(0.4, (c, now, gain) => {
    [392, 523, 659].forEach((f, i) => {
      const osc = c.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, now + i * 0.1);
      osc.connect(gain);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.25);
    });
  });
}

export function playGameOver(): void {
  oneShot(0.8, (c, now, gain) => {
    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.75);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.8);
  });
}

export function playVictory(): void {
  oneShot(0.6, (c, now, gain) => {
    [523, 659, 784, 1047].forEach((f, i) => {
      const osc = c.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, now + i * 0.12);
      osc.connect(gain);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.3);
    });
  });
}

/** Optional: subtle ambient drone during gameplay (space hum) */
let droneGain: GainNode | null = null;
let droneOsc: OscillatorNode | null = null;

export function startAmbient(): void {
  const c = getCtx();
  if (!c || droneOsc) return;
  const g = c.createGain();
  g.gain.setValueAtTime(0.03, c.currentTime);
  g.connect(c.destination);
  const osc = c.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(55, c.currentTime);
  osc.connect(g);
  osc.start(c.currentTime);
  droneGain = g;
  droneOsc = osc;
}

export function stopAmbient(): void {
  const c = getCtx();
  if (!c || !droneGain || !droneOsc) return;
  droneGain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3);
  setTimeout(() => {
    droneOsc?.stop();
    droneOsc = null;
    droneGain?.disconnect();
    droneGain = null;
  }, 400);
}
