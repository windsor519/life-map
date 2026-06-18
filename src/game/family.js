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

const joinMemberField = (members, field) =>
  members
    .map((member) => String(member?.[field] ?? "").trim())
    .join("\n");

const normalizeFamilyGroup = (family, groupKey, field) => {
  const groupValue = family?.[groupKey];

  if (!Array.isArray(groupValue)) {
    return {};
  }

  return {
    [groupKey]: joinMemberField(groupValue, "name"),
    [field.ageKey]: joinMemberField(groupValue, "age"),
    [field.sexKey]: joinMemberField(groupValue, "sex")
  };
};

const normalizeSpouse = (family) => {
  if (!family?.spouse || typeof family.spouse !== "object" || Array.isArray(family.spouse)) {
    return {};
  }

  return {
    spouse: String(family.spouse.name ?? "").trim(),
    spouseAge: String(family.spouse.age ?? "").trim(),
    spouseSex: String(family.spouse.sex ?? "").trim()
  };
};

export const normalizeFamily = (family) => {
  const familyObject = family && typeof family === "object" ? family : {};

  return {
    ...createEmptyFamily(),
    ...familyObject,
    ...Object.entries(familyFields).reduce(
      (normalizedGroups, [groupKey, field]) => ({
        ...normalizedGroups,
        ...normalizeFamilyGroup(familyObject, groupKey, field)
      }),
      {}
    ),
    ...normalizeSpouse(familyObject)
  };
};

const formatAge = (age) => {
  if (!Number.isFinite(age)) return "age ?";
  return `${Math.max(0, Math.floor(age))}y`;
};

const getFamilyPersonCount = (names, ages, sexes, max) => Math.min(max, Math.max(names.length, ages.length, sexes.length));

const getFallbackFamilyName = (field, index) => {
  if (field.role === "child") return `Kid ${index + 1}`;
  if (field.role === "parent") return "Spouse / partner";
  return `${field.label.replace(/s$/, "")} ${index + 1}`;
};

const getFamilyPeople = (normalizedFamily, key, field) => {
  const names = splitFamilyNames(normalizedFamily[key]);
  const ages = splitFamilyNames(normalizedFamily[field.ageKey]);
  const sexes = splitFamilyNames(normalizedFamily[field.sexKey]);
  const personCount = getFamilyPersonCount(names, ages, sexes, field.max);

  return Array.from({ length: personCount }, (_, index) => ({
    name: names[index] || getFallbackFamilyName(field, index),
    ageValue: ages[index] ?? "",
    sexValue: sexes[index] ?? ""
  }));
};

export const getFamilySummary = (family, { includeAges = true } = {}) => {
  const normalizedFamily = normalizeFamily(family);
  const entries = Object.entries(familyFields)
    .map(([key, field]) => {
      const people = getFamilyPeople(normalizedFamily, key, field).map((person) => {
        const age = includeAges && person.ageValue ? ` (${person.ageValue})` : "";
        const sex = normalizeSex(person.sexValue);
        const symbol = sex === "male" ? " ♂" : sex === "female" ? " ♀" : "";
        return `${person.name}${age}${symbol}`;
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

  return Object.entries(familyFields).flatMap(([key, field]) =>
    getFamilyPeople(normalizedFamily, key, field).map((person, index) => {
      const baseAge = parseAge(person.ageValue);
      const sex = normalizeSex(person.sexValue);
      const age = baseAge === null ? null : baseAge + elapsedYears;

      return {
        id: `${key}-${index}`,
        name: person.name,
        role: field.role,
        groupLabel: field.label,
        sex,
        age,
        ageLabel: formatAge(age),
        symbol: sex === "male" ? "♂" : sex === "female" ? "♀" : "•"
      };
    })
  );
};

const setGroupFieldValues = (family, field, indexToRemove) => {
  const names = splitFamilyNames(family[field.groupKey]);
  const ages = splitFamilyNames(family[field.ageKey]);
  const sexes = splitFamilyNames(family[field.sexKey]);
  const personCount = getFamilyPersonCount(names, ages, sexes, field.max);
  const keepIndexes = Array.from({ length: personCount }, (_, index) => index).filter((index) => index !== indexToRemove);

  return {
    [field.groupKey]: keepIndexes.map((index) => names[index]).filter(Boolean).join("\n"),
    [field.ageKey]: keepIndexes.map((index) => ages[index]).filter(Boolean).join("\n"),
    [field.sexKey]: keepIndexes.map((index) => sexes[index]).filter(Boolean).join("\n")
  };
};

export const removeFamilyMember = (family, memberId) => {
  const normalizedFamily = normalizeFamily(family);
  const [groupKey, rawIndex] = String(memberId ?? "").split("-");
  const field = familyFields[groupKey];
  const indexToRemove = Number(rawIndex);

  if (!field || !Number.isInteger(indexToRemove) || indexToRemove < 0) {
    return normalizedFamily;
  }

  if (groupKey === "spouse") {
    return {
      ...normalizedFamily,
      spouse: "",
      spouseAge: "",
      spouseSex: ""
    };
  }

  return {
    ...normalizedFamily,
    ...setGroupFieldValues(normalizedFamily, { ...field, groupKey }, indexToRemove)
  };
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
