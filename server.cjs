
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const sharp = require("sharp");
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype || !file.mimetype.startsWith("image/")) {
      return callback(new Error("Please upload an image file."));
    }
    callback(null, true);
  },
});

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

const FARM_SYSTEM_PROMPT = `
You are FarmScenario AI, a practical farming assistant.

Give short, accurate, easy-to-understand answers.

Use the selected crop, soil type, water availability, and scenario when provided.

Limit every answer to 120 words maximum.

Use this format:

Farm Update:
State what changed.

Advice:
Give the most important farming advice in 2 or 3 short sentences.

Next Step:
Give one practical action.

Avoid long explanations, repeated information, markdown stars, and hashtags.
Do not invent facts. Clearly mention uncertainty when necessary.
`;

function buildPrompt(question, context) {
  return `${FARM_SYSTEM_PROMPT}

Farmer question:
${question}

Current farm context:
${JSON.stringify(context || {})}

Answer clearly and practically for a farmer.`;
}

async function askGemini(prompt) {
  if (!ai) throw new Error("Gemini API key is not configured.");

  const interaction = await ai.interactions.create({
    model: "gemini-3.8-flash",
    input: prompt,
  });

  if (!interaction.output_text) {
    throw new Error("Gemini returned an empty answer.");
  }

  return interaction.output_text;
}

async function askGroq(prompt) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Groq API key is not configured.");
  }

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
       model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: FARM_SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 1200,
      }),
     signal: AbortSignal.timeout(60000),
    }
  );
console.log("Groq HTTP status:", response.status);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error?.message || `Groq request failed (${response.status}).`
    );
  }

  const answer = data.choices?.[0]?.message?.content;

  if (!answer) throw new Error("Groq returned an empty answer.");

  return answer;
}


async function askOpenRouter(prompt) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is missing from .env");
  }

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-OpenRouter-Title": "FarmScenario"
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [
          {
            role: "system",
            content: FARM_SYSTEM_PROMPT
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 700
      }),
      signal: AbortSignal.timeout(60000)
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error?.message || `OpenRouter HTTP ${response.status}`
    );
  }

  const answer = data.choices?.[0]?.message?.content;

  if (!answer) {
    throw new Error("OpenRouter returned an empty answer");
  }

  return answer;
}


app.post("/api/crop-diagnosis", (req, res, next) => {
  upload.single("image")(req, res, async (error) => {
    if (error) {
      return next(error);
    }

    try {
      if (!req.file) {
        return res.status(400).json({
          error: "Please upload a crop image.",
        });
      }

      if (!process.env.GROQ_API_KEY) {
        return res.status(503).json({
          error: "Crop diagnosis is not configured on the server.",
        });
      }

     const resizedImage = await sharp(req.file.buffer)
  .rotate()
  .resize({
    width: 2048,
    height: 2048,
    fit: "inside",
    withoutEnlargement: true,
  })
  .jpeg({ quality: 80 })
  .toBuffer();

const imageBase64 = resizedImage.toString("base64");
const imageDataUrl =
  `data:image/jpeg;base64,${imageBase64}`;

      const cropType = String(req.body.cropType || "unknown").slice(0, 60);

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "qwen/qwen3.8-27b",
            temperature: 0.2,
            max_completion_tokens: 900,
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text:
                      `
You are FarmScenario's crop and plant health assistant.

Examine the uploaded image and identify the plant, crop, or harvested produce.

Return your analysis using exactly these five section headings, in this order:

Crop Identification:
Identify the crop or plant. If identification is uncertain, say so.

Visible Symptoms:
Describe only visible signs, such as holes, spots, discoloration, wilting, damage, sprouting, or rot. If no symptoms are visible, state that clearly.

Possible Causes:
Explain plausible causes. Distinguish possibilities from confirmed findings. For harvested produce, consider quality, handling, and storage rather than assuming plant disease.

Confidence Level:
Choose Low, Medium, or High and briefly explain why.

Recommended Actions:
Provide three safe, practical next steps. Avoid recommending specific pesticide treatment without adequate evidence.

Use plain text. Do not use markdown stars, asterisks, or decorative symbols. Put each heading on its own line, followed by its explanation. Keep the sections concise and easy to read. Never invent symptoms or claim certainty from an image alone. Recommend confirmation by a local agricultural expert before major treatment.

`
                  },
                  {
                    type: "image_url",
                    image_url: { url: imageDataUrl },
                  },
                ],
              },
            ],
          }),
          signal: AbortSignal.timeout(60000),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Groq Vision error:", response.status, data);
        return res.status(502).json({
          error: "The crop diagnosis service failed. Please try again.",
        });
      }

      const diagnosis = data.choices?.[0]?.message?.content;

      if (!diagnosis) {
        return res.status(502).json({
          error: "The AI returned no diagnosis. Please try again.",
        });
      }

      return res.json({
        diagnosis,
        provider: "Groq Vision",
      });
    } catch (error) {
      console.error("Crop diagnosis failed:", error.message);

      return res.status(502).json({
        error: "Unable to analyze the crop image right now.",
      });
    }
  });
});

function detectFarmActions(question, context = {}) {
  const q = question.toLowerCase();
  const actions = {};

  const cropNames = [
    "Maize", "Rice", "Wheat", "Sorghum", "Millet",
    "Tomato", "Potato", "Cassava", "Yam", "Soybean",
    "Groundnut", "Cowpea", "Beans", "Onion", "Pepper",
    "Cabbage", "Carrot", "Sugarcane", "Banana", "Plantain",
    "Cocoa", "Cotton", "Coffee", "Orange", "Mango",
    "Watermelon"
  ];

  const crop = cropNames.find(name =>
    new RegExp(`\\b${name}\\b`, "i").test(q)
  );

  if (crop && /\b(switch|change|select|plant|grow|use|choose|set)\b/i.test(q)) {
    actions.selectedCrop = crop;
  }

  const soilNames = ["Sandy", "Clay", "Loamy", "Silty", "Peaty", "Chalky"];
  const soil = soilNames.find(name =>
    new RegExp(`\\b${name}\\b`, "i").test(q)
  );

  if (soil && /\b(soil|change|switch|set|use)\b/i.test(q)) {
    actions.soilType = soil;
  }

  const waterMatch = q.match(
    /(?:water(?: availability| level)?|irrigation)\s*(?:to|at|of|=|:)?\s*(\d{1,3})\s*%/i
  );

  if (waterMatch) {
    const value = Number(waterMatch[1]);
    if (value >= 0 && value <= 100) {
      actions.waterAvailability = `${value}%`;
    }
  }

  const countMatch = q.match(/\b(\d{1,2})\s+(?:plants|crops|rows)\b/i);

  if (countMatch) {
    const count = Number(countMatch[1]);
    if (count >= 1 && count <= 12) {
      actions.plantCount = count;
    }
  }

  if (/\b(irrigat|water the farm|activate watering)\b/i.test(q)) {
    actions.scenario = "Drought + Irrigation";
  } else if (/\b(drought|dry weather|water shortage)\b/i.test(q)) {
    actions.scenario = "Drought";
  } else if (/\b(normal conditions|normal weather|reset farm|restore normal)\b/i.test(q)) {
    actions.scenario = "Normal";
    actions.waterAvailability = "74%";
  }

  return actions;
}

// General farming assistant: Gemini first, Groq as backup.


app.post("/api/farm-agent", async (req, res) => {
  const { question, context } = req.body || {};

  if (typeof question !== "string" || !question.trim()) {
    return res.status(400).json({
      error: "Please enter a farming question.",
    });
  }

  const cleanQuestion = question.trim();
  const prompt = buildPrompt(cleanQuestion, context);
const actions = detectFarmActions(cleanQuestion, context);
  try {
    const answer = await askGemini(prompt);

    return res.json({
      answer,
      actions,
      provider: "Gemini",
    });
  } catch (error) {
    console.error("Gemini failed:", error.message);
  }

  try {
    const answer = await askGroq(prompt);

    return res.json({
      answer,
      actions,
      provider: "Groq (backup)",
    });
  
} catch (error) {
  console.error("Groq failed:", error.message);

  try {
    const answer = await askOpenRouter(prompt);

    return res.json({
      answer,
      actions,
      provider: "OpenRouter (backup)"
    });
  } catch (openRouterError) {
    console.error("OpenRouter failed:", openRouterError.message);

    return res.status(503).json({
      error: "All three AI providers are unavailable. Please check your API keys, model access and internet connection."
    });
  }
}

});

// Tajiri Vision: specialist crop-image diagnosis.
app.post(
  "/api/crop-diagnosis",
  upload.single("image"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        error: "Please upload a crop image using the image field.",
      });
    }

    try {
      const form = new FormData();

      form.append(
        "image",
        new Blob([req.file.buffer], { type: req.file.mimetype }),
        req.file.originalname || "crop-image.jpg"
      );

      if (req.body.crop_type) {
        form.append("crop_type", req.body.crop_type);
      }

      if (req.body.region) {
        form.append("region", req.body.region);
      }

      if (req.body.language) {
        form.append("language", req.body.language);
      }

      const response = await fetch(
        "https://api.tajirifarm.com/diagnoses/",
        {
          method: "POST",
          body: form,
          signal: AbortSignal.timeout(45000),
        }
      );

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        data = { message: responseText };
      }

      if (!response.ok) {
        console.error("Tajiri request failed:", response.status);

        return res.status(502).json({
          error: "Tajiri Vision could not process the image.",
          details: data,
        });
      }

      return res.json({
        provider: "Tajiri Vision",
        diagnosis: data,
      });
    } catch (error) {
      console.error("Tajiri Vision error:", error.message);

      return res.status(502).json({
        error:
          "Crop diagnosis is temporarily unavailable. Please try again later.",
      });
    }
  }
);

// Handle upload errors without crashing the server.
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      error:
        error.code === "LIMIT_FILE_SIZE"
          ? "Image must be 8 MB or smaller."
          : "Image upload failed.",
    });
  }

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  next();
});

app.listen(PORT, () => {
  console.log(
    `FarmScenario AI server running at http://localhost:${PORT}`
  );
});
