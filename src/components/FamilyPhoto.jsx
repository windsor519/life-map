import { useEffect } from "react";
import { getFamilyMembers } from "../game/family.js";

const FAMILY_PHOTO_STYLE_ID = "family-photo-component-styles";

const familyPhotoCss = `
.family-photo-strip {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.42rem;
  margin-top: 0.55rem;
}

.family-photo-member {
  --skin: #f5c7a9;
  --hair: #6b3f2a;
  --shirt: #38bdf8;
  position: relative;
  display: inline-grid;
  width: 30px;
  height: 30px;
  place-items: center;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 999px;
  background:
    radial-gradient(circle at 50% 18%, rgba(255, 255, 255, 0.34), transparent 12px),
    linear-gradient(180deg, rgba(224, 242, 254, 0.54), rgba(30, 41, 59, 0.28));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 0.35rem 0.9rem rgba(2, 6, 23, 0.2);
}

.family-photo-member::before {
  position: absolute;
  top: 5px;
  left: 50%;
  z-index: 2;
  width: 15px;
  height: 15px;
  border: 1px solid rgba(255, 255, 255, 0.32);
  border-radius: 47% 47% 44% 44%;
  background:
    radial-gradient(circle at 35% 48%, #3f1f12 0 1px, transparent 1.6px),
    radial-gradient(circle at 65% 48%, #3f1f12 0 1px, transparent 1.6px),
    radial-gradient(ellipse at 50% 72%, rgba(127, 29, 29, 0.62) 0 1.4px, transparent 1.8px),
    var(--skin);
  content: "";
  transform: translateX(-50%);
}

.family-photo-member::after {
  position: absolute;
  bottom: -4px;
  left: 50%;
  width: 24px;
  height: 15px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 12px 12px 4px 4px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.18), transparent 45%), var(--shirt);
  content: "";
  transform: translateX(-50%);
}

.family-photo-hair {
  position: absolute;
  top: 3px;
  left: 50%;
  z-index: 3;
  width: 17px;
  height: 8px;
  border-radius: 55% 55% 34% 34%;
  background: var(--hair);
  clip-path: polygon(3% 48%, 15% 10%, 46% 0, 80% 8%, 100% 40%, 86% 100%, 18% 88%);
  transform: translateX(-50%);
}

.family-photo-member.family-female {
  --hair: #7c2d12;
  --shirt: #fb7185;
}

.family-photo-member.family-female .family-photo-hair {
  top: 3px;
  width: 18px;
  height: 17px;
  border-radius: 9px 9px 7px 7px;
  clip-path: polygon(10% 4%, 50% 0, 90% 6%, 100% 34%, 88% 100%, 13% 100%, 0 36%);
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
}

.family-photo-member.family-grandparent,
.family-photo-member.family-greatgrand {
  --hair: #cbd5e1;
  --shirt: #94a3b8;
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

const getPlayerMember = (currentAge, character) => {
  const sex = normalizeCharacterSex(character?.sex);

  return {
    id: "player",
    name: String(character?.name ?? "").trim() || "You",
    role: "self",
    groupLabel: "You",
    sex,
    ageLabel: Number.isFinite(Number(currentAge)) ? `${Math.floor(Number(currentAge))}y` : "age ?",
    isPlayer: true
  };
};

const getMemberLabel = (member) => {
  const name = member.isPlayer ? "You" : member.name;
  return `${name}, ${member.groupLabel}, ${member.ageLabel}`;
};

export default function FamilyPhoto({ family, currentAge, currentMonth, character }) {
  const familyMembers = getFamilyMembers(family, currentAge, currentMonth);
  const members = [getPlayerMember(currentAge, character), ...familyMembers];
  useFamilyPhotoStyles();

  return (
    <div className="family-photo-strip" aria-label={`${members.length} family members`}>
      {members.map((member) => (
        <span
          className={`family-photo-member family-${member.role} family-${member.sex}`}
          key={member.id}
          role="img"
          aria-label={getMemberLabel(member)}
          title={getMemberLabel(member)}
        >
          <span className="family-photo-hair" aria-hidden="true" />
        </span>
      ))}
    </div>
  );
}
