import { useEffect } from "react";
import { getFamilyMembers } from "../game/family.js";

const FAMILY_PHOTO_STYLE_ID = "family-photo-component-styles";

const familyPhotoCss = `
.family-photo-strip {
  position: relative;
  width: min(100%, 760px);
  min-width: 0;
  height: 6.2rem;
  margin-top: 0.55rem;
  padding: 1.55rem 0.75rem 1.9rem;
}

.family-photo-strip::before {
  position: absolute;
  right: 0.75rem;
  bottom: 1.25rem;
  left: 0.75rem;
  height: 0.24rem;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(34, 211, 238, 0.76), rgba(168, 85, 247, 0.76), rgba(251, 191, 36, 0.76));
  content: "";
}

.family-photo-strip::after {
  position: absolute;
  right: 0.75rem;
  bottom: 0.15rem;
  left: 0.75rem;
  color: rgba(219, 234, 254, 0.72);
  content: "Age timeline";
  text-align: center;
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  white-space: pre;
}

.family-photo-member {
  --skin: #f5c7a9;
  --hair: #6b3f2a;
  --shirt: #38bdf8;
  --person-size: 60px;
  --person-half: calc(var(--person-size) / 2);
  position: absolute;
  bottom: 1.05rem;
  left: clamp(calc(0.75rem + var(--person-half)), var(--timeline-position, 0%), calc(100% - 0.75rem - var(--person-half)));
  z-index: var(--timeline-layer, 1);
  display: inline-grid;
  width: var(--person-size);
  height: var(--person-size);
  place-items: center;
  isolation: isolate;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 999px;
  background:
    radial-gradient(circle at 50% 18%, rgba(255, 255, 255, 0.34), transparent calc(var(--person-size) * 0.4)),
    linear-gradient(180deg, rgba(224, 242, 254, 0.54), rgba(30, 41, 59, 0.28));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 0.35rem 0.9rem rgba(2, 6, 23, 0.2);
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
  --hair: #7c2d12;
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
  --hair: #3f2a1d;
  --shirt: #60a5fa;
}

.family-photo-member.family-unknown {
  --hair: #475569;
  --shirt: #a78bfa;
}

.family-photo-member.family-child {
  --skin: #f8d7bd;
  --shirt: #facc15;
  --person-size: 52px;
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
  left: 0.75rem;
}

.family-photo-axis-label.age-100 {
  right: 0.75rem;
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

const getMemberLabel = (member) => {
  const name = member.isPlayer ? "You" : member.name;
  return `${name}, ${member.groupLabel}, ${member.ageLabel}`;
};

export default function FamilyPhoto({ family, currentAge, currentMonth, character }) {
  const familyMembers = getFamilyMembers(family, currentAge, currentMonth);
  const members = [getPlayerMember(currentAge, character), ...familyMembers];
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
            style={{ "--timeline-position": getTimelinePosition(member.age), "--timeline-layer": getTimelineLayer(member.age) }}
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