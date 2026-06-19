const criticalSuccessEvents = [
  {
    id: "lucky-break-perfect-timing",
    title: "Lucky Break: Perfect Timing",
    severity: "minor",
    category: "Lucky break",
    icon: "🍀",
    accent: "green",
    description: "A plan you barely had time for lines up perfectly. The babysitter is free, the errand is easy, and everyone is weirdly cooperative.",
    wisdom: "Luck feels better when you have enough courage to notice and use it.",
    tags: ["general", "luck", "critical-success", "fun"],
    choices: [
      { label: "Ride the lucky streak", effects: { wellbeing: 5, children: 3, marriage: 2, memory: 5 }, memory: "Perfect timing turned an ordinary day into a lucky streak." },
      { label: "Share the win", effects: { marriage: 4, children: 4, reputation: 2, memory: 4 }, memory: "You shared the lucky break and made everyone feel included in the win." },
      { label: "Do not overthink it", effects: { wellbeing: 3, wallet: 2, memory: 2 }, memory: "You accepted the lucky break without turning it into a spreadsheet." }
    ]
  },
  {
    id: "core-memory-spark",
    title: "Core Memory Spark",
    severity: "minor",
    category: "Critical success",
    icon: "🏆",
    accent: "violet",
    description: "A small choice lands with oversized emotional impact. Someone repeats your joke later, and you realize the day mattered.",
    wisdom: "The score is not always the point. Sometimes the memory is the multiplier.",
    tags: ["general", "critical-success", "family", "fun"],
    choices: [
      { label: "Name the moment", effects: { children: 5, marriage: 2, memory: 8 }, memory: "You named the moment as special, and it became a core memory." },
      { label: "Keep playing", effects: { wellbeing: 4, children: 5, memory: 6 }, memory: "You kept the playful momentum going and turned it into a family story." },
      { label: "Let it stay quiet", effects: { wellbeing: 3, memory: 4 }, memory: "You let the good moment stay quiet and still felt it settle in." }
    ]
  }
];

const achievementEvents = [
  {
    id: "achievement-dessert-bandit",
    title: "Achievement Hunt: Dessert Bandit",
    severity: "minor",
    category: "Achievement",
    icon: "🏅",
    accent: "amber",
    description: "The family starts joking that spontaneous dessert has become your signature move. A fake badge is proposed.",
    wisdom: "Achievements work because they make invisible patterns visible enough to celebrate.",
    tags: ["general", "achievement", "family", "fun"],
    choices: [
      { label: "Accept the fake badge", effects: { wellbeing: 4, children: 5, marriage: 2, memory: 6 }, memory: "You accepted the Dessert Bandit badge and gave the family a running joke." },
      { label: "Make a badge board", effects: { children: 6, memory: 6, wallet: -1 }, memory: "You made a tiny achievement board for family legends and ridiculous wins." },
      { label: "Retire undefeated", effects: { wallet: 2, wellbeing: 1, children: -1 }, memory: "You retired the Dessert Bandit bit before it became a household institution." }
    ]
  },
  {
    id: "achievement-chaos-survivor",
    title: "Achievement Hunt: Chaos Survivor",
    severity: "moderate",
    category: "Achievement",
    icon: "🎖️",
    accent: "rose",
    description: "After a brutal season, everyone realizes you did not exactly thrive, but you did keep the story moving. That counts.",
    wisdom: "Survival is not glamorous, but it deserves a scoreboard when it protects the next chapter.",
    condition: { conditionOp: "OR", conditions: [
      { stat: "wellbeing", op: "lte", value: 35 },
      { stat: "wallet", op: "lte", value: 35 },
      { stat: "marriage", op: "lte", value: 35 },
      { stat: "children", op: "lte", value: 35 }
    ] },
    tags: ["general", "achievement", "recovery", "fun"],
    choices: [
      { label: "Celebrate surviving", effects: { wellbeing: 4, marriage: 2, children: 2, memory: 5 }, memory: "You celebrated surviving a rough chapter instead of pretending it was easy." },
      { label: "Declare a recovery quest", effects: { wellbeing: 5, reputation: 2, memory: 4 }, memory: "You turned survival into a recovery quest with a name and a plan." },
      { label: "Keep grinding silently", effects: { reputation: 2, wellbeing: -2, memory: -1 }, memory: "You kept grinding silently and missed the morale boost of marking the milestone." }
    ]
  }
];

const storyChainEvents = [
  {
    id: "story-chain-guitar-in-closet",
    title: "Story Chain: Guitar in the Closet",
    severity: "minor",
    category: "Story chain",
    icon: "🎸",
    accent: "indigo",
    description: "You find an old guitar in the closet. It is out of tune, dusty, and somehow full of possible futures.",
    wisdom: "A story chain starts when a tiny object gives the family permission to become slightly different people.",
    tags: ["general", "story-chain", "memory", "fun"],
    choices: [
      { label: "Learn three chords", effects: { wellbeing: 4, children: 3, memory: 5 }, memory: "You learned three chords and accidentally opened a family music arc." },
      { label: "Teach the family a song", effects: { children: 5, marriage: 2, memory: 7 }, memory: "You taught the family a song and started a new household ritual." },
      { label: "Sell it online", effects: { wallet: 4, memory: -2 }, memory: "You sold the guitar and closed the music arc before it began." }
    ]
  },
  {
    id: "story-chain-family-band",
    title: "Story Chain: The Family Band",
    severity: "moderate",
    category: "Story chain",
    icon: "🥁",
    accent: "violet",
    description: "The three-chord experiment evolves. Someone finds a pot lid, someone invents a terrible band name, and suddenly there is a set list.",
    wisdom: "Long-term stories become fun when the game remembers your willingness to be a little ridiculous.",
    tags: ["general", "story-chain", "family", "fun"],
    choices: [
      { label: "Play the backyard debut", effects: { wellbeing: 5, children: 7, marriage: 3, reputation: 2, memory: 8 }, memory: "The family band played a backyard debut that became a legendary inside joke." },
      { label: "Keep it private", effects: { wellbeing: 3, children: 5, memory: 5 }, memory: "The family band stayed private and became a cozy recurring ritual." },
      { label: "Cancel rehearsal forever", effects: { reputation: 1, children: -3, memory: -3 }, memory: "You cancelled the family band before it could become a proper story." }
    ]
  }
];

const personalityEvents = [
  {
    id: "trait-chaos-goblin-weekend",
    title: "Trait Moment: Chaos Goblin Weekend",
    severity: "minor",
    category: "Personality trait",
    icon: "🧌",
    accent: "green",
    description: "The responsible plan is fine. The chaotic plan has costumes, pancakes for dinner, and a suspiciously detailed treasure map.",
    wisdom: "Personality makes the same situation replay differently. Your flaw can also be your flavor.",
    tags: ["general", "personality", "fun"],
    choices: [
      { label: "Choose joyful chaos", effects: { wellbeing: 5, children: 6, marriage: 2, wallet: -2, memory: 7 }, memory: "You chose joyful chaos and the weekend became a story." },
      { label: "Balance chaos with one rule", effects: { wellbeing: 4, children: 4, marriage: 3, memory: 5 }, memory: "You let the chaos breathe while keeping one sensible rule intact." },
      { label: "Force normalcy", effects: { reputation: 2, wallet: 1, children: -2, memory: -2 }, memory: "You forced normalcy and the chaos goblin went back into hiding." }
    ]
  },
  {
    id: "trait-peacemaker-table",
    title: "Trait Moment: Peacemaker Table",
    severity: "moderate",
    category: "Personality trait",
    icon: "🕊️",
    accent: "blue",
    description: "Two people you care about are talking past each other. You can ignore it, fix it, or turn the tension into an honest ritual.",
    wisdom: "Traits are more fun when they create tradeoffs instead of flat bonuses.",
    tags: ["general", "personality", "relationship"],
    choices: [
      { label: "Host a repair meal", effects: { marriage: 5, children: 3, wellbeing: -2, memory: 5 }, memory: "You hosted a repair meal and helped the table feel safer." },
      { label: "Make a joke first", effects: { wellbeing: 3, marriage: 3, children: 2, memory: 3 }, memory: "You used humor to soften the tension before the honest part." },
      { label: "Stay out of it", effects: { wellbeing: 2, marriage: -3, children: -2 }, memory: "You stayed out of the tension and it lingered longer than expected." }
    ]
  }
];

const midlifeRetirementEvents = [
  {
    id: "midlife-drum-kit",
    title: "Midlife Crisis: Drum Kit Appears",
    severity: "moderate",
    category: "Midlife crisis",
    icon: "🥁",
    accent: "rose",
    description: "A drum kit appears online at a dangerous discount. It promises noise, reinvention, and one very concerned household group chat.",
    wisdom: "Midlife content is fun when it asks whether reinvention is a crisis, a hobby, or both.",
    tags: ["midlife", "general", "fun"],
    choices: [
      { label: "Buy the drums", effects: { wellbeing: 7, memory: 6, wallet: -6, marriage: -2 }, memory: "You bought the drum kit and declared a loud new era." },
      { label: "Take one lesson first", effects: { wellbeing: 5, reputation: 1, wallet: -2, memory: 4 }, memory: "You took one drum lesson before committing to the loud new era." },
      { label: "Close the tab", effects: { wallet: 3, wellbeing: -2, memory: -1 }, memory: "You closed the drum-kit tab and returned to responsible adulthood." }
    ]
  },
  {
    id: "retirement-weird-quest",
    title: "Retirement Quest Board",
    severity: "minor",
    category: "Retirement",
    icon: "🧭",
    accent: "teal",
    description: "The future starts looking less like a calendar and more like a quest board: learn pottery, visit odd museums, become suspiciously good at soup.",
    wisdom: "Retirement is more than stopping work. It is choosing what kind of side quests deserve the empty squares.",
    condition: { stat: "reputation", op: "gte", value: 55 },
    tags: ["retirement", "general", "fun"],
    choices: [
      { label: "Make the quest board", effects: { wellbeing: 5, marriage: 3, memory: 6 }, memory: "You made a retirement quest board and gave the future a playful shape." },
      { label: "Start with one odd museum", effects: { wellbeing: 4, memory: 5, wallet: -1 }, memory: "You started the retirement quest board with one excellent odd museum." },
      { label: "Keep maximizing productivity", effects: { reputation: 3, wellbeing: -3, memory: -2 }, memory: "You kept optimizing productivity and postponed the playful future." }
    ]
  }
];

const advancedFunEvents = [
  ...criticalSuccessEvents,
  ...achievementEvents,
  ...storyChainEvents,
  ...personalityEvents,
  ...midlifeRetirementEvents
];

export default advancedFunEvents;
