import type { SkillDef, SectorConfig, Difficulty, ModifierDef } from "./gameTypes";

export const W = 820;
export const H = 620;

export const HIGH_SCORE_KEY = "voidbreaker_highscore";

export const SKILLS: SkillDef[] = [
  { id: "damage", name: "PLASMA AMP", desc: "Bullet damage ×1.30", col: "#ff6b35", glow: "#ff3300" },
  { id: "firerate", name: "RAPID PULSE", desc: "Fire interval ×0.72 (min 3)", col: "#ff3388", glow: "#ff0055" },
  { id: "speed", name: "ION THRUSTERS", desc: "Move speed ×1.20", col: "#00d4ff", glow: "#0088ff" },
  { id: "maxhp", name: "HULL PLATING", desc: "maxHp +35, heal 35", col: "#44ff88", glow: "#00cc44" },
  { id: "shield", name: "DEFLECTOR GRID", desc: "maxShield +40, shieldRegen +0.12", col: "#4488ff", glow: "#0044ff" },
  { id: "spread", name: "SCATTER CANNON", desc: "Fire 3-way spread", col: "#dd44ff", glow: "#aa00ff" },
  { id: "pierce", name: "PHASER ROUND", desc: "Bullets pierce all enemies", col: "#ffff44", glow: "#ffaa00" },
  { id: "lifesteal", name: "NANO LEECHES", desc: "Each kill heals 6 HP", col: "#ff4466", glow: "#ff0033" },
  { id: "sides", name: "SIDE CANNONS", desc: "Extra bullets from sides", col: "#ff8800", glow: "#ff5500" },
  { id: "shieldburst", name: "SHIELD BURST", desc: "Press B: expend 30 shield for AOE", col: "#88aaff", glow: "#4488ff" },
  { id: "lucky", name: "LUCKY SHOT", desc: "10% chance 2× damage", col: "#ffdd00", glow: "#ffaa00" },
  { id: "overdrivemissile", name: "OVERDRIVE MISSILES", desc: "R fires missiles using 25 OD (no cooldown)", col: "#ff0088", glow: "#ff44aa" },
  { id: "dashtrail", name: "DASH TRAIL", desc: "Dash leaves damaging trail", col: "#00ff88", glow: "#00cc66" },
];

export const HIT_STOP_KILL_FRAMES = 2;
export const HIT_STOP_BOSS_DEATH_FRAMES = 5;
export const COMBO_WINDOW_FRAMES = 120;
export const COMBO_SCORE_MULT_PER = 0.15;
export const DASH_COOLDOWN_FRAMES = 150;
export const DASH_INVULN_FRAMES = 8;
export const DASH_DISTANCE = 48;
export const MISSILE_COOLDOWN_FRAMES = 120;
export const MISSILE_DAMAGE = 55;
export const MISSILE_VY = -7;
export const DODGE_ROLL_COOLDOWN_FRAMES = 100;
export const DODGE_ROLL_INVULN_FRAMES = 10;
export const DODGE_ROLL_DISTANCE = 38;
export const OVERDRIVE_MAX = 100;
export const OVERDRIVE_DURATION_FRAMES = 180;
export const OVERDRIVE_FIRE_RATE_MULT = 2;
export const BOSS_TELEGRAPH_FRAMES = 18;
export const ELITE_SPAWN_CHANCE = 0.12;
export const LEVEL_UP_SHOW_FRAMES = 35;
export const BULLET_TRAIL_LEN = 5;
export const MUZZLE_FLASH_FRAMES = 5;
export const SECTOR_BREATHER_FRAMES = 90;
export const MISSILE_HIT_SHAKE = 3;
export const MISSILE_HIT_SHAKE_FRAMES = 5;
export const BOSS_HIT_FLASH_FRAMES = 3;
export const DODGE_GHOST_LIFE = 12;
export const DANGER_FLASH_FRAMES = 12;
export const RUN_GOAL_ELITES = 3;
export const BOSS_SUPER_TELEGRAPH_FRAMES = 30;
export const BOSS_SUPER_COOLDOWN_FRAMES = 120;
export const BOSS_ENRAGE_HP_PCT = 0.15;
export const MINI_WAVE_CHANCE = 0.08;
export const DANGER_SPAWN_CHANCE = 0.04;

export const DIFFICULTY_CFG: Record<Difficulty, { hpMult: number; scrollMult: number; dmgTakenMult: number; xpMult: number }> = {
  easy: { hpMult: 1.4, scrollMult: 0.85, dmgTakenMult: 0.7, xpMult: 1.2 },
  normal: { hpMult: 1, scrollMult: 1, dmgTakenMult: 1, xpMult: 1 },
  hard: { hpMult: 0.8, scrollMult: 1.2, dmgTakenMult: 1.3, xpMult: 0.9 },
};

export const MODIFIERS: ModifierDef[] = [
  { id: "doublexp", name: "DOUBLE XP", desc: "2× XP from kills", col: "#aa44ff" },
  { id: "fastenemies", name: "FAST ENEMIES", desc: "Enemies move 25% faster", col: "#ff4444" },
  { id: "noshield", name: "NO SHIELD", desc: "Shield upgrades disabled", col: "#888888" },
  { id: "bossrush", name: "BOSS RUSH", desc: "Boss at 60% distance", col: "#ff6600" },
  { id: "glasscannon", name: "GLASS CANNON", desc: "+30% damage, -25% HP", col: "#ff2288" },
  { id: "tank", name: "TANK", desc: "+40% HP, -15% speed", col: "#44ff88" },
  { id: "hardmodeboss", name: "HARD BOSS", desc: "Bosses have extra phase (unlock: beat game)", col: "#ff0088", unlockId: "beat_game" },
];

export interface LoadoutDef {
  id: string;
  name: string;
  desc: string;
  col: string;
}

export const LOADOUTS: LoadoutDef[] = [
  { id: "none", name: "STANDARD", desc: "No bonus", col: "#6688aa" },
  { id: "missile", name: "MISSILE FOCUS", desc: "Missile cooldown −25%", col: "#ff6600" },
  { id: "shield", name: "SHIELD START", desc: "Start with 40 shield", col: "#4488ff" },
  { id: "dash", name: "BLITZ", desc: "Dash cooldown −20%", col: "#00d4ff" },
];

export const LOADOUT_EFFECTS: Record<string, (p: import("./gameTypes").Player, gs: import("./gameTypes").GameState) => void> = {
  none: () => {},
  missile: (_, gs) => { (gs as { missileCooldownMax?: number }).missileCooldownMax = 90; },
  shield: (p) => { p.maxShield = 40; p.shield = 40; },
  dash: (_, gs) => { (gs as { dashCooldownMax?: number }).dashCooldownMax = 120; },
  overdrive: (_, gs) => { gs.overdriveMeter = 50; },
};

export const UNLOCKED_MODIFIERS_KEY = "voidbreaker_unlocks";
export const STATS_KEY = "voidbreaker_stats";
export const DAILY_SEED_KEY = "voidbreaker_daily_seed";
export const SOUND_OPTIONS_KEY = "voidbreaker_sound";
export const META_CURRENCY_KEY = "voidbreaker_meta";
export const LIVES_NORMAL = 3;
export const CONTINUES_PER_RUN = 1;
export const DASH_TRAIL_DMG = 8;
export const DASH_TRAIL_LIFE = 40;
export const OVERDRIVE_MISSILE_COST = 25;
export const BOSS_SUPER_TELEGRAPH_HARD_FRAMES = 18;
export const HARD_BOSS_EXTRA_SUPER = true;
export const META_START_HP_COST = 50;
export const META_4TH_LOADOUT_COST = 100;
export const META_NEW_MOD_COST = 75;
export const PURCHASES_KEY = "voidbreaker_purchases";
export const FPS_CAP_60 = 60;
export const FPS_CAP_30 = 30;

export const DIFFICULTY_TOOLTIPS: Record<import("./gameTypes").Difficulty, string> = {
  easy: "+40% HP, −30% damage taken, +20% XP",
  normal: "Standard",
  hard: "−20% HP, +30% damage taken, −10% XP",
};

/** Base scroll speed (px/frame); world moves down, player stays fixed */
export const BASE_SCROLL_SPEED = 2.2;
/** Extra scroll when holding W/Up (forward thrust) */
export const SCROLL_BOOST = 0.9;

export const LEVELS_CFG: SectorConfig[] = [
  { name: "SECTOR ALPHA", sub: "OUTER RIM", bossAt: 2000, bossHp: 380, bossType: 0, bossName: "CRIMSON DREAD", spawnGapMin: 140, spawnGapMax: 260, maxEnemies: 6 },
  { name: "NEBULA GATE", sub: "DEEP VOID", bossAt: 4500, bossHp: 580, bossType: 1, bossName: "VOID HARBINGER", spawnGapMin: 100, spawnGapMax: 200, maxEnemies: 8 },
  { name: "THE DARK VOID", sub: "END OF ALL", bossAt: 7500, bossHp: 950, bossType: 2, bossName: "OMEGA TITAN", spawnGapMin: 80, spawnGapMax: 160, maxEnemies: 10 },
  { name: "ABYSS CORE", sub: "BEYOND THE RIM", bossAt: 11000, bossHp: 1280, bossType: 3, bossName: "LEVIATHAN", spawnGapMin: 70, spawnGapMax: 150, maxEnemies: 12 },
  { name: "FINAL THRESHOLD", sub: "THE LAST SECTOR", bossAt: 15000, bossHp: 1650, bossType: 4, bossName: "VOID SOVEREIGN", spawnGapMin: 60, spawnGapMax: 130, maxEnemies: 14 },
];

export function xpThresh(lvl: number): number {
  return 85 + lvl * 45;
}

export function rnd(a: number, b: number): number {
  return Math.random() * (b - a) + a;
}

export function clamp(v: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, v));
}

let nextEnemyId = 0;
export function nextId(): number {
  return ++nextEnemyId;
}

export function resetEnemyId(): void {
  nextEnemyId = 0;
}

export function getHighScore(): number {
  if (typeof window === "undefined") return 0;
  try {
    const s = localStorage.getItem(HIGH_SCORE_KEY);
    return s ? Math.max(0, parseInt(s, 10)) : 0;
  } catch {
    return 0;
  }
}

export function setHighScore(score: number): void {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, String(score));
  } catch {
    /* ignore */
  }
}

export function getUnlockedModifiers(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const s = localStorage.getItem(UNLOCKED_MODIFIERS_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

export function setUnlockedModifier(unlockId: string): void {
  try {
    const cur = new Set(getUnlockedModifiers());
    cur.add(unlockId);
    localStorage.setItem(UNLOCKED_MODIFIERS_KEY, JSON.stringify(Array.from(cur)));
  } catch {
    /* ignore */
  }
}

export interface GameStats {
  totalRuns: number;
  totalKills: number;
  bossesKilled: number;
  bestCombo: number;
  gamesWon: number;
  gamesLost: number;
  elitesKilled: number;
}

const defaultStats: GameStats = { totalRuns: 0, totalKills: 0, bossesKilled: 0, bestCombo: 0, gamesWon: 0, gamesLost: 0, elitesKilled: 0 };

export function getStats(): GameStats {
  if (typeof window === "undefined") return { ...defaultStats };
  try {
    const s = localStorage.getItem(STATS_KEY);
    return s ? { ...defaultStats, ...JSON.parse(s) } : { ...defaultStats };
  } catch {
    return { ...defaultStats };
  }
}

export function setStats(stats: Partial<GameStats>): void {
  try {
    const cur = getStats();
    localStorage.setItem(STATS_KEY, JSON.stringify({ ...cur, ...stats }));
  } catch {
    /* ignore */
  }
}

export interface SoundOptions {
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
}

const defaultSoundOptions: SoundOptions = { musicVolume: 0.6, sfxVolume: 0.8, muted: false };

export function getSoundOptions(): SoundOptions {
  if (typeof window === "undefined") return { ...defaultSoundOptions };
  try {
    const s = localStorage.getItem(SOUND_OPTIONS_KEY);
    return s ? { ...defaultSoundOptions, ...JSON.parse(s) } : { ...defaultSoundOptions };
  } catch {
    return { ...defaultSoundOptions };
  }
}

export function setSoundOptions(opts: Partial<SoundOptions>): void {
  try {
    const cur = getSoundOptions();
    localStorage.setItem(SOUND_OPTIONS_KEY, JSON.stringify({ ...cur, ...opts }));
  } catch {
    /* ignore */
  }
}

export function getMetaCurrency(): number {
  if (typeof window === "undefined") return 0;
  try {
    const s = localStorage.getItem(META_CURRENCY_KEY);
    return s ? Math.max(0, parseInt(s, 10)) : 0;
  } catch {
    return 0;
  }
}

export function setMetaCurrency(value: number): void {
  try {
    localStorage.setItem(META_CURRENCY_KEY, String(Math.max(0, value)));
  } catch {
    /* ignore */
  }
}

export const MODE_UNLOCK_KEY = "voidbreaker_modes";
export function getUnlockedModes(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const s = localStorage.getItem(MODE_UNLOCK_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}
export function setUnlockedMode(modeId: string): void {
  try {
    const cur = new Set(getUnlockedModes());
    cur.add(modeId);
    localStorage.setItem(MODE_UNLOCK_KEY, JSON.stringify(Array.from(cur)));
  } catch {
    /* ignore */
  }
}

export function getPurchases(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const s = localStorage.getItem(PURCHASES_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}
export function addPurchase(id: string): void {
  try {
    const cur = new Set(getPurchases());
    cur.add(id);
    localStorage.setItem(PURCHASES_KEY, JSON.stringify(Array.from(cur)));
  } catch {
    /* ignore */
  }
}

/** Extra loadout (unlock via meta) */
export const LOADOUT_EXTRA = { id: "overdrive", name: "OVERDRIVE START", desc: "Start with 50 overdrive", col: "#aa44ff" };
/** Extra modifier (unlock via meta) */
export const MODIFIER_EXTRA = { id: "extralife", name: "EXTRA LIFE", desc: "+1 continue this run", col: "#44ffaa" };

/** Returns a seed for today (YYYY-MM-DD) for daily run consistency */
export function getDailySeed(): number {
  if (typeof window === "undefined") return 0;
  const d = new Date();
  const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i) | 0;
  return Math.abs(h);
}

/** Seeded random: pass seed, returns [0,1) and next seed */
export function seededRnd(seed: number): [number, number] {
  const x = Math.sin(seed * 9999) * 10000;
  const next = (x - Math.floor(x)) * 0x7fffffff | 0;
  return [Math.abs(x - Math.floor(x)), next];
}
