import { useState, useEffect, useCallback } from 'react';
import { getAllProducts } from '../services/productService';

/**
 * Hook personnalisé pour gérer les produits avec cache
 * Objectif : temps de réponse < 100ms
 */
export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Cache des produits pour éviter les appels API répétés
  const [cache, setCache] = useState({});

  /**
   * Charger les produits (avec cache)
   */
  const loadProducts = useCallback(async (category = 'all') => {
    // Vérifier le cache d'abord
    if (cache[category]) {
      setProducts(cache[category]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const filters = category !== 'all' ? { category } : {};
      const data = await getAllProducts(filters);

      // Mettre en cache
      setCache((prev) => ({
        ...prev,
        [category]: data,
      }));

      setProducts(data);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des produits');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [cache]);

  /**
   * Changer de catégorie
   */
  const changeCategory = useCallback((category) => {
    setSelectedCategory(category);
    loadProducts(category);
  }, [loadProducts]);

  /**
   * Rafraîchir les produits (vider le cache)
   */
  const refresh = useCallback(() => {
    setCache({});
    loadProducts(selectedCategory);
  }, [selectedCategory, loadProducts]);

  /**
   * Filtrer les produits localement (ultra-rapide)
   */
  const filterProducts = useCallback((searchTerm) => {
    if (!searchTerm) return products;

    return products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products]);

  // Charger les produits au montage du composant
  useEffect(() => {
    loadProducts('all');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    products,
    loading,
    error,
    selectedCategory,
    changeCategory,
    refresh,
    filterProducts,
  };
};
