/**
 * Script pour créer la table store_settings si elle n'existe pas
 * Sera exécuté automatiquement au démarrage du serveur
 */

const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

const migrateStoreSettings = async () => {
  try {
    // Vérifier si la table existe
    const [results] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'store_settings'
      );
    `);

    const tableExists = results[0].exists;

    if (!tableExists) {
      logger.info('Table store_settings non trouvée, création en cours...');

      // Créer la table
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS store_settings (
          id INTEGER PRIMARY KEY DEFAULT 1,
          store_name VARCHAR(255) NOT NULL DEFAULT 'BensBurger',
          store_description VARCHAR(255) DEFAULT 'Restaurant Rapide',
          address_line1 VARCHAR(255) DEFAULT '123 Avenue des Burgers',
          address_line2 VARCHAR(255) DEFAULT NULL,
          postal_code VARCHAR(10) DEFAULT '75001',
          city VARCHAR(100) DEFAULT 'Paris',
          country VARCHAR(100) DEFAULT 'France',
          phone VARCHAR(20) DEFAULT '01 23 45 67 89',
          email VARCHAR(255) DEFAULT NULL,
          website VARCHAR(255) DEFAULT NULL,

          -- Informations légales
          legal_form VARCHAR(50) DEFAULT 'SARL',
          capital_amount DECIMAL(10, 2) DEFAULT 10000.00,
          siret VARCHAR(14) DEFAULT '12345678900012',
          vat_number VARCHAR(20) DEFAULT 'FR12345678901',
          rcs VARCHAR(100) DEFAULT 'Paris B 123 456 789',

          -- Paramètres généraux
          currency VARCHAR(3) DEFAULT 'EUR',
          currency_symbol VARCHAR(5) DEFAULT '€',

          -- Timestamps
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

          -- Contrainte: une seule ligne de paramètres
          CONSTRAINT single_row_settings CHECK (id = 1)
        );
      `);

      // Insérer les paramètres par défaut
      await sequelize.query(`
        INSERT INTO store_settings (id) VALUES (1)
        ON CONFLICT (id) DO NOTHING;
      `);

      // Créer l'index
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_store_settings_id ON store_settings(id);
      `);

      logger.info('✅ Table store_settings créée avec succès');
    } else {
      logger.info('✅ Table store_settings déjà présente');
    }
  } catch (error) {
    logger.error('❌ Erreur lors de la migration store_settings:', error);
    throw error;
  }
};

module.exports = migrateStoreSettings;
