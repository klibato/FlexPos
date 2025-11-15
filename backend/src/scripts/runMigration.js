const fs = require('fs');
const path = require('path');
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

async function runMigration(migrationFile) {
  try {
    logger.info(`Exécution de la migration: ${migrationFile}`);

    // Lire le fichier SQL
    const sqlPath = path.join(__dirname, '../../migrations', migrationFile);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Exécuter la migration
    await sequelize.query(sql);

    logger.info(`✅ Migration ${migrationFile} exécutée avec succès`);
  } catch (error) {
    logger.error(`❌ Erreur lors de l'exécution de la migration ${migrationFile}:`, error);
    throw error;
  }
}

async function main() {
  try {
    // Tester la connexion
    await sequelize.authenticate();
    logger.info('✅ Connexion à la base de données établie');

    // Exécuter la migration d'ajout des colonnes stock
    await runMigration('006_add_stock_to_products.sql');

    logger.info('✅ Toutes les migrations ont été exécutées');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Erreur:', error);
    process.exit(1);
  }
}

main();
