import api from './api';

/**
 * Service pour gérer les produits via l'API
 */

/**
 * Récupérer tous les produits (avec cache)
 * @param {Object} filters - Filtres optionnels { category, is_menu }
 * @returns {Promise<Array>} Liste des produits
 */
export const getAllProducts = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.category) {
      params.append('category', filters.category);
    }

    if (filters.is_menu !== undefined) {
      params.append('is_menu', filters.is_menu);
    }

    const response = await api.get(`/products?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors du chargement des produits:', error);
    throw error;
  }
};

/**
 * Récupérer les produits par catégorie
 * @param {string} category - Catégorie (burgers, sides, drinks, desserts, menus)
 * @returns {Promise<Array>} Liste des produits
 */
export const getProductsByCategory = async (category) => {
  try {
    const response = await api.get(`/products/category/${category}`);
    return response.data.data;
  } catch (error) {
    console.error(`Erreur lors du chargement des produits ${category}:`, error);
    throw error;
  }
};

/**
 * Récupérer un produit par ID
 * @param {number} id - ID du produit
 * @returns {Promise<Object>} Produit
 */
export const getProductById = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Erreur lors du chargement du produit ${id}:`, error);
    throw error;
  }
};
