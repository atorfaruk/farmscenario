
export const crops = [
  // Grains
  { name: "Maize", type: "grain", emoji: "🌽" },
  { name: "Rice", type: "grain", emoji: "🌾" },
  { name: "Wheat", type: "grain", emoji: "🌾" },
  { name: "Sorghum", type: "grain", emoji: "🌾" },
  { name: "Millet", type: "grain", emoji: "🌾" },
  { name: "Barley", type: "grain", emoji: "🌾" },
  { name: "Oats", type: "grain", emoji: "🌾" },

  // Vegetables
  { name: "Tomato", type: "vegetable", emoji: "🍅" },
  { name: "Carrot", type: "vegetable", emoji: "🥕" },
  { name: "Onion", type: "vegetable", emoji: "🧅" },
  { name: "Potato", type: "vegetable", emoji: "🥔" },
  { name: "Sweet Potato", type: "vegetable", emoji: "🍠" },
  { name: "Pepper", type: "vegetable", emoji: "🌶️" },
  { name: "Cucumber", type: "vegetable", emoji: "🥒" },
  { name: "Cabbage", type: "vegetable", emoji: "🥬" },
  { name: "Spinach", type: "vegetable", emoji: "🥬" },
  { name: "Lettuce", type: "vegetable", emoji: "🥬" },
  { name: "Okra", type: "vegetable", emoji: "🌱" },

  // Fruits
  { name: "Mango", type: "fruit", emoji: "🥭" },
  { name: "Banana", type: "fruit", emoji: "🍌" },
  { name: "Orange", type: "fruit", emoji: "🍊" },
  { name: "Watermelon", type: "fruit", emoji: "🍉" },
  { name: "Pineapple", type: "fruit", emoji: "🍍" },
  { name: "Papaya", type: "fruit", emoji: "🍈" },
  { name: "Guava", type: "fruit", emoji: "🍈" },
  { name: "Apple", type: "fruit", emoji: "🍎" },
  { name: "Lemon", type: "fruit", emoji: "🍋" },
  { name: "Coconut", type: "fruit", emoji: "🥥" },
  { name: "Grape", type: "fruit", emoji: "🍇" },
  { name: "Strawberry", type: "fruit", emoji: "🍓" },

  // Legumes
  { name: "Beans", type: "legume", emoji: "🫘" },
  { name: "Groundnut", type: "legume", emoji: "🥜" },
  { name: "Soybean", type: "legume", emoji: "🫘" },
  { name: "Pea", type: "legume", emoji: "🫛" },
  { name: "Cowpea", type: "legume", emoji: "🫘" },

  // Root and cash crops
  { name: "Cassava", type: "root", emoji: "🌱" },
  { name: "Yam", type: "root", emoji: "🍠" },
  { name: "Ginger", type: "root", emoji: "🌿" },
  { name: "Turmeric", type: "root", emoji: "🌿" },
  { name: "Sugarcane", type: "cash", emoji: "🎋" },
  { name: "Cotton", type: "cash", emoji: "☁️" },
  { name: "Cocoa", type: "cash", emoji: "🌱" },
  { name: "Coffee", type: "cash", emoji: "☕" },
  { name: "Sesame", type: "cash", emoji: "🌿" },
  { name: "Sunflower", type: "cash", emoji: "🌻" },
  { name: "Tobacco", type: "cash", emoji: "🌿" }
];

export const cropRequirements = {
  Maize: {
    waterNeed: "Medium",
    suitableSoils: ["Loamy", "Sandy", "Silt"],
    growthPeriod: "125–180 days (indicative)"
  },
  Rice: {
    waterNeed: "High",
    suitableSoils: ["Clay", "Silt"],
    growthPeriod: "90–150 days (indicative)"
  },
  Wheat: {
    waterNeed: "Medium",
    suitableSoils: ["Loamy", "Silt"],
    growthPeriod: "120–150 days (indicative)"
  },
  Sorghum: {
    waterNeed: "Low to Medium",
    suitableSoils: ["Loamy", "Sandy"],
    growthPeriod: "90–150 days (variety-dependent)"
  },
  Millet: {
    waterNeed: "Low",
    suitableSoils: ["Sandy", "Loamy"],
    growthPeriod: "75–120 days (variety-dependent)"
  },
  Barley: {
    waterNeed: "Medium",
    suitableSoils: ["Loamy", "Silt"],
    growthPeriod: "90–120 days (indicative)"
  },
  Oats: {
    waterNeed: "Medium",
    suitableSoils: ["Loamy", "Silt"],
    growthPeriod: "90–120 days (indicative)"
  },
  Tomato: {
    waterNeed: "Medium",
    suitableSoils: ["Loamy", "Silt"],
    growthPeriod: "Crop cycle varies by variety"
  },
  Carrot: {
    waterNeed: "Medium",
    suitableSoils: ["Sandy", "Loamy"],
    growthPeriod: "70–120 days (indicative)"
  },
  Onion: {
    waterNeed: "Medium",
    suitableSoils: ["Loamy", "Silt"],
    growthPeriod: "90–150 days (indicative)"
  },
  Potato: {
    waterNeed: "Medium",
    suitableSoils: ["Sandy", "Loamy"],
    growthPeriod: "70–120 days (indicative)"
  },
  "Sweet Potato": {
    waterNeed: "Low to Medium",
    suitableSoils: ["Sandy", "Loamy"],
    growthPeriod: "90–150 days (indicative)"
  },
  Pepper: {
    waterNeed: "Medium",
    suitableSoils: ["Loamy", "Silt"],
    growthPeriod: "Variety-dependent"
  },
  Cucumber: {
    waterNeed: "Medium to High",
    suitableSoils: ["Sandy", "Loamy"],
    growthPeriod: "50–70 days (indicative)"
  },
  Cabbage: {
    waterNeed: "Medium to High",
    suitableSoils: ["Loamy", "Silt"],
    growthPeriod: "70–120 days (indicative)"
  },
  Spinach: {
    waterNeed: "Medium",
    suitableSoils: ["Loamy", "Silt"],
    growthPeriod: "30–60 days (indicative)"
  },
  Lettuce: {
    waterNeed: "Medium",
    suitableSoils: ["Loamy", "Silt"],
    growthPeriod: "45–90 days (indicative)"
  },
  Okra: {
    waterNeed: "Low to Medium",
    suitableSoils: ["Loamy", "Sandy"],
    growthPeriod: "50–70 days to first harvest (indicative)"
  },
  Groundnut: {
    waterNeed: "Medium",
    suitableSoils: ["Sandy", "Loamy"],
    growthPeriod: "130–140 days (indicative)"
  },
  Soybean: {
    waterNeed: "Medium",
    suitableSoils: ["Loamy", "Clay"],
    growthPeriod: "135–150 days (indicative)"
  },
  Cowpea: {
    waterNeed: "Low to Medium",
    suitableSoils: ["Sandy", "Loamy"],
    growthPeriod: "60–100 days (variety-dependent)"
  },
  Beans: {
    waterNeed: "Medium",
    suitableSoils: ["Loamy", "Sandy"],
    growthPeriod: "60–100 days (variety-dependent)"
  },
  Pea: {
    waterNeed: "Medium",
    suitableSoils: ["Loamy", "Silt"],
    growthPeriod: "60–90 days (indicative)"
  },
  Cassava: {
    waterNeed: "Low to Medium",
    suitableSoils: ["Sandy", "Loamy"],
    growthPeriod: "8–18 months (variety-dependent)"
  },
  Yam: {
    waterNeed: "Medium",
    suitableSoils: ["Loamy", "Sandy"],
    growthPeriod: "6–10 months (variety-dependent)"
  },
  Ginger: {
    waterNeed: "Medium to High",
    suitableSoils: ["Loamy", "Sandy"],
    growthPeriod: "8–10 months (indicative)"
  },
  Turmeric: {
    waterNeed: "Medium to High",
    suitableSoils: ["Loamy", "Sandy"],
    growthPeriod: "7–10 months (indicative)"
  },
  Sugarcane: {
    waterNeed: "High",
    suitableSoils: ["Loamy", "Silt"],
    growthPeriod: "10–18 months (climate-dependent)"
  },
  Sesame: {
    waterNeed: "Low",
    suitableSoils: ["Sandy", "Loamy"],
    growthPeriod: "90–120 days (indicative)"
  },
  Sunflower: {
    waterNeed: "Medium",
    suitableSoils: ["Loamy", "Silt"],
    growthPeriod: "80–120 days (indicative)"
  },
  Watermelon: {
    waterNeed: "Medium",
    suitableSoils: ["Sandy", "Loamy"],
    growthPeriod: "70–100 days (indicative)"
  },
  Pineapple: {
    waterNeed: "Medium",
    suitableSoils: ["Loamy", "Sandy"],
    growthPeriod: "12–24 months (climate-dependent)"
  },
  Papaya: {
    waterNeed: "Medium",
    suitableSoils: ["Loamy", "Sandy"],
    growthPeriod: "6–12 months to first fruit (indicative)"
  },
  Banana: {
    waterNeed: "High",
    suitableSoils: ["Loamy", "Silt"],
    growthPeriod: "9–18 months to first harvest (indicative)"
  },
  Mango: {
    waterNeed: "Medium",
    suitableSoils: ["Loamy", "Sandy"],
    growthPeriod: "Several years from seed; grafted trees fruit sooner"
  },
 
  Orange: {
    waterNeed: "Medium (general estimate)",
    suitableSoils: ["Loamy", "Sandy"],
    growthPeriod: "Several years to fruit; depends on planting material"
  },
  Guava: {
    waterNeed: "Needs local verification",
    suitableSoils: [],
    growthPeriod: "Variety and planting-material dependent"
  },
  Apple: {
    waterNeed: "Needs local verification",
    suitableSoils: [],
    growthPeriod: "Variety and climate dependent"
  },
  Lemon: {
    waterNeed: "Needs local verification",
    suitableSoils: [],
    growthPeriod: "Variety and planting-material dependent"
  },
  Coconut: {
    waterNeed: "Needs local verification",
    suitableSoils: [],
    growthPeriod: "Several years to first harvest; site dependent"
  },
  Grape: {
    waterNeed: "Needs local verification",
    suitableSoils: [],
    growthPeriod: "Variety and climate dependent"
  },
  Strawberry: {
    waterNeed: "Needs local verification",
    suitableSoils: [],
    growthPeriod: "Variety and growing system dependent"
  },
  Cotton: {
    waterNeed: "700–1300 mm per growing period (FAO estimate)",
    suitableSoils: [],
    growthPeriod: "180–195 days (FAO indicative range)"
  },
  Cocoa: {
    waterNeed: "Needs local verification",
    suitableSoils: [],
    growthPeriod: "Perennial; first harvest depends on planting material"
  },
  Coffee: {
    waterNeed: "Needs local verification",
    suitableSoils: [],
    growthPeriod: "Perennial; first harvest depends on species and variety"
  },
  Tobacco: {
    waterNeed: "Needs local verification",
    suitableSoils: [],
    growthPeriod: "130–160 days (FAO indicative range)"
  }
};
