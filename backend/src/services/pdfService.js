const PDFDocument = require('pdfkit');
const { formatPrice } = require('../utils/helpers');

/**
 * Génère un ticket de caisse PDF conforme aux normes françaises
 * @param {Object} sale - La vente avec ses items
 * @param {Object} cashRegister - La caisse associée
 * @param {Object} user - L'utilisateur ayant fait la vente
 * @param {Object} settings - Les paramètres du commerce
 * @returns {PDFDocument} Le document PDF
 */
const generateTicketPDF = (sale, cashRegister, user, settings) => {
  const doc = new PDFDocument({
    size: [226.77, 841.89], // 80mm de largeur (ticket thermique)
    margins: { top: 20, bottom: 20, left: 20, right: 20 },
  });

  const pageWidth = 226.77;
  const contentWidth = pageWidth - 40;

  // Helper pour centrer le texte
  const centerText = (text, y, options = {}) => {
    const textWidth = doc.widthOfString(text, options);
    const x = (pageWidth - textWidth) / 2;
    doc.text(text, x, y, options);
  };

  // Helper pour ligne avec texte à gauche et à droite
  const lineText = (left, right, y) => {
    doc.text(left, 20, y, { width: contentWidth / 2, align: 'left' });
    doc.text(right, 20 + contentWidth / 2, y, {
      width: contentWidth / 2,
      align: 'right',
    });
  };

  // Header - Logo et nom
  doc.fontSize(20).font('Helvetica-Bold');
  centerText(settings.store_name || 'FlexPOS', doc.y);

  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica');
  if (settings.store_description) {
    centerText(settings.store_description, doc.y);
  }
  if (settings.address_line1) {
    centerText(settings.address_line1, doc.y + 12);
  }
  if (settings.address_line2) {
    centerText(settings.address_line2, doc.y + 24);
    centerText(`${settings.postal_code || ''} ${settings.city || ''}`, doc.y + 36);
    if (settings.phone) {
      centerText(`Tél: ${settings.phone}`, doc.y + 48);
    }
  } else {
    centerText(`${settings.postal_code || ''} ${settings.city || ''}`, doc.y + 24);
    if (settings.phone) {
      centerText(`Tél: ${settings.phone}`, doc.y + 36);
    }
  }

  doc.moveDown(2);

  // Separator
  doc
    .moveTo(20, doc.y)
    .lineTo(pageWidth - 20, doc.y)
    .stroke();

  doc.moveDown(0.5);

  // Informations ticket
  doc.fontSize(9);
  doc.text(`Ticket N°: ${sale.ticket_number}`, 20);
  doc.text(
    `Date: ${new Date(sale.created_at).toLocaleString('fr-FR')}`,
    20,
  );
  doc.text(`Caisse: ${cashRegister.register_name}`, 20);
  doc.text(`Caissier: ${user.first_name} ${user.last_name}`, 20);

  doc.moveDown(0.5);

  // Separator
  doc
    .moveTo(20, doc.y)
    .lineTo(pageWidth - 20, doc.y)
    .stroke();

  doc.moveDown(0.5);

  // Articles
  doc.fontSize(10).font('Helvetica-Bold');
  doc.text('ARTICLES', 20);
  doc.moveDown(0.3);

  doc.font('Helvetica').fontSize(9);

  sale.items.forEach((item) => {
    // Nom du produit et quantité
    doc.text(
      `${item.quantity}x ${item.product_name}`,
      20,
      doc.y,
      { width: contentWidth * 0.7, align: 'left' },
    );

    // Prix total de la ligne (aligné à droite)
    const lineTotal = formatPrice(item.total_ttc);
    doc.text(lineTotal, 20 + contentWidth * 0.7, doc.y - 10, {
      width: contentWidth * 0.3,
      align: 'right',
    });

    // Prix unitaire en petit
    if (item.quantity > 1) {
      doc.fontSize(8).fillColor('#666666');
      doc.text(
        `  (${formatPrice(item.unit_price_ht)} HT × ${item.quantity})`,
        20,
        doc.y,
      );
      doc.fillColor('#000000').fontSize(9);
    }

    doc.moveDown(0.3);
  });

  doc.moveDown(0.5);

  // Separator
  doc
    .moveTo(20, doc.y)
    .lineTo(pageWidth - 20, doc.y)
    .stroke();

  doc.moveDown(0.5);

  // Totaux HT par taux de TVA
  doc.fontSize(9);
  if (sale.vat_details && Object.keys(sale.vat_details).length > 0) {
    doc.text('DÉTAIL TVA', 20);
    doc.moveDown(0.3);

    Object.entries(sale.vat_details).forEach(([rate, details]) => {
      lineText(
        `TVA ${rate}%`,
        `${formatPrice(details.base_ht)} HT`,
        doc.y,
      );
      doc.moveDown(0.2);
      lineText(
        `  Montant TVA`,
        `${formatPrice(details.amount_vat)}`,
        doc.y,
      );
      doc.moveDown(0.3);
    });

    doc.moveDown(0.3);
  }

  // Total HT
  lineText('TOTAL HT', formatPrice(sale.total_ht), doc.y);
  doc.moveDown(0.3);

  // Total TTC
  doc.fontSize(12).font('Helvetica-Bold');
  lineText('TOTAL TTC', formatPrice(sale.total_ttc), doc.y);
  doc.font('Helvetica').fontSize(9);
  doc.moveDown(0.5);

  // Separator
  doc
    .moveTo(20, doc.y)
    .lineTo(pageWidth - 20, doc.y)
    .stroke();

  doc.moveDown(0.5);

  // Mode de paiement
  doc.fontSize(10).font('Helvetica-Bold');
  doc.text('PAIEMENT', 20);
  doc.moveDown(0.3);
  doc.font('Helvetica').fontSize(9);

  const paymentLabels = {
    cash: 'Espèces',
    card: 'Carte Bancaire',
    meal_voucher: 'Titres Restaurant',
    mixed: 'Paiement Mixte',
  };

  doc.text(`Mode: ${paymentLabels[sale.payment_method] || sale.payment_method}`, 20);

  if (sale.payment_method === 'mixed' && sale.payment_details && sale.payment_details.payments) {
    doc.moveDown(0.3);
    doc.fontSize(8);
    sale.payment_details.payments.forEach((p) => {
      doc.text(
        `  - ${paymentLabels[p.method]}: ${formatPrice(p.amount)}`,
        20,
      );
    });
    doc.fontSize(9);
  }

  doc.moveDown(0.3);
  lineText('Montant payé', formatPrice(sale.amount_paid), doc.y);

  if (sale.change_given > 0) {
    doc.moveDown(0.3);
    lineText('Rendu monnaie', formatPrice(sale.change_given), doc.y);
  }

  doc.moveDown(1);

  // Separator
  doc
    .moveTo(20, doc.y)
    .lineTo(pageWidth - 20, doc.y)
    .stroke();

  doc.moveDown(0.5);

  // Footer
  doc.fontSize(8).fillColor('#666666');
  centerText('Merci de votre visite !', doc.y);
  doc.moveDown(0.3);
  centerText(`À bientôt chez ${settings.store_name || 'FlexPOS'}`, doc.y);

  doc.moveDown(1);

  // Mentions légales
  doc.fontSize(7);
  if (settings.legal_form && settings.capital_amount) {
    const capital = parseFloat(settings.capital_amount).toFixed(0);
    centerText(`${settings.legal_form} ${settings.store_name} - Capital: ${capital}${settings.currency_symbol || '€'}`, doc.y);
    doc.moveDown(0.2);
  }
  if (settings.siret) {
    centerText(`SIRET: ${settings.siret}`, doc.y);
    doc.moveDown(0.2);
  }
  if (settings.vat_number) {
    centerText(`TVA: ${settings.vat_number}`, doc.y);
    doc.moveDown(0.2);
  }
  if (settings.rcs) {
    centerText(`RCS ${settings.rcs}`, doc.y);
  }

  return doc;
};

/**
 * Génère une facture d'abonnement SaaS au format PDF
 * @param {Object} invoice - La facture avec ses relations
 * @returns {Buffer} Le PDF généré
 */
const generateInvoicePDF = async (invoice) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    // Accumuler les chunks du PDF
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    doc.on('error', reject);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const contentWidth = pageWidth - 100;

    // Helper pour centrer le texte
    const centerText = (text, y, fontSize = 12, bold = false) => {
      const font = bold ? 'Helvetica-Bold' : 'Helvetica';
      doc.font(font).fontSize(fontSize);
      const textWidth = doc.widthOfString(text);
      const x = (pageWidth - textWidth) / 2;
      doc.text(text, x, y);
    };

    // Header
    centerText('FACTURE', 50, 24, true);
    doc.fontSize(10);
    doc.text(
      `Numéro: ${invoice.invoice_number}`,
      50,
      100,
    );
    doc.text(
      `Date: ${new Date(invoice.created_at).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })}`,
      50,
      115,
    );

    // Organization Info (Émetteur)
    doc.fontSize(11).font('Helvetica-Bold');
    doc.text('Émetteur:', 50, 150);
    doc.font('Helvetica').fontSize(10);
    doc.text(invoice.organization.name, 50, 170);
    if (invoice.organization.settings?.address_line1) {
      doc.text(invoice.organization.settings.address_line1, 50, 185);
    }
    if (invoice.organization.settings?.postal_code) {
      doc.text(
        `${invoice.organization.settings.postal_code} ${
          invoice.organization.settings.city || ''
        }`,
        50,
        200,
      );
    }
    if (invoice.organization.email) {
      doc.text(invoice.organization.email, 50, 215);
    }
    if (invoice.organization.phone) {
      doc.text(invoice.organization.phone, 50, 230);
    }

    // Invoice Details
    doc.fontSize(11).font('Helvetica-Bold');
    doc.text('Période de facturation:', 350, 150);
    doc.font('Helvetica').fontSize(10);
    const startDate = new Date(invoice.period_start).toLocaleDateString(
      'fr-FR',
      { day: '2-digit', month: '2-digit', year: 'numeric' },
    );
    const endDate = new Date(invoice.period_end).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    doc.text(`Du ${startDate} au ${endDate}`, 350, 170);

    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Plan:', 350, 195);
    doc.font('Helvetica');
    doc.text(invoice.subscription?.plan || 'Non spécifié', 350, 210);

    // Separator line
    doc.moveTo(50, 260).lineTo(pageWidth - 50, 260).stroke();

    // Table header
    let y = 280;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Description', 50, y);
    doc.text('Montant HT', 400, y, { align: 'right' });
    doc.text('Montant TTC', 500, y, { align: 'right' });

    // Table content
    y = 305;
    doc.font('Helvetica').fontSize(10);
    const description = `Abonnement ${invoice.subscription?.plan || 'FlexPOS'} - ${startDate} au ${endDate}`;
    doc.text(description, 50, y, { width: 300 });

    const subtotal = (invoice.subtotal_cents / 100).toFixed(2);
    const total = (invoice.total_cents / 100).toFixed(2);

    doc.text(`${subtotal} €`, 400, y, { align: 'right' });
    doc.text(`${total} €`, 500, y, { align: 'right' });

    // Totals section
    y = 360;
    doc.moveTo(50, y).lineTo(pageWidth - 50, y).stroke();

    y = 375;
    doc.fontSize(10).font('Helvetica');
    doc.text('Sous-total HT:', 400, y);
    doc.text(`${subtotal} €`, 500, y, { align: 'right' });

    y = 395;
    const tax = (invoice.tax_cents / 100).toFixed(2);
    doc.text(`TVA (${invoice.tax_rate}%):', 400, y);
    doc.text(`${tax} €`, 500, y, { align: 'right' });

    y = 420;
    doc.fontSize(12).font('Helvetica-Bold');
    doc.moveTo(50, y - 5).lineTo(pageWidth - 50, y - 5).stroke();
    doc.text('TOTAL TTC:', 400, y);
    doc.text(`${total} €`, 500, y, { align: 'right' });
    doc.moveTo(50, y + 20).lineTo(pageWidth - 50, y + 20).stroke();

    // Payment info
    y = 460;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Statut de paiement:', 50, y);
    doc.font('Helvetica');
    const statusLabel =
      invoice.status === 'paid'
        ? 'Payée'
        : invoice.status === 'open'
          ? 'En attente de paiement'
          : invoice.status === 'void'
            ? 'Annulée'
            : 'Impayée';
    doc.text(statusLabel, 50, y + 15);

    if (invoice.paid_at) {
      const paidDate = new Date(invoice.paid_at).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      doc.text(`Date de paiement: ${paidDate}`, 50, y + 30);
    }

    // Footer
    y = pageHeight - 80;
    doc.fontSize(8).fillColor('#666666');
    doc.moveTo(50, y).lineTo(pageWidth - 50, y).stroke();

    y = y + 15;
    doc.text('Conditions:', 50, y);
    doc.text(
      'Cette facture concerne votre abonnement FlexPOS. Le paiement doit être effectué selon les conditions de votre contrat.',
      50,
      y + 15,
      { width: contentWidth },
    );

    doc.fontSize(7).fillColor('#999999');
    y = pageHeight - 25;
    centerText(
      `Facture générée le ${new Date().toLocaleDateString('fr-FR')} - FlexPOS`,
      y,
      8,
    );

    doc.end();
  });
};

module.exports = {
  generateTicketPDF,
  generateInvoicePDF,
};
