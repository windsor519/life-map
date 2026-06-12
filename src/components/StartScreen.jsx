const familyInputs = [
  { key: "grandparents", label: "Grandparents (up to 4)", placeholder: "Example: Nana Rose, Grandpa Lee", type: "textarea" },
  { key: "grandparentsAges", label: "Grandparents ages", placeholder: "Example: 72, 74", type: "textarea" },
  { key: "grandparentsSexes", label: "Grandparents sex", placeholder: "Example: female, male", type: "textarea" },
  { key: "greatGrandparents", label: "Great-grandparents (up to 4)", placeholder: "Optional names, separated by commas", type: "textarea" },
  { key: "greatGrandparentsAges", label: "Great-grandparents ages", placeholder: "Optional ages, same order", type: "textarea" },
  { key: "greatGrandparentsSexes", label: "Great-grandparents sex", placeholder: "Example: male, female", type: "textarea" },
  { key: "spouse", label: "Spouse / partner name", placeholder: "Optional", type: "input" },
  { key: "spouseAge", label: "Spouse / partner age", placeholder: "Optional age", type: "input" },
  { key: "spouseSex", label: "Spouse / partner sex", placeholder: "Optional: male or female", type: "input" },
  { key: "kids", label: "Kids (up to 6)", placeholder: "Optional names, separated by commas", type: "textarea" },
  { key: "kidsAges", label: "Kids ages", placeholder: "Optional ages, same order", type: "textarea" },
  { key: "kidsSexes", label: "Kids sex", placeholder: "Example: boy, girl, boy", type: "textarea" }
];

const startingStatSliders = [
  { key: "wellbeing", description: "Your starting physical health, emotional margin, and day-to-day calm." },
  { key: "marriage", description: "Your starting spouse / partner connection, not general friendships." },
  { key: "children", description: "Your starting bond with your children and parenting home base." },
  { key: "wallet", description: "Your starting financial cushion and resource stability." }
];
export default function StartScreen({
  familyInput,
  formatSummaryDelta,
  legacy,
  onOpenSettings,
  onResetGame,
  onStartGame,
  setFamilyInput,
  setStartingStats,
  setStartAge,
  setStartName,
  setStartSex,
  startAge,
  startName,
  startSex,
  startingStats,
  statConfig,
  totalLegacyBonuses
}) {
  const updateFamilyField = (key, value) => {
    setFamilyInput((family) => ({ ...family, [key]: value }));
  };

  const legacyPreviewStats = [
    { key: "wellbeing", icon: statConfig.wellbeing.icon, delta: totalLegacyBonuses.wellbeing ?? 0 },
    { key: "marriage", icon: statConfig.marriage.icon, delta: totalLegacyBonuses.marriage ?? 0 },
    { key: "children", icon: statConfig.children.icon, delta: totalLegacyBonuses.children ?? 0 },
    { key: "wallet", icon: statConfig.wallet.icon, delta: totalLegacyBonuses.wallet ?? 0 }
  ];

  return (
    <main className="app-shell setup-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Life simulator</p>
          <h1>Navigate a challenging phase of life.</h1>
          <p className="subtitle">With kids, aging grandparents, and hard choices—can you make it through?</p>
        </div>
        <div className="life-board" aria-hidden="true">
          <span className="board-node node-heart">💞</span>
          <span className="board-node node-health">💪</span>
          <span className="board-node node-family">🌱</span>
          <span className="board-route" />
        </div>
      </section>

      <form className="panel setup-form" onSubmit={onStartGame}>
        <section className="family-panel" aria-label="Family setup">
          <div className="randomizer-heading">
            <div>
              <p className="eyebrow">Family first</p>
              <h2>Enter your family</h2>
              <p>No premade characters. Add optional names, ages, and sex markers so the family view can size everyone and grow kids by season.</p>
            </div>
          </div>

          <div className="family-grid">
            {familyInputs.map((field) => (
              <label key={field.key}>
                <span>{field.label}</span>
                {field.type === "textarea" ? (
                  <textarea
                    value={familyInput[field.key]}
                    onChange={(event) => updateFamilyField(field.key, event.target.value)}
                    placeholder={field.placeholder}
                    rows={3}
                  />
                ) : (
                  <input
                    type="text"
                    value={familyInput[field.key]}
                    onChange={(event) => updateFamilyField(field.key, event.target.value)}
                    placeholder={field.placeholder}
                  />
                )}
              </label>
            ))}
          </div>
        </section>

        <div className="form-grid">
          <label>
            <span>Your name (optional)</span>
            <input type="text" value={startName} onChange={(event) => setStartName(event.target.value)} placeholder="What should the story call you?" />
          </label>
          <label>
            <span>Starting age</span>
            <input type="number" value={startAge} onChange={(event) => setStartAge(event.target.value)} min={12} max={100} />
          </label>
          <label>
            <span>Your sex</span>
            <input type="text" value={startSex} onChange={(event) => setStartSex(event.target.value)} placeholder="Optional: male or female" />
          </label>
        </div>

        <section className="custom-events-panel compact-settings-panel" aria-label="Settings setup">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Settings</p>
              <h2>Music, morbid mode, and AI-made events</h2>
            </div>
            <span>Popup</span>
          </div>
          <p>Open settings to use icon-based music controls, set master volume, toggle morbid surprises, or paste AI-made custom events.</p>
          <button className="secondary" type="button" onClick={onOpenSettings}>⚙️ Open Settings</button>
        </section>

        <section className="starting-stats-panel" aria-label="Starting stats">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Starting balance</p>
              <h2>Set your starting stats</h2>
            </div>
            <span>Sliders</span>
          </div>
          <p>Skip the intake questions and choose the starting point directly. Relationship means spouse / partner connection; family bond means your children.</p>
          <div className="starting-stats-grid">
            {startingStatSliders.map((stat) => {
              const config = statConfig[stat.key];
              const value = startingStats[stat.key];

              return (
                <label key={stat.key} className={`starting-stat-slider stat-${stat.key}`}>
                  <span className="starting-stat-heading">
                    <span>{config.icon} {config.label}</span>
                    <strong>{value}</strong>
                  </span>
                  <input
                    type="range"
                    min="0"
                    max={config.max}
                    value={value}
                    onChange={(event) => setStartingStats((stats) => ({ ...stats, [stat.key]: Number(event.target.value) }))}
                    aria-label={`Starting ${config.label}`}
                  />
                  <small>{stat.description}</small>
                </label>
              );
            })}
          </div>
        </section>

        {legacy.runs > 0 ? (
          <section className="legacy-preview" aria-label="New Game Plus bonuses">
            <div>
              <strong>New Game+</strong>
              <span>{Math.round((legacy.carryRate ?? 0) * 100)}% carryover + skill boosts</span>
            </div>
            <div className="legacy-preview-stats">
              {legacyPreviewStats.map((stat) => (
                <span key={stat.key}>{stat.icon} {formatSummaryDelta(stat.key, stat.delta)}</span>
              ))}
            </div>
          </section>
        ) : null}

        <div className="actions">
          <button type="submit">Start Game</button>
          <button type="button" className="secondary" onClick={onOpenSettings}>⚙️ Settings</button>
          <button type="button" className="secondary" onClick={onResetGame}>Reset</button>
        </div>
      </form>
    </main>
  );
}
