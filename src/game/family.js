export const createEmptyFamily = () => ({
  grandparents: "",
  grandparentsAges: "",
  greatGrandparents: "",
  greatGrandparentsAges: "",
  spouse: "",
  spouseAge: "",
  kids: "",
  kidsAges: ""
});

export const familyFields = {
  grandparents: { label: "Grandparents", ageKey: "grandparentsAges" },
  greatGrandparents: { label: "Great-grandparents", ageKey: "greatGrandparentsAges" },
  spouse: { label: "Spouse / partner", ageKey: "spouseAge" },
  kids: { label: "Kids", ageKey: "kidsAges" }
};

export const splitFamilyNames = (value) =>
  String(value ?? "")
    .split(/[\n,]+/)
    .map((name) => name.trim())
    .filter(Boolean);

export const countFamilyNames = (value) => splitFamilyNames(value).length;

export const normalizeFamily = (family) => ({
  ...createEmptyFamily(),
  ...(family && typeof family === "object" ? family : {})
});

export const getFamilySummary = (family) => {
  const normalizedFamily = normalizeFamily(family);
  const entries = Object.entries(familyFields)
    .map(([key, field]) => {
      const names = splitFamilyNames(normalizedFamily[key]);
      const ages = splitFamilyNames(normalizedFamily[field.ageKey]);
      const people = names.map((name, index) => ages[index] ? `${name} (${ages[index]})` : name);
      return people.length ? `${field.label}: ${people.join(", ")}` : null;
    })
    .filter(Boolean);

  return entries.length ? entries.join(" · ") : "No family entered yet";
};
