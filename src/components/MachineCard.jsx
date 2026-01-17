import { useEffect, useState } from "react";
import { Gamepad2, Check, Clock, Timer } from "lucide-react";

function MachineCard({ machine, onStart, onStop, onExtend, games }) {
  const [elapsed, setElapsed] = useState(0);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [selectedExtendPricing, setSelectedExtendPricing] = useState("");
  const [autoStopTriggered, setAutoStopTriggered] = useState(false);

  useEffect(() => {
    if (machine.status !== "in_session" || !machine.active_session) {
      setElapsed(0);
      setAutoStopTriggered(false);
      return;
    }

    const startTime = new Date(machine.active_session.start_time).getTime();
    const pricingMode = machine.active_session.pricing_mode || 'fixed';

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - startTime) / 1000);
      setElapsed(elapsedSeconds);

      // AUTO-STOP seulement pour le mode "fixed" (par temps)
      if (pricingMode === 'fixed' && machine.active_session.duration_minutes) {
        const durationMinutes = machine.active_session.duration_minutes;
        const totalSeconds = durationMinutes * 60;
        const remainingSeconds = totalSeconds - elapsedSeconds;

        // AUTO-STOP quand le temps est écoulé
        if (remainingSeconds <= 0 && !autoStopTriggered) {
          setAutoStopTriggered(true);

          setTimeout(() => {
            onStop(machine.active_session.id);
          }, 5000);
        }
      }
      // Pour le mode "per_match", pas d'auto-stop
    }, 1000);

    return () => clearInterval(interval);
  }, [machine.status, machine.active_session?.start_time, machine.active_session?.pricing_mode, autoStopTriggered, machine.name, onStop]);

  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;

    if (h > 0) {
      return `${h}:${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
    }
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const getRemainingTime = () => {
    if (!machine.active_session) return 0;
    const pricingMode = machine.active_session.pricing_mode || 'fixed';

    // Pour le mode par match, pas de temps restant
    if (pricingMode === 'per_match') return null;

    const durationMinutes = machine.active_session.duration_minutes || 6;
    const totalSeconds = durationMinutes * 60;
    return Math.max(0, totalSeconds - elapsed);
  };

  const pricingMode = machine.active_session?.pricing_mode || 'fixed';
  const remainingSeconds = getRemainingTime();
  const isExpired = remainingSeconds === 0 && machine.status === "in_session" && pricingMode === 'fixed';
  const isInSession = machine.status === "in_session";
  const isPerMatchMode = pricingMode === 'per_match';

  const handleExtend = () => {
    if (!selectedExtendPricing) {
      alert("Sélectionnez une durée");
      return;
    }
    onExtend(machine.active_session.id, selectedExtendPricing);
    setShowExtendModal(false);
    setSelectedExtendPricing("");
  };

  return (
    <div className="machine-card" style={{
      background: "white",
      borderRadius: "16px",
      padding: "24px",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
      transition: "all 0.3s ease",
      position: "relative",
      overflow: "hidden",
      border: isInSession ? "2px solid #f59e0b" : "2px solid #e5e7eb"
    }}>
      {/* Status Bar */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "4px",
        background: isInSession
          ? "linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)"
          : "linear-gradient(90deg, #10b981 0%, #34d399 100%)"
      }} />

      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "16px"
      }}>
        <h3 style={{
          margin: 0,
          fontSize: "20px",
          fontWeight: "700",
          color: "#111827"
        }}>
          {machine.name}
        </h3>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 12px",
          borderRadius: "20px",
          fontSize: "13px",
          fontWeight: "600",
          color: "white",
          background: isInSession
            ? "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)"
            : "linear-gradient(135deg, #10b981 0%, #059669 100%)"
        }}>
          {isInSession ? <Gamepad2 size={16} /> : <Check size={16} />}
          {isInSession ? "EN SESSION" : "DISPONIBLE"}
        </div>
      </div>

      {isInSession && machine.active_session && (
        <>
          {/* Timer Display - Seulement pour mode par temps */}
          {!isPerMatchMode && (
            <div style={{
              background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "16px",
              textAlign: "center"
            }}>
              <div style={{
                fontSize: "48px",
                fontWeight: "700",
                color: isExpired ? "#ef4444" : "#3b82f6",
                lineHeight: "1",
                marginBottom: "8px",
                fontFamily: "monospace"
              }}>
                {formatTime(elapsed)}
              </div>
              <div style={{
                fontSize: "14px",
                fontWeight: "600",
                color: isExpired ? "#ef4444" : "#6b7280"
              }}>
                {isExpired ? <><Clock size={16} style={{display: 'inline', verticalAlign: 'middle', marginRight: '4px'}} /> TEMPS ÉCOULÉ !</> : <><Timer size={16} style={{display: 'inline', verticalAlign: 'middle', marginRight: '4px'}} /> Reste: {formatTime(remainingSeconds)}</>}
              </div>
            </div>
          )}

          {/* Game Info */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
            marginBottom: "16px"
          }}>
            <Gamepad2 size={24} color="#6366f1" />
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#111827"
              }}>
                {machine.active_session.game_name || "N/A"}
              </div>
              <div style={{
                fontSize: "12px",
                color: "#6b7280"
              }}>
                {isPerMatchMode
                  ? `⚽ Par Match (${machine.active_session.matches_count || 1} match = ${machine.active_session.price || 6} DH)`
                  : `${machine.active_session.duration_minutes} minutes`
                }
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => onStop(machine.active_session.id)}
              style={{
                flex: isPerMatchMode ? "none" : 1,
                width: isPerMatchMode ? "100%" : "auto",
                padding: "12px 16px",
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                color: "white",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "all 0.2s ease",
                boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(239, 68, 68, 0.4)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.3)";
              }}
            >
              <span>⏹️</span>
              Arrêter
            </button>

            {/* Bouton Prolonger seulement pour mode par temps */}
            {!isPerMatchMode && (
              <button
                onClick={() => setShowExtendModal(true)}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  transition: "all 0.2s ease",
                  boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(245, 158, 11, 0.4)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(245, 158, 11, 0.3)";
                }}
              >
                <span>➕</span>
                Prolonger
              </button>
            )}
          </div>
        </>
      )}

      {!isInSession && (
        <button
          onClick={() => onStart(machine)}
          style={{
            width: "100%",
            padding: "14px 20px",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "all 0.2s ease",
            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(16, 185, 129, 0.4)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.3)";
          }}
        >
          <span>▶️</span>
          Démarrer une session
        </button>
      )}

      {/* Modal Prolongation */}
      {showExtendModal && (
        <div className="modal-overlay" style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          animation: "fadeIn 0.3s ease",
          padding: "20px"
        }}>
          <div className="modal-content" style={{
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "32px",
            width: "400px",
            maxWidth: "100%",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)"
          }}>
            <h3 style={{
              margin: "0 0 8px 0",
              fontSize: "24px",
              fontWeight: "700",
              color: "#111827"
            }}>
              Prolonger la session
            </h3>
            <p style={{
              color: "#6b7280",
              fontSize: "14px",
              marginBottom: "20px"
            }}>
              {machine.name} - {machine.active_session?.game_name || "N/A"}
            </p>

            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px"
            }}>
              Choisir la durée
            </label>
            <select
              value={selectedExtendPricing}
              onChange={(e) => setSelectedExtendPricing(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                fontSize: "15px",
                border: "2px solid #e5e7eb",
                borderRadius: "10px",
                backgroundColor: "#f9fafb",
                transition: "all 0.2s ease",
                cursor: "pointer"
              }}
            >
              <option value="">-- Choisir la durée --</option>
              {machine.active_session && games.length > 0 && (() => {
                const currentGame = games.find(g => g.name === machine.active_session.game_name);
                if (currentGame && currentGame.pricings) {
                  return currentGame.pricings.map((pricing) => (
                    <option key={pricing.id} value={pricing.id}>
                      {pricing.duration_minutes} min - {pricing.price} DH
                    </option>
                  ));
                }
                return <option disabled>Aucun tarif disponible</option>;
              })()}
            </select>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button
                onClick={handleExtend}
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "15px",
                  fontWeight: "600",
                  transition: "all 0.2s ease",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)"
                }}
              >
                Confirmer
              </button>
              <button
                onClick={() => {
                  setShowExtendModal(false);
                  setSelectedExtendPricing("");
                }}
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
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add responsive styles for MachineCard
const machineCardStyles = document.createElement("style");
machineCardStyles.textContent = `
  @media (max-width: 768px) {
    /* Machine card responsive */
    .machine-card {
      padding: 20px !important;
    }

    /* Machine card header */
    .machine-card h3 {
      font-size: 18px !important;
    }

    /* Timer display */
    .machine-card > div > div[style*="fontSize: 48px"] {
      font-size: 36px !important;
    }

    /* Action buttons in cards */
    .machine-card button {
      font-size: 14px !important;
      padding: 12px 14px !important;
    }

    /* Modal content */
    .modal-content {
      padding: 24px !important;
      margin: 20px !important;
    }

    .modal-content h3 {
      font-size: 20px !important;
    }

    .modal-content select {
      font-size: 14px !important;
    }

    .modal-content button {
      font-size: 14px !important;
      padding: 12px 16px !important;
    }
  }

  @media (max-width: 480px) {
    /* Small mobile */
    .machine-card {
      padding: 16px !important;
    }

    .machine-card h3 {
      font-size: 16px !important;
    }

    .machine-card > div > div[style*="fontSize: 48px"] {
      font-size: 32px !important;
    }

    .modal-content {
      padding: 20px !important;
    }

    .modal-content h3 {
      font-size: 18px !important;
    }
  }
`;

// Only append once
if (!document.getElementById('machine-card-responsive-styles')) {
  machineCardStyles.id = 'machine-card-responsive-styles';
  document.head.appendChild(machineCardStyles);
}

export default MachineCard;
