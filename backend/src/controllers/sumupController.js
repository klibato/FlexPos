const sumupService = require('../services/sumupService');
const logger = require('../utils/logger');

/**
 * Vérifier le statut de SumUp (configuré ou non)
 */
const getStatus = async (req, res, next) => {
  try {
    const isConfigured = sumupService.isConfigured();

    if (!isConfigured) {
      return res.json({
        success: true,
        data: {
          enabled: false,
          configured: false,
          message: 'SumUp n\'est pas configuré',
        },
      });
    }

    // Tester la connexion
    const isConnected = await sumupService.testConnection();

    res.json({
      success: true,
      data: {
        enabled: true,
        configured: true,
        connected: isConnected,
        message: isConnected ? 'SumUp opérationnel' : 'SumUp configuré mais connexion échouée',
      },
    });
  } catch (error) {
    logger.error('Erreur lors de la vérification du statut SumUp:', error);
    next(error);
  }
};

/**
 * Créer un checkout SumUp
 */
const createCheckout = async (req, res, next) => {
  try {
    const { amount, reference, description } = req.body;

    if (!amount || !reference) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Montant et référence requis',
        },
      });
    }

    const result = await sumupService.createCheckout({
      amount,
      reference,
      description: description || `Ticket ${reference}`,
    });

    if (result.success) {
      logger.info(`Checkout SumUp créé par ${req.user.username}: ${result.checkout_id}`);
      return res.json({
        success: true,
        data: result,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: {
          code: 'SUMUP_ERROR',
          message: result.error,
        },
      });
    }
  } catch (error) {
    logger.error('Erreur lors de la création du checkout SumUp:', error);
    next(error);
  }
};

/**
 * Vérifier le statut d'un checkout
 */
const getCheckoutStatus = async (req, res, next) => {
  try {
    const { checkoutId } = req.params;

    const result = await sumupService.getCheckoutStatus(checkoutId);

    if (result.success) {
      return res.json({
        success: true,
        data: result,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: {
          code: 'SUMUP_ERROR',
          message: result.error,
        },
      });
    }
  } catch (error) {
    logger.error('Erreur lors de la vérification du statut checkout:', error);
    next(error);
  }
};

/**
 * Traiter un paiement SumUp
 */
const processPayment = async (req, res, next) => {
  try {
    const { amount, reference } = req.body;

    if (!amount || !reference) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Montant et référence requis',
        },
      });
    }

    const result = await sumupService.processPayment({
      amount,
      reference,
    });

    if (result.success) {
      logger.info(`Paiement SumUp traité par ${req.user.username}: ${result.transaction_id} - ${amount}€`);
      return res.json({
        success: true,
        data: result,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: {
          code: 'PAYMENT_FAILED',
          message: result.error,
        },
      });
    }
  } catch (error) {
    logger.error('Erreur lors du traitement du paiement SumUp:', error);
    next(error);
  }
};

module.exports = {
  getStatus,
  createCheckout,
  getCheckoutStatus,
  processPayment,
};
