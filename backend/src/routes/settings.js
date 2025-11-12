const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticateToken, requirePermission } = require('../middlewares/auth');
const { PERMISSIONS } = require('../config/permissions');

/**
 * @route   GET /api/settings/config
 * @desc    Récupérer la configuration publique du commerce (catégories, TVA, paiements, thème)
 * @access  Public (pas d'authentification requise)
 */
router.get('/config', settingsController.getPublicConfig);

/**
 * @route   GET /api/settings
 * @desc    Récupérer les paramètres du commerce
 * @access  Authentifié
 */
router.get('/', authenticateToken, settingsController.getSettings);

/**
 * @route   PUT /api/settings
 * @desc    Mettre à jour les paramètres du commerce
 * @access  Admin uniquement
 */
router.put('/', authenticateToken, requirePermission(PERMISSIONS.SETTINGS_UPDATE), settingsController.updateSettings);

module.exports = router;
