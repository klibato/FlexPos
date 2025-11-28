const { Invoice, Organization, sequelize } = require('../models');
const pdfService = require('../services/pdfService');
const logger = require('../utils/logger');

/**
 * GET /api/invoices
 * Récupérer les factures de l'organisation
 */
const getInvoices = async (req, res, next) => {
  try {
    const { organizationId } = req;
    const { limit = 10, offset = 0, status } = req.query;

    const where = { organization_id: organizationId };
    if (status) {
      where.status = status;
    }

    const invoices = await Invoice.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: {
        association: 'subscription',
        attributes: ['plan', 'status'],
      },
    });

    return res.json({
      success: true,
      data: {
        invoices: invoices.rows.map((inv) => ({
          id: inv.id,
          invoice_number: inv.invoice_number,
          subtotal: (inv.subtotal_cents / 100).toFixed(2),
          tax: (inv.tax_cents / 100).toFixed(2),
          total: (inv.total_cents / 100).toFixed(2),
          currency: inv.currency,
          status: inv.status,
          tax_rate: inv.tax_rate,
          period_start: inv.period_start,
          period_end: inv.period_end,
          due_date: inv.due_date,
          paid_at: inv.paid_at,
          created_at: inv.created_at,
        })),
        total: invoices.count,
      },
    });
  } catch (error) {
    logger.error('Error fetching invoices:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_INVOICES_FAILED',
        message: 'Erreur lors de la récupération des factures',
      },
    });
  }
};

/**
 * GET /api/invoices/:id
 * Récupérer une facture spécifique
 */
const getInvoice = async (req, res, next) => {
  try {
    const { organizationId } = req;
    const { id } = req.params;

    const invoice = await Invoice.findOne({
      where: { id, organization_id: organizationId },
      include: {
        association: 'subscription',
        attributes: ['plan', 'status'],
      },
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INVOICE_NOT_FOUND',
          message: 'Facture non trouvée',
        },
      });
    }

    return res.json({
      success: true,
      data: {
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        subtotal: (invoice.subtotal_cents / 100).toFixed(2),
        tax: (invoice.tax_cents / 100).toFixed(2),
        total: (invoice.total_cents / 100).toFixed(2),
        currency: invoice.currency,
        status: invoice.status,
        tax_rate: invoice.tax_rate,
        period_start: invoice.period_start,
        period_end: invoice.period_end,
        due_date: invoice.due_date,
        paid_at: invoice.paid_at,
        subscription: invoice.subscription,
        created_at: invoice.created_at,
      },
    });
  } catch (error) {
    logger.error('Error fetching invoice:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_INVOICE_FAILED',
        message: 'Erreur lors de la récupération de la facture',
      },
    });
  }
};

/**
 * GET /api/invoices/:id/download
 * Télécharger une facture au format PDF
 */
const downloadInvoicePDF = async (req, res, next) => {
  try {
    const { organizationId } = req;
    const { id } = req.params;

    // Récupérer la facture
    const invoice = await Invoice.findOne({
      where: { id, organization_id: organizationId },
      include: [
        {
          association: 'organization',
          attributes: ['name', 'email', 'phone', 'settings'],
        },
        {
          association: 'subscription',
          attributes: ['plan'],
        },
      ],
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INVOICE_NOT_FOUND',
          message: 'Facture non trouvée',
        },
      });
    }

    // Générer le PDF
    const pdfBuffer = await pdfService.generateInvoicePDF(invoice);

    // Envoyer le PDF au client
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${invoice.invoice_number}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (error) {
    logger.error('Error downloading invoice PDF:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'PDF_GENERATION_FAILED',
        message: 'Erreur lors de la génération du PDF',
      },
    });
  }
};

module.exports = {
  getInvoices,
  getInvoice,
  downloadInvoicePDF,
};
