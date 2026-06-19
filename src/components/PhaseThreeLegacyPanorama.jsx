import { useEffect, useMemo } from "react";

const STYLE_ID = "phase-three-legacy-panorama-styles";

const phaseThreeCss = `
.legacy-panorama-card {
  position: relative;
  overflow: hidden;
  margin: 1rem 0;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 1.45rem;
  background:
    radial-gradient(circle at 14% 18%, rgba(251, 191, 36, 0.18), transparent 9rem),
    radial-gradient(circle at 86% 22%, rgba(96, 165, 250, 0.18), transparent 10rem),
    linear-gradient(145deg, rgba(15, 23, 42, 0.74), rgba(15, 23, 42, 0.28));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14), 0 1rem 2.5rem rgba(2, 6, 23, 0.26);
  padding: 1rem;
}

.legacy-panorama-header {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.85rem;
}

.legacy-panorama-header strong {
  display: block;
  color: #f8fafc;
  font-size: 1rem;
}

.legacy-panorama-header span {
  display: block;
  margin-top: 0.24rem;
  color: rgba(219, 234, 254, 0.72);
  font-size: 0.78rem;
  line-height: 1.35;
}

.legacy-panorama-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.45rem 0.62rem;
  color: #fef3c7;
  font-size: 0.74rem;
  font-weight: 800;
  white-space: nowrap;
}

.legacy-panorama-stage {
  position: relative;
  min-height: 16rem;
  overflow: hidden;
  border-radius: 1.1rem;
  background:
    radial-gradient(circle at 52% 16%, rgba(255, 255, 255, 0.2), transparent 5.5rem),
    linear-gradient(180deg, rgba(30, 64, 175, 0.24), rgba(14, 165, 233, 0.12) 40%, rgba(22, 101, 52, 0.16) 41%, rgba(15, 23, 42, 0.5));
}

.legacy-panorama-mountains {
  position: absolute;
  inset: 19% 0 auto;
  height: 5.5rem;
  opacity: 0.52;
  background:
    linear-gradient(135deg, transparent 0 30%, rgba(148, 163, 184, 0.42) 31% 54%, transparent 55%) 8% 0 / 18rem 5.5rem no-repeat,
    linear-gradient(135deg, transparent 0 34%, rgba(203, 213, 225, 0.34) 35% 58%, transparent 59%) 62% 0 / 20rem 5.5rem no-repeat;
}

.legacy-panorama-river {
  position: absolute;
  right: -8%;
  bottom: -18%;
  left: 34%;
  height: 9rem;
  border-radius: 999px 0 0 0;
  background: linear-gradient(115deg, rgba(125, 211, 252, 0.42), rgba(37, 99, 235, 0.24));
  filter: blur(0.2px);
  transform: rotate(-9deg);
}

.legacy-home-estate {
  position: absolute;
  bottom: 24%;
  left: 9%;
  width: calc(5.2rem + var(--legacy-home, 0.5) * 4.5rem);
  height: calc(3.4rem + var(--legacy-home, 0.5) * 1.8rem);
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 0.5rem 0.5rem 0.16rem 0.16rem;
  background:
    linear-gradient(90deg, transparent 0 19%, rgba(255,255,255,0.28) 20% 31%, transparent 32% 68%, rgba(255,255,255,0.28) 69% 80%, transparent 81%),
    linear-gradient(180deg, rgba(251, 191, 36, 0.84), rgba(180, 83, 9, 0.8));
  box-shadow: 0 1.1rem 2.4rem rgba(2, 6, 23, 0.34), 0 0 2.8rem rgba(251, 191, 36, var(--legacy-glow, 0.16));
}

.legacy-home-estate::before {
  position: absolute;
  right: -0.65rem;
  bottom: 91%;
  left: -0.65rem;
  height: 2.2rem;
  border-radius: 0.45rem 0.45rem 0.1rem 0.1rem;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.96), rgba(124, 45, 18, 0.98));
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
  content: "";
}

.legacy-home-estate::after {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 1.2rem;
  height: 1.8rem;
  border-radius: 0.65rem 0.65rem 0.05rem 0.05rem;
  background: rgba(15, 23, 42, 0.78);
  content: "";
  transform: translateX(-50%);
}

.legacy-family-circle {
  position: absolute;
  bottom: 23%;
  left: calc(13rem + var(--legacy-home, 0.5) * 2.5rem);
  display: flex;
  align-items: end;
  gap: 0.2rem;
}

.legacy-family-member {
  width: 0.86rem;
  height: calc(0.86rem + var(--member-grow, 0) * 0.38rem);
  border: 1px solid rgba(255, 255, 255, 0.58);
  border-radius: 999px 999px 0.45rem 0.45rem;
  background: hsl(var(--member-hue, 190), 82%, 68%);
  box-shadow: 0 0 1rem rgba(255, 255, 255, 0.16);
}

.legacy-landmark-row {
  position: absolute;
  right: 6%;
  bottom: 31%;
  display: flex;
  align-items: end;
  gap: 0.52rem;
}

.legacy-landmark {
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 0.85rem;
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 0.7rem 1.6rem rgba(2, 6, 23, 0.24);
  font-size: 1.2rem;
}

.legacy-tree-grove {
  position: absolute;
  right: 28%;
  bottom: 30%;
  display: flex;
  align-items: end;
  gap: 0.28rem;
}

.legacy-tree {
  position: relative;
  width: calc(1rem + var(--tree-grow, 0.4) * 1.4rem);
  height: calc(2.1rem + var(--tree-grow, 0.4) * 2.2rem);
}

.legacy-tree::before {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0.26rem;
  height: 48%;
  border-radius: 999px;
  background: #92400e;
  content: "";
  transform: translateX(-50%);
}

.legacy-tree::after {
  position: absolute;
  top: 0;
  left: 50%;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 45% 55% 52% 48%;
  background: radial-gradient(circle at 36% 28%, rgba(255, 255, 255, 0.22), transparent 28%), hsl(var(--legacy-tree-hue, 142), 62%, 42%);
  box-shadow: 0 0.35rem 0 hsl(var(--legacy-tree-hue, 142), 58%, 34%);
  content: "";
  transform: translateX(-50%);
}

.legacy-road {
  position: absolute;
  right: -4%;
  bottom: -10%;
  left: -6%;
  height: 5.4rem;
  border-radius: 60% 100% 0 0;
  background: linear-gradient(90deg, rgba(51, 65, 85, 0.92), rgba(15, 23, 42, 0.86));
}

.legacy-road::after {
  position: absolute;
  inset: 44% 8% auto 8%;
  height: 0.18rem;
  border-radius: 999px;
  background: repeating-linear-gradient(90deg, rgba(254, 240, 138, 0.88) 0 1.4rem, transparent 1.4rem 2.35rem);
  content: "";
}

.legacy-score-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.6rem;
  margin-top: 0.75rem;
}

.legacy-score-card {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 0.82rem;
  background: rgba(255, 255, 255, 0.07);
  padding: 0.62rem;
}

.legacy-score-card span,
.legacy-score-card small {
  display: block;
  color: rgba(219, 234, 254, 0.72);
  font-size: 0.68rem;
}

.legacy-score-card strong {
  display: block;
  margin-top: 0.18rem;
  color: #fff;
  font-size: 0.95rem;
}

.legacy-share-card {
  position: relative;
  margin-top: 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1rem;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.04));
  padding: 0.85rem;
}

.legacy-share-card p {
  margin: 0;
  color: rgba(248, 250, 252, 0.88);
  font-size: 0.9rem;
  line-height: 1.5;
}

.legacy-share-card strong {
  color: #fef3c7;
}

@media (max-width: 1120px) {
  .legacy-score-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .legacy-landmark-row {
    right: 4%;
    gap: 0.35rem;
  }
}
`;

function usePhaseThreeStyles() {
  useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = phaseThreeCss;
    document.head.appendChild(style);
  }, []);
}

const clampPercent = (value) => Math.max(0, Math.min(100, Number(value) || 0));

const getFamilySize = (family) => {
  if (Array.isArray(family?.members)) return 1 + family.members.length;
  if (Array.isArray(family?.children)) return 1 + family.children.length;
  if (Number.isFinite(Number(family?.childrenCount))) return 1 + Number(family.childrenCount);
  return 1;
};

const getLegacyStage = (age) => {
  const safeAge = Number(age) || 0;
  if (safeAge < 30) return "Origin story";
  if (safeAge < 50) return "Building years";
  if (safeAge < 70) return "Legacy in motion";
  return "Life panorama";
};

const getLandmarks = ({ career, memoryHighScore, familySize, lifeProjects }) => {
  const landmarks = [];
  if (career?.title) landmarks.push({ icon: "🏢", label: "Career" });
  if (familySize >= 3) landmarks.push({ icon: "👨‍👩‍👧", label: "Family" });
  if (memoryHighScore >= 12) landmarks.push({ icon: "⭐", label: "Memories" });
  if (Array.isArray(lifeProjects) && lifeProjects.some((project) => Number(project.progress) >= 60)) landmarks.push({ icon: "🏆", label: "Project" });
  return landmarks.slice(0, 4);
};

export default function PhaseThreeLegacyPanorama({
  activeSeason,
  career,
  currentAge,
  family,
  lifeProjects = [],
  memoryHighScore = 0,
  memoryMoments = [],
  pressures = {}
}) {
  usePhaseThreeStyles();

  const familySize = getFamilySize(family);
  const age = Number(currentAge) || 0;
  const walletPressure = clampPercent(pressures.wallet ?? pressures.money ?? 45);
  const relationshipPressure = clampPercent(pressures.relationship ?? pressures.family ?? 45);
  const careerStrength = clampPercent((career?.salary ?? 42000) / 1400);
  const memoryStrength = Math.max(0, Math.min(100, memoryHighScore + memoryMoments.length * 4));
  const homeStrength = Math.max(0.16, Math.min(1, (100 - walletPressure + familySize * 8 + age * 0.35) / 150));
  const treeGrow = Math.max(0.18, Math.min(1, (memoryStrength + familySize * 7) / 100));
  const legacyScore = Math.round((careerStrength + memoryStrength + Math.max(0, 100 - walletPressure) + Math.max(0, 100 - relationshipPressure)) / 4);
  const stage = getLegacyStage(age);
  const landmarks = useMemo(() => getLandmarks({ career, memoryHighScore, familySize, lifeProjects }), [career, familySize, lifeProjects, memoryHighScore]);
  const shareLine = `${stage}: age ${Math.floor(age)}, ${familySize} in the household, ${memoryMoments.length} memories, legacy score ${legacyScore}.`;

  return (
    <article className="legacy-panorama-card" aria-label="Legacy panorama">
      <div className="legacy-panorama-header">
        <div>
          <strong>Legacy panorama</strong>
          <span>A shareable end-to-end scene that turns your stats, memories, career, and family into one evolving picture.</span>
        </div>
        <span className="legacy-panorama-badge">{stage}</span>
      </div>

      <div
        className="legacy-panorama-stage"
        style={{
          "--legacy-home": homeStrength.toFixed(2),
          "--legacy-glow": Math.max(0.1, (100 - walletPressure) / 250).toFixed(2),
          "--tree-grow": treeGrow.toFixed(2),
          "--legacy-tree-hue": activeSeason?.id === "fall" ? 38 : activeSeason?.id === "winter" ? 204 : 142
        }}
      >
        <span className="legacy-panorama-mountains" aria-hidden="true" />
        <span className="legacy-panorama-river" aria-hidden="true" />
        <span className="legacy-tree-grove" aria-hidden="true">
          {Array.from({ length: Math.min(6, Math.max(2, memoryMoments.length || 2)) }, (_, index) => (
            <span className="legacy-tree" key={index} style={{ "--tree-grow": Math.max(0.2, treeGrow - index * 0.05).toFixed(2) }} />
          ))}
        </span>
        <span className="legacy-home-estate" aria-hidden="true" />
        <span className="legacy-family-circle" aria-label={`${familySize} household members in the panorama`}>
          {Array.from({ length: Math.min(familySize, 8) }, (_, index) => (
            <span
              className="legacy-family-member"
              key={index}
              style={{ "--member-hue": 180 + index * 24, "--member-grow": index === 0 ? 1 : 0.2 + (index % 3) * 0.24 }}
            />
          ))}
        </span>
        <span className="legacy-landmark-row" aria-label={`${landmarks.length} legacy landmarks`}>
          {landmarks.map((landmark) => (
            <span className="legacy-landmark" key={landmark.label} title={landmark.label}>{landmark.icon}</span>
          ))}
        </span>
        <span className="legacy-road" aria-hidden="true" />
      </div>

      <div className="legacy-score-grid">
        <div className="legacy-score-card"><span>Legacy</span><strong>{legacyScore}</strong><small>share score</small></div>
        <div className="legacy-score-card"><span>Household</span><strong>{familySize}</strong><small>people shown</small></div>
        <div className="legacy-score-card"><span>Memories</span><strong>{memoryMoments.length}</strong><small>trees planted</small></div>
        <div className="legacy-score-card"><span>Career</span><strong>{Math.round(careerStrength)}</strong><small>{career?.title ?? "unassigned"}</small></div>
      </div>

      <div className="legacy-share-card">
        <p><strong>Share card:</strong> {shareLine}</p>
      </div>
    </article>
  );
}
