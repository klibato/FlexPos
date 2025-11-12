const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Migration pour supprimer les contraintes sur category et vat_rate
 * Permet les catégories et taux de TVA dynamiques
 */

const migrateProductCategoryConstraint = async () => {
  try {
    logger.info('🔄 Vérification des contraintes sur products...');

    // Vérifier si des contraintes CHECK existent sur category
    const [constraints] = await sequelize.query(`
      SELECT con.conname
      FROM pg_constraint con
      INNER JOIN pg_class rel ON rel.oid = con.conrelid
      WHERE rel.relname = 'products'
      AND con.contype = 'c'
      AND con.conname LIKE '%category%';
    `);

    if (constraints.length > 0) {
      logger.info('➕ Suppression des contraintes sur la colonne category...');

      for (const constraint of constraints) {
        await sequelize.query(`
          ALTER TABLE products DROP CONSTRAINT IF EXISTS "${constraint.conname}";
        `);
        logger.info(`✅ Contrainte ${constraint.conname} supprimée`);
      }
    }

    // Vérifier si des contraintes CHECK existent sur vat_rate
    const [vatConstraints] = await sequelize.query(`
      SELECT con.conname
      FROM pg_constraint con
      INNER JOIN pg_class rel ON rel.oid = con.conrelid
      WHERE rel.relname = 'products'
      AND con.contype = 'c'
      AND con.conname LIKE '%vat_rate%';
    `);

    if (vatConstraints.length > 0) {
      logger.info('➕ Suppression des contraintes sur la colonne vat_rate...');

      for (const constraint of vatConstraints) {
        await sequelize.query(`
          ALTER TABLE products DROP CONSTRAINT IF EXISTS "${constraint.conname}";
        `);
        logger.info(`✅ Contrainte ${constraint.conname} supprimée`);
      }
    }

    // Ajouter de nouvelles contraintes plus flexibles
    await sequelize.query(`
      ALTER TABLE products
      ADD CONSTRAINT products_category_not_empty
      CHECK (category IS NOT NULL AND category <> '');
    `);

    await sequelize.query(`
      ALTER TABLE products
      ADD CONSTRAINT products_vat_rate_range
      CHECK (vat_rate >= 0 AND vat_rate <= 100);
    `);

    logger.info('✅ Nouvelles contraintes flexibles ajoutées');
    logger.info('✅ Migration contraintes products terminée');
  } catch (error) {
    logger.error('❌ Erreur lors de la migration contraintes products:', error);
    throw error;
  }
};

module.exports = migrateProductCategoryConstraint;
