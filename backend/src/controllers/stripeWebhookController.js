const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || '');
const logger = require('../utils/logger');
const stripeService = require('../services/stripeService');

/**
 * POST /api/billing/stripe/webhook
 * Gérer les webhooks Stripe
 */
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    logger.warn('STRIPE_WEBHOOK_SECRET not configured');
    return res.status(400).json({
      success: false,
      error: 'Webhook secret not configured',
    });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (error) {
    logger.error(`Webhook signature verification failed: ${error.message}`);
    return res.status(400).json({
      success: false,
      error: 'Webhook signature verification failed',
    });
  }

  try {
    // Traiter l'événement
    await stripeService.handleWebhookEvent(event);

    // Confirmer le webhook
    res.json({
      success: true,
      received: true,
    });
  } catch (error) {
    logger.error(`Error handling webhook ${event.type}:`, error.message);
    // Retourner 200 quand même pour ne pas faire de retry
    res.json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = handleWebhook;
