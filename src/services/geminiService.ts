import { GoogleGenAI, Type } from "@google/genai";
import { DiagnosisResult, AdviceResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const DIAGNOSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    problem: { type: Type.STRING, description: "Name of the problem/disease" },
    cause: { type: Type.STRING, description: "Likely cause" },
    whatToDo: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Immediate actions"
    },
    prevention: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "How to prevent this in the future"
    },
    confidence: { type: Type.NUMBER, description: "Confidence score 0-1" },
    cropType: { type: Type.STRING, description: "Detected crop name" },
    diseaseName: { type: Type.STRING, description: "Scientific or common name of disease" },
    treatmentPlan: { type: Type.STRING, description: "Specific treatment protocol" }
  },
  required: ["problem", "cause", "whatToDo", "prevention", "confidence", "cropType", "diseaseName", "treatmentPlan"]
};

const ADVICE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    answer: { type: Type.STRING, description: "Simple yes/no or short decision on watering" },
    whatYouShouldDo: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "2-3 short, practical steps"
    }
  },
  required: ["answer", "whatYouShouldDo"]
};

const DIAGNOSIS_SYSTEM_INSTRUCTION = `You are an expert tropical agricultural scientist specializing in smallholder farming systems. 
Your goal is to provide accurate, low-cost, and organic-first diagnosis of crop issues from photos. 
Always prioritize solutions that are accessible to farmers with limited resources (e.g., neem oil, wood ash, crop rotation).
Use VERY simple language. Avoid technical terms.
If you are unsure, you MUST include the phrase: "I am not fully sure. Please check with a local expert." in the Cause section.
Output valid JSON according to the provided schema.`;

const WATERING_SYSTEM_INSTRUCTION = `You are a practical irrigation expert for smallholder farmers.
Based on the temperature, rain probability, and humidity provided, decide if the farmer should water their crops.
Prioritize water conservation. Suggest the best time (morning/evening) and avoid overwatering if rain is likely.
Keep advice short, practical, and in very simple language.`;

/**
 * Diagnoses a crop issue from a base64 image.
 */
export async function diagnoseCrop(base64Image: string, mimeType: string): Promise<DiagnosisResult> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        { inlineData: { data: base64Image, mimeType } },
        { text: "Focus ONLY on the cropped/selected region of the plant. Identify if it is healthy, diseased, or stressed. Provide simple advice for a smallholder farmer." }
      ],
      config: {
        systemInstruction: DIAGNOSIS_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: DIAGNOSIS_SCHEMA,
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No diagnosis received from the AI.");
    }

    return JSON.parse(text) as DiagnosisResult;
  } catch (error) {
    console.error("AI Diagnosis Error:", error);
    throw error;
  }
}

/**
 * Provides watering advice based on weather data.
 */
export async function getWateringAdvice(weather: { temperature: number, rainProbability: number, humidity: number }): Promise<AdviceResult> {
  try {
    const prompt = `Temperature: ${weather.temperature}°C, Rain Probability: ${weather.rainProbability}%, Humidity: ${weather.humidity}%. Should I water my crops? Provide answer and 2-3 specific steps.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        systemInstruction: WATERING_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: ADVICE_SCHEMA,
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No advice received from the AI.");
    }

    return JSON.parse(text) as AdviceResult;
  } catch (error) {
    console.error("AI Watering Advice Error:", error);
    throw error;
  }
}

/**
 * Provides general farming advice based on a text question.
 */
export async function getFarmingAdvice(question: string): Promise<AdviceResult> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: question,
      config: {
        systemInstruction: "You are a friendly agricultural advisor (AgriAssist) helping smallholder farmers with general farming questions. Provide practical, sustainable, and climate-smart advice. Use simple language.",
        responseMimeType: "application/json",
        responseSchema: ADVICE_SCHEMA,
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No advice received from the AI.");
    }

    return JSON.parse(text) as AdviceResult;
  } catch (error) {
    console.error("AI Advice Error:", error);
    throw error;
  }
}
