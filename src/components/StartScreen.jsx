import React from "react";

const startingStatSliders = [
  { key: "wellbeing", description: "Your starting physical health, emotional margin, and day-to-day calm." },
  { key: "marriage", description: "Your starting spouse / partner connection, not general friendships." },
  { key: "children", description: "Your starting bond with your children and parenting home base." },
  { key: "wallet", description: "Your starting financial cushion and resource stability." }
];

export default function StartScreen({
  familyInput = { grandparents: [], greatGrandparents: [], spouse: { name: '', age: '', sex: '' }, kids: [] },
  onOpenSettings,
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
  statConfig
}) {

  // Helper to update specific family lists (kids, grandparents, etc.)
  const updateFamilyMember = (groupKey, index, field, value) => {
    setFamilyInput((prev) => {
      const updatedGroup = [...(prev[groupKey] || [])];
      updatedGroup[index] = { ...updatedGroup[index], [field]: value };
      return { ...prev, [groupKey]: updatedGroup };
    });
  };

  const addFamilyMember = (groupKey, maxCount) => {
    setFamilyInput((prev) => {
      const currentGroup = prev[groupKey] || [];
      if (currentGroup.length >= maxCount) return prev;
      return {
        ...prev,
        [groupKey]: [...currentGroup, { name: "", age: "", sex: "female" }]
      };
    });
  };

  const removeFamilyMember = (groupKey, index) => {
    setFamilyInput((prev) => ({
      ...prev,
      [groupKey]: (prev[groupKey] || []).filter((_, i) => i !== index)
    }));
  };

  const updateSpouse = (field, value) => {
    setFamilyInput((prev) => ({
      ...prev,
      spouse: { ...prev.spouse, [field]: value }
    }));
  };

  // Helper component to render dynamic rows beautifully
  const DynamicFamilySection = ({ label, groupKey, maxCount, description }) => {
    const members = familyInput[groupKey] || [];
    return (
      <div className="family-section-group">
        <div className="section-meta">
          <h3>{label} <span className="count-badge">({members.length}/{maxCount})</span></h3>
          {description && <p className="field-desc">{description}</p>}
        </div>
        
        <div className="member-rows">
          {members.map((member, index) => (
            <div key={index} className="member-row-inline">
              <input
                type="text"
                placeholder="Name"
                value={member.name || ""}
                onChange={(e) => updateFamilyMember(groupKey, index, "name", e.target.value)}
              />
              <input
                type="number"
                placeholder="Age"
                className="age-input"
                value={member.age || ""}
                onChange={(e) => updateFamilyMember(groupKey, index, "age", e.target.value)}
              />
              <select
                value={member.sex || "female"}
                onChange={(e) => updateFamilyMember(groupKey, index, "sex", e.target.value)}
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
              <button 
                type="button" 
                className="remove-row-btn" 
                onClick={() => removeFamilyMember(groupKey, index)}
                aria-label="Remove member"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {members.length < maxCount && (
          <button 
            type="button" 
            className="add-row-btn secondary" 
            onClick={() => addFamilyMember(groupKey, maxCount)}
          >
            + Add {label.split(" ")[0].replace(/s$/, '')}
          </button>
        )}
      </div>
    );
  };

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
        
        {/* PLAYER IDENTITY SECTION */}
        <section className="player-panel" aria-label="Your character setup">
          <p className="eyebrow">The Protagonist</p>
          <h2>About You</h2>
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
              <select value={startSex} onChange={(event) => setStartSex(event.target.value)}>
                <option value="">Select...</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </label>
          </div>
        </section>

        {/* REFACTORED FAMILY INPUTS */}
        <section className="family-panel" aria-label="Family setup">
          <div className="randomizer-heading">
            <div>
              <p className="eyebrow">Family first</p>
              <h2>Enter your family</h2>
              <p>Add names, ages, and sex markers so your family can age dynamically over the seasons.</p>
            </div>
          </div>

          <div className="dynamic-family-container">
            {/* Dynamic Groups */}
            <DynamicFamilySection label="Grandparents" groupKey="grandparents" maxCount={4} />
            <DynamicFamilySection label="Great-Grandparents" groupKey="greatGrandparents" maxCount={4} description="Optional bonus family ties" />
            
            {/* Spouse */}
            <div className="family-section-group spouse-group">
              <h3>Spouse / Partner <span className="optional-tag">(Optional)</span></h3>
              <div className="member-row-inline">
                <input
                  type="text"
                  placeholder="Partner's Name"
                  value={familyInput.spouse?.name || ""}
                  onChange={(e) => updateSpouse("name", e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Age"
                  className="age-input"
                  value={familyInput.spouse?.age || ""}
                  onChange={(e) => updateSpouse("age", e.target.value)}
                />
                <select
                  value={familyInput.spouse?.sex || ""}
                  onChange={(e) => updateSpouse("sex", e.target.value)}
                >
                  <option value="">Sex...</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <DynamicFamilySection label="Kids" groupKey="kids" maxCount={6} />
          </div>
        </section>

        {/* SETTINGS PANEL */}
        <section className="custom-events-panel compact-settings-panel" aria-label="Settings setup">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Settings</p>
              <h2>Music, morbid mode, and AI-made events</h2>
            </div>
          </div>
          <p>Open settings to use icon-based music controls, set master volume, toggle morbid surprises, or paste AI-made custom events.</p>
          <button className="secondary" type="button" onClick={onOpenSettings}>⚙️ Open Settings</button>
        </section>

        {/* STARTING STATS PANEL */}
        <section className="starting-stats-panel" aria-label="Starting stats">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Starting balance</p>
              <h2>Set your starting stats</h2>
            </div>
          </div>
          <p>Skip the intake questions and choose the starting point directly.</p>
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
      </form>
    </main>
  );
}