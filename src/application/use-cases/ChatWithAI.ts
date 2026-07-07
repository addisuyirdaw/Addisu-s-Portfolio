/**
 * Use Case: ChatWithAI
 * Handles communication with the AI service for the floating chatbot assistant.
 * Enforces rate-limit counters and sanitizes user queries before transmission.
 */

import type { AIService } from '../ports';
import { InputSanitizer } from '../../domain/services';

export interface ChatContext {
  projects?: string[];
  skills?: string[];
  name?: string;
}

export class ChatWithAIUseCase {
  private aiService: AIService;
  private requestCount = 0;
  private readonly maxRequestsPerSession = 20;

  constructor(aiService: AIService) {
    this.aiService = aiService;
  }

  async execute(userMessage: string, context: ChatContext = {}): Promise<string> {
    // Rate limiting guard
    if (this.requestCount >= this.maxRequestsPerSession) {
      return "You've reached the session chat limit. Please refresh or contact Addisu directly via the contact form.";
    }

    // Sanitize and validate
    const cleanMessage = InputSanitizer.sanitizeText(userMessage);
    if (!cleanMessage || cleanMessage.length < 2) {
      return 'Please type a question to get started.';
    }
    if (cleanMessage.length > 500) {
      return 'Please keep your question under 500 characters.';
    }

    this.requestCount++;
    return this.aiService.askQuestion(cleanMessage, context);
  }

  resetSession(): void {
    this.requestCount = 0;
  }
}
