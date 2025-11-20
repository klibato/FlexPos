import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, getMe } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger l'admin depuis le localStorage au démarrage
    const storedAdmin = localStorage.getItem('admin_user');
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    }

    // Vérifier la validité du token
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await getMe();
      if (response.success) {
        setAdmin(response.data.admin);
        localStorage.setItem('admin_user', JSON.stringify(response.data.admin));
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAdmin(null);
      localStorage.removeItem('admin_user');
      localStorage.removeItem('admin_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier, password) => {
    try {
      const response = await apiLogin(identifier, password);
      if (response.success) {
        setAdmin(response.data.admin);
        localStorage.setItem('admin_user', JSON.stringify(response.data.admin));
        localStorage.setItem('admin_token', response.data.token);
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || { message: 'Erreur de connexion' },
      };
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAdmin(null);
      localStorage.removeItem('admin_user');
      localStorage.removeItem('admin_token');
    }
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
