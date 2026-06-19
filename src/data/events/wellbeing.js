const wellbeingEvents = [
  {
    id: "aging-parent-needs-help",
    tags: ["midlife", "eldercare", "family"],
    title: "Aging Parent Needs Help",
    description: "A parent starts needing more help with appointments, errands, or decisions, and the requests no longer fit neatly around your life.",
    wisdom: "Caregiving is love with a calendar attached. Sustainable help needs boundaries before resentment writes them for you.",
    severity: "major",
    category: "Midlife caregiving",
    icon: "🏥",
    accent: "amber",
    choices: [
      {
        label: "Build a shared care plan",
        memory: "You helped organize care for an aging parent without pretending you could do everything alone.",
        effects: { wellbeing: -2, marriage: 1, children: 1, wallet: -2, memory: 3 }
      },
      {
        label: "Take it all on yourself",
        memory: "You took on your parent's care alone and slowly ran out of room for your own life.",
        effects: { wellbeing: -10, marriage: -4, children: -2, wallet: -3, memory: 2 }
      },
      {
        label: "Keep distance for now",
        memory: "You kept distance from your parent's growing needs and the guilt followed you home.",
        effects: { wellbeing: -4, marriage: -1, memory: -3 }
      }
    ]
  },
  {
    id: "unexpected-health-scare",
    tags: ["midlife", "wellbeing", "general"],
    title: "Unexpected Health Scare",
    description: "A routine checkup turns into extra tests, waiting, and the uncomfortable awareness that your body is not just background infrastructure.",
    wisdom: "A scare is not a diagnosis, but it is information. Listen before life has to speak louder.",
    severity: "major",
    category: "Health",
    icon: "🩺",
    accent: "rose",
    choices: [
      {
        label: "Follow through carefully",
        memory: "You followed through on the health scare and made practical changes before fear had to become a teacher.",
        effects: { wellbeing: 5, wallet: -3, marriage: 2, memory: 3 }
      },
      {
        label: "Avoid the next appointment",
        memory: "You avoided the follow-up and let uncertainty become background noise.",
        effects: { wellbeing: -9, marriage: -2, memory: -2 }
      },
      {
        label: "Tell the family honestly",
        memory: "You shared the health scare honestly and let people support you while you waited.",
        effects: { wellbeing: 1, marriage: 4, children: 2, wallet: -2 }
      }
    ]
  },
  {
    id: "marriage-drift-midlife",
    tags: ["midlife", "relationship", "wellbeing"],
    title: "Midlife Marriage Drift",
    description: "Nothing is obviously wrong, but you and your spouse have started functioning more like co-managers than partners.",
    wisdom: "Drift rarely announces itself as a crisis. It usually arrives disguised as efficiency.",
    severity: "moderate",
    category: "Relationship",
    icon: "🛶",
    accent: "blue",
    condition: { stat: "marriage", op: "lte", value: 65 },
    choices: [
      {
        label: "Name the drift gently",
        memory: "You named the midlife drift before it hardened into distance.",
        effects: { marriage: 7, wellbeing: 2, memory: 2 }
      },
      {
        label: "Stay efficient and distant",
        memory: "You kept the household efficient while the relationship quietly lost warmth.",
        effects: { wallet: 1, marriage: -6, wellbeing: -2 }
      },
      {
        label: "Plan a real reconnect",
        memory: "You planned a real reconnection instead of waiting for romance to find a gap in the calendar.",
        effects: { marriage: 9, wellbeing: 3, wallet: -3 }
      }
    ]
  },
  {
    id: "friend-serious-diagnosis",
    tags: ["midlife", "wellbeing", "relationship"],
    title: "Friend's Serious Diagnosis",
    description: "A friend your age shares a serious diagnosis, and the news knocks the air out of your assumptions about time.",
    wisdom: "Someone else's fragility can reveal your own priorities. Do not waste the clarity by turning it into vague fear.",
    severity: "major",
    category: "Midlife reckoning",
    icon: "🕯️",
    accent: "violet",
    choices: [
      {
        label: "Show up practically",
        memory: "You showed up for your friend with practical care instead of only anxious words.",
        effects: { wellbeing: -3, marriage: 1, memory: 6, reputation: 2 }
      },
      {
        label: "Avoid because it scares you",
        memory: "You pulled away from your friend's diagnosis because it made your own mortality feel too close.",
        effects: { wellbeing: -4, memory: -5, reputation: -2 }
      },
      {
        label: "Let it reset priorities",
        memory: "Your friend's diagnosis pushed you to change how you spend attention while there is still time.",
        effects: { wellbeing: 2, marriage: 3, children: 2, memory: 5 }
      }
    ]
  },
  {
    id: "identity-crisis-at-fifty",
    tags: ["midlife", "wellbeing", "memory"],
    title: "Identity Crisis at Fifty",
    description: "A birthday, reunion, or quiet morning makes you wonder whether the life you built still fits the person living it.",
    wisdom: "A life can be successful and still need revision. Questioning the map is not the same as betraying the road behind you.",
    severity: "moderate",
    category: "Personal growth",
    icon: "🧭",
    accent: "indigo",
    choices: [
      {
        label: "Ask the hard questions",
        memory: "You let the midlife questions become reflection instead of panic.",
        effects: { wellbeing: 3, memory: 6, marriage: 1 }
      },
      {
        label: "Buy a distraction",
        memory: "You tried to purchase your way around the questions and the relief faded quickly.",
        effects: { wallet: -6, wellbeing: 1, memory: -3 }
      },
      {
        label: "Make one concrete change",
        memory: "You made one concrete change that helped your life fit a little better.",
        effects: { wellbeing: 5, memory: 5, reputation: 1 }
      }
    ]
  },
  {
    id: "second-career-consideration",
    tags: ["midlife", "career", "wellbeing"],
    title: "Second Career Consideration",
    description: "A path you once ignored starts calling again, but switching directions would cost status, money, and certainty.",
    wisdom: "A second act is not an apology for the first. It is a question about what your remaining energy is for.",
    severity: "moderate",
    category: "Personal growth",
    icon: "🔁",
    accent: "green",
    choices: [
      {
        label: "Explore without detonating life",
        memory: "You explored a second career carefully, with experiments instead of a dramatic escape.",
        effects: { wellbeing: 4, memory: 4, reputation: 2, wallet: -2 }
      },
      {
        label: "Leap immediately",
        memory: "You leapt toward a second career before the household had enough scaffolding.",
        effects: { wellbeing: 2, memory: 5, wallet: -8, marriage: -3 }
      },
      {
        label: "Put the question away",
        memory: "You put the second-career question away and felt the quiet ache of choosing certainty.",
        effects: { wallet: 2, reputation: 1, wellbeing: -3, memory: -2 }
      }
    ]
  }
];

export default wellbeingEvents;
