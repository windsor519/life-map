const funEvents = [
  {
    id: "living-room-dance-battle",
    title: "Living Room Dance Battle",
    severity: "minor",
    category: "Spontaneous fun",
    icon: "🪩",
    accent: "violet",
    description: "A favorite song comes on while everyone is tired and cranky. The room is one brave move away from becoming ridiculous in the best way.",
    wisdom: "Joy is not a reward for finishing the list. Sometimes it is fuel for getting through it.",
    tags: ["general", "family", "fun"],
    choices: [
      {
        label: "Start the dance battle",
        effects: { wellbeing: 5, marriage: 3, children: 5, memory: 6 },
        memory: "You turned a tired evening into a ridiculous living room dance battle."
      },
      {
        label: "Film one silly round",
        effects: { wellbeing: 3, children: 4, memory: 4, reputation: -1 },
        memory: "You captured one chaotic dance round before everyone collapsed laughing."
      },
      {
        label: "Keep everyone on task",
        effects: { wallet: 1, reputation: 1, wellbeing: -2, children: -3, memory: -2 },
        memory: "You kept the evening productive, but the spontaneous fun fizzled out."
      }
    ]
  },
  {
    id: "mystery-snack-championship",
    title: "Mystery Snack Championship",
    severity: "minor",
    category: "Kitchen chaos",
    icon: "🍿",
    accent: "amber",
    description: "Someone proposes a taste-test tournament using whatever is already in the pantry. The stakes are low, the opinions are intense.",
    wisdom: "Cheap rituals become expensive memories when everyone gets to be a little dramatic.",
    tags: ["general", "family", "fun"],
    choices: [
      {
        label: "Make a bracket",
        effects: { wellbeing: 3, marriage: 2, children: 5, wallet: 1, memory: 5 },
        memory: "You made a snack bracket and gave the pantry a championship arc."
      },
      {
        label: "Buy wild-card snacks",
        effects: { wellbeing: 4, children: 4, wallet: -4, memory: 4 },
        memory: "You bought surprise snacks and turned the night into a tiny tournament."
      },
      {
        label: "Skip the snack chaos",
        effects: { wallet: 2, wellbeing: -1, children: -2, memory: -1 },
        memory: "You skipped the snack chaos and saved the pantry for normal use."
      }
    ]
  },
  {
    id: "neighborhood-side-quest",
    title: "Neighborhood Side Quest",
    severity: "moderate",
    category: "Adventure",
    icon: "🗺️",
    accent: "green",
    description: "A simple walk turns into a mission: find the weirdest mailbox, best dog name, and most dramatic garden gnome before sunset.",
    wisdom: "Adventure does not always need a destination. Sometimes it needs a prompt and people willing to play along.",
    tags: ["general", "community", "family", "fun"],
    choices: [
      {
        label: "Accept the side quest",
        effects: { wellbeing: 6, children: 6, marriage: 2, memory: 7 },
        memory: "You accepted the neighborhood side quest and came home with inside jokes."
      },
      {
        label: "Invite neighbors to join",
        effects: { wellbeing: 3, children: 4, marriage: 2, reputation: 5, memory: 5 },
        memory: "You turned the neighborhood side quest into a tiny community adventure."
      },
      {
        label: "Take the efficient route",
        effects: { wellbeing: 1, reputation: 1, children: -2, memory: -1 },
        memory: "You took the efficient walk and missed the chance for a small adventure."
      }
    ]
  },
  {
    id: "rainy-day-cardboard-arcade",
    title: "Rainy Day Cardboard Arcade",
    severity: "minor",
    category: "Creative chaos",
    icon: "🎯",
    accent: "cyan",
    description: "Rain cancels the plan, but a pile of boxes suggests an alternate universe where tickets are drawn on sticky notes.",
    wisdom: "Play is a way of voting for the day even when the weather vetoes the original plan.",
    seasons: ["spring", "fall", "winter"],
    tags: ["general", "family", "fun"],
    choices: [
      {
        label: "Build the arcade",
        effects: { wellbeing: 4, children: 7, marriage: 2, wallet: 1, memory: 7 },
        memory: "You built a cardboard arcade and made the rainy day feel legendary."
      },
      {
        label: "Make one quick game",
        effects: { wellbeing: 2, children: 4, memory: 3 },
        memory: "You made one quick cardboard game and rescued the rainy afternoon."
      },
      {
        label: "Clean instead",
        effects: { wallet: 1, reputation: 1, wellbeing: -1, children: -3, memory: -2 },
        memory: "You used the rainy day to clean, but the arcade idea stayed in the boxes."
      }
    ]
  },
  {
    id: "sunset-dessert-heist",
    title: "Sunset Dessert Heist",
    severity: "minor",
    category: "Tiny rebellion",
    icon: "🍦",
    accent: "rose",
    description: "The day has been overly responsible. Someone whispers that sunset dessert would technically count as family morale infrastructure.",
    wisdom: "A tiny rebellion can be healthy when it reminds everyone the life-map is not just chores in a trench coat.",
    seasons: ["summer", "fall"],
    tags: ["general", "family", "fun"],
    choices: [
      {
        label: "Launch the dessert heist",
        effects: { wellbeing: 5, marriage: 2, children: 5, wallet: -3, memory: 6 },
        memory: "You launched a sunset dessert heist and morale immediately improved."
      },
      {
        label: "Do homemade sundaes",
        effects: { wellbeing: 3, children: 4, wallet: 1, memory: 4 },
        memory: "You made homemade sundaes and turned dessert into a tiny ceremony."
      },
      {
        label: "Stick to the plan",
        effects: { wallet: 2, wellbeing: -1, children: -2, memory: -1 },
        memory: "You stuck to the plan and skipped the sunset dessert rebellion."
      }
    ]
  }
];

export default funEvents;
