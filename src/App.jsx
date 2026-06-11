import { useEffect, useMemo, useState } from "react";
import events from "./data/events.js";

const STORAGE_KEY = "life-map-game";
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
  "school-project": { icon: "🔬", accent: "teal", label: "Parenting" }
};

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(value)));
const getRandomEventId = (excludeId) => {
  const availableEvents = events.filter((event) => event.id !== excludeId);
  const pool = availableEvents.length > 0 ? availableEvents : events;
  return pool[Math.floor(Math.random() * pool.length)].id;
};

const createDefaultGame = () => ({
  age: 40,
  money: 100000,
  health: 80,
  marriage: 75,
  children: 35,
  stress: 30,
  month: 1,
  memories: [],
  currentEventId: getRandomEventId(),
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
  memories: Array.isArray(game?.memories) ? game.memories.slice(-8) : []
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
      memories: ["You started a new life chapter."],
      currentEventId: getRandomEventId(),
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

  const currentEvent = useMemo(
    () => events.find((event) => event.id === game.currentEventId) ?? events[0],
    [game.currentEventId]
  );
  const currentVisual = eventVisuals[currentEvent.id] ?? { icon: "✨", accent: "blue", label: "Life event" };
  const currentYearProgress = Math.round((game.month / 12) * 100);

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

  const handleChoice = (choice) => {
    setGame((prevGame) => {
      const nextMonth = prevGame.month === 12 ? 1 : prevGame.month + 1;
      const nextAge = prevGame.month === 12 ? prevGame.age + 1 : prevGame.age;
      const nextState = applyEffects(prevGame, choice.effects);
      const timestamp = `${monthNames[prevGame.month - 1]}, age ${prevGame.age}`;

      return {
        ...nextState,
        age: nextAge,
        month: nextMonth,
        currentEventId: getRandomEventId(prevGame.currentEventId),
        memories: [...prevGame.memories, `${timestamp}: ${choice.memory}`].slice(-8)
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
            <p className="subtitle">Pick your starting conditions, then watch each monthly choice ripple across money, wellness, relationships, family, and stress.</p>
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
          <p className="eyebrow">{monthNames[game.month - 1]} · Age {game.age}</p>
          <h1>Life Map</h1>
        </div>
        <button className="secondary" onClick={resetGame}>Restart Setup</button>
      </header>

      <section className="stat-grid" aria-label="Current life stats">
        {Object.entries(statConfig).map(([key, config]) => {
          const value = game[key];
          const percentage = config.max ? `${clamp(value, 0, config.max)}%` : null;
          return (
            <article className={`stat-card stat-${key}`} key={key}>
              <div className="stat-icon" aria-hidden="true">{config.icon}</div>
              <span>{config.label}</span>
              <strong>{config.formatter ? config.formatter(value) : value}</strong>
              {percentage ? <div className={`meter ${config.tone}`}><span style={{ width: percentage }} /></div> : null}
            </article>
          );
        })}
      </section>

      <div className="game-layout">
        <section className={`panel event-card accent-${currentVisual.accent}`}>
          <div className="event-kicker">
            <span className="event-icon" aria-hidden="true">{currentVisual.icon}</span>
            <div>
              <p className="eyebrow">This month</p>
              <span>{currentVisual.label}</span>
            </div>
          </div>
          <h2>{currentEvent.title}</h2>
          <p>{currentEvent.description}</p>
          <div className="choice-grid">
            {currentEvent.choices.map((choice) => (
              <button className="choice-button" key={choice.label} onClick={() => handleChoice(choice)}>
                <strong>{choice.label}</strong>
                {renderEffectPreview(choice.effects)}
              </button>
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
                <strong>{monthNames[game.month - 1].slice(0, 3)}</strong>
                <span>Age {game.age}</span>
              </div>
            </div>
            <p>Every decision advances the calendar one month. December choices unlock a new birthday.</p>
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
