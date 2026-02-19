export type GamePhase =
  | "menu"
  | "playing"
  | "paused"
  | "skillpick"
  | "levelcomplete"
  | "gameover"
  | "victory"
  | "runsummary";

export type Difficulty = "easy" | "normal" | "hard";

export type SkillId =
  | "damage"
  | "firerate"
  | "speed"
  | "maxhp"
  | "shield"
  | "spread"
  | "pierce"
  | "lifesteal"
  | "sides"
  | "shieldburst"
  | "lucky"
  | "overdrivemissile"
  | "dashtrail";

export interface SkillDef {
  id: SkillId;
  name: string;
  desc: string;
  col: string;
  glow: string;
}

export interface SectorConfig {
  name: string;
  sub: string;
  /** Distance at which this sector's boss spawns */
  bossAt: number;
  bossHp: number;
  bossType: 0 | 1 | 2 | 3 | 4;
  bossName: string;
  /** Min/max distance between enemy spawns in this sector */
  spawnGapMin: number;
  spawnGapMax: number;
  maxEnemies: number;
}

export interface Player {
  x: number;
  y: number;
  r: number;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  shieldRegen: number;
  speed: number;
  dmg: number;
  fireInterval: number;
  fireTimer: number;
  xp: number;
  xpMax: number;
  lvl: number;
  score: number;
  spread: boolean;
  pierce: boolean;
  lifesteal: boolean;
  sides: boolean;
  shieldBurst: boolean;
  lucky: boolean;
  invTimer: number;
  appliedSkills: SkillId[];
}

export type EliteVariant = "fast" | "tanky" | "minion";

export interface Enemy {
  id: number;
  x: number;
  y: number;
  r: number;
  hp: number;
  maxHp: number;
  type: 0 | 1 | 2 | 3;
  elite?: boolean;
  eliteVariant?: EliteVariant;
  vx: number;
  vy: number;
  fireTimer: number;
  xpVal: number;
}

export interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  dmg: number;
  pierce: boolean;
  hitIds: Set<number>;
  trail?: { x: number; y: number }[];
}

export interface Missile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  dmg: number;
}

export interface EnemyBullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface Boss {
  x: number;
  y: number;
  r: number;
  hp: number;
  maxHp: number;
  type: 0 | 1 | 2 | 3 | 4;
  name: string;
  vy: number;
  targetY: number;
  phase: "enter" | "active" | "dead";
  phase2Triggered?: boolean;
  /** Phase 2 super attack: telegraph then fire */
  superTelegraphTimer?: number;
  superCooldown?: number;
  /** Near-death enrage (last 15% HP) */
  enraged?: boolean;
  fireTimer: number;
  fireInterval: number;
  sinOffset: number;
  telegraphTimer?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  col: string;
  r: number;
}

export interface Star {
  x: number;
  y: number;
  spd: number;
  bright: number;
  sz: number;
  twinkle: number;
}

/** Slow parallax layer for depth */
export interface BackStar {
  x: number;
  y: number;
  spd: number;
  bright: number;
  sz: number;
  twinkle: number;
}

/** Tiny drifting particles for space dust */
export interface Dust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

export interface DamageNumber {
  x: number;
  y: number;
  value: number;
  life: number;
  maxLife: number;
  isCrit: boolean;
}

export interface ModifierDef {
  id: string;
  name: string;
  desc: string;
  col: string;
  /** If set, modifier only available after completing challenge */
  unlockId?: string;
}

export interface GameState {
  p: Player;
  bullets: Bullet[];
  missiles: Missile[];
  eBullets: EnemyBullet[];
  enemies: Enemy[];
  particles: Particle[];
  boss: Boss | null;
  bossPhase: boolean;
  levelDone: boolean;
  stars: Star[];
  backStars: BackStar[];
  dust: Dust[];
  keys: Set<string>;
  gameLevel: number;
  distance: number;
  nextSpawnDistance: number;
  pendingLevelUp: boolean;
  levelUpShowTimer: number;
  shake: number;
  shakeTimer: number;
  hitStopTimer: number;
  frame: number;
  msgTimer: number;
  msgStr: string;
  difficulty: Difficulty;
  modifiers: string[];
  highScore: number;
  comboCount: number;
  comboTimer: number;
  dashCooldown: number;
  dashInvulnTimer: number;
  missileCooldown: number;
  /** If set, overrides MISSILE_COOLDOWN_FRAMES (e.g. loadout) */
  missileCooldownMax?: number;
  dodgeRollCooldown: number;
  dodgeRollInvulnTimer: number;
  /** If set, overrides DASH_COOLDOWN_FRAMES */
  dashCooldownMax?: number;
  overdriveMeter: number;
  overdriveActiveTimer: number;
  damageNumbers: DamageNumber[];
  showDamageNumbers: boolean;
  muzzleFlashTimer: number;
  screenFlashTimer: number;
  shieldBurstCooldown: number;
  /** Ghost positions for dodge roll afterimage */
  dodgeRollGhosts: { x: number; y: number; life: number }[];
  /** Brief flash when boss is hit */
  bossHitFlashTimer: number;
  /** Sector entry: no spawns for a few seconds */
  sectorBreatherTimer: number;
  /** Run goal: e.g. elites killed this run */
  elitesKilledThisRun: number;
  /** Run goal target (e.g. 3 for "Kill 3 elites") */
  runGoalTarget: number;
  /** Danger spawn: red border flash */
  dangerFlashTimer: number;
  /** Seed for daily/run RNG (optional) */
  runSeed: number;
  /** Starting loadout id if any */
  startingLoadout: string | null;
  /** Boss phase 2 super attack telegraph */
  bossSuperTelegraphTimer: number;
  /** This run: for stats on end */
  runKills: number;
  runBosses: number;
  runBestCombo: number;
  /** Run start time (Date.now()) for post-run duration */
  runStartTime: number;
  /** Lives remaining (normal: 3, use continue: 1) */
  lives: number;
  /** normal | bossrush | endless */
  gameMode: "normal" | "bossrush" | "endless";
  /** Dash trail segments (dashtrail skill) that damage enemies */
  dashTrailSegments: { x: number; y: number; life: number; dmg: number }[];
}

export interface RunSummary {
  score: number;
  durationMs: number;
  kills: number;
  bosses: number;
  bestCombo: number;
  elites: number;
  skills: SkillId[];
  loadoutId: string;
  won: boolean;
  difficulty: Difficulty;
}
