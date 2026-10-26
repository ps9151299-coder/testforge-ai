import axios from 'axios';

export const apiClient = axios.create({
 baseURL: import.meta.env.VITE_API_BASE_URL || 'https://testforge-ai-rgji.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});