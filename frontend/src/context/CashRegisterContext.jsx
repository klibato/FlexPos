import { createContext, useContext, useState, useEffect } from 'react';
import { getActiveCashRegister } from '../services/cashRegisterService';

const CashRegisterContext = createContext();

export const useCashRegister = () => {
  const context = useContext(CashRegisterContext);
  if (!context) {
    throw new Error('useCashRegister must be used within CashRegisterProvider');
  }
  return context;
};

export const CashRegisterProvider = ({ children }) => {
  const [activeCashRegister, setActiveCashRegister] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger la caisse active au montage
  const fetchActiveCashRegister = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getActiveCashRegister();
      setActiveCashRegister(response.data);
    } catch (err) {
      // Pas de caisse active n'est pas une erreur critique
      if (err.response?.status === 404) {
        setActiveCashRegister(null);
      } else {
        setError(err.response?.data?.error?.message || 'Erreur lors du chargement de la caisse');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveCashRegister();
  }, []);

  // Ouvrir une caisse (met à jour le state local)
  const openRegister = (cashRegister) => {
    setActiveCashRegister(cashRegister);
  };

  // Fermer la caisse active
  const closeRegister = () => {
    setActiveCashRegister(null);
  };

  // Vérifier si une caisse est ouverte
  const hasActiveCashRegister = () => {
    return activeCashRegister !== null;
  };

  // Rafraîchir les données de la caisse active
  const refreshCashRegister = async () => {
    await fetchActiveCashRegister();
  };

  const value = {
    activeCashRegister,
    loading,
    error,
    openRegister,
    closeRegister,
    hasActiveCashRegister,
    refreshCashRegister,
  };

  return (
    <CashRegisterContext.Provider value={value}>
      {children}
    </CashRegisterContext.Provider>
  );
};
