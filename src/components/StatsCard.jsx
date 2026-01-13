import { useEffect, useState } from "react";
import api from "../services/api";

function StatsCard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      const res = await api.get("/payments/today");
      setStats(res.data);
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div style={card}>Chargement...</div>;
  if (!stats) return <div style={card}>Erreur de chargement</div>;

  return (
    <div style={container}>
      <div style={card}>
        <h3 style={title}>📅 {stats.date}</h3>

        <div style={statsGrid}>
          <div style={statBox}>
            <div style={statLabel}>💰 Recettes Sessions</div>
            <div style={statValue}>{stats.total_revenue}</div>
          </div>

          <div style={statBox}>
            <div style={statLabel}>🍿 Recettes Produits</div>
            <div style={statValue}>{stats.product_revenue}</div>
          </div>

          <div style={statBox}>
            <div style={statLabel}>📊 Sessions</div>
            <div style={statValue}>{stats.count}</div>
          </div>

          <div style={statBox}>
            <div style={statLabel}>🛒 Ventes Produits</div>
            <div style={statValue}>{stats.product_sales_count}</div>
          </div>

          <div style={statBox}>
            <div style={statLabel}>💵 Cash reçu</div>
            <div style={statValue}>{stats.total_cash_received}</div>
          </div>

          <div style={statBox}>
            <div style={statLabel}>💸 Monnaie rendue</div>
            <div style={statValue}>{stats.total_change_given}</div>
          </div>
        </div>

        <div style={totalRevenueBox}>
          <div style={totalRevenueLabel}>💎 Recettes Totales du Jour</div>
          <div style={totalRevenueValue}>{stats.total_combined_revenue}</div>
        </div>

        <button onClick={loadStats} style={refreshButton}>
          🔄 Actualiser
        </button>
      </div>

      {stats.payments && stats.payments.length > 0 && (
        <div style={card}>
          <h3 style={title}>💳 Derniers paiements</h3>
          <div style={paymentList}>
            {stats.payments.map((payment) => (
              <div key={payment.id} style={paymentItem}>
                <div style={paymentTime}>{payment.time}</div>
                <div style={paymentInfo}>
                  <div>{payment.machine} - {payment.game}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    Donné: {payment.given} | Monnaie: {payment.change}
                  </div>
                </div>
                <div style={paymentAmount}>{payment.amount}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const container = {
  padding: 20,
  maxWidth: 1200,
  margin: "0 auto"
};

const card = {
  backgroundColor: "white",
  borderRadius: 12,
  padding: 24,
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  marginBottom: 20
};

const title = {
  marginTop: 0,
  color: "#333",
  fontSize: 20
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 16,
  marginBottom: 20
};

const statBox = {
  backgroundColor: "#f5f5f5",
  padding: 20,
  borderRadius: 8,
  textAlign: "center"
};

const totalRevenueBox = {
  backgroundColor: "#e8f5e9",
  padding: 24,
  borderRadius: 12,
  textAlign: "center",
  marginBottom: 20,
  border: "2px solid #4CAF50"
};

const totalRevenueLabel = {
  fontSize: 16,
  color: "#2e7d32",
  marginBottom: 12,
  fontWeight: "600"
};

const totalRevenueValue = {
  fontSize: 36,
  fontWeight: "bold",
  color: "#1b5e20"
};

const statLabel = {
  fontSize: 14,
  color: "#666",
  marginBottom: 8
};

const statValue = {
  fontSize: 28,
  fontWeight: "bold",
  color: "#4CAF50"
};

const refreshButton = {
  width: "100%",
  padding: 12,
  backgroundColor: "#2196F3",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 16,
  fontWeight: "bold"
};

const paymentList = {
  display: "flex",
  flexDirection: "column",
  gap: 12
};

const paymentItem = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  padding: 12,
  backgroundColor: "#f9f9f9",
  borderRadius: 8,
  borderLeft: "4px solid #4CAF50"
};

const paymentTime = {
  fontSize: 14,
  fontWeight: "bold",
  color: "#666",
  minWidth: 50
};

const paymentInfo = {
  flex: 1
};

const paymentAmount = {
  fontSize: 18,
  fontWeight: "bold",
  color: "#4CAF50"
};

export default StatsCard;