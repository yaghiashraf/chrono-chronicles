// Canvas particle overlays for the event stage, driven by each event's
// effectType. Kept deliberately sparse so the artwork stays the hero.

const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)");

const MATRIX_GLYPHS = "アイウエオカキクケコサシスセソ0123456789";

function rand(min, max) {
  return min + Math.random() * (max - min);
}

export function createStageEffects(canvas) {
  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let dpr = 1;
  let particles = [];
  let effect = "none";
  let rafId = null;
  let lastTime = 0;

  const resize = () => {
    const rect = canvas.parentElement.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const observer = new ResizeObserver(() => {
    resize();
    seed();
  });
  observer.observe(canvas.parentElement);
  resize();

  function count(perPixel, min, max) {
    return Math.round(Math.min(max, Math.max(min, width * height * perPixel)));
  }

  function seed() {
    particles = [];
    const type = effect;

    if (type === "starburst") {
      for (let i = 0; i < count(1 / 9000, 40, 130); i += 1) {
        particles.push({
          x: rand(0, width),
          y: rand(0, height),
          r: rand(0.4, 1.6),
          tw: rand(0.5, 2.4),
          phase: rand(0, Math.PI * 2),
          vx: rand(-1.5, 1.5),
          vy: rand(-1, 1),
        });
      }
    } else if (type === "fire") {
      for (let i = 0; i < count(1 / 14000, 26, 80); i += 1) {
        particles.push(newEmber(true));
      }
    } else if (type === "smoke") {
      for (let i = 0; i < count(1 / 40000, 8, 22); i += 1) {
        particles.push(newPuff(true));
      }
    } else if (type === "ash") {
      for (let i = 0; i < count(1 / 16000, 24, 70); i += 1) {
        particles.push(newFlake(true, "ash"));
      }
    } else if (type === "snow") {
      for (let i = 0; i < count(1 / 12000, 30, 90); i += 1) {
        particles.push(newFlake(true, "snow"));
      }
    } else if (type === "rain") {
      for (let i = 0; i < count(1 / 8000, 50, 150); i += 1) {
        particles.push(newDrop(true));
      }
    } else if (type === "matrix") {
      const cols = Math.max(10, Math.floor(width / 26));
      for (let i = 0; i < cols; i += 1) {
        particles.push({
          x: (i + 0.5) * (width / cols),
          y: rand(-height, 0),
          speed: rand(40, 130),
          glyphs: Array.from({ length: Math.floor(rand(4, 12)) }, () =>
            MATRIX_GLYPHS[Math.floor(rand(0, MATRIX_GLYPHS.length))]
          ),
          size: rand(10, 15),
        });
      }
    } else {
      // Ambient dust motes — the default so every event breathes a little.
      for (let i = 0; i < count(1 / 22000, 16, 46); i += 1) {
        particles.push({
          x: rand(0, width),
          y: rand(0, height),
          r: rand(0.5, 1.9),
          vx: rand(-4, 4),
          vy: rand(-7, -2),
          tw: rand(0.4, 1.4),
          phase: rand(0, Math.PI * 2),
        });
      }
    }
  }

  function newEmber(anywhere) {
    return {
      x: rand(0, width),
      y: anywhere ? rand(0, height) : height + rand(0, 24),
      r: rand(0.7, 2.4),
      vy: rand(-46, -16),
      vx: rand(-9, 9),
      life: rand(0.3, 1),
      hue: rand(16, 40),
    };
  }

  function newPuff(anywhere) {
    return {
      x: rand(-40, width + 40),
      y: anywhere ? rand(height * 0.2, height + 60) : height + rand(20, 80),
      r: rand(50, 150),
      vy: rand(-16, -6),
      vx: rand(-8, 8),
      alpha: rand(0.03, 0.085),
    };
  }

  function newFlake(anywhere, kind) {
    return {
      x: rand(0, width),
      y: anywhere ? rand(-height, height) : rand(-40, -6),
      r: kind === "snow" ? rand(0.9, 2.8) : rand(0.7, 2.1),
      vy: kind === "snow" ? rand(14, 42) : rand(20, 55),
      sway: rand(8, 26),
      phase: rand(0, Math.PI * 2),
      swaySpeed: rand(0.4, 1.3),
      kind,
    };
  }

  function newDrop(anywhere) {
    return {
      x: rand(-width * 0.1, width),
      y: anywhere ? rand(-height, height) : rand(-60, -10),
      len: rand(9, 22),
      vy: rand(420, 720),
      vx: rand(40, 90),
      alpha: rand(0.1, 0.32),
    };
  }

  function step(now) {
    rafId = requestAnimationFrame(step);
    const dt = Math.min(0.05, (now - lastTime) / 1000 || 0.016);
    lastTime = now;
    ctx.clearRect(0, 0, width, height);

    if (effect === "starburst") {
      ctx.globalCompositeOperation = "lighter";
      particles.forEach((p) => {
        p.x = (p.x + p.vx * dt + width) % width;
        p.y = (p.y + p.vy * dt + height) % height;
        const glow = 0.35 + 0.65 * Math.abs(Math.sin(now / 1000 * p.tw + p.phase));
        ctx.fillStyle = `rgba(235, 240, 255, ${0.75 * glow})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (0.8 + 0.4 * glow), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalCompositeOperation = "source-over";
    } else if (effect === "fire") {
      ctx.globalCompositeOperation = "lighter";
      particles.forEach((p, i) => {
        p.x += (p.vx + Math.sin(now / 400 + i) * 6) * dt;
        p.y += p.vy * dt;
        p.life -= dt * 0.24;
        if (p.life <= 0 || p.y < -10) particles[i] = newEmber(false);
        const a = Math.max(0, Math.min(1, p.life)) * 0.85;
        ctx.fillStyle = `hsla(${p.hue}, 100%, ${55 + p.life * 15}%, ${a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalCompositeOperation = "source-over";
    } else if (effect === "smoke") {
      particles.forEach((p, i) => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.y < -p.r * 2) particles[i] = newPuff(false);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, `rgba(185, 185, 190, ${p.alpha})`);
        g.addColorStop(1, "rgba(185, 185, 190, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (effect === "ash" || effect === "snow") {
      particles.forEach((p, i) => {
        p.phase += p.swaySpeed * dt;
        p.y += p.vy * dt;
        p.x += Math.sin(p.phase) * p.sway * dt;
        if (p.y > height + 10) particles[i] = newFlake(false, p.kind);
        ctx.fillStyle =
          p.kind === "snow"
            ? "rgba(240, 244, 250, 0.8)"
            : "rgba(178, 170, 160, 0.6)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (effect === "rain") {
      ctx.lineCap = "round";
      ctx.lineWidth = 1;
      particles.forEach((p, i) => {
        p.y += p.vy * dt;
        p.x += p.vx * dt;
        if (p.y > height + 30) particles[i] = newDrop(false);
        ctx.strokeStyle = `rgba(190, 210, 230, ${p.alpha})`;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 0.02, p.y - p.len);
        ctx.stroke();
      });
    } else if (effect === "matrix") {
      ctx.textBaseline = "top";
      particles.forEach((p) => {
        p.y += p.speed * dt;
        if (p.y - p.glyphs.length * p.size > height) {
          p.y = rand(-height * 0.4, 0);
          p.speed = rand(40, 130);
        }
        ctx.font = `${p.size}px monospace`;
        p.glyphs.forEach((glyph, gi) => {
          const gy = p.y - gi * p.size;
          if (gy < -p.size || gy > height) return;
          const head = gi === 0;
          ctx.fillStyle = head
            ? "rgba(190, 255, 240, 0.85)"
            : `rgba(98, 196, 183, ${Math.max(0.05, 0.5 - gi * 0.055)})`;
          if (Math.random() < 0.02) {
            p.glyphs[gi] = MATRIX_GLYPHS[Math.floor(rand(0, MATRIX_GLYPHS.length))];
          }
          ctx.fillText(glyph, p.x, gy);
        });
      });
    } else {
      particles.forEach((p) => {
        p.x = (p.x + p.vx * dt + width) % width;
        p.y = (p.y + p.vy * dt + height) % height;
        const glow = 0.3 + 0.7 * Math.abs(Math.sin(now / 1000 * p.tw + p.phase));
        ctx.fillStyle = `rgba(224, 200, 150, ${0.34 * glow})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }

  function start() {
    if (rafId !== null || REDUCED_MOTION.matches) return;
    lastTime = performance.now();
    rafId = requestAnimationFrame(step);
  }

  function halt() {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
    ctx.clearRect(0, 0, width, height);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) halt();
    else start();
  });

  REDUCED_MOTION.addEventListener?.("change", () => {
    if (REDUCED_MOTION.matches) halt();
    else start();
  });

  return {
    setEffect(type) {
      effect = type && type !== "none" ? type : "dust";
      // The stage may have just become visible; the ResizeObserver alone is
      // not reliable for display:none -> visible transitions.
      resize();
      seed();
      start();
    },
    stop: halt,
  };
}
