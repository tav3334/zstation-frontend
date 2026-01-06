import { useEffect, useState } from "react";
import api from "../services/api";
import Toast from "../components/Toast";
import StockManagement from "./StockManagement";
import ProductSalesHistory from "./ProductSalesHistory";

function AdminDashboard({ user, onLogout }) {
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [filter, setFilter] = useState("today");
  const [loading, setLoading] = useState(true);
  const [customDateStart, setCustomDateStart] = useState("");
  const [customDateEnd, setCustomDateEnd] = useState("");
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [toast, setToast] = useState(null);
  const [showStockManagement, setShowStockManagement] = useState(false);
  const [showSalesHistory, setShowSalesHistory] = useState(false);

  const showToast = (message, type = "info", duration = 3000) => {
    setToast({ message, type, duration });
  };

  useEffect(() => {
    loadData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [filter, customDateStart, customDateEnd]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {};

      // Si custom, utiliser les dates personnalisées
      if (filter === "custom" && customDateStart && customDateEnd) {
        params.start_date = customDateStart;
        params.end_date = customDateEnd;
      } else if (filter !== "custom") {
        params.period = filter;
      }

      const [statsRes, paymentsRes, sessionsRes] = await Promise.all([
        api.get("/dashboard/stats", { params }),
        api.get("/dashboard/payments", { params: { ...params, limit: 20 } }),
        api.get("/dashboard/sessions", { params: { ...params, limit: 20 } })
      ]);

      setStats(statsRes.data);
      setPayments(paymentsRes.data.payments || []);
      setSessions(sessionsRes.data.sessions || []);
      setLoading(false);
    } catch (e) {
      console.error("Load error:", e);
      showToast("Erreur de chargement: " + (e.response?.data?.message || e.message), "error");
      setLoading(false);
    }
  };

  const applyCustomFilter = () => {
    if (!customDateStart || !customDateEnd) {
      showToast("Veuillez sélectionner une date de début et de fin", "warning");
      return;
    }
    setFilter("custom");
    setShowCustomDate(false);
    showToast("Filtre personnalisé appliqué", "success");
    loadData();
  };

  if (showStockManagement) {
    return <StockManagement onBack={() => setShowStockManagement(false)} />;
  }

  if (loading && !stats) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Chargement du dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Background Elements */}
      <div style={styles.bgGradient1} />
      <div style={styles.bgGradient2} />
      <div style={styles.bgGradient3} />

      <div style={styles.contentWrapper}>
      {/* Header */}
      <header style={styles.header} className="slide-down">
        <div style={styles.headerLeft}>
          <div style={styles.logoContainer}>
            <div style={styles.logoIcon}>👑</div>
          </div>
          <div>
            <h1 style={styles.headerTitle}>Admin Dashboard</h1>
            <p style={styles.headerSubtitle}>
              <span style={styles.dot} />
              Bienvenue, <strong>{user.name}</strong>
            </p>
          </div>
        </div>
        <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
          <button onClick={() => setShowStockManagement(true)} style={styles.stockBtn}>
            <span>📦</span>
            <span>Gestion des Stocks</span>
          </button>
          <button onClick={onLogout} style={styles.logoutBtn}>
            <span>🚪</span>
            <span>Déconnexion</span>
          </button>
        </div>
      </header>

      {/* Filter Bar */}
      <div style={styles.filterBar} className="fade-in">
        <div style={styles.filterGroup}>
          {[
            { id: "today", icon: "📅", label: "Aujourd'hui" },
            { id: "week", icon: "📊", label: "7 Jours" },
            { id: "month", icon: "📈", label: "30 Jours" }
          ].map((filterItem) => (
            <button
              key={filterItem.id}
              onClick={() => setFilter(filterItem.id)}
              style={{
                ...styles.filterBtn,
                ...(filter === filterItem.id ? styles.filterBtnActive : {})
              }}
            >
              <span>{filterItem.icon}</span>
              <span>{filterItem.label}</span>
            </button>
          ))}
          <button
            onClick={() => setShowCustomDate(!showCustomDate)}
            style={{
              ...styles.filterBtn,
              ...(filter === "custom" ? styles.filterBtnActive : {})
            }}
          >
            <span>🗓️</span>
            <span>Personnalisé</span>
          </button>
        </div>
        <button onClick={loadData} style={styles.refreshBtn} disabled={loading}>
          <span style={loading ? styles.spinIcon : {}}>🔄</span>
          <span>Actualiser</span>
        </button>
      </div>

      {/* Custom Date Picker */}
      {showCustomDate && (
        <div style={styles.customDatePicker} className="fade-in">
          <div style={styles.datePickerContent}>
            <h4 style={styles.datePickerTitle}>📅 Sélectionner une période</h4>
            <div style={styles.dateInputs}>
              <div style={styles.dateInputGroup}>
                <label style={styles.dateLabel}>Date de début</label>
                <input
                  type="date"
                  value={customDateStart}
                  onChange={(e) => setCustomDateStart(e.target.value)}
                  style={styles.dateInput}
                />
              </div>
              <div style={styles.dateInputGroup}>
                <label style={styles.dateLabel}>Date de fin</label>
                <input
                  type="date"
                  value={customDateEnd}
                  onChange={(e) => setCustomDateEnd(e.target.value)}
                  style={styles.dateInput}
                />
              </div>
            </div>
            <div style={styles.datePickerActions}>
              <button onClick={applyCustomFilter} style={styles.applyBtn}>
                ✓ Appliquer
              </button>
              <button onClick={() => setShowCustomDate(false)} style={styles.cancelBtn}>
                ✕ Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <StatCard
          icon="💰"
          label="Recettes Sessions"
          value={(stats?.stats?.total_revenue || 0).toFixed(2) + " DH"}
          gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
          delay="0.1s"
        />
        <StatCard
          icon="🍿"
          label="Recettes Produits"
          value={(stats?.stats?.product_revenue || 0).toFixed(2) + " DH"}
          gradient="linear-gradient(135deg, #f59e0b 0%, #f97316 100%)"
          delay="0.2s"
        />
        <StatCard
          icon="📊"
          label="Sessions"
          value={stats?.stats?.total_sessions || 0}
          gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
          delay="0.3s"
        />
        <StatCard
          icon="🛒"
          label="Ventes Produits"
          value={stats?.stats?.total_product_sales || 0}
          gradient="linear-gradient(135deg, #ec4899 0%, #db2777 100%)"
          delay="0.4s"
        />
        <StatCard
          icon="⚡"
          label="Sessions Actives"
          value={stats?.stats?.active_sessions || 0}
          gradient="linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)"
          delay="0.5s"
        />
        <StatCard
          icon="🖥️"
          label="Machines"
          value={`${stats?.stats?.available_machines || 0}/${stats?.stats?.total_machines || 0}`}
          gradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
          delay="0.6s"
        />
      </div>

      {/* Details Grid */}
      <div style={styles.detailsGrid}>
        {/* Top Games */}
        <div style={styles.card} className="fade-in">
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>
              <span style={styles.cardIcon}>🎮</span>
              Top Jeux
            </h3>
          </div>
          <div style={styles.cardBody}>
            {(stats?.top_games || []).map((game, idx) => (
              <div key={game.game_id} style={styles.listItem} className="list-item">
                <div style={styles.listItemLeft}>
                  <div style={styles.listItemRank}>{idx + 1}</div>
                  <div>
                    <div style={styles.listItemTitle}>{game.game_name}</div>
                    <div style={styles.listItemSubtitle}>{game.sessions_count} sessions</div>
                  </div>
                </div>
                <div style={styles.listItemAmount}>{game.total_revenue.toFixed(2)} DH</div>
              </div>
            ))}
            {(!stats?.top_games || stats.top_games.length === 0) && (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>🎮</div>
                <div>Aucune donnée disponible</div>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div style={styles.card} className="fade-in">
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>
              <span style={styles.cardIcon}>🍿</span>
              Top Produits
            </h3>
          </div>
          <div style={styles.cardBody}>
            {(stats?.top_products || []).map((product, idx) => (
              <div key={product.product_id} style={styles.listItem} className="list-item">
                <div style={styles.listItemLeft}>
                  <div style={styles.listItemRank}>{idx + 1}</div>
                  <div>
                    <div style={styles.listItemTitle}>{product.product_name}</div>
                    <div style={styles.listItemSubtitle}>{product.total_quantity} vendus</div>
                  </div>
                </div>
                <div style={styles.listItemAmount}>{product.total_revenue.toFixed(2)} DH</div>
              </div>
            ))}
            {(!stats?.top_products || stats.top_products.length === 0) && (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>🍿</div>
                <div>Aucune donnée disponible</div>
              </div>
            )}
          </div>
        </div>

        {/* Revenue by Method */}
        <div style={styles.card} className="fade-in">
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>
              <span style={styles.cardIcon}>💳</span>
              Paiements Sessions
            </h3>
          </div>
          <div style={styles.cardBody}>
            {(stats?.revenue_by_method || []).map((item, idx) => (
              <div key={idx} style={styles.listItem} className="list-item">
                <div style={styles.listItemLeft}>
                  <div style={{
                    ...styles.methodIcon,
                    background: item.method === 'cash'
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                  }}>
                    {item.method === 'cash' ? '💵' : '💳'}
                  </div>
                  <div style={styles.listItemTitle}>
                    {item.method === 'cash' ? 'Espèces' : item.method === 'card' ? 'Carte' : 'Mobile'}
                  </div>
                </div>
                <div style={styles.listItemAmount}>{item.total.toFixed(2)} DH</div>
              </div>
            ))}
            {(!stats?.revenue_by_method || stats.revenue_by_method.length === 0) && (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>💳</div>
                <div>Aucune donnée disponible</div>
              </div>
            )}
          </div>
        </div>

        {/* Product Revenue by Method */}
        <div style={styles.card} className="fade-in">
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>
              <span style={styles.cardIcon}>🛒</span>
              Paiements Produits
            </h3>
          </div>
          <div style={styles.cardBody}>
            {(stats?.product_revenue_by_method || []).map((item, idx) => (
              <div key={idx} style={styles.listItem} className="list-item">
                <div style={styles.listItemLeft}>
                  <div style={{
                    ...styles.methodIcon,
                    background: item.method === 'cash'
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : item.method === 'card'
                        ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                        : 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)'
                  }}>
                    {item.method === 'cash' ? '💵' : item.method === 'card' ? '💳' : '📱'}
                  </div>
                  <div style={styles.listItemTitle}>
                    {item.method === 'cash' ? 'Espèces' : item.method === 'card' ? 'Carte' : 'Mobile'}
                  </div>
                </div>
                <div style={styles.listItemAmount}>{item.total.toFixed(2)} DH</div>
              </div>
            ))}
            {(!stats?.product_revenue_by_method || stats.product_revenue_by_method.length === 0) && (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>🛒</div>
                <div>Aucune donnée disponible</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      <div style={styles.card} className="fade-in">
        <div style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>
            <span style={styles.cardIcon}>💰</span>
            Derniers Paiements
          </h3>
          <div style={styles.badge}>{payments.length} total</div>
        </div>
        <div style={styles.cardBody}>
          <div style={styles.tableContainer}>
            {payments.slice(0, 10).map((payment, idx) => (
              <div key={payment.id} style={styles.tableRow} className="table-row">
                <div style={styles.tableCell}>
                  <div style={styles.tableCellTitle}>{payment.machine_name || "N/A"}</div>
                  <div style={styles.tableCellSubtitle}>
                    🎮 {payment.game_name || "N/A"}
                  </div>
                </div>
                <div style={styles.tableCell}>
                  <div style={{
                    ...styles.paymentMethod,
                    background: payment.payment_method === 'cash'
                      ? 'rgba(16, 185, 129, 0.1)'
                      : 'rgba(59, 130, 246, 0.1)',
                    color: payment.payment_method === 'cash'
                      ? '#10b981'
                      : '#3b82f6'
                  }}>
                    {payment.payment_method === 'cash' ? '💵 Espèces' : '💳 Carte'}
                  </div>
                </div>
                <div style={styles.tableCell}>
                  <div style={styles.tableCellAmount}>{payment.amount} DH</div>
                  <div style={styles.tableCellDate}>
                    {new Date(payment.payment_date).toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
            {payments.length === 0 && (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>💰</div>
                <div>Aucun paiement enregistré</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div style={styles.card} className="fade-in">
        <div style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>
            <span style={styles.cardIcon}>🎮</span>
            Dernières Sessions
          </h3>
          <div style={styles.badge}>{sessions.length} total</div>
        </div>
        <div style={styles.cardBody}>
          <div style={styles.tableContainer}>
            {sessions.slice(0, 10).map((session) => (
              <div key={session.id} style={styles.tableRow} className="table-row">
                <div style={styles.tableCell}>
                  <div style={styles.tableCellTitle}>{session.machine_name || "N/A"}</div>
                  <div style={styles.tableCellSubtitle}>
                    🎮 {session.game_name || "N/A"} • {session.customer_name || "Invité"}
                  </div>
                </div>
                <div style={styles.tableCell}>
                  <div style={{
                    ...styles.sessionStatus,
                    background: session.is_active
                      ? 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)'
                      : 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  }}>
                    {session.is_active ? '⏳ En cours' : '✅ Terminée'}
                  </div>
                </div>
                <div style={styles.tableCell}>
                  <div style={styles.tableCellDate}>
                    {new Date(session.start_time).toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  {session.duration_minutes && (
                    <div style={styles.tableCellSubtitle}>{session.duration_minutes} minutes</div>
                  )}
                </div>
              </div>
            ))}
            {sessions.length === 0 && (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>🎮</div>
                <div>Aucune session enregistrée</div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

function StatCard({ icon, label, value, gradient, delay }) {
  return (
    <div style={{ ...styles.statCard, animationDelay: delay }} className="stat-card">
      <div style={{ ...styles.statCardBg, background: gradient }} />
      <div style={styles.statCardContent}>
        <div style={styles.statCardIcon}>{icon}</div>
        <div style={styles.statCardLabel}>{label}</div>
        <div style={styles.statCardValue}>{value}</div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    height: "100%",
    width: "100vw",
    background: "#0a0c14",
    padding: "0",
    margin: "0",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "auto",
  },

  contentWrapper: {
    padding: "24px",
    position: "relative",
    zIndex: 10,
    minHeight: "100vh",
  },

  bgGradient1: {
    position: "fixed",
    top: "-20%",
    right: "-10%",
    width: "600px",
    height: "600px",
    background: "radial-gradient(circle, rgba(123,92,255,0.08) 0%, transparent 70%)",
    borderRadius: "50%",
    filter: "blur(80px)",
    pointerEvents: "none",
  },

  bgGradient2: {
    position: "fixed",
    bottom: "-15%",
    left: "-10%",
    width: "500px",
    height: "500px",
    background: "radial-gradient(circle, rgba(0,230,255,0.06) 0%, transparent 70%)",
    borderRadius: "50%",
    filter: "blur(80px)",
    pointerEvents: "none",
  },

  bgGradient3: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "800px",
    height: "800px",
    background: "radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)",
    borderRadius: "50%",
    filter: "blur(100px)",
    pointerEvents: "none",
  },

  loadingContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#0a0c14",
  },

  spinner: {
    width: "56px",
    height: "56px",
    border: "4px solid rgba(255,255,255,0.1)",
    borderTop: "4px solid #7b5cff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },

  loadingText: {
    marginTop: "20px",
    color: "#98a6b3",
    fontSize: "16px",
    fontWeight: "600",
  },

  header: {
    background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "20px",
    padding: "24px 32px",
    marginBottom: "24px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },

  logoContainer: {
    width: "60px",
    height: "60px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, rgba(123,92,255,0.1) 0%, rgba(0,230,255,0.05) 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 24px rgba(123,92,255,0.2)",
  },

  logoIcon: {
    fontSize: "32px",
  },

  headerTitle: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "900",
    background: "linear-gradient(135deg, #ffffff 0%, #7b5cff 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: "-0.5px",
  },

  headerSubtitle: {
    margin: "6px 0 0 0",
    fontSize: "14px",
    color: "#98a6b3",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#10b981",
    boxShadow: "0 0 12px #10b981",
    animation: "pulse-dot 2s ease-in-out infinite",
  },

  stockBtn: {
    padding: "12px 24px",
    background: "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.05) 100%)",
    border: "1px solid rgba(16,185,129,0.2)",
    borderRadius: "12px",
    color: "#10b981",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s ease",
  },

  logoutBtn: {
    padding: "12px 24px",
    background: "linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(220,38,38,0.05) 100%)",
    border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: "12px",
    color: "#ef4444",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s ease",
  },

  filterBar: {
    background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "20px",
    padding: "20px",
    marginBottom: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
    position: "relative",
  },

  filterGroup: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },

  filterBtn: {
    padding: "10px 20px",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "10px",
    color: "#98a6b3",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s ease",
  },

  filterBtnActive: {
    background: "linear-gradient(135deg, #7b5cff 0%, #00e6ff 100%)",
    color: "#fff",
    borderColor: "transparent",
    boxShadow: "0 8px 24px rgba(123,92,255,0.3)",
  },

  refreshBtn: {
    padding: "10px 20px",
    background: "linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(37,99,235,0.05) 100%)",
    border: "1px solid rgba(59,130,246,0.2)",
    borderRadius: "10px",
    color: "#3b82f6",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s ease",
  },

  spinIcon: {
    animation: "spin 1s linear infinite",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginBottom: "24px",
    position: "relative",
  },

  statCard: {
    position: "relative",
    background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "28px",
    overflow: "hidden",
    transition: "all 0.3s ease",
    animation: "fadeInUp 0.6s ease-out both",
  },

  statCardBg: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    opacity: 0.1,
    filter: "blur(40px)",
  },

  statCardContent: {
    position: "relative",
    zIndex: 1,
  },

  statCardIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    marginBottom: "16px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
  },

  statCardLabel: {
    fontSize: "13px",
    color: "#98a6b3",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "8px",
  },

  statCardValue: {
    fontSize: "36px",
    fontWeight: "900",
    color: "#ffffff",
    lineHeight: 1,
    letterSpacing: "-1px",
  },

  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "20px",
    marginBottom: "24px",
    position: "relative",
  },

  card: {
    background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "0",
    overflow: "hidden",
    position: "relative",
  },

  cardHeader: {
    padding: "24px 28px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "800",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  cardIcon: {
    fontSize: "24px",
  },

  badge: {
    padding: "6px 12px",
    background: "rgba(123,92,255,0.1)",
    border: "1px solid rgba(123,92,255,0.2)",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "700",
    color: "#7b5cff",
  },

  cardBody: {
    padding: "0",
  },

  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 28px",
    borderBottom: "1px solid rgba(255,255,255,0.03)",
    transition: "all 0.2s ease",
  },

  listItemLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },

  listItemRank: {
    width: "32px",
    height: "32px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, rgba(123,92,255,0.1) 0%, rgba(0,230,255,0.05) 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "900",
    color: "#7b5cff",
  },

  listItemTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: "4px",
  },

  listItemSubtitle: {
    fontSize: "13px",
    color: "#98a6b3",
  },

  listItemAmount: {
    fontSize: "18px",
    fontWeight: "900",
    color: "#10b981",
  },

  methodIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },

  tableContainer: {
    padding: "0",
  },

  tableRow: {
    display: "grid",
    gridTemplateColumns: "2fr 1.5fr 1.5fr",
    gap: "16px",
    alignItems: "center",
    padding: "20px 28px",
    borderBottom: "1px solid rgba(255,255,255,0.03)",
    transition: "all 0.2s ease",
  },

  tableCell: {
    display: "flex",
    flexDirection: "column",
  },

  tableCellTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: "4px",
  },

  tableCellSubtitle: {
    fontSize: "13px",
    color: "#98a6b3",
  },

  tableCellAmount: {
    fontSize: "18px",
    fontWeight: "900",
    color: "#10b981",
    marginBottom: "4px",
  },

  tableCellDate: {
    fontSize: "13px",
    color: "#98a6b3",
  },

  paymentMethod: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "700",
    width: "fit-content",
  },

  sessionStatus: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "700",
    color: "#ffffff",
    width: "fit-content",
  },

  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#98a6b3",
  },

  emptyIcon: {
    fontSize: "48px",
    marginBottom: "12px",
    opacity: 0.3,
  },

  customDatePicker: {
    background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "24px",
    marginBottom: "24px",
  },

  datePickerContent: {
    position: "relative",
  },

  datePickerTitle: {
    margin: "0 0 20px 0",
    fontSize: "18px",
    fontWeight: "800",
    color: "#ffffff",
  },

  dateInputs: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "20px",
  },

  dateInputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  dateLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#98a6b3",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  dateInput: {
    padding: "12px 16px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.2s ease",
    outline: "none",
  },

  datePickerActions: {
    display: "flex",
    gap: "12px",
  },

  applyBtn: {
    flex: 1,
    padding: "12px 20px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    border: "none",
    borderRadius: "10px",
    color: "#ffffff",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all 0.2s ease",
  },

  cancelBtn: {
    flex: 1,
    padding: "12px 20px",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    color: "#98a6b3",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all 0.2s ease",
  },
};

// Add animations and global styles
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  body, html {
    margin: 0 !important;
    padding: 0 !important;
    overflow-x: hidden;
    background: #0a0c14 !important;
  }

  #root {
    margin: 0 !important;
    padding: 0 !important;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse-dot {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.6;
      transform: scale(1.1);
    }
  }

  .slide-down {
    animation: slideDown 0.6s ease-out;
  }

  .fade-in {
    animation: fadeIn 0.6s ease-out;
  }

  .stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 60px rgba(123,92,255,0.2);
    border-color: rgba(123,92,255,0.3);
  }

  .list-item:hover {
    background: rgba(255,255,255,0.02);
  }

  .table-row:hover {
    background: rgba(255,255,255,0.02);
  }

  button:hover:not([disabled]) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  }

  button:active:not([disabled]) {
    transform: translateY(0);
  }

  button[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .table-row {
      grid-template-columns: 1fr !important;
      gap: 12px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default AdminDashboard;
