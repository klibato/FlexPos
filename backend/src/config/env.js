require('dotenv').config();

// Validation JWT_SECRET en production
const NODE_ENV = process.env.NODE_ENV || 'development';
const JWT_SECRET = process.env.JWT_SECRET;

if (NODE_ENV === 'production' && !JWT_SECRET) {
  throw new Error('SECURITY ERROR: JWT_SECRET environment variable must be set in production');
}

// Utiliser secret par défaut uniquement en développement
const jwtSecret = JWT_SECRET || (NODE_ENV === 'development' ? 'dev-secret-key' : null);

if (!jwtSecret) {
  throw new Error('JWT_SECRET is required');
}

module.exports = {
  // Environnement
  NODE_ENV,
  PORT: parseInt(process.env.PORT, 10) || 3000,

  // Base de données
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'pos_burger',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  },

  // JWT
  jwt: {
    secret: jwtSecret,
    expiration: process.env.JWT_EXPIRATION || '8h',
  },
  jwtSecret, // Alias pour compatibilité admin

  // Imprimante
  printer: {
    ip: process.env.PRINTER_IP || '192.168.1.100',
    port: parseInt(process.env.PRINTER_PORT, 10) || 9100,
  },

  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    // Price IDs pour chaque plan
    prices: {
      starter: process.env.STRIPE_PRICE_ID_STARTER || '',
      premium: process.env.STRIPE_PRICE_ID_PREMIUM || '',
      enterprise: process.env.STRIPE_PRICE_ID_ENTERPRISE || '',
    },
  },

  // Email
  email: {
    brevoApiKey: process.env.BREVO_API_KEY || '',
    fromEmail: process.env.FROM_EMAIL || 'noreply@flexpos.app',
    fromName: process.env.FROM_NAME || 'FlexPOS',
  },

  // Frontend
  frontend: {
    url: process.env.FRONTEND_URL || 'https://app.flexpos.app',
  },

  // Configuration app
  app: {
    businessName: 'FlexPOS',
    businessAddress: '123 Rue de la Paix, 75001 Paris',
    siret: '12345678901234',
    vatNumber: 'FR12345678901',
  },
};
