import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../hooks/useProducts';
import CategoryTabs from '../components/products/CategoryTabs';
import ProductGrid from '../components/products/ProductGrid';
import Button from '../components/ui/Button';
import { LogOut, RefreshCw } from 'lucide-react';
import { formatPrice } from '../utils/constants';

const POSPage = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const {
    products,
    loading,
    error,
    selectedCategory,
    changeCategory,
    refresh,
  } = useProducts();

  // État du panier (sera géré par CartContext dans Phase 1.4)
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProductClick = (product) => {
    console.log('Produit cliqué:', product);
    // Temporaire : ajouter au panier localement
    // Dans Phase 1.4, ce sera géré par CartContext
    setCart((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleUpdateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + parseFloat(item.price_ttc) * item.quantity,
    0
  );

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🍔 BensBurger POS</h1>
          <p className="text-sm text-gray-600">
            Caissier : {user.first_name} {user.last_name}
            {user.role === 'admin' && (
              <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                Admin
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="md"
            onClick={refresh}
            className="flex items-center gap-2"
          >
            <RefreshCw size={20} />
            Actualiser
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut size={20} />
            Déconnexion
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Zone produits */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Onglets catégories */}
            <CategoryTabs
              selectedCategory={selectedCategory}
              onCategoryChange={changeCategory}
            />

            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {/* Grille de produits */}
            <ProductGrid
              products={products}
              onProductClick={handleProductClick}
              loading={loading}
            />
          </div>
        </div>

        {/* Zone panier */}
        <div className="w-96 bg-white shadow-lg p-6 flex flex-col overflow-hidden">
          <h2 className="text-xl font-semibold mb-4 flex-shrink-0">Panier</h2>

          {/* Liste des items */}
          <div className="flex-1 overflow-y-auto mb-4">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <span className="text-6xl mb-4 block">🛒</span>
                <p>Panier vide</p>
                <p className="text-sm mt-2">
                  Cliquez sur un produit pour l'ajouter
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-800 flex-1">
                        {item.name}
                      </h3>
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Contrôles quantité */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 active:scale-95 font-bold"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          className="w-8 h-8 rounded-full bg-primary-500 text-white hover:bg-primary-600 active:scale-95 font-bold"
                        >
                          +
                        </button>
                      </div>

                      {/* Prix */}
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {formatPrice(item.price_ttc)} × {item.quantity}
                        </p>
                        <p className="font-bold text-primary-600">
                          {formatPrice(parseFloat(item.price_ttc) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total et bouton payer */}
          <div className="border-t pt-4 flex-shrink-0">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-medium">Total TTC :</span>
              <span className="text-3xl font-bold text-primary-500">
                {formatPrice(cartTotal)}
              </span>
            </div>

            <Button
              variant="success"
              size="xl"
              disabled={cart.length === 0}
              className="w-full"
              onClick={() => alert('Paiement - Phase 1.5')}
            >
              Payer ({cart.length} {cart.length > 1 ? 'articles' : 'article'})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSPage;
