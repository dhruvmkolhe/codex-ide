import { z } from 'zod';

/**
 * Schema for code files.
 */
export const fileSchema = z.object({
  name: z.string().min(1).max(255),
  content: z.string(),
});

export const filesSchema = z.array(fileSchema);

/**
 * Schema for shared code payloads (from URL hash).
 */
export const sharedCodeSchema = z.object({
  files: filesSchema,
  selectedLanguage: z.string().min(1).max(50),
});

/**
 * Schema for chat history items.
 */
export const chatItemSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
});

export const chatHistorySchema = z.array(chatItemSchema);

/**
 * Schema for stdin map.
 */
export const stdinMapSchema = z.record(z.string(), z.string());
