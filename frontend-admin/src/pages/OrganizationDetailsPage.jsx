import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getOrganizationById,
  suspendOrganization,
  activateOrganization,
} from '../utils/api';
import {
  Building2,
  Users,
  Package,
  ArrowLeft,
  Loader,
  AlertCircle,
  CheckCircle,
  XCircle,
  Ban,
  PlayCircle,
} from 'lucide-react';

function OrganizationDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadOrganization();
  }, [id]);

  const loadOrganization = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getOrganizationById(id);

      if (response.success) {
        setOrganization(response.data.organization);
      } else {
        setError(response.error?.message || 'Organisation introuvable');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!confirm('Êtes-vous sûr de vouloir suspendre cette organisation ?')) {
      return;
    }

    const reason = prompt('Raison de la suspension:');
    if (!reason) return;

    try {
      setActionLoading(true);
      const response = await suspendOrganization(id, reason);
      if (response.success) {
        alert('Organisation suspendue avec succès');
        loadOrganization();
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Erreur lors de la suspension');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!confirm('Êtes-vous sûr de vouloir activer cette organisation ?')) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await activateOrganization(id);
      if (response.success) {
        alert('Organisation activée avec succès');
        loadOrganization();
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Erreur lors de l\'activation');
    } finally {
      setActionLoading(false);
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
      <div>
        <button
          onClick={() => navigate('/organizations')}
          className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Erreur</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

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

  return (
    <div>
      <button
        onClick={() => navigate('/organizations')}
        className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux organisations
      </button>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{organization.name}</h1>
              <p className="text-gray-600 mt-1">{organization.slug}</p>
            </div>
          </div>
          <div>{getStatusBadge(organization.status)}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-6 flex gap-3">
        {organization.status === 'active' ? (
          <button
            onClick={handleSuspend}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
          >
            <Ban className="w-4 h-4" />
            Suspendre
          </button>
        ) : (
          <button
            onClick={handleActivate}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            <PlayCircle className="w-4 h-4" />
            Activer
          </button>
        )}
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold">Utilisateurs</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{organization.stats?.users || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Maximum: {organization.max_users}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold">Produits</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{organization.stats?.products || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Maximum: {organization.max_products}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-6 h-6 text-orange-600" />
            <h3 className="text-lg font-semibold">Plan</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 capitalize">{organization.plan}</p>
          <p className="text-sm text-gray-500 mt-1">
            {organization.trial_ends_at && new Date(organization.trial_ends_at) > new Date()
              ? `Essai jusqu'au ${new Date(organization.trial_ends_at).toLocaleDateString('fr-FR')}`
              : 'Plan actif'}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Informations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-gray-900 font-medium">{organization.email || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Téléphone</p>
            <p className="text-gray-900 font-medium">{organization.phone || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Créée le</p>
            <p className="text-gray-900 font-medium">
              {new Date(organization.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Dernière modification</p>
            <p className="text-gray-900 font-medium">
              {new Date(organization.updated_at).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      </div>

      {/* Users List */}
      {organization.users && organization.users.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Utilisateurs</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {organization.users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">
                          {user.first_name} {user.last_name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.is_active ? (
                        <span className="inline-flex items-center gap-1 text-sm text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-sm text-red-600">
                          <XCircle className="w-4 h-4" />
                          Inactif
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrganizationDetailsPage;
