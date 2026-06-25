import { createAzure } from '@ai-sdk/azure';

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

export const aiModel = azure(requiredEnv('DEPLOYMENT'));
