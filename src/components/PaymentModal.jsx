import { useState } from "react";

function PaymentModal({ session, onConfirm, onClose }) {
  const [amountGiven, setAmountGiven] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  console.log("🔍 PaymentModal received session:", session);

  // Vérifier que session existe
  if (!session) {
    console.error("❌ PaymentModal: session is null or undefined!");
    return null;
  }

  // Le backend retourne { session: {...}, price: X, duration_used: "Y min" }
  const sessionData = session.session || {};
  const price = parseFloat(session.price) || 0;
  const change = amountGiven ? (parseFloat(amountGiven) - price).toFixed(2) : "0.00";
  const isValid = parseFloat(amountGiven) >= price;

  const quickAmounts = [10, 20, 50, 100, 200];

  const handleConfirm = async () => {
    if (!isValid) {
      alert("Montant insuffisant !");
      return;
    }

    if (!sessionData || !sessionData.id) {
      console.error("❌ No session ID found!");
      alert("Erreur: ID de session manquant");
      return;
    }

    setIsProcessing(true);
    await onConfirm(sessionData.id, parseFloat(amountGiven));
    setIsProcessing(false);
  };

  // Calculer la durée consommée en minutes
  const getDurationConsumed = () => {
    if (!session.duration_used) return "N/A";
    // duration_used est au format "X.XX min"
    return session.duration_used;
  };

  return (
    <div className="payment-modal-overlay" style={overlay}>
      <div className="payment-modal-content" style={modal}>
        <h2 style={modalTitle}>💰 Paiement</h2>

        <div style={infoBox}>
          <div style={infoRow}>
            <span style={infoLabel}>🖥️ Machine:</span>
            <strong style={infoValue}>{sessionData?.machine?.name || "N/A"}</strong>
          </div>
          <div style={infoRow}>
            <span style={infoLabel}>🎮 Jeu:</span>
            <strong style={infoValue}>{sessionData?.game?.name || "N/A"}</strong>
          </div>
          <div style={infoRow}>
            <span style={infoLabel}>⏱️ Durée:</span>
            <strong style={infoValue}>{getDurationConsumed()}</strong>
          </div>
        </div>

        <div style={priceBox}>
          <span style={{ fontSize: "14px", color: "#2e7d32" }}>Montant à payer</span>
          <div style={{ fontSize: "32px", fontWeight: "bold", color: "#4CAF50" }}>
            {price.toFixed(2)} DH
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>
            Montant donné par le client:
          </label>
          <input
            type="number"
            value={amountGiven}
            onChange={(e) => setAmountGiven(e.target.value)}
            placeholder="Entrez le montant"
            style={inputStyle}
            autoFocus
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={labelSmall}>Montants rapides:</label>
          <div style={quickAmountsGrid}>
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => setAmountGiven(amount.toString())}
                style={quickButton}
              >
                {amount} DH
              </button>
            ))}
          </div>
        </div>

        {amountGiven && (
          <div style={{
            ...changeBox,
            backgroundColor: isValid ? "#e8f5e9" : "#ffebee"
          }}>
            <span style={{ fontSize: 14 }}>Monnaie à rendre:</span>
            <div style={{
              fontSize: 28,
              fontWeight: "bold",
              color: isValid ? "#2e7d32" : "#c62828"
            }}>
              {parseFloat(change) >= 0 ? change : "0.00"} DH
            </div>
            {!isValid && (
              <div style={{ fontSize: 12, color: "#c62828", marginTop: 5 }}>
                Manque: {Math.abs(parseFloat(change)).toFixed(2)} DH
              </div>
            )}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button
            onClick={handleConfirm}
            disabled={!isValid || isProcessing}
            style={{
              ...button,
              flex: 1,
              backgroundColor: isValid ? "#4CAF50" : "#ccc",
              cursor: isValid ? "pointer" : "not-allowed"
            }}
          >
            {isProcessing ? "⏳ Traitement..." : "✅ Confirmer"}
          </button>
          <button
            onClick={onClose}
            disabled={isProcessing}
            style={{ ...button, flex: 1, backgroundColor: "#f44336" }}
          >
            ❌ Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

// Styles
const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.85)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2000,
  padding: "16px"
};

const modal = {
  backgroundColor: "white",
  padding: "24px",
  borderRadius: "16px",
  width: "100%",
  maxWidth: "420px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
  maxHeight: "90vh",
  overflowY: "auto"
};

const modalTitle = {
  marginTop: 0,
  marginBottom: "20px",
  color: "#1a1a1a",
  fontSize: "22px",
  fontWeight: "700"
};

const infoBox = {
  backgroundColor: "#f9fafb",
  padding: "12px",
  borderRadius: "10px",
  marginBottom: "16px",
  border: "1px solid #e5e7eb"
};

const infoRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "8px 0",
  fontSize: "14px"
};

const infoLabel = {
  color: "#6b7280",
  fontWeight: "500"
};

const infoValue = {
  color: "#111827",
  fontSize: "14px"
};

const priceBox = {
  textAlign: "center",
  backgroundColor: "#f1f8e9",
  padding: "16px",
  borderRadius: "10px",
  marginBottom: "16px",
  border: "2px solid #4CAF50"
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontWeight: "600",
  fontSize: "13px",
  color: "#374151"
};

const labelSmall = {
  display: "block",
  marginBottom: "8px",
  fontSize: "12px",
  color: "#6b7280",
  fontWeight: "500"
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  fontSize: "20px",
  textAlign: "center",
  border: "2px solid #4CAF50",
  borderRadius: "8px",
  fontWeight: "bold",
  boxSizing: "border-box"
};

const quickAmountsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
  gap: "8px"
};

const quickButton = {
  padding: "10px 16px",
  backgroundColor: "#3b82f6",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "600",
  transition: "all 0.2s ease",
  whiteSpace: "nowrap"
};

const changeBox = {
  textAlign: "center",
  padding: "12px",
  borderRadius: "8px",
  marginTop: "12px"
};

const button = {
  padding: "12px 20px",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "15px",
  fontWeight: "600",
  transition: "all 0.2s ease"
};

// Add responsive styles
const paymentModalStyles = document.createElement("style");
paymentModalStyles.textContent = `
  @media (max-width: 768px) {
    .payment-modal-content {
      padding: 20px !important;
      width: 100% !important;
    }

    .payment-modal-content h2 {
      font-size: 20px !important;
    }

    .payment-modal-content input {
      font-size: 18px !important;
      padding: 10px !important;
    }

    .payment-modal-content button {
      font-size: 14px !important;
      padding: 12px 16px !important;
    }
  }

  @media (max-width: 480px) {
    .payment-modal-overlay {
      padding: 12px !important;
    }

    .payment-modal-content {
      padding: 16px !important;
    }

    .payment-modal-content h2 {
      font-size: 18px !important;
    }

    .payment-modal-content input {
      font-size: 16px !important;
    }

    .payment-modal-content button {
      font-size: 13px !important;
      padding: 10px 14px !important;
    }

    /* Quick amounts grid for small screens */
    div[style*="gridTemplateColumns: repeat(auto-fit, minmax(80px, 1fr))"] {
      grid-template-columns: repeat(3, 1fr) !important;
      gap: 6px !important;
    }

    div[style*="gridTemplateColumns: repeat(auto-fit, minmax(80px, 1fr))"] button {
      padding: 8px 12px !important;
      font-size: 12px !important;
    }
  }
`;

if (!document.getElementById('payment-modal-responsive-styles')) {
  paymentModalStyles.id = 'payment-modal-responsive-styles';
  document.head.appendChild(paymentModalStyles);
}

export default PaymentModal;