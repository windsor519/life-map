const walletEvents = [
  {
    id: "retirement-date-decision",
    tags: ["retirement", "late-life", "wallet"],
    title: "Retirement Date Decision",
    description: "You could retire soon, work a few more years, or redesign work instead of stopping all at once.",
    wisdom: "Retirement is not only a financial calculation. It is a question about purpose, rhythm, and who you will be on ordinary Tuesdays.",
    severity: "major",
    category: "Retirement",
    icon: "🏖️",
    accent: "teal",
    condition: { stat: "wallet", op: "gte", value: 60 },
    choices: [
      {
        label: "Retire on schedule",
        memory: "You retired when planned and began building a new rhythm intentionally.",
        effects: { wellbeing: 6, memory: 5, wallet: -2 }
      },
      {
        label: "Work longer for security",
        memory: "You worked longer to strengthen the financial picture before stepping away.",
        effects: { wallet: 6, wellbeing: -2, memory: -1 }
      },
      {
        label: "Shift into part-time work",
        memory: "You created a gradual retirement instead of treating it like an on-off switch.",
        effects: { wallet: 2, wellbeing: 4, memory: 3 }
      }
    ]
  },
  {
    id: "downsizing-the-home",
    tags: ["retirement", "late-life", "home"],
    title: "Downsizing the Home",
    description: "The family home has become more work than shelter. Selling it would simplify life, but every room contains history.",
    wisdom: "A house stores memories, but it is not the memories. Sometimes carrying less creates room to remember more clearly.",
    severity: "moderate",
    category: "Late-life transition",
    icon: "🏠",
    accent: "amber",
    choices: [
      {
        label: "Downsize thoughtfully",
        memory: "You downsized carefully and preserved the stories without preserving every object.",
        effects: { wallet: 6, wellbeing: 4, memory: 2 }
      },
      {
        label: "Refuse any change",
        memory: "You stayed in a house that no longer fit because leaving felt like losing part of yourself.",
        effects: { wallet: -3, wellbeing: -2, memory: 1 }
      },
      {
        label: "Turn it into a gathering place",
        memory: "You kept the home and made a deliberate effort to keep it full of people.",
        effects: { wallet: -4, children: 4, memory: 4 }
      }
    ]
  },
  {
    id: "pension-shortfall",
    tags: ["retirement", "wallet", "late-life"],
    title: "Pension Shortfall",
    description: "A projection shows retirement income may be lower than expected.",
    wisdom: "Financial surprises are easier to face while they are still numbers on paper instead of emergencies in motion.",
    severity: "major",
    category: "Financial planning",
    icon: "📉",
    accent: "red",
    choices: [
      {
        label: "Adjust the plan now",
        memory: "You adjusted retirement plans early enough to preserve options.",
        effects: { wallet: 3, wellbeing: -1, memory: 1 }
      },
      {
        label: "Pretend it will work out",
        memory: "You ignored the pension shortfall because the numbers were uncomfortable.",
        effects: { wallet: -8, wellbeing: -4 }
      },
      {
        label: "Seek expert advice",
        memory: "You brought in financial advice and turned uncertainty into a clearer path.",
        effects: { wallet: 5, wellbeing: 2, memory: 1 }
      }
    ]
  },
  {
    id: "caregiving-costs-rise",
    tags: ["eldercare", "wallet", "late-life"],
    title: "Caregiving Costs Rise",
    description: "Medical, transportation, and support costs for a loved one begin climbing faster than expected.",
    wisdom: "Care often costs money, time, and emotion simultaneously. A sustainable plan must account for all three.",
    severity: "major",
    category: "Caregiving",
    icon: "💊",
    accent: "violet",
    choices: [
      {
        label: "Create a realistic budget",
        memory: "You faced caregiving costs honestly and built a plan around reality instead of hope.",
        effects: { wallet: -3, wellbeing: 1, memory: 2 }
      },
      {
        label: "Cover everything personally",
        memory: "You absorbed every caregiving expense until the strain reached other parts of life.",
        effects: { wallet: -9, wellbeing: -5, marriage: -2 }
      },
      {
        label: "Share responsibility",
        memory: "You spread caregiving responsibilities across family and support systems.",
        effects: { wallet: -2, wellbeing: 3, marriage: 2 }
      }
    ]
  },
  {
    id: "estate-plan-review",
    tags: ["retirement", "legacy", "late-life"],
    title: "Estate Plan Review",
    description: "You realize key documents, wishes, and practical details are scattered or outdated.",
    wisdom: "Estate planning is one of the quietest forms of care. It gives clarity to people who may someday need it most.",
    severity: "moderate",
    category: "Legacy",
    icon: "📜",
    accent: "indigo",
    choices: [
      {
        label: "Update everything",
        memory: "You updated your estate plan and removed uncertainty for the people you love.",
        effects: { wellbeing: 3, memory: 5, wallet: -2 }
      },
      {
        label: "Keep postponing it",
        memory: "You postponed estate planning again because it felt easier not to think about it.",
        effects: { wellbeing: -2, memory: -3 }
      },
      {
        label: "Discuss wishes openly",
        memory: "You had difficult but meaningful conversations about future wishes and responsibilities.",
        effects: { marriage: 3, children: 3, memory: 4 }
      }
    ]
  },
  {
    id: "legacy-gift-decision",
    tags: ["legacy", "retirement", "family"],
    title: "Legacy Gift Decision",
    description: "You have the chance to make a meaningful gift to family, community, or a cause that shaped your life.",
    wisdom: "Legacy is not only what you leave behind. It is what you strengthen while you are still here to watch it grow.",
    severity: "minor",
    category: "Legacy",
    icon: "🎁",
    accent: "green",
    condition: { stat: "wallet", op: "gte", value: 70 },
    choices: [
      {
        label: "Support family directly",
        memory: "You made a gift that helped the next generation gain a stronger footing.",
        effects: { wallet: -5, children: 6, memory: 4 }
      },
      {
        label: "Support a cause",
        memory: "You invested in a cause whose impact would outlive your involvement.",
        effects: { wallet: -5, reputation: 4, memory: 6 }
      },
      {
        label: "Keep the resources",
        memory: "You decided financial flexibility was more valuable than making a legacy gift right now.",
        effects: { wallet: 2, memory: -1 }
      }
    ]
  }
];

export default walletEvents;
