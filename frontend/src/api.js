import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

export const verifyClaim = async (text) => {
  try {
    const response = await api.post('/api/verify', { text });
    return response.data;
  } catch (error) {
    console.error('Error verifying claim:', error);
    throw error;
  }
};
