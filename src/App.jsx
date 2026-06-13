import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import events from "./data/events.js";
import unexpectedEventRecords from "./data/unexpected_events.json";
import wisdomRecords from "./data/wisdom.json";
import StartScreen from "./components/StartScreen.jsx";
import SeasonTransition, { SeasonBackground } from "./components/SeasonTransition.jsx";
import FamilyPhoto from "./components/FamilyPhoto.jsx";
import SeasonGameBoard from "./components/SeasonGameBoard.jsx";
import Setting from "./setting.js";
import { createEmptyFamily, getFamilyMembers, getFamilySummary, normalizeFamily } from "./game/family.js";

const STORAGE_KEY = "life-map-game";
const SETTINGS_KEY = "life-map-settings";
const createDefaultSettings = () => ({
  morbid: false,
  masterVolume: 55,
  aiMadeEvents: true
});

const normalizeSettings = (settings) => {
  const defaultSettings = createDefaultSettings();
  return {
    morbid: Boolean(settings?.morbid ?? defaultSettings.morbid),
    masterVolume: clamp(Number(settings?.masterVolume ?? defaultSettings.masterVolume), 0, 100),
    aiMadeEvents: Boolean(settings?.aiMadeEvents ?? defaultSettings.aiMadeEvents)
  };
};

const loadSavedSettings = () => {
  if (typeof window === "undefined") {
    return createDefaultSettings();
  }

  try {
    const saved = window.localStorage.getItem(SETTINGS_KEY);
    return saved ? normalizeSettings(JSON.parse(saved)) : createDefaultSettings();
  } catch {
    window.localStorage.removeItem(SETTINGS_KEY);
    return createDefaultSettings();
  }
};

const createIdleSimulationState = () => ({
  phase: "idle",
  steps: [],
  currentIndex: 0,
  unexpectedEvent: null,
  summary: null
});
const severityConfig = {
  minor: { label: "Minor", icon: "·" },
  moderate: { label: "Moderate", icon: "◆" },
  major: { label: "Major", icon: "⚠" }
};
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const seasonConfig = [
  { id: "spring", label: "Spring", icon: "🌸", months: [1, 2, 3], palette: "Bloom", description: "Fresh starts, healthier routines, and tiny brave resets." },
  { id: "summer", label: "Summer", icon: "☀️", months: [4, 5, 6], palette: "Sunlit", description: "High-energy plans, family logistics, and social heat." },
  { id: "fall", label: "Fall", icon: "🍂", months: [7, 8, 9], palette: "Harvest", description: "Back-to-rhythm choices, and cozy priorities." },
  { id: "winter", label: "Winter", icon: "❄️", months: [10, 11, 12], palette: "Frost", description: "Recovery, reflection, surprise obligations, and warm connections." }
];

const getMonthLength = (month, year) => new Date(year, month, 0).getDate();
const getSeasonForMonth = (month) => seasonConfig.find((season) => season.months.includes(month)) ?? seasonConfig[0];
const getSeasonIndexForMonth = (month) => seasonConfig.findIndex((season) => season.months.includes(month));
const getSeasonMonthNames = (season) => season.months.map((month) => monthNames[month - 1]).join(" · ");
const createSeasonHistoryKey = (year, seasonId) => `${year}-${seasonId}`;

const createEmptySeasonHistory = () => Object.fromEntries(seasonConfig.map((season) => [season.id, []]));
const getSeasonHistorySnapshot = (game, seasonId = getSeasonForMonth(game.month).id) => {
  const selections = Object.values(game.selectedChoices ?? {});

  return selections.map((selection, index) => ({
    id: `${seasonId}-${selection.eventTitle ?? "event"}-${selection.label ?? "choice"}-${index}`,
    dayName: selection.dayName,
    eventTitle: selection.eventTitle,
    label: selection.label,
    effects: sanitizeEffects(selection.effects)
  }));
};
const updateSeasonHistory = (game) => {
  const seasonId = getSeasonForMonth(game.month).id;
  const year = Number.isFinite(Number(game.year)) ? Number(game.year) : new Date().getFullYear();
  const historyKey = createSeasonHistoryKey(year, seasonId);
  const nextHistory = { ...createEmptySeasonHistory(), ...(game.seasonHistory ?? {}) };
  const snapshot = getSeasonHistorySnapshot(game, seasonId).map((selection) => ({
    ...selection,
    seasonId,
    year
  }));

  return {
    ...nextHistory,
    [seasonId]: snapshot.length > 0 ? snapshot : nextHistory[seasonId] ?? [],
    [historyKey]: snapshot.length > 0 ? snapshot : nextHistory[historyKey] ?? []
  };
};
const createSeasonScoreSnapshot = (previousGame, finalSeasonGame = previousGame) => {
  const season = getSeasonForMonth(previousGame.month);
  const startStats = previousGame.weekStartStats ?? captureStats(previousGame);
  const stats = captureStats(finalSeasonGame);
  const deltas = summaryStatKeys.reduce((seasonDeltas, key) => ({
    ...seasonDeltas,
    [key]: stats[key] - (startStats[key] ?? previousGame[key] ?? 0)
  }), {});

  return {
    id: createSeasonHistoryKey(previousGame.year, season.id),
    seasonId: season.id,
    seasonLabel: season.label,
    year: previousGame.year,
    stats,
    deltas
  };
};
const updateSeasonScores = (previousGame, finalSeasonGame = previousGame) => {
  const snapshot = createSeasonScoreSnapshot(previousGame, finalSeasonGame);
  const nextSeasonScores = { ...(previousGame.seasonScores ?? {}) };

  return {
    ...nextSeasonScores,
    [snapshot.id]: snapshot
  };
};

const seasonalAudioConfig = {
  spring: {
    padFrequencies: [196, 293.66, 349.23, 440],
    chimeFrequencies: [659.25, 783.99, 880, 987.77],
    chimeInterval: 4800,
    chimePeak: 0.15,
    padMix: 0.16,
    oscillatorTypes: ["sine", "triangle", "sine", "triangle"]
  },
  summer: {
    padFrequencies: [220, 329.63, 392, 493.88],
    chimeFrequencies: [523.25, 587.33, 659.25, 783.99],
    chimeInterval: 4200,
    chimePeak: 0.17,
    padMix: 0.2,
    oscillatorTypes: ["triangle", "sine", "triangle", "sine"]
  },
  fall: {
    padFrequencies: [164.81, 246.94, 329.63, 392],
    chimeFrequencies: [392, 493.88, 587.33, 659.25],
    chimeInterval: 6200,
    chimePeak: 0.13,
    padMix: 0.17,
    oscillatorTypes: ["sine", "sine", "triangle", "sine"]
  },
  winter: {
    padFrequencies: [174, 261.63, 349.23, 523.25],
    chimeFrequencies: [783.99, 880, 987.77, 1046.5],
    chimeInterval: 7600,
    chimePeak: 0.11,
    padMix: 0.14,
    oscillatorTypes: ["sine", "triangle", "sine", "sine"]
  }
};

const getSeasonalAudioConfig = (seasonId) => seasonalAudioConfig[seasonId] ?? seasonalAudioConfig.spring;

const statConfig = {
  wellbeing: { label: "Wellbeing", icon: "🌿", max: 100, tone: "good", accent: "#34d399", glow: "rgba(52, 211, 153, 0.34)", signal: "Health + calm" },
  marriage: { label: "Spousal relationship", icon: "💞", max: 100, tone: "good", accent: "#fb7185", glow: "rgba(251, 113, 133, 0.34)", signal: "Spouse / partner" },
  children: { label: "Children bond", icon: "🌱", max: 100, tone: "good", accent: "#22d3ee", glow: "rgba(34, 211, 238, 0.3)", signal: "Kids / parenting" },
  wallet: { label: "Wallet", icon: "👛", max: 100, tone: "good", accent: "#f59e0b", glow: "rgba(245, 158, 11, 0.34)", signal: "Resources" }
};

const summaryStatKeys = Object.keys(statConfig);
const displayStatConfig = statConfig;
const displayStatKeys = summaryStatKeys;
const getDisplayStatValue = (game, key) => game[key] ?? 0;
const getDisplayDeltaValue = (deltas, key) => deltas[key] ?? 0;
const getDisplayEffectEntries = (effects) => Object.entries(sanitizeEffects(effects));
const captureStats = (game) =>
  summaryStatKeys.reduce((stats, key) => ({ ...stats, [key]: game[key] ?? 0 }), {});


const formatAgeRange = (range) => {
  if (!range) return "Family ages unavailable";
  if (range.min === range.max) return `Age ${range.min}`;
  return `Ages ${range.min}–${range.max}`;
};

const getFamilyAgeRange = (family, currentAge, currentMonth) => {
  const memberAges = getFamilyMembers(family, currentAge, currentMonth)
    .map((member) => member.age)
    .filter(Number.isFinite);
  const ages = [Number(currentAge), ...memberAges].filter(Number.isFinite).map((age) => Math.max(0, Math.floor(age)));

  if (ages.length === 0) {
    return null;
  }

  return {
    min: Math.min(...ages),
    max: Math.max(...ages)
  };
};

const getFamilyAgeWisdom = (gameState) => {
  const ageRange = getFamilyAgeRange(gameState.family, gameState.age, gameState.month);
  const fallback = wisdomRecords[0] ?? null;

  if (!ageRange || !fallback) {
    return null;
  }

  const matchingRecord = wisdomRecords.find((record) => {
    const minAge = Number(record.minAge ?? 0);
    const maxAge = Number(record.maxAge ?? 120);
    return ageRange.max >= minAge && ageRange.min <= maxAge;
  }) ?? fallback;

  return {
    ...matchingRecord,
    ageRangeLabel: formatAgeRange(ageRange)
  };
};


const getStatBand = (value) => {
  if (value <= 30) return "critical";
  if (value <= 50) return "low";
  if (value >= 82) return "strong";
  return "steady";
};

const seasonalWisdomByStat = {
  wellbeing: {
    title: "Protect the oxygen mask",
    critical: "Wellbeing is flashing red, so make the next season smaller on purpose before everyone starts borrowing from your nervous system.",
    low: "Energy is thinner than the calendar pretends. Choose one repeatable recovery ritual before adding another obligation.",
    steady: "Your calm is usable capital. Spend it deliberately on the family moments that will actually remember you.",
    strong: "Wellbeing is carrying the household well right now. Bank the strength by building routines that still work on tired days.",
    action: "Pick one non-negotiable rest block and defend it like a bill that comes due."
  },
  marriage: {
    title: "Keep the teammate close",
    critical: "The partnership meter needs gentle triage. Fewer heroic fixes, more specific repair attempts and honest check-ins.",
    low: "Connection is asking for maintenance, not fireworks. Small bids for attention will matter more than dramatic speeches.",
    steady: "The relationship has enough stability to become a planning advantage if you make decisions together instead of nearby.",
    strong: "Your partnership is a family asset this season. Let the kids see cooperation, apologies, and shared laughter in motion.",
    action: "Schedule one boring-but-kind logistics talk and one no-logistics moment."
  },
  children: {
    title: "Connection before correction",
    critical: "The family bond needs warmth before strategy. Lead with attention, then expectations, especially if the house feels tense.",
    low: "Kids and dependents may need proof that they are not just another task. Tiny consistent rituals beat occasional grand gestures.",
    steady: "Family connection is workable. Turn routine moments into anchors before the season gets noisy.",
    strong: "The children bond is a strength. Use it to teach resilience without turning every lesson into a lecture.",
    action: "Create one predictable touchpoint: breakfast, bedtime, ride home, walk, or weekly check-in."
  },
  wallet: {
    title: "Make money boring again",
    critical: "Wallet stress is likely to leak into every other stat. This is a season for clarity, limits, and fewer surprise commitments.",
    low: "Resources are tight enough that vague optimism is expensive. Give every planned choice a small budget container.",
    steady: "Money is stable enough to support values if you name the tradeoffs before the calendar names them for you.",
    strong: "The wallet has breathing room. Use it to buy resilience, not just relief: buffers, repairs, and future flexibility.",
    action: "Set one spending boundary and one tiny buffer before saying yes to extras."
  }
};

const getSeasonalFamilyWisdom = (gameState, previousGame = null, targetMonth = gameState?.month, deltas = null) => {
  const ageRange = getFamilyAgeRange(gameState?.family, gameState?.age, targetMonth);
  const ageRecord = getFamilyAgeWisdom({ ...gameState, month: targetMonth });
  const statEntries = summaryStatKeys.map((key) => ({
    key,
    value: clamp(Number(gameState?.[key] ?? 0)),
    delta: Number(deltas?.[key] ?? 0)
  }));
  const focusStat = statEntries.reduce((lowest, entry) => {
    if (!lowest) return entry;
    if (entry.value < lowest.value) return entry;
    if (entry.value === lowest.value && entry.delta < lowest.delta) return entry;
    return lowest;
  }, null);
  const statCopy = seasonalWisdomByStat[focusStat?.key] ?? seasonalWisdomByStat.wellbeing;
  const band = getStatBand(focusStat?.value ?? 0);
  const targetSeason = getSeasonForMonth(targetMonth);
  const previousSeason = previousGame ? getSeasonForMonth(previousGame.month) : null;
  const delta = focusStat?.delta ?? null;
  const deltaLabel = Number.isFinite(delta) && delta !== 0 ? `${delta > 0 ? "+" : ""}${delta} last season` : "steady last season";

  return {
    kicker: "Family wisdom card",
    title: `${targetSeason.label} wisdom: ${statCopy.title}`,
    seasonLabel: targetSeason.label,
    ageRangeLabel: formatAgeRange(ageRange),
    ageTitle: ageRecord?.title ?? "Family season",
    ageSummary: ageRecord?.summary ?? "This household season will reward attention to the people who are changing fastest.",
    statIcon: statConfig[focusStat?.key]?.icon ?? "✨",
    statLabel: statConfig[focusStat?.key]?.label ?? "Family",
    statValue: focusStat?.value ?? 0,
    statBand: band,
    statDeltaLabel: deltaLabel,
    summary: statCopy[band],
    expect: ageRecord?.expect ?? "Small choices can become family patterns when repeated kindly.",
    focus: statCopy.action,
    context: previousSeason ? `${previousSeason.label} is behind you. ${targetSeason.label} needs a fresh family rule.` : `${targetSeason.label} begins with a fresh family rule.`
  };
};

const legacySkillConfig = {
  grit: { label: "Grit", icon: "🛡️", description: "Turns past burnout into calmer future weeks." },
  wellness: { label: "Wellness", icon: "🌿", description: "Carries forward healthier habits after a bad ending." },
  bonds: { label: "Bonds", icon: "💞", description: "Keeps a little relationship wisdom between lives." },
  parenting: { label: "Parenting", icon: "🧸", description: "Saves family lessons for the next run." }
};

const createEmptyStats = () => Object.fromEntries(summaryStatKeys.map((key) => [key, 0]));
const createEmptySkills = () => Object.fromEntries(Object.keys(legacySkillConfig).map((key) => [key, 0]));

const createDefaultLegacy = () => ({
  runs: 0,
  difficulty: 1,
  carryRate: 0.25,
  skills: createEmptySkills(),
  carriedStats: createEmptyStats(),
  lastRun: null
});


const allowedEffectKeys = new Set(summaryStatKeys);
const normalizeEffectKey = (key) => ({ money: "wallet", welling: "wellbeing", health: "wellbeing", stress: "wellbeing" })[key] ?? key;
const normalizeEffectValue = (key, value) => key === "stress" ? -value : value;
const sanitizeEffects = (effects) => {
  const sanitizedEffects = {};

  Object.entries(effects ?? {}).forEach(([rawKey, rawValue]) => {
    const numericValue = Number(rawValue);
    const key = normalizeEffectKey(rawKey);

    if (!allowedEffectKeys.has(key) || !Number.isFinite(numericValue)) {
      return;
    }

    sanitizedEffects[key] = (sanitizedEffects[key] ?? 0) + Math.round(normalizeEffectValue(rawKey, numericValue));
  });

  return sanitizedEffects;
};
const normalizeCustomEvents = (input) => {
  if (!input.trim()) {
    return [];
  }

  const parsed = JSON.parse(input);
  const records = Array.isArray(parsed) ? parsed : [parsed];

  return records.map((event, index) => {
    if (!event || typeof event !== "object") {
      throw new Error(`Custom event ${index + 1} must be an object.`);
    }

    const choices = Array.isArray(event.choices) ? event.choices : [];
    if (!event.title || !event.description || choices.length === 0) {
      throw new Error(`Custom event ${index + 1} needs title, description, and at least one choice.`);
    }

    return {
      ...event,
      id: event.id || `custom-event-${index + 1}`,
      category: event.category || "Custom",
      severity: ["minor", "moderate", "major"].includes(event.severity) ? event.severity : "minor",
      tags: Array.isArray(event.tags) && event.tags.length > 0 ? event.tags : ["general"],
      choices: choices.map((choice, choiceIndex) => ({
        label: choice?.label || `Choice ${choiceIndex + 1}`,
        effects: sanitizeEffects(choice?.effects),
        memory: choice?.memory || `You chose ${choice?.label || `choice ${choiceIndex + 1}`}.`
      }))
    };
  });
};

const getCarryRate = (runs) => Math.max(0.08, 0.25 - runs * 0.025);
const getDifficultyMultiplier = (runs) => Number((1 + runs * 0.12).toFixed(2));
const getRunNumber = (legacy) => (legacy?.runs ?? 0) + 1;
const toFiniteNumber = (value, fallback = 0) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};
const normalizeLegacy = (legacy) => {
  const runs = Math.max(0, Math.round(toFiniteNumber(legacy?.runs)));
  const skills = createEmptySkills();
  const carriedStats = createEmptyStats();

  Object.keys(skills).forEach((key) => {
    skills[key] = clamp(toFiniteNumber(legacy?.skills?.[key]), 0, 99);
  });

  summaryStatKeys.forEach((key) => {
    if (key === "wellbeing" && legacy?.carriedStats?.wellbeing === undefined) {
      carriedStats[key] = Math.round(((toFiniteNumber(legacy?.carriedStats?.health) - toFiniteNumber(legacy?.carriedStats?.stress)) / 2));
      return;
    }

    carriedStats[key] = Math.round(toFiniteNumber(legacy?.carriedStats?.[key]));
  });

  return {
    runs,
    difficulty: Math.max(1, toFiniteNumber(legacy?.difficulty, getDifficultyMultiplier(runs))),
    carryRate: Math.max(0.08, Math.min(0.25, toFiniteNumber(legacy?.carryRate, getCarryRate(runs)))),
    skills,
    carriedStats,
    lastRun: legacy?.lastRun && typeof legacy.lastRun === "object" ? legacy.lastRun : null
  };
};

const eventVisuals = {
  "daughter-recital": { icon: "🎼", accent: "violet", label: "Family moment" },
  "friend-birthday": { icon: "🎂", accent: "rose", label: "Social life" },
  "gym-session": { icon: "🏋️", accent: "green", label: "Wellness" },
  "annual-checkup": { icon: "🩺", accent: "blue", label: "Health" },
  "weekend-getaway": { icon: "🌄", accent: "amber", label: "Relationship" },
  "online-course": { icon: "💡", accent: "indigo", label: "Career" },
  "school-project": { icon: "🔬", accent: "teal", label: "Parenting" },
  "grocery-budget": { icon: "🛒", accent: "green", label: "Home" },
  "car-repair": { icon: "🚗", accent: "amber", label: "Errands" },
  "team-lunch": { icon: "🥗", accent: "blue", label: "Work" },
  "neighbor-help": { icon: "📦", accent: "teal", label: "Community" },
  "date-night": { icon: "🌙", accent: "rose", label: "Relationship" },
  "sleep-debt": { icon: "🛌", accent: "indigo", label: "Recovery" },
  "home-maintenance": { icon: "🔧", accent: "amber", label: "Home" },
  "volunteer-shift": { icon: "🤝", accent: "teal", label: "Community" },
  "side-hustle": { icon: "💼", accent: "violet", label: "Work" },
  "family-call": { icon: "☎️", accent: "blue", label: "Family" },
  "therapy-session": { icon: "🧠", accent: "green", label: "Wellness" },
  "kids-sports": { icon: "⚽", accent: "rose", label: "Parenting" },
  "investment-choice": { icon: "📈", accent: "amber", label: "Planning" },
  "digital-detox": { icon: "📵", accent: "indigo", label: "Wellness" },
  "pop-quiz": { icon: "📝", accent: "blue", label: "School" },
  "school-supply-list": { icon: "🎒", accent: "green", label: "School" },
  "parent-teacher-conference": { icon: "🏫", accent: "amber", label: "School" },
  "field-trip-form": { icon: "🚌", accent: "teal", label: "School" },
  "bullying-report": { icon: "🛡️", accent: "rose", label: "Major school event" },
  "honor-roll-invite": { icon: "🏅", accent: "violet", label: "School" },
  "school-play-audition": { icon: "🎭", accent: "indigo", label: "School" },
  "scholarship-deadline": { icon: "🎓", accent: "amber", label: "Major school event" },
  "detention-call": { icon: "📞", accent: "rose", label: "School" },
  "school-fundraiser": { icon: "🎟️", accent: "teal", label: "School" },
  "car-breakdown": { icon: "🚗", accent: "amber", label: "Random emergency" },
  "furnace-replacement": { icon: "🔥", accent: "rose", label: "Random emergency" },
  "fence-blown-down": { icon: "🌬️", accent: "teal", label: "Random emergency" }
};

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(value)));

const getStatSeverity = (value, config) => {
  if (!config.max) {
    return null;
  }

  const normalizedValue = clamp(value, 0, config.max);

  if (config.tone === "bad") {
    if (normalizedValue >= 80) return "critical";
    if (normalizedValue >= 60) return "warning";
    return "stable";
  }

  if (normalizedValue <= 20) return "critical";
  if (normalizedValue <= 40) return "warning";
  return "stable";
};

const severityCopy = {
  critical: { icon: "🚨", label: "Critical" },
  warning: { icon: "⚠️", label: "Watch" }
};

const createEventSeed = () => Math.floor(Math.random() * 1_000_000_000);
const seededRandom = (...values) => {
  let hash = 2166136261;

  values.join("|").split("").forEach((character) => {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  });

  return ((hash >>> 0) % 10000) / 10000;
};
const getRandomEventId = (excludeId, eventList = events) => {
  if (eventList.length === 0) {
    return null;
  }

  const availableEvents = eventList.filter((event) => event.id !== excludeId);
  const pool = availableEvents.length > 0 ? availableEvents : eventList;
  return pool[Math.floor(Math.random() * pool.length)]?.id ?? null;
};


const conditionComparators = {
  gt: (current, target) => current > target,
  gte: (current, target) => current >= target,
  lt: (current, target) => current < target,
  lte: (current, target) => current <= target,
  eq: (current, target) => current === target,
  neq: (current, target) => current !== target
};
const getConditionStatValue = (gameState, stat) => gameState?.[normalizeEffectKey(stat)] ?? 0;
const isSingleConditionMet = (condition, gameState) => {
  const stat = normalizeEffectKey(condition?.stat);
  const comparator = conditionComparators[condition?.op];
  const targetValue = Number(condition?.value);

  if (!allowedEffectKeys.has(stat) || !comparator || !Number.isFinite(targetValue)) {
    return false;
  }

  return comparator(getConditionStatValue(gameState, stat), targetValue);
};
const isEventConditionMet = (event, gameState) => {
  const condition = event?.condition;

  if (!condition) {
    return true;
  }

  if (Array.isArray(condition.conditions)) {
    const conditions = condition.conditions;

    if (conditions.length === 0) {
      return true;
    }

    return condition.conditionOp === "OR"
      ? conditions.some((nestedCondition) => isSingleConditionMet(nestedCondition, gameState))
      : conditions.every((nestedCondition) => isSingleConditionMet(nestedCondition, gameState));
  }

  return isSingleConditionMet(condition, gameState);
};

const normalizeRequirementList = (requirements) => {
  if (!requirements) {
    return [];
  }

  return Array.isArray(requirements) ? requirements : [requirements];
};

const matchesFamilyAgeRequirement = (member, requirement) => {
  if (!Number.isFinite(member?.age)) {
    return false;
  }

  const minAge = Number(requirement?.minAge ?? requirement?.min);
  const maxAge = Number(requirement?.maxAge ?? requirement?.max);
  const roles = Array.isArray(requirement?.roles) ? requirement.roles : [];
  const sexes = Array.isArray(requirement?.sexes) ? requirement.sexes : [];

  if (roles.length > 0 && !roles.includes(member.role)) {
    return false;
  }

  if (sexes.length > 0 && !sexes.includes(member.sex)) {
    return false;
  }

  if (Number.isFinite(minAge) && member.age < minAge) {
    return false;
  }

  if (Number.isFinite(maxAge) && member.age > maxAge) {
    return false;
  }

  return true;
};

const isFamilyAgeEventEligible = (event, gameState) => {
  const requirements = normalizeRequirementList(event?.familyAgeGroups ?? event?.familyAgeGroup);

  if (requirements.length === 0) {
    return true;
  }

  if (!gameState?.family) {
    return false;
  }

  const familyMembers = getFamilyMembers(gameState.family, gameState.age, gameState.month);

  return requirements.some((requirement) =>
    familyMembers.some((member) => matchesFamilyAgeRequirement(member, requirement))
  );
};

const isEventEligible = (event, gameState) =>
  isEventConditionMet(event, gameState) && isFamilyAgeEventEligible(event, gameState);

const isEventSeasonEligible = (event, month) => {
  const seasons = Array.isArray(event?.seasons) ? event.seasons : [];

  if (seasons.length === 0) {
    return true;
  }

  return seasons.includes(getSeasonForMonth(month).id);
};

const getAgePriorityTags = (age) => {
  if (age >= 35 && age <= 45) {
    return ["young-family", "eldercare", "midlife"];
  }
  return ["general"];
};

const getAgeRelevantEvents = (age, eventList = events, gameState = null, month = gameState?.month) => {
  const priorityTags = getAgePriorityTags(age);
  const scheduledEvents = eventList.filter((event) =>
    !event.surprise && isEventEligible(event, gameState) && (!month || isEventSeasonEligible(event, month))
  );
  const relevantEvents = scheduledEvents.filter((event) => {
    const tags = event.tags ?? ["general"];
    return tags.some((tag) => priorityTags.includes(tag) || tag === "general");
  });

  return relevantEvents.length > 0 ? relevantEvents : scheduledEvents;
};

const getEventRelevanceScore = (event, age) => {
  const tags = event.tags ?? [];
  const priorityTags = getAgePriorityTags(age);
  const hasPriority = tags.some((tag) => priorityTags.includes(tag));
  const hasGeneral = tags.includes("general");

  let score = 1;
  if (hasPriority) score += 6;
  if (hasGeneral) score += 2;
  return score;
};

const chooseAgeRelevantEvent = (eventSeed, month, year, index, eventPool, age) => {
  const weighted = eventPool.map((event) => ({ event, weight: getEventRelevanceScore(event, age) }));
  const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
  const choiceRoll = seededRandom(eventSeed, month, year, index, "event-weight") * totalWeight;
  let running = 0;

  return weighted.find(({ weight }) => {
    running += weight;
    return choiceRoll < running;
  })?.event ?? eventPool[0];
};

const getSeverity = (event) => event.severity ?? "minor";
const getRandomChoice = (eventSeed, month, dayIndex, decisionIndex, choices) => {
  const choiceIndex = Math.floor(seededRandom(eventSeed, month, dayIndex, decisionIndex, "choice") * choices.length);
  return choices[Math.min(choiceIndex, choices.length - 1)];
};
const getNextSeasonState = (month, age, year = new Date().getFullYear()) => {
  const seasonIndex = getSeasonIndexForMonth(month);
  const nextSeason = seasonConfig[(seasonIndex + 1) % seasonConfig.length];
  const nextMonth = nextSeason.months[0];

  return {
    age: nextMonth <= month ? age + 1 : age,
    year: nextMonth <= month ? year + 1 : year,
    month: nextMonth,
    week: nextMonth
  };
};

const RANDOM_EVENT_CHANCE = 0.067;
const MAX_SEASON_DECISIONS = 7;
const UNEXPECTED_EVENT_CHANCE = 0.093;
const surpriseEvents = unexpectedEventRecords.map((event) => ({
  ...event,
  effects: sanitizeEffects(event.effects),
  severity: getSeverity(event),
  visual: { icon: event.icon ?? "✨", accent: event.accent ?? "blue", label: event.category ?? "Unexpected" }
}));
const morbidUnexpectedEvents = [
  {
    id: "funeral-call",
    title: "Funeral Call",
    severity: "major",
    category: "Morbid surprise",
    icon: "🕯️",
    accent: "violet",
    description: "A late-night call brings news of a death in the extended family, and everyone looks to you for logistics and comfort.",
    effects: sanitizeEffects({ wellbeing: -12, marriage: -4, children: -5, wallet: -6 }),
    memory: "A funeral call pulled the family into grief, travel plans, and hard conversations.",
    visual: { icon: "🕯️", accent: "violet", label: "Morbid surprise" }
  },
  {
    id: "pet-goodbye",
    title: "Pet Goodbye",
    severity: "moderate",
    category: "Morbid surprise",
    icon: "🐾",
    accent: "rose",
    description: "The family pet takes a sudden turn, forcing an emotional decision nobody feels ready to make.",
    effects: sanitizeEffects({ wellbeing: -9, children: -7, wallet: -3 }),
    memory: "Saying goodbye to the family pet became a tender, awful family milestone.",
    visual: { icon: "🐾", accent: "rose", label: "Morbid surprise" }
  },
  {
    id: "estate-paperwork",
    title: "Estate Paperwork",
    severity: "moderate",
    category: "Morbid surprise",
    icon: "📜",
    accent: "amber",
    description: "A relative's old estate issue resurfaces with confusing forms, deadlines, and unresolved family feelings.",
    effects: sanitizeEffects({ wellbeing: -7, marriage: -2, children: -2, wallet: -4 }),
    memory: "Old estate paperwork resurfaced and brought stress, expense, and family history with it.",
    visual: { icon: "📜", accent: "amber", label: "Morbid surprise" }
  }
];
const getUnexpectedEventForMonth = (eventSeed, month, year, gameState, settings = createDefaultSettings()) => {
  const surpriseEventPool = settings.morbid ? [...surpriseEvents, ...morbidUnexpectedEvents] : surpriseEvents;
  const eligibleSurpriseEvents = surpriseEventPool.filter((event) => isEventEligible(event, gameState));

  if (eligibleSurpriseEvents.length === 0) {
    return null;
  }

  const triggerRoll = seededRandom(eventSeed, month, year, "unexpected-event");
  if (triggerRoll >= UNEXPECTED_EVENT_CHANCE) {
    return null;
  }

  const eventIndex = Math.floor(seededRandom(eventSeed, month, year, "unexpected-event-choice") * eligibleSurpriseEvents.length);
  return eligibleSurpriseEvents[Math.min(eventIndex, eligibleSurpriseEvents.length - 1)];
};
const getDecoratedEvent = (event, eventSeed, month, dayIndex, decisionIndex) => ({
  ...event,
  severity: getSeverity(event),
  key: `${eventSeed}-${month}-${dayIndex}-${decisionIndex}-${event.id}`,
  visual: eventVisuals[event.id] ?? { icon: event.icon ?? "✨", accent: event.accent ?? "blue", label: event.category ?? "Life" }
});

const getMonthSchedule = (month, year, eventSeed, age, eventList = events, gameState = null) => {
  const eventPool = getAgeRelevantEvents(age, eventList, gameState, month);
  const daysInMonth = getMonthLength(month, year);

  return Array.from({ length: daysInMonth }, (_, index) => {
    const date = new Date(year, month - 1, index + 1);
    const dayLabel = `${monthNames[month - 1]} ${index + 1}`;
    const hasEvent = eventPool.length > 0 && seededRandom(eventSeed, month, year, index, "has-event") < RANDOM_EVENT_CHANCE;
    const decisions = hasEvent
      ? [getDecoratedEvent(chooseAgeRelevantEvent(eventSeed, month, year, index, eventPool, age), eventSeed, month, index, 0)]
      : [];

    return {
      date,
      month,
      monthName: monthNames[month - 1],
      dayNumber: index + 1,
      dayLabel,
      decisions
    };
  });
};

const limitSeasonSchedule = (schedule, maxDecisions = MAX_SEASON_DECISIONS) => {
  let decisionsSeen = 0;

  return schedule.map((day) => {
    if (day.decisions.length === 0) {
      return day;
    }

    const remainingSlots = Math.max(0, maxDecisions - decisionsSeen);
    const decisions = day.decisions.slice(0, remainingSlots);
    decisionsSeen += decisions.length;

    return {
      ...day,
      decisions
    };
  });
};

const getSeasonSchedule = (season, year, eventSeed, age, eventList = events, gameState = null) =>
  limitSeasonSchedule(
    season.months.flatMap((month) => getMonthSchedule(month, year, eventSeed, age, eventList, gameState))
  );

const summaryCopy = {
  chaos: {
    mood: "🔥",
    headline: "Your calendar chose violence",
    joke: "Stress went up so fast it probably needs its own zip code."
  },
  glow: {
    mood: "💪",
    headline: "Suspiciously responsible behavior",
    joke: "Health improved. Your couch has filed a missing person report."
  },
  romance: {
    mood: "💞",
    headline: "Main character relationship arc",
    joke: "The relationship meter blushed. Extremely unprofessional."
  },
  family: {
    mood: "🌱",
    headline: "Family bond power-up",
    joke: "The kids may remember this fondly, pending snack availability."
  },
  legend: {
    mood: "🏆",
    headline: "Tiny wins, suspicious vibes",
    joke: "Nothing exploded, which experts are calling personal growth."
  },
  survived: {
    mood: "😵‍💫",
    headline: "You made it through somehow",
    joke: "No one knows how, but the week has legally ended."
  }
};

const getSummaryTone = (deltas) => {
  if (deltas.wellbeing <= -12) return "chaos";
  if (deltas.wellbeing >= 8) return "glow";
  if (deltas.wallet >= 8) return "legend";
  if (deltas.marriage >= 8) return "romance";
  if (deltas.children >= 8) return "family";
  if (summaryStatKeys.every((key) => deltas[key] >= 0)) return "legend";
  return "survived";
};

const getLifeWeather = (deltas) => {
  if (deltas.wellbeing <= -12) return "Thunderstorms with a chance of overthinking ⚡";
  if (deltas.wellbeing >= 8) return "Sunny with gains and suspiciously clean sneakers 💪";
  if (deltas.wallet >= 8) return "Clear skies with a padded-wallet breeze 👛";
  if (deltas.marriage >= 8) return "Warm rom-com breeze from the relationship department 💞";
  if (deltas.children >= 8) return "High-pressure family hugs with snack gusts 🌱";
  return "Partly chaotic, clearing by next Monday 😵‍💫";
};

const createSeasonalSummary = ({ previousGame, nextState }) => {
  const startStats = previousGame.weekStartStats ?? captureStats(previousGame);
  const endStats = captureStats(nextState);
  const deltas = summaryStatKeys.reduce((stats, key) => ({ ...stats, [key]: endStats[key] - (startStats[key] ?? previousGame[key] ?? 0) }), {});
  const tone = getSummaryTone(deltas);
  const copy = summaryCopy[tone];

  return {
    id: `${previousGame.eventSeed}-${previousGame.month}-${Date.now()}`,
    month: previousGame.month,
    season: getSeasonForMonth(previousGame.month).label,
    age: previousGame.age,
    deltas,
    weather: getLifeWeather(deltas),
    ...copy
  };
};


const statScoreHumor = {
  wellbeing: {
    critical: "Your nervous system has requested a manager, a nap, and possibly a tiny parade.",
    low: "The vibes are running on low battery and one suspicious granola bar.",
    steady: "Stable enough to answer emails, not stable enough to read the comments section.",
    strong: "Basically a houseplant with boundaries: hydrated, thriving, mildly smug."
  },
  marriage: {
    critical: "The relationship meter is wearing a fake mustache and trying to leave town.",
    low: "Romance is buffering. Please stand by with snacks and one sincere apology.",
    steady: "Solid teammate energy: not fireworks, but nobody has rage-labeled the dishwasher.",
    strong: "Power-couple glow detected. Nearby calendars are asking for mentorship."
  },
  children: {
    critical: "Family bond is hiding under the couch with the missing socks.",
    low: "The kid connection needs a firmware update and probably more snacks.",
    steady: "The bond is holding. The snack economy remains cautiously optimistic.",
    strong: "Peak family glue. Even the couch crumbs feel emotionally supported."
  },
  wallet: {
    critical: "The budget goblin is awake, caffeinated, and holding a tiny clipboard.",
    low: "Wallet is making dial-up noises. Spend gently.",
    steady: "Money is behaving like a responsible adult, which is frankly suspicious.",
    strong: "Wallet has main-character posture. Try not to buy a decorative canoe."
  }
};

const getStatScoreHumor = (key, value) => statScoreHumor[key]?.[getStatBand(value)] ?? "This score contains multitudes and at least one spreadsheet.";

const getRecentStatDecisions = (gameState, statKey, limit = 6) => {
  const currentSeasonLabel = getSeasonForMonth(gameState.month).label;
  const currentSelections = Object.values(gameState.selectedChoices ?? {}).map((selection, index) => ({
    ...selection,
    id: `current-${selection.eventTitle ?? "decision"}-${selection.label ?? "choice"}-${index}`,
    seasonLabel: currentSeasonLabel,
    timing: "Current season"
  }));
  const historicalSelections = Object.entries(gameState.seasonHistory ?? {}).flatMap(([seasonId, selections]) => {
    const seasonLabel = seasonConfig.find((season) => season.id === seasonId)?.label ?? seasonId;

    return (selections ?? []).map((selection, index) => ({
      ...selection,
      id: selection.id ?? `${seasonId}-${selection.eventTitle ?? "decision"}-${selection.label ?? "choice"}-${index}`,
      seasonLabel,
      timing: "Previous season"
    }));
  });

  return [...historicalSelections, ...currentSelections]
    .filter((selection) => Number(sanitizeEffects(selection.effects)[statKey] ?? 0) !== 0)
    .slice(-limit)
    .reverse();
};

const formatSummaryDelta = (_key, value) => {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value}`;
};

const getGameOverReason = (game) => {
  if (game.wellbeing <= 0) return "Wellbeing hit zero. The run collapsed into a cautionary smoothie ad.";
  if (game.marriage <= 0) return "The relationship meter bottomed out. The couch has entered witness protection.";
  if (game.children <= 0) return "Family bond hit zero. The snack-based legacy needs a reboot.";
  if (game.wallet <= 0) return "Wallet hit zero. The budget goblin demanded a rematch.";
  return null;
};

const getLegacySkillBonuses = (legacy) => {
  const skills = legacy?.skills ?? createEmptySkills();

  return {
    wellbeing: Math.min(20, Math.floor(((skills.wellness ?? 0) + (skills.grit ?? 0)) / 3)),
    marriage: Math.min(20, Math.floor((skills.bonds ?? 0) / 2)),
    children: Math.min(20, Math.floor((skills.parenting ?? 0) / 2)),
    wallet: 0
  };
};

const getTotalLegacyBonuses = (legacy) => {
  const carriedStats = legacy?.carriedStats ?? createEmptyStats();
  const skillBonuses = getLegacySkillBonuses(legacy);

  return Object.fromEntries(summaryStatKeys.map((key) => [key, (carriedStats[key] ?? 0) + (skillBonuses[key] ?? 0)]));
};

const buildNextLegacy = (legacy, finalGame) => {
  const currentLegacy = normalizeLegacy(legacy);
  const runs = currentLegacy.runs + 1;
  const carryRate = getCarryRate(runs);
  const carriedStats = {
    wellbeing: Math.max(0, Math.round((finalGame.wellbeing ?? 0) * carryRate)),
    marriage: Math.max(0, Math.round((finalGame.marriage ?? 0) * carryRate)),
    children: Math.max(0, Math.round((finalGame.children ?? 0) * carryRate)),
    wallet: Math.max(0, Math.round((finalGame.wallet ?? 0) * carryRate))
  };
  const earnedSkills = {
    grit: Math.max(1, Math.round((finalGame.wellbeing ?? 0) * carryRate * 0.1)),
    wellness: Math.max(0, Math.round((finalGame.wellbeing ?? 0) * carryRate * 0.18)),
    bonds: Math.max(0, Math.round((finalGame.marriage ?? 0) * carryRate * 0.18)),
    parenting: Math.max(0, Math.round((finalGame.children ?? 0) * carryRate * 0.18))
  };

  return {
    runs,
    difficulty: getDifficultyMultiplier(runs),
    carryRate,
    carriedStats,
    skills: Object.fromEntries(
      Object.keys(legacySkillConfig).map((key) => [key, Math.min(99, (currentLegacy.skills?.[key] ?? 0) + earnedSkills[key])])
    ),
    lastRun: {
      age: finalGame.age,
      week: finalGame.week,
      stats: captureStats(finalGame),
      reason: finalGame.gameOverReason ?? getGameOverReason(finalGame)
    }
  };
};


const applyLegacyBonuses = (baseStats, legacy) => {
  const legacyBonuses = getTotalLegacyBonuses(legacy);

  return Object.fromEntries(summaryStatKeys.map((key) => [key, clamp((baseStats[key] ?? 0) + (legacyBonuses[key] ?? 0))]));
};

const scaleEffectsForDifficulty = (effects, difficulty = 1) =>
  Object.fromEntries(Object.entries(sanitizeEffects(effects)).map(([key, value]) => {
    const isBad = value < 0;
    const multiplier = isBad ? difficulty : Math.max(0.5, 1 - (difficulty - 1) * 0.35);
    return [key, Math.round(value * multiplier)];
  }));


const defaultStartingStats = {
  wellbeing: 70,
  marriage: 60,
  children: 35,
  wallet: 55
};

const createDefaultGame = () => ({
  age: 38,
  wellbeing: 80,
  marriage: 75,
  children: 35,
  wallet: 60,
  month: 1,
  year: new Date().getFullYear(),
  completedDecisions: [],
  selectedChoices: {},
  seasonHistory: createEmptySeasonHistory(),
  seasonScores: {},
  memories: [],
  currentEventId: getRandomEventId(undefined, events),
  eventSeed: createEventSeed(),
  weekStartStats: null,
  weeklySummary: null,
  gameOver: false,
  gameOverReason: null,
  legacy: createDefaultLegacy(),
  character: null,
  family: createEmptyFamily(),
  customEvents: [],
  initialized: false
});

const normalizeGame = (game) => ({
  ...createDefaultGame(),
  ...game,
  age: clamp(Number(game?.age ?? 25), 12, 100),
  wellbeing: clamp(Number(game?.wellbeing ?? ((Number(game?.health ?? 70) + (100 - Number(game?.stress ?? 30))) / 2))),
  marriage: clamp(Number(game?.marriage ?? 40)),
  children: clamp(Number(game?.children ?? 0)),
  wallet: clamp(Number(game?.wallet ?? 60)),
  month: clamp(Number(game?.month ?? 1), 1, 12),
  year: Number.isFinite(Number(game?.year)) ? Number(game.year) : new Date().getFullYear(),
  completedDecisions: Array.isArray(game?.completedDecisions) ? game.completedDecisions : [],
  selectedChoices: game?.selectedChoices && typeof game.selectedChoices === "object" && !Array.isArray(game.selectedChoices) ? game.selectedChoices : {},
  seasonHistory: { ...createEmptySeasonHistory(), ...(game?.seasonHistory && typeof game.seasonHistory === "object" && !Array.isArray(game.seasonHistory) ? game.seasonHistory : {}) },
  seasonScores: game?.seasonScores && typeof game.seasonScores === "object" && !Array.isArray(game.seasonScores) ? game.seasonScores : {},
  memories: Array.isArray(game?.memories) ? game.memories.slice(-8) : [],
  eventSeed: Number.isFinite(Number(game?.eventSeed)) ? Number(game.eventSeed) : createEventSeed(),
  weekStartStats: game?.weekStartStats && typeof game.weekStartStats === "object" ? game.weekStartStats : null,
  weeklySummary: game?.weeklySummary && typeof game.weeklySummary === "object" ? game.weeklySummary : null,
  gameOver: Boolean(game?.gameOver),
  gameOverReason: typeof game?.gameOverReason === "string" ? game.gameOverReason : null,
  legacy: normalizeLegacy(game?.legacy),
  character: game?.character && typeof game.character === "object" ? game.character : null,
  family: normalizeFamily(game?.family),
  customEvents: Array.isArray(game?.customEvents) ? game.customEvents.map((event) => ({ ...event, choices: (event.choices ?? []).map((choice) => ({ ...choice, effects: sanitizeEffects(choice.effects) })) })) : []
});


const ensureSpouse = (family, age) => {
  const normalizedFamily = normalizeFamily(family);
  const hasSpouse = Boolean(String(normalizedFamily.spouseAge ?? normalizedFamily.spouseSex ?? normalizedFamily.spouse ?? "").trim());

  if (hasSpouse) {
    return normalizedFamily;
  }

  return {
    ...normalizedFamily,
    spouseAge: String(age),
    spouseSex: ""
  };
};

const loadSavedGame = () => {
  if (typeof window === "undefined") {
    return createDefaultGame();
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? normalizeGame(JSON.parse(saved)) : createDefaultGame();
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return createDefaultGame();
  }
};

export default function App() {
  const [game, setGame] = useState(loadSavedGame);
  const [startAge, setStartAge] = useState(game.initialized ? game.age : 38);
  const [startSex, setStartSex] = useState(game.character?.sex ?? "");
  const [startingStats, setStartingStats] = useState(() => ({
    ...defaultStartingStats,
    wellbeing: game.initialized ? game.wellbeing : defaultStartingStats.wellbeing,
    marriage: game.initialized ? game.marriage : defaultStartingStats.marriage,
    children: game.initialized ? game.children : defaultStartingStats.children,
    wallet: game.initialized ? game.wallet : defaultStartingStats.wallet
  }));
  const [familyInput, setFamilyInput] = useState(() => normalizeFamily(game.family));
  const [customEventsText, setCustomEventsText] = useState("");
  const [customEventError, setCustomEventError] = useState("");
  const [activeDecisionContext, setActiveDecisionContext] = useState(null);
  const [activeStatKey, setActiveStatKey] = useState(null);
  const [simulationState, setSimulationState] = useState(createIdleSimulationState);
  const [seasonTransition, setSeasonTransition] = useState(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [familySidebarOpen, setFamilySidebarOpen] = useState(false);
  const [settings, setSettings] = useState(loadSavedSettings);
  const audioRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
    }
  }, [game]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }
  }, [settings]);

  useEffect(() => {
    if (!familySidebarOpen || typeof window === "undefined") {
      return undefined;
    }

    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setFamilySidebarOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [familySidebarOpen]);

  useEffect(() => () => stopZenMusic(false), []);

  useEffect(() => {
    if (audioRef.current?.master) {
      audioRef.current.master.gain.value = (settings.masterVolume / 100) * 0.09;
    }
  }, [settings.masterVolume]);

  const stopZenMusic = (updateState = true) => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    window.clearInterval(audio.chimeTimer);
    audio.nodes.forEach((node) => {
      node.stop?.();
      node.disconnect();
    });
    audio.context.close();
    audioRef.current = null;

    if (updateState) {
      setMusicPlaying(false);
    }
  };

  const startZenMusic = (seasonId = activeSeason.id) => {
    if (typeof window === "undefined" || audioRef.current) {
      return;
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) {
      return;
    }

    const config = getSeasonalAudioConfig(seasonId);
    const context = new AudioContext();
    const master = context.createGain();
    const padGain = context.createGain();
    const nodes = [];

    master.gain.value = (settings.masterVolume / 100) * 0.09;
    padGain.gain.value = config.padMix;
    padGain.connect(master);
    master.connect(context.destination);

    config.padFrequencies.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const voiceGain = context.createGain();

      oscillator.type = config.oscillatorTypes[index] ?? "sine";
      oscillator.frequency.value = frequency;
      voiceGain.gain.value = index === 0 ? 0.2 : 0.08;
      oscillator.connect(voiceGain);
      voiceGain.connect(padGain);
      oscillator.start();
      nodes.push(oscillator, voiceGain);
    });

    const playChime = () => {
      const now = context.currentTime;
      const oscillator = context.createOscillator();
      const chimeGain = context.createGain();
      const frequency = config.chimeFrequencies[Math.floor(Math.random() * config.chimeFrequencies.length)];

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, now);
      chimeGain.gain.setValueAtTime(0, now);
      chimeGain.gain.linearRampToValueAtTime(config.chimePeak, now + 0.08);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);
      oscillator.connect(chimeGain);
      chimeGain.connect(master);
      oscillator.onended = () => {
        oscillator.disconnect();
        chimeGain.disconnect();
      };
      oscillator.start(now);
      oscillator.stop(now + 3);
    };

    const chimeTimer = window.setInterval(playChime, config.chimeInterval);
    playChime();

    audioRef.current = { chimeTimer, context, master, nodes, seasonId };
    setMusicPlaying(true);
  };

  const toggleZenMusic = () => {
    if (musicPlaying) {
      stopZenMusic();
      return;
    }

    startZenMusic();
  };


  const startNewGame = (event) => {
    event?.preventDefault();
    const age = clamp(parseInt(startAge, 10) || 20, 12, 100);
    let customEvents = [];

    try {
      customEvents = settings.aiMadeEvents ? normalizeCustomEvents(customEventsText) : [];
      setCustomEventError("");
    } catch (error) {
      setCustomEventError(error.message);
      return;
    }

    const family = { ...ensureSpouse(familyInput, age), startAge: age, startMonth: 1 };

    const baseStats = applyLegacyBonuses({
      wellbeing: clamp(startingStats.wellbeing),
      marriage: clamp(startingStats.marriage),
      children: clamp(startingStats.children),
      wallet: clamp(startingStats.wallet)
    }, game.legacy);

    const newGame = {
      age,
      ...baseStats,
      month: 1,
      year: new Date().getFullYear(),
      week: 1,
      completedDecisions: [],
      selectedChoices: {},
      seasonHistory: createEmptySeasonHistory(),
      memories: ["You started a new life chapter.", getFamilySummary(family)].filter(Boolean),
      family,
      customEvents,
      currentEventId: getRandomEventId(undefined, [...events, ...customEvents].filter((eventItem) => isEventEligible(eventItem, { ...baseStats, age, month: 1, family }))),
      eventSeed: createEventSeed(),
      weeklySummary: null,
      gameOver: false,
      gameOverReason: null,
      legacy: normalizeLegacy(game.legacy),
      character: { name: "", sex: startSex.trim() },
      initialized: true
    };

    const initializedGame = {
      ...newGame,
      weekStartStats: captureStats(newGame)
    };

    setSimulationState(createIdleSimulationState());
    setGame(initializedGame);
    startZenMusic();
  };

  const resetGame = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    stopZenMusic();
    setSimulationState(createIdleSimulationState());
    setActiveStatKey(null);
    setGame(createDefaultGame());
    setStartAge(25);
    setFamilyInput(createEmptyFamily());
    setStartSex("");
    setCustomEventsText("");
    setCustomEventError("");
    setStartingStats({ ...defaultStartingStats });
  };

  const prepareNewGamePlus = () => {
    setActiveDecisionContext(null);
    setActiveStatKey(null);
    setFamilySidebarOpen(false);
    setSimulationState(createIdleSimulationState());
    setStartAge(25);
    setFamilyInput(createEmptyFamily());
    setStartSex("");
    setCustomEventsText("");
    setCustomEventError("");
    setStartingStats({ ...defaultStartingStats });
    setGame((prevGame) => ({ ...createDefaultGame(), legacy: normalizeLegacy(prevGame.legacy) }));
  };

  const currentCalendarYear = game.year;
  const playableEvents = useMemo(() => [...events, ...(settings.aiMadeEvents && Array.isArray(game.customEvents) ? game.customEvents : [])], [game.customEvents, settings.aiMadeEvents]);
  const activeSeason = getSeasonForMonth(game.month);

  useEffect(() => {
    if (!musicPlaying || audioRef.current?.seasonId === activeSeason.id) {
      return;
    }

    stopZenMusic(false);
    startZenMusic(activeSeason.id);
  }, [activeSeason.id, musicPlaying]);

  const seasonSchedule = useMemo(
    () => getSeasonSchedule(activeSeason, currentCalendarYear, game.eventSeed, game.age, playableEvents, game),
    [activeSeason, game, currentCalendarYear, playableEvents]
  );
  const seasonDecisions = useMemo(
    () => seasonSchedule.flatMap((day) => day.decisions.map((decision, decisionIndex) => ({ ...decision, day, decisionIndex }))),
    [seasonSchedule]
  );
  const totalSeasonDecisions = seasonDecisions.length;
  const selectedChoices = game.selectedChoices ?? {};
  const seasonHistory = { ...createEmptySeasonHistory(), ...(game.seasonHistory ?? {}) };
  const completedThisSeason = Object.keys(selectedChoices).length || game.completedDecisions.length;
  const pendingThisSeason = Math.max(0, totalSeasonDecisions - completedThisSeason);
  const legacy = normalizeLegacy(game.legacy);
  const totalLegacyBonuses = getTotalLegacyBonuses(legacy);
  const difficultyMultiplier = legacy.difficulty ?? getDifficultyMultiplier(legacy.runs ?? 0);
  const isSimulationLocked = simulationState.phase === "animating" || simulationState.phase === "unexpected" || simulationState.phase === "summary";
  useEffect(() => {
    document.body.dataset.season = activeSeason.id;
    return () => {
      delete document.body.dataset.season;
    };
  }, [activeSeason.id]);

  const finishRunIfNeeded = (nextState, prevGame) => {
    const gameOverReason = getGameOverReason(nextState);

    if (!gameOverReason) {
      return nextState;
    }

    const gameOverState = { ...nextState, gameOver: true, gameOverReason };
    const nextLegacy = buildNextLegacy(prevGame.legacy, gameOverState);

    return {
      ...gameOverState,
      legacy: nextLegacy,
      memories: [...(nextState.memories ?? []), `Run ${getRunNumber(prevGame.legacy)} ended: ${gameOverReason}`].slice(-8)
    };
  };

  const applyTalentModifiers = (baseState, effects) => {
    const talentId = baseState.character?.talent?.id;
    const nextEffects = { ...effects };

    if (talentId === "stress-armor" && nextEffects.wellbeing < 0) {
      nextEffects.wellbeing = Math.ceil(nextEffects.wellbeing * 0.75);
    }

    if (talentId === "iron-routine" && nextEffects.wellbeing > 0) {
      nextEffects.wellbeing += 2;
    }

    if (talentId === "npc-whisperer" && nextEffects.marriage > 0) {
      nextEffects.marriage += 2;
    }

    if (talentId === "family-glue" && nextEffects.children > 0) {
      nextEffects.children += 2;
    }

    if (talentId === "goblin-luck") {
      Object.entries(nextEffects).forEach(([key, value]) => {
        if (value <= -8) {
          nextEffects[key] = value + 2;
        }
      });
    }

    return nextEffects;
  };

  const applyEffects = (baseState, effects) => {
    const next = { ...baseState };
    Object.entries(sanitizeEffects(effects)).forEach(([key, value]) => {
      next[key] = (next[key] ?? 0) + value;
    });

    return {
      ...next,
      ...Object.fromEntries(summaryStatKeys.map((key) => [key, clamp(next[key])]))
    };
  };

  const resolveChoiceEffects = (baseState, effects, difficulty = 1) => {
    const adjustedEffects = scaleEffectsForDifficulty(effects, difficulty);
    return applyTalentModifiers(baseState, adjustedEffects);
  };

  const handleChoice = (choice, decision, dayName) => {
    if (isSimulationLocked) {
      return;
    }

    setGame((prevGame) => {
      const previousSelection = prevGame.selectedChoices?.[decision.key];
      const undoEffects = previousSelection
        ? Object.fromEntries(Object.entries(previousSelection.effects).map(([key, value]) => [key, -value]))
        : null;
      const stateBeforeChoice = undoEffects ? applyEffects(prevGame, undoEffects) : prevGame;
      const modifiedEffects = resolveChoiceEffects(stateBeforeChoice, choice.effects, prevGame.legacy?.difficulty ?? 1);
      const nextState = applyEffects(stateBeforeChoice, modifiedEffects);
      const selectedChoices = {
        ...(prevGame.selectedChoices ?? {}),
        [decision.key]: {
          dayName,
          eventTitle: decision.title,
          label: choice.label,
          effects: modifiedEffects,
          originalEffects: choice.effects,
          memory: choice.memory
        }
      };
      const completedDecisions = Object.keys(selectedChoices);
      const timestamp = `${getSeasonForMonth(prevGame.month).label}, ${dayName}, age ${prevGame.age}`;
      const memoryAction = previousSelection ? `changed ${decision.title} from ${previousSelection.label} to ${choice.label}` : choice.memory;

      const updatedGame = {
        ...nextState,
        completedDecisions,
        selectedChoices,
        currentEventId: getRandomEventId(prevGame.currentEventId, playableEvents),
        memories: [...prevGame.memories, `${timestamp}: ${memoryAction}`].slice(-8)
      };

      return finishRunIfNeeded({
        ...updatedGame,
        weekStartStats: prevGame.weekStartStats ?? captureStats(prevGame),
        weeklySummary: prevGame.weeklySummary
      }, prevGame);
    });
  };

  const handleAdvanceSeason = () => {
    if (isSimulationLocked || game.gameOver) {
      return;
    }

    const nextSeasonState = getNextSeasonState(game.month, game.age, game.year);
    const previewNextGame = {
      ...game,
      ...nextSeasonState,
      seasonHistory: updateSeasonHistory(game),
      seasonScores: updateSeasonScores(game),
      completedDecisions: [],
      selectedChoices: {},
      currentEventId: getRandomEventId(game.currentEventId, playableEvents),
      memories: [...game.memories, `${getSeasonForMonth(game.month).label} wrapped up. Your selected decisions are now part of your story.`].slice(-8)
    };
    setActiveDecisionContext(null);
    setActiveStatKey(null);
    setSeasonTransition({
      previousSeasonId: getSeasonForMonth(game.month).id,
      targetSeasonId: getSeasonForMonth(nextSeasonState.month).id,
      wisdom: getSeasonalFamilyWisdom(previewNextGame, game, nextSeasonState.month)
    });
    setGame((prevGame) => {
      const seasonHistory = updateSeasonHistory(prevGame);
      const seasonScores = updateSeasonScores(prevGame);
      const nextGame = {
        ...prevGame,
        ...nextSeasonState,
        seasonHistory,
        seasonScores,
        completedDecisions: [],
        selectedChoices: {},
        currentEventId: getRandomEventId(prevGame.currentEventId, playableEvents),
        memories: [...prevGame.memories, `${getSeasonForMonth(prevGame.month).label} wrapped up. Your selected decisions are now part of your story.`].slice(-8)
      };

      return nextGame;
    });
  };

  const handleSimulateSeason = () => {
    if (isSimulationLocked || game.gameOver) {
      return;
    }

    setActiveDecisionContext(null);
    setActiveStatKey(null);

    const schedule = getSeasonSchedule(activeSeason, currentCalendarYear, game.eventSeed, game.age, playableEvents, game);
    let nextState = game;
    const steps = [];
    const simulatedMemories = [];

    schedule.forEach((day, dayIndex) => {
      const randomDayResults = [];

      day.decisions.forEach((decision, decisionIndex) => {
        const selectedChoice = game.selectedChoices?.[decision.key];

        if (selectedChoice) {
          steps.push({
            key: `${decision.key}-selected`,
            dayLabel: day.dayLabel,
            eventTitle: decision.title,
            choiceLabel: selectedChoice.label,
            choiceSource: "Selected",
            effects: selectedChoice.effects,
            visual: decision.visual,
            severity: decision.severity
          });
          return;
        }

        const choice = getRandomChoice(game.eventSeed, day.month, dayIndex, decisionIndex, decision.choices);
        const modifiedEffects = resolveChoiceEffects(nextState, choice.effects, game.legacy?.difficulty ?? 1);
        nextState = applyEffects(nextState, modifiedEffects);
        steps.push({
          key: `${decision.key}-random`,
          dayLabel: day.dayLabel,
          eventTitle: decision.title,
          choiceLabel: choice.label,
          choiceSource: "Random",
          effects: modifiedEffects,
          visual: decision.visual,
          severity: decision.severity
        });
        randomDayResults.push(`${decision.title}: ${choice.label}`);
      });

      if (randomDayResults.length > 0) {
        simulatedMemories.push(`${activeSeason.label}, ${day.dayLabel}, age ${game.age}: Went with the flow (${randomDayResults.join("; ")}).`);
      }
    });

    const unexpectedEvent = getUnexpectedEventForMonth(game.eventSeed, game.month, currentCalendarYear, nextState, settings);
    let unexpectedStep = null;

    if (unexpectedEvent) {
      const modifiedEffects = resolveChoiceEffects(nextState, unexpectedEvent.effects, game.legacy?.difficulty ?? 1);
      nextState = applyEffects(nextState, modifiedEffects);
      unexpectedStep = {
        key: `unexpected-${unexpectedEvent.id ?? unexpectedEvent.title}`,
        dayLabel: "Surprise",
        eventTitle: unexpectedEvent.title,
        choiceLabel: "Life happens",
        choiceSource: "Unexpected",
        effects: modifiedEffects,
        visual: unexpectedEvent.visual,
        severity: unexpectedEvent.severity,
        description: unexpectedEvent.description
      };
      simulatedMemories.push(`${activeSeason.label}, age ${game.age}: ${unexpectedEvent.memory}`);
    }

    if (steps.length === 0 && !unexpectedStep) {
      steps.push({
        key: `quiet-${game.eventSeed}-${activeSeason.id}`,
        dayLabel: `${activeSeason.label} wrap-up`,
        eventTitle: "Quiet Season",
        choiceLabel: "No major loose ends needed attention.",
        choiceSource: "Quiet",
        effects: {},
        visual: { icon: "🌙", accent: "blue", label: "Calm" },
        severity: "minor"
      });
      simulatedMemories.push(`${activeSeason.label}, age ${game.age}: The season stayed unusually calm.`);
    }

    const nextSeasonState = getNextSeasonState(game.month, game.age, game.year);
    const advancedGameBase = {
      ...nextState,
      ...nextSeasonState,
      seasonHistory: updateSeasonHistory(nextState),
      seasonScores: updateSeasonScores(game, nextState),
      completedDecisions: [],
      selectedChoices: {},
      currentEventId: getRandomEventId(game.currentEventId, playableEvents),
      memories: [...game.memories, ...simulatedMemories].slice(-8)
    };
    const monthlySummary = createSeasonalSummary({ previousGame: game, nextState });
    const finalGame = finishRunIfNeeded({
      ...advancedGameBase,
      weekStartStats: captureStats(advancedGameBase),
      weeklySummary: monthlySummary
    }, game);

    setSimulationState({
      phase: steps.length > 0 ? "animating" : "unexpected",
      steps,
      currentIndex: 0,
      unexpectedEvent: unexpectedStep,
      summary: { finalGame, monthlySummary }
    });
  };


  useEffect(() => {
    if (simulationState.phase !== "animating") {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      if (simulationState.currentIndex < simulationState.steps.length - 1) {
        setSimulationState((prevSimulationState) => ({
          ...prevSimulationState,
          currentIndex: prevSimulationState.currentIndex + 1
        }));
        return;
      }

      if (simulationState.unexpectedEvent) {
        setSimulationState((prevSimulationState) => ({
          ...prevSimulationState,
          phase: "unexpected"
        }));
        return;
      }

      setSimulationState((prevSimulationState) => ({
        ...prevSimulationState,
        phase: "summary"
      }));
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [simulationState]);

  const handleUnexpectedOkay = () => {
    setSimulationState((prevSimulationState) => ({
      ...prevSimulationState,
      phase: "summary"
    }));
  };

  const closeSummaryModal = () => {
    const finalGame = simulationState.summary?.finalGame;

    if (finalGame) {
      setGame(finalGame);
      setSeasonTransition({
        previousSeasonId: getSeasonForMonth(game.month).id,
        targetSeasonId: getSeasonForMonth(finalGame.month).id,
        wisdom: getSeasonalFamilyWisdom(finalGame, game, finalGame.month, activeMonthlySummary?.deltas)
      });
    }
    setSimulationState(createIdleSimulationState());
  };

  const closeDecisionModal = useCallback(() => setActiveDecisionContext(null), []);
  const closeStatModal = useCallback(() => setActiveStatKey(null), []);

  useEffect(() => {
    if ((!activeDecisionContext && !activeStatKey) || typeof window === "undefined") {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeDecisionModal();
        closeStatModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeDecisionContext, activeStatKey, closeDecisionModal, closeStatModal]);

  const renderEffectPreview = (effects) => {
    const adjustedEffects = scaleEffectsForDifficulty(effects, difficultyMultiplier);

    return (
    <span className="choice-effects" aria-label="Choice effects">
      {getDisplayEffectEntries(adjustedEffects).map(([key, value]) => (
        <span className={value >= 0 ? "effect positive" : "effect negative"} key={key}>
          {displayStatConfig[key]?.label ?? statConfig[key]?.label ?? key} {value > 0 ? "+" : ""}{value}
        </span>
      ))}
    </span>
    );
  };

  const renderSimulationEffects = (effects) => (
    <span className="choice-effects simulation-effects" aria-label="Simulation stat changes">
      {getDisplayEffectEntries(effects).map(([key, value]) => (
        <span className={value >= 0 ? "effect positive" : "effect negative"} key={key}>
          {displayStatConfig[key]?.label ?? statConfig[key]?.label ?? key} {value > 0 ? "+" : ""}{value}
        </span>
      ))}
    </span>
  );

  const renderSummaryDelta = (key, value) => {
    const config = displayStatConfig[key] ?? statConfig[key];
    const isGoodChange = value >= 0;

    return (
      <span className={`summary-delta ${isGoodChange ? "positive" : "negative"}`} key={key}>
        <span aria-hidden="true">{config?.icon}</span>
        <strong>{config?.label ?? key}</strong>
        <em>{formatSummaryDelta(key, value)}</em>
      </span>
    );
  };

  const currentSimulationStep = simulationState.phase === "unexpected"
    ? simulationState.unexpectedEvent
    : simulationState.steps[simulationState.currentIndex];
  const activeMonthlySummary = simulationState.phase === "summary"
    ? simulationState.summary?.monthlySummary ?? simulationState.summary?.finalGame?.weeklySummary
    : null;
  const activeStatDetails = activeStatKey && displayStatConfig[activeStatKey]
    ? {
      key: activeStatKey,
      config: displayStatConfig[activeStatKey],
      value: getDisplayStatValue(game, activeStatKey),
      decisions: getRecentStatDecisions(game, activeStatKey)
    }
    : null;
  const settingsModal = (
    <Setting
      customEventError={customEventError}
      customEventsText={customEventsText}
      isOpen={settingsOpen}
      musicPlaying={musicPlaying}
      onClose={() => setSettingsOpen(false)}
      onResetGame={resetGame}
      onSetCustomEventsText={setCustomEventsText}
      onSettingsChange={(nextSettings) => setSettings(normalizeSettings(nextSettings))}
      onToggleMusic={toggleZenMusic}
      settings={settings}
    />
  );

  if (game.gameOver) {
    return (
      <>
      <SeasonBackground seasonId={activeSeason.id} />
      {settingsModal}
      <main className="app-shell game-over-shell">
        <section className="panel game-over-card">
          <h1>New Game+ unlocked</h1>
          <p className="subtitle">{game.gameOverReason}</p>
          <div className="legacy-meta-grid">
            <span><strong>{Math.round((legacy.carryRate ?? 0) * 100)}%</strong> Carryover rate</span>
          </div>
          <div className="legacy-stat-grid" aria-label="Total New Game Plus bonuses">
            {displayStatKeys.map((key) => (
              <article key={key}>
                <span>{displayStatConfig[key].icon}</span>
                <strong>{displayStatConfig[key].label}</strong>
                <em>{formatSummaryDelta(key, getDisplayDeltaValue(totalLegacyBonuses, key))}</em>
                <small>carryover</small>
              </article>
            ))}
          </div>
          <div className="actions">
            <button onClick={prepareNewGamePlus}>Start New Game+</button>
            <button type="button" className="secondary" onClick={() => setSettingsOpen(true)}>⚙️ Settings</button>
            <button type="button" className="secondary" onClick={resetGame}>Wipe Legacy</button>
          </div>
        </section>
      </main>
      </>
    );
  }

  if (!game.initialized) {
    return (
      <>
      <SeasonBackground seasonId={activeSeason.id} />
      {settingsModal}
      <StartScreen
        familyInput={familyInput}
        onStartGame={startNewGame}
        setFamilyInput={setFamilyInput}
        setStartingStats={setStartingStats}
        setStartAge={setStartAge}
        setStartSex={setStartSex}
        startAge={startAge}
        startSex={startSex}
        startingStats={startingStats}
        statConfig={statConfig}
      />
      </>
    );
  }

  return (
    <>
    <SeasonBackground seasonId={activeSeason.id} />
    <main className="app-shell">
      {settingsModal}
      {seasonTransition ? (
        <SeasonTransition
          previousSeasonId={seasonTransition.previousSeasonId}
          targetSeasonId={seasonTransition.targetSeasonId}
          wisdom={seasonTransition.wisdom}
          onComplete={() => setSeasonTransition(null)}
        />
      ) : null}
      <header className="topbar">
        <div>
          <p className="eyebrow">{activeSeason.label} · {getSeasonMonthNames(activeSeason)} · Age {game.age}</p>
          <h1><span className="brand-lockup"><img src={`${import.meta.env.BASE_URL}life-map-logo.svg`} alt="" aria-hidden="true" /><span>Life Map</span></span></h1>
          <div className="active-character">
            <span>👨‍👩‍👧‍👦</span>
            <div>
              <strong>Your family</strong>
              <small>{getFamilySummary(game.family)}</small>
            </div>
          </div>
        </div>
        <div className="topbar-actions">
          <button
            className="secondary family-sidebar-toggle"
            type="button"
            aria-controls="family-sidebar"
            aria-expanded={familySidebarOpen}
            onClick={() => {
              setFamilySidebarOpen(true);
            }}
          >
            <span aria-hidden="true">👨‍👩‍👧‍👦</span>
            Family View
          </button>
          <button className="secondary music-toggle" aria-label={musicPlaying ? "Music playing" : "Music paused"} onClick={() => setSettingsOpen(true)}>
            <span aria-hidden="true">{musicPlaying ? "🎵" : "🔇"}</span>
            Settings
          </button>
          <button className="secondary" onClick={resetGame}>Restart Setup</button>
        </div>
      </header>

      <section className="bottom-turn-hud" aria-label="Life stats and season controls">
        <div className="bottom-stat-strip">
          <section className="stat-grid" aria-label="Current life stats">
            {displayStatKeys.map((key) => {
              const config = displayStatConfig[key];
              const value = getDisplayStatValue(game, key);
              const normalizedValue = config.max ? clamp(value, 0, config.max) : null;
              const percentage = config.max ? `${normalizedValue}%` : null;
              const severity = getStatSeverity(value, config);
              const alert = severityCopy[severity];
              const ringFill = config.max ? `${normalizedValue * 3.6}deg` : "360deg";

              return (
                <button
                  aria-haspopup="dialog"
                  aria-label={`Open ${config.label} details: current score ${config.formatter ? config.formatter(value) : value}`}
                  className={`stat-card stat-card-button stat-${key} ${severity ? `severity-${severity}` : ""}`}
                  key={key}
                  onClick={() => setActiveStatKey(key)}
                  style={{ "--stat-accent": config.accent, "--stat-glow": config.glow, "--stat-fill": ringFill }}
                  type="button"
                >
                  <div className="stat-orb" aria-hidden="true">
                    <span className="stat-icon">{config.icon}</span>
                  </div>
                  <div className="stat-readout">
                    <span className="stat-signal">{config.signal}</span>
                    <span className="stat-label">{config.label}</span>
                    <strong>{config.formatter ? config.formatter(value) : value}</strong>
                  </div>
                  {alert ? (
                    <div className={`stat-alert ${severity === "warning" ? "warning" : ""}`} aria-label={`${config.label} needs ${severity === "critical" ? "urgent attention" : "attention"}`}>
                      <span aria-hidden="true">{alert.icon}</span>
                      {alert.label}
                    </div>
                  ) : null}
                  <div className={`meter ${config.tone}`} aria-hidden="true">
                    <span style={{ width: percentage }} />
                  </div>
                  <span className="stat-open-cue" aria-hidden="true">Details ↗</span>
                </button>
              );
            })}
          </section>
        </div>
        <button className="next-turn-button" onClick={handleSimulateSeason} disabled={isSimulationLocked}>▶ Simulate Season</button>
      </section>

      <div className="game-layout">
        <SeasonGameBoard
          activeSeason={activeSeason}
          completedDecisions={game.completedDecisions}
          completedThisSeason={completedThisSeason}
          getSeasonMonthNames={getSeasonMonthNames}
          isSimulationLocked={isSimulationLocked}
          onOpenDecision={setActiveDecisionContext}
          pendingThisSeason={pendingThisSeason}
          seasonConfig={seasonConfig}
          seasonDecisions={seasonDecisions}
          seasonHistory={seasonHistory}
          seasonScores={game.seasonScores}
          selectedChoices={selectedChoices}
          year={game.year}
          severityConfig={severityConfig}
          statConfig={displayStatConfig}
          totalSeasonDecisions={totalSeasonDecisions}
        />

        {familySidebarOpen ? (
          <button
            className="sidebar-backdrop"
            type="button"
            aria-label="Close sidebar"
            onClick={() => {
              setFamilySidebarOpen(false);
            }}
          />
        ) : null}
        <aside
          className={`side-stack game-sidebar family-sidebar ${familySidebarOpen ? "open" : ""}`}
          id="family-sidebar"
          aria-label="Family and recap sidebar"
          aria-hidden={!familySidebarOpen}
        >
          <div className="sidebar-header">
            <div>
              <p className="eyebrow">Family view</p>
              <h2>Your household</h2>
            </div>
            <button className="secondary sidebar-close" type="button" onClick={() => setFamilySidebarOpen(false)}>Close</button>
          </div>
          <FamilyPhoto family={game.family} currentAge={game.age} currentMonth={game.month} character={game.character} />
          {game.weeklySummary ? (
            <section className="panel monthly-summary-card compact-summary-card" aria-live="polite">
              <div className="section-heading summary-heading">
                <div>
                  <p className="eyebrow">Last recap</p>
                  <h2>{game.weeklySummary.season}</h2>
                </div>
                <span>{game.weeklySummary.mood}</span>
              </div>
              <p>{game.weeklySummary.headline}</p>
            </section>
          ) : null}
        </aside>
      </div>

      {currentSimulationStep && (simulationState.phase === "animating" || simulationState.phase === "unexpected") ? (
        <div className="simulation-modal-backdrop" aria-live="polite">
          <section
            className={`simulation-modal severity-card-${currentSimulationStep.severity ?? "minor"} accent-${currentSimulationStep.visual?.accent ?? "blue"}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="simulation-modal-title"
          >
            <div className="simulation-modal-header">
              <div className="decision-title">
                <span className="mini-icon" aria-hidden="true">{currentSimulationStep.visual?.icon ?? "🎲"}</span>
                <span>
                  <small>{simulationState.phase === "unexpected" ? "Unexpected event" : `Simulated day · ${currentSimulationStep.dayLabel}`}</small>
                  <h2 id="simulation-modal-title">{currentSimulationStep.eventTitle}</h2>
                </span>
              </div>
              <span className={`simulation-source source-${currentSimulationStep.choiceSource?.toLowerCase() ?? "random"}`}>
                {currentSimulationStep.choiceSource}
              </span>
            </div>
            {currentSimulationStep.description ? <p>{currentSimulationStep.description}</p> : null}
            <div className="simulation-choice-card">
              <span>{simulationState.phase === "unexpected" ? "Only response" : currentSimulationStep.choiceSource === "Selected" ? "Your planned choice" : currentSimulationStep.choiceSource === "Random" ? "Auto-resolved choice" : "Outcome"}</span>
              <strong>{simulationState.phase === "unexpected" ? "Okay" : currentSimulationStep.choiceLabel}</strong>
            </div>
            <div className="simulation-stat-changes">
              <span>Stat changes</span>
              {Object.keys(currentSimulationStep.effects ?? {}).length > 0 ? renderSimulationEffects(currentSimulationStep.effects) : <p>No stat changes this season.</p>}
            </div>
            {simulationState.phase === "unexpected" ? (
              <button className="next-turn-button" type="button" onClick={handleUnexpectedOkay}>Okay</button>
            ) : (
              <div className="simulation-progress" aria-label="Simulation progress">
                <span>Step {simulationState.currentIndex + 1} of {simulationState.steps.length}</span>
                <div><span style={{ width: `${simulationState.steps.length > 0 ? ((simulationState.currentIndex + 1) / simulationState.steps.length) * 100 : 100}%` }} /></div>
              </div>
            )}
          </section>
        </div>
      ) : null}

      {activeMonthlySummary ? (
        <div className="decision-modal-backdrop">
          <section
            className="decision-modal monthly-summary-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="monthly-summary-modal-title"
          >
            <div className="summary-confetti" aria-hidden="true">
              <span>{activeMonthlySummary.mood}</span>
              <span>🌿</span>
              <span>👛</span>
            </div>
            <div className="section-heading summary-heading">
              <div>
                <p className="eyebrow">Seasonal summary</p>
                <h2 id="monthly-summary-modal-title">{activeMonthlySummary.season}</h2>
              </div>
              <span>Age {activeMonthlySummary.age}</span>
            </div>
            <div className="summary-hero">
              <span className="summary-mascot" aria-hidden="true">{activeMonthlySummary.mood}</span>
              <div>
                <h3>{activeMonthlySummary.headline}</h3>
                <p>{activeMonthlySummary.joke}</p>
              </div>
            </div>
            <div className="summary-weather">
              <span>Life weather</span>
              <strong>{activeMonthlySummary.weather}</strong>
            </div>
            <div className="summary-deltas" aria-label="Seasonal stat changes">
              {displayStatKeys.map((key) => renderSummaryDelta(key, getDisplayDeltaValue(activeMonthlySummary.deltas, key)))}
            </div>
            <button className="next-turn-button" type="button" onClick={closeSummaryModal}>Continue</button>
          </section>
        </div>
      ) : null}

      {activeStatDetails ? (
        <div
          className="decision-modal-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeStatModal();
            }
          }}
        >
          <section
            className="decision-modal stat-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="stat-detail-modal-title"
            style={{ "--stat-accent": activeStatDetails.config.accent, "--stat-glow": activeStatDetails.config.glow }}
          >
            <div className="decision-modal-header stat-detail-header">
              <div className="decision-title">
                <span className="mini-icon" aria-hidden="true">{activeStatDetails.config.icon}</span>
                <span>
                  <small>{activeStatDetails.config.signal}</small>
                  <h2 id="stat-detail-modal-title">{activeStatDetails.config.label}</h2>
                </span>
              </div>
              <button
                className="decision-modal-close"
                type="button"
                aria-label="Close stat details"
                onClick={closeStatModal}
              >
                ×
              </button>
            </div>
            <div className="stat-detail-score">
              <span>Current score</span>
              <strong>{activeStatDetails.config.formatter ? activeStatDetails.config.formatter(activeStatDetails.value) : activeStatDetails.value}</strong>
              <p>{getStatScoreHumor(activeStatDetails.key, activeStatDetails.value)}</p>
            </div>
            <div className="stat-detail-decisions">
              <div className="stat-detail-section-heading">
                <span>Recent decisions affecting this score</span>
                <small>{activeStatDetails.decisions.length} found</small>
              </div>
              {activeStatDetails.decisions.length > 0 ? activeStatDetails.decisions.map((selection) => {
                const effectValue = sanitizeEffects(selection.effects)[activeStatDetails.key] ?? 0;

                return (
                  <article className="stat-detail-decision" key={selection.id}>
                    <div>
                      <span>{selection.seasonLabel} · {selection.dayName ?? selection.timing}</span>
                      <strong>{selection.eventTitle}</strong>
                      <small>{selection.label}</small>
                    </div>
                    <em className={effectValue >= 0 ? "positive" : "negative"}>{effectValue > 0 ? "+" : ""}{effectValue}</em>
                  </article>
                );
              }) : (
                <p className="stat-detail-empty">No recent choices have moved this stat yet. It is either peaceful or plotting a subplot.</p>
              )}
            </div>
          </section>
        </div>
      ) : null}

      {activeDecisionContext ? (() => {
        const { decision, dayLabel } = activeDecisionContext;
        const selectedChoice = selectedChoices[decision.key];
        const lockedLegacyChoice = !selectedChoice && game.completedDecisions.includes(decision.key);
        const modalTitleId = `decision-modal-title-${decision.key}`;

        return (
          <div
            className="decision-modal-backdrop"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                closeDecisionModal();
              }
            }}
          >
            <section
              className={`decision-modal severity-card-${decision.severity} accent-${decision.visual.accent}`}
              role="dialog"
              aria-modal="true"
              aria-labelledby={modalTitleId}
            >
              <div className="decision-modal-header">
                <div className="decision-title">
                  <span className="mini-icon" aria-hidden="true">{decision.visual.icon}</span>
                  <span>
                    <small>{decision.visual.label} · {dayLabel}</small>
                    <h2 id={modalTitleId}>{decision.title}</h2>
                  </span>
                </div>
                <button
                  className="decision-modal-close"
                  type="button"
                  aria-label="Close decision details"
                  onClick={closeDecisionModal}
                >
                  ×
                </button>
              </div>

              <div className="decision-details">
                <p>{decision.description}</p>
                {selectedChoice ? (
                  <div className="selected-summary" aria-live="polite">
                    <span>Selected</span>
                    <strong>{selectedChoice.label}</strong>
                    <small>Pick another option below to change this decision.</small>
                  </div>
                ) : null}
                <div className="decision-options">
                  {decision.choices.map((choice) => {
                    const isSelected = selectedChoice?.label === choice.label;
                    return (
                      <button
                        className={`option-button ${isSelected ? "selected" : ""}`}
                        disabled={lockedLegacyChoice || isSimulationLocked}
                        key={choice.label}
                        onClick={() => {
                          handleChoice(choice, decision, dayLabel);
                          closeDecisionModal();
                        }}
                      >
                        <span className="choice-label-row">
                          <strong>{choice.label}</strong>
                          {isSelected ? <span className="selected-pill">Selected</span> : null}
                        </span>
                        {renderEffectPreview(choice.effects)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        );
      })() : null}
    </main>
    </>
  );
}
