import api from './api';

/**
 * Récupérer la configuration publique du commerce
 * (Accessible sans authentification)
 */
export const getPublicConfig = async () => {
  const response = await api.get('/settings/config');
  return response.data;
};

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
