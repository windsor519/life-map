import React from "react";

const startingStatSliders = [
  { key: "wellbeing", description: "Your starting physical health, emotional margin, and day-to-day calm." },
  { key: "marriage", description: "Your starting spouse / partner connection, not general friendships." },
  { key: "children", description: "Your starting bond with your children and parenting home base." },
  { key: "wallet", description: "Your starting financial cushion and resource stability." }
];

// 🎨 Clean, localized inline styles to skip writing external CSS
const styles = {
  sectionGroup: {
    background: "rgba(255, 255, 255, 0.04)",
    padding: "1rem",
    borderRadius: "8px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    marginBottom: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem"
  },
  meta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  title: {
    margin: 0,
    fontSize: "1.1rem",
    fontWeight: "600"
  },
  badge: {
    fontSize: "0.85rem",
    opacity: 0.6,
    fontWeight: "normal"
  },
  rowContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem"
  },
  inlineRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    width: "100%"
  },
  nameInput: {
    flex: "2 1 0%"
  },
  ageInput: {
    width: "75px",
    flexShrink: 0
  },
  selectInput: {
    flex: "1 1 0%",
    minWidth: "90px"
  },
  removeBtn: {
    background: "transparent",
    color: "#ff6b6b",
    border: "none",
    fontSize: "1.1rem",
    cursor: "pointer",
    padding: "4px 8px",
    lineHeight: 1
  },
  addBtn: {
    alignSelf: "flex-start",
    padding: "0.4rem 0.8rem",
    fontSize: "0.85rem",
    marginTop: "0.25rem",
    cursor: "pointer"
  }
};

const DynamicFamilySection = ({ label, groupKey, maxCount, description, members = [], onUpdate, onAdd, onRemove }) => {
  return (
    <div style={styles.sectionGroup}>
      <div style={styles.meta}>
        <h3 style={styles.title}>
          {label} <span style={styles.badge}>({members.length}/{maxCount})</span>
        </h3>
      </div>
      {description && <p style={{ fontSize: "0.85rem", margin: "0 0 0.25rem 0", opacity: 0.7 }}>{description}</p>}
      
      <div style={styles.rowContainer}>
        {members.map((member, index) => (
          <div key={index} style={styles.inlineRow}>
            <input
              type="text"
              placeholder="Name"
              style={styles.nameInput}
              value={member.name || ""}
              onChange={(e) => onUpdate(groupKey, index, "name", e.target.value)}
            />
            <input
              type="number"
              placeholder="Age"
              style={styles.ageInput}
              value={member.age || ""}
              onChange={(e) => onUpdate(groupKey, index, "age", e.target.value)}
            />
            <select
              style={styles.selectInput}
              value={member.sex || "female"}
              onChange={(e) => onUpdate(groupKey, index, "sex", e.target.value)}
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
            <button 
              type="button" 
              style={styles.removeBtn}
              onClick={() => onRemove(groupKey, index)}
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
          className="secondary"
          style={styles.addBtn}
          onClick={() => onAdd(groupKey, maxCount)}
        >
          + Add {label.split(" ")[0].replace(/s$/, '')}
        </button>
      )}
    </div>
  );
};

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

          {/* Wrapper to stack the styled sub-sections */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
            <DynamicFamilySection 
              label="Grandparents" 
              groupKey="grandparents" 
              maxCount={4} 
              members={familyInput.grandparents}
              onUpdate={updateFamilyMember}
              onAdd={addFamilyMember}
              onRemove={removeFamilyMember}
            />
            
            <DynamicFamilySection 
              label="Great-Grandparents" 
              groupKey="greatGrandparents" 
              maxCount={4} 
              description="Optional bonus family ties" 
              members={familyInput.greatGrandparents}
              onUpdate={updateFamilyMember}
              onAdd={addFamilyMember}
              onRemove={removeFamilyMember}
            />
            
            {/* Spouse */}
            <div style={styles.sectionGroup}>
              <div style={styles.meta}>
                <h3 style={styles.title}>
                  Spouse / Partner <span style={{ ...styles.badge, fontStyle: "italic" }}>(Optional)</span>
                </h3>
              </div>
              <div style={styles.inlineRow}>
                <input
                  type="text"
                  placeholder="Partner's Name"
                  style={styles.nameInput}
                  value={familyInput.spouse?.name || ""}
                  onChange={(e) => updateSpouse("name", e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Age"
                  style={styles.ageInput}
                  value={familyInput.spouse?.age || ""}
                  onChange={(e) => updateSpouse("age", e.target.value)}
                />
                <select
                  style={styles.selectInput}
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

            <DynamicFamilySection 
              label="Kids" 
              groupKey="kids" 
              maxCount={6} 
              members={familyInput.kids}
              onUpdate={updateFamilyMember}
              onAdd={addFamilyMember}
              onRemove={removeFamilyMember}
            />
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

        {/* ACTIONS */}
        <div className="actions">
          <button type="submit">Start Game</button>
        </div>
      </form>
    </main>
  );
}