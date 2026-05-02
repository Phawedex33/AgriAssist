/**
 * @file types.ts
 * @description Core TypeScript interfaces for the AgriAssist application.
 */

/**
 * Result of a crop diagnosis from an image.
 */
export interface DiagnosisResult {
  problem: string;
  cause: string;
  whatToDo: string[];
  prevention: string[];
  confidence: number; // 0-1
  cropType: string;
  diseaseName: string;
  treatmentPlan: string;
}

/**
 * Custom watering schedule for a crop.
 */
export interface WateringSchedule {
  id: string;
  userId: string;
  cropName: string;
  frequency: 'daily' | 'twice-daily' | 'alternate-days' | 'weekly';
  preferredTime: string; // e.g., "06:00"
  notes?: string;
  createdAt: number;
}

/**
 * Result of a general farming advice query.
 */
export interface AdviceResult {
  answer: string;
  whatYouShouldDo: string[];
}

/**
 * Message interface for the chat component.
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
