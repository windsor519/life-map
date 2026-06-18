import { baseActions, generatedActionBlueprints } from "./action.json";
import familyAgeEvents from "./family_age_events.json";
import careerEvents from "./events/career.js";
import communityEvents from "./events/community.js";
import errandsEvents from "./events/errands.js";
import familyEvents from "./events/family.js";
import homeEvents from "./events/home.js";
import parentingEvents from "./events/parenting.js";
import schoolEvents from "./events/school.js";
import seasonalEvents from "./events/seasonal.js";
import walletEvents from "./events/wallet.js";
import wellbeingEvents from "./events/wellbeing.js";

const effectKeys = new Set(["wellbeing", "marriage", "children", "wallet", "reputation", "memory"]);
const youngChildAgeGroup = { minAge: 0, maxAge: 12 };
const teenAgeGroup = { minAge: 13, maxAge: 19 };
const adultChildAgeGroup = { minAge: 20, maxAge: 40 };
const anyChildAgeGroup = { minAge: 0, maxAge: 40 };

const lowQualityActionIds = new Set([
  "beach-day-vs-overtime",
  "neighborhood-bbq",
  "fireworks-celebration",
  "kids-lemonade-stand",
  "long-weekend-road-trip",
  "ice-cream-run-after-dinner",
  "water-balloon-battle",
  "summer-vacation-planning",
  "first-frost-morning",
  "leaf-raking-marathon"
]);

const ageGateById = {
  "first-soccer-practice": [youngChildAgeGroup],
  "easter-egg-hunt": [youngChildAgeGroup],
  "rainy-field-trip-chaperone": [youngChildAgeGroup],
  "school-spring-concert": [youngChildAgeGroup],
  "allergy-season-meltdown": [youngChildAgeGroup],
  "science-fair-presentation": [youngChildAgeGroup],
  "school-track-meet": [youngChildAgeGroup],
  "summer-camp-drop-off": [youngChildAgeGroup],
  "pool-opening-day": [youngChildAgeGroup],
  "family-camping-weekend": [youngChildAgeGroup],
  "outdoor-movie-night": [youngChildAgeGroup],
  "kids-first-fishing-trip": [youngChildAgeGroup],
  "end-of-summer-carnival": [youngChildAgeGroup],
  "back-to-school-shopping": [youngChildAgeGroup, teenAgeGroup],
  "parent-teacher-conference": [youngChildAgeGroup, teenAgeGroup],
  "school-fundraiser-drive": [youngChildAgeGroup, teenAgeGroup],
  "teenager-caught-lying": [teenAgeGroup],
  "detention-call": [teenAgeGroup],
  "scholarship-deadline": [teenAgeGroup, adultChildAgeGroup],
  "college-scholarship": [teenAgeGroup, adultChildAgeGroup],
  "child-first-job": [teenAgeGroup],
  "empty-nest-planning": [adultChildAgeGroup]
};

const childTaggedEventIds = new Set([
  "spring-school-garden-day",
  "tree-planting-day",
  "first-bike-ride-of-the-year",
  "backyard-cleanup-weekend",
  "community-cleanup-event",
  "family-hiking-day",
  "spring-break-staycation",
  "farmers-market-opening-day",
  "rainy-saturday-board-game-marathon",
  "family-cottage-trip",
  "community-fair",
  "backyard-bonfire-night",
  "pumpkin-patch-saturday",
  "apple-picking-weekend",
  "harvest-festival"
]);

const choiceFixes = {
  "first-soccer-practice": {
    "Drop off and run errands": {
      effects: { wallet: 1, wellbeing: -1, children: -2 },
      memory: "You dropped your child off at soccer and rushed through errands."
    }
  },
  "rainy-field-trip-chaperone": {
    "Say you cannot go": {
      effects: { wallet: 2, wellbeing: 0, children: -3 },
      memory: "You declined the field trip because your schedule was packed."
    }
  },
  "school-spring-concert": {
    "Go networking": {
      effects: { wallet: 3, reputation: 4, wellbeing: -1, children: -4, marriage: -1 },
      memory: "You chose the networking dinner and missed the concert."
    },
    "Attend concert then arrive late": {
      effects: { wallet: 1, reputation: 2, wellbeing: 1, children: 4 },
      memory: "You saw the performance, then made a late appearance at dinner."
    }
  },
  "spring-flood-in-basement": {
    "Handle it calmly together": {
      effects: { wallet: -4, wellbeing: -1, children: 3, marriage: 1 }
    },
    "Panic and snap at everyone": {
      effects: { wallet: -4, wellbeing: -5, children: -4, marriage: -3 },
      memory: "You got overwhelmed and snapped during the basement flood."
    },
    "Call help and salvage dessert": {
      effects: { wallet: -5, wellbeing: 1, children: 2, marriage: 1 },
      memory: "You called for help, then salvaged part of the evening with dessert."
    }
  },
  "family-hiking-day": {
    "Stay home to catch up": {
      effects: { wallet: 1, wellbeing: -1, children: -3, marriage: -1 },
      memory: "You stayed home and handled chores instead of taking the hike."
    }
  },
  "spring-break-staycation": {
    "Let everyone drift on screens": {
      effects: { wallet: 1, wellbeing: -2, children: -3, marriage: -1 },
      memory: "Spring break slipped into unplanned screen time."
    },
    "Do one special outing": {
      effects: { wallet: -3, wellbeing: 2, children: 4 },
      memory: "You planned one affordable outing and kept the rest simple."
    }
  },
  "school-track-meet": {
    "Stay at work": {
      effects: { wallet: 2, reputation: 2, wellbeing: -1, children: -3 },
      memory: "You missed the race because it was during work."
    },
    "Watch one event and leave": {
      effects: { wallet: 1, reputation: 1, wellbeing: 1, children: 4 },
      memory: "You caught the race, hugged your child, and returned to work."
    }
  }
};

const tidyTitleFragment = (title = "the moment") => title.toLowerCase().replace(/^(the|a|an)\s+/i, "");

const sanitizeEffects = (effects = {}) => Object.fromEntries(
  Object.entries(effects)
    .filter(([key, value]) => effectKeys.has(key) && Number.isFinite(Number(value)))
    .map(([key, value]) => [key, Math.round(Number(value))])
);

const getFamilyAgeGroups = (event) => {
  if (ageGateById[event.id]) return ageGateById[event.id];
  if (childTaggedEventIds.has(event.id)) return [anyChildAgeGroup];
  return event.familyAgeGroups ?? event.familyAgeGroup;
};

const normalizeGenericChoice = (event, choice) => {
  const title = tidyTitleFragment(event.title);

  if (choice.label === "Choose the family moment") {
    return {
      ...choice,
      label: `Make time for ${title}`,
      memory: choice.memory === "You protected the summer family moment."
        ? `You made time for ${title} and protected a seasonal family memory.`
        : choice.memory
    };
  }

  if (choice.label === "Prioritize obligations") {
    return {
      ...choice,
      label: "Skip it for responsibilities",
      memory: choice.memory === "You prioritized obligations over the summer plan."
        ? `You skipped ${title} to keep up with responsibilities.`
        : choice.memory
    };
  }

  if (choice.label === "Compromise carefully") {
    return {
      ...choice,
      label: "Find a smaller version",
      memory: choice.memory === "You found a summer compromise that kept the day partly intact."
        ? `You found a smaller version of ${title} that still let the day feel intentional.`
        : choice.memory
    };
  }

  return choice;
};

const getEffectPattern = (event) => event.choices
  .map((choice) => Object.entries(choice.effects ?? {}).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}:${value}`).join(","))
  .join("|");

const cleanAction = (event) => {
  const fixes = choiceFixes[event.id] ?? {};
  const choices = Array.isArray(event.choices) ? event.choices : [];
  const familyAgeGroups = getFamilyAgeGroups(event);

  return {
    ...event,
    ...(familyAgeGroups ? { familyAgeGroups } : {}),
    choices: choices
      .map((choice) => {
        const normalizedChoice = normalizeGenericChoice(event, choice);
        const fix = fixes[choice.label] ?? fixes[normalizedChoice.label] ?? null;

        return {
          ...normalizedChoice,
          ...(fix ?? {}),
          effects: sanitizeEffects(fix?.effects ?? normalizedChoice.effects)
        };
      })
      .filter((choice) => choice.label && Object.keys(choice.effects ?? {}).length > 0)
  };
};

const generatedActions = generatedActionBlueprints.map((blueprint, index) => ({
  id: `expanded-${index + 1}-${blueprint.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
  title: blueprint.title,
  severity: blueprint.severity ?? (index % 11 === 0 ? "moderate" : "minor"),
  category: blueprint.category,
  icon: blueprint.icon,
  accent: blueprint.accent,
  description: blueprint.description,
  wisdom: blueprint.wisdom ?? "Everyday actions are practice for the life you are building. Choose the response that is kind to both today and next season.",
  tags: blueprint.tags ?? ["general"],
  choices: [
    { label: blueprint.minor[0], effects: blueprint.minor[1], memory: blueprint.minor[2] },
    { label: blueprint.balanced[0], effects: blueprint.balanced[1], memory: blueprint.balanced[2] },
    { label: blueprint.risky[0], effects: blueprint.risky[1], memory: blueprint.risky[2] }
  ]
}));

const refactoredActions = [
  ...careerEvents,
  ...communityEvents,
  ...errandsEvents,
  ...familyEvents,
  ...homeEvents,
  ...parentingEvents,
  ...schoolEvents,
  ...seasonalEvents,
  ...walletEvents,
  ...wellbeingEvents
];

const seenEffectPatterns = new Set();
const actions = [...baseActions, ...familyAgeEvents, ...refactoredActions, ...generatedActions]
  .map(cleanAction)
  .filter((event) => event.id && event.title && event.description && event.choices.length > 0)
  .filter((event) => !lowQualityActionIds.has(event.id))
  .filter((event) => {
    const pattern = getEffectPattern(event);
    const isTemplateSeasonal = event.tags?.includes("summer") || event.tags?.includes("fall") || event.tags?.includes("winter");

    if (!isTemplateSeasonal || !seenEffectPatterns.has(pattern)) {
      seenEffectPatterns.add(pattern);
      return true;
    }

    return false;
  });

export default actions;
