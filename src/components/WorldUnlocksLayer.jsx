import { useEffect, useMemo } from "react";

const STYLE_ID = "world-unlocks-layer-styles";

const css = `
.world-unlocks-layer {
  position: relative;
  overflow: hidden;
  margin: 1rem 0;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 1.35rem;
  background:
    radial-gradient(circle at 18% 18%, rgba(34, 211, 238, 0.14), transparent 9rem),
    radial-gradient(circle at 82% 12%, rgba(250, 204, 21, 0.14), transparent 8rem),
    linear-gradient(145deg, rgba(15, 23, 42, 0.72), rgba(15, 23, 42, 0.24));
  padding: 1rem;
}

.world-unlocks-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.85rem;
}

.world-unlocks-header strong {
  display: block;
  color: #f8fafc;
  font-size: 1rem;
}

.world-unlocks-header span {
  display: block;
  margin-top: 0.22rem;
  color: rgba(219, 234, 254, 0.72);
  font-size: 0.78rem;
  line-height: 1.38;
}

.world-unlocks-badge {
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

.world-map-stage {
  position: relative;
  min-height: 14.5rem;
  overflow: hidden;
  border-radius: 1.05rem;
  background:
    linear-gradient(180deg, rgba(96, 165, 250, 0.18), rgba(14, 165, 233, 0.08) 42%, rgba(22, 101, 52, 0.22) 43%, rgba(15, 23, 42, 0.48)),
    repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 3rem);
}

.world-map-road {
  position: absolute;
  right: -4%;
  bottom: -12%;
  left: -6%;
  height: 5.8rem;
  border-radius: 65% 100% 0 0;
  background: linear-gradient(90deg, rgba(51, 65, 85, 0.88), rgba(15, 23, 42, 0.84));
}

.world-map-road::after {
  position: absolute;
  inset: 44% 8% auto 8%;
  height: 0.18rem;
  border-radius: 999px;
  background: repeating-linear-gradient(90deg, rgba(254, 240, 138, 0.88) 0 1.35rem, transparent 1.35rem 2.35rem);
  content: "";
}

.world-object {
  position: absolute;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0.9rem 2rem rgba(2, 6, 23, 0.28), 0 0 1.8rem var(--object-glow, rgba(255,255,255,0.12));
  animation: worldObjectAppear 700ms cubic-bezier(.2,.9,.2,1) both;
}

.world-object.locked {
  opacity: 0.18;
  filter: grayscale(0.8);
  animation: none;
}

.world-object span {
  position: relative;
  z-index: 2;
  font-size: var(--object-font, 1.65rem);
}

.world-object.first-home {
  left: 9%;
  bottom: 27%;
  width: 5rem;
  height: 3.4rem;
  border-radius: 0.5rem 0.5rem 0.16rem 0.16rem;
  background: linear-gradient(180deg, rgba(251, 191, 36, 0.82), rgba(180, 83, 9, 0.78));
  --object-glow: rgba(251, 191, 36, 0.28);
}

.world-object.first-home::before {
  position: absolute;
  right: -0.55rem;
  bottom: 88%;
  left: -0.55rem;
  height: 1.8rem;
  border-radius: 0.35rem;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.96), rgba(124, 45, 18, 0.98));
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
  content: "";
}

.world-object.career-tower {
  right: 12%;
  bottom: 41%;
  width: 3.2rem;
  height: 6rem;
  border-radius: 0.35rem 0.35rem 0.08rem 0.08rem;
  background:
    repeating-linear-gradient(180deg, rgba(255,255,255,0.25) 0 0.28rem, transparent 0.28rem 0.7rem),
    linear-gradient(180deg, rgba(96, 165, 250, 0.76), rgba(30, 41, 59, 0.82));
  --object-glow: rgba(96, 165, 250, 0.32);
}

.world-object.family-table {
  left: 31%;
  bottom: 26%;
  width: 4.5rem;
  height: 2.5rem;
  border-radius: 1.2rem;
  background: linear-gradient(145deg, rgba(251, 113, 133, 0.7), rgba(251, 191, 36, 0.58));
  --object-glow: rgba(251, 113, 133, 0.28);
}

.world-object.memory-grove {
  right: 30%;
  bottom: 32%;
  width: 4.2rem;
  height: 4.5rem;
  border: 0;
  background: transparent;
  box-shadow: none;
}

.world-object.memory-grove::before,
.world-object.memory-grove::after {
  position: absolute;
  bottom: 0.2rem;
  width: 2.1rem;
  height: 3.1rem;
  border-radius: 999px 999px 0.5rem 0.5rem;
  background: radial-gradient(circle at 35% 25%, rgba(255,255,255,0.22), transparent 32%), #16a34a;
  content: "";
}

.world-object.memory-grove::before { left: 0; }
.world-object.memory-grove::after { right: 0; transform: scale(0.86); background-color: #15803d; }

.world-object.life-work {
  right: 23%;
  bottom: 24%;
  width: 3.2rem;
  height: 3.2rem;
  border-radius: 1rem;
  background: linear-gradient(145deg, rgba(250, 204, 21, 0.82), rgba(249, 115, 22, 0.7));
  --object-glow: rgba(250, 204, 21, 0.34);
}

.world-object.legacy-bridge {
  left: 47%;
  bottom: 18%;
  width: 7rem;
  height: 2rem;
  border-radius: 999px 999px 0.2rem 0.2rem;
  background: repeating-linear-gradient(90deg, rgba(255,255,255,0.24) 0 0.22rem, transparent 0.22rem 0.7rem), rgba(125, 211, 252, 0.28);
  --object-glow: rgba(125, 211, 252, 0.3);
}

.world-object.retirement-garden {
  left: 17%;
  bottom: 45%;
  width: 4rem;
  height: 3.2rem;
  border-radius: 1.6rem 1.6rem 0.7rem 0.7rem;
  background: radial-gradient(circle at 35% 22%, rgba(255,255,255,0.32), transparent 34%), rgba(34, 197, 94, 0.48);
  --object-glow: rgba(34, 197, 94, 0.28);
}

.world-object.ancestry-stone {
  right: 6%;
  bottom: 26%;
  width: 3rem;
  height: 3.8rem;
  border-radius: 1.2rem 1.2rem 0.35rem 0.35rem;
  background: linear-gradient(145deg, rgba(203, 213, 225, 0.72), rgba(71, 85, 105, 0.78));
  --object-glow: rgba(203, 213, 225, 0.26);
}

.world-object-labels {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 0.7rem;
}

.world-object-label {
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 999px;
  background: rgba(255,255,255,0.07);
  padding: 0.35rem 0.56rem;
  color: rgba(219, 234, 254, 0.78);
  font-size: 0.68rem;
  font-weight: 700;
}

.world-object-label.unlocked {
  color: #fef3c7;
  border-color: rgba(250, 204, 21, 0.28);
  background: rgba(250, 204, 21, 0.1);
}

@keyframes worldObjectAppear {
  from { opacity: 0; transform: translateY(0.55rem) scale(0.86); }
  to { opacity: 1; transform: translateY(0) scale(1); }
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

const createWorldObjects = ({ career, familySize, lifeProjects, memoryHighScore, memoryMoments, pressures }) => {
  const walletComfort = 100 - clamp(pressures.wallet ?? pressures.money ?? 45);
  const relationshipComfort = 100 - clamp(pressures.relationship ?? pressures.family ?? 45);
  const projectProgress = Math.max(0, ...lifeProjects.map((project) => Number(project.progress) || 0));
  const careerScore = clamp((career?.salary ?? 0) / 1200);
  const memoryScore = clamp(memoryHighScore + memoryMoments.length * 5);
  const totalLegacy = (walletComfort + relationshipComfort + careerScore + memoryScore) / 4;

  return [
    { id: "first-home", icon: "🏡", label: "First Home", unlocked: walletComfort >= 58 },
    { id: "career-tower", icon: "🏢", label: "Career Tower", unlocked: careerScore >= 62 },
    { id: "family-table", icon: "🍽️", label: "Family Table", unlocked: familySize >= 3 || relationshipComfort >= 72 },
    { id: "memory-grove", icon: "🌳", label: "Memory Grove", unlocked: memoryScore >= 45 },
    { id: "life-work", icon: "🏆", label: "Life Work", unlocked: projectProgress >= 70 },
    { id: "legacy-bridge", icon: "🌉", label: "Legacy Bridge", unlocked: totalLegacy >= 62 },
    { id: "retirement-garden", icon: "🌅", label: "Retirement Garden", unlocked: memoryScore >= 55 && relationshipComfort >= 55 },
    { id: "ancestry-stone", icon: "🪨", label: "Ancestry Stone", unlocked: (memoryScore + careerScore + walletComfort) / 3 >= 70 }
  ];
};

export default function WorldUnlocksLayer({
  career,
  family,
  lifeProjects = [],
  memoryHighScore = 0,
  memoryMoments = [],
  pressures = {}
}) {
  useStyles();
  const familySize = getFamilySize(family);
  const objects = useMemo(
    () => createWorldObjects({ career, familySize, lifeProjects, memoryHighScore, memoryMoments, pressures }),
    [career, familySize, lifeProjects, memoryHighScore, memoryMoments, pressures]
  );
  const unlockedCount = objects.filter((object) => object.unlocked).length;

  return (
    <section className="world-unlocks-layer" aria-label="Persistent world unlocks">
      <div className="world-unlocks-header">
        <div>
          <strong>Persistent world map</strong>
          <span>Unlocked achievements now become physical landmarks in the landscape instead of only appearing as cards.</span>
        </div>
        <span className="world-unlocks-badge">{unlockedCount}/{objects.length} landmarks</span>
      </div>

      <div className="world-map-stage">
        {objects.map((object) => (
          <span
            aria-label={`${object.label} ${object.unlocked ? "unlocked" : "locked"}`}
            className={`world-object ${object.id} ${object.unlocked ? "unlocked" : "locked"}`}
            key={object.id}
            title={`${object.label} ${object.unlocked ? "unlocked" : "locked"}`}
          >
            <span aria-hidden="true">{object.icon}</span>
          </span>
        ))}
        <span className="world-map-road" aria-hidden="true" />
      </div>

      <div className="world-object-labels">
        {objects.map((object) => (
          <span className={`world-object-label ${object.unlocked ? "unlocked" : ""}`} key={object.id}>
            {object.icon} {object.label}
          </span>
        ))}
      </div>
    </section>
  );
}
