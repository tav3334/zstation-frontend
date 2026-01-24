import { useState, useEffect } from 'react';
import {
  Building2, ArrowLeft, Search, Plus, Edit2, Trash2, X,
  AlertCircle, Users, Monitor, Gamepad2, RefreshCw, UserPlus, UserMinus,
  TrendingUp, DollarSign, Activity, Calendar, MapPin, Phone,
  ChevronRight, Eye, Settings, BarChart3, Filter
} from 'lucide-react';
import api from '../services/api';
import Toast from '../components/Toast';

function SuperAdminOrganizations({ onBack }) {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive
  const [toast, setToast] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid, list

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [deletingOrg, setDeletingOrg] = useState(null);
  const [assigningOrg, setAssigningOrg] = useState(null);
  const [viewingOrg, setViewingOrg] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const orgsRes = await api.get('/super-admin/organizations');
      setOrganizations(orgsRes.data.organizations || []);
    } catch (error) {
      showToast('Erreur lors du chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleDelete = async () => {
    if (!deletingOrg) return;
    try {
      await api.delete(`/super-admin/organizations/${deletingOrg.id}`);
      showToast('Organisation supprimée avec succès');
      loadData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Erreur lors de la suppression', 'error');
    } finally {
      setShowDeleteModal(false);
      setDeletingOrg(null);
    }
  };

  // Filtrer les organisations
  const filteredOrgs = organizations.filter(org => {
    const matchesSearch = org.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.code?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && org.is_active) ||
      (statusFilter === 'inactive' && !org.is_active);
    return matchesSearch && matchesStatus;
  });

  // Calculer les statistiques globales
  const globalStats = {
    totalOrgs: organizations.length,
    activeOrgs: organizations.filter(o => o.is_active).length,
    totalUsers: organizations.reduce((sum, o) => sum + (o.users_count || 0), 0),
    totalMachines: organizations.reduce((sum, o) => sum + (o.machines_count || 0), 0),
    totalGames: organizations.reduce((sum, o) => sum + (o.games_count || 0), 0),
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button style={styles.backBtn} onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={styles.title}>Gestion des Organisations</h1>
            <p style={styles.subtitle}>
              Gérez vos différentes succursales et leurs ressources
            </p>
          </div>
        </div>
        <button style={styles.addBtn} onClick={() => { setEditingOrg(null); setShowModal(true); }}>
          <Plus size={18} />
          Nouvelle Organisation
        </button>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <StatCard
          icon={Building2}
          label="Organisations"
          value={globalStats.totalOrgs}
          subValue={`${globalStats.activeOrgs} actives`}
          color="#6366f1"
        />
        <StatCard
          icon={Users}
          label="Utilisateurs"
          value={globalStats.totalUsers}
          subValue="Total assignés"
          color="#10b981"
        />
        <StatCard
          icon={Monitor}
          label="Machines"
          value={globalStats.totalMachines}
          subValue="Toutes orgs"
          color="#f59e0b"
        />
        <StatCard
          icon={Gamepad2}
          label="Jeux"
          value={globalStats.totalGames}
          subValue="Configurés"
          color="#ec4899"
        />
      </div>

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.searchContainer}>
          <Search size={18} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Rechercher une organisation..."
            style={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={styles.filterGroup}>
          <Filter size={16} style={{ color: '#64748b' }} />
          <select
            style={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Toutes</option>
            <option value="active">Actives</option>
            <option value="inactive">Inactives</option>
          </select>
        </div>

        <div style={styles.viewToggle}>
          <button
            style={{ ...styles.viewBtn, ...(viewMode === 'grid' ? styles.viewBtnActive : {}) }}
            onClick={() => setViewMode('grid')}
          >
            <BarChart3 size={16} />
          </button>
          <button
            style={{ ...styles.viewBtn, ...(viewMode === 'list' ? styles.viewBtnActive : {}) }}
            onClick={() => setViewMode('list')}
          >
            <Activity size={16} />
          </button>
        </div>

        <button style={styles.refreshBtn} onClick={loadData} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
        </button>
      </div>

      {/* Organizations */}
      {loading ? (
        <div style={styles.loading}>
          <RefreshCw size={32} className="spin" style={{ color: '#6366f1' }} />
          <p>Chargement des organisations...</p>
        </div>
      ) : filteredOrgs.length === 0 ? (
        <div style={styles.emptyState}>
          <Building2 size={64} color="#64748b" />
          <h3 style={styles.emptyTitle}>Aucune organisation trouvée</h3>
          <p style={styles.emptyText}>
            {searchQuery || statusFilter !== 'all'
              ? 'Essayez de modifier vos filtres'
              : 'Créez votre première organisation pour commencer'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <button style={styles.emptyBtn} onClick={() => setShowModal(true)}>
              <Plus size={18} />
              Créer une organisation
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div style={styles.grid}>
          {filteredOrgs.map(org => (
            <OrganizationCard
              key={org.id}
              organization={org}
              onView={() => { setViewingOrg(org); setShowDetailModal(true); }}
              onEdit={() => { setEditingOrg(org); setShowModal(true); }}
              onDelete={() => { setDeletingOrg(org); setShowDeleteModal(true); }}
              onAssign={() => { setAssigningOrg(org); setShowAssignModal(true); }}
            />
          ))}
        </div>
      ) : (
        <div style={styles.listContainer}>
          {filteredOrgs.map(org => (
            <OrganizationListItem
              key={org.id}
              organization={org}
              onView={() => { setViewingOrg(org); setShowDetailModal(true); }}
              onEdit={() => { setEditingOrg(org); setShowModal(true); }}
              onDelete={() => { setDeletingOrg(org); setShowDeleteModal(true); }}
              onAssign={() => { setAssigningOrg(org); setShowAssignModal(true); }}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <OrganizationModal
          organization={editingOrg}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            loadData();
            showToast(editingOrg ? 'Organisation modifiée' : 'Organisation créée');
          }}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmModal
          organization={deletingOrg}
          onConfirm={handleDelete}
          onCancel={() => { setShowDeleteModal(false); setDeletingOrg(null); }}
        />
      )}

      {showAssignModal && (
        <AssignUsersModal
          organization={assigningOrg}
          onClose={() => { setShowAssignModal(false); setAssigningOrg(null); }}
          onSuccess={() => {
            loadData();
            showToast('Utilisateurs mis à jour');
          }}
        />
      )}

      {showDetailModal && (
        <OrganizationDetailModal
          organization={viewingOrg}
          onClose={() => { setShowDetailModal(false); setViewingOrg(null); }}
          onEdit={() => {
            setShowDetailModal(false);
            setEditingOrg(viewingOrg);
            setShowModal(true);
          }}
          onAssign={() => {
            setShowDetailModal(false);
            setAssigningOrg(viewingOrg);
            setShowAssignModal(true);
          }}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

// ========== STAT CARD ==========
function StatCard({ icon: Icon, label, value, subValue, color }) {
  return (
    <div style={styles.statCard}>
      <div style={{ ...styles.statIcon, background: `${color}20` }}>
        <Icon size={22} color={color} />
      </div>
      <div style={styles.statInfo}>
        <span style={styles.statValue}>{value}</span>
        <span style={styles.statLabel}>{label}</span>
        <span style={styles.statSub}>{subValue}</span>
      </div>
    </div>
  );
}

// ========== ORGANIZATION CARD ==========
function OrganizationCard({ organization, onView, onEdit, onDelete, onAssign }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        ...styles.card,
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 12px 24px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.15)',
        borderColor: hovered ? '#6366f1' : '#334155'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={styles.cardHeader}>
        <div style={styles.cardIcon}>
          <Building2 size={24} />
        </div>
        <div style={styles.cardStatus}>
          <span style={{
            ...styles.statusBadge,
            background: organization.is_active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            color: organization.is_active ? '#10b981' : '#ef4444'
          }}>
            {organization.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <h3 style={styles.cardTitle}>{organization.name}</h3>
      <p style={styles.cardCode}>
        <span style={styles.codeLabel}>Code:</span> {organization.code}
      </p>

      <div style={styles.cardStats}>
        <div style={styles.cardStat}>
          <Users size={14} color="#10b981" />
          <span>{organization.users_count || 0}</span>
          <span style={styles.statSmallLabel}>utilisateurs</span>
        </div>
        <div style={styles.cardStat}>
          <Monitor size={14} color="#f59e0b" />
          <span>{organization.machines_count || 0}</span>
          <span style={styles.statSmallLabel}>machines</span>
        </div>
        <div style={styles.cardStat}>
          <Gamepad2 size={14} color="#ec4899" />
          <span>{organization.games_count || 0}</span>
          <span style={styles.statSmallLabel}>jeux</span>
        </div>
      </div>

      {organization.created_at && (
        <div style={styles.cardDate}>
          <Calendar size={12} />
          <span>Créée le {new Date(organization.created_at).toLocaleDateString('fr-FR')}</span>
        </div>
      )}

      <div style={styles.cardActions}>
        <button style={styles.viewBtn2} onClick={onView} title="Voir détails">
          <Eye size={16} />
        </button>
        <button style={styles.assignBtn} onClick={onAssign} title="Gérer les utilisateurs">
          <UserPlus size={16} />
        </button>
        <button style={styles.editBtn} onClick={onEdit} title="Modifier">
          <Edit2 size={16} />
        </button>
        {organization.code !== 'DEFAULT' && (
          <button style={styles.deleteBtn} onClick={onDelete} title="Supprimer">
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

// ========== ORGANIZATION LIST ITEM ==========
function OrganizationListItem({ organization, onView, onEdit, onDelete, onAssign }) {
  return (
    <div style={styles.listItem}>
      <div style={styles.listIcon}>
        <Building2 size={20} />
      </div>

      <div style={styles.listInfo}>
        <div style={styles.listMain}>
          <h4 style={styles.listTitle}>{organization.name}</h4>
          <span style={{
            ...styles.statusBadgeSmall,
            background: organization.is_active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            color: organization.is_active ? '#10b981' : '#ef4444'
          }}>
            {organization.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <span style={styles.listCode}>Code: {organization.code}</span>
      </div>

      <div style={styles.listStats}>
        <div style={styles.listStat}>
          <Users size={14} />
          <span>{organization.users_count || 0}</span>
        </div>
        <div style={styles.listStat}>
          <Monitor size={14} />
          <span>{organization.machines_count || 0}</span>
        </div>
        <div style={styles.listStat}>
          <Gamepad2 size={14} />
          <span>{organization.games_count || 0}</span>
        </div>
      </div>

      <div style={styles.listActions}>
        <button style={styles.listBtn} onClick={onView}><Eye size={16} /></button>
        <button style={styles.listBtn} onClick={onAssign}><UserPlus size={16} /></button>
        <button style={styles.listBtn} onClick={onEdit}><Edit2 size={16} /></button>
        {organization.code !== 'DEFAULT' && (
          <button style={{ ...styles.listBtn, color: '#ef4444' }} onClick={onDelete}>
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <ChevronRight size={18} style={{ color: '#64748b' }} />
    </div>
  );
}

// ========== ORGANIZATION DETAIL MODAL ==========
function OrganizationDetailModal({ organization, onClose, onEdit, onAssign }) {
  if (!organization) return null;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={{ ...styles.modalContent, maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        <div style={styles.detailHeader}>
          <div style={styles.detailIcon}>
            <Building2 size={32} />
          </div>
          <div style={styles.detailHeaderInfo}>
            <h2 style={styles.detailTitle}>{organization.name}</h2>
            <span style={styles.detailCode}>Code: {organization.code}</span>
          </div>
          <span style={{
            ...styles.statusBadge,
            background: organization.is_active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            color: organization.is_active ? '#10b981' : '#ef4444'
          }}>
            {organization.is_active ? 'Active' : 'Inactive'}
          </span>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.detailBody}>
          {/* Stats Grid */}
          <div style={styles.detailStats}>
            <div style={styles.detailStat}>
              <Users size={24} color="#10b981" />
              <div style={styles.detailStatInfo}>
                <span style={styles.detailStatValue}>{organization.users_count || 0}</span>
                <span style={styles.detailStatLabel}>Utilisateurs</span>
              </div>
            </div>
            <div style={styles.detailStat}>
              <Monitor size={24} color="#f59e0b" />
              <div style={styles.detailStatInfo}>
                <span style={styles.detailStatValue}>{organization.machines_count || 0}</span>
                <span style={styles.detailStatLabel}>Machines</span>
              </div>
            </div>
            <div style={styles.detailStat}>
              <Gamepad2 size={24} color="#ec4899" />
              <div style={styles.detailStatInfo}>
                <span style={styles.detailStatValue}>{organization.games_count || 0}</span>
                <span style={styles.detailStatLabel}>Jeux</span>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div style={styles.detailSection}>
            <h4 style={styles.detailSectionTitle}>Informations</h4>
            <div style={styles.detailInfoGrid}>
              <div style={styles.detailInfoItem}>
                <Calendar size={16} color="#64748b" />
                <div>
                  <span style={styles.detailInfoLabel}>Date de création</span>
                  <span style={styles.detailInfoValue}>
                    {organization.created_at
                      ? new Date(organization.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })
                      : 'Non disponible'}
                  </span>
                </div>
              </div>
              {organization.address && (
                <div style={styles.detailInfoItem}>
                  <MapPin size={16} color="#64748b" />
                  <div>
                    <span style={styles.detailInfoLabel}>Adresse</span>
                    <span style={styles.detailInfoValue}>{organization.address}</span>
                  </div>
                </div>
              )}
              {organization.phone && (
                <div style={styles.detailInfoItem}>
                  <Phone size={16} color="#64748b" />
                  <div>
                    <span style={styles.detailInfoLabel}>Téléphone</span>
                    <span style={styles.detailInfoValue}>{organization.phone}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={styles.detailActions}>
          <button style={styles.detailActionBtn} onClick={onAssign}>
            <UserPlus size={18} />
            Gérer les utilisateurs
          </button>
          <button style={{ ...styles.detailActionBtn, background: '#3b82f6' }} onClick={onEdit}>
            <Settings size={18} />
            Modifier
          </button>
        </div>
      </div>
    </div>
  );
}

// ========== ORGANIZATION MODAL ==========
function OrganizationModal({ organization, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: organization?.name || '',
    code: organization?.code || '',
    is_active: organization?.is_active ?? true,
    address: organization?.address || '',
    phone: organization?.phone || '',
      });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      if (organization) {
        await api.put(`/super-admin/organizations/${organization.id}`, formData);
      } else {
        await api.post('/super-admin/organizations', formData);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div style={styles.modalHeaderIcon}>
            {organization ? <Edit2 size={20} /> : <Plus size={20} />}
          </div>
          <h3 style={styles.modalTitle}>
            {organization ? 'Modifier Organisation' : 'Nouvelle Organisation'}
          </h3>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Nom de l'organisation *</label>
              <input
                type="text"
                style={styles.input}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: ZStation Kenitra"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Code</label>
              <input
                type="text"
                style={styles.input}
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="Ex: KENITRA"
                disabled={organization?.code === 'DEFAULT'}
              />
              <small style={styles.hint}>Généré automatiquement si vide</small>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Adresse</label>
            <input
              type="text"
              style={styles.input}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Ex: 123 Rue Example, Kenitra"
            />
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Téléphone</label>
              <input
                type="tel"
                style={styles.input}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Ex: 0612345678"
              />
            </div>

          </div>

          <div style={styles.formGroup}>
            <label style={styles.toggleLabel}>
              <div style={styles.toggleInfo}>
                <span style={styles.toggleTitle}>Organisation active</span>
                <span style={styles.toggleDesc}>
                  Les organisations inactives ne peuvent pas être utilisées
                </span>
              </div>
              <div
                style={{
                  ...styles.toggle,
                  background: formData.is_active ? '#6366f1' : '#334155'
                }}
                onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
              >
                <div style={{
                  ...styles.toggleKnob,
                  transform: formData.is_active ? 'translateX(20px)' : 'translateX(0)'
                }} />
              </div>
            </label>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.modalActions}>
            <button type="button" style={styles.cancelBtn} onClick={onClose}>
              Annuler
            </button>
            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? 'Enregistrement...' : organization ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ========== ASSIGN USERS MODAL ==========
function AssignUsersModal({ organization, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await api.get('/super-admin/users');
      setUsers(response.data.users || response.data || []);
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const availableUsers = users.filter(u => u.role !== 'super_admin');
  const orgUsers = availableUsers.filter(u => u.organization_id === organization.id);
  const unassignedUsers = availableUsers.filter(u => !u.organization_id);

  // Filtrer par recherche
  const filteredOrgUsers = orgUsers.filter(u =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredUnassigned = unassignedUsers.filter(u =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssign = async (userId) => {
    try {
      setLoading(true);
      setError('');
      await api.post(`/super-admin/organizations/${organization.id}/assign-user`, { user_id: userId });
      await loadUsers();
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId) => {
    try {
      setLoading(true);
      setError('');
      await api.post(`/super-admin/organizations/${organization.id}/remove-user`, { user_id: userId });
      await loadUsers();
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={{ ...styles.modalContent, maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div style={{ ...styles.modalHeaderIcon, background: '#10b98120' }}>
            <Users size={20} color="#10b981" />
          </div>
          <div>
            <h3 style={styles.modalTitle}>Gestion des Utilisateurs</h3>
            <p style={styles.modalSubtitle}>{organization.name}</p>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div style={styles.assignSearch}>
          <Search size={16} style={{ color: '#64748b' }} />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            style={styles.assignSearchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={styles.assignContent}>
          {loadingUsers ? (
            <div style={styles.loadingSmall}>
              <RefreshCw size={24} className="spin" style={{ color: '#6366f1' }} />
              <p>Chargement des utilisateurs...</p>
            </div>
          ) : (
            <>
              {/* Utilisateurs assignés */}
              <div style={styles.userSection}>
                <h4 style={styles.sectionTitle}>
                  <div style={{ ...styles.sectionIcon, background: '#10b98120' }}>
                    <Users size={14} color="#10b981" />
                  </div>
                  Utilisateurs assignés ({orgUsers.length})
                </h4>
                {filteredOrgUsers.length === 0 ? (
                  <p style={styles.emptyText}>
                    {searchQuery ? 'Aucun résultat' : 'Aucun utilisateur assigné'}
                  </p>
                ) : (
                  <div style={styles.userList}>
                    {filteredOrgUsers.map(user => (
                      <UserListItem
                        key={user.id}
                        user={user}
                        action="remove"
                        onAction={() => handleRemove(user.id)}
                        disabled={loading}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Utilisateurs disponibles */}
              <div style={styles.userSection}>
                <h4 style={styles.sectionTitle}>
                  <div style={{ ...styles.sectionIcon, background: '#6366f120' }}>
                    <UserPlus size={14} color="#6366f1" />
                  </div>
                  Disponibles ({unassignedUsers.length})
                </h4>
                {filteredUnassigned.length === 0 ? (
                  <p style={styles.emptyText}>
                    {searchQuery ? 'Aucun résultat' : 'Tous les utilisateurs sont déjà assignés'}
                  </p>
                ) : (
                  <div style={styles.userList}>
                    {filteredUnassigned.map(user => (
                      <UserListItem
                        key={user.id}
                        user={user}
                        action="add"
                        onAction={() => handleAssign(user.id)}
                        disabled={loading}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {error && <div style={styles.error}>{error}</div>}
        </div>

        <div style={styles.modalFooter}>
          <button style={styles.doneBtn} onClick={onClose}>
            Terminé
          </button>
        </div>
      </div>
    </div>
  );
}

// ========== USER LIST ITEM ==========
function UserListItem({ user, action, onAction, disabled }) {
  const roleColors = {
    admin: { bg: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' },
    agent: { bg: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }
  };
  const rc = roleColors[user.role] || roleColors.agent;

  return (
    <div style={styles.userItem}>
      <div style={styles.userAvatar}>{user.name?.charAt(0).toUpperCase()}</div>
      <div style={styles.userInfo}>
        <span style={styles.userName}>{user.name}</span>
        <span style={styles.userEmail}>{user.email}</span>
      </div>
      <span style={{ ...styles.roleBadge, background: rc.bg, color: rc.color }}>
        {user.role}
      </span>
      <button
        style={action === 'add' ? styles.addUserBtn : styles.removeUserBtn}
        onClick={onAction}
        disabled={disabled}
      >
        {action === 'add' ? <UserPlus size={14} /> : <UserMinus size={14} />}
      </button>
    </div>
  );
}

// ========== DELETE CONFIRM MODAL ==========
function DeleteConfirmModal({ organization, onConfirm, onCancel }) {
  const [confirmText, setConfirmText] = useState('');
  const canDelete = confirmText === organization?.code;

  return (
    <div style={styles.modalOverlay} onClick={onCancel}>
      <div style={{ ...styles.modalContent, maxWidth: '450px' }} onClick={(e) => e.stopPropagation()}>
        <div style={styles.deleteHeader}>
          <div style={styles.deleteIcon}>
            <AlertCircle size={32} color="#ef4444" />
          </div>
        </div>
        <h3 style={styles.deleteTitle}>Supprimer l'organisation</h3>
        <p style={styles.deleteText}>
          Cette action est <strong>irréversible</strong>. Toutes les données associées à
          <strong> {organization?.name}</strong> seront supprimées.
        </p>

        <div style={styles.deleteConfirmInput}>
          <label style={styles.deleteLabel}>
            Tapez <strong>{organization?.code}</strong> pour confirmer
          </label>
          <input
            type="text"
            style={styles.input}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={organization?.code}
          />
        </div>

        <div style={styles.deleteActions}>
          <button style={styles.cancelBtn} onClick={onCancel}>
            Annuler
          </button>
          <button
            style={{ ...styles.deleteBtnConfirm, opacity: canDelete ? 1 : 0.5 }}
            onClick={onConfirm}
            disabled={!canDelete}
          >
            <Trash2 size={16} />
            Supprimer définitivement
          </button>
        </div>
      </div>
    </div>
  );
}

// ========== STYLES ==========
const styles = {
  container: {
    minHeight: '100vh',
    background: '#0f172a',
    padding: '24px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  backBtn: {
    padding: '12px',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    color: '#f1f5f9',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: '800',
    color: '#f1f5f9',
    letterSpacing: '-0.5px'
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: '#64748b'
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
    transition: 'all 0.2s'
  },

  // Stats
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    background: '#1e293b',
    borderRadius: '16px',
    border: '1px solid #334155'
  },
  statIcon: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#f1f5f9',
    lineHeight: 1
  },
  statLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: '4px'
  },
  statSub: {
    fontSize: '12px',
    color: '#64748b'
  },

  // Toolbar
  toolbar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  searchContainer: {
    position: 'relative',
    flex: 1,
    minWidth: '200px',
    maxWidth: '400px'
  },
  searchIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#64748b'
  },
  searchInput: {
    width: '100%',
    padding: '12px 14px 12px 44px',
    border: '1px solid #334155',
    borderRadius: '12px',
    fontSize: '14px',
    background: '#1e293b',
    color: '#f1f5f9',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px'
  },
  filterSelect: {
    background: 'transparent',
    border: 'none',
    color: '#f1f5f9',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer'
  },
  viewToggle: {
    display: 'flex',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  viewBtn: {
    padding: '12px',
    background: 'transparent',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  viewBtnActive: {
    background: '#334155',
    color: '#f1f5f9'
  },
  refreshBtn: {
    padding: '12px',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    color: '#f1f5f9',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },

  // Loading & Empty
  loading: {
    textAlign: 'center',
    padding: '80px',
    color: '#94a3b8',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 40px',
    color: '#64748b',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    background: '#1e293b',
    borderRadius: '20px',
    border: '1px dashed #334155'
  },
  emptyTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
    color: '#f1f5f9'
  },
  emptyText: {
    margin: 0,
    fontSize: '14px',
    color: '#64748b',
    fontStyle: 'italic'
  },
  emptyBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    marginTop: '8px'
  },

  // Grid
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px'
  },

  // Card
  card: {
    background: '#1e293b',
    borderRadius: '20px',
    padding: '24px',
    border: '1px solid #334155',
    transition: 'all 0.3s ease'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  cardIcon: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff'
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },
  statusBadgeSmall: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600'
  },
  cardTitle: {
    margin: '0 0 4px 0',
    fontSize: '20px',
    fontWeight: '700',
    color: '#f1f5f9'
  },
  cardCode: {
    margin: '0 0 16px 0',
    fontSize: '13px',
    color: '#64748b'
  },
  codeLabel: {
    color: '#94a3b8'
  },
  cardStats: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
    padding: '16px',
    background: '#0f172a',
    borderRadius: '14px'
  },
  cardStat: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    color: '#f1f5f9',
    fontSize: '18px',
    fontWeight: '700'
  },
  statSmallLabel: {
    fontSize: '10px',
    color: '#64748b',
    fontWeight: '500'
  },
  cardDate: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#64748b',
    marginBottom: '16px'
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end'
  },
  viewBtn2: {
    padding: '10px',
    background: '#334155',
    color: '#f1f5f9',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  assignBtn: {
    padding: '10px',
    background: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  editBtn: {
    padding: '10px',
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  deleteBtn: {
    padding: '10px',
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },

  // List View
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    background: '#1e293b',
    borderRadius: '14px',
    border: '1px solid #334155',
    transition: 'all 0.2s'
  },
  listIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff'
  },
  listInfo: {
    flex: 1
  },
  listMain: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  listTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '700',
    color: '#f1f5f9'
  },
  listCode: {
    fontSize: '13px',
    color: '#64748b'
  },
  listStats: {
    display: 'flex',
    gap: '20px'
  },
  listStat: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#94a3b8',
    fontSize: '14px'
  },
  listActions: {
    display: 'flex',
    gap: '8px'
  },
  listBtn: {
    padding: '8px',
    background: '#334155',
    border: 'none',
    borderRadius: '8px',
    color: '#f1f5f9',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },

  // Modal
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modalContent: {
    background: '#1e293b',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '520px',
    maxHeight: '90vh',
    overflow: 'auto',
    border: '1px solid #334155'
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '20px 24px',
    borderBottom: '1px solid #334155'
  },
  modalHeaderIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: '#6366f120',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6366f1'
  },
  modalTitle: {
    margin: 0,
    flex: 1,
    fontSize: '18px',
    fontWeight: '700',
    color: '#f1f5f9'
  },
  modalSubtitle: {
    margin: 0,
    fontSize: '13px',
    color: '#64748b'
  },
  closeBtn: {
    background: '#334155',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    transition: 'all 0.2s'
  },
  form: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#94a3b8'
  },
  input: {
    padding: '12px 16px',
    border: '1px solid #334155',
    borderRadius: '12px',
    fontSize: '14px',
    background: '#0f172a',
    color: '#f1f5f9',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  hint: {
    fontSize: '11px',
    color: '#64748b'
  },
  toggleLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    background: '#0f172a',
    borderRadius: '12px',
    cursor: 'pointer'
  },
  toggleInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  toggleTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#f1f5f9'
  },
  toggleDesc: {
    fontSize: '12px',
    color: '#64748b'
  },
  toggle: {
    width: '48px',
    height: '28px',
    borderRadius: '14px',
    padding: '4px',
    transition: 'background 0.2s',
    cursor: 'pointer'
  },
  toggleKnob: {
    width: '20px',
    height: '20px',
    borderRadius: '10px',
    background: '#fff',
    transition: 'transform 0.2s'
  },
  error: {
    padding: '12px 16px',
    background: '#450a0a',
    border: '1px solid #7f1d1d',
    borderRadius: '12px',
    color: '#fca5a5',
    fontSize: '13px'
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px'
  },
  cancelBtn: {
    flex: 1,
    padding: '14px',
    background: '#334155',
    color: '#f1f5f9',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.2s'
  },
  submitBtn: {
    flex: 1,
    padding: '14px',
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.2s'
  },

  // Assign Modal
  assignSearch: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: '0 24px',
    padding: '10px 14px',
    background: '#0f172a',
    borderRadius: '10px',
    border: '1px solid #334155'
  },
  assignSearchInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#f1f5f9',
    fontSize: '14px',
    outline: 'none'
  },
  assignContent: {
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    maxHeight: '400px',
    overflowY: 'auto'
  },
  loadingSmall: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '40px',
    color: '#94a3b8'
  },
  userSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  sectionTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '700',
    color: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  sectionIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  userList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  userItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    background: '#0f172a',
    borderRadius: '12px',
    transition: 'all 0.2s'
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px',
    fontWeight: '700'
  },
  userInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  userName: {
    color: '#f1f5f9',
    fontSize: '14px',
    fontWeight: '600'
  },
  userEmail: {
    color: '#64748b',
    fontSize: '12px'
  },
  roleBadge: {
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: '600'
  },
  addUserBtn: {
    padding: '10px',
    background: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  removeUserBtn: {
    padding: '10px',
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  modalFooter: {
    padding: '16px 24px',
    borderTop: '1px solid #334155'
  },
  doneBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  },

  // Detail Modal
  detailHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '24px',
    borderBottom: '1px solid #334155',
    position: 'relative'
  },
  detailIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff'
  },
  detailHeaderInfo: {
    flex: 1
  },
  detailTitle: {
    margin: 0,
    fontSize: '22px',
    fontWeight: '800',
    color: '#f1f5f9'
  },
  detailCode: {
    fontSize: '14px',
    color: '#64748b'
  },
  detailBody: {
    padding: '24px'
  },
  detailStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '24px'
  },
  detailStat: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: '#0f172a',
    borderRadius: '14px'
  },
  detailStatInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  detailStatValue: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#f1f5f9'
  },
  detailStatLabel: {
    fontSize: '12px',
    color: '#64748b'
  },
  detailSection: {
    marginBottom: '24px'
  },
  detailSectionTitle: {
    margin: '0 0 16px 0',
    fontSize: '14px',
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  detailInfoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  detailInfoItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px 16px',
    background: '#0f172a',
    borderRadius: '12px'
  },
  detailInfoLabel: {
    display: 'block',
    fontSize: '12px',
    color: '#64748b'
  },
  detailInfoValue: {
    display: 'block',
    fontSize: '14px',
    color: '#f1f5f9',
    fontWeight: '500'
  },
  detailActions: {
    display: 'flex',
    gap: '12px',
    padding: '0 24px 24px 24px'
  },
  detailActionBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px',
    background: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  },

  // Delete Modal
  deleteHeader: {
    textAlign: 'center',
    padding: '32px 24px 0 24px'
  },
  deleteIcon: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: 'rgba(239, 68, 68, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto'
  },
  deleteTitle: {
    margin: '20px 0 8px 0',
    fontSize: '22px',
    fontWeight: '700',
    color: '#f1f5f9',
    textAlign: 'center'
  },
  deleteText: {
    margin: '0 0 24px 0',
    fontSize: '14px',
    color: '#94a3b8',
    textAlign: 'center',
    padding: '0 24px',
    lineHeight: 1.6
  },
  deleteConfirmInput: {
    padding: '0 24px',
    marginBottom: '24px'
  },
  deleteLabel: {
    display: 'block',
    fontSize: '13px',
    color: '#94a3b8',
    marginBottom: '8px'
  },
  deleteActions: {
    display: 'flex',
    gap: '12px',
    padding: '0 24px 24px 24px'
  },
  deleteBtnConfirm: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px',
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'opacity 0.2s'
  }
};

export default SuperAdminOrganizations;
