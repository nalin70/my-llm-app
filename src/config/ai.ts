import { createOpenAI } from '@ai-sdk/openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

export const openaiProvider = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define your default model configurations
export const defaultModel = openaiProvider('gpt-4o-mini'); // Cost-effective & fast
export const reasoningModel = openaiProvider('gpt-4o');    // For complex tasks/tools