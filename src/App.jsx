import { useState, useEffect, lazy, Suspense } from 'react';
import './App.css';
import api from './services/api';
import { AlertCircle, Crown, LogOut } from 'lucide-react';

// Lazy load pages for better performance
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard'));

// Loading component
const LoadingScreen = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff'
  }}>
    <div style={{
      width: '50px',
      height: '50px',
      border: '4px solid rgba(255,255,255,0.3)',
      borderTop: '4px solid #fff',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
    <h2 style={{ marginTop: '20px' }}>Chargement...</h2>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Shown to admins/agents when their org subscription is fully expired (post grace)
const SubscriptionBlockedScreen = ({ user, onLogout }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
    minHeight: '100vh', background: '#0f172a', color: '#fff', padding: '40px', textAlign: 'center'
  }}>
    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
      <AlertCircle size={40} color="#ef4444" />
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
      <Crown size={20} color="#6366f1" />
      <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800 }}>Abonnement expiré</h1>
    </div>
    <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '440px', lineHeight: 1.7, margin: '0 0 32px' }}>
      L'abonnement de votre organisation a expiré et la période de grâce est terminée.
      Contactez votre administrateur système pour renouveler l'accès.
    </p>
    <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>
      Connecté en tant que <strong style={{ color: '#f1f5f9' }}>{user?.name}</strong>
    </div>
    <button
      onClick={onLogout}
      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px', background: '#334155', color: '#f1f5f9', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
    >
      <LogOut size={16} /> Se déconnecter
    </button>
  </div>
);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionBlocked, setSubscriptionBlocked] = useState(false);

  useEffect(() => {
    // Vérifier si déjà connecté
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const parsedUser = JSON.parse(savedUser);
        queueMicrotask(() => setUser(parsedUser));
      } catch {
        // Données corrompues - nettoyer et forcer la reconnexion
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    queueMicrotask(() => setLoading(false));
  }, []);

  const checkSubscription = async (userData) => {
    if (userData.role === 'super_admin' || !userData.organization_id) return;
    try {
      const res = await api.get('/subscription/status');
      const { is_active, is_expired, in_grace_period } = res.data;
      if (is_expired && !in_grace_period && !is_active) {
        setSubscriptionBlocked(true);
      }
    } catch {
      // If endpoint doesn't exist yet, don't block access
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    checkSubscription(userData);
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch {
      // Ignore logout API errors and continue local cleanup.
      void 0;
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setSubscriptionBlocked(false);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      {/* Si pas connecté → Login */}
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : subscriptionBlocked ? (
        /* Abonnement expiré → écran de blocage */
        <SubscriptionBlockedScreen user={user} onLogout={handleLogout} />
      ) : user.role === 'super_admin' ? (
        /* Si Super Admin → Super Admin Panel */
        <SuperAdminDashboard user={user} onLogout={handleLogout} />
      ) : user.role === 'admin' ? (
        /* Si Admin → Dashboard Admin */
        <AdminDashboard user={user} onLogout={handleLogout} />
      ) : (
        /* Si Agent → Dashboard Caisse */
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </Suspense>
  );
}

export default App;
