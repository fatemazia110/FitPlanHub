import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePlanDescription = async (title: string, duration: number, trainerName: string): Promise<string> => {
  try {
    const prompt = `
      You are an expert fitness copywriter assisting a trainer named ${trainerName}.
      Write a compelling, energetic, and professional description for a fitness plan titled "${title}" which lasts for ${duration} days.
      
      Structure the response:
      1. A catchy hook.
      2. Key benefits (bullet points).
      3. Who this is for.
      
      Keep it under 200 words. Format as plain text (no markdown symbols like ** or #).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate description.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error connecting to AI assistant. Please write description manually.";
  }
};