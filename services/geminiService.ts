import { GoogleGenAI, Type } from "@google/genai";

// Helper to safely access env
const getApiKey = () => {
  try {
    return process.env.API_KEY || '';
  } catch (e) {
    return '';
  }
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export const getSongMetadata = async (title: string, artist: string): Promise<{ description: string; mood: string }> => {
  if (!getApiKey()) {
    console.warn("No API Key found, skipping Gemini enhancement.");
    return { description: "Local track description placeholder.", mood: "Neutral" };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a short, engaging description (max 20 words) and a single word 'mood' for the song "${title}" by "${artist}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            mood: { type: Type.STRING }
          },
          required: ["description", "mood"]
        }
      }
    });

    const text = response.text;
    if (!text) return { description: "", mood: "" };
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Error fetching metadata from Gemini:", error);
    return { description: "Music metadata unavailable.", mood: "Unknown" };
  }
};