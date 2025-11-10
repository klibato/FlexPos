const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const { authenticateToken } = require('../middlewares/auth');

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// POST /api/sales - Créer une vente
router.post('/', saleController.createSale);

// GET /api/sales - Récupérer toutes les ventes
router.get('/', saleController.getAllSales);

// GET /api/sales/:id - Récupérer une vente
router.get('/:id', saleController.getSaleById);

module.exports = router;
