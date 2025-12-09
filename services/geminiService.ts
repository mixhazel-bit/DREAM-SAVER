import { GoogleGenAI } from "@google/genai";
import { AdviceRequest } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize safely. If no API key, we handle it gracefully in the calling component.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const getFinancialAdvice = async (data: AdviceRequest): Promise<string> => {
  if (!ai) {
    return "API Key is missing. Please configure your environment to receive AI advice.";
  }

  try {
    const model = ai.models;
    const prompt = `
      You are a friendly and motivating financial assistant.
      A user is saving for: "${data.title}".
      
      Details:
      - Target Amount: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(data.targetAmount)}
      - Currently Saved: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(data.savedAmount)}
      - Target Date: ${data.targetDate}
      - Days Remaining: ${data.daysRemaining} days
      
      Please provide a short, encouraging piece of advice (max 2-3 sentences) on how they can reach this goal or praise their progress. 
      Use Indonesian language (Bahasa Indonesia) that is casual, fun, and supportive (using 'kamu').
    `;

    const response = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Tetap semangat menabung! Kamu pasti bisa mencapai tujuanmu.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Maaf, asisten tabungan sedang istirahat. Coba lagi nanti!";
  }
};