const { sequelize, Subscription, Invoice, Organization } = require('../models');
const stripeService = require('../services/stripeService');
const logger = require('../utils/logger');
const config = require('../config/env');

/**
 * GET /api/subscriptions/current
 * Récupérer l'abonnement actuel de l'organisation
 */
const getCurrentSubscription = async (req, res, next) => {
  try {
    const { organizationId } = req;

    const subscription = await Subscription.findOne({
      where: { organization_id: organizationId },
      order: [['created_at', 'DESC']],
    });

    if (!subscription) {
      // Créer une subscription "free" par défaut si elle n'existe pas
      const defaultSubscription = await Subscription.create({
        organization_id: organizationId,
        plan: 'free',
        status: 'active',
        price_cents: 0,
        currency: 'EUR',
        billing_interval: 'monthly',
        started_at: new Date(),
        current_period_start: new Date(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      return res.json({
        success: true,
        data: defaultSubscription.toPublicJSON(),
      });
    }

    return res.json({
      success: true,
      data: subscription.toPublicJSON(),
    });
  } catch (error) {
    logger.error('Error fetching current subscription:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_SUBSCRIPTION_FAILED',
        message: 'Erreur lors de la récupération de l\'abonnement',
      },
    });
  }
};

/**
 * POST /api/subscriptions/create-checkout
 * Créer une session Stripe Checkout pour upgrade/subscription
 */
const createCheckoutSession = async (req, res, next) => {
  try {
    const { organizationId } = req;
    const { planId } = req.body;

    // Validation
    if (!planId || !['starter', 'premium', 'enterprise'].includes(planId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PLAN',
          message: 'Plan invalide',
        },
      });
    }

    // Construire les URLs
    const baseUrl = process.env.FRONTEND_URL || 'https://app.flexpos.app';
    const successUrl = `${baseUrl}/settings/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/settings/subscription?cancelled=true`;

    // Créer la session
    const session = await stripeService.createCheckoutSession(
      organizationId,
      planId,
      successUrl,
      cancelUrl
    );

    return res.json({
      success: true,
      data: {
        session_id: session.id,
        url: session.url,
      },
    });
  } catch (error) {
    logger.error('Error creating checkout session:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'CHECKOUT_FAILED',
        message: 'Erreur lors de la création de la session Stripe',
      },
    });
  }
};

/**
 * POST /api/subscriptions/upgrade
 * Passer à un plan supérieur
 */
const upgradeSubscription = async (req, res, next) => {
  try {
    const { organizationId } = req;
    const { planId } = req.body;

    // Validation
    if (!planId || !['starter', 'premium', 'enterprise'].includes(planId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PLAN',
          message: 'Plan invalide',
        },
      });
    }

    // Récupérer l'abonnement actuel
    const subscription = await Subscription.findOne({
      where: { organization_id: organizationId },
      order: [['created_at', 'DESC']],
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SUBSCRIPTION_NOT_FOUND',
          message: 'Aucun abonnement trouvé',
        },
      });
    }

    // Vérifier qu'on a une subscription Stripe
    if (!subscription.stripe_subscription_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_STRIPE_SUBSCRIPTION',
          message: 'Pas de subscription Stripe liée',
        },
      });
    }

    // Mettre à jour la subscription Stripe
    const updatedStripeSubscription = await stripeService.updateSubscription(
      subscription.stripe_subscription_id,
      planId
    );

    // Mettre à jour la subscription locale
    await subscription.update({
      plan: planId,
      price_cents: Subscription.getPlanPrice(planId),
      status: 'active',
    });

    return res.json({
      success: true,
      data: {
        message: 'Abonnement mis à jour',
        subscription: subscription.toPublicJSON(),
      },
    });
  } catch (error) {
    logger.error('Error upgrading subscription:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPGRADE_FAILED',
        message: 'Erreur lors de la mise à jour de l\'abonnement',
      },
    });
  }
};

/**
 * POST /api/subscriptions/cancel
 * Annuler un abonnement
 */
const cancelSubscription = async (req, res, next) => {
  try {
    const { organizationId } = req;
    const { immediate = false } = req.body;

    // Récupérer l'abonnement actuel
    const subscription = await Subscription.findOne({
      where: { organization_id: organizationId },
      order: [['created_at', 'DESC']],
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SUBSCRIPTION_NOT_FOUND',
          message: 'Aucun abonnement trouvé',
        },
      });
    }

    // Vérifier qu'on a une subscription Stripe
    if (!subscription.stripe_subscription_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_STRIPE_SUBSCRIPTION',
          message: 'Pas de subscription Stripe liée',
        },
      });
    }

    // Annuler la subscription Stripe
    await stripeService.cancelSubscription(
      subscription.stripe_subscription_id,
      immediate
    );

    // Mettre à jour la subscription locale
    await subscription.update({
      status: 'cancelled',
      cancelled_at: new Date(),
      ended_at: immediate ? new Date() : null,
    });

    // Mettre à jour le plan de l'organisation
    const organization = await Organization.findByPk(organizationId);
    if (organization && immediate) {
      await organization.update({
        plan: 'free',
      });
    }

    return res.json({
      success: true,
      data: {
        message: 'Abonnement annulé',
        subscription: subscription.toPublicJSON(),
      },
    });
  } catch (error) {
    logger.error('Error cancelling subscription:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'CANCEL_FAILED',
        message: 'Erreur lors de l\'annulation de l\'abonnement',
      },
    });
  }
};

/**
 * GET /api/subscriptions/plans
 * Récupérer les plans disponibles avec leurs prix
 */
const getAvailablePlans = async (req, res, next) => {
  try {
    const plans = {
      free: {
        id: 'free',
        name: 'Gratuit',
        price: 0,
        currency: 'EUR',
        billing_interval: 'monthly',
        description: 'Pour les petits commerces',
        limits: Subscription.getPlanLimits('free'),
        features: [
          'Jusqu\'à 3 utilisateurs',
          'Jusqu\'à 50 produits',
          'Rapports de base',
          'Support email',
        ],
      },
      starter: {
        id: 'starter',
        name: 'Starter',
        price: 29,
        currency: 'EUR',
        billing_interval: 'monthly',
        description: 'Pour les commerces en croissance',
        limits: Subscription.getPlanLimits('starter'),
        features: [
          'Jusqu\'à 10 utilisateurs',
          'Jusqu\'à 200 produits',
          'Rapports détaillés',
          'Support prioritaire',
          'API accès',
        ],
      },
      premium: {
        id: 'premium',
        name: 'Premium',
        price: 49,
        currency: 'EUR',
        billing_interval: 'monthly',
        description: 'Pour les commerces établis',
        limits: Subscription.getPlanLimits('premium'),
        features: [
          'Jusqu\'à 50 utilisateurs',
          'Jusqu\'à 1000 produits',
          'Rapports avancés',
          'Support prioritaire 24/7',
          'API accès premium',
          'Intégrations tierces',
        ],
      },
      enterprise: {
        id: 'enterprise',
        name: 'Enterprise',
        price: 99,
        currency: 'EUR',
        billing_interval: 'monthly',
        description: 'Pour les grandes chaînes',
        limits: Subscription.getPlanLimits('enterprise'),
        features: [
          'Utilisateurs illimités',
          'Produits illimités',
          'Rapports illimités',
          'Support dédié 24/7',
          'API accès illimité',
          'Intégrations personnalisées',
          'Account manager',
        ],
      },
    };

    return res.json({
      success: true,
      data: {
        plans,
        trial_days: 30,
      },
    });
  } catch (error) {
    logger.error('Error fetching plans:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_PLANS_FAILED',
        message: 'Erreur lors de la récupération des plans',
      },
    });
  }
};

/**
 * GET /api/subscriptions/invoices
 * Récupérer les factures de l'organisation
 */
const getInvoices = async (req, res, next) => {
  try {
    const { organizationId } = req;
    const { limit = 10, offset = 0 } = req.query;

    const invoices = await Invoice.findAndCountAll({
      where: { organization_id: organizationId },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.json({
      success: true,
      data: {
        invoices: invoices.rows.map((inv) => ({
          id: inv.id,
          invoice_number: inv.invoice_number,
          total: (inv.total_cents / 100).toFixed(2),
          currency: inv.currency,
          status: inv.status,
          period_start: inv.period_start,
          period_end: inv.period_end,
          paid_at: inv.paid_at,
          created_at: inv.created_at,
        })),
        total: invoices.count,
      },
    });
  } catch (error) {
    logger.error('Error fetching invoices:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_INVOICES_FAILED',
        message: 'Erreur lors de la récupération des factures',
      },
    });
  }
};

/**
 * POST /api/subscriptions/validate-checkout
 * Valider une session checkout et créer les modèles locaux
 */
const validateCheckout = async (req, res, next) => {
  try {
    const { organizationId } = req;
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_SESSION_ID',
          message: 'Session ID requis',
        },
      });
    }

    // La souscription est déjà créée via le webhook
    // Cette endpoint sert juste à confirmer que le checkout est valide côté client
    return res.json({
      success: true,
      data: {
        message: 'Checkout validé',
      },
    });
  } catch (error) {
    logger.error('Error validating checkout:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Erreur lors de la validation du checkout',
      },
    });
  }
};

module.exports = {
  getCurrentSubscription,
  createCheckoutSession,
  upgradeSubscription,
  cancelSubscription,
  getAvailablePlans,
  getInvoices,
  validateCheckout,
};
