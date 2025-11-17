const bcrypt = require('bcryptjs');
const { User } = require('../models');
const logger = require('../utils/logger');

async function seedUsers() {
  try {
    logger.info('🌱 Seeding users...');

    // Vérifier si les utilisateurs existent déjà
    const existingUsers = await User.count();
    if (existingUsers > 0) {
      logger.info(`${existingUsers} utilisateur(s) déjà présent(s). Suppression...`);
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
        email: 'admin@flexpos.com',
        is_active: true,
      },
      {
        username: 'john',
        pin_code: '5678',
        role: 'cashier',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@flexpos.com',
        is_active: true,
      },
      {
        username: 'marie',
        pin_code: '9999',
        role: 'cashier',
        first_name: 'Marie',
        last_name: 'Martin',
        email: 'marie@flexpos.com',
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

    process.exit(0);
  } catch (error) {
    logger.error('❌ Erreur lors du seeding des utilisateurs:', error);
    process.exit(1);
  }
}

// Exécuter le seeding
seedUsers();
