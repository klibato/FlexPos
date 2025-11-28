const cron = require('node-cron');
const { Organization, Subscription, Invoice, AuditLog, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const { sendTrialEndingEmail } = require('./emailService');

/**
 * Vérifier les trials qui expirent dans 3 jours et envoyer email
 * Exécuté tous les jours à 9h
 */
const checkTrialsExpiring = cron.schedule('0 9 * * *', async () => {
  try {
    logger.info('Cron job: Checking trials expiring soon...');

    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const expiringOrgs = await Organization.findAll({
      where: {
        trial_ends_at: {
          [Op.lte]: threeDaysFromNow,
          [Op.gte]: new Date(),
        },
        status: 'active',
      },
    });

    for (const org of expiringOrgs) {
      const daysLeft = Math.ceil((new Date(org.trial_ends_at) - new Date()) / (1000 * 60 * 60 * 24));
      await sendTrialEndingEmail(org, daysLeft);
    }

    logger.info(`Cron job: ${expiringOrgs.length} trial expiring emails sent`);
  } catch (error) {
    logger.error('Cron job error (checkTrialsExpiring):', error);
  }
}, {
  scheduled: false, // Ne démarre pas automatiquement
});

/**
 * Générer factures mensuelles pour tous les abonnements actifs
 * Exécuté le 1er de chaque mois à 00:00
 */
const generateMonthlyInvoices = cron.schedule('0 0 1 * *', async () => {
  try {
    logger.info('Cron job: Generating monthly invoices...');

    const today = new Date();
    const activeSubscriptions = await Subscription.findAll({
      where: {
        status: 'active',
        current_period_end: {
          [Op.lte]: today,
        },
      },
      include: [{ model: Organization, as: 'organization' }],
    });

    let invoicesCreated = 0;

    for (const subscription of activeSubscriptions) {
      try {
        // Créer facture
        const invoice = await Invoice.createFromSubscription(subscription, subscription.organization);

        // Mettre à jour période d'abonnement
        subscription.current_period_start = subscription.current_period_end;
        subscription.current_period_end = new Date(subscription.current_period_end);
        subscription.current_period_end.setMonth(subscription.current_period_end.getMonth() + 1);
        await subscription.save();

        invoicesCreated++;
      } catch (error) {
        logger.error(`Failed to create invoice for subscription ${subscription.id}:`, error);
      }
    }

    logger.info(`Cron job: ${invoicesCreated} monthly invoices created`);
  } catch (error) {
    logger.error('Cron job error (generateMonthlyInvoices):', error);
  }
}, {
  scheduled: false,
});

/**
 * RGPD: Anonymiser les logs d'audit de plus de 3 mois
 * Exécuté tous les jours à 2h du matin
 */
const anonymizeOldAuditLogs = cron.schedule('0 2 * * *', async () => {
  try {
    logger.info('Cron job: Anonymizing audit logs older than 3 months...');

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const result = await AuditLog.update(
      {
        ip_address: '0.0.0.0',
        user_agent: 'ANONYMIZED',
        old_values: null,
        new_values: null,
      },
      {
        where: {
          created_at: {
            [Op.lt]: threeMonthsAgo,
          },
          ip_address: {
            [Op.ne]: '0.0.0.0', // Ne pas anonymiser ce qui l'est déjà
          },
        },
      },
    );

    logger.info(`Cron job: ${result[0]} audit logs anonymized (older than 3 months)`);
  } catch (error) {
    logger.error('Cron job error (anonymizeOldAuditLogs):', error);
  }
}, {
  scheduled: false,
});

/**
 * RGPD Article 17: Supprimer définitivement les comptes après 30 jours
 * Exécuté tous les jours à 3h du matin
 */
const deleteAccountsAfter30Days = cron.schedule('0 3 * * *', async () => {
  try {
    logger.info('Cron job: Deleting accounts requested for deletion 30+ days ago...');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Trouver tous les utilisateurs dont la suppression a été demandée il y a plus de 30 jours
    const usersToDelete = await User.findAll({
      where: {
        deletion_requested_at: {
          [Op.lte]: thirtyDaysAgo,
        },
      },
      attributes: ['id', 'username', 'email', 'organization_id', 'deletion_requested_at'],
    });

    let deletedCount = 0;

    for (const user of usersToDelete) {
      try {
        logger.info(`Suppression RGPD du compte utilisateur ${user.id} (${user.username}) - Demande faite le ${user.deletion_requested_at}`);

        // Supprimer définitivement l'utilisateur
        // Note: Les ventes et audit logs sont conservés pour conformité NF525
        // mais anonymisés (user_id reste pour intégrité référentielle)
        await user.destroy();

        deletedCount++;
      } catch (error) {
        logger.error(`Erreur lors de la suppression de l'utilisateur ${user.id}:`, error);
      }
    }

    logger.info(`Cron job: ${deletedCount} comptes utilisateurs supprimés définitivement (RGPD Article 17)`);

    if (deletedCount > 0) {
      logger.info(`Les ventes et logs d'audit associés sont conservés pour conformité NF525 mais les comptes utilisateurs sont supprimés`);
    }
  } catch (error) {
    logger.error('Cron job error (deleteAccountsAfter30Days):', error);
  }
}, {
  scheduled: false,
});

/**
 * Démarrer tous les cron jobs
 */
const startCronJobs = () => {
  logger.info('Starting cron jobs...');
  checkTrialsExpiring.start();
  generateMonthlyInvoices.start();
  anonymizeOldAuditLogs.start();
  deleteAccountsAfter30Days.start();
  logger.info('Cron jobs started successfully');
};

/**
 * Arrêter tous les cron jobs
 */
const stopCronJobs = () => {
  logger.info('Stopping cron jobs...');
  checkTrialsExpiring.stop();
  generateMonthlyInvoices.stop();
  anonymizeOldAuditLogs.stop();
  deleteAccountsAfter30Days.stop();
  logger.info('Cron jobs stopped');
};

module.exports = {
  startCronJobs,
  stopCronJobs,
};
