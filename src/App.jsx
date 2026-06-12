import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import events from "./data/events.js";
import unexpectedEventRecords from "./data/unexpected_events.json";
import StartScreen from "./components/StartScreen.jsx";
import SeasonTransition from "./components/SeasonTransition.jsx";
import { countFamilyNames, createEmptyFamily, getFamilySummary, normalizeFamily } from "./game/family.js";

const STORAGE_KEY = "life-map-game";
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

const statConfig = {
  wellbeing: { label: "Wellbeing", icon: "🌿", max: 100, tone: "good", accent: "#34d399", glow: "rgba(52, 211, 153, 0.34)", signal: "Health + calm" },
  marriage: { label: "Relationship", icon: "💞", max: 100, tone: "good", accent: "#fb7185", glow: "rgba(251, 113, 133, 0.34)", signal: "Connection" },
  children: { label: "Family bond", icon: "🌱", max: 100, tone: "good", accent: "#22d3ee", glow: "rgba(34, 211, 238, 0.3)", signal: "Home base" },
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

const getAgePriorityTags = (age) => {
  if (age >= 35 && age <= 45) {
    return ["young-family", "eldercare", "midlife"];
  }
  return ["general"];
};

const getAgeRelevantEvents = (age, eventList = events, gameState = null) => {
  const priorityTags = getAgePriorityTags(age);
  const scheduledEvents = eventList.filter((event) => !event.surprise && isEventConditionMet(event, gameState));
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
const getNextSeasonState = (month, age) => {
  const seasonIndex = getSeasonIndexForMonth(month);
  const nextSeason = seasonConfig[(seasonIndex + 1) % seasonConfig.length];
  const nextMonth = nextSeason.months[0];

  return {
    age: nextMonth <= month ? age + 1 : age,
    month: nextMonth,
    week: nextMonth
  };
};

const RANDOM_EVENT_CHANCE = 0.067;
const UNEXPECTED_EVENT_CHANCE = 0.093;
const surpriseEvents = unexpectedEventRecords.map((event) => ({
  ...event,
  effects: sanitizeEffects(event.effects),
  severity: getSeverity(event),
  visual: { icon: event.icon ?? "✨", accent: event.accent ?? "blue", label: event.category ?? "Unexpected" }
}));
const getUnexpectedEventForMonth = (eventSeed, month, year, gameState) => {
  const eligibleSurpriseEvents = surpriseEvents.filter((event) => isEventConditionMet(event, gameState));

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
  const eventPool = getAgeRelevantEvents(age, eventList, gameState);
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

const summaryCopy = {
  chaos: {
    mood: "🔥",
    headline: "Your calendar chose violence",
    joke: "Stress went up so fast it probably needs its own zip code.",
    award: "Certified Chaos Goblin Week"
  },
  glow: {
    mood: "💪",
    headline: "Suspiciously responsible behavior",
    joke: "Health improved. Your couch has filed a missing person report.",
    award: "Unexpectedly Functional Adult"
  },
  romance: {
    mood: "💞",
    headline: "Main character relationship arc",
    joke: "The relationship meter blushed. Extremely unprofessional.",
    award: "Rom-Com Side Quest Complete"
  },
  family: {
    mood: "🌱",
    headline: "Family bond power-up",
    joke: "The kids may remember this fondly, pending snack availability.",
    award: "Snack-Based Legacy Builder"
  },
  legend: {
    mood: "🏆",
    headline: "Tiny wins, suspicious vibes",
    joke: "Nothing exploded, which experts are calling personal growth.",
    award: "Least Unhinged Week"
  },
  survived: {
    mood: "😵‍💫",
    headline: "You made it through somehow",
    joke: "No one knows how, but the week has legally ended.",
    award: "Emotional Support Calendar Needed"
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

const createSeasonalSummary = ({ previousGame, nextState, highlights = [] }) => {
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
    highlights: highlights.slice(-3),
    weather: getLifeWeather(deltas),
    ...copy
  };
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


const createDefaultGame = () => ({
  age: 38,
  wellbeing: 80,
  marriage: 75,
  children: 35,
  wallet: 60,
  month: 1,
  completedDecisions: [],
  selectedChoices: {},
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
  completedDecisions: Array.isArray(game?.completedDecisions) ? game.completedDecisions : [],
  selectedChoices: game?.selectedChoices && typeof game.selectedChoices === "object" && !Array.isArray(game.selectedChoices) ? game.selectedChoices : {},
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
  const [quiz, setQuiz] = useState({
    exercise: "sometimes",
    stableJob: "no",
    social: "weak"
  });
  const [familyInput, setFamilyInput] = useState(() => normalizeFamily(game.family));
  const [customEventsText, setCustomEventsText] = useState("");
  const [customEventError, setCustomEventError] = useState("");
  const [activeDecisionContext, setActiveDecisionContext] = useState(null);
  const [simulationState, setSimulationState] = useState(createIdleSimulationState);
  const [seasonTransition, setSeasonTransition] = useState(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
    }
  }, [game]);

  useEffect(() => () => stopZenMusic(false), []);

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

  const startZenMusic = () => {
    if (typeof window === "undefined" || audioRef.current) {
      return;
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) {
      return;
    }

    const context = new AudioContext();
    const master = context.createGain();
    const padGain = context.createGain();
    const nodes = [];
    const padFrequencies = [174, 261.63, 329.63, 392];

    master.gain.value = 0.05;
    padGain.gain.value = 0.18;
    padGain.connect(master);
    master.connect(context.destination);

    padFrequencies.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const voiceGain = context.createGain();

      oscillator.type = index % 2 === 0 ? "sine" : "triangle";
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
      const frequencies = [523.25, 587.33, 659.25, 783.99, 880];
      const frequency = frequencies[Math.floor(Math.random() * frequencies.length)];

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, now);
      chimeGain.gain.setValueAtTime(0, now);
      chimeGain.gain.linearRampToValueAtTime(0.18, now + 0.08);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);
      oscillator.connect(chimeGain);
      chimeGain.connect(master);
      oscillator.start(now);
      oscillator.stop(now + 3);
    };

    const chimeTimer = window.setInterval(playChime, 5400);
    playChime();

    audioRef.current = { chimeTimer, context, nodes };
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
      customEvents = normalizeCustomEvents(customEventsText);
      setCustomEventError("");
    } catch (error) {
      setCustomEventError(error.message);
      return;
    }

    const family = normalizeFamily(familyInput);
    const kidsCount = countFamilyNames(family.kids);
    const hasSpouse = countFamilyNames(family.spouse) > 0;
    const extendedFamilyCount = countFamilyNames(family.grandparents) + countFamilyNames(family.greatGrandparents);

    let wellbeing = 70;
    let marriage = hasSpouse ? 60 : 40;
    let children = kidsCount > 0 ? 35 + kidsCount * 12 : 10;
    let wallet = 55;

    if (quiz.exercise === "regularly") {
      wellbeing += 12;
    } else if (quiz.exercise === "never") {
      wellbeing -= 12;
    }

    if (quiz.stableJob === "yes") {
      wallet += 20;
      marriage += 5;
    } else {
      wallet -= 12;
      wellbeing -= 6;
    }

    if (quiz.social === "strong") {
      marriage += 30;
      children += 20;
      wellbeing += 5;
    } else {
      marriage -= 10;
      wellbeing -= 5;
    }

    if (hasSpouse) marriage += 10;
    if (kidsCount > 0) wellbeing -= Math.min(8, kidsCount * 2);
    if (extendedFamilyCount > 0) children += Math.min(12, extendedFamilyCount * 2);

    if (age >= 25 && age <= 40) marriage += 10;

    const baseStats = applyLegacyBonuses({
      wellbeing: clamp(wellbeing),
      marriage: clamp(marriage),
      children: clamp(children),
      wallet: clamp(wallet)
    }, game.legacy);

    const newGame = {
      age,
      ...baseStats,
      month: 1,
      week: 1,
      completedDecisions: [],
      selectedChoices: {},
      memories: ["You started a new life chapter.", getFamilySummary(family)].filter(Boolean),
      family,
      customEvents,
      currentEventId: getRandomEventId(undefined, [...events, ...customEvents].filter((eventItem) => isEventConditionMet(eventItem, baseStats))),
      eventSeed: createEventSeed(),
      weeklySummary: null,
      gameOver: false,
      gameOverReason: null,
      legacy: normalizeLegacy(game.legacy),
      character: null,
      initialized: true
    };

    setSimulationState(createIdleSimulationState());
    setGame({
      ...newGame,
      weekStartStats: captureStats(newGame)
    });
    startZenMusic();
  };

  const resetGame = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    stopZenMusic();
    setSimulationState(createIdleSimulationState());
    setGame(createDefaultGame());
    setStartAge(25);
    setFamilyInput(createEmptyFamily());
    setCustomEventsText("");
    setCustomEventError("");
    setQuiz({ exercise: "sometimes", stableJob: "no", social: "weak" });
  };

  const prepareNewGamePlus = () => {
    setActiveDecisionContext(null);
    setSimulationState(createIdleSimulationState());
    setStartAge(25);
    setFamilyInput(createEmptyFamily());
    setCustomEventsText("");
    setCustomEventError("");
    setQuiz({ exercise: "sometimes", stableJob: "no", social: "weak" });
    setGame((prevGame) => ({ ...createDefaultGame(), legacy: normalizeLegacy(prevGame.legacy) }));
  };

  const currentCalendarYear = useMemo(() => new Date().getFullYear(), []);
  const playableEvents = useMemo(() => [...events, ...(Array.isArray(game.customEvents) ? game.customEvents : [])], [game.customEvents]);
  const activeSeason = getSeasonForMonth(game.month);
  const seasonSchedule = useMemo(
    () => activeSeason.months.flatMap((month) => getMonthSchedule(month, currentCalendarYear, game.eventSeed, game.age, playableEvents, game)),
    [activeSeason, game, currentCalendarYear, playableEvents]
  );
  const seasonDecisions = useMemo(
    () => seasonSchedule.flatMap((day) => day.decisions.map((decision, decisionIndex) => ({ ...decision, day, decisionIndex }))),
    [seasonSchedule]
  );
  const totalSeasonDecisions = seasonDecisions.length;
  const selectedChoices = game.selectedChoices ?? {};
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

    const nextSeasonState = getNextSeasonState(game.month, game.age);

    setActiveDecisionContext(null);
    setSeasonTransition({
      previousSeasonId: getSeasonForMonth(game.month).id,
      targetSeasonId: getSeasonForMonth(nextSeasonState.month).id
    });
    setGame({
      ...game,
      ...nextSeasonState,
      completedDecisions: [],
      selectedChoices: {},
      currentEventId: getRandomEventId(game.currentEventId, playableEvents),
      memories: [...game.memories, `${getSeasonForMonth(game.month).label} wrapped up. Your selected decisions are now part of your story.`].slice(-8)
    });
  };

  const handleSimulateSeason = () => {
    if (isSimulationLocked || game.gameOver) {
      return;
    }

    setActiveDecisionContext(null);

    const schedule = activeSeason.months.flatMap((month) => getMonthSchedule(month, currentCalendarYear, game.eventSeed, game.age, playableEvents, game));
    let nextState = game;
    const steps = [];
    const simulatedMemories = [];
    const summaryHighlights = [];

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
          summaryHighlights.push(`${day.dayLabel}: ${decision.title} → ${selectedChoice.label}`);
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
        summaryHighlights.push(`${day.dayLabel}: ${decision.title} → ${choice.label}`);
      });

      if (randomDayResults.length > 0) {
        simulatedMemories.push(`${activeSeason.label}, ${day.dayLabel}, age ${game.age}: Went with the flow (${randomDayResults.join("; ")}).`);
      }
    });

    const unexpectedEvent = getUnexpectedEventForMonth(game.eventSeed, game.month, currentCalendarYear, nextState);
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
      summaryHighlights.push(`${unexpectedEvent.icon} Unexpected: ${unexpectedEvent.title}`);
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
      summaryHighlights.push("Quiet season: no unresolved choices or emergencies.");
      simulatedMemories.push(`${activeSeason.label}, age ${game.age}: The season stayed unusually calm.`);
    }

    const advancedGame = {
      ...nextState,
      ...getNextSeasonState(game.month, game.age),
      completedDecisions: [],
      selectedChoices: {},
      currentEventId: getRandomEventId(game.currentEventId, playableEvents),
      memories: [...game.memories, ...simulatedMemories].slice(-8)
    };
    const monthlySummary = createSeasonalSummary({ previousGame: game, nextState, highlights: summaryHighlights });
    const finalGame = finishRunIfNeeded({
      ...advancedGame,
      weekStartStats: captureStats(advancedGame),
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
        targetSeasonId: getSeasonForMonth(finalGame.month).id
      });
    }
    setSimulationState(createIdleSimulationState());
  };

  const closeDecisionModal = useCallback(() => setActiveDecisionContext(null), []);

  useEffect(() => {
    if (!activeDecisionContext || typeof window === "undefined") {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeDecisionModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeDecisionContext, closeDecisionModal]);

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

  if (game.gameOver) {
    return (
      <main className="app-shell game-over-shell">
        <section className="panel game-over-card">
          <p className="eyebrow">Game over</p>
          <h1>New Game+ unlocked</h1>
          <p className="subtitle">{game.gameOverReason}</p>
          <div className="legacy-meta-grid">
            <span><strong>{Math.round((legacy.carryRate ?? 0) * 100)}%</strong> Carryover rate</span>
            <span><strong>{legacy.skills ? Object.values(legacy.skills).reduce((sum, level) => sum + level, 0) : 0}</strong> Skill levels saved</span>
          </div>
          <div className="legacy-stat-grid" aria-label="Total New Game Plus bonuses">
            {displayStatKeys.map((key) => (
              <article key={key}>
                <span>{displayStatConfig[key].icon}</span>
                <strong>{displayStatConfig[key].label}</strong>
                <em>{formatSummaryDelta(key, getDisplayDeltaValue(totalLegacyBonuses, key))}</em>
                <small>carry + skills</small>
              </article>
            ))}
          </div>
          <div className="actions">
            <button onClick={prepareNewGamePlus}>Start New Game+</button>
            <button type="button" className="secondary" onClick={resetGame}>Wipe Legacy</button>
          </div>
        </section>
        <aside className="panel legacy-card">
          <div className="section-heading">
            <h2>Legacy skills</h2>
            <span>scaled, not OP</span>
          </div>
          <div className="skill-list">
            {Object.entries(legacySkillConfig).map(([key, skill]) => (
              <article key={key}>
                <span aria-hidden="true">{skill.icon}</span>
                <div>
                  <strong>{skill.label} Lv. {legacy.skills?.[key] ?? 0}</strong>
                  <small>{skill.description}</small>
                </div>
              </article>
            ))}
          </div>
        </aside>
      </main>
    );
  }

  if (!game.initialized) {
    return (
      <StartScreen
        customEventError={customEventError}
        customEventsText={customEventsText}
        familyInput={familyInput}
        formatSummaryDelta={formatSummaryDelta}
        legacy={legacy}
        onResetGame={resetGame}
        onStartGame={startNewGame}
        quiz={quiz}
        setCustomEventsText={setCustomEventsText}
        setFamilyInput={setFamilyInput}
        setQuiz={setQuiz}
        setStartAge={setStartAge}
        startAge={startAge}
        statConfig={statConfig}
        totalLegacyBonuses={totalLegacyBonuses}
      />
    );
  }

  return (
    <main className="app-shell">
      {seasonTransition ? (
        <SeasonTransition
          previousSeasonId={seasonTransition.previousSeasonId}
          targetSeasonId={seasonTransition.targetSeasonId}
          onComplete={() => setSeasonTransition(null)}
        />
      ) : null}
      <header className="topbar">
        <div>
          <p className="eyebrow">{activeSeason.label} · {getSeasonMonthNames(activeSeason)} · Age {game.age}</p>
          <h1>Seasonal Life Map</h1>
          <div className="active-character">
            <span>👨‍👩‍👧‍👦</span>
            <div>
              <strong>Your family</strong>
              <small>{getFamilySummary(game.family)}</small>
            </div>
          </div>
        </div>
        <div className="topbar-actions">
          <button className="secondary music-toggle" onClick={toggleZenMusic}>{musicPlaying ? "Pause Zen" : "Play Zen"}</button>
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
                <article
                  className={`stat-card stat-${key} ${severity ? `severity-${severity}` : ""}`}
                  key={key}
                  style={{ "--stat-accent": config.accent, "--stat-glow": config.glow, "--stat-fill": ringFill }}
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
                </article>
              );
            })}
          </section>
        </div>
        <button className="next-turn-button" onClick={handleSimulateSeason} disabled={isSimulationLocked}>▶ Simulate Season</button>
      </section>

      <div className="game-layout">
        <section className={`panel season-card season-${activeSeason.id}`}>
          <div className="section-heading calendar-heading">
            <div>
              <p className="eyebrow">This season</p>
              <h2>Plan {activeSeason.label}</h2>
            </div>
            <span>{pendingThisSeason} decisions left · seasonal emergency chance</span>
          </div>
          <p className="calendar-intro">Trade the calendar grid for a seasonal rhythm. Pick the choices that matter this season, then let the simulation resolve the rest across {getSeasonMonthNames(activeSeason)}.</p>
          <div className="flow-panel">
            <div>
              <strong>{pendingThisSeason === 0 ? "Season plan ready" : "Season planning: choose what matters"}</strong>
              <span>{completedThisSeason}/{totalSeasonDecisions} decisions selected. {pendingThisSeason === 0 ? "Review or change any highlighted choice before advancing." : "Unselected seasonal moments will auto-resolve when you simulate."}</span>
            </div>
          </div>
          <div className="season-carousel" aria-label="Season cards">
            {seasonConfig.map((season) => {
              const isActive = season.id === activeSeason.id;
              const seasonMonthNames = getSeasonMonthNames(season);
              const cardDecisions = isActive ? seasonDecisions : [];

              return (
                <article className={`season-panel season-panel-${season.id} ${isActive ? "active" : ""}`} key={season.id}>
                  <div className="season-panel-header">
                    <span className="season-icon" aria-hidden="true">{season.icon}</span>
                    <div>
                      <p className="eyebrow">{season.palette} season</p>
                      <h3>{season.label}</h3>
                    </div>
                  </div>
                  <p>{season.description}</p>
                  <span className="season-months">{seasonMonthNames}</span>
                  {isActive ? (
                    <div className="season-decisions">
                      {cardDecisions.length > 0 ? cardDecisions.map((decision) => {
                        const selectedChoice = selectedChoices[decision.key];
                        const lockedLegacyChoice = !selectedChoice && game.completedDecisions.includes(decision.key);
                        const completed = Boolean(selectedChoice) || lockedLegacyChoice;

                        return (
                          <section className={`decision-card severity-card-${decision.severity} accent-${decision.visual.accent} ${completed ? "completed" : ""}`} key={decision.key}>
                            <button
                              className="decision-toggle"
                              type="button"
                              aria-haspopup="dialog"
                              onClick={() => setActiveDecisionContext({ decision, dayLabel: decision.day.dayLabel })}
                              disabled={isSimulationLocked}
                            >
                              <span className="decision-title">
                                <span className="mini-icon" aria-hidden="true">{decision.visual.icon}</span>
                                <span>
                                  <small>{decision.visual.label} · {decision.day.dayLabel}</small>
                                  <h3>{decision.title}</h3>
                                </span>
                              </span>
                              <span className="decision-status">
                                {selectedChoice ? <span className="selected-pill">Picked</span> : null}
                                <span className={`severity-badge severity-${decision.severity}`}>
                                  <span aria-hidden="true">{severityConfig[decision.severity]?.icon}</span>
                                  {severityConfig[decision.severity]?.label ?? decision.severity}
                                </span>
                                <span className="expand-cue" aria-hidden="true">↗</span>
                              </span>
                            </button>
                          </section>
                        );
                      }) : <p className="season-empty">This season is unusually quiet. Simulate to discover whether life stays that way.</p>}
                    </div>
                  ) : (
                    <div className="season-preview">
                      <strong>{season.months.length} month arc</strong>
                      <span>Coming after {activeSeason.label}</span>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <aside className="side-stack">
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
            <div className="summary-award">
              <span aria-hidden="true">🏅</span>
              <div>
                <small>Fake award</small>
                <strong>{activeMonthlySummary.award}</strong>
              </div>
            </div>
            {(activeMonthlySummary.highlights ?? []).length > 0 ? (
              <ul className="summary-highlights">
                {(activeMonthlySummary.highlights ?? []).map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            ) : null}
            <button className="next-turn-button" type="button" onClick={closeSummaryModal}>Continue</button>
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
  );
}
