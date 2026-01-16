import { useState, useEffect } from 'react';
import { Users, Monitor, Gamepad2, LogOut, Settings, TrendingUp, UserCog } from 'lucide-react';
import api from '../services/api';
import Toast from '../components/Toast';
import '../styles/superadmin.module.css';

function SuperAdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('users');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  // États pour les données
  const [users, setUsers] = useState([]);
  const [machines, setMachines] = useState([]);
  const [games, setGames] = useState([]);

  // États pour les modals
  const [showUserModal, setShowUserModal] = useState(false);
  const [showMachineModal, setShowMachineModal] = useState(false);
  const [showGameModal, setShowGameModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Charger les données selon l'onglet actif
  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'machines') fetchMachines();
    else if (activeTab === 'games') fetchGames();
  }, [activeTab]);

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

  const handleCreateUser = () => {
    setEditingItem(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setEditingItem(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    try {
      await api.delete(`/super-admin/users/${userId}`);
      showToast('Utilisateur supprimé avec succès', 'success');
      fetchUsers();
    } catch (error) {
      showToast(error.response?.data?.message || 'Erreur lors de la suppression', 'error');
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

  const handleCreateMachine = () => {
    setEditingItem(null);
    setShowMachineModal(true);
  };

  const handleEditMachine = (machine) => {
    setEditingItem(machine);
    setShowMachineModal(true);
  };

  const handleDeleteMachine = async (machineId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette machine ?')) return;

    try {
      await api.delete(`/super-admin/machines/${machineId}`);
      showToast('Machine supprimée avec succès', 'success');
      fetchMachines();
    } catch (error) {
      showToast(error.response?.data?.message || 'Erreur lors de la suppression', 'error');
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

  const handleCreateGame = () => {
    setEditingItem(null);
    setShowGameModal(true);
  };

  const handleEditGame = (game) => {
    setEditingItem(game);
    setShowGameModal(true);
  };

  const handleDeleteGame = async (gameId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce jeu ?')) return;

    try {
      await api.delete(`/super-admin/games/${gameId}`);
      showToast('Jeu supprimé avec succès', 'success');
      fetchGames();
    } catch (error) {
      showToast(error.response?.data?.message || 'Erreur lors de la suppression', 'error');
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logoContainer}>
            <UserCog size={32} color="#7b5cff" />
          </div>
          <div>
            <h1 style={styles.title}>Super Admin Panel</h1>
            <p style={styles.subtitle}>Gestion globale du système</p>
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

      {/* Navigation Tabs */}
      <nav style={styles.tabsContainer}>
        <button
          style={activeTab === 'users' ? { ...styles.tab, ...styles.tabActive } : styles.tab}
          onClick={() => setActiveTab('users')}
        >
          <Users size={20} />
          <span>Utilisateurs</span>
        </button>
        <button
          style={activeTab === 'machines' ? { ...styles.tab, ...styles.tabActive } : styles.tab}
          onClick={() => setActiveTab('machines')}
        >
          <Monitor size={20} />
          <span>Machines</span>
        </button>
        <button
          style={activeTab === 'games' ? { ...styles.tab, ...styles.tabActive } : styles.tab}
          onClick={() => setActiveTab('games')}
        >
          <Gamepad2 size={20} />
          <span>Jeux</span>
        </button>
      </nav>

      {/* Content Area */}
      <main style={styles.content}>
        {activeTab === 'users' && (
          <UsersTab
            users={users}
            loading={loading}
            onCreateUser={handleCreateUser}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
          />
        )}
        {activeTab === 'machines' && (
          <MachinesTab
            machines={machines}
            loading={loading}
            onCreateMachine={handleCreateMachine}
            onEditMachine={handleEditMachine}
            onDeleteMachine={handleDeleteMachine}
          />
        )}
        {activeTab === 'games' && (
          <GamesTab
            games={games}
            loading={loading}
            onCreateGame={handleCreateGame}
            onEditGame={handleEditGame}
            onDeleteGame={handleDeleteGame}
          />
        )}
      </main>

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

      {/* Toast Notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

// ========== USERS TAB ==========
function UsersTab({ users, loading, onCreateUser, onEditUser, onDeleteUser }) {
  return (
    <div style={styles.tabContent}>
      <div style={styles.tabHeader}>
        <div>
          <h2 style={styles.tabTitle}>Gestion des Utilisateurs</h2>
          <p style={styles.tabSubtitle}>Créer et gérer les comptes Admin et Agent</p>
        </div>
        <button style={styles.createBtn} onClick={onCreateUser}>
          <Users size={18} />
          <span>Nouvel Utilisateur</span>
        </button>
      </div>

      {loading ? (
        <div style={styles.loading}>Chargement...</div>
      ) : users.length === 0 ? (
        <div style={styles.emptyState}>Aucun utilisateur trouvé</div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Nom</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Rôle</th>
                <th style={styles.th}>Date de création</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={styles.tr}>
                  <td style={styles.td}>{user.id}</td>
                  <td style={styles.td}>{user.name}</td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>
                    <span style={getRoleBadgeStyle(user.role)}>{getRoleLabel(user.role)}</span>
                  </td>
                  <td style={styles.td}>{new Date(user.created_at).toLocaleDateString('fr-FR')}</td>
                  <td style={styles.td}>
                    <div style={styles.actionBtns}>
                      <button style={styles.editBtn} onClick={() => onEditUser(user)}>
                        Modifier
                      </button>
                      <button style={styles.deleteBtn} onClick={() => onDeleteUser(user.id)}>
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ========== MACHINES TAB ==========
function MachinesTab({ machines, loading, onCreateMachine, onEditMachine, onDeleteMachine }) {
  return (
    <div style={styles.tabContent}>
      <div style={styles.tabHeader}>
        <div>
          <h2 style={styles.tabTitle}>Gestion des Machines</h2>
          <p style={styles.tabSubtitle}>Configurer les stations de jeu disponibles</p>
        </div>
        <button style={styles.createBtn} onClick={onCreateMachine}>
          <Monitor size={18} />
          <span>Nouvelle Machine</span>
        </button>
      </div>

      {loading ? (
        <div style={styles.loading}>Chargement...</div>
      ) : machines.length === 0 ? (
        <div style={styles.emptyState}>Aucune machine trouvée</div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Numéro</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Statut</th>
                <th style={styles.th}>Date de création</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {machines.map((machine) => (
                <tr key={machine.id} style={styles.tr}>
                  <td style={styles.td}>{machine.id}</td>
                  <td style={styles.td}>
                    <strong>Machine {machine.machine_number}</strong>
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
                      <button style={styles.editBtn} onClick={() => onEditMachine(machine)}>
                        Modifier
                      </button>
                      <button style={styles.deleteBtn} onClick={() => onDeleteMachine(machine.id)}>
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ========== GAMES TAB ==========
function GamesTab({ games, loading, onCreateGame, onEditGame, onDeleteGame }) {
  return (
    <div style={styles.tabContent}>
      <div style={styles.tabHeader}>
        <div>
          <h2 style={styles.tabTitle}>Gestion des Jeux</h2>
          <p style={styles.tabSubtitle}>Catalogue des jeux disponibles avec tarification</p>
        </div>
        <button style={styles.createBtn} onClick={onCreateGame}>
          <Gamepad2 size={18} />
          <span>Nouveau Jeu</span>
        </button>
      </div>

      {loading ? (
        <div style={styles.loading}>Chargement...</div>
      ) : games.length === 0 ? (
        <div style={styles.emptyState}>Aucun jeu trouvé</div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
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
                  <td style={styles.td}>{game.id}</td>
                  <td style={styles.td}>
                    <strong>{game.name}</strong>
                  </td>
                  <td style={styles.td}>{game.price_1h} DH</td>
                  <td style={styles.td}>{game.price_2h} DH</td>
                  <td style={styles.td}>{game.price_3h} DH</td>
                  <td style={styles.td}>{game.price_night} DH</td>
                  <td style={styles.td}>
                    <div style={styles.actionBtns}>
                      <button style={styles.editBtn} onClick={() => onEditGame(game)}>
                        Modifier
                      </button>
                      <button style={styles.deleteBtn} onClick={() => onDeleteGame(game.id)}>
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
        <h3 style={styles.modalTitle}>{user ? 'Modifier Utilisateur' : 'Nouvel Utilisateur'}</h3>

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
        <h3 style={styles.modalTitle}>{machine ? 'Modifier Machine' : 'Nouvelle Machine'}</h3>

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
        <h3 style={styles.modalTitle}>{game ? 'Modifier Jeu' : 'Nouveau Jeu'}</h3>

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
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  };

  if (role === 'super_admin') {
    return { ...baseStyle, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff' };
  } else if (role === 'admin') {
    return { ...baseStyle, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: '#fff' };
  } else {
    return { ...baseStyle, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: '#fff' };
  }
}

function getStatusBadgeStyle(status) {
  const baseStyle = {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
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
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.95)',
    padding: '20px 30px',
    borderRadius: '16px',
    marginBottom: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  logoContainer: {
    width: '60px',
    height: '60px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: '#666'
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
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '700'
  },
  userName: {
    fontWeight: '600',
    fontSize: '14px',
    color: '#333'
  },
  userRole: {
    fontSize: '12px',
    color: '#666'
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'transform 0.2s'
  },
  tabsContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px'
  },
  tab: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '15px',
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  tabActive: {
    background: '#fff',
    color: '#667eea',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
  },
  content: {
    background: '#fff',
    borderRadius: '16px',
    padding: '30px',
    minHeight: '500px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
  },
  tabContent: {
    width: '100%'
  },
  tabHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  },
  tabTitle: {
    margin: 0,
    fontSize: '22px',
    fontWeight: '800',
    color: '#333'
  },
  tabSubtitle: {
    margin: '5px 0 0 0',
    fontSize: '14px',
    color: '#666'
  },
  createBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'transform 0.2s'
  },
  tableContainer: {
    overflowX: 'auto',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    background: '#f9fafb',
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    borderBottom: '2px solid #e5e7eb'
  },
  tr: {
    borderBottom: '1px solid #e5e7eb',
    transition: 'background 0.2s'
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    color: '#374151'
  },
  actionBtns: {
    display: 'flex',
    gap: '8px'
  },
  editBtn: {
    padding: '6px 12px',
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'background 0.2s'
  },
  deleteBtn: {
    padding: '6px 12px',
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'background 0.2s'
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    fontSize: '16px',
    color: '#666'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px',
    fontSize: '16px',
    color: '#999'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    background: '#fff',
    borderRadius: '16px',
    padding: '30px',
    width: '90%',
    maxWidth: '500px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  modalTitle: {
    margin: '0 0 20px 0',
    fontSize: '20px',
    fontWeight: '800',
    color: '#333'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1
  },
  formRow: {
    display: 'flex',
    gap: '16px'
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151'
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border 0.2s'
  },
  error: {
    padding: '12px',
    background: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    color: '#dc2626',
    fontSize: '14px',
    fontWeight: '600'
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '10px'
  },
  cancelBtn: {
    flex: 1,
    padding: '12px',
    background: '#e5e7eb',
    color: '#374151',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  },
  submitBtn: {
    flex: 1,
    padding: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  }
};

export default SuperAdminDashboard;
