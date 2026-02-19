"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { GamePhase, GameState, Player, SkillId, Difficulty } from "@/lib/gameTypes";
import {
  W,
  H,
  SKILLS,
  LEVELS_CFG,
  BASE_SCROLL_SPEED,
  SCROLL_BOOST,
  xpThresh,
  rnd,
  clamp,
  nextId,
  resetEnemyId,
  getHighScore,
  setHighScore,
  HIT_STOP_KILL_FRAMES,
  HIT_STOP_BOSS_DEATH_FRAMES,
  COMBO_WINDOW_FRAMES,
  COMBO_SCORE_MULT_PER,
  DASH_COOLDOWN_FRAMES,
  DASH_INVULN_FRAMES,
  DASH_DISTANCE,
  OVERDRIVE_MAX,
  OVERDRIVE_DURATION_FRAMES,
  OVERDRIVE_FIRE_RATE_MULT,
  BOSS_TELEGRAPH_FRAMES,
  ELITE_SPAWN_CHANCE,
  LEVEL_UP_SHOW_FRAMES,
  BULLET_TRAIL_LEN,
  MUZZLE_FLASH_FRAMES,
  DIFFICULTY_CFG,
  MODIFIERS,
} from "@/lib/gameConstants";
import {
  drawBackStars,
  drawDust,
  drawStars,
  drawNebulaPulse,
  drawPlayer,
  drawEnemy,
  drawBoss,
  drawBossTelegraph,
  drawBullet,
  drawEBullet,
  drawParticle,
  drawHUD,
  drawCenterMessage,
  drawDamageNumbers,
  drawMuzzleFlash,
  drawLevelUpMessage,
  drawScreenFlash,
} from "@/lib/gameDraw";
import * as sound from "@/lib/sound";

function makeStars() {
  return Array.from({ length: 120 }, () => ({
    x: rnd(0, W),
    y: rnd(0, H),
    spd: rnd(0.3, 2.0),
    bright: rnd(0.25, 1),
    sz: rnd(1, 1.5) > 1.2 ? 2 : 1,
    twinkle: rnd(0.02, 0.1),
  }));
}

function makeBackStars() {
  return Array.from({ length: 65 }, () => ({
    x: rnd(0, W),
    y: rnd(0, H),
    spd: rnd(0.15, 0.7),
    bright: rnd(0.3, 0.9),
    sz: 1,
    twinkle: rnd(0.015, 0.06),
  }));
}

function makeDust() {
  return Array.from({ length: 55 }, () => ({
    x: rnd(0, W),
    y: rnd(0, H),
    vx: rnd(-0.08, 0.08),
    vy: rnd(-0.02, 0.05),
    size: rnd(0.8, 1.8),
    alpha: rnd(0.04, 0.14),
  }));
}

function makePlayer(difficulty: Difficulty): Player {
  const cfg = DIFFICULTY_CFG[difficulty];
  const maxHp = Math.round(100 * cfg.hpMult);
  return {
    x: W / 2,
    y: H - 110,
    r: 14,
    hp: maxHp,
    maxHp,
    shield: 0,
    maxShield: 0,
    shieldRegen: 0,
    speed: 4.5,
    dmg: 20,
    fireInterval: 10,
    fireTimer: 0,
    xp: 0,
    xpMax: xpThresh(1),
    lvl: 1,
    score: 0,
    spread: false,
    pierce: false,
    lifesteal: false,
    sides: false,
    shieldBurst: false,
    lucky: false,
    invTimer: 0,
    appliedSkills: [],
  };
}

const overlayStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(0,3,12,0.92)",
};

function btnStyle(col: string): React.CSSProperties {
  return {
    background: "transparent",
    border: `2px solid ${col}`,
    color: col,
    padding: "13px 40px",
    fontSize: 13,
    fontFamily: "'Courier New', monospace",
    cursor: "pointer",
    letterSpacing: 3,
    fontWeight: 900,
    textShadow: `0 0 8px ${col}`,
    boxShadow: `0 0 25px ${col}33`,
    transition: "all 0.2s",
  };
}

export default function VoidBreaker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gsRef = useRef<GameState | null>(null);
  const rafRef = useRef<number>(0);
  const phaseRef = useRef<GamePhase>("menu");

  const [uiPhase, setUiPhase] = useState<GamePhase>("menu");
  const [skillChoices, setSkillChoices] = useState<typeof SKILLS>([]);
  const [endScore, setEndScore] = useState(0);
  const [newHighScore, setNewHighScore] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [selectedModifier, setSelectedModifier] = useState<string | null>(null);

  const setPhase = useCallback((p: GamePhase) => {
    phaseRef.current = p;
    setUiPhase(p);
  }, []);

  const spawnEnemy = useCallback(
    (gs: GameState, type: 0 | 1 | 2 | 3, elite = false) => {
      const isFast = gs.modifiers.includes("fastenemies");
      const speedMult = isFast ? 1.25 : 1;
      if (type === 3) {
        const r = 8;
        const hp = 18 + gs.gameLevel * 6;
        gs.enemies.push({
          id: nextId(),
          x: rnd(r + 10, W - r - 10),
          y: -r - 25,
          r,
          hp,
          maxHp: hp,
          type: 3,
          elite: false,
          vx: rnd(-0.8, 0.8) * speedMult,
          vy: rnd(0.6, 1.2) * speedMult,
          fireTimer: Math.floor(rnd(90, 150)),
          xpVal: 12,
        });
        return;
      }
      const r = type === 0 ? 11 : type === 1 ? 15 : 19;
      const baseHp = type === 0 ? 38 : type === 1 ? 65 : 110;
      const hp = (elite ? baseHp * 1.6 : baseHp) + gs.gameLevel * 12;
      const xpVal = elite
        ? (type === 0 ? 28 : type === 1 ? 45 : 70)
        : type === 0 ? 15 : type === 1 ? 28 : 45;
      gs.enemies.push({
        id: nextId(),
        x: rnd(r + 10, W - r - 10),
        y: -r - 25,
        r,
        hp,
        maxHp: hp,
        type,
        elite: elite || undefined,
        vx:
          (rnd(-0.5, 0.5) + (Math.random() > 0.5 ? 0.3 : -0.3) * gs.gameLevel * 0.2) * speedMult,
        vy: rnd(0.2, 0.8) * speedMult,
        fireTimer: Math.floor(rnd(75, 135)),
        xpVal,
      });
    },
    []
  );

  const showMsg = useCallback((gs: GameState, str: string) => {
    gs.msgStr = str;
    gs.msgTimer = 130;
  }, []);

  const launchBoss = useCallback(
    (gs: GameState) => {
      const cfg = LEVELS_CFG[gs.gameLevel];
      gs.boss = {
        x: W / 2,
        y: -110,
        r: 52 + gs.gameLevel * 10,
        hp: cfg.bossHp,
        maxHp: cfg.bossHp,
        type: cfg.bossType,
        name: cfg.bossName,
        vy: 0.55,
        targetY: 140,
        phase: "enter",
        fireTimer: 0,
        fireInterval: 52,
        sinOffset: 0,
      };
      gs.bossPhase = true;
      showMsg(gs, `⚠ BOSS INCOMING: ${cfg.bossName}`);
    },
    [showMsg]
  );

  const spawnParticles = useCallback(
    (
      gs: GameState,
      x: number,
      y: number,
      n: number,
      col: string,
      spd = 3,
      life = 45
    ) => {
      for (let i = 0; i < n; i++) {
        const a = rnd(0, Math.PI * 2);
        const s = rnd(0.5, spd);
        gs.particles.push({
          x,
          y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s,
          life: rnd(life * 0.5, life),
          maxLife: life,
          col,
          r: rnd(1, 3.5),
        });
      }
    },
    []
  );

  const fireBullets = useCallback((gs: GameState) => {
    const p = gs.p;
    const overdrive = gs.overdriveActiveTimer > 0;
    let angles = p.spread
      ? [{ a: -0.22 }, { a: 0 }, { a: 0.22 }]
      : [{ a: 0 }];
    if (p.sides) {
      angles = [...angles, { a: Math.PI / 2 - 0.15 }, { a: Math.PI / 2 + 0.15 }];
    }
    const volleyCrit = p.lucky && Math.random() < 0.1;
    const dmgMult = volleyCrit ? 2 : 1;
    for (const ag of angles) {
      gs.bullets.push({
        x: p.x,
        y: p.y - 12,
        vx: Math.sin(ag.a ?? 0) * 11,
        vy: -Math.cos(ag.a ?? 0) * 11,
        dmg: Math.round(p.dmg * dmgMult),
        pierce: p.pierce || overdrive,
        hitIds: new Set<number>(),
        trail: [],
      });
    }
  }, []);

  const bossShoot = useCallback((gs: GameState) => {
    const b = gs.boss!;
    const p = gs.p;
    const dx = p.x - b.x;
    const dy = p.y - b.y;
    const base = Math.atan2(dy, dx);
    const spreads =
      b.hp < b.maxHp * 0.4
        ? [-0.3, -0.15, 0, 0.15, 0.3]
        : [-0.18, 0, 0.18];
    for (const da of spreads) {
      const a = base + da;
      gs.eBullets.push({
        x: b.x,
        y: b.y,
        vx: Math.cos(a) * 4.2,
        vy: Math.sin(a) * 4.2,
      });
    }
  }, []);

  const applySkill = useCallback((gs: GameState, id: SkillId) => {
    const p = gs.p;
    if (id === "shield" && gs.modifiers.includes("noshield")) return;
    p.appliedSkills.push(id);
    if (id === "damage") p.dmg = Math.round(p.dmg * 1.3);
    if (id === "firerate")
      p.fireInterval = Math.max(3, Math.round(p.fireInterval * 0.72));
    if (id === "speed") p.speed *= 1.2;
    if (id === "maxhp") {
      p.maxHp += 35;
      p.hp = Math.min(p.hp + 35, p.maxHp);
    }
    if (id === "shield") {
      p.maxShield += 40;
      p.shield = Math.min(p.shield + 40, p.maxShield);
      p.shieldRegen = Math.max(p.shieldRegen, 0.12);
    }
    if (id === "spread") p.spread = true;
    if (id === "pierce") p.pierce = true;
    if (id === "lifesteal") p.lifesteal = true;
    if (id === "sides") p.sides = true;
    if (id === "shieldburst") p.shieldBurst = true;
    if (id === "lucky") p.lucky = true;
  }, []);

  const triggerLevelUp = useCallback(
    (gs: GameState) => {
      sound.playLevelUp();
      const owned = new Set(gs.p.appliedSkills);
      const stackable = new Set<SkillId>([
        "damage",
        "firerate",
        "speed",
        "maxhp",
        "shield",
      ]);
      let pool = SKILLS.filter(
        (s) => !owned.has(s.id) || stackable.has(s.id)
      );
      if (gs.modifiers.includes("noshield")) {
        pool = pool.filter((s) => s.id !== "shield");
      }
      const choices: typeof SKILLS = [];
      const copy = [...pool];
      while (choices.length < 3 && copy.length > 0) {
        const idx = Math.floor(Math.random() * copy.length);
        choices.push(copy.splice(idx, 1)[0]!);
      }
      while (choices.length < 3) {
        const sk = SKILLS[Math.floor(Math.random() * SKILLS.length)]!;
        if (sk.id !== "shield" || !gs.modifiers.includes("noshield"))
          choices.push(sk);
      }
      setSkillChoices(choices);
      setPhase("skillpick");
    },
    [setPhase]
  );

  const takeDmg = useCallback(
    (gs: GameState, amount: number) => {
      if (gs.dashInvulnTimer > 0) return;
      const p = gs.p;
      if (p.invTimer > 0) return;
      amount = Math.round(amount * DIFFICULTY_CFG[gs.difficulty].dmgTakenMult);
      const shieldAbsorbed = p.shield > 0;
      if (p.shield > 0) {
        const abs = Math.min(p.shield, amount);
        p.shield -= abs;
        amount -= abs;
      }
      p.hp = Math.max(0, p.hp - amount);
      p.invTimer = 48;
      gs.shake = 5;
      gs.shakeTimer = 10;
      spawnParticles(gs, p.x, p.y, 8, "#00aaff", 3, 20);
      if (shieldAbsorbed && amount === 0) sound.playShieldHit();
      else sound.playPlayerHit();
      if (p.hp <= 0) {
        setEndScore(p.score);
        if (p.score > gs.highScore) {
          setHighScore(p.score);
          setNewHighScore(true);
        }
        sound.stopAmbient();
        sound.playGameOver();
        setPhase("gameover");
      }
    },
    [setPhase, spawnParticles]
  );

  const startGame = useCallback(() => {
    resetEnemyId();
    setNewHighScore(false);
    const cfg = LEVELS_CFG[0];
    const diff = difficulty;
    const mods = selectedModifier ? [selectedModifier] : [];
    const p = makePlayer(diff);
    if (mods.includes("glasscannon")) {
      p.dmg = Math.round(p.dmg * 1.3);
      p.maxHp = Math.max(1, Math.round(p.maxHp * 0.75));
      p.hp = p.maxHp;
    }
    if (mods.includes("tank")) {
      p.maxHp = Math.round(p.maxHp * 1.4);
      p.hp = p.maxHp;
      p.speed *= 0.85;
    }
    if (mods.includes("noshield")) {
      p.maxShield = 0;
      p.shield = 0;
    }
    const gs: GameState = {
      p,
      bullets: [],
      eBullets: [],
      enemies: [],
      particles: [],
      boss: null,
      bossPhase: false,
      levelDone: false,
      stars: makeStars(),
      backStars: makeBackStars(),
      dust: makeDust(),
      keys: new Set(),
      gameLevel: 0,
      distance: 0,
      nextSpawnDistance: 80,
      pendingLevelUp: false,
      levelUpShowTimer: 0,
      shake: 0,
      shakeTimer: 0,
      hitStopTimer: 0,
      frame: 0,
      msgTimer: 0,
      msgStr: "",
      difficulty: diff,
      modifiers: mods,
      highScore: getHighScore(),
      comboCount: 0,
      comboTimer: 0,
      dashCooldown: 0,
      dashInvulnTimer: 0,
      overdriveMeter: 0,
      overdriveActiveTimer: 0,
      damageNumbers: [],
      showDamageNumbers: true,
      muzzleFlashTimer: 0,
      screenFlashTimer: 0,
      shieldBurstCooldown: 0,
    };
    gsRef.current = gs;
    sound.init();
    sound.startAmbient();
    showMsg(gs, `ENTERING ${cfg?.name ?? "DEEP SPACE"}`);
    setPhase("playing");
  }, [setPhase, showMsg, difficulty, selectedModifier]);

  const pickSkill = useCallback(
    (id: SkillId) => {
      const gs = gsRef.current;
      if (gs) applySkill(gs, id);
      sound.playSkillPick();
      setPhase("playing");
    },
    [applySkill, setPhase]
  );

  const nextLevel = useCallback(() => {
    const gs = gsRef.current;
    if (!gs) return;
    gs.gameLevel++;
    gs.enemies = [];
    gs.eBullets = [];
    gs.bullets = [];
    gs.boss = null;
    gs.bossPhase = false;
    gs.levelDone = false;
    gs.p.hp = Math.min(gs.p.maxHp, gs.p.hp + 45);
    const cfg = LEVELS_CFG[gs.gameLevel];
    if (cfg) showMsg(gs, `ENTERING ${cfg.name}`);
    setPhase("playing");
  }, [setPhase, showMsg]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const context = ctx;

    const onDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "p" || e.key === "P") {
        if (phaseRef.current === "playing") {
          setPhase("paused");
          e.preventDefault();
          return;
        }
        if (phaseRef.current === "paused") {
          setPhase("playing");
          e.preventDefault();
          return;
        }
      }
      if (gsRef.current) gsRef.current.keys.add(e.key);
    };
    const onUp = (e: KeyboardEvent) => {
      if (gsRef.current) gsRef.current.keys.delete(e.key);
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);

    function loop() {
      rafRef.current = requestAnimationFrame(loop);
      context.fillStyle = "#00060f";
      context.fillRect(0, 0, W, H);

      const ph = phaseRef.current;
      const gs = gsRef.current;
      if ((ph !== "playing" && ph !== "paused") || !gs) return;

      const isPaused = ph === "paused";

      if (gs.pendingLevelUp) {
        gs.pendingLevelUp = false;
        gs.levelUpShowTimer = LEVEL_UP_SHOW_FRAMES;
        gs.hitStopTimer = 2;
      }

      if (gs.hitStopTimer > 0) {
        gs.hitStopTimer--;
        drawBackStars(context, gs.backStars, gs.frame, 0, true);
        drawDust(context, gs.dust, 0, true);
        drawStars(context, gs.stars, gs.frame, 0, true);
        drawNebulaPulse(context, gs.gameLevel, gs.frame);
        for (let i = gs.particles.length - 1; i >= 0; i--)
          drawParticle(context, gs.particles[i]!);
        context.globalAlpha = 1;
        for (const e of gs.enemies) drawEnemy(context, e, gs.frame);
        if (gs.boss) drawBoss(context, gs.boss, gs.frame);
        for (const b of gs.bullets) drawBullet(context, b, gs.frame);
        for (const b of gs.eBullets) drawEBullet(context, b);
        if (gs.p.invTimer % 5 < 3) drawPlayer(context, gs.p, gs.frame);
        drawHUD(context, gs.p, gs.gameLevel, gs.distance, gs.bossPhase, undefined, gs.comboCount, gs.dashCooldown, DASH_COOLDOWN_FRAMES, gs.overdriveMeter, OVERDRIVE_MAX);
        context.restore();
        return;
      }

      if (gs.levelUpShowTimer > 0) {
        gs.levelUpShowTimer--;
        drawBackStars(context, gs.backStars, gs.frame, 0, true);
        drawDust(context, gs.dust, 0, true);
        drawStars(context, gs.stars, gs.frame, 0, true);
        drawNebulaPulse(context, gs.gameLevel, gs.frame);
        for (let i = gs.particles.length - 1; i >= 0; i--)
          drawParticle(context, gs.particles[i]!);
        context.globalAlpha = 1;
        for (const e of gs.enemies) drawEnemy(context, e, gs.frame);
        if (gs.boss) drawBoss(context, gs.boss, gs.frame);
        for (const b of gs.bullets) drawBullet(context, b, gs.frame);
        for (const b of gs.eBullets) drawEBullet(context, b);
        if (gs.p.invTimer % 5 < 3) drawPlayer(context, gs.p, gs.frame);
        drawHUD(context, gs.p, gs.gameLevel, gs.distance, gs.bossPhase);
        if (gs.levelUpShowTimer > 0) drawLevelUpMessage(context);
        context.restore();
        if (gs.levelUpShowTimer === 0) triggerLevelUp(gs);
        return;
      }

      if (!isPaused) gs.frame++;
      const p = gs.p;
      const k = gs.keys;
      const diffCfg = DIFFICULTY_CFG[gs.difficulty];
      const scrollBase = BASE_SCROLL_SPEED * diffCfg.scrollMult;

      const scrollSpeed = isPaused
        ? 0
        : gs.bossPhase
          ? 0
          : scrollBase +
            (k.has("ArrowUp") || k.has("w") || k.has("W") ? SCROLL_BOOST : 0);
      if (!isPaused && !gs.bossPhase) gs.distance += scrollSpeed;

      let shakeX = 0;
      let shakeY = 0;
      if (!isPaused && gs.shakeTimer > 0) {
        gs.shakeTimer--;
        shakeX = (Math.random() - 0.5) * 2 * gs.shake;
        shakeY = (Math.random() - 0.5) * 2 * gs.shake;
      }
      context.save();
      context.translate(shakeX, shakeY);

      drawBackStars(context, gs.backStars, gs.frame, scrollSpeed, isPaused);
      drawDust(context, gs.dust, scrollSpeed, isPaused);
      drawStars(context, gs.stars, gs.frame, scrollSpeed, isPaused);
      drawNebulaPulse(context, gs.gameLevel, gs.frame);

      if (isPaused) {
        for (let i = gs.particles.length - 1; i >= 0; i--)
          drawParticle(context, gs.particles[i]!);
        context.globalAlpha = 1;
        for (const e of gs.enemies) drawEnemy(context, e, gs.frame);
        if (gs.boss) drawBoss(context, gs.boss, gs.frame);
        for (const b of gs.bullets) drawBullet(context, b, gs.frame);
        for (const b of gs.eBullets) drawEBullet(context, b);
        if (p.invTimer % 5 < 3) drawPlayer(context, p, gs.frame);
        drawHUD(context, p, gs.gameLevel, gs.distance, gs.bossPhase);
        context.restore();
        return;
      }

      if (gs.dashCooldown > 0) gs.dashCooldown--;
      if (gs.dashInvulnTimer > 0) gs.dashInvulnTimer--;
      if (gs.overdriveActiveTimer > 0) gs.overdriveActiveTimer--;
      if (gs.shieldBurstCooldown > 0) gs.shieldBurstCooldown--;

      const dashKey = k.has("Shift") || k.has(" ");
      if (!isPaused && dashKey && gs.dashCooldown <= 0 && gs.dashInvulnTimer <= 0) {
        let dx = 0, dy = 0;
        if (k.has("ArrowLeft") || k.has("a") || k.has("A")) dx = -1;
        if (k.has("ArrowRight") || k.has("d") || k.has("D")) dx = 1;
        if (k.has("ArrowUp") || k.has("w") || k.has("W")) dy = -1;
        if (k.has("ArrowDown") || k.has("s") || k.has("S")) dy = 1;
        if (dx === 0 && dy === 0) dy = -1;
        const len = Math.hypot(dx, dy) || 1;
        p.x = clamp(p.x + (dx / len) * DASH_DISTANCE, p.r + 4, W - p.r - 4);
        p.y = clamp(p.y + (dy / len) * DASH_DISTANCE, p.r + 4, H - p.r - 4);
        gs.dashCooldown = DASH_COOLDOWN_FRAMES;
        gs.dashInvulnTimer = DASH_INVULN_FRAMES;
        sound.playDash();
        spawnParticles(gs, p.x, p.y, 12, "#00d4ff", 2, 25);
      }

      const overdriveKey = k.has("e") || k.has("E");
      if (!isPaused && overdriveKey && gs.overdriveMeter >= OVERDRIVE_MAX && gs.overdriveActiveTimer <= 0) {
        gs.overdriveMeter = 0;
        gs.overdriveActiveTimer = OVERDRIVE_DURATION_FRAMES;
        sound.playOverdrive();
      }

      if (p.shieldBurst && (k.has("b") || k.has("B")) && p.shield >= 30 && gs.shieldBurstCooldown <= 0) {
        p.shield -= 30;
        gs.shieldBurstCooldown = 45;
        const burstR = 80;
        for (const e of gs.enemies) {
          const dist = Math.hypot(e.x - p.x, e.y - p.y);
          if (dist < burstR) {
            e.hp -= 25;
            spawnParticles(gs, e.x, e.y, 6, "#4488ff", 3, 20);
          }
        }
        spawnParticles(gs, p.x, p.y, 25, "#88aaff", 5, 30);
      }

      const spd = p.speed;
      if (k.has("ArrowLeft") || k.has("a") || k.has("A"))
        p.x = clamp(p.x - spd, p.r + 4, W - p.r - 4);
      if (k.has("ArrowRight") || k.has("d") || k.has("D"))
        p.x = clamp(p.x + spd, p.r + 4, W - p.r - 4);
      if (k.has("ArrowUp") || k.has("w") || k.has("W"))
        p.y = clamp(p.y - spd, p.r + 4, H - p.r - 4);
      if (k.has("ArrowDown") || k.has("s") || k.has("S"))
        p.y = clamp(p.y + spd, p.r + 4, H - p.r - 4);

      const effectiveFireInterval = gs.overdriveActiveTimer > 0
        ? Math.max(2, Math.floor(p.fireInterval / OVERDRIVE_FIRE_RATE_MULT))
        : p.fireInterval;
      p.fireTimer--;
      if (p.fireTimer <= 0) {
        p.fireTimer = effectiveFireInterval;
        fireBullets(gs);
        sound.playShoot();
        gs.muzzleFlashTimer = MUZZLE_FLASH_FRAMES;
      }
      if (gs.muzzleFlashTimer > 0) gs.muzzleFlashTimer--;

      if (p.shieldRegen > 0 && p.shield < p.maxShield)
        p.shield = Math.min(p.maxShield, p.shield + p.shieldRegen);
      if (p.invTimer > 0) p.invTimer--;

      if (gs.comboTimer > 0) {
        gs.comboTimer--;
        if (gs.comboTimer === 0) gs.comboCount = 0;
      }

      const sectorCfg = LEVELS_CFG[gs.gameLevel];
      const bossAtEffective = sectorCfg
        ? sectorCfg.bossAt * (gs.modifiers.includes("bossrush") ? 0.6 : 1)
        : 0;
      if (
        !gs.bossPhase &&
        sectorCfg &&
        gs.enemies.length < sectorCfg.maxEnemies &&
        gs.distance >= gs.nextSpawnDistance
      ) {
        const useType3 = Math.random() < 0.1;
        const typePool: (0 | 1 | 2)[] =
          gs.gameLevel === 0
            ? [0, 0, 1]
            : gs.gameLevel === 1
              ? [0, 1, 1, 2]
              : [1, 2, 2];
        if (useType3) {
          spawnEnemy(gs, 3);
        } else {
          const type = typePool[Math.floor(Math.random() * typePool.length)]!;
          const elite = Math.random() < ELITE_SPAWN_CHANCE;
          spawnEnemy(gs, type, elite);
        }
        gs.nextSpawnDistance =
          gs.distance + rnd(sectorCfg.spawnGapMin, sectorCfg.spawnGapMax);
      }

      if (
        !gs.boss &&
        !gs.bossPhase &&
        sectorCfg &&
        gs.distance >= bossAtEffective
      ) {
        showMsg(gs, `⚠ BOSS INCOMING: ${sectorCfg.bossName}`);
        sound.playBossSpawn();
        launchBoss(gs);
      }

      for (let i = gs.particles.length - 1; i >= 0; i--) {
        const pt = gs.particles[i]!;
        pt.x += pt.vx;
        pt.y += pt.vy + scrollSpeed;
        pt.vx *= 0.93;
        pt.vy *= 0.93;
        pt.life--;
        if (pt.life <= 0) {
          gs.particles.splice(i, 1);
          continue;
        }
        drawParticle(context, pt);
      }
      context.globalAlpha = 1;

      for (let i = gs.enemies.length - 1; i >= 0; i--) {
        const e = gs.enemies[i]!;
        e.x += e.vx;
        e.y += e.vy + scrollSpeed;
        if (e.x < e.r || e.x > W - e.r) e.vx *= -1;
        if (e.y > H + 60) {
          gs.enemies.splice(i, 1);
          continue;
        }
        e.fireTimer--;
        if (e.fireTimer <= 0) {
          e.fireTimer = Math.floor(rnd(75, 135));
          const dx = p.x - e.x;
          const dy = p.y - e.y;
          const len = Math.hypot(dx, dy);
          gs.eBullets.push({
            x: e.x,
            y: e.y,
            vx: (dx / len) * 3.8,
            vy: (dy / len) * 3.8,
          });
        }
        if (
          p.invTimer <= 0 &&
          (e.x - p.x) ** 2 + (e.y - p.y) ** 2 < (e.r + p.r) ** 2
        ) {
          takeDmg(gs, 22);
          spawnParticles(gs, p.x, p.y, 8, "#00aaff", 3, 20);
          gs.enemies.splice(i, 1);
          if (phaseRef.current !== "playing") return;
        }
        drawEnemy(context, e, gs.frame);
      }

      if (gs.boss) {
        const b = gs.boss;
        if (b.phase === "enter") {
          b.y += b.vy;
          if (b.y >= b.targetY) {
            b.y = b.targetY;
            b.phase = "active";
          }
        } else if (b.phase === "active") {
          if (b.hp < b.maxHp * 0.4 && !b.phase2Triggered) {
            b.phase2Triggered = true;
            showMsg(gs, "⚠ ENRAGED");
            gs.screenFlashTimer = 15;
            gs.shake = 8;
            gs.shakeTimer = 20;
          }
          b.sinOffset += 0.013;
          b.x = W / 2 + Math.sin(b.sinOffset) * (W / 2 - b.r - 25);
          b.fireTimer--;
          if (b.telegraphTimer == null && b.fireTimer <= 0) {
            b.telegraphTimer = BOSS_TELEGRAPH_FRAMES;
          }
          if (b.telegraphTimer != null) {
            b.telegraphTimer--;
            if (b.telegraphTimer <= 0) {
              b.telegraphTimer = undefined;
              b.fireTimer = b.fireInterval;
              bossShoot(gs);
            }
          }
          if (
            p.invTimer <= 0 &&
            (b.x - p.x) ** 2 + (b.y - p.y) ** 2 < (b.r + p.r) ** 2
          ) {
            takeDmg(gs, 40);
            if (phaseRef.current !== "playing") {
              context.restore();
              return;
            }
          }
        }
        drawBoss(context, gs.boss, gs.frame);
      }

      for (let i = gs.bullets.length - 1; i >= 0; i--) {
        const b = gs.bullets[i]!;
        b.x += b.vx;
        b.y += b.vy;
        if (b.trail) {
          b.trail.push({ x: b.x, y: b.y });
          if (b.trail.length > BULLET_TRAIL_LEN) b.trail.shift();
        }
        if (b.y < -20 || b.x < -20 || b.x > W + 20) {
          gs.bullets.splice(i, 1);
          continue;
        }

        let removed = false;
        for (let j = gs.enemies.length - 1; j >= 0; j--) {
          const e = gs.enemies[j]!;
          if (b.pierce && b.hitIds.has(e.id)) continue;
          if ((b.x - e.x) ** 2 + (b.y - e.y) ** 2 < (e.r + 3.5) ** 2) {
            const dmg = b.dmg;
            e.hp -= dmg;
            if (gs.showDamageNumbers) {
              gs.damageNumbers.push({
                x: e.x,
                y: e.y,
                value: dmg,
                life: 40,
                maxLife: 40,
                isCrit: dmg > p.dmg,
              });
            }
            sound.playEnemyHit();
            if (gs.overdriveActiveTimer <= 0) gs.overdriveMeter = Math.min(OVERDRIVE_MAX, gs.overdriveMeter + 2);
            spawnParticles(gs, e.x, e.y, 6, "#ff6600", 2.5, 18);
            if (b.pierce) b.hitIds.add(e.id);
            else {
              gs.bullets.splice(i, 1);
              removed = true;
            }
            if (e.hp <= 0) {
              gs.comboCount++;
              gs.comboTimer = COMBO_WINDOW_FRAMES;
              const xpVal = e.xpVal * (gs.modifiers.includes("doublexp") ? 2 : 1);
              const scoreBonus = Math.round(e.xpVal * 10 * (1 + gs.comboCount * COMBO_SCORE_MULT_PER));
              p.xp += xpVal;
              p.score += scoreBonus;
              if (gs.overdriveActiveTimer <= 0) gs.overdriveMeter = Math.min(OVERDRIVE_MAX, gs.overdriveMeter + 5);
              gs.hitStopTimer = HIT_STOP_KILL_FRAMES;
              sound.playEnemyDeath();
              spawnParticles(gs, e.x, e.y, 22, "#ff6600", 4, 55);
              spawnParticles(gs, e.x, e.y, 10, "#ffcc00", 2, 35);
              if (p.lifesteal) p.hp = Math.min(p.maxHp, p.hp + 6);
              gs.enemies.splice(j, 1);
              while (p.xp >= p.xpMax) {
                p.xp -= p.xpMax;
                p.lvl++;
                p.xpMax = xpThresh(p.lvl);
                gs.pendingLevelUp = true;
              }
            }
            if (removed) break;
          }
        }
        if (removed) continue;

        if (gs.boss && gs.boss.phase !== "enter") {
          const b2 = gs.boss;
          if ((b.x - b2.x) ** 2 + (b.y - b2.y) ** 2 < (b2.r + 4) ** 2) {
            b2.hp -= b.dmg;
            if (gs.overdriveActiveTimer <= 0) gs.overdriveMeter = Math.min(OVERDRIVE_MAX, gs.overdriveMeter + 3);
            sound.playBossHit();
            spawnParticles(gs, b.x, b.y, 5, "#ff4400", 2, 14);
            if (!b.pierce) gs.bullets.splice(i, 1);
            if (b2.hp <= 0) {
              gs.hitStopTimer = HIT_STOP_BOSS_DEATH_FRAMES;
              sound.playBossDeath();
              spawnParticles(gs, b2.x, b2.y, 70, "#ff8800", 7, 90);
              spawnParticles(gs, b2.x, b2.y, 40, "#ffffff", 4, 60);
              spawnParticles(gs, b2.x, b2.y, 30, "#ff4400", 5, 70);
              p.score += b2.maxHp * 3;
              p.xp += Math.floor(b2.maxHp / 3) * (gs.modifiers.includes("doublexp") ? 2 : 1);
              while (p.xp >= p.xpMax) {
                p.xp -= p.xpMax;
                p.lvl++;
                p.xpMax = xpThresh(p.lvl);
                gs.pendingLevelUp = true;
              }
              gs.boss = null;
              gs.levelDone = true;
            }
          }
        }
        if (!removed && gs.bullets[i]) drawBullet(context, b, gs.frame);
      }

      for (let i = gs.eBullets.length - 1; i >= 0; i--) {
        const b = gs.eBullets[i]!;
        b.x += b.vx;
        b.y += b.vy + scrollSpeed;
        if (b.x < 0 || b.x > W || b.y < -20 || b.y > H + 20) {
          gs.eBullets.splice(i, 1);
          continue;
        }
        if (
          p.invTimer <= 0 &&
          (b.x - p.x) ** 2 + (b.y - p.y) ** 2 < p.r ** 2
        ) {
          gs.eBullets.splice(i, 1);
          takeDmg(gs, 13);
          if (phaseRef.current !== "playing") {
            context.restore();
            return;
          }
          continue;
        }
        drawEBullet(context, b);
      }

      if (p.invTimer % 5 < 3) drawPlayer(context, p, gs.frame);

      for (let di = gs.damageNumbers.length - 1; di >= 0; di--) {
        const dn = gs.damageNumbers[di]!;
        dn.y -= 0.8;
        dn.life--;
        if (dn.life <= 0) gs.damageNumbers.splice(di, 1);
      }
      if (gs.showDamageNumbers && gs.damageNumbers.length > 0) {
        drawDamageNumbers(context, gs.damageNumbers);
      }
      if (gs.muzzleFlashTimer > 0) drawMuzzleFlash(context, p.x, p.y, gs.frame);
      if (gs.screenFlashTimer > 0) {
        gs.screenFlashTimer--;
        drawScreenFlash(context, gs.screenFlashTimer, 15);
      }
      if (gs.boss?.telegraphTimer != null && gs.boss.telegraphTimer > 0) {
        drawBossTelegraph(context, gs.boss, gs.boss.telegraphTimer);
      }

      if (gs.levelDone) {
        gs.levelDone = false;
        gs.enemies = [];
        gs.eBullets = [];
        gs.bullets = [];
        if (gs.gameLevel + 1 < LEVELS_CFG.length) {
          sound.playLevelComplete();
          setPhase("levelcomplete");
        } else {
          if (p.score > gs.highScore) {
            setHighScore(p.score);
            setNewHighScore(true);
          }
          sound.stopAmbient();
          sound.playVictory();
          setEndScore(p.score);
          setPhase("victory");
        }
        context.restore();
        return;
      }

      if (gs.pendingLevelUp) {
        context.restore();
        return;
      }

      const nextBossAt = sectorCfg && !gs.bossPhase ? Math.max(0, bossAtEffective - gs.distance) : undefined;
      drawHUD(context, p, gs.gameLevel, gs.distance, gs.bossPhase, nextBossAt, gs.comboCount, gs.dashCooldown, DASH_COOLDOWN_FRAMES, gs.overdriveMeter, OVERDRIVE_MAX);
      if (gs.msgTimer > 0) {
        gs.msgTimer--;
        drawCenterMessage(context, gs.msgTimer, gs.msgStr);
      }

      context.restore();
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [
    fireBullets,
    spawnEnemy,
    spawnParticles,
    takeDmg,
    bossShoot,
    triggerLevelUp,
    showMsg,
    launchBoss,
  ]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#00030a] font-mono">
      <div className="relative" style={{ width: W, height: H }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="block border border-[#003366]"
          style={{ borderWidth: "1px 0" }}
          tabIndex={0}
        />

        {uiPhase === "menu" && (
          <div style={overlayStyle}>
            <div className="text-center px-10 max-w-xl">
              <div
                className="text-[11px] tracking-[6px] mb-1.5"
                style={{ color: "#004488" }}
              >
                ANTHROPIC DEEP SPACE COMBAT
              </div>
              <h1
                className="m-0 text-5xl font-black tracking-wider leading-tight"
                style={{
                  color: "#00d4ff",
                  textShadow: "0 0 20px #00d4ff, 0 0 60px #0066ff",
                }}
              >
                VOID
                <br />
                BREAKER
              </h1>
              <div
                className="text-xs tracking-[8px] mt-1 mb-4"
                style={{ color: "#004466" }}
              >
                RPG · SPACE SHOOTER
              </div>
              <div className="mb-3 text-[10px] tracking-widest" style={{ color: "#336688" }}>
                DIFFICULTY
              </div>
              <div className="flex gap-2 justify-center mb-5">
                {(["easy", "normal", "hard"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className="px-4 py-2 text-xs font-bold border-2 rounded transition-all"
                    style={{
                      borderColor: difficulty === d ? "#00d4ff" : "#224466",
                      background: difficulty === d ? "#00d4ff22" : "transparent",
                      color: difficulty === d ? "#00d4ff" : "#6688aa",
                    }}
                  >
                    {d.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="mb-3 text-[10px] tracking-widest" style={{ color: "#336688" }}>
                MODIFIER (optional)
              </div>
              <div className="flex flex-wrap gap-2 justify-center mb-5">
                <button
                  onClick={() => setSelectedModifier(null)}
                  className="px-3 py-1.5 text-[10px] font-bold border rounded"
                  style={{
                    borderColor: selectedModifier === null ? "#00d4ff" : "#224466",
                    background: selectedModifier === null ? "#00d4ff22" : "transparent",
                    color: selectedModifier === null ? "#00d4ff" : "#6688aa",
                  }}
                >
                  NONE
                </button>
                {(() => {
                  const shuffled = [...MODIFIERS].sort(() => Math.random() - 0.5).slice(0, 3);
                  return shuffled.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedModifier(selectedModifier === m.id ? null : m.id)}
                      className="px-3 py-1.5 text-[10px] font-bold border rounded"
                      style={{
                        borderColor: selectedModifier === m.id ? m.col : "#224466",
                        background: selectedModifier === m.id ? `${m.col}22` : "transparent",
                        color: selectedModifier === m.id ? m.col : "#6688aa",
                      }}
                      title={m.desc}
                    >
                      {m.name}
                    </button>
                  ));
                })()}
              </div>
              <div className="my-4 text-[10px] leading-[2] tracking-wide" style={{ color: "#336688" }}>
                <div>↑↓←→ / WASD MOVE · W/↑ THRUST · SHIFT/SPACE DASH · E OVERDRIVE · B SHIELD BURST</div>
                <div>ESC/P PAUSE · 3 SECTORS · 3 BOSSES · 11 SKILLS</div>
              </div>
              <div className="text-[10px] mb-2" style={{ color: "#225566" }}>
                Best: {getHighScore().toLocaleString()}
              </div>
              <button
                onClick={startGame}
                style={btnStyle("#00d4ff")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#00d4ff22";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                ⚡ LAUNCH MISSION
              </button>
            </div>
          </div>
        )}

        {uiPhase === "paused" && (
          <div style={overlayStyle}>
            <div className="text-center px-10">
              <div
                className="text-[10px] tracking-[5px] mb-2"
                style={{ color: "#004466" }}
              >
                MISSION HALTED
              </div>
              <h2
                className="m-0 mb-1 text-4xl font-black tracking-wider"
                style={{
                  color: "#00d4ff",
                  textShadow: "0 0 20px #00d4ff, 0 0 40px #0066ff",
                }}
              >
                PAUSED
              </h2>
              <div
                className="text-xs tracking-wide mb-6"
                style={{ color: "#336688" }}
              >
                ESC / P — RESUME
              </div>
              <button
                onClick={() => setPhase("playing")}
                style={btnStyle("#00d4ff")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#00d4ff22";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                ▶ RESUME
              </button>
              <br />
              <br />
              <button
                onClick={() => {
                  sound.stopAmbient();
                  setPhase("menu");
                }}
                style={{ ...btnStyle("#4488ff"), fontSize: 11, padding: "8px 24px" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#4488ff22";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                MAIN MENU
              </button>
            </div>
          </div>
        )}

        {uiPhase === "skillpick" && (
          <div style={overlayStyle}>
            <div className="text-center max-w-[680px] px-5">
              <div
                className="text-[10px] tracking-[5px] mb-1.5"
                style={{ color: "#660099" }}
              >
                SHIP SYSTEMS
              </div>
              <h2
                className="m-0 mb-1 text-[28px] font-black"
                style={{
                  color: "#bb44ff",
                  textShadow: "0 0 20px #bb44ff",
                }}
              >
                UPGRADE AVAILABLE
              </h2>
              <div
                className="text-[11px] tracking-[4px] mb-7"
                style={{ color: "#664488" }}
              >
                SELECT ONE ENHANCEMENT
              </div>
              <div className="flex gap-3.5 justify-center flex-wrap">
                {skillChoices.map((sk) => (
                  <div
                    key={sk.id}
                    onClick={() => pickSkill(sk.id)}
                    className="flex-1 min-w-[180px] p-5 cursor-pointer rounded-md transition-all duration-150 border-2"
                    style={{
                      borderColor: `${sk.col}88`,
                      background: "rgba(0,0,0,0.8)",
                      boxShadow: `0 0 20px ${sk.col}22`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = sk.col;
                      e.currentTarget.style.background = `${sk.col}18`;
                      e.currentTarget.style.boxShadow = `0 0 30px ${sk.col}44`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = `${sk.col}88`;
                      e.currentTarget.style.background = "rgba(0,0,0,0.8)";
                      e.currentTarget.style.boxShadow = `0 0 20px ${sk.col}22`;
                    }}
                  >
                    <div
                      className="text-[15px] font-black mb-2.5 tracking-wide"
                      style={{
                        color: sk.col,
                        textShadow: `0 0 10px ${sk.col}`,
                      }}
                    >
                      {sk.name}
                    </div>
                    <div className="text-[#aaaaaa] text-xs leading-relaxed">
                      {sk.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {uiPhase === "levelcomplete" && gsRef.current && (
          <div style={overlayStyle}>
            <div className="text-center px-10">
              <div
                className="text-[10px] tracking-[5px] mb-2"
                style={{ color: "#006633" }}
              >
                SECTOR CLEARED
              </div>
              <h2
                className="m-0 mb-1 text-[34px] font-black"
                style={{
                  color: "#44ff88",
                  textShadow: "0 0 25px #44ff88",
                }}
              >
                {LEVELS_CFG[gsRef.current.gameLevel]?.name}
              </h2>
              <div
                className="text-xs tracking-wider mb-6"
                style={{ color: "#226644" }}
              >
                {LEVELS_CFG[gsRef.current.gameLevel]?.sub}
              </div>
              <div
                className="text-[22px] mb-2"
                style={{
                  color: "#ffdd44",
                  textShadow: "0 0 12px #ffaa00",
                }}
              >
                {gsRef.current.p.score.toLocaleString()}
              </div>
              <div className="text-[#666] text-[11px] mb-7">
                SCORE · +45 HP RESTORED
              </div>
              {LEVELS_CFG[gsRef.current.gameLevel + 1] && (
                <div
                  className="text-[11px] tracking-wider mb-5"
                  style={{ color: "#446688" }}
                >
                  NEXT → {LEVELS_CFG[gsRef.current.gameLevel + 1]?.name} ·{" "}
                  {LEVELS_CFG[gsRef.current.gameLevel + 1]?.sub}
                </div>
              )}
              <button
                onClick={nextLevel}
                style={btnStyle("#44ff88")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#44ff8822";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                NEXT SECTOR →
              </button>
            </div>
          </div>
        )}

        {uiPhase === "gameover" && (
          <div style={overlayStyle}>
            <div className="text-center px-10">
              {newHighScore && (
                <div className="text-sm font-black tracking-widest mb-2" style={{ color: "#ffdd00", textShadow: "0 0 15px #ffaa00" }}>
                  ★ NEW RECORD ★
                </div>
              )}
              <div
                className="text-[10px] tracking-[5px] mb-2"
                style={{ color: "#660000" }}
              >
                SHIP DESTROYED
              </div>
              <h2
                className="m-0 mb-1 text-4xl font-black"
                style={{
                  color: "#ff2244",
                  textShadow: "0 0 30px #ff2244",
                }}
              >
                MISSION
                <br />
                FAILED
              </h2>
              <div
                className="text-[22px] my-5"
                style={{
                  color: "#ffdd44",
                  textShadow: "0 0 12px #ffaa00",
                }}
              >
                {endScore.toLocaleString()}
              </div>
              <div className="text-[#666] text-[11px] mb-8">FINAL SCORE</div>
              <button
                onClick={startGame}
                style={btnStyle("#ff4466")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#ff446622";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                ↺ RETRY MISSION
              </button>
              <br />
              <br />
              <button
                onClick={() => setPhase("menu")}
                style={{ ...btnStyle("#4488ff"), fontSize: 11, padding: "8px 24px" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#4488ff22";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                MAIN MENU
              </button>
            </div>
          </div>
        )}

        {uiPhase === "victory" && (
          <div style={overlayStyle}>
            <div className="text-center px-10">
              {newHighScore && (
                <div className="text-sm font-black tracking-widest mb-2" style={{ color: "#ffdd00", textShadow: "0 0 15px #ffaa00" }}>
                  ★ NEW RECORD ★
                </div>
              )}
              <div
                className="text-[10px] tracking-[5px] mb-2"
                style={{ color: "#886600" }}
              >
                THE VOID CONQUERED
              </div>
              <h2
                className="m-0 mb-1 text-5xl font-black"
                style={{
                  color: "#ffdd00",
                  textShadow: "0 0 30px #ffdd00, 0 0 70px #ffaa00",
                }}
              >
                VICTORY
              </h2>
              <div
                className="text-xs tracking-[4px] mb-6"
                style={{ color: "#665500" }}
              >
                ALL SECTORS CLEARED
              </div>
              <div
                className="text-[26px] mb-2"
                style={{
                  color: "#ffdd44",
                  textShadow: "0 0 15px #ffaa00",
                }}
              >
                {endScore.toLocaleString()}
              </div>
              <div className="text-[#666] text-[11px] mb-8">FINAL SCORE</div>
              <button
                onClick={startGame}
                style={btnStyle("#ffdd00")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#ffdd0022";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                ↺ PLAY AGAIN
              </button>
            </div>
          </div>
        )}
      </div>
      <div
        className="mt-2.5 text-[10px] tracking-widest"
        style={{ color: "#112244" }}
      >
        WASD / ARROWS MOVE · W/↑ THRUST · ESC / P PAUSE · CLICK CANVAS TO FOCUS
      </div>
    </div>
  );
}
