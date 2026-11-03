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

const CROPGRAPH_API = "https://api.cropgraph.com";

export async function discoverCropOnline(cropName, signal) {
  const query = String(cropName || "").trim();

  if (!query) {
    throw new Error("Please provide a crop name to search for.");
  }

  const searchUrl = `${CROPGRAPH_API}/api/search?q=${encodeURIComponent(query)}`;

  const searchResponse = await fetch(searchUrl, { signal });

  if (!searchResponse.ok) {
    throw new Error(`Crop search failed (${searchResponse.status}).`);
  }

  const searchData = await searchResponse.json();
  const results = Array.isArray(searchData)
    ? searchData
    : Array.isArray(searchData.results)
      ? searchData.results
      : [];

  if (!results.length) {
    return [];
  }

  const detailedCrops = await Promise.all(
    results.slice(0, 5).map(async (result) => {
      const basicCrop = {
        name: result.commonName || result.name || query,
        scientificName: result.scientificName || null,
        category: result.category || null,
        season: result.season || null,
        aliases: Array.isArray(result.aliases) ? result.aliases : [],
        slug: result.slug || null,
        source: "CropGraph",
      };

      if (!result.slug) return basicCrop;

      try {
        const detailUrl =
          `${CROPGRAPH_API}/api/crop/${encodeURIComponent(result.slug)}`;

        const detailResponse = await fetch(detailUrl, { signal });

        if (!detailResponse.ok) return basicCrop;

        const detailData = await detailResponse.json();
        const crop = detailData.crop;

        if (!crop) return basicCrop;

        return {
          ...basicCrop,
          ...crop,
          companions: detailData.companions || [],
          antagonists: detailData.antagonists || [],
        };
      } catch (error) {
        if (error.name === "AbortError") throw error;
        return basicCrop;
      }
    })
  );

  return detailedCrops;
}
