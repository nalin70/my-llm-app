import 'dotenv/config';
import { AIService } from './services/aiService';

const aiService = new AIService();

async function main() {
  const result = await aiService.runSupportAgent(
    "Hi, I want to check my account status. My email is jane@example.com."
  );
  console.log('Response:', result.response);
  console.log('Tool results:', JSON.stringify(result.actionsTaken, null, 2));
}

main().catch(console.error);