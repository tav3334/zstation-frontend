import { useEffect, useState } from "react";

function MatchCountModal({ session, onConfirm, onClose }) {
  const [matchCount, setMatchCount] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleConfirm = () => {
    const count = parseInt(matchCount, 10);
    if (!count || count < 1) {
      setFormError("Veuillez entrer un nombre de matchs valide (minimum 1).");
      return;
    }

    setFormError("");
    onConfirm(count);
  };

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const pricePerMatch = session?.gamePricing?.price || 6;
  const totalPrice = matchCount ? pricePerMatch * parseInt(matchCount, 10) : 0;

  return (
    <div
      className="match-modal-overlay"
      style={overlay}
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        className="match-modal-content"
        style={modal}
        role="dialog"
        aria-modal="true"
        aria-label="Nombre de matchs joues"
      >
        <h3 style={{ margin: "0 0 20px 0", fontSize: "26px", fontWeight: "700", color: "#111827", textAlign: "center" }}>
          Combien de matchs joues ?
        </h3>

        <div
          style={{
            backgroundColor: "#10b981",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "24px",
            textAlign: "center",
            color: "white",
          }}
        >
          <div style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>
            {session?.game?.name || "FIFA/PES"}
          </div>
          <div style={{ fontSize: "24px", fontWeight: "700" }}>
            {pricePerMatch} DH / match
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label
            style={{
              display: "block",
              fontSize: "16px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "12px",
              textAlign: "center",
            }}
          >
            Nombre de matchs
          </label>
          <input
            type="number"
            min="1"
            value={matchCount}
            onChange={(event) => {
              setMatchCount(event.target.value);
              if (formError) setFormError("");
            }}
            placeholder="0"
            style={{
              width: "100%",
              padding: "18px 20px",
              fontSize: "32px",
              border: "3px solid #10b981",
              borderRadius: "12px",
              backgroundColor: "#f0fdf4",
              textAlign: "center",
              fontWeight: "700",
              color: "#111827",
              boxSizing: "border-box",
            }}
            autoFocus
            aria-invalid={!!formError}
          />
        </div>

        {matchCount && parseInt(matchCount, 10) > 0 && (
          <div
            style={{
              backgroundColor: "#fef3c7",
              padding: "20px",
              borderRadius: "12px",
              marginBottom: "20px",
              textAlign: "center",
              border: "2px solid #fbbf24",
            }}
          >
            <div style={{ fontSize: "16px", color: "#92400e", marginBottom: "8px" }}>
              Total a payer
            </div>
            <div style={{ fontSize: "36px", fontWeight: "700", color: "#78350f" }}>
              {totalPrice} DH
            </div>
            <div style={{ fontSize: "14px", color: "#92400e", marginTop: "4px" }}>
              ({matchCount} x {pricePerMatch} DH)
            </div>
          </div>
        )}

        {formError && (
          <div style={errorBox} role="alert">
            {formError}
          </div>
        )}

        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
          <button
            onClick={handleConfirm}
            disabled={!matchCount || parseInt(matchCount, 10) < 1}
            style={{
              flex: 1,
              padding: "14px 20px",
              background: !matchCount || parseInt(matchCount, 10) < 1
                ? "#9ca3af"
                : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: !matchCount || parseInt(matchCount, 10) < 1 ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "600",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
            }}
            type="button"
          >
            Confirmer
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
              transition: "all 0.2s ease",
            }}
            type="button"
          >
            Annuler
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
  animation: "matchModalFadeIn 0.3s ease",
};

const modal = {
  background: "#fff",
  padding: "32px",
  width: "450px",
  maxWidth: "90%",
  borderRadius: "16px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  color: "#000",
  animation: "matchModalSlideUp 0.3s ease",
};

const errorBox = {
  marginTop: "10px",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #fca5a5",
  backgroundColor: "#fef2f2",
  color: "#b91c1c",
  fontSize: "13px",
  fontWeight: "600",
};

export default MatchCountModal;
