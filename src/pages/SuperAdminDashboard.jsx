import { useState, useEffect } from 'react';
import {
  Users, Monitor, Gamepad2, LogOut, UserCog, Search, Plus,
  Edit2, Trash2, X, Check, AlertCircle, TrendingUp, Activity,
  Filter, Download, RefreshCw
} from 'lucide-react';
import api from '../services/api';
import Toast from '../components/Toast';
import '../styles/superadmin.module.css';

function SuperAdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('users');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // États pour les données
  const [users, setUsers] = useState([]);
  const [machines, setMachines] = useState([]);
  const [games, setGames] = useState([]);

  // États pour les statistiques
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMachines: 0,
    totalGames: 0,
    activeUsers: 0
  });

  // États pour les modals
  const [showUserModal, setShowUserModal] = useState(false);
  const [showMachineModal, setShowMachineModal] = useState(false);
  const [showGameModal, setShowGameModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  // Charger les données selon l'onglet actif
  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Calculer les statistiques
  useEffect(() => {
    setStats({
      totalUsers: users.length,
      totalMachines: machines.length,
      totalGames: games.length,
      activeUsers: users.filter(u => u.role === 'agent' || u.role === 'admin').length
    });
  }, [users, machines, games]);

  const loadData = async () => {
    if (activeTab === 'users') await fetchUsers();
    else if (activeTab === 'machines') await fetchMachines();
    else if (activeTab === 'games') await fetchGames();
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ========== GESTION DES UTILISATEURS ==========
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/super-admin/users');
      setUsers(response.data.users || response.data);
    } catch (error) {
      showToast('Erreur lors du chargement des utilisateurs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (user) => {
    setDeletingItem({ type: 'user', data: user });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;

    try {
      if (deletingItem.type === 'user') {
        await api.delete(`/super-admin/users/${deletingItem.data.id}`);
        showToast('Utilisateur supprimé avec succès', 'success');
        fetchUsers();
      } else if (deletingItem.type === 'machine') {
        await api.delete(`/super-admin/machines/${deletingItem.data.id}`);
        showToast('Machine supprimée avec succès', 'success');
        fetchMachines();
      } else if (deletingItem.type === 'game') {
        await api.delete(`/super-admin/games/${deletingItem.data.id}`);
        showToast('Jeu supprimé avec succès', 'success');
        fetchGames();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Erreur lors de la suppression', 'error');
    } finally {
      setShowDeleteConfirm(false);
      setDeletingItem(null);
    }
  };

  // ========== GESTION DES MACHINES ==========
  const fetchMachines = async () => {
    try {
      setLoading(true);
      const response = await api.get('/super-admin/machines');
      setMachines(response.data.machines || response.data);
    } catch (error) {
      showToast('Erreur lors du chargement des machines', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ========== GESTION DES JEUX ==========
  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await api.get('/super-admin/games');
      setGames(response.data.games || response.data);
    } catch (error) {
      showToast('Erreur lors du chargement des jeux', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les données selon la recherche
  const getFilteredData = () => {
    const query = searchQuery.toLowerCase();
    if (activeTab === 'users') {
      return users.filter(u =>
        u.name?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        u.role?.toLowerCase().includes(query)
      );
    } else if (activeTab === 'machines') {
      return machines.filter(m =>
        m.machine_number?.toString().includes(query) ||
        m.type?.toLowerCase().includes(query)
      );
    } else if (activeTab === 'games') {
      return games.filter(g =>
        g.name?.toLowerCase().includes(query)
      );
    }
    return [];
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logoContainer}>
            <UserCog size={28} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={styles.title}>Super Admin Panel</h1>
            <p style={styles.subtitle}>Gestion globale du système Z-STATION</p>
          </div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>
              {user.name?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div>
              <div style={styles.userName}>{user.name}</div>
              <div style={styles.userRole}>Super Administrateur</div>
            </div>
          </div>
          <button style={styles.logoutBtn} onClick={onLogout}>
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </header>

      {/* Statistics Cards */}
      <div style={styles.statsContainer}>
        <StatCard
          icon={<Users size={24} />}
          title="Total Utilisateurs"
          value={stats.totalUsers}
          color="#667eea"
          active={activeTab === 'users'}
          onClick={() => setActiveTab('users')}
        />
        <StatCard
          icon={<Monitor size={24} />}
          title="Total Machines"
          value={stats.totalMachines}
          color="#f093fb"
          active={activeTab === 'machines'}
          onClick={() => setActiveTab('machines')}
        />
        <StatCard
          icon={<Gamepad2 size={24} />}
          title="Total Jeux"
          value={stats.totalGames}
          color="#4facfe"
          active={activeTab === 'games'}
          onClick={() => setActiveTab('games')}
        />
        <StatCard
          icon={<Activity size={24} />}
          title="Utilisateurs Actifs"
          value={stats.activeUsers}
          color="#43e97b"
        />
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Toolbar */}
        <div style={styles.toolbar}>
          <div style={styles.searchContainer}>
            <Search size={20} style={styles.searchIcon} />
            <input
              type="text"
              placeholder={`Rechercher ${activeTab === 'users' ? 'utilisateurs' : activeTab === 'machines' ? 'machines' : 'jeux'}...`}
              style={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={styles.toolbarActions}>
            <button style={styles.refreshBtn} onClick={loadData} disabled={loading}>
              <RefreshCw size={18} className={loading ? 'spin' : ''} />
              <span>Actualiser</span>
            </button>
            <button
              style={styles.createBtn}
              onClick={() => {
                setEditingItem(null);
                if (activeTab === 'users') setShowUserModal(true);
                else if (activeTab === 'machines') setShowMachineModal(true);
                else if (activeTab === 'games') setShowGameModal(true);
              }}
            >
              <Plus size={18} />
              <span>
                {activeTab === 'users' ? 'Nouvel Utilisateur' :
                 activeTab === 'machines' ? 'Nouvelle Machine' :
                 'Nouveau Jeu'}
              </span>
            </button>
          </div>
        </div>

        {/* Content Tabs */}
        {activeTab === 'users' && (
          <UsersTable
            users={getFilteredData()}
            loading={loading}
            onEdit={(user) => { setEditingItem(user); setShowUserModal(true); }}
            onDelete={handleDeleteUser}
          />
        )}
        {activeTab === 'machines' && (
          <MachinesTable
            machines={getFilteredData()}
            loading={loading}
            onEdit={(machine) => { setEditingItem(machine); setShowMachineModal(true); }}
            onDelete={(machine) => {
              setDeletingItem({ type: 'machine', data: machine });
              setShowDeleteConfirm(true);
            }}
          />
        )}
        {activeTab === 'games' && (
          <GamesTable
            games={getFilteredData()}
            loading={loading}
            onEdit={(game) => { setEditingItem(game); setShowGameModal(true); }}
            onDelete={(game) => {
              setDeletingItem({ type: 'game', data: game });
              setShowDeleteConfirm(true);
            }}
          />
        )}
      </div>

      {/* Modals */}
      {showUserModal && (
        <UserModal
          user={editingItem}
          onClose={() => setShowUserModal(false)}
          onSuccess={() => {
            setShowUserModal(false);
            fetchUsers();
            showToast(editingItem ? 'Utilisateur modifié avec succès' : 'Utilisateur créé avec succès');
          }}
        />
      )}

      {showMachineModal && (
        <MachineModal
          machine={editingItem}
          onClose={() => setShowMachineModal(false)}
          onSuccess={() => {
            setShowMachineModal(false);
            fetchMachines();
            showToast(editingItem ? 'Machine modifiée avec succès' : 'Machine créée avec succès');
          }}
        />
      )}

      {showGameModal && (
        <GameModal
          game={editingItem}
          onClose={() => setShowGameModal(false)}
          onSuccess={() => {
            setShowGameModal(false);
            fetchGames();
            showToast(editingItem ? 'Jeu modifié avec succès' : 'Jeu créé avec succès');
          }}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmModal
          item={deletingItem}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setDeletingItem(null);
          }}
        />
      )}

      {/* Toast Notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

// ========== STAT CARD COMPONENT ==========
function StatCard({ icon, title, value, color, active, onClick }) {
  return (
    <div
      style={{
        ...styles.statCard,
        ...(active && styles.statCardActive),
        cursor: onClick ? 'pointer' : 'default'
      }}
      onClick={onClick}
    >
      <div style={{ ...styles.statIcon, background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)` }}>
        {icon}
      </div>
      <div style={styles.statContent}>
        <div style={styles.statValue}>{value}</div>
        <div style={styles.statTitle}>{title}</div>
      </div>
    </div>
  );
}

// ========== USERS TABLE ==========
function UsersTable({ users, loading, onEdit, onDelete }) {
  if (loading) {
    return <div style={styles.loading}><RefreshCw size={32} className="spin" /> Chargement...</div>;
  }

  if (users.length === 0) {
    return (
      <div style={styles.emptyState}>
        <Users size={64} color="#ccc" />
        <p>Aucun utilisateur trouvé</p>
      </div>
    );
  }

  return (
    <div style={styles.tableWrapper}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Utilisateur</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Rôle</th>
            <th style={styles.th}>Date de création</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} style={styles.tr}>
              <td style={styles.td}>
                <div style={styles.userCell}>
                  <div style={styles.miniAvatar}>{user.name?.charAt(0).toUpperCase()}</div>
                  <strong>{user.name}</strong>
                </div>
              </td>
              <td style={styles.td}>{user.email}</td>
              <td style={styles.td}>
                <span style={getRoleBadgeStyle(user.role)}>{getRoleLabel(user.role)}</span>
              </td>
              <td style={styles.td}>{new Date(user.created_at).toLocaleDateString('fr-FR')}</td>
              <td style={styles.td}>
                <div style={styles.actionBtns}>
                  <button style={styles.editIconBtn} onClick={() => onEdit(user)} title="Modifier">
                    <Edit2 size={16} />
                  </button>
                  <button style={styles.deleteIconBtn} onClick={() => onDelete(user)} title="Supprimer">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ========== MACHINES TABLE ==========
function MachinesTable({ machines, loading, onEdit, onDelete }) {
  if (loading) {
    return <div style={styles.loading}><RefreshCw size={32} className="spin" /> Chargement...</div>;
  }

  if (machines.length === 0) {
    return (
      <div style={styles.emptyState}>
        <Monitor size={64} color="#ccc" />
        <p>Aucune machine trouvée</p>
      </div>
    );
  }

  return (
    <div style={styles.tableWrapper}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Machine</th>
            <th style={styles.th}>Type</th>
            <th style={styles.th}>Statut</th>
            <th style={styles.th}>Date de création</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {machines.map((machine) => (
            <tr key={machine.id} style={styles.tr}>
              <td style={styles.td}>
                <strong>Machine #{machine.machine_number}</strong>
              </td>
              <td style={styles.td}>{machine.type || 'Standard'}</td>
              <td style={styles.td}>
                <span style={getStatusBadgeStyle(machine.status)}>
                  {machine.status === 'available' ? 'Disponible' : 'Occupée'}
                </span>
              </td>
              <td style={styles.td}>{new Date(machine.created_at).toLocaleDateString('fr-FR')}</td>
              <td style={styles.td}>
                <div style={styles.actionBtns}>
                  <button style={styles.editIconBtn} onClick={() => onEdit(machine)} title="Modifier">
                    <Edit2 size={16} />
                  </button>
                  <button style={styles.deleteIconBtn} onClick={() => onDelete(machine)} title="Supprimer">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ========== GAMES TABLE ==========
function GamesTable({ games, loading, onEdit, onDelete }) {
  if (loading) {
    return <div style={styles.loading}><RefreshCw size={32} className="spin" /> Chargement...</div>;
  }

  if (games.length === 0) {
    return (
      <div style={styles.emptyState}>
        <Gamepad2 size={64} color="#ccc" />
        <p>Aucun jeu trouvé</p>
      </div>
    );
  }

  return (
    <div style={styles.tableWrapper}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Nom du Jeu</th>
            <th style={styles.th}>Prix 1h</th>
            <th style={styles.th}>Prix 2h</th>
            <th style={styles.th}>Prix 3h</th>
            <th style={styles.th}>Nuit Complète</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game) => (
            <tr key={game.id} style={styles.tr}>
              <td style={styles.td}>
                <strong>{game.name}</strong>
              </td>
              <td style={styles.td}><span style={styles.priceTag}>{game.price_1h} DH</span></td>
              <td style={styles.td}><span style={styles.priceTag}>{game.price_2h} DH</span></td>
              <td style={styles.td}><span style={styles.priceTag}>{game.price_3h} DH</span></td>
              <td style={styles.td}><span style={styles.priceTag}>{game.price_night} DH</span></td>
              <td style={styles.td}>
                <div style={styles.actionBtns}>
                  <button style={styles.editIconBtn} onClick={() => onEdit(game)} title="Modifier">
                    <Edit2 size={16} />
                  </button>
                  <button style={styles.deleteIconBtn} onClick={() => onDelete(game)} title="Supprimer">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ========== DELETE CONFIRM MODAL ==========
function DeleteConfirmModal({ item, onConfirm, onCancel }) {
  return (
    <div style={styles.modalOverlay} onClick={onCancel}>
      <div style={{...styles.modalContent, maxWidth: '450px'}} onClick={(e) => e.stopPropagation()}>
        <div style={styles.deleteModalHeader}>
          <AlertCircle size={48} color="#ef4444" />
        </div>
        <h3 style={styles.deleteModalTitle}>Confirmer la suppression</h3>
        <p style={styles.deleteModalText}>
          Êtes-vous sûr de vouloir supprimer{' '}
          <strong>
            {item?.type === 'user' && item.data.name}
            {item?.type === 'machine' && `Machine #${item.data.machine_number}`}
            {item?.type === 'game' && item.data.name}
          </strong>
          ? Cette action est irréversible.
        </p>
        <div style={styles.deleteModalActions}>
          <button style={styles.cancelBtnModal} onClick={onCancel}>
            <X size={18} />
            Annuler
          </button>
          <button style={styles.deleteBtnModal} onClick={onConfirm}>
            <Trash2 size={18} />
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

// ========== USER MODAL ==========
function UserModal({ user, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    password_confirmation: '',
    role: user?.role || 'agent'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user && !formData.password) {
      setError('Le mot de passe est requis pour la création');
      return;
    }

    if (formData.password && formData.password !== formData.password_confirmation) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setLoading(true);
      const payload = { ...formData };
      if (!formData.password) {
        delete payload.password;
        delete payload.password_confirmation;
      }

      if (user) {
        await api.put(`/super-admin/users/${user.id}`, payload);
      } else {
        await api.post('/super-admin/users', payload);
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
            {user ? 'Modifier Utilisateur' : 'Nouvel Utilisateur'}
          </h3>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Nom complet</label>
            <input
              type="text"
              style={styles.input}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              style={styles.input}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Rôle</label>
            <select
              style={styles.input}
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            >
              <option value="agent">Agent (Caisse)</option>
              <option value="admin">Admin (Statistiques)</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              {user ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
            </label>
            <input
              type="password"
              style={styles.input}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!user}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Confirmer le mot de passe</label>
            <input
              type="password"
              style={styles.input}
              value={formData.password_confirmation}
              onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
              required={!user || formData.password}
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.modalActions}>
            <button type="button" style={styles.cancelBtn} onClick={onClose}>
              Annuler
            </button>
            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? 'Enregistrement...' : user ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ========== MACHINE MODAL ==========
function MachineModal({ machine, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    machine_number: machine?.machine_number || '',
    type: machine?.type || 'Standard',
    status: machine?.status || 'available'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      if (machine) {
        await api.put(`/super-admin/machines/${machine.id}`, formData);
      } else {
        await api.post('/super-admin/machines', formData);
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
            {machine ? 'Modifier Machine' : 'Nouvelle Machine'}
          </h3>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Numéro de Machine</label>
            <input
              type="number"
              style={styles.input}
              value={formData.machine_number}
              onChange={(e) => setFormData({ ...formData, machine_number: e.target.value })}
              required
              min="1"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Type</label>
            <input
              type="text"
              style={styles.input}
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              placeholder="Ex: PS5 Pro, Xbox Series X, PC Gaming"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Statut</label>
            <select
              style={styles.input}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="available">Disponible</option>
              <option value="in_session">En session</option>
            </select>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.modalActions}>
            <button type="button" style={styles.cancelBtn} onClick={onClose}>
              Annuler
            </button>
            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? 'Enregistrement...' : machine ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ========== GAME MODAL ==========
function GameModal({ game, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: game?.name || '',
    price_1h: game?.price_1h || '',
    price_2h: game?.price_2h || '',
    price_3h: game?.price_3h || '',
    price_night: game?.price_night || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      if (game) {
        await api.put(`/super-admin/games/${game.id}`, formData);
      } else {
        await api.post('/super-admin/games', formData);
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
            {game ? 'Modifier Jeu' : 'Nouveau Jeu'}
          </h3>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Nom du Jeu</label>
            <input
              type="text"
              style={styles.input}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: FIFA 25, Call of Duty"
              required
            />
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Prix 1h (DH)</label>
              <input
                type="number"
                style={styles.input}
                value={formData.price_1h}
                onChange={(e) => setFormData({ ...formData, price_1h: e.target.value })}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Prix 2h (DH)</label>
              <input
                type="number"
                style={styles.input}
                value={formData.price_2h}
                onChange={(e) => setFormData({ ...formData, price_2h: e.target.value })}
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Prix 3h (DH)</label>
              <input
                type="number"
                style={styles.input}
                value={formData.price_3h}
                onChange={(e) => setFormData({ ...formData, price_3h: e.target.value })}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Nuit Complète (DH)</label>
              <input
                type="number"
                style={styles.input}
                value={formData.price_night}
                onChange={(e) => setFormData({ ...formData, price_night: e.target.value })}
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.modalActions}>
            <button type="button" style={styles.cancelBtn} onClick={onClose}>
              Annuler
            </button>
            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? 'Enregistrement...' : game ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ========== HELPER FUNCTIONS ==========
function getRoleLabel(role) {
  const labels = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    agent: 'Agent'
  };
  return labels[role] || role;
}

function getRoleBadgeStyle(role) {
  const baseStyle = {
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
    display: 'inline-block',
    letterSpacing: '0.5px'
  };

  if (role === 'super_admin') {
    return { ...baseStyle, background: 'linear-gradient(135deg, #7b5cff 0%, #00e6ff 100%)', color: '#fff' };
  } else if (role === 'admin') {
    return { ...baseStyle, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: '#fff' };
  } else {
    return { ...baseStyle, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: '#fff' };
  }
}

function getStatusBadgeStyle(status) {
  const baseStyle = {
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
    display: 'inline-block',
    letterSpacing: '0.5px'
  };

  if (status === 'available') {
    return { ...baseStyle, background: '#10b981', color: '#fff' };
  } else {
    return { ...baseStyle, background: '#ef4444', color: '#fff' };
  }
}

// ========== STYLES ==========
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #7b5cff 0%, #00e6ff 100%)',
    padding: '0',
    margin: '0'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.98)',
    padding: '20px 30px',
    borderRadius: '0',
    marginBottom: '0',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    backdropFilter: 'blur(10px)'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  logoContainer: {
    width: '56px',
    height: '56px',
    background: 'linear-gradient(135deg, #7b5cff 0%, #00e6ff 100%)',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(123, 92, 255, 0.4)'
  },
  title: {
    margin: 0,
    fontSize: '26px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #7b5cff 0%, #00e6ff 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '13px',
    color: '#666',
    fontWeight: '500'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  userAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #7b5cff 0%, #00e6ff 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '800',
    boxShadow: '0 4px 12px rgba(123, 92, 255, 0.3)'
  },
  userName: {
    fontWeight: '700',
    fontSize: '14px',
    color: '#333'
  },
  userRole: {
    fontSize: '12px',
    color: '#666',
    fontWeight: '500'
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '11px 22px',
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '14px',
    transition: 'all 0.3s',
    boxShadow: '0 4px 12px rgba(245, 87, 108, 0.3)'
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    padding: '20px 30px',
    background: 'linear-gradient(135deg, #7b5cff 0%, #00e6ff 100%)'
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.98)',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    transition: 'all 0.3s',
    backdropFilter: 'blur(10px)'
  },
  statCardActive: {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 30px rgba(123, 92, 255, 0.35)',
    background: 'rgba(255, 255, 255, 1)'
  },
  statIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    flexShrink: 0
  },
  statContent: {
    flex: 1
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#333',
    lineHeight: 1
  },
  statTitle: {
    fontSize: '13px',
    color: '#666',
    marginTop: '6px',
    fontWeight: '600'
  },
  mainContent: {
    background: '#f8f9fa',
    borderRadius: '0',
    padding: '30px',
    minHeight: 'calc(100vh - 240px)'
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    gap: '16px',
    flexWrap: 'wrap'
  },
  searchContainer: {
    position: 'relative',
    flex: '1 1 300px',
    maxWidth: '400px'
  },
  searchIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#999'
  },
  searchInput: {
    width: '100%',
    padding: '12px 14px 12px 44px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.3s',
    fontWeight: '500'
  },
  toolbarActions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: '#fff',
    color: '#7b5cff',
    border: '2px solid #7b5cff',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '14px',
    transition: 'all 0.3s'
  },
  createBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #7b5cff 0%, #00e6ff 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '14px',
    transition: 'all 0.3s',
    boxShadow: '0 4px 12px rgba(123, 92, 255, 0.3)'
  },
  tableWrapper: {
    overflowX: 'auto',
    borderRadius: '12px',
    border: '1px solid #e5e7eb'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    background: '#f9fafb',
    padding: '16px 20px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: '800',
    color: '#6b7280',
    textTransform: 'uppercase',
    borderBottom: '2px solid #e5e7eb',
    letterSpacing: '0.5px'
  },
  tr: {
    borderBottom: '1px solid #e5e7eb',
    transition: 'all 0.2s'
  },
  td: {
    padding: '18px 20px',
    fontSize: '14px',
    color: '#374151',
    fontWeight: '500'
  },
  userCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  miniAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #7b5cff 0%, #00e6ff 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700'
  },
  actionBtns: {
    display: 'flex',
    gap: '8px'
  },
  editIconBtn: {
    padding: '8px',
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  },
  deleteIconBtn: {
    padding: '8px',
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  },
  priceTag: {
    fontWeight: '700',
    color: '#10b981'
  },
  loading: {
    textAlign: 'center',
    padding: '80px',
    fontSize: '16px',
    color: '#666',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px',
    fontSize: '16px',
    color: '#999',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
    animation: 'fadeIn 0.2s'
  },
  modalContent: {
    background: '#fff',
    borderRadius: '20px',
    padding: '0',
    width: '90%',
    maxWidth: '550px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
    animation: 'slideUp 0.3s'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 30px',
    borderBottom: '2px solid #f3f4f6'
  },
  modalTitle: {
    margin: 0,
    fontSize: '22px',
    fontWeight: '800',
    color: '#333'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#999',
    padding: '4px',
    borderRadius: '6px',
    transition: 'all 0.2s'
  },
  deleteModalHeader: {
    textAlign: 'center',
    padding: '30px 30px 0 30px'
  },
  deleteModalTitle: {
    margin: '16px 0 12px 0',
    fontSize: '22px',
    fontWeight: '800',
    color: '#333',
    textAlign: 'center'
  },
  deleteModalText: {
    margin: '0 0 24px 0',
    fontSize: '15px',
    color: '#666',
    textAlign: 'center',
    padding: '0 30px',
    lineHeight: '1.6'
  },
  deleteModalActions: {
    display: 'flex',
    gap: '12px',
    padding: '0 30px 30px 30px'
  },
  cancelBtnModal: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px',
    background: '#e5e7eb',
    color: '#374151',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '14px',
    transition: 'all 0.2s'
  },
  deleteBtnModal: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px',
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '14px',
    transition: 'all 0.2s'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    padding: '24px 30px 30px 30px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1
  },
  formRow: {
    display: 'flex',
    gap: '16px'
  },
  label: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  input: {
    padding: '12px 14px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.3s',
    fontWeight: '500'
  },
  error: {
    padding: '14px',
    background: '#fee2e2',
    border: '2px solid #fecaca',
    borderRadius: '10px',
    color: '#dc2626',
    fontSize: '14px',
    fontWeight: '700'
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '10px'
  },
  cancelBtn: {
    flex: 1,
    padding: '14px',
    background: '#e5e7eb',
    color: '#374151',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '14px',
    transition: 'all 0.2s'
  },
  submitBtn: {
    flex: 1,
    padding: '14px',
    background: 'linear-gradient(135deg, #7b5cff 0%, #00e6ff 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '14px',
    transition: 'all 0.2s'
  }
};

export default SuperAdminDashboard;
