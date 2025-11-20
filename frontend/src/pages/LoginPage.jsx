import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, pinCode);

    if (result.success) {
      navigate('/pos');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-blue-600">Flex</span>
            <span className="text-gray-800 dark:text-gray-100">POS</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">Solution de caisse moderne</p>
          <p className="text-gray-600 dark:text-gray-400">  {t('pos.title')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('auth.username')}
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
              placeholder="admin"
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="pinCode" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('auth.pin')}
            </label>
            <input
              id="pinCode"
              type="password"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              className="input"
              placeholder="••••"
              required
              maxLength="4"
              pattern="[0-9]{4}"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg w-full"
          >
            {loading ? t('auth.loggingIn') : t('auth.login')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>{t('auth.demoAccounts')}</p>
          <p>admin / 1234 {t('common.or')} john / 5678</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
