import { rawEvents } from "./events.js";
import { eventInsights } from "./insights.js";
import { narrationScripts } from "./narration.js";
import { createStageEffects } from "./effects.js";
import { createAmbience } from "./ambience.js";

const ERA_DEFS = [
  {
    key: "cosmic",
    name: "Cosmic Origins",
    ids: ["big_bang", "earth_formation"],
  },
  {
    key: "life",
    name: "First Life",
    ids: ["first_life", "cambrian", "great_dying", "dinosaurs", "mammals", "lucy", "ice_age", "fire", "cavemen", "agriculture"],
  },
  {
    key: "civilizations",
    name: "Civilizations",
    ids: ["wheel", "writing", "pyramids", "egypt", "babylon", "olympics", "rome_founding", "democracy"],
  },
  {
    key: "empires",
    name: "Empires",
    ids: ["troy", "bronze_collapse", "marathon", "alexander", "qin", "caesar", "rome_empire", "pompeii", "rome_fall", "charlemagne", "hastings", "mongols", "constantinople"],
  },
  {
    key: "faith",
    name: "Faith",
    ids: ["buddha", "jesus_birth", "crucifixion", "jerusalem", "islam", "crusades", "reformation"],
  },
  {
    key: "exploration",
    name: "Exploration",
    ids: ["paper", "zero", "vikings", "black_death", "printing_press", "columbus", "pirates", "king_tut"],
  },
  {
    key: "industry",
    name: "Industry",
    ids: ["scientific_rev", "industrial", "revolution", "vaccine", "telephone", "first_flight", "titanic", "ww1", "television", "ww2"],
  },
  {
    key: "modern",
    name: "Modern Power",
    ids: ["computer", "dna", "moon", "voyager", "smallpox", "challenger", "berlin_wall", "internet", "dotcom_bubble", "sept_11", "smartphone", "financial_crash", "mars_rover", "trillion_dollar_company", "covid", "ukraine"],
  },
  {
    key: "future",
    name: "Future Shock",
    ids: ["hormuz"],
  },
];

const themeSets = {
  conflict: new Set(["troy", "bronze_collapse", "marathon", "caesar", "jerusalem", "rome_fall", "hastings", "crusades", "mongols", "ww1", "ww2", "sept_11", "ukraine", "hormuz"]),
  belief: new Set(["buddha", "jesus_birth", "crucifixion", "islam", "reformation"]),
  breakthrough: new Set(["paper", "zero", "scientific_rev", "vaccine", "telephone", "television", "computer", "dna", "internet", "smartphone"]),
  life: new Set(["first_life", "cambrian", "great_dying", "dinosaurs", "mammals", "lucy", "ice_age"]),
  space: new Set(["big_bang", "earth_formation", "moon", "voyager", "mars_rover"]),
};

const eraLookup = new Map();
ERA_DEFS.forEach((era) => era.ids.forEach((id) => eraLookup.set(id, era)));

const STORAGE_KEY = "chrono-chronicles-overhaul:v1";
const MIN_NARRATION_MS = 12000;
const MAX_NARRATION_MS = 32000;
const previewIds = ["big_bang", "agriculture", "democracy", "constantinople", "ww1", "hormuz"];

const state = {
  activeId: "big_bang",
  filter: "all",
  query: "",
  playing: false,
  bookmarkOnly: false,
  bookmarks: loadBookmarks(),
};

let autoplayTimer = null;
let narrationUtterance = null;
let narrationAdvanceTimer = null;
let narrationVoices = [];
let narrationToken = 0;
let preloadedAudio = null;
let kenBurnsAlternate = false;

const narrationAudio = new Audio();
narrationAudio.preload = "auto";

const app = document.querySelector(".app");
const experience = document.querySelector("#experience");
const searchInput = document.querySelector("#search-input");
const filterRow = document.querySelector("#filter-row");
const timelineList = document.querySelector("#timeline-list");
const eraScrubber = document.querySelector("#era-scrubber");
const toast = document.querySelector("#toast");
const narrationStatus = document.querySelector("#narration-status");

if ("speechSynthesis" in window) {
  narrationVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener?.("voiceschanged", () => {
    narrationVoices = window.speechSynthesis.getVoices();
  });
}

const events = rawEvents
  .map((event) => {
    const era = eraLookup.get(event.id) ?? ERA_DEFS[ERA_DEFS.length - 1];
    return {
      ...event,
      era,
      displayYear: formatYear(event.year),
      sortYear: parseYear(event.year),
      imagePath: `./assets/history/${event.id}.png`,
      audioPath: `./assets/narration/${event.id}.mp3`,
      script: narrationScripts[event.id] ?? event.description,
      insight: eventInsights[event.id] ?? "Why it matters: this milestone changed the conditions for the events that followed.",
      theme: themeFor(event.id),
    };
  })
  .sort((a, b) => a.sortYear - b.sortYear)
  .map((event, index) => ({ ...event, index }));

const byId = new Map(events.map((event) => [event.id, event]));
const stageEffects = createStageEffects(document.querySelector("#stage-effects"));
const ambience = createAmbience();

// Browsers require a user gesture before audio can start.
["pointerdown", "keydown"].forEach((type) =>
  document.addEventListener(type, () => ambience.unlock(), { once: true, capture: true })
);

state.activeId = events[0].id;

renderPreview();
renderFilters();
render();
updateSoundLabel();

const params = new URLSearchParams(window.location.search);
if (window.location.hash === "#experience" || params.get("view") === "experience") {
  setMode("experience");
}

document.addEventListener("click", (event) => {
  const control = event.target.closest("[data-action]");
  if (!control) return;

  const action = control.dataset.action;
  if (action === "start") setMode("experience");
  if (action === "home") setMode("intro");
  if (action === "previous") selectByOffset(-1);
  if (action === "next") selectByOffset(1);
  if (action === "play") setPlaying(!state.playing);
  if (action === "bookmark") toggleBookmark();
  if (action === "copy-cite") copyCitation();
  if (action === "show-map") showToast("Map mode is represented by the atlas path overlay on each event stage.");
  if (action === "toggle-sound") toggleAmbience();
  if (action === "toggle-bookmarks") toggleBookmarkFilter();
  if (action === "focus-stage") toggleFocusMode();
});

searchInput.addEventListener("input", (event) => {
  state.query = event.target.value.trim().toLowerCase();
  renderTimeline();
});

window.addEventListener("keydown", (event) => {
  if (app.dataset.mode !== "experience") return;
  if (event.key === "ArrowRight") selectByOffset(1);
  if (event.key === "ArrowLeft") selectByOffset(-1);
  if (event.key === " " && event.target === document.body) {
    event.preventDefault();
    setPlaying(!state.playing);
  }
});

function setMode(mode) {
  app.dataset.mode = mode;
  if (mode === "experience") {
    ambience.setActive(true);
    requestAnimationFrame(() => {
      document.querySelector(".timeline-event.active")?.scrollIntoView({ block: "nearest" });
      stageEffects.setScene(activeEvent().id);
    });
  } else {
    setPlaying(false);
    ambience.setActive(false);
  }
}

function render() {
  const active = activeEvent();
  renderTimeline();
  renderStage(active);
  renderDossier(active);
  renderScrubber();
  updatePlayButton();
}

function renderPreview() {
  const container = document.querySelector("#preview-events");
  const fragment = document.createDocumentFragment();

  previewIds
    .map((id) => rawEvents.find((event) => event.id === id))
    .filter(Boolean)
    .forEach((event) => {
      const item = document.createElement("article");
      item.className = "preview-event";

      const image = document.createElement("img");
      image.src = `./assets/history/${event.id}.png`;
      image.alt = "";

      const year = document.createElement("span");
      year.textContent = formatYear(event.year);

      const title = document.createElement("strong");
      title.textContent = event.name;

      item.append(image, year, title);
      fragment.append(item);
    });

  container.replaceChildren(fragment);
}

function renderFilters() {
  const fragment = document.createDocumentFragment();
  const filters = [{ key: "all", name: "All 75" }, ...ERA_DEFS.map((era) => ({ key: era.key, name: era.name }))];

  filters.forEach((filter) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-button";
    button.textContent = filter.name;
    button.addEventListener("click", () => {
      state.filter = filter.key;
      state.bookmarkOnly = false;
      renderTimeline();
      renderScrubber();
    });
    fragment.append(button);
  });

  filterRow.replaceChildren(fragment);
}

function renderTimeline() {
  const visible = filteredEvents();
  const fragment = document.createDocumentFragment();

  document.querySelectorAll(".filter-button").forEach((button, index) => {
    const key = index === 0 ? "all" : ERA_DEFS[index - 1].key;
    button.classList.toggle("active", key === state.filter && !state.bookmarkOnly);
  });

  if (visible.length === 0) {
    const empty = document.createElement("p");
    empty.className = "timeline-empty";
    empty.textContent = state.bookmarkOnly ? "No bookmarked milestones yet." : "No milestones match this search.";
    timelineList.replaceChildren(empty);
    return;
  }

  const groups = ERA_DEFS
    .map((era) => ({ era, events: visible.filter((event) => event.era.key === era.key) }))
    .filter((group) => group.events.length > 0);

  groups.forEach(({ era, events: groupEvents }) => {
    const section = document.createElement("section");
    section.className = "timeline-group";

    const header = document.createElement("div");
    header.className = "timeline-group-header";
    const title = document.createElement("h3");
    title.textContent = era.name;
    const count = document.createElement("span");
    count.textContent = `${groupEvents.length} events`;
    header.append(title, count);

    section.append(header);

    groupEvents.forEach((event) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "timeline-event";
      button.classList.toggle("active", event.id === state.activeId);
      button.addEventListener("click", () => selectEvent(event.id));

      const year = document.createElement("time");
      year.textContent = event.displayYear;
      const title = document.createElement("strong");
      title.textContent = event.name;

      button.append(year, title);
      section.append(button);
    });

    fragment.append(section);
  });

  timelineList.replaceChildren(fragment);
}

function renderStage(event) {
  document.querySelector("#event-counter").textContent = `${event.index + 1} / ${events.length}`;
  document.querySelector("#stage-era").textContent = event.era.name;
  document.querySelector("#event-title").textContent = event.name;
  document.querySelector("#event-year").textContent = event.displayYear;
  document.querySelector("#event-summary").textContent = firstSentences(event.script, 3);

  const image = document.querySelector("#stage-image");
  const prev = document.querySelector("#stage-image-prev");
  const wrap = document.querySelector(".stage-image-wrap");
  const changing = !image.src.endsWith(event.imagePath.slice(1));

  if (changing) {
    wrap.classList.add("is-changing");

    // Hold the outgoing frame on the overlay layer, then fade it out once the
    // incoming image has painted.
    prev.src = image.src;
    prev.style.transition = "none";
    prev.style.opacity = "1";

    kenBurnsAlternate = !kenBurnsAlternate;
    image.classList.toggle("kb-a", !kenBurnsAlternate);
    image.classList.toggle("kb-b", kenBurnsAlternate);

    const fadeOut = () => {
      requestAnimationFrame(() => {
        prev.style.transition = "opacity 760ms ease";
        prev.style.opacity = "0";
      });
    };
    image.onload = fadeOut;
    image.onerror = () => {
      image.onerror = null;
      image.src = "./assets/history/big_bang.png";
      fadeOut();
    };
    image.src = event.imagePath;
    if (image.complete) fadeOut();
    window.setTimeout(() => wrap.classList.remove("is-changing"), 560);
  }

  image.alt = `${event.name} historical scene`;
  stageEffects.setScene(event.id);
  ambience.setScene(event.id);
}

function renderDossier(event) {
  const sentences = splitSentences(event.description);
  const readTime = Math.max(1, Math.ceil(event.description.split(/\s+/).length / 170));

  document.querySelector("#dossier-position").textContent = `Event ${event.index + 1} of ${events.length}`;
  document.querySelector("#dossier-path").textContent = `${event.era.name} / ${event.theme}`;
  document.querySelector("#dossier-title").textContent = event.name;
  document.querySelector("#dossier-year").textContent = event.displayYear;
  document.querySelector("#reading-label").textContent = `Narrative 1 of ${sentences.length}`;
  document.querySelector("#reading-time").textContent = `~ ${readTime} min read`;
  document.querySelector("#reading-progress").style.width = `${Math.max(10, ((event.index + 1) / events.length) * 100)}%`;
  document.querySelector("#dossier-copy").textContent = event.description;
  document.querySelector("#dossier-insight-copy").textContent = event.insight;
  document.querySelector("#bookmark-label").textContent = state.bookmarks.has(event.id) ? "Bookmarked" : "Bookmark";

  const facts = [
    ["Region", regionFor(event)],
    ["Coordinates", coordinatesFor(event)],
    ["Chapter Era", event.era.name],
    ["Theme", event.theme],
  ];

  const fragment = document.createDocumentFragment();
  facts.forEach(([label, value]) => {
    const row = document.createElement("div");
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = label;
    dd.textContent = value;
    row.append(dt, dd);
    fragment.append(row);
  });
  document.querySelector("#fact-list").replaceChildren(fragment);
}

function renderScrubber() {
  const fragment = document.createDocumentFragment();
  const active = activeEvent();

  ERA_DEFS.forEach((era) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "era-button";
    button.classList.toggle("active", active.era.key === era.key);
    button.addEventListener("click", () => {
      state.filter = era.key;
      state.bookmarkOnly = false;
      const first = events.find((event) => event.era.key === era.key);
      if (first) selectEvent(first.id, { scroll: false });
      renderTimeline();
    });

    const label = document.createElement("span");
    label.textContent = era.name;
    button.append(label);
    fragment.append(button);
  });

  eraScrubber.replaceChildren(fragment);
}

function selectEvent(id, options = {}) {
  if (!byId.has(id)) return;
  state.activeId = id;
  render();
  if (state.playing) narrateActiveEvent();
  if (options.scroll !== false) {
    requestAnimationFrame(() => document.querySelector(".timeline-event.active")?.scrollIntoView({ block: "nearest" }));
  }
}

function selectByOffset(offset) {
  const current = activeEvent().index;
  const nextIndex = Math.max(0, Math.min(events.length - 1, current + offset));
  selectEvent(events[nextIndex].id);
}

function setPlaying(playing) {
  const wasPlaying = state.playing;
  state.playing = playing;
  clearPlaybackTimers();
  experience.classList.toggle("is-playing", playing);

  if (playing) {
    narrateActiveEvent();
    showToast("Narrated journey started.");
  } else {
    stopNarration();
    if (wasPlaying) showToast("Narration paused.");
  }

  updatePlayButton();
}

function updatePlayButton() {
  const button = document.querySelector(".play-button");
  if (!button) return;
  button.classList.toggle("is-playing", state.playing);
  button.setAttribute("aria-label", state.playing ? "Pause narrated timeline" : "Play narrated timeline");
  button.innerHTML = state.playing
    ? `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>`
    : `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>`;
}

function clearPlaybackTimers() {
  window.clearInterval(autoplayTimer);
  window.clearTimeout(narrationAdvanceTimer);
  autoplayTimer = null;
  narrationAdvanceTimer = null;
}

function stopNarration() {
  narrationToken += 1;
  narrationUtterance = null;
  narrationAudio.pause();
  ambience.duck(false);
  if (narrationStatus) narrationStatus.textContent = "Narration paused.";
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

function narrateActiveEvent() {
  const event = activeEvent();
  clearPlaybackTimers();
  stopNarration();
  ambience.duck(true);
  const token = narrationToken;
  if (narrationStatus) narrationStatus.textContent = `Narrating ${event.name}.`;

  narrationAudio.onended = () => {
    if (token !== narrationToken || !state.playing) return;
    clearPlaybackTimers();
    narrationAdvanceTimer = window.setTimeout(advanceNarratedJourney, 900);
  };
  narrationAudio.onerror = () => {
    if (token !== narrationToken || !state.playing) return;
    speakFallback(event, token);
  };

  narrationAudio.src = event.audioPath;
  narrationAudio.playbackRate = 1;
  narrationAudio.play().catch(() => {
    if (token === narrationToken && state.playing) speakFallback(event, token);
  });

  // Warm the cache for the next milestone so autoplay never stutters.
  const next = events[event.index + 1];
  if (next) {
    preloadedAudio = new Audio();
    preloadedAudio.preload = "auto";
    preloadedAudio.src = next.audioPath;
  }
}

function speakFallback(event, token) {
  const text = narrationText(event);

  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
    narrationAdvanceTimer = window.setTimeout(advanceNarratedJourney, estimatedNarrationMs(text));
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = chooseNarrationVoice();
    if (voice) utterance.voice = voice;
    utterance.rate = 0.88;
    utterance.pitch = 0.78;
    utterance.volume = 1;
    narrationUtterance = utterance;

    utterance.onend = () => {
      if (token !== narrationToken || narrationUtterance !== utterance || !state.playing) return;
      clearPlaybackTimers();
      advanceNarratedJourney();
    };

    utterance.onerror = () => {
      if (token !== narrationToken || narrationUtterance !== utterance || !state.playing) return;
      clearPlaybackTimers();
      narrationAdvanceTimer = window.setTimeout(advanceNarratedJourney, estimatedNarrationMs(text));
    };

    window.speechSynthesis.speak(utterance);
    narrationAdvanceTimer = window.setTimeout(advanceNarratedJourney, estimatedNarrationMs(text) + 1800);
  } catch {
    narrationAdvanceTimer = window.setTimeout(advanceNarratedJourney, estimatedNarrationMs(text));
  }
}

function advanceNarratedJourney() {
  if (!state.playing) return;
  if (activeEvent().index >= events.length - 1) {
    setPlaying(false);
    return;
  }
  selectByOffset(1);
}

function narrationText(event) {
  return `${event.name}. ${event.script}`;
}

function estimatedNarrationMs(text) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(MIN_NARRATION_MS, Math.min(MAX_NARRATION_MS, words * 430));
}

function chooseNarrationVoice() {
  const voices = (narrationVoices.length ? narrationVoices : window.speechSynthesis.getVoices()).filter((voice) =>
    /^en/i.test(voice.lang)
  );
  // Prefer known deep, warm male voices for the documentary tone.
  return (
    voices.find((voice) => /andrew|christopher|guy|davis|daniel|george|onyx/i.test(voice.name)) ??
    voices.find((voice) => /natural|premium|enhanced|neural/i.test(voice.name)) ??
    voices[0] ??
    null
  );
}

function toggleBookmark() {
  const event = activeEvent();
  if (state.bookmarks.has(event.id)) {
    state.bookmarks.delete(event.id);
    showToast("Bookmark removed.");
  } else {
    state.bookmarks.add(event.id);
    showToast("Milestone bookmarked.");
  }
  saveBookmarks();
  renderDossier(event);
}

function toggleBookmarkFilter() {
  state.bookmarkOnly = !state.bookmarkOnly;
  state.filter = "all";
  renderTimeline();
  showToast(state.bookmarkOnly ? "Showing bookmarked milestones." : "Showing all milestones.");
}

function toggleAmbience() {
  ambience.setEnabled(!ambience.enabled);
  updateSoundLabel();
  showToast(ambience.enabled ? "Ambient sound on." : "Ambient sound off.");
}

function updateSoundLabel() {
  const label = document.querySelector("#sound-label");
  if (label) label.textContent = ambience.enabled ? "Sound On" : "Sound Off";

  const control = document.querySelector("#sound-toggle");
  if (control) {
    control.setAttribute("aria-pressed", String(ambience.enabled));
    control.setAttribute("aria-label", `Ambient sound ${ambience.enabled ? "on" : "off"}`);
  }
}

function toggleFocusMode() {
  experience.classList.toggle("focused");
  showToast(experience.classList.contains("focused") ? "Stage focus enabled." : "Stage focus cleared.");
}

async function copyCitation() {
  const event = activeEvent();
  const citation = `${event.name} (${event.displayYear}). Chrono Chronicles. Created by Wadih Absi.`;

  try {
    await navigator.clipboard.writeText(citation);
  } catch {
    const fallback = document.createElement("textarea");
    fallback.value = citation;
    fallback.setAttribute("readonly", "");
    fallback.style.position = "fixed";
    fallback.style.opacity = "0";
    document.body.append(fallback);
    fallback.select();
    document.execCommand("copy");
    fallback.remove();
  }

  showToast("Citation copied.");
}

function filteredEvents() {
  const query = state.query;
  return events.filter((event) => {
    const matchesFilter = state.filter === "all" || event.era.key === state.filter;
    const matchesBookmark = !state.bookmarkOnly || state.bookmarks.has(event.id);
    const haystack = `${event.name} ${event.year} ${event.description} ${event.era.name}`.toLowerCase();
    return matchesFilter && matchesBookmark && (!query || haystack.includes(query));
  });
}

function activeEvent() {
  return byId.get(state.activeId) ?? events[0];
}

function parseYear(year) {
  const match = year.replace(/,/g, "").match(/([\d.]+)\s*(Billion|Million)?\s*(BC|AD)/i);
  if (!match) return Number.POSITIVE_INFINITY;
  let value = Number(match[1]);
  if ((match[2] ?? "").toLowerCase() === "billion") value *= 1_000_000_000;
  if ((match[2] ?? "").toLowerCase() === "million") value *= 1_000_000;
  return match[3].toUpperCase() === "BC" ? -value : value;
}

function formatYear(year) {
  return year
    .replace("Billion", "B")
    .replace("Million", "M")
    .replace(/\s+([BM])\s+/g, "$1 ")
    .replace("BC", "BCE")
    .replace("AD", "CE");
}

function splitSentences(text) {
  return text.match(/[^.!?]+[.!?]+(?=\s|$)|.+$/g)?.map((sentence) => sentence.trim()).filter(Boolean) ?? [text];
}

function firstSentences(text, count) {
  return splitSentences(text).slice(0, count).join(" ");
}

function themeFor(id) {
  if (themeSets.space.has(id)) return "Creation, Space, Time";
  if (themeSets.life.has(id)) return "Life, Evolution, Extinction";
  if (themeSets.conflict.has(id)) return "Conflict, Risk, Power";
  if (themeSets.belief.has(id)) return "Belief, Identity, Reform";
  if (themeSets.breakthrough.has(id)) return "Breakthrough, Knowledge, Tools";
  if (id === "covid" || id === "smallpox") return "Pandemics, Medicine, Society";
  return "Civilization, Exchange, Power";
}

function regionFor(event) {
  if (event.id === "big_bang") return "The observable universe";
  if (event.id === "moon") return "Sea of Tranquility, Moon";
  if (event.id === "voyager") return "Outer Solar System";
  if (event.id === "mars_rover") return "Gale Crater, Mars";
  if (event.lat === 0 && event.lng === 0) return "Reference point";

  const latBand = event.lat >= 0 ? "Northern" : "Southern";
  const lngBand = event.lng >= 0 ? "Eastern" : "Western";
  return `${latBand} / ${lngBand} hemisphere`;
}

function coordinatesFor(event) {
  if (event.id === "big_bang") return "0.000° N, 0.000° E (reference point)";
  return `${Math.abs(event.lat).toFixed(1)}° ${event.lat >= 0 ? "N" : "S"}, ${Math.abs(event.lng).toFixed(1)}° ${event.lng >= 0 ? "E" : "W"}`;
}

function loadBookmarks() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    return new Set(Array.isArray(parsed.bookmarks) ? parsed.bookmarks : []);
  } catch {
    return new Set();
  }
}

function saveBookmarks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, bookmarks: [...state.bookmarks] }));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2400);
}
