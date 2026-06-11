import { useEffect, useMemo, useRef, useState } from "react";
import events from "./data/events.js";

const STORAGE_KEY = "life-map-game";
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

const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getMonthLength = (month, year) => new Date(year, month, 0).getDate();
const getMonthStartWeekday = (month, year) => new Date(year, month - 1, 1).getDay();

const statConfig = {
  money: { label: "Money", icon: "💸", formatter: (value) => value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) },
  health: { label: "Health", icon: "💪", max: 100, tone: "good" },
  marriage: { label: "Relationship", icon: "💞", max: 100, tone: "good" },
  children: { label: "Family bond", icon: "🌱", max: 100, tone: "good" },
  stress: { label: "Stress", icon: "⚡", max: 100, tone: "bad" }
};

const summaryStatKeys = Object.keys(statConfig);
const captureStats = (game) =>
  summaryStatKeys.reduce((stats, key) => ({ ...stats, [key]: game[key] ?? 0 }), {});

const legacySkillConfig = {
  grit: { label: "Grit", icon: "🛡️", description: "Turns past burnout into calmer future weeks." },
  wellness: { label: "Wellness", icon: "🌿", description: "Carries forward healthier habits after a bad ending." },
  bonds: { label: "Bonds", icon: "💞", description: "Keeps a little relationship wisdom between lives." },
  parenting: { label: "Parenting", icon: "🧸", description: "Saves family lessons for the next run." },
  hustle: { label: "Hustle", icon: "💼", description: "Banks a scaled-down money mindset for new game plus." }
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
  "investment-choice": { icon: "📈", accent: "amber", label: "Money" },
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
const getRandomEventId = (excludeId) => {
  const availableEvents = events.filter((event) => event.id !== excludeId);
  const pool = availableEvents.length > 0 ? availableEvents : events;
  return pool[Math.floor(Math.random() * pool.length)].id;
};

const getSeverity = (event) => event.severity ?? "minor";
const getRandomChoice = (eventSeed, month, dayIndex, decisionIndex, choices) => {
  const choiceIndex = Math.floor(seededRandom(eventSeed, month, dayIndex, decisionIndex, "choice") * choices.length);
  return choices[Math.min(choiceIndex, choices.length - 1)];
};
const getNextMonthState = (month, age) => {
  const nextMonth = month === 12 ? 1 : month + 1;

  return {
    age: month === 12 ? age + 1 : age,
    month: nextMonth,
    week: nextMonth
  };
};

const surpriseEvents = events.filter((event) => event.surprise);
const getDecoratedEvent = (event, eventSeed, month, dayIndex, decisionIndex) => ({
  ...event,
  severity: getSeverity(event),
  key: `${eventSeed}-${month}-${dayIndex}-${decisionIndex}-${event.id}`,
  visual: eventVisuals[event.id] ?? { icon: event.icon ?? "✨", accent: event.accent ?? "blue", label: event.category ?? "Life" }
});

const getMonthSchedule = (month, year, eventSeed) => {
  const daysInMonth = getMonthLength(month, year);

  return Array.from({ length: daysInMonth }, (_, index) => {
    const date = new Date(year, month - 1, index + 1);
    const weekday = weekdayNames[date.getDay()];
    const dayLabel = `${weekday} ${index + 1}`;
    const hasEvent = seededRandom(eventSeed, month, year, index, "has-event") < 0.2;
    const decisions = hasEvent
      ? [getDecoratedEvent(events[Math.floor(seededRandom(eventSeed, month, year, index, "event") * events.length)], eventSeed, month, index, 0)]
      : [];

    return {
      date,
      weekday,
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
  broke: {
    mood: "💸",
    headline: "Financial oopsie with confidence",
    joke: "Your wallet is now running on vibes, lint, and one brave receipt.",
    award: "Most Dramatic Wallet Exit"
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
  if (deltas.stress >= 12) return "chaos";
  if (deltas.money <= -500) return "broke";
  if (deltas.health >= 8) return "glow";
  if (deltas.marriage >= 8) return "romance";
  if (deltas.children >= 8) return "family";
  if (summaryStatKeys.every((key) => deltas[key] >= 0 || key === "stress") && deltas.stress <= 0) return "legend";
  return "survived";
};

const getLifeWeather = (deltas) => {
  if (deltas.stress >= 12) return "Thunderstorms with a chance of overthinking ⚡";
  if (deltas.money <= -500) return "Financial fog rolling through the wallet district 💸";
  if (deltas.health >= 8) return "Sunny with gains and suspiciously clean sneakers 💪";
  if (deltas.marriage >= 8) return "Warm rom-com breeze from the relationship department 💞";
  if (deltas.children >= 8) return "High-pressure family hugs with snack gusts 🌱";
  return "Partly chaotic, clearing by next Monday 😵‍💫";
};

const createMonthlySummary = ({ previousGame, nextState, highlights = [] }) => {
  const startStats = previousGame.weekStartStats ?? captureStats(previousGame);
  const endStats = captureStats(nextState);
  const deltas = summaryStatKeys.reduce((stats, key) => ({ ...stats, [key]: endStats[key] - (startStats[key] ?? previousGame[key] ?? 0) }), {});
  const tone = getSummaryTone(deltas);
  const copy = summaryCopy[tone];

  return {
    id: `${previousGame.eventSeed}-${previousGame.month}-${Date.now()}`,
    month: previousGame.month,
    age: previousGame.age,
    deltas,
    highlights: highlights.slice(-3),
    weather: getLifeWeather(deltas),
    ...copy
  };
};

const formatSummaryDelta = (key, value) => {
  const prefix = value > 0 ? "+" : "";

  if (key === "money") {
    return `${prefix}${value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}`;
  }

  return `${prefix}${value}`;
};

const getGameOverReason = (game) => {
  if (game.health <= 0) return "Your health hit zero. The run collapsed into a cautionary smoothie ad.";
  if (game.marriage <= 0) return "The relationship meter bottomed out. The couch has entered witness protection.";
  if (game.children <= 0) return "Family bond hit zero. The snack-based legacy needs a reboot.";
  if (game.stress >= 100) return "Stress hit 100. The calendar became sentient and demanded a rematch.";
  if (game.money <= -10000) return "Debt got too deep. Your wallet rage-quit the timeline.";
  return null;
};

const getLegacySkillBonuses = (legacy) => {
  const skills = legacy?.skills ?? createEmptySkills();

  return {
    money: Math.min(20000, (skills.hustle ?? 0) * 250),
    health: Math.min(20, Math.floor((skills.wellness ?? 0) / 2)),
    marriage: Math.min(20, Math.floor((skills.bonds ?? 0) / 2)),
    children: Math.min(20, Math.floor((skills.parenting ?? 0) / 2)),
    stress: -Math.min(20, Math.floor((skills.grit ?? 0) / 2))
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
    money: Math.max(0, Math.round((finalGame.money ?? 0) * carryRate * 0.12)),
    health: Math.max(0, Math.round((finalGame.health ?? 0) * carryRate)),
    marriage: Math.max(0, Math.round((finalGame.marriage ?? 0) * carryRate)),
    children: Math.max(0, Math.round((finalGame.children ?? 0) * carryRate)),
    stress: -Math.max(0, Math.round((100 - (finalGame.stress ?? 100)) * carryRate * 0.35))
  };
  const earnedSkills = {
    grit: Math.max(1, Math.round((100 - Math.min(finalGame.stress ?? 100, 100)) * carryRate * 0.2)),
    wellness: Math.max(0, Math.round((finalGame.health ?? 0) * carryRate * 0.18)),
    bonds: Math.max(0, Math.round((finalGame.marriage ?? 0) * carryRate * 0.18)),
    parenting: Math.max(0, Math.round((finalGame.children ?? 0) * carryRate * 0.18)),
    hustle: Math.max(0, Math.round(Math.max(finalGame.money ?? 0, 0) / 10000 * carryRate))
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

  return {
    ...baseStats,
    money: Math.max(0, Math.round(baseStats.money + (legacyBonuses.money ?? 0))),
    health: clamp(baseStats.health + (legacyBonuses.health ?? 0)),
    marriage: clamp(baseStats.marriage + (legacyBonuses.marriage ?? 0)),
    children: clamp(baseStats.children + (legacyBonuses.children ?? 0)),
    stress: clamp(baseStats.stress + (legacyBonuses.stress ?? 0))
  };
};

const scaleEffectsForDifficulty = (effects, difficulty = 1) =>
  Object.fromEntries(Object.entries(effects).map(([key, value]) => {
    const isBad = key === "stress" ? value > 0 : value < 0;
    const multiplier = isBad ? difficulty : Math.max(0.5, 1 - (difficulty - 1) * 0.35);
    return [key, Math.round(value * multiplier)];
  }));


const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const characterArchetypes = [
  {
    title: "The Fragile Genius",
    description: "Smart but weak: great plans, questionable knees.",
    vibe: "Glass cannon",
    ageRange: [19, 34],
    moneyRange: [8000, 28000],
    stats: { health: -18, marriage: 4, children: -2, stress: 12 },
    traits: ["Smart", "Focused", "Weak"],
    perkTags: ["money", "career"],
    drawback: { name: "Glass Constitution", description: "Health starts low, so reckless wellness choices hurt more." }
  },
  {
    title: "The Iron Loner",
    description: "Strong but antisocial: can move a couch, cannot text back.",
    vibe: "Tank build",
    ageRange: [22, 42],
    moneyRange: [5000, 22000],
    stats: { health: 22, marriage: -20, children: -12, stress: -4 },
    traits: ["Strong", "Disciplined", "Antisocial"],
    perkTags: ["stress", "health"],
    drawback: { name: "Unread Messages", description: "Relationship and family stats start fragile." }
  },
  {
    title: "The Golden Burnout",
    description: "Rich but cooked: impressive account balance, haunted calendar.",
    vibe: "High risk",
    ageRange: [27, 48],
    moneyRange: [65000, 120000],
    stats: { health: -10, marriage: -12, children: -8, stress: 28 },
    traits: ["Wealthy", "Overworked", "Anxious"],
    perkTags: ["money"],
    drawback: { name: "Always On", description: "Stress starts high enough to become its own side quest." }
  },
  {
    title: "The Social Meteor",
    description: "Charismatic and chaotic: beloved by everyone, including trouble.",
    vibe: "Blessed mess",
    ageRange: [18, 38],
    moneyRange: [3000, 18000],
    stats: { health: 2, marriage: 24, children: 18, stress: 14 },
    traits: ["Charismatic", "Impulsive", "Connected"],
    perkTags: ["social", "family"],
    drawback: { name: "Calendar Avalanche", description: "The social life is strong; the recovery time is not." }
  },
  {
    title: "The Lucky Mess",
    description: "A walking dice roll with suspiciously good timing.",
    vibe: "Chaos build",
    ageRange: [18, 45],
    moneyRange: [1000, 35000],
    stats: { health: -4, marriage: 2, children: 4, stress: 10 },
    traits: ["Lucky", "Messy", "Adaptable"],
    perkTags: ["luck"],
    drawback: { name: "No Plan, Just Vibes", description: "Balanced stats, but stress starts slightly spicy." }
  },
  {
    title: "The Family Glue",
    description: "Emotionally available, financially improvising.",
    vibe: "Heart build",
    ageRange: [24, 50],
    moneyRange: [2500, 26000],
    stats: { health: 0, marriage: 18, children: 26, stress: 8 },
    traits: ["Nurturing", "Patient", "Broke-ish"],
    perkTags: ["family", "social"],
    drawback: { name: "Soft Wallet", description: "Low money makes generosity a tactical problem." }
  }
];

const talentPool = [
  { id: "pattern-vision", name: "Pattern Vision", icon: "🧠", tag: "money", cost: 18, description: "Negative money hits are softened by 20%." },
  { id: "stress-armor", name: "Stress Armor", icon: "🛡️", tag: "stress", cost: 16, description: "Stress increases are reduced by 25%." },
  { id: "iron-routine", name: "Iron Routine", icon: "🏋️", tag: "health", cost: 14, description: "Positive health gains receive a small bonus." },
  { id: "npc-whisperer", name: "NPC Whisperer", icon: "🗣️", tag: "social", cost: 16, description: "Relationship gains get a small boost." },
  { id: "family-glue", name: "Family Glue", icon: "🌱", tag: "family", cost: 16, description: "Family bond gains get a small boost." },
  { id: "goblin-luck", name: "Goblin Luck", icon: "🎲", tag: "luck", cost: 18, description: "Very bad single-stat losses are softened a little." }
];

const balanceCharacter = (profile, talentCost) => {
  const statScore =
    (profile.money - 20000) / 2500 +
    (profile.health - 60) * 0.9 +
    (profile.marriage - 45) * 0.75 +
    (profile.children - 30) * 0.65 -
    (profile.stress - 35) * 0.9 +
    talentCost;

  let adjustment = Math.round(statScore);
  const balancedProfile = { ...profile };

  while (adjustment > 8) {
    if (balancedProfile.money > 12000) {
      balancedProfile.money -= 2500;
    } else if (balancedProfile.stress < 72) {
      balancedProfile.stress += 4;
    } else {
      balancedProfile.health -= 3;
    }
    adjustment -= 6;
  }

  while (adjustment < -8) {
    if (balancedProfile.stress > 24) {
      balancedProfile.stress -= 4;
    } else if (balancedProfile.money < 45000) {
      balancedProfile.money += 2500;
    } else {
      balancedProfile.health += 3;
    }
    adjustment += 6;
  }

  return {
    ...balancedProfile,
    money: Math.max(500, Math.round(balancedProfile.money)),
    health: clamp(balancedProfile.health),
    marriage: clamp(balancedProfile.marriage),
    children: clamp(balancedProfile.children),
    stress: clamp(balancedProfile.stress),
    balanceScore: adjustment
  };
};

const generateCharacterOptions = (count = 3) => {
  const shuffledArchetypes = [...characterArchetypes].sort(() => Math.random() - 0.5);

  return shuffledArchetypes.slice(0, count).map((archetype, index) => {
    const matchingTalents = talentPool.filter((talent) => archetype.perkTags.includes(talent.tag));
    const talent = matchingTalents[randomBetween(0, matchingTalents.length - 1)] ?? talentPool[index % talentPool.length];
    const [minAge, maxAge] = archetype.ageRange;
    const [minMoney, maxMoney] = archetype.moneyRange;
    const profile = balanceCharacter(
      {
        id: `${archetype.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}-${index}`,
        title: archetype.title,
        description: archetype.description,
        vibe: archetype.vibe,
        age: randomBetween(minAge, maxAge),
        money: randomBetween(minMoney, maxMoney),
        health: 62 + archetype.stats.health + randomBetween(-5, 5),
        marriage: 45 + archetype.stats.marriage + randomBetween(-6, 6),
        children: 30 + archetype.stats.children + randomBetween(-6, 6),
        stress: 35 + archetype.stats.stress + randomBetween(-5, 5),
        traits: archetype.traits,
        talent,
        drawback: archetype.drawback
      },
      talent.cost
    );

    return profile;
  });
};

const createGameFromProfile = (profile) => {
  const newGame = {
    age: profile.age,
    money: profile.money,
    health: clamp(profile.health),
    marriage: clamp(profile.marriage),
    children: clamp(profile.children),
    stress: clamp(profile.stress),
    character: {
      title: profile.title,
      description: profile.description,
      vibe: profile.vibe,
      traits: profile.traits,
      talent: profile.talent,
      drawback: profile.drawback
    },
    month: 1,
    completedDecisions: [],
    selectedChoices: {},
    memories: [`You started as ${profile.title}: ${profile.description}`],
    currentEventId: getRandomEventId(),
    eventSeed: createEventSeed(),
    weeklySummary: null,
    initialized: true
  };

  return {
    ...newGame,
    weekStartStats: captureStats(newGame)
  };
};

const createDefaultGame = () => ({
  age: 40,
  money: 100000,
  health: 80,
  marriage: 75,
  children: 35,
  stress: 30,
  month: 1,
  completedDecisions: [],
  selectedChoices: {},
  memories: [],
  currentEventId: getRandomEventId(),
  eventSeed: createEventSeed(),
  weekStartStats: null,
  weeklySummary: null,
  gameOver: false,
  gameOverReason: null,
  legacy: createDefaultLegacy(),
  character: null,
  initialized: false
});

const normalizeGame = (game) => ({
  ...createDefaultGame(),
  ...game,
  money: Math.round(Number(game?.money ?? 0)),
  age: clamp(Number(game?.age ?? 25), 12, 100),
  health: clamp(Number(game?.health ?? 70)),
  marriage: clamp(Number(game?.marriage ?? 40)),
  children: clamp(Number(game?.children ?? 0)),
  stress: clamp(Number(game?.stress ?? 30)),
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
  character: game?.character && typeof game.character === "object" ? game.character : null
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
  const [startAge, setStartAge] = useState(game.initialized ? game.age : 25);
  const [startMoney, setStartMoney] = useState(game.initialized ? game.money : 10000);
  const [quiz, setQuiz] = useState({
    exercise: "sometimes",
    stableJob: "no",
    social: "weak"
  });
  const [expandedDecisionKey, setExpandedDecisionKey] = useState(null);
  const [characterOptions, setCharacterOptions] = useState(() => generateCharacterOptions());
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
    const money = Math.max(0, Math.round(parseInt(startMoney, 10) || 0));

    let health = 70;
    let marriage = 40;
    let children = 20;
    let stress = 30;

    if (quiz.exercise === "regularly") {
      health += 10;
      stress -= 5;
    } else if (quiz.exercise === "never") {
      health -= 10;
      stress += 5;
    }

    if (quiz.stableJob === "yes") {
      stress -= 10;
      marriage += 5;
    } else {
      stress += 15;
    }

    if (quiz.social === "strong") {
      marriage += 30;
      children += 20;
      stress -= 5;
    } else {
      marriage -= 10;
      stress += 5;
    }

    if (age >= 25 && age <= 40) marriage += 10;
    if (money >= 50000) marriage += 10;
    if (money < 5000) stress += 10;

    const baseStats = applyLegacyBonuses({
      money,
      health: clamp(health),
      marriage: clamp(marriage),
      children: clamp(children),
      stress: clamp(stress)
    }, game.legacy);

    const newGame = {
      age,
      ...baseStats,
      month: 1,
      week: 1,
      completedDecisions: [],
      selectedChoices: {},
      memories: ["You started a new life chapter."],
      currentEventId: getRandomEventId(),
      eventSeed: createEventSeed(),
      weeklySummary: null,
      gameOver: false,
      gameOverReason: null,
      legacy: normalizeLegacy(game.legacy),
      character: null,
      initialized: true
    };

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
    setGame(createDefaultGame());
    setStartAge(25);
    setStartMoney(10000);
    setQuiz({ exercise: "sometimes", stableJob: "no", social: "weak" });
    setCharacterOptions(generateCharacterOptions());
  };

  const rerollCharacters = () => {
    setCharacterOptions(generateCharacterOptions());
  };

  const startProfileGame = (profile) => {
    setGame(createGameFromProfile(profile));
    startZenMusic();
  };

  const prepareNewGamePlus = () => {
    setExpandedDecisionKey(null);
    setStartAge(25);
    setStartMoney(10000);
    setQuiz({ exercise: "sometimes", stableJob: "no", social: "weak" });
    setGame((prevGame) => ({ ...createDefaultGame(), legacy: normalizeLegacy(prevGame.legacy) }));
  };

  const currentCalendarYear = useMemo(() => new Date().getFullYear(), []);
  const monthSchedule = useMemo(() => getMonthSchedule(game.month, currentCalendarYear, game.eventSeed), [game.eventSeed, game.month, currentCalendarYear]);
  const monthStartWeekday = getMonthStartWeekday(game.month, currentCalendarYear);
  const calendarSlots = useMemo(
    () => [...Array(monthStartWeekday).fill(null), ...monthSchedule],
    [monthSchedule, monthStartWeekday]
  );
  const totalMonthlyDecisions = monthSchedule.reduce((total, day) => total + day.decisions.length, 0);
  const selectedChoices = game.selectedChoices ?? {};
  const completedThisMonth = Object.keys(selectedChoices).length || game.completedDecisions.length;
  const pendingThisMonth = Math.max(0, totalMonthlyDecisions - completedThisMonth);
  const currentYearProgress = Math.round((game.month / 12) * 100);
  const legacy = normalizeLegacy(game.legacy);
  const totalLegacyBonuses = getTotalLegacyBonuses(legacy);
  const runNumber = getRunNumber(legacy);
  const difficultyMultiplier = legacy.difficulty ?? getDifficultyMultiplier(legacy.runs ?? 0);

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

    if (talentId === "pattern-vision" && nextEffects.money < 0) {
      nextEffects.money = Math.round(nextEffects.money * 0.8);
    }

    if (talentId === "stress-armor" && nextEffects.stress > 0) {
      nextEffects.stress = Math.ceil(nextEffects.stress * 0.75);
    }

    if (talentId === "iron-routine" && nextEffects.health > 0) {
      nextEffects.health += 2;
    }

    if (talentId === "npc-whisperer" && nextEffects.marriage > 0) {
      nextEffects.marriage += 2;
    }

    if (talentId === "family-glue" && nextEffects.children > 0) {
      nextEffects.children += 2;
    }

    if (talentId === "goblin-luck") {
      Object.entries(nextEffects).forEach(([key, value]) => {
        if (key !== "money" && value <= -8) {
          nextEffects[key] = value + 2;
        }

        if (key === "money" && value <= -500) {
          nextEffects.money = Math.round(value * 0.88);
        }
      });
    }

    return nextEffects;
  };

  const applyEffects = (baseState, effects) => {
    const next = { ...baseState };
    Object.entries(effects).forEach(([key, value]) => {
      next[key] = (next[key] ?? 0) + value;
    });

    return {
      ...next,
      money: Math.round(next.money),
      health: clamp(next.health),
      marriage: clamp(next.marriage),
      children: clamp(next.children),
      stress: clamp(next.stress)
    };
  };

  const handleChoice = (choice, decision, dayName) => {
    setGame((prevGame) => {
      const adjustedEffects = scaleEffectsForDifficulty(choice.effects, prevGame.legacy?.difficulty ?? 1);
      const previousSelection = prevGame.selectedChoices?.[decision.key];
      const undoEffects = previousSelection
        ? Object.fromEntries(Object.entries(previousSelection.effects).map(([key, value]) => [key, -value]))
        : null;
      const stateBeforeChoice = undoEffects ? applyEffects(prevGame, undoEffects) : prevGame;
      const modifiedEffects = applyTalentModifiers(stateBeforeChoice, choice.effects);
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
      const monthComplete = completedDecisions.length >= totalMonthlyDecisions;
      const timestamp = `Month ${prevGame.month}, ${dayName}, age ${prevGame.age}`;
      const memoryAction = previousSelection ? `changed ${decision.title} from ${previousSelection.label} to ${choice.label}` : choice.memory;

      const updatedGame = {
        ...nextState,
        completedDecisions,
        selectedChoices,
        currentEventId: getRandomEventId(prevGame.currentEventId),
        memories: [...prevGame.memories, `${timestamp}: ${memoryAction}`].slice(-8)
      };

      return finishRunIfNeeded({
        ...updatedGame,
        weekStartStats: monthComplete ? captureStats(updatedGame) : prevGame.weekStartStats ?? captureStats(prevGame),
        weeklySummary: monthComplete
          ? createMonthlySummary({ previousGame: prevGame, nextState, highlights: [`${dayName}: ${decision.title} → ${choice.label}`] })
          : prevGame.weeklySummary
      }, prevGame);
    });
  };

  const handleAdvanceMonth = () => {
    setExpandedDecisionKey(null);
    setGame((prevGame) => prevGame.gameOver ? prevGame : ({
      ...prevGame,
      ...getNextMonthState(prevGame.month, prevGame.age),
      completedDecisions: [],
      selectedChoices: {},
      currentEventId: getRandomEventId(prevGame.currentEventId),
      memories: [...prevGame.memories, `Month ${prevGame.month} wrapped up. Your selected decisions are now part of your story.`].slice(-8)
    }));
  };

  const handleSimulateMonth = () => {
    setExpandedDecisionKey(null);
    setGame((prevGame) => {
      const schedule = getMonthSchedule(prevGame.month, currentCalendarYear, prevGame.eventSeed);
      let nextState = prevGame;
      const simulatedMemories = [];
      const summaryHighlights = [];

      schedule.forEach((day, dayIndex) => {
        const dayResults = [];

        day.decisions.forEach((decision, decisionIndex) => {
          if (prevGame.completedDecisions.includes(decision.key)) {
            return;
          }

          const choice = getRandomChoice(prevGame.eventSeed, prevGame.month, dayIndex, decisionIndex, decision.choices);
          const adjustedEffects = scaleEffectsForDifficulty(choice.effects, prevGame.legacy?.difficulty ?? 1);
          nextState = applyEffects(nextState, adjustedEffects);
          const modifiedEffects = applyTalentModifiers(nextState, choice.effects);
          nextState = applyEffects(nextState, modifiedEffects);
          dayResults.push(`${decision.title}: ${choice.label}`);
          summaryHighlights.push(`${day.dayLabel}: ${decision.title} → ${choice.label}`);
        });

        if (dayResults.length > 0) {
          simulatedMemories.push(`Month ${prevGame.month}, ${day.dayLabel}, age ${prevGame.age}: Went with the flow (${dayResults.join("; ")}).`);
        }
      });

      if (simulatedMemories.length === 0) {
        return prevGame;
      }

      const advancedGame = {
        ...nextState,
        ...getNextMonthState(prevGame.month, prevGame.age),
        completedDecisions: [],
        selectedChoices: {},
        currentEventId: getRandomEventId(prevGame.currentEventId),
        memories: [...prevGame.memories, ...simulatedMemories].slice(-8)
      };

      return finishRunIfNeeded({
        ...advancedGame,
        weekStartStats: captureStats(advancedGame),
        weeklySummary: createMonthlySummary({ previousGame: prevGame, nextState, highlights: summaryHighlights })
      }, prevGame);
    });
  };

  const renderEffectPreview = (effects) => {
    const adjustedEffects = scaleEffectsForDifficulty(effects, difficultyMultiplier);

    return (
    <span className="choice-effects" aria-label="Choice effects">
      {Object.entries(adjustedEffects).map(([key, value]) => (
        <span className={value >= 0 ? "effect positive" : "effect negative"} key={key}>
          {statConfig[key]?.label ?? key} {value > 0 ? "+" : ""}{value}
        </span>
      ))}
    </span>
    );
  };

  const renderSummaryDelta = (key, value) => {
    const config = statConfig[key];
    const isGoodChange = key === "stress" ? value <= 0 : value >= 0;

    return (
      <span className={`summary-delta ${isGoodChange ? "positive" : "negative"}`} key={key}>
        <span aria-hidden="true">{config?.icon}</span>
        <strong>{config?.label ?? key}</strong>
        <em>{formatSummaryDelta(key, value)}</em>
      </span>
    );
  };

  if (game.gameOver) {
    return (
      <main className="app-shell game-over-shell">
        <section className="panel game-over-card">
          <p className="eyebrow">Run {legacy.runs} game over</p>
          <h1>New Game+ unlocked</h1>
          <p className="subtitle">{game.gameOverReason}</p>
          <div className="legacy-meta-grid">
            <span><strong>{legacy.difficulty.toFixed(2)}×</strong> Next difficulty</span>
            <span><strong>{Math.round((legacy.carryRate ?? 0) * 100)}%</strong> Carryover rate</span>
            <span><strong>{legacy.runs}</strong> Runs completed</span>
          </div>
          <div className="legacy-stat-grid" aria-label="Total New Game Plus bonuses">
            {summaryStatKeys.map((key) => (
              <article key={key}>
                <span>{statConfig[key].icon}</span>
                <strong>{statConfig[key].label}</strong>
                <em>{formatSummaryDelta(key, totalLegacyBonuses[key] ?? 0)}</em>
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
      <main className="app-shell setup-shell">
        <section className="hero-card">
          <div>
            <p className="eyebrow">Life simulator</p>
            <h1>Design a life path worth replaying.</h1>
            <p className="subtitle">Improve your life one week at a time.</p>
          </div>
          <div className="life-board" aria-hidden="true">
            <span className="board-node node-money">💸</span>
            <span className="board-node node-heart">💞</span>
            <span className="board-node node-health">💪</span>
            <span className="board-node node-family">🌱</span>
            <span className="board-route" />
          </div>
        </section>

        <form className="panel setup-form" onSubmit={startNewGame}>
          <section className="randomizer-panel" aria-label="Randomized character options">
            <div className="randomizer-heading">
              <div>
                <p className="eyebrow">Quick start</p>
                <h2>Randomize 3 balanced lives</h2>
                <p>Each roll gets a perk and a drawback, then the budget-balancer trims anything too overpowered.</p>
              </div>
              <button type="button" className="secondary" onClick={rerollCharacters}>Randomize again</button>
            </div>

            <div className="character-options">
              {characterOptions.map((profile) => (
                <article className="character-card" key={profile.id}>
                  <div className="character-card-header">
                    <span>{profile.vibe}</span>
                    <strong>{profile.title}</strong>
                    <p>{profile.description}</p>
                  </div>

                  <div className="trait-row" aria-label={`${profile.title} traits`}>
                    {profile.traits.map((trait) => <span key={trait}>{trait}</span>)}
                  </div>

                  <div className="character-stats">
                    <span>Age <strong>{profile.age}</strong></span>
                    <span>Money <strong>{statConfig.money.formatter(profile.money)}</strong></span>
                    <span>Health <strong>{profile.health}</strong></span>
                    <span>Relationship <strong>{profile.marriage}</strong></span>
                    <span>Family <strong>{profile.children}</strong></span>
                    <span>Stress <strong>{profile.stress}</strong></span>
                  </div>

                  <div className="talent-box">
                    <span aria-hidden="true">{profile.talent.icon}</span>
                    <div>
                      <strong>{profile.talent.name}</strong>
                      <p>{profile.talent.description}</p>
                    </div>
                  </div>

                  <div className="drawback-box">
                    <strong>Drawback: {profile.drawback.name}</strong>
                    <p>{profile.drawback.description}</p>
                  </div>

                  <button type="button" onClick={() => startProfileGame(profile)}>Choose this life</button>
                </article>
              ))}
            </div>
          </section>

          <div className="manual-divider"><span>or build manually</span></div>

          <div className="form-grid">
            <label>
              <span>Starting age</span>
              <input type="number" value={startAge} onChange={(event) => setStartAge(event.target.value)} min={12} max={100} />
            </label>
            <label>
              <span>Starting money</span>
              <input type="number" value={startMoney} onChange={(event) => setStartMoney(event.target.value)} min={0} />
            </label>
          </div>

          <fieldset>
            <legend>How often do you exercise?</legend>
            <label><input type="radio" name="exercise" checked={quiz.exercise === "regularly"} onChange={() => setQuiz((q) => ({ ...q, exercise: "regularly" }))} /> Regularly</label>
            <label><input type="radio" name="exercise" checked={quiz.exercise === "sometimes"} onChange={() => setQuiz((q) => ({ ...q, exercise: "sometimes" }))} /> Sometimes</label>
            <label><input type="radio" name="exercise" checked={quiz.exercise === "never"} onChange={() => setQuiz((q) => ({ ...q, exercise: "never" }))} /> Rarely / Never</label>
          </fieldset>

          <fieldset>
            <legend>Do you have a stable job?</legend>
            <label><input type="radio" name="stableJob" checked={quiz.stableJob === "yes"} onChange={() => setQuiz((q) => ({ ...q, stableJob: "yes" }))} /> Yes</label>
            <label><input type="radio" name="stableJob" checked={quiz.stableJob === "no"} onChange={() => setQuiz((q) => ({ ...q, stableJob: "no" }))} /> No</label>
          </fieldset>

          <fieldset>
            <legend>Social circle</legend>
            <label><input type="radio" name="social" checked={quiz.social === "strong"} onChange={() => setQuiz((q) => ({ ...q, social: "strong" }))} /> Strong</label>
            <label><input type="radio" name="social" checked={quiz.social === "weak"} onChange={() => setQuiz((q) => ({ ...q, social: "weak" }))} /> Weak</label>
          </fieldset>

          {legacy.runs > 0 ? (
            <section className="legacy-preview" aria-label="New Game Plus bonuses">
              <div>
                <strong>New Game+ Run {runNumber}</strong>
                <span>{difficultyMultiplier.toFixed(2)}× difficulty · {Math.round((legacy.carryRate ?? 0) * 100)}% carryover + skill boosts</span>
              </div>
              <div className="legacy-preview-stats">
                {summaryStatKeys.map((key) => (
                  <span key={key}>{statConfig[key].icon} {formatSummaryDelta(key, totalLegacyBonuses[key] ?? 0)}</span>
                ))}
              </div>
            </section>
          ) : null}

          <div className="actions">
            <button type="submit">Start Game</button>
            <button type="button" className="secondary" onClick={resetGame}>Reset</button>
          </div>
        </form>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Run {runNumber} · {difficultyMultiplier.toFixed(2)}× difficulty · Month {game.month} · {monthNames[game.month - 1]} {currentCalendarYear} · Age {game.age}</p>
          <h1>Monthly Life Map</h1>
          {game.character ? (
            <div className="active-character">
              <span>{game.character.talent?.icon}</span>
              <div>
                <strong>{game.character.title}</strong>
                <small>{game.character.talent?.name}: {game.character.talent?.description}</small>
              </div>
            </div>
          ) : null}
        </div>
        <div className="topbar-actions">
          {pendingThisMonth === 0 ? (
            <button onClick={handleAdvanceMonth}>Advance Month</button>
          ) : (
            <button onClick={handleSimulateMonth}>Simulate Month</button>
          )}
          <button className="secondary music-toggle" onClick={toggleZenMusic}>{musicPlaying ? "Pause Zen" : "Play Zen"}</button>
          <button className="secondary" onClick={resetGame}>Restart Setup</button>
        </div>
      </header>

      <section className="stat-grid" aria-label="Current life stats">
        {Object.entries(statConfig).map(([key, config]) => {
          const value = game[key];
          const percentage = config.max ? `${clamp(value, 0, config.max)}%` : null;
          const severity = getStatSeverity(value, config);
          const alert = severityCopy[severity];
          return (
            <article className={`stat-card stat-${key} ${severity ? `severity-${severity}` : ""}`} key={key}>
              <div className="stat-icon" aria-hidden="true">{config.icon}</div>
              {alert ? (
                <div className={`stat-alert ${severity === "warning" ? "warning" : ""}`} aria-label={`${config.label} needs ${severity === "critical" ? "urgent attention" : "attention"}`}>
                  <span aria-hidden="true">{alert.icon}</span>
                  {alert.label}
                </div>
              ) : null}
              <span>{config.label}</span>
              <strong>{config.formatter ? config.formatter(value) : value}</strong>
              {percentage ? <div className={`meter ${config.tone}`}><span style={{ width: percentage }} /></div> : null}
            </article>
          );
        })}
      </section>

      <div className="game-layout">
        <section className="panel calendar-card">
          <div className="section-heading calendar-heading">
            <div>
              <p className="eyebrow">This month</p>
              <h2>Plan your month</h2>
            </div>
            <span>{pendingThisMonth} decisions left · 1 random emergency</span>
          </div>
          <p className="calendar-intro">Build a monthly plan by picking key choices, then let the simulation resolve the rest. Every month includes a chance for unexpected trouble so life can still throw a car, furnace, or fence problem at you.</p>
          <div className="flow-panel">
            <div>
              <strong>{pendingThisMonth === 0 ? "Monthly plan ready" : "Planning mode: choose what matters"}</strong>
              <span>{completedThisMonth}/{totalMonthlyDecisions} decisions selected. {pendingThisMonth === 0 ? "Review or change any highlighted choice before advancing." : "Unselected days will auto-resolve when you simulate."}</span>
            </div>
          </div>
          <div className="calendar-grid">
            <div className="calendar-weekdays">
              {weekdayNames.map((weekday) => (
                <div key={weekday} className="weekday-label">{weekday}</div>
              ))}
            </div>
            <div className="monthly-calendar">
              {calendarSlots.map((day, index) => (
                day ? (
                  <article className="day-column" key={day.dayLabel}>
                    <div className="day-header">
                      <div>
                        <strong>{day.dayNumber}</strong>
                        <span>{day.weekday}</span>
                      </div>
                      <span>{day.decisions.length} event{day.decisions.length === 1 ? "" : "s"}</span>
                    </div>
                    <div className="day-decisions">
                      {day.decisions.map((decision) => {
                        const selectedChoice = selectedChoices[decision.key];
                        const lockedLegacyChoice = !selectedChoice && game.completedDecisions.includes(decision.key);
                        const completed = Boolean(selectedChoice) || lockedLegacyChoice;
                        const isExpanded = expandedDecisionKey === decision.key;
                        return (
                          <section className={`decision-card severity-card-${decision.severity} accent-${decision.visual.accent} ${completed ? "completed" : ""} ${isExpanded ? "expanded" : ""}`} key={decision.key}>
                            <button
                              className="decision-toggle"
                              type="button"
                              aria-expanded={isExpanded}
                              onClick={() => setExpandedDecisionKey(isExpanded ? null : decision.key)}
                            >
                              <span className="decision-title">
                                <span className="mini-icon" aria-hidden="true">{decision.visual.icon}</span>
                                <span>
                                  <small>{decision.visual.label}</small>
                                  <h3>{decision.title}</h3>
                                </span>
                              </span>
                              <span className="decision-status">
                                {selectedChoice ? <span className="selected-pill">Picked</span> : null}
                                <span className={`severity-badge severity-${decision.severity}`}>
                                  <span aria-hidden="true">{severityConfig[decision.severity]?.icon}</span>
                                  {severityConfig[decision.severity]?.label ?? decision.severity}
                                </span>
                                <span className="expand-cue" aria-hidden="true">{isExpanded ? "−" : "+"}</span>
                              </span>
                            </button>
                            {isExpanded ? (
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
                                        disabled={lockedLegacyChoice}
                                        key={choice.label}
                                        onClick={() => {
                                          handleChoice(choice, decision, day.dayLabel);
                                          setExpandedDecisionKey(null);
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
                            ) : null}
                          </section>
                        );
                      })}
                    </div>
                  </article>
                ) : (
                  <div className="day-column empty-day" key={`empty-${index}`} />
                )
              ))}
            </div>
          </div>
        </section>

        <aside className="side-stack">
          <section className="panel timeline-card">
            <div className="section-heading">
              <h2>Year progress</h2>
              <span>{currentYearProgress}%</span>
            </div>
            <div className="year-ring" style={{ "--progress": `${currentYearProgress}%` }}>
              <div>
                <strong>M{game.month}</strong>
                <span>Age {game.age}</span>
              </div>
            </div>
            <p>Use Simulate Month to automatically resolve the month. Each month includes a chance for unexpected trouble and a random event day.</p>
            <p>Plan the choices you care about, then use Simulate Month to let the calendar simulate the rest.</p>
          </section>

          {game.weeklySummary ? (
            <section className="panel monthly-summary-card" aria-live="polite">
              <div className="summary-confetti" aria-hidden="true">
                <span>{game.weeklySummary.mood}</span>
                <span>💸</span>
                <span>⚡</span>
                <span>💪</span>
              </div>
              <div className="section-heading summary-heading">
                <div>
                  <p className="eyebrow">Ridiculous recap</p>
                  <h2>Month {game.weeklySummary.month}</h2>
                </div>
                <span>Age {game.weeklySummary.age}</span>
              </div>
              <div className="summary-hero">
                <span className="summary-mascot" aria-hidden="true">{game.weeklySummary.mood}</span>
                <div>
                  <h3>{game.weeklySummary.headline}</h3>
                  <p>{game.weeklySummary.joke}</p>
                </div>
              </div>
              <div className="summary-weather">
                <span>Life weather</span>
                <strong>{game.weeklySummary.weather}</strong>
              </div>
              <div className="summary-deltas" aria-label="Weekly stat changes">
                {summaryStatKeys.map((key) => renderSummaryDelta(key, game.weeklySummary.deltas[key] ?? 0))}
              </div>
              <div className="summary-award">
                <span aria-hidden="true">🏅</span>
                <div>
                  <small>Fake award</small>
                  <strong>{game.weeklySummary.award}</strong>
                </div>
              </div>
              {(game.weeklySummary.highlights ?? []).length > 0 ? (
                <ul className="summary-highlights">
                  {(game.weeklySummary.highlights ?? []).map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ) : null}

          <section className="panel memories-card">
            <div className="section-heading">
              <h2>Recent memories</h2>
              <span>{game.memories.length}/8 saved</span>
            </div>
            {game.memories.length === 0 ? (
              <p>No memories yet.</p>
            ) : (
              <ol>
                {[...game.memories].reverse().map((memory) => (
                  <li key={memory}>{memory}</li>
                ))}
              </ol>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}
