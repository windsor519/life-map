const youngChildAgeGroup = { minAge: 0, maxAge: 12 };
const anyChildAgeGroup = { minAge: 0, maxAge: 40 };

const unexpectedEvents = [
  {
    id: "backyard-storm-night",
    title: "Backyard Storm Night",
    severity: "minor",
    category: "Unexpected home disruption",
    icon: "⛈️",
    accent: "violet",
    description: "A hot summer thunderstorm knocks out the power during family movie night, while your phone keeps buzzing with work messages.",
    wisdom: "Not every interruption is a problem. Sometimes the power going out is the only way the family turns back on.",
    effects: {
      wallet: -1,
      wellbeing: -2,
      children: 2,
      marriage: 1
    },
    memory: "The power outage interrupted the plan, but you turned the dark house into a candlelit family story.",
    seasons: ["summer"],
    tags: ["young-family", "summer", "home"],
    familyAgeGroups: [anyChildAgeGroup]
  },
  {
    id: "halloween-costume-crisis",
    title: "Halloween Costume Crisis",
    severity: "minor",
    category: "Parenting scramble",
    icon: "🎃",
    accent: "amber",
    description: "The Halloween costume plan falls apart two days before trick-or-treating.",
    wisdom: "Improvisation is part of the costume. Children often remember the rescue more than the original plan.",
    effects: {
      wallet: -2,
      wellbeing: -1,
      children: 3
    },
    memory: "You improvised a costume fix under pressure, and the scramble became part of the Halloween story.",
    seasons: ["fall"],
    tags: ["young-family", "fall", "holiday"],
    familyAgeGroups: [youngChildAgeGroup]
  },
  {
    id: "ice-storm-power-outage",
    title: "Ice Storm Power Outage",
    severity: "moderate",
    category: "Home emergency",
    icon: "⛈️",
    accent: "blue",
    description: "An ice storm knocks out power and turns the house cold by dinner.",
    wisdom: "In winter, warmth is both a temperature and a tone. Safety first, blame never.",
    effects: {
      wallet: -4,
      wellbeing: -7,
      children: -2,
      marriage: -1
    },
    memory: "An ice storm power outage forced the household into emergency mode and made preparation feel urgent.",
    seasons: ["winter"],
    tags: ["general", "winter", "home", "emergency"]
  },
  {
    id: "frozen-pipe-emergency",
    title: "Frozen Pipe Emergency",
    severity: "moderate",
    category: "Home emergency",
    icon: "🚰",
    accent: "blue",
    description: "A pipe freezes overnight, and the morning routine collapses.",
    wisdom: "Home emergencies are easier when blame stays out of the room.",
    effects: {
      wallet: -6,
      wellbeing: -5,
      marriage: -2
    },
    memory: "A frozen pipe disrupted the morning and turned into a real repair bill.",
    seasons: ["winter"],
    tags: ["general", "winter", "home", "emergency"]
  },
  {
    id: "holiday-travel-delays",
    title: "Holiday Travel Delays",
    severity: "minor",
    category: "Travel disruption",
    icon: "✈️",
    accent: "violet",
    description: "Holiday travel delays strand your family in an airport or station for hours.",
    wisdom: "Children learn how to handle disappointment by watching adults handle delays.",
    effects: {
      wallet: -2,
      wellbeing: -4,
      children: -1,
      marriage: -1
    },
    memory: "Holiday travel delays burned time, money, and patience before the family finally arrived.",
    seasons: ["winter"],
    tags: ["general", "winter", "travel"],
    familyAgeGroups: [anyChildAgeGroup]
  },
  {
    id: "teen-curfew-breach",
    title: "Teen Misses Curfew",
    severity: "moderate",
    category: "Teen parenting",
    icon: "🕰️",
    accent: "rose",
    description: "Your teenager misses curfew and gives a vague explanation that leaves everyone tense.",
    wisdom: "Trust is repaired with clarity, not volume. The consequence should teach the next decision, not just punish the last one.",
    effects: {
      wellbeing: -4,
      children: -6,
      marriage: -2
    },
    memory: "A missed curfew forced a hard conversation about trust, safety, and independence.",
    tags: ["teen", "parenting", "general"],
    familyAgeGroups: [{ minAge: 13, maxAge: 19 }],
    condition: { stat: "children", op: "lte", value: 70 }
  },
  {
    id: "adult-child-calls-for-help",
    title: "Adult Child Calls for Help",
    severity: "moderate",
    category: "Family transition",
    icon: "📞",
    accent: "teal",
    description: "An adult child calls with a problem big enough that advice alone may not be enough.",
    wisdom: "Parenting does not end; it changes shape. Help should protect dignity as much as it solves the immediate problem.",
    effects: {
      wallet: -4,
      wellbeing: -3,
      children: 4,
      marriage: -1
    },
    memory: "You helped an adult child through a difficult moment without taking over their whole life.",
    tags: ["empty-nest", "family", "general"],
    familyAgeGroups: [{ minAge: 20, maxAge: 40 }]
  },
  {
    id: "retirement-paperwork-snag",
    title: "Retirement Paperwork Snag",
    severity: "moderate",
    category: "Late-life planning",
    icon: "📄",
    accent: "amber",
    description: "A retirement, pension, or benefits form comes back with a problem that threatens to delay plans.",
    wisdom: "The future gets calmer when paperwork stops being mysterious. Annoying details are still part of care.",
    effects: {
      wellbeing: -4,
      wallet: -3,
      marriage: -1
    },
    memory: "A retirement paperwork snag made the next chapter feel less automatic and more fragile.",
    tags: ["late-life", "wallet", "general"],
    condition: { stat: "wallet", op: "gte", value: 55 }
  }
];

export default unexpectedEvents;
