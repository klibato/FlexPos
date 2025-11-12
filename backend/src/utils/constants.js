/**
 * Formater un nombre en prix (avec 2 décimales et symbole €)
 * @param {number} amount - Le montant à formater
 * @returns {string} Le prix formaté (ex: "12.50 €")
 */
const formatPrice = (amount) => {
  return `${parseFloat(amount).toFixed(2)} €`;
};

module.exports = {
  formatPrice,
};
