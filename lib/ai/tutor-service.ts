import { createAzure } from '@ai-sdk/azure';

export const TUTOR_SYSTEM_PROMPT = `You are the AralGo AI Study Companion, a Socratic tutor.
Your goal is to guide the student to the answer by asking questions, not by giving the answer directly.
Keep your responses brief, friendly, and encouraging.
Use emojis sparingly.
If the student is struggling, provide a small hint.
Never do their homework for them.`;

const requiredEnv = (name: string) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const getAzureResourceName = () => {
  const endpoint = requiredEnv('ENDPOINT');

  try {
    return new URL(endpoint).hostname.split('.')[0];
  } catch {
    return endpoint.replace('https://', '').split('.')[0];
  }
};

const azure = createAzure({
  resourceName: getAzureResourceName(),
  apiKey: requiredEnv('API_KEY'),
});

export const tutorModel = azure(requiredEnv('DEPLOYMENT'));
