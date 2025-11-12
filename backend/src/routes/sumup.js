const express = require('express');
const router = express.Router();
const sumupController = require('../controllers/sumupController');
const { authenticateToken } = require('../middlewares/auth');

/**
 * Routes pour l'intégration SumUp
 */

// GET /api/sumup/status - Vérifier le statut SumUp
router.get('/status', authenticateToken, sumupController.getStatus);

// POST /api/sumup/checkout - Créer un checkout SumUp
router.post('/checkout', authenticateToken, sumupController.createCheckout);

// GET /api/sumup/checkout/:checkoutId - Vérifier le statut d'un checkout
router.get('/checkout/:checkoutId', authenticateToken, sumupController.getCheckoutStatus);

// POST /api/sumup/process - Traiter un paiement SumUp
router.post('/process', authenticateToken, sumupController.processPayment);

module.exports = router;
