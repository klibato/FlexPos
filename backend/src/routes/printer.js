const express = require('express');
const router = express.Router();
const printerController = require('../controllers/printerController');
const { authenticateToken } = require('../middlewares/auth');
const tenantIsolation = require('../middlewares/tenantIsolation');

/**
 * Routes pour l'impression ESC/POS
 */

// ✅ FIX CVE-FLEXPOS-007: Forcer isolation multi-tenant
router.use(tenantIsolation);

// POST /api/printer/test - Imprimer un ticket de test
router.post('/test', authenticateToken, printerController.printTest);

// POST /api/printer/sale/:id - Réimprimer un ticket de vente
router.post('/sale/:id', authenticateToken, printerController.reprintSale);

// POST /api/printer/x-report - Imprimer un ticket X
router.post('/x-report', authenticateToken, printerController.printXReport);

// POST /api/printer/z-report/:registerId - Imprimer un ticket Z
router.post('/z-report/:registerId', authenticateToken, printerController.printZReport);

module.exports = router;
