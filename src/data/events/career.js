const careerEvents = [
  {
    id: "promotion-with-hidden-cost",
    tags: ["career", "midlife", "general"],
    title: "Promotion With a Hidden Cost",
    description: "A promotion opens up with better pay and prestige, but the role is known for eating evenings and weekends.",
    wisdom: "A bigger title is not automatically a bigger life. The right opportunity should expand your future without quietly shrinking your home.",
    severity: "moderate",
    category: "Career",
    icon: "📈",
    accent: "indigo",
    choices: [
      {
        label: "Negotiate the shape of the role",
        memory: "You pursued the promotion but negotiated boundaries before accepting the extra responsibility.",
        effects: { wallet: 5, reputation: 6, wellbeing: -1, marriage: 1 }
      },
      {
        label: "Accept without conditions",
        memory: "You accepted the promotion fast and let the hidden workload become the household's problem later.",
        effects: { wallet: 7, reputation: 7, wellbeing: -7, marriage: -4, children: -2 }
      },
      {
        label: "Decline for this season",
        memory: "You declined a promotion because the timing would have cost too much at home.",
        effects: { wellbeing: 4, marriage: 3, reputation: -2, wallet: -1 }
      }
    ]
  },
  {
    id: "management-burnout-warning",
    tags: ["career", "midlife", "wellbeing"],
    title: "Management Burnout Warning",
    description: "Your team depends on you, leadership keeps escalating problems, and your body is starting to send warning signals.",
    wisdom: "Being reliable should not require becoming unavailable to yourself. A manager who burns out becomes another crisis for the team.",
    severity: "major",
    category: "Career strain",
    icon: "🪫",
    accent: "rose",
    condition: { stat: "wellbeing", op: "lte", value: 55 },
    choices: [
      {
        label: "Name capacity with leadership",
        memory: "You told leadership what capacity actually looked like and forced a more honest plan.",
        effects: { wellbeing: 5, reputation: 2, wallet: -1 }
      },
      {
        label: "Keep absorbing everything",
        memory: "You kept absorbing every escalation until your body treated the job like an emergency.",
        effects: { wellbeing: -10, marriage: -4, children: -2, reputation: 2 }
      },
      {
        label: "Delegate and disappoint cleanly",
        memory: "You delegated, dropped low-value work, and accepted that not every expectation could survive.",
        effects: { wellbeing: 6, reputation: -1, marriage: 2 }
      }
    ]
  },
  {
    id: "career-plateau-review",
    tags: ["career", "midlife", "general"],
    title: "Career Plateau Review",
    description: "Another review cycle ends with polite praise, no real growth, and the sinking feeling that your role has stopped stretching you.",
    wisdom: "A plateau can be rest, or it can be quiet erosion. The difference is whether you chose it on purpose.",
    severity: "moderate",
    category: "Career",
    icon: "🧭",
    accent: "blue",
    choices: [
      {
        label: "Build a next-step plan",
        memory: "You turned career restlessness into a concrete plan instead of a private resentment.",
        effects: { reputation: 5, wellbeing: 3, memory: 2 }
      },
      {
        label: "Coast and complain",
        memory: "You coasted through the plateau and let the frustration leak into everything else.",
        effects: { wellbeing: -4, reputation: -3, marriage: -1 }
      },
      {
        label: "Trade ambition for stability",
        memory: "You chose the stable plateau deliberately and stopped apologizing for needing a calmer season.",
        effects: { wellbeing: 4, marriage: 2, wallet: 1, reputation: -1 }
      }
    ]
  },
  {
    id: "layoff-rumor-mill",
    tags: ["career", "wallet", "general"],
    title: "Layoff Rumor Mill",
    description: "Rumors of layoffs start circulating, and every calendar invite suddenly feels suspicious.",
    wisdom: "Panic spends energy without buying safety. Preparation is the calmer cousin of fear.",
    severity: "major",
    category: "Career shock",
    icon: "📂",
    accent: "amber",
    choices: [
      {
        label: "Prepare quietly",
        memory: "You updated your resume, checked the budget, and prepared without turning the house into a panic room.",
        effects: { wellbeing: -1, reputation: 3, wallet: 2, marriage: 1 }
      },
      {
        label: "Spiral publicly",
        memory: "You fed the rumor mill and let anxiety make you look less steady at the exact wrong time.",
        effects: { wellbeing: -7, reputation: -5, marriage: -2 }
      },
      {
        label: "Ignore it completely",
        memory: "You ignored layoff rumors and hoped not looking would make them less real.",
        effects: { wellbeing: 1, wallet: -4, reputation: -2 }
      }
    ]
  },
  {
    id: "side-business-crossroads",
    tags: ["career", "wallet", "midlife"],
    title: "Side Business Crossroads",
    description: "A side project starts earning enough attention that you could invest more seriously, but the risk is no longer theoretical.",
    wisdom: "A dream becomes a responsibility the moment other people start depending on it. Scale slowly enough to keep your life intact.",
    severity: "moderate",
    category: "Entrepreneurship",
    icon: "💡",
    accent: "violet",
    condition: { stat: "wallet", op: "gte", value: 45 },
    choices: [
      {
        label: "Test the next step carefully",
        memory: "You treated the side business like an experiment instead of betting the household on hope.",
        effects: { wallet: 3, reputation: 4, wellbeing: -1, memory: 3 }
      },
      {
        label: "Quit and leap",
        memory: "You made a dramatic leap into the side business before the safety net was ready.",
        effects: { wallet: -8, reputation: 5, wellbeing: -5, marriage: -3, memory: 4 }
      },
      {
        label: "Keep it small on purpose",
        memory: "You kept the side business small because the life around it mattered too.",
        effects: { wallet: 1, wellbeing: 4, marriage: 2 }
      }
    ]
  }
];

export default careerEvents;
