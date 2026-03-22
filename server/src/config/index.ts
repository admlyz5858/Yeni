import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  notebooklm: {
    projectNumber: process.env.GCP_PROJECT_NUMBER || '',
    location: process.env.GCP_LOCATION || 'us',
    baseUrl: process.env.NOTEBOOKLM_BASE_URL || 'https://us-discoveryengine.googleapis.com/v1alpha',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
  },
};

export function hasNotebookLMConfig(): boolean {
  return !!(config.notebooklm.projectNumber && config.supabase.url && config.supabase.serviceRoleKey);
}

export function hasGeminiConfig(): boolean {
  return !!config.gemini.apiKey;
}
