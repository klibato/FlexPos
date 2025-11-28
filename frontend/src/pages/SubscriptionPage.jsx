import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Loader,
} from 'lucide-react';
import api from '../services/api';

function SubscriptionPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('current');

  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [cancelling, setCancelling] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'admin') {
      navigate('/pos');
      return;
    }

    fetchSubscriptionData();
  }, [isAuthenticated, user, navigate]);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      setError('');

      const [subResponse, plansResponse, invoicesResponse] = await Promise.all([
        api.get('/api/subscriptions/current'),
        api.get('/api/subscriptions/plans'),
        api.get('/api/subscriptions/invoices?limit=10'),
      ]);

      setCurrentSubscription(subResponse.data.data);
      setAvailablePlans(plansResponse.data.data.plans);
      setInvoices(invoicesResponse.data.data.invoices);
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
        'Erreur lors du chargement de l\'abonnement'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId) => {
    try {
      setUpgrading(true);
      setError('');

      // Créer une session Stripe Checkout
      const response = await api.post('/api/subscriptions/create-checkout', {
        planId,
      });

      // Rediriger vers Stripe Checkout
      if (response.data.data.url) {
        window.location.href = response.data.data.url;
      }
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
        'Erreur lors de la création de la session de paiement'
      );
    } finally {
      setUpgrading(false);
    }
  };

  const handleCancel = async () => {
    if (
      !window.confirm(
        'Êtes-vous sûr de vouloir annuler votre abonnement ? Vous perdrez accès aux fonctionnalités premium.'
      )
    ) {
      return;
    }

    try {
      setCancelling(true);
      setError('');

      await api.post('/api/subscriptions/cancel', { immediate: false });
      setSuccess(
        'Abonnement annulé. Vous aurez accès jusqu\'à la fin de votre période.'
      );
      setTimeout(() => fetchSubscriptionData(), 1000);
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
        'Erreur lors de l\'annulation'
      );
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId) => {
    try {
      const response = await api.get(`/api/invoices/${invoiceId}/download`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Erreur lors du téléchargement de la facture');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Chargement de votre abonnement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-blue-600" />
            Abonnement et facturation
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Erreur</h3>
              <p className="text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-600 hover:text-red-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900">Succès</h3>
              <p className="text-green-700">{success}</p>
            </div>
            <button
              onClick={() => setSuccess('')}
              className="ml-auto text-green-600 hover:text-green-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('current')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'current'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Abonnement actuel
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'plans'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Changer de plan
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'invoices'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Factures
            </button>
          </div>
        </div>

        {/* Current Subscription Tab */}
        {activeTab === 'current' && currentSubscription && (
          <div className="space-y-6">
            {/* Current Plan Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Plan actuel
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600 text-sm mb-2">Plan</p>
                  <p className="text-3xl font-bold text-gray-900 capitalize">
                    {currentSubscription.plan}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm mb-2">Statut</p>
                  <div className="flex items-center gap-2">
                    {currentSubscription.status === 'active' && (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-lg font-semibold text-green-600">
                          Actif
                        </span>
                      </>
                    )}
                    {currentSubscription.status === 'trialing' && (
                      <>
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span className="text-lg font-semibold text-blue-600">
                          Trial
                        </span>
                      </>
                    )}
                    {currentSubscription.status === 'cancelled' && (
                      <>
                        <X className="w-5 h-5 text-red-600" />
                        <span className="text-lg font-semibold text-red-600">
                          Annulé
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {currentSubscription.price && (
                  <div>
                    <p className="text-gray-600 text-sm mb-2">Prix mensuel</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {currentSubscription.price}
                    </p>
                  </div>
                )}

                {currentSubscription.days_remaining !== undefined && (
                  <div>
                    <p className="text-gray-600 text-sm mb-2">Jours restants</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {currentSubscription.days_remaining}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                {currentSubscription.plan !== 'enterprise' &&
                  currentSubscription.status === 'active' && (
                    <div className="space-y-3">
                      <button
                        onClick={() => handleUpgrade('premium')}
                        disabled={upgrading}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
                      >
                        {upgrading && (
                          <Loader className="w-4 h-4 animate-spin" />
                        )}
                        Changer de plan
                      </button>

                      <button
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50 font-semibold"
                      >
                        {cancelling ? 'Annulation...' : 'Annuler l\'abonnement'}
                      </button>
                    </div>
                  )}

                {currentSubscription.plan === 'free' && (
                  <button
                    onClick={() => handleUpgrade('starter')}
                    disabled={upgrading}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-semibold text-lg flex items-center justify-center gap-2"
                  >
                    {upgrading && <Loader className="w-5 h-5 animate-spin" />}
                    Souscrire un plan payant
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.values(availablePlans).map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-lg border-2 p-6 transition ${
                    currentSubscription?.plan === plan.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

                  <div className="mb-4">
                    <p className="text-3xl font-bold text-gray-900">
                      {plan.price === 0 ? 'Gratuit' : `${plan.price}€`}
                    </p>
                    {plan.price > 0 && (
                      <p className="text-gray-600 text-sm">/mois</p>
                    )}
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-gray-700"
                      >
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {currentSubscription?.plan === plan.id ? (
                    <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-center font-semibold">
                      Plan actuel
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={upgrading || plan.id === 'free'}
                      className={`w-full px-4 py-2 rounded-lg font-semibold transition ${
                        plan.id === 'free'
                          ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      Souscrire
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="space-y-6">
            {invoices.length > 0 ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Numéro
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Période
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Montant
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr
                        key={invoice.id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 text-sm font-mono text-gray-900">
                          {invoice.invoice_number}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(invoice.period_start).toLocaleDateString(
                            'fr-FR',
                            { month: 'short', year: 'numeric' }
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          {invoice.total} {invoice.currency}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {invoice.status === 'paid' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-semibold">
                              <CheckCircle className="w-3 h-3" />
                              Payée
                            </span>
                          )}
                          {invoice.status === 'open' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-semibold">
                              <Clock className="w-3 h-3" />
                              En attente
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDownloadInvoice(invoice.id)}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-900 transition"
                          >
                            <Download className="w-4 h-4" />
                            <span className="text-sm font-semibold">PDF</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600">Aucune facture pour le moment</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SubscriptionPage;
