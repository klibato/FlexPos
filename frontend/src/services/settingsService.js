import api from './api';

/**
 * Récupérer les paramètres du commerce
 */
export const getSettings = async () => {
  const response = await api.get('/settings');
  return response.data;
};

/**
 * Mettre à jour les paramètres du commerce
 */
export const updateSettings = async (settings) => {
  const response = await api.put('/settings', settings);
  return response.data;
};
