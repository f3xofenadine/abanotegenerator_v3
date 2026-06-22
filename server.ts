import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
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
    
    let prompt = `Write a clinical ABA session narrative (~${sessionData.sentenceCount || 5} sentences).
Role: BCBA. Term: "Client".
Data:
- Setting: ${sessionData.setting}
- Emphasis: ${sessionData.sessionEmphasis?.join(', ')}
- Participation: ${participationVal}
- Affect: ${affectEngVal}
- Strategies: ${sessionData.strategies?.join(', ')}
- Prompts: ${promptRecepVal}
- Targets: ${sessionData.teachingTargets?.join(', ')}
- Problem Behavior: ${behaviorSevVal} (${sessionData.behaviorTypes?.join(', ') || 'None'})
- Extra: ${sessionData.additionalDetails || 'None'}
Rules: Objective, clinical flow, no PHI.`;

    if (sessionData.history && Array.isArray(sessionData.history) && sessionData.history.length > 0) {
      const activeHistory = sessionData.history.filter(Boolean);
      if (activeHistory.length > 0) {
        prompt += `\n\nCRITICAL VARIATIONAL MANDATE:
To ensure wide clinical variety and prevent boilerplate repetition, the newly generated narrative MUST be written with completely different sentence structure, starting verbs, word choice, and phrasing styles compared to the previous two generations listed below. Do not use the same transitions or introductory phrases.

[PREVIOUS GENERATION HISTORY - DO NOT REUSE WORD PATTERNS OR REPEAT PHRASING]:
${activeHistory.map((item, index) => `Generation #${index + 1}: "${item}"`).join('\n\n')}`;
      }
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW
        },
        temperature: 1.0,
      }
    });

    res.json({ narrative: response.text });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate narrative" });
  }
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
