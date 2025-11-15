const fs = require('fs');
const path = require('path');
const { sequelize } = require('../config/database');
const { User } = require('../models');
const logger = require('../utils/logger');

/**
 * Exécute le fichier SQL de seeding des produits et menus
 */
async function seedProducts() {
  try {
    logger.info('🌱 Seeding products and menus...');

    // Lire le fichier SQL de seeds
    const sqlPath = path.join(__dirname, '../../database/seeds.sql');

    if (!fs.existsSync(sqlPath)) {
      logger.warn('⚠️  Fichier seeds.sql non trouvé, skip du seeding produits');
      return;
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Vérifier si des produits existent déjà
    const [existingProducts] = await sequelize.query('SELECT COUNT(*) as count FROM products');
    const productCount = parseInt(existingProducts[0].count);

    if (productCount > 0) {
      logger.info(`${productCount} produit(s) déjà présent(s). Suppression...`);
      // Supprimer les compositions de menu d'abord (foreign key)
      await sequelize.query('DELETE FROM menu_compositions');
      await sequelize.query('DELETE FROM products');
      // Reset les séquences auto-increment
      await sequelize.query('ALTER SEQUENCE products_id_seq RESTART WITH 1');
    }

    // Exécuter le fichier SQL
    await sequelize.query(sql);

    // Compter les produits créés
    const [result] = await sequelize.query('SELECT COUNT(*) as count FROM products');
    const count = parseInt(result[0].count);

    logger.info(`✅ ${count} produit(s) et menu(s) créé(s) avec succès`);
  } catch (error) {
    logger.error('❌ Erreur lors du seeding des produits:', error);
    throw error;
  }
}

/**
 * Crée les utilisateurs par défaut
 */
async function seedUsers() {
  try {
    logger.info('🌱 Seeding users...');

    // Vérifier si les utilisateurs existent déjà
    const existingUsers = await User.count();
    if (existingUsers > 0) {
      logger.info(`${existingUsers} utilisateur(s) déjà présent(s). Suppression...`);

      // Supprimer d'abord les dépendances (foreign keys)
      await sequelize.query('DELETE FROM sale_items');
      await sequelize.query('DELETE FROM sales');
      await sequelize.query('DELETE FROM cash_registers');

      // Maintenant on peut supprimer les users
      await User.destroy({ where: {}, force: true });
    }

    // Créer les utilisateurs avec les bons hash
    const users = await User.bulkCreate([
      {
        username: 'admin',
        pin_code: '1234', // Sera hashé automatiquement par le hook beforeCreate
        role: 'admin',
        first_name: 'Admin',
        last_name: 'Principal',
        email: 'admin@bensburger.com',
        is_active: true,
      },
      {
        username: 'john',
        pin_code: '5678',
        role: 'cashier',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@bensburger.com',
        is_active: true,
      },
      {
        username: 'marie',
        pin_code: '9999',
        role: 'cashier',
        first_name: 'Marie',
        last_name: 'Martin',
        email: 'marie@bensburger.com',
        is_active: true,
      },
    ], {
      individualHooks: true, // Important pour que le hook beforeCreate soit appelé
    });

    logger.info(`✅ ${users.length} utilisateur(s) créé(s) avec succès`);
    logger.info('');
    logger.info('📝 Comptes disponibles :');
    logger.info('  - admin / 1234 (Administrateur)');
    logger.info('  - john / 5678 (Caissier)');
    logger.info('  - marie / 9999 (Caissière)');
  } catch (error) {
    logger.error('❌ Erreur lors du seeding des utilisateurs:', error);
    throw error;
  }
}

/**
 * Fonction principale de seeding
 */
async function main() {
  try {
    // Tester la connexion
    await sequelize.authenticate();
    logger.info('✅ Connexion à la base de données établie');
    logger.info('');

    // Exécuter les seeds dans l'ordre
    await seedProducts();
    logger.info('');
    await seedUsers();

    logger.info('');
    logger.info('🎉 Seeding complet terminé avec succès !');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Erreur lors du seeding:', error);
    process.exit(1);
  }
}

// Exécuter le seeding
main();
