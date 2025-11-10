import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { formatPrice } from '../../utils/constants';
import { calculateChange } from '../../utils/saleHelper';

/**
 * Composant de paiement en espèces
 * Calcul automatique de la monnaie à rendre
 */
const CashPayment = ({ totalTTC, onConfirm, onCancel }) => {
  const [amountPaid, setAmountPaid] = useState('');
  const [change, setChange] = useState(0);

  // Montants rapides suggérés
  const suggestedAmounts = [
    Math.ceil(totalTTC),
    Math.ceil(totalTTC / 5) * 5,
    Math.ceil(totalTTC / 10) * 10,
    Math.ceil(totalTTC / 20) * 20,
    Math.ceil(totalTTC / 50) * 50,
  ].filter((value, index, self) => self.indexOf(value) === index && value >= totalTTC);

  // Calculer la monnaie à rendre
  useEffect(() => {
    const paid = parseFloat(amountPaid) || 0;
    if (paid >= totalTTC) {
      setChange(calculateChange(totalTTC, paid));
    } else {
      setChange(0);
    }
  }, [amountPaid, totalTTC]);

  const handleAmountClick = (amount) => {
    setAmountPaid(amount.toString());
  };

  const handleConfirm = () => {
    const paid = parseFloat(amountPaid) || 0;
    if (paid < totalTTC) {
      alert('Le montant payé est insuffisant');
      return;
    }
    onConfirm({
      payment_method: 'cash',
      amount_paid: paid,
    });
  };

  const isValid = parseFloat(amountPaid) >= totalTTC;

  return (
    <div className="space-y-6">
      {/* Total à payer */}
      <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-6 text-center">
        <p className="text-sm text-gray-600 mb-2">Total à payer</p>
        <p className="text-4xl font-bold text-primary-600">
          {formatPrice(totalTTC)}
        </p>
      </div>

      {/* Montant payé */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Montant reçu
        </label>
        <input
          type="number"
          step="0.01"
          value={amountPaid}
          onChange={(e) => setAmountPaid(e.target.value)}
          className="input text-2xl text-center font-bold"
          placeholder="0.00"
          autoFocus
        />
      </div>

      {/* Montants rapides */}
      {suggestedAmounts.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Montants rapides</p>
          <div className="grid grid-cols-3 gap-2">
            {suggestedAmounts.slice(0, 6).map((amount) => (
              <button
                key={amount}
                onClick={() => handleAmountClick(amount)}
                className="btn btn-secondary text-lg py-4"
              >
                {formatPrice(amount)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Monnaie à rendre */}
      {change > 0 && (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
          <p className="text-sm text-gray-600 mb-2">Monnaie à rendre</p>
          <p className="text-4xl font-bold text-green-600">
            {formatPrice(change)}
          </p>
        </div>
      )}

      {/* Erreur si montant insuffisant */}
      {amountPaid && !isValid && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
          Montant insuffisant (manque {formatPrice(totalTTC - parseFloat(amountPaid))})
        </div>
      )}

      {/* Boutons */}
      <div className="flex gap-4">
        <Button
          variant="secondary"
          size="lg"
          onClick={onCancel}
          className="flex-1"
        >
          Annuler
        </Button>
        <Button
          variant="success"
          size="lg"
          onClick={handleConfirm}
          disabled={!isValid}
          className="flex-1"
        >
          Valider le paiement
        </Button>
      </div>
    </div>
  );
};

export default CashPayment;
