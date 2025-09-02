/**
 * Datos simulados para el chat.
 * @module chat-mocks
 */

import { Conversation } from "@shared/schema";
import { FullMessage } from "./chat-types";

export const storedConversations: Conversation[] = [];
export const storedMessages: { [key: number]: FullMessage[] } = {};
