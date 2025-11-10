import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Récupérer toutes les caisses
 */
export const getAllCashRegisters = async (params = {}) => {
  const token = localStorage.getItem('pos_token');
  const response = await axios.get(`${API_URL}/api/cash-registers`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  });
  return response.data;
};

/**
 * Récupérer la caisse active de l'utilisateur
 */
export const getActiveCashRegister = async () => {
  const token = localStorage.getItem('pos_token');
  const response = await axios.get(`${API_URL}/api/cash-registers/active`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Ouvrir une nouvelle caisse
 */
export const openCashRegister = async (data) => {
  const token = localStorage.getItem('pos_token');
  const response = await axios.post(
    `${API_URL}/api/cash-registers/open`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
};

/**
 * Fermer une caisse
 */
export const closeCashRegister = async (id, data) => {
  const token = localStorage.getItem('pos_token');
  const response = await axios.post(
    `${API_URL}/api/cash-registers/${id}/close`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
};

/**
 * Récupérer une caisse par ID
 */
export const getCashRegisterById = async (id) => {
  const token = localStorage.getItem('pos_token');
  const response = await axios.get(`${API_URL}/api/cash-registers/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
