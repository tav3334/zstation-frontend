import { useState, useEffect } from "react";
import api from "../services/api";

function ProductsModal({ onClose, onSale }) {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (e) {
    }
  };

  const addToCart = (productId) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const removeFromCart = (productId) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId]--;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const getTotalPrice = () => {
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === parseInt(productId));
      return total + (product ? product.price * quantity : 0);
    }, 0);
  };

  const handleSell = async () => {
    if (Object.keys(cart).length === 0) {
      alert("Panier vide");
      return;
    }

    setLoading(true);

    try {
      const salesData = [];

      for (const [productId, quantity] of Object.entries(cart)) {
        const response = await api.post("/products/sell", {
          product_id: parseInt(productId),
          quantity,
          payment_method: paymentMethod
        });
        salesData.push({
          ...response.data.sale,
          productName: response.data.sale.product.name,
          productSize: response.data.sale.product.size
        });
      }

      // Générer le reçu
      generateReceipt(salesData, getTotalPrice());

      onSale("Vente réussie: " + getTotalPrice().toFixed(2) + " DH");
      onClose();
    } catch (e) {
      alert("Erreur: " + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  };

  const generateReceipt = (salesData, totalPrice) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR');
    const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    let itemsList = '';
    salesData.forEach(sale => {
      const productName = sale.productSize
        ? `${sale.productName} (${sale.productSize})`
        : sale.productName;
      itemsList += `${sale.quantity}x ${productName} @ ${sale.unit_price} DH\n`;
      itemsList += `   Sous-total: ${sale.total_price} DH\n\n`;
    });

    const paymentMethodText =
      paymentMethod === 'cash' ? 'Espèces' :
      paymentMethod === 'card' ? 'Carte Bancaire' :
      'Mobile';

    const receiptContent = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         🎮 ZSTATION 🎮
     Gaming Station Management
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Date: ${dateStr} ${timeStr}
Type: Vente Produits

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRODUITS VENDUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${itemsList}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAIEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Méthode: ${paymentMethodText}
Total: ${totalPrice.toFixed(2)} DH

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Merci et à bientôt ! 🍿
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Recu_Produits_${now.getTime()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const snacks = products.filter(p => p.category === "snack");
  const drinks = products.filter(p => p.category === "drink");

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Vente de Produits</h2>
          <button onClick={onClose} style={styles.closeBtn}>X</button>
        </div>

        <div style={styles.content}>
          <div style={styles.category}>
            <h3 style={styles.categoryTitle}>Snacks</h3>
            <div style={styles.productGrid}>
              {snacks.map(product => (
                <ProductCard key={product.id} product={product} quantity={cart[product.id] || 0} onAdd={() => addToCart(product.id)} onRemove={() => removeFromCart(product.id)} />
              ))}
            </div>
          </div>

          <div style={styles.category}>
            <h3 style={styles.categoryTitle}>Boissons</h3>
            <div style={styles.productGrid}>
              {drinks.map(product => (
                <ProductCard key={product.id} product={product} quantity={cart[product.id] || 0} onAdd={() => addToCart(product.id)} onRemove={() => removeFromCart(product.id)} />
              ))}
            </div>
          </div>
        </div>

        {Object.keys(cart).length > 0 && (
          <div style={styles.cartSummary}>
            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>Total:</span>
              <span style={styles.totalPrice}>{getTotalPrice().toFixed(2)} DH</span>
            </div>
          </div>
        )}

        <div style={styles.paymentSection}>
          <label style={styles.label}>Methode de paiement:</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={styles.select}>
            <option value="cash">Especes</option>
            <option value="card">Carte</option>
            <option value="mobile">Mobile</option>
          </select>
        </div>

        <div style={styles.actions}>
          <button onClick={onClose} style={styles.cancelBtn}>Annuler</button>
          <button onClick={handleSell} disabled={loading || Object.keys(cart).length === 0} style={{ ...styles.confirmBtn, opacity: (loading || Object.keys(cart).length === 0) ? 0.5 : 1 }}>
            {loading ? "Vente..." : "Vendre (" + getTotalPrice().toFixed(2) + " DH)"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, quantity, onAdd, onRemove }) {
  return (
    <div style={styles.productCard}>
      <div style={styles.productIcon}>{product.image}</div>
      <div style={styles.productName}>
        {product.name}
        {product.size && <span style={styles.productSize}>{product.size}</span>}
      </div>
      <div style={styles.productPrice}>{product.price} DH</div>
      <div style={styles.productStock}>Stock: {product.stock}</div>
      {quantity === 0 ? (
        <button onClick={onAdd} style={styles.addBtn} disabled={product.stock === 0}>
          {product.stock === 0 ? "Rupture" : "+ Ajouter"}
        </button>
      ) : (
        <div style={styles.quantityControls}>
          <button onClick={onRemove} style={styles.qtyBtn}>-</button>
          <span style={styles.qtyDisplay}>{quantity}</span>
          <button onClick={onAdd} style={styles.qtyBtn} disabled={quantity >= product.stock}>+</button>
        </div>
      )}
    </div>
  );
}

const styles = {
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: "20px" },
  modal: { backgroundColor: "#1a1d2e", borderRadius: "20px", width: "90%", maxWidth: "900px", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)", overflow: "hidden" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" },
  title: { margin: 0, fontSize: "24px", fontWeight: "700", color: "#ffffff" },
  closeBtn: { background: "rgba(255, 255, 255, 0.1)", border: "none", color: "#ffffff", width: "36px", height: "36px", borderRadius: "50%", cursor: "pointer", fontSize: "20px" },
  content: { padding: "24px", overflowY: "auto", flex: 1 },
  category: { marginBottom: "24px" },
  categoryTitle: { margin: "0 0 16px 0", fontSize: "18px", fontWeight: "600", color: "#ffffff" },
  productGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px" },
  productCard: { background: "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)", borderRadius: "12px", padding: "16px", textAlign: "center", border: "1px solid rgba(255, 255, 255, 0.1)" },
  productIcon: { fontSize: "48px", marginBottom: "8px" },
  productName: { fontSize: "14px", fontWeight: "600", color: "#ffffff", marginBottom: "4px" },
  productSize: { display: "block", fontSize: "12px", color: "#9ca3af", fontWeight: "400", textTransform: "capitalize" },
  productPrice: { fontSize: "16px", fontWeight: "700", color: "#10b981", marginBottom: "4px" },
  productStock: { fontSize: "11px", color: "#6b7280", marginBottom: "12px" },
  addBtn: { width: "100%", padding: "8px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" },
  quantityControls: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" },
  qtyBtn: { width: "32px", height: "32px", background: "rgba(255, 255, 255, 0.1)", color: "#ffffff", border: "1px solid rgba(255, 255, 255, 0.2)", borderRadius: "8px", cursor: "pointer", fontSize: "16px", fontWeight: "600" },
  qtyDisplay: { fontSize: "16px", fontWeight: "700", color: "#ffffff", minWidth: "30px", textAlign: "center" },
  cartSummary: { padding: "20px 24px", background: "rgba(16, 185, 129, 0.05)", borderTop: "1px solid rgba(16, 185, 129, 0.2)", borderBottom: "1px solid rgba(16, 185, 129, 0.2)" },
  totalRow: { display: "flex", justifyContent: "space-between" },
  totalLabel: { fontSize: "18px", fontWeight: "700", color: "#ffffff" },
  totalPrice: { fontSize: "24px", fontWeight: "700", color: "#10b981" },
  paymentSection: { padding: "20px 24px" },
  label: { display: "block", fontSize: "14px", fontWeight: "600", color: "#d1d5db", marginBottom: "8px" },
  select: { width: "100%", padding: "12px", background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "10px", color: "#ffffff", fontSize: "14px", cursor: "pointer" },
  actions: { display: "flex", gap: "12px", padding: "20px 24px", borderTop: "1px solid rgba(255, 255, 255, 0.1)" },
  cancelBtn: { flex: 1, padding: "14px", background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "10px", color: "#d1d5db", fontSize: "15px", fontWeight: "600", cursor: "pointer" },
  confirmBtn: { flex: 2, padding: "14px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", border: "none", borderRadius: "10px", color: "#ffffff", fontSize: "15px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)" }
};

export default ProductsModal;
