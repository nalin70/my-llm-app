import { generateObject, generateText, stepCountIs } from 'ai';
import { defaultModel, fallbackReasoningModel, reasoningModel } from '../config/ai';
import { ticketAnalysisSchema } from '../schemas/customer';
import { getMutualFundNavHistoryTool, searchMutualFundsTool } from '../tools/databaseTools';

type ProviderError = {
  message?: string;
  statusCode?: number;
  cause?: { code?: string; message?: string };
  data?: { error?: { code?: number; message?: string; status?: string } };
};

function isProviderAvailabilityError(error: unknown) {
  const maybeApiError = error as ProviderError;
  const statusCode = maybeApiError.statusCode ?? maybeApiError.data?.error?.code;
  const message = `${maybeApiError.message ?? ''} ${maybeApiError.cause?.message ?? ''} ${maybeApiError.data?.error?.message ?? ''}`;

  return (
    statusCode === 400 ||
    statusCode === 401 ||
    statusCode === 403 ||
    statusCode === 404 ||
    statusCode === 429 ||
    statusCode === 503 ||
    maybeApiError.cause?.code === 'UND_ERR_CONNECT_TIMEOUT' ||
    message.toLowerCase().includes('cannot connect to api')
  );
}

function isRetryableProviderError(error: unknown) {
  const maybeApiError = error as ProviderError;
  const statusCode = maybeApiError.statusCode ?? maybeApiError.data?.error?.code;

  return statusCode === 503 || maybeApiError.cause?.code === 'UND_ERR_CONNECT_TIMEOUT';
}

export class AIService {
  
  // Example 1: Getting a strictly typed JSON object back from the LLM
  async analyzeIncomingTicket(userMessage: string) {
    const { object } = await generateObject({
      model: defaultModel,
      schema: ticketAnalysisSchema,
      system: 'You are an AI triaging assistant. Analyze the incoming support ticket.',
      prompt: userMessage,
    });
    
    return object; 
  }

  // Example 2: Conversational response that can autonomously execute tools
  async runSupportAgent(userMessage: string) {
    const generateSupportResponse = (model: typeof reasoningModel) =>
      generateText({
        model,
        system:
          'You are a helpful mutual fund data assistant. Use the available MySQL-backed tools to search mutual funds, retrieve latest NAV values, and inspect NAV history. Do not invent fund data when a tool result is empty; clearly say what was not found.',
        prompt: userMessage,
        tools: {
          searchMutualFunds: searchMutualFundsTool,
          getMutualFundNavHistory: getMutualFundNavHistoryTool,
        },
        stopWhen: stepCountIs(5),
        maxRetries: 0,
      });

    try {
      const { text, toolResults } = await generateSupportResponse(reasoningModel);

      return { response: text, actionsTaken: toolResults };
    } catch (error) {
      if (isRetryableProviderError(error)) {
        try {
          const { text, toolResults } = await generateSupportResponse(fallbackReasoningModel);

          return { response: text, actionsTaken: toolResults };
        } catch (fallbackError) {
          if (!isProviderAvailabilityError(fallbackError)) {
            throw fallbackError;
          }
        }
      }

      if (!isProviderAvailabilityError(error)) {
        throw error;
      }

      const response =
        'I could not complete the Gemini request. Please check your GOOGLE_GENERATIVE_AI_API_KEY, model access, quota, and API access. The MySQL mutual fund tools are configured.';

      return {
        response,
        actionsTaken: [],
      };
    }
  }
}