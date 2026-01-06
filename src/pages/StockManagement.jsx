import { useState, useEffect } from "react";
import api from "../services/api";
import Toast from "../components/Toast";

function StockManagement({ onBack }) {
  const [products, setProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "snack",
    price: "",
    size: "",
    stock: "",
    image: "📦"
  });

  const showToast = (message, type = "info", duration = 3000) => {
    setToast({ message, type, duration });
  };

  useEffect(() => {
    loadProducts();
    loadLowStock();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products/all");
      setProducts(res.data);
    } catch (e) {
      showToast("Erreur chargement produits: " + (e.response?.data?.message || e.message), "error");
    } finally {
      setLoading(false);
    }
  };

  const loadLowStock = async () => {
    try {
      const res = await api.get("/products/low-stock");
      setLowStockProducts(res.data.products);
    } catch (e) {
      console.error("Error loading low stock:", e);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      category: "snack",
      price: "",
      size: "",
      stock: "",
      image: "📦"
    });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      size: product.size || "",
      stock: product.stock,
      image: product.image
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, formData);
        showToast("Produit modifié avec succès", "success");
      } else {
        await api.post("/products", formData);
        showToast("Produit créé avec succès", "success");
      }
      setShowModal(false);
      loadProducts();
      loadLowStock();
    } catch (e) {
      showToast("Erreur: " + (e.response?.data?.message || e.message), "error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit?")) return;

    try {
      const res = await api.delete(`/products/${id}`);
      showToast(res.data.message, "success");
      loadProducts();
      loadLowStock();
    } catch (e) {
      showToast("Erreur: " + (e.response?.data?.message || e.message), "error");
    }
  };

  const handleStockUpdate = async (id, newStock) => {
    try {
      await api.put(`/products/${id}/stock`, { stock: newStock });
      showToast("Stock mis à jour", "success");
      loadProducts();
      loadLowStock();
    } catch (e) {
      showToast("Erreur: " + (e.response?.data?.message || e.message), "error");
    }
  };

  const toggleAvailability = async (product) => {
    try {
      await api.put(`/products/${product.id}`, {
        is_available: !product.is_available
      });
      showToast(product.is_available ? "Produit désactivé" : "Produit activé", "success");
      loadProducts();
    } catch (e) {
      showToast("Erreur: " + (e.response?.data?.message || e.message), "error");
    }
  };

  const emojiOptions = ["🍿", "🥤", "🍔", "🍕", "🌭", "🍟", "🥗", "🍰", "🍪", "🥨", "💧", "🧃", "☕", "📦"];

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Chargement...</p>
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
          <h1 style={styles.title}>Gestion des Stocks</h1>
        </div>
        <button onClick={openAddModal} style={styles.addBtn}>
          + Ajouter un produit
        </button>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div style={styles.alertBox}>
          <div style={styles.alertIcon}>⚠️</div>
          <div>
            <div style={styles.alertTitle}>Stock Faible!</div>
            <div style={styles.alertText}>
              {lowStockProducts.length} produit(s) avec un stock ≤ 10 unités
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.tableHeader}>Produit</th>
              <th style={styles.tableHeader}>Catégorie</th>
              <th style={styles.tableHeader}>Taille</th>
              <th style={styles.tableHeader}>Prix</th>
              <th style={styles.tableHeader}>Stock</th>
              <th style={styles.tableHeader}>Statut</th>
              <th style={styles.tableHeader}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} style={styles.tableRow}>
                <td style={styles.tableCell}>
                  <div style={styles.productInfo}>
                    <span style={styles.productEmoji}>{product.image}</span>
                    <span>{product.name}</span>
                  </div>
                </td>
                <td style={styles.tableCell}>
                  <span style={{
                    ...styles.categoryBadge,
                    background: product.category === 'snack' ? '#fef3c7' : '#dbeafe',
                    color: product.category === 'snack' ? '#92400e' : '#1e40af'
                  }}>
                    {product.category === 'snack' ? 'Snack' : 'Boisson'}
                  </span>
                </td>
                <td style={styles.tableCell}>{product.size || '-'}</td>
                <td style={styles.tableCell}>{product.price} DH</td>
                <td style={styles.tableCell}>
                  <div style={styles.stockControl}>
                    <button
                      onClick={() => handleStockUpdate(product.id, Math.max(0, product.stock - 1))}
                      style={styles.stockBtn}
                    >
                      -
                    </button>
                    <span style={{
                      ...styles.stockValue,
                      color: product.stock <= 10 ? '#dc2626' : '#10b981'
                    }}>
                      {product.stock}
                    </span>
                    <button
                      onClick={() => handleStockUpdate(product.id, product.stock + 1)}
                      style={styles.stockBtn}
                    >
                      +
                    </button>
                  </div>
                </td>
                <td style={styles.tableCell}>
                  <button
                    onClick={() => toggleAvailability(product)}
                    style={{
                      ...styles.statusBtn,
                      background: product.is_available ? '#dcfce7' : '#fee2e2',
                      color: product.is_available ? '#166534' : '#991b1b'
                    }}
                  >
                    {product.is_available ? '✓ Actif' : '✕ Inactif'}
                  </button>
                </td>
                <td style={styles.tableCell}>
                  <div style={styles.actions}>
                    <button
                      onClick={() => openEditModal(product)}
                      style={styles.editBtn}
                    >
                      ✏️ Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      style={styles.deleteBtn}
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📦</div>
            <div>Aucun produit enregistré</div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}
              </h2>
              <button onClick={() => setShowModal(false)} style={styles.modalCloseBtn}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nom du produit</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Catégorie</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    style={styles.input}
                    required
                  >
                    <option value="snack">Snack</option>
                    <option value="drink">Boisson</option>
                  </select>
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Taille (optionnel)</label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={e => setFormData({...formData, size: e.target.value})}
                    style={styles.input}
                    placeholder="petit, grand..."
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Prix (DH)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Stock initial</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={e => setFormData({...formData, stock: e.target.value})}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Icône</label>
                  <div style={styles.emojiGrid}>
                    {emojiOptions.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormData({...formData, image: emoji})}
                        style={{
                          ...styles.emojiBtn,
                          border: formData.image === emoji ? '2px solid #10b981' : '1px solid #e5e7eb'
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>
                  Annuler
                </button>
                <button type="submit" style={styles.submitBtn}>
                  {editingProduct ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
  addBtn: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    border: "none",
    color: "#ffffff",
    padding: "12px 24px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
  },
  alertBox: {
    background: "linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(249, 115, 22, 0.1) 100%)",
    border: "1px solid rgba(251, 146, 60, 0.3)",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    gap: "16px",
    marginBottom: "24px",
  },
  alertIcon: {
    fontSize: "32px",
  },
  alertTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#fb923c",
    marginBottom: "4px",
  },
  alertText: {
    fontSize: "14px",
    color: "#d1d5db",
  },
  tableCard: {
    background: "rgba(255, 255, 255, 0.03)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeaderRow: {
    background: "rgba(255, 255, 255, 0.05)",
  },
  tableHeader: {
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
  tableCell: {
    padding: "16px",
    color: "#d1d5db",
    fontSize: "14px",
  },
  productInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  productEmoji: {
    fontSize: "24px",
  },
  categoryBadge: {
    padding: "4px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
  },
  stockControl: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  stockBtn: {
    width: "28px",
    height: "28px",
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "6px",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
  },
  stockValue: {
    fontSize: "16px",
    fontWeight: "700",
    minWidth: "30px",
    textAlign: "center",
  },
  statusBtn: {
    padding: "6px 12px",
    border: "none",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  actions: {
    display: "flex",
    gap: "8px",
  },
  editBtn: {
    padding: "8px 16px",
    background: "rgba(59, 130, 246, 0.1)",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    borderRadius: "8px",
    color: "#60a5fa",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
  deleteBtn: {
    padding: "8px 16px",
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "8px",
    color: "#f87171",
    cursor: "pointer",
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
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10000,
  },
  modal: {
    backgroundColor: "#1a1d2e",
    borderRadius: "20px",
    width: "90%",
    maxWidth: "600px",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },
  modalTitle: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "700",
    color: "#ffffff",
  },
  modalCloseBtn: {
    background: "rgba(255, 255, 255, 0.1)",
    border: "none",
    color: "#ffffff",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "20px",
  },
  form: {
    padding: "24px",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#d1d5db",
    marginBottom: "8px",
  },
  input: {
    padding: "12px",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "10px",
    color: "#ffffff",
    fontSize: "14px",
  },
  emojiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "8px",
  },
  emojiBtn: {
    padding: "8px",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "8px",
    fontSize: "20px",
    cursor: "pointer",
  },
  modalActions: {
    display: "flex",
    gap: "12px",
    marginTop: "24px",
  },
  cancelBtn: {
    flex: 1,
    padding: "14px",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "10px",
    color: "#d1d5db",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },
  submitBtn: {
    flex: 2,
    padding: "14px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    border: "none",
    borderRadius: "10px",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
  },
};

export default StockManagement;
