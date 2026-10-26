import { apiClient } from './api';

export interface UploadResponse {
  status: string;
  filename: string;
  character_count: number;
  preview: string;
  extracted_text: string;
}

export const documentService = {
  async uploadDocument(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<UploadResponse>('/api/v1/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};