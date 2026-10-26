import { apiClient } from './api.ts';

export const generateService = {
  async extractRequirements(extractedText: string) {
    const response = await apiClient.post('/api/v1/generate/extract-requirements', {
      extracted_text: extractedText,
    });
    return response.data.requirements;
  },

  async synthesizeSuite(requirements: any[]) {
    const response = await apiClient.post('/api/v1/generate/synthesize-suite', {
      requirements,
    });
    return response.data;
  },
};