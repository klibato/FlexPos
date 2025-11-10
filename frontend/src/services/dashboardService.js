import api from './api';

/**
 * Récupérer les statistiques du dashboard
 */
export const getDashboardStats = async (period = 'today') => {
  const response = await api.get('/dashboard/stats', { params: { period } });
  return response.data;
};

/**
 * Récupérer les ventes par catégorie
 */
export const getSalesByCategory = async (period = 'today') => {
  const response = await api.get('/dashboard/sales-by-category', { params: { period } });
  return response.data;
};
