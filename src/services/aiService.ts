import { generateObject, generateText } from 'ai';
import { defaultModel, reasoningModel } from '../config/ai';
import { ticketAnalysisSchema } from '../schemas/customer';
import { customerLookupTool } from '../tools/databaseTools';

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
    const { text, toolResults } = await generateText({
      model: reasoningModel,
      system: 'You are a helpful customer support agent. Use tools to look up customer data if they provide an email.',
      prompt: userMessage,
      tools: {
        lookupCustomer: customerLookupTool,
      },
      maxSteps: 5, // Allows the agent to loop: call tool -> see result -> answer user
    });

    return { response: text, actionsTaken: toolResults };
  }
}