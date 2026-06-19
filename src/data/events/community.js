const communityEvents = [
  {
    id: "community-shows-up",
    tags: ["community", "reputation", "general"],
    title: "Community Shows Up",
    description: "A household crisis spills past what you can handle alone, and people you helped before start appearing with meals, rides, tools, and time.",
    wisdom: "Community is not a vending machine for emergencies. It is trust that was fed before the crisis knew your address.",
    severity: "moderate",
    category: "Community payoff",
    icon: "🤲",
    accent: "green",
    condition: { stat: "reputation", op: "gte", value: 75 },
    choices: [
      {
        label: "Accept the help gracefully",
        memory: "You accepted community help without turning gratitude into embarrassment.",
        effects: { wellbeing: 7, reputation: 3, wallet: 2, memory: 4 }
      },
      {
        label: "Refuse to need anyone",
        memory: "You refused help from people who wanted to show up for you.",
        effects: { wellbeing: -4, reputation: -2, memory: -1 }
      },
      {
        label: "Let the kids see it",
        memory: "You let the family witness what years of showing up for others had built.",
        effects: { children: 4, reputation: 4, memory: 5 }
      }
    ]
  },
  {
    id: "community-forgets-you",
    tags: ["community", "reputation", "general"],
    title: "Community Forgets You",
    description: "A local moment arrives where support would help, but you realize you have not invested much in the people around you.",
    wisdom: "Isolation often feels efficient until life asks for witnesses. Belonging is built before it is needed.",
    severity: "moderate",
    category: "Community consequence",
    icon: "🏚️",
    accent: "amber",
    condition: { stat: "reputation", op: "lte", value: 35 },
    choices: [
      {
        label: "Start rebuilding locally",
        memory: "You treated the lonely moment as a signal to rebuild local connection.",
        effects: { reputation: 6, wellbeing: 2, memory: 2 }
      },
      {
        label: "Stay invisible",
        memory: "You stayed invisible and the neighborhood remained mostly a backdrop.",
        effects: { reputation: -3, wellbeing: -3, memory: -1 }
      },
      {
        label: "Ask for one small connection",
        memory: "You made one small ask and let it become the first thread back into community.",
        effects: { reputation: 4, wellbeing: 1, marriage: 1 }
      }
    ]
  },
  {
    id: "old-favor-returns",
    tags: ["community", "reputation", "wallet"],
    title: "Old Favor Returns",
    description: "Someone you helped years ago quietly returns the favor at exactly the moment it matters.",
    wisdom: "Not every good choice pays back, and that is not why it matters. But sometimes kindness does find its way home.",
    severity: "minor",
    category: "Reputation payoff",
    icon: "🔁",
    accent: "teal",
    condition: { stat: "reputation", op: "gte", value: 65 },
    choices: [
      {
        label: "Receive it with gratitude",
        memory: "An old favor returned, and you received it as grace rather than proof you were owed.",
        effects: { wallet: 4, wellbeing: 3, reputation: 2, memory: 3 }
      },
      {
        label: "Pay it forward immediately",
        memory: "You turned a returned favor into another act of generosity.",
        effects: { reputation: 5, memory: 4, wallet: -1 }
      },
      {
        label: "Treat it as a transaction",
        memory: "You treated the favor like a settled account and missed the relational gift inside it.",
        effects: { wallet: 2, reputation: -1, memory: -1 }
      }
    ]
  }
];

export default communityEvents;
