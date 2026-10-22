
import { cropRequirements, crops } from "./crops";

export function askFarmAgent(question, context = {}) {
  const q = question.toLowerCase().trim();

  const cropNames = crops.map((crop) => crop.name);
  const requestedCrop = cropNames.find((name) =>
    q.includes(name.toLowerCase())
  );

  let action = null;
  let scenario = context.scenario || "Normal";

  if (
    q.includes("drought") ||
    q.includes("dry weather") ||
    q.includes("water shortage")
  ) {
    scenario = "Drought";
    action = "scenario";
  } else if (
    q.includes("irrigation") ||
    q.includes("water the farm") ||
    q.includes("activate watering")
  ) {
    scenario = "Drought + Irrigation";
    action = "scenario";
  } else if (
    q.includes("normal conditions") ||
    q.includes("normal weather") ||
    q.includes("reset farm")
  ) {
    scenario = "Normal";
    action = "scenario";
  }

  const crop = requestedCrop || context.selectedCrop || "Maize";
  const soil = context.soilType || "Sandy";
  const cropData = cropRequirements[crop];

  if (action || requestedCrop) {
    let response = `FarmScenario updated its simulation request for ${crop}.`;

    if (action === "scenario") {
      response += ` Scenario: ${scenario}.`;
    }

    if (cropData) {
      response += ` Water need: ${cropData.waterNeed}. Growth period: ${cropData.growthPeriod}.`;
    } else {
      response += " Detailed crop requirements need further verification.";
    }

    return {
      message: response,
      selectedCrop: crop,
      scenario,
      action: action || "crop",
    };
  }

  if (q.includes("soil")) {
    if (!cropData || !cropData.suitableSoils?.length) {
      return {
        message: `Insufficient verified soil data for ${crop}. Please consult local agricultural guidance.`,
      };
    }

    const suitable = cropData.suitableSoils.includes(soil);

    return {
      message: suitable
        ? `${crop} is listed as suitable for ${soil} soil in the current database.`
        : `${crop} is not listed as suitable for ${soil} soil in the current database. Confirm local conditions before planting.`,
    };
  }

  if (q.includes("water") || q.includes("rain")) {
    return {
      message: cropData
        ? `${crop} has a ${cropData.waterNeed.toLowerCase()} water requirement. Actual needs depend on climate, soil and growing conditions.`
        : `Water requirements for ${crop} need further verification.`,
    };
  }

  if (q.includes("grow") || q.includes("growth") || q.includes("harvest")) {
    return {
      message: cropData
        ? `${crop} has an estimated growth period of ${cropData.growthPeriod}. Timing varies by variety and local conditions.`
        : `Growth information for ${crop} is not yet verified.`,
    };
  }

  if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
    return {
      message: "Hello farmer 🌱🤖 Tell me which crop to select or ask me to simulate drought, irrigation or normal conditions.",
    };
  }

  return {
    message: `I can help with crop selection, soil information, water needs, drought and irrigation scenarios. Try "Simulate drought on my rice farm".`,
  };
}
