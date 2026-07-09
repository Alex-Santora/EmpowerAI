const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_MODEL = "gemini-3.1-flash-lite";
const MAX_EXTRA_DETAILS = 200;
const REQUEST_TIMEOUT_MS = 12000;

class ApiError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

const validSkillLevels = new Set(["Beginner", "Intermediate", "Advanced"]);
const validInterests = new Set([
  "Sports",
  "Healthcare",
  "Education",
  "Finance",
  "Games",
  "Productivity",
  "Robotics/Hardware",
  "Social Good",
  "Creative Tools",
  "Other",
]);
const validTools = new Set([
  "Python",
  "JavaScript",
  "React",
  "APIs",
  "Machine Learning",
  "No-Code",
  "Hardware",
  "Data Analysis",
  "No Preference",
]);
const validTimeCommitments = new Set([
  "Weekend Project",
  "1 Week",
  "2-4 Weeks",
  "Long-Term Project",
]);

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  const allowedOrigins = (process.env.ALLOWED_ORIGIN || "*")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  const allowAnyOrigin = allowedOrigins.includes("*");

  if (allowAnyOrigin) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  } else if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");
}

function sendJson(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body === "string") {
    return JSON.parse(req.body);
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function cleanText(value, maxLength = 80) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function normalizeTools(value) {
  const tools = Array.isArray(value) ? value : [value];
  return tools.map((tool) => cleanText(tool)).filter(Boolean);
}

function validateProfile(body) {
  const skillLevel = cleanText(body.skillLevel);
  const interest = cleanText(body.interest);
  const tools = normalizeTools(body.tools);
  const timeCommitment = cleanText(body.timeCommitment);
  const extraDetails = cleanText(body.extraDetails, MAX_EXTRA_DETAILS);

  if (!validSkillLevels.has(skillLevel)) {
    return { error: "Choose a valid skill level." };
  }

  if (!validInterests.has(interest)) {
    return { error: "Choose a valid area of interest." };
  }

  if (!validTimeCommitments.has(timeCommitment)) {
    return { error: "Choose a valid time commitment." };
  }

  const selectedTools = tools.length ? tools : ["No Preference"];
  if (selectedTools.some((tool) => !validTools.has(tool))) {
    return { error: "Choose valid preferred tools." };
  }

  return {
    profile: {
      skillLevel,
      interest,
      tools: selectedTools,
      timeCommitment,
      extraDetails,
    },
  };
}

function buildPrompt(profile) {
  return `You are an AI project mentor for EmpowerAI, a free educational website that helps students learn artificial intelligence through practical projects.

Generate one personalized AI project idea based on this student profile:

Skill level: ${profile.skillLevel}
Area of interest: ${profile.interest}
Preferred tools: ${profile.tools.join(", ")}
Time commitment: ${profile.timeCommitment}
Extra details: ${profile.extraDetails || "None provided"}

The project must be realistic for the selected skill level and time commitment. It should use free tools only. Do not make the idea too generic. Make it feel like something a student could actually build and add to a portfolio.

Return the response in this exact structure:

Project Title:
Short Description:
Difficulty:
Recommended Tools/Libraries:
Skills Learned:
Step-by-Step Build Plan:
1.
2.
3.
4.
5.
Possible Extensions:
Free Learning Resources/Search Terms:
Portfolio/Resume Angle:

Keep the response clear, organized, and under 500 words.`;
}

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${GEMINI_ENDPOINT}/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            topP: 0.9,
            maxOutputTokens: 700,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorPayload = null;

      try {
        errorPayload = JSON.parse(errorText);
      } catch {
        errorPayload = null;
      }

      const geminiError = errorPayload?.error;
      const geminiMessage =
        geminiError?.message || `Gemini request failed with ${response.status}.`;
      throw new ApiError(response.status, "gemini_error", geminiMessage);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }

    return text;
  } finally {
    clearTimeout(timeout);
  }
}

export default async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const result = validateProfile(body);

    if (result.error) {
      sendJson(res, 400, { error: result.error });
      return;
    }

    // Add IP/user based rate limiting here before calling Gemini in production.
    // The Gemini API key must only live on this backend, never in frontend code.
    const projectIdea = await callGemini(buildPrompt(result.profile));

    sendJson(res, 200, { projectIdea });
  } catch (error) {
    console.error(error);
    if (error instanceof ApiError) {
      sendJson(res, error.statusCode, {
        code: error.code,
        error: error.message,
      });
      return;
    }

    sendJson(res, 500, {
      code: "temporary_unavailable",
      error: error instanceof Error ? error.message : "Unknown server error.",
    });
  }
}
