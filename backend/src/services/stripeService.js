const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || '');
const logger = require('../utils/logger');
const { sequelize } = require('../config/database');
const Subscription = require('../models/Subscription');
const Invoice = require('../models/Invoice');
const Organization = require('../models/Organization');

/**
 * Créer ou récupérer un customer Stripe pour une organisation
 * @param {Object} organization - L'organisation
 * @returns {Promise<Object>} Customer Stripe
 */
const getOrCreateCustomer = async (organization) => {
  try {
    // Si le customer existe déjà, le récupérer
    if (organization.stripe_customer_id) {
      const customer = await stripe.customers.retrieve(
        organization.stripe_customer_id
      );
      return customer;
    }

    // Créer un nouveau customer
    const customer = await stripe.customers.create({
      email: organization.email,
      name: organization.name,
      metadata: {
        organization_id: organization.id,
        organization_slug: organization.slug,
      },
    });

    // Sauvegarder le stripe_customer_id
    await organization.update({
      stripe_customer_id: customer.id,
    });

    logger.info(
      `Stripe customer created for org ${organization.id}: ${customer.id}`
    );
    return customer;
  } catch (error) {
    logger.error('Error creating Stripe customer:', error.message);
    throw error;
  }
};

/**
 * Créer une session Stripe Checkout pour upgrade/downgrade
 * @param {number} organizationId - L'ID de l'organisation
 * @param {string} planId - Le plan ('starter', 'premium', 'enterprise')
 * @param {string} successUrl - URL après succès
 * @param {string} cancelUrl - URL après annulation
 * @returns {Promise<Object>} Stripe session
 */
const createCheckoutSession = async (
  organizationId,
  planId,
  successUrl,
  cancelUrl
) => {
  try {
    const organization = await Organization.findByPk(organizationId);
    if (!organization) {
      throw new Error('Organization not found');
    }

    // Créer/obtenir le customer Stripe
    const customer = await getOrCreateCustomer(organization);

    // Récupérer le Stripe price ID depuis les variables d'env
    const stripePriceId = process.env[`STRIPE_PRICE_ID_${planId.toUpperCase()}`];
    if (!stripePriceId) {
      throw new Error(`Price ID not configured for plan: ${planId}`);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        organization_id: organizationId,
        plan: planId,
      },
    });

    logger.info(
      `Checkout session created for org ${organizationId}: ${session.id}`
    );
    return session;
  } catch (error) {
    logger.error('Error creating checkout session:', error.message);
    throw error;
  }
};

/**
 * Créer une subscription Stripe pour une organisation
 * @param {number} organizationId - L'ID de l'organisation
 * @param {string} planId - Le plan ('starter', 'premium', 'enterprise')
 * @param {Object} paymentMethod - Stripe payment method (optionnel)
 * @returns {Promise<Object>} Stripe subscription
 */
const createSubscription = async (organizationId, planId, paymentMethod = null) => {
  try {
    const organization = await Organization.findByPk(organizationId);
    if (!organization) {
      throw new Error('Organization not found');
    }

    // Créer/obtenir le customer Stripe
    const customer = await getOrCreateCustomer(organization);

    // Récupérer le Stripe price ID
    const stripePriceId = process.env[`STRIPE_PRICE_ID_${planId.toUpperCase()}`];
    if (!stripePriceId) {
      throw new Error(`Price ID not configured for plan: ${planId}`);
    }

    // Créer la subscription
    const subscriptionData = {
      customer: customer.id,
      items: [
        {
          price: stripePriceId,
        },
      ],
      metadata: {
        organization_id: organizationId,
        plan: planId,
      },
      trial_period_days: 30, // Trial de 30 jours
    };

    // Ajouter la payment method si fournie
    if (paymentMethod) {
      subscriptionData.default_payment_method = paymentMethod.id;
      subscriptionData.payment_settings = {
        payment_method_types: ['card'],
      };
    }

    const subscription = await stripe.subscriptions.create(subscriptionData);

    logger.info(
      `Stripe subscription created for org ${organizationId}: ${subscription.id}`
    );
    return subscription;
  } catch (error) {
    logger.error('Error creating subscription:', error.message);
    throw error;
  }
};

/**
 * Annuler une subscription Stripe
 * @param {string} stripeSubscriptionId - L'ID de la subscription Stripe
 * @param {boolean} immediate - Annuler immédiatement ou à la fin de la période
 * @returns {Promise<Object>} Stripe subscription
 */
const cancelSubscription = async (stripeSubscriptionId, immediate = false) => {
  try {
    const subscription = await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: !immediate,
    });

    logger.info(`Subscription ${stripeSubscriptionId} cancelled`);
    return subscription;
  } catch (error) {
    logger.error('Error cancelling subscription:', error.message);
    throw error;
  }
};

/**
 * Mettre à jour une subscription (ex: changer de plan)
 * @param {string} stripeSubscriptionId - L'ID de la subscription Stripe
 * @param {string} newPlanId - Le nouveau plan
 * @returns {Promise<Object>} Stripe subscription
 */
const updateSubscription = async (stripeSubscriptionId, newPlanId) => {
  try {
    // Récupérer la subscription actuelle
    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

    // Récupérer le nouveau price ID
    const stripePriceId = process.env[`STRIPE_PRICE_ID_${newPlanId.toUpperCase()}`];
    if (!stripePriceId) {
      throw new Error(`Price ID not configured for plan: ${newPlanId}`);
    }

    // Mettre à jour la subscription
    const updatedSubscription = await stripe.subscriptions.update(
      stripeSubscriptionId,
      {
        items: [
          {
            id: subscription.items.data[0].id,
            price: stripePriceId,
          },
        ],
        proration_behavior: 'create_prorations', // Créer une facture au prorata
      }
    );

    logger.info(
      `Subscription ${stripeSubscriptionId} updated to plan ${newPlanId}`
    );
    return updatedSubscription;
  } catch (error) {
    logger.error('Error updating subscription:', error.message);
    throw error;
  }
};

/**
 * Traiter un événement webhook Stripe
 * @param {Object} event - L'événement Stripe
 * @returns {Promise<void>}
 */
const handleWebhookEvent = async (event) => {
  const { type, data } = event;

  try {
    switch (type) {
      case 'checkout.session.completed': {
        await handleCheckoutSessionCompleted(data.object);
        break;
      }
      case 'invoice.paid': {
        await handleInvoicePaid(data.object);
        break;
      }
      case 'invoice.payment_failed': {
        await handleInvoicePaymentFailed(data.object);
        break;
      }
      case 'customer.subscription.updated': {
        await handleSubscriptionUpdated(data.object);
        break;
      }
      case 'customer.subscription.deleted': {
        await handleSubscriptionDeleted(data.object);
        break;
      }
      default: {
        logger.debug(`Unhandled webhook event: ${type}`);
      }
    }
  } catch (error) {
    logger.error(`Error handling webhook event ${type}:`, error.message);
    throw error;
  }
};

/**
 * Gérer l'événement checkout.session.completed
 */
const handleCheckoutSessionCompleted = async (session) => {
  const transaction = await sequelize.transaction();

  try {
    const organizationId = parseInt(session.metadata.organization_id);
    const plan = session.metadata.plan;

    const organization = await Organization.findByPk(organizationId, {
      transaction,
    });
    if (!organization) {
      throw new Error(`Organization ${organizationId} not found`);
    }

    // Récupérer la subscription Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
      session.subscription
    );

    // Mettre à jour ou créer la subscription locale
    const [subscription] = await Subscription.findOrCreate({
      where: { organization_id: organizationId },
      defaults: {
        organization_id: organizationId,
        plan,
        status: stripeSubscription.status === 'trialing' ? 'trialing' : 'active',
        price_cents: Subscription.getPlanPrice(plan),
        currency: 'EUR',
        billing_interval: 'monthly',
        stripe_subscription_id: stripeSubscription.id,
        stripe_customer_id: stripeSubscription.customer,
        started_at: new Date(),
        trial_ends_at: stripeSubscription.trial_end
          ? new Date(stripeSubscription.trial_end * 1000)
          : null,
        current_period_start: new Date(
          stripeSubscription.current_period_start * 1000
        ),
        current_period_end: new Date(
          stripeSubscription.current_period_end * 1000
        ),
      },
      transaction,
    });

    // Si on a trouvé une subscription existante, la mettre à jour
    if (subscription) {
      await subscription.update(
        {
          plan,
          status: stripeSubscription.status === 'trialing' ? 'trialing' : 'active',
          price_cents: Subscription.getPlanPrice(plan),
          stripe_subscription_id: stripeSubscription.id,
          stripe_customer_id: stripeSubscription.customer,
          trial_ends_at: stripeSubscription.trial_end
            ? new Date(stripeSubscription.trial_end * 1000)
            : null,
          current_period_start: new Date(
            stripeSubscription.current_period_start * 1000
          ),
          current_period_end: new Date(
            stripeSubscription.current_period_end * 1000
          ),
        },
        { transaction }
      );
    }

    // Mettre à jour le plan de l'organisation
    await organization.update(
      {
        plan,
        subscription_ends_at: new Date(
          stripeSubscription.current_period_end * 1000
        ),
      },
      { transaction }
    );

    await transaction.commit();
    logger.info(
      `Checkout completed for org ${organizationId}, subscription ${stripeSubscription.id}`
    );
  } catch (error) {
    await transaction.rollback();
    logger.error('Error handling checkout.session.completed:', error.message);
    throw error;
  }
};

/**
 * Gérer l'événement invoice.paid
 */
const handleInvoicePaid = async (stripeInvoice) => {
  const transaction = await sequelize.transaction();

  try {
    // Trouver la subscription locale via stripe_subscription_id
    const subscription = await Subscription.findOne({
      where: { stripe_subscription_id: stripeInvoice.subscription },
      transaction,
    });

    if (!subscription) {
      logger.warn(
        `Subscription not found for Stripe subscription ${stripeInvoice.subscription}`
      );
      return;
    }

    // Mettre à jour ou créer la facture locale
    const [invoice] = await Invoice.findOrCreate({
      where: { stripe_invoice_id: stripeInvoice.id },
      defaults: {
        organization_id: subscription.organization_id,
        subscription_id: subscription.id,
        invoice_number: `INV-${new Date().getFullYear()}-${String(
          stripeInvoice.number
        ).padStart(5, '0')}`,
        subtotal_cents: stripeInvoice.subtotal,
        tax_cents: stripeInvoice.tax || 0,
        total_cents: stripeInvoice.total,
        currency: stripeInvoice.currency.toUpperCase(),
        tax_rate: 20, // France
        status: 'paid',
        stripe_invoice_id: stripeInvoice.id,
        stripe_charge_id: stripeInvoice.charge,
        payment_method: 'stripe_card',
        period_start: new Date(stripeInvoice.period_start * 1000),
        period_end: new Date(stripeInvoice.period_end * 1000),
        due_date: new Date((stripeInvoice.due_date || stripeInvoice.created) * 1000),
        paid_at: new Date(),
      },
      transaction,
    });

    // Mettre à jour si elle existe déjà
    if (invoice) {
      await invoice.update(
        {
          status: 'paid',
          stripe_charge_id: stripeInvoice.charge,
          paid_at: new Date(),
        },
        { transaction }
      );
    }

    // Mettre à jour le statut de la subscription
    await subscription.update(
      {
        status: 'active',
        current_period_start: new Date(
          stripeInvoice.period_start * 1000
        ),
        current_period_end: new Date(
          stripeInvoice.period_end * 1000
        ),
      },
      { transaction }
    );

    await transaction.commit();
    logger.info(`Invoice paid: ${stripeInvoice.id}`);
  } catch (error) {
    await transaction.rollback();
    logger.error('Error handling invoice.paid:', error.message);
    throw error;
  }
};

/**
 * Gérer l'événement invoice.payment_failed
 */
const handleInvoicePaymentFailed = async (stripeInvoice) => {
  try {
    const subscription = await Subscription.findOne({
      where: { stripe_subscription_id: stripeInvoice.subscription },
    });

    if (!subscription) {
      logger.warn(
        `Subscription not found for Stripe subscription ${stripeInvoice.subscription}`
      );
      return;
    }

    // Mettre à jour la subscription
    await subscription.update({
      status: 'past_due',
    });

    // Mettre à jour la facture si elle existe
    await Invoice.update(
      { status: 'open' },
      { where: { stripe_invoice_id: stripeInvoice.id } }
    );

    logger.warn(`Invoice payment failed: ${stripeInvoice.id}`);
  } catch (error) {
    logger.error('Error handling invoice.payment_failed:', error.message);
    throw error;
  }
};

/**
 * Gérer l'événement customer.subscription.updated
 */
const handleSubscriptionUpdated = async (stripeSubscription) => {
  try {
    const subscription = await Subscription.findOne({
      where: { stripe_subscription_id: stripeSubscription.id },
    });

    if (!subscription) {
      logger.warn(
        `Subscription not found for Stripe subscription ${stripeSubscription.id}`
      );
      return;
    }

    // Mettre à jour la subscription locale
    await subscription.update({
      status: stripeSubscription.status,
      current_period_start: new Date(
        stripeSubscription.current_period_start * 1000
      ),
      current_period_end: new Date(
        stripeSubscription.current_period_end * 1000
      ),
      trial_ends_at: stripeSubscription.trial_end
        ? new Date(stripeSubscription.trial_end * 1000)
        : null,
    });

    logger.info(`Subscription updated: ${stripeSubscription.id}`);
  } catch (error) {
    logger.error('Error handling customer.subscription.updated:', error.message);
    throw error;
  }
};

/**
 * Gérer l'événement customer.subscription.deleted
 */
const handleSubscriptionDeleted = async (stripeSubscription) => {
  try {
    const subscription = await Subscription.findOne({
      where: { stripe_subscription_id: stripeSubscription.id },
    });

    if (!subscription) {
      logger.warn(
        `Subscription not found for Stripe subscription ${stripeSubscription.id}`
      );
      return;
    }

    // Mettre à jour la subscription
    await subscription.update({
      status: 'cancelled',
      cancelled_at: new Date(),
      ended_at: new Date(),
    });

    // Mettre à jour l'organisation (rétrograder en free)
    const organization = await Organization.findByPk(
      subscription.organization_id
    );
    if (organization) {
      await organization.update({
        plan: 'free',
        subscription_ends_at: new Date(),
      });
    }

    logger.info(`Subscription cancelled: ${stripeSubscription.id}`);
  } catch (error) {
    logger.error('Error handling customer.subscription.deleted:', error.message);
    throw error;
  }
};

module.exports = {
  getOrCreateCustomer,
  createCheckoutSession,
  createSubscription,
  cancelSubscription,
  updateSubscription,
  handleWebhookEvent,
};
