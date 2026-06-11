import { useEffect, useState } from "react";
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

const getRandomEventId = () => events[Math.floor(Math.random() * events.length)].id;

const defaultGame = {
  age: 40,
  money: 100000,
  health: 80,
  marriage: 75,
  children: 0,
  stress: 30,
  month: 1,
  memories: [],
  currentEventId: getRandomEventId(),
  initialized: false
};

export default function App() {
  const [game, setGame] = useState(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    return saved ? JSON.parse(saved) : defaultGame;
  });

  const [startAge, setStartAge] = useState(game.age ?? 25);
  const [startMoney, setStartMoney] = useState(game.money ?? 10000);
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

  const startNewGame = (e) => {
    e?.preventDefault();
    const age = parseInt(startAge, 10) || 20;
    const money = parseInt(startMoney, 10) || 0;

    // base stats
    let health = 70;
    let marriage = 40;
    let children = 0;
    let stress = 30;

    // exercise effect
    if (quiz.exercise === "regularly") {
      health += 10;
      stress -= 5;
    } else if (quiz.exercise === "sometimes") {
      health += 0;
    } else {
      health -= 10;
      stress += 5;
    }

    // job effect
    if (quiz.stableJob === "yes") {
      stress -= 10;
    } else {
      stress += 15;
    }

    // social effect
    if (quiz.social === "strong") {
      marriage += 30;
      children += 20;
      stress -= 5;
    } else {
      marriage -= 10;
      stress += 5;
    }

    // age/money modifiers
    if (age >= 25 && age <= 40) marriage += 10;
    if (money >= 50000) marriage += 10;
    if (money < 5000) stress += 10;

    // clamp values
    const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(v)));

    const newGame = {
      age: age,
      money: money,
      health: clamp(health),
      marriage: clamp(marriage),
      children: clamp(children),
      stress: clamp(stress),
      month: 1,
      memories: ["Game started."],
      currentEventId: getRandomEventId(),
      initialized: true
    };

    setGame(newGame);
  };

  const resetGame = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setGame({ ...defaultGame });
    setStartAge(25);
    setStartMoney(10000);
    setQuiz({ exercise: "sometimes", stableJob: "no", social: "weak" });
  };

  const currentEvent = events.find((event) => event.id === game.currentEventId) ?? events[0];

  const applyEffects = (baseState, effects) => {
    const next = { ...baseState };
    Object.entries(effects).forEach(([key, value]) => {
      next[key] = (next[key] ?? 0) + value;
    });
    return next;
  };

  const handleChoice = (choice) => {
    setGame((prevGame) => {
      const nextMonth = prevGame.month === 12 ? 1 : prevGame.month + 1;
      const nextAge = prevGame.month === 12 ? prevGame.age + 1 : prevGame.age;
      const nextState = applyEffects(prevGame, choice.effects);

      return {
        ...nextState,
        age: nextAge,
        month: nextMonth,
        currentEventId: getRandomEventId(),
        memories: [...prevGame.memories, choice.memory]
      };
    });
  };

  if (!game.initialized) {
    return (
      <div style={{ fontFamily: "sans-serif", padding: 24, maxWidth: 560, margin: "0 auto" }}>
        <h1>Life Map — Setup</h1>
        <form onSubmit={startNewGame}>
          <div style={{ marginBottom: 12 }}>
            <label>Starting age: </label>
            <input type="number" value={startAge} onChange={(e) => setStartAge(e.target.value)} min={12} max={100} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Starting money: </label>
            <input type="number" value={startMoney} onChange={(e) => setStartMoney(e.target.value)} min={0} />
          </div>

          <fieldset style={{ marginBottom: 12 }}>
            <legend>How often do you exercise?</legend>
            <label>
              <input type="radio" name="exercise" checked={quiz.exercise === "regularly"} onChange={() => setQuiz((q) => ({ ...q, exercise: "regularly" }))} /> Regularly
            </label>
            <br />
            <label>
              <input type="radio" name="exercise" checked={quiz.exercise === "sometimes"} onChange={() => setQuiz((q) => ({ ...q, exercise: "sometimes" }))} /> Sometimes
            </label>
            <br />
            <label>
              <input type="radio" name="exercise" checked={quiz.exercise === "never"} onChange={() => setQuiz((q) => ({ ...q, exercise: "never" }))} /> Rarely / Never
            </label>
          </fieldset>

          <fieldset style={{ marginBottom: 12 }}>
            <legend>Do you have a stable job?</legend>
            <label>
              <input type="radio" name="stableJob" checked={quiz.stableJob === "yes"} onChange={() => setQuiz((q) => ({ ...q, stableJob: "yes" }))} /> Yes
            </label>
            <br />
            <label>
              <input type="radio" name="stableJob" checked={quiz.stableJob === "no"} onChange={() => setQuiz((q) => ({ ...q, stableJob: "no" }))} /> No
            </label>
          </fieldset>

          <fieldset style={{ marginBottom: 12 }}>
            <legend>Social circle</legend>
            <label>
              <input type="radio" name="social" checked={quiz.social === "strong"} onChange={() => setQuiz((q) => ({ ...q, social: "strong" }))} /> Strong
            </label>
            <br />
            <label>
              <input type="radio" name="social" checked={quiz.social === "weak"} onChange={() => setQuiz((q) => ({ ...q, social: "weak" }))} /> Weak
            </label>
          </fieldset>

          <div>
            <button type="submit" style={{ padding: "8px 16px", marginRight: 8 }}>Start Game</button>
            <button type="button" onClick={resetGame} style={{ padding: "8px 16px" }}>Reset</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "sans-serif", padding: 24, maxWidth: 560, margin: "0 auto" }}>
      <h1>Life Map</h1>

      <div>Age: {game.age}</div>
      <div>Month: {monthNames[game.month - 1]}</div>
      <div>Money: ${game.money}</div>
      <div>Health: {game.health}</div>
      <div>Marriage: {game.marriage}</div>
      <div>Children: {game.children}</div>
      <div>Stress: {game.stress}</div>

      <section style={{ marginTop: 24 }}>
        <h2>{currentEvent.title}</h2>
        <p>{currentEvent.description}</p>
        {currentEvent.choices.map((choice, index) => (
          <button
            key={index}
            onClick={() => handleChoice(choice)}
            style={{ marginRight: 12, marginBottom: 12, padding: "8px 16px" }}
          >
            {choice.label}
          </button>
        ))}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Memories</h2>
        {game.memories.length === 0 ? (
          <p>No memories yet.</p>
        ) : (
          <ul>
            {game.memories.map((memory, i) => (
              <li key={i}>{memory}</li>
            ))}
          </ul>
        )}
      </section>

      <div style={{ marginTop: 24 }}>
        <button onClick={resetGame} style={{ padding: "8px 16px" }}>Restart Setup</button>
      </div>
    </div>
  );
}
