import fall from "./fall.js";
import spring from "./spring.js";
import summer from "./summer.js";
import winter from "./winter.js";

export const seasonAnimations = {
  spring,
  summer,
  fall,
  winter
};

export const getSeasonAnimation = (seasonId) => seasonAnimations[seasonId] ?? spring;
