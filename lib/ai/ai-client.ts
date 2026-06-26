import { createAzure } from '@ai-sdk/azure';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject, generateText } from 'ai';

const requiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
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

const deployment = requiredEnv('DEPLOYMENT');

export const aiModel = azure(deployment);

let _openaiModel: ReturnType<ReturnType<typeof createOpenAI>> | null = null;
const openaiApiKey = process.env.OPENAI_API_KEY;
if (openaiApiKey) {
  const openai = createOpenAI({ apiKey: openaiApiKey });
  _openaiModel = openai('gpt-4o');
}

export function getFallbackModel() {
  return _openaiModel;
}

export async function generateObjectWithFallback<T>(
  params: {
    schema: any;
    prompt: string;
    experimental_repairText?: any;
  },
): Promise<{ object: T }> {
  const callArgs: any = { prompt: params.prompt, schema: params.schema };
  if (params.experimental_repairText) callArgs.experimental_repairText = params.experimental_repairText;

  try {
    return await generateObject({ model: aiModel, ...callArgs });
  } catch (err) {
    const fallback = getFallbackModel();
    if (!fallback) throw err;
    console.warn('Azure OpenAI failed, falling back to OpenAI:', (err as Error).message);
    return await generateObject({ model: fallback, ...callArgs });
  }
}

export async function generateTextWithFallback(params: {
  prompt: string;
}): Promise<{ text: string }> {
  try {
    return await generateText({ model: aiModel, ...params });
  } catch (err) {
    const fallback = getFallbackModel();
    if (!fallback) throw err;
    console.warn('Azure OpenAI failed, falling back to OpenAI:', (err as Error).message);
    return await generateText({ model: fallback, ...params });
  }
}
