const seasonalEvents = [
  {
    id: "spring-garden-day",
    tags: ["general"],
    title: "Spring Garden Day",
    description: "A neighborhood garden day lands on your calendar just as errands and screens start competing for the same Saturday.",
    wisdom: "Seasonal rituals make ordinary weeks feel memorable. A small spring project can turn into sunlight, movement, and people knowing each other's names.",
    severity: "minor",
    category: "Seasonal",
    icon: "🌱",
    accent: "emerald",
    seasons: ["spring"],
    choices: [
      {
        label: "Join the planting crew",
        memory: "You spent a spring morning planting with neighbors.",
        effects: { wellbeing: 8, children: 4, wallet: -1 }
      },
      {
        label: "Donate supplies only",
        memory: "You supported the garden day with supplies from a distance.",
        effects: { wellbeing: 2, wallet: -3 }
      },
      {
        label: "Skip it for errands",
        memory: "You skipped the spring garden day to clear practical chores.",
        effects: { wallet: 1, wellbeing: -2 }
      }
    ]
  },
  {
    id: "spring-cleanout",
    tags: ["general"],
    title: "Spring Cleanout",
    description: "The first bright weekend makes the closets, garage, and old paperwork feel impossible to ignore.",
    wisdom: "Clearing space is rarely just about stuff. It lowers friction for the life you keep saying you want to live.",
    severity: "minor",
    category: "Seasonal",
    icon: "🧹",
    accent: "green",
    seasons: ["spring"],
    choices: [
      {
        label: "Make it a family reset",
        memory: "You turned spring cleaning into a shared family reset.",
        effects: { wellbeing: 7, children: 5, marriage: 3 }
      },
      {
        label: "Hire a junk pickup",
        memory: "You paid for help clearing out the spring clutter.",
        effects: { wellbeing: 8, wallet: -5 }
      },
      {
        label: "Close the closet door",
        memory: "You postponed the spring cleanout for another season.",
        effects: { wellbeing: -4, wallet: 1 }
      }
    ]
  },
  {
    id: "spring-allergy-surge",
    tags: ["general"],
    title: "Spring Allergy Surge",
    description: "Pollen hits hard this week, and everyone is crankier, sleepier, and a little less patient.",
    wisdom: "Small preventive care protects more than comfort. It protects mood, patience, and the energy you bring home.",
    severity: "moderate",
    category: "Seasonal",
    icon: "🌼",
    accent: "lime",
    seasons: ["spring"],
    choices: [
      {
        label: "Handle it proactively",
        memory: "You got ahead of spring allergies with supplies and calmer routines.",
        effects: { wellbeing: 9, wallet: -2, children: 2 }
      },
      {
        label: "Tough it out",
        memory: "You tried to push through the spring allergy surge.",
        effects: { wellbeing: -6, wallet: 1 }
      },
      {
        label: "Move plans indoors",
        memory: "You adjusted spring plans around allergies without cancelling connection.",
        effects: { wellbeing: 4, marriage: 2, children: 3 }
      }
    ]
  },
  {
    id: "summer-heat-wave",
    tags: ["general"],
    title: "Summer Heat Wave",
    description: "A string of hot days strains sleep, patience, and the utility bill at the same time.",
    wisdom: "Heat makes invisible stress visible. Protecting rest and hydration is a household leadership decision, not a luxury.",
    severity: "moderate",
    category: "Seasonal",
    icon: "🥵",
    accent: "orange",
    seasons: ["summer"],
    choices: [
      {
        label: "Cool the house down",
        memory: "You prioritized cooling and rest during the summer heat wave.",
        effects: { wellbeing: 8, wallet: -5, children: 3 }
      },
      {
        label: "Visit public cool spots",
        memory: "You beat the heat with libraries, splash pads, and shaded outings.",
        effects: { wellbeing: 6, children: 5, wallet: -1 }
      },
      {
        label: "Power through it",
        memory: "You tried to power through the heat wave without changing much.",
        effects: { wellbeing: -8, marriage: -2, wallet: 1 }
      }
    ]
  },
  {
    id: "summer-family-cookout",
    tags: ["young-family", "general"],
    title: "Summer Family Cookout",
    description: "Relatives float the idea of a big cookout, but hosting would cost money and coordination.",
    wisdom: "Traditions do not need to be elaborate to become anchors. Shared food and a predictable gathering can give a family a place to return to.",
    severity: "minor",
    category: "Seasonal",
    icon: "🍉",
    accent: "red",
    seasons: ["summer"],
    choices: [
      {
        label: "Host a simple cookout",
        memory: "You hosted a simple summer cookout that brought people together.",
        effects: { wallet: -4, wellbeing: 5, children: 5, marriage: 3 }
      },
      {
        label: "Make it potluck",
        memory: "You organized a potluck cookout and shared the load.",
        effects: { wallet: -1, wellbeing: 4, children: 4, marriage: 2 }
      },
      {
        label: "Decline this year",
        memory: "You skipped the summer cookout to protect your bandwidth.",
        effects: { wellbeing: 2, children: -2, marriage: -1 }
      }
    ]
  },
  {
    id: "summer-vacation-request",
    tags: ["midlife", "general"],
    title: "Summer Vacation Request",
    description: "A gap opens for a short summer break, but taking it means planning around work and spending real money.",
    wisdom: "Rest is easier to defend before exhaustion turns it into an emergency. A modest pause can be a long-term investment.",
    severity: "moderate",
    category: "Seasonal",
    icon: "🏖️",
    accent: "yellow",
    seasons: ["summer"],
    choices: [
      {
        label: "Book the modest trip",
        memory: "You booked a modest summer break and came back lighter.",
        effects: { wallet: -7, wellbeing: 10, marriage: 5, children: 5 }
      },
      {
        label: "Plan a staycation",
        memory: "You planned a summer staycation with real boundaries.",
        effects: { wallet: -2, wellbeing: 7, marriage: 3, children: 4 }
      },
      {
        label: "Save the money",
        memory: "You skipped summer vacation to protect the budget.",
        effects: { wallet: 5, wellbeing: -5, marriage: -2 }
      }
    ]
  },
  {
    id: "fall-school-rhythm",
    tags: ["young-family", "general"],
    title: "Fall School Rhythm",
    description: "The school-year rhythm arrives with forms, lunches, pickups, homework, and a need for everyone to reset expectations.",
    wisdom: "A good routine is a kindness your future self receives every day. The first weeks of fall decide how much chaos becomes normal.",
    severity: "moderate",
    category: "Seasonal",
    icon: "🎒",
    accent: "amber",
    seasons: ["fall"],
    choices: [
      {
        label: "Build the routine now",
        memory: "You built a steady fall school routine before chaos hardened.",
        effects: { wellbeing: 7, children: 8, marriage: 3 }
      },
      {
        label: "Buy convenience tools",
        memory: "You bought supplies and shortcuts to make the fall routine easier.",
        effects: { wellbeing: 6, children: 5, wallet: -4 }
      },
      {
        label: "Wing the first month",
        memory: "You winged the start of the school-year rhythm.",
        effects: { wellbeing: -7, children: -4, wallet: 1 }
      }
    ]
  },
  {
    id: "fall-leaf-weekend",
    tags: ["general"],
    title: "Fall Leaf Weekend",
    description: "The yard is suddenly covered, and the same weekend also offers one of the last beautiful outdoor days of the year.",
    wisdom: "Maintenance matters, but so does noticing the season while it is here. Balance keeps chores from swallowing life whole.",
    severity: "minor",
    category: "Seasonal",
    icon: "🍂",
    accent: "orange",
    seasons: ["fall"],
    choices: [
      {
        label: "Rake then relax",
        memory: "You handled the leaves and still made time to enjoy the fall day.",
        effects: { wellbeing: 6, children: 4, marriage: 2 }
      },
      {
        label: "Pay for yard help",
        memory: "You paid for leaf cleanup and protected the weekend.",
        effects: { wellbeing: 7, wallet: -4 }
      },
      {
        label: "Ignore the yard",
        memory: "You ignored the fall leaves until they became a bigger chore.",
        effects: { wellbeing: -3, wallet: 1 }
      }
    ]
  },
  {
    id: "fall-harvest-festival",
    tags: ["young-family", "general"],
    title: "Fall Harvest Festival",
    description: "A local harvest festival promises pumpkins, music, and crowds, but the week already feels full.",
    wisdom: "Kids and adults both need low-stakes delight. The calendar should include moments that are not only useful.",
    severity: "minor",
    category: "Seasonal",
    icon: "🎃",
    accent: "amber",
    seasons: ["fall"],
    choices: [
      {
        label: "Go all in",
        memory: "You made a full memory at the fall harvest festival.",
        effects: { wallet: -3, wellbeing: 6, children: 8 }
      },
      {
        label: "Stop by briefly",
        memory: "You made a short harvest festival visit fit the week.",
        effects: { wallet: -1, wellbeing: 3, children: 4 }
      },
      {
        label: "Stay home quiet",
        memory: "You skipped the harvest festival for a quiet night at home.",
        effects: { wellbeing: 2, children: -2 }
      }
    ]
  },
  {
    id: "winter-heating-bill",
    tags: ["general"],
    title: "Winter Heating Bill",
    description: "The first serious cold snap arrives with a heating bill that is higher than expected.",
    wisdom: "Warmth is both comfort and safety. Planning for seasonal costs prevents one bill from becoming a household argument.",
    severity: "moderate",
    category: "Seasonal",
    icon: "🔥",
    accent: "blue",
    seasons: ["winter"],
    choices: [
      {
        label: "Pay and weatherproof",
        memory: "You paid the winter bill and made the house more efficient.",
        effects: { wallet: -6, wellbeing: 5, marriage: 2 }
      },
      {
        label: "Tighten the budget",
        memory: "You covered the heating bill by tightening the winter budget.",
        effects: { wallet: -2, wellbeing: -2, marriage: -2 }
      },
      {
        label: "Delay the payment",
        memory: "You delayed the winter heating bill and carried the stress forward.",
        effects: { wallet: 2, wellbeing: -7, marriage: -3 }
      }
    ]
  },
  {
    id: "winter-holiday-boundaries",
    tags: ["general", "eldercare"],
    title: "Winter Holiday Boundaries",
    description: "Holiday invitations, gift expectations, and family opinions pile up faster than your energy recovers.",
    wisdom: "A boundary is not a rejection of people. It is a way to keep connection from becoming resentment.",
    severity: "moderate",
    category: "Seasonal",
    icon: "🕯️",
    accent: "violet",
    seasons: ["winter"],
    choices: [
      {
        label: "Set kind limits early",
        memory: "You set kind holiday limits before resentment built up.",
        effects: { wellbeing: 8, marriage: 4, wallet: 2 }
      },
      {
        label: "Attend the essentials",
        memory: "You chose the essential holiday gatherings and skipped the rest.",
        effects: { wellbeing: 5, marriage: 2, children: 2 }
      },
      {
        label: "Say yes to everything",
        memory: "You said yes to every holiday request and ran yourself thin.",
        effects: { wellbeing: -9, marriage: -3, wallet: -4 }
      }
    ]
  },
  {
    id: "winter-snow-day",
    tags: ["young-family", "general"],
    title: "Winter Snow Day",
    description: "School or errands get disrupted by a snow day, and the house must improvise quickly.",
    wisdom: "Disruptions become memories when someone makes room for play. They become stress stories when nobody adjusts expectations.",
    severity: "minor",
    category: "Seasonal",
    icon: "☃️",
    accent: "cyan",
    seasons: ["winter"],
    choices: [
      {
        label: "Make it cozy",
        memory: "You turned a winter snow day into a cozy family memory.",
        effects: { wellbeing: 5, children: 8, wallet: -1 }
      },
      {
        label: "Trade off coverage",
        memory: "You and your partner coordinated snow-day coverage.",
        effects: { marriage: 5, children: 4, wellbeing: 2 }
      },
      {
        label: "Work through frustration",
        memory: "You tried to force a normal day through snow-day disruption.",
        effects: { wellbeing: -6, children: -4, wallet: 1 }
      }
    ]
  }
];

export default seasonalEvents;
