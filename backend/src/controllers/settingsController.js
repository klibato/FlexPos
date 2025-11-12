const { StoreSettings } = require('../models');
const logger = require('../utils/logger');

/**
 * Récupérer les paramètres du commerce
 */
const getSettings = async (req, res, next) => {
  try {
    let settings = await StoreSettings.findByPk(1);

    // Si pas de settings, créer les paramètres par défaut
    if (!settings) {
      settings = await StoreSettings.create({ id: 1 });
    }

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des paramètres:', error);
    next(error);
  }
};

/**
 * Mettre à jour les paramètres du commerce
 * Réservé aux administrateurs
 */
const updateSettings = async (req, res, next) => {
  try {
    const {
      store_name,
      store_description,
      address_line1,
      address_line2,
      postal_code,
      city,
      country,
      phone,
      email,
      website,
      legal_form,
      capital_amount,
      siret,
      vat_number,
      rcs,
      currency,
      currency_symbol,
      footer_message,
      categories,
      vat_rates,
      payment_methods,
      logo_url,
      theme_color,
      language,
      timezone,
    } = req.body;

    let settings = await StoreSettings.findByPk(1);

    const updateData = {
      store_name,
      store_description,
      address_line1,
      address_line2,
      postal_code,
      city,
      country,
      phone,
      email,
      website,
      legal_form,
      capital_amount,
      siret,
      vat_number,
      rcs,
      currency,
      currency_symbol,
      footer_message,
      categories,
      vat_rates,
      payment_methods,
      logo_url,
      theme_color,
      language,
      timezone,
    };

    // Supprimer les valeurs undefined pour ne pas écraser avec null
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Si pas de settings, créer les paramètres
    if (!settings) {
      settings = await StoreSettings.create({ id: 1, ...updateData });
    } else {
      // Mettre à jour
      await settings.update(updateData);
    }

    logger.info(`Paramètres du commerce mis à jour par ${req.user.username}`);

    res.json({
      success: true,
      data: settings,
      message: 'Paramètres mis à jour avec succès',
    });
  } catch (error) {
    logger.error('Erreur lors de la mise à jour des paramètres:', error);
    next(error);
  }
};

/**
 * Récupérer la configuration publique du commerce
 * (catégories, taux TVA, moyens de paiement, thème)
 * Accessible sans authentification
 */
const getPublicConfig = async (req, res, next) => {
  try {
    const settings = await StoreSettings.findByPk(1);

    if (!settings) {
      // Retourner la configuration par défaut
      return res.json({
        success: true,
        data: {
          categories: [],
          vat_rates: [],
          payment_methods: {},
          theme_color: '#FF6B35',
          currency: 'EUR',
          currency_symbol: '€',
          logo_url: null,
          store_name: 'BensBurger',
        },
      });
    }

    // Retourner uniquement les informations publiques
    res.json({
      success: true,
      data: {
        categories: settings.categories || [],
        vat_rates: settings.vat_rates || [],
        payment_methods: settings.payment_methods || {},
        theme_color: settings.theme_color || '#FF6B35',
        currency: settings.currency || 'EUR',
        currency_symbol: settings.currency_symbol || '€',
        logo_url: settings.logo_url,
        store_name: settings.store_name || 'BensBurger',
        language: settings.language || 'fr-FR',
      },
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération de la configuration publique:', error);
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
  getPublicConfig,
};
