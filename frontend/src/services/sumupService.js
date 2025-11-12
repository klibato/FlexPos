import api from './api';

/**
 * Service SumUp pour les paiements par terminal
 */

/**
 * Vérifier le statut de SumUp (configuration et connexion)
 */
export const getSumUpStatus = async () => {
  const response = await api.get('/sumup/status');
  return response.data;
};

/**
 * Créer un checkout SumUp
 * @param {Object} data - Données du checkout
 * @param {number} data.amount - Montant
 * @param {string} data.currency - Devise (EUR)
 * @param {string} data.reference - Référence unique
 * @param {string} data.description - Description
 */
export const createSumUpCheckout = async (data) => {
  const response = await api.post('/sumup/checkout', data);
  return response.data;
};

/**
 * Vérifier le statut d'un checkout
 * @param {string} checkoutId - ID du checkout
 */
export const getSumUpCheckoutStatus = async (checkoutId) => {
  const response = await api.get(`/sumup/checkout/${checkoutId}`);
  return response.data;
};

/**
 * Traiter un paiement SumUp complet
 * @param {Object} data - Données du paiement
 * @param {number} data.amount - Montant
 * @param {string} data.reference - Référence unique (ticket_number)
 */
export const processSumUpPayment = async (data) => {
  const response = await api.post('/sumup/process', data);
  return response.data;
};
