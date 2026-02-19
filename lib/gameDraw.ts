import type { Player, Enemy, Boss, Bullet, EnemyBullet, Particle, Star, BackStar, Dust, DamageNumber } from "./gameTypes";
import type { SkillDef } from "./gameTypes";
import { W, H, SKILLS, LEVELS_CFG, rnd, BULLET_TRAIL_LEN } from "./gameConstants";

type Ctx = CanvasRenderingContext2D;

function glow(ctx: Ctx, col: string, size: number) {
  ctx.shadowColor = col;
  ctx.shadowBlur = size;
}
function noGlow(ctx: Ctx) {
  ctx.shadowBlur = 0;
}

/** Far parallax layer — slower scroll, dimmer (drawn first). When freeze, only draw. */
export function drawBackStars(ctx: Ctx, backStars: BackStar[], frame: number, scrollSpeed: number, freeze = false) {
  const slow = 0.45 * scrollSpeed;
  for (const s of backStars) {
    if (!freeze) {
      s.y += s.spd + slow;
      if (s.y > H + 2) {
        s.y = -2;
        s.x = rnd(0, W);
      }
    }
    const alpha = 0.4 * s.bright * (0.8 + Math.sin(frame * s.twinkle) * 0.2);
    ctx.fillStyle = `rgba(120,160,220,${alpha})`;
    ctx.fillRect(s.x, s.y, s.sz, s.sz * (s.spd > 0.8 ? 1.5 : 1));
  }
}

/** Space dust — tiny drifting particles. When freeze, only draw. */
export function drawDust(ctx: Ctx, dust: Dust[], scrollSpeed: number, freeze = false) {
  for (const d of dust) {
    if (!freeze) {
      d.x += d.vx;
      d.y += d.vy + scrollSpeed;
      if (d.y > H + 4) {
        d.y = -2;
        d.x = rnd(0, W);
        d.alpha = rnd(0.04, 0.14);
        d.size = rnd(0.8, 1.8);
      }
    }
    ctx.fillStyle = `rgba(180,200,255,${d.alpha})`;
    ctx.fillRect(d.x, d.y, d.size, d.size);
  }
}

export function drawStars(ctx: Ctx, stars: Star[], frame: number, scrollSpeed: number, freeze = false) {
  for (const s of stars) {
    if (!freeze) {
      s.y += s.spd + scrollSpeed;
      if (s.y > H + 2) {
        s.y = -2;
        s.x = rnd(0, W);
      }
    }
    const alpha = s.bright * (0.85 + Math.sin(frame * s.twinkle) * 0.15);
    ctx.fillStyle = `rgba(180,210,255,${alpha})`;
    ctx.fillRect(s.x, s.y, s.sz, s.sz * (s.spd > 1 ? 2 : 1));
  }
}

/** Nebula gradient with slow pulse (atmospheric) */
export function drawNebulaPulse(ctx: Ctx, gameLevel: number, frame: number) {
  const pulse = 0.92 + 0.08 * Math.sin(frame * 0.02);
  const lvlCols = [
    `rgba(0,30,80,${0.18 * pulse})`,
    `rgba(40,0,80,${0.18 * pulse})`,
    `rgba(80,0,30,${0.18 * pulse})`,
  ];
  const gg = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, W * 0.75);
  gg.addColorStop(0, lvlCols[gameLevel] ?? `rgba(0,30,80,${0.1 * pulse})`);
  gg.addColorStop(1, "transparent");
  ctx.fillStyle = gg;
  ctx.fillRect(0, 0, W, H);
}

export function drawPlayer(ctx: Ctx, p: Player, frame: number) {
  ctx.save();
  ctx.translate(p.x, p.y);

  const fl = 12 + Math.sin(frame * 0.35) * 5;
  const eng = ctx.createLinearGradient(0, 8, 0, 8 + fl);
  eng.addColorStop(0, "rgba(0,220,255,0.9)");
  eng.addColorStop(0.5, "rgba(0,100,255,0.5)");
  eng.addColorStop(1, "rgba(0,50,255,0)");
  ctx.fillStyle = eng;
  ctx.beginPath();
  ctx.moveTo(-5, 8);
  ctx.lineTo(5, 8);
  ctx.lineTo(0, 8 + fl);
  ctx.closePath();
  ctx.fill();

  const fl2 = 8 + Math.sin(frame * 0.35 + 1) * 3;
  const eng2 = ctx.createLinearGradient(0, 6, 0, 6 + fl2);
  eng2.addColorStop(0, "rgba(0,200,255,0.6)");
  eng2.addColorStop(1, "rgba(0,100,255,0)");
  ctx.fillStyle = eng2;
  ctx.beginPath();
  ctx.moveTo(-10, 6);
  ctx.lineTo(-7, 6);
  ctx.lineTo(-8.5, 6 + fl2);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(10, 6);
  ctx.lineTo(7, 6);
  ctx.lineTo(8.5, 6 + fl2);
  ctx.closePath();
  ctx.fill();

  glow(ctx, "#00d4ff", 18);
  ctx.strokeStyle = "#00d4ff";
  ctx.fillStyle = "#001830";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.lineTo(14, 10);
  ctx.lineTo(7, 5);
  ctx.lineTo(0, 7);
  ctx.lineTo(-7, 5);
  ctx.lineTo(-14, 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  glow(ctx, "#00ffff", 12);
  ctx.fillStyle = "#00ffff";
  ctx.beginPath();
  ctx.ellipse(0, -6, 3.5, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  noGlow(ctx);
  ctx.strokeStyle = "#0088ff";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-9, 7);
  ctx.lineTo(-11, 2);
  ctx.lineTo(-6, 0);
  ctx.moveTo(9, 7);
  ctx.lineTo(11, 2);
  ctx.lineTo(6, 0);
  ctx.stroke();

  if (p.shield > 0) {
    const a2 = 0.2 + 0.12 * Math.sin(frame * 0.08);
    glow(ctx, "#4488ff", 22);
    ctx.strokeStyle = `rgba(68,136,255,${a2 + 0.35})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.stroke();
  }

  noGlow(ctx);
  ctx.restore();
}

export function drawEnemy(ctx: Ctx, e: Enemy, _frame: number) {
  ctx.save();
  ctx.translate(e.x, e.y);
  const r = e.r;

  if (e.type === 0) {
    glow(ctx, "#ff3333", 10);
    ctx.strokeStyle = "#ff4444";
    ctx.fillStyle = "#1a0000";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, r);
    ctx.lineTo(-r, -r * 0.8);
    ctx.lineTo(r, -r * 0.8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    glow(ctx, "#ff0000", 8);
    ctx.fillStyle = "#ff3333";
    ctx.beginPath();
    ctx.arc(0, -r * 0.1, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (e.type === 1) {
    glow(ctx, "#ff7700", 12);
    ctx.strokeStyle = "#ff9900";
    ctx.fillStyle = "#1a0800";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, r);
    ctx.lineTo(r * 0.75, 0);
    ctx.lineTo(0, -r);
    ctx.lineTo(-r * 0.75, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#ff4400";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-r * 0.5, 0);
    ctx.lineTo(r * 0.5, 0);
    ctx.stroke();
  } else if (e.type === 3) {
    const col = e.elite ? "#ffcc00" : "#44aaff";
    glow(ctx, e.elite ? "#ffaa00" : "#4488ff", e.elite ? 14 : 10);
    ctx.strokeStyle = col;
    ctx.fillStyle = e.elite ? "#1a1a00" : "#0a1520";
    ctx.lineWidth = e.elite ? 2 : 1.5;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    if (e.elite) {
      glow(ctx, "#ffdd00", 6);
      ctx.fillStyle = "#ffcc00";
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    glow(ctx, "#bb00ff", 14);
    ctx.strokeStyle = "#cc44ff";
    ctx.fillStyle = "#0e001a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
      if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    glow(ctx, "#ff00ff", 8);
    ctx.fillStyle = "#ff44ff";
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  if (e.hp < e.maxHp) {
    const bw = r * 2.2,
      bh = 3,
      bx = -bw / 2,
      by2 = -r - 7;
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(bx, by2, bw, bh);
    ctx.fillStyle =
      e.hp / e.maxHp > 0.5 ? "#44ff44" : e.hp / e.maxHp > 0.25 ? "#ffaa00" : "#ff2222";
    ctx.fillRect(bx, by2, bw * (e.hp / e.maxHp), bh);
    noGlow(ctx);
  }

  noGlow(ctx);
  ctx.restore();
}

export function drawBossTelegraph(ctx: Ctx, boss: Boss, telegraphTimer: number) {
  if (telegraphTimer <= 0 || boss.phase !== "active") return;
  const r = boss.r + 15;
  const alpha = 0.3 + 0.25 * (1 - telegraphTimer / 18);
  ctx.strokeStyle = `rgba(255,100,0,${alpha})`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(boss.x, boss.y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = `rgba(255,80,0,${alpha * 0.15})`;
  ctx.fill();
}

export function drawBoss(ctx: Ctx, boss: Boss, frame: number) {
  if (boss.phase === "dead") return;
  const r = boss.r;
  ctx.save();
  ctx.translate(boss.x, boss.y);
  const pulse = 1 + Math.sin(frame * 0.04) * 0.04;
  ctx.scale(pulse, pulse);

  if (boss.type === 0) {
    glow(ctx, "#ff4400", 28);
    ctx.strokeStyle = "#ff6600";
    ctx.fillStyle = "#1a0800";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, r);
    ctx.lineTo(r * 0.55, r * 0.4);
    ctx.lineTo(r, -r * 0.15);
    ctx.lineTo(r * 0.35, -r);
    ctx.lineTo(-r * 0.35, -r);
    ctx.lineTo(-r, -r * 0.15);
    ctx.lineTo(-r * 0.55, r * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    glow(ctx, "#ff8800", 20);
    ctx.fillStyle = "#ff7700";
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ff4400";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(r * 0.65, r * 0.15);
    ctx.moveTo(0, 0);
    ctx.lineTo(-r * 0.65, r * 0.15);
    ctx.stroke();
  } else if (boss.type === 1) {
    glow(ctx, "#9900ff", 32);
    ctx.strokeStyle = "#cc44ff";
    ctx.fillStyle = "#0e001a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 - Math.PI / 8;
      if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.save();
    ctx.rotate(frame * 0.025);
    glow(ctx, "#ff00ff", 12);
    ctx.strokeStyle = "#ff44ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.rotate(-frame * 0.018);
    ctx.strokeStyle = "#8800ff";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.38, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    glow(ctx, "#ff00ff", 18);
    ctx.fillStyle = "#ee00ff";
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.15, 0, Math.PI * 2);
    ctx.fill();
  } else {
    glow(ctx, "#ff0044", 38);
    ctx.strokeStyle = "#ff2266";
    ctx.fillStyle = "#1a0010";
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const rad = i % 2 === 0 ? r : r * 0.62;
      if (i === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
      else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.save();
    ctx.rotate(frame * 0.02);
    glow(ctx, "#ff0088", 14);
    ctx.strokeStyle = "#ff0099";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.rotate(-frame * 0.03);
    ctx.strokeStyle = "#ff4400";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    glow(ctx, "#ff0044", 22);
    ctx.fillStyle = "#ff0055";
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }

  noGlow(ctx);
  ctx.restore();

  const bw = 420,
    bh = 16,
    bx2 = (W - bw) / 2,
    by2 = 14;
  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.fillRect(bx2 - 3, by2 - 3, bw + 6, bh + 6);
  const bgrad = ctx.createLinearGradient(bx2, 0, bx2 + bw, 0);
  if (boss.type === 0) {
    bgrad.addColorStop(0, "#aa0000");
    bgrad.addColorStop(1, "#ff6600");
  } else if (boss.type === 1) {
    bgrad.addColorStop(0, "#6600cc");
    bgrad.addColorStop(1, "#ff44ff");
  } else {
    bgrad.addColorStop(0, "#aa0033");
    bgrad.addColorStop(1, "#ff4400");
  }
  ctx.fillStyle = "#1a0000";
  ctx.fillRect(bx2, by2, bw, bh);
  ctx.fillStyle = bgrad;
  ctx.fillRect(bx2, by2, bw * Math.max(0, boss.hp / boss.maxHp), bh);
  glow(ctx, "#ff6600", 6);
  ctx.strokeStyle = "#ff6600";
  ctx.lineWidth = 1;
  ctx.strokeRect(bx2, by2, bw, bh);
  noGlow(ctx);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 11px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.fillText(
    `${boss.name}  ·  ${Math.max(0, Math.ceil(boss.hp))} / ${boss.maxHp}`,
    W / 2,
    by2 + 11
  );
}

export function drawBullet(ctx: Ctx, b: Bullet, _frame: number) {
  const trail = b.trail;
  if (trail && trail.length > 0) {
    for (let i = 0; i < trail.length; i++) {
      const t = trail[i]!;
      const alpha = (i / trail.length) * 0.4;
      ctx.fillStyle = `rgba(0,255,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    noGlow(ctx);
  }
  glow(ctx, "#00ffff", 10);
  ctx.fillStyle = "#aaffff";
  ctx.beginPath();
  ctx.arc(b.x, b.y, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(0,255,255,0.3)";
  ctx.beginPath();
  ctx.arc(b.x, b.y, 6, 0, Math.PI * 2);
  ctx.fill();
  noGlow(ctx);
}

export function drawEBullet(ctx: Ctx, b: EnemyBullet) {
  glow(ctx, "#ff4400", 8);
  ctx.fillStyle = "#ff8844";
  ctx.beginPath();
  ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
  ctx.fill();
  noGlow(ctx);
}

export function drawParticle(ctx: Ctx, pt: Particle) {
  ctx.globalAlpha = pt.life / pt.maxLife;
  glow(ctx, pt.col, 4);
  ctx.fillStyle = pt.col;
  ctx.beginPath();
  ctx.arc(pt.x, pt.y, pt.r * (pt.life / pt.maxLife), 0, Math.PI * 2);
  ctx.fill();
  noGlow(ctx);
}

export function drawDamageNumbers(ctx: Ctx, list: DamageNumber[]) {
  for (const d of list) {
    const alpha = d.life / d.maxLife;
    ctx.globalAlpha = alpha;
    ctx.font = d.isCrit ? "bold 14px 'Courier New', monospace" : "bold 11px 'Courier New', monospace";
    ctx.fillStyle = d.isCrit ? "#ffdd00" : "#00ddff";
    ctx.strokeStyle = d.isCrit ? "#ff8800" : "#0088aa";
    ctx.lineWidth = 1;
    ctx.textAlign = "center";
    const y = d.y - (1 - alpha) * 20;
    ctx.strokeText(`-${d.value}`, d.x, y);
    ctx.fillText(`-${d.value}`, d.x, y);
  }
  ctx.globalAlpha = 1;
}

export function drawMuzzleFlash(ctx: Ctx, px: number, py: number, frame: number) {
  const size = 8 + Math.sin(frame * 0.5) * 3;
  const alpha = 0.7;
  ctx.fillStyle = `rgba(0,220,255,${alpha})`;
  ctx.beginPath();
  ctx.ellipse(px, py - 14, size * 0.6, size, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255,255,255,${alpha * 0.5})`;
  ctx.beginPath();
  ctx.ellipse(px, py - 14, size * 0.3, size * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function drawCombo(ctx: Ctx, comboCount: number, x: number, y: number) {
  if (comboCount < 3) return;
  ctx.font = "bold 18px 'Courier New', monospace";
  ctx.fillStyle = "#ffaa00";
  ctx.strokeStyle = "#ff6600";
  ctx.lineWidth = 2;
  ctx.textAlign = "center";
  ctx.strokeText(`×${comboCount} COMBO`, x, y);
  ctx.fillText(`×${comboCount} COMBO`, x, y);
}

export function drawDashCooldown(ctx: Ctx, cooldown: number, max: number, px: number, py: number) {
  if (max <= 0 || cooldown <= 0) return;
  const pct = 1 - cooldown / max;
  ctx.strokeStyle = "#00d4ff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(px, py + 35, 18, -Math.PI / 2, -Math.PI / 2 + pct * Math.PI * 2);
  ctx.stroke();
}

export function drawOverdriveMeter(ctx: Ctx, value: number, max: number) {
  const barW = 100;
  const barH = 6;
  const bx = W - barW - 14;
  const by = 50;
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(bx, by, barW, barH);
  ctx.fillStyle = value >= max ? "#ff4400" : "#8844ff";
  ctx.fillRect(bx, by, barW * (value / max), barH);
  ctx.strokeStyle = "#aa66ff";
  ctx.lineWidth = 1;
  ctx.strokeRect(bx, by, barW, barH);
  ctx.fillStyle = "#ccaaff";
  ctx.font = "bold 8px 'Courier New', monospace";
  ctx.textAlign = "left";
  ctx.fillText("OD", bx - 14, by + 5);
}

export function drawLevelUpMessage(ctx: Ctx) {
  ctx.font = "bold 32px 'Courier New', monospace";
  ctx.fillStyle = "#00ffff";
  ctx.strokeStyle = "#0088ff";
  ctx.lineWidth = 3;
  ctx.textAlign = "center";
  ctx.strokeText("LEVEL UP", W / 2, H / 2);
  ctx.fillText("LEVEL UP", W / 2, H / 2);
}

export function drawScreenFlash(ctx: Ctx, timer: number, max: number) {
  if (timer <= 0) return;
  const alpha = (timer / max) * 0.4;
  ctx.fillStyle = `rgba(255,255,255,${alpha})`;
  ctx.fillRect(0, 0, W, H);
}

export function drawHUD(
  ctx: Ctx,
  p: Player,
  gameLevel: number,
  distance: number,
  bossPhase: boolean,
  nextBossAt?: number,
  comboCount?: number,
  dashCooldown?: number,
  dashCooldownMax?: number,
  overdriveMeter?: number,
  overdriveMax?: number
) {
  const barW = 170,
    barH = 13;
  const bx = 12,
    by = 14;

  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(bx - 1, by - 1, barW + 2, barH + 2);
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(bx, by, barW, barH);
  const hr = p.hp / p.maxHp;
  const hcol = hr > 0.6 ? "#44ff66" : hr > 0.3 ? "#ffaa00" : "#ff2222";
  ctx.fillStyle = hcol;
  ctx.fillRect(bx, by, barW * hr, barH);
  glow(ctx, hcol, 5);
  ctx.strokeStyle = hcol;
  ctx.lineWidth = 1;
  ctx.strokeRect(bx, by, barW, barH);
  noGlow(ctx);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 10px 'Courier New', monospace";
  ctx.textAlign = "left";
  ctx.fillText(`HP  ${Math.ceil(p.hp)} / ${p.maxHp}`, bx + 3, by + 9);

  if (p.maxShield > 0) {
    const sy = by + barH + 5;
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(bx - 1, sy - 1, barW + 2, barH + 2);
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(bx, sy, barW, barH);
    ctx.fillStyle = "#4488ff";
    ctx.fillRect(bx, sy, barW * (p.shield / p.maxShield), barH);
    glow(ctx, "#4488ff", 5);
    ctx.strokeStyle = "#4488ff";
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, sy, barW, barH);
    noGlow(ctx);
    ctx.fillStyle = "#aaccff";
    ctx.font = "bold 10px 'Courier New', monospace";
    ctx.textAlign = "left";
    ctx.fillText(`SH  ${Math.ceil(p.shield)} / ${p.maxShield}`, bx + 3, sy + 9);
  }

  const xpy = by + barH + (p.maxShield > 0 ? barH + 10 : 5) + 5;
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(bx - 1, xpy - 1, barW + 2, 9 + 2);
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(bx, xpy, barW, 9);
  ctx.fillStyle = "#aa44ff";
  ctx.fillRect(bx, xpy, barW * (p.xp / p.xpMax), 9);
  glow(ctx, "#aa44ff", 4);
  ctx.strokeStyle = "#aa44ff";
  ctx.lineWidth = 1;
  ctx.strokeRect(bx, xpy, barW, 9);
  noGlow(ctx);
  ctx.fillStyle = "#ddaaff";
  ctx.font = "bold 9px 'Courier New', monospace";
  ctx.textAlign = "left";
  ctx.fillText(`LVL ${p.lvl}  ·  ${Math.floor(p.xp)} / ${p.xpMax} XP`, bx + 3, xpy + 7);

  glow(ctx, "#ffcc00", 10);
  ctx.fillStyle = "#ffdd44";
  ctx.font = "bold 16px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.fillText(String(p.score).padStart(9, "0"), W / 2, 24);
  noGlow(ctx);

  if (p.appliedSkills.length > 0) {
    let sx = W - 14;
    for (let i = p.appliedSkills.length - 1; i >= 0; i--) {
      const sk: SkillDef | undefined = SKILLS.find((s) => s.id === p.appliedSkills[i]);
      if (!sk) continue;
      const abbr = sk.name.slice(0, 3);
      const tw = ctx.measureText(abbr).width + 10;
      sx -= tw;
      ctx.fillStyle = `${sk.col}33`;
      ctx.fillRect(sx - 2, 8, tw + 4, 16);
      ctx.strokeStyle = sk.col;
      ctx.lineWidth = 1;
      ctx.strokeRect(sx - 2, 8, tw + 4, 16);
      ctx.fillStyle = sk.col;
      ctx.font = "bold 8px 'Courier New', monospace";
      ctx.textAlign = "left";
      ctx.fillText(abbr, sx + 1, 19);
      sx -= 4;
    }
  }

  if (!bossPhase && LEVELS_CFG[gameLevel]) {
    ctx.fillStyle = "rgba(0,200,255,0.5)";
    ctx.font = "11px 'Courier New', monospace";
    ctx.textAlign = "right";
    ctx.fillText(`DIST ${Math.floor(distance)}`, W - 12, 22);
    if (nextBossAt != null && nextBossAt > 0) {
      ctx.fillStyle = "rgba(255,180,0,0.7)";
      ctx.font = "10px 'Courier New', monospace";
      ctx.fillText(`Next boss: ~${Math.floor(nextBossAt)}m`, W - 12, 36);
    }
  }

  if (comboCount != null && comboCount >= 3) {
    drawCombo(ctx, comboCount, W / 2, 52);
  }

  if (dashCooldown != null && dashCooldownMax != null && p) {
    drawDashCooldown(ctx, dashCooldown, dashCooldownMax, p.x, p.y);
  }

  if (overdriveMeter != null && overdriveMax != null) {
    drawOverdriveMeter(ctx, overdriveMeter, overdriveMax);
  }

  const sectorCfg = LEVELS_CFG[gameLevel];
  if (sectorCfg) {
    ctx.fillStyle = "rgba(80,140,255,0.35)";
    ctx.font = "10px 'Courier New', monospace";
    ctx.textAlign = "left";
    ctx.fillText(`${sectorCfg.name} · ${sectorCfg.sub}`, 12, H - 10);
  }
}

export function drawCenterMessage(ctx: Ctx, msgTimer: number, msgStr: string) {
  if (msgTimer <= 0) return;
  const fadeIn = msgTimer > 100 ? Math.min(1, (130 - msgTimer) / 30) : 1;
  const fadeOut = msgTimer < 30 ? Math.min(1, msgTimer / 30) : 1;
  ctx.globalAlpha = fadeIn * fadeOut;
  glow(ctx, "#00d4ff", 12);
  ctx.fillStyle = "#00d4ff";
  ctx.font = "bold 18px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.fillText(msgStr, W / 2, H / 2);
  noGlow(ctx);
  ctx.globalAlpha = 1;
}
