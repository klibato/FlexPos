const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Migration pour ajouter les champs de remise à la table sales
 */
const migrateDiscountFields = async () => {
  try {
    logger.info('🔄 Vérification des champs de remise dans sales...');

    // Vérifier si la colonne discount_type existe déjà
    const [discountTypeResults] = await sequelize.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'sales' AND column_name = 'discount_type';
    `);

    const discountTypeExists = discountTypeResults.length > 0;

    if (!discountTypeExists) {
      logger.info('➕ Ajout des champs de remise à sales...');

      // Ajouter les colonnes
      await sequelize.query(`
        ALTER TABLE sales
        ADD COLUMN IF NOT EXISTS discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'amount')),
        ADD COLUMN IF NOT EXISTS discount_value DECIMAL(10, 2),
        ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0;
      `);

      logger.info('✅ Champs de remise ajoutés à sales');
    } else {
      logger.info('✅ Champs de remise déjà présents dans sales');
    }

    logger.info('✅ Migration champs de remise terminée');
  } catch (error) {
    logger.error('❌ Erreur lors de la migration champs de remise:', error);
    throw error;
  }
};

module.exports = migrateDiscountFields;
