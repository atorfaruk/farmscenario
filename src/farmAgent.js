import { validateFarmAgentResponse } from "./farmActions.js";

export async function askFarmAgent(question, context = {}, signal) {
  let response;
  try {
    response = await fetch("http://localhost:3001/api/farm-agent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question, context }),
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(
      "Could not reach the FarmScenario AI server at localhost:3001. Start it with node server.cjs and try again.",
      { cause: error }
    );
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("FarmScenario AI returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(data.error || "FarmScenario AI request failed.");
  }

  return {
    ...validateFarmAgentResponse(data),
    provider: typeof data.provider === "string" ? data.provider : null,
  };
}
