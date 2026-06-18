import { baseEvents, generatedEventBlueprints } from "./events.json";
import familyAgeEvents from "./family_age_events.json";
import careerEvents from "./events/career.js";
import communityEvents from "./events/community.js";
import errandsEvents from "./events/errands.js";
import familyEvents from "./events/family.js";
import homeEvents from "./events/home.js";
import parentingEvents from "./events/parenting.js";
import schoolEvents from "./events/school.js";
import seasonalEvents from "./events/seasonal.js";
import unexpectedEvents from "./events/unexpected.js";
import walletEvents from "./events/wallet.js";
import wellbeingEvents from "./events/wellbeing.js";

const generatedEvents = Array.from({ length: 279 }, (_, index) => {
  const blueprint = generatedEventBlueprints[index % generatedEventBlueprints.length];
  const cycle = Math.floor(index / generatedEventBlueprints.length) + 1;
  const severity = blueprint.severity ?? (index % 11 === 0 ? "moderate" : "minor");
  const titleSuffix = cycle > 1 ? ` ${cycle}` : "";

  return {
    id: `expanded-${index + 1}-${blueprint.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
    title: `${blueprint.title}${titleSuffix}`,
    severity,
    category: blueprint.category,
    icon: blueprint.icon,
    accent: blueprint.accent,
    description: blueprint.description,
    wisdom: blueprint.wisdom ?? "Everyday events are practice for the life you are building. Choose the response that is kind to both today and next season.",
    tags: blueprint.tags ?? ["general"],
    choices: [
      { label: blueprint.minor[0], effects: blueprint.minor[1], memory: blueprint.minor[2] },
      { label: blueprint.balanced[0], effects: blueprint.balanced[1], memory: blueprint.balanced[2] },
      { label: blueprint.risky[0], effects: blueprint.risky[1], memory: blueprint.risky[2] }
    ]
  };
});

const refactoredEvents = [
  ...careerEvents,
  ...communityEvents,
  ...errandsEvents,
  ...familyEvents,
  ...homeEvents,
  ...parentingEvents,
  ...schoolEvents,
  ...seasonalEvents,
  ...unexpectedEvents,
  ...walletEvents,
  ...wellbeingEvents
];

const events = [...baseEvents, ...familyAgeEvents, ...refactoredEvents, ...generatedEvents];

export default events;
