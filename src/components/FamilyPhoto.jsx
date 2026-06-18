import { useEffect } from "react";
import { getFamilyMembers } from "../game/family.js";

const FAMILY_PHOTO_STYLE_ID = "family-photo-component-styles";

const familyPhotoCss = `
.family-photo-strip {
  position: relative;
  width: 100%;
  min-width: 0;
  height: 7.4rem;
  margin-top: 0.55rem;
  padding: 1.35rem 1rem 2.15rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1.25rem;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.34), rgba(15, 23, 42, 0.14));
}

.family-photo-strip::before {
  position: absolute;
  right: 1rem;
  bottom: 1.25rem;
  left: 1rem;
  height: 0.34rem;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(251, 191, 36, 0.92), rgba(249, 115, 22, 0.9), rgba(244, 114, 182, 0.86));
  box-shadow: 0 0 26px rgba(249, 115, 22, 0.22);
  content: "";
}

.family-photo-strip::after {
  position: absolute;
  right: 1rem;
  bottom: 0.15rem;
  left: 1rem;
  color: rgba(219, 234, 254, 0.72);
  content: "Family age timeline";
  text-align: center;
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  white-space: pre;
}

.family-photo-member {
  --skin: #f5c7a9;
  --hair: #111827;
  --shirt: #38bdf8;
  --person-size: clamp(42px, 4.9vw, 62px);
  --person-half: calc(var(--person-size) / 2);
  position: absolute;
  bottom: 1.22rem;
  left: clamp(calc(1rem + var(--person-half)), calc(var(--timeline-position, 0%) + var(--timeline-nudge, 0px)), calc(100% - 1rem - var(--person-half)));
  z-index: var(--timeline-layer, 1);
  display: inline-grid;
  width: var(--person-size);
  height: var(--person-size);
  place-items: center;
  isolation: isolate;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.62);
  border-radius: 999px;
  background:
    radial-gradient(circle at 50% 18%, rgba(255, 255, 255, 0.34), transparent calc(var(--person-size) * 0.4)),
    linear-gradient(180deg, rgba(224, 242, 254, 0.54), rgba(30, 41, 59, 0.28));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 0.5rem 1.2rem rgba(2, 6, 23, 0.3), 0 0 0 4px rgba(15, 23, 42, 0.28);
  transform: translateX(-50%);
}

.family-photo-member::before {
  position: absolute;
  top: calc(var(--person-size) * 0.17);
  left: 50%;
  z-index: 2;
  width: calc(var(--person-size) * 0.5);
  height: calc(var(--person-size) * 0.5);
  border: 1px solid rgba(255, 255, 255, 0.32);
  border-radius: 47% 47% 44% 44%;
  background:
    radial-gradient(circle at 35% 48%, #3f1f12 0 calc(var(--person-size) * 0.033), transparent calc(var(--person-size) * 0.053)),
    radial-gradient(circle at 65% 48%, #3f1f12 0 calc(var(--person-size) * 0.033), transparent calc(var(--person-size) * 0.053)),
    radial-gradient(ellipse at 50% 72%, rgba(127, 29, 29, 0.62) 0 calc(var(--person-size) * 0.047), transparent calc(var(--person-size) * 0.06)),
    var(--skin);
  content: "";
  transform: translateX(-50%);
}

.family-photo-member::after {
  position: absolute;
  bottom: calc(var(--person-size) * -0.13);
  left: 50%;
  width: calc(var(--person-size) * 0.8);
  height: calc(var(--person-size) * 0.5);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: calc(var(--person-size) * 0.4) calc(var(--person-size) * 0.4) calc(var(--person-size) * 0.13) calc(var(--person-size) * 0.13);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.18), transparent 45%), var(--shirt);
  content: "";
  transform: translateX(-50%);
}

.family-photo-back-hair,
.family-photo-hair {
  position: absolute;
  left: 50%;
  background: var(--hair);
  content: "";
  transform: translateX(-50%);
}

.family-photo-back-hair {
  display: none;
}

.family-photo-hair {
  top: calc(var(--person-size) * 0.1);
  z-index: 3;
  width: calc(var(--person-size) * 0.57);
  height: calc(var(--person-size) * 0.27);
  border-radius: 55% 55% 34% 34%;
  clip-path: polygon(3% 48%, 15% 10%, 46% 0, 80% 8%, 100% 40%, 86% 100%, 18% 88%);
}

.family-photo-member.family-female {
  --shirt: #fb7185;
}

.family-photo-member.family-female::before {
  background:
    radial-gradient(circle at 27% 58%, rgba(244, 114, 182, 0.44) 0 calc(var(--person-size) * 0.042), transparent calc(var(--person-size) * 0.057)),
    radial-gradient(circle at 73% 58%, rgba(244, 114, 182, 0.44) 0 calc(var(--person-size) * 0.042), transparent calc(var(--person-size) * 0.057)),
    linear-gradient(12deg, transparent 31%, #3f1f12 32% 35%, transparent 36%) 31% 45% / calc(var(--person-size) * 0.1) calc(var(--person-size) * 0.08) no-repeat,
    linear-gradient(-12deg, transparent 31%, #3f1f12 32% 35%, transparent 36%) 69% 45% / calc(var(--person-size) * 0.1) calc(var(--person-size) * 0.08) no-repeat,
    radial-gradient(circle at 35% 48%, #3f1f12 0 calc(var(--person-size) * 0.033), transparent calc(var(--person-size) * 0.053)),
    radial-gradient(circle at 65% 48%, #3f1f12 0 calc(var(--person-size) * 0.033), transparent calc(var(--person-size) * 0.053)),
    radial-gradient(ellipse at 50% 72%, rgba(127, 29, 29, 0.62) 0 calc(var(--person-size) * 0.047), transparent calc(var(--person-size) * 0.06)),
    var(--skin);
}

.family-photo-member.family-female .family-photo-back-hair {
  top: calc(var(--person-size) * 0.04);
  z-index: 1;
  display: block;
  width: calc(var(--person-size) * 0.8);
  height: calc(var(--person-size) * 0.88);
  border-radius:
    calc(var(--person-size) * 0.42)
    calc(var(--person-size) * 0.42)
    calc(var(--person-size) * 0.24)
    calc(var(--person-size) * 0.24);
  clip-path: polygon(
    12% 7%,
    31% 0%,
    50% 0%,
    70% 0%,
    88% 8%,
    100% 31%,
    95% 84%,
    82% 100%,
    68% 89%,
    50% 96%,
    32% 89%,
    18% 100%,
    5% 84%,
    0% 31%
  );
}

.family-photo-member.family-female .family-photo-hair {
  top: calc(var(--person-size) * 0.08);
  z-index: 3;
  width: calc(var(--person-size) * 0.58);
  height: calc(var(--person-size) * 0.27);
  border-radius: 64% 64% 46% 46%;
  clip-path: polygon(
    0% 52%,
    16% 12%,
    38% 0%,
    62% 0%,
    84% 12%,
    100% 52%,
    82% 92%,
    62% 62%,
    50% 100%,
    38% 62%,
    18% 92%
  );
}

.family-photo-member.family-male {
  --shirt: #60a5fa;
}

.family-photo-member.family-unknown {
  --shirt: #a78bfa;
}

.family-photo-member.family-child {
  --skin: #f8d7bd;
  --shirt: #facc15;
  --person-size: clamp(36px, 4.2vw, 52px);
}

.family-photo-member.family-child::before {
  top: calc(var(--person-size) * 0.12);
  width: calc(var(--person-size) * 0.58);
  height: calc(var(--person-size) * 0.58);
  border-radius: 50%;
}

.family-photo-member.family-child::after {
  width: calc(var(--person-size) * 0.62);
  height: calc(var(--person-size) * 0.38);
  background:
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.2),
      transparent 40%
    ),
    #facc15;
}

.family-photo-member.family-child .family-photo-hair {
  width: calc(var(--person-size) * 0.52);
  height: calc(var(--person-size) * 0.22);
  border-radius: 60% 60% 40% 40%;
}

.family-photo-member.family-child.family-female .family-photo-back-hair {
  top: calc(var(--person-size) * 0.26);
  left: calc(var(--person-size) * 0.16);
  z-index: 1;
  width: calc(var(--person-size) * 0.18);
  height: calc(var(--person-size) * 0.22);
  border-radius: 999px;
  box-shadow: calc(var(--person-size) * 0.5) 0 0 var(--hair);
  clip-path: none;
  transform: none;
}

.family-photo-member.family-child.family-female .family-photo-hair {
  top: calc(var(--person-size) * 0.06);
  width: calc(var(--person-size) * 0.6);
  height: calc(var(--person-size) * 0.24);
  border-radius: 64% 64% 46% 46%;
  clip-path: polygon(
    0% 52%,
    16% 12%,
    38% 0%,
    62% 0%,
    84% 12%,
    100% 52%,
    82% 92%,
    62% 62%,
    50% 100%,
    38% 62%,
    18% 92%
  );
}

.family-photo-member.family-grandparent,
.family-photo-member.family-greatgrand {
  --hair: #cbd5e1;
  --shirt: #94a3b8;
}

.family-photo-age {
  position: absolute;
  right: 50%;
  bottom: -1px;
  z-index: 5;
  display: inline-grid;
  min-width: calc(var(--person-size) * 0.34);
  height: calc(var(--person-size) * 0.34);
  padding: 0 calc(var(--person-size) * 0.04);
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.82);
  box-shadow: 0 0.12rem 0.35rem rgba(2, 6, 23, 0.36);
  color: #f8fafc;
  font-size: calc(var(--person-size) * 0.17);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1;
  transform: translateX(50%);
}

.family-photo-axis-label {
  position: absolute;
  bottom: 0.15rem;
  color: rgba(219, 234, 254, 0.78);
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.family-photo-axis-label.age-0 {
  left: 1rem;
}

.family-photo-axis-label.age-100 {
  right: 1rem;
}

.family-photo-member.family-self {
  --shirt: #22d3ee;
  border-color: rgba(224, 242, 254, 0.88);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.38), 0 0.35rem 1rem rgba(14, 165, 233, 0.3);
}
`;

function useFamilyPhotoStyles() {
  useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(FAMILY_PHOTO_STYLE_ID)) {
      return;
    }

    const style = document.createElement("style");
    style.id = FAMILY_PHOTO_STYLE_ID;
    style.textContent = familyPhotoCss;
    document.head.appendChild(style);
  }, []);
}

const normalizeCharacterSex = (value) => {
  const sex = String(value ?? "").trim().toLowerCase();
  if (["m", "male", "man", "boy"].includes(sex)) return "male";
  if (["f", "female", "woman", "girl"].includes(sex)) return "female";
  return "unknown";
};

const getWholeAge = (age) => {
  if (!Number.isFinite(age)) return null;
  return Math.max(0, Math.floor(age));
};

const getCompactAgeLabel = (age) => {
  const wholeAge = getWholeAge(age);
  return wholeAge === null ? "?" : String(wholeAge);
};

const getPlayerMember = (currentAge, character) => {
  const sex = normalizeCharacterSex(character?.sex);
  const age = Number(currentAge);

  return {
    id: "player",
    name: String(character?.name ?? "").trim() || "You",
    role: "self",
    groupLabel: "You",
    sex,
    age,
    ageLabel: getWholeAge(age) === null ? "age ?" : `${getWholeAge(age)}y`,
    isPlayer: true
  };
};

const getMemberAgeBadge = (member) => getCompactAgeLabel(Number(member.age));

const getTimelineAge = (age) => Math.max(0, Math.min(100, Number.isFinite(Number(age)) ? Number(age) : 0));

const getTimelinePosition = (age) => `${getTimelineAge(age)}%`;

const getTimelineLayer = (age) => 101 - Math.round(getTimelineAge(age));

const getFamilyHairColor = (age) => {
  const safeAge = getTimelineAge(age);

  if (safeAge >= 82) return "#f8fafc";
  if (safeAge >= 70) return "#e2e8f0";
  if (safeAge >= 58) return "#94a3b8";
  if (safeAge >= 45) return "#475569";
  if (safeAge >= 28) return "#1f2937";
  return "#020617";
};

const getPositionedMembers = (members) => {
  const sortedMembers = members
    .map((member, originalIndex) => ({ member, originalIndex, age: getTimelineAge(member.age) }))
    .sort((a, b) => a.age - b.age || a.originalIndex - b.originalIndex);
  const positioned = new Map();
  let cluster = [];

  const flushCluster = () => {
    if (cluster.length === 0) return;

    const center = (cluster.length - 1) / 2;
    cluster.forEach((item, clusterIndex) => {
      const spread = clusterIndex - center;

      positioned.set(item.originalIndex, {
        ...item.member,
        timelineNudge: `${spread * 28}px`,
        timelineLane: "0px"
      });
    });
    cluster = [];
  };

  sortedMembers.forEach((item) => {
    const previous = cluster[cluster.length - 1];

    if (previous && item.age - previous.age > 7) {
      flushCluster();
    }

    cluster.push(item);
  });
  flushCluster();

  return members.map((_, index) => positioned.get(index));
};

const getMemberLabel = (member) => {
  const name = member.isPlayer ? "You" : member.name;
  return `${name}, ${member.groupLabel}, ${member.ageLabel}`;
};

export default function FamilyPhoto({ family, currentAge, currentMonth, character }) {
  const familyMembers = getFamilyMembers(family, currentAge, currentMonth);
  const members = getPositionedMembers([getPlayerMember(currentAge, character), ...familyMembers]);
  useFamilyPhotoStyles();

  return (
    <div className="family-photo-strip" aria-label={`${members.length} family members on a 0 to 100 age timeline`}>
      <span className="family-photo-axis-label age-0" aria-hidden="true">0</span>
      <span className="family-photo-axis-label age-100" aria-hidden="true">100</span>
      {members.map((member) => {
        // Dynamic safeguarding: ensure raw data formats from API/state (e.g. "M"/"F") 
        // are normalized into exact string keys expected by your CSS ("male"/"female")
        const resolvedSex = normalizeCharacterSex(member.sex);

        return (
          <span
            className={`family-photo-member family-${member.role} family-${resolvedSex}`}
            key={member.id}
            role="img"
            aria-label={getMemberLabel(member)}
            title={getMemberLabel(member)}
            style={{ "--timeline-position": getTimelinePosition(member.age), "--timeline-layer": getTimelineLayer(member.age), "--timeline-nudge": member.timelineNudge, "--timeline-lane": member.timelineLane, "--hair": getFamilyHairColor(member.age) }}
          >
            <span className="family-photo-back-hair" aria-hidden="true" />
            <span className="family-photo-hair" aria-hidden="true" />
            <span className="family-photo-age" aria-hidden="true">{getMemberAgeBadge(member)}</span>
          </span>
        );
      })}
    </div>
  );
}