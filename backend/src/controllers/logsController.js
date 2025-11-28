const { AuditLog, User, sequelize } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const { sendCsvResponse, formatDate } = require('../utils/csvHelper');

/**
 * Récupérer tous les logs d'audit avec filtres
 */
const getAllLogs = async (req, res, next) => {
  try {
    const {
      start_date,
      end_date,
      user_id,
      action,
      entity_type,
      limit = 100,
      offset = 0,
    } = req.query;

    const where = {
      organization_id: req.organizationId, // MULTI-TENANT: Filtrer par organisation
    };

    // Filtres par date
    if (start_date) {
      where.created_at = {
        ...where.created_at,
        [Op.gte]: new Date(start_date),
      };
    }

    if (end_date) {
      where.created_at = {
        ...where.created_at,
        [Op.lte]: new Date(end_date),
      };
    }

    // Filtre par utilisateur
    if (user_id) {
      where.user_id = user_id;
    }

    // Filtre par type d'action
    if (action) {
      where.action = action;
    }

    // Filtre par type d'entité
    if (entity_type) {
      where.entity_type = entity_type;
    }

    // Récupérer les logs avec les infos utilisateur
    const { count, rows: logs } = await AuditLog.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'first_name', 'last_name', 'role'],
        },
      ],
    });

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          total: count,
          limit: parseInt(limit),
          offset: parseInt(offset),
          has_more: count > parseInt(offset) + parseInt(limit),
        },
      },
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des logs:', error);
    next(error);
  }
};

/**
 * Récupérer les statistiques des logs
 */
const getLogsStats = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    const where = {
      organization_id: req.organizationId, // MULTI-TENANT: Filtrer par organisation
    };

    if (start_date) {
      where.created_at = {
        ...where.created_at,
        [Op.gte]: new Date(start_date),
      };
    }

    if (end_date) {
      where.created_at = {
        ...where.created_at,
        [Op.lte]: new Date(end_date),
      };
    }

    // Statistiques par action
    const actionStats = await AuditLog.findAll({
      where,
      attributes: [
        'action',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['action'],
      raw: true,
    });

    // Statistiques par utilisateur
    const userStats = await AuditLog.findAll({
      where,
      attributes: [
        'user_id',
        [sequelize.fn('COUNT', sequelize.col('audit_logs.id')), 'count'],
      ],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'first_name', 'last_name'],
        },
      ],
      group: ['user_id', 'user.id', 'user.username', 'user.first_name', 'user.last_name'],
      raw: false,
    });

    // Statistiques par type d'entité
    const entityStats = await AuditLog.findAll({
      where,
      attributes: [
        'entity_type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['entity_type'],
      raw: true,
    });

    // Total des logs
    const totalLogs = await AuditLog.count({ where });

    res.json({
      success: true,
      data: {
        total_logs: totalLogs,
        by_action: actionStats,
        by_user: userStats,
        by_entity: entityStats,
      },
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des stats logs:', error);
    next(error);
  }
};

/**
 * Exporter les logs en CSV
 */
const exportLogsCSV = async (req, res, next) => {
  try {
    const {
      start_date,
      end_date,
      user_id,
      action,
      entity_type,
    } = req.query;

    const where = {
      organization_id: req.organizationId, // MULTI-TENANT: Filtrer par organisation
    };

    // Mêmes filtres que getAllLogs
    if (start_date) {
      where.created_at = {
        ...where.created_at,
        [Op.gte]: new Date(start_date),
      };
    }

    if (end_date) {
      where.created_at = {
        ...where.created_at,
        [Op.lte]: new Date(end_date),
      };
    }

    if (user_id) {
      where.user_id = user_id;
    }

    if (action) {
      where.action = action;
    }

    if (entity_type) {
      where.entity_type = entity_type;
    }

    // Récupérer tous les logs (MAX 10,000 pour éviter OutOfMemory)
    const MAX_EXPORT_LIMIT = 10000;
    const logs = await AuditLog.findAll({
      where,
      limit: MAX_EXPORT_LIMIT,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'first_name', 'last_name', 'role'],
        },
      ],
    });

    // Vérifier si limite atteinte
    const totalCount = await AuditLog.count({ where });

    // Utiliser le helper CSV réutilisable
    sendCsvResponse({
      res,
      data: logs,
      columns: [
        'Date',
        'Utilisateur',
        'Rôle',
        'Action',
        'Type d\'entité',
        'ID entité',
        'IP',
        'User Agent',
      ],
      rowMapper: (log) => {
        const username = log.user
          ? `${log.user.first_name || ''} ${log.user.last_name || ''}`.trim() || log.user.username
          : 'Système';

        return [
          formatDate(log.created_at),
          username,
          log.user?.role || 'N/A',
          log.action,
          log.entity_type || 'N/A',
          log.entity_id || 'N/A',
          log.ip_address || 'N/A',
          log.user_agent ? `${log.user_agent.substring(0, 50)}...` : 'N/A',
        ];
      },
      filename: 'logs_audit',
      logger,
      user: req.user,
      totalCount,
      maxLimit: MAX_EXPORT_LIMIT,
    });
  } catch (error) {
    logger.error('Erreur lors de l\'export CSV logs:', error);
    next(error);
  }
};

module.exports = {
  getAllLogs,
  getLogsStats,
  exportLogsCSV,
};
