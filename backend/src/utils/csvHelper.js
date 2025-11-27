/**
 * Utilitaires pour génération CSV
 * Centralise la logique d'export CSV utilisée dans les contrôleurs
 */

const logger = require('./logger');
const { formatDate } = require('./helpers');

/**
 * Échappe une valeur pour CSV (gère les guillemets et virgules)
 * @param {any} value - Valeur à échapper
 * @returns {string} - Valeur échappée pour CSV
 */
const escapeCsvValue = (value) => {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // Si la valeur contient des guillemets, virgules ou retours à la ligne
  if (stringValue.includes('"') || stringValue.includes(';') || stringValue.includes('\n')) {
    // Échapper les guillemets en les doublant et encadrer avec des guillemets
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

/**
 * Génère un fichier CSV et l'envoie comme réponse HTTP
 * @param {Object} options - Options de génération
 * @param {Object} options.res - Objet response Express
 * @param {Array<Object>} options.data - Données à exporter
 * @param {Array<string>} options.columns - Noms des colonnes (header)
 * @param {Function} options.rowMapper - Fonction pour mapper chaque ligne (data => [val1, val2, ...])
 * @param {string} options.filename - Nom du fichier (sans .csv)
 * @param {Object} [options.logger] - Logger pour tracking
 * @param {Object} [options.user] - Utilisateur qui exporte (pour logging)
 * @param {number} [options.totalCount] - Nombre total de lignes (si limité)
 * @param {number} [options.maxLimit] - Limite maximum de lignes exportées
 */
const sendCsvResponse = ({
  res,
  data,
  columns,
  rowMapper,
  filename,
  logger: loggerInstance = logger,
  user,
  totalCount,
  maxLimit,
}) => {
  try {
    // Vérifier paramètres requis
    if (!res || !data || !columns || !rowMapper || !filename) {
      throw new Error('Paramètres manquants pour sendCsvResponse');
    }

    // Formater les lignes CSV
    const csvRows = [];

    // Header
    csvRows.push(columns.map(escapeCsvValue).join(';'));

    // Lignes de données
    data.forEach((item) => {
      const row = rowMapper(item);
      csvRows.push(row.map(escapeCsvValue).join(';'));
    });

    const csvContent = csvRows.join('\n');

    // Générer le nom de fichier avec la date
    const today = new Date().toISOString().split('T')[0];
    const fullFilename = `${filename}_${today}.csv`;

    // Headers pour le téléchargement CSV
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fullFilename}"`);

    // Ajouter le BOM UTF-8 pour Excel
    res.write('\ufeff');
    res.end(csvContent);

    // Logging
    const limitReached = totalCount && maxLimit && totalCount > maxLimit;
    const username = user?.username || 'Système';

    loggerInstance.info(
      `Export CSV ${filename} généré par ${username}: ${data.length} lignes${
        limitReached ? ` (LIMITE ATTEINTE: ${totalCount} lignes au total)` : ''
      }`,
    );

    // Log warning si limite atteinte
    if (limitReached) {
      loggerInstance.warn(
        `Export CSV ${filename} limité à ${maxLimit} lignes (${totalCount} lignes au total). Utilisez des filtres pour exporter le reste.`,
      );
    }
  } catch (error) {
    loggerInstance.error(`Erreur lors de la génération du CSV ${filename}:`, error);
    throw error;
  }
};

/**
 * Formater un montant pour CSV (2 décimales)
 * @param {number|string} amount - Montant
 * @returns {string} - Montant formaté "12.50"
 */
const formatAmountForCsv = (amount) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return '0.00';
  }

  return numAmount.toFixed(2);
};

/**
 * Formater un boolean pour CSV (Oui/Non)
 * @param {boolean} value - Valeur boolean
 * @returns {string} - "Oui" ou "Non"
 */
const formatBooleanForCsv = (value) => {
  return value ? 'Oui' : 'Non';
};

module.exports = {
  escapeCsvValue,
  sendCsvResponse,
  formatDate, // Ré-export du helper existant depuis helpers.js
  formatAmountForCsv,
  formatBooleanForCsv,
};
