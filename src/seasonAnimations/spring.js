const spring = {
  id: "spring",
  label: "Spring",
  headline: "Spring arrives",
  subheadline: "Snow melts into blossoms and fresh momentum.",
  palette: {
    skyTop: "#a1c4fd",
    skyBot: "#c2e9fb",
    ground: "#557a46",
    grass: "#7a9d54"
  },
  particles: {
    from: { color: [255, 255, 255], shape: "snow" },
    to: { color: [255, 183, 178], shape: "petal" }
  },
  flora: {
    count: 32,
    stem: "#4a6b3c",
    core: "#ffee93",
    petals: ["#ffb7b2", "#ffdac1", "#e2f0cb", "#b5ead7", "#ff9aa2"],
    maxHeight: [30, 74]
  },
  accents: ["🌸", "🌷", "🌱"]
};

export default spring;
