import { useEffect, useState } from "react";
import {
  Gamepad2,
  Crown,
  User,
  ShoppingBag,
  BarChart3,
  LogOut,
  Check,
  Monitor
} from "lucide-react";
import api from "../services/api";
import MachineCard from "../components/MachineCard";
import StartSessionModal from "../components/StartSessionModal";
import PaymentModal from "../components/PaymentModal";
import StatsCard from "../components/StatsCard";
import Toast from "../components/Toast";
import ProductsModal from "../components/ProductsModal";
import UserProfile from "../components/UserProfile";
import MatchCountModal from "../components/MatchCountModal";

function Dashboard({ user, onLogout }) {
  const [machines, setMachines] = useState([]);
  const [games, setGames] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [selectedGame, setSelectedGame] = useState("");
  const [selectedPricing, setSelectedPricing] = useState("");
  const [paymentSessions, setPaymentSessions] = useState([]);
  const [showStats, setShowStats] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [toast, setToast] = useState(null);
  const [matchCountSession, setMatchCountSession] = useState(null);

  // Helper pour afficher un toast
  const showToast = (message, type = "info", duration = 3000) => {
    setToast({ message, type, duration });
  };

  // Set default theme on mount
  useEffect(() => {
    if (!localStorage.getItem("theme")) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    }
  }, []);

  // ================= LOAD DATA =================
  const loadMachines = async () => {
    try {
      const res = await api.get("/machines");
      setMachines(res.data);
    } catch (e) {
      showToast("Erreur chargement machines: " + (e.response?.data?.message || e.message), "error");
    }
  };

  const loadGames = async () => {
    try {
      const res = await api.get("/games");

      if (!res.data || res.data.length === 0) {
        showToast("Aucun jeu disponible. Ajoutez des jeux dans la base de données.", "warning");
      }

      setGames(res.data);
    } catch (e) {
      showToast("Erreur chargement jeux: " + (e.response?.data?.message || e.message), "error");
    }
  };

  useEffect(() => {
    loadMachines();
    loadGames();

    // Recharger les machines toutes les 10 secondes
    const machineInterval = setInterval(loadMachines, 10000);

    // Vérifier l'auto-stop toutes les 30 secondes
    const autoStopInterval = setInterval(async () => {
      try {
        await api.get('/sessions/check-auto-stop');
        await loadMachines(); // Recharger après auto-stop
      } catch (e) {
      }
    }, 30000);

    return () => {
      clearInterval(machineInterval);
      clearInterval(autoStopInterval);
    };
  }, []);

  // ================= START SESSION =================
  const startSession = async () => {
    if (!selectedMachine || !selectedGame || !selectedPricing) {
      showToast("Veuillez sélectionner machine, jeu et durée", "warning");
      return;
    }

    try {
      await api.post("/sessions/start", {
        machine_id: selectedMachine.id,
        game_id: Number(selectedGame),
        game_pricing_id: Number(selectedPricing),
        pricing_mode_id: 1,
        customer_id: null,
      });

      showToast("Session démarrée avec succès!", "success");

      // Reset modal
      setSelectedMachine(null);
      setSelectedGame("");
      setSelectedPricing("");

      // Reload machines
      await loadMachines();
    } catch (e) {
      showToast("Erreur démarrage session: " + (e.response?.data?.message || e.message), "error");
    }
  };

  // ================= STOP SESSION =================
  const stopSession = async (sessionId) => {
    try {
      // Récupérer les informations de la session d'abord
      const sessionResponse = await api.get(`/sessions/status/${sessionId}`);
      const sessionStatus = sessionResponse.data;

      // Vérifier si c'est une session par match
      if (sessionStatus.pricing_mode === 'per_match') {
        // Demander le nombre de matchs via le modal
        const machine = machines.find(m => m.active_session?.id === sessionId);
        setMatchCountSession({
          id: sessionId,
          game: { name: sessionStatus.machine || 'FIFA/PES' },
          gamePricing: {
            price: parseFloat(sessionStatus.price_per_match) || 6
          }
        });
        return;
      }

      // Mode par temps: arrêter normalement
      const res = await api.post(`/sessions/stop/${sessionId}`);

      // Ajouter le modal de paiement à la liste (permet plusieurs modals simultanés)
      setPaymentSessions(prev => [...prev, res.data]);
      await loadMachines();
    } catch (e) {
      showToast("Erreur arrêt session: " + (e.response?.data?.message || e.message), "error");
    }
  };

  // ================= STOP SESSION WITH MATCH COUNT =================
  const stopSessionWithMatchCount = async (matchCount) => {
    if (!matchCountSession) return;

    try {
      const res = await api.post(`/sessions/stop/${matchCountSession.id}`, {
        matches_played: matchCount
      });

      // Fermer le modal de saisie de matchs
      setMatchCountSession(null);

      // Ajouter le modal de paiement à la liste
      setPaymentSessions(prev => [...prev, res.data]);
      await loadMachines();
    } catch (e) {
      showToast("Erreur arrêt session: " + (e.response?.data?.message || e.message), "error");
      setMatchCountSession(null);
    }
  };

  // ================= PROCESS PAYMENT =================
  const processPayment = async (sessionId, amountGiven) => {
    try {
      const res = await api.post('/payments', {
        session_id: sessionId,
        amount_given: amountGiven
      });

      const receipt = res.data.receipt;

      if (!receipt) {
        showToast("Erreur: Reçu non généré par le serveur", "error");
        return;
      }

      showToast(`Paiement enregistré avec succès! Montant: ${receipt.amount} - Monnaie: ${receipt.change}`, "success", 5000);

      // Retirer ce modal de la liste
      setPaymentSessions(prev => prev.filter(ps => ps.session.id !== sessionId));
      await loadMachines();
    } catch (e) {
      showToast("Erreur paiement: " + (e.response?.data?.message || e.message), "error");
    }
  };

  // ================= EXTEND SESSION =================
  const extendSession = async (sessionId, pricingId) => {
    try {
      const res = await api.post(`/sessions/extend/${sessionId}`, {
        game_pricing_id: pricingId
      });

      alert(`✅ Session prolongée ! Total payé : ${res.data.total_paid} DH`);
      await loadMachines();
    } catch (e) {
      alert("Erreur prolongation: " + (e.response?.data?.message || e.message));
    }
  };

  // Calculer les stats en temps réel
  const activeSessions = machines.filter(m => m.status === 'in_session').length;
  const availableMachines = machines.filter(m => m.status === 'available').length;

  // ================= RENDER =================
  return (
    <div style={container}>
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => setToast(null)}
        />
      )}

      {/* Background Gradients */}
      <div style={bgGradient1} />
      <div style={bgGradient2} />
      <div style={bgGradient3} />

      <div className="dashboard-content-wrapper" style={contentWrapper}>
        {/* Header */}
        <div className="dashboard-header" style={header}>
          <div className="dashboard-header-left">
            <h1 className="dashboard-header-title" style={headerTitle}>
              <Gamepad2 size={32} />
              Point de Vente ZSTATION
            </h1>
            <p className="dashboard-header-subtitle" style={headerSubtitle}>
              {user.role === "agent" ? <User size={16} /> : <Crown size={16} />} {user.role === "agent" ? "Agent" : "Admin"} - {user.name}
            </p>
          </div>
          <div className="dashboard-header-buttons" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              onClick={() => setShowProfile(true)}
              style={buttonInfo}
              onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              <User size={18} />
              Profil
            </button>
            <button
              onClick={() => setShowProducts(true)}
              style={buttonSuccess}
              onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              <ShoppingBag size={18} />
              Produits
            </button>
            <button
              onClick={() => setShowStats(!showStats)}
              style={buttonPrimary}
              onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              {showStats ? <Gamepad2 size={18} /> : <BarChart3 size={18} />}
              {showStats ? "Machines" : "Statistiques"}
            </button>
            <button
              onClick={onLogout}
              style={buttonDanger}
              onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              <LogOut size={18} />
              Déconnexion
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        {!showStats && (
          <div className="dashboard-stats-grid" style={statsGrid}>
            <div style={{...statCard, ...statCardGreen}}>
              <div style={statIcon}>
                <Check size={32} color="#10b981" />
              </div>
              <div style={statLabel}>Machines disponibles</div>
              <div style={statValue}>{availableMachines}</div>
            </div>

            <div style={{...statCard, ...statCardOrange}}>
              <div style={statIcon}>
                <Gamepad2 size={32} color="#f59e0b" />
              </div>
              <div style={statLabel}>Sessions actives</div>
              <div style={statValue}>{activeSessions}</div>
            </div>

            <div style={{...statCard, ...statCardBlue}}>
              <div style={statIcon}>
                <Monitor size={32} color="#3b82f6" />
              </div>
              <div style={statLabel}>Total machines</div>
              <div style={statValue}>{machines.length}</div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {showStats ? (
          <div style={card}>
            <h2 style={cardTitle}>
              <BarChart3 size={28} />
              Statistiques de vente
            </h2>
            <StatsCard />
          </div>
        ) : (
          <>
            {machines.length === 0 ? (
              <div style={card}>
                <div style={emptyState}>
                  Chargement des machines...
                </div>
              </div>
            ) : (
              <div className="dashboard-machines-grid">
                {machines.map((machine) => (
                  <MachineCard
                    key={machine.id}
                    machine={machine}
                    onStart={() => setSelectedMachine(machine)}
                    onStop={stopSession}
                    onExtend={extendSession}
                    games={games}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Modals */}
        {selectedMachine && (
          <StartSessionModal
            machine={selectedMachine}
            games={games}
            selectedGame={selectedGame}
            setSelectedGame={setSelectedGame}
            selectedPricing={selectedPricing}
            setSelectedPricing={setSelectedPricing}
            onConfirm={startSession}
            onClose={() => {
              setSelectedMachine(null);
              setSelectedGame("");
              setSelectedPricing("");
            }}
          />
        )}

        {matchCountSession && (
          <MatchCountModal
            session={matchCountSession}
            onConfirm={stopSessionWithMatchCount}
            onClose={() => setMatchCountSession(null)}
          />
        )}

        {paymentSessions.map((paymentSession, index) => (
          <PaymentModal
            key={paymentSession.session.id}
            session={paymentSession}
            onConfirm={processPayment}
            onClose={() => setPaymentSessions(prev => prev.filter(ps => ps.session.id !== paymentSession.session.id))}
            zIndex={2000 + index * 10}
          />
        ))}

        {showProducts && (
          <ProductsModal
            onClose={() => setShowProducts(false)}
            onSale={(message) => {
              showToast(message, "success");
              loadMachines();
            }}
          />
        )}

        {showProfile && (
          <UserProfile
            user={user}
            onClose={() => setShowProfile(false)}
            showToast={showToast}
          />
        )}
      </div>
    </div>
  );
}

// ================= STYLES =================
const container = {
  minHeight: "100vh",
  height: "100%",
  width: "100vw",
  background: "var(--bg-primary)",
  padding: "0",
  margin: "0",
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: "auto",
};

const bgGradient1 = {
  position: "fixed",
  top: "-20%",
  right: "-10%",
  width: "600px",
  height: "600px",
  background: "radial-gradient(circle, rgba(123,92,255,0.08) 0%, transparent 70%)",
  borderRadius: "50%",
  filter: "blur(80px)",
  pointerEvents: "none",
  zIndex: 1,
};

const bgGradient2 = {
  position: "fixed",
  bottom: "-20%",
  left: "-10%",
  width: "600px",
  height: "600px",
  background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
  borderRadius: "50%",
  filter: "blur(80px)",
  pointerEvents: "none",
  zIndex: 1,
};

const bgGradient3 = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "800px",
  height: "800px",
  background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)",
  borderRadius: "50%",
  filter: "blur(100px)",
  pointerEvents: "none",
  zIndex: 1,
};

const contentWrapper = {
  padding: "24px",
  position: "relative",
  zIndex: 10,
  minHeight: "100vh",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "32px",
  padding: "24px",
  background: "rgba(255, 255, 255, 0.03)",
  backdropFilter: "blur(20px)",
  borderRadius: "16px",
  border: "1px solid rgba(255, 255, 255, 0.05)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
};

const headerTitle = {
  margin: "0",
  fontSize: "28px",
  fontWeight: "700",
  color: "var(--text-primary)",
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const headerSubtitle = {
  margin: "8px 0 0 0",
  fontSize: "14px",
  color: "var(--text-secondary)",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const buttonPrimary = {
  padding: "12px 24px",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  fontSize: "15px",
  fontWeight: "600",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  transition: "all 0.2s ease",
  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
};

const buttonDanger = {
  padding: "12px 24px",
  background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
  color: "white",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  fontSize: "15px",
  fontWeight: "600",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  transition: "all 0.2s ease",
  boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
};

const buttonSuccess = {
  padding: "12px 24px",
  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  color: "white",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  fontSize: "15px",
  fontWeight: "600",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  transition: "all 0.2s ease",
  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
};

const buttonInfo = {
  padding: "12px 24px",
  background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
  color: "white",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  fontSize: "15px",
  fontWeight: "600",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  transition: "all 0.2s ease",
  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "20px",
  marginBottom: "32px",
};

const statCard = {
  background: "rgba(255, 255, 255, 0.03)",
  backdropFilter: "blur(20px)",
  borderRadius: "16px",
  padding: "24px",
  border: "1px solid rgba(255, 255, 255, 0.05)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  transition: "all 0.3s ease",
};

const statCardGreen = {
  borderLeft: "4px solid #10b981",
};

const statCardOrange = {
  borderLeft: "4px solid #f59e0b",
};

const statCardBlue = {
  borderLeft: "4px solid #3b82f6",
};

const statIcon = {
  fontSize: "32px",
  marginBottom: "12px",
};

const statLabel = {
  fontSize: "14px",
  color: "rgba(255, 255, 255, 0.6)",
  marginBottom: "8px",
  fontWeight: "500",
};

const statValue = {
  fontSize: "32px",
  fontWeight: "700",
  color: "var(--text-primary)",
};

const card = {
  background: "var(--bg-elevated)",
  backdropFilter: "blur(20px)",
  borderRadius: "16px",
  padding: "32px",
  border: "1px solid var(--border-primary)",
  boxShadow: "var(--shadow-lg)",
};

const cardTitle = {
  margin: "0 0 24px 0",
  fontSize: "24px",
  fontWeight: "700",
  color: "var(--text-primary)",
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const emptyState = {
  textAlign: "center",
  padding: "48px 24px",
  color: "var(--text-secondary)",
  fontSize: "16px",
};

// Add comprehensive responsive styles
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  /* Prevent horizontal scroll */
  body, html {
    overflow-x: hidden !important;
    max-width: 100vw !important;
  }

  /* Dashboard content wrapper */
  .dashboard-content-wrapper {
    max-width: 100vw;
    overflow-x: hidden;
  }

  /* Machines grid */
  .dashboard-machines-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
    width: 100%;
    max-width: 100%;
  }

  /* Stats grid */
  .dashboard-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    width: 100%;
    max-width: 100%;
  }

  /* ========== TABLET (1024px and below) ========== */
  @media (max-width: 1024px) {
    .dashboard-machines-grid {
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)) !important;
    }
  }

  /* ========== MOBILE (768px and below) ========== */
  @media (max-width: 768px) {
    /* Prevent horizontal overflow */
    body, html, #root {
      overflow-x: hidden !important;
      max-width: 100vw !important;
    }

    /* Content wrapper */
    .dashboard-content-wrapper {
      padding: 16px !important;
    }

    /* Header */
    .dashboard-header {
      flex-direction: column !important;
      gap: 16px !important;
      padding: 20px 16px !important;
      align-items: stretch !important;
    }

    .dashboard-header-left {
      width: 100% !important;
      text-align: center !important;
    }

    .dashboard-header-title {
      font-size: 22px !important;
      justify-content: center !important;
    }

    .dashboard-header-subtitle {
      font-size: 12px !important;
      justify-content: center !important;
    }

    .dashboard-header-buttons {
      width: 100% !important;
      flex-direction: column !important;
      gap: 10px !important;
    }

    .dashboard-header-buttons button {
      width: 100% !important;
      justify-content: center !important;
      padding: 12px 16px !important;
      font-size: 14px !important;
    }

    /* Stats grid - single column */
    .dashboard-stats-grid {
      grid-template-columns: 1fr !important;
      gap: 16px !important;
    }

    .dashboard-stats-grid > div {
      padding: 20px !important;
    }

    /* Stat values */
    .dashboard-stats-grid div[style*="fontSize: 32px"] {
      font-size: 28px !important;
    }

    /* Machines grid - single column */
    .dashboard-machines-grid {
      grid-template-columns: 1fr !important;
      gap: 16px !important;
    }

    /* Card titles */
    h2 {
      font-size: 20px !important;
    }
  }

  /* ========== SMALL MOBILE (480px and below) ========== */
  @media (max-width: 480px) {
    .dashboard-content-wrapper {
      padding: 12px !important;
    }

    .dashboard-header {
      padding: 16px 12px !important;
    }

    .dashboard-header-title {
      font-size: 18px !important;
    }

    .dashboard-header-subtitle {
      font-size: 11px !important;
    }

    .dashboard-header-buttons button {
      font-size: 13px !important;
      padding: 10px 14px !important;
    }

    .dashboard-stats-grid > div {
      padding: 16px !important;
    }

    .dashboard-stats-grid div[style*="fontSize: 32px"] {
      font-size: 24px !important;
    }

    h2 {
      font-size: 18px !important;
    }
  }
`;

// Only append once
if (!document.getElementById('dashboard-responsive-styles')) {
  styleSheet.id = 'dashboard-responsive-styles';
  document.head.appendChild(styleSheet);
}

export default Dashboard;
