export const createEmptyFamily = () => ({
  grandparents: "",
  grandparentsAges: "",
  grandparentsSexes: "",
  greatGrandparents: "",
  greatGrandparentsAges: "",
  greatGrandparentsSexes: "",
  spouse: "",
  spouseAge: "",
  spouseSex: "",
  kids: "",
  kidsAges: "",
  kidsSexes: "",
  startAge: null,
  startMonth: 1
});

export const familyFields = {
  grandparents: { label: "Grandparents", ageKey: "grandparentsAges", sexKey: "grandparentsSexes", role: "grandparent", max: 4 },
  greatGrandparents: { label: "Great-grandparents", ageKey: "greatGrandparentsAges", sexKey: "greatGrandparentsSexes", role: "greatgrand", max: 4 },
  spouse: { label: "Spouse / partner", ageKey: "spouseAge", sexKey: "spouseSex", role: "parent", max: 1 },
  kids: { label: "Kids", ageKey: "kidsAges", sexKey: "kidsSexes", role: "child", max: 6 }
};

export const splitFamilyNames = (value) =>
  String(value ?? "")
    .split(/[\n,]+/)
    .map((name) => name.trim())
    .filter(Boolean);

const parseAge = (value) => {
  const age = Number.parseFloat(value);
  return Number.isFinite(age) ? Math.max(0, age) : null;
};

const normalizeSex = (value) => {
  const sex = String(value ?? "").trim().toLowerCase();
  if (["m", "male", "man", "boy", "son", "dad", "grandpa"].includes(sex)) return "male";
  if (["f", "female", "woman", "girl", "daughter", "mom", "grandma"].includes(sex)) return "female";
  return "unknown";
};

export const countFamilyNames = (value) => splitFamilyNames(value).length;

export const normalizeFamily = (family) => ({
  ...createEmptyFamily(),
  ...(family && typeof family === "object" ? family : {})
});

const formatAge = (age) => {
  if (!Number.isFinite(age)) return "age ?";
  return age < 18 ? `${age.toFixed(1).replace(/\.0$/, "")}y` : `${Math.floor(age)}y`;
};

export const getFamilySummary = (family) => {
  const normalizedFamily = normalizeFamily(family);
  const entries = Object.entries(familyFields)
    .map(([key, field]) => {
      const names = splitFamilyNames(normalizedFamily[key]).slice(0, field.max);
      const ages = splitFamilyNames(normalizedFamily[field.ageKey]);
      const sexes = splitFamilyNames(normalizedFamily[field.sexKey]);
      const people = names.map((name, index) => {
        const age = ages[index] ? ` (${ages[index]})` : "";
        const sex = normalizeSex(sexes[index]);
        const symbol = sex === "male" ? " ♂" : sex === "female" ? " ♀" : "";
        return `${name}${age}${symbol}`;
      });
      return people.length ? `${field.label}: ${people.join(", ")}` : null;
    })
    .filter(Boolean);

  return entries.length ? entries.join(" · ") : "No family entered yet";
};

export const getFamilyElapsedYears = (family, currentAge, currentMonth) => {
  const normalizedFamily = normalizeFamily(family);
  const startAge = Number(normalizedFamily.startAge);
  const startMonth = Number(normalizedFamily.startMonth) || 1;

  if (!Number.isFinite(startAge)) return 0;

  const seasonMonthsPassed = (Number(currentMonth) || 1) - startMonth;
  return Math.max(0, (Number(currentAge) || startAge) - startAge + seasonMonthsPassed / 12);
};

export const getFamilyMembers = (family, currentAge, currentMonth) => {
  const normalizedFamily = normalizeFamily(family);
  const elapsedYears = getFamilyElapsedYears(normalizedFamily, currentAge, currentMonth);

  return Object.entries(familyFields).flatMap(([key, field]) => {
    const names = splitFamilyNames(normalizedFamily[key]).slice(0, field.max);
    const ages = splitFamilyNames(normalizedFamily[field.ageKey]);
    const sexes = splitFamilyNames(normalizedFamily[field.sexKey]);

    return names.map((name, index) => {
      const baseAge = parseAge(ages[index]);
      const sex = normalizeSex(sexes[index]);
      const age = baseAge === null ? null : baseAge + elapsedYears;

      return {
        id: `${key}-${index}`,
        name,
        role: field.role,
        groupLabel: field.label,
        sex,
        age,
        ageLabel: formatAge(age),
        symbol: sex === "male" ? "♂" : sex === "female" ? "♀" : "•"
      };
    });
  });
};

export const calculateFamilyHeight = (role, age, sex = "unknown") => {
  const safeAge = Number.isFinite(age) ? age : role === "child" ? 8 : 40;
  const adultOffset = sex === "female" ? -10 : sex === "male" ? 7 : 0;

  if (role === "child") {
    const adultCap = sex === "female" ? 194 : sex === "male" ? 212 : 202;
    return Math.min(34 + safeAge * (sex === "female" ? 8.2 : 8.9), adultCap);
  }

  if (role === "grandparent") {
    return Math.max(144, 205 + adultOffset - Math.max(0, safeAge - 55) * 0.55);
  }

  if (role === "greatgrand") {
    return Math.max(128, 190 + adultOffset - Math.max(0, safeAge - 75) * 0.8);
  }

  return 212 + adultOffset;
};
