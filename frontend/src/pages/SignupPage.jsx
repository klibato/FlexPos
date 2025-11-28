import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  ShoppingCart,
  Users,
  Printer,
  CheckCircle,
  AlertCircle,
  Loader,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import api from '../services/api';

function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    // Step 1: Establishment
    organizationName: '',
    email: '',
    phone: '',
    // Step 2: Products
    products: [{ name: '', price: '' }],
    // Step 3: User
    username: '',
    firstName: '',
    lastName: '',
    pinCode: '',
    pinCodeConfirm: '',
    // Step 4: Printer
    printerEnabled: false,
    printerType: 'usb',
    printerIP: '',
    printerPort: '9100',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    setError('');
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...formData.products];
    newProducts[index][field] = value;
    setFormData({ ...formData, products: newProducts });
  };

  const addProduct = () => {
    setFormData({
      ...formData,
      products: [...formData.products, { name: '', price: '' }],
    });
  };

  const removeProduct = (index) => {
    const newProducts = formData.products.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      products: newProducts.length > 0 ? newProducts : [{ name: '', price: '' }],
    });
  };

  const validateStep = (currentStep) => {
    switch (currentStep) {
      case 1:
        if (!formData.organizationName.trim()) {
          setError('Le nom de l\'établissement est requis');
          return false;
        }
        if (!formData.email.trim() || !formData.email.includes('@')) {
          setError('Un email valide est requis');
          return false;
        }
        return true;
      case 2:
        const hasValidProducts = formData.products.some(
          (p) => p.name.trim() && p.price
        );
        if (!hasValidProducts) {
          setError('Ajoutez au moins un produit');
          return false;
        }
        return true;
      case 3:
        if (!formData.username.trim()) {
          setError('Le nom d\'utilisateur est requis');
          return false;
        }
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
          setError('Prénom et nom sont requis');
          return false;
        }
        if (!formData.pinCode || formData.pinCode.length !== 4) {
          setError('Le code PIN doit contenir 4 chiffres');
          return false;
        }
        if (formData.pinCode !== formData.pinCodeConfirm) {
          setError('Les codes PIN ne correspondent pas');
          return false;
        }
        return true;
      case 4:
        if (formData.printerEnabled) {
          if (formData.printerType === 'network' && !formData.printerIP) {
            setError('L\'adresse IP de l\'imprimante est requise');
            return false;
          }
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      setError('');
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setLoading(true);
    setError('');

    try {
      // Step 1: Create organization
      const orgResponse = await api.post('/api/public/auth/signup', {
        organizationName: formData.organizationName,
        email: formData.email,
        phone: formData.phone,
      });

      if (!orgResponse.data.success) {
        throw new Error(orgResponse.data.error?.message || 'Signup failed');
      }

      const organizationId = orgResponse.data.data.organization_id;

      // Login to get authenticated session
      const loginResponse = await api.post('/api/auth/login', {
        username: formData.username,
        pin_code: formData.pinCode,
      });

      if (!loginResponse.data.success) {
        throw new Error('Login failed after signup');
      }

      // Step 2: Add products
      const validProducts = formData.products.filter(
        (p) => p.name.trim() && p.price
      );
      for (const product of validProducts) {
        await api.post('/api/products', {
          name: product.name,
          price_ht: parseFloat(product.price),
          category: 'General',
          is_active: true,
        });
      }

      // Step 3: Configure printer if enabled
      if (formData.printerEnabled) {
        await api.post('/api/settings', {
          printer_config: {
            enabled: true,
            type: formData.printerType,
            interface: formData.printerType === 'usb' ? 'usb' : 'ethernet',
            ip: formData.printerIP || null,
            port: formData.printerPort ? parseInt(formData.printerPort) : 9100,
            auto_print: true,
          },
        });
      }

      // Redirect to POS
      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
        err.message ||
        'Une erreur est survenue. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FlexPOS
            </span>
            <span className="text-gray-500 ml-auto">
              Étape {step} / 4
            </span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    s <= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      s < step ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-sm">
            <span className="text-gray-600">Établissement</span>
            <span className="text-gray-600">Produits</span>
            <span className="text-gray-600">Utilisateur</span>
            <span className="text-gray-600">Imprimante</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Step 1: Establishment */}
          {step === 1 && (
            <div>
              <div className="flex items-center gap-3 mb-8">
                <Building2 className="w-8 h-8 text-blue-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Configuration de votre établissement
                  </h2>
                  <p className="text-gray-600">
                    Commençons par les informations de base
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de votre établissement *
                  </label>
                  <input
                    type="text"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleChange}
                    placeholder="Restaurant Le Gourmet"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email professionnel *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contact@restaurant.fr"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Nous l'utiliserons pour la facturation
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone (optionnel)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+33 6 12 34 56 78"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Products */}
          {step === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-8">
                <ShoppingCart className="w-8 h-8 text-blue-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Vos produits
                  </h2>
                  <p className="text-gray-600">
                    Ajoutez vos premiers produits/services
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {formData.products.map((product, index) => (
                  <div key={index} className="flex gap-4">
                    <input
                      type="text"
                      placeholder="Nom du produit"
                      value={product.name}
                      onChange={(e) =>
                        handleProductChange(index, 'name', e.target.value)
                      }
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Prix HT"
                      value={product.price}
                      onChange={(e) =>
                        handleProductChange(index, 'price', e.target.value)
                      }
                      step="0.01"
                      min="0"
                      className="w-32 px-4 py-3 border border-gray-300 rounded-lg"
                    />
                    {formData.products.length > 1 && (
                      <button
                        onClick={() => removeProduct(index)}
                        className="px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                <button
                  onClick={addProduct}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-500 hover:text-blue-600 transition"
                >
                  + Ajouter un produit
                </button>

                <p className="text-sm text-gray-500">
                  Vous pourrez en ajouter d'autres plus tard dans l'interface
                </p>
              </div>
            </div>
          )}

          {/* Step 3: User */}
          {step === 3 && (
            <div>
              <div className="flex items-center gap-3 mb-8">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Votre compte
                  </h2>
                  <p className="text-gray-600">
                    Créez votre compte de caissier administrateur
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom d'utilisateur *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="jean_dupont"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Jean"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Dupont"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code PIN à 4 chiffres *
                  </label>
                  <input
                    type="password"
                    name="pinCode"
                    value={formData.pinCode}
                    onChange={handleChange}
                    placeholder="••••"
                    maxLength="4"
                    pattern="[0-9]{4}"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Sera utilisé pour vous connecter à la caisse
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le code PIN *
                  </label>
                  <input
                    type="password"
                    name="pinCodeConfirm"
                    value={formData.pinCodeConfirm}
                    onChange={handleChange}
                    placeholder="••••"
                    maxLength="4"
                    pattern="[0-9]{4}"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Printer */}
          {step === 4 && (
            <div>
              <div className="flex items-center gap-3 mb-8">
                <Printer className="w-8 h-8 text-blue-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Configuration de l'imprimante
                  </h2>
                  <p className="text-gray-600">
                    Optionnel - Configurez votre imprimante thermique
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    name="printerEnabled"
                    checked={formData.printerEnabled}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600"
                  />
                  <label className="text-gray-900 font-medium">
                    J'ai une imprimante thermique
                  </label>
                </div>

                {formData.printerEnabled && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type d'imprimante *
                      </label>
                      <select
                        name="printerType"
                        value={formData.printerType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      >
                        <option value="usb">USB</option>
                        <option value="network">Réseau (Ethernet)</option>
                      </select>
                    </div>

                    {formData.printerType === 'network' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Adresse IP de l'imprimante *
                          </label>
                          <input
                            type="text"
                            name="printerIP"
                            value={formData.printerIP}
                            onChange={handleChange}
                            placeholder="192.168.1.100"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Port
                          </label>
                          <input
                            type="number"
                            name="printerPort"
                            value={formData.printerPort}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </>
                    )}
                  </>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    💡 Vous pourrez configurer l'imprimante plus tard dans les paramètres
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <button
                onClick={handlePrevious}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                Précédent
              </button>
            )}

            <button
              onClick={step === 4 ? handleSubmit : handleNext}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-semibold"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  {step === 4 ? 'Terminer' : 'Suivant'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
