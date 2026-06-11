const events = [
  {
    id: "daughter-recital",
    title: "Daughter's Recital",
    description: "Your daughter has a recital tonight, but a client also wants a late call.",
    choices: [
      { label: "Attend the recital", effects: { money: -100, children: 12, stress: -5 }, memory: "You showed up for your daughter's recital." },
      { label: "Work overtime", effects: { money: 500, children: -8, stress: 7 }, memory: "You took the overtime call and missed the recital." },
      { label: "Split the evening", effects: { money: 180, children: 5, stress: 4 }, memory: "You caught part of the recital before returning to work." }
    ]
  },
  {
    id: "friend-birthday",
    title: "Friend's Birthday",
    description: "A close friend is celebrating their birthday and wants everyone together.",
    choices: [
      { label: "Bring a gift", effects: { money: -75, marriage: 5, stress: -2 }, memory: "You celebrated a friend's birthday with a thoughtful gift." },
      { label: "Skip it", effects: { marriage: -5, stress: 5 }, memory: "You skipped a friend's birthday to save time." },
      { label: "Host dessert", effects: { money: -140, marriage: 9, stress: 3 }, memory: "You hosted dessert and made your friend feel valued." }
    ]
  },
  {
    id: "gym-session",
    title: "Gym Session",
    description: "A gym session is scheduled, but the couch looks tempting.",
    choices: [
      { label: "Go to the gym", effects: { health: 7, stress: -4 }, memory: "You completed a gym session and felt healthier." },
      { label: "Rest at home", effects: { health: -2, stress: 3 }, memory: "You skipped the gym and rested at home." }
    ]
  },
  {
    id: "annual-checkup",
    title: "Annual Checkup",
    description: "Your doctor has an opening for a preventive visit, but it means taking time off work.",
    choices: [
      { label: "Book the appointment", effects: { money: -180, health: 8, stress: -3 }, memory: "You made time for a preventive health checkup." },
      { label: "Put it off", effects: { money: 120, health: -5, stress: 2 }, memory: "You postponed your annual checkup again." },
      { label: "Use telehealth", effects: { money: -60, health: 4, stress: -1 }, memory: "You handled your checkup through a quick telehealth visit." }
    ]
  },
  {
    id: "weekend-getaway",
    title: "Weekend Getaway",
    description: "Your partner suggests a low-key weekend away to reconnect.",
    choices: [
      { label: "Plan the trip", effects: { money: -650, marriage: 12, stress: -8 }, memory: "You planned a weekend getaway and reconnected." },
      { label: "Stay home and save", effects: { money: 250, marriage: -4, stress: 3 }, memory: "You stayed home to protect the budget." },
      { label: "Do a day trip", effects: { money: -180, marriage: 7, stress: -4 }, memory: "You chose a smaller day trip that still felt special." }
    ]
  },
  {
    id: "online-course",
    title: "Career Course",
    description: "A practical online course could improve your future earning power.",
    choices: [
      { label: "Enroll", effects: { money: -400, stress: 6, health: -1 }, memory: "You enrolled in a career course and invested in yourself." },
      { label: "Keep evenings free", effects: { stress: -4, health: 2 }, memory: "You protected your evenings instead of adding coursework." },
      { label: "Audit free lessons", effects: { money: -30, stress: 2, health: 1 }, memory: "You sampled free lessons before committing." }
    ]
  },
  {
    id: "school-project",
    title: "School Project",
    description: "Your child needs help building a last-minute science project.",
    choices: [
      { label: "Help all evening", effects: { children: 10, stress: 5, marriage: 2 }, memory: "You helped finish a chaotic science project." },
      { label: "Let them handle it", effects: { children: -6, stress: -3, health: 1 }, memory: "You let your child handle the project independently." },
      { label: "Coach for one hour", effects: { children: 5, stress: 1, health: 1 }, memory: "You coached the project without taking it over." }
    ]
  },
  {
    id: "grocery-budget",
    title: "Grocery Run",
    description: "The fridge is empty and the weekly food budget is already tight.",
    choices: [
      { label: "Cook budget meals", effects: { money: -95, health: 4, stress: -2 }, memory: "You stocked up for simple home-cooked meals." },
      { label: "Order delivery", effects: { money: -160, health: -3, stress: -5 }, memory: "You bought convenience with a delivery night." },
      { label: "Meal prep together", effects: { money: -120, health: 5, children: 4, stress: 1 }, memory: "You turned meal prep into family time." }
    ]
  },
  {
    id: "car-repair",
    title: "Car Repair",
    description: "A warning light appears before a packed week of errands.",
    choices: [
      { label: "Fix it today", effects: { money: -420, stress: -4 }, memory: "You handled the car repair before it became an emergency." },
      { label: "Ignore it", effects: { money: 0, stress: 7, health: -1 }, memory: "You ignored the car warning light and hoped for the best." },
      { label: "Ask for a ride", effects: { money: -40, marriage: 3, stress: 2 }, memory: "You leaned on your support network while delaying the repair." }
    ]
  },
  {
    id: "team-lunch",
    title: "Team Lunch",
    description: "Coworkers invite you out during a busy workday.",
    choices: [
      { label: "Join lunch", effects: { money: -28, marriage: 3, stress: -3 }, memory: "You bonded with coworkers over lunch." },
      { label: "Eat at desk", effects: { money: 0, stress: 4, health: -1 }, memory: "You worked through lunch to catch up." }
    ]
  },
  {
    id: "neighbor-help",
    title: "Neighbor Needs Help",
    description: "A neighbor asks for help moving furniture after dinner.",
    choices: [
      { label: "Help them", effects: { marriage: 4, health: 2, stress: 2 }, memory: "You helped a neighbor and strengthened community ties." },
      { label: "Politely decline", effects: { stress: -2, marriage: -1 }, memory: "You protected your evening and declined the favor." },
      { label: "Send a handyman", effects: { money: -80, marriage: 2, stress: -1 }, memory: "You found another way to help your neighbor." }
    ]
  },
  {
    id: "date-night",
    title: "Date Night",
    description: "There is finally a free evening for your relationship.",
    choices: [
      { label: "Go out", effects: { money: -120, marriage: 10, stress: -4 }, memory: "You invested in a relaxed date night." },
      { label: "Movie at home", effects: { money: -20, marriage: 5, stress: -2 }, memory: "You kept date night cozy at home." },
      { label: "Reschedule", effects: { marriage: -5, stress: 3 }, memory: "You rescheduled date night again." }
    ]
  },
  {
    id: "sleep-debt",
    title: "Sleep Debt",
    description: "Late nights are catching up and tomorrow starts early.",
    choices: [
      { label: "Sleep early", effects: { health: 7, stress: -6, marriage: -1 }, memory: "You chose an early night and recovered energy." },
      { label: "Keep scrolling", effects: { health: -5, stress: 5 }, memory: "You stayed up scrolling and felt it the next day." },
      { label: "Short wind-down", effects: { health: 3, stress: -2 }, memory: "You created a quick wind-down routine." }
    ]
  },
  {
    id: "home-maintenance",
    title: "Home Maintenance",
    description: "A small leak under the sink is easy to postpone.",
    choices: [
      { label: "Repair it", effects: { money: -160, stress: -3 }, memory: "You fixed the leak before it caused damage." },
      { label: "Delay repair", effects: { money: 0, stress: 5 }, memory: "You delayed the repair and kept worrying about it." },
      { label: "DIY attempt", effects: { money: -45, stress: 4, health: -1 }, memory: "You tried a DIY repair with mixed results." }
    ]
  },
  {
    id: "volunteer-shift",
    title: "Volunteer Shift",
    description: "A local group needs extra help this week.",
    choices: [
      { label: "Take a shift", effects: { marriage: 4, children: 3, stress: 3 }, memory: "You volunteered and felt useful to the community." },
      { label: "Donate instead", effects: { money: -90, marriage: 2, stress: -1 }, memory: "You donated when you could not volunteer." },
      { label: "Pass this time", effects: { stress: -2, marriage: -2 }, memory: "You passed on volunteering to preserve energy." }
    ]
  },
  {
    id: "side-hustle",
    title: "Side Hustle Offer",
    description: "A short freelance job could add cash but eats into family time.",
    choices: [
      { label: "Accept it", effects: { money: 750, stress: 9, marriage: -4, children: -3 }, memory: "You accepted a demanding side hustle." },
      { label: "Negotiate scope", effects: { money: 420, stress: 4, marriage: -1 }, memory: "You negotiated a smaller freelance project." },
      { label: "Decline", effects: { stress: -5, marriage: 3, children: 2 }, memory: "You declined extra work to protect home life." }
    ]
  },
  {
    id: "family-call",
    title: "Family Call",
    description: "An older relative wants a long catch-up call.",
    choices: [
      { label: "Call tonight", effects: { children: 3, marriage: 2, stress: -1 }, memory: "You made time for a meaningful family call." },
      { label: "Text back", effects: { stress: -1, marriage: -1 }, memory: "You sent a quick text instead of calling." },
      { label: "Plan Sunday call", effects: { stress: 1, children: 2 }, memory: "You scheduled a better time for a family call." }
    ]
  },
  {
    id: "therapy-session",
    title: "Therapy Session",
    description: "A therapy opening appears during a stressful stretch.",
    choices: [
      { label: "Take the slot", effects: { money: -150, health: 4, stress: -10 }, memory: "You used therapy to process a hard week." },
      { label: "Journal instead", effects: { health: 2, stress: -4 }, memory: "You journaled through your feelings." },
      { label: "Push through", effects: { stress: 6, health: -2 }, memory: "You pushed through stress without support." }
    ]
  },
  {
    id: "kids-sports",
    title: "Kids' Sports Signup",
    description: "Registration opens for a season your child is excited about.",
    choices: [
      { label: "Sign up", effects: { money: -240, children: 9, stress: 4 }, memory: "You signed up for a busy sports season." },
      { label: "Find scholarship", effects: { money: -60, children: 7, stress: 6 }, memory: "You searched for a scholarship to make sports possible." },
      { label: "Wait a season", effects: { money: 0, children: -5, stress: -2 }, memory: "You waited on sports registration this season." }
    ]
  },
  {
    id: "investment-choice",
    title: "Investment Choice",
    description: "You have a chance to move extra cash into savings or spend it now.",
    choices: [
      { label: "Invest extra", effects: { money: 260, stress: 2 }, memory: "You moved extra cash toward future savings." },
      { label: "Buy something fun", effects: { money: -220, stress: -5, marriage: 2 }, memory: "You spent extra cash on a fun purchase." },
      { label: "Emergency fund", effects: { money: 120, stress: -4 }, memory: "You strengthened the emergency fund." }
    ]
  },
  {
    id: "digital-detox",
    title: "Digital Detox",
    description: "Your screen time report is higher than you expected.",
    choices: [
      { label: "Phone-free night", effects: { health: 3, marriage: 4, stress: -4 }, memory: "You took a phone-free night and felt present." },
      { label: "Set app limits", effects: { health: 2, stress: -2 }, memory: "You added screen-time guardrails." },
      { label: "Ignore report", effects: { health: -2, stress: 3 }, memory: "You ignored the screen-time warning." }
    ]
  }
];

export default events;
