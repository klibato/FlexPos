import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CashRegisterProvider } from './context/CashRegisterContext';
import LoginPage from './pages/LoginPage';
import POSPage from './pages/POSPage';
import SalesHistoryPage from './pages/SalesHistoryPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';

function App() {
  return (
    <AuthProvider>
      <CashRegisterProvider>
        <CartProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<POSPage />} />
              <Route path="/sales" element={<SalesHistoryPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/products" element={<ProductsPage />} />
            </Routes>
          </Router>
        </CartProvider>
      </CashRegisterProvider>
    </AuthProvider>
  );
}

export default App;
