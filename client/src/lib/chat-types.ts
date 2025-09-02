/**
 * Tipos e interfaces para el contexto de chat.
 * @module chat-types
 */

import { Conversation } from "@shared/schema";

/**
 * FullMessage for chat context, compatible with all message types including 'warning'.
 * @typedef {Object} FullMessage
 * @property {number} id
 * @property {string} conversationId
 * @property {Date | null} timestamp
 * @property {boolean} isUser
 * @property {"answer" | "final-answer" | "transaction" | "nvm-transaction-user" | "nvm-transaction-agent" | "error" | "warning" | "usd-info" | "notice" | "thinking"} type
 * @property {string} content
 * @property {string} [txHash]
 * @property {{ mimeType: string; parts: string[] }} [artifacts]
 * @property {number} [credits]
 * @property {string} [planId]
 */
export interface FullMessage {
  id: number;
  conversationId: string;
  timestamp: Date | null;
  isUser: boolean;
  type:
    | "answer"
    | "final-answer"
    | "transaction"
    | "nvm-transaction-user"
    | "nvm-transaction-agent"
    | "error"
    | "warning"
    | "usd-info"
    | "notice"
    | "thinking";
  content: string;
  txHash?: string;
  /**
   * Credits consumed in nvm-transaction
   */
  credits?: number;
  /**
   * Plan DID for nvm-transaction
   */
  planId?: string;
  /**
   * Optional artifacts for media or extra data (images, audio, video, text, etc)
   * @type {{ mimeType: string; parts: string[] }}
   */
  artifacts?: {
    mimeType: string;
    parts: string[];
  };
}

/**
 * Interfaz para el contexto de chat de React.
 * @typedef {Object} ChatContextType
 */
export interface ChatContextType {
  messages: FullMessage[];
  conversations: Conversation[];
  currentConversationId: number | null;
  isStoredConversation: boolean;
  sendMessage: (content: string) => void;
  setCurrentConversationId: (id: number | null) => void;
  startNewConversation: () => void;
  onMessageTypingComplete: () => void;
  /**
   * Clears all conversation history from memory and localStorage.
   */
  clearHistory: () => void;
}
