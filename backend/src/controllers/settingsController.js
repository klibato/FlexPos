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
    } = req.body;

    let settings = await StoreSettings.findByPk(1);

    // Si pas de settings, créer les paramètres
    if (!settings) {
      settings = await StoreSettings.create({
        id: 1,
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
      });
    } else {
      // Mettre à jour
      await settings.update({
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
      });
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

module.exports = {
  getSettings,
  updateSettings,
};
