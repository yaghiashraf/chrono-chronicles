// One bespoke animation scene per event. Each scene is a list of layers
// interpreted by effects.js. Layer types: particles, glow, star, rings,
// beams, waves, aurora, glyphColumns, ticker, helix, network, orrery, scan,
// lightning, traveler, wire, bursts, fog, gears.

const IVORY = "#f7efe1";
const GOLD = "#d5a84a";
const AMBER = "#f0cc83";
const COPPER = "#e28b4f";
const TEAL = "#62c4b7";
const CRIMSON = "#d5504d";

export const defaultScene = [
  { type: "particles", count: 30, shape: "glowdot", size: [0.5, 1.3], colors: [AMBER], alpha: [0.1, 0.3], vx: [-4, 4], vy: [-7, -2], twinkle: 1, blend: "lighter" },
];

export const eventScenes = {
  /* ------------------------------------------------ cosmic & deep time */
  big_bang: [
    { type: "particles", count: 70, spawn: "center", radial: [12, 130], shape: "glowdot", size: [0.4, 1.5], colors: [IVORY, "#9fd8ff", AMBER], alpha: [0.3, 0.8], twinkle: 2, blend: "lighter", life: [3, 8] },
    { type: "rings", x: 0.5, y: 0.5, interval: [2.6, 4.2], speed: 130, color: "#9fd8ff", alpha: 0.3, width: 1.6 },
    { type: "glow", x: 0.5, y: 0.5, r: 0.24, color: IVORY, alpha: 0.14, period: 5 },
  ],
  earth_formation: [
    { type: "particles", count: 40, spawn: "bottom", shape: "glowdot", size: [0.6, 1.8], colors: [COPPER, "#ff7a3c", CRIMSON], alpha: [0.35, 0.75], vy: [-55, -18], vx: [-10, 10], blend: "lighter", life: [2.5, 5] },
    { type: "traveler", interval: [3.5, 7], speed: [340, 560], color: "#ffb37a", size: 2.6, angle: [0.5, 0.9], trail: 0.55 },
    { type: "glow", x: 0.5, y: 1.06, r: 0.6, color: "#ff5a26", alpha: 0.2, period: 3.4, flicker: 0.25 },
  ],
  first_life: [
    { type: "particles", count: 26, spawn: "bottom", shape: "ring", size: [1, 3.2], colors: ["#9fe8dc", TEAL], alpha: [0.2, 0.45], vy: [-26, -9], sway: { amp: 16, speed: 1.2 }, life: [4, 9], pop: true },
    { type: "particles", count: 20, shape: "glowdot", size: [0.6, 1.4], colors: ["#7fe0a8", TEAL], alpha: [0.2, 0.5], vx: [-9, 9], vy: [-6, 6], twinkle: 1.6, blend: "lighter" },
    { type: "beams", beams: [{ x: 0.3, angle: 0.1 }, { x: 0.55, angle: -0.05 }, { x: 0.8, angle: 0.16 }], fromTop: true, width: 34, color: "#bde8de", alpha: 0.05, sway: 0.04, speed: 0.24 },
  ],
  cambrian: [
    { type: "particles", count: 14, shape: "streak", size: [2, 3.4], colors: [TEAL, "#9fd8ff"], alpha: [0.3, 0.6], vx: [-90, 90], vy: [-24, 24], lenFactor: 0.08, sway: { amp: 40, speed: 2.4 }, life: [2, 5] },
    { type: "particles", count: 22, spawn: "bottom", shape: "ring", size: [0.8, 2], colors: ["#bde8de"], alpha: [0.15, 0.35], vy: [-20, -8], sway: { amp: 10, speed: 1 }, life: [4, 8], pop: true },
    { type: "beams", beams: [{ x: 0.4, angle: 0.06 }, { x: 0.72, angle: -0.1 }], fromTop: true, width: 40, color: "#9fd8ff", alpha: 0.045, sway: 0.05, speed: 0.2 },
  ],
  great_dying: [
    { type: "fog", count: 8, color: "#7c8f6f", alpha: [0.04, 0.09], band: [0.15, 0.8], speed: [6, 18] },
    { type: "particles", count: 40, spawn: "top", shape: "dot", size: [0.7, 1.9], colors: ["#a89c8a", "#6f7a68"], alpha: [0.3, 0.55], vy: [22, 50], sway: { amp: 14, speed: 0.8 } },
    { type: "glow", x: 0.5, y: 1.08, r: 0.55, color: "#c2452f", alpha: 0.16, period: 4.6, flicker: 0.2 },
  ],
  dinosaurs: [
    { type: "particles", count: 16, shape: "glowdot", size: [0.8, 1.6], colors: ["#cfe89f", AMBER], alpha: [0.25, 0.6], vx: [-14, 14], vy: [-8, 8], twinkle: 0.9, blend: "lighter" },
    { type: "traveler", interval: [6, 12], speed: [420, 620], color: "#ffc16e", size: 3.2, angle: [0.55, 0.85], trail: 0.7 },
    { type: "fog", count: 5, color: "#5f7257", alpha: [0.03, 0.06], band: [0.6, 0.95], speed: [4, 10] },
  ],
  mammals: [
    { type: "particles", count: 26, shape: "glowdot", size: [0.5, 1.3], colors: [AMBER, "#ffe8b8"], alpha: [0.2, 0.5], vx: [-8, 8], vy: [-12, -3], twinkle: 1.4, blend: "lighter" },
    { type: "beams", beams: [{ x: 0.62, angle: 0.14 }, { x: 0.84, angle: 0.22 }], fromTop: true, width: 44, color: "#ffdf9e", alpha: 0.06, sway: 0.02, speed: 0.16 },
    { type: "particles", count: 8, shape: "petal", size: [1.4, 2.4], colors: ["#cfe89f"], alpha: [0.2, 0.4], spawn: "top", vy: [12, 26], vx: [-8, 8], spin: 1.4, sway: { amp: 22, speed: 1 } },
  ],
  lucy: [
    { type: "particles", count: 30, shape: "dot", size: [0.5, 1.2], colors: ["#e0b87a", GOLD], alpha: [0.18, 0.4], vx: [14, 34], vy: [-6, 3], sway: { amp: 8, speed: 0.7 } },
    { type: "particles", count: 5, shape: "bird", size: [2.4, 4], colors: ["#3d3428"], alpha: [0.4, 0.6], spawn: "left", vx: [22, 40], vy: [-4, 4], sway: { amp: 6, speed: 0.5 } },
    { type: "glow", x: 0.76, y: 0.18, r: 0.3, color: "#ffce7a", alpha: 0.13, period: 6 },
  ],
  ice_age: [
    { type: "particles", count: 42, spawn: "top", shape: "dot", size: [0.7, 2], colors: [IVORY, "#cfe4f5"], alpha: [0.35, 0.7], vy: [12, 34], vx: [4, 18], sway: { amp: 16, speed: 0.9 } },
    { type: "particles", count: 14, shape: "cross", size: [1, 2.2], colors: ["#bfe3ff"], alpha: [0.2, 0.5], vx: [-4, 4], vy: [-3, 3], twinkle: 2.2, blend: "lighter" },
    { type: "fog", count: 6, color: "#a9c2cf", alpha: [0.03, 0.07], band: [0.55, 0.95], speed: [5, 14] },
  ],
  fire: [
    { type: "particles", count: 52, spawn: "bottom", shape: "glowdot", size: [0.6, 1.9], colors: ["#ffb347", "#ff7a3c", "#ffd98a"], alpha: [0.4, 0.8], vy: [-70, -26], vx: [-12, 12], sway: { amp: 20, speed: 2.6 }, blend: "lighter", life: [1.6, 3.4] },
    { type: "fog", count: 4, color: "#5a5248", alpha: [0.04, 0.08], band: [0.1, 0.5], speed: [-14, -5] },
    { type: "glow", x: 0.5, y: 1.05, r: 0.52, color: "#ff8c3b", alpha: 0.26, period: 2.8, flicker: 0.4 },
  ],
  cavemen: [
    { type: "glow", x: 0.32, y: 0.92, r: 0.4, color: "#ff9d4d", alpha: 0.22, period: 3.2, flicker: 0.45 },
    { type: "particles", count: 22, spawn: "point", point: [0.32, 0.92], shape: "glowdot", size: [0.5, 1.3], colors: ["#ffc98a", COPPER], alpha: [0.3, 0.65], vy: [-44, -16], vx: [-16, 16], blend: "lighter", life: [1.4, 3] },
    { type: "particles", count: 10, shape: "dot", size: [0.6, 1.4], colors: ["#c9a06a"], alpha: [0.12, 0.3], vx: [-6, 6], vy: [-9, -3], twinkle: 1 },
  ],
  agriculture: [
    { type: "particles", count: 34, shape: "petal", size: [0.9, 1.7], colors: [GOLD, "#e8ce7a"], alpha: [0.25, 0.5], spawn: "left", vx: [26, 52], vy: [-6, 8], spin: 2, sway: { amp: 18, speed: 1.3 } },
    { type: "particles", count: 18, shape: "glowdot", size: [0.4, 1], colors: ["#ffe8a8"], alpha: [0.2, 0.45], vx: [10, 26], vy: [-10, -2], twinkle: 1.6, blend: "lighter" },
    { type: "beams", beams: [{ x: 0.7, angle: 0.18 }], fromTop: true, width: 60, color: "#ffdf9e", alpha: 0.055, sway: 0.015, speed: 0.1 },
  ],

  /* ------------------------------------------------------ civilizations */
  wheel: [
    { type: "gears", gears: [{ x: 0.16, y: 0.78, r: 44, speed: 0.55 }, { x: 0.84, y: 0.84, r: 30, speed: 0.8 }], color: GOLD, alpha: 0.2, teeth: 8 },
    { type: "particles", count: 26, spawn: "bottom", shape: "dot", size: [0.6, 1.5], colors: ["#cbb08a", "#a08a68"], alpha: [0.2, 0.4], vy: [-16, -5], vx: [18, 44], sway: { amp: 8, speed: 0.9 } },
  ],
  writing: [
    { type: "particles", count: 16, shape: "rect", size: [2.4, 4], colors: ["#caa06a", "#e0c090"], alpha: [0.25, 0.5], spawn: "top", vy: [10, 24], vx: [-6, 6], spin: 0.7, sway: { amp: 12, speed: 0.8 } },
    { type: "particles", count: 22, shape: "dot", size: [0.5, 1.1], colors: ["#e8d0a8"], alpha: [0.18, 0.4], vx: [-8, 8], vy: [-7, -2], twinkle: 1.2 },
    { type: "glow", x: 0.5, y: 0.9, r: 0.4, color: COPPER, alpha: 0.12, period: 5 },
  ],
  pyramids: [
    { type: "particles", count: 40, shape: "streak", size: [1, 2], colors: ["#e0c090", "#caa06a"], alpha: [0.14, 0.34], vx: [50, 110], vy: [-8, 6], lenFactor: 0.09 },
    { type: "beams", beams: [{ x: 0.5, angle: 0 }], fromTop: true, width: 80, color: "#ffdf9e", alpha: 0.05, sway: 0.01, speed: 0.08 },
    { type: "glow", x: 0.5, y: 0.08, r: 0.34, color: "#ffce7a", alpha: 0.13, period: 6 },
  ],
  egypt: [
    { type: "particles", count: 14, shape: "cross", size: [1.2, 2.6], colors: [GOLD, AMBER], alpha: [0.25, 0.55], vx: [-4, 4], vy: [-6, -2], twinkle: 2, blend: "lighter" },
    { type: "particles", count: 24, shape: "dot", size: [0.5, 1.2], colors: ["#e8d0a8", GOLD], alpha: [0.2, 0.4], vx: [12, 30], vy: [-4, 4], sway: { amp: 8, speed: 0.6 } },
    { type: "waves", lines: 3, baseY: 0.86, gap: 0.045, amp: 5, speed: 0.5, color: "#5fb8c9", alpha: 0.22 },
  ],
  babylon: [
    { type: "particles", count: 20, spawn: "bottom", shape: "glowdot", size: [0.5, 1.2], colors: [AMBER, GOLD], alpha: [0.25, 0.55], vy: [-22, -8], vx: [-6, 6], blend: "lighter", life: [3, 6] },
    { type: "beams", beams: [{ x: 0.24, angle: 0 }, { x: 0.5, angle: 0 }, { x: 0.76, angle: 0 }], fromTop: false, width: 30, color: AMBER, alpha: 0.045, sway: 0, speed: 0 },
    { type: "particles", count: 8, shape: "petal", size: [1.2, 2], colors: ["#8fc98f"], alpha: [0.2, 0.4], spawn: "top", vy: [8, 18], vx: [-6, 6], spin: 1.2, sway: { amp: 16, speed: 0.9 } },
  ],
  troy: [
    { type: "particles", count: 34, spawn: "bottom", shape: "glowdot", size: [0.5, 1.6], colors: ["#ffb347", COPPER], alpha: [0.35, 0.7], vy: [-52, -20], vx: [-14, 14], blend: "lighter", life: [1.8, 3.6] },
    { type: "particles", count: 6, shape: "streak", size: [2, 3], colors: ["#ffc16e"], alpha: [0.4, 0.7], spawn: "left", vx: [130, 200], vy: [40, 90], lenFactor: 0.12, blend: "lighter", life: [1.5, 3] },
    { type: "fog", count: 6, color: "#5a5248", alpha: [0.05, 0.1], band: [0.1, 0.6], speed: [-16, -6] },
    { type: "glow", x: 0.5, y: 1.06, r: 0.5, color: "#ff8c3b", alpha: 0.18, period: 3, flicker: 0.35 },
  ],
  bronze_collapse: [
    { type: "particles", count: 30, spawn: "top", shape: "dot", size: [0.8, 2.2], colors: ["#9a8f80", "#6f675c"], alpha: [0.3, 0.55], vy: [26, 60], vx: [-8, 8] },
    { type: "fog", count: 8, color: "#4f4a42", alpha: [0.05, 0.11], band: [0.2, 0.9], speed: [-12, -4] },
    { type: "glow", x: 0.3, y: 1.05, r: 0.4, color: "#b8542f", alpha: 0.12, period: 5, flicker: 0.3 },
  ],
  olympics: [
    { type: "particles", count: 26, spawn: "point", point: [0.5, 0.86], shape: "glowdot", size: [0.5, 1.3], colors: ["#ffe8b8", AMBER], alpha: [0.35, 0.7], vy: [-60, -24], vx: [-14, 14], blend: "lighter", life: [1.6, 3] },
    { type: "particles", count: 5, shape: "bird", size: [2.2, 3.6], colors: [IVORY], alpha: [0.4, 0.65], spawn: "left", vx: [26, 46], vy: [-8, 2], sway: { amp: 8, speed: 0.6 } },
    { type: "glow", x: 0.5, y: 0.86, r: 0.2, color: "#ffce7a", alpha: 0.2, period: 2.6, flicker: 0.3 },
  ],
  rome_founding: [
    { type: "particles", count: 18, shape: "glowdot", size: [0.5, 1.2], colors: [AMBER, "#ffe8b8"], alpha: [0.2, 0.5], vx: [-7, 7], vy: [-9, -3], twinkle: 1.3, blend: "lighter" },
    { type: "fog", count: 6, color: "#7a7466", alpha: [0.04, 0.08], band: [0.55, 0.95], speed: [4, 12] },
    { type: "glow", x: 0.7, y: 0.16, r: 0.26, color: "#ffce7a", alpha: 0.11, period: 7 },
  ],
  democracy: [
    { type: "particles", count: 16, shape: "glyph", glyphs: "ΑΔΘΛΞΠΣΦΨΩ", size: [1.6, 2.8], colors: ["#e8e2d4", "#cfc9ba"], alpha: [0.2, 0.42], vy: [-14, -5], vx: [-4, 4], sway: { amp: 8, speed: 0.6 } },
    { type: "particles", count: 22, shape: "glowdot", size: [0.4, 1], colors: [IVORY], alpha: [0.2, 0.45], spawn: "bottom", vy: [-26, -10], blend: "lighter", life: [3, 6] },
    { type: "beams", beams: [{ x: 0.35, angle: 0 }, { x: 0.65, angle: 0 }], fromTop: false, width: 26, color: "#e8e2d4", alpha: 0.04, sway: 0, speed: 0 },
  ],
  buddha: [
    { type: "glow", x: 0.5, y: 0.5, r: 0.3, color: "#ffce7a", alpha: 0.16, period: 6.5 },
    { type: "particles", count: 10, shape: "petal", size: [1.6, 2.6], colors: ["#8fc98f", "#cfe89f"], alpha: [0.25, 0.5], spawn: "top", vy: [8, 18], vx: [-5, 5], spin: 0.9, sway: { amp: 20, speed: 0.7 } },
    { type: "particles", count: 16, shape: "glowdot", size: [0.4, 1], colors: [AMBER], alpha: [0.18, 0.4], vx: [-4, 4], vy: [-6, -2], twinkle: 0.9, blend: "lighter" },
    { type: "rings", x: 0.5, y: 0.5, interval: [4.5, 6.5], speed: 34, color: "#ffce7a", alpha: 0.18, width: 1 },
  ],
  marathon: [
    { type: "particles", count: 12, shape: "arrow", size: [1.6, 2.4], colors: ["#3d3428", "#5a4f40"], alpha: [0.4, 0.65], spawn: "left", vx: [160, 240], vy: [30, 80], gravity: 60, life: [1.6, 2.6] },
    { type: "particles", count: 30, spawn: "bottom", shape: "dot", size: [0.7, 1.6], colors: ["#c9b394", "#a08a68"], alpha: [0.18, 0.38], vy: [-18, -6], vx: [24, 60], sway: { amp: 8, speed: 1 } },
    { type: "glow", x: 0.2, y: 1.05, r: 0.4, color: "#d9a05a", alpha: 0.1, period: 4 },
  ],
  alexander: [
    { type: "particles", count: 34, shape: "streak", size: [1, 1.9], colors: ["#e0c090", GOLD], alpha: [0.14, 0.32], vx: [40, 90], vy: [-6, 6], lenFactor: 0.09 },
    { type: "traveler", interval: [7, 13], speed: [180, 280], color: AMBER, size: 2.2, angle: [0.2, 0.4], trail: 0.5 },
    { type: "glow", x: 0.5, y: 0.1, r: 0.3, color: "#ffce7a", alpha: 0.12, period: 6 },
  ],
  qin: [
    { type: "particles", count: 14, shape: "glowdot", size: [1.6, 3], colors: ["#ff9d4d", "#ffc16e"], alpha: [0.3, 0.55], spawn: "bottom", vy: [-24, -10], vx: [-6, 6], sway: { amp: 10, speed: 0.7 }, blend: "lighter", life: [5, 9] },
    { type: "particles", count: 24, shape: "dot", size: [0.5, 1.2], colors: ["#c98a6a", "#b87a5a"], alpha: [0.18, 0.36], vx: [-10, 10], vy: [-5, 5], twinkle: 0.8 },
    { type: "glow", x: 0.5, y: 1.05, r: 0.44, color: "#c2452f", alpha: 0.13, period: 5 },
  ],
  caesar: [
    { type: "particles", count: 12, shape: "petal", size: [1.5, 2.6], colors: [CRIMSON, "#a83232"], alpha: [0.3, 0.55], spawn: "top", vy: [16, 34], vx: [-8, 8], spin: 1.8, sway: { amp: 18, speed: 1.1 } },
    { type: "fog", count: 5, color: "#5c5350", alpha: [0.04, 0.08], band: [0.3, 0.85], speed: [-8, -3] },
    { type: "glow", x: 0.5, y: 0.5, r: 0.5, color: "#7a1f1f", alpha: 0.1, period: 3.6 },
  ],
  rome_empire: [
    { type: "particles", count: 24, shape: "glowdot", size: [0.5, 1.2], colors: [GOLD, AMBER], alpha: [0.25, 0.55], spawn: "bottom", vy: [-30, -12], vx: [-6, 6], blend: "lighter", life: [3, 6] },
    { type: "beams", beams: [{ x: 0.2, angle: -0.06 }, { x: 0.5, angle: 0 }, { x: 0.8, angle: 0.06 }], fromTop: true, width: 36, color: "#c9a2e0", alpha: 0.04, sway: 0.01, speed: 0.1 },
    { type: "particles", count: 20, shape: "dot", size: [0.5, 1.1], colors: ["#cbb08a"], alpha: [0.15, 0.32], vx: [16, 36], vy: [-4, 4] },
  ],

  /* -------------------------------------------------------------- faith */
  jesus_birth: [
    { type: "star", x: 0.7, y: 0.14, size: 22, color: IVORY, period: 4, alpha: 0.8 },
    { type: "particles", count: 30, shape: "dot", size: [0.4, 1.1], colors: [IVORY, "#cfe4f5"], alpha: [0.2, 0.55], vx: [-2, 2], vy: [-2, 2], twinkle: 1.4, blend: "lighter" },
    { type: "beams", beams: [{ x: 0.7, angle: 0 }], fromTop: true, width: 44, color: "#ffeecc", alpha: 0.06, sway: 0, speed: 0 },
  ],
  crucifixion: [
    { type: "fog", count: 8, color: "#4a4642", alpha: [0.06, 0.12], band: [0.05, 0.6], speed: [-14, -5] },
    { type: "particles", count: 26, spawn: "top", shape: "streak", size: [1.4, 2.2], colors: ["#8fa0b8"], alpha: [0.15, 0.3], vy: [300, 420], vx: [30, 60], lenFactor: 0.05 },
    { type: "lightning", interval: [6, 11], color: "#d8e2f5", alpha: 0.7 },
  ],
  jerusalem: [
    { type: "particles", count: 36, spawn: "top", shape: "dot", size: [0.8, 2], colors: ["#9a8f80", "#7c7268"], alpha: [0.3, 0.55], vy: [22, 48], vx: [-10, 10], sway: { amp: 12, speed: 0.7 } },
    { type: "particles", count: 22, spawn: "bottom", shape: "glowdot", size: [0.5, 1.4], colors: ["#ff9d4d", COPPER], alpha: [0.3, 0.6], vy: [-44, -16], vx: [-10, 10], blend: "lighter", life: [1.8, 3.6] },
    { type: "fog", count: 7, color: "#55483c", alpha: [0.05, 0.11], band: [0.1, 0.7], speed: [-12, -4] },
  ],
  islam: [
    { type: "particles", count: 12, shape: "ring", size: [1.6, 3.4], colors: [TEAL, "#7fd8c9"], alpha: [0.2, 0.4], vy: [-10, -4], vx: [-4, 4], spin: 0.5, twinkle: 0.8, life: [6, 11] },
    { type: "particles", count: 26, shape: "glowdot", size: [0.4, 1.1], colors: [GOLD, AMBER], alpha: [0.22, 0.5], vx: [-6, 6], vy: [-8, -3], twinkle: 1.4, blend: "lighter" },
    { type: "glow", x: 0.78, y: 0.16, r: 0.22, color: "#e8f2d8", alpha: 0.13, period: 7 },
  ],
  crusades: [
    { type: "particles", count: 12, shape: "cross", size: [1.4, 2.6], colors: [CRIMSON, "#e0e0e0"], alpha: [0.25, 0.5], vx: [-6, 6], vy: [-8, -3], twinkle: 1 },
    { type: "particles", count: 32, shape: "streak", size: [1, 1.8], colors: ["#e0c090"], alpha: [0.12, 0.28], vx: [44, 96], vy: [-4, 8], lenFactor: 0.08 },
    { type: "glow", x: 0.5, y: 1.05, r: 0.4, color: "#d9a05a", alpha: 0.11, period: 5 },
  ],
  reformation: [
    { type: "particles", count: 18, shape: "paper", size: [1.6, 2.8], colors: ["#e8e2d4", "#d8cfba"], alpha: [0.3, 0.55], spawn: "top", vy: [14, 30], vx: [-14, 14], spin: 1.6, sway: { amp: 24, speed: 1.1 } },
    { type: "particles", count: 12, shape: "glyph", glyphs: "†¶§", size: [1.4, 2.2], colors: ["#b8ae9c"], alpha: [0.18, 0.36], vy: [-8, -3], vx: [-4, 4], sway: { amp: 8, speed: 0.6 } },
    { type: "glow", x: 0.3, y: 0.88, r: 0.3, color: "#ffb85e", alpha: 0.13, period: 3.4, flicker: 0.4 },
  ],

  /* --------------------------------------------- empires & middle ages */
  pompeii: [
    { type: "particles", count: 56, spawn: "top", shape: "dot", size: [0.8, 2.4], colors: ["#a89c8a", "#8a8072", "#6f675c"], alpha: [0.35, 0.65], vy: [30, 70], vx: [-12, 12], sway: { amp: 10, speed: 0.8 } },
    { type: "particles", count: 18, spawn: "top", shape: "glowdot", size: [0.6, 1.4], colors: ["#ff8c3b", CRIMSON], alpha: [0.3, 0.6], vy: [50, 100], vx: [-8, 8], blend: "lighter", life: [2, 4] },
    { type: "glow", x: 0.5, y: -0.06, r: 0.5, color: "#c2452f", alpha: 0.2, period: 3.2, flicker: 0.35 },
  ],
  paper: [
    { type: "particles", count: 20, shape: "paper", size: [1.8, 3.2], colors: ["#efe8d8", "#e0d8c4"], alpha: [0.3, 0.55], spawn: "top", vy: [10, 26], vx: [-12, 12], spin: 1.2, sway: { amp: 26, speed: 0.9 } },
    { type: "particles", count: 14, shape: "dot", size: [0.4, 0.9], colors: ["#3d3830"], alpha: [0.3, 0.5], vy: [6, 14], vx: [-4, 4], sway: { amp: 6, speed: 0.7 } },
    { type: "beams", beams: [{ x: 0.6, angle: 0.1 }], fromTop: true, width: 50, color: "#ffeecc", alpha: 0.045, sway: 0.01, speed: 0.1 },
  ],
  zero: [
    { type: "particles", count: 18, shape: "glyph", glyphs: "00001234567890", size: [1.6, 3], colors: [TEAL, "#9fe8dc"], alpha: [0.22, 0.45], vy: [-14, -5], vx: [-5, 5], sway: { amp: 10, speed: 0.7 }, twinkle: 0.8 },
    { type: "rings", x: 0.5, y: 0.46, interval: [3, 5], speed: 55, color: TEAL, alpha: 0.24, width: 1.2 },
    { type: "particles", count: 14, shape: "glowdot", size: [0.4, 1], colors: ["#9fe8dc"], alpha: [0.2, 0.4], vx: [-5, 5], vy: [-6, -2], twinkle: 1.6, blend: "lighter" },
  ],
  rome_fall: [
    { type: "particles", count: 22, spawn: "top", shape: "rect", size: [1.2, 2.6], colors: ["#8a8072", "#6f675c"], alpha: [0.3, 0.5], vy: [40, 90], vx: [-6, 6], spin: 2.4, gravity: 40 },
    { type: "fog", count: 7, color: "#5c564c", alpha: [0.05, 0.1], band: [0.3, 0.95], speed: [-10, -3] },
    { type: "particles", count: 10, spawn: "bottom", shape: "glowdot", size: [0.5, 1.1], colors: [COPPER], alpha: [0.2, 0.45], vy: [-28, -10], blend: "lighter", life: [2, 4] },
  ],
  charlemagne: [
    { type: "particles", count: 26, shape: "glowdot", size: [0.5, 1.3], colors: [GOLD, AMBER], alpha: [0.25, 0.55], spawn: "bottom", vy: [-24, -9], vx: [-5, 5], blend: "lighter", life: [3, 6] },
    { type: "beams", beams: [{ x: 0.5, angle: 0 }], fromTop: true, width: 66, color: "#ffeecc", alpha: 0.07, sway: 0, speed: 0 },
    { type: "particles", count: 8, shape: "cross", size: [1.2, 2.2], colors: [AMBER], alpha: [0.25, 0.5], vx: [-3, 3], vy: [-5, -2], twinkle: 1.6, blend: "lighter" },
  ],
  vikings: [
    { type: "aurora", bands: [{ y: 0.16, color: "#5fe0a8" }, { y: 0.26, color: TEAL }, { y: 0.34, color: "#7f9fe0" }], amp: 22, height: 80, alpha: 0.09, speed: 0.3 },
    { type: "waves", lines: 4, baseY: 0.8, gap: 0.045, amp: 8, speed: 0.8, color: "#5f8fa8", alpha: 0.3 },
    { type: "particles", count: 20, spawn: "top", shape: "dot", size: [0.6, 1.5], colors: [IVORY], alpha: [0.25, 0.5], vy: [10, 26], vx: [-10, 2], sway: { amp: 12, speed: 0.8 } },
  ],
  hastings: [
    { type: "particles", count: 18, shape: "arrow", size: [1.6, 2.4], colors: ["#3d3428", "#55483c"], alpha: [0.4, 0.65], spawn: "left", vx: [140, 220], vy: [-60, -10], gravity: 130, life: [2, 3.2] },
    { type: "fog", count: 6, color: "#6f6a5e", alpha: [0.04, 0.09], band: [0.5, 0.95], speed: [6, 14] },
    { type: "glow", x: 0.5, y: 1.05, r: 0.4, color: "#8a6f4a", alpha: 0.1, period: 5 },
  ],
  mongols: [
    { type: "particles", count: 46, shape: "streak", size: [1, 2], colors: ["#c9b394", "#a08a68"], alpha: [0.16, 0.36], vx: [90, 180], vy: [-10, 10], lenFactor: 0.07 },
    { type: "particles", count: 10, shape: "arrow", size: [1.4, 2.2], colors: ["#3d3428"], alpha: [0.35, 0.6], spawn: "left", vx: [180, 260], vy: [-30, 10], gravity: 80, life: [1.6, 2.6] },
    { type: "fog", count: 5, color: "#8a7a5e", alpha: [0.04, 0.09], band: [0.55, 0.95], speed: [26, 48] },
  ],
  black_death: [
    { type: "fog", count: 9, color: "#5e6b4f", alpha: [0.06, 0.12], band: [0.2, 0.95], speed: [-9, -3] },
    { type: "particles", count: 26, shape: "dot", size: [0.6, 1.6], colors: ["#4a5240", "#3a4034"], alpha: [0.35, 0.6], vx: [-8, 8], vy: [-6, 6], sway: { amp: 10, speed: 0.5 } },
    { type: "particles", count: 8, shape: "glowdot", size: [0.5, 1], colors: ["#8fa06a"], alpha: [0.15, 0.3], vy: [-8, -3], twinkle: 0.7, blend: "lighter" },
  ],
  printing_press: [
    { type: "particles", count: 20, shape: "glyph", glyphs: "abcdefghijklmnoprstuvz", size: [1.4, 2.6], colors: ["#e8e2d4", "#c9c2b0"], alpha: [0.25, 0.5], spawn: "top", vy: [14, 32], vx: [-8, 8], spin: 0.5, sway: { amp: 10, speed: 0.8 } },
    { type: "particles", count: 10, shape: "paper", size: [1.8, 3], colors: ["#efe8d8"], alpha: [0.28, 0.5], spawn: "top", vy: [10, 22], vx: [-10, 10], spin: 1.3, sway: { amp: 20, speed: 0.9 } },
    { type: "glow", x: 0.5, y: 0.94, r: 0.36, color: COPPER, alpha: 0.1, period: 5 },
  ],
  constantinople: [
    { type: "bursts", interval: [2.6, 5], colors: ["#ffb347", "#ff8c3b"], sparks: [14, 24], speed: [60, 140], area: [0.05, 0.35, 0.5, 0.8], life: [0.5, 0.9], gravity: 90, alpha: 0.7 },
    { type: "particles", count: 30, spawn: "top", shape: "dot", size: [0.7, 1.8], colors: ["#9a8f80"], alpha: [0.3, 0.5], vy: [24, 54], vx: [-8, 8] },
    { type: "fog", count: 7, color: "#5a5248", alpha: [0.05, 0.1], band: [0.2, 0.8], speed: [-14, -5] },
    { type: "glow", x: 0.2, y: 0.85, r: 0.3, color: "#ff8c3b", alpha: 0.12, period: 3, flicker: 0.4 },
  ],

  /* -------------------------------------------------------- exploration */
  columbus: [
    { type: "waves", lines: 5, baseY: 0.74, gap: 0.05, amp: 10, speed: 0.9, color: "#4a9ab8", alpha: 0.32 },
    { type: "particles", count: 6, shape: "bird", size: [2, 3.4], colors: [IVORY], alpha: [0.4, 0.65], spawn: "right", vx: [-44, -24], vy: [-6, 6], sway: { amp: 10, speed: 0.7 } },
    { type: "particles", count: 16, shape: "glowdot", size: [0.4, 1], colors: ["#bde8f5"], alpha: [0.2, 0.4], spawn: "bottom", vy: [-14, -5], twinkle: 1.4, blend: "lighter", life: [2, 4] },
  ],
  pirates: [
    { type: "waves", lines: 4, baseY: 0.78, gap: 0.05, amp: 11, speed: 1, color: "#3a7a8a", alpha: 0.3 },
    { type: "fog", count: 7, color: "#5e6b70", alpha: [0.05, 0.1], band: [0.4, 0.9], speed: [8, 18] },
    { type: "bursts", interval: [4.5, 8], colors: ["#ffb347"], sparks: [10, 16], speed: [40, 100], area: [0.6, 0.95, 0.55, 0.75], life: [0.4, 0.8], gravity: 60, alpha: 0.6 },
    { type: "particles", count: 10, shape: "cross", size: [0.9, 1.8], colors: [GOLD], alpha: [0.2, 0.45], vx: [-3, 3], vy: [-4, -1], twinkle: 2.2, blend: "lighter" },
  ],
  king_tut: [
    { type: "beams", beams: [{ x: 0.28, angle: 0.3, width: 40 }], fromTop: true, color: "#ffdf9e", alpha: 0.09, sway: 0, speed: 0 },
    { type: "particles", count: 30, shape: "dot", size: [0.4, 1.1], colors: [GOLD, "#e8d0a8"], alpha: [0.2, 0.45], vx: [-4, 4], vy: [-5, -1], twinkle: 1.2, blend: "lighter" },
    { type: "particles", count: 8, shape: "cross", size: [1, 2], colors: [AMBER], alpha: [0.25, 0.55], vx: [-2, 2], vy: [-3, -1], twinkle: 2.4, blend: "lighter" },
    { type: "glow", x: 0.28, y: 0.7, r: 0.26, color: "#ffce7a", alpha: 0.13, period: 5 },
  ],

  /* ------------------------------------------------- industry & modern */
  scientific_rev: [
    { type: "orrery", x: 0.5, y: 0.4, orbits: [0.1, 0.17, 0.25, 0.34], color: GOLD, alpha: 0.3 },
    { type: "particles", count: 34, shape: "dot", size: [0.4, 1.1], colors: [IVORY, "#cfe4f5"], alpha: [0.2, 0.5], vx: [-2, 2], vy: [-2, 2], twinkle: 1.5, blend: "lighter" },
    { type: "traveler", interval: [8, 14], speed: [200, 320], color: "#bde8f5", size: 2, angle: [0.3, 0.6], trail: 0.5 },
  ],
  industrial: [
    { type: "gears", gears: [{ x: 0.12, y: 0.26, r: 46, speed: 0.35 }, { x: 0.21, y: 0.4, r: 28, speed: -0.58 }, { x: 0.88, y: 0.3, r: 34, speed: 0.45 }], color: "#c9a06a", alpha: 0.2, teeth: 9 },
    { type: "particles", count: 20, spawn: "bottom", shape: "glowdot", size: [1.6, 3.2], colors: ["#6f675c", "#55504a"], alpha: [0.12, 0.24], vy: [-30, -12], vx: [-6, 6], life: [3, 6] },
    { type: "bursts", interval: [3, 6], colors: ["#ffb347", "#ffd98a"], sparks: [8, 14], speed: [40, 110], area: [0.1, 0.3, 0.5, 0.7], life: [0.3, 0.7], gravity: 160, alpha: 0.65 },
  ],
  revolution: [
    { type: "particles", count: 12, shape: "rect", size: [1.4, 2.4], colors: ["#4a6fb8", "#e8e2d4", CRIMSON], alpha: [0.3, 0.55], spawn: "bottom", vy: [-40, -16], vx: [-10, 10], spin: 2, sway: { amp: 14, speed: 1.2 }, life: [3, 6] },
    { type: "particles", count: 26, spawn: "bottom", shape: "glowdot", size: [0.5, 1.3], colors: ["#ffb347"], alpha: [0.3, 0.6], vy: [-50, -20], vx: [-12, 12], blend: "lighter", life: [1.6, 3.2] },
    { type: "fog", count: 4, color: "#5a5248", alpha: [0.04, 0.08], band: [0.1, 0.5], speed: [-10, -4] },
  ],
  vaccine: [
    { type: "particles", count: 10, shape: "spiky", size: [2.2, 3.8], colors: ["#8fa06a", "#7a8f5e"], alpha: [0.25, 0.45], vx: [-8, 8], vy: [-6, 6], spin: 0.6, life: [3, 6], pop: true },
    { type: "particles", count: 18, shape: "glowdot", size: [0.5, 1.2], colors: [TEAL, "#9fe8dc"], alpha: [0.25, 0.5], spawn: "bottom", vy: [-24, -9], blend: "lighter", life: [3, 5] },
    { type: "rings", x: 0.5, y: 0.5, interval: [4, 6.5], speed: 60, color: TEAL, alpha: 0.16, width: 1 },
  ],
  telephone: [
    { type: "wire", y: 0.56, color: GOLD, pulseColor: AMBER, alpha: 0.3, interval: [0.8, 1.7], speed: 300 },
    { type: "rings", x: 0.09, y: 0.55, interval: [2.2, 3.6], speed: 70, color: AMBER, alpha: 0.22, width: 1 },
    { type: "rings", x: 0.91, y: 0.55, interval: [2.4, 3.8], speed: 70, color: TEAL, alpha: 0.22, width: 1 },
    { type: "particles", count: 12, shape: "glowdot", size: [0.4, 1], colors: [AMBER], alpha: [0.15, 0.35], vx: [-4, 4], vy: [-5, -2], twinkle: 1.4, blend: "lighter" },
  ],
  first_flight: [
    { type: "particles", count: 30, shape: "streak", size: [1, 1.8], colors: ["#cfd8d6", "#b8c4c9"], alpha: [0.12, 0.28], vx: [70, 140], vy: [-6, 6], lenFactor: 0.1 },
    { type: "particles", count: 8, shape: "petal", size: [1.2, 2], colors: ["#e8e2d4"], alpha: [0.25, 0.45], spawn: "left", vx: [40, 90], vy: [-20, 10], spin: 2.4, sway: { amp: 20, speed: 1.4 } },
    { type: "particles", count: 5, shape: "bird", size: [2.2, 3.4], colors: ["#8a8f94"], alpha: [0.35, 0.55], spawn: "left", vx: [30, 55], vy: [-8, 4], sway: { amp: 10, speed: 0.7 } },
    { type: "fog", count: 4, color: "#9aa8b0", alpha: [0.03, 0.06], band: [0.1, 0.4], speed: [18, 34] },
  ],
  titanic: [
    { type: "waves", lines: 4, baseY: 0.8, gap: 0.05, amp: 7, speed: 0.5, color: "#3a5a7a", alpha: 0.34 },
    { type: "particles", count: 34, spawn: "top", shape: "dot", size: [0.6, 1.6], colors: [IVORY, "#cfe4f5"], alpha: [0.3, 0.6], vy: [10, 26], vx: [-8, 4], sway: { amp: 12, speed: 0.8 } },
    { type: "particles", count: 10, spawn: "bottom", shape: "ring", size: [0.8, 1.8], colors: ["#8fb8d8"], alpha: [0.12, 0.26], vy: [-14, -5], life: [3, 6], pop: true },
    { type: "fog", count: 5, color: "#7a95a8", alpha: [0.03, 0.07], band: [0.5, 0.85], speed: [4, 10] },
  ],
  ww1: [
    { type: "particles", count: 30, spawn: "top", shape: "streak", size: [1.2, 2], colors: ["#8fa0b8"], alpha: [0.14, 0.28], vy: [280, 400], vx: [20, 50], lenFactor: 0.05 },
    { type: "particles", count: 4, shape: "glowdot", size: [1.8, 2.6], colors: ["#ffe8b8"], alpha: [0.5, 0.75], spawn: "top", vy: [12, 22], vx: [-4, 4], sway: { amp: 8, speed: 0.5 }, blend: "lighter", life: [6, 10] },
    { type: "fog", count: 8, color: "#55584a", alpha: [0.06, 0.12], band: [0.5, 0.95], speed: [-10, -4] },
    { type: "lightning", interval: [7, 12], color: "#ffe2b8", alpha: 0.5 },
  ],
  television: [
    { type: "scan", speed: 70, bandH: 60, alpha: 0.09, specks: 70, color: "#cfd8d6" },
    { type: "rings", x: 0.85, y: 0.2, interval: [2.8, 4.4], speed: 80, color: "#9fd8ff", alpha: 0.2, width: 1 },
    { type: "particles", count: 10, shape: "glowdot", size: [0.5, 1.1], colors: ["#9fd8ff"], alpha: [0.2, 0.4], vx: [-6, 6], vy: [-5, 5], twinkle: 2, blend: "lighter" },
  ],
  ww2: [
    { type: "beams", beams: [{ x: 0.2, angle: -0.12 }, { x: 0.5, angle: 0.05 }, { x: 0.82, angle: 0.15 }], fromTop: false, width: 30, color: "#d8e2f5", alpha: 0.07, sway: 0.16, speed: 0.4 },
    { type: "particles", count: 30, spawn: "top", shape: "dot", size: [0.7, 1.7], colors: ["#8a8072"], alpha: [0.25, 0.5], vy: [18, 42], vx: [-8, 8] },
    { type: "bursts", interval: [5, 9], colors: ["#ffb347"], sparks: [10, 18], speed: [50, 120], area: [0.1, 0.9, 0.1, 0.35], life: [0.4, 0.8], gravity: 40, alpha: 0.5 },
    { type: "fog", count: 6, color: "#4f4a42", alpha: [0.05, 0.1], band: [0.5, 0.95], speed: [-12, -5] },
  ],
  computer: [
    { type: "glyphColumns", glyphs: "01", color: TEAL, headColor: "#beffef", colWidth: 30, speed: [50, 140], size: [10, 14], alpha: 0.5 },
    { type: "bursts", interval: [4, 8], colors: [AMBER], sparks: [6, 10], speed: [30, 80], area: [0.1, 0.9, 0.2, 0.8], life: [0.3, 0.6], gravity: 0, alpha: 0.6 },
  ],
  dna: [
    { type: "helix", y: 0.4, amp: 36, wavelength: 140, speed: 0.5, colors: [TEAL, CRIMSON], alpha: 0.45 },
    { type: "particles", count: 20, shape: "glowdot", size: [0.4, 1], colors: [TEAL, "#e88fa8"], alpha: [0.18, 0.4], vx: [-6, 6], vy: [-6, 6], twinkle: 1.4, blend: "lighter" },
  ],
  moon: [
    { type: "particles", count: 44, shape: "dot", size: [0.4, 1.2], colors: [IVORY, "#cfe4f5"], alpha: [0.25, 0.6], vx: [-1.5, 1.5], vy: [-1.5, 1.5], twinkle: 1.2, blend: "lighter" },
    { type: "particles", count: 12, shape: "glowdot", size: [0.6, 1.4], colors: ["#d8d8e0"], alpha: [0.14, 0.3], spawn: "bottom", vy: [-8, -3], vx: [-4, 4], life: [5, 9] },
    { type: "glow", x: 0.2, y: 0.2, r: 0.2, color: "#9fc8ff", alpha: 0.12, period: 8 },
  ],
  voyager: [
    { type: "particles", count: 60, shape: "dot", size: [0.3, 1.1], colors: [IVORY, "#9fd8ff", "#cfe4f5"], alpha: [0.25, 0.65], vx: [-1, 1], vy: [-1, 1], twinkle: 1.1, blend: "lighter" },
    { type: "traveler", interval: [5, 10], speed: [70, 120], color: AMBER, size: 2, angle: [0.1, 0.3], trail: 1.2 },
    { type: "traveler", interval: [7, 13], speed: [320, 520], color: IVORY, size: 1.6, angle: [0.4, 0.7], trail: 0.4 },
  ],
  smallpox: [
    { type: "particles", count: 9, shape: "spiky", size: [2, 3.6], colors: ["#8f7a6a", "#7a6f5e"], alpha: [0.25, 0.45], vx: [-6, 6], vy: [-5, 5], spin: 0.5, life: [2.4, 4.5], pop: true },
    { type: "particles", count: 24, shape: "glowdot", size: [0.5, 1.2], colors: [TEAL, "#9fe8dc"], alpha: [0.25, 0.55], spawn: "bottom", vy: [-30, -12], blend: "lighter", life: [3, 5.5] },
    { type: "glow", x: 0.5, y: 0.4, r: 0.4, color: TEAL, alpha: 0.08, period: 6 },
  ],
  challenger: [
    { type: "particles", count: 7, shape: "glowdot", size: [1, 1.8], colors: [IVORY], alpha: [0.4, 0.7], spawn: "bottom", vy: [-26, -14], vx: [-3, 3], blend: "lighter", life: [8, 13] },
    { type: "particles", count: 20, shape: "dot", size: [0.4, 1], colors: ["#cfe4f5"], alpha: [0.2, 0.45], vx: [-2, 2], vy: [-2, 2], twinkle: 1, blend: "lighter" },
    { type: "fog", count: 4, color: "#8fa8c9", alpha: [0.03, 0.06], band: [0.1, 0.4], speed: [6, 14] },
  ],
  berlin_wall: [
    { type: "bursts", interval: [1.8, 3.4], colors: [AMBER, TEAL, CRIMSON, IVORY], sparks: [24, 40], speed: [60, 160], area: [0.15, 0.85, 0.1, 0.45], life: [0.8, 1.5], gravity: 30, alpha: 0.8 },
    { type: "beams", beams: [{ x: 0.3, angle: -0.08 }, { x: 0.72, angle: 0.1 }], fromTop: false, width: 26, color: "#ffeecc", alpha: 0.06, sway: 0.12, speed: 0.5 },
    { type: "particles", count: 16, shape: "rect", size: [1, 1.9], colors: [AMBER, TEAL, IVORY], alpha: [0.3, 0.55], spawn: "top", vy: [20, 44], vx: [-14, 14], spin: 3, sway: { amp: 16, speed: 1.4 } },
  ],
  internet: [
    { type: "network", count: 26, dist: 130, color: TEAL, nodeColor: AMBER, alpha: 0.3, speed: 16 },
    { type: "particles", count: 10, shape: "glyph", glyphs: "<>/#@&{}", size: [1.2, 2], colors: ["#7fd8c9"], alpha: [0.15, 0.3], vy: [-10, -4], vx: [-4, 4] },
  ],
  dotcom_bubble: [
    { type: "particles", count: 20, spawn: "bottom", shape: "ring", size: [1.2, 3.4], colors: ["#9fd8ff", TEAL], alpha: [0.22, 0.45], vy: [-40, -16], sway: { amp: 14, speed: 1.1 }, life: [2, 4.5], pop: true },
    { type: "ticker", trend: -1, startY: 0.22, range: 0.4, color: CRIMSON, alpha: 0.55, duration: 5, hold: 1.4 },
    { type: "particles", count: 12, shape: "glyph", glyphs: "$%.-", size: [1.2, 2], colors: ["#e88f8f"], alpha: [0.2, 0.4], spawn: "top", vy: [30, 60], vx: [-6, 6] },
  ],
  sept_11: [
    { type: "beams", beams: [{ x: 0.44, angle: 0, width: 22 }, { x: 0.56, angle: 0, width: 22 }], fromTop: false, color: "#cfe0f5", alpha: 0.1, sway: 0, speed: 0 },
    { type: "particles", count: 18, shape: "dot", size: [0.4, 1.1], colors: ["#b8c4d0"], alpha: [0.15, 0.32], vy: [4, 12], vx: [-4, 4], sway: { amp: 8, speed: 0.4 } },
  ],
  smartphone: [
    { type: "particles", count: 14, shape: "roundrect", size: [2.4, 4.4], colors: [TEAL, AMBER, CRIMSON, "#9fd8ff"], alpha: [0.22, 0.42], spawn: "bottom", vy: [-30, -12], vx: [-8, 8], spin: 0.8, sway: { amp: 10, speed: 0.8 }, life: [4, 7] },
    { type: "rings", x: 0.5, y: 0.12, interval: [2.6, 4.2], speed: 70, color: TEAL, alpha: 0.2, width: 1 },
    { type: "particles", count: 12, shape: "cross", size: [0.8, 1.6], colors: [IVORY], alpha: [0.2, 0.45], vx: [-3, 3], vy: [-4, -1], twinkle: 2.4, blend: "lighter" },
  ],
  financial_crash: [
    { type: "ticker", trend: -1, startY: 0.2, range: 0.46, color: CRIMSON, alpha: 0.6, duration: 6, hold: 1.2 },
    { type: "particles", count: 16, shape: "glyph", glyphs: "%$▼-", size: [1.3, 2.2], colors: [CRIMSON, "#e88f8f"], alpha: [0.22, 0.45], spawn: "top", vy: [36, 70], vx: [-8, 8] },
    { type: "fog", count: 4, color: "#5c5350", alpha: [0.04, 0.08], band: [0.55, 0.95], speed: [-8, -3] },
  ],
  mars_rover: [
    { type: "particles", count: 40, shape: "streak", size: [0.9, 1.7], colors: ["#d98a5a", "#c2704a"], alpha: [0.14, 0.3], vx: [36, 80], vy: [-6, 6], lenFactor: 0.08 },
    { type: "particles", count: 20, shape: "dot", size: [0.4, 1], colors: [IVORY], alpha: [0.15, 0.35], vx: [-1, 1], vy: [-1, 1], twinkle: 1, blend: "lighter" },
    { type: "glow", x: 0.5, y: 1.06, r: 0.5, color: "#c2603a", alpha: 0.14, period: 5 },
  ],
  trillion_dollar_company: [
    { type: "ticker", trend: 1, startY: 0.72, range: 0.42, color: TEAL, alpha: 0.55, duration: 6, hold: 1.4 },
    { type: "particles", count: 14, shape: "glyph", glyphs: "$", size: [1.3, 2.4], colors: [GOLD, "#7fe0a8"], alpha: [0.25, 0.5], spawn: "bottom", vy: [-36, -14], vx: [-6, 6], sway: { amp: 8, speed: 0.9 }, life: [3, 5.5] },
    { type: "particles", count: 12, shape: "cross", size: [0.9, 1.7], colors: [AMBER], alpha: [0.2, 0.45], vx: [-3, 3], vy: [-4, -1], twinkle: 2.2, blend: "lighter" },
  ],
  covid: [
    { type: "particles", count: 11, shape: "spiky", size: [2, 3.8], colors: ["#8f9a6a", "#a8a07a"], alpha: [0.22, 0.42], vx: [-9, 9], vy: [-7, 7], spin: 0.5, sway: { amp: 8, speed: 0.4 } },
    { type: "rings", x: 0.5, y: 0.5, interval: [3.4, 5.4], speed: 44, color: "#9aa39e", alpha: 0.14, width: 1 },
    { type: "fog", count: 5, color: "#6f7a72", alpha: [0.03, 0.07], band: [0.2, 0.85], speed: [-6, -2] },
  ],
  ukraine: [
    { type: "particles", count: 26, shape: "petal", size: [0.9, 1.7], colors: [GOLD, "#e8ce7a"], alpha: [0.25, 0.5], spawn: "bottom", vy: [-20, -8], vx: [8, 22], spin: 1.6, sway: { amp: 14, speed: 1 }, life: [4, 8] },
    { type: "fog", count: 4, color: "#5f7fa8", alpha: [0.04, 0.08], band: [0.05, 0.35], speed: [6, 14] },
    { type: "bursts", interval: [6, 11], colors: ["#ffb347"], sparks: [8, 14], speed: [40, 100], area: [0.6, 0.95, 0.15, 0.4], life: [0.4, 0.7], gravity: 50, alpha: 0.45 },
  ],
  hormuz: [
    { type: "waves", lines: 5, baseY: 0.72, gap: 0.05, amp: 8, speed: 0.7, color: "#3a6a8a", alpha: 0.32 },
    { type: "beams", beams: [{ x: 0.86, angle: 0.5, width: 14 }], fromTop: false, color: TEAL, alpha: 0.09, sway: 0.65, speed: 0.55 },
    { type: "particles", count: 10, shape: "glowdot", size: [0.6, 1.2], colors: [CRIMSON, AMBER], alpha: [0.3, 0.6], vx: [-3, 3], vy: [-1, 1], twinkle: 0.8, blend: "lighter" },
    { type: "glow", x: 0.5, y: 0.62, r: 0.5, color: "#c2452f", alpha: 0.1, period: 4.4 },
  ],
};
