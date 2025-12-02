const { Organization } = require('../models');
const logger = require('../utils/logger');

/**
 * Middleware d'isolation multi-tenant
 *
 * Détecte l'organisation depuis:
 * 1. req.user.organization_id (après authenticateToken) - PRIORITÉ
 * 2. Header X-Organization-ID (pour admin/tests)
 * 3. Sous-domaine (tenant.flexpos.com)
 * 4. Domaine personnalisé (restaurant.com)
 * 5. Fallback: Organisation par défaut (id=1) en dev
 *
 * Injecte dans req:
 * - req.organizationId {number} - ID de l'organisation
 * - req.organization {Organization} - Objet organisation complet
 *
 * IMPORTANT: Ce middleware DOIT être placé APRÈS authenticateToken
 */
const tenantIsolation = async (req, res, next) => {
  try {
    let organizationId = null;
    let organization = null;

    // ============================================
    // STRATÉGIE 1: User authentifié (PRIORITÉ)
    // ============================================
    if (req.user && req.user.organization_id) {
      organizationId = req.user.organization_id;
      logger.debug(`Tenant detection: From authenticated user (org_id=${organizationId})`);
    }

    // ============================================
    // STRATÉGIE 2: Header X-Organization-ID
    // ============================================
    // Utilisé pour:
    // - Admin super qui peut switcher entre orgs
    // - Tests automatisés
    // - API calls spécifiques
    else if (req.headers['x-organization-id']) {
      // ✅ FIX CVE-FLEXPOS-006: Autoriser uniquement super-admins
      if (!req.admin || req.admin.role !== 'super_admin') {
        logger.warn(`Unauthorized X-Organization-ID attempt from user ${req.user?.id || 'unknown'}`);
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'X-Organization-ID header is restricted to super-admins only',
          },
        });
      }

      organizationId = parseInt(req.headers['x-organization-id'], 10);

      if (isNaN(organizationId)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ORGANIZATION_ID',
            message: 'L\'ID d\'organisation doit être un nombre',
          },
        });
      }

      logger.warn(`Super-admin ${req.admin.id} accessing organization ${organizationId} (audit logged)`);

      // Créer audit log pour traçabilité RGPD
      if (req.admin) {
        const AuditLog = require('../models/AuditLog');
        AuditLog.create({
          user_id: req.admin.id,
          action: 'CROSS_TENANT_ACCESS',
          entity_type: 'organization',
          entity_id: organizationId,
          ip_address: req.ip,
          user_agent: req.get('user-agent'),
          details: { original_org: req.user?.organization_id, target_org: organizationId },
        }).catch(err => logger.error('Failed to log cross-tenant access:', err));
      }
    }

    // ============================================
    // STRATÉGIE 3: Sous-domaine
    // ============================================
    // Format: tenant.flexpos.com
    // tenant.slug sera cherché dans organizations
    else if (req.hostname && req.hostname !== 'localhost') {
      const parts = req.hostname.split('.');

      // Si c'est un sous-domaine (au moins 3 parties: tenant.domain.tld)
      if (parts.length >= 3) {
        const subdomain = parts[0];

        // Ignorer les sous-domaines système
        if (subdomain !== 'www' && subdomain !== 'api' && subdomain !== 'admin') {
          organization = await Organization.findOne({
            where: { slug: subdomain },
          });

          if (organization) {
            organizationId = organization.id;
            logger.debug(`Tenant detection: From subdomain "${subdomain}" (org_id=${organizationId})`);
          }
        }
      }
    }

    // ============================================
    // STRATÉGIE 4: Domaine personnalisé
    // ============================================
    // Format: restaurant.com
    // Cherche dans organizations.domain
    if (!organizationId && req.hostname !== 'localhost' && !req.hostname.includes('flexpos')) {
      organization = await Organization.findOne({
        where: { domain: req.hostname },
      });

      if (organization) {
        organizationId = organization.id;
        logger.debug(`Tenant detection: From custom domain "${req.hostname}" (org_id=${organizationId})`);
      }
    }

    // ============================================
    // FALLBACK: Organisation par défaut (DEV)
    // ============================================
    if (!organizationId) {
      // En développement, utiliser l'organisation par défaut
      if (process.env.NODE_ENV === 'development' || req.hostname === 'localhost') {
        organizationId = 1; // FlexPOS par défaut
        logger.warn(`Tenant detection: Using default organization (org_id=1) - DEV MODE`);
      } else {
        // En production, si aucune organisation trouvée, erreur
        return res.status(404).json({
          success: false,
          error: {
            code: 'ORGANIZATION_NOT_FOUND',
            message: 'Aucune organisation trouvée pour ce domaine',
          },
        });
      }
    }

    // ============================================
    // CHARGER L'ORGANISATION
    // ============================================
    if (!organization) {
      organization = await Organization.findByPk(organizationId);
    }

    // Vérifier que l'organisation existe
    if (!organization) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ORGANIZATION_NOT_FOUND',
          message: `Organisation avec l'ID ${organizationId} introuvable`,
        },
      });
    }

    // ============================================
    // VÉRIFIER STATUT ORGANISATION
    // ============================================
    if (organization.status !== 'active') {
      let message = 'Organisation inactive';

      if (organization.status === 'suspended') {
        message = 'Organisation suspendue. Veuillez contacter le support.';
      } else if (organization.status === 'cancelled') {
        message = 'Organisation annulée. Veuillez contacter le support.';
      }

      return res.status(403).json({
        success: false,
        error: {
          code: 'ORGANIZATION_INACTIVE',
          message,
          status: organization.status,
        },
      });
    }

    // Vérifier si l'abonnement est expiré
    if (organization.isSubscriptionExpired && organization.isSubscriptionExpired()) {
      return res.status(402).json({
        success: false,
        error: {
          code: 'SUBSCRIPTION_EXPIRED',
          message: 'L\'abonnement de l\'organisation a expiré',
          subscription_ends_at: organization.subscription_ends_at,
        },
      });
    }

    // ============================================
    // INJECTER DANS LA REQUÊTE
    // ============================================
    req.organizationId = organizationId;
    req.organization = organization;

    logger.debug(`Tenant isolation: org_id=${organizationId}, org_name="${organization.name}", status=${organization.status}`);

    next();
  } catch (error) {
    logger.error('Tenant isolation error:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'TENANT_ISOLATION_ERROR',
        message: 'Erreur lors de la détection de l\'organisation',
      },
    });
  }
};

module.exports = tenantIsolation;
