import { createGoogleGenerativeAI } from '@ai-sdk/google';

if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  throw new Error('Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable');
}

export const googleProvider = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const defaultModel = googleProvider('gemini-2.0-flash');
export const reasoningModel = googleProvider('gemini-2.5-flash');
export const fallbackReasoningModel = googleProvider('gemini-2.0-flash');