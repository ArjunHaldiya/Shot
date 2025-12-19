import axios from 'axios';

// Base URL for our Python backend
const API_BASE_URL = (import.meta.env.VITE_API_URL ||"http://localhost:8000").replace(/\/$/, "");

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== MOOD API ====================

/**
 * Get all mood questions from backend
 */
export const getMoodQuestions = async () => {
  const response = await api.get('/mood/questions');
  return response.data;
};

/**
 * Submit mood answers and get drink suggestions
 */
export const getSuggestions = async (answers, preference) => {
  const response = await api.post('/mood/suggest', {
    answers,
    preference,
  });
  return response.data;
};

// ==================== PARTY API ====================

/**
 * Create a new party
 */
export const createParty = async (hostName, durationHours) => {
  const response = await api.post('/party/create', {
    host_name: hostName,
    duration_hours: durationHours,
  });
  return response.data;
};

/**
 * Join an existing party
 */
export const joinParty = async (partyCode, userName) => {
  const response = await api.post(`/party/${partyCode}/join`, {
    user_name: userName,
  });
  return response.data;
};

/**
 * Get current party status
 */
export const getPartyStatus = async (partyCode) => {
  const response = await api.get(`/party/${partyCode}/status`);
  return response.data;
};

/**
 * Upload a photo to the party
 */
export const uploadPhoto = async (partyCode, file, userName) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('user_name', userName);

  const response = await api.post(`/party/${partyCode}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Get all party photos (only works after party ends)
 */
export const getPartyPhotos = async (partyCode) => {
  const response = await api.get(`/party/${partyCode}/photos`);
  return response.data;
};

export default api;