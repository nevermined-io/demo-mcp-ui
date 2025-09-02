import { readFileSync, statSync } from "fs";
import { join } from "path";

/**
 * Service for loading and managing prompts from external files.
 * @module promptService
 */

interface CachedPrompt {
  content: string;
  lastModified: number;
}

const promptCache: Map<string, CachedPrompt> = new Map();

/**
 * Loads a prompt from an external file with caching.
 * @param {string} filename - The name of the prompt file
 * @returns {string} The prompt content
 */
export function loadPrompt(filename: string): string {
  try {
    const promptPath = join(process.cwd(), filename);

    // Check if file exists and get its modification time
    const stats = statSync(promptPath);

    // If file hasn't changed since last read, return cached version
    const cached = promptCache.get(filename);
    if (cached && stats.mtime.getTime() <= cached.lastModified) {
      return cached.content;
    }

    // Read the file and cache it
    const prompt = readFileSync(promptPath, "utf-8");
    promptCache.set(filename, {
      content: prompt,
      lastModified: stats.mtime.getTime(),
    });

    console.log(`Prompt ${filename} loaded successfully`);
    return prompt;
  } catch (error) {
    console.error(`Error loading prompt ${filename}:`, error);

    // Return appropriate fallback based on filename
    if (filename === "agent.prompt") {
      return `You are a helpful AI assistant. Please provide accurate and helpful responses to user queries.

If you cannot access the specific prompt file, please respond with general helpful information while noting that the specialized prompt could not be loaded.`;
    } else if (filename === "llm-router.prompt") {
      return `You are an assistant that routes user messages. If you cannot access the specific prompt file, respond with 'no_action' and ask the user to clarify their request.`;
    }

    return `Default prompt for ${filename}. Please provide helpful responses.`;
  }
}

/**
 * Loads the agent prompt from the external file.
 * @returns {string} The agent prompt content
 */
export function loadAgentPrompt(): string {
  return loadPrompt("agent.prompt");
}

/**
 * Loads the LLM router prompt from the external file.
 * @returns {string} The LLM router prompt content
 */
export function loadLLMRouterPrompt(): string {
  return loadPrompt("llm-router.prompt");
}

/**
 * Reloads a specific prompt from file, bypassing cache.
 * @param {string} filename - The name of the prompt file
 * @returns {string} The fresh prompt content
 */
export function reloadPrompt(filename: string): string {
  promptCache.delete(filename);
  return loadPrompt(filename);
}

/**
 * Reloads the agent prompt from file, bypassing cache.
 * @returns {string} The fresh agent prompt content
 */
export function reloadAgentPrompt(): string {
  return reloadPrompt("agent.prompt");
}

/**
 * Reloads the LLM router prompt from file, bypassing cache.
 * @returns {string} The fresh LLM router prompt content
 */
export function reloadLLMRouterPrompt(): string {
  return reloadPrompt("llm-router.prompt");
}

/**
 * Gets the current cached prompt without reloading from file.
 * @param {string} filename - The name of the prompt file
 * @returns {string | null} The cached prompt or null if not loaded
 */
export function getCachedPrompt(filename: string): string | null {
  const cached = promptCache.get(filename);
  return cached ? cached.content : null;
}

/**
 * Gets the current cached agent prompt without reloading from file.
 * @returns {string | null} The cached prompt or null if not loaded
 */
export function getCachedAgentPrompt(): string | null {
  return getCachedPrompt("agent.prompt");
}

/**
 * Gets the current cached LLM router prompt without reloading from file.
 * @returns {string | null} The cached prompt or null if not loaded
 */
export function getCachedLLMRouterPrompt(): string | null {
  return getCachedPrompt("llm-router.prompt");
}
