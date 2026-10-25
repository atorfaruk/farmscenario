import { useState, useRef } from "react";
import Farm3D from "./Farm3D";
import { crops, cropRequirements } from "./crops";
import { askFarmAgent } from "./farmAgent";
const applyCropCommand = (
  question,
  crops,
  setSelectedCrop,
  setSoilType,
  setWaterAvailability
) => {
  const text = question.toLowerCase();
if (text.includes("sandy soil")) setSoilType("Sandy");
if (text.includes("loamy soil")) setSoilType("Loamy");
if (text.includes("clay soil")) setSoilType("Clay");

const waterMatch = text.match(/(\d{1,3})\s*%/);
if (waterMatch) {
  const value = Number(waterMatch[1]);
  if (value >= 0 && value <= 100) {
    setWaterAvailability(`${value}%`);
  }
}
 const cropNames = crops
  .map((crop) => typeof crop === "string" ? crop : crop.name)
  .filter(Boolean)
  .sort((a, b) => b.length - a.length);

const match = cropNames.find((name) =>
  new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text)
);

if (match) {
  setSelectedCrop(match);
}

  if (!match) return null;

  const cropName = typeof match === "string" ? match : match.name;
  setSelectedCrop(cropName);

  return cropName;
};
function App() {
  const [soilType, setSoilType] = useState("Sandy");
  const [scenario, setScenario] = useState("Normal");
  const [selectedCrop, setSelectedCrop] = useState("Maize");
  const [plantCount, setPlantCount] = useState(6);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef(null);
const [cropImage, setCropImage] = useState(null);
const [diagnosis, setDiagnosis] = useState("");
const [isDiagnosing, setIsDiagnosing] = useState(false);

const handleCropImageChange = (event) => {
  const file = event.target.files?.[0];

  if (!file) return;
  if (!file.type.startsWith("image/")) {
    setDiagnosis("Please select a valid image file.");
    setCropImage(null);
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    setDiagnosis("Image must be smaller than 10 MB.");
    setCropImage(null);
    return;
  }

  setCropImage({
    file,
    preview: URL.createObjectURL(file),
  });

  setDiagnosis("");
};

const handleCropDiagnosis = async () => {
  if (!cropImage?.file) {
    setDiagnosis("Please select a crop image first.");
    return;
  }

  setIsDiagnosing(true);
  setDiagnosis("");

  try {
    const formData = new FormData();
    formData.append("image", cropImage.file);
    formData.append("cropType", selectedCrop);

    const response = await fetch(
      "http://localhost:3001/api/crop-diagnosis",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Diagnosis failed.");
    }
    const actions = data.actions || {};

if (actions.selectedCrop) {
  setSelectedCrop(actions.selectedCrop);
}

if (actions.soilType) {
  setSoilType(actions.soilType);
}

if (actions.waterAvailability) {
  setWaterAvailability(actions.waterAvailability);
}

if (actions.plantCount) {
  setPlantCount(actions.plantCount);
}

if (actions.scenario) {
  runScenario(actions.scenario);
}
    setDiagnosis(
  data.diagnosis
    .replace(/\*\*/g, "")
    .replace(/^\s*\*\s+/gm, "")
);
  } catch (error) {
    setDiagnosis(
      error.message || "Unable to analyze this crop image right now."
    );
  } finally {
    setIsDiagnosing(false);
  }
};

  const selectedCropData = cropRequirements[selectedCrop];
 const isSoilSuitable =
  selectedCropData?.suitableSoils?.length
    ? selectedCropData.suitableSoils.includes(soilType)
    : null;
  const [question, setQuestion] = useState("");
  const [message, setMessage] = useState("");
  const [waterAvailability, setWaterAvailability] = useState("74%");

 const runScenario = (name) => {
  setScenario(name);

  const nextWaterAvailability =
    name === "Normal"
      ? "74%"
      : name === "Drought"
      ? "35%"
      : "80%";

  setWaterAvailability(nextWaterAvailability);

  if (name === "Normal") {
    setMessage("☀️ Normal conditions: crops are growing under normal conditions.");
  } else if (name === "Drought") {
    setMessage("🌵 Drought detected: water availability is reduced.");
  } else if (name === "Drought + Irrigation") {
    setMessage("💧 Irrigation activated: water availability is improved.");
  }
};
const soilData = {
  Sandy: {
    crops: "Maize, Groundnut, Millet",
    fertilizer: "NPK 15-15-15",
    amount: "Requires crop-specific and soil-test verification",
  advice: "Sandy soil drains water quickly. Irrigation and organic matter can help. Fertilizer type and quantity should be confirmed using crop needs and a soil test."
  },

  Clay: {
    crops: "Rice, Maize, Soybean",
    fertilizer: "NPK 15-15-15",
    amount: "Requires crop-specific and soil-test verification",
   advice: "Clay soil can hold water for longer and may drain slowly. Avoid waterlogging. Choose fertilizer type and quantity based on crop needs and soil-test results."
  },

  Loamy: {
    crops: "Maize, Tomato, Soybean, Vegetables",
    fertilizer: "NPK 15-15-15",
   amount: "Requires crop-specific and soil-test verification",
    advice: "Loamy soil can support many crops, but suitability depends on the crop and local conditions. Choose fertilizer type and quantity based on crop needs and soil-test results."
  },

  Silt: {
    crops: "Rice, Maize, Vegetables",
    fertilizer: "NPK 15-15-15",
    amount: "Requires crop-specific and soil-test verification",
    advice: "Silt soil can retain moisture and nutrients, but drainage and crop suitability vary. Choose fertilizer type and quantity based on crop needs and soil-test results."
  }
};


  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b1110",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "24px",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "32px" }}>
            🌱 FarmScenario
          </h1>
          <p style={{ color: "#9aa7a2", marginTop: "6px" }}>
            Test your farming decisions before you make them.
          </p>
        </div>

        <div
          style={{
            background: "#16231e",
            padding: "10px 16px",
            borderRadius: "20px",
            color: "#7ee2a8",
          }}
        >
          ● Simulation Online
        </div>
      </header>

      <main
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 330px",
          gap: "20px",
        }}
      >
        <section>
          <div
            style={{
              background: "linear-gradient(135deg, #18382b, #10231c)",
              minHeight: "480px",
              borderRadius: "20px",
              padding: "25px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <h2>🌾 Farm Field</h2>
         <Farm3D
  selectedCrop={selectedCrop}
  soilType={soilType}
  scenario={scenario}
  waterAvailability={waterAvailability}
  plantCount={plantCount}
/>

            <div
              style={{
                marginTop: "15px",
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <span>🌤️ Weather: Sunny</span>
              <span>💧 Irrigation: Available</span>
              <span>🌱 Crop: {selectedCrop}</span>
            </div>
          </div>

<div
  style={{
    marginTop: "20px",
    background: "#121a17",
    borderRadius: "18px",
    padding: "20px",
  }}
>
  <h2>🌱 Select Crop or Fruit</h2>

  <select
    value={selectedCrop}
    onChange={(e) => setSelectedCrop(e.target.value)}
    style={{
      width: "100%",
      padding: "12px",
      borderRadius: "10px",
      fontSize: "16px",
      background: "#1b2a24",
      color: "white",
    }}
  >
    {crops.map((crop) => (
      <option key={crop.name} value={crop.name}>
        {crop.emoji} {crop.name}
      </option>
    ))}
  </select><div
  style={{
    marginTop: "20px",
    padding: "16px",
    borderRadius: "14px",
    background: "#13221c",
  }}
>
  <h3>🌱 Crop Intelligence</h3>

  {selectedCropData ? (
    <>
      <p>
        💧 Water need: <strong>{selectedCropData.waterNeed}</strong>
      </p>

      <p>
        🌍 Suitable soils:{" "}
        <strong>
  {selectedCropData.suitableSoils?.length
    ? selectedCropData.suitableSoils.join(", ")
    : "Not verified"}
</strong>
      </p>

      <p>
        ⏱️ Growth period: <strong>{selectedCropData.growthPeriod}</strong>
      </p>
    </>
  ) : (
    <p>
      ℹ️ Detailed requirements for {selectedCrop} are coming soon.
    </p>
  )}

<p>
  🌐 Soil compatibility:{" "}
  <strong>
    {isSoilSuitable === null
      ? `Insufficient soil data for ${selectedCrop}.`
      : isSoilSuitable
        ? `Listed as suitable for ${soilType} soil.`
        : `${soilType} soil is not listed as suitable for ${selectedCrop}.`}
  </strong>
</p>

<p>
  💡 Recommendation:{" "}
  <strong>
    {isSoilSuitable === null
      ? `We need verified soil data before recommending soil for ${selectedCrop}.`
      : isSoilSuitable
        ? `Good match! ${selectedCrop} is listed as suitable for ${soilType} soil.`
        : `Consider another soil type for ${selectedCrop}, and confirm with local agricultural guidance.`}
  </strong>
</p>

</div>

  <p>🌾 Selected: <strong>{selectedCrop}</strong></p>

<div
  style={{
    marginTop: "20px",
    background: "#121a17",
    borderRadius: "18px",
    padding: "20px"
  }}
>
  <h2>🌱 Soil Analyzer</h2>

  <p>Select the soil type to see what FarmScenario recommends.</p>

  <select
    value={soilType}
    onChange={(e) => setSoilType(e.target.value)}
    style={{
      width: "100%",
      padding: "12px",
      borderRadius: "10px",
      fontSize: "16px",
      background: "#1b2a24",
      color: "white"
    }}
  >
    <option value="Sandy">🟤 Sandy Soil</option>
    <option value="Clay">🧱 Clay Soil</option>
    <option value="Loamy">🌱 Loamy Soil</option>
    <option value="Silt">🌾 Silt Soil</option>

  </select>

  <div
    style={{
      marginTop: "18px",
      padding: "16px",
      background: "#183025",
      borderRadius: "12px"
    }}
  >
   <p>
  🌾 Crops listed for this soil:{" "}
<strong>
  {crops
    .filter((crop) =>
      cropRequirements[crop.name]?.suitableSoils?.includes(soilType)
    )
    .map((crop) => crop.name)
    .join(", ") || "No crops currently verified for this soil"}
</strong>
</p>

<p>
  🌱 Selected crop status:{" "}
  <strong>
    {isSoilSuitable === null
      ? `Insufficient soil data for ${selectedCrop}.`
      : isSoilSuitable
        ? `${selectedCrop} is listed for ${soilType} soil.`
        : `${selectedCrop} is not listed as suitable for ${soilType} soil in our crop database.`}
  </strong>
</p>

    <p>🧪 General fertilizer example (not verified): <strong>{soilData[soilType].fertilizer}</strong></p>
    <p>📏 Suggested quantity: <strong>{soilData[soilType].amount}</strong></p>
    <p>💡 Soil advice: <strong>{soilData[soilType].advice}</strong></p>
  </div>
</div>
</div>
          <div
            style={{
              marginTop: "20px",
              background: "#121a17",
              borderRadius: "18px",
              padding: "20px",
            }}
          >
            <h2>What-If Scenarios</h2>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button onClick={() => runScenario("Normal")}>
                🌤️ Normal
              </button>

              <button onClick={() => runScenario("Drought")}>
                ☀️ Drought
              </button>

              <button onClick={() => runScenario("Drought + Irrigation")}>
                💧 Drought + Irrigation
              </button>
            </div>

            <p style={{ color: "#7ee2a8", marginTop: "18px" }}>
              Active scenario: <strong>{scenario}</strong>
            </p>
          </div>
        </section>

        <aside>
          <div
            style={{
              background: "#121a17",
              borderRadius: "18px",
              padding: "20px",
              marginBottom: "20px",
            }}
          >
           
<div
  style={{
    background: "#1b2730",
    borderRadius: "14px",
    padding: "18px",
    marginBottom: "20px",
    border: "1px solid #334155",
  }}
>
  <h2>🌿 Crop Health Checker</h2>
  <p style={{ color: "#a8b3ae" }}>
    Upload a crop photo to prepare it for AI disease diagnosis.
  </p>

  <input
    type="file"
    accept="image/*"
    onChange={handleCropImageChange}
    style={{ width: "100%", marginBottom: "12px" }}
  />

  {cropImage && (
    <img
      src={cropImage.preview}
      alt="Selected crop"
      style={{
        width: "100%",
        maxHeight: "220px",
        objectFit: "contain",
        borderRadius: "10px",
        marginTop: "10px",
      }}
    />
  )}

  
<button
  type="button"
  onClick={handleCropDiagnosis}
  disabled={!cropImage?.file || isDiagnosing}
  style={{
    width: "100%",
    marginTop: "12px",
    padding: "10px",
    background: "#247a4e",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: isDiagnosing ? "wait" : "pointer",
  }}
>
  {isDiagnosing ? "Analyzing crop..." : "Analyze Crop"}
</button>

  {diagnosis && (
  <div
    style={{
      background: "#101a22",
      borderRadius: "10px",
      padding: "14px",
      marginTop: "14px",
      color: "#f8fafc",
      textAlign: "left",
      whiteSpace: "pre-wrap",
      lineHeight: 1.7,
      overflowWrap: "anywhere",
    }}
  >
    {diagnosis}
  </div>
)}

  <p style={{ color: "#a8b3ae", fontSize: "12px" }}>
    AI-powered crop analysis. Results are estimates and should be
confirmed by a local agricultural expert before major treatment.
  </p>
</div>
 
            <h2>🤖 AI Farm Assistant</h2>

            <p style={{ color: "#a8b3ae" }}>
              Tell me what you want to change on your farm.
            </p>
            
            <textarea
  value={question}
  onChange={(e) => setQuestion(e.target.value)}
  placeholder="Example: Simulate drought on my rice farm..."
  style={{
    width: "100%",
    height: "100px",
    boxSizing: "border-box",
    background: "#0b1110",
    color: "white",
    border: "1px solid #34443d",
    borderRadius: "12px",
    padding: "12px",
    resize: "none",
  }}
  
/>
                  


<button
  style={{ marginTop: "12px", width: "100%" }}
  onClick={async () => {
  if (isLoading) {
    abortControllerRef.current?.abort();
    return;
  }
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    setMessage("Connecting to FarmScenario AI...");

    try {
      
const controller = new AbortController();
abortControllerRef.current = controller;

const timeoutId = setTimeout(() => controller.abort(), 90000);

let response;

try {
  response = await fetch(
    "http://localhost:3001/api/farm-agent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: question.trim(),
        context: {
          selectedCrop,
          soilType,
          scenario,
          waterAvailability,
        },
      }),
      signal: controller.signal,
    }
  );
} finally {
  clearTimeout(timeoutId);
  abortControllerRef.current = null;
}


      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "AI request failed");
      }
const actions = data.actions || {};

if (actions.selectedCrop) {
  setSelectedCrop(actions.selectedCrop);
}

if (actions.soilType) {
  setSoilType(actions.soilType);
}

if (actions.waterAvailability) {
  setWaterAvailability(actions.waterAvailability);
}

if (typeof actions.plantCount === "number") {
  setPlantCount(actions.plantCount);
}

if (actions.scenario) {
  runScenario(actions.scenario);
}
  const cropCommand = applyCropCommand(
  question,
  crops,
  setSelectedCrop,
  setSoilType,
  setWaterAvailability
);



const cleanAnswer = (data.answer || "No answer received.")
  .replace(/#{1,6}\s*/g, "")
  .replace(/\*\*/g, "")
  .replace(/\*/g, "")
  .replace(/`/g, "")
  .replace(/---+/g, "")
  .replace(/^\s*[-•]\s+/gm, "")
  .replace(/[ \t]+\n/g, "\n")
  .replace(/\n{3,}/g, "\n\n")
  .trim();


setMessage(
  cropCommand
    ? `Farm updated: ${cropCommand} selected.\n\n${cleanAnswer}`
    : cleanAnswer
);

} catch (error) {
  if (error.name === "AbortError") {
    setMessage("Simulation stopped or timed out. You can try again.");
  } else {
    console.error(error);
    setMessage("Could not connect to FarmScenario AI. Please check the server and try again.");
  }
}
 finally {
      setIsLoading(false);
    }
  }}
>
 {isLoading ? "Stop Simulation" : "Run Simulation"}
</button>

            {message && (
              <p style={{ color: "#7ee2a8", marginTop: "15px" }}>
                {message}
              </p>
            )}
          </div>

          <div
            style={{
              background: "#121a17",
              borderRadius: "18px",
              padding: "20px",
            }}
          >
            <h2>📊 Results</h2>

         <p>
  🌽 Expected crop health:{" "}
  <strong>
    {Math.max(
      10,
      Math.min(
        100,
        (scenario === "Normal" ? 82 : scenario === "Drought" ? 55 : 78) +
          (Number.parseFloat(waterAvailability) - 74) * 0.3
      )
    ).toFixed(0)}%
  </strong>
</p>   
<p>💧 Water availability: <strong>
  {waterAvailability}
</strong></p>
            <p>🌱 Soil condition: <strong>
  {scenario === "Normal"
    ? "Good"
    : scenario === "Drought"
    ? "Dry"
    : "Improving"}
</strong></p>
            <div
              style={{
                marginTop: "18px",
                padding: "14px",
                background: "#183025",
                borderRadius: "12px",
              }}
            >
              💡 AI Recommendation
              <p style={{ color: "#b9c8c0" }}>
               {scenario === "Normal"
  ? "Maintain current conditions and monitor crop health."
  : scenario === "Drought"
  ? "Consider irrigation if drought conditions continue."
  : "Irrigation is active. Continue monitoring soil moisture and crop health."}
              </p>
            </div>
          </div>
        </aside>
      </main>

      <style>{`
        button {
          background: #247a4b;
          color: white;
          border: none;
          padding: 12px 18px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 14px;
        }

        button:hover {
          background: #31945e;
        }
      `}</style>
    </div>
  );
}

export default App;
