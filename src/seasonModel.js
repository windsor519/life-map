export const SEASONS = ["Winter", "Spring", "Summer", "Fall"];
export const WEEKS_PER_SEASON = 13;
export const WEEKS_PER_YEAR = SEASONS.length * WEEKS_PER_SEASON;

const seasonPlan = [
  {
    id: "representative-week-1",
    label: "Representative Week 1",
    type: "routine",
    decisionCount: 3,
    effectMultiplier: 4,
    allowedEventTypes: ["routine", "minor", "moderate"]
  },
  {
    id: "representative-week-2",
    label: "Representative Week 2",
    type: "routine",
    decisionCount: 3,
    effectMultiplier: 4,
    allowedEventTypes: ["routine", "minor", "moderate"]
  },
  {
    id: "seasonal-events",
    label: "Seasonal Events",
    type: "one-off",
    decisionCount: 1,
    effectMultiplier: 1,
    allowedEventTypes: ["major", "seasonal", "school", "health"]
  }
];

const routineEventIds = new Set([
  "gym-session",
  "grocery-budget",
  "team-lunch",
  "neighbor-help",
  "date-night",
  "sleep-debt",
  "home-maintenance",
  "volunteer-shift",
  "side-hustle",
  "family-call",
  "therapy-session",
  "investment-choice",
  "digital-detox"
]);

const oneOffEventIds = new Set([
  "daughter-recital",
  "friend-birthday",
  "annual-checkup",
  "weekend-getaway",
  "school-project",
  "kids-sports"
]);

const oneOffCategoryWords = ["school", "health", "major", "emergency"];
const routineCategoryWords = ["money", "wellness", "relationship", "work", "home", "community", "errands", "recovery"];

const seededRandom = (...values) => {
  let hash = 2166136261;

  values.join("|").split("").forEach((character) => {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  });

  return ((hash >>> 0) % 10000) / 10000;
};

export const getSeasonNumber = (week) => {
  const safeWeek = Math.max(1, Math.min(WEEKS_PER_YEAR, Math.round(Number(week) || 1)));
  return Math.floor((safeWeek - 1) / WEEKS_PER_SEASON);
};

export const getSeasonName = (week) => SEASONS[getSeasonNumber(week)];

export const getNextSeasonState = ({ week, age }) => {
  const seasonNumber = getSeasonNumber(week);
  const nextSeasonNumber = (seasonNumber + 1) % SEASONS.length;
  const nextWeek = nextSeasonNumber * WEEKS_PER_SEASON + 1;

  return {
    age: seasonNumber === SEASONS.length - 1 ? age + 1 : age,
    month: Math.min(12, Math.max(1, Math.ceil(nextWeek / (WEEKS_PER_YEAR / 12)))),
    week: nextWeek
  };
};

export const scaleEffects = (effects, multiplier) =>
  Object.fromEntries(Object.entries(effects ?? {}).map(([key, value]) => [key, Math.round(value * multiplier)]));

const getEventCategory = (event) => (event.category ?? "").toLowerCase();
const getSeverity = (event) => event.severity ?? "minor";

const getEventTypes = (event) => {
  const severity = getSeverity(event);
  const category = getEventCategory(event);
  const types = new Set([severity]);

  if (routineEventIds.has(event.id) || routineCategoryWords.some((word) => category.includes(word))) {
    types.add("routine");
  }

  if (
    oneOffEventIds.has(event.id) ||
    event.surprise ||
    severity === "major" ||
    oneOffCategoryWords.some((word) => category.includes(word))
  ) {
    types.add("seasonal");
  }

  if (category.includes("school") || event.id?.includes("school") || event.id?.includes("teacher")) {
    types.add("school");
  }

  if (category.includes("health") || event.id?.includes("checkup") || event.title?.toLowerCase().includes("care")) {
    types.add("health");
  }

  return types;
};

const eventMatchesStep = (event, step) => {
  const types = getEventTypes(event);

  if (step.type === "routine" && types.has("seasonal")) {
    return false;
  }

  if (step.type === "one-off" && types.has("routine") && !types.has("seasonal")) {
    return false;
  }

  return step.allowedEventTypes.some((type) => types.has(type));
};

const pickEvent = ({ pool, seed, week, stepId, decisionIndex, selectedIds }) => {
  const availablePool = pool.filter((event) => !selectedIds.has(event.id));
  const usablePool = availablePool.length > 0 ? availablePool : pool;
  const eventIndex = Math.floor(seededRandom(seed, week, stepId, decisionIndex, "event") * usablePool.length);
  return usablePool[Math.min(eventIndex, usablePool.length - 1)];
};

export const buildSeasonSchedule = ({ events, seed, week }) => {
  const selectedIds = new Set();
  const extraSeasonalEvent = seededRandom(seed, week, "seasonal-event-count") > 0.7 ? 1 : 0;

  return seasonPlan.map((step) => {
    const decisionCount = step.type === "one-off" ? step.decisionCount + extraSeasonalEvent : step.decisionCount;
    const matchingEvents = events.filter((event) => eventMatchesStep(event, step));
    const fallbackEvents = events.filter((event) => !selectedIds.has(event.id));
    const pool = matchingEvents.length > 0 ? matchingEvents : fallbackEvents;

    return {
      ...step,
      decisionCount,
      decisions: Array.from({ length: decisionCount }, (_, decisionIndex) => {
        const event = pickEvent({ pool, seed, week, stepId: step.id, decisionIndex, selectedIds });
        selectedIds.add(event.id);

        return {
          ...event,
          scheduleStepId: step.id,
          scheduleLabel: step.label,
          scheduleType: step.type,
          effectMultiplier: step.effectMultiplier,
          key: `${seed}-${week}-${step.id}-${decisionIndex}-${event.id}`
        };
      })
    };
  });
};
