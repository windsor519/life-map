const baseEvents = [
  {
    id: "daughter-recital",
    tags: ["young-family", "general"],
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
    tags: ["general"],
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
    tags: ["midlife", "general"],
    title: "Gym Session",
    description: "A gym session is scheduled, but the couch looks tempting.",
    choices: [
      { label: "Go to the gym", effects: { health: 7, stress: -4 }, memory: "You completed a gym session and felt healthier." },
      { label: "Rest at home", effects: { health: -2, stress: 3 }, memory: "You skipped the gym and rested at home." }
    ]
  },
  {
    id: "annual-checkup",
    tags: ["midlife", "general"],
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
    tags: ["midlife", "general"],
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
    tags: ["midlife", "general"],
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
    tags: ["young-family", "general"],
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
    tags: ["young-family", "midlife", "general"],
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
    tags: ["midlife", "general"],
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
    tags: ["midlife", "general"],
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
    tags: ["midlife", "general"],
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
    tags: ["midlife", "general"],
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
    tags: ["midlife", "general"],
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
    tags: ["midlife", "general"],
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
    tags: ["eldercare", "young-family", "general"],
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
    tags: ["midlife", "general"],
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
    tags: ["young-family", "general"],
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
    tags: ["midlife", "general"],
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
    tags: ["midlife", "general"],
    title: "Digital Detox",
    description: "Your screen time report is higher than you expected.",
    choices: [
      { label: "Phone-free night", effects: { health: 3, marriage: 4, stress: -4 }, memory: "You took a phone-free night and felt present." },
      { label: "Set app limits", effects: { health: 2, stress: -2 }, memory: "You added screen-time guardrails." },
      { label: "Ignore report", effects: { health: -2, stress: 3 }, memory: "You ignored the screen-time warning." }
    ]
  },
  {
    id: "pop-quiz",
    tags: ["young-family", "general"],
    title: "Pop Quiz",
    severity: "minor",
    description: "A surprise quiz lands in first period, and your child is nervous about the result.",
    choices: [
      { label: "Review mistakes together", effects: { children: 6, stress: 2 }, memory: "You turned a pop quiz into a calm study moment." },
      { label: "Brush it off", effects: { children: -2, stress: -2 }, memory: "You treated the pop quiz as no big deal." },
      { label: "Email the teacher", effects: { children: 3, stress: 4 }, memory: "You checked in with the teacher about the surprise quiz." }
    ]
  },
  {
    id: "school-supply-list",
    title: "School Supply List",
    severity: "minor",
    description: "A new supply list comes home with a few unexpected classroom requests.",
    choices: [
      { label: "Buy everything", effects: { money: -85, children: 5, stress: -2 }, memory: "You stocked the backpack with every requested supply." },
      { label: "Shop discounts", effects: { money: -35, children: 3, stress: 2 }, memory: "You hunted for school supplies on a tighter budget." },
      { label: "Wait until payday", effects: { money: 0, children: -3, stress: 5 }, memory: "You delayed the supply run until money was available." }
    ]
  },
  {
    id: "parent-teacher-conference",
    title: "Parent-Teacher Conference",
    severity: "moderate",
    description: "The teacher asks for a conference about slipping homework and classroom focus.",
    choices: [
      { label: "Attend in person", effects: { children: 10, stress: 4, money: -80 }, memory: "You attended the conference and made a school plan." },
      { label: "Schedule a video call", effects: { children: 6, stress: 1 }, memory: "You handled the teacher conference by video." },
      { label: "Miss the meeting", effects: { children: -8, stress: 6 }, memory: "You missed the teacher conference and the issue lingered." }
    ]
  },
  {
    id: "field-trip-form",
    title: "Field Trip Form",
    severity: "minor",
    description: "A permission slip and fee are due tomorrow for a museum field trip.",
    choices: [
      { label: "Pay and chaperone", effects: { money: -70, children: 8, stress: 3 }, memory: "You joined the field trip and made a shared memory." },
      { label: "Pay the fee", effects: { money: -40, children: 5, stress: -1 }, memory: "You sent in the field trip form on time." },
      { label: "Skip this trip", effects: { money: 0, children: -6, stress: -2 }, memory: "You skipped the field trip to protect the budget." }
    ]
  },
  {
    id: "bullying-report",
    title: "Bullying Report",
    severity: "major",
    description: "Your child says another student has been targeting them at school.",
    choices: [
      { label: "Meet the principal", effects: { children: 14, stress: 9, money: -120 }, memory: "You pushed the school for a safety plan after bullying." },
      { label: "Coach coping skills", effects: { children: 5, health: 1, stress: 3 }, memory: "You helped your child practice responses to bullying." },
      { label: "Wait and observe", effects: { children: -12, stress: 6, health: -2 }, memory: "You waited on the bullying report and your child felt alone." }
    ]
  },
  {
    id: "honor-roll-invite",
    title: "Honor Roll Invite",
    severity: "minor",
    description: "The school invites families to celebrate students who improved their grades.",
    choices: [
      { label: "Celebrate loudly", effects: { money: -60, children: 9, stress: -3 }, memory: "You celebrated academic progress and boosted confidence." },
      { label: "Quiet congratulations", effects: { children: 5, stress: -1 }, memory: "You gave heartfelt praise for the honor roll invite." },
      { label: "Too busy to attend", effects: { children: -5, money: 120, stress: 2 }, memory: "You missed the honor roll celebration because work ran long." }
    ]
  },
  {
    id: "school-play-audition",
    title: "School Play Audition",
    severity: "moderate",
    description: "Your child wants to audition for the school play, adding rehearsals to the calendar.",
    choices: [
      { label: "Support the audition", effects: { children: 9, stress: 4, money: -55 }, memory: "You supported the school play audition despite the schedule crunch." },
      { label: "Set homework rules", effects: { children: 5, stress: 1 }, memory: "You balanced theater excitement with homework expectations." },
      { label: "Say not this time", effects: { children: -7, stress: -3 }, memory: "You passed on the school play to keep evenings simpler." }
    ]
  },
  {
    id: "scholarship-deadline",
    title: "Scholarship Deadline",
    severity: "major",
    description: "A scholarship application is due this week and could change future school costs.",
    choices: [
      { label: "Work on it together", effects: { money: 900, children: 8, stress: 8 }, memory: "You completed a scholarship application as a team." },
      { label: "Hire essay help", effects: { money: 550, children: 4, stress: 3 }, memory: "You paid for application help and met the scholarship deadline." },
      { label: "Let it pass", effects: { money: -300, children: -4, stress: -2 }, memory: "You missed the scholarship deadline and lost an opportunity." }
    ]
  },
  {
    id: "detention-call",
    title: "Detention Call",
    severity: "moderate",
    description: "The school calls: your child got detention after an argument in class.",
    choices: [
      { label: "Talk it through", effects: { children: 7, stress: 4 }, memory: "You used detention as a chance to talk through conflict." },
      { label: "Strict consequences", effects: { children: -3, stress: 6, marriage: 1 }, memory: "You responded to detention with firm consequences." },
      { label: "Blame the school", effects: { children: 2, stress: 8, marriage: -2 }, memory: "You blamed the school and the conflict escalated." }
    ]
  },

  {
    id: "car-breakdown",
    tags: ["midlife", "general"],
    title: "Car Breaks Down",
    severity: "major",
    surprise: true,
    category: "Random emergency",
    icon: "🚗",
    accent: "amber",
    description: "The car will not start on a morning when everyone needs to be somewhere.",
    choices: [
      { label: "Tow and repair it", effects: { money: -1800, stress: 9, health: -1 }, memory: "You handled a sudden car breakdown with a tow and repair." },
      { label: "Use emergency fund", effects: { money: -1200, stress: 4 }, memory: "You used savings to keep the car breakdown from taking over the week." },
      { label: "Delay and juggle rides", effects: { money: -250, stress: 12, marriage: -3, children: -2 }, memory: "You delayed the repair and spent the week juggling rides." }
    ]
  },
  {
    id: "furnace-replacement",
    title: "Furnace Goes Out",
    severity: "major",
    surprise: true,
    category: "Random emergency",
    icon: "🔥",
    accent: "rose",
    description: "The furnace quits during a cold snap and the repair tech says replacement may be the safest option.",
    choices: [
      { label: "Replace it now", effects: { money: -5200, stress: 10, health: 3 }, memory: "You replaced the furnace before the house got unsafe." },
      { label: "Finance the furnace", effects: { money: -1200, stress: 8, marriage: -2 }, memory: "You financed a furnace replacement to protect cash flow." },
      { label: "Patch and wait", effects: { money: -650, stress: 14, health: -5 }, memory: "You patched the failing furnace and hoped it would last." }
    ]
  },
  {
    id: "fence-blown-down",
    title: "Fence Blows Down",
    severity: "moderate",
    surprise: true,
    category: "Random emergency",
    icon: "🌬️",
    accent: "teal",
    description: "A windstorm knocks down a section of fence and the yard suddenly needs a fix.",
    choices: [
      { label: "Hire a repair crew", effects: { money: -1100, stress: -2, marriage: 2 }, memory: "You hired help after the fence blew down." },
      { label: "DIY this weekend", effects: { money: -320, stress: 7, health: -2 }, memory: "You spent the weekend fixing the blown-down fence yourself." },
      { label: "Temporary patch", effects: { money: -90, stress: 5, marriage: -1 }, memory: "You patched the blown-down fence and added it to the future list." }
    ]
  },
  {
    id: "school-fundraiser",
    title: "School Fundraiser",
    severity: "minor",
    description: "The class fundraiser needs families to sell tickets or volunteer at a booth.",
    choices: [
      { label: "Volunteer booth", effects: { children: 6, stress: 4, marriage: 2 }, memory: "You volunteered at the school fundraiser booth." },
      { label: "Donate quietly", effects: { money: -100, children: 3, stress: -1 }, memory: "You donated to the school fundraiser without taking a shift." },
      { label: "Opt out", effects: { stress: -3, children: -2 }, memory: "You opted out of the school fundraiser." }
    ]
  },
];


const generatedEventBlueprints = [
  { category: "Money", icon: "💳", accent: "amber", title: "Subscription Audit", description: "A forgotten subscription renewal hits your account this week.", minor: ["Cancel unused plans", { money: 95, stress: -2 }, "You trimmed unused subscriptions."], balanced: ["Keep favorites", { money: -35, stress: -1 }, "You kept the subscriptions you actually enjoy."], risky: ["Ignore the charge", { money: -120, stress: 3 }, "You ignored another subscription renewal."] },
  { category: "Wellness", icon: "🧘", accent: "green", title: "Morning Stretch", description: "A short mobility routine could make the week feel easier.", minor: ["Stretch daily", { health: 5, stress: -3 }, "You made stretching a small daily ritual."], balanced: ["Try twice", { health: 2, stress: -1 }, "You squeezed in a couple of stretch breaks."], risky: ["Skip it", { health: -2, stress: 2 }, "You skipped the stretch routine."] },
  { category: "Relationship", icon: "💌", accent: "rose", title: "Thoughtful Check-In", description: "Your partner seems quieter than usual after a busy day.", minor: ["Ask and listen", { marriage: 6, stress: -2 }, "You made space for a thoughtful relationship check-in."], balanced: ["Send a kind text", { marriage: 3, stress: -1 }, "You sent a small note of support."], risky: ["Assume it is fine", { marriage: -4, stress: 2 }, "You missed a chance to check in." ] },
  { category: "Parenting", icon: "🧩", accent: "teal", title: "Homework Spiral", description: "Homework turns into frustration right before bedtime.", minor: ["Coach calmly", { children: 6, stress: 2 }, "You helped homework end calmly."], balanced: ["Take a snack break", { children: 4, stress: -1 }, "You reset homework with a snack break."], risky: ["Push through", { children: -4, stress: 5 }, "You pushed through homework tension." ] },
  { category: "Career", icon: "📎", accent: "indigo", title: "Inbox Backlog", description: "Your inbox is full of small tasks competing for attention.", minor: ["Clear top priorities", { money: 110, stress: -3 }, "You cleared the highest-value inbox tasks."], balanced: ["Set a timer", { money: 60, stress: -1 }, "You used a timer to tame the inbox."], risky: ["Let it pile up", { stress: 5, health: -1 }, "The inbox kept piling up." ] },
  { category: "Home", icon: "🪴", accent: "green", title: "Plant Care", description: "The houseplants are drooping and need attention.", minor: ["Water and prune", { health: 2, stress: -3 }, "You revived the plants and the room felt calmer."], balanced: ["Water quickly", { stress: -1 }, "You gave the plants a quick rescue."], risky: ["Forget again", { stress: 2 }, "The plants stayed droopy another week." ] },
  { category: "Community", icon: "☕", accent: "blue", title: "Coffee Invitation", description: "Someone from your neighborhood suggests a low-key coffee meetup.", minor: ["Meet for coffee", { marriage: 4, stress: -2, money: -12 }, "You built community over coffee."], balanced: ["Suggest a walk", { health: 2, marriage: 3 }, "You turned coffee into a neighborhood walk."], risky: ["Decline twice", { marriage: -2, stress: 1 }, "You declined the neighborhood invite." ] },
  { category: "Health", icon: "🍲", accent: "green", title: "Lunch Choice", description: "Lunch can be quick comfort food or something that fuels the afternoon.", minor: ["Choose balanced lunch", { health: 4, stress: -1, money: -18 }, "You picked a balanced lunch."], balanced: ["Pack leftovers", { health: 3, money: 20 }, "You saved money with leftovers."], risky: ["Snack all day", { health: -3, stress: 3 }, "You grazed through the afternoon." ] },
  { category: "Errands", icon: "📮", accent: "amber", title: "Post Office Run", description: "A package return deadline is about to expire.", minor: ["Return it today", { money: 70, stress: -3 }, "You returned the package before the deadline."], balanced: ["Schedule pickup", { money: 45, stress: -1 }, "You scheduled a package pickup."], risky: ["Miss deadline", { money: -75, stress: 2 }, "You missed the return deadline." ] },
  { category: "Recovery", icon: "🌙", accent: "indigo", title: "Early Bedtime", description: "A quiet evening could become actual rest if you protect it.", minor: ["Sleep early", { health: 6, stress: -5 }, "You protected an early bedtime."], balanced: ["One calm hour", { health: 3, stress: -2 }, "You made room for one calm hour."], risky: ["Scroll late", { health: -4, stress: 4 }, "You scrolled late into the night." ] },
  { category: "Money", icon: "🧾", accent: "amber", title: "Bill Review", description: "A bill looks higher than expected and might be negotiable.", minor: ["Call provider", { money: 140, stress: 1 }, "You called and lowered a bill."], balanced: ["Compare plans", { money: 80, stress: 2 }, "You compared cheaper plans."], risky: ["Auto-pay it", { money: -90, stress: -1 }, "You paid the higher bill without review." ] },
  { category: "School", icon: "📚", accent: "blue", title: "Reading Log", description: "The weekly reading log needs a parent signature.", minor: ["Read together", { children: 5, stress: -1 }, "You read together and signed the log."], balanced: ["Sign and ask", { children: 3 }, "You checked in before signing the reading log."], risky: ["Forget it", { children: -3, stress: 3 }, "The reading log went back unsigned." ] },
  { category: "Major life event", icon: "🏥", accent: "rose", title: "Urgent Care Choice", severity: "major", description: "A concerning symptom raises the question of urgent care versus waiting.", minor: ["Go to urgent care", { money: -280, health: 9, stress: 4 }, "You got timely care for a concerning symptom."], balanced: ["Call nurse line", { money: -40, health: 4, stress: 1 }, "You used a nurse line to decide next steps."], risky: ["Wait it out", { health: -8, stress: 6 }, "You waited too long on a concerning symptom." ] },
  { category: "Major family event", icon: "🛟", accent: "rose", title: "Family Emergency", severity: "major", description: "A relative needs immediate help during a difficult moment.", minor: ["Show up fast", { children: 8, marriage: 5, stress: 8, money: -220 }, "You showed up for a family emergency."], balanced: ["Coordinate help", { children: 5, marriage: 3, stress: 4 }, "You coordinated support for the family emergency."], risky: ["Stay out of it", { children: -8, marriage: -4, stress: 3 }, "You stayed out of a family emergency." ] },
  { category: "Major career event", icon: "🚪", accent: "violet", title: "Job Interview", severity: "major", description: "A strong job lead appears, but preparing will crowd the week.", minor: ["Prepare deeply", { money: 850, stress: 8, health: -2 }, "You prepared hard for a job interview."], balanced: ["Prep essentials", { money: 420, stress: 4 }, "You covered the essentials before the interview."], risky: ["Wing it", { money: -150, stress: -2 }, "You winged an important interview." ] }
];

const generatedEvents = Array.from({ length: 279 }, (_, index) => {
  const blueprint = generatedEventBlueprints[index % generatedEventBlueprints.length];
  const cycle = Math.floor(index / generatedEventBlueprints.length) + 1;
  const severity = blueprint.severity ?? (index % 11 === 0 ? "moderate" : "minor");
  const titleSuffix = cycle > 1 ? ` ${cycle}` : "";

  return {
    id: `expanded-${index + 1}-${blueprint.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
    title: `${blueprint.title}${titleSuffix}`,
    severity,
    category: blueprint.category,
    icon: blueprint.icon,
    accent: blueprint.accent,
    description: blueprint.description,
    tags: blueprint.tags ?? ["general"],
    choices: [
      { label: blueprint.minor[0], effects: blueprint.minor[1], memory: blueprint.minor[2] },
      { label: blueprint.balanced[0], effects: blueprint.balanced[1], memory: blueprint.balanced[2] },
      { label: blueprint.risky[0], effects: blueprint.risky[1], memory: blueprint.risky[2] }
    ]
  };
});

const events = [...baseEvents, ...generatedEvents];

export default events;
