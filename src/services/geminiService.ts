/**
 * @file geminiService.ts
 * @description Service for interacting with the Google Gemini API for crop diagnosis and farming advice.
 */

import { GoogleGenAI } from "@google/genai";
import { 
  DIAGNOSIS_SYSTEM_INSTRUCTION, 
  ADVICE_SYSTEM_INSTRUCTION, 
  DIAGNOSIS_SCHEMA, 
  ADVICE_SCHEMA 
} from "../constants";
import { DiagnosisResult, AdviceResult } from "../types";

// Initialize the Gemini AI client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Diagnoses a crop issue from a base64 encoded image.
 * 
 * @param base64Image - The image to diagnose as a base64 string.
 * @param mimeType - The MIME type of the image (e.g., "image/jpeg").
 * @returns A structured diagnosis result.
 * @throws Error if the API call fails or connectivity is lost.
 */
export async function diagnoseCrop(base64Image: string, mimeType: string): Promise<DiagnosisResult> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        { inlineData: { data: base64Image, mimeType } },
        { text: "Diagnose this crop issue and provide actionable advice for a smallholder farmer." }
      ],
      config: {
        systemInstruction: DIAGNOSIS_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: DIAGNOSIS_SCHEMA,
      },
    });

    if (!response.text) {
      throw new Error("No diagnosis received from the AI.");
    }

    return JSON.parse(response.text) as DiagnosisResult;
  } catch (error) {
    console.error("AI Diagnosis Error:", error);
    // Provide a fallback response if something goes wrong
    return {
      problem: "Unidentified issue",
      cause: "I'm having trouble analyzing this image right now. This could be due to low light or poor connection.",
      whatToDo: [
        "Check your internet connection",
        "Try taking another photo in clearer light",
        "Consult your local agricultural officer if the issue persists"
      ],
      prevention: [
        "Keep the crop area clear of weeds",
        "Monitor for changes daily"
      ],
      confidence: 0,
      cropType: "Unknown",
      diseaseName: "Unknown",
      treatmentPlan: "Consult an expert."
    };
  }
}

/**
 * Provides general farming advice based on a text prompt.
 * 
 * @param question - The farmer's question.
 * @returns A structured advice result.
 */
export async function getFarmingAdvice(question: string): Promise<AdviceResult> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: question,
      config: {
        systemInstruction: ADVICE_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: ADVICE_SCHEMA,
      },
    });

    if (!response.text) {
      throw new Error("No advice received from the AI.");
    }

    return JSON.parse(response.text) as AdviceResult;
  } catch (error) {
    console.error("AI Advice Error:", error);
    return {
      answer: "I'm sorry, I cannot provide specific advice at the moment.",
      whatYouShouldDo: [
        "Try asking your question differently",
        "Check your internet connection",
        "Consult a local expert"
      ]
    };
  }
}
