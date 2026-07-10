// Real field-recording beds plus synthesised accents, one recipe per event.
// Every layer is mixed well below the narration, which additionally ducks the
// ambience while speaking.

const MASTER_LEVEL = 0.16;
const DUCK_FACTOR = 0.38;
const FADE_IN = 1.6;
const FADE_OUT = 1.1;
const BED_LEVEL = 0.27;

// These real field recordings carry the scene. The procedural layers below
// remain as small, event-specific accents rather than the whole soundscape.
// The war recording is deliberately reserved for twentieth-century and modern
// conflicts; pre-gunpowder scenes use contextual ambience instead.
const BED_SOURCES = {
  fire: "./assets/ambience/fire.mp3",
  forest: "./assets/ambience/forest.mp3",
  storm: "./assets/ambience/storm.mp3",
  war: "./assets/ambience/war.mp3",
  waves: "./assets/ambience/waves.mp3",
};

const BED_BY_EVENT = {
  earth_formation: "fire",
  first_life: "waves",
  cambrian: "waves",
  mammals: "forest",
  lucy: "forest",
  fire: "fire",
  cavemen: "fire",
  agriculture: "forest",
  troy: "fire",
  bronze_collapse: "fire",
  pompeii: "fire",
  rome_fall: "fire",
  jerusalem: "fire",
  constantinople: "fire",
  vikings: "waves",
  columbus: "waves",
  pirates: "waves",
  titanic: "waves",
  ww1: "war",
  ww2: "war",
  ukraine: "war",
  hormuz: "war",
};

function rand(min, max) {
  return min + Math.random() * (max - min);
}

/* ------------------------------------------------------------ noise bufs */
function buildNoiseBuffer(ctx, kind) {
  const length = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i += 1) {
    const white = Math.random() * 2 - 1;
    if (kind === "white") {
      data[i] = white;
    } else if (kind === "pink") {
      last = 0.98 * last + 0.02 * white;
      data[i] = last * 3.6;
    } else {
      last = (last + 0.02 * white) / 1.02; // brown
      data[i] = last * 3.2;
    }
  }
  return buffer;
}

export function createAmbience() {
  let ctx = null;
  let master = null;
  let duckGain = null;
  const noise = {};
  let scene = null; // { gain, stops, timers, alive }
  let bed = null; // { key, audio, source, deHiss, tone, gain }
  let sceneId = null;
  let enabled = loadEnabled();
  let ducked = false;
  let unlocked = false;
  let active = false;

  function loadEnabled() {
    try {
      return localStorage.getItem("chrono-chronicles:ambience") !== "off";
    } catch {
      return true;
    }
  }

  function ensureContext() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = MASTER_LEVEL;
    duckGain = ctx.createGain();
    duckGain.gain.value = ducked ? DUCK_FACTOR : 1;
    duckGain.connect(master);
    master.connect(ctx.destination);
    noise.white = buildNoiseBuffer(ctx, "white");
    noise.pink = buildNoiseBuffer(ctx, "pink");
    noise.brown = buildNoiseBuffer(ctx, "brown");
    return true;
  }

  /* ------------------------------------------------------------ helpers */
  function noiseSource(kind) {
    const src = ctx.createBufferSource();
    src.buffer = noise[kind];
    src.loop = true;
    src.start();
    return src;
  }

  function lfo(param, freq, depth, base) {
    const osc = ctx.createOscillator();
    osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.value = depth;
    osc.connect(g);
    g.connect(param);
    if (base !== undefined) param.value = base;
    osc.start();
    return osc;
  }

  // Repeating scheduler bound to the scene lifecycle.
  function every(sceneRef, interval, fn) {
    const tick = () => {
      if (!sceneRef.alive) return;
      fn();
      sceneRef.timers.push(setTimeout(tick, rand(interval[0], interval[1]) * 1000));
    };
    sceneRef.timers.push(setTimeout(tick, rand(interval[0], interval[1]) * 500));
  }

  // One-shot envelope on a gain node.
  function envelope(g, peak, attack, decay) {
    const now = ctx.currentTime;
    g.gain.cancelScheduledValues(now);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, peak), now + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay);
  }

  function stopBed(old = bed) {
    if (!old || !ctx) return;
    const now = ctx.currentTime;
    old.gain.gain.cancelScheduledValues(now);
    old.gain.gain.setValueAtTime(old.gain.gain.value, now);
    old.gain.gain.linearRampToValueAtTime(0, now + FADE_OUT);
    setTimeout(() => {
      old.audio.pause();
      try { old.source.disconnect(); } catch { /* detached */ }
      try { old.deHiss.disconnect(); } catch { /* detached */ }
      try { old.tone.disconnect(); } catch { /* detached */ }
      try { old.gain.disconnect(); } catch { /* detached */ }
    }, (FADE_OUT + 0.2) * 1000);
  }

  function syncBed(id) {
    const key = BED_BY_EVENT[id];
    if (bed?.key === key) return;

    const oldBed = bed;
    bed = null;
    if (oldBed) stopBed(oldBed);
    if (!key) return;

    const audio = new Audio(BED_SOURCES[key]);
    const source = ctx.createMediaElementSource(audio);
    const deHiss = ctx.createBiquadFilter();
    deHiss.type = "highshelf";
    deHiss.frequency.value = 2600;
    deHiss.gain.value = -7;
    const tone = ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 4600;
    tone.Q.value = 0.45;
    const gain = ctx.createGain();
    audio.loop = true;
    audio.preload = "auto";
    audio.playsInline = true;
    gain.gain.value = 0;
    source.connect(deHiss);
    deHiss.connect(tone);
    tone.connect(gain);
    gain.connect(duckGain);

    const nextBed = { key, audio, source, deHiss, tone, gain };
    bed = nextBed;
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(BED_LEVEL, now + FADE_IN);
    audio.play().catch(() => {
      // The synthesised accent layer remains available if a browser blocks a
      // media element before the first user gesture.
    });
  }

  /* --------------------------------------------------------- generators */
  const GENERATORS = {
    wind(s, out, o) {
      const src = noiseSource("pink");
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = o.freq ?? 480;
      bp.Q.value = 0.6;
      const g = ctx.createGain();
      g.gain.value = o.level;
      src.connect(bp); bp.connect(g); g.connect(out);
      s.stops.push(lfo(bp.frequency, o.speed ?? 0.09, (o.freq ?? 480) * 0.4, o.freq ?? 480));
      s.stops.push(lfo(g.gain, (o.speed ?? 0.09) * 1.7, o.level * 0.45, o.level));
      s.stops.push(src);
    },
    ocean(s, out, o) {
      const src = noiseSource("brown");
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = o.freq ?? 420;
      const g = ctx.createGain();
      g.gain.value = o.level * 0.5;
      src.connect(lp); lp.connect(g); g.connect(out);
      s.stops.push(lfo(g.gain, o.speed ?? 0.08, o.level * 0.45, o.level * 0.5));
      s.stops.push(lfo(lp.frequency, (o.speed ?? 0.08) * 0.6, 160, o.freq ?? 420));
      s.stops.push(src);
    },
    rain(s, out, o) {
      const src = noiseSource("white");
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 650;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 3400;
      const g = ctx.createGain();
      g.gain.value = o.level * 0.72;
      src.connect(hp); hp.connect(lp); lp.connect(g); g.connect(out);
      s.stops.push(lfo(g.gain, 0.5, o.level * 0.15, o.level));
      s.stops.push(src);
    },
    fire(s, out, o) {
      const src = noiseSource("brown");
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 260;
      const g = ctx.createGain();
      g.gain.value = o.level * 0.55;
      src.connect(lp); lp.connect(g); g.connect(out);
      s.stops.push(lfo(g.gain, 0.6, o.level * 0.2, o.level * 0.55));
      s.stops.push(src);
      every(s, o.crackle ?? [0.06, 0.4], () => {
        const burst = noiseSource("white");
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = rand(1500, 3000);
        bp.Q.value = 2.5;
        const bg = ctx.createGain();
        burst.connect(bp); bp.connect(bg); bg.connect(out);
        envelope(bg, o.level * rand(0.35, 0.85), 0.004, rand(0.03, 0.09));
        setTimeout(() => burst.stop(), 260);
      });
    },
    drone(s, out, o) {
      (o.freqs ?? [82.4, 123.5]).forEach((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = o.wave ?? "sine";
        osc.frequency.value = f;
        osc.detune.value = rand(-5, 5);
        const g = ctx.createGain();
        g.gain.value = (o.level / (o.freqs?.length ?? 2)) * (i === 0 ? 1 : 0.7);
        osc.connect(g); g.connect(out);
        osc.start();
        s.stops.push(lfo(g.gain, rand(0.05, 0.13), g.gain.value * 0.35, g.gain.value));
        s.stops.push(osc);
      });
    },
    shimmer(s, out, o) {
      every(s, o.interval ?? [2.5, 6.5], () => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = rand(o.lo ?? 1100, o.hi ?? 2600);
        const g = ctx.createGain();
        osc.connect(g); g.connect(out);
        osc.start();
        envelope(g, o.level * rand(0.4, 1), 0.02, rand(1, 2.2));
        setTimeout(() => osc.stop(), 2600);
      });
    },
    rumble(s, out, o) {
      const src = noiseSource("brown");
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = o.freq ?? 110;
      const g = ctx.createGain();
      g.gain.value = o.level * 0.6;
      src.connect(lp); lp.connect(g); g.connect(out);
      s.stops.push(lfo(g.gain, o.speed ?? 0.07, o.level * 0.35, o.level * 0.6));
      s.stops.push(src);
    },
    thunder(s, out, o) {
      every(s, o.interval ?? [7, 16], () => {
        const burst = noiseSource("brown");
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = rand(90, 200);
        const g = ctx.createGain();
        burst.connect(lp); lp.connect(g); g.connect(out);
        envelope(g, o.level * rand(0.6, 1), rand(0.02, 0.2), rand(1.2, o.short ? 1.6 : 3));
        setTimeout(() => burst.stop(), 3600);
      });
    },
    birds(s, out, o) {
      every(s, o.interval ?? [2.8, 7.5], () => {
        const notes = Math.floor(rand(2, 6));
        for (let i = 0; i < notes; i += 1) {
          const osc = ctx.createOscillator();
          osc.type = "sine";
          const f0 = rand(2100, 4200);
          const t0 = ctx.currentTime + i * rand(0.09, 0.16);
          osc.frequency.setValueAtTime(f0, t0);
          osc.frequency.exponentialRampToValueAtTime(f0 * rand(0.7, 1.35), t0 + 0.07);
          const g = ctx.createGain();
          g.gain.value = 0;
          osc.connect(g); g.connect(out);
          osc.start(t0);
          g.gain.setValueAtTime(0.0001, t0);
          g.gain.exponentialRampToValueAtTime(o.level * rand(0.4, 1), t0 + 0.015);
          g.gain.exponentialRampToValueAtTime(0.0001, t0 + rand(0.05, 0.1));
          osc.stop(t0 + 0.3);
        }
      });
    },
    crowd(s, out, o) {
      const src = noiseSource("pink");
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = o.freq ?? 520;
      bp.Q.value = 1.1;
      const g = ctx.createGain();
      g.gain.value = o.level * 0.8;
      src.connect(bp); bp.connect(g); g.connect(out);
      s.stops.push(lfo(bp.frequency, 0.4, 130, o.freq ?? 520));
      s.stops.push(lfo(g.gain, 0.23, o.level * 0.3, o.level * 0.8));
      s.stops.push(lfo(g.gain, 1.1, o.level * 0.12, o.level * 0.8));
      s.stops.push(src);
    },
    machinery(s, out, o) {
      every(s, o.interval ?? [0.7, 0.9], () => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = rand(52, 64);
        const g = ctx.createGain();
        osc.connect(g); g.connect(out);
        osc.start();
        envelope(g, o.level, 0.008, 0.16);
        osc.stop(ctx.currentTime + 0.4);
      });
      if (o.hiss === true) {
        every(s, [2.5, 6], () => {
          const burst = noiseSource("white");
          const bp = ctx.createBiquadFilter();
          bp.type = "bandpass";
          bp.frequency.value = 1100;
          bp.Q.value = 0.7;
          const g = ctx.createGain();
          burst.connect(bp); bp.connect(g); g.connect(out);
          envelope(g, o.level * 0.24, 0.12, rand(0.5, 1.1));
          setTimeout(() => burst.stop(), 1600);
        });
      }
    },
    static(s, out, o) {
      const src = noiseSource("white");
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = o.freq ?? 1350;
      bp.Q.value = 0.55;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 2500;
      const g = ctx.createGain();
      g.gain.value = o.level * 0.32;
      src.connect(bp); bp.connect(lp); lp.connect(g); g.connect(out);
      s.stops.push(lfo(g.gain, 1.9, o.level * 0.12, o.level * 0.32));
      s.stops.push(src);
    },
    ping(s, out, o) {
      every(s, o.interval ?? [4, 6.5], () => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = o.freq ?? 760;
        const g = ctx.createGain();
        osc.connect(g); g.connect(out);
        osc.start();
        envelope(g, o.level, 0.01, 1.1);
        osc.stop(ctx.currentTime + 1.4);
      });
    },
    bell(s, out, o) {
      every(s, o.interval ?? [8, 16], () => {
        const f0 = o.freq ?? rand(320, 520);
        [1, 2.76, 5.4].forEach((mult, i) => {
          const osc = ctx.createOscillator();
          osc.type = "sine";
          osc.frequency.value = f0 * mult;
          const g = ctx.createGain();
          osc.connect(g); g.connect(out);
          osc.start();
          envelope(g, (o.level * [1, 0.4, 0.18][i]), 0.005, rand(2, 3.2));
          osc.stop(ctx.currentTime + 3.8);
        });
      });
    },
    hum(s, out, o) {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = o.freq ?? 120;
      const g = ctx.createGain();
      g.gain.value = o.level * 0.5;
      osc.connect(g); g.connect(out);
      osc.start();
      s.stops.push(lfo(g.gain, 0.3, o.level * 0.12, o.level * 0.5));
      s.stops.push(osc);
    },
    blips(s, out, o) {
      every(s, o.interval ?? [0.5, 2.2], () => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = rand(o.lo ?? 700, o.hi ?? 1900);
        if (o.rise) osc.frequency.exponentialRampToValueAtTime(osc.frequency.value * 1.6, ctx.currentTime + 0.08);
        const g = ctx.createGain();
        osc.connect(g); g.connect(out);
        osc.start();
        envelope(g, o.level * rand(0.4, 1), 0.006, rand(0.05, 0.14));
        osc.stop(ctx.currentTime + 0.3);
      });
    },
    heartbeat(s, out, o) {
      every(s, o.interval ?? [1.05, 1.2], () => {
        [0, 0.22].forEach((offset, i) => {
          const osc = ctx.createOscillator();
          osc.type = "sine";
          osc.frequency.value = 58;
          const g = ctx.createGain();
          g.gain.value = 0;
          osc.connect(g); g.connect(out);
          const t0 = ctx.currentTime + offset;
          osc.start(t0);
          g.gain.setValueAtTime(0.0001, t0);
          g.gain.exponentialRampToValueAtTime(o.level * (i === 0 ? 1 : 0.6), t0 + 0.015);
          g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);
          osc.stop(t0 + 0.3);
        });
      });
    },
    artillery(s, out, o) {
      every(s, o.interval ?? [6, 13], () => {
        const now = ctx.currentTime;
        const blast = noiseSource("brown");
        const low = ctx.createBiquadFilter();
        low.type = "lowpass";
        low.frequency.value = o.freq ?? rand(110, 190);
        const blastGain = ctx.createGain();
        blast.connect(low); low.connect(blastGain); blastGain.connect(out);
        envelope(blastGain, o.level * rand(0.72, 1), 0.012, rand(1.1, 2.1));

        const sub = ctx.createOscillator();
        const subGain = ctx.createGain();
        sub.type = "sine";
        sub.frequency.setValueAtTime(o.pitch ?? rand(58, 76), now);
        sub.frequency.exponentialRampToValueAtTime(rand(29, 39), now + 0.8);
        sub.connect(subGain); subGain.connect(out);
        sub.start(now);
        envelope(subGain, o.level * 0.48, 0.008, 0.95);
        setTimeout(() => {
          blast.stop();
          sub.stop();
        }, 2600);
      });
    },
    gunfire(s, out, o) {
      every(s, o.interval ?? [2.3, 5.8], () => {
        const rounds = Math.floor(rand(o.rounds?.[0] ?? 2, (o.rounds?.[1] ?? 5) + 1));
        for (let i = 0; i < rounds; i += 1) {
          const t0 = ctx.currentTime + i * rand(0.07, 0.19);
          const crack = noiseSource("white");
          const band = ctx.createBiquadFilter();
          band.type = "bandpass";
          band.frequency.value = rand(900, 1_800);
          band.Q.value = 1.2;
          const crackGain = ctx.createGain();
          crack.connect(band); band.connect(crackGain); crackGain.connect(out);
          crackGain.gain.setValueAtTime(0.0001, t0);
          crackGain.gain.exponentialRampToValueAtTime(o.level * rand(0.45, 0.82), t0 + 0.004);
          crackGain.gain.exponentialRampToValueAtTime(0.0001, t0 + rand(0.035, 0.075));
          setTimeout(() => crack.stop(), (t0 - ctx.currentTime + 0.25) * 1000);
        }
      });
    },
    march(s, out, o) {
      every(s, o.interval ?? [1.6, 2.5], () => {
        const steps = o.steps ?? 4;
        for (let i = 0; i < steps; i += 1) {
          const t0 = ctx.currentTime + i * (o.spacing ?? 0.24);
          const step = ctx.createOscillator();
          const stepGain = ctx.createGain();
          step.type = "triangle";
          step.frequency.setValueAtTime(i % 2 ? 72 : 62, t0);
          step.frequency.exponentialRampToValueAtTime(36, t0 + 0.13);
          step.connect(stepGain); stepGain.connect(out);
          step.start(t0);
          stepGain.gain.setValueAtTime(0.0001, t0);
          stepGain.gain.exponentialRampToValueAtTime(o.level * (i % 2 ? 0.72 : 1), t0 + 0.01);
          stepGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.17);
          step.stop(t0 + 0.22);
        }
      });
    },
    battleCry(s, out, o) {
      every(s, o.interval ?? [8, 16], () => {
        const calls = Math.floor(rand(1, 4));
        for (let i = 0; i < calls; i += 1) {
          const t0 = ctx.currentTime + i * rand(0.18, 0.42);
          const voice = ctx.createOscillator();
          const formant = ctx.createBiquadFilter();
          const voiceGain = ctx.createGain();
          voice.type = "sawtooth";
          voice.frequency.setValueAtTime(rand(125, 205), t0);
          voice.frequency.exponentialRampToValueAtTime(rand(185, 310), t0 + 0.16);
          formant.type = "bandpass";
          formant.frequency.value = rand(680, 1_050);
          formant.Q.value = 3.2;
          voice.connect(formant); formant.connect(voiceGain); voiceGain.connect(out);
          voice.start(t0);
          voiceGain.gain.setValueAtTime(0.0001, t0);
          voiceGain.gain.exponentialRampToValueAtTime(o.level * rand(0.5, 1), t0 + 0.035);
          voiceGain.gain.exponentialRampToValueAtTime(0.0001, t0 + rand(0.22, 0.48));
          voice.stop(t0 + 0.55);
        }
      });
    },
    siren(s, out, o) {
      every(s, o.interval ?? [14, 24], () => {
        const now = ctx.currentTime;
        const siren = ctx.createOscillator();
        const sirenGain = ctx.createGain();
        siren.type = "triangle";
        siren.frequency.setValueAtTime(o.low ?? 430, now);
        siren.frequency.linearRampToValueAtTime(o.high ?? 740, now + 0.85);
        siren.frequency.linearRampToValueAtTime(o.low ?? 430, now + 1.7);
        siren.frequency.linearRampToValueAtTime(o.high ?? 740, now + 2.55);
        siren.frequency.linearRampToValueAtTime(o.low ?? 430, now + 3.4);
        siren.connect(sirenGain); sirenGain.connect(out);
        siren.start(now);
        envelope(sirenGain, o.level, 0.08, 3.6);
        setTimeout(() => siren.stop(), 3900);
      });
    },
    horn(s, out, o) {
      every(s, o.interval ?? [13, 24], () => {
        const now = ctx.currentTime;
        [1, 2.01].forEach((mult, i) => {
          const horn = ctx.createOscillator();
          const hornGain = ctx.createGain();
          horn.type = "sawtooth";
          horn.frequency.value = (o.freq ?? 118) * mult;
          horn.connect(hornGain); hornGain.connect(out);
          horn.start(now);
          envelope(hornGain, o.level * (i ? 0.22 : 1), 0.08, 1.8);
          setTimeout(() => horn.stop(), 2200);
        });
      });
    },
  };

  /* ------------------------------------------------------------ recipes */
  const W = (level, o = {}) => ({ g: "wind", level, ...o });
  const OC = (level, o = {}) => ({ g: "ocean", level, ...o });
  const DR = (level, freqs, o = {}) => ({ g: "drone", level, freqs, ...o });
  const SH = (level, o = {}) => ({ g: "shimmer", level, ...o });
  const RU = (level, o = {}) => ({ g: "rumble", level, ...o });
  const TH = (level, o = {}) => ({ g: "thunder", level, ...o });
  const BI = (level, o = {}) => ({ g: "birds", level, ...o });
  const CR = (level, o = {}) => ({ g: "crowd", level, ...o });
  const FI = (level, o = {}) => ({ g: "fire", level, ...o });
  const MA = (level, o = {}) => ({ g: "machinery", level, ...o });
  const ST = (level, o = {}) => ({ g: "static", level, ...o });
  const BE = (level, o = {}) => ({ g: "bell", level, ...o });
  const HU = (level, o = {}) => ({ g: "hum", level, ...o });
  const BL = (level, o = {}) => ({ g: "blips", level, ...o });
  const HB = (level, o = {}) => ({ g: "heartbeat", level, ...o });
  const PI = (level, o = {}) => ({ g: "ping", level, ...o });
  const RA = (level, o = {}) => ({ g: "rain", level, ...o });
  const AR = (level, o = {}) => ({ g: "artillery", level, ...o });
  const GF = (level, o = {}) => ({ g: "gunfire", level, ...o });
  const MC = (level, o = {}) => ({ g: "march", level, ...o });
  const BC = (level, o = {}) => ({ g: "battleCry", level, ...o });
  const SI = (level, o = {}) => ({ g: "siren", level, ...o });
  const HO = (level, o = {}) => ({ g: "horn", level, ...o });

  const DRUMS = (level) => MA(level, { interval: [1.1, 1.4], hiss: false });

  const RECIPES = {
    big_bang: [DR(0.5, [55, 82.5]), SH(0.3), RU(0.3)],
    earth_formation: [RU(0.55, { freq: 130 }), FI(0.3, { crackle: [0.3, 1] }), W(0.25)],
    first_life: [OC(0.45), SH(0.22, { lo: 900, hi: 1600 }), DR(0.2, [98])],
    cambrian: [OC(0.5), SH(0.2, { lo: 700, hi: 1400, interval: [1.5, 4] }), BL(0.08, { lo: 400, hi: 900, rise: true, interval: [1.5, 4.5] })],
    great_dying: [W(0.5, { freq: 340 }), RU(0.4), TH(0.25, { interval: [10, 20] })],
    dinosaurs: [W(0.3), BI(0.2, { interval: [4, 9] }), RU(0.3, { speed: 0.05 })],
    mammals: [BI(0.3), W(0.28, { freq: 560 })],
    lucy: [W(0.4, { freq: 620 }), BI(0.18, { interval: [5, 11] })],
    ice_age: [W(0.6, { freq: 300, speed: 0.13 }), SH(0.16, { lo: 1600, hi: 3000 })],
    fire: [FI(0.6), W(0.2)],
    cavemen: [FI(0.5, { crackle: [0.1, 0.5] }), DR(0.18, [65])],
    agriculture: [BI(0.3), W(0.3, { freq: 520 })],
    wheel: [W(0.3), CR(0.2), DRUMS(0.1)],
    writing: [CR(0.25), W(0.22, { freq: 440 })],
    pyramids: [W(0.5, { freq: 520, speed: 0.06 }), CR(0.16)],
    egypt: [W(0.35, { freq: 480 }), DR(0.22, [110, 165]), CR(0.14)],
    babylon: [CR(0.3), W(0.25), BE(0.1, { freq: 620, interval: [12, 22] })],
    troy: [FI(0.3), BC(0.11, { interval: [7, 13] }), MC(0.08), DRUMS(0.1)],
    bronze_collapse: [W(0.32), RU(0.25), FI(0.18, { crackle: [0.3, 0.9] }), DRUMS(0.08)],
    olympics: [CR(0.45, { freq: 640 }), BI(0.16)],
    rome_founding: [W(0.3), BI(0.2), FI(0.16, { crackle: [0.3, 0.9] })],
    democracy: [CR(0.4, { freq: 580 })],
    buddha: [DR(0.32, [98, 147]), BE(0.12, { freq: 420, interval: [10, 18] }), BI(0.12, { interval: [6, 12] })],
    marathon: [BC(0.1), MC(0.1), DRUMS(0.12), HB(0.08)],
    alexander: [W(0.25), BC(0.08), MC(0.09), DRUMS(0.1)],
    qin: [DR(0.2, [110, 220]), MC(0.11), DRUMS(0.1), W(0.18)],
    caesar: [CR(0.18, { freq: 420 }), HB(0.1), DR(0.16, [73, 110])],
    rome_empire: [CR(0.32), DRUMS(0.13), DR(0.18, [82, 123])],
    jesus_birth: [DR(0.26, [147, 220]), SH(0.18, { interval: [4, 8] }), W(0.16)],
    crucifixion: [TH(0.35, { interval: [8, 15] }), W(0.4, { freq: 320 }), DR(0.2, [65, 98])],
    jerusalem: [FI(0.26), BC(0.08), MC(0.07), RU(0.22)],
    islam: [W(0.4, { freq: 500 }), DR(0.24, [123, 185]), SH(0.12)],
    crusades: [W(0.25), BC(0.08), MC(0.1), DRUMS(0.12)],
    reformation: [CR(0.28), BE(0.16, { freq: 380, interval: [7, 13] })],
    pompeii: [RU(0.6, { freq: 140 }), TH(0.4, { interval: [5, 10] }), W(0.3, { freq: 300 })],
    paper: [W(0.25, { freq: 560 }), CR(0.18)],
    zero: [DR(0.26, [131, 196]), SH(0.24, { interval: [2, 5] })],
    rome_fall: [W(0.45, { freq: 340 }), RU(0.3), CR(0.14, { freq: 380 })],
    charlemagne: [BE(0.2, { freq: 340, interval: [6, 11] }), CR(0.24), DR(0.16, [98, 147])],
    vikings: [OC(0.5), W(0.4, { freq: 320, speed: 0.12 }), SH(0.12, { lo: 1400, hi: 2600, interval: [4, 9] })],
    hastings: [BC(0.09), MC(0.11), DRUMS(0.13), W(0.2)],
    mongols: [W(0.35, { freq: 380, speed: 0.16 }), MC(0.13, { spacing: 0.16, steps: 6, interval: [1, 1.5] }), BC(0.07), RU(0.2)],
    black_death: [W(0.35, { freq: 300 }), BE(0.14, { freq: 240, interval: [9, 16] }), DR(0.2, [62, 93])],
    printing_press: [MA(0.22, { interval: [0.8, 1], hiss: false }), CR(0.18)],
    constantinople: [AR(0.15, { interval: [11, 20], freq: 118 }), BC(0.08), MC(0.08), DRUMS(0.1)],
    columbus: [OC(0.5), W(0.3), BI(0.2, { interval: [4, 9] })],
    pirates: [OC(0.5), W(0.35, { freq: 360 }), TH(0.2, { interval: [11, 20], short: true })],
    king_tut: [DR(0.24, [82, 123]), W(0.2, { freq: 380 }), SH(0.14, { interval: [5, 10] })],
    scientific_rev: [DR(0.24, [110, 165]), SH(0.2), W(0.16, { freq: 420 })],
    industrial: [MA(0.3, { interval: [0.62, 0.72], hiss: false }), FI(0.2, { crackle: [0.4, 1.2] }), RU(0.2)],
    revolution: [BC(0.11, { interval: [6, 12] }), MC(0.09), AR(0.08, { interval: [14, 25], freq: 112 }), DRUMS(0.1)],
    vaccine: [DR(0.24, [131, 196]), SH(0.16), HB(0.1, { interval: [1.2, 1.35] })],
    telephone: [HU(0.2, { freq: 100 }), BL(0.12, { lo: 500, hi: 900, interval: [2, 5] }), CR(0.12)],
    first_flight: [W(0.55, { freq: 440, speed: 0.15 }), BI(0.16)],
    titanic: [OC(0.38, { speed: 0.06 }), HO(0.13, { interval: [12, 20], freq: 92 }), W(0.25, { freq: 300 }), DR(0.14, [65, 98])],
    ww1: [RA(0.18), AR(0.2, { interval: [8, 16] }), GF(0.075, { interval: [3.5, 6.4], rounds: [2, 4] }), MC(0.06)],
    television: [ST(0.16), HU(0.18, { freq: 90 })],
    ww2: [AR(0.21, { interval: [7, 14] }), GF(0.09, { interval: [3, 5.8], rounds: [2, 5] }), SI(0.04, { interval: [18, 30] }), RU(0.16)],
    computer: [HU(0.22, { freq: 110 }), BL(0.16, { lo: 800, hi: 2000, interval: [0.7, 2] })],
    dna: [DR(0.26, [110, 165]), SH(0.18), HB(0.1, { interval: [1.15, 1.3] })],
    moon: [DR(0.3, [55, 82.5]), ST(0.04), SH(0.16, { interval: [4, 8] })],
    voyager: [DR(0.34, [49, 73.5]), SH(0.18, { interval: [3.5, 8] })],
    smallpox: [DR(0.26, [131, 196]), SH(0.18), HB(0.08, { interval: [1.25, 1.4] })],
    challenger: [DR(0.28, [65, 98]), W(0.2, { freq: 340 })],
    berlin_wall: [CR(0.45, { freq: 620 }), FI(0.18, { crackle: [0.4, 1.4] }), BE(0.1, { freq: 520, interval: [10, 18] })],
    internet: [HU(0.18, { freq: 120 }), BL(0.16, { lo: 900, hi: 2200, interval: [0.8, 2.4] })],
    dotcom_bubble: [HU(0.16, { freq: 110 }), BL(0.18, { lo: 500, hi: 1600, rise: true, interval: [0.9, 2.4] }), CR(0.14, { freq: 480 })],
    sept_11: [W(0.2, { freq: 300, speed: 0.05 }), DR(0.16, [65, 98])],
    smartphone: [BL(0.16, { lo: 900, hi: 2400, interval: [1, 2.8] }), HU(0.14, { freq: 130 })],
    financial_crash: [CR(0.3, { freq: 440 }), HB(0.12), HU(0.12, { freq: 90 })],
    mars_rover: [W(0.45, { freq: 240, speed: 0.07 }), DR(0.2, [58, 87])],
    trillion_dollar_company: [HU(0.16, { freq: 120 }), BL(0.14, { lo: 1000, hi: 2400, interval: [1.2, 3] }), SH(0.14)],
    covid: [DR(0.24, [73, 110]), HB(0.12, { interval: [1.2, 1.4] })],
    ukraine: [W(0.22, { freq: 340 }), AR(0.26, { interval: [5.5, 10.5] }), GF(0.11, { interval: [2.6, 4.8], rounds: [2, 5] }), RU(0.1, { freq: 95 })],
    hormuz: [OC(0.32), AR(0.23, { interval: [5, 11], freq: 145 }), GF(0.09, { interval: [3.2, 6.4], rounds: [2, 4] }), HO(0.1, { interval: [10, 18], freq: 104 }), PI(0.08, { interval: [4.5, 7] })],
  };
  const DEFAULT_RECIPE = [W(0.3), DR(0.18, [98, 147])];

  /* ------------------------------------------------------- scene control */
  function stopScene(old) {
    if (!old) return;
    old.alive = false;
    old.timers.forEach(clearTimeout);
    const now = ctx.currentTime;
    old.gain.gain.cancelScheduledValues(now);
    old.gain.gain.setValueAtTime(old.gain.gain.value, now);
    old.gain.gain.linearRampToValueAtTime(0, now + FADE_OUT);
    setTimeout(() => {
      old.stops.forEach((node) => {
        try { node.stop?.(); } catch { /* already stopped */ }
        try { node.disconnect?.(); } catch { /* detached */ }
      });
      try { old.gain.disconnect(); } catch { /* detached */ }
    }, (FADE_OUT + 0.2) * 1000);
  }

  function startScene(id) {
    const recipe = RECIPES[id] ?? DEFAULT_RECIPE;
    const s = { gain: ctx.createGain(), stops: [], timers: [], alive: true };
    s.gain.gain.value = 0;
    s.gain.connect(duckGain);
    recipe.forEach((layer) => GENERATORS[layer.g]?.(s, s.gain, layer));
    const now = ctx.currentTime;
    s.gain.gain.setValueAtTime(0, now);
    s.gain.gain.linearRampToValueAtTime(1, now + FADE_IN);
    scene = s;
  }

  function play() {
    if (!enabled || !unlocked || !active || !sceneId) return;
    if (!ensureContext()) return;
    if (ctx.state === "suspended") ctx.resume();
    stopScene(scene);
    scene = null;
    startScene(sceneId);
    syncBed(sceneId);
  }

  /* -------------------------------------------------------------- public */
  const api = {
    setScene(id) {
      if (id === sceneId) return;
      sceneId = id;
      play();
    },
    setActive(on) {
      active = on;
      if (on) {
        play();
      } else {
        if (scene) stopScene(scene);
        if (bed) stopBed(bed);
        scene = null;
        bed = null;
      }
    },
    unlock() {
      if (unlocked) return;
      unlocked = true;
      play();
    },
    duck(on) {
      ducked = on;
      if (!ctx) return;
      const now = ctx.currentTime;
      duckGain.gain.cancelScheduledValues(now);
      duckGain.gain.setValueAtTime(duckGain.gain.value, now);
      duckGain.gain.linearRampToValueAtTime(on ? DUCK_FACTOR : 1, now + 0.5);
    },
    setEnabled(on) {
      enabled = on;
      try {
        localStorage.setItem("chrono-chronicles:ambience", on ? "on" : "off");
      } catch { /* private mode */ }
      if (!on) {
        stopScene(scene);
        stopBed(bed);
        scene = null;
        bed = null;
      } else {
        play();
      }
    },
    get enabled() {
      return enabled;
    },
  };
  return api;
}
