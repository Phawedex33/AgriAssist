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
