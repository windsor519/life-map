const events = [
  {
    id: "daughter-recital",
    title: "Daughter's Recital",
    description: "Your daughter has a recital tonight.",
    choices: [
      {
        label: "Attend",
        effects: {
          money: -100,
          children: 10,
          stress: -5
        },
        memory: "Attended daughter's recital"
      },
      {
        label: "Work Overtime",
        effects: {
          money: 500,
          children: -5,
          stress: 5
        },
        memory: "Worked overtime instead of attending the recital"
      }
    ]
  },
  {
    id: "friend-birthday",
    title: "Friend's Birthday",
    description: "A close friend is celebrating their birthday this month.",
    choices: [
      {
        label: "Bring a gift",
        effects: {
          money: -75,
          marriage: 5,
          stress: -2
        },
        memory: "Celebrated a friend's birthday with a thoughtful gift"
      },
      {
        label: "Skip it",
        effects: {
          marriage: -5,
          stress: 5
        },
        memory: "Skipped a friend's birthday to save time"
      }
    ]
  },
  {
    id: "gym-session",
    title: "Gym Session",
    description: "A gym session is scheduled this week.",
    choices: [
      {
        label: "Go to the gym",
        effects: {
          health: 7,
          stress: -4
        },
        memory: "Completed a gym session and felt healthier"
      },
      {
        label: "Rest at home",
        effects: {
          health: -2,
          stress: 3
        },
        memory: "Skipped the gym and rested at home"
      }
    ]
  }
];

export default events;
