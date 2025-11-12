const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticateToken, requirePermission } = require('../middlewares/auth');
const { PERMISSIONS } = require('../config/permissions');

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

/**
 * @route   GET /api/settings
 * @desc    Récupérer les paramètres du commerce
 * @access  Authentifié
 */
router.get('/', settingsController.getSettings);

/**
 * @route   PUT /api/settings
 * @desc    Mettre à jour les paramètres du commerce
 * @access  Admin uniquement
 */
router.put('/', requirePermission(PERMISSIONS.SETTINGS_UPDATE), settingsController.updateSettings);

module.exports = router;
