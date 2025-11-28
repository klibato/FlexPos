const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const { tenantIsolation } = require('../middlewares/tenantIsolation');
const invoiceController = require('../controllers/invoiceController');

/**
 * Middleware: Vérifier l'authentification et l'organisation
 */
router.use(authenticateToken);
router.use(tenantIsolation);

/**
 * GET /api/invoices
 * Récupérer les factures de l'organisation
 */
router.get('/', invoiceController.getInvoices);

/**
 * GET /api/invoices/:id
 * Récupérer une facture spécifique
 */
router.get('/:id', invoiceController.getInvoice);

/**
 * GET /api/invoices/:id/download
 * Télécharger une facture au format PDF
 */
router.get('/:id/download', invoiceController.downloadInvoicePDF);

module.exports = router;
