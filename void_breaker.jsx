import { useState, useEffect, useRef } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const W = 820, H = 620;
const rnd = (a, b) => Math.random() * (b - a) + a;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const SKILLS = [
  { id: "damage",    name: "PLASMA AMP",      desc: "Bullet damage +30%",         col: "#ff6b35", glow: "#ff3300" },
  { id: "firerate",  name: "RAPID PULSE",     desc: "Fire rate +30%",              col: "#ff3388", glow: "#ff0055" },
  { id: "speed",     name: "ION THRUSTERS",   desc: "Move speed +20%",             col: "#00d4ff", glow: "#0088ff" },
  { id: "maxhp",     name: "HULL PLATING",    desc: "Max HP +35, restore 35",      col: "#44ff88", glow: "#00cc44" },
  { id: "shield",    name: "DEFLECTOR GRID",  desc: "Shield +40 w/ auto-regen",    col: "#4488ff", glow: "#0044ff" },
  { id: "spread",    name: "SCATTER CANNON",  desc: "Fire 3-way spread",           col: "#dd44ff", glow: "#aa00ff" },
  { id: "pierce",    name: "PHASER ROUND",    desc: "Bullets pierce enemies",      col: "#ffff44", glow: "#ffaa00" },
  { id: "lifesteal", name: "NANO LEECHES",    desc: "Each kill heals 6 HP",        col: "#ff4466", glow: "#ff0033" },
];

const LEVELS_CFG = [
  { name: "SECTOR ALPHA",   sub: "OUTER RIM",       waveEnemies: [5, 9],        bossHp: 380,  bossType: 0, bossName: "CRIMSON DREAD" },
  { name: "NEBULA GATE",    sub: "DEEP VOID",       waveEnemies: [9, 14],       bossHp: 580,  bossType: 1, bossName: "VOID HARBINGER" },
  { name: "THE DARK VOID",  sub: "END OF ALL",      waveEnemies: [12, 15, 18],  bossHp: 950,  bossType: 2, bossName: "OMEGA TITAN" },
];

const xpThresh = (lvl) => 85 + lvl * 45;

// ─── Drawing helpers ──────────────────────────────────────────────────────────
const glow = (ctx, col, size) => { ctx.shadowColor = col; ctx.shadowBlur = size; };
const noGlow = (ctx) => { ctx.shadowBlur = 0; };

function drawStars(ctx, stars, frame) {
  for (const s of stars) {
    s.y += s.spd;
    if (s.y > H + 2) { s.y = -2; s.x = rnd(0, W); }
    const alpha = s.bright * (0.85 + Math.sin(frame * s.twinkle) * 0.15);
    ctx.fillStyle = `rgba(180,210,255,${alpha})`;
    ctx.fillRect(s.x, s.y, s.sz, s.sz * (s.spd > 1 ? 2 : 1));
  }
}

function drawPlayer(ctx, p, frame) {
  ctx.save();
  ctx.translate(p.x, p.y);

  // Engine flame
  const fl = 12 + Math.sin(frame * 0.35) * 5;
  const eng = ctx.createLinearGradient(0, 8, 0, 8 + fl);
  eng.addColorStop(0, "rgba(0,220,255,0.9)");
  eng.addColorStop(0.5, "rgba(0,100,255,0.5)");
  eng.addColorStop(1, "rgba(0,50,255,0)");
  ctx.fillStyle = eng;
  ctx.beginPath();
  ctx.moveTo(-5, 8); ctx.lineTo(5, 8); ctx.lineTo(0, 8 + fl);
  ctx.closePath(); ctx.fill();

  // Wing engines
  const fl2 = 8 + Math.sin(frame * 0.35 + 1) * 3;
  const eng2 = ctx.createLinearGradient(0, 6, 0, 6 + fl2);
  eng2.addColorStop(0, "rgba(0,200,255,0.6)"); eng2.addColorStop(1, "rgba(0,100,255,0)");
  ctx.fillStyle = eng2;
  ctx.beginPath(); ctx.moveTo(-10, 6); ctx.lineTo(-7, 6); ctx.lineTo(-8.5, 6 + fl2); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(10, 6); ctx.lineTo(7, 6); ctx.lineTo(8.5, 6 + fl2); ctx.closePath(); ctx.fill();

  // Ship body
  glow(ctx, "#00d4ff", 18);
  ctx.strokeStyle = "#00d4ff"; ctx.fillStyle = "#001830"; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.lineTo(14, 10); ctx.lineTo(7, 5); ctx.lineTo(0, 7);
  ctx.lineTo(-7, 5); ctx.lineTo(-14, 10);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Cockpit
  glow(ctx, "#00ffff", 12);
  ctx.fillStyle = "#00ffff";
  ctx.beginPath(); ctx.ellipse(0, -6, 3.5, 6, 0, 0, Math.PI * 2); ctx.fill();

  // Wing detail lines
  noGlow(ctx);
  ctx.strokeStyle = "#0088ff"; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-9, 7); ctx.lineTo(-11, 2); ctx.lineTo(-6, 0);
  ctx.moveTo(9, 7); ctx.lineTo(11, 2); ctx.lineTo(6, 0);
  ctx.stroke();

  // Shield ring
  if (p.shield > 0) {
    const a2 = 0.2 + 0.12 * Math.sin(frame * 0.08);
    glow(ctx, "#4488ff", 22);
    ctx.strokeStyle = `rgba(68,136,255,${a2 + 0.35})`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2); ctx.stroke();
  }

  noGlow(ctx);
  ctx.restore();
}

function drawEnemy(ctx, e, frame) {
  ctx.save();
  ctx.translate(e.x, e.y);
  const r = e.r;

  if (e.type === 0) {
    glow(ctx, "#ff3333", 10);
    ctx.strokeStyle = "#ff4444"; ctx.fillStyle = "#1a0000"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, r); ctx.lineTo(-r, -r * 0.8); ctx.lineTo(r, -r * 0.8); ctx.closePath();
    ctx.fill(); ctx.stroke();
    glow(ctx, "#ff0000", 8); ctx.fillStyle = "#ff3333";
    ctx.beginPath(); ctx.arc(0, -r * 0.1, 3, 0, Math.PI * 2); ctx.fill();
  } else if (e.type === 1) {
    glow(ctx, "#ff7700", 12);
    ctx.strokeStyle = "#ff9900"; ctx.fillStyle = "#1a0800"; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, r); ctx.lineTo(r * 0.75, 0); ctx.lineTo(0, -r);
    ctx.lineTo(-r * 0.75, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = "#ff4400"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-r * 0.5, 0); ctx.lineTo(r * 0.5, 0); ctx.stroke();
  } else {
    glow(ctx, "#bb00ff", 14);
    ctx.strokeStyle = "#cc44ff"; ctx.fillStyle = "#0e001a"; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
      i === 0 ? ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    glow(ctx, "#ff00ff", 8); ctx.fillStyle = "#ff44ff";
    ctx.beginPath(); ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2); ctx.fill();
  }

  // HP bar
  if (e.hp < e.maxHp) {
    const bw = r * 2.2, bh = 3, bx = -bw / 2, by2 = -r - 7;
    ctx.fillStyle = "#1a1a1a"; ctx.fillRect(bx, by2, bw, bh);
    ctx.fillStyle = e.hp / e.maxHp > 0.5 ? "#44ff44" : e.hp / e.maxHp > 0.25 ? "#ffaa00" : "#ff2222";
    ctx.fillRect(bx, by2, bw * (e.hp / e.maxHp), bh);
    noGlow(ctx);
  }

  noGlow(ctx);
  ctx.restore();
}

function drawBoss(ctx, boss, frame) {
  if (!boss || boss.phase === "dead") return;
  const r = boss.r;
  ctx.save();
  ctx.translate(boss.x, boss.y);
  const pulse = 1 + Math.sin(frame * 0.04) * 0.04;
  ctx.scale(pulse, pulse);

  if (boss.type === 0) { // Crimson Dread
    glow(ctx, "#ff4400", 28);
    ctx.strokeStyle = "#ff6600"; ctx.fillStyle = "#1a0800"; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, r); ctx.lineTo(r * 0.55, r * 0.4); ctx.lineTo(r, -r * 0.15);
    ctx.lineTo(r * 0.35, -r); ctx.lineTo(-r * 0.35, -r);
    ctx.lineTo(-r, -r * 0.15); ctx.lineTo(-r * 0.55, r * 0.4); ctx.closePath();
    ctx.fill(); ctx.stroke();
    glow(ctx, "#ff8800", 20); ctx.fillStyle = "#ff7700";
    ctx.beginPath(); ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#ff4400"; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(r * 0.65, r * 0.15);
    ctx.moveTo(0, 0); ctx.lineTo(-r * 0.65, r * 0.15);
    ctx.stroke();
  } else if (boss.type === 1) { // Void Harbinger
    glow(ctx, "#9900ff", 32);
    ctx.strokeStyle = "#cc44ff"; ctx.fillStyle = "#0e001a"; ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 - Math.PI / 8;
      i === 0 ? ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // Rotating ring
    ctx.save(); ctx.rotate(frame * 0.025);
    glow(ctx, "#ff00ff", 12); ctx.strokeStyle = "#ff44ff"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    ctx.save(); ctx.rotate(-frame * 0.018);
    ctx.strokeStyle = "#8800ff"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.38, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    glow(ctx, "#ff00ff", 18); ctx.fillStyle = "#ee00ff";
    ctx.beginPath(); ctx.arc(0, 0, r * 0.15, 0, Math.PI * 2); ctx.fill();
  } else { // Omega Titan
    glow(ctx, "#ff0044", 38);
    ctx.strokeStyle = "#ff2266"; ctx.fillStyle = "#1a0010"; ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const rad = i % 2 === 0 ? r : r * 0.62;
      i === 0 ? ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad) : ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.rotate(frame * 0.02);
    glow(ctx, "#ff0088", 14); ctx.strokeStyle = "#ff0099"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    ctx.save(); ctx.rotate(-frame * 0.03);
    ctx.strokeStyle = "#ff4400"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    glow(ctx, "#ff0044", 22); ctx.fillStyle = "#ff0055";
    ctx.beginPath(); ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2); ctx.fill();
  }

  noGlow(ctx);
  ctx.restore();

  // Boss HP bar at top
  const bw = 420, bh = 16, bx2 = (W - bw) / 2, by2 = 14;
  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.fillRect(bx2 - 3, by2 - 3, bw + 6, bh + 6);
  const bgrad = ctx.createLinearGradient(bx2, 0, bx2 + bw, 0);
  if (boss.type === 0) { bgrad.addColorStop(0, "#aa0000"); bgrad.addColorStop(1, "#ff6600"); }
  else if (boss.type === 1) { bgrad.addColorStop(0, "#6600cc"); bgrad.addColorStop(1, "#ff44ff"); }
  else { bgrad.addColorStop(0, "#aa0033"); bgrad.addColorStop(1, "#ff4400"); }
  ctx.fillStyle = "#1a0000"; ctx.fillRect(bx2, by2, bw, bh);
  ctx.fillStyle = bgrad; ctx.fillRect(bx2, by2, bw * Math.max(0, boss.hp / boss.maxHp), bh);
  glow(ctx, "#ff6600", 6); ctx.strokeStyle = "#ff6600"; ctx.lineWidth = 1;
  ctx.strokeRect(bx2, by2, bw, bh); noGlow(ctx);
  ctx.fillStyle = "#ffffff"; ctx.font = "bold 11px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.fillText(`${boss.name}  ·  ${Math.max(0, Math.ceil(boss.hp))} / ${boss.maxHp}`, W / 2, by2 + 11);
}

function drawBullet(ctx, b, frame) {
  glow(ctx, "#00ffff", 10);
  ctx.fillStyle = "#aaffff";
  ctx.beginPath(); ctx.arc(b.x, b.y, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(0,255,255,0.3)";
  ctx.beginPath(); ctx.arc(b.x, b.y, 6, 0, Math.PI * 2); ctx.fill();
  noGlow(ctx);
}

function drawEBullet(ctx, b) {
  glow(ctx, "#ff4400", 8);
  ctx.fillStyle = "#ff8844";
  ctx.beginPath(); ctx.arc(b.x, b.y, 3, 0, Math.PI * 2); ctx.fill();
  noGlow(ctx);
}

function drawHUD(ctx, p) {
  const barW = 170, barH = 13;
  const bx = 12, by = 14;

  // HP bar
  ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(bx - 1, by - 1, barW + 2, barH + 2);
  ctx.fillStyle = "#1a1a1a"; ctx.fillRect(bx, by, barW, barH);
  const hr = p.hp / p.maxHp;
  const hcol = hr > 0.6 ? "#44ff66" : hr > 0.3 ? "#ffaa00" : "#ff2222";
  ctx.fillStyle = hcol; ctx.fillRect(bx, by, barW * hr, barH);
  glow(ctx, hcol, 5); ctx.strokeStyle = hcol; ctx.lineWidth = 1;
  ctx.strokeRect(bx, by, barW, barH); noGlow(ctx);
  ctx.fillStyle = "#ffffff"; ctx.font = "bold 10px 'Courier New', monospace"; ctx.textAlign = "left";
  ctx.fillText(`HP  ${Math.ceil(p.hp)} / ${p.maxHp}`, bx + 3, by + 9);

  // Shield bar
  if (p.maxShield > 0) {
    const sy = by + barH + 5;
    ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(bx - 1, sy - 1, barW + 2, barH + 2);
    ctx.fillStyle = "#1a1a1a"; ctx.fillRect(bx, sy, barW, barH);
    ctx.fillStyle = "#4488ff"; ctx.fillRect(bx, sy, barW * (p.shield / p.maxShield), barH);
    glow(ctx, "#4488ff", 5); ctx.strokeStyle = "#4488ff"; ctx.lineWidth = 1;
    ctx.strokeRect(bx, sy, barW, barH); noGlow(ctx);
    ctx.fillStyle = "#aaccff"; ctx.font = "bold 10px 'Courier New', monospace"; ctx.textAlign = "left";
    ctx.fillText(`SH  ${Math.ceil(p.shield)} / ${p.maxShield}`, bx + 3, sy + 9);
  }

  // XP bar
  const xpy = by + barH + (p.maxShield > 0 ? barH + 10 : 5) + 5;
  ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(bx - 1, xpy - 1, barW + 2, 9 + 2);
  ctx.fillStyle = "#1a1a1a"; ctx.fillRect(bx, xpy, barW, 9);
  ctx.fillStyle = "#aa44ff"; ctx.fillRect(bx, xpy, barW * (p.xp / p.xpMax), 9);
  glow(ctx, "#aa44ff", 4); ctx.strokeStyle = "#aa44ff"; ctx.lineWidth = 1;
  ctx.strokeRect(bx, xpy, barW, 9); noGlow(ctx);
  ctx.fillStyle = "#ddaaff"; ctx.font = "bold 9px 'Courier New', monospace"; ctx.textAlign = "left";
  ctx.fillText(`LVL ${p.lvl}  ·  ${Math.floor(p.xp)} / ${p.xpMax} XP`, bx + 3, xpy + 7);

  // Score
  glow(ctx, "#ffcc00", 10);
  ctx.fillStyle = "#ffdd44"; ctx.font = "bold 16px 'Courier New', monospace"; ctx.textAlign = "center";
  ctx.fillText(String(p.score).padStart(9, "0"), W / 2, 24);
  noGlow(ctx);

  // Skills icons (top right)
  if (p.appliedSkills.length > 0) {
    let sx = W - 14;
    for (let i = p.appliedSkills.length - 1; i >= 0; i--) {
      const sk = SKILLS.find(s => s.id === p.appliedSkills[i]);
      if (!sk) continue;
      const tw = ctx.measureText(sk.name.slice(0, 3)).width + 10;
      sx -= tw;
      ctx.fillStyle = `${sk.col}33`;
      ctx.fillRect(sx - 2, 8, tw + 4, 16);
      ctx.strokeStyle = sk.col; ctx.lineWidth = 1;
      ctx.strokeRect(sx - 2, 8, tw + 4, 16);
      ctx.fillStyle = sk.col; ctx.font = "bold 8px 'Courier New', monospace"; ctx.textAlign = "left";
      ctx.fillText(sk.name.slice(0, 3), sx + 1, 19);
      sx -= 4;
    }
  }
}

// ─── Game Init ────────────────────────────────────────────────────────────────
function makeStars() {
  return Array.from({ length: 120 }, () => ({
    x: rnd(0, W), y: rnd(0, H),
    spd: rnd(0.3, 2.0), bright: rnd(0.25, 1),
    sz: rnd(1, 1.5) > 1.2 ? 2 : 1,
    twinkle: rnd(0.02, 0.1),
  }));
}

function makePlayer() {
  return {
    x: W / 2, y: H - 110, r: 14,
    hp: 100, maxHp: 100,
    shield: 0, maxShield: 0, shieldRegen: 0,
    speed: 4.5, dmg: 20,
    fireInterval: 10, fireTimer: 0,
    xp: 0, xpMax: xpThresh(1), lvl: 1, score: 0,
    spread: false, pierce: false, lifesteal: false,
    invTimer: 0, appliedSkills: [],
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function VoidBreaker() {
  const canvasRef = useRef(null);
  const gsRef = useRef(null);
  const rafRef = useRef(null);
  const phaseRef = useRef("menu");

  const [uiPhase, setUiPhase] = useState("menu");
  const [skillChoices, setSkillChoices] = useState([]);
  const [endScore, setEndScore] = useState(0);
  const [msgText, setMsgText] = useState("");

  const setPhase = (p) => { phaseRef.current = p; setUiPhase(p); };

  // ── Start / Reset ──────────────────────────────────────────────────────────
  function startGame() {
    const gs = {
      p: makePlayer(),
      bullets: [], eBullets: [], enemies: [], particles: [],
      boss: null, bossPhase: false, levelDone: false,
      stars: makeStars(),
      keys: new Set(),
      gameLevel: 0,
      wave: 0, waveCleared: false,
      spawnQueue: [], spawnTimer: 0,
      pendingLevelUp: false,
      shake: 0, shakeTimer: 0,
      frame: 0,
      msgTimer: 0, msgStr: "",
    };
    gsRef.current = gs;
    launchWave(gs, 0, 0);
    setPhase("playing");
  }

  function launchWave(gs, glvl, wave) {
    const cfg = LEVELS_CFG[glvl];
    gs.wave = wave; gs.waveCleared = false;
    gs.spawnTimer = 0;
    const count = cfg.waveEnemies[wave];
    const typePool = glvl === 0 ? [0, 0, 1] : glvl === 1 ? [0, 1, 1, 2] : [1, 2, 2];
    gs.spawnQueue = Array.from({ length: count }, (_, i) => ({
      type: typePool[Math.floor(Math.random() * typePool.length)],
      delay: 40 + i * 38,
      spawned: false,
    }));
    showMsg(gs, `WAVE ${wave + 1} — INCOMING`);
  }

  function showMsg(gs, str) {
    gs.msgStr = str; gs.msgTimer = 130;
  }

  function spawnEnemy(gs, type) {
    const r = type === 0 ? 11 : type === 1 ? 15 : 19;
    const hp = (type === 0 ? 38 : type === 1 ? 65 : 110) + gs.gameLevel * 12;
    gs.enemies.push({
      x: rnd(r + 10, W - r - 10), y: rnd(-90, -r),
      r, hp, maxHp: hp, type,
      vx: rnd(-0.5, 0.5) + (Math.random() > 0.5 ? 0.3 : -0.3) * gs.gameLevel * 0.2,
      vy: rnd(0.9, 1.6) + gs.gameLevel * 0.25,
      fireTimer: Math.floor(rnd(60, 130)),
      xpVal: type === 0 ? 15 : type === 1 ? 28 : 45,
    });
  }

  function launchBoss(gs) {
    const cfg = LEVELS_CFG[gs.gameLevel];
    gs.boss = {
      x: W / 2, y: -110,
      r: 52 + gs.gameLevel * 10,
      hp: cfg.bossHp, maxHp: cfg.bossHp,
      type: cfg.bossType, name: cfg.bossName,
      vy: 0.55, targetY: 140,
      phase: "enter",
      fireTimer: 0, fireInterval: 52,
      sinOffset: 0,
    };
    gs.bossPhase = true;
    showMsg(gs, `⚠ BOSS INCOMING: ${cfg.bossName}`);
  }

  function fireBullets(gs) {
    const p = gs.p;
    const base = [{ vx: 0, vy: -11 }];
    const angles = p.spread ? [{ a: -0.22 }, { a: 0 }, { a: 0.22 }] : [{ a: 0 }];
    for (const ag of angles) {
      gs.bullets.push({
        x: p.x, y: p.y - 12,
        vx: Math.sin(ag.a || 0) * 11,
        vy: -Math.cos(ag.a || 0) * 11,
        dmg: p.dmg, pierce: p.pierce,
        hitIds: new Set(),
      });
    }
  }

  function bossShoot(gs) {
    const b = gs.boss, p = gs.p;
    const dx = p.x - b.x, dy = p.y - b.y;
    const base = Math.atan2(dy, dx);
    const spreads = b.hp < b.maxHp * 0.4 ? [-0.3, -0.15, 0, 0.15, 0.3] : [-0.18, 0, 0.18];
    for (const da of spreads) {
      const a = base + da;
      gs.eBullets.push({ x: b.x, y: b.y, vx: Math.cos(a) * 4.2, vy: Math.sin(a) * 4.2 });
    }
  }

  function applySkill(gs, id) {
    const p = gs.p;
    p.appliedSkills.push(id);
    if (id === "damage")    p.dmg = Math.round(p.dmg * 1.30);
    if (id === "firerate")  p.fireInterval = Math.max(3, Math.round(p.fireInterval * 0.72));
    if (id === "speed")     p.speed *= 1.20;
    if (id === "maxhp")     { p.maxHp += 35; p.hp = Math.min(p.hp + 35, p.maxHp); }
    if (id === "shield")    { p.maxShield += 40; p.shield = Math.min(p.shield + 40, p.maxShield); p.shieldRegen = Math.max(p.shieldRegen, 0.12); }
    if (id === "spread")    p.spread = true;
    if (id === "pierce")    p.pierce = true;
    if (id === "lifesteal") p.lifesteal = true;
  }

  function triggerLevelUp(gs) {
    const owned = new Set(gs.p.appliedSkills);
    const stackable = new Set(["damage", "firerate", "speed", "maxhp", "shield"]);
    const pool = SKILLS.filter(s => !owned.has(s.id) || stackable.has(s.id));
    const choices = [];
    const copy = [...pool];
    while (choices.length < 3 && copy.length > 0) {
      choices.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
    }
    while (choices.length < 3) choices.push(SKILLS[Math.floor(Math.random() * SKILLS.length)]);
    setSkillChoices(choices);
    setPhase("skillpick");
  }

  function takeDmg(gs, amount) {
    const p = gs.p;
    if (p.invTimer > 0) return;
    if (p.shield > 0) {
      const abs = Math.min(p.shield, amount);
      p.shield -= abs; amount -= abs;
    }
    p.hp = Math.max(0, p.hp - amount);
    p.invTimer = 48;
    gs.shake = 5; gs.shakeTimer = 10;
    if (p.hp <= 0) { setEndScore(p.score); setPhase("gameover"); }
  }

  function spawnParticles(gs, x, y, n, col, spd = 3, life = 45) {
    for (let i = 0; i < n; i++) {
      const a = rnd(0, Math.PI * 2), s = rnd(0.5, spd);
      gs.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rnd(life * 0.5, life), maxLife: life, col, r: rnd(1, 3.5) });
    }
  }

  // ── RAF Loop ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const onDown = (e) => { if (gsRef.current) gsRef.current.keys.add(e.key); };
    const onUp = (e) => { if (gsRef.current) gsRef.current.keys.delete(e.key); };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);

    function loop() {
      rafRef.current = requestAnimationFrame(loop);
      ctx.fillStyle = "#00060f";
      ctx.fillRect(0, 0, W, H);

      const ph = phaseRef.current;
      const gs = gsRef.current;
      if (ph !== "playing" || !gs) return;

      gs.frame++;
      const p = gs.p;

      // Stars
      drawStars(ctx, gs.stars, gs.frame);

      // Ambient nebula glow (subtle)
      const lvlCols = ["rgba(0,30,80,0.18)", "rgba(40,0,80,0.18)", "rgba(80,0,30,0.18)"];
      const gg = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, W * 0.75);
      gg.addColorStop(0, lvlCols[gs.gameLevel] || "rgba(0,30,80,0.1)");
      gg.addColorStop(1, "transparent");
      ctx.fillStyle = gg; ctx.fillRect(0, 0, W, H);

      // ── Input ──────────────────────────────────────────────────────────────
      const spd = p.speed;
      const k = gs.keys;
      if (k.has("ArrowLeft") || k.has("a") || k.has("A")) p.x = clamp(p.x - spd, p.r + 4, W - p.r - 4);
      if (k.has("ArrowRight") || k.has("d") || k.has("D")) p.x = clamp(p.x + spd, p.r + 4, W - p.r - 4);
      if (k.has("ArrowUp") || k.has("w") || k.has("W")) p.y = clamp(p.y - spd, p.r + 4, H - p.r - 4);
      if (k.has("ArrowDown") || k.has("s") || k.has("S")) p.y = clamp(p.y + spd, p.r + 4, H - p.r - 4);

      // Auto-fire
      p.fireTimer--;
      if (p.fireTimer <= 0) { p.fireTimer = p.fireInterval; fireBullets(gs); }

      // Shield regen
      if (p.shieldRegen > 0 && p.shield < p.maxShield) p.shield = Math.min(p.maxShield, p.shield + p.shieldRegen);
      if (p.invTimer > 0) p.invTimer--;

      // ── Spawn enemies ──────────────────────────────────────────────────────
      if (!gs.bossPhase) {
        gs.spawnTimer++;
        for (const sq of gs.spawnQueue) {
          if (!sq.spawned && gs.spawnTimer >= sq.delay) {
            sq.spawned = true;
            spawnEnemy(gs, sq.type);
          }
        }
      }

      // ── Update particles ───────────────────────────────────────────────────
      for (let i = gs.particles.length - 1; i >= 0; i--) {
        const pt = gs.particles[i];
        pt.x += pt.vx; pt.y += pt.vy; pt.vx *= 0.93; pt.vy *= 0.93; pt.life--;
        if (pt.life <= 0) { gs.particles.splice(i, 1); continue; }
        ctx.globalAlpha = pt.life / pt.maxLife;
        glow(ctx, pt.col, 4);
        ctx.fillStyle = pt.col;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r * (pt.life / pt.maxLife), 0, Math.PI * 2); ctx.fill();
        noGlow(ctx);
      }
      ctx.globalAlpha = 1;

      // ── Update enemies ────────────────────────────────────────────────────
      for (let i = gs.enemies.length - 1; i >= 0; i--) {
        const e = gs.enemies[i];
        e.x += e.vx; e.y += e.vy;
        if (e.x < e.r || e.x > W - e.r) e.vx *= -1;
        if (e.y > H + 60) { gs.enemies.splice(i, 1); continue; }
        e.fireTimer--;
        if (e.fireTimer <= 0) {
          e.fireTimer = Math.floor(rnd(75, 135));
          const dx = p.x - e.x, dy = p.y - e.y, len = Math.hypot(dx, dy);
          gs.eBullets.push({ x: e.x, y: e.y, vx: dx / len * 3.8, vy: dy / len * 3.8 });
        }
        // Collide with player
        if (p.invTimer <= 0 && (e.x - p.x) ** 2 + (e.y - p.y) ** 2 < (e.r + p.r) ** 2) {
          takeDmg(gs, 22);
          spawnParticles(gs, p.x, p.y, 8, "#00aaff", 3, 20);
          gs.enemies.splice(i, 1);
          if (phaseRef.current !== "playing") return;
        }
        drawEnemy(ctx, e, gs.frame);
      }

      // ── Update boss ────────────────────────────────────────────────────────
      if (gs.boss) {
        const b = gs.boss;
        if (b.phase === "enter") {
          b.y += b.vy;
          if (b.y >= b.targetY) { b.y = b.targetY; b.phase = "active"; }
        } else if (b.phase === "active") {
          b.sinOffset += 0.013;
          b.x = W / 2 + Math.sin(b.sinOffset) * (W / 2 - b.r - 25);
          b.fireTimer--;
          if (b.fireTimer <= 0) { b.fireTimer = b.fireInterval; bossShoot(gs); }
          if (p.invTimer <= 0 && (b.x - p.x) ** 2 + (b.y - p.y) ** 2 < (b.r + p.r) ** 2) {
            takeDmg(gs, 40);
            if (phaseRef.current !== "playing") return;
          }
        }
        drawBoss(ctx, gs.boss, gs.frame);
      }

      // ── Player bullets ────────────────────────────────────────────────────
      for (let i = gs.bullets.length - 1; i >= 0; i--) {
        const b = gs.bullets[i];
        b.x += b.vx; b.y += b.vy;
        if (b.y < -20 || b.x < -20 || b.x > W + 20) { gs.bullets.splice(i, 1); continue; }

        let removed = false;
        // vs enemies
        for (let j = gs.enemies.length - 1; j >= 0; j--) {
          const e = gs.enemies[j];
          if (b.pierce && b.hitIds.has(j)) continue;
          if ((b.x - e.x) ** 2 + (b.y - e.y) ** 2 < (e.r + 3.5) ** 2) {
            e.hp -= b.dmg;
            spawnParticles(gs, e.x, e.y, 6, "#ff6600", 2.5, 18);
            if (b.pierce) { b.hitIds.add(j); }
            else { gs.bullets.splice(i, 1); removed = true; }
            if (e.hp <= 0) {
              spawnParticles(gs, e.x, e.y, 22, "#ff6600", 4, 55);
              spawnParticles(gs, e.x, e.y, 10, "#ffcc00", 2, 35);
              p.xp += e.xpVal; p.score += e.xpVal * 10;
              if (p.lifesteal) p.hp = Math.min(p.maxHp, p.hp + 6);
              gs.enemies.splice(j, 1);
              while (p.xp >= p.xpMax) { p.xp -= p.xpMax; p.lvl++; p.xpMax = xpThresh(p.lvl); gs.pendingLevelUp = true; }
            }
            if (removed) break;
          }
        }
        if (removed) continue;

        // vs boss
        if (gs.boss && gs.boss.phase !== "enter") {
          const b2 = gs.boss;
          if ((b.x - b2.x) ** 2 + (b.y - b2.y) ** 2 < (b2.r + 4) ** 2) {
            b2.hp -= b.dmg;
            spawnParticles(gs, b.x, b.y, 5, "#ff4400", 2, 14);
            if (!b.pierce) { gs.bullets.splice(i, 1); }
            if (b2.hp <= 0) {
              spawnParticles(gs, b2.x, b2.y, 70, "#ff8800", 7, 90);
              spawnParticles(gs, b2.x, b2.y, 40, "#ffffff", 4, 60);
              spawnParticles(gs, b2.x, b2.y, 30, "#ff4400", 5, 70);
              p.score += b2.maxHp * 3; p.xp += Math.floor(b2.maxHp / 3);
              while (p.xp >= p.xpMax) { p.xp -= p.xpMax; p.lvl++; p.xpMax = xpThresh(p.lvl); gs.pendingLevelUp = true; }
              gs.boss = null;
              gs.levelDone = true;
            }
          }
        }
        if (!removed && gs.bullets[i]) drawBullet(ctx, b, gs.frame);
      }

      // ── Enemy bullets ─────────────────────────────────────────────────────
      for (let i = gs.eBullets.length - 1; i >= 0; i--) {
        const b = gs.eBullets[i];
        b.x += b.vx; b.y += b.vy;
        if (b.x < 0 || b.x > W || b.y < -20 || b.y > H + 20) { gs.eBullets.splice(i, 1); continue; }
        if (p.invTimer <= 0 && (b.x - p.x) ** 2 + (b.y - p.y) ** 2 < p.r ** 2) {
          gs.eBullets.splice(i, 1);
          takeDmg(gs, 13);
          if (phaseRef.current !== "playing") return;
          continue;
        }
        drawEBullet(ctx, b);
      }

      // ── Draw player ────────────────────────────────────────────────────────
      if (p.invTimer % 5 < 3) drawPlayer(ctx, p, gs.frame);

      // ── Wave clear check ───────────────────────────────────────────────────
      if (!gs.bossPhase && !gs.waveCleared) {
        const allSpawned = gs.spawnQueue.every(q => q.spawned);
        if (allSpawned && gs.enemies.length === 0) {
          gs.waveCleared = true;
          const cfg = LEVELS_CFG[gs.gameLevel];
          if (gs.wave + 1 < cfg.waveEnemies.length) {
            setTimeout(() => { if (phaseRef.current === "playing" && gsRef.current) launchWave(gsRef.current, gs.gameLevel, gs.wave + 1); }, 1800);
          } else {
            showMsg(gs, "⚠ BOSS INCOMING…");
            setTimeout(() => { if (phaseRef.current === "playing" && gsRef.current) launchBoss(gsRef.current); }, 2400);
          }
        }
      }

      // ── Level done ─────────────────────────────────────────────────────────
      if (gs.levelDone) {
        gs.levelDone = false;
        gs.enemies = []; gs.eBullets = []; gs.bullets = [];
        if (gs.gameLevel + 1 < LEVELS_CFG.length) {
          setPhase("levelcomplete");
        } else {
          setEndScore(p.score); setPhase("victory");
        }
        return;
      }

      // ── Level up ───────────────────────────────────────────────────────────
      if (gs.pendingLevelUp) {
        gs.pendingLevelUp = false;
        triggerLevelUp(gs);
        return;
      }

      // ── HUD & message ──────────────────────────────────────────────────────
      drawHUD(ctx, p);

      // Wave label
      if (!gs.bossPhase) {
        const cfg = LEVELS_CFG[gs.gameLevel];
        ctx.fillStyle = "rgba(0,200,255,0.5)";
        ctx.font = "11px 'Courier New', monospace"; ctx.textAlign = "right";
        ctx.fillText(`WAVE ${gs.wave + 1} / ${cfg.waveEnemies.length}`, W - 12, 22);
      }

      // Level name bottom
      ctx.fillStyle = "rgba(80,140,255,0.35)";
      ctx.font = "10px 'Courier New', monospace"; ctx.textAlign = "left";
      ctx.fillText(LEVELS_CFG[gs.gameLevel].name + " · " + LEVELS_CFG[gs.gameLevel].sub, 12, H - 10);

      // Center message
      if (gs.msgTimer > 0) {
        gs.msgTimer--;
        const alpha = Math.min(1, gs.msgTimer / 30) * Math.min(1, (gs.msgTimer) / 30 * 2);
        ctx.globalAlpha = Math.min(1, gs.msgTimer > 100 ? 1 : gs.msgTimer / 30);
        glow(ctx, "#00d4ff", 12);
        ctx.fillStyle = "#00d4ff"; ctx.font = "bold 18px 'Courier New', monospace"; ctx.textAlign = "center";
        ctx.fillText(gs.msgStr, W / 2, H / 2);
        noGlow(ctx); ctx.globalAlpha = 1;
      }
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  // ── Event handlers ─────────────────────────────────────────────────────────
  function pickSkill(id) {
    if (gsRef.current) applySkill(gsRef.current, id);
    setPhase("playing");
  }

  function nextLevel() {
    const gs = gsRef.current;
    gs.gameLevel++;
    gs.enemies = []; gs.eBullets = []; gs.bullets = []; gs.boss = null;
    gs.bossPhase = false; gs.waveCleared = false; gs.levelDone = false;
    gs.p.hp = Math.min(gs.p.maxHp, gs.p.hp + 45); // partial heal
    launchWave(gs, gs.gameLevel, 0);
    setPhase("playing");
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#00030a", fontFamily: "'Courier New', monospace" }}>
      <div style={{ position: "relative", width: W, height: H }}>
        <canvas ref={canvasRef} width={W} height={H} style={{ display: "block", borderTop: "1px solid #003366", borderBottom: "1px solid #003366" }} tabIndex={0} />

        {/* ── MENU ── */}
        {uiPhase === "menu" && (
          <div style={overlay}>
            <div style={panel}>
              <div style={{ fontSize: 11, letterSpacing: 6, color: "#004488", marginBottom: 6 }}>ANTHROPIC DEEP SPACE COMBAT</div>
              <h1 style={{ margin: 0, fontSize: 52, fontWeight: 900, letterSpacing: 4, color: "#00d4ff", textShadow: "0 0 20px #00d4ff, 0 0 60px #0066ff" }}>VOID<br />BREAKER</h1>
              <div style={{ color: "#004466", fontSize: 12, letterSpacing: 8, marginTop: 4 }}>RPG · SPACE SHOOTER</div>
              <div style={{ margin: "28px 0 32px", color: "#336688", fontSize: 12, lineHeight: 2.2, letterSpacing: 1 }}>
                <div>↑ ↓ ← →  /  W A S D — MOVE &amp; DODGE</div>
                <div>AUTO-FIRE ENABLED — FOCUS ON SURVIVAL</div>
                <div>LEVEL UP → CHOOSE AN UPGRADE</div>
                <div>3 SECTORS · 3 BOSSES · 8 SKILLS</div>
              </div>
              <button onClick={startGame} style={btn("#00d4ff")} onMouseEnter={e => e.target.style.background = "#00d4ff22"} onMouseLeave={e => e.target.style.background = "transparent"}>
                ⚡ LAUNCH MISSION
              </button>
            </div>
          </div>
        )}

        {/* ── SKILL PICK ── */}
        {uiPhase === "skillpick" && (
          <div style={overlay}>
            <div style={{ textAlign: "center", maxWidth: 680, padding: "0 20px" }}>
              <div style={{ fontSize: 10, letterSpacing: 5, color: "#660099", marginBottom: 6 }}>SHIP SYSTEMS</div>
              <h2 style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 900, color: "#bb44ff", textShadow: "0 0 20px #bb44ff" }}>UPGRADE AVAILABLE</h2>
              <div style={{ color: "#664488", fontSize: 11, letterSpacing: 4, marginBottom: 28 }}>SELECT ONE ENHANCEMENT</div>
              <div style={{ display: "flex", gap: 14 }}>
                {skillChoices.map(sk => (
                  <div key={sk.id + Math.random()} onClick={() => pickSkill(sk.id)}
                    style={{ flex: 1, padding: "22px 16px", cursor: "pointer", border: `2px solid ${sk.col}88`, borderRadius: 6, background: "rgba(0,0,0,0.8)", transition: "all 0.15s", boxShadow: `0 0 20px ${sk.col}22` }}
                    onMouseEnter={e => { e.currentTarget.style.border = `2px solid ${sk.col}`; e.currentTarget.style.background = `${sk.col}18`; e.currentTarget.style.boxShadow = `0 0 30px ${sk.col}44`; }}
                    onMouseLeave={e => { e.currentTarget.style.border = `2px solid ${sk.col}88`; e.currentTarget.style.background = "rgba(0,0,0,0.8)"; e.currentTarget.style.boxShadow = `0 0 20px ${sk.col}22`; }}
                  >
                    <div style={{ color: sk.col, fontSize: 15, fontWeight: 900, textShadow: `0 0 10px ${sk.col}`, marginBottom: 10, letterSpacing: 1 }}>{sk.name}</div>
                    <div style={{ color: "#aaaaaa", fontSize: 12, lineHeight: 1.5 }}>{sk.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── LEVEL COMPLETE ── */}
        {uiPhase === "levelcomplete" && gsRef.current && (() => {
          const nextCfg = LEVELS_CFG[gsRef.current.gameLevel + 1];
          return (
            <div style={overlay}>
              <div style={panel}>
                <div style={{ fontSize: 10, letterSpacing: 5, color: "#006633", marginBottom: 8 }}>SECTOR CLEARED</div>
                <h2 style={{ margin: "0 0 4px", fontSize: 34, fontWeight: 900, color: "#44ff88", textShadow: "0 0 25px #44ff88" }}>
                  {LEVELS_CFG[gsRef.current.gameLevel].name}
                </h2>
                <div style={{ color: "#226644", fontSize: 12, letterSpacing: 3, marginBottom: 24 }}>{LEVELS_CFG[gsRef.current.gameLevel].sub}</div>
                <div style={{ fontSize: 22, color: "#ffdd44", marginBottom: 8, textShadow: "0 0 12px #ffaa00" }}>
                  {gsRef.current.p.score.toLocaleString()}
                </div>
                <div style={{ color: "#666", fontSize: 11, marginBottom: 28 }}>SCORE  ·  +45 HP RESTORED</div>
                {nextCfg && <div style={{ color: "#446688", fontSize: 11, letterSpacing: 3, marginBottom: 20 }}>NEXT → {nextCfg.name} · {nextCfg.sub}</div>}
                <button onClick={nextLevel} style={btn("#44ff88")} onMouseEnter={e => e.target.style.background = "#44ff8822"} onMouseLeave={e => e.target.style.background = "transparent"}>
                  NEXT SECTOR →
                </button>
              </div>
            </div>
          );
        })()}

        {/* ── GAME OVER ── */}
        {uiPhase === "gameover" && (
          <div style={overlay}>
            <div style={panel}>
              <div style={{ fontSize: 10, letterSpacing: 5, color: "#660000", marginBottom: 8 }}>SHIP DESTROYED</div>
              <h2 style={{ margin: "0 0 4px", fontSize: 40, fontWeight: 900, color: "#ff2244", textShadow: "0 0 30px #ff2244" }}>MISSION<br />FAILED</h2>
              <div style={{ fontSize: 22, color: "#ffdd44", margin: "22px 0 6px", textShadow: "0 0 12px #ffaa00" }}>{endScore.toLocaleString()}</div>
              <div style={{ color: "#666", fontSize: 11, marginBottom: 32 }}>FINAL SCORE</div>
              <button onClick={startGame} style={btn("#ff4466")} onMouseEnter={e => e.target.style.background = "#ff446622"} onMouseLeave={e => e.target.style.background = "transparent"}>
                ↺ RETRY MISSION
              </button>
              <br /><br />
              <button onClick={() => setPhase("menu")} style={{ ...btn("#4488ff"), fontSize: 11, padding: "8px 24px" }} onMouseEnter={e => e.target.style.background = "#4488ff22"} onMouseLeave={e => e.target.style.background = "transparent"}>
                MAIN MENU
              </button>
            </div>
          </div>
        )}

        {/* ── VICTORY ── */}
        {uiPhase === "victory" && (
          <div style={overlay}>
            <div style={panel}>
              <div style={{ fontSize: 10, letterSpacing: 5, color: "#886600", marginBottom: 8 }}>THE VOID CONQUERED</div>
              <h2 style={{ margin: "0 0 4px", fontSize: 50, fontWeight: 900, color: "#ffdd00", textShadow: "0 0 30px #ffdd00, 0 0 70px #ffaa00" }}>VICTORY</h2>
              <div style={{ color: "#665500", fontSize: 12, letterSpacing: 4, marginBottom: 24 }}>ALL SECTORS CLEARED</div>
              <div style={{ fontSize: 26, color: "#ffdd44", textShadow: "0 0 15px #ffaa00", marginBottom: 8 }}>{endScore.toLocaleString()}</div>
              <div style={{ color: "#666", fontSize: 11, marginBottom: 32 }}>FINAL SCORE</div>
              <button onClick={startGame} style={btn("#ffdd00")} onMouseEnter={e => e.target.style.background = "#ffdd0022"} onMouseLeave={e => e.target.style.background = "transparent"}>
                ↺ PLAY AGAIN
              </button>
            </div>
          </div>
        )}
      </div>
      <div style={{ marginTop: 10, color: "#112244", fontSize: 10, letterSpacing: 2 }}>WASD / ARROW KEYS TO MOVE · AUTO-FIRE ACTIVE · CLICK CANVAS TO FOCUS</div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const overlay = {
  position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
  display: "flex", alignItems: "center", justifyContent: "center",
  background: "rgba(0,3,12,0.92)",
};

const panel = {
  textAlign: "center", padding: "0 40px",
};

const btn = (col) => ({
  background: "transparent", border: `2px solid ${col}`,
  color: col, padding: "13px 40px", fontSize: 13,
  fontFamily: "'Courier New', monospace", cursor: "pointer",
  letterSpacing: 3, fontWeight: 900,
  textShadow: `0 0 8px ${col}`,
  boxShadow: `0 0 25px ${col}33`,
  transition: "all 0.2s",
});
