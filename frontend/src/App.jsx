import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CashRegisterProvider } from './context/CashRegisterContext';
import LoginPage from './pages/LoginPage';
import POSPage from './pages/POSPage';

function App() {
  return (
    <AuthProvider>
      <CashRegisterProvider>
        <CartProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<POSPage />} />
            </Routes>
          </Router>
        </CartProvider>
      </CashRegisterProvider>
    </AuthProvider>
  );
}

export default App;
