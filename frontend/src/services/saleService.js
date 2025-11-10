import api from './api';

/**
 * Service pour gérer les ventes via l'API
 */

/**
 * Créer une nouvelle vente
 * @param {Object} saleData - Données de la vente
 * @param {Array} saleData.items - Items du panier
 * @param {string} saleData.payment_method - Méthode de paiement
 * @param {number} saleData.amount_paid - Montant payé
 * @param {Object} saleData.payment_details - Détails paiement (optionnel)
 * @returns {Promise<Object>} Vente créée
 */
export const createSale = async (saleData) => {
  try {
    const response = await api.post('/sales', saleData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de la vente:', error);
    throw error;
  }
};

/**
 * Récupérer toutes les ventes
 * @param {Object} filters - Filtres optionnels
 * @returns {Promise<Object>} Liste des ventes
 */
export const getAllSales = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.payment_method) params.append('payment_method', filters.payment_method);
    if (filters.status) params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);

    const response = await api.get(`/sales?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors du chargement des ventes:', error);
    throw error;
  }
};

/**
 * Récupérer une vente par ID
 * @param {number} id - ID de la vente
 * @returns {Promise<Object>} Vente
 */
export const getSaleById = async (id) => {
  try {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors du chargement de la vente ${id}:`, error);
    throw error;
  }
};
