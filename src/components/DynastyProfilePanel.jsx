import { useEffect, useMemo } from "react";

const STYLE_ID = "dynasty-profile-panel-styles";

const css = `
.dynasty-profile-panel {
  position: relative;
  overflow: hidden;
  margin: 1rem 0;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 1.35rem;
  background:
    radial-gradient(circle at 16% 16%, rgba(168, 85, 247, 0.16), transparent 9rem),
    radial-gradient(circle at 84% 18%, rgba(34, 211, 238, 0.14), transparent 9rem),
    linear-gradient(145deg, rgba(15, 23, 42, 0.72), rgba(15, 23, 42, 0.26));
  padding: 1rem;
}

.dynasty-profile-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.85rem;
}

.dynasty-profile-header strong {
  display: block;
  color: #f8fafc;
  font-size: 1rem;
}

.dynasty-profile-header span {
  display: block;
  margin-top: 0.22rem;
  color: rgba(219, 234, 254, 0.72);
  font-size: 0.78rem;
  line-height: 1.38;
}

.dynasty-profile-badge {
  display: inline-flex;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.09);
  padding: 0.45rem 0.62rem;
  color: #fef3c7;
  font-size: 0.74rem;
  font-weight: 800;
  white-space: nowrap;
}

.dynasty-profile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.dynasty-card {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.065);
  padding: 0.82rem;
}

.dynasty-card h3 {
  margin: 0 0 0.55rem;
  color: #fff;
  font-size: 0.92rem;
}

.dynasty-lineage-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.45rem;
}

.dynasty-lineage-node {
  min-height: 4.4rem;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 0.8rem;
  background: rgba(255,255,255,0.06);
  padding: 0.55rem;
}

.dynasty-lineage-node.active {
  border-color: rgba(168, 85, 247, 0.34);
  background: rgba(168, 85, 247, 0.12);
}

.dynasty-lineage-node strong,
.dynasty-inheritance-item strong,
.dynasty-trait-chip strong {
  display: block;
  color: #fff;
  font-size: 0.76rem;
}

.dynasty-lineage-node span,
.dynasty-inheritance-item span,
.dynasty-trait-chip span {
  display: block;
  margin-top: 0.22rem;
  color: rgba(219, 234, 254, 0.72);
  font-size: 0.66rem;
  line-height: 1.32;
}

.dynasty-inheritance-list {
  display: grid;
  gap: 0.45rem;
}

.dynasty-inheritance-item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 0.58rem;
  align-items: center;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 0.82rem;
  background: rgba(255,255,255,0.055);
  padding: 0.55rem;
}

.dynasty-inheritance-icon {
  display: grid;
  width: 2.2rem;
  height: 2.2rem;
  place-items: center;
  border-radius: 0.75rem;
  background: rgba(255,255,255,0.1);
  font-size: 1.2rem;
}

.dynasty-bonus-pill {
  border: 1px solid rgba(250, 204, 21, 0.24);
  border-radius: 999px;
  background: rgba(250, 204, 21, 0.1);
  padding: 0.28rem 0.46rem;
  color: #fef3c7;
  font-size: 0.66rem;
  font-weight: 800;
  white-space: nowrap;
}

.dynasty-trait-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.45rem;
}

.dynasty-trait-chip {
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 0.82rem;
  background: rgba(255,255,255,0.055);
  padding: 0.55rem;
}

.dynasty-meter {
  margin-top: 0.42rem;
  height: 0.34rem;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255,255,255,0.1);
}

.dynasty-meter span {
  display: block;
  height: 100%;
  width: var(--meter, 0%);
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(34,211,238,0.82), rgba(168,85,247,0.82), rgba(250,204,21,0.82));
}

.dynasty-next-run-card {
  grid-column: 1 / -1;
  border: 1px solid rgba(250, 204, 21, 0.18);
  border-radius: 1rem;
  background:
    radial-gradient(circle at 15% 20%, rgba(250, 204, 21, 0.14), transparent 7rem),
    rgba(255, 255, 255, 0.055);
  padding: 0.82rem;
}

.dynasty-next-run-card p {
  margin: 0;
  color: rgba(248, 250, 252, 0.88);
  font-size: 0.88rem;
  line-height: 1.5;
}

.dynasty-next-run-card strong {
  color: #fef3c7;
}

@media (max-width: 1120px) {
  .dynasty-profile-grid {
    grid-template-columns: 1fr;
  }

  .dynasty-lineage-row,
  .dynasty-trait-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
`;

function useStyles() {
  useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }, []);
}

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Number(value) || 0));

const getFamilySize = (family) => {
  if (Array.isArray(family?.members)) return 1 + family.members.length;
  if (Array.isArray(family?.children)) return 1 + family.children.length;
  if (Number.isFinite(Number(family?.childrenCount))) return 1 + Number(family.childrenCount);
  return 1;
};

const getProfile = ({ career, familySize, lifeProjects, memoryHighScore, memoryMoments, pressures }) => {
  const walletComfort = 100 - clamp(pressures.wallet ?? pressures.money ?? 45);
  const relationshipComfort = 100 - clamp(pressures.relationship ?? pressures.family ?? 45);
  const careerScore = clamp((career?.salary ?? 0) / 1200);
  const memoryScore = clamp(memoryHighScore + memoryMoments.length * 5);
  const projectScore = Math.max(0, ...lifeProjects.map((project) => Number(project.progress) || 0));
  const dynastyScore = Math.round((walletComfort + relationshipComfort + careerScore + memoryScore + projectScore) / 5);

  const inheritances = [
    { icon: "💰", title: "Nest Egg", detail: "Money comfort becomes an opening safety net.", bonus: `+${Math.round(walletComfort / 8)} start` },
    { icon: "🎓", title: "Family Knowledge", detail: "Career success improves education opportunities.", bonus: `+${Math.round(careerScore / 10)} skill` },
    { icon: "🤝", title: "Social Roots", detail: "Relationship comfort gives descendants warmer bonds.", bonus: `+${Math.round(relationshipComfort / 9)} bond` },
    { icon: "🧠", title: "Story Memory", detail: "Memories become intuition for future choices.", bonus: `+${Math.round(memoryScore / 10)} wisdom` }
  ];

  const traits = [
    { title: "Security", detail: "Inherited wealth and home stability.", value: walletComfort },
    { title: "Ambition", detail: "Career model passed down.", value: careerScore },
    { title: "Belonging", detail: "Family and relationship strength.", value: relationshipComfort },
    { title: "Wisdom", detail: "Lessons from remembered seasons.", value: memoryScore },
    { title: "Craft", detail: "Long projects and life work.", value: projectScore },
    { title: "Dynasty", detail: "Total readiness for next generation.", value: dynastyScore }
  ];

  return { dynastyScore, inheritances, traits };
};

export default function DynastyProfilePanel({
  career,
  currentAge,
  family,
  lifeProjects = [],
  memoryHighScore = 0,
  memoryMoments = [],
  pressures = {}
}) {
  useStyles();
  const familySize = getFamilySize(family);
  const profile = useMemo(
    () => getProfile({ career, familySize, lifeProjects, memoryHighScore, memoryMoments, pressures }),
    [career, familySize, lifeProjects, memoryHighScore, memoryMoments, pressures]
  );
  const age = Math.floor(Number(currentAge) || 0);
  const generationReady = profile.dynastyScore >= 62;
  const lineage = [
    { title: "Founder", detail: `Age ${age}`, active: true },
    { title: "House", detail: `${familySize} member${familySize === 1 ? "" : "s"}`, active: familySize >= 2 },
    { title: "Heir", detail: generationReady ? "eligible" : "not ready", active: generationReady },
    { title: "Dynasty", detail: `${profile.dynastyScore}/100`, active: profile.dynastyScore >= 75 }
  ];

  return (
    <section className="dynasty-profile-panel" aria-label="Dynasty inheritance profile">
      <div className="dynasty-profile-header">
        <div>
          <strong>Dynasty profile</strong>
          <span>The current life now generates inherited assets, traits, and start bonuses for a future descendant run.</span>
        </div>
        <span className="dynasty-profile-badge">Dynasty {profile.dynastyScore}/100</span>
      </div>

      <div className="dynasty-profile-grid">
        <article className="dynasty-card">
          <h3>Lineage path</h3>
          <div className="dynasty-lineage-row">
            {lineage.map((node) => (
              <div className={`dynasty-lineage-node ${node.active ? "active" : ""}`} key={node.title}>
                <strong>{node.title}</strong>
                <span>{node.detail}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="dynasty-card">
          <h3>Inherited starts</h3>
          <div className="dynasty-inheritance-list">
            {profile.inheritances.map((item) => (
              <div className="dynasty-inheritance-item" key={item.title}>
                <span className="dynasty-inheritance-icon" aria-hidden="true">{item.icon}</span>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                </div>
                <span className="dynasty-bonus-pill">{item.bonus}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="dynasty-card">
          <h3>Inherited traits</h3>
          <div className="dynasty-trait-grid">
            {profile.traits.map((trait) => (
              <div className="dynasty-trait-chip" key={trait.title}>
                <strong>{trait.title}</strong>
                <span>{trait.detail}</span>
                <div className="dynasty-meter" aria-label={`${trait.title} ${Math.round(clamp(trait.value))}`}>
                  <span style={{ "--meter": `${Math.round(clamp(trait.value))}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="dynasty-next-run-card">
          <p><strong>Next generation:</strong> {generationReady ? "A descendant run is ready. Future gameplay can start with inherited bonuses and permanent landmarks." : "Build more comfort, memories, relationships, and life work to unlock a descendant run."}</p>
        </article>
      </div>
    </section>
  );
}
