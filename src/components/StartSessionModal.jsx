import { useState, useEffect } from "react";

function StartSessionModal({
  machine,
  games,
  selectedGame,
  setSelectedGame,
  selectedPricing,
  setSelectedPricing,
  onConfirm,
  onClose,
}) {
  const [availablePricings, setAvailablePricings] = useState([]);

  // Trouver le jeu sélectionné pour afficher ses pricings
  useEffect(() => {
    if (selectedGame) {
      const game = games.find(g => g.id === Number(selectedGame));
      if (game && game.pricings) {
        setAvailablePricings(game.pricings);
      } else {
        setAvailablePricings([]);
      }
    } else {
      setAvailablePricings([]);
      setSelectedPricing("");
    }
  }, [selectedGame, games, setSelectedPricing]);


  return (
    <div className="session-modal-overlay" style={overlay}>
      <div className="session-modal-content" style={modal}>
        <h3 style={{ margin: "0 0 20px 0", fontSize: "22px", fontWeight: "700", color: "#111827", textAlign: "center" }}>
          🎮 {machine.name}
        </h3>

        {/* Ligne avec 2 colonnes */}
        <div style={{ display: "flex", gap: "16px", marginBottom: 20 }}>
          {/* Colonne 1: Sélection du jeu */}
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
              Jeu
            </label>
            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                fontSize: "15px",
                border: "2px solid #e5e7eb",
                borderRadius: "10px",
                backgroundColor: "#f9fafb",
                cursor: "pointer"
              }}
            >
              <option value="">-- Choisir --</option>
              {games.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Colonne 2: Nombre de tarifs disponibles (info) */}
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
              Modes disponibles
            </label>
            <div style={{
              padding: "12px 14px",
              fontSize: "15px",
              border: "2px solid #e5e7eb",
              borderRadius: "10px",
              backgroundColor: "#f0fdf4",
              textAlign: "center",
              fontWeight: "600",
              color: "#059669"
            }}>
              {selectedGame && availablePricings.length > 0
                ? `${availablePricings.length} mode(s)`
                : "Choisir un jeu"}
            </div>
          </div>
        </div>

        {/* Section modes de tarification */}
        {selectedGame && availablePricings.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "10px" }}>
              Mode de facturation
            </label>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {availablePricings.map((pricing) => {
                const mode = pricing.pricing_mode?.code || 'fixed';
                const isSelected = selectedPricing === String(pricing.id);
                const isPerMatch = mode === 'per_match';

                return (
                  <div
                    key={pricing.id}
                    onClick={() => setSelectedPricing(String(pricing.id))}
                    style={{
                      padding: "14px",
                      borderRadius: "10px",
                      border: isSelected ? `3px solid ${isPerMatch ? '#10b981' : '#3b82f6'}` : "2px solid #e5e7eb",
                      backgroundColor: isSelected
                        ? (isPerMatch ? '#f0fdf4' : '#eff6ff')
                        : '#f9fafb',
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: "16px",
                          fontWeight: "700",
                          color: isPerMatch ? '#059669' : '#1e40af',
                          marginBottom: "2px"
                        }}>
                          {isPerMatch ? '⚽ Par Match' : '⏱️ Par Temps'}
                        </div>
                        <div style={{ fontSize: "13px", color: "#6b7280" }}>
                          {isPerMatch
                            ? `${pricing.matches_count} match × ${pricing.price} DH`
                            : `${pricing.duration_minutes} min = ${pricing.price} DH`
                          }
                        </div>
                      </div>
                      {isSelected && (
                        <div style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          backgroundColor: isPerMatch ? '#10b981' : '#3b82f6',
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: "700"
                        }}>
                          ✓
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!selectedGame && (
          <div style={{
            padding: "14px",
            backgroundColor: "#fef3c7",
            borderRadius: "10px",
            border: "2px solid #fbbf24",
            textAlign: "center",
            color: "#92400e",
            fontSize: "14px",
            marginBottom: 20
          }}>
            ⚠️ Sélectionnez un jeu pour voir les modes
          </div>
        )}

        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
          <button
            onClick={onConfirm}
            disabled={!selectedGame || !selectedPricing}
            style={{
              flex: 1,
              padding: "12px 20px",
              background: !selectedGame || !selectedPricing
                ? "#9ca3af"
                : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: !selectedGame || !selectedPricing ? "not-allowed" : "pointer",
              fontSize: "15px",
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
              padding: "12px 20px",
              backgroundColor: "#f9fafb",
              color: "#374151",
              border: "2px solid #e5e7eb",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "15px",
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
  zIndex: 1000,
};

const modal = {
  background: "#fff",
  padding: "28px",
  width: "550px",
  maxWidth: "90%",
  borderRadius: "16px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  color: "#000",
};

// Add responsive styles
const sessionModalStyles = document.createElement("style");
sessionModalStyles.textContent = `
  .session-modal-overlay {
    padding: 20px !important;
  }

  @media (max-width: 768px) {
    .session-modal-content {
      padding: 24px !important;
      width: 100% !important;
      max-width: 100% !important;
    }

    .session-modal-content h3 {
      font-size: 20px !important;
    }

    .session-modal-content select {
      font-size: 14px !important;
      padding: 10px 12px !important;
    }

    .session-modal-content button {
      font-size: 14px !important;
      padding: 12px 16px !important;
    }
  }

  @media (max-width: 480px) {
    .session-modal-overlay {
      padding: 16px !important;
    }

    .session-modal-content {
      padding: 20px !important;
    }

    .session-modal-content h3 {
      font-size: 18px !important;
    }

    .session-modal-content select {
      font-size: 13px !important;
    }
  }
`;

if (!document.getElementById('session-modal-responsive-styles')) {
  sessionModalStyles.id = 'session-modal-responsive-styles';
  document.head.appendChild(sessionModalStyles);
}

export default StartSessionModal;
