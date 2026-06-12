import React from "react";

const startingStatSliders = [
  { key: "wellbeing", description: "Your starting physical health, emotional margin, and day-to-day calm." },
  { key: "marriage", description: "Your starting spouse / partner connection, not general friendships." },
  { key: "children", description: "Your starting bond with your children and parenting home base." },
  { key: "wallet", description: "Your starting financial cushion and resource stability." }
];


const familyGroupFields = {
  grandparents: { ageKey: "grandparentsAges", sexKey: "grandparentsSexes" },
  greatGrandparents: { ageKey: "greatGrandparentsAges", sexKey: "greatGrandparentsSexes" },
  kids: { ageKey: "kidsAges", sexKey: "kidsSexes" }
};

const elderGroupKey = "elders";
const elderSplitIndex = 4;

const splitFamilyValues = (value) =>
  String(value ?? "")
    .split(/[\n,]+/)
    .map((item) => item.trim());

const getFamilyMembersForGroup = (familyInput, groupKey) => {
  const fieldConfig = familyGroupFields[groupKey];
  const groupValue = familyInput?.[groupKey];

  if (Array.isArray(groupValue)) {
    return groupValue.map((member) => ({
      name: member?.name ?? "",
      age: member?.age ?? "",
      sex: member?.sex ?? "female"
    }));
  }

  const names = splitFamilyValues(groupValue).filter(Boolean);
  const ages = splitFamilyValues(familyInput?.[fieldConfig.ageKey]);
  const sexes = splitFamilyValues(familyInput?.[fieldConfig.sexKey]);
  const memberCount = Math.max(names.length, ages.filter(Boolean).length, sexes.filter(Boolean).length);

  return Array.from({ length: memberCount }, (_, index) => ({
    name: names[index] ?? "",
    age: ages[index] ?? "",
    sex: sexes[index] || "female"
  }));
};

const getFamilyElders = (familyInput) => [
  ...getFamilyMembersForGroup(familyInput, "grandparents"),
  ...getFamilyMembersForGroup(familyInput, "greatGrandparents")
];

const splitFamilyElders = (members) => ({
  grandparents: members.slice(0, elderSplitIndex),
  greatGrandparents: members.slice(elderSplitIndex)
});

const getSpouseField = (familyInput, field) => {
  if (familyInput?.spouse && typeof familyInput.spouse === "object") {
    return familyInput.spouse[field] ?? "";
  }

  if (field === "name") return familyInput?.spouse ?? "";
  if (field === "age") return familyInput?.spouseAge ?? "";
  if (field === "sex") return familyInput?.spouseSex ?? "";

  return "";
};

const sexOptions = [
  { value: "male", label: "M" },
  { value: "female", label: "F" }
];

const randomInt = (min, max) => {
  const low = Math.min(min, max);
  const high = Math.max(min, max);
  return Math.floor(Math.random() * (high - low + 1)) + low;
};

const randomSex = () => (Math.random() > 0.5 ? "male" : "female");

const createRandomMembers = (count, minAge, maxAge) =>
  Array.from({ length: count }, () => ({
    name: "",
    age: String(randomInt(minAge, maxAge)),
    sex: randomSex()
  }));

const createRandomFamily = (startAge) => {
  const playerAge = Number(startAge) || 38;
  const kidCount = playerAge < 24 ? randomInt(0, 1) : randomInt(1, Math.min(4, Math.max(1, playerAge - 20)));
  const youngestKidMaxAge = Math.max(1, Math.min(18, playerAge - 18));
  const spouseAge = randomInt(Math.max(18, playerAge - 5), Math.min(100, playerAge + 5));

  return {
    grandparents: createRandomMembers(randomInt(2, 4), Math.max(45, playerAge + 18), Math.min(95, playerAge + 42)),
    greatGrandparents: createRandomMembers(randomInt(0, 2), Math.max(65, playerAge + 38), Math.min(105, playerAge + 62)),
    spouse: { name: "", age: String(spouseAge), sex: randomSex() },
    kids: createRandomMembers(kidCount, 1, youngestKidMaxAge)
  };
};

const SexRadioGroup = ({ value, onChange, name, ariaLabel, style }) => (
  <div className="sex-radio-group" role="radiogroup" aria-label={ariaLabel} style={style}>
    {sexOptions.map((option) => (
      <label key={option.value} className="sex-radio-option">
        <input
          type="radio"
          name={name}
          value={option.value}
          checked={value === option.value}
          onChange={(event) => onChange(event.target.value)}
        />
        <span>{option.label}</span>
      </label>
    ))}
  </div>
);

const styles = {
  sectionGroup: {
    background: "linear-gradient(145deg, rgba(15, 23, 42, 0.58), rgba(255, 255, 255, 0.075))",
    padding: "1rem",
    borderRadius: "18px",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.08)",
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
    fontSize: "1.02rem",
    fontWeight: "850"
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
    display: "grid",
    gridTemplateColumns: "76px minmax(94px, max-content) auto",
    alignItems: "center",
    gap: "0.55rem",
    width: "100%"
  },
  ageInput: {
    width: "75px",
    flexShrink: 0
  },
  sexRadioInput: {
    minWidth: "94px"
  },
  removeBtn: {
    background: "rgba(248, 113, 113, 0.12)",
    color: "#fecdd3",
    border: "1px solid rgba(248, 113, 113, 0.28)",
    boxShadow: "none",
    fontSize: "1rem",
    cursor: "pointer",
    padding: "0.45rem 0.65rem",
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

const DynamicFamilySection = ({ label, addLabel, groupKey, maxCount, description, members = [], onUpdate, onAdd, onRemove }) => {
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
              type="number"
              placeholder="Age"
              style={styles.ageInput}
              value={member.age || ""}
              onChange={(e) => onUpdate(groupKey, index, "age", e.target.value)}
            />
            <SexRadioGroup
              name={`${groupKey}-${index}-marker`}
              ariaLabel={`${label} member ${index + 1} marker`}
              style={styles.sexRadioInput}
              value={member.sex || "female"}
              onChange={(value) => onUpdate(groupKey, index, "sex", value)}
            />
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
          + Add {addLabel ?? label.split(" ")[0].replace(/s$/, '')}
        </button>
      )}
    </div>
  );
};

export default function StartScreen({
  familyInput = { grandparents: [], greatGrandparents: [], spouse: { name: '', age: '', sex: '' }, kids: [] },
  onStartGame,
  setFamilyInput,
  setStartingStats,
  setStartAge,
  setStartSex,
  startAge,
  startSex,
  startingStats,
  statConfig
}) {

  const familyMembers = {
    elders: getFamilyElders(familyInput),
    kids: getFamilyMembersForGroup(familyInput, "kids")
  };

  const updateFamilyMember = (groupKey, index, field, value) => {
    setFamilyInput((prev) => {
      const updatedGroup = groupKey === elderGroupKey ? getFamilyElders(prev) : getFamilyMembersForGroup(prev, groupKey);
      updatedGroup[index] = { ...updatedGroup[index], [field]: value };

      if (groupKey === elderGroupKey) {
        return { ...prev, ...splitFamilyElders(updatedGroup) };
      }

      return { ...prev, [groupKey]: updatedGroup };
    });
  };

  const addFamilyMember = (groupKey, maxCount) => {
    setFamilyInput((prev) => {
      const currentGroup = groupKey === elderGroupKey ? getFamilyElders(prev) : getFamilyMembersForGroup(prev, groupKey);
      if (currentGroup.length >= maxCount) return prev;

      const updatedGroup = [...currentGroup, { name: "", age: "", sex: "female" }];

      if (groupKey === elderGroupKey) {
        return { ...prev, ...splitFamilyElders(updatedGroup) };
      }

      return { ...prev, [groupKey]: updatedGroup };
    });
  };

  const removeFamilyMember = (groupKey, index) => {
    setFamilyInput((prev) => {
      const currentGroup = groupKey === elderGroupKey ? getFamilyElders(prev) : getFamilyMembersForGroup(prev, groupKey);
      const updatedGroup = currentGroup.filter((_, i) => i !== index);

      if (groupKey === elderGroupKey) {
        return { ...prev, ...splitFamilyElders(updatedGroup) };
      }

      return { ...prev, [groupKey]: updatedGroup };
    });
  };

  const updateSpouse = (field, value) => {
    setFamilyInput((prev) => ({
      ...prev,
      spouse: {
        name: getSpouseField(prev, "name"),
        age: getSpouseField(prev, "age"),
        sex: getSpouseField(prev, "sex"),
        [field]: value
      }
    }));
  };

  const randomizeFamily = () => {
    setFamilyInput(createRandomFamily(startAge));
  };

  return (
    <main className="app-shell setup-shell">
      <section className="hero-card startup-hero">
        <div>
          <p className="eyebrow">Life simulator</p>
          <h1>Map a life that keeps moving.</h1>
          <p className="subtitle">Pick a starting point, add your household, and follow each season.</p>
          <div className="startup-highlights" aria-label="Game highlights">
            <span>🌦️ Seasonal choices</span>
            <span>👥 Aging family</span>
            <span>🎲 Surprise events</span>
          </div>
        </div>
        <div className="life-board" aria-hidden="true">
          <span className="board-node node-heart">💞</span>
          <span className="board-node node-health">💪</span>
          <span className="board-node node-family">🌱</span>
          <span className="board-route" />
        </div>
      </section>

      <form className="panel setup-form startup-form" onSubmit={onStartGame}>
        
        {/* PLAYER IDENTITY SECTION */}
        <section className="startup-section player-panel" aria-label="Your character setup">
          <p className="eyebrow">The Protagonist</p>
          <h2>About You</h2>
          <div className="form-grid">
            <div className="setup-question">
              <span>Your age</span>
              <div className="age-sex-control">
                <input type="number" value={startAge} onChange={(event) => setStartAge(event.target.value)} min={12} max={100} aria-label="Your age" />
                <SexRadioGroup
                  name="start-sex"
                  ariaLabel="Your M/F marker"
                  value={startSex}
                  onChange={setStartSex}
                />
              </div>
            </div>
          </div>
        </section>

        {/* REFACTORED FAMILY INPUTS */}
        <section className="startup-section family-panel" aria-label="Family setup">
          <div className="randomizer-heading">
            <div>
              <p className="eyebrow">Family first</p>
              <h2>Add family ages</h2>
              <p>Use ages and optional M/F markers.</p>
            </div>
            <button type="button" className="secondary randomize-family-button" onClick={randomizeFamily}>
              🎲 Randomize family
            </button>
          </div>

          {/* Wrapper to stack the styled sub-sections */}
          <div className="startup-family-stack">
            <DynamicFamilySection 
              label="Family elders" 
              addLabel="elder"
              groupKey={elderGroupKey}
              maxCount={8} 
              members={familyMembers.elders}
              onUpdate={updateFamilyMember}
              onAdd={addFamilyMember}
              onRemove={removeFamilyMember}
            />
            
            {/* Spouse */}
            <div style={styles.sectionGroup}>
              <div style={styles.meta}>
                <h3 style={styles.title}>
                  Spouse
                </h3>
              </div>
              <div style={styles.inlineRow}>
                <input
                  type="number"
                  placeholder="Age"
                  style={styles.ageInput}
                  value={getSpouseField(familyInput, "age")}
                  onChange={(e) => updateSpouse("age", e.target.value)}
                />
                <SexRadioGroup
                  name="spouse-sex"
                  ariaLabel="Spouse or partner M/F marker"
                  style={styles.sexRadioInput}
                  value={getSpouseField(familyInput, "sex")}
                  onChange={(value) => updateSpouse("sex", value)}
                />
              </div>
            </div>

            <DynamicFamilySection 
              label="Kids" 
              addLabel="kid"
              groupKey="kids" 
              maxCount={6} 
              members={familyMembers.kids}
              onUpdate={updateFamilyMember}
              onAdd={addFamilyMember}
              onRemove={removeFamilyMember}
            />
          </div>
        </section>

        {/* STARTING STATS PANEL */}
        <section className="startup-section starting-stats-panel" aria-label="Starting stats">
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