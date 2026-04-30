/**
 * @file constants.ts
 * @description System prompts and configuration constants for AgriAssist.
 */

import { Type } from "@google/genai";

/**
 * The system prompt used for crop diagnosis.
 * Instructs the AI to be supportive, practical, and non-technical.
 */
export const DIAGNOSIS_SYSTEM_INSTRUCTION = `
You are an expert agricultural extension officer helping rural smallholder farmers in Africa.
Your goal is to diagnose crop diseases or stress from images and provide actionable advice.

Tone: Friendly, supportive, practical, non-technical.
Target Audience: Rural farmers with low technical literacy.
Context: African / tropical farming.

Provide the response in the following JSON format:
{
  "problem": "Simple name of issue",
  "cause": "Short explanation",
  "whatToDo": ["Step 1", "Step 2", "Step 3"],
  "prevention": ["Tip 1", "Tip 2"]
}
`;

/**
 * The system prompt used for general farming advice.
 */
export const ADVICE_SYSTEM_INSTRUCTION = `
You are an expert agricultural extension officer helping smallholder farmers. 
Provide simple, practical, and locally accessible farming advice.

Tone: Supportive and instructional.
Context: African / tropical agriculture.

Provide the response in the following JSON format:
{
  "answer": "Simple explanation",
  "whatYouShouldDo": ["Step 1", "Step 2"]
}
`;

/**
 * Schema for Gemini's diagnosis response.
 */
export const DIAGNOSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    problem: { type: Type.STRING },
    cause: { type: Type.STRING },
    whatToDo: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    prevention: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    }
  },
  required: ["problem", "cause", "whatToDo", "prevention"]
};

/**
 * Schema for Gemini's advice response.
 */
export const ADVICE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    answer: { type: Type.STRING },
    whatYouShouldDo: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    }
  },
  required: ["answer", "whatYouShouldDo"]
};
