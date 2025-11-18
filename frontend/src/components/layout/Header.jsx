import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCashRegister } from '../../context/CashRegisterContext';
import { useCart } from '../../context/CartContext';
import {
  Menu,
  X,
  BarChart3,
  Package,
  Users,
  Settings,
  FileText,
  Receipt,
  LogOut,
  DollarSign,
  UserCircle,
  ShoppingCart
} from 'lucide-react';
import { formatPrice } from '../../utils/constants';

const Header = ({ onOpenCloseCashModal, onOpenSwitchCashierModal }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { activeCashRegister } = useCashRegister();
  const { getTotal, getItemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navigateTo = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleAction = (action) => {
    action();
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Header fixe en haut */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo / Nom commerce */}
          <div className="flex items-center gap-3">
            <div className="text-2xl">💳</div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold">
                <span className="text-blue-600">Flex</span>
                <span className="text-gray-800">POS</span>
              </h1>
              {activeCashRegister && (
                <p className="text-xs text-gray-500">
                  {activeCashRegister.register_name}
                </p>
              )}
            </div>
          </div>

          {/* Panier - Centre */}
          <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            <div className="text-center">
              <div className="text-xs text-gray-600">Panier</div>
              <div className="font-bold text-blue-600">
                {formatPrice(getTotal())}
              </div>
              <div className="text-xs text-gray-500">{getItemCount()} articles</div>
            </div>
          </div>

          {/* Burger Menu - Droite */}
          <button
            onClick={toggleMenu}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Barre utilisateur mobile */}
        <div className="sm:hidden px-4 py-2 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm">
            <UserCircle className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-gray-800">
              {user?.first_name} {user?.last_name}
            </span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-600 capitalize">{user?.role}</span>
          </div>
        </div>
      </header>

      {/* Menu burger slide-in */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-full bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header du menu */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Menu</h2>
              <button
                onClick={toggleMenu}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <UserCircle className="w-8 h-8" />
              </div>
              <div>
                <div className="font-semibold">
                  {user?.first_name} {user?.last_name}
                </div>
                <div className="text-blue-100 text-sm capitalize">{user?.role}</div>
              </div>
            </div>
          </div>

          {/* Navigation principale */}
          <div className="flex-1 overflow-y-auto">
            <nav className="p-4">
              <div className="space-y-1">
                {/* Dashboard */}
                <button
                  onClick={() => navigateTo('/dashboard')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
                >
                  <BarChart3 className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-800">Dashboard</span>
                </button>

                {/* Historique ventes */}
                <button
                  onClick={() => navigateTo('/sales')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
                >
                  <Receipt className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-800">Historique ventes</span>
                </button>

                {/* Admin uniquement */}
                {user?.role === 'admin' && (
                  <>
                    <div className="pt-4 pb-2">
                      <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Administration
                      </div>
                    </div>

                    <button
                      onClick={() => navigateTo('/products')}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
                    >
                      <Package className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-800">Produits</span>
                    </button>

                    <button
                      onClick={() => navigateTo('/users')}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
                    >
                      <Users className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-800">Utilisateurs</span>
                    </button>

                    <button
                      onClick={() => navigateTo('/settings')}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
                    >
                      <Settings className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-800">Paramètres</span>
                    </button>

                    <button
                      onClick={() => navigateTo('/logs')}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
                    >
                      <FileText className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-800">Logs & Audit</span>
                    </button>
                  </>
                )}

                {/* Actions caisse */}
                {activeCashRegister && (
                  <>
                    <div className="pt-4 pb-2">
                      <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Caisse
                      </div>
                    </div>

                    <button
                      onClick={() => handleAction(onOpenCloseCashModal)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-orange-50 text-orange-700 transition-colors text-left"
                    >
                      <DollarSign className="w-5 h-5" />
                      <span className="font-medium">Fermer la caisse</span>
                    </button>

                    <button
                      onClick={() => handleAction(onOpenSwitchCashierModal)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 text-blue-700 transition-colors text-left"
                    >
                      <UserCircle className="w-5 h-5" />
                      <span className="font-medium">Changer de caissier</span>
                    </button>
                  </>
                )}
              </div>
            </nav>
          </div>

          {/* Déconnexion en bas */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay quand menu ouvert */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMenu}
        />
      )}

      {/* Spacer pour compenser le header fixe */}
      <div className="h-14 sm:h-16" />
    </>
  );
};

export default Header;
