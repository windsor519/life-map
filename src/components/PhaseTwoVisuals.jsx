import { useEffect, useMemo } from "react";

const STYLE_ID = "phase-two-visuals-styles";

const phaseTwoCss = `
.phase-two-visuals {
  display: grid;
  grid-template-columns: minmax(0, 1.18fr) minmax(320px, 0.82fr);
  gap: 1rem;
  margin: 1rem 0;
}

.life-town-card,
.memory-scrapbook-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 1.35rem;
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.62), rgba(15, 23, 42, 0.26));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 1rem 2.5rem rgba(2, 6, 23, 0.22);
}

.life-town-card {
  min-height: 18rem;
  padding: 1rem;
}

.life-town-header,
.memory-scrapbook-header {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.8rem;
}

.life-town-header strong,
.memory-scrapbook-header strong {
  display: block;
  color: #f8fafc;
  font-size: 1rem;
}

.life-town-header span,
.memory-scrapbook-header span {
  display: block;
  margin-top: 0.22rem;
  color: rgba(219, 234, 254, 0.72);
  font-size: 0.78rem;
  line-height: 1.35;
}

.life-town-age-badge {
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

.life-town-scene {
  position: relative;
  min-height: 13.5rem;
  overflow: hidden;
  border-radius: 1rem;
  background:
    radial-gradient(circle at 18% 18%, rgba(253, 224, 71, var(--sun-strength, 0.2)), transparent 5.5rem),
    linear-gradient(180deg, rgba(125, 211, 252, 0.26), rgba(14, 165, 233, 0.08) 44%, rgba(34, 197, 94, 0.2) 45%, rgba(22, 101, 52, 0.26));
}

.life-town-skyline {
  position: absolute;
  right: 4%;
  bottom: 39%;
  left: 38%;
  display: flex;
  align-items: end;
  justify-content: flex-end;
  gap: 0.45rem;
  opacity: calc(0.36 + var(--career-strength, 0.4) * 0.5);
}

.life-town-building {
  width: clamp(1.2rem, 3vw, 2.1rem);
  height: calc(2.2rem + var(--building-grow, 0) * 4.2rem);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 0.28rem 0.28rem 0.08rem 0.08rem;
  background:
    repeating-linear-gradient(180deg, rgba(255, 255, 255, 0.24) 0 0.22rem, transparent 0.22rem 0.62rem),
    linear-gradient(180deg, rgba(96, 165, 250, 0.68), rgba(30, 41, 59, 0.72));
  box-shadow: 0 0.7rem 1.8rem rgba(2, 6, 23, 0.24);
}

.life-town-road {
  position: absolute;
  right: -4%;
  bottom: -8%;
  left: 5%;
  height: 5rem;
  border-radius: 100% 0 0 0;
  background: linear-gradient(90deg, rgba(51, 65, 85, 0.88), rgba(15, 23, 42, 0.8));
  transform: skewX(-8deg);
}

.life-town-road::after {
  position: absolute;
  inset: 46% 8% auto 10%;
  height: 0.18rem;
  border-radius: 999px;
  background: repeating-linear-gradient(90deg, rgba(254, 240, 138, 0.88) 0 1.4rem, transparent 1.4rem 2.35rem);
  content: "";
}

.life-town-home {
  position: absolute;
  bottom: 21%;
  left: 9%;
  width: calc(4.4rem + var(--home-level, 0) * 2.1rem);
  height: calc(3.2rem + var(--home-level, 0) * 1.1rem);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 0.45rem 0.45rem 0.2rem 0.2rem;
  background:
    linear-gradient(90deg, transparent 43%, rgba(255, 255, 255, 0.2) 43% 57%, transparent 57%),
    linear-gradient(180deg, rgba(251, 191, 36, 0.78), rgba(194, 65, 12, 0.76));
  box-shadow: 0 1rem 2rem rgba(2, 6, 23, 0.32), 0 0 2rem rgba(251, 191, 36, var(--home-glow, 0.12));
}

.life-town-home::before {
  position: absolute;
  right: -0.45rem;
  bottom: 88%;
  left: -0.45rem;
  height: 1.8rem;
  border-radius: 0.35rem 0.35rem 0.08rem 0.08rem;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(124, 45, 18, 0.96));
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
  content: "";
}

.life-town-home::after {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 1.05rem;
  height: 1.65rem;
  border-radius: 0.5rem 0.5rem 0.05rem 0.05rem;
  background: rgba(15, 23, 42, 0.76);
  content: "";
  transform: translateX(-50%);
}

.life-town-family-dots {
  position: absolute;
  bottom: 18%;
  left: calc(11.5rem + var(--home-level, 0) * 1.2rem);
  display: flex;
  align-items: end;
  gap: 0.2rem;
}

.life-town-family-dot {
  width: 0.8rem;
  height: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 999px;
  background: hsl(var(--dot-hue, 190), 82%, 70%);
  box-shadow: 0 0 1rem rgba(255, 255, 255, 0.18);
}

.life-town-tree {
  position: absolute;
  bottom: 25%;
  width: calc(1.4rem + var(--tree-grow, 0.2) * 2.4rem);
  height: calc(2.3rem + var(--tree-grow, 0.2) * 2.8rem);
}

.life-town-tree.tree-one { left: 31%; }
.life-town-tree.tree-two { right: 18%; transform: scale(0.8); }
.life-town-tree.tree-three { right: 7%; transform: scale(0.62); }

.life-town-tree::before {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0.32rem;
  height: 48%;
  border-radius: 999px;
  background: #92400e;
  content: "";
  transform: translateX(-50%);
}

.life-town-tree::after {
  position: absolute;
  top: 0;
  left: 50%;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 45% 55% 52% 48%;
  background: radial-gradient(circle at 36% 28%, rgba(255, 255, 255, 0.22), transparent 28%), hsl(var(--tree-hue, 142), 62%, 42%);
  box-shadow: 0 0.35rem 0 hsl(var(--tree-hue, 142), 58%, 34%);
  content: "";
  transform: translateX(-50%);
}

.life-town-meter-row {
  position: relative;
  z-index: 3;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.55rem;
  margin-top: 0.75rem;
}

.life-town-meter {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.06);
  padding: 0.55rem;
}

.life-town-meter span,
.life-town-meter small {
  display: block;
  color: rgba(219, 234, 254, 0.72);
  font-size: 0.68rem;
}

.life-town-meter strong {
  display: block;
  margin-top: 0.18rem;
  color: #fff;
  font-size: 0.9rem;
}

.memory-scrapbook-card {
  min-height: 18rem;
  padding: 1rem;
  background:
    radial-gradient(circle at 18% 18%, rgba(251, 191, 36, 0.16), transparent 8rem),
    linear-gradient(145deg, rgba(68, 35, 18, 0.46), rgba(15, 23, 42, 0.46));
}

.memory-polaroid-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
}

.memory-polaroid {
  position: relative;
  min-height: 8.6rem;
  border-radius: 0.35rem;
  background: #fff7ed;
  padding: 0.45rem 0.45rem 1.6rem;
  color: #431407;
  box-shadow: 0 0.65rem 1.3rem rgba(2, 6, 23, 0.28);
  transform: rotate(var(--tilt, -2deg));
}

.memory-polaroid:nth-child(2n) { --tilt: 2deg; }
.memory-polaroid:nth-child(3n) { --tilt: -1deg; }

.memory-polaroid-image {
  display: grid;
  min-height: 4.4rem;
  place-items: center;
  border-radius: 0.22rem;
  background:
    radial-gradient(circle at 24% 28%, rgba(255, 255, 255, 0.76), transparent 2.3rem),
    linear-gradient(145deg, var(--memory-color, #bae6fd), rgba(15, 23, 42, 0.18));
  font-size: 1.85rem;
}

.memory-polaroid strong {
  display: block;
  margin-top: 0.42rem;
  overflow: hidden;
  font-size: 0.76rem;
  line-height: 1.15;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.memory-polaroid span {
  display: block;
  margin-top: 0.18rem;
  color: rgba(67, 20, 7, 0.68);
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.memory-polaroid-empty {
  grid-column: 1 / -1;
  border: 1px dashed rgba(255, 255, 255, 0.24);
  border-radius: 1rem;
  padding: 1.2rem;
  color: rgba(255, 255, 255, 0.78);
  line-height: 1.45;
  text-align: center;
}

@media (max-width: 1120px) {
  .phase-two-visuals {
    grid-template-columns: 1fr;
  }
}
`;

function usePhaseTwoStyles() {
  useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = phaseTwoCss;
    document.head.appendChild(style);
  }, []);
}

const clampPercent = (value) => Math.max(0, Math.min(100, Number(value) || 0));

const getMemoryIcon = (moment) => {
  const text = `${moment?.eventTitle ?? ""} ${moment?.label ?? ""} ${moment?.text ?? ""}`.toLowerCase();
  if (text.includes("child") || text.includes("family") || text.includes("baby")) return "👨‍👩‍👧";
  if (text.includes("career") || text.includes("work") || text.includes("promotion")) return "🏢";
  if (text.includes("health") || text.includes("rest") || text.includes("wellbeing")) return "🌿";
  if (text.includes("money") || text.includes("wallet") || text.includes("house")) return "🏡";
  if (moment?.score < 0) return "🌧️";
  return "✨";
};

const memoryColors = ["#bae6fd", "#fecdd3", "#fde68a", "#bbf7d0", "#ddd6fe", "#fed7aa"];

export default function PhaseTwoVisuals({
  family,
  currentAge,
  career,
  pressures = {},
  lifeProjects = [],
  memoryMoments = [],
  memoryHighScore = 0,
  activeSeason
}) {
  usePhaseTwoStyles();

  const familySize = Math.max(1, 1 + (Array.isArray(family?.members) ? family.members.length : 0));
  const walletPressure = clampPercent(pressures.wallet ?? pressures.money ?? 50);
  const relationshipPressure = clampPercent(pressures.relationship ?? pressures.family ?? 50);
  const careerStrength = clampPercent((career?.salary ?? 42000) / 1400);
  const ageProgress = clampPercent(currentAge);
  const homeLevel = Math.min(1, Math.max(0.12, (100 - walletPressure) / 100 + familySize * 0.05));
  const treeGrow = Math.min(1, Math.max(0.16, (memoryHighScore + 20) / 80));
  const sunStrength = Math.min(0.42, Math.max(0.1, (100 - relationshipPressure) / 170));
  const townStage = ageProgress < 28 ? "First place" : ageProgress < 45 ? "Growing household" : ageProgress < 65 ? "Established roots" : "Legacy home";
  const scrapbookMoments = useMemo(() => memoryMoments.slice(-4).reverse(), [memoryMoments]);

  return (
    <div className="phase-two-visuals" aria-label="Life map and memory scrapbook">
      <article className="life-town-card">
        <div className="life-town-header">
          <div>
            <strong>Living life map</strong>
            <span>{townStage} · the town grows from age, career, family, money, and memories.</span>
          </div>
          <span className="life-town-age-badge">Age {Math.floor(Number(currentAge) || 0)}</span>
        </div>
        <div
          className="life-town-scene"
          style={{
            "--home-level": homeLevel.toFixed(2),
            "--tree-grow": treeGrow.toFixed(2),
            "--sun-strength": sunStrength.toFixed(2),
            "--career-strength": (careerStrength / 100).toFixed(2),
            "--building-grow": (careerStrength / 100).toFixed(2),
            "--home-glow": Math.max(0.08, (100 - walletPressure) / 260).toFixed(2),
            "--tree-hue": activeSeason?.id === "fall" ? 38 : activeSeason?.id === "winter" ? 204 : 142
          }}
        >
          <div className="life-town-skyline" aria-hidden="true">
            <span className="life-town-building" />
            <span className="life-town-building" style={{ "--building-grow": Math.min(1, careerStrength / 85).toFixed(2) }} />
            <span className="life-town-building" style={{ "--building-grow": Math.min(1, careerStrength / 70).toFixed(2) }} />
          </div>
          <span className="life-town-tree tree-one" aria-hidden="true" />
          <span className="life-town-tree tree-two" aria-hidden="true" />
          <span className="life-town-tree tree-three" aria-hidden="true" />
          <span className="life-town-home" aria-hidden="true" />
          <span className="life-town-family-dots" aria-label={`${familySize} household members`}>
            {Array.from({ length: Math.min(familySize, 6) }, (_, index) => (
              <span className="life-town-family-dot" key={index} style={{ "--dot-hue": 180 + index * 28 }} />
            ))}
          </span>
          <span className="life-town-road" aria-hidden="true" />
        </div>
        <div className="life-town-meter-row">
          <div className="life-town-meter"><span>Home</span><strong>{Math.round(homeLevel * 100)}%</strong><small>wealth comfort</small></div>
          <div className="life-town-meter"><span>Roots</span><strong>{Math.round(treeGrow * 100)}%</strong><small>memory growth</small></div>
          <div className="life-town-meter"><span>Career</span><strong>{Math.round(careerStrength)}</strong><small>{career?.title ?? "unassigned"}</small></div>
        </div>
      </article>

      <article className="memory-scrapbook-card">
        <div className="memory-scrapbook-header">
          <div>
            <strong>Memory scrapbook</strong>
            <span>Major moments become collectible snapshots after each season.</span>
          </div>
          <span className="life-town-age-badge">{scrapbookMoments.length}/4</span>
        </div>
        <div className="memory-polaroid-grid">
          {scrapbookMoments.length > 0 ? scrapbookMoments.map((moment, index) => (
            <article className="memory-polaroid" key={`${moment.id ?? moment.eventTitle ?? "memory"}-${index}`}>
              <div className="memory-polaroid-image" style={{ "--memory-color": memoryColors[index % memoryColors.length] }} aria-hidden="true">
                {getMemoryIcon(moment)}
              </div>
              <strong>{moment.eventTitle ?? moment.selection?.eventTitle ?? moment.label ?? "Family memory"}</strong>
              <span>{moment.seasonLabel ?? "Season"} {moment.year ?? ""}</span>
            </article>
          )) : (
            <p className="memory-polaroid-empty">Choose actions and simulate seasons to fill this album with visual life milestones.</p>
          )}
        </div>
      </article>
    </div>
  );
}
