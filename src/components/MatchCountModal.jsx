import { useState } from "react";

function MatchCountModal({ session, onConfirm, onClose }) {
  const [matchCount, setMatchCount] = useState("");

  const handleConfirm = () => {
    const count = parseInt(matchCount);
    if (!count || count < 1) {
      alert("Veuillez entrer un nombre de matchs valide (minimum 1)");
      return;
    }
    onConfirm(count);
  };

  const pricePerMatch = session?.gamePricing?.price || 6;
  const totalPrice = matchCount ? pricePerMatch * parseInt(matchCount) : 0;

  return (
    <div className="match-modal-overlay" style={overlay}>
      <div className="match-modal-content" style={modal}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "24px", fontWeight: "700", color: "#111827" }}>
          ⚽ Nombre de Matchs Joués
        </h3>

        <div style={{
          backgroundColor: "#f0fdf4",
          padding: "16px",
          borderRadius: "12px",
          marginBottom: "20px",
          border: "2px solid #86efac"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span style={{ fontSize: "20px" }}>🎮</span>
            <span style={{ fontSize: "16px", fontWeight: "600", color: "#166534" }}>
              {session?.game?.name || "FIFA/PES"}
            </span>
          </div>
          <div style={{ fontSize: "14px", color: "#16a34a" }}>
            Prix par match: <strong>{pricePerMatch} DH</strong>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{
            display: "block",
            fontSize: "14px",
            fontWeight: "600",
            color: "#374151",
            marginBottom: "8px"
          }}>
            Combien de matchs ont été joués?
          </label>
          <input
            type="number"
            min="1"
            value={matchCount}
            onChange={(e) => setMatchCount(e.target.value)}
            placeholder="Ex: 3"
            style={{
              width: "100%",
              padding: "14px 16px",
              fontSize: "18px",
              border: "2px solid #e5e7eb",
              borderRadius: "10px",
              backgroundColor: "#f9fafb",
              textAlign: "center",
              fontWeight: "600",
              color: "#111827",
              boxSizing: "border-box"
            }}
            autoFocus
          />
        </div>

        {matchCount && parseInt(matchCount) > 0 && (
          <div style={{
            backgroundColor: "#eff6ff",
            padding: "16px",
            borderRadius: "12px",
            marginBottom: "20px",
            border: "2px solid #93c5fd",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "14px", color: "#1e40af", marginBottom: "8px" }}>
              Calcul:
            </div>
            <div style={{ fontSize: "20px", fontWeight: "700", color: "#1e3a8a" }}>
              {matchCount} match(s) × {pricePerMatch} DH = {totalPrice} DH
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
          <button
            onClick={handleConfirm}
            disabled={!matchCount || parseInt(matchCount) < 1}
            style={{
              flex: 1,
              padding: "14px 20px",
              background: !matchCount || parseInt(matchCount) < 1
                ? "#9ca3af"
                : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: !matchCount || parseInt(matchCount) < 1 ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "600",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)"
            }}
          >
            <span>✓</span> Confirmer
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "14px 20px",
              backgroundColor: "#f9fafb",
              color: "#374151",
              border: "2px solid #e5e7eb",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
              transition: "all 0.2s ease"
            }}
          >
            <span>✕</span> Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1001,
  animation: "fadeIn 0.3s ease"
};

const modal = {
  background: "#fff",
  padding: "32px",
  width: "450px",
  maxWidth: "90%",
  borderRadius: "16px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  color: "#000",
  animation: "slideUp 0.3s ease"
};

// Add animations
const matchModalStyles = document.createElement("style");
matchModalStyles.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      transform: translateY(30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .match-modal-overlay {
    padding: 20px !important;
  }

  @media (max-width: 768px) {
    .match-modal-content {
      padding: 24px !important;
      width: 100% !important;
      max-width: 100% !important;
    }

    .match-modal-content h3 {
      font-size: 20px !important;
    }

    .match-modal-content input {
      font-size: 16px !important;
      padding: 12px 14px !important;
    }

    .match-modal-content button {
      font-size: 14px !important;
      padding: 12px 16px !important;
    }
  }

  @media (max-width: 480px) {
    .match-modal-overlay {
      padding: 16px !important;
    }

    .match-modal-content {
      padding: 20px !important;
    }

    .match-modal-content h3 {
      font-size: 18px !important;
    }
  }
`;

if (!document.getElementById('match-modal-responsive-styles')) {
  matchModalStyles.id = 'match-modal-responsive-styles';
  document.head.appendChild(matchModalStyles);
}

export default MatchCountModal;
