import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOrganizations } from '../utils/api';
import {
  Building2,
  Search,
  Filter,
  Loader,
  AlertCircle,
  Eye,
  CheckCircle,
  XCircle,
} from 'lucide-react';

function OrganizationsPage() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');

  useEffect(() => {
    loadOrganizations();
  }, [searchTerm, statusFilter, planFilter]);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getOrganizations({
        search: searchTerm,
        status: statusFilter,
        plan: planFilter,
        limit: 50,
      });

      if (response.success) {
        setOrganizations(response.data.organizations);
      } else {
        setError(response.error?.message || 'Erreur lors du chargement');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Actif', icon: CheckCircle },
      suspended: { bg: 'bg-red-100', text: 'text-red-800', label: 'Suspendu', icon: XCircle },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Annulé', icon: XCircle },
    };

    const badge = badges[status] || badges.active;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-4 h-4" />
        {badge.label}
      </span>
    );
  };

  const getPlanBadge = (plan) => {
    const plans = {
      free: { bg: 'bg-gray-100', text: 'text-gray-800' },
      starter: { bg: 'bg-blue-100', text: 'text-blue-800' },
      premium: { bg: 'bg-purple-100', text: 'text-purple-800' },
      enterprise: { bg: 'bg-orange-100', text: 'text-orange-800' },
    };

    const planStyle = plans[plan] || plans.free;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${planStyle.bg} ${planStyle.text}`}>
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </span>
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Building2 className="w-8 h-8" />
          Organisations
        </h1>
        <p className="text-gray-600 mt-2">Gérer toutes les organisations de la plateforme</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par nom, slug, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
            >
              <option value="">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="suspended">Suspendu</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>

          {/* Plan Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
            >
              <option value="">Tous les plans</option>
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Erreur</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Organizations Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organisation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Créée le
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {organizations.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      Aucune organisation trouvée
                    </td>
                  </tr>
                ) : (
                  organizations.map((org) => (
                    <tr key={org.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{org.name}</div>
                          <div className="text-sm text-gray-500">{org.slug}</div>
                          <div className="text-sm text-gray-500">{org.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPlanBadge(org.plan)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(org.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {org.stats?.users || 0} users
                        </div>
                        <div className="text-sm text-gray-500">
                          {org.stats?.products || 0} produits
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(org.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/organizations/${org.id}`}
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                          Voir
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrganizationsPage;
