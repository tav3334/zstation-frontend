import { useState, useEffect } from 'react';
import {
  Building2, ArrowLeft, Search, Plus, Edit2, Trash2, X,
  AlertCircle, Users, Monitor, Gamepad2, RefreshCw, UserPlus, UserMinus
} from 'lucide-react';
import api from '../services/api';
import Toast from '../components/Toast';

function SuperAdminOrganizations({ onBack }) {
  const [organizations, setOrganizations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [deletingOrg, setDeletingOrg] = useState(null);
  const [assigningOrg, setAssigningOrg] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [orgsRes, usersRes] = await Promise.all([
        api.get('/super-admin/organizations'),
        api.get('/super-admin/users')
      ]);
      setOrganizations(orgsRes.data.organizations || []);
      setUsers(usersRes.data.users || usersRes.data || []);
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

  const filteredOrgs = organizations.filter(org =>
    org.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <p style={styles.subtitle}>{organizations.length} organisation(s)</p>
          </div>
        </div>
        <button style={styles.addBtn} onClick={() => { setEditingOrg(null); setShowModal(true); }}>
          <Plus size={18} />
          Nouvelle Organisation
        </button>
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
        <button style={styles.refreshBtn} onClick={loadData} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
        </button>
      </div>

      {/* Organizations Grid */}
      {loading ? (
        <div style={styles.loading}>Chargement...</div>
      ) : filteredOrgs.length === 0 ? (
        <div style={styles.emptyState}>
          <Building2 size={64} color="#64748b" />
          <p>Aucune organisation trouvée</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {filteredOrgs.map(org => (
            <OrganizationCard
              key={org.id}
              organization={org}
              onEdit={() => { setEditingOrg(org); setShowModal(true); }}
              onDelete={() => { setDeletingOrg(org); setShowDeleteModal(true); }}
              onAssign={() => { setAssigningOrg(org); setShowAssignModal(true); }}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
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

      {/* Delete Confirmation */}
      {showDeleteModal && (
        <DeleteConfirmModal
          organization={deletingOrg}
          onConfirm={handleDelete}
          onCancel={() => { setShowDeleteModal(false); setDeletingOrg(null); }}
        />
      )}

      {/* Assign Users Modal */}
      {showAssignModal && (
        <AssignUsersModal
          organization={assigningOrg}
          allUsers={users}
          onClose={() => { setShowAssignModal(false); setAssigningOrg(null); }}
          onSuccess={() => {
            loadData();
            showToast('Utilisateurs mis à jour');
          }}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

// ========== ORGANIZATION CARD ==========
function OrganizationCard({ organization, onEdit, onDelete, onAssign }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        ...styles.card,
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 12px 24px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.15)'
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
      <p style={styles.cardCode}>Code: {organization.code}</p>

      <div style={styles.cardStats}>
        <div style={styles.cardStat}>
          <Users size={14} />
          <span>{organization.users_count || 0}</span>
        </div>
        <div style={styles.cardStat}>
          <Monitor size={14} />
          <span>{organization.machines_count || 0}</span>
        </div>
        <div style={styles.cardStat}>
          <Gamepad2 size={14} />
          <span>{organization.games_count || 0}</span>
        </div>
      </div>

      <div style={styles.cardActions}>
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

// ========== ORGANIZATION MODAL ==========
function OrganizationModal({ organization, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: organization?.name || '',
    code: organization?.code || '',
    is_active: organization?.is_active ?? true
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
          <h3 style={styles.modalTitle}>
            {organization ? 'Modifier Organisation' : 'Nouvelle Organisation'}
          </h3>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Nom de l'organisation</label>
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
            <label style={styles.label}>Code (optionnel)</label>
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

          <div style={styles.formGroup}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                style={styles.checkbox}
              />
              Organisation active
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
function AssignUsersModal({ organization, allUsers, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filtrer les utilisateurs non-superadmin
  const availableUsers = allUsers.filter(u => u.role !== 'super_admin');
  const orgUsers = availableUsers.filter(u => u.organization_id === organization.id);
  const unassignedUsers = availableUsers.filter(u => !u.organization_id || u.organization_id !== organization.id);

  const handleAssign = async (userId) => {
    try {
      setLoading(true);
      await api.post(`/super-admin/organizations/${organization.id}/assign-user`, { user_id: userId });
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
      await api.post(`/super-admin/organizations/${organization.id}/remove-user`, { user_id: userId });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={{ ...styles.modalContent, maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>
            Utilisateurs - {organization.name}
          </h3>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.assignContent}>
          {/* Utilisateurs actuels */}
          <div style={styles.userSection}>
            <h4 style={styles.sectionTitle}>
              <Users size={16} />
              Utilisateurs assignés ({orgUsers.length})
            </h4>
            {orgUsers.length === 0 ? (
              <p style={styles.emptyText}>Aucun utilisateur assigné</p>
            ) : (
              <div style={styles.userList}>
                {orgUsers.map(user => (
                  <div key={user.id} style={styles.userItem}>
                    <div style={styles.userAvatar}>{user.name?.charAt(0).toUpperCase()}</div>
                    <div style={styles.userInfo}>
                      <span style={styles.userName}>{user.name}</span>
                      <span style={styles.userEmail}>{user.email}</span>
                    </div>
                    <span style={getRoleBadge(user.role)}>{user.role}</span>
                    <button
                      style={styles.removeUserBtn}
                      onClick={() => handleRemove(user.id)}
                      disabled={loading}
                      title="Retirer"
                    >
                      <UserMinus size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Utilisateurs disponibles */}
          <div style={styles.userSection}>
            <h4 style={styles.sectionTitle}>
              <UserPlus size={16} />
              Utilisateurs disponibles ({unassignedUsers.length})
            </h4>
            {unassignedUsers.length === 0 ? (
              <p style={styles.emptyText}>Tous les utilisateurs sont assignés</p>
            ) : (
              <div style={styles.userList}>
                {unassignedUsers.map(user => (
                  <div key={user.id} style={styles.userItem}>
                    <div style={styles.userAvatar}>{user.name?.charAt(0).toUpperCase()}</div>
                    <div style={styles.userInfo}>
                      <span style={styles.userName}>{user.name}</span>
                      <span style={styles.userEmail}>{user.email}</span>
                    </div>
                    <span style={getRoleBadge(user.role)}>{user.role}</span>
                    <button
                      style={styles.addUserBtn}
                      onClick={() => handleAssign(user.id)}
                      disabled={loading}
                      title="Ajouter"
                    >
                      <UserPlus size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

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

// ========== DELETE CONFIRM MODAL ==========
function DeleteConfirmModal({ organization, onConfirm, onCancel }) {
  return (
    <div style={styles.modalOverlay} onClick={onCancel}>
      <div style={{ ...styles.modalContent, maxWidth: '450px' }} onClick={(e) => e.stopPropagation()}>
        <div style={styles.deleteHeader}>
          <AlertCircle size={48} color="#ef4444" />
        </div>
        <h3 style={styles.deleteTitle}>Supprimer l'organisation</h3>
        <p style={styles.deleteText}>
          Êtes-vous sûr de vouloir supprimer <strong>{organization?.name}</strong> ?
          Cette action est irréversible.
        </p>
        <div style={styles.deleteActions}>
          <button style={styles.cancelBtn} onClick={onCancel}>
            Annuler
          </button>
          <button style={styles.deleteBtnConfirm} onClick={onConfirm}>
            <Trash2 size={16} />
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

// ========== HELPERS ==========
function getRoleBadge(role) {
  const colors = {
    admin: { bg: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' },
    agent: { bg: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }
  };
  const c = colors[role] || colors.agent;
  return {
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    background: c.bg,
    color: c.color
  };
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
    alignItems: 'center',
    marginBottom: '24px'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  backBtn: {
    padding: '10px',
    background: '#334155',
    border: 'none',
    borderRadius: '10px',
    color: '#f1f5f9',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700',
    color: '#f1f5f9'
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '13px',
    color: '#94a3b8'
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  },
  toolbar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px'
  },
  searchContainer: {
    position: 'relative',
    flex: 1,
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
    borderRadius: '10px',
    fontSize: '14px',
    background: '#1e293b',
    color: '#f1f5f9',
    outline: 'none'
  },
  refreshBtn: {
    padding: '12px',
    background: '#334155',
    border: 'none',
    borderRadius: '10px',
    color: '#f1f5f9',
    cursor: 'pointer'
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    color: '#94a3b8'
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px',
    color: '#64748b',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px'
  },
  card: {
    background: '#1e293b',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #334155',
    transition: 'all 0.3s'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  cardIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff'
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600'
  },
  cardTitle: {
    margin: '0 0 4px 0',
    fontSize: '18px',
    fontWeight: '700',
    color: '#f1f5f9'
  },
  cardCode: {
    margin: '0 0 16px 0',
    fontSize: '13px',
    color: '#64748b'
  },
  cardStats: {
    display: 'flex',
    gap: '16px',
    marginBottom: '16px',
    padding: '12px',
    background: '#0f172a',
    borderRadius: '10px'
  },
  cardStat: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#94a3b8',
    fontSize: '13px'
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end'
  },
  assignBtn: {
    padding: '10px',
    background: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  editBtn: {
    padding: '10px',
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  deleteBtn: {
    padding: '10px',
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    background: '#1e293b',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '480px',
    maxHeight: '90vh',
    overflow: 'auto',
    border: '1px solid #334155'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #334155'
  },
  modalTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#f1f5f9'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '4px'
  },
  form: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#94a3b8'
  },
  input: {
    padding: '12px 14px',
    border: '1px solid #334155',
    borderRadius: '10px',
    fontSize: '14px',
    background: '#0f172a',
    color: '#f1f5f9',
    outline: 'none'
  },
  hint: {
    fontSize: '11px',
    color: '#64748b'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#f1f5f9',
    fontSize: '14px',
    cursor: 'pointer'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  error: {
    padding: '12px',
    background: '#450a0a',
    border: '1px solid #7f1d1d',
    borderRadius: '8px',
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
    padding: '12px',
    background: '#334155',
    color: '#f1f5f9',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  },
  submitBtn: {
    flex: 1,
    padding: '12px',
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  },
  assignContent: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    maxHeight: '400px',
    overflowY: 'auto'
  },
  userSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  sectionTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '600',
    color: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  emptyText: {
    margin: 0,
    fontSize: '13px',
    color: '#64748b',
    fontStyle: 'italic'
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
    padding: '10px 12px',
    background: '#0f172a',
    borderRadius: '10px'
  },
  userAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: '#6366f1',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
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
  addUserBtn: {
    padding: '8px',
    background: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  removeUserBtn: {
    padding: '8px',
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  modalFooter: {
    padding: '16px 20px',
    borderTop: '1px solid #334155'
  },
  doneBtn: {
    width: '100%',
    padding: '12px',
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  },
  deleteHeader: {
    textAlign: 'center',
    padding: '24px 24px 0 24px'
  },
  deleteTitle: {
    margin: '16px 0 8px 0',
    fontSize: '20px',
    fontWeight: '700',
    color: '#f1f5f9',
    textAlign: 'center'
  },
  deleteText: {
    margin: '0 0 24px 0',
    fontSize: '14px',
    color: '#94a3b8',
    textAlign: 'center',
    padding: '0 24px'
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
    padding: '12px',
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  }
};

export default SuperAdminOrganizations;
