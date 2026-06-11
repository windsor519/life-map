import { useEffect, useMemo, useRef, useState } from "react";
import events from "./data/events.js";

const STORAGE_KEY = "life-map-game";
const seasons = ["Winter", "Spring", "Summer", "Fall"];
const WEEKS_PER_SEASON = 13;
const WEEKS_PER_YEAR = 52;
const seasonDecisionPlan = [
  {
    label: "Week 1 sample",
    description: "Pick a few early-season moves. These routine decisions are extrapolated across the quarter.",
    decisionCount: 3,
    effectMultiplier: 4,
    eventTypes: ["minor", "moderate"]
  },
  {
    label: "Week 2 sample",
    description: "Make one more representative week of choices before the sim projects the rest of the season.",
    decisionCount: 3,
    effectMultiplier: 4,
    eventTypes: ["minor", "moderate"]
  },
  {
    label: "Seasonal event",
    description: "One-off milestones and curveballs happen occasionally, not every day.",
    decisionCount: 2,
    effectMultiplier: 1,
    eventTypes: ["moderate", "major"]
  }
];
const severityConfig = {
  minor: { label: "Minor", icon: "·" },
  moderate: { label: "Moderate", icon: "◆" },
  major: { label: "Major", icon: "⚠" }
};
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const statConfig = {
  money: { label: "Money", icon: "💸", formatter: (value) => value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) },
  health: { label: "Health", icon: "💪", max: 100, tone: "good" },
  marriage: { label: "Relationship", icon: "💞", max: 100, tone: "good" },
  children: { label: "Family bond", icon: "🌱", max: 100, tone: "good" },
  stress: { label: "Stress", icon: "⚡", max: 100, tone: "bad" }
};

const summaryStatKeys = Object.keys(statConfig);
const captureStats = (game) =>
  summaryStatKeys.reduce((stats, key) => ({ ...stats, [key]: game[key] ?? 0 }), {});

const eventVisuals = {
  "daughter-recital": { icon: "🎼", accent: "violet", label: "Family moment" },
  "friend-birthday": { icon: "🎂", accent: "rose", label: "Social life" },
  "gym-session": { icon: "🏋️", accent: "green", label: "Wellness" },
  "annual-checkup": { icon: "🩺", accent: "blue", label: "Health" },
  "weekend-getaway": { icon: "🌄", accent: "amber", label: "Relationship" },
  "online-course": { icon: "💡", accent: "indigo", label: "Career" },
  "school-project": { icon: "🔬", accent: "teal", label: "Parenting" },
  "grocery-budget": { icon: "🛒", accent: "green", label: "Home" },
  "car-repair": { icon: "🚗", accent: "amber", label: "Errands" },
  "team-lunch": { icon: "🥗", accent: "blue", label: "Work" },
  "neighbor-help": { icon: "📦", accent: "teal", label: "Community" },
  "date-night": { icon: "🌙", accent: "rose", label: "Relationship" },
  "sleep-debt": { icon: "🛌", accent: "indigo", label: "Recovery" },
  "home-maintenance": { icon: "🔧", accent: "amber", label: "Home" },
  "volunteer-shift": { icon: "🤝", accent: "teal", label: "Community" },
  "side-hustle": { icon: "💼", accent: "violet", label: "Work" },
  "family-call": { icon: "☎️", accent: "blue", label: "Family" },
  "therapy-session": { icon: "🧠", accent: "green", label: "Wellness" },
  "kids-sports": { icon: "⚽", accent: "rose", label: "Parenting" },
  "investment-choice": { icon: "📈", accent: "amber", label: "Money" },
  "digital-detox": { icon: "📵", accent: "indigo", label: "Wellness" },
  "pop-quiz": { icon: "📝", accent: "blue", label: "School" },
  "school-supply-list": { icon: "🎒", accent: "green", label: "School" },
  "parent-teacher-conference": { icon: "🏫", accent: "amber", label: "School" },
  "field-trip-form": { icon: "🚌", accent: "teal", label: "School" },
  "bullying-report": { icon: "🛡️", accent: "rose", label: "Major school event" },
  "honor-roll-invite": { icon: "🏅", accent: "violet", label: "School" },
  "school-play-audition": { icon: "🎭", accent: "indigo", label: "School" },
  "scholarship-deadline": { icon: "🎓", accent: "amber", label: "Major school event" },
  "detention-call": { icon: "📞", accent: "rose", label: "School" },
  "school-fundraiser": { icon: "🎟️", accent: "teal", label: "School" }
};

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(value)));

const getStatSeverity = (value, config) => {
  if (!config.max) {
    return null;
  }

  const normalizedValue = clamp(value, 0, config.max);

  if (config.tone === "bad") {
    if (normalizedValue >= 80) return "critical";
    if (normalizedValue >= 60) return "warning";
    return "stable";
  }

  if (normalizedValue <= 20) return "critical";
  if (normalizedValue <= 40) return "warning";
  return "stable";
};

const severityCopy = {
  critical: { icon: "🚨", label: "Critical" },
  warning: { icon: "⚠️", label: "Watch" }
};

const createEventSeed = () => Math.floor(Math.random() * 1_000_000_000);
const seededRandom = (...values) => {
  let hash = 2166136261;

  values.join("|").split("").forEach((character) => {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  });

  return ((hash >>> 0) % 10000) / 10000;
};
const getRandomEventId = (excludeId) => {
  const availableEvents = events.filter((event) => event.id !== excludeId);
  const pool = availableEvents.length > 0 ? availableEvents : events;
  return pool[Math.floor(Math.random() * pool.length)].id;
};

const getSeverity = (event) => event.severity ?? "minor";
const getRandomChoice = (eventSeed, week, periodIndex, decisionIndex, choices) => {
  const choiceIndex = Math.floor(seededRandom(eventSeed, week, periodIndex, decisionIndex, "choice") * choices.length);
  return choices[Math.min(choiceIndex, choices.length - 1)];
};
const getSeasonNumber = (week) => Math.min(seasons.length, Math.max(1, Math.ceil(week / WEEKS_PER_SEASON)));
const getSeasonName = (week) => seasons[getSeasonNumber(week) - 1];
const getNextSeasonState = (week, age) => {
  const currentSeason = getSeasonNumber(week);
  const nextWeek = currentSeason === seasons.length ? 1 : currentSeason * WEEKS_PER_SEASON + 1;

  return {
    age: currentSeason === seasons.length ? age + 1 : age,
    month: Math.min(12, Math.ceil(nextWeek / 4.333)),
    week: nextWeek
  };
};

const scaleEffects = (effects, multiplier = 1) =>
  Object.fromEntries(Object.entries(effects).map(([key, value]) => [key, Math.round(value * multiplier)]));

const getSeasonEvents = (plan, eventSeed, week, planIndex, usedEventIds) => {
  const matchingEvents = events.filter((event) => plan.eventTypes.includes(getSeverity(event)));
  const fallbackPool = matchingEvents.length > 0 ? matchingEvents : events;

  return Array.from({ length: plan.decisionCount }, (_, decisionIndex) => {
    const availableEvents = fallbackPool.filter((event) => !usedEventIds.has(event.id));
    const eventPool = availableEvents.length > 0 ? availableEvents : fallbackPool;
    const eventIndex = Math.floor(seededRandom(eventSeed, week, planIndex, decisionIndex) * eventPool.length);
    const event = eventPool[Math.min(eventIndex, eventPool.length - 1)];

    usedEventIds.add(event.id);

    return {
      ...event,
      severity: getSeverity(event),
      effectMultiplier: plan.effectMultiplier,
      key: `${eventSeed}-${week}-${planIndex}-${decisionIndex}-${event.id}`,
      visual: eventVisuals[event.id] ?? { icon: event.icon ?? "✨", accent: event.accent ?? "blue", label: event.category ?? "Life" }
    };
  });
};

const getSeasonSchedule = (week, eventSeed) => {
  const usedEventIds = new Set();

  return seasonDecisionPlan.map((plan, planIndex) => ({
    ...plan,
    decisions: getSeasonEvents(plan, eventSeed, week, planIndex, usedEventIds)
  }));
};

const summaryCopy = {
  chaos: {
    mood: "🔥",
    headline: "Your calendar chose violence",
    joke: "Stress went up so fast it probably needs its own zip code.",
    award: "Certified Chaos Goblin Season"
  },
  broke: {
    mood: "💸",
    headline: "Financial oopsie with confidence",
    joke: "Your wallet is now running on vibes, lint, and one brave receipt.",
    award: "Most Dramatic Wallet Exit"
  },
  glow: {
    mood: "💪",
    headline: "Suspiciously responsible behavior",
    joke: "Health improved. Your couch has filed a missing person report.",
    award: "Unexpectedly Functional Adult"
  },
  romance: {
    mood: "💞",
    headline: "Main character relationship arc",
    joke: "The relationship meter blushed. Extremely unprofessional.",
    award: "Rom-Com Side Quest Complete"
  },
  family: {
    mood: "🌱",
    headline: "Family bond power-up",
    joke: "The kids may remember this fondly, pending snack availability.",
    award: "Snack-Based Legacy Builder"
  },
  legend: {
    mood: "🏆",
    headline: "Tiny wins, suspicious vibes",
    joke: "Nothing exploded, which experts are calling personal growth.",
    award: "Least Unhinged Season"
  },
  survived: {
    mood: "😵‍💫",
    headline: "You made it through somehow",
    joke: "No one knows how, but the season has legally ended.",
    award: "Emotional Support Calendar Needed"
  }
};

const getSummaryTone = (deltas) => {
  if (deltas.stress >= 12) return "chaos";
  if (deltas.money <= -500) return "broke";
  if (deltas.health >= 8) return "glow";
  if (deltas.marriage >= 8) return "romance";
  if (deltas.children >= 8) return "family";
  if (summaryStatKeys.every((key) => deltas[key] >= 0 || key === "stress") && deltas.stress <= 0) return "legend";
  return "survived";
};

const getLifeWeather = (deltas) => {
  if (deltas.stress >= 12) return "Thunderstorms with a chance of overthinking ⚡";
  if (deltas.money <= -500) return "Financial fog rolling through the wallet district 💸";
  if (deltas.health >= 8) return "Sunny with gains and suspiciously clean sneakers 💪";
  if (deltas.marriage >= 8) return "Warm rom-com breeze from the relationship department 💞";
  if (deltas.children >= 8) return "High-pressure family hugs with snack gusts 🌱";
  return "Partly chaotic, clearing by next season 😵‍💫";
};

const createSeasonSummary = ({ previousGame, nextState, highlights = [] }) => {
  const startStats = previousGame.seasonBaselineStats ?? previousGame.seasonStartStats ?? previousGame.weekStartStats ?? captureStats(previousGame);
  const endStats = captureStats(nextState);
  const deltas = summaryStatKeys.reduce((stats, key) => ({ ...stats, [key]: endStats[key] - (startStats[key] ?? previousGame[key] ?? 0) }), {});
  const tone = getSummaryTone(deltas);
  const copy = summaryCopy[tone];

  return {
    id: `${previousGame.eventSeed}-${previousGame.week}-${Date.now()}`,
    week: previousGame.week,
    season: getSeasonName(previousGame.week),
    seasonNumber: getSeasonNumber(previousGame.week),
    age: previousGame.age,
    deltas,
    highlights: highlights.slice(-3),
    weather: getLifeWeather(deltas),
    ...copy
  };
};

const formatSummaryDelta = (key, value) => {
  const prefix = value > 0 ? "+" : "";

  if (key === "money") {
    return `${prefix}${value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}`;
  }

  return `${prefix}${value}`;
};

const createDefaultGame = () => ({
  age: 40,
  money: 100000,
  health: 80,
  marriage: 75,
  children: 35,
  stress: 30,
  month: 1,
  week: 1,
  completedDecisions: [],
  selectedChoices: {},
  memories: [],
  currentEventId: getRandomEventId(),
  eventSeed: createEventSeed(),
  seasonStartStats: null,
  seasonBaselineStats: null,
  seasonSummary: null,
  initialized: false
});

const normalizeGame = (game) => ({
  ...createDefaultGame(),
  ...game,
  money: Math.round(Number(game?.money ?? 0)),
  age: clamp(Number(game?.age ?? 25), 12, 100),
  health: clamp(Number(game?.health ?? 70)),
  marriage: clamp(Number(game?.marriage ?? 40)),
  children: clamp(Number(game?.children ?? 0)),
  stress: clamp(Number(game?.stress ?? 30)),
  month: clamp(Number(game?.month ?? 1), 1, 12),
  week: clamp(Number(game?.week ?? game?.month ?? 1), 1, 52),
  completedDecisions: Array.isArray(game?.completedDecisions) ? game.completedDecisions : [],
  selectedChoices: game?.selectedChoices && typeof game.selectedChoices === "object" && !Array.isArray(game.selectedChoices) ? game.selectedChoices : {},
  memories: Array.isArray(game?.memories) ? game.memories.slice(-8) : [],
  eventSeed: Number.isFinite(Number(game?.eventSeed)) ? Number(game.eventSeed) : createEventSeed(),
  seasonStartStats: game?.seasonStartStats && typeof game.seasonStartStats === "object" ? game.seasonStartStats : game?.weekStartStats && typeof game.weekStartStats === "object" ? game.weekStartStats : null,
  seasonBaselineStats: game?.seasonBaselineStats && typeof game.seasonBaselineStats === "object" ? game.seasonBaselineStats : game?.weekStartStats && typeof game.weekStartStats === "object" ? game.weekStartStats : null,
  seasonSummary: game?.seasonSummary && typeof game.seasonSummary === "object" ? game.seasonSummary : game?.weeklySummary && typeof game.weeklySummary === "object" ? game.weeklySummary : null
});

const loadSavedGame = () => {
  if (typeof window === "undefined") {
    return createDefaultGame();
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? normalizeGame(JSON.parse(saved)) : createDefaultGame();
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return createDefaultGame();
  }
};

export default function App() {
  const [game, setGame] = useState(loadSavedGame);
  const [startAge, setStartAge] = useState(game.initialized ? game.age : 25);
  const [startMoney, setStartMoney] = useState(game.initialized ? game.money : 10000);
  const [quiz, setQuiz] = useState({
    exercise: "sometimes",
    stableJob: "no",
    social: "weak"
  });
  const [expandedDecisionKey, setExpandedDecisionKey] = useState(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
    }
  }, [game]);

  useEffect(() => () => stopZenMusic(false), []);

  const stopZenMusic = (updateState = true) => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    window.clearInterval(audio.chimeTimer);
    audio.nodes.forEach((node) => {
      node.stop?.();
      node.disconnect();
    });
    audio.context.close();
    audioRef.current = null;

    if (updateState) {
      setMusicPlaying(false);
    }
  };

  const startZenMusic = () => {
    if (typeof window === "undefined" || audioRef.current) {
      return;
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) {
      return;
    }

    const context = new AudioContext();
    const master = context.createGain();
    const padGain = context.createGain();
    const nodes = [];
    const padFrequencies = [174, 261.63, 329.63, 392];

    master.gain.value = 0.05;
    padGain.gain.value = 0.18;
    padGain.connect(master);
    master.connect(context.destination);

    padFrequencies.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const voiceGain = context.createGain();

      oscillator.type = index % 2 === 0 ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      voiceGain.gain.value = index === 0 ? 0.2 : 0.08;
      oscillator.connect(voiceGain);
      voiceGain.connect(padGain);
      oscillator.start();
      nodes.push(oscillator, voiceGain);
    });

    const playChime = () => {
      const now = context.currentTime;
      const oscillator = context.createOscillator();
      const chimeGain = context.createGain();
      const frequencies = [523.25, 587.33, 659.25, 783.99, 880];
      const frequency = frequencies[Math.floor(Math.random() * frequencies.length)];

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, now);
      chimeGain.gain.setValueAtTime(0, now);
      chimeGain.gain.linearRampToValueAtTime(0.18, now + 0.08);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);
      oscillator.connect(chimeGain);
      chimeGain.connect(master);
      oscillator.start(now);
      oscillator.stop(now + 3);
    };

    const chimeTimer = window.setInterval(playChime, 5400);
    playChime();

    audioRef.current = { chimeTimer, context, nodes };
    setMusicPlaying(true);
  };

  const toggleZenMusic = () => {
    if (musicPlaying) {
      stopZenMusic();
      return;
    }

    startZenMusic();
  };


  const startNewGame = (event) => {
    event?.preventDefault();
    const age = clamp(parseInt(startAge, 10) || 20, 12, 100);
    const money = Math.max(0, Math.round(parseInt(startMoney, 10) || 0));

    let health = 70;
    let marriage = 40;
    let children = 20;
    let stress = 30;

    if (quiz.exercise === "regularly") {
      health += 10;
      stress -= 5;
    } else if (quiz.exercise === "never") {
      health -= 10;
      stress += 5;
    }

    if (quiz.stableJob === "yes") {
      stress -= 10;
      marriage += 5;
    } else {
      stress += 15;
    }

    if (quiz.social === "strong") {
      marriage += 30;
      children += 20;
      stress -= 5;
    } else {
      marriage -= 10;
      stress += 5;
    }

    if (age >= 25 && age <= 40) marriage += 10;
    if (money >= 50000) marriage += 10;
    if (money < 5000) stress += 10;

    const newGame = {
      age,
      money,
      health: clamp(health),
      marriage: clamp(marriage),
      children: clamp(children),
      stress: clamp(stress),
      month: 1,
      week: 1,
      completedDecisions: [],
      selectedChoices: {},
      memories: ["You started a new life chapter."],
      currentEventId: getRandomEventId(),
      eventSeed: createEventSeed(),
      seasonStartStats: null,
      seasonSummary: null,
      initialized: true
    };

    setGame({
      ...newGame,
      seasonStartStats: captureStats(newGame),
      seasonBaselineStats: captureStats(newGame)
    });
    startZenMusic();
  };

  const resetGame = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    stopZenMusic();
    setGame(createDefaultGame());
    setStartAge(25);
    setStartMoney(10000);
    setQuiz({ exercise: "sometimes", stableJob: "no", social: "weak" });
  };

  const seasonSchedule = useMemo(() => getSeasonSchedule(game.week, game.eventSeed), [game.eventSeed, game.week]);
  const totalSeasonDecisions = seasonSchedule.reduce((total, period) => total + period.decisions.length, 0);
  const selectedChoices = game.selectedChoices ?? {};
  const completedThisSeason = Object.keys(selectedChoices).length || game.completedDecisions.length;
  const pendingThisSeason = Math.max(0, totalSeasonDecisions - completedThisSeason);
  const currentSeasonName = getSeasonName(game.week);
  const currentSeasonNumber = getSeasonNumber(game.week);
  const currentYearProgress = Math.round((game.week / WEEKS_PER_YEAR) * 100);

  const applyEffects = (baseState, effects) => {
    const next = { ...baseState };
    Object.entries(effects).forEach(([key, value]) => {
      next[key] = (next[key] ?? 0) + value;
    });

    return {
      ...next,
      money: Math.round(next.money),
      health: clamp(next.health),
      marriage: clamp(next.marriage),
      children: clamp(next.children),
      stress: clamp(next.stress)
    };
  };

  const handleChoice = (choice, decision, periodName) => {
    setGame((prevGame) => {
      const multiplier = decision.effectMultiplier ?? 1;
      const scaledEffects = scaleEffects(choice.effects, multiplier);
      const previousSelection = prevGame.selectedChoices?.[decision.key];
      const undoEffects = previousSelection
        ? Object.fromEntries(Object.entries(previousSelection.effects).map(([key, value]) => [key, -value]))
        : null;
      const stateBeforeChoice = undoEffects ? applyEffects(prevGame, undoEffects) : prevGame;
      const nextState = applyEffects(stateBeforeChoice, scaledEffects);
      const selectedChoices = {
        ...(prevGame.selectedChoices ?? {}),
        [decision.key]: {
          periodName,
          eventTitle: decision.title,
          label: choice.label,
          effects: scaledEffects,
          baseEffects: choice.effects,
          multiplier,
          memory: choice.memory
        }
      };
      const completedDecisions = Object.keys(selectedChoices);
      const seasonComplete = completedDecisions.length >= totalSeasonDecisions;
      const timestamp = `${getSeasonName(prevGame.week)} season, ${periodName}, age ${prevGame.age}`;
      const impactCopy = multiplier > 1 ? `${choice.memory} Extrapolated across the quarter.` : choice.memory;
      const memoryAction = previousSelection ? `changed ${decision.title} from ${previousSelection.label} to ${choice.label}` : impactCopy;

      const updatedGame = {
        ...nextState,
        completedDecisions,
        selectedChoices,
        currentEventId: getRandomEventId(prevGame.currentEventId),
        memories: [...prevGame.memories, `${timestamp}: ${memoryAction}`].slice(-8)
      };

      return {
        ...updatedGame,
        seasonStartStats: prevGame.seasonStartStats ?? captureStats(prevGame),
        seasonBaselineStats: prevGame.seasonBaselineStats ?? prevGame.seasonStartStats ?? captureStats(prevGame),
        seasonSummary: seasonComplete
          ? createSeasonSummary({ previousGame: prevGame, nextState, highlights: [`${periodName}: ${decision.title} → ${choice.label}`] })
          : prevGame.seasonSummary
      };
    });
  };

  const handleAdvanceSeason = () => {
    setExpandedDecisionKey(null);
    setGame((prevGame) => {
      const nextCalendar = getNextSeasonState(prevGame.week, prevGame.age);
      const nextGame = {
        ...prevGame,
        ...nextCalendar,
        completedDecisions: [],
        selectedChoices: {},
        currentEventId: getRandomEventId(prevGame.currentEventId),
        memories: [...prevGame.memories, `${getSeasonName(prevGame.week)} wrapped up. Your quarterly plan is now part of your story.`].slice(-8)
      };

      return {
        ...nextGame,
        seasonStartStats: captureStats(nextGame),
        seasonBaselineStats: captureStats(nextGame)
      };
    });
  };

  const handleSimulateSeason = () => {
    setExpandedDecisionKey(null);
    setGame((prevGame) => {
      const schedule = getSeasonSchedule(prevGame.week, prevGame.eventSeed);
      let nextState = prevGame;
      const simulatedMemories = [];
      const summaryHighlights = [];

      schedule.forEach((period, periodIndex) => {
        const periodResults = [];

        period.decisions.forEach((decision, decisionIndex) => {
          if (prevGame.completedDecisions.includes(decision.key)) {
            return;
          }

          const choice = getRandomChoice(prevGame.eventSeed, prevGame.week, periodIndex, decisionIndex, decision.choices);
          const scaledEffects = scaleEffects(choice.effects, decision.effectMultiplier ?? 1);
          nextState = applyEffects(nextState, scaledEffects);
          periodResults.push(`${decision.title}: ${choice.label}`);
          summaryHighlights.push(`${period.label}: ${decision.title} → ${choice.label}`);
        });

        if (periodResults.length > 0) {
          simulatedMemories.push(`${getSeasonName(prevGame.week)} season, ${period.label}, age ${prevGame.age}: Went with the flow (${periodResults.join("; ")}).`);
        }
      });

      if (simulatedMemories.length === 0) {
        return prevGame;
      }

      const advancedGame = {
        ...nextState,
        ...getNextSeasonState(prevGame.week, prevGame.age),
        completedDecisions: [],
        selectedChoices: {},
        currentEventId: getRandomEventId(prevGame.currentEventId),
        memories: [...prevGame.memories, ...simulatedMemories].slice(-8)
      };

      return {
        ...advancedGame,
        seasonStartStats: captureStats(advancedGame),
        seasonBaselineStats: captureStats(advancedGame),
        seasonSummary: createSeasonSummary({ previousGame: prevGame, nextState, highlights: summaryHighlights })
      };
    });
  };

  const renderEffectPreview = (effects) => (
    <span className="choice-effects" aria-label="Choice effects">
      {Object.entries(effects).map(([key, value]) => (
        <span className={value >= 0 ? "effect positive" : "effect negative"} key={key}>
          {statConfig[key]?.label ?? key} {value > 0 ? "+" : ""}{value}
        </span>
      ))}
    </span>
  );

  const renderSummaryDelta = (key, value) => {
    const config = statConfig[key];
    const isGoodChange = key === "stress" ? value <= 0 : value >= 0;

    return (
      <span className={`summary-delta ${isGoodChange ? "positive" : "negative"}`} key={key}>
        <span aria-hidden="true">{config?.icon}</span>
        <strong>{config?.label ?? key}</strong>
        <em>{formatSummaryDelta(key, value)}</em>
      </span>
    );
  };

  if (!game.initialized) {
    return (
      <main className="app-shell setup-shell">
        <section className="hero-card">
          <div>
            <p className="eyebrow">Life simulator</p>
            <h1>Design a life path worth replaying.</h1>
            <p className="subtitle">Improve your life one season at a time.</p>
          </div>
          <div className="life-board" aria-hidden="true">
            <span className="board-node node-money">💸</span>
            <span className="board-node node-heart">💞</span>
            <span className="board-node node-health">💪</span>
            <span className="board-node node-family">🌱</span>
            <span className="board-route" />
          </div>
        </section>

        <form className="panel setup-form" onSubmit={startNewGame}>
          <div className="form-grid">
            <label>
              <span>Starting age</span>
              <input type="number" value={startAge} onChange={(event) => setStartAge(event.target.value)} min={12} max={100} />
            </label>
            <label>
              <span>Starting money</span>
              <input type="number" value={startMoney} onChange={(event) => setStartMoney(event.target.value)} min={0} />
            </label>
          </div>

          <fieldset>
            <legend>How often do you exercise?</legend>
            <label><input type="radio" name="exercise" checked={quiz.exercise === "regularly"} onChange={() => setQuiz((q) => ({ ...q, exercise: "regularly" }))} /> Regularly</label>
            <label><input type="radio" name="exercise" checked={quiz.exercise === "sometimes"} onChange={() => setQuiz((q) => ({ ...q, exercise: "sometimes" }))} /> Sometimes</label>
            <label><input type="radio" name="exercise" checked={quiz.exercise === "never"} onChange={() => setQuiz((q) => ({ ...q, exercise: "never" }))} /> Rarely / Never</label>
          </fieldset>

          <fieldset>
            <legend>Do you have a stable job?</legend>
            <label><input type="radio" name="stableJob" checked={quiz.stableJob === "yes"} onChange={() => setQuiz((q) => ({ ...q, stableJob: "yes" }))} /> Yes</label>
            <label><input type="radio" name="stableJob" checked={quiz.stableJob === "no"} onChange={() => setQuiz((q) => ({ ...q, stableJob: "no" }))} /> No</label>
          </fieldset>

          <fieldset>
            <legend>Social circle</legend>
            <label><input type="radio" name="social" checked={quiz.social === "strong"} onChange={() => setQuiz((q) => ({ ...q, social: "strong" }))} /> Strong</label>
            <label><input type="radio" name="social" checked={quiz.social === "weak"} onChange={() => setQuiz((q) => ({ ...q, social: "weak" }))} /> Weak</label>
          </fieldset>

          <div className="actions">
            <button type="submit">Start Game</button>
            <button type="button" className="secondary" onClick={resetGame}>Reset</button>
          </div>
        </form>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">{currentSeasonName} · Quarter {currentSeasonNumber} · {monthNames[game.month - 1]} · Age {game.age}</p>
          <h1>Seasonal Life Map</h1>
        </div>
        <div className="topbar-actions">
          {pendingThisSeason === 0 ? (
            <button onClick={handleAdvanceSeason}>Advance Season</button>
          ) : (
            <button onClick={handleSimulateSeason}>Simulate Season</button>
          )}
          <button className="secondary music-toggle" onClick={toggleZenMusic}>{musicPlaying ? "Pause Zen" : "Play Zen"}</button>
          <button className="secondary" onClick={resetGame}>Restart Setup</button>
        </div>
      </header>

      <section className="stat-grid" aria-label="Current life stats">
        {Object.entries(statConfig).map(([key, config]) => {
          const value = game[key];
          const percentage = config.max ? `${clamp(value, 0, config.max)}%` : null;
          const severity = getStatSeverity(value, config);
          const alert = severityCopy[severity];
          return (
            <article className={`stat-card stat-${key} ${severity ? `severity-${severity}` : ""}`} key={key}>
              <div className="stat-icon" aria-hidden="true">{config.icon}</div>
              {alert ? (
                <div className={`stat-alert ${severity === "warning" ? "warning" : ""}`} aria-label={`${config.label} needs ${severity === "critical" ? "urgent attention" : "attention"}`}>
                  <span aria-hidden="true">{alert.icon}</span>
                  {alert.label}
                </div>
              ) : null}
              <span>{config.label}</span>
              <strong>{config.formatter ? config.formatter(value) : value}</strong>
              {percentage ? <div className={`meter ${config.tone}`}><span style={{ width: percentage }} /></div> : null}
            </article>
          );
        })}
      </section>

      <div className="game-layout">
        <section className="panel calendar-card">
          <div className="section-heading calendar-heading">
            <div>
              <p className="eyebrow">This season</p>
              <h2>Plan a quarter fast</h2>
            </div>
            <span>{pendingThisSeason} decisions left</span>
          </div>
          <p className="calendar-intro">Make decisions for one or two representative weeks, then the sim extrapolates those patterns across the quarter. Occasional seasonal events appear separately so recitals, conferences, and big curveballs do not happen every day.</p>
          <div className="flow-panel">
            <div>
              <strong>{pendingThisSeason === 0 ? "Season plan ready" : "Default mode: extrapolate the quarter"}</strong>
              <span>{completedThisSeason}/{totalSeasonDecisions} decisions selected. {pendingThisSeason === 0 ? "Review or change any highlighted choice before advancing." : `${pendingThisSeason} will be selected and extrapolated if you simulate.`}</span>
            </div>
            {pendingThisSeason === 0 ? (
              <button onClick={handleAdvanceSeason}>Advance Season</button>
            ) : (
              <button onClick={handleSimulateSeason}>Simulate Season</button>
            )}
          </div>
          <div className="seasonal-calendar">
            {seasonSchedule.map((period) => (
              <article className="period-column" key={period.label}>
                <div className="period-header">
                  <strong>{period.label}</strong>
                  <span>{period.decisions.length} decisions · {period.effectMultiplier > 1 ? `${period.effectMultiplier}× impact` : "one-off"}</span>
                </div>
                <p className="period-description">{period.description}</p>
                <div className="period-decisions">
                  {period.decisions.map((decision) => {
                    const selectedChoice = selectedChoices[decision.key];
                    const lockedLegacyChoice = !selectedChoice && game.completedDecisions.includes(decision.key);
                    const completed = Boolean(selectedChoice) || lockedLegacyChoice;
                    const isExpanded = expandedDecisionKey === decision.key;
                    return (
                      <section className={`decision-card severity-card-${decision.severity} accent-${decision.visual.accent} ${completed ? "completed" : ""} ${isExpanded ? "expanded" : ""}`} key={decision.key}>
                        <button
                          className="decision-toggle"
                          type="button"
                          aria-expanded={isExpanded}
                          onClick={() => setExpandedDecisionKey(isExpanded ? null : decision.key)}
                        >
                          <span className="decision-title">
                            <span className="mini-icon" aria-hidden="true">{decision.visual.icon}</span>
                            <span>
                              <small>{decision.visual.label}</small>
                              <h3>{decision.title}</h3>
                            </span>
                          </span>
                          <span className="decision-status">
                            {selectedChoice ? <span className="selected-pill">Picked</span> : null}
                            <span className={`severity-badge severity-${decision.severity}`}>
                              <span aria-hidden="true">{severityConfig[decision.severity]?.icon}</span>
                              {severityConfig[decision.severity]?.label ?? decision.severity}
                            </span>
                            <span className="expand-cue" aria-hidden="true">{isExpanded ? "−" : "+"}</span>
                          </span>
                        </button>
                        {isExpanded ? (
                          <div className="decision-details">
                            <p>{decision.description}</p>
                            {selectedChoice ? (
                              <div className="selected-summary" aria-live="polite">
                                <span>Selected</span>
                                <strong>{selectedChoice.label}</strong>
                                <small>Pick another option below to change this decision.</small>
                              </div>
                            ) : null}
                            <div className="decision-options">
                              {decision.choices.map((choice) => {
                                const isSelected = selectedChoice?.label === choice.label;
                                return (
                                  <button
                                    className={`option-button ${isSelected ? "selected" : ""}`}
                                    disabled={lockedLegacyChoice}
                                    key={choice.label}
                                    onClick={() => {
                                      handleChoice(choice, decision, period.label);
                                      setExpandedDecisionKey(null);
                                    }}
                                  >
                                    <span className="choice-label-row">
                                      <strong>{choice.label}</strong>
                                      {isSelected ? <span className="selected-pill">Selected</span> : null}
                                    </span>
                                    {renderEffectPreview(scaleEffects(choice.effects, decision.effectMultiplier ?? 1))}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ) : null}
                      </section>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="side-stack">
          <section className="panel timeline-card">
            <div className="section-heading">
              <h2>Year progress</h2>
              <span>{currentYearProgress}%</span>
            </div>
            <div className="year-ring" style={{ "--progress": `${currentYearProgress}%` }}>
              <div>
                <strong>Q{currentSeasonNumber}</strong>
                <span>{currentSeasonName} · Age {game.age}</span>
              </div>
            </div>
            <p>Use Simulate Season to resolve two sample weeks plus a one-off seasonal event. Fall wraps the year and adds a birthday.</p>
          </section>

          {game.seasonSummary ? (
            <section className="panel season-summary-card" aria-live="polite">
              <div className="summary-confetti" aria-hidden="true">
                <span>{game.seasonSummary.mood}</span>
                <span>💸</span>
                <span>⚡</span>
                <span>💪</span>
              </div>
              <div className="section-heading summary-heading">
                <div>
                  <p className="eyebrow">Ridiculous recap</p>
                  <h2>{game.seasonSummary.season} recap</h2>
                </div>
                <span>Age {game.seasonSummary.age}</span>
              </div>
              <div className="summary-hero">
                <span className="summary-mascot" aria-hidden="true">{game.seasonSummary.mood}</span>
                <div>
                  <h3>{game.seasonSummary.headline}</h3>
                  <p>{game.seasonSummary.joke}</p>
                </div>
              </div>
              <div className="summary-weather">
                <span>Life weather</span>
                <strong>{game.seasonSummary.weather}</strong>
              </div>
              <div className="summary-deltas" aria-label="Seasonal stat changes">
                {summaryStatKeys.map((key) => renderSummaryDelta(key, game.seasonSummary.deltas[key] ?? 0))}
              </div>
              <div className="summary-award">
                <span aria-hidden="true">🏅</span>
                <div>
                  <small>Fake award</small>
                  <strong>{game.seasonSummary.award}</strong>
                </div>
              </div>
              {(game.seasonSummary.highlights ?? []).length > 0 ? (
                <ul className="summary-highlights">
                  {(game.seasonSummary.highlights ?? []).map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ) : null}

          <section className="panel memories-card">
            <div className="section-heading">
              <h2>Recent memories</h2>
              <span>{game.memories.length}/8 saved</span>
            </div>
            {game.memories.length === 0 ? (
              <p>No memories yet.</p>
            ) : (
              <ol>
                {[...game.memories].reverse().map((memory) => (
                  <li key={memory}>{memory}</li>
                ))}
              </ol>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}
