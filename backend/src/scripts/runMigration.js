const fs = require('fs');
const path = require('path');
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

async function runMigration(migrationFile) {
  try {
    logger.info(`Exécution de la migration: ${migrationFile}`);

    // Lire le fichier SQL depuis /database/migrations (monté dans container)
    const sqlPath = path.join('/database/migrations', migrationFile);
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

    // Lister tous les fichiers de migration depuis /database/migrations
    const migrationsDir = '/database/migrations';
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Tri alphabétique pour exécuter dans l'ordre

    logger.info(`📝 ${migrationFiles.length} migration(s) trouvée(s)`);

    // Exécuter chaque migration
    for (const file of migrationFiles) {
      await runMigration(file);
    }

    logger.info('✅ Toutes les migrations ont été exécutées');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Erreur:', error);
    process.exit(1);
  }
}

main();
