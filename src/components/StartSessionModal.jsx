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
        <h3 style={{ margin: "0 0 20px 0", fontSize: "24px", fontWeight: "700", color: "#111827" }}>
          Démarrer Session - {machine.name}
        </h3>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
            <span style={{ marginRight: "6px" }}>🎮</span>
            Jeu:
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
            <option value="">-- Sélectionner un jeu --</option>
            {games.length === 0 && <option disabled>Aucun jeu disponible</option>}
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <small style={{ color: "#6b7280", display: "block", marginTop: "5px" }}>
            {games.length} jeu(x) disponible(s)
          </small>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: "16px", fontWeight: "700", color: "#111827", marginBottom: "12px" }}>
            Choisir le mode de facturation:
          </label>

          {/* Options de tarification sous forme de cartes */}
          {selectedGame && availablePricings.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {availablePricings.map((pricing) => {
                const mode = pricing.pricing_mode?.code || 'fixed';
                const isSelected = selectedPricing === String(pricing.id);
                const isPerMatch = mode === 'per_match';

                return (
                  <div
                    key={pricing.id}
                    onClick={() => setSelectedPricing(String(pricing.id))}
                    style={{
                      padding: "16px",
                      borderRadius: "10px",
                      border: isSelected ? `3px solid ${isPerMatch ? '#10b981' : '#3b82f6'}` : "2px solid #e5e7eb",
                      backgroundColor: isSelected
                        ? (isPerMatch ? '#f0fdf4' : '#eff6ff')
                        : '#f9fafb',
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      position: "relative"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: "18px",
                          fontWeight: "700",
                          color: isPerMatch ? '#059669' : '#1e40af',
                          marginBottom: "4px"
                        }}>
                          {isPerMatch ? '⚽ MODE PAR MATCH' : '⏱️ MODE PAR TEMPS'}
                        </div>
                        <div style={{ fontSize: "14px", color: "#6b7280" }}>
                          {isPerMatch
                            ? `${pricing.matches_count} match - ${pricing.price} DH`
                            : `${pricing.duration_minutes} minutes - ${pricing.price} DH`
                          }
                        </div>
                        {isPerMatch && (
                          <div style={{
                            fontSize: "12px",
                            color: "#059669",
                            marginTop: "4px",
                            fontStyle: "italic"
                          }}>
                            Prix final = nombre de matchs joués × {pricing.price} DH
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <div style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          backgroundColor: isPerMatch ? '#10b981' : '#3b82f6',
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
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
          ) : (
            <div style={{
              padding: "16px",
              backgroundColor: "#fef3c7",
              borderRadius: "10px",
              border: "2px solid #fbbf24",
              textAlign: "center",
              color: "#92400e"
            }}>
              {!selectedGame
                ? "⚠️ Veuillez d'abord sélectionner un jeu"
                : "⚠️ Aucun tarif disponible pour ce jeu"
              }
            </div>
          )}
        </div>

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
  padding: "32px",
  width: "450px",
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
