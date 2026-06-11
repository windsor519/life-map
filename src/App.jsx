import { useState } from "react";

export default function App() {
  const [game, setGame] = useState({
    age: 40,
    money: 100000,
    health: 80,
    marriage: 75,
    children: 70,
    stress: 30,
    memories: []
  });

  const attendRecital = () => {
    setGame({
      ...game,
      children: game.children + 10,
      money: game.money - 100,
      memories: [
        ...game.memories,
        "Attended daughter's recital"
      ]
    });
  };

  const workOvertime = () => {
    setGame({
      ...game,
      money: game.money + 500,
      children: game.children - 5,
      stress: game.stress + 5
    });
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: 24, maxWidth: 560, margin: "0 auto" }}>
      <h1>Life Map</h1>

      <div>Age {game.age}</div>
      <div>Money: ${game.money}</div>
      <div>Health: {game.health}</div>
      <div>Marriage: {game.marriage}</div>
      <div>Children: {game.children}</div>
      <div>Stress: {game.stress}</div>

      <section style={{ marginTop: 24 }}>
        <p>Your daughter has a recital tonight.</p>
        <button onClick={attendRecital} style={{ marginRight: 12, padding: "8px 16px" }}>
          Attend
        </button>
        <button onClick={workOvertime} style={{ padding: "8px 16px" }}>
          Work Overtime
        </button>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Memories</h2>
        <ul>
          {game.memories.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
