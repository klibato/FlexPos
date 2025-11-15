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
import Button from '../components/ui/Button';
import { CheckCircle, CreditCard, DollarSign, Percent, Tag, X } from 'lucide-react';
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

  const { activeCashRegister, loading: cashRegisterLoading, hasActiveCashRegister } = useCashRegister();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isOpenCashRegisterModalOpen, setIsOpenCashRegisterModalOpen] = useState(false);
  const [isCloseCashRegisterModalOpen, setIsCloseCashRegisterModalOpen] = useState(false);
  const [isSwitchCashierModalOpen, setIsSwitchCashierModalOpen] = useState(false);
  const [isSwitchingCashier, setIsSwitchingCashier] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');

  useEffect(() => {
    if (!isAuthenticated && !isSwitchingCashier) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate, isSwitchingCashier]);

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
      {/* Header avec menu burger */}
      <Header
        onOpenCloseCashModal={() => setIsCloseCashRegisterModalOpen(true)}
        onOpenSwitchCashierModal={() => setIsSwitchCashierModalOpen(true)}
      />

      {/* Notification de succès */}
      {successMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {successMessage}
          </div>
        </div>
      )}

      {/* Boutons caisse (visibles) */}
      <div className="bg-white border-b border-gray-200 py-2 px-4">
        <div className="flex gap-2 justify-center">
          {activeCashRegister ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsCloseCashRegisterModalOpen(true)}
                className="flex items-center gap-2"
              >
                <DollarSign size={18} />
                Fermer la caisse
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsSwitchCashierModalOpen(true)}
                className="flex items-center gap-2"
              >
                <CheckCircle size={18} />
                Changer caissier
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsOpenCashRegisterModalOpen(true)}
              className="flex items-center gap-2"
            >
              <DollarSign size={18} />
              Ouvrir une caisse
            </Button>
          )}
        </div>
      </div>

      {/* Layout principal */}
      <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Produits */}
        <div className="lg:col-span-2">
          {/* Catégories */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <CategoryTabs
              selectedCategory={selectedCategory}
              onSelectCategory={changeCategory}
            />
          </div>

          {/* Grille produits */}
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

        {/* Colonne droite - Panier */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
            {/* Header panier */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Panier</h2>
              <div className="text-sm text-gray-600">
                {getItemCount()} article{getItemCount() > 1 ? 's' : ''}
              </div>
            </div>

            {/* Liste articles */}
            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Votre panier est vide
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-3">
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => decrementQuantity(item.id)}
                        className="w-8 h-8 bg-white border border-gray-300 rounded hover:bg-gray-50 font-bold"
                      >
                        −
                      </button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => incrementQuantity(item.id)}
                        className="w-8 h-8 bg-white border border-gray-300 rounded hover:bg-gray-50 font-bold"
                      >
                        +
                      </button>
                      <div className="flex-1 text-right font-bold text-gray-800">
                        {formatPrice(item.total_ttc)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Remise */}
            {cart.length > 0 && (
              <div className="mb-4">
                {!showDiscountInput ? (
                  <button
                    onClick={() => setShowDiscountInput(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    {discount ? <Tag className="w-4 h-4" /> : <Percent className="w-4 h-4" />}
                    {discount ? (
                      <span>Remise: {discount.type === 'percentage' ? `${discount.value}%` : `${discount.value}€`}</span>
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
                    className="text-sm text-red-600 hover:text-red-700 mt-2"
                  >
                    Retirer la remise
                  </button>
                )}
              </div>
            )}

            {/* Totaux */}
            {cart.length > 0 && (
              <>
                <div className="border-t border-gray-200 pt-4 mb-4 space-y-2">
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

                {/* Boutons actions */}
                <div className="space-y-2">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handlePay}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    <CreditCard size={20} />
                    Procéder au paiement
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={clearCart}
                    className="w-full"
                  >
                    Vider le panier
                  </Button>
                </div>
              </>
            )}
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
