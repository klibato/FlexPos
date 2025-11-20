const { Organization, User, Sale } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * GET /api/admin/stats - Statistiques globales
 */
const getStats = async (req, res, next) => {
  try {
    // Compter les organisations
    const totalOrganizations = await Organization.count();
    const activeOrganizations = await Organization.count({
      where: { status: 'active' },
    });
    const trialOrganizations = await Organization.count({
      where: {
        trial_ends_at: { [Op.gt]: new Date() },
      },
    });

    // Compter les utilisateurs
    const totalUsers = await User.count();
    const activeUsers = await User.count({
      where: { is_active: true },
    });

    // Revenus (simulation basée sur plans)
    const planRevenue = {
      starter: 29,
      premium: 79,
      enterprise: 199,
    };

    const orgsByPlan = await Organization.findAll({
      attributes: ['plan', [Organization.sequelize.fn('COUNT', Organization.sequelize.col('id')), 'count']],
      where: {
        status: 'active',
        plan: { [Op.ne]: 'free' },
      },
      group: ['plan'],
    });

    let monthlyRevenue = 0;
    orgsByPlan.forEach((item) => {
      const count = parseInt(item.dataValues.count);
      const revenue = planRevenue[item.plan] || 0;
      monthlyRevenue += count * revenue;
    });

    return res.status(200).json({
      success: true,
      data: {
        organizations: {
          total: totalOrganizations,
          active: activeOrganizations,
          trial: trialOrganizations,
        },
        users: {
          total: totalUsers,
          active: activeUsers,
        },
        revenue: {
          monthly: monthlyRevenue,
          currency: 'EUR',
        },
      },
    });
  } catch (error) {
    logger.error('Erreur getStats:', error);
    next(error);
  }
};

/**
 * GET /api/admin/organizations - Liste toutes les organisations
 */
const getOrganizations = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      status = '',
      plan = '',
    } = req.query;

    const offset = (page - 1) * limit;

    // Construire les filtres
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { slug: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (plan) {
      where.plan = plan;
    }

    // Récupérer les organisations avec compte utilisateurs
    const { count, rows } = await Organization.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['id', 'username', 'role', 'is_active'],
          required: false,
        },
      ],
    });

    // Enrichir avec des statistiques
    const enrichedOrgs = await Promise.all(
      rows.map(async (org) => {
        const userCount = await org.getUserCount();
        const productCount = await org.getProductCount();

        return {
          ...org.toJSON(),
          stats: {
            users: userCount,
            products: productCount,
          },
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: {
        organizations: enrichedOrgs,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    logger.error('Erreur getOrganizations:', error);
    next(error);
  }
};

/**
 * GET /api/admin/organizations/:id - Détails d'une organisation
 */
const getOrganizationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const organization = await Organization.findByPk(id, {
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['id', 'username', 'role', 'first_name', 'last_name', 'email', 'is_active'],
        },
      ],
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Organisation introuvable',
        },
      });
    }

    // Ajouter statistiques
    const userCount = await organization.getUserCount();
    const productCount = await organization.getProductCount();

    // Compter les ventes (si modèle Sale existe)
    let salesCount = 0;
    let totalRevenue = 0;
    try {
      salesCount = await Sale.count({
        where: { organization_id: id },
      });

      const salesSum = await Sale.sum('total_amount', {
        where: { organization_id: id },
      });
      totalRevenue = salesSum || 0;
    } catch (err) {
      // Sale model peut ne pas exister
      logger.debug('Sale model not found or error:', err.message);
    }

    return res.status(200).json({
      success: true,
      data: {
        organization: organization.toJSON(),
        stats: {
          users: userCount,
          products: productCount,
          sales: salesCount,
          revenue: totalRevenue,
        },
      },
    });
  } catch (error) {
    logger.error('Erreur getOrganizationById:', error);
    next(error);
  }
};

/**
 * PUT /api/admin/organizations/:id - Modifier une organisation
 */
const updateOrganization = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      email,
      phone,
      plan,
      status,
      max_users,
      max_products,
      trial_ends_at,
      subscription_ends_at,
    } = req.body;

    const organization = await Organization.findByPk(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Organisation introuvable',
        },
      });
    }

    // Mise à jour des champs
    if (name !== undefined) organization.name = name;
    if (slug !== undefined) organization.slug = slug;
    if (email !== undefined) organization.email = email;
    if (phone !== undefined) organization.phone = phone;
    if (plan !== undefined) {
      organization.plan = plan;
      // Appliquer automatiquement les limites selon le plan
      organization.applyPlanLimits(plan);
    }
    if (status !== undefined) organization.status = status;
    if (max_users !== undefined) organization.max_users = max_users;
    if (max_products !== undefined) organization.max_products = max_products;
    if (trial_ends_at !== undefined) organization.trial_ends_at = trial_ends_at;
    if (subscription_ends_at !== undefined) organization.subscription_ends_at = subscription_ends_at;

    await organization.save();

    logger.info(`Organization ${id} updated by super admin ${req.user.id}`);

    return res.status(200).json({
      success: true,
      data: {
        organization: organization.toJSON(),
      },
    });
  } catch (error) {
    logger.error('Erreur updateOrganization:', error);
    next(error);
  }
};

/**
 * DELETE /api/admin/organizations/:id - Supprimer une organisation (soft delete)
 */
const deleteOrganization = async (req, res, next) => {
  try {
    const { id } = req.params;

    const organization = await Organization.findByPk(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Organisation introuvable',
        },
      });
    }

    // Soft delete (paranoid mode activé)
    await organization.destroy();

    logger.warn(`Organization ${id} deleted by super admin ${req.user.id}`);

    return res.status(200).json({
      success: true,
      message: 'Organisation supprimée avec succès',
    });
  } catch (error) {
    logger.error('Erreur deleteOrganization:', error);
    next(error);
  }
};

module.exports = {
  getStats,
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
};
