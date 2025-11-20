const { AdminUser } = require('../src/models');
const { sequelize } = require('../src/config/database');

async function resetAdminPassword() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion réussie');

    const admin = await AdminUser.findOne({
      where: { email: 'admin@flexpos.app' }
    });

    if (!admin) {
      console.log('❌ Super-admin introuvable');
      process.exit(1);
    }

    console.log('\n📋 État actuel du super-admin:');
    console.log('Email:', admin.email);
    console.log('Username:', admin.username);
    console.log('Role:', admin.role);
    console.log('Is Active:', admin.is_active);
    console.log('Email Verified:', admin.email_verified);
    console.log('Permissions:', admin.permissions);

    // Réinitialiser le mot de passe
    admin.password_hash = 'FlexPOS2024!'; // Sera hashé par le hook
    admin.is_active = true;
    admin.email_verified = true;
    admin.role = 'super_admin';
    admin.permissions = ['*'];

    await admin.save();

    console.log('\n🎉 Mot de passe réinitialisé!\n');
    console.log('📧 Email:', admin.email);
    console.log('👤 Username:', admin.username);
    console.log('🔑 Nouveau mot de passe: FlexPOS2024!');
    console.log('\n🌐 Connectez-vous sur: https://admin.flexpos.app/login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

resetAdminPassword();
