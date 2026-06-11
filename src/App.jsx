import { useEffect, useMemo, useState } from "react";
import events from "./data/events.js";

const STORAGE_KEY = "life-map-game";
const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const decisionsPerDay = [2, 3, 4, 2, 3, 5, 2];
const severityConfig = {
  minor: { label: "Minor", icon: "•" },
  moderate: { label: "Moderate", icon: "◆" },
  major: { label: "Major", icon: "✦" }
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
const getRandomChoice = (eventSeed, week, dayIndex, decisionIndex, choices) => {
  const choiceIndex = Math.floor(seededRandom(eventSeed, week, dayIndex, decisionIndex, "choice") * choices.length);
  return choices[Math.min(choiceIndex, choices.length - 1)];
};
const getNextWeekState = (week, age) => {
  const nextWeek = week === 52 ? 1 : week + 1;

  return {
    age: week === 52 ? age + 1 : age,
    month: Math.min(12, Math.ceil(nextWeek / 4.333)),
    week: nextWeek
  };
};

const getWeekSchedule = (week, eventSeed) =>
  dayNames.map((day, dayIndex) => ({
    day,
    decisions: Array.from({ length: decisionsPerDay[dayIndex] }, (_, decisionIndex) => {
      const eventIndex = Math.floor(seededRandom(eventSeed, week, dayIndex, decisionIndex) * events.length);
      const event = events[eventIndex];
      return {
        ...event,
        severity: getSeverity(event),
        key: `${eventSeed}-${week}-${dayIndex}-${decisionIndex}-${event.id}`,
        visual: eventVisuals[event.id] ?? { icon: "✨", accent: "blue", label: "Life" }
      };
    })
  }));

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
  memories: [],
  currentEventId: getRandomEventId(),
  eventSeed: createEventSeed(),
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
  memories: Array.isArray(game?.memories) ? game.memories.slice(-8) : [],
  eventSeed: Number.isFinite(Number(game?.eventSeed)) ? Number(game.eventSeed) : createEventSeed()
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
    }
  }, [game]);

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

    setGame({
      age,
      money,
      health: clamp(health),
      marriage: clamp(marriage),
      children: clamp(children),
      stress: clamp(stress),
      month: 1,
      week: 1,
      completedDecisions: [],
      memories: ["You started a new life chapter."],
      currentEventId: getRandomEventId(),
      eventSeed: createEventSeed(),
      initialized: true
    });
  };

  const resetGame = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setGame(createDefaultGame());
    setStartAge(25);
    setStartMoney(10000);
    setQuiz({ exercise: "sometimes", stableJob: "no", social: "weak" });
  };

  const weekSchedule = useMemo(() => getWeekSchedule(game.week, game.eventSeed), [game.eventSeed, game.week]);
  const totalWeeklyDecisions = weekSchedule.reduce((total, day) => total + day.decisions.length, 0);
  const completedThisWeek = game.completedDecisions.length;
  const pendingThisWeek = Math.max(0, totalWeeklyDecisions - completedThisWeek);
  const currentYearProgress = Math.round((game.week / 52) * 100);

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

  const handleChoice = (choice, decision, dayName) => {
    setGame((prevGame) => {
      if (prevGame.completedDecisions.includes(decision.key)) {
        return prevGame;
      }

      const schedule = getWeekSchedule(prevGame.week, prevGame.eventSeed);
      const totalDecisions = schedule.reduce((total, day) => total + day.decisions.length, 0);
      const completedDecisions = [...prevGame.completedDecisions, decision.key];
      const weekComplete = completedDecisions.length >= totalDecisions;
      const nextDate = weekComplete ? getNextWeekState(prevGame.week, prevGame.age) : { age: prevGame.age, month: prevGame.month, week: prevGame.week };
      const nextState = applyEffects(prevGame, choice.effects);
      const timestamp = `Week ${prevGame.week}, ${dayName}, age ${prevGame.age}`;

      return {
        ...nextState,
        ...nextDate,
        completedDecisions: weekComplete ? [] : completedDecisions,
        currentEventId: getRandomEventId(prevGame.currentEventId),
        memories: [...prevGame.memories, `${timestamp}: ${choice.memory}`].slice(-8)
      };
    });
  };

  const handleSimulateWeek = () => {
    setGame((prevGame) => {
      const schedule = getWeekSchedule(prevGame.week, prevGame.eventSeed);
      let nextState = prevGame;
      const simulatedMemories = [];

      schedule.forEach((day, dayIndex) => {
        const dayResults = [];

        day.decisions.forEach((decision, decisionIndex) => {
          if (prevGame.completedDecisions.includes(decision.key)) {
            return;
          }

          const choice = getRandomChoice(prevGame.eventSeed, prevGame.week, dayIndex, decisionIndex, decision.choices);
          nextState = applyEffects(nextState, choice.effects);
          dayResults.push(`${decision.title}: ${choice.label}`);
        });

        if (dayResults.length > 0) {
          simulatedMemories.push(`Week ${prevGame.week}, ${day.day}, age ${prevGame.age}: Went with the flow (${dayResults.join("; ")}).`);
        }
      });

      if (simulatedMemories.length === 0) {
        return prevGame;
      }

      return {
        ...nextState,
        ...getNextWeekState(prevGame.week, prevGame.age),
        completedDecisions: [],
        currentEventId: getRandomEventId(prevGame.currentEventId),
        memories: [...prevGame.memories, ...simulatedMemories].slice(-8)
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

  if (!game.initialized) {
    return (
      <main className="app-shell setup-shell">
        <section className="hero-card">
          <div>
            <p className="eyebrow">Life simulator</p>
            <h1>Design a life path worth replaying.</h1>
            <p className="subtitle">Pick your starting conditions, then face a new random calendar of minor, moderate, and major life events, including school surprises that ripple across money, wellness, relationships, family, and stress.</p>
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
          <p className="eyebrow">Week {game.week} · {monthNames[game.month - 1]} · Age {game.age}</p>
          <h1>Weekly Life Map</h1>
        </div>
        <div className="topbar-actions">
          <button onClick={handleSimulateWeek}>Simulate Week</button>
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
              <p className="eyebrow">This week</p>
              <h2>Simulate your week</h2>
            </div>
            <span>{pendingThisWeek} flow events pending</span>
          </div>
          <p className="calendar-intro">You do not have to pick every option. Press Simulate Week to go with the flow, then Monday through Sunday will resolve with random choices and random minor, moderate, or major events.</p>
          <div className="flow-panel">
            <div>
              <strong>Default mode: go with the flow</strong>
              <span>Manual choices are optional; the simulator will randomly handle anything left pending.</span>
            </div>
            <button onClick={handleSimulateWeek}>Simulate Week</button>
          </div>
          <div className="weekly-calendar">
            {weekSchedule.map((day) => (
              <article className="day-column" key={day.day}>
                <div className="day-header">
                  <strong>{day.day}</strong>
                  <span>{day.decisions.length} decisions</span>
                </div>
                <div className="day-decisions">
                  {day.decisions.map((decision) => {
                    const completed = game.completedDecisions.includes(decision.key);
                    return (
                      <section className={`decision-card accent-${decision.visual.accent} ${completed ? "completed" : ""}`} key={decision.key}>
                        <div className="decision-title">
                          <span className="mini-icon" aria-hidden="true">{decision.visual.icon}</span>
                          <div>
                            <small>{decision.visual.label}</small>
                            <h3>{decision.title}</h3>
                          </div>
                          <span className={`severity-badge severity-${decision.severity}`}>
                            <span aria-hidden="true">{severityConfig[decision.severity]?.icon}</span>
                            {severityConfig[decision.severity]?.label ?? decision.severity}
                          </span>
                        </div>
                        <p>{decision.description}</p>
                        <div className="decision-options">
                          {decision.choices.map((choice) => (
                            <button
                              className="option-button"
                              disabled={completed}
                              key={choice.label}
                              onClick={() => handleChoice(choice, decision, day.day)}
                            >
                              <strong>{choice.label}</strong>
                              {renderEffectPreview(choice.effects)}
                            </button>
                          ))}
                        </div>
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
                <strong>W{game.week}</strong>
                <span>Age {game.age}</span>
              </div>
            </div>
            <p>Use Simulate Week to automatically resolve Monday through Sunday. Week 52 adds a new birthday.</p>
          </section>

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
