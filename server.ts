import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini lazily
let aiInstance: GoogleGenAI | null = null;
function getAi() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in the environment.");
    }
    aiInstance = new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// Labels for slider numbers mapping to clinical descriptions
const AFFECT_LABELS: Record<number, string> = {
  0: "No Engagement",
  1: "Low Engagement",
  2: "Moderate Engagement",
  3: "High Engagement",
  4: "Most Engaged"
};

const PROMPT_RECEPTIVENESS_LABELS: Record<number, string> = {
  0: "Ineffective",
  1: "Low Effectiveness",
  2: "Moderately Effective",
  3: "Highly Effective",
  4: "Effective"
};

const PARTICIPATION_LABELS: Record<number, string> = {
  0: "No Participation",
  1: "Minimal Participation",
  2: "Moderate Participation",
  3: "High Participation",
  4: "Active Participation"
};

const BEHAVIOR_SEVERITY_LABELS: Record<number, string> = {
  0: "None",
  1: "Rare / Mild",
  2: "Occasional / Moderate",
  3: "Frequent / Severe",
  4: "Constant"
};

// In-memory model failure tracking to avoid retrying downed or over-quota models in the fallback chain.
const modelFailures = new Map<string, number>();
const BACKOFF_DURATION_MS = 5 * 60 * 1000; // 5 minutes backoff

// API endpoint for narrative generation
app.post("/api/generate", async (req, res) => {
  try {
    const sessionData = req.body;
    const ai = getAi();

    // Map numeric sliders or fallback to original arrays/strings
    const affectEngVal = typeof sessionData.affectEngagement === 'number' 
      ? (AFFECT_LABELS[sessionData.affectEngagement] || "Moderate Engagement")
      : (sessionData.affectEngagement?.join(', ') || 'N/A');

    const promptRecepVal = typeof sessionData.promptReceptiveness === 'number' 
      ? (PROMPT_RECEPTIVENESS_LABELS[sessionData.promptReceptiveness] || "Moderately Effective")
      : (sessionData.promptReceptiveness?.join(', ') || 'N/A');

    const behaviorSevVal = typeof sessionData.behaviorSeverity === 'number'
      ? (BEHAVIOR_SEVERITY_LABELS[sessionData.behaviorSeverity] || "None")
      : (sessionData.behaviorSeverity || 'None');

    const participationVal = typeof sessionData.participationLevel === 'number'
      ? (PARTICIPATION_LABELS[sessionData.participationLevel] || "Moderate Participation")
      : (sessionData.participationLevel || 'Moderate Participation');
    
    const targetsVal = sessionData.teachingTargets?.join(', ') || 'None';
    const strategiesVal = sessionData.strategies?.join(', ') || 'None';
    const behaviorTypesVal = sessionData.behaviorTypes?.join(', ') || '';

    const systemInstruction = `You are an AI assistant specializing in Applied Behavior Analysis (ABA). Your task is to generate a professional session note suitable for clinical records and insurance review (Medicaid/Tricare). 

CRITICAL RULES:
1. OBJECTIVE LANGUAGE: Use behavioral observations (e.g., 'displayed frequent smiles') instead of subjective states ('happy').
2. PRIVACY: No PHI. Describe problem behaviors in general terms ('physical aggression') not specific details ('hitting peers').
3. NO FUNCTIONAL TALK: Do not mention FBA, ABC data, or hypotheses about functions of behavior.
4. STEADY FLOW: The note should be between 4 and 6 sentences, approx 70 words.
5. COMPLETE NARRATIVE: ABSOLUTE REQUIREMENT - The narrative MUST be fully grammatically complete. Do NOT truncate or cut off mid-sentence. Ensure every sentence is fully concluded with final punctuation.
6. NO INTROS: Do not start with "During". Refer to the client as "Client".
7. VARIETY: You must vary phrasing significantly between generations. Use different sentence structures and vocabulary for every request.
8. OPENING VARIETY: Do NOT start consecutive narratives with the same word or phrase. If the provided history shows a note starting with "Client", the new note MUST start with a different subject or phrase (e.g., "Observation of...", "The session began...", "Engagement level...").`;

    const userPrompt = `Generate a unique session note based on these details (Variation is mandatory, especially for the starting words):
- Affect: ${affectEngVal} (${participationVal})
- Behavior: ${behaviorSevVal}${behaviorTypesVal ? ` (${behaviorTypesVal})` : ''}
- Targets: ${targetsVal}
- Strategies: ${strategiesVal}
- Receptiveness: ${promptRecepVal}
${sessionData.setting ? `- Setting: ${sessionData.setting}` : ''}
${sessionData.additionalDetails ? `- Extra: ${sessionData.additionalDetails}` : ''}

${sessionData.history && sessionData.history.length > 0 ? `HISTORY (DO NOT REPEAT THESE SPECIFIC PHRASINGS OR OPENING SENTENCE STRUCTURES): ${[...sessionData.history].filter(Boolean).sort(() => Math.random() - 0.5).join(' | ')}` : ''}`;

    const baseModels = [
      "gemini-3.5-flash",
      "gemini-3.1-pro-preview",
      "gemini-3.1-flash-lite",
      "gemini-flash-latest"
    ];

    const now = Date.now();
    const healthyModels = [];
    const unhealthyModels = [];

    for (const modelName of baseModels) {
      const failedAt = modelFailures.get(modelName);
      if (failedAt && (now - failedAt < BACKOFF_DURATION_MS)) {
        unhealthyModels.push(modelName);
      } else {
        healthyModels.push(modelName);
      }
    }

    const modelsToTry = [...healthyModels, ...unhealthyModels];

    let response = null;
    let lastError = null;
    const attemptErrors: string[] = [];

    for (const modelName of modelsToTry) {
      try {
        console.log(`Generating narrative using ${modelName}...`);
        response = await ai.models.generateContent({
          model: modelName,
          contents: userPrompt,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.9,
            topP: 0.95,
            topK: 64
          }
        });
        
        if (response && response.text) {
          console.log(`Successfully generated narrative using ${modelName}`);
          const text = response.text;
          modelFailures.delete(modelName);
          res.json({ narrative: text });
          return;
        }
      } catch (err: any) {
        const errorMsg = err.message || JSON.stringify(err);
        attemptErrors.push(`${modelName}: ${errorMsg}`);
        console.warn(`Model ${modelName} failed:`, errorMsg);
        modelFailures.set(modelName, Date.now());
        lastError = err;
      }
    }

    if (!response || !response.text) {
      const combinedDetails = attemptErrors.length > 0 ? ": " + attemptErrors.join(" | ") : "";
      throw new Error(`All model fallbacks failed${combinedDetails}`);
    }

    res.json({ narrative: response.text });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate narrative" });
  }
});

app.get("/ads.txt", (req, res) => {
  res.type("text/plain");
  res.send("google.com, pub-6792335595485897, DIRECT, f08c47fec0942fa0");
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
