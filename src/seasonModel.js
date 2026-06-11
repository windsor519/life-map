export const seasons = ["Winter", "Spring", "Summer", "Fall"];
export const WEEKS_PER_SEASON = 13;
export const WEEKS_PER_YEAR = 52;

export const seasonDecisionPlan = [
  {
    label: "Week 1 sample",
    description: "Pick a few early-season moves. These routine decisions are extrapolated across the quarter.",
    decisionCount: 3,
    effectMultiplier: 4,
    eventTypes: ["minor", "moderate"]
  },
  {
    label: "Week 2 sample",
    description: "Make one more representative week of choices before the sim projects the rest of the season.",
    decisionCount: 3,
    effectMultiplier: 4,
    eventTypes: ["minor", "moderate"]
  },
  {
    label: "Seasonal event",
    description: "One-off milestones and curveballs happen occasionally, not every day.",
    decisionCount: 2,
    effectMultiplier: 1,
    eventTypes: ["moderate", "major"]
  }
];

export const getSeasonNumber = (week) => Math.min(seasons.length, Math.max(1, Math.ceil(week / WEEKS_PER_SEASON)));
export const getSeasonName = (week) => seasons[getSeasonNumber(week) - 1];
export const getNextSeasonState = (week, age) => {
  const currentSeason = getSeasonNumber(week);
  const nextWeek = currentSeason === seasons.length ? 1 : currentSeason * WEEKS_PER_SEASON + 1;

  return {
    age: currentSeason === seasons.length ? age + 1 : age,
    month: Math.min(12, Math.ceil(nextWeek / 4.333)),
    week: nextWeek
  };
};

export const scaleEffects = (effects, multiplier = 1) =>
  Object.fromEntries(Object.entries(effects).map(([key, value]) => [key, Math.round(value * multiplier)]));

const getSeasonEvents = ({ eventSeed, events, eventVisuals, getSeverity, plan, planIndex, seededRandom, usedEventIds, week }) => {
  const matchingEvents = events.filter((event) => plan.eventTypes.includes(getSeverity(event)));
  const fallbackPool = matchingEvents.length > 0 ? matchingEvents : events;

  return Array.from({ length: plan.decisionCount }, (_, decisionIndex) => {
    const availableEvents = fallbackPool.filter((event) => !usedEventIds.has(event.id));
    const eventPool = availableEvents.length > 0 ? availableEvents : fallbackPool;
    const eventIndex = Math.floor(seededRandom(eventSeed, week, planIndex, decisionIndex) * eventPool.length);
    const event = eventPool[Math.min(eventIndex, eventPool.length - 1)];

    usedEventIds.add(event.id);

    return {
      ...event,
      severity: getSeverity(event),
      effectMultiplier: plan.effectMultiplier,
      key: `${eventSeed}-${week}-${planIndex}-${decisionIndex}-${event.id}`,
      visual: eventVisuals[event.id] ?? { icon: event.icon ?? "✨", accent: event.accent ?? "blue", label: event.category ?? "Life" }
    };
  });
};

export const getSeasonSchedule = ({ eventSeed, events, eventVisuals, getSeverity, seededRandom, week }) => {
  const usedEventIds = new Set();

  return seasonDecisionPlan.map((plan, planIndex) => ({
    ...plan,
    decisions: getSeasonEvents({ eventSeed, events, eventVisuals, getSeverity, plan, planIndex, seededRandom, usedEventIds, week })
  }));
};
