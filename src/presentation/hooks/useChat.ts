/**
 * Presentation Hook: useChat
 * Presenter for the AI Assistant chatbot.
 * Wires up the ChatWithAI use-case with React state.
 */

import { useState, useCallback } from 'react';
import { aiService } from '../../infrastructure/gateways';
import { ChatWithAIUseCase } from '../../application/use-cases';

interface MessageLog {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

interface UseChatReturn {
  messages: MessageLog[];
  loading: boolean;
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => void;
}

// Singleton use-case instance (preserves rate-limit count across renders)
const chatUseCase = new ChatWithAIUseCase(aiService);

const INITIAL_MESSAGE: MessageLog = {
  sender: 'bot',
  text: "Hello! I'm Addisu's AI Career Assistant. Ask me about his projects, skills, experience, or how to get in touch. I'm here to help recruiters and collaborators learn more!",
  timestamp: new Date()
};

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<MessageLog[]>([INITIAL_MESSAGE]);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (text: string): Promise<void> => {
    if (!text.trim()) return;

    const userMsg: MessageLog = { sender: 'user', text: text.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await chatUseCase.execute(text);
      const botMsg: MessageLog = { sender: 'bot', text: response, timestamp: new Date() };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      const errMsg: MessageLog = {
        sender: 'bot',
        text: 'Sorry, I encountered an issue. Please try again or contact Addisu directly.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearChat = useCallback(() => {
    chatUseCase.resetSession();
    setMessages([INITIAL_MESSAGE]);
  }, []);

  return { messages, loading, sendMessage, clearChat };
}
