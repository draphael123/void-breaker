# VOID BREAKER — Juice-Up Plan

A roadmap to make the game feel **significantly** more impactful and satisfying, without changing core balance. Focus: feedback, spectacle, and polish.

---

## 1. Visual juice

### 1.1 Hit feedback
- **Enemy hit flash**: When a bullet hits an enemy, draw a brief white/cyan outline or overlay (2–4 frames) so every hit is visible.
- **Damage numbers** (optional, toggle in settings): Short-lived floating numbers at hit position (e.g. `-20`) that drift up and fade. Color by damage (cyan normal, gold crit if you add crits later).
- **Player hit**: Keep screen shake; add a short **screen edge flash** (red/cyan vignette pulse for ~8 frames) so taking damage feels heavy.
- **Shield hit**: Different feedback from HP hit — blue flash + subtle “deflect” particles so blocking feels distinct.

### 1.2 Bullets & projectiles
- **Bullet trails**: Fade trail (3–5 past positions per bullet) with decreasing alpha/size. Cyan for player, orange for enemies.
- **Muzzle flash**: Tiny burst at ship nose when firing (scales with spread: one flash or three).
- **Enemy bullets**: Slight glow pulse or spin so they’re easier to read and feel more threatening.

### 1.3 Death & destruction
- **Enemy death**: Short **hit stop** (1–2 frames of `gameTimeScale = 0`) then current particle burst. Optionally: death “pop” — enemy scale 1 → 1.2 → 0 over 3–4 frames then particles.
- **Boss death**: Longer hit stop (4–6 frames), then big particle burst + **screen flash** (white/orange) + slow time scale (0.3) for ~30 frames before level complete overlay.
- **Boss phase change** (<40% HP): One-time flash + “PHASE 2” or “ENRAGED” style message + optional color shift (e.g. more red).

### 1.4 Environment & post-style
- **Star field**: Slight **parallax** (2–3 layers, different speeds) and more twinkle variation.
- **Nebula**: Animate gradient (slow drift or pulse) per sector so space feels alive.
- **Low HP**: Subtle **vignette** (darken edges) when HP &lt; 25%, pulses when &lt; 10%.
- **Scanlines** (optional): Very subtle full-screen overlay (e.g. 1px lines, 2% opacity) for a CRT feel.

---

## 2. Audio

### 2.1 Sound effects (Web Audio API or Howler.js)
- **Shoot**: Short laser/blip, pitch vary by fire rate.
- **Enemy hit**: Soft impact.
- **Enemy death**: Satisfying pop/explosion, scale by enemy type.
- **Player hit**: Punchy, slightly harsh.
- **Shield hit**: Metallic “ting” or deflect.
- **Level up**: Short positive sting before skill picker.
- **Skill chosen**: Confirm beep.
- **Boss spawn**: Low rumble or alarm.
- **Boss hit**: Heavy thud.
- **Boss death**: Big explosion + drop.
- **Level complete**: Short victory sting.
- **Game over**: Descending tone.
- **Victory**: Triumphant sting.

### 2.2 Music
- **Menu**: Ambient, low tension.
- **Gameplay**: Looping track that builds with sector (e.g. more layers in sector 2–3).
- **Boss**: Separate boss track or layer that kicks in when boss phase starts; more intense, ends on death.

---

## 3. Game feel

### 3.1 Time scale
- **Global `timeScale`** (e.g. 0 = paused, 1 = normal): Multiply `deltaTime` or frame-based timers so you can:
  - Pause for hit stop.
  - Slow-mo on boss death / level complete.
  - Optional: brief slow when player narrowly dodges (harder to tune).
- Apply to: movement, bullets, particles, spawn timers, HUD animations. Keep UI overlays at real time.

### 3.2 Camera
- **Screen shake**: You have 5px/10 frames. Add:
  - **Kill shake**: Small burst (2px, 4 frames) on each enemy kill.
  - **Boss hit**: Medium (3px, 6 frames).
  - **Boss death**: Large (6px, 15 frames), can blend with time slow.
- **Recoil** (optional): Ship nudges back 1–2px when firing; resets quickly.

### 3.3 Movement
- **Ease-out on key release**: Optional; current instant stop is fine for a shooter.
- **Trail**: Faint afterimages or particles behind the ship when moving fast (speed &gt; base) to emphasize speed upgrades.

---

## 4. Progression & milestones

### 4.1 Level up
- **In-world**: Pause + time stop, then:
  - Short “LEVEL UP” text in center (glow, scale in).
  - Flash (white/cyan) and optional particle burst from ship.
  - Sound sting.
- Then show skill picker as now.

### 4.2 Boss intro
- **Before boss spawn**: Screen darken slightly, “WARNING” or “…” style message, then:
  - Boss descends with a bit of **ease-in** (slower at end).
  - HP bar **slides in** from top (animate from 0 width to 420px over ~15 frames).
  - Name typewriter or fade-in.
- Boss theme starts when bar appears or when boss reaches y=140.

### 4.3 Sector transition
- **Before “Level Complete”**: Short “SECTOR CLEARED” in-world (not overlay) with big text + particles.
- **Before next sector**: Optional “warp” — stars stretch horizontally for ~30 frames, then snap to new nebula color and wave 1 message.

### 4.4 Victory / Game over
- **Victory**: Current overlay + confetti or star burst particles in background, victory theme.
- **Game over**: Screen dim, “MISSION FAILED” with a subtle shake or flicker; optional ship explosion sprite/particles.

---

## 5. Optional mechanics (high impact)

### 5.1 Dash / burst
- **Dash**: Short cooldown (e.g. 2–3 s), instant move 40–60px in current direction; brief invuln (6–8 frames). Adds skill expression and “oh crap” recovery. Could be a 9th skill or default.
- **Juice**: Dash trail (afterimages or particles), short screen streak, sound.

### 5.2 Ultimate / overdrive
- **Meter**: Fill on kills/damage; one button unleashes “Overdrive” (e.g. 3 s of 2× fire rate + pierce + brief shield). Big visual (full-screen tint, screen shake, different bullet color) and sound.

### 5.3 Crits / variance
- **Critical hits**: e.g. 10% chance for 2× damage; different particle color (gold) and slightly bigger number/flash. Makes combat feel less flat.

---

## 6. Polish & meta

### 6.1 Settings
- **Volume**: Master, Music, SFX sliders.
- **Toggles**: Screen shake on/off, damage numbers on/off, scanlines on/off.
- **Controls**: Remap keys (optional, more work).

### 6.2 Persistence
- **High score**: Store best score (and optionally best sector) in `localStorage`; show on game over and victory.
- **Stats**: Total games, total kills, bosses defeated (optional).

### 6.3 Menus & UX
- **Menu**: Subtle animated background (e.g. starfield or slow nebula) behind the title.
- **Skill picker**: Card **hover sound**; selected card **scale up** slightly when chosen before closing.
- **Transitions**: Fade or short wipe between overlay open/close (e.g. 100–150 ms).

---

## 7. Implementation order (suggested)

| Phase | Focus | Deliverables |
|-------|--------|---------------|
| **A** | Hit feedback & bullets | Enemy/player hit flash, bullet trails, muzzle flash, damage numbers (toggle) |
| **B** | Death & impact | Hit stop on kill, boss death slow-mo + flash, enemy death “pop”, screen edge flash on player hit |
| **C** | Audio | SFX (shoot, hit, death, level up, boss, game over, victory), menu + gameplay + boss music |
| **D** | Camera & time | Global timeScale, kill/boss shake, boss intro (bar slide, ease-in descent) |
| **E** | Progression | Level-up moment (text + flash + sound), sector warp, victory/game over particles |
| **F** | Polish | Settings (volume, toggles), high score, menu background, optional dash or ult |

Start with **Phase A** for the biggest “every shot feels good” gain; add **Phase C** early so the rest of the juice has sound support.

---

## 8. Technical notes

- **Time scale**: Add `timeScale: number` to game state; in the loop multiply all time-dependent updates (movement, timers, particles) by `timeScale`. Set to 0 for pause, 0.3 for slow-mo.
- **Trails**: For bullets, keep a ring buffer of last N positions; draw with decreasing alpha. Same idea for ship trail.
- **Audio**: Use `AudioContext` for one-shots and music; respect user gesture (start context on first click/tap). Consider Howler.js if you want simpler API and cross-browser handling.
- **Particles**: You already have a system; add new “burst” presets (e.g. `burstHit`, `burstBossDeath`) and call them from the right events.

This plan should **significantly** juice up VOID BREAKER while keeping the current design and balance intact.
