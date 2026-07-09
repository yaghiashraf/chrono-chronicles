// Scene engine for the event stage: a single canvas runs a composition of
// parameterized animation layers. Each event gets its own scene in scenes.js.

import { eventScenes, defaultScene } from "./scenes.js";

const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)");

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function span(range) {
  return Array.isArray(range) ? rand(range[0], range[1]) : range;
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  const n = parseInt(value.length === 3 ? value.split("").map((c) => c + c).join("") : value, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgba(rgb, alpha) {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

/* ---------------------------------------------------------------- particles
   The workhorse layer. Shapes: dot, glowdot, streak, rect, paper, petal,
   glyph, spiky, ring, bird, arrow, roundrect, cross. */
function particlesLayer(o, w, h) {
  const conf = {
    count: 30,
    spawn: "area", // area | bottom | top | left | right | center | point
    point: [0.5, 0.5],
    vx: [0, 0],
    vy: [0, 0],
    radial: null, // [minSpeed, maxSpeed] outward from spawn point
    gravity: 0,
    sway: null, // { amp, speed }
    spin: 0, // radians/s for rect/paper/petal/roundrect
    size: [1, 2],
    shape: "dot",
    glyphs: null,
    colors: ["#f7efe1"],
    alpha: [0.3, 0.7],
    twinkle: 0,
    blend: null,
    life: null, // [min,max] seconds; fade out near end
    pop: false, // expand + fade at end of life instead of plain fade
    lenFactor: 0.06, // streak length relative to velocity
  };
  Object.assign(conf, o);
  const palette = conf.colors.map(hexToRgb);
  const count = typeof conf.count === "function" ? conf.count(w, h) : conf.count;
  const parts = [];

  function place(p, initial) {
    const m = 40;
    if (initial && conf.spawn !== "center" && conf.spawn !== "point") {
      p.x = rand(0, w);
      p.y = rand(0, h);
      return;
    }
    switch (conf.spawn) {
      case "bottom": p.x = rand(-m, w + m); p.y = h + rand(4, 30); break;
      case "top": p.x = rand(-m, w + m); p.y = -rand(4, 30); break;
      case "left": p.x = -rand(4, m); p.y = rand(0, h); break;
      case "right": p.x = w + rand(4, m); p.y = rand(0, h); break;
      case "center": p.x = w / 2; p.y = h / 2; break;
      case "point": p.x = conf.point[0] * w; p.y = conf.point[1] * h; break;
      default: p.x = rand(0, w); p.y = rand(0, h);
    }
  }

  function reset(p, initial) {
    place(p, initial);
    if (conf.radial) {
      const a = rand(0, Math.PI * 2);
      const s = span(conf.radial);
      p.vx = Math.cos(a) * s;
      p.vy = Math.sin(a) * s;
    } else {
      p.vx = span(conf.vx);
      p.vy = span(conf.vy);
    }
    p.size = span(conf.size);
    p.rgb = pick(palette);
    p.alpha = span(conf.alpha);
    p.phase = rand(0, Math.PI * 2);
    p.angle = rand(0, Math.PI * 2);
    p.glyph = conf.glyphs ? pick([...conf.glyphs]) : null;
    p.life = conf.life ? span(conf.life) : null;
    p.age = initial && p.life ? rand(0, p.life) : 0;
  }

  for (let i = 0; i < count; i += 1) {
    const p = {};
    reset(p, true);
    parts.push(p);
  }

  function draw(ctx, p, a, scale) {
    const s = p.size * scale;
    ctx.fillStyle = rgba(p.rgb, a);
    ctx.strokeStyle = rgba(p.rgb, a);
    switch (conf.shape) {
      case "glowdot": {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, s * 3);
        g.addColorStop(0, rgba(p.rgb, a));
        g.addColorStop(1, rgba(p.rgb, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, s * 3, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "streak": {
        ctx.lineWidth = Math.max(0.6, s * 0.5);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * conf.lenFactor, p.y - p.vy * conf.lenFactor);
        ctx.stroke();
        break;
      }
      case "rect":
      case "paper": {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        const wd = conf.shape === "paper" ? s * 3 : s * 2;
        const ht = conf.shape === "paper" ? s * 4 : s * 2;
        ctx.fillRect(-wd / 2, -ht / 2, wd, ht);
        ctx.restore();
        break;
      }
      case "roundrect": {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle * 0.2);
        ctx.beginPath();
        ctx.roundRect(-s, -s, s * 2, s * 2, s * 0.5);
        ctx.fill();
        ctx.restore();
        break;
      }
      case "petal": {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 1.8, s * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;
      }
      case "glyph": {
        ctx.font = `${Math.round(s * 6)}px Georgia, serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.glyph, p.x, p.y);
        break;
      }
      case "spiky": {
        ctx.beginPath();
        ctx.arc(p.x, p.y, s, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 0.8;
        for (let k = 0; k < 7; k += 1) {
          const a2 = p.angle + (k / 7) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(p.x + Math.cos(a2) * s, p.y + Math.sin(a2) * s);
          ctx.lineTo(p.x + Math.cos(a2) * s * 1.8, p.y + Math.sin(a2) * s * 1.8);
          ctx.stroke();
        }
        break;
      }
      case "ring": {
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, s * 2, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }
      case "bird": {
        ctx.lineWidth = Math.max(1, s * 0.4);
        ctx.lineCap = "round";
        const flap = Math.sin(p.phase * 6) * s * 0.7;
        ctx.beginPath();
        ctx.moveTo(p.x - s * 1.6, p.y - flap);
        ctx.quadraticCurveTo(p.x - s * 0.5, p.y + s * 0.4, p.x, p.y);
        ctx.quadraticCurveTo(p.x + s * 0.5, p.y + s * 0.4, p.x + s * 1.6, p.y - flap);
        ctx.stroke();
        break;
      }
      case "arrow": {
        const ang = Math.atan2(p.vy, p.vx);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(ang);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-s * 4, 0);
        ctx.lineTo(s * 2, 0);
        ctx.moveTo(s * 2, 0);
        ctx.lineTo(s * 0.7, -s * 0.9);
        ctx.moveTo(s * 2, 0);
        ctx.lineTo(s * 0.7, s * 0.9);
        ctx.stroke();
        ctx.restore();
        break;
      }
      case "cross": {
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x - s * 2, p.y);
        ctx.lineTo(p.x + s * 2, p.y);
        ctx.moveTo(p.x, p.y - s * 2);
        ctx.lineTo(p.x, p.y + s * 2);
        ctx.stroke();
        break;
      }
      default: {
        ctx.beginPath();
        ctx.arc(p.x, p.y, s, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  return {
    step(ctx, dt, t) {
      if (conf.blend) ctx.globalCompositeOperation = conf.blend;
      parts.forEach((p) => {
        p.vy += conf.gravity * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.phase += dt;
        if (conf.sway) p.x += Math.sin(p.phase * conf.sway.speed + p.angle) * conf.sway.amp * dt;
        if (conf.spin) p.angle += conf.spin * dt;

        let a = p.alpha;
        let scale = 1;
        if (conf.twinkle) a *= 0.35 + 0.65 * Math.abs(Math.sin(t * conf.twinkle + p.phase));
        if (p.life !== null) {
          p.age += dt;
          const frac = p.age / p.life;
          if (frac >= 1) { reset(p, false); return; }
          if (conf.pop && frac > 0.82) {
            const k = (frac - 0.82) / 0.18;
            a *= 1 - k;
            scale = 1 + k * 1.6;
          } else if (frac > 0.75) {
            a *= 1 - (frac - 0.75) / 0.25;
          } else if (frac < 0.12) {
            a *= frac / 0.12;
          }
        }
        if (p.x < -60 || p.x > w + 60 || p.y < -70 || p.y > h + 70) { reset(p, false); return; }
        draw(ctx, p, a, scale);
      });
      if (conf.blend) ctx.globalCompositeOperation = "source-over";
    },
  };
}

/* ------------------------------------------------------------------- glow */
function glowLayer(o, w, h) {
  const conf = { x: 0.5, y: 1, r: 0.6, color: "#e28b4f", alpha: 0.2, period: 4, flicker: 0, ...o };
  const rgb = hexToRgb(conf.color);
  let flick = 1;
  return {
    step(ctx, dt, t) {
      if (conf.flicker) flick += (rand(1 - conf.flicker, 1 + conf.flicker) - flick) * Math.min(1, dt * 8);
      const breathe = 0.75 + 0.25 * Math.sin((t / conf.period) * Math.PI * 2);
      const a = conf.alpha * breathe * flick;
      const cx = conf.x * w;
      const cy = conf.y * h;
      const radius = conf.r * Math.min(w, h);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      g.addColorStop(0, rgba(rgb, a));
      g.addColorStop(1, rgba(rgb, 0));
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = g;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
      ctx.globalCompositeOperation = "source-over";
    },
  };
}

/* ------------------------------------------------------------------ star */
function starLayer(o, w, h) {
  const conf = { x: 0.72, y: 0.16, size: 26, color: "#f7efe1", period: 3.2, alpha: 0.85, ...o };
  const rgb = hexToRgb(conf.color);
  return {
    step(ctx, dt, t) {
      const pulse = 0.6 + 0.4 * Math.sin((t / conf.period) * Math.PI * 2);
      const cx = conf.x * w;
      const cy = conf.y * h;
      const s = conf.size * (0.9 + pulse * 0.2);
      ctx.globalCompositeOperation = "lighter";
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, s);
      g.addColorStop(0, rgba(rgb, conf.alpha * pulse));
      g.addColorStop(1, rgba(rgb, 0));
      ctx.fillStyle = g;
      ctx.fillRect(cx - s, cy - s, s * 2, s * 2);
      ctx.strokeStyle = rgba(rgb, conf.alpha * pulse * 0.8);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - s * 1.7, cy); ctx.lineTo(cx + s * 1.7, cy);
      ctx.moveTo(cx, cy - s * 1.7); ctx.lineTo(cx, cy + s * 1.7);
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
    },
  };
}

/* ------------------------------------------------------------------ rings */
function ringsLayer(o, w, h) {
  const conf = { x: 0.5, y: 0.5, interval: [1.4, 2.4], speed: 90, width: 1.2, color: "#62c4b7", alpha: 0.4, ...o };
  const rgb = hexToRgb(conf.color);
  const rings = [];
  let timer = rand(0, span(conf.interval));
  return {
    step(ctx, dt) {
      timer -= dt;
      if (timer <= 0) {
        rings.push({ r: 4, a: conf.alpha });
        timer = span(conf.interval);
      }
      ctx.globalCompositeOperation = "lighter";
      for (let i = rings.length - 1; i >= 0; i -= 1) {
        const ring = rings[i];
        ring.r += conf.speed * dt;
        ring.a -= conf.alpha * dt / 3.2;
        if (ring.a <= 0) { rings.splice(i, 1); continue; }
        ctx.strokeStyle = rgba(rgb, ring.a);
        ctx.lineWidth = conf.width;
        ctx.beginPath();
        ctx.arc(conf.x * w, conf.y * h, ring.r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalCompositeOperation = "source-over";
    },
  };
}

/* ------------------------------------------------------------------ beams
   Light shafts / searchlights. Each: { x, angle, width, sway, speed } */
function beamsLayer(o, w, h) {
  const conf = {
    beams: [{ x: 0.3, angle: -0.1 }, { x: 0.7, angle: 0.12 }],
    width: 46,
    color: "#f0cc83",
    alpha: 0.1,
    sway: 0, // radians of sweep
    speed: 0.3,
    fromTop: false,
    ...o,
  };
  const rgb = hexToRgb(conf.color);
  return {
    step(ctx, dt, t) {
      ctx.globalCompositeOperation = "lighter";
      conf.beams.forEach((b, i) => {
        const baseX = b.x * w;
        const baseY = conf.fromTop ? -20 : h + 20;
        const ang = (b.angle ?? 0) + (conf.sway ? Math.sin(t * conf.speed + i * 1.7) * conf.sway : 0);
        const len = Math.hypot(w, h) * 1.2;
        ctx.save();
        ctx.translate(baseX, baseY);
        ctx.rotate(ang);
        const wd = b.width ?? conf.width;
        const g = ctx.createLinearGradient(0, 0, 0, conf.fromTop ? len : -len);
        g.addColorStop(0, rgba(rgb, conf.alpha));
        g.addColorStop(1, rgba(rgb, 0));
        ctx.fillStyle = g;
        const dir = conf.fromTop ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(-wd * 0.35, 0);
        ctx.lineTo(wd * 0.35, 0);
        ctx.lineTo(wd, dir * len);
        ctx.lineTo(-wd, dir * len);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });
      ctx.globalCompositeOperation = "source-over";
    },
  };
}

/* ------------------------------------------------------------------ waves */
function wavesLayer(o, w, h) {
  const conf = { lines: 4, baseY: 0.78, gap: 0.05, amp: 9, freq: 0.012, speed: 0.7, color: "#62c4b7", alpha: 0.3, ...o };
  const rgb = hexToRgb(conf.color);
  return {
    step(ctx, dt, t) {
      for (let i = 0; i < conf.lines; i += 1) {
        const y0 = (conf.baseY + i * conf.gap) * h;
        const a = conf.alpha * (1 - i / (conf.lines + 1));
        ctx.strokeStyle = rgba(rgb, a);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let x = -10; x <= w + 10; x += 7) {
          const y = y0 + Math.sin(x * conf.freq + t * conf.speed * (1 + i * 0.18) + i * 1.4) * conf.amp;
          if (x === -10) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    },
  };
}

/* ----------------------------------------------------------------- aurora */
function auroraLayer(o, w, h) {
  const conf = { bands: [{ y: 0.22, color: "#62c4b7" }, { y: 0.3, color: "#7fe0a8" }], amp: 26, freq: 0.008, speed: 0.35, height: 90, alpha: 0.1, ...o };
  return {
    step(ctx, dt, t) {
      ctx.globalCompositeOperation = "lighter";
      conf.bands.forEach((band, i) => {
        const rgb = hexToRgb(band.color);
        ctx.beginPath();
        const y0 = band.y * h;
        for (let x = -10; x <= w + 10; x += 9) {
          const y = y0 + Math.sin(x * conf.freq + t * conf.speed + i * 2.2) * conf.amp;
          if (x === -10) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        for (let x = w + 10; x >= -10; x -= 9) {
          const y = y0 + Math.sin(x * conf.freq + t * conf.speed + i * 2.2) * conf.amp + conf.height;
          ctx.lineTo(x, y);
        }
        ctx.closePath();
        const g = ctx.createLinearGradient(0, y0 - conf.amp, 0, y0 + conf.height + conf.amp);
        g.addColorStop(0, rgba(rgb, conf.alpha));
        g.addColorStop(1, rgba(rgb, 0));
        ctx.fillStyle = g;
        ctx.fill();
      });
      ctx.globalCompositeOperation = "source-over";
    },
  };
}

/* ---------------------------------------------------------- glyph columns */
function glyphColumnsLayer(o, w, h) {
  const conf = { glyphs: "01", color: "#62c4b7", headColor: "#beffef", colWidth: 26, speed: [40, 130], size: [10, 15], alpha: 0.5, ...o };
  const rgb = hexToRgb(conf.color);
  const headRgb = hexToRgb(conf.headColor);
  const cols = Math.max(8, Math.floor(w / conf.colWidth));
  const columns = Array.from({ length: cols }, (_, i) => ({
    x: (i + 0.5) * (w / cols),
    y: rand(-h, h),
    speed: span(conf.speed),
    size: span(conf.size),
    glyphs: Array.from({ length: Math.floor(rand(4, 11)) }, () => pick([...conf.glyphs])),
  }));
  return {
    step(ctx, dt) {
      ctx.textBaseline = "top";
      ctx.textAlign = "center";
      columns.forEach((c) => {
        c.y += c.speed * dt;
        if (c.y - c.glyphs.length * c.size > h) {
          c.y = rand(-h * 0.5, 0);
          c.speed = span(conf.speed);
        }
        ctx.font = `${c.size}px monospace`;
        c.glyphs.forEach((glyph, gi) => {
          const gy = c.y - gi * c.size;
          if (gy < -c.size || gy > h) return;
          ctx.fillStyle = gi === 0 ? rgba(headRgb, 0.85) : rgba(rgb, Math.max(0.05, conf.alpha - gi * 0.055));
          if (Math.random() < 0.02) c.glyphs[gi] = pick([...conf.glyphs]);
          ctx.fillText(glyph, c.x, gy);
        });
      });
    },
  };
}

/* ----------------------------------------------------------------- ticker */
function tickerLayer(o, w, h) {
  const conf = { trend: -1, startY: 0.3, range: 0.42, color: "#d5504d", alpha: 0.6, duration: 5.5, hold: 1.2, ...o };
  const rgb = hexToRgb(conf.color);
  let points = [];
  let progress = 0;
  let holdLeft = 0;

  function regen() {
    points = [];
    const steps = 46;
    let y = conf.startY * h;
    const drift = (conf.range * h * conf.trend) / steps;
    for (let i = 0; i <= steps; i += 1) {
      points.push([(i / steps) * w * 0.92 + w * 0.04, y]);
      y += drift + rand(-h * 0.035, h * 0.035) - drift * 0.3 * Math.sin(i * 0.6);
    }
    progress = 0;
    holdLeft = conf.hold;
  }
  regen();

  return {
    step(ctx, dt) {
      progress += dt / conf.duration;
      if (progress >= 1) {
        holdLeft -= dt;
        if (holdLeft <= 0) regen();
        progress = Math.min(progress, 1);
      }
      const visible = Math.max(2, Math.floor(points.length * Math.min(1, progress)));
      const fade = progress >= 1 ? Math.max(0.15, holdLeft / conf.hold) : 1;
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = rgba(rgb, conf.alpha * fade);
      ctx.lineWidth = 1.6;
      ctx.lineJoin = "round";
      ctx.beginPath();
      for (let i = 0; i < visible; i += 1) {
        if (i === 0) ctx.moveTo(points[i][0], points[i][1]);
        else ctx.lineTo(points[i][0], points[i][1]);
      }
      ctx.stroke();
      const head = points[visible - 1];
      const g = ctx.createRadialGradient(head[0], head[1], 0, head[0], head[1], 9);
      g.addColorStop(0, rgba(rgb, 0.8 * fade));
      g.addColorStop(1, rgba(rgb, 0));
      ctx.fillStyle = g;
      ctx.fillRect(head[0] - 9, head[1] - 9, 18, 18);
      ctx.globalCompositeOperation = "source-over";
    },
  };
}

/* ------------------------------------------------------------------ helix */
function helixLayer(o, w, h) {
  const conf = { y: 0.42, amp: 34, wavelength: 130, speed: 0.55, colors: ["#62c4b7", "#d5504d"], alpha: 0.4, rungEvery: 4, ...o };
  const rgbA = hexToRgb(conf.colors[0]);
  const rgbB = hexToRgb(conf.colors[1]);
  return {
    step(ctx, dt, t) {
      const cy = conf.y * h;
      const k = (Math.PI * 2) / conf.wavelength;
      const phase = t * conf.speed * Math.PI;
      ctx.globalCompositeOperation = "lighter";
      let i = 0;
      for (let x = -10; x <= w + 10; x += 9) {
        const y1 = cy + Math.sin(x * k + phase) * conf.amp;
        const y2 = cy + Math.sin(x * k + phase + Math.PI) * conf.amp;
        const depth1 = 0.45 + 0.55 * (Math.cos(x * k + phase) * 0.5 + 0.5);
        const depth2 = 0.45 + 0.55 * (Math.cos(x * k + phase + Math.PI) * 0.5 + 0.5);
        if (i % conf.rungEvery === 0) {
          ctx.strokeStyle = rgba(rgbA, conf.alpha * 0.35);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, y1);
          ctx.lineTo(x, y2);
          ctx.stroke();
        }
        ctx.fillStyle = rgba(rgbA, conf.alpha * depth1);
        ctx.beginPath();
        ctx.arc(x, y1, 1.9 * depth1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = rgba(rgbB, conf.alpha * depth2);
        ctx.beginPath();
        ctx.arc(x, y2, 1.9 * depth2, 0, Math.PI * 2);
        ctx.fill();
        i += 1;
      }
      ctx.globalCompositeOperation = "source-over";
    },
  };
}

/* ---------------------------------------------------------------- network */
function networkLayer(o, w, h) {
  const conf = { count: 26, dist: 130, color: "#62c4b7", nodeColor: "#f0cc83", alpha: 0.3, speed: 14, ...o };
  const rgb = hexToRgb(conf.color);
  const nodeRgb = hexToRgb(conf.nodeColor);
  const nodes = Array.from({ length: conf.count }, () => ({
    x: rand(0, w), y: rand(0, h),
    vx: rand(-conf.speed, conf.speed), vy: rand(-conf.speed, conf.speed),
  }));
  return {
    step(ctx, dt) {
      nodes.forEach((n) => {
        n.x += n.vx * dt;
        n.y += n.vy * dt;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      });
      ctx.lineWidth = 0.7;
      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          if (d < conf.dist) {
            ctx.strokeStyle = rgba(rgb, conf.alpha * (1 - d / conf.dist));
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      nodes.forEach((n) => {
        ctx.fillStyle = rgba(nodeRgb, 0.65);
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      });
    },
  };
}

/* ----------------------------------------------------------------- orrery */
function orreryLayer(o, w, h) {
  const conf = { x: 0.5, y: 0.44, orbits: [0.12, 0.2, 0.29, 0.38], color: "#d5a84a", alpha: 0.25, ...o };
  const rgb = hexToRgb(conf.color);
  const bodies = conf.orbits.map((r, i) => ({ r, angle: rand(0, Math.PI * 2), speed: rand(0.14, 0.4) * (i % 2 ? -1 : 1) }));
  return {
    step(ctx, dt) {
      const cx = conf.x * w;
      const cy = conf.y * h;
      const base = Math.min(w, h);
      ctx.globalCompositeOperation = "lighter";
      bodies.forEach((b) => {
        b.angle += b.speed * dt;
        const radius = b.r * base;
        ctx.strokeStyle = rgba(rgb, conf.alpha * 0.5);
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.ellipse(cx, cy, radius, radius * 0.42, 0, 0, Math.PI * 2);
        ctx.stroke();
        const px = cx + Math.cos(b.angle) * radius;
        const py = cy + Math.sin(b.angle) * radius * 0.42;
        const g = ctx.createRadialGradient(px, py, 0, px, py, 5);
        g.addColorStop(0, rgba(rgb, 0.9));
        g.addColorStop(1, rgba(rgb, 0));
        ctx.fillStyle = g;
        ctx.fillRect(px - 5, py - 5, 10, 10);
      });
      ctx.globalCompositeOperation = "source-over";
    },
  };
}

/* ------------------------------------------------------------- scanstatic */
function scanLayer(o, w, h) {
  const conf = { speed: 60, bandH: 70, alpha: 0.1, specks: 60, color: "#cfd8d6", ...o };
  const rgb = hexToRgb(conf.color);
  let y = 0;
  return {
    step(ctx, dt) {
      y = (y + conf.speed * dt) % (h + conf.bandH * 2);
      const g = ctx.createLinearGradient(0, y - conf.bandH, 0, y + conf.bandH);
      g.addColorStop(0, rgba(rgb, 0));
      g.addColorStop(0.5, rgba(rgb, conf.alpha));
      g.addColorStop(1, rgba(rgb, 0));
      ctx.fillStyle = g;
      ctx.fillRect(0, y - conf.bandH, w, conf.bandH * 2);
      for (let i = 0; i < conf.specks; i += 1) {
        ctx.fillStyle = rgba(rgb, rand(0.04, 0.2));
        ctx.fillRect(rand(0, w), rand(0, h), 1.4, 1.4);
      }
      if (Math.random() < 0.02) {
        ctx.fillStyle = rgba(rgb, 0.14);
        ctx.fillRect(0, rand(0, h), w, rand(1, 3));
      }
    },
  };
}

/* -------------------------------------------------------------- lightning */
function lightningLayer(o, w, h) {
  const conf = { interval: [3, 7], color: "#dfe8ff", alpha: 0.8, ...o };
  const rgb = hexToRgb(conf.color);
  let timer = rand(...conf.interval);
  let flash = 0;
  let bolt = null;
  return {
    step(ctx, dt) {
      timer -= dt;
      if (timer <= 0) {
        timer = rand(...conf.interval);
        flash = 1;
        const segs = [];
        let x = rand(w * 0.2, w * 0.8);
        let y = 0;
        while (y < h * rand(0.4, 0.7)) {
          const nx = x + rand(-34, 34);
          const ny = y + rand(24, 54);
          segs.push([x, y, nx, ny]);
          x = nx; y = ny;
        }
        bolt = segs;
      }
      if (flash > 0) {
        ctx.fillStyle = rgba(rgb, flash * 0.1);
        ctx.fillRect(0, 0, w, h);
        if (bolt && flash > 0.55) {
          ctx.strokeStyle = rgba(rgb, conf.alpha * flash);
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          bolt.forEach(([x1, y1, x2, y2]) => { ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); });
          ctx.stroke();
        }
        flash -= dt * 3.4;
      }
    },
  };
}

/* --------------------------------------------------------------- traveler
   A rare bright object crossing the sky with a fading trail: shooting star,
   space probe, incoming meteor. */
function travelerLayer(o, w, h) {
  const conf = { interval: [4, 9], speed: [220, 420], color: "#f7efe1", size: 2, angle: [0.35, 0.75], alpha: 0.85, trail: 0.4, ...o };
  const rgb = hexToRgb(conf.color);
  let timer = rand(...conf.interval);
  let obj = null;
  return {
    step(ctx, dt) {
      if (!obj) {
        timer -= dt;
        if (timer <= 0) {
          const ang = rand(...conf.angle);
          const speed = span(conf.speed);
          const fromLeft = Math.random() < 0.5;
          obj = {
            x: fromLeft ? -20 : w + 20,
            y: rand(0, h * 0.4),
            vx: Math.cos(ang) * speed * (fromLeft ? 1 : -1),
            vy: Math.sin(ang) * speed,
          };
        }
        return;
      }
      obj.x += obj.vx * dt;
      obj.y += obj.vy * dt;
      if (obj.x < -80 || obj.x > w + 80 || obj.y > h + 80) {
        obj = null;
        timer = rand(...conf.interval);
        return;
      }
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = rgba(rgb, conf.alpha * 0.55);
      ctx.lineWidth = conf.size * 0.7;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(obj.x, obj.y);
      ctx.lineTo(obj.x - obj.vx * conf.trail * 0.25, obj.y - obj.vy * conf.trail * 0.25);
      ctx.stroke();
      const g = ctx.createRadialGradient(obj.x, obj.y, 0, obj.x, obj.y, conf.size * 4);
      g.addColorStop(0, rgba(rgb, conf.alpha));
      g.addColorStop(1, rgba(rgb, 0));
      ctx.fillStyle = g;
      ctx.fillRect(obj.x - conf.size * 4, obj.y - conf.size * 4, conf.size * 8, conf.size * 8);
      ctx.globalCompositeOperation = "source-over";
    },
  };
}

/* ------------------------------------------------------------------- wire */
function wireLayer(o, w, h) {
  const conf = { y: 0.62, color: "#d5a84a", pulseColor: "#f0cc83", alpha: 0.3, interval: [0.9, 1.9], speed: 260, ...o };
  const rgb = hexToRgb(conf.color);
  const pulseRgb = hexToRgb(conf.pulseColor);
  const pulses = [];
  let timer = 0.4;
  return {
    step(ctx, dt) {
      const y = conf.y * h + Math.sin(Date.now() / 3000) * 3;
      ctx.strokeStyle = rgba(rgb, conf.alpha);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.quadraticCurveTo(w / 2, y + 16, w, y);
      ctx.stroke();
      timer -= dt;
      if (timer <= 0) {
        pulses.push({ x: Math.random() < 0.5 ? 0 : w, dir: 0 });
        pulses[pulses.length - 1].dir = pulses[pulses.length - 1].x === 0 ? 1 : -1;
        timer = span(conf.interval);
      }
      ctx.globalCompositeOperation = "lighter";
      for (let i = pulses.length - 1; i >= 0; i -= 1) {
        const p = pulses[i];
        p.x += p.dir * conf.speed * dt;
        if (p.x < -10 || p.x > w + 10) { pulses.splice(i, 1); continue; }
        const frac = p.x / w;
        const py = y + Math.sin(frac * Math.PI) * 16;
        const g = ctx.createRadialGradient(p.x, py, 0, p.x, py, 7);
        g.addColorStop(0, rgba(pulseRgb, 0.9));
        g.addColorStop(1, rgba(pulseRgb, 0));
        ctx.fillStyle = g;
        ctx.fillRect(p.x - 7, py - 7, 14, 14);
      }
      ctx.globalCompositeOperation = "source-over";
    },
  };
}

/* ----------------------------------------------------------------- bursts
   Occasional radial spark bursts: fireworks, cannon flashes. */
function burstsLayer(o, w, h) {
  const conf = { interval: [1.6, 3.4], colors: ["#f0cc83", "#62c4b7", "#d5504d"], sparks: [22, 40], speed: [50, 150], area: [0.15, 0.85, 0.12, 0.5], life: [0.7, 1.3], gravity: 26, alpha: 0.85, ...o };
  const palettes = conf.colors.map(hexToRgb);
  const bursts = [];
  let timer = rand(...conf.interval);
  return {
    step(ctx, dt) {
      timer -= dt;
      if (timer <= 0) {
        timer = span(conf.interval);
        const rgb = pick(palettes);
        const cx = rand(conf.area[0], conf.area[1]) * w;
        const cy = rand(conf.area[2], conf.area[3]) * h;
        const n = Math.round(span(conf.sparks));
        const sparks = [];
        for (let i = 0; i < n; i += 1) {
          const a = (i / n) * Math.PI * 2 + rand(-0.1, 0.1);
          const s = span(conf.speed);
          sparks.push({ x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: span(conf.life), age: 0 });
        }
        bursts.push({ rgb, sparks });
      }
      ctx.globalCompositeOperation = "lighter";
      for (let bi = bursts.length - 1; bi >= 0; bi -= 1) {
        const b = bursts[bi];
        let alive = 0;
        b.sparks.forEach((s) => {
          s.age += dt;
          if (s.age >= s.life) return;
          alive += 1;
          s.vy += conf.gravity * dt;
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          const a = conf.alpha * (1 - s.age / s.life);
          ctx.fillStyle = rgba(b.rgb, a);
          ctx.beginPath();
          ctx.arc(s.x, s.y, 1.3, 0, Math.PI * 2);
          ctx.fill();
        });
        if (!alive) bursts.splice(bi, 1);
      }
      ctx.globalCompositeOperation = "source-over";
    },
  };
}

/* -------------------------------------------------------------------- fog */
function fogLayer(o, w, h) {
  const conf = { count: 7, color: "#9aa39e", alpha: [0.03, 0.07], size: [90, 190], band: [0.1, 0.95], speed: [4, 16], ...o };
  const rgb = hexToRgb(conf.color);
  const puffs = Array.from({ length: conf.count }, () => ({
    x: rand(-100, w + 100),
    y: rand(conf.band[0], conf.band[1]) * h,
    r: span(conf.size),
    a: span(conf.alpha),
    v: span(conf.speed) * (Math.random() < 0.5 ? -1 : 1),
  }));
  return {
    step(ctx, dt) {
      puffs.forEach((p) => {
        p.x += p.v * dt;
        if (p.x < -p.r - 110) p.x = w + p.r;
        if (p.x > w + p.r + 110) p.x = -p.r;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, rgba(rgb, p.a));
        g.addColorStop(1, rgba(rgb, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.r * 1.5, p.r * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    },
  };
}

/* ------------------------------------------------------------------ gears */
function gearsLayer(o, w, h) {
  const conf = { gears: [{ x: 0.14, y: 0.3, r: 42, speed: 0.3 }, { x: 0.22, y: 0.42, r: 26, speed: -0.5 }], color: "#d5a84a", alpha: 0.22, teeth: 10, ...o };
  const rgb = hexToRgb(conf.color);
  const state = conf.gears.map(() => rand(0, Math.PI * 2));
  return {
    step(ctx, dt) {
      conf.gears.forEach((gear, i) => {
        state[i] += gear.speed * dt;
        const cx = gear.x * w;
        const cy = gear.y * h;
        ctx.strokeStyle = rgba(rgb, conf.alpha);
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(cx, cy, gear.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, gear.r * 0.4, 0, Math.PI * 2);
        ctx.stroke();
        for (let k = 0; k < conf.teeth; k += 1) {
          const a = state[i] + (k / conf.teeth) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * gear.r, cy + Math.sin(a) * gear.r);
          ctx.lineTo(cx + Math.cos(a) * (gear.r + 7), cy + Math.sin(a) * (gear.r + 7));
          ctx.stroke();
        }
      });
    },
  };
}

const LAYER_BUILDERS = {
  particles: particlesLayer,
  glow: glowLayer,
  star: starLayer,
  rings: ringsLayer,
  beams: beamsLayer,
  waves: wavesLayer,
  aurora: auroraLayer,
  glyphColumns: glyphColumnsLayer,
  ticker: tickerLayer,
  helix: helixLayer,
  network: networkLayer,
  orrery: orreryLayer,
  scan: scanLayer,
  lightning: lightningLayer,
  traveler: travelerLayer,
  wire: wireLayer,
  bursts: burstsLayer,
  fog: fogLayer,
  gears: gearsLayer,
};

export function createStageEffects(canvas) {
  const ctx = canvas.getContext("2d");
  let width = 1;
  let height = 1;
  let layers = [];
  let sceneId = null;
  let rafId = null;
  let lastTime = 0;
  let elapsed = 0;

  const resize = () => {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  function build() {
    const spec = eventScenes[sceneId] ?? defaultScene;
    layers = spec.map((layer) => LAYER_BUILDERS[layer.type](layer, width, height));
  }

  const observer = new ResizeObserver(() => {
    resize();
    if (sceneId) build();
  });
  observer.observe(canvas.parentElement);
  resize();

  function step(now) {
    rafId = requestAnimationFrame(step);
    const dt = Math.min(0.05, (now - lastTime) / 1000 || 0.016);
    lastTime = now;
    elapsed += dt;
    ctx.clearRect(0, 0, width, height);
    layers.forEach((layer) => layer.step(ctx, dt, elapsed, width, height));
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
    setScene(id) {
      sceneId = id;
      // The stage may have just become visible; the ResizeObserver alone is
      // not reliable for display:none -> visible transitions.
      resize();
      build();
      start();
    },
    stop: halt,
  };
}
