import axios from 'axios';

const API_BASE = '/api/clients';

export const getClients = async () => {
  const response = await axios.get(API_BASE);
  return response.data;
};

export const getClient = async (clientId: string) => {
  const response = await axios.get(`${API_BASE}/${clientId}`);
  return response.data;
};

export const sendMessage = async (clientId: string, message: string) => {
  const response = await axios.post(`${API_BASE}/${clientId}/send`, message, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
  return response.data;
};

export const getMessages = async (clientId: string) => {
  const response = await axios.get(`${API_BASE}/${clientId}/messages`);
  return response.data;
};
