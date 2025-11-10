const { Sale, SaleItem, sequelize } = require('../models');
const { calculateSaleTotals, calculateChange } = require('../services/vatService');
const logger = require('../utils/logger');

/**
 * Créer une nouvelle vente
 */
const createSale = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { items, payment_method, amount_paid, payment_details } = req.body;

    // Validation
    if (!items || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_CART',
          message: 'Le panier est vide',
        },
      });
    }

    if (!payment_method || !amount_paid) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PAYMENT_INFO',
          message: 'Méthode de paiement et montant requis',
        },
      });
    }

    // Calculer les totaux (HT, TTC, TVA)
    const { totalHT, totalTTC, vatDetails } = calculateSaleTotals(items);

    // Vérifier que le montant payé est suffisant
    if (parseFloat(amount_paid) < totalTTC) {
      await transaction.rollback();
      return res.status(422).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PAYMENT',
          message: 'Le montant payé est insuffisant',
          details: {
            total_due: totalTTC,
            amount_paid: parseFloat(amount_paid),
            missing: totalTTC - parseFloat(amount_paid),
          },
        },
      });
    }

    // Calculer la monnaie à rendre
    const changeGiven = calculateChange(totalTTC, parseFloat(amount_paid));

    // Créer la vente (le trigger générera automatiquement le ticket_number)
    const sale = await Sale.create(
      {
        user_id: req.user.id,
        total_ht: totalHT,
        total_ttc: totalTTC,
        vat_details: vatDetails,
        payment_method,
        payment_details: payment_details || null,
        amount_paid: parseFloat(amount_paid),
        change_given: changeGiven,
        status: 'completed',
      },
      { transaction }
    );

    // Créer les lignes de vente
    const saleItemsData = items.map((item) => ({
      sale_id: sale.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price_ht: parseFloat(item.unit_price_ht),
      vat_rate: parseFloat(item.vat_rate),
      total_ht: parseFloat(item.total_ht),
      total_ttc: parseFloat(item.total_ttc),
      discount_percent: item.discount_percent || 0,
      discount_amount: item.discount_amount || 0,
    }));

    await SaleItem.bulkCreate(saleItemsData, { transaction });

    // Commit de la transaction
    await transaction.commit();

    // Recharger la vente avec les items
    const completeSale = await Sale.findByPk(sale.id, {
      include: [
        {
          model: SaleItem,
          as: 'items',
        },
      ],
    });

    logger.info(
      `Vente créée: ${completeSale.ticket_number} - ${totalTTC}€ par ${req.user.username}`
    );

    res.status(201).json({
      success: true,
      data: completeSale,
      message: 'Vente enregistrée avec succès',
    });
  } catch (error) {
    await transaction.rollback();
    logger.error('Erreur lors de la création de la vente:', error);
    next(error);
  }
};

/**
 * Récupérer toutes les ventes (avec filtres)
 */
const getAllSales = async (req, res, next) => {
  try {
    const {
      start_date,
      end_date,
      user_id,
      payment_method,
      status = 'completed',
      limit = 50,
      offset = 0,
    } = req.query;

    const where = {};

    // Filtres
    if (start_date) {
      where.created_at = {
        ...where.created_at,
        [sequelize.Op.gte]: new Date(start_date),
      };
    }

    if (end_date) {
      where.created_at = {
        ...where.created_at,
        [sequelize.Op.lte]: new Date(end_date),
      };
    }

    if (user_id && req.user.role === 'admin') {
      where.user_id = user_id;
    } else if (req.user.role === 'cashier') {
      // Les caissiers ne voient que leurs ventes
      where.user_id = req.user.id;
    }

    if (payment_method) {
      where.payment_method = payment_method;
    }

    if (status) {
      where.status = status;
    }

    // Récupérer les ventes
    const { count, rows: sales } = await Sale.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [
        {
          model: SaleItem,
          as: 'items',
        },
      ],
    });

    res.json({
      success: true,
      data: {
        sales,
        pagination: {
          total: count,
          limit: parseInt(limit),
          offset: parseInt(offset),
          has_more: count > parseInt(offset) + parseInt(limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer une vente par ID
 */
const getSaleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const sale = await Sale.findByPk(id, {
      include: [
        {
          model: SaleItem,
          as: 'items',
        },
      ],
    });

    if (!sale) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Vente non trouvée',
        },
      });
    }

    // Les caissiers ne peuvent voir que leurs propres ventes
    if (req.user.role === 'cashier' && sale.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Accès refusé',
        },
      });
    }

    res.json({
      success: true,
      data: sale,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSale,
  getAllSales,
  getSaleById,
};
