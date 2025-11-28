const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

/**
 * POST /api/public/signup
 * Inscription publique d'une nouvelle organisation
 *
 * Body:
 * - organization_name: string (required)
 * - email: string (required)
 * - phone: string (optional)
 * - first_name: string (optional)
 * - last_name: string (optional)
 * - password: string (required, min 8 chars)
 */
router.post('/signup', publicController.signup);

/**
 * POST /api/public/auth/signup
 * Inscription publique simplifiée (pour wizard onboarding)
 * Crée une organisation avec trial 30 jours
 *
 * Body:
 * - organizationName: string (required)
 * - email: string (required)
 * - phone: string (optional)
 */
router.post('/auth/signup', publicController.signupSimplified);

/**
 * GET /api/public/check-slug?slug=mon-restaurant
 * Vérifie si un slug est disponible
 */
router.get('/check-slug', publicController.checkSlugAvailability);

module.exports = router;
