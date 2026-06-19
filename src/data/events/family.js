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
    id: "child-keeps-score",
    tags: ["parenting", "teen", "young-family"],
    title: "Your Child Keeps Score",
    description: "A child brings up a pattern you hoped they had not noticed: missed events, distracted promises, or choosing work first too often.",
    wisdom: "Children do not need perfect attendance. They need repair that admits the pattern without arguing with their memory.",
    severity: "major",
    category: "Family consequence",
    icon: "🧾",
    accent: "rose",
    familyAgeGroups: [youngChildAgeGroup, teenAgeGroup],
    condition: { stat: "children", op: "lte", value: 45 },
    choices: [
      {
        label: "Own the pattern and repair",
        memory: "You admitted the pattern your child named and started repairing it without excuses.",
        effects: { children: 8, wellbeing: -2, memory: 4 }
      },
      {
        label: "Defend your choices",
        memory: "You defended your choices and made your child feel like the evidence of their own life was on trial.",
        effects: { children: -8, marriage: -2, wellbeing: -3 }
      },
      {
        label: "Make a visible commitment",
        memory: "You made one visible commitment your child could actually watch you keep.",
        effects: { children: 6, wellbeing: -1, marriage: 1 }
      }
    ]
  },
  {
    id: "family-trust-dividend",
    tags: ["parenting", "family", "general"],
    title: "Family Trust Dividend",
    description: "A difficult week lands, and the family handles it better than expected because trust has been quietly built over time.",
    wisdom: "Strong family bonds do not remove hard days. They make hard days less lonely.",
    severity: "minor",
    category: "Family payoff",
    icon: "🌱",
    accent: "green",
    familyAgeGroups: [youngChildAgeGroup, teenAgeGroup, adultChildAgeGroup],
    condition: { stat: "children", op: "gte", value: 75 },
    choices: [
      {
        label: "Let everyone contribute",
        memory: "You let the family trust you had built become shared resilience instead of doing everything yourself.",
        effects: { children: 6, wellbeing: 4, memory: 3 }
      },
      {
        label: "Take over anyway",
        memory: "You took over even though the family was ready to help, and the trust had less room to grow.",
        effects: { wellbeing: -2, children: -1 }
      },
      {
        label: "Name what worked",
        memory: "You named the family's resilience out loud so everyone could recognize what they had become.",
        effects: { children: 5, marriage: 2, memory: 4 }
      }
    ]
  },
  {
    id: "marriage-repair-window",
    tags: ["relationship", "midlife", "general"],
    title: "Marriage Repair Window",
    description: "A small opening appears after a tense stretch: an apology, a quiet drive, or one honest sentence that could become more.",
    wisdom: "Repair usually arrives smaller than the damage. Take the opening before pride edits it away.",
    severity: "moderate",
    category: "Relationship consequence",
    icon: "🪡",
    accent: "rose",
    condition: { stat: "marriage", op: "lte", value: 45 },
    choices: [
      {
        label: "Step into the repair",
        memory: "You took the small repair window seriously before the distance became normal.",
        effects: { marriage: 9, wellbeing: 2, memory: 2 }
      },
      {
        label: "Wait for them to fix it",
        memory: "You waited for your spouse to repair things first and the opening closed quietly.",
        effects: { marriage: -6, wellbeing: -2 }
      },
      {
        label: "Suggest outside help",
        memory: "You suggested outside help and treated the relationship like something worth protecting professionally.",
        effects: { marriage: 7, wallet: -3, wellbeing: 1 }
      }
    ]
  },
  {
    id: "marriage-strength-carries-season",
    tags: ["relationship", "family", "general"],
    title: "Partnership Carries the Season",
    description: "A hard decision comes up, but you and your spouse move like a practiced team instead of opponents.",
    wisdom: "A strong partnership is a multiplier. It does not make life easy, but it makes hard things less chaotic.",
    severity: "minor",
    category: "Relationship payoff",
    icon: "🤝",
    accent: "green",
    condition: { stat: "marriage", op: "gte", value: 80 },
    choices: [
      {
        label: "Decide as a team",
        memory: "You and your spouse made the hard call together, and the unity became its own kind of relief.",
        effects: { marriage: 5, wellbeing: 4, children: 2 }
      },
      {
        label: "Let one person carry it",
        memory: "One person carried the decision unnecessarily, even though the partnership was strong enough to share it.",
        effects: { marriage: -2, wellbeing: -2 }
      },
      {
        label: "Celebrate the teamwork",
        memory: "You noticed how far the partnership had come and celebrated the teamwork instead of rushing past it.",
        effects: { marriage: 6, memory: 3, wellbeing: 2 }
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
