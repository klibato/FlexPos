const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const { tenantIsolation } = require('../middlewares/tenantIsolation');
const subscriptionController = require('../controllers/subscriptionController');

/**
 * Middleware: Vérifier l'authentification et l'organisation
 */
router.use(authenticateToken);
router.use(tenantIsolation);

/**
 * GET /api/subscriptions/current
 * Récupérer l'abonnement actuel
 */
router.get('/current', subscriptionController.getCurrentSubscription);

/**
 * GET /api/subscriptions/plans
 * Récupérer les plans disponibles
 */
router.get('/plans', subscriptionController.getAvailablePlans);

/**
 * GET /api/subscriptions/invoices
 * Récupérer les factures
 */
router.get('/invoices', subscriptionController.getInvoices);

/**
 * POST /api/subscriptions/create-checkout
 * Créer une session checkout Stripe
 */
router.post('/create-checkout', subscriptionController.createCheckoutSession);

/**
 * POST /api/subscriptions/upgrade
 * Mettre à jour l'abonnement
 */
router.post('/upgrade', subscriptionController.upgradeSubscription);

/**
 * POST /api/subscriptions/cancel
 * Annuler l'abonnement
 */
router.post('/cancel', subscriptionController.cancelSubscription);

/**
 * POST /api/subscriptions/validate-checkout
 * Valider une session checkout
 */
router.post('/validate-checkout', subscriptionController.validateCheckout);

module.exports = router;
