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

const getPortraitScale = (member) => {
  const height = calculateFamilyHeight(member.role, member.age, member.sex);
  return Math.min(1.35, Math.max(0.9, height / 170));
};

export default function FamilyPhoto({ family, currentAge, currentMonth }) {
  const members = getFamilyMembers(family, currentAge, currentMonth);
  useFamilyPhotoStyles();

  if (members.length === 0) {
    return null;
  }

  return (
    <section className="panel family-stage-card" aria-label="Family view">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Family view</p>
          <h2>Your family photo grows with the seasons</h2>
        </div>
        <span>{members.length} shown</span>
      </div>
      <div className="family-stage" role="list" aria-label="Family photo portraits">
        {members.map((member) => (
          <article className={`family-member family-${member.role} family-${member.sex}`} key={member.id} role="listitem">
            <div
              className="family-portrait"
              style={{ "--family-scale": getPortraitScale(member) }}
              aria-hidden="true"
            >
              <div className="family-bust">
                <span className="family-head" />
                <span className="family-neck" />
                <span className="family-torso" />
                <span className="family-shoulder family-shoulder-left" />
                <span className="family-shoulder family-shoulder-right" />
              </div>
            </div>
            <strong>{member.name}</strong>
            <small>{member.groupLabel} · {member.ageLabel}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
