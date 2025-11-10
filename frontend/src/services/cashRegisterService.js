import api from './api';

/**
 * Récupérer toutes les caisses
 */
export const getAllCashRegisters = async (params = {}) => {
  const response = await api.get('/cash-registers', { params });
  return response.data;
};

/**
 * Récupérer la caisse active de l'utilisateur
 */
export const getActiveCashRegister = async () => {
  const response = await api.get('/cash-registers/active');
  return response.data;
};

/**
 * Ouvrir une nouvelle caisse
 */
export const openCashRegister = async (data) => {
  const response = await api.post('/cash-registers/open', data);
  return response.data;
};

/**
 * Fermer une caisse
 */
export const closeCashRegister = async (id, data) => {
  const response = await api.post(`/cash-registers/${id}/close`, data);
  return response.data;
};

/**
 * Récupérer une caisse par ID
 */
export const getCashRegisterById = async (id) => {
  const response = await api.get(`/cash-registers/${id}`);
  return response.data;
};
