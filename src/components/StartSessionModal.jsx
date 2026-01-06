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

  console.log("📋 Modal opened with games:", games);
  console.log("🎮 Selected game:", selectedGame);
  console.log("💰 Available pricings:", availablePricings);

  return (
    <div style={overlay}>
      <div style={modal}>
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
          <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
            <span style={{ marginRight: "6px" }}>⏱️</span>
            Durée:
          </label>
          <select
            value={selectedPricing}
            onChange={(e) => setSelectedPricing(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              fontSize: "15px",
              border: "2px solid #e5e7eb",
              borderRadius: "10px",
              backgroundColor: "#f9fafb",
              cursor: "pointer"
            }}
            disabled={!selectedGame || availablePricings.length === 0}
          >
            <option value="">-- Sélectionner une durée --</option>
            {availablePricings.map((pricing) => (
              <option key={pricing.id} value={pricing.id}>
                {pricing.duration_minutes} min - {pricing.price} DH
              </option>
            ))}
          </select>
          {selectedGame && availablePricings.length === 0 && (
            <small style={{ color: "#ef4444", display: "block", marginTop: "5px" }}>
              ⚠️ Aucun tarif disponible pour ce jeu
            </small>
          )}
          {!selectedGame && (
            <small style={{ color: "#6b7280", display: "block", marginTop: "5px" }}>
              Veuillez d'abord sélectionner un jeu
            </small>
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

export default StartSessionModal;
