const PDFDocument = require('pdfkit');
const { formatPrice } = require('../utils/constants');

/**
 * Génère un ticket de caisse PDF conforme aux normes françaises
 * @param {Object} sale - La vente avec ses items
 * @param {Object} cashRegister - La caisse associée
 * @param {Object} user - L'utilisateur ayant fait la vente
 * @returns {PDFDocument} Le document PDF
 */
const generateTicketPDF = (sale, cashRegister, user) => {
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
  centerText('🍔 BensBurger', doc.y);

  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica');
  centerText('Restaurant Rapide', doc.y);
  centerText('123 Avenue des Burgers', doc.y + 12);
  centerText('75001 Paris', doc.y + 24);
  centerText('Tél: 01 23 45 67 89', doc.y + 36);

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
    20
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
      { width: contentWidth * 0.7, align: 'left' }
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
        doc.y
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
        `${formatPrice(details.amount_ht)} HT`,
        doc.y
      );
      doc.moveDown(0.2);
      lineText(
        `  Montant TVA`,
        `${formatPrice(details.amount_vat)}`,
        doc.y
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
        20
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
  centerText('À bientôt chez BensBurger', doc.y);

  doc.moveDown(1);

  // Mentions légales
  doc.fontSize(7);
  centerText('SARL BensBurger - Capital: 10000€', doc.y);
  doc.moveDown(0.2);
  centerText('SIRET: 123 456 789 00012', doc.y);
  doc.moveDown(0.2);
  centerText('TVA: FR12345678901', doc.y);
  doc.moveDown(0.2);
  centerText('RCS Paris B 123 456 789', doc.y);

  return doc;
};

module.exports = {
  generateTicketPDF,
};
