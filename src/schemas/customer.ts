import { z } from 'zod';

export const ticketAnalysisSchema = z.object({
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  category: z.enum(['billing', 'technical', 'general']),
  summary: z.string().describe('A one-sentence summary of the user issue.'),
  requiresUrgentEscalation: z.boolean(),
});

export type TicketAnalysis = z.infer<typeof ticketAnalysisSchema>;