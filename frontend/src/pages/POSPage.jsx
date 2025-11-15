import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCashRegister } from '../context/CashRegisterContext';
import { useProducts } from '../hooks/useProducts';
import Header from '../components/layout/Header';
import CategoryTabs from '../components/products/CategoryTabs';
import ProductGrid from '../components/products/ProductGrid';
import PaymentModal from '../components/payment/PaymentModal';
import OpenCashRegisterModal from '../components/cashRegister/OpenCashRegisterModal';
import CloseCashRegisterModal from '../components/cashRegister/CloseCashRegisterModal';
import QuickSwitchCashierModal from '../components/auth/QuickSwitchCashierModal';
import { ShoppingCart, CreditCard, Percent, Tag, X, Trash2 } from 'lucide-react';
import { formatPrice } from '../utils/constants';

const POSPage = () => {
  const { user, switchCashier, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const {
    products,
    loading,
    error,
    selectedCategory,
    changeCategory,
    refresh,
  } = useProducts();

  // Cart Context
  const {
    cart,
    addToCart,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    getTotal,
    getItemCount,
    discount,
    applyDiscount,
    removeDiscount,
  } = useCart();

  // Cash Register Context
  const { activeCashRegister, loading: cashRegisterLoading, hasActiveCashRegister } = useCashRegister();

  // Modals state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isOpenCashRegisterModalOpen, setIsOpenCashRegisterModalOpen] = useState(false);
  const [isCloseCashRegisterModalOpen, setIsCloseCashRegisterModalOpen] = useState(false);
  const [isSwitchCashierModalOpen, setIsSwitchCashierModalOpen] = useState(false);
  const [isSwitchingCashier, setIsSwitchingCashier] = useState(false);

  // UI state
  const [successMessage, setSuccessMessage] = useState(null);
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');

  // Auth redirect
  useEffect(() => {
    if (!isAuthenticated && !isSwitchingCashier) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate, isSwitchingCashier]);

  // Auto-open cash register modal
  useEffect(() => {
    if (!cashRegisterLoading && !activeCashRegister) {
      setIsOpenCashRegisterModalOpen(true);
    } else if (activeCashRegister) {
      setIsOpenCashRegisterModalOpen(false);
    }
  }, [cashRegisterLoading, activeCashRegister]);

  const handleSwitchCashier = async (username, pin) => {
    setIsSwitchingCashier(true);
    try {
      const result = await switchCashier(username, pin);
      if (!result.success) {
        throw new Error(result.error);
      }
    } finally {
      setIsSwitchingCashier(false);
    }
  };

  const handleProductClick = (product) => {
    if (!hasActiveCashRegister()) {
      alert('Veuillez ouvrir une caisse avant d\'ajouter des produits');
      return;
    }

    if (!product.is_active) {
      alert('Ce produit n\'est pas disponible');
      return;
    }

    // Check stock for non-menu items
    if (!product.is_menu && product.quantity <= 0) {
      alert(`${product.name} est en rupture de stock`);
      return;
    }

    addToCart(product);
  };

  const handlePay = () => {
    if (cart.length === 0) {
      alert('Le panier est vide');
      return;
    }

    if (!hasActiveCashRegister()) {
      alert('Veuillez ouvrir une caisse avant de procéder au paiement');
      return;
    }

    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setSuccessMessage('Paiement enregistré avec succès !');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleApplyDiscount = () => {
    if (!discountValue || parseFloat(discountValue) <= 0) {
      alert('Veuillez entrer une valeur de remise valide');
      return;
    }

    applyDiscount({
      type: discountType,
      value: parseFloat(discountValue),
    });

    setShowDiscountInput(false);
    setDiscountValue('');
  };

  const calculateTotal = () => {
    let total = getTotal();
    if (discount) {
      if (discount.type === 'percentage') {
        total = total * (1 - discount.value / 100);
      } else if (discount.type === 'amount') {
        total = Math.max(0, total - discount.value);
      }
    }
    return total;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec burger menu */}
      <Header
        onOpenCloseCashModal={() => setIsCloseCashRegisterModalOpen(true)}
        onOpenSwitchCashierModal={() => setIsSwitchCashierModalOpen(true)}
      />

      {/* Notification de succès */}
      {successMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {successMessage}
        </div>
      )}

      {/* Layout responsive */}
      <div className="container mx-auto px-4 pb-24 lg:pb-6">
        {/* Desktop: 2 colonnes | Mobile: 1 colonne */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Colonne produits - 2/3 sur desktop */}
          <div className="lg:col-span-2">
            {/* Catégories */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <CategoryTabs
                selectedCategory={selectedCategory}
                onSelectCategory={changeCategory}
              />
            </div>

            {/* Grille de produits */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Chargement des produits...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            ) : (
              <ProductGrid products={products} onProductClick={handleProductClick} />
            )}
          </div>

          {/* Panier - 1/3 sur desktop, sticky sur mobile */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md sticky top-20 max-h-[calc(100vh-6rem)] flex flex-col">
              {/* Header panier */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Panier
                  </h2>
                  {cart.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Vider le panier"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  {getItemCount()} article{getItemCount() > 1 ? 's' : ''}
                </div>
              </div>

              {/* Liste articles - scrollable */}
              <div className="flex-1 overflow-y-auto p-4">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Votre panier est vide</p>
                    <p className="text-sm mt-1">Ajoutez des produits pour commencer</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-800">{item.product_name}</h3>
                            <p className="text-sm text-gray-600">
                              {formatPrice(item.unit_price_ttc)} × {item.quantity}
                            </p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Contrôles quantité */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => decrementQuantity(item.id)}
                            className="w-8 h-8 bg-white border border-gray-300 rounded hover:bg-gray-50 font-bold text-gray-700"
                          >
                            −
                          </button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => incrementQuantity(item.id)}
                            className="w-8 h-8 bg-white border border-gray-300 rounded hover:bg-gray-50 font-bold text-gray-700"
                          >
                            +
                          </button>
                          <div className="flex-1 text-right font-bold text-gray-800">
                            {formatPrice(item.total_ttc)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer panier - Totaux et paiement */}
              {cart.length > 0 && (
                <div className="border-t border-gray-200 p-4 space-y-3">
                  {/* Remise */}
                  {!showDiscountInput ? (
                    <button
                      onClick={() => setShowDiscountInput(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      {discount ? <Tag className="w-4 h-4" /> : <Percent className="w-4 h-4" />}
                      {discount ? (
                        <span>
                          Remise: {discount.type === 'percentage' ? `${discount.value}%` : `${discount.value}€`}
                        </span>
                      ) : (
                        <span>Appliquer une remise</span>
                      )}
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <select
                          value={discountType}
                          onChange={(e) => setDiscountType(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="percentage">%</option>
                          <option value="amount">€</option>
                        </select>
                        <input
                          type="number"
                          value={discountValue}
                          onChange={(e) => setDiscountValue(e.target.value)}
                          placeholder="Montant"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setShowDiscountInput(false);
                            setDiscountValue('');
                          }}
                          className="flex-1 px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={handleApplyDiscount}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Appliquer
                        </button>
                      </div>
                    </div>
                  )}

                  {discount && (
                    <button
                      onClick={removeDiscount}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Retirer la remise
                    </button>
                  )}

                  {/* Totaux */}
                  <div className="space-y-2 pt-2 border-t border-gray-200">
                    <div className="flex justify-between text-gray-700">
                      <span>Sous-total</span>
                      <span className="font-medium">{formatPrice(getTotal())}</span>
                    </div>
                    {discount && (
                      <div className="flex justify-between text-green-600">
                        <span>Remise</span>
                        <span className="font-medium">
                          -{formatPrice(getTotal() - calculateTotal())}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-300">
                      <span>Total TTC</span>
                      <span>{formatPrice(calculateTotal())}</span>
                    </div>
                  </div>

                  {/* Bouton paiement */}
                  <button
                    onClick={handlePay}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-lg font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-6 h-6" />
                    Procéder au paiement
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        cart={cart}
        discount={discount}
        onSuccess={handlePaymentSuccess}
      />

      <OpenCashRegisterModal
        isOpen={isOpenCashRegisterModalOpen}
        onClose={() => setIsOpenCashRegisterModalOpen(false)}
      />

      <CloseCashRegisterModal
        isOpen={isCloseCashRegisterModalOpen}
        onClose={() => setIsCloseCashRegisterModalOpen(false)}
      />

      <QuickSwitchCashierModal
        isOpen={isSwitchCashierModalOpen}
        onClose={() => setIsSwitchCashierModalOpen(false)}
        onSwitch={handleSwitchCashier}
      />
    </div>
  );
};

export default POSPage;
