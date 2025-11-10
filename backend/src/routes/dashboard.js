const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getSalesByCategory,
} = require('../controllers/dashboardController');
const { authenticateToken } = require('../middlewares/auth');

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

/**
 * @route   GET /api/dashboard/stats
 * @desc    Récupérer les statistiques du dashboard
 * @access  Authentifié
 * @query   period - today|week|month|year
 */
router.get('/stats', getDashboardStats);

/**
 * @route   GET /api/dashboard/sales-by-category
 * @desc    Récupérer les ventes par catégorie
 * @access  Authentifié
 * @query   period - today|week|month|year
 */
router.get('/sales-by-category', getSalesByCategory);

module.exports = router;
