import { useEffect, useMemo } from "react";

const STYLE_ID = "dynasty-endgame-panel-styles";

const css = `
.dynasty-endgame-panel {
  position: relative;
  overflow: hidden;
  margin: 1rem 0;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 1.35rem;
  background:
    radial-gradient(circle at 14% 18%, rgba(250, 204, 21, 0.18), transparent 9rem),
    radial-gradient(circle at 86% 24%, rgba(168, 85, 247, 0.16), transparent 10rem),
    linear-gradient(145deg, rgba(15, 23, 42, 0.72), rgba(15, 23, 42, 0.26));
  padding: 1rem;
}

.dynasty-endgame-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.85rem;
}

.dynasty-endgame-header strong {
  display: block;
  color: #f8fafc;
  font-size: 1rem;
}

.dynasty-endgame-header span {
  display: block;
  margin-top: 0.22rem;
  color: rgba(219, 234, 254, 0.72);
  font-size: 0.78rem;
  line-height: 1.38;
}

.dynasty-endgame-badge {
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

.dynasty-endgame-grid {
  display: grid;
  grid-template-columns: 0.95fr 1.05fr;
  gap: 0.75rem;
}

.dynasty-endgame-card {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.065);
  padding: 0.82rem;
}

.dynasty-endgame-card h3 {
  margin: 0 0 0.6rem;
  color: #fff;
  font-size: 0.92rem;
}

.dynasty-legacy-score {
  display: grid;
  min-height: 10rem;
  place-items: center;
  border-radius: 1rem;
  background:
    radial-gradient(circle at 50% 36%, rgba(250, 204, 21, 0.22), transparent 5.5rem),
    rgba(255, 255, 255, 0.055);
  text-align: center;
}

.dynasty-legacy-score strong {
  display: block;
  color: #fef3c7;
  font-size: clamp(2.6rem, 7vw, 4.6rem);
  line-height: 1;
}

.dynasty-legacy-score span {
  display: block;
  margin-top: 0.4rem;
  color: rgba(219, 234, 254, 0.78);
  font-size: 0.82rem;
}

.dynasty-score-breakdown {
  display: grid;
  gap: 0.45rem;
  margin-top: 0.7rem;
}

.dynasty-score-row {
  display: grid;
  grid-template-columns: 6.5rem minmax(0, 1fr) 2.2rem;
  gap: 0.55rem;
  align-items: center;
  color: rgba(219, 234, 254, 0.78);
  font-size: 0.72rem;
}

.dynasty-score-meter {
  height: 0.34rem;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255,255,255,0.1);
}

.dynasty-score-meter span {
  display: block;
  width: var(--meter, 0%);
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(34,211,238,0.82), rgba(168,85,247,0.82), rgba(250,204,21,0.82));
}

.dynasty-succession-steps {
  display: grid;
  gap: 0.52rem;
}

.dynasty-succession-step {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 0.58rem;
  align-items: center;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 0.86rem;
  background: rgba(255,255,255,0.055);
  padding: 0.58rem;
}

.dynasty-succession-step.ready {
  border-color: rgba(250, 204, 21, 0.26);
  background: rgba(250, 204, 21, 0.08);
}

.dynasty-step-icon {
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  border-radius: 0.78rem;
  background: rgba(255,255,255,0.1);
  font-size: 1.18rem;
}

.dynasty-succession-step strong {
  display: block;
  color: #fff;
  font-size: 0.78rem;
}

.dynasty-succession-step span {
  display: block;
  margin-top: 0.22rem;
  color: rgba(219, 234, 254, 0.72);
  font-size: 0.66rem;
  line-height: 1.32;
}

.dynasty-status-pill {
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 999px;
  background: rgba(255,255,255,0.07);
  padding: 0.28rem 0.46rem;
  color: rgba(219, 234, 254, 0.75);
  font-size: 0.64rem;
  font-weight: 800;
  white-space: nowrap;
}

.dynasty-succession-step.ready .dynasty-status-pill {
  border-color: rgba(250, 204, 21, 0.26);
  background: rgba(250, 204, 21, 0.1);
  color: #fef3c7;
}

.dynasty-heir-card {
  grid-column: 1 / -1;
  border: 1px solid rgba(250, 204, 21, 0.18);
  border-radius: 1rem;
  background:
    radial-gradient(circle at 16% 20%, rgba(250, 204, 21, 0.16), transparent 7rem),
    rgba(255, 255, 255, 0.055);
  padding: 0.82rem;
}

.dynasty-heir-card p {
  margin: 0;
  color: rgba(248, 250, 252, 0.88);
  font-size: 0.88rem;
  line-height: 1.5;
}

.dynasty-heir-card strong {
  color: #fef3c7;
}

@media (max-width: 1120px) {
  .dynasty-endgame-grid {
    grid-template-columns: 1fr;
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

const calculateEndgame = ({ career, currentAge, family, lifeProjects, memoryHighScore, memoryMoments, pressures }) => {
  const familySize = getFamilySize(family);
  const age = Number(currentAge) || 0;
  const walletComfort = 100 - clamp(pressures.wallet ?? pressures.money ?? 45);
  const relationshipComfort = 100 - clamp(pressures.relationship ?? pressures.family ?? 45);
  const careerScore = clamp((career?.salary ?? 0) / 1200);
  const memoryScore = clamp(memoryHighScore + memoryMoments.length * 5);
  const projectScore = Math.max(0, ...lifeProjects.map((project) => Number(project.progress) || 0));
  const familyScore = clamp(familySize * 22);
  const ageReadiness = clamp((age - 45) * 2.6);
  const legacyScore = Math.round((walletComfort + relationshipComfort + careerScore + memoryScore + projectScore + familyScore) / 6);

  return {
    age,
    familySize,
    legacyScore,
    heirReady: legacyScore >= 62 && familySize >= 2,
    retirementReady: age >= 60 || legacyScore >= 72,
    rows: [
      { label: "Wealth", value: walletComfort },
      { label: "Family", value: familyScore },
      { label: "Career", value: careerScore },
      { label: "Memory", value: memoryScore },
      { label: "Projects", value: projectScore },
      { label: "Age", value: ageReadiness }
    ]
  };
};

export default function DynastyEndgamePanel({
  career,
  currentAge,
  family,
  lifeProjects = [],
  memoryHighScore = 0,
  memoryMoments = [],
  pressures = {}
}) {
  useStyles();
  const endgame = useMemo(
    () => calculateEndgame({ career, currentAge, family, lifeProjects, memoryHighScore, memoryMoments, pressures }),
    [career, currentAge, family, lifeProjects, memoryHighScore, memoryMoments, pressures]
  );

  const steps = [
    { icon: "🌅", title: "Retire", detail: "Reach late life or strong legacy readiness.", ready: endgame.retirementReady },
    { icon: "📜", title: "Summarize Life", detail: "Convert choices into final legacy score.", ready: endgame.legacyScore >= 45 },
    { icon: "🧬", title: "Choose Heir", detail: "Prepare a descendant from the household.", ready: endgame.heirReady },
    { icon: "🚪", title: "Start Next Life", detail: "Begin with inherited bonuses and landmarks.", ready: endgame.heirReady && endgame.retirementReady }
  ];

  return (
    <section className="dynasty-endgame-panel" aria-label="Dynasty endgame and succession">
      <div className="dynasty-endgame-header">
        <div>
          <strong>Dynasty endgame</strong>
          <span>Turns the current life into a retirement summary, heir readiness check, and next-generation launch plan.</span>
        </div>
        <span className="dynasty-endgame-badge">Age {Math.floor(endgame.age)}</span>
      </div>

      <div className="dynasty-endgame-grid">
        <article className="dynasty-endgame-card">
          <h3>Final legacy score</h3>
          <div className="dynasty-legacy-score">
            <div>
              <strong>{endgame.legacyScore}</strong>
              <span>{endgame.heirReady ? "Heir-ready legacy" : "Keep building the house"}</span>
            </div>
          </div>
          <div className="dynasty-score-breakdown">
            {endgame.rows.map((row) => (
              <div className="dynasty-score-row" key={row.label}>
                <span>{row.label}</span>
                <div className="dynasty-score-meter"><span style={{ "--meter": `${Math.round(clamp(row.value))}%` }} /></div>
                <span>{Math.round(clamp(row.value))}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="dynasty-endgame-card">
          <h3>Succession flow</h3>
          <div className="dynasty-succession-steps">
            {steps.map((step) => (
              <div className={`dynasty-succession-step ${step.ready ? "ready" : ""}`} key={step.title}>
                <span className="dynasty-step-icon" aria-hidden="true">{step.icon}</span>
                <div>
                  <strong>{step.title}</strong>
                  <span>{step.detail}</span>
                </div>
                <span className="dynasty-status-pill">{step.ready ? "Ready" : "Locked"}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="dynasty-heir-card">
          <p><strong>Succession result:</strong> {endgame.heirReady && endgame.retirementReady ? "The family is ready for a descendant run. The next implementation can convert this panel into a real Start Heir button and carry bonuses into a new life." : "Build more family, memories, assets, or career strength before the dynasty can continue."}</p>
        </article>
      </div>
    </section>
  );
}
