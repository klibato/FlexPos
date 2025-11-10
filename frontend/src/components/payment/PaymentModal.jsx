import React, { useState } from 'react';
import Modal from '../ui/Modal';
import CashPayment from './CashPayment';
import { prepareSaleItems } from '../../utils/saleHelper';
import { createSale } from '../../services/saleService';

/**
 * Modal de paiement
 * Gère le processus complet de paiement
 */
const PaymentModal = ({ isOpen, onClose, cart, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculer le total
  const totalTTC = cart.reduce(
    (sum, item) => sum + parseFloat(item.price_ttc) * item.quantity,
    0
  );

  const handlePayment = async (paymentData) => {
    setLoading(true);
    setError(null);

    try {
      // Préparer les items pour l'API
      const items = prepareSaleItems(cart);

      // Créer la vente
      const saleData = {
        items,
        payment_method: paymentData.payment_method,
        amount_paid: paymentData.amount_paid,
        payment_details: paymentData.payment_details || null,
      };

      const response = await createSale(saleData);

      // Succès
      if (response.success) {
        onSuccess(response.data);
        onClose();
      }
    } catch (err) {
      setError(
        err.response?.data?.error?.message || 'Erreur lors du paiement'
      );
      console.error('Erreur paiement:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="💳 Encaissement"
      size="md"
    >
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Traitement du paiement...</p>
        </div>
      ) : (
        <CashPayment
          totalTTC={totalTTC}
          onConfirm={handlePayment}
          onCancel={onClose}
        />
      )}
    </Modal>
  );
};

export default PaymentModal;
