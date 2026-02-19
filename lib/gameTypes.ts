export type GamePhase =
  | "menu"
  | "playing"
  | "paused"
  | "skillpick"
  | "levelcomplete"
  | "gameover"
  | "victory";

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
  | "lucky";

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
  bossType: 0 | 1 | 2;
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

export interface Enemy {
  id: number;
  x: number;
  y: number;
  r: number;
  hp: number;
  maxHp: number;
  type: 0 | 1 | 2 | 3;
  elite?: boolean;
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
  type: 0 | 1 | 2;
  name: string;
  vy: number;
  targetY: number;
  phase: "enter" | "active" | "dead";
  phase2Triggered?: boolean;
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
}

export interface GameState {
  p: Player;
  bullets: Bullet[];
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
  overdriveMeter: number;
  overdriveActiveTimer: number;
  damageNumbers: DamageNumber[];
  showDamageNumbers: boolean;
  muzzleFlashTimer: number;
  screenFlashTimer: number;
  shieldBurstCooldown: number;
}
