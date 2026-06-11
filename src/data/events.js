const events = [
  {
    id: "daughter-recital",
    title: "Daughter's Recital",
    description: "Your daughter has a recital tonight, but a client also wants a late call.",
    choices: [
      {
        label: "Attend the recital",
        effects: {
          money: -100,
          children: 12,
          stress: -5
        },
        memory: "You showed up for your daughter's recital."
      },
      {
        label: "Work overtime",
        effects: {
          money: 500,
          children: -8,
          stress: 7
        },
        memory: "You took the overtime call and missed the recital."
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
        memory: "You celebrated a friend's birthday with a thoughtful gift."
      },
      {
        label: "Skip it",
        effects: {
          marriage: -5,
          stress: 5
        },
        memory: "You skipped a friend's birthday to save time."
      }
    ]
  },
  {
    id: "gym-session",
    title: "Gym Session",
    description: "A gym session is scheduled this week, but the couch looks tempting.",
    choices: [
      {
        label: "Go to the gym",
        effects: {
          health: 7,
          stress: -4
        },
        memory: "You completed a gym session and felt healthier."
      },
      {
        label: "Rest at home",
        effects: {
          health: -2,
          stress: 3
        },
        memory: "You skipped the gym and rested at home."
      }
    ]
  },
  {
    id: "annual-checkup",
    title: "Annual Checkup",
    description: "Your doctor has an opening for a preventive visit, but it means taking time off work.",
    choices: [
      {
        label: "Book the appointment",
        effects: {
          money: -180,
          health: 8,
          stress: -3
        },
        memory: "You made time for a preventive health checkup."
      },
      {
        label: "Put it off",
        effects: {
          money: 120,
          health: -5,
          stress: 2
        },
        memory: "You postponed your annual checkup again."
      }
    ]
  },
  {
    id: "weekend-getaway",
    title: "Weekend Getaway",
    description: "Your partner suggests a low-key weekend away to reconnect.",
    choices: [
      {
        label: "Plan the trip",
        effects: {
          money: -650,
          marriage: 12,
          stress: -8
        },
        memory: "You planned a weekend getaway and reconnected."
      },
      {
        label: "Stay home and save",
        effects: {
          money: 250,
          marriage: -4,
          stress: 3
        },
        memory: "You stayed home to protect the budget."
      }
    ]
  },
  {
    id: "online-course",
    title: "Career Course",
    description: "A practical online course could improve your future earning power.",
    choices: [
      {
        label: "Enroll",
        effects: {
          money: -400,
          stress: 6,
          health: -1
        },
        memory: "You enrolled in a career course and invested in yourself."
      },
      {
        label: "Keep evenings free",
        effects: {
          stress: -4,
          health: 2
        },
        memory: "You protected your evenings instead of adding coursework."
      }
    ]
  },
  {
    id: "school-project",
    title: "School Project",
    description: "Your child needs help building a last-minute science project.",
    choices: [
      {
        label: "Help all evening",
        effects: {
          children: 10,
          stress: 5,
          marriage: 2
        },
        memory: "You helped finish a chaotic science project."
      },
      {
        label: "Let them handle it",
        effects: {
          children: -6,
          stress: -3,
          health: 1
        },
        memory: "You let your child handle the project independently."
      }
    ]
  }
];

export default events;
