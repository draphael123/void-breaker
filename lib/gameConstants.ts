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
];

export const HIT_STOP_KILL_FRAMES = 2;
export const HIT_STOP_BOSS_DEATH_FRAMES = 5;
export const COMBO_WINDOW_FRAMES = 120;
export const COMBO_SCORE_MULT_PER = 0.15;
export const DASH_COOLDOWN_FRAMES = 150;
export const DASH_INVULN_FRAMES = 8;
export const DASH_DISTANCE = 48;
export const OVERDRIVE_MAX = 100;
export const OVERDRIVE_DURATION_FRAMES = 180;
export const OVERDRIVE_FIRE_RATE_MULT = 2;
export const BOSS_TELEGRAPH_FRAMES = 18;
export const ELITE_SPAWN_CHANCE = 0.12;
export const LEVEL_UP_SHOW_FRAMES = 35;
export const BULLET_TRAIL_LEN = 5;
export const MUZZLE_FLASH_FRAMES = 5;

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
];

/** Base scroll speed (px/frame); world moves down, player stays fixed */
export const BASE_SCROLL_SPEED = 2.2;
/** Extra scroll when holding W/Up (forward thrust) */
export const SCROLL_BOOST = 0.9;

export const LEVELS_CFG: SectorConfig[] = [
  { name: "SECTOR ALPHA", sub: "OUTER RIM", bossAt: 2000, bossHp: 380, bossType: 0, bossName: "CRIMSON DREAD", spawnGapMin: 140, spawnGapMax: 260, maxEnemies: 6 },
  { name: "NEBULA GATE", sub: "DEEP VOID", bossAt: 4500, bossHp: 580, bossType: 1, bossName: "VOID HARBINGER", spawnGapMin: 100, spawnGapMax: 200, maxEnemies: 8 },
  { name: "THE DARK VOID", sub: "END OF ALL", bossAt: 7500, bossHp: 950, bossType: 2, bossName: "OMEGA TITAN", spawnGapMin: 80, spawnGapMax: 160, maxEnemies: 10 },
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
