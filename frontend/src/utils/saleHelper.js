/**
 * Helpers pour la préparation des ventes
 */

/**
 * Calculer le prix TTC à partir du prix HT et du taux de TVA
 * @param {number} priceHT - Prix HT
 * @param {number} vatRate - Taux de TVA (ex: 10.0 pour 10%)
 * @returns {number} Prix TTC
 */
export const calculateTTC = (priceHT, vatRate) => {
  return parseFloat((priceHT * (1 + vatRate / 100)).toFixed(2));
};

/**
 * Calculer le prix HT à partir du prix TTC et du taux de TVA
 * @param {number} priceTTC - Prix TTC
 * @param {number} vatRate - Taux de TVA
 * @returns {number} Prix HT
 */
export const calculateHT = (priceTTC, vatRate) => {
  return parseFloat((priceTTC / (1 + vatRate / 100)).toFixed(2));
};

/**
 * Préparer les items du panier pour l'API de vente
 * @param {Array} cartItems - Items du panier
 * @returns {Array} Items formatés pour l'API
 */
export const prepareSaleItems = (cartItems) => {
  return cartItems.map((item) => {
    // Calculer le prix HT à partir du prix TTC
    const unitPriceHT = calculateHT(parseFloat(item.price_ttc), parseFloat(item.vat_rate));
    const totalHT = parseFloat((unitPriceHT * item.quantity).toFixed(2));
    const totalTTC = parseFloat((parseFloat(item.price_ttc) * item.quantity).toFixed(2));

    return {
      product_id: item.id,
      product_name: item.name,
      quantity: item.quantity,
      unit_price_ht: unitPriceHT,
      vat_rate: parseFloat(item.vat_rate),
      total_ht: totalHT,
      total_ttc: totalTTC,
      discount_percent: 0,
      discount_amount: 0,
    };
  });
};

/**
 * Calculer les totaux d'une vente
 * @param {Array} items - Items du panier
 * @returns {Object} { totalHT, totalTTC, vatDetails }
 */
export const calculateSaleTotals = (items) => {
  let totalHT = 0;
  let totalTTC = 0;
  const vatByRate = {};

  items.forEach((item) => {
    const itemTotalHT = parseFloat(item.total_ht);
    const itemTotalTTC = parseFloat(item.total_ttc);
    const vatRate = parseFloat(item.vat_rate).toFixed(1);

    totalHT += itemTotalHT;
    totalTTC += itemTotalTTC;

    if (!vatByRate[vatRate]) {
      vatByRate[vatRate] = {
        base_ht: 0,
        amount_vat: 0,
        total_ttc: 0,
      };
    }

    vatByRate[vatRate].base_ht += itemTotalHT;
    vatByRate[vatRate].amount_vat += itemTotalTTC - itemTotalHT;
    vatByRate[vatRate].total_ttc += itemTotalTTC;
  });

  // Arrondir les valeurs
  Object.keys(vatByRate).forEach((rate) => {
    vatByRate[rate].base_ht = parseFloat(vatByRate[rate].base_ht.toFixed(2));
    vatByRate[rate].amount_vat = parseFloat(vatByRate[rate].amount_vat.toFixed(2));
    vatByRate[rate].total_ttc = parseFloat(vatByRate[rate].total_ttc.toFixed(2));
  });

  return {
    totalHT: parseFloat(totalHT.toFixed(2)),
    totalTTC: parseFloat(totalTTC.toFixed(2)),
    vatDetails: vatByRate,
  };
};

/**
 * Calculer la monnaie à rendre
 * @param {number} totalTTC - Total à payer
 * @param {number} amountPaid - Montant payé
 * @returns {number} Monnaie à rendre
 */
export const calculateChange = (totalTTC, amountPaid) => {
  return parseFloat((amountPaid - totalTTC).toFixed(2));
};
