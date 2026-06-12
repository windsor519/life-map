const fall = {
  id: "fall",
  label: "Fall",
  headline: "Fall settles in",
  subheadline: "Warm winds scatter leaves while routines find their rhythm.",
  palette: {
    skyTop: "#f59e0b",
    skyBot: "#fed7aa",
    ground: "#7c2d12",
    grass: "#b45309"
  },
  particles: {
    from: { color: [253, 224, 71], shape: "firefly" },
    to: { color: [217, 119, 6], shape: "leaf" }
  },
  flora: {
    count: 30,
    stem: "#78350f",
    core: "#92400e",
    petals: ["#f97316", "#dc2626", "#f59e0b", "#a16207"],
    maxHeight: [26, 58]
  },
  accents: ["🍂", "🍁", "🌾"]
};

export default fall;
