import test from "node:test";
import assert from "node:assert/strict";
import {
  detectExplicitFarmActions,
  normalizeFarmActions,
  parseFarmAgentResponse,
  supportedCropNames,
  validateFarmAgentResponse,
} from "../src/farmActions.js";
import { applyFarmActions, initialFarmState } from "../src/farmState.js";

test("farm actions cover the complete crop catalog and normalize crop identifiers", () => {
  assert.equal(supportedCropNames.length, 46);
  assert.equal(new Set(supportedCropNames).size, 46);
  assert.deepEqual(
    normalizeFarmActions({ selectedCrop: "  sweet-potato " }),
    { selectedCrop: "Sweet Potato" }
  );
});

test("explicit controls can be combined in different orders", () => {
  assert.deepEqual(
    detectExplicitFarmActions(
      "Plant 12 maize plants, make the soil sandy, then set moisture to 30%, put the farm in drought, and enable irrigation."
    ),
    {
      selectedCrop: "Maize",
      plantCount: 12,
      soilType: "Sandy",
      waterAvailability: "30%",
      scenario: "Drought",
      irrigationActive: true,
    }
  );

  assert.deepEqual(
    detectExplicitFarmActions(
      "Turn irrigation off and restore normal conditions."
    ),
    { scenario: "Normal", irrigationActive: false }
  );
});

test("the four reported browser commands produce all requested state changes", () => {
  const cases = [
    [
      "Set my farm to drought conditions.",
      { scenario: "Drought" },
    ],
    [
      "Activate irrigation and restore normal conditions.",
      { irrigationActive: true, scenario: "Normal" },
    ],
    [
      "Plant rice on clay soil and set water availability to 60%.",
      {
        selectedCrop: "Rice",
        soilType: "Clay",
        waterAvailability: "60%",
      },
    ],
    [
      "Turn irrigation off and keep the soil clay.",
      { irrigationActive: false, soilType: "Clay" },
    ],
  ];

  for (const [question, expectedActions] of cases) {
    const actions = detectExplicitFarmActions(question);
    assert.deepEqual(actions, expectedActions, question);
    assert.deepEqual(
      applyFarmActions(initialFarmState, actions),
      { ...initialFarmState, ...expectedActions },
      question
    );
  }
});

test("capability commands produce only requested, applicable state changes", () => {
  const cases = [
    [
      "Plant 12 maize plants and set the soil to sandy.",
      { selectedCrop: "Maize", plantCount: 12, soilType: "Sandy" },
    ],
    [
      "Activate drought conditions and turn on irrigation.",
      { scenario: "Drought", irrigationActive: true },
    ],
    [
      "Turn irrigation off and restore normal conditions.",
      { scenario: "Normal", irrigationActive: false },
    ],
    [
      "Set water availability to 30% and keep the farm in drought.",
      { waterAvailability: "30%", scenario: "Drought" },
    ],
    [
      "Change the soil to clay, keep water at 30%, and activate irrigation.",
      { soilType: "Clay", waterAvailability: "30%", irrigationActive: true },
    ],
  ];

  for (const [question, expectedActions] of cases) {
    const actions = detectExplicitFarmActions(question);
    assert.deepEqual(actions, expectedActions, question);
    assert.deepEqual(
      applyFarmActions(initialFarmState, actions),
      { ...initialFarmState, ...expectedActions },
      question
    );
  }
});

test("advice questions do not become farm changes", () => {
  assert.deepEqual(
    detectExplicitFarmActions("Should I plant maize in sandy soil during drought?"),
    {}
  );
});

test("negated control instructions are not applied as positive changes", () => {
  assert.deepEqual(
    detectExplicitFarmActions("Do not plant maize or enable irrigation."),
    { irrigationActive: false }
  );
  assert.deepEqual(
    detectExplicitFarmActions("Do not disable irrigation; keep it on."),
    { irrigationActive: true }
  );
  assert.deepEqual(
    detectExplicitFarmActions("Do not enable irrigation."),
    { irrigationActive: false }
  );
  assert.deepEqual(
    detectExplicitFarmActions("Do not turn irrigation off."),
    {}
  );
  assert.deepEqual(
    detectExplicitFarmActions("Turn irrigation off."),
    { irrigationActive: false }
  );
  assert.deepEqual(
    detectExplicitFarmActions(
      "Activate irrigation and restore normal conditions."
    ),
    { irrigationActive: true, scenario: "Normal" }
  );
});

test("action normalization filters unsupported keys and out-of-range values", () => {
  assert.deepEqual(
    normalizeFarmActions({
      selectedCrop: "not a crop",
      plantCount: 13,
      soilType: "loamy",
      waterAvailability: 45,
      scenario: "storm",
      irrigationActive: "yes",
      execute: "arbitrary code",
    }),
    { soilType: "Loamy", waterAvailability: "45%" }
  );
});

test("structured AI responses require advice or clarification and whitelist actions", () => {
  assert.deepEqual(
    parseFarmAgentResponse(
      '```json\n{"answer":"Check soil moisture before watering.","actions":{"waterAvailability":"30","unlisted":"ignored"},"clarification":null}\n```'
    ),
    {
      answer: "Check soil moisture before watering.",
      actions: { waterAvailability: "30%" },
      clarification: null,
    }
  );

  assert.throws(
    () => validateFarmAgentResponse({ answer: "", actions: {} }),
    /neither advice nor a clarification/
  );
});

test("farm state applies validated actions atomically and preserves omitted values", () => {
  const current = {
    ...initialFarmState,
    scenario: "Drought",
    waterAvailability: "30%",
  };
  assert.deepEqual(
    applyFarmActions(current, {
      soilType: "clay",
      irrigationActive: true,
      plantCount: 4,
      ignored: "value",
    }),
    {
      ...current,
      soilType: "Clay",
      irrigationActive: true,
      plantCount: 4,
    }
  );
});
