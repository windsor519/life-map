const youngChildAgeGroup = { minAge: 0, maxAge: 12 };
const teenAgeGroup = { minAge: 13, maxAge: 19 };
const adultChildAgeGroup = { minAge: 20, maxAge: 40 };

const familyEvents = [
  {
    id: "young-child-bedtime-regression",
    tags: ["young-family", "parenting", "general"],
    title: "Bedtime Regression",
    description: "Your young child starts fighting bedtime again, just when evenings had finally become predictable.",
    wisdom: "Regressions are not failures. They are often requests for steadiness in a body that is changing faster than language can explain.",
    severity: "minor",
    category: "Parenting",
    icon: "🌙",
    accent: "blue",
    familyAgeGroups: [youngChildAgeGroup],
    choices: [
      {
        label: "Reset the routine patiently",
        memory: "You rebuilt bedtime with patience instead of turning every night into a battle.",
        effects: { wellbeing: -1, children: 5, marriage: 1 }
      },
      {
        label: "Clamp down hard",
        memory: "You tried to force bedtime back into shape and the evenings got tense.",
        effects: { wellbeing: -4, children: -3, marriage: -2 }
      },
      {
        label: "Trade off bedtime duty",
        memory: "You and your partner took turns handling bedtime so nobody carried the whole regression alone.",
        effects: { wellbeing: 2, children: 3, marriage: 3 }
      }
    ]
  },
  {
    id: "teen-driving-boundaries",
    tags: ["teen", "parenting", "general"],
    title: "Teen Driving Boundaries",
    description: "Your teen wants more driving freedom, but a few recent choices make you wonder if they are ready.",
    wisdom: "Freedom lands best when responsibility has somewhere to stand. Clear limits can be a bridge instead of a wall.",
    severity: "moderate",
    category: "Teen parenting",
    icon: "🚘",
    accent: "amber",
    familyAgeGroups: [teenAgeGroup],
    choices: [
      {
        label: "Set a step-by-step agreement",
        memory: "You made a driving agreement that gave your teen freedom with visible guardrails.",
        effects: { children: 6, wellbeing: 1, marriage: 2 }
      },
      {
        label: "Say no without discussion",
        memory: "You shut down the driving request without discussion and trust got thinner.",
        effects: { children: -5, wellbeing: -2, marriage: -1 }
      },
      {
        label: "Give full freedom now",
        memory: "You gave driving freedom before the trust structure was ready.",
        effects: { children: -3, wellbeing: -4, wallet: -2 }
      }
    ]
  },
  {
    id: "teen-big-feelings-late-night",
    tags: ["teen", "parenting", "relationship"],
    title: "Late-Night Teen Talk",
    description: "Your teen opens up at the worst possible hour, just as you were finally about to sleep.",
    wisdom: "Teenagers rarely schedule vulnerability at convenient times. The door opens when it opens.",
    severity: "minor",
    category: "Teen parenting",
    icon: "💬",
    accent: "violet",
    familyAgeGroups: [teenAgeGroup],
    choices: [
      {
        label: "Stay present and listen",
        memory: "You stayed up for the late-night talk and your teen trusted you with more than usual.",
        effects: { wellbeing: -2, children: 8, memory: 4 }
      },
      {
        label: "Promise to talk tomorrow",
        memory: "You postponed the late-night conversation and hoped the moment would return.",
        effects: { wellbeing: 2, children: -3 }
      },
      {
        label: "Listen for ten focused minutes",
        memory: "You gave your teen a focused check-in and made a clear plan to continue.",
        effects: { wellbeing: -1, children: 5, marriage: 1 }
      }
    ]
  },
  {
    id: "adult-child-moving-out-again",
    tags: ["empty-nest", "family", "wallet"],
    title: "Adult Child Moves Out Again",
    description: "An adult child who came home during a rough stretch is ready to move out again, and the house feels both lighter and quieter.",
    wisdom: "Launching can feel like loss and success at the same time. Good parenting eventually makes itself less necessary.",
    severity: "moderate",
    category: "Family transition",
    icon: "🧳",
    accent: "teal",
    familyAgeGroups: [adultChildAgeGroup],
    choices: [
      {
        label: "Send them with confidence",
        memory: "You helped your adult child relaunch without making them feel like a burden.",
        effects: { children: 7, wellbeing: 3, wallet: -2, memory: 3 }
      },
      {
        label: "Focus on getting space back",
        memory: "You treated the move-out mostly as a relief and missed the emotional transition.",
        effects: { wellbeing: 3, children: -3, marriage: 1 }
      },
      {
        label: "Offer too much support",
        memory: "You over-supported the relaunch and blurred the line between help and dependence.",
        effects: { children: 2, wallet: -6, wellbeing: -2 }
      }
    ]
  },
  {
    id: "empty-nest-dinner-table",
    tags: ["empty-nest", "relationship", "family"],
    title: "Quiet Dinner Table",
    description: "The dinner table is suddenly quieter, and you and your spouse realize the house has changed shape.",
    wisdom: "Empty space is not only absence. It can become a new room for friendship, grief, and rediscovery.",
    severity: "minor",
    category: "Empty nest",
    icon: "🍽️",
    accent: "rose",
    familyAgeGroups: [adultChildAgeGroup],
    choices: [
      {
        label: "Name the transition together",
        memory: "You and your spouse talked honestly about the quiet house instead of pretending nothing changed.",
        effects: { marriage: 6, wellbeing: 2, memory: 3 }
      },
      {
        label: "Fill the silence with tasks",
        memory: "You buried the empty-nest feeling under projects and errands.",
        effects: { wallet: 1, wellbeing: -2, marriage: -2 }
      },
      {
        label: "Invite the kids for dinner",
        memory: "You created a new dinner rhythm that welcomed adult children without pulling them backward.",
        effects: { children: 5, marriage: 3, wallet: -2 }
      }
    ]
  }
];

export default familyEvents;
