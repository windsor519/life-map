import { useEffect, useMemo } from "react";

const STYLE_ID = "legacy-evolution-panel-styles";

const css = `
.legacy-evolution-panel {
  position: relative;
  overflow: hidden;
  margin: 1rem 0;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 1.35rem;
  background:
    radial-gradient(circle at 16% 18%, rgba(250, 204, 21, 0.16), transparent 9rem),
    radial-gradient(circle at 86% 28%, rgba(34, 211, 238, 0.12), transparent 10rem),
    linear-gradient(145deg, rgba(15, 23, 42, 0.68), rgba(15, 23, 42, 0.24));
  padding: 1rem;
}

.legacy-evolution-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.9rem;
}

.legacy-evolution-header strong {
  display: block;
  color: #f8fafc;
  font-size: 1rem;
}

.legacy-evolution-header span {
  display: block;
  margin-top: 0.22rem;
  color: rgba(219, 234, 254, 0.72);
  font-size: 0.78rem;
  line-height: 1.38;
}

.legacy-evolution-badge {
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

.legacy-unlocks-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.65rem;
}

.legacy-unlock-card {
  position: relative;
  min-height: 8.4rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1rem;
  background:
    radial-gradient(circle at 24% 20%, rgba(255, 255, 255, 0.18), transparent 4rem),
    linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.04));
  padding: 0.8rem;
  transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
}

.legacy-unlock-card.unlocked {
  border-color: rgba(250, 204, 21, 0.34);
  background:
    radial-gradient(circle at 24% 20%, rgba(250, 204, 21, 0.22), transparent 4.5rem),
    linear-gradient(145deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.055));
}

.legacy-unlock-card.locked {
  opacity: 0.62;
  filter: grayscale(0.28);
}

.legacy-unlock-card::after {
  position: absolute;
  inset: auto 0 0;
  height: 0.22rem;
  background: linear-gradient(90deg, rgba(34, 211, 238, 0.8), rgba(250, 204, 21, 0.9));
  transform: scaleX(var(--progress, 0));
  transform-origin: left;
  content: "";
}

.legacy-unlock-icon {
  display: grid;
  width: 2.4rem;
  height: 2.4rem;
  place-items: center;
  border-radius: 0.9rem;
  background: rgba(255, 255, 255, 0.11);
  box-shadow: 0 0.75rem 1.6rem rgba(2, 6, 23, 0.18);
  font-size: 1.35rem;
}

.legacy-unlock-card.unlocked .legacy-unlock-icon {
  animation: legacyUnlockPulse 2.8s ease-in-out infinite;
}

.legacy-unlock-card strong {
  display: block;
  margin-top: 0.62rem;
  color: #fff;
  font-size: 0.88rem;
  line-height: 1.15;
}

.legacy-unlock-card span {
  display: block;
  margin-top: 0.34rem;
  color: rgba(219, 234, 254, 0.72);
  font-size: 0.7rem;
  line-height: 1.35;
}

.legacy-generation-strip {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.5rem;
  margin-top: 0.8rem;
}

.legacy-generation-node {
  position: relative;
  min-height: 4.4rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 0.9rem;
  background: rgba(255, 255, 255, 0.065);
  padding: 0.58rem;
}

.legacy-generation-node.active {
  border-color: rgba(125, 211, 252, 0.36);
  background: rgba(14, 165, 233, 0.12);
}

.legacy-generation-node strong {
  display: block;
  color: #fff;
  font-size: 0.76rem;
}

.legacy-generation-node span {
  display: block;
  margin-top: 0.24rem;
  color: rgba(219, 234, 254, 0.7);
  font-size: 0.66rem;
  line-height: 1.32;
}

@keyframes legacyUnlockPulse {
  0%, 100% { transform: translateY(0) scale(1); box-shadow: 0 0.75rem 1.6rem rgba(2, 6, 23, 0.18); }
  50% { transform: translateY(-0.12rem) scale(1.05); box-shadow: 0 0.95rem 2rem rgba(250, 204, 21, 0.18); }
}

@media (max-width: 1120px) {
  .legacy-unlocks-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .legacy-generation-strip {
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

const createUnlocks = ({ career, familySize, lifeProjects, memoryHighScore, memoryMoments, pressures }) => {
  const walletComfort = 100 - clamp(pressures.wallet ?? pressures.money ?? 45);
  const relationshipComfort = 100 - clamp(pressures.relationship ?? pressures.family ?? 45);
  const projectProgress = Math.max(0, ...lifeProjects.map((project) => Number(project.progress) || 0));
  const careerScore = clamp((career?.salary ?? 0) / 1200);
  const memoryScore = clamp(memoryHighScore + memoryMoments.length * 5);

  return [
    {
      id: "first-home",
      icon: "🏡",
      title: "First Home",
      detail: "Comfort turns the house into a permanent family anchor.",
      progress: walletComfort,
      unlocked: walletComfort >= 58
    },
    {
      id: "career-tower",
      icon: "🏢",
      title: "Career Tower",
      detail: "A strong career leaves a visible skyline landmark.",
      progress: careerScore,
      unlocked: careerScore >= 62
    },
    {
      id: "family-table",
      icon: "🍽️",
      title: "Family Table",
      detail: "A larger household fills the panorama with people.",
      progress: clamp(familySize * 22),
      unlocked: familySize >= 3 || relationshipComfort >= 72
    },
    {
      id: "memory-grove",
      icon: "🌳",
      title: "Memory Grove",
      detail: "Core memories become trees that stay between seasons.",
      progress: memoryScore,
      unlocked: memoryScore >= 45
    },
    {
      id: "life-work",
      icon: "🏆",
      title: "Life Work",
      detail: "A long project becomes a trophy in the landscape.",
      progress: projectProgress,
      unlocked: projectProgress >= 70
    },
    {
      id: "legacy-bridge",
      icon: "🌉",
      title: "Legacy Bridge",
      detail: "Enough combined progress opens the path to descendants.",
      progress: clamp((walletComfort + careerScore + memoryScore + relationshipComfort) / 4),
      unlocked: (walletComfort + careerScore + memoryScore + relationshipComfort) / 4 >= 62
    },
    {
      id: "retirement-garden",
      icon: "🌅",
      title: "Retirement Garden",
      detail: "Late-life stability transforms the scene into reflection.",
      progress: clamp((memoryScore + relationshipComfort) / 2),
      unlocked: memoryScore >= 55 && relationshipComfort >= 55
    },
    {
      id: "ancestry-stone",
      icon: "🪨",
      title: "Ancestry Stone",
      detail: "A high legacy score creates a marker for future runs.",
      progress: clamp((memoryScore + careerScore + walletComfort) / 3),
      unlocked: (memoryScore + careerScore + walletComfort) / 3 >= 70
    }
  ];
};

const createGenerations = ({ familySize, memoryMoments, currentAge, unlockCount }) => {
  const age = Number(currentAge) || 0;
  return [
    { title: "You", detail: `Age ${Math.floor(age)} · current run`, active: true },
    { title: "Household", detail: `${familySize} visible family member${familySize === 1 ? "" : "s"}`, active: familySize >= 2 },
    { title: "Memories", detail: `${memoryMoments.length} story seed${memoryMoments.length === 1 ? "" : "s"}`, active: memoryMoments.length > 0 },
    { title: "Legacy", detail: `${unlockCount} permanent unlock${unlockCount === 1 ? "" : "s"}`, active: unlockCount >= 2 },
    { title: "Descendants", detail: unlockCount >= 5 ? "next generation ready" : "build more legacy", active: unlockCount >= 5 }
  ];
};

export default function LegacyEvolutionPanel({
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
  const unlocks = useMemo(
    () => createUnlocks({ career, familySize, lifeProjects, memoryHighScore, memoryMoments, pressures }),
    [career, familySize, lifeProjects, memoryHighScore, memoryMoments, pressures]
  );
  const unlockedCount = unlocks.filter((unlock) => unlock.unlocked).length;
  const generations = useMemo(
    () => createGenerations({ familySize, memoryMoments, currentAge, unlockCount: unlockedCount }),
    [currentAge, familySize, memoryMoments, unlockedCount]
  );

  return (
    <section className="legacy-evolution-panel" aria-label="Permanent legacy evolution">
      <div className="legacy-evolution-header">
        <div>
          <strong>Permanent legacy evolution</strong>
          <span>Achievements now leave persistent visual landmarks and push the family toward a future-generation run.</span>
        </div>
        <span className="legacy-evolution-badge">{unlockedCount}/{unlocks.length} unlocked</span>
      </div>

      <div className="legacy-unlocks-grid">
        {unlocks.map((unlock) => (
          <article
            className={`legacy-unlock-card ${unlock.unlocked ? "unlocked" : "locked"}`}
            key={unlock.id}
            style={{ "--progress": clamp(unlock.progress, 0, 100) / 100 }}
          >
            <span className="legacy-unlock-icon" aria-hidden="true">{unlock.icon}</span>
            <strong>{unlock.title}</strong>
            <span>{unlock.unlocked ? "Unlocked · " : `${Math.round(clamp(unlock.progress))}% · `}{unlock.detail}</span>
          </article>
        ))}
      </div>

      <div className="legacy-generation-strip" aria-label="Generational path">
        {generations.map((generation) => (
          <article className={`legacy-generation-node ${generation.active ? "active" : ""}`} key={generation.title}>
            <strong>{generation.title}</strong>
            <span>{generation.detail}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
