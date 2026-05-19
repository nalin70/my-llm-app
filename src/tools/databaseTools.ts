import { tool } from 'ai';
import { z } from 'zod';

export const customerLookupTool = tool({
  description: 'Lookup customer details and lifetime value by their email address.',
  parameters: z.object({
    email: z.string().email().describe('The email address of the customer'),
  }),
  execute: async ({ email }) => {
    // Mock database call
    return {
      customerId: 'cust_98742',
      name: 'Jane Doe',
      status: 'VIP',
      joinDate: '2023-01-15',
    };
  },
});