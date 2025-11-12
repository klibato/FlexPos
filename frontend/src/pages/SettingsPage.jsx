import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSettings, updateSettings } from '../services/settingsService';
import Button from '../components/ui/Button';
import { ArrowLeft, Save, Store } from 'lucide-react';

const SettingsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    store_name: '',
    store_description: '',
    address_line1: '',
    address_line2: '',
    postal_code: '',
    city: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    legal_form: '',
    capital_amount: '',
    siret: '',
    vat_number: '',
    rcs: '',
    currency: 'EUR',
    currency_symbol: '€',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchSettings();
  }, [isAuthenticated, user, navigate]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await getSettings();
      setSettings(response.data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await updateSettings(settings);
      setSuccessMessage('Paramètres enregistrés avec succès !');
      setSettings(response.data);

      // Masquer le message après 3 secondes
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Erreur lors de l\'enregistrement des paramètres');
    } finally {
      setSaving(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Store size={28} />
              Paramètres du Commerce
            </h1>
            <p className="text-sm text-gray-600">
              Configuration des informations du commerce pour les tickets
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {successMessage}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des paramètres...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations générales */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Informations générales
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du commerce *
                  </label>
                  <input
                    type="text"
                    name="store_name"
                    value={settings.store_name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    name="store_description"
                    value={settings.store_description}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse ligne 1
                  </label>
                  <input
                    type="text"
                    name="address_line1"
                    value={settings.address_line1}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse ligne 2
                  </label>
                  <input
                    type="text"
                    name="address_line2"
                    value={settings.address_line2 || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code postal
                  </label>
                  <input
                    type="text"
                    name="postal_code"
                    value={settings.postal_code}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ville
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={settings.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pays
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={settings.country}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={settings.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={settings.email || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site web
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={settings.website || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Informations légales */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Informations légales
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Forme juridique
                  </label>
                  <select
                    name="legal_form"
                    value={settings.legal_form}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="SARL">SARL</option>
                    <option value="SAS">SAS</option>
                    <option value="EURL">EURL</option>
                    <option value="SA">SA</option>
                    <option value="EI">Entreprise Individuelle</option>
                    <option value="Auto-Entrepreneur">Auto-Entrepreneur</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capital social (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="capital_amount"
                    value={settings.capital_amount}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SIRET (14 chiffres)
                  </label>
                  <input
                    type="text"
                    name="siret"
                    value={settings.siret}
                    onChange={handleChange}
                    maxLength="14"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro TVA
                  </label>
                  <input
                    type="text"
                    name="vat_number"
                    value={settings.vat_number}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RCS (Registre du Commerce et des Sociétés)
                  </label>
                  <input
                    type="text"
                    name="rcs"
                    value={settings.rcs}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Save size={20} />
                {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
