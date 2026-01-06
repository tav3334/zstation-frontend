import { useState, useEffect } from "react";
import api from "../services/api";
import Toast from "../components/Toast";

function ProductSalesHistory({ onBack }) {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Filtres
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    productName: "",
    paymentMethod: "all",
    staffName: ""
  });

  // Stats
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    averageSale: 0,
    topProduct: null
  });

  const showToast = (message, type = "info", duration = 3000) => {
    setToast({ message, type, duration });
  };

  useEffect(() => {
    loadSales();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [sales, filters]);

  const loadSales = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products/sales", { params: { limit: 1000 } });
      setSales(res.data.sales || []);
    } catch (e) {
      showToast("Erreur chargement: " + (e.response?.data?.message || e.message), "error");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...sales];

    // Filtre par date
    if (filters.startDate) {
      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.sale_date);
        return saleDate >= new Date(filters.startDate);
      });
    }

    if (filters.endDate) {
      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.sale_date);
        return saleDate <= new Date(filters.endDate + "T23:59:59");
      });
    }

    // Filtre par nom de produit
    if (filters.productName) {
      filtered = filtered.filter(sale =>
        sale.product_name.toLowerCase().includes(filters.productName.toLowerCase())
      );
    }

    // Filtre par méthode de paiement
    if (filters.paymentMethod !== "all") {
      filtered = filtered.filter(sale => sale.payment_method === filters.paymentMethod);
    }

    // Filtre par nom de staff
    if (filters.staffName) {
      filtered = filtered.filter(sale =>
        sale.staff_name.toLowerCase().includes(filters.staffName.toLowerCase())
      );
    }

    setFilteredSales(filtered);
    calculateStats(filtered);
  };

  const calculateStats = (salesData) => {
    const totalSales = salesData.length;
    const totalRevenue = salesData.reduce((sum, sale) => sum + sale.total_price, 0);
    const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Top produit
    const productSales = {};
    salesData.forEach(sale => {
      if (!productSales[sale.product_name]) {
        productSales[sale.product_name] = { quantity: 0, revenue: 0 };
      }
      productSales[sale.product_name].quantity += sale.quantity;
      productSales[sale.product_name].revenue += sale.total_price;
    });

    let topProduct = null;
    let maxRevenue = 0;
    Object.entries(productSales).forEach(([name, data]) => {
      if (data.revenue > maxRevenue) {
        maxRevenue = data.revenue;
        topProduct = { name, ...data };
      }
    });

    setStats({ totalSales, totalRevenue, averageSale, topProduct });
  };

  const resetFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      productName: "",
      paymentMethod: "all",
      staffName: ""
    });
  };

  const exportToCSV = () => {
    const headers = ["Date", "Produit", "Taille", "Quantité", "Prix Unitaire", "Total", "Méthode", "Agent"];
    const rows = filteredSales.map(sale => [
      new Date(sale.sale_date).toLocaleString('fr-FR'),
      sale.product_name,
      sale.product_size || "-",
      sale.quantity,
      sale.unit_price,
      sale.total_price,
      sale.payment_method,
      sale.staff_name
    ]);

    const csv = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Ventes_Produits_${new Date().getTime()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    showToast("Export CSV réussi!", "success");
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Chargement de l'historique...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div style={styles.header}>
        <div>
          <button onClick={onBack} style={styles.backBtn}>
            ← Retour
          </button>
          <h1 style={styles.title}>Historique des Ventes de Produits</h1>
        </div>
        <button onClick={exportToCSV} style={styles.exportBtn}>
          📥 Exporter CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📊</div>
          <div style={styles.statValue}>{stats.totalSales}</div>
          <div style={styles.statLabel}>Ventes Totales</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>💰</div>
          <div style={styles.statValue}>{stats.totalRevenue.toFixed(2)} DH</div>
          <div style={styles.statLabel}>Revenu Total</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📈</div>
          <div style={styles.statValue}>{stats.averageSale.toFixed(2)} DH</div>
          <div style={styles.statLabel}>Vente Moyenne</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🏆</div>
          <div style={styles.statValue}>{stats.topProduct?.name || "N/A"}</div>
          <div style={styles.statLabel}>Top Produit</div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filtersCard}>
        <h3 style={styles.filtersTitle}>🔍 Filtres</h3>
        <div style={styles.filtersGrid}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Date de début</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              style={styles.filterInput}
            />
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Date de fin</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              style={styles.filterInput}
            />
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Nom du produit</label>
            <input
              type="text"
              value={filters.productName}
              onChange={(e) => setFilters({...filters, productName: e.target.value})}
              placeholder="Rechercher..."
              style={styles.filterInput}
            />
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Méthode de paiement</label>
            <select
              value={filters.paymentMethod}
              onChange={(e) => setFilters({...filters, paymentMethod: e.target.value})}
              style={styles.filterInput}
            >
              <option value="all">Toutes</option>
              <option value="cash">Espèces</option>
              <option value="card">Carte</option>
              <option value="mobile">Mobile</option>
            </select>
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Agent</label>
            <input
              type="text"
              value={filters.staffName}
              onChange={(e) => setFilters({...filters, staffName: e.target.value})}
              placeholder="Nom de l'agent..."
              style={styles.filterInput}
            />
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>&nbsp;</label>
            <button onClick={resetFilters} style={styles.resetBtn}>
              🔄 Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h3 style={styles.tableTitle}>📋 Liste des Ventes ({filteredSales.length})</h3>
        </div>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Produit</th>
                <th style={styles.th}>Quantité</th>
                <th style={styles.th}>Prix Unit.</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Paiement</th>
                <th style={styles.th}>Agent</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale.id} style={styles.tableRow}>
                  <td style={styles.td}>
                    {new Date(sale.sale_date).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.productCell}>
                      <strong>{sale.product_name}</strong>
                      {sale.product_size && (
                        <span style={styles.productSize}>({sale.product_size})</span>
                      )}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.quantityBadge}>{sale.quantity}</span>
                  </td>
                  <td style={styles.td}>{sale.unit_price.toFixed(2)} DH</td>
                  <td style={styles.td}>
                    <strong style={styles.totalPrice}>{sale.total_price.toFixed(2)} DH</strong>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.paymentBadge,
                      background: sale.payment_method === 'cash' ? 'rgba(16, 185, 129, 0.1)' :
                                 sale.payment_method === 'card' ? 'rgba(59, 130, 246, 0.1)' :
                                 'rgba(251, 146, 60, 0.1)',
                      color: sale.payment_method === 'cash' ? '#10b981' :
                             sale.payment_method === 'card' ? '#3b82f6' :
                             '#fb923c'
                    }}>
                      {sale.payment_method === 'cash' ? '💵 Espèces' :
                       sale.payment_method === 'card' ? '💳 Carte' :
                       '📱 Mobile'}
                    </span>
                  </td>
                  <td style={styles.td}>{sale.staff_name}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredSales.length === 0 && (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📭</div>
              <div>Aucune vente trouvée</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#0a0c14",
    padding: "40px",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#0a0c14",
    color: "#ffffff",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "4px solid rgba(255, 255, 255, 0.1)",
    borderTop: "4px solid #10b981",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "30px",
  },
  backBtn: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#d1d5db",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    marginBottom: "16px",
  },
  title: {
    margin: 0,
    fontSize: "32px",
    fontWeight: "700",
    color: "#ffffff",
  },
  exportBtn: {
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    border: "none",
    color: "#ffffff",
    padding: "12px 24px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  statCard: {
    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "24px",
    textAlign: "center",
  },
  statIcon: {
    fontSize: "36px",
    marginBottom: "12px",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#10b981",
    marginBottom: "8px",
  },
  statLabel: {
    fontSize: "14px",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  filtersCard: {
    background: "rgba(255, 255, 255, 0.03)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "24px",
    marginBottom: "30px",
  },
  filtersTitle: {
    margin: "0 0 20px 0",
    fontSize: "18px",
    fontWeight: "600",
    color: "#ffffff",
  },
  filtersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
  },
  filterLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#9ca3af",
    marginBottom: "8px",
  },
  filterInput: {
    padding: "10px 12px",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "14px",
  },
  resetBtn: {
    padding: "10px 12px",
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "8px",
    color: "#f87171",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  tableCard: {
    background: "rgba(255, 255, 255, 0.03)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
  },
  tableHeader: {
    padding: "20px 24px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },
  tableTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "600",
    color: "#ffffff",
  },
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeaderRow: {
    background: "rgba(255, 255, 255, 0.05)",
  },
  th: {
    padding: "16px",
    textAlign: "left",
    color: "#9ca3af",
    fontSize: "13px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tableRow: {
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
  },
  td: {
    padding: "16px",
    color: "#d1d5db",
    fontSize: "14px",
  },
  productCell: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  productSize: {
    fontSize: "12px",
    color: "#9ca3af",
  },
  quantityBadge: {
    display: "inline-block",
    padding: "4px 12px",
    background: "rgba(59, 130, 246, 0.1)",
    color: "#60a5fa",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: "600",
  },
  totalPrice: {
    color: "#10b981",
    fontSize: "15px",
  },
  paymentBadge: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#6b7280",
  },
  emptyIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
};

export default ProductSalesHistory;
