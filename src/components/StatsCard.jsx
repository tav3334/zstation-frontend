import { useEffect, useState } from "react";
import {
  DollarSign,
  ShoppingBag,
  Activity,
  Package,
  Wallet,
  ArrowDownLeft,
  RefreshCw,
  Clock,
  Monitor,
  Gamepad2,
  TrendingUp,
  Calendar
} from "lucide-react";
import api from "../services/api";

function StatsCard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const res = await api.get("/payments/today");
      setStats(res.data);
      setLoading(false);
    } catch {
      setLoading(false);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(() => loadStats(false), 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <RefreshCw size={32} color="#6366f1" className="spin" />
        <span style={styles.loadingText}>Chargement des statistiques...</span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={styles.errorContainer}>
        <span style={styles.errorText}>Erreur de chargement des données</span>
        <button onClick={() => loadStats(true)} style={styles.retryBtn}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header with Date */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Calendar size={20} color="#10b981" />
          <span style={styles.dateText}>{stats.date}</span>
        </div>
        <button
          onClick={() => loadStats(true)}
          style={styles.refreshBtn}
          disabled={refreshing}
        >
          <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
          {refreshing ? 'Actualisation...' : 'Actualiser'}
        </button>
      </div>

      {/* Main Stats Grid */}
      <div style={styles.statsGrid}>
        <StatCard
          icon={<DollarSign size={22} />}
          label="Recettes Sessions"
          value={stats.total_revenue}
          color="#10b981"
          bgColor="rgba(16, 185, 129, 0.1)"
        />
        <StatCard
          icon={<ShoppingBag size={22} />}
          label="Recettes Produits"
          value={stats.product_revenue}
          color="#8b5cf6"
          bgColor="rgba(139, 92, 246, 0.1)"
        />
        <StatCard
          icon={<Activity size={22} />}
          label="Sessions"
          value={stats.count}
          color="#3b82f6"
          bgColor="rgba(59, 130, 246, 0.1)"
          isNumber
        />
        <StatCard
          icon={<Package size={22} />}
          label="Ventes Produits"
          value={stats.product_sales_count}
          color="#f59e0b"
          bgColor="rgba(245, 158, 11, 0.1)"
          isNumber
        />
        <StatCard
          icon={<Wallet size={22} />}
          label="Cash reçu"
          value={stats.total_cash_received}
          color="#06b6d4"
          bgColor="rgba(6, 182, 212, 0.1)"
        />
        <StatCard
          icon={<ArrowDownLeft size={22} />}
          label="Monnaie rendue"
          value={stats.total_change_given}
          color="#ef4444"
          bgColor="rgba(239, 68, 68, 0.1)"
        />
      </div>

      {/* Total Revenue Highlight */}
      <div style={styles.totalRevenueCard}>
        <div style={styles.totalRevenueHeader}>
          <TrendingUp size={24} color="#10b981" />
          <span style={styles.totalRevenueLabel}>Recettes Totales du Jour</span>
        </div>
        <div style={styles.totalRevenueValue}>{stats.total_combined_revenue}</div>
      </div>

      {/* Recent Payments */}
      {stats.payments && stats.payments.length > 0 && (
        <div style={styles.paymentsSection}>
          <div style={styles.paymentsSectionHeader}>
            <Clock size={18} color="#94a3b8" />
            <span style={styles.paymentsSectionTitle}>Derniers paiements</span>
          </div>
          <div style={styles.paymentsList}>
            {stats.payments.map((payment) => (
              <PaymentItem key={payment.id} payment={payment} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, label, value, color, bgColor, isNumber = false }) {
  return (
    <div style={styles.statCard}>
      <div style={{...styles.statIconBox, background: bgColor}}>
        <span style={{color}}>{icon}</span>
      </div>
      <div style={styles.statInfo}>
        <span style={styles.statLabel}>{label}</span>
        <span style={{...styles.statValue, color}}>
          {isNumber ? value : value}
        </span>
      </div>
    </div>
  );
}

// Payment Item Component
function PaymentItem({ payment }) {
  return (
    <div style={styles.paymentItem}>
      <div style={styles.paymentTime}>
        <Clock size={14} color="#64748b" />
        <span>{payment.time}</span>
      </div>
      <div style={styles.paymentDetails}>
        <div style={styles.paymentMain}>
          <Monitor size={14} color="#6366f1" />
          <span style={styles.paymentMachine}>{payment.machine}</span>
          <span style={styles.paymentSeparator}>•</span>
          <Gamepad2 size={14} color="#10b981" />
          <span style={styles.paymentGame}>{payment.game}</span>
        </div>
        <div style={styles.paymentMeta}>
          <span>Donné: <strong>{payment.given}</strong></span>
          <span style={styles.paymentSeparator}>|</span>
          <span>Monnaie: <strong>{payment.change}</strong></span>
        </div>
      </div>
      <div style={styles.paymentAmount}>
        {payment.amount}
      </div>
    </div>
  );
}

// Styles
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },

  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '60px 24px',
    color: '#94a3b8'
  },
  loadingText: {
    fontSize: '14px',
    color: '#64748b'
  },

  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '60px 24px'
  },
  errorText: {
    fontSize: '14px',
    color: '#ef4444'
  },
  retryBtn: {
    padding: '10px 20px',
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  dateText: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#f1f5f9'
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: '#334155',
    color: '#94a3b8',
    border: '1px solid #475569',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px'
  },

  statCard: {
    background: '#1e293b',
    borderRadius: '12px',
    padding: '18px',
    border: '1px solid #334155',
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  statIconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  statLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '500'
  },
  statValue: {
    fontSize: '20px',
    fontWeight: '700'
  },

  totalRevenueCard: {
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
    borderRadius: '16px',
    padding: '24px',
    border: '2px solid #10b981',
    textAlign: 'center'
  },
  totalRevenueHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '12px'
  },
  totalRevenueLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#10b981'
  },
  totalRevenueValue: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#f1f5f9'
  },

  paymentsSection: {
    background: '#1e293b',
    borderRadius: '12px',
    border: '1px solid #334155',
    overflow: 'hidden'
  },
  paymentsSectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px 20px',
    borderBottom: '1px solid #334155'
  },
  paymentsSectionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#f1f5f9'
  },
  paymentsList: {
    display: 'flex',
    flexDirection: 'column'
  },

  paymentItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '14px 20px',
    borderBottom: '1px solid #334155',
    transition: 'background 0.2s'
  },
  paymentTime: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#64748b',
    minWidth: '70px'
  },
  paymentDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  paymentMain: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px'
  },
  paymentMachine: {
    color: '#f1f5f9',
    fontWeight: '500'
  },
  paymentGame: {
    color: '#94a3b8'
  },
  paymentSeparator: {
    color: '#475569',
    margin: '0 4px'
  },
  paymentMeta: {
    fontSize: '12px',
    color: '#64748b'
  },
  paymentAmount: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#10b981',
    background: 'rgba(16, 185, 129, 0.1)',
    padding: '6px 12px',
    borderRadius: '8px'
  }
};

// Add responsive styles
const statsResponsiveStyles = document.createElement("style");
statsResponsiveStyles.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .spin {
    animation: spin 1s linear infinite;
  }

  @media (max-width: 1024px) {
    /* Stats grid 2 columns */
    div[style*="gridTemplateColumns: repeat(3"] {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }

  @media (max-width: 640px) {
    /* Stats grid single column */
    div[style*="gridTemplateColumns: repeat(3"] {
      grid-template-columns: 1fr !important;
    }

    /* Payment items stack */
    div[style*="paymentItem"] {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 10px !important;
    }
  }
`;

if (!document.getElementById('stats-responsive-styles')) {
  statsResponsiveStyles.id = 'stats-responsive-styles';
  document.head.appendChild(statsResponsiveStyles);
}

export default StatsCard;
