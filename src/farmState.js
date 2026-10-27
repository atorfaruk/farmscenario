import { normalizeFarmActions } from "./farmActions.js";

export const initialFarmState = {
  soilType: "Sandy",
  scenario: "Normal",
  irrigationActive: false,
  selectedCrop: "Maize",
  plantCount: 12,
  waterAvailability: "74%",
};

export function applyFarmActions(state, actions = {}) {
  return { ...state, ...normalizeFarmActions(actions) };
}
