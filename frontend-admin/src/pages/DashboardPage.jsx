import { useState, useEffect } from 'react';
import { getDashboard } from '../utils/api';
import { Building2, Users, TrendingUp, AlertCircle, Loader } from 'lucide-react';

function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await getDashboard();
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error?.message || 'Erreur lors du chargement');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Erreur</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Organisations totales',
      value: data?.organizations?.total || 0,
      icon: Building2,
      color: 'bg-blue-500',
      subtext: `${data?.organizations?.active || 0} actives`,
    },
    {
      name: 'Nouvelles ce mois',
      value: data?.organizations?.new_this_month || 0,
      icon: TrendingUp,
      color: 'bg-green-500',
      subtext: `${data?.organizations?.churned_this_month || 0} résiliées`,
    },
    {
      name: 'MRR (Mensuel)',
      value: `${(data?.revenue?.mrr || 0).toFixed(2)} €`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      subtext: `ARR: ${(data?.revenue?.arr || 0).toFixed(2)} €`,
    },
    {
      name: 'Revenus du mois',
      value: `${(data?.revenue?.monthly_revenue || 0).toFixed(2)} €`,
      icon: TrendingUp,
      color: 'bg-orange-500',
      subtext: data?.revenue?.currency || 'EUR',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Vue d'ensemble de la plateforme FlexPOS</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.name}</h3>
              <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.subtext}</p>
            </div>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Organisations</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Total</span>
              <span className="font-semibold text-gray-900">{data?.organizations?.total || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">Actives</span>
              <span className="font-semibold text-green-700">{data?.organizations?.active || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-gray-700">Nouvelles ce mois</span>
              <span className="font-semibold text-blue-700">{data?.organizations?.new_this_month || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-gray-700">Résiliées ce mois</span>
              <span className="font-semibold text-red-700">{data?.organizations?.churned_this_month || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Revenus</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-gray-700">MRR (Mensuel)</span>
              <span className="font-semibold text-purple-700">{(data?.revenue?.mrr || 0).toFixed(2)} €</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-gray-700">ARR (Annuel)</span>
              <span className="font-semibold text-purple-700">{(data?.revenue?.arr || 0).toFixed(2)} €</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <span className="text-gray-700">Revenus du mois</span>
              <span className="font-semibold text-orange-700">{(data?.revenue?.monthly_revenue || 0).toFixed(2)} €</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
