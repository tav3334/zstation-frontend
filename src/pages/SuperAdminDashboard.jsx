import { useState, useEffect } from 'react';
import {
  Users, Monitor, Gamepad2, LogOut, Search, Plus,
  Edit2, Trash2, X, AlertCircle, Activity,
  Download, RefreshCw, LayoutDashboard,
  ChevronLeft, ChevronRight, Zap, Wifi, WifiOff, Clock
} from 'lucide-react';
import api from '../services/api';
import Toast from '../components/Toast';
import '../styles/superadmin.module.css';

function SuperAdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Horloge temps réel
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  // Charger TOUTES les données au démarrage pour les statistiques
  useEffect(() => {
    loadAllData();
  }, []);

  // Calculer les statistiques
  useEffect(() => {
    setStats({
      totalUsers: users.length,
      totalMachines: machines.length,
      totalGames: games.length,
      activeUsers: users.filter(u => u.role === 'agent' || u.role === 'admin').length
    });
  }, [users, machines, games]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [usersRes, machinesRes, gamesRes] = await Promise.all([
        api.get('/super-admin/users'),
        api.get('/super-admin/machines'),
        api.get('/super-admin/games')
      ]);
      setUsers(usersRes.data.users || usersRes.data || []);
      setMachines(machinesRes.data.machines || machinesRes.data || []);
      setGames(gamesRes.data.games || gamesRes.data || []);
    } catch (error) {
      showToast('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
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

  // Export CSV
  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      showToast('Aucune donnée à exporter', 'error');
      return;
    }
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => Object.values(item).map(v => `"${v || ''}"`).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showToast(`${filename} exporté avec succès`, 'success');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Utilisateurs', icon: Users, count: stats.totalUsers },
    { id: 'machines', label: 'Machines', icon: Monitor, count: stats.totalMachines },
    { id: 'games', label: 'Jeux', icon: Gamepad2, count: stats.totalGames },
  ];

  return (
    <div style={styles.appContainer}>
      {/* Sidebar */}
      <aside style={{
        ...styles.sidebar,
        width: sidebarCollapsed ? '70px' : '260px'
      }}>
        {/* Logo */}
        <div style={styles.sidebarHeader}>
          <div style={styles.logoBox}>
            <Zap size={24} color="#fff" />
          </div>
          {!sidebarCollapsed && (
            <div style={styles.logoText}>
              <span style={styles.logoTitle}>Z-STATION</span>
              <span style={styles.logoSubtitle}>Super Admin</span>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <nav style={styles.sidebarNav}>
          {menuItems.map(item => (
            <button
              key={item.id}
              style={{
                ...styles.menuItem,
                ...(activeTab === item.id && styles.menuItemActive)
              }}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon size={20} />
              {!sidebarCollapsed && (
                <>
                  <span style={styles.menuLabel}>{item.label}</span>
                  {item.count !== undefined && (
                    <span style={styles.menuBadge}>{item.count}</span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div style={styles.sidebarFooter}>
          <button
            style={styles.collapseBtn}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div style={{...styles.mainArea, marginLeft: sidebarCollapsed ? '70px' : '260px'}}>
        {/* Top Bar */}
        <header style={styles.topBar}>
          <div style={styles.topBarLeft}>
            <h1 style={styles.pageTitle}>
              {activeTab === 'dashboard' ? 'Dashboard' :
               activeTab === 'users' ? 'Gestion Utilisateurs' :
               activeTab === 'machines' ? 'Gestion Machines' : 'Gestion Jeux'}
            </h1>
          </div>
          <div style={styles.topBarRight}>
            <div style={styles.clockDisplay}>
              <Clock size={16} />
              <span>{currentTime.toLocaleTimeString('fr-FR')}</span>
            </div>
            <div style={styles.userPill}>
              <div style={styles.userAvatarSmall}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <span style={styles.userNameSmall}>{user.name}</span>
            </div>
            <button style={styles.logoutBtnSmall} onClick={onLogout}>
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main style={styles.content}>
          {/* Dashboard View */}
          {activeTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              machines={machines}
              users={users}
              games={games}
              onNavigate={setActiveTab}
            />
          )}

          {/* Data Tables with Toolbar */}
          {(activeTab === 'users' || activeTab === 'machines' || activeTab === 'games') && (
            <>
              <div style={styles.toolbar}>
                <div style={styles.searchContainer}>
                  <Search size={18} style={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder={`Rechercher...`}
                    style={styles.searchInput}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div style={styles.toolbarActions}>
                  <button
                    style={styles.exportBtn}
                    onClick={() => exportToCSV(
                      activeTab === 'users' ? users : activeTab === 'machines' ? machines : games,
                      activeTab
                    )}
                  >
                    <Download size={16} />
                    <span>Export CSV</span>
                  </button>
                  <button style={styles.refreshBtn} onClick={loadAllData} disabled={loading}>
                    <RefreshCw size={16} className={loading ? 'spin' : ''} />
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
                    <Plus size={16} />
                    <span>Ajouter</span>
                  </button>
                </div>
              </div>

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
            </>
          )}
        </main>
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

// ========== DASHBOARD VIEW ==========
function DashboardView({ stats, machines, users, games, onNavigate }) {
  const availableMachines = machines.filter(m => m.status === 'available').length;
  const occupiedMachines = machines.filter(m => m.status !== 'available').length;

  return (
    <div style={styles.dashboardGrid}>
      {/* Stats Row */}
      <div style={styles.statsRow}>
        <MiniStatCard
          icon={<Users size={20} />}
          label="Utilisateurs"
          value={stats.totalUsers}
          color="#6366f1"
          onClick={() => onNavigate('users')}
        />
        <MiniStatCard
          icon={<Monitor size={20} />}
          label="Machines"
          value={stats.totalMachines}
          color="#8b5cf6"
          onClick={() => onNavigate('machines')}
        />
        <MiniStatCard
          icon={<Gamepad2 size={20} />}
          label="Jeux"
          value={stats.totalGames}
          color="#10b981"
          onClick={() => onNavigate('games')}
        />
        <MiniStatCard
          icon={<Activity size={20} />}
          label="Actifs"
          value={stats.activeUsers}
          color="#f59e0b"
        />
      </div>

      {/* Machines Map */}
      <div style={styles.dashboardCard}>
        <div style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>
            <Monitor size={18} /> Carte des Machines
          </h3>
          <div style={styles.machineStats}>
            <span style={styles.availableTag}>
              <Wifi size={14} /> {availableMachines} Libres
            </span>
            <span style={styles.occupiedTag}>
              <WifiOff size={14} /> {occupiedMachines} Occupées
            </span>
          </div>
        </div>
        <div style={styles.machinesGrid}>
          {machines.length === 0 ? (
            <div style={styles.emptyMachines}>
              <Monitor size={40} color="#64748b" />
              <p>Aucune machine configurée</p>
            </div>
          ) : (
            machines.map(machine => (
              <MachineCard key={machine.id} machine={machine} />
            ))
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div style={styles.bottomRow}>
        {/* Recent Users */}
        <div style={styles.dashboardCardSmall}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>
              <Users size={18} /> Derniers Utilisateurs
            </h3>
          </div>
          <div style={styles.recentList}>
            {users.slice(0, 5).map(u => (
              <div key={u.id} style={styles.recentItem}>
                <div style={styles.recentAvatar}>{u.name?.charAt(0)}</div>
                <div style={styles.recentInfo}>
                  <span style={styles.recentName}>{u.name}</span>
                  <span style={styles.recentMeta}>{u.email}</span>
                </div>
                <span style={getRoleBadgeStyle(u.role)}>{getRoleLabel(u.role)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Games List */}
        <div style={styles.dashboardCardSmall}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>
              <Gamepad2 size={18} /> Catalogue Jeux
            </h3>
          </div>
          <div style={styles.recentList}>
            {games.slice(0, 5).map(g => (
              <div key={g.id} style={styles.recentItem}>
                <div style={{...styles.recentAvatar, background: '#10b981'}}>
                  <Gamepad2 size={14} />
                </div>
                <div style={styles.recentInfo}>
                  <span style={styles.recentName}>{g.name}</span>
                  <span style={styles.recentMeta}>{g.price_1h} DH/h</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== MINI STAT CARD ==========
function MiniStatCard({ icon, label, value, color, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        ...styles.miniStatCard,
        borderColor: hovered ? color : '#334155',
        transform: hovered ? 'translateY(-4px)' : 'none',
        cursor: onClick ? 'pointer' : 'default'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <div style={{...styles.miniStatIcon, background: color}}>{icon}</div>
      <div style={styles.miniStatValue}>{value}</div>
      <div style={styles.miniStatLabel}>{label}</div>
    </div>
  );
}

// ========== MACHINE CARD ==========
function MachineCard({ machine }) {
  const isAvailable = machine.status === 'available';
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        ...styles.machineCardItem,
        background: isAvailable ? '#064e3b' : '#7f1d1d',
        borderColor: isAvailable ? '#10b981' : '#ef4444',
        transform: hovered ? 'scale(1.05)' : 'scale(1)'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={styles.machineNumber}>#{machine.machine_number}</div>
      <div style={styles.machineStatus}>
        {isAvailable ? <Wifi size={16} /> : <WifiOff size={16} />}
      </div>
      <div style={styles.machineType}>{machine.type || 'Standard'}</div>
    </div>
  );
}

// ========== SKELETON LOADER ==========
function SkeletonRow({ columns = 5 }) {
  return (
    <tr style={styles.tr}>
      {Array(columns).fill(0).map((_, i) => (
        <td key={i} style={styles.td}>
          <div style={styles.skeleton}></div>
        </td>
      ))}
    </tr>
  );
}

function SkeletonTable({ rows = 5, columns = 5 }) {
  return (
    <div style={styles.tableWrapper}>
      <table style={styles.table}>
        <thead>
          <tr>
            {Array(columns).fill(0).map((_, i) => (
              <th key={i} style={styles.th}>
                <div style={{...styles.skeleton, width: '80px', height: '14px'}}></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array(rows).fill(0).map((_, i) => (
            <SkeletonRow key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ========== TABLE ROW WITH HOVER ==========
function TableRow({ children, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <tr
      style={{
        ...styles.tr,
        ...(isHovered && styles.trHover)
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

// ========== USERS TABLE ==========
function UsersTable({ users, loading, onEdit, onDelete }) {
  if (loading) {
    return <SkeletonTable rows={5} columns={5} />;
  }

  if (users.length === 0) {
    return (
      <div style={styles.emptyState}>
        <Users size={64} color="#64748b" />
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
          {users.map((user, index) => (
            <TableRow key={user.id}>
              <td style={{...styles.td, animationDelay: `${index * 0.05}s`}} className="fade-in-row">
                <div style={styles.userCell}>
                  <div style={styles.miniAvatar}>{user.name?.charAt(0).toUpperCase()}</div>
                  <strong style={{color: '#f1f5f9'}}>{user.name}</strong>
                </div>
              </td>
              <td style={styles.td}>{user.email}</td>
              <td style={styles.td}>
                <span style={getRoleBadgeStyle(user.role)}>{getRoleLabel(user.role)}</span>
              </td>
              <td style={styles.td}>{new Date(user.created_at).toLocaleDateString('fr-FR')}</td>
              <td style={styles.td}>
                <div style={styles.actionBtns}>
                  <ActionButton type="edit" onClick={() => onEdit(user)} title="Modifier" />
                  <ActionButton type="delete" onClick={() => onDelete(user)} title="Supprimer" />
                </div>
              </td>
            </TableRow>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ========== ACTION BUTTON WITH HOVER ==========
function ActionButton({ type, onClick, title }) {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyle = type === 'edit' ? styles.editIconBtn : styles.deleteIconBtn;
  const hoverStyle = type === 'edit' ? styles.editIconBtnHover : styles.deleteIconBtnHover;

  return (
    <button
      style={{
        ...baseStyle,
        ...(isHovered && hoverStyle)
      }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={title}
    >
      {type === 'edit' ? <Edit2 size={16} /> : <Trash2 size={16} />}
    </button>
  );
}

// ========== MACHINES TABLE ==========
function MachinesTable({ machines, loading, onEdit, onDelete }) {
  if (loading) {
    return <SkeletonTable rows={5} columns={5} />;
  }

  if (machines.length === 0) {
    return (
      <div style={styles.emptyState}>
        <Monitor size={64} color="#64748b" />
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
            <TableRow key={machine.id}>
              <td style={styles.td}>
                <div style={styles.userCell}>
                  <div style={{...styles.miniAvatar, background: '#8b5cf6'}}>
                    <Monitor size={16} />
                  </div>
                  <strong style={{color: '#f1f5f9'}}>Machine #{machine.machine_number}</strong>
                </div>
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
                  <ActionButton type="edit" onClick={() => onEdit(machine)} title="Modifier" />
                  <ActionButton type="delete" onClick={() => onDelete(machine)} title="Supprimer" />
                </div>
              </td>
            </TableRow>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ========== GAMES TABLE ==========
function GamesTable({ games, loading, onEdit, onDelete }) {
  if (loading) {
    return <SkeletonTable rows={5} columns={6} />;
  }

  if (games.length === 0) {
    return (
      <div style={styles.emptyState}>
        <Gamepad2 size={64} color="#64748b" />
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
            <TableRow key={game.id}>
              <td style={styles.td}>
                <div style={styles.userCell}>
                  <div style={{...styles.miniAvatar, background: '#10b981'}}>
                    <Gamepad2 size={16} />
                  </div>
                  <strong style={{color: '#f1f5f9'}}>{game.name}</strong>
                </div>
              </td>
              <td style={styles.td}><span style={styles.priceTag}>{game.price_1h} DH</span></td>
              <td style={styles.td}><span style={styles.priceTag}>{game.price_2h} DH</span></td>
              <td style={styles.td}><span style={styles.priceTag}>{game.price_3h} DH</span></td>
              <td style={styles.td}><span style={styles.priceTag}>{game.price_night} DH</span></td>
              <td style={styles.td}>
                <div style={styles.actionBtns}>
                  <ActionButton type="edit" onClick={() => onEdit(game)} title="Modifier" />
                  <ActionButton type="delete" onClick={() => onDelete(game)} title="Supprimer" />
                </div>
              </td>
            </TableRow>
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

        <form onSubmit={handleSubmit} style={styles.formCompact}>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.labelSmall}>Nom</label>
              <input
                type="text"
                style={styles.inputSmall}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Nom complet"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.labelSmall}>Rôle</label>
              <select
                style={styles.inputSmall}
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              >
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.labelSmall}>Email</label>
            <input
              type="email"
              style={styles.inputSmall}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="email@exemple.com"
            />
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.labelSmall}>{user ? 'Nouveau MDP' : 'Mot de passe'}</label>
              <input
                type="password"
                style={styles.inputSmall}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!user}
                placeholder="••••••••"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.labelSmall}>Confirmer</label>
              <input
                type="password"
                style={styles.inputSmall}
                value={formData.password_confirmation}
                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                required={!user || formData.password}
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <div style={styles.errorSmall}>{error}</div>}

          <div style={styles.modalActionsCompact}>
            <button type="button" style={styles.cancelBtnSmall} onClick={onClose}>Annuler</button>
            <button type="submit" style={styles.submitBtnSmall} disabled={loading}>
              {loading ? '...' : user ? 'Modifier' : 'Créer'}
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
    return { ...baseStyle, background: '#7b5cff', color: '#fff' };
  } else if (role === 'admin') {
    return { ...baseStyle, background: '#f59e0b', color: '#fff' };
  } else {
    return { ...baseStyle, background: '#3b82f6', color: '#fff' };
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
  // App Layout
  appContainer: {
    display: 'flex',
    minHeight: '100vh',
    background: '#0f172a',
    width: '100%'
  },

  // Sidebar
  sidebar: {
    background: '#1e293b',
    borderRight: '1px solid #334155',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.3s ease',
    position: 'fixed',
    height: '100vh',
    zIndex: 100
  },
  sidebarHeader: {
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid #334155'
  },
  logoBox: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  logoText: {
    display: 'flex',
    flexDirection: 'column'
  },
  logoTitle: {
    color: '#f1f5f9',
    fontWeight: '800',
    fontSize: '16px'
  },
  logoSubtitle: {
    color: '#64748b',
    fontSize: '11px',
    fontWeight: '500'
  },
  sidebarNav: {
    flex: 1,
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    borderRadius: '10px',
    border: 'none',
    background: 'transparent',
    color: '#94a3b8',
    cursor: 'pointer',
    transition: 'all 0.2s',
    width: '100%',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '500'
  },
  menuItemActive: {
    background: '#6366f1',
    color: '#fff'
  },
  menuLabel: {
    flex: 1
  },
  menuBadge: {
    background: '#334155',
    color: '#94a3b8',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '600'
  },
  sidebarFooter: {
    padding: '12px',
    borderTop: '1px solid #334155'
  },
  collapseBtn: {
    width: '100%',
    padding: '10px',
    background: '#334155',
    border: 'none',
    borderRadius: '8px',
    color: '#94a3b8',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  },

  // Main Area
  mainArea: {
    flex: 1,
    marginLeft: '260px',
    transition: 'margin-left 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh'
  },

  // Top Bar
  topBar: {
    background: '#1e293b',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #334155',
    position: 'sticky',
    top: 0,
    zIndex: 50
  },
  topBarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  pageTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
    color: '#f1f5f9'
  },
  topBarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  clockDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '500'
  },
  userPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#334155',
    padding: '6px 12px 6px 6px',
    borderRadius: '20px'
  },
  userAvatarSmall: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: '#6366f1',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700'
  },
  userNameSmall: {
    color: '#f1f5f9',
    fontSize: '13px',
    fontWeight: '500'
  },
  logoutBtnSmall: {
    padding: '8px',
    background: '#ef4444',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  },

  // Content
  content: {
    flex: 1,
    padding: '24px',
    overflowY: 'auto'
  },

  // Dashboard Grid
  dashboardGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px'
  },
  miniStatCard: {
    background: '#1e293b',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #334155',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease'
  },
  miniStatIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff'
  },
  miniStatValue: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#f1f5f9'
  },
  miniStatLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '500'
  },

  // Dashboard Cards
  dashboardCard: {
    background: '#1e293b',
    borderRadius: '16px',
    border: '1px solid #334155',
    overflow: 'hidden'
  },
  dashboardCardSmall: {
    background: '#1e293b',
    borderRadius: '16px',
    border: '1px solid #334155',
    overflow: 'hidden',
    flex: 1
  },
  cardHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #334155',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '600',
    color: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  machineStats: {
    display: 'flex',
    gap: '12px'
  },
  availableTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: '#10b981',
    fontSize: '12px',
    fontWeight: '600'
  },
  occupiedTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: '#ef4444',
    fontSize: '12px',
    fontWeight: '600'
  },

  // Machines Grid
  machinesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '12px',
    padding: '20px'
  },
  emptyMachines: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '40px',
    color: '#64748b'
  },
  machineCardItem: {
    padding: '16px',
    borderRadius: '12px',
    border: '2px solid',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    cursor: 'default'
  },
  machineNumber: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#fff'
  },
  machineStatus: {
    color: '#fff'
  },
  machineType: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500'
  },

  // Bottom Row
  bottomRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px'
  },
  recentList: {
    padding: '12px'
  },
  recentItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '8px',
    transition: 'background 0.2s'
  },
  recentAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: '#6366f1',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700'
  },
  recentInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  recentName: {
    color: '#f1f5f9',
    fontSize: '13px',
    fontWeight: '600'
  },
  recentMeta: {
    color: '#64748b',
    fontSize: '11px'
  },

  // Export Button
  exportBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 14px',
    background: '#334155',
    color: '#f1f5f9',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
    transition: 'all 0.2s'
  },

  // Legacy styles below
  container: {
    minHeight: '100vh',
    background: '#0f172a',
    padding: '0',
    margin: '0',
    width: '100%'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#1e293b',
    padding: '20px 30px',
    borderRadius: '0',
    marginBottom: '0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    borderBottom: '1px solid #334155'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  logoContainer: {
    width: '56px',
    height: '56px',
    background: '#6366f1',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
  },
  title: {
    margin: 0,
    fontSize: '26px',
    fontWeight: '800',
    color: '#f1f5f9'
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '13px',
    color: '#94a3b8',
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
    background: '#6366f1',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '800',
    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
  },
  userName: {
    fontWeight: '700',
    fontSize: '14px',
    color: '#f1f5f9'
  },
  userRole: {
    fontSize: '12px',
    color: '#94a3b8',
    fontWeight: '500'
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '11px 22px',
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '14px',
    transition: 'all 0.3s',
    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    padding: '20px 30px',
    background: '#0f172a',
    width: '100%'
  },
  statCard: {
    background: '#1e293b',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    transition: 'all 0.3s',
    border: '1px solid #334155'
  },
  statCardActive: {
    transform: 'translateY(-4px)',
    boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
    background: '#1e293b'
  },
  statCardHover: {
    transform: 'translateY(-6px)',
    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
    borderColor: '#6366f1'
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
    color: '#f1f5f9',
    lineHeight: 1
  },
  statTitle: {
    fontSize: '13px',
    color: '#94a3b8',
    marginTop: '6px',
    fontWeight: '600'
  },
  mainContent: {
    background: '#0f172a',
    borderRadius: '0',
    padding: '30px',
    minHeight: 'calc(100vh - 240px)',
    width: '100%'
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
    color: '#64748b'
  },
  searchInput: {
    width: '100%',
    padding: '12px 14px 12px 44px',
    border: '2px solid #334155',
    borderRadius: '12px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.3s',
    fontWeight: '500',
    background: '#1e293b',
    color: '#f1f5f9'
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
    background: '#1e293b',
    color: '#6366f1',
    border: '2px solid #6366f1',
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
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '14px',
    transition: 'all 0.3s',
    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
  },
  tableWrapper: {
    overflowX: 'auto',
    borderRadius: '12px',
    border: '1px solid #334155'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#1e293b'
  },
  th: {
    background: '#0f172a',
    padding: '16px 20px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    borderBottom: '2px solid #334155',
    letterSpacing: '0.5px'
  },
  tr: {
    borderBottom: '1px solid #334155',
    transition: 'all 0.3s ease'
  },
  trHover: {
    background: '#334155',
    transform: 'scale(1.01)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
  },
  td: {
    padding: '18px 20px',
    fontSize: '14px',
    color: '#cbd5e1',
    fontWeight: '500',
    transition: 'all 0.3s ease'
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
    background: '#6366f1',
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
    padding: '10px',
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease'
  },
  editIconBtnHover: {
    background: '#2563eb',
    transform: 'scale(1.15) rotate(5deg)',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.5)'
  },
  deleteIconBtn: {
    padding: '10px',
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease'
  },
  deleteIconBtnHover: {
    background: '#dc2626',
    transform: 'scale(1.15) rotate(-5deg)',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.5)'
  },
  priceTag: {
    fontWeight: '700',
    color: '#10b981'
  },
  loading: {
    textAlign: 'center',
    padding: '80px',
    fontSize: '16px',
    color: '#94a3b8',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px',
    fontSize: '16px',
    color: '#64748b',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
  },
  skeleton: {
    background: 'linear-gradient(90deg, #334155 25%, #475569 50%, #334155 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '6px',
    height: '20px',
    width: '100%'
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
    background: '#1e293b',
    borderRadius: '16px',
    padding: '0',
    width: '90%',
    maxWidth: '420px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
    animation: 'slideUp 0.3s',
    border: '1px solid #334155'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #334155'
  },
  modalTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '700',
    color: '#f1f5f9'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
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
    color: '#f1f5f9',
    textAlign: 'center'
  },
  deleteModalText: {
    margin: '0 0 24px 0',
    fontSize: '15px',
    color: '#94a3b8',
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
    background: '#334155',
    color: '#f1f5f9',
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
  formCompact: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '16px 20px 20px 20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1
  },
  formRow: {
    display: 'flex',
    gap: '12px'
  },
  label: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  labelSmall: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.3px'
  },
  input: {
    padding: '12px 14px',
    border: '2px solid #334155',
    borderRadius: '10px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.3s',
    fontWeight: '500',
    background: '#0f172a',
    color: '#f1f5f9'
  },
  inputSmall: {
    padding: '10px 12px',
    border: '1px solid #334155',
    borderRadius: '8px',
    fontSize: '13px',
    outline: 'none',
    transition: 'all 0.3s',
    fontWeight: '500',
    background: '#0f172a',
    color: '#f1f5f9'
  },
  error: {
    padding: '14px',
    background: '#450a0a',
    border: '2px solid #7f1d1d',
    borderRadius: '10px',
    color: '#fca5a5',
    fontSize: '14px',
    fontWeight: '700'
  },
  errorSmall: {
    padding: '8px 12px',
    background: '#450a0a',
    border: '1px solid #7f1d1d',
    borderRadius: '6px',
    color: '#fca5a5',
    fontSize: '12px',
    fontWeight: '600'
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '10px'
  },
  cancelBtn: {
    flex: 1,
    padding: '14px',
    background: '#334155',
    color: '#f1f5f9',
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
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '14px',
    transition: 'all 0.2s'
  },
  modalActionsCompact: {
    display: 'flex',
    gap: '10px',
    marginTop: '8px'
  },
  cancelBtnSmall: {
    flex: 1,
    padding: '10px',
    background: '#334155',
    color: '#f1f5f9',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
    transition: 'all 0.2s'
  },
  submitBtnSmall: {
    flex: 1,
    padding: '10px',
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
    transition: 'all 0.2s'
  }
};

export default SuperAdminDashboard;
