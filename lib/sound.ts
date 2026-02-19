/**
 * Space-themed sound effects using Web Audio API (no external files).
 * Call init() on first user gesture (e.g. "Launch Mission"), then play*() as needed.
 */

import { getSoundOptions } from "./gameConstants";

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
  const opts = getSoundOptions();
  if (opts.muted) return;
  const now = c.currentTime;
  const g = c.createGain();
  g.connect(c.destination);
  const sfxVol = opts.sfxVolume;
  g.gain.setValueAtTime(0.2 * sfxVol, now);
  g.gain.exponentialRampToValueAtTime(0.01 * sfxVol, now + duration);
  fn(c, now, g);
  setTimeout(() => {
    g.disconnect();
  }, (duration + 0.1) * 1000);
}

export function playShoot(): void {
  const startFreq = 720 + Math.random() * 280;
  const endFreq = startFreq * (0.45 + Math.random() * 0.15);
  const duration = 0.045 + Math.random() * 0.025;
  const ramp = duration * 0.65;
  oneShot(duration, (c, now, gain) => {
    gain.gain.setValueAtTime(0.12 + Math.random() * 0.1, now);
    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + ramp);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + duration);
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

export function playMissile(): void {
  oneShot(0.12, (c, now, gain) => {
    gain.gain.setValueAtTime(0.25, now);
    const osc = c.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.1);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.12);
  });
}

export function playDodgeRoll(): void {
  oneShot(0.06, (c, now, gain) => {
    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.06);
  });
}

export function playCooldownReady(): void {
  oneShot(0.04, (c, now, gain) => {
    gain.gain.setValueAtTime(0.08, now);
    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.03);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.04);
  });
}

export function playDangerSpawn(): void {
  oneShot(0.15, (c, now, gain) => {
    const osc = c.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.15);
  });
}

export function playBossSuper(): void {
  oneShot(0.25, (c, now, gain) => {
    gain.gain.setValueAtTime(0.2, now);
    const osc = c.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.linearRampToValueAtTime(40, now + 0.2);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.25);
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

/** Level and boss music: procedural looping tracks */
type MusicTrack = "level0" | "level1" | "level2" | "level3" | "level4" | "boss0" | "boss1" | "boss2" | "boss3" | "boss4";

let musicGain: GainNode | null = null;
let musicOscs: OscillatorNode[] = [];
let musicIntervalId: ReturnType<typeof setInterval> | null = null;

function stopMusic(): void {
  if (musicIntervalId != null) {
    clearInterval(musicIntervalId);
    musicIntervalId = null;
  }
  musicOscs.forEach((o) => {
    try { o.stop(); } catch { /* already stopped */ }
  });
  musicOscs = [];
  if (musicGain) {
    try { musicGain.disconnect(); } catch { /* already disconnected */ }
    musicGain = null;
  }
}

function drone(c: AudioContext, gain: GainNode, freq: number, type: OscillatorType, vol: number, detune = 0): OscillatorNode {
  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  if (detune) osc.detune.setValueAtTime(detune, c.currentTime);
  osc.connect(gain);
  osc.start(c.currentTime);
  return osc;
}

function oneShotMusic(c: AudioContext, freq: number, duration: number, type: OscillatorType, gainNode: GainNode, startTime: number, vol = 0.08): void {
  const g = c.createGain();
  g.gain.setValueAtTime(vol, startTime);
  g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  g.connect(gainNode);
  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  osc.connect(g);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

function startTrack(track: MusicTrack): void {
  const c = getCtx();
  if (!c) return;
  stopMusic();
  const opts = getSoundOptions();
  const musicVol = opts.muted ? 0 : opts.musicVolume * 0.04;
  const g = c.createGain();
  g.gain.setValueAtTime(musicVol, c.currentTime);
  g.connect(c.destination);
  musicGain = g;
  const now = c.currentTime;

  if (track === "level0") {
    musicOscs = [
      drone(c, g, 65, "sine", 0.5),
      drone(c, g, 98, "sine", 0.35),
    ];
    musicIntervalId = setInterval(() => {
      const ctx = getCtx();
      if (!ctx || !musicGain) return;
      oneShotMusic(ctx, 262, 0.35, "sine", musicGain!, ctx.currentTime, 0.06);
    }, 2400);
  } else if (track === "level1") {
    musicOscs = [
      drone(c, g, 73, "sine", 0.45),
      drone(c, g, 110, "sine", 0.3),
    ];
    musicIntervalId = setInterval(() => {
      const ctx = getCtx();
      if (!ctx || !musicGain) return;
      const t = ctx.currentTime;
      oneShotMusic(ctx, 196, 0.25, "sine", musicGain!, t, 0.05);
      oneShotMusic(ctx, 220, 0.25, "sine", musicGain!, t + 0.2, 0.05);
    }, 2800);
  } else if (track === "level2") {
    musicOscs = [
      drone(c, g, 55, "sine", 0.5),
      drone(c, g, 82, "sine", 0.35),
    ];
    musicIntervalId = setInterval(() => {
      const ctx = getCtx();
      if (!ctx || !musicGain) return;
      const t = ctx.currentTime;
      oneShotMusic(ctx, 165, 0.4, "sawtooth", musicGain!, t, 0.04);
      oneShotMusic(ctx, 123, 0.35, "sine", musicGain!, t + 0.15, 0.04);
    }, 3200);
  } else if (track === "level3") {
    musicOscs = [
      drone(c, g, 48, "sine", 0.45),
      drone(c, g, 72, "sine", 0.3),
    ];
    musicIntervalId = setInterval(() => {
      const ctx = getCtx();
      if (!ctx || !musicGain) return;
      const t = ctx.currentTime;
      oneShotMusic(ctx, 146, 0.35, "sine", musicGain!, t, 0.05);
      oneShotMusic(ctx, 98, 0.3, "sawtooth", musicGain!, t + 0.22, 0.04);
    }, 3000);
  } else if (track === "level4") {
    musicOscs = [
      drone(c, g, 44, "sine", 0.5),
      drone(c, g, 66, "sine", 0.35),
    ];
    musicIntervalId = setInterval(() => {
      const ctx = getCtx();
      if (!ctx || !musicGain) return;
      const t = ctx.currentTime;
      oneShotMusic(ctx, 131, 0.45, "sawtooth", musicGain!, t, 0.05);
      oneShotMusic(ctx, 87, 0.4, "sine", musicGain!, t + 0.2, 0.04);
    }, 3500);
  } else if (track === "boss0") {
    musicOscs = [
      drone(c, g, 49, "sawtooth", 0.25),
      drone(c, g, 73, "sine", 0.2),
    ];
    musicIntervalId = setInterval(() => {
      const ctx = getCtx();
      if (!ctx || !musicGain) return;
      oneShotMusic(ctx, 80, 0.15, "sawtooth", musicGain!, ctx.currentTime, 0.12);
    }, 900);
  } else if (track === "boss1") {
    musicOscs = [
      drone(c, g, 58, "sine", 0.3),
      drone(c, g, 87, "sine", 0.2, 8),
    ];
    musicIntervalId = setInterval(() => {
      const ctx = getCtx();
      if (!ctx || !musicGain) return;
      const t = ctx.currentTime;
      oneShotMusic(ctx, 130, 0.2, "square", musicGain!, t, 0.07);
      oneShotMusic(ctx, 98, 0.25, "sine", musicGain!, t + 0.25, 0.05);
    }, 1200);
  } else if (track === "boss2") {
    musicOscs = [
      drone(c, g, 41, "sawtooth", 0.35),
      drone(c, g, 61, "sine", 0.25),
    ];
    musicIntervalId = setInterval(() => {
      const ctx = getCtx();
      if (!ctx || !musicGain) return;
      const t = ctx.currentTime;
      oneShotMusic(ctx, 55, 0.2, "sawtooth", musicGain!, t, 0.14);
      oneShotMusic(ctx, 82, 0.15, "sine", musicGain!, t + 0.35, 0.08);
    }, 1500);
  } else if (track === "boss3") {
    musicOscs = [
      drone(c, g, 52, "sine", 0.3),
      drone(c, g, 78, "sawtooth", 0.2),
    ];
    musicIntervalId = setInterval(() => {
      const ctx = getCtx();
      if (!ctx || !musicGain) return;
      const t = ctx.currentTime;
      oneShotMusic(ctx, 73, 0.18, "sawtooth", musicGain!, t, 0.1);
      oneShotMusic(ctx, 110, 0.2, "sine", musicGain!, t + 0.3, 0.06);
    }, 1100);
  } else if (track === "boss4") {
    musicOscs = [
      drone(c, g, 37, "sawtooth", 0.4),
      drone(c, g, 55, "sine", 0.28),
    ];
    musicIntervalId = setInterval(() => {
      const ctx = getCtx();
      if (!ctx || !musicGain) return;
      const t = ctx.currentTime;
      oneShotMusic(ctx, 49, 0.25, "sawtooth", musicGain!, t, 0.15);
      oneShotMusic(ctx, 65, 0.2, "sine", musicGain!, t + 0.4, 0.1);
    }, 1300);
  }
}

export function startLevelMusic(level: 0 | 1 | 2 | 3 | 4): void {
  const track: MusicTrack = level === 0 ? "level0" : level === 1 ? "level1" : level === 2 ? "level2" : level === 3 ? "level3" : "level4";
  startTrack(track);
}

export function startBossMusic(bossIndex: 0 | 1 | 2 | 3 | 4): void {
  const track: MusicTrack = bossIndex === 0 ? "boss0" : bossIndex === 1 ? "boss1" : bossIndex === 2 ? "boss2" : bossIndex === 3 ? "boss3" : "boss4";
  startTrack(track);
}

/** Start ambient/level music (same as startLevelMusic(0) for backwards compat) */
export function startAmbient(): void {
  startLevelMusic(0);
}

export function stopAmbient(): void {
  const c = getCtx();
  if (musicGain) {
    c?.currentTime && musicGain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.25);
  }
  setTimeout(() => {
    stopMusic();
  }, 300);
}
