const winter = {
  id: "winter",
  label: "Winter",
  headline: "Winter quiets the map",
  subheadline: "The world cools, snow gathers, and reflection takes the lead.",
  palette: {
    skyTop: "#1a2634",
    skyBot: "#3b4d61",
    ground: "#e2e8f0",
    grass: "#cbd5e1"
  },
  particles: {
    from: { color: [217, 119, 6], shape: "leaf" },
    to: { color: [255, 255, 255], shape: "snow" }
  },
  flora: {
    count: 24,
    stem: "#94a3b8",
    core: "#e0f2fe",
    petals: ["#e0f2fe", "#bfdbfe", "#f8fafc", "#c4b5fd"],
    maxHeight: [14, 34]
  },
  accents: ["❄️", "☃️", "🧣"]
};

export default winter;
