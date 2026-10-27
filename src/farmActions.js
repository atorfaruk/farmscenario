import { crops } from "./crops.js";

const soilTypes = ["Sandy", "Clay", "Loamy", "Silt"];
export const supportedCropNames = crops.map((crop) => crop.name);
export const farmActionSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    selectedCrop: { type: "string", enum: supportedCropNames },
    plantCount: { type: "integer", minimum: 1, maximum: 12 },
    soilType: { type: "string", enum: soilTypes },
    waterAvailability: {
      anyOf: [
        { type: "integer", minimum: 0, maximum: 100 },
        { type: "string", pattern: "^(100|[1-9]?\\d)%?$" },
      ],
    },
    scenario: { type: "string", enum: ["Normal", "Drought"] },
    irrigationActive: { type: "boolean" },
  },
};
const actionKeys = new Set(Object.keys(farmActionSchema.properties));

const normalizedCropNames = new Map(
  crops.map((crop) => [normalizeIdentifier(crop.name), crop.name])
);

function normalizeIdentifier(value) {
  return typeof value === "string"
    ? value.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ")
    : "";
}

export function normalizeFarmActions(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const actions = {};

  for (const [key, actionValue] of Object.entries(value)) {
    if (!actionKeys.has(key)) continue;

    if (key === "selectedCrop") {
      const crop = normalizedCropNames.get(normalizeIdentifier(actionValue));
      if (crop) actions.selectedCrop = crop;
      continue;
    }

    if (key === "plantCount") {
      const count = Number(actionValue);
      if (Number.isInteger(count) && count >= 1 && count <= 12) {
        actions.plantCount = count;
      }
      continue;
    }

    if (key === "soilType") {
      const soil = soilTypes.find(
        (item) => normalizeIdentifier(item) === normalizeIdentifier(actionValue)
      );
      if (soil) actions.soilType = soil;
      continue;
    }

    if (key === "waterAvailability") {
      const match =
        typeof actionValue === "string"
          ? actionValue.trim().match(/^(\d{1,3})\s*%?$/)
          : null;
      const amount = Number(
        typeof actionValue === "number" ? actionValue : match?.[1]
      );
      if (Number.isFinite(amount) && amount >= 0 && amount <= 100) {
        actions.waterAvailability = `${amount}%`;
      }
      continue;
    }

    if (key === "scenario") {
      const scenario = normalizeIdentifier(actionValue);
      if (scenario === "normal") actions.scenario = "Normal";
      if (scenario === "drought") actions.scenario = "Drought";
      continue;
    }

    if (key === "irrigationActive" && typeof actionValue === "boolean") {
      actions.irrigationActive = actionValue;
    }
  }

  return actions;
}

export function detectExplicitFarmActions(question) {
  if (typeof question !== "string") return {};

  const text = question.trim();
  const lower = text.toLowerCase();
  const actions = {};
  if (
    /^(?:should|what|which|why|how|is|are|does)\b|^do\s+(?!not\b)/i.test(text)
  ) {
    return actions;
  }

  const commandIntent =
    /\b(?:set|change|switch|select|choose|plant|grow|keep|make|put|activate|enable|start|turn|deactivate|disable|stop|restore|return|reset|simulate|apply)\b/i;

  if (!commandIntent.test(text)) return actions;

  const matchedCrop = crops
    .map((crop) => crop.name)
    .sort((a, b) => b.length - a.length)
    .find((name) => new RegExp(`\\b${escapeRegExp(name)}\\b`, "i").test(text));

  if (
    matchedCrop &&
    /\b(?:plant|grow|select|choose|switch|change|set|use)\b/i.test(text) &&
    !isNegatedInstruction(lower, lower.indexOf(matchedCrop.toLowerCase()))
  ) {
    actions.selectedCrop = matchedCrop;
  }

  const soilMatches = [...lower.matchAll(/\b(sandy|clay|loamy|silt(?:y)?)\b/g)];
  const soilMatch = soilMatches.reverse().find((match) => {
    const before = lower.slice(Math.max(0, match.index - 28), match.index);
    const after = lower.slice(match.index + match[0].length, match.index + match[0].length + 24);
    return /\bsoil\b/.test(before) || /\bsoil\b/.test(after);
  });
  if (
    soilMatch &&
    !isNegatedInstruction(lower, soilMatch.index)
  ) {
    const value = soilMatch[1].startsWith("silt") ? "Silt" : capitalize(soilMatch[1]);
    if (soilTypes.includes(value)) actions.soilType = value;
  }

  const waterMatch = lower.match(
    /\b(?:water(?:\s+availability|\s+level)?|moisture)\b[^.\n,;]{0,30}?\b(?:to|at|of|around|near)\s+(\d{1,3})\s*%|\b(\d{1,3})\s*%\s*(?:water|moisture)\b/i
  );
  if (waterMatch && !isNegatedInstruction(lower, waterMatch.index)) {
    const amount = Number(waterMatch[1] || waterMatch[2]);
    if (amount <= 100) actions.waterAvailability = `${amount}%`;
  }

  const countMatch = lower.match(
    /\b(?:plant|grow|set|keep|make|have)\s+(?:about\s+|exactly\s+)?(\d{1,2})\s+(?:(?:[a-z]+\s+){0,3})?(?:plants|crops|rows)\b|\b(\d{1,2})\s+(?:(?:[a-z]+\s+){1,3})?(?:plants|crops|rows)\b/i
  );
  if (countMatch && !isNegatedInstruction(lower, countMatch.index)) {
    const count = Number(countMatch[1] || countMatch[2]);
    if (count >= 1 && count <= 12) actions.plantCount = count;
  }

  const scenarioMatches = [
    ...lower.matchAll(/\b(normal(?:\s+(?:conditions|weather))?|drought(?:\s+conditions?)?|dry weather|water shortage)\b/g),
  ];
  const lastScenario = scenarioMatches.at(-1);
  if (lastScenario) {
    const actionContext = lower.slice(
      Math.max(0, lastScenario.index - 32),
      lastScenario.index + lastScenario[0].length + 18
    );
    if (
      commandIntent.test(actionContext) &&
      !isNegatedInstruction(lower, lastScenario.index)
    ) {
      actions.scenario = /normal/.test(lastScenario[0]) ? "Normal" : "Drought";
    }
  }

  const irrigationMatches = [
    ...lower.matchAll(/\b(?:irrigation|watering)\b[^.\n,;]{0,24}\b(on|off|active|inactive|enabled|disabled)\b|\b(?:turn|switch)\s+(?:the\s+)?(?:irrigation|watering)\s+(on|off)\b|\b(?:turn|switch)\s+(?:on|off)\s+(?:the\s+)?(?:irrigation|watering)\b|\b(?:activate|enable|start|deactivate|disable|stop)\s+(?:the\s+)?(?:irrigation|watering)\b/gi),
  ];
  const lastIrrigation = irrigationMatches.at(-1);
  if (lastIrrigation) {
    const phrase = lastIrrigation[0].toLowerCase();
    const explicitState = phrase.match(
      /\b(on|off|active|inactive|enabled|disabled)\b/
    )?.[1];
    const actionVerb = phrase.match(
      /\b(activate|enable|start|deactivate|disable|stop)\b/
    )?.[1];
    const isOff = explicitState
      ? /^(off|inactive|disabled)$/.test(explicitState)
      : /^(deactivate|disable|stop)$/.test(actionVerb);
    const negated = isNegatedInstruction(lower, lastIrrigation.index);
    const isExplicitToggle =
      /\b(?:turn|switch)\b/.test(phrase) || explicitState !== undefined;
    if (!negated || !isExplicitToggle) {
      actions.irrigationActive = negated ? isOff : !isOff;
    }
  }

  return actions;
}

export function validateFarmAgentResponse(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("The farm agent returned an invalid response.");
  }

  const answer = typeof value.answer === "string" ? value.answer.trim() : "";
  const clarification =
    typeof value.clarification === "string" ? value.clarification.trim() : "";
  if (!answer && !clarification) {
    throw new Error("The farm agent returned neither advice nor a clarification.");
  }

  return {
    answer,
    actions: normalizeFarmActions(value.actions),
    clarification: clarification || null,
  };
}

export function parseFarmAgentResponse(output) {
  if (typeof output !== "string") {
    throw new Error("The farm agent returned an invalid response.");
  }

  const text = output.trim().replace(/^```(?:json)?\s*|\s*```$/gi, "");
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("The farm agent did not return structured JSON.");
  }

  return validateFarmAgentResponse(parsed);
}

function capitalize(value) {
  return value[0].toUpperCase() + value.slice(1);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isNegatedInstruction(text, targetIndex) {
  const before = text.slice(Math.max(0, targetIndex - 24), targetIndex);
  const negationIndex = Math.max(
    before.lastIndexOf("not "),
    before.lastIndexOf("never "),
    before.lastIndexOf("don't "),
    before.lastIndexOf("dont "),
    before.lastIndexOf("do not ")
  );
  const resetIndex = Math.max(
    before.lastIndexOf(";"),
    before.lastIndexOf(" but "),
    before.lastIndexOf(" instead "),
    before.lastIndexOf(" then ")
  );
  return negationIndex > resetIndex;
}
