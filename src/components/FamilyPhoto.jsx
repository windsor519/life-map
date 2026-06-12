import { useEffect } from "react";
import { calculateFamilyHeight, getFamilyMembers } from "../game/family.js";

const FAMILY_PHOTO_STYLE_ID = "family-photo-component-styles";

const familyPhotoCss = `
.family-stage-card {
  grid-column: 1 / -1;
}

.family-stage-card .section-heading {
  margin-bottom: 1rem;
}

.family-stage {
  display: flex;
  min-height: 18rem;
  align-items: end;
  gap: clamp(0.7rem, 1.6vw, 1.25rem);
  overflow-x: auto;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 1.4rem;
  background:
    radial-gradient(ellipse at 50% 100%, rgba(34, 197, 94, 0.12), transparent 36%),
    linear-gradient(180deg, rgba(148, 163, 184, 0.08), rgba(15, 23, 42, 0.22));
  padding: 1.25rem 1rem 1rem;
}

.family-member {
  display: grid;
  min-width: 6.2rem;
  flex: 1 0 6.2rem;
  justify-items: center;
  align-items: end;
  gap: 0.42rem;
  color: #e5eefc;
  text-align: center;
}

.family-portrait {
  position: relative;
  display: grid;
  width: 5.35rem;
  height: clamp(6.2rem, calc(var(--family-scale) * 4.2rem), 7.6rem);
  place-items: end center;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.25);
  border-radius: 2.2rem 2.2rem 1rem 1rem;
  background:
    radial-gradient(circle at 50% 16%, rgba(255, 255, 255, 0.34), transparent 2rem),
    linear-gradient(180deg, rgba(186, 230, 253, 0.28), rgba(30, 41, 59, 0.2));
  box-shadow: 0 1.1rem 2.3rem rgba(15, 23, 42, 0.28);
}

.family-portrait::after {
  position: absolute;
  inset: auto 0 0;
  height: 1.45rem;
  content: "";
  background: linear-gradient(180deg, transparent, rgba(15, 23, 42, 0.52));
  pointer-events: none;
}

.family-sex-marker {
  position: absolute;
  top: 0.58rem;
  right: 0.58rem;
  z-index: 7;
  display: inline-grid;
  width: 1.35rem;
  height: 1.35rem;
  place-items: center;
  border: 1px solid rgba(226, 232, 240, 0.28);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.42);
  color: #e0f2fe;
  font-size: 0.72rem;
  font-weight: 900;
  line-height: 1;
}

.family-bust {
  --skin: #f5c7a9;
  --hair: #6b3f2a;
  --shirt: #38bdf8;
  --shirt-shadow: #1d4ed8;
  position: relative;
  width: calc(var(--family-scale) * 3.15rem);
  min-width: 3.1rem;
  max-width: 4.5rem;
  height: calc(var(--family-scale) * 5.05rem);
  min-height: 5rem;
  max-height: 6.8rem;
  margin-bottom: -0.9rem;
}

.family-bust span {
  position: absolute;
  display: block;
  margin: 0;
  font-size: 0;
  line-height: 0;
}

.family-hair {
  top: -0.08rem;
  left: 50%;
  z-index: 5;
  width: 2.45rem;
  height: 1.05rem;
  border-radius: 55% 55% 34% 34%;
  background: var(--hair);
  box-shadow: inset 0 -0.24rem 0 rgba(15, 23, 42, 0.16);
  transform: translateX(-50%);
}

.family-hair::before,
.family-hair::after {
  position: absolute;
  top: 0.48rem;
  width: 0.42rem;
  height: 0.8rem;
  border-radius: 999px;
  background: var(--hair);
  content: "";
}

.family-hair::before {
  left: 0.03rem;
  transform: rotate(12deg);
}

.family-hair::after {
  right: 0.03rem;
  transform: rotate(-12deg);
}

.family-head {
  top: 0;
  left: 50%;
  z-index: 4;
  width: 2.25rem;
  height: 2.35rem;
  border: 0.2rem solid var(--hair);
  border-radius: 48% 48% 44% 44%;
  background:
    radial-gradient(circle at 35% 46%, #3f1f12 0.07rem, transparent 0.08rem),
    radial-gradient(circle at 65% 46%, #3f1f12 0.07rem, transparent 0.08rem),
    radial-gradient(ellipse at 50% 70%, rgba(127, 29, 29, 0.62) 0.13rem, transparent 0.14rem),
    var(--skin);
  box-shadow: 0 0.32rem 0 var(--hair) inset, 0 0.45rem 0.9rem rgba(15, 23, 42, 0.2);
  transform: translateX(-50%);
}

.family-neck {
  top: 2.1rem;
  left: 50%;
  z-index: 2;
  width: 0.78rem;
  height: 0.85rem;
  border-radius: 0 0 0.35rem 0.35rem;
  background: var(--skin);
  transform: translateX(-50%);
}

.family-torso {
  top: 2.72rem;
  left: 50%;
  z-index: 1;
  width: 3.4rem;
  height: 3.7rem;
  border-radius: 1.55rem 1.55rem 0.7rem 0.7rem;
  background:
    radial-gradient(ellipse at 50% 8%, rgba(255, 255, 255, 0.34), transparent 1rem),
    linear-gradient(180deg, var(--shirt), var(--shirt-shadow));
  box-shadow: inset 0 0.24rem 0 rgba(255, 255, 255, 0.18), 0 1rem 1.8rem rgba(15, 23, 42, 0.24);
  transform: translateX(-50%);
}

.family-shoulder {
  top: 3.2rem;
  z-index: 0;
  width: 1.2rem;
  height: 2.55rem;
  border-radius: 999px;
  background: linear-gradient(180deg, var(--shirt), var(--shirt-shadow));
}

.family-shoulder-left {
  left: calc(50% - 2.35rem);
  transform: rotate(16deg);
}

.family-shoulder-right {
  right: calc(50% - 2.35rem);
  transform: rotate(-16deg);
}

.family-female .family-bust {
  --hair: #7c2d12;
  --shirt: #fb7185;
  --shirt-shadow: #be185d;
}

.family-male .family-bust {
  --hair: #3f2a1d;
  --shirt: #60a5fa;
  --shirt-shadow: #1d4ed8;
}

.family-female .family-hair {
  top: -0.1rem;
  z-index: 3;
  width: 2.72rem;
  height: 3.25rem;
  border-radius: 1.3rem 1.3rem 1.05rem 1.05rem;
  box-shadow: inset 0 -0.42rem 0 rgba(15, 23, 42, 0.14), 0 0.35rem 0.55rem rgba(15, 23, 42, 0.12);
}

.family-female .family-hair::before,
.family-female .family-hair::after {
  top: 0.58rem;
  width: 0.7rem;
  height: 2.55rem;
  border-radius: 999px 999px 0.75rem 0.75rem;
}

.family-female .family-hair::before {
  left: -0.05rem;
  transform: rotate(6deg);
}

.family-female .family-hair::after {
  right: -0.05rem;
  transform: rotate(-6deg);
}

.family-female .family-head {
  border-width: 0.14rem;
  box-shadow: 0 0.22rem 0 rgba(124, 45, 18, 0.8) inset, 0 0.45rem 0.9rem rgba(15, 23, 42, 0.2);
}

.family-male .family-hair {
  height: 0.92rem;
  border-radius: 52% 52% 28% 28%;
}

.family-male .family-hair::before,
.family-male .family-hair::after {
  height: 0.55rem;
}

.family-unknown .family-hair {
  width: 2.36rem;
  height: 0.78rem;
  opacity: 0.92;
}

.family-unknown .family-bust {
  --hair: #475569;
  --shirt: #a78bfa;
  --shirt-shadow: #6d28d9;
}

.family-child .family-bust {
  --skin: #f8d7bd;
  --shirt: #facc15;
  --shirt-shadow: #f97316;
}

.family-greatgrand .family-bust,
.family-grandparent .family-bust {
  --hair: #cbd5e1;
  --shirt: #94a3b8;
  --shirt-shadow: #475569;
}

.family-self .family-portrait {
  border-color: rgba(125, 211, 252, 0.6);
  background:
    radial-gradient(circle at 50% 16%, rgba(255, 255, 255, 0.42), transparent 2rem),
    linear-gradient(180deg, rgba(125, 211, 252, 0.36), rgba(14, 165, 233, 0.12));
  box-shadow: 0 1.1rem 2.6rem rgba(14, 165, 233, 0.28);
}

.family-self .family-bust {
  --shirt: #22d3ee;
  --shirt-shadow: #0284c7;
}

.family-member-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 1.25rem;
  padding: 0.12rem 0.45rem;
  border: 1px solid rgba(125, 211, 252, 0.45);
  border-radius: 999px;
  background: rgba(14, 165, 233, 0.16);
  color: #bae6fd;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.family-tree {
  display: grid;
  gap: 0.65rem;
  margin-top: 1rem;
  padding: 1rem;
  overflow-x: auto;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 1.2rem;
  background: rgba(15, 23, 42, 0.2);
}

.family-tree-row {
  position: relative;
  display: flex;
  min-width: max-content;
  justify-content: center;
  gap: 0.65rem;
  padding-bottom: 0.3rem;
}

.family-tree-row:not(:last-child)::after {
  position: absolute;
  bottom: -0.44rem;
  left: 50%;
  width: 1px;
  height: 0.55rem;
  content: "";
  background: rgba(125, 211, 252, 0.38);
}

.family-tree-node {
  min-width: 7.2rem;
  padding: 0.45rem 0.65rem;
  border: 1px solid rgba(226, 232, 240, 0.18);
  border-radius: 0.9rem;
  background: rgba(15, 23, 42, 0.44);
  color: #e0f2fe;
  text-align: center;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.07);
}

.family-tree-node.family-tree-self {
  border-color: rgba(125, 211, 252, 0.58);
  background: rgba(14, 165, 233, 0.2);
}

.family-tree-node strong,
.family-tree-node small {
  display: block;
}

.family-tree-node strong {
  color: #f8fbff;
  font-size: 0.8rem;
}

.family-tree-node small {
  margin-top: 0.18rem;
  color: #c7d2fe;
  font-size: 0.68rem;
}

.family-member strong {
  max-width: 8rem;
  overflow: hidden;
  color: #f8fbff;
  font-size: 0.84rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.family-member small {
  max-width: 8rem;
  color: #c7d2fe;
  font-size: 0.72rem;
  line-height: 1.25;
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

const getPortraitScale = (member) => {
  const height = calculateFamilyHeight(member.role, member.age, member.sex);
  return Math.min(1.35, Math.max(0.9, height / 170));
};

const getPlayerMember = (currentAge, character) => {
  const sex = normalizeCharacterSex(character?.sex);

  return {
    id: "player",
    name: String(character?.name ?? "").trim() || "You",
    role: "self",
    groupLabel: "You",
    sex,
    age: Number.isFinite(Number(currentAge)) ? Number(currentAge) : null,
    ageLabel: Number.isFinite(Number(currentAge)) ? `${Math.floor(Number(currentAge))}y` : "age ?",
    symbol: sex === "male" ? "♂" : sex === "female" ? "♀" : "•",
    isPlayer: true
  };
};

const treeRows = [
  { id: "greatgrand", label: "Great-grandparents", roles: ["greatgrand"] },
  { id: "grandparent", label: "Grandparents", roles: ["grandparent"] },
  { id: "household", label: "You + partner", roles: ["self", "parent"] },
  { id: "child", label: "Kids", roles: ["child"] }
];

const getFamilyTreeRows = (members) =>
  treeRows
    .map((row) => ({
      ...row,
      members: members.filter((member) => row.roles.includes(member.role))
    }))
    .filter((row) => row.members.length > 0);

export default function FamilyPhoto({ family, currentAge, currentMonth, character }) {
  const familyMembers = getFamilyMembers(family, currentAge, currentMonth);
  const members = [getPlayerMember(currentAge, character), ...familyMembers];
  const familyTreeRows = getFamilyTreeRows(members);
  useFamilyPhotoStyles();

  return (
    <section className="panel family-stage-card" aria-label="Family view">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Family view</p>
          <h2>Your family photo grows with the seasons</h2>
        </div>
        <span>{members.length} shown · includes you</span>
      </div>
      <div className="family-stage" role="list" aria-label="Family photo portraits">
        {members.map((member) => (
          <article className={`family-member family-${member.role} family-${member.sex}`} key={member.id} role="listitem">
            <div
              className="family-portrait"
              style={{ "--family-scale": getPortraitScale(member) }}
              aria-hidden="true"
            >
              <span className="family-sex-marker">{member.symbol}</span>
              <div className="family-bust">
                <span className="family-hair" />
                <span className="family-head" />
                <span className="family-neck" />
                <span className="family-torso" />
                <span className="family-shoulder family-shoulder-left" />
                <span className="family-shoulder family-shoulder-right" />
              </div>
            </div>
            {member.isPlayer ? <span className="family-member-badge">Me</span> : null}
            <strong>{member.name}</strong>
            <small>{member.groupLabel} · {member.ageLabel}</small>
          </article>
        ))}
      </div>
      <div className="family-tree" aria-label="Family tree">
        {familyTreeRows.map((row) => (
          <div className="family-tree-row" key={row.id} aria-label={row.label}>
            {row.members.map((member) => (
              <div className={`family-tree-node ${member.isPlayer ? "family-tree-self" : ""}`} key={member.id}>
                <strong>{member.isPlayer ? "Me" : member.name}</strong>
                <small>{member.groupLabel} · {member.ageLabel}</small>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
