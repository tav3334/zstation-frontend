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
import ThemeToggle from "../components/ThemeToggle";

function Dashboard({ user, onLogout }) {
  const [machines, setMachines] = useState([]);
  const [games, setGames] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [selectedGame, setSelectedGame] = useState("");
  const [selectedPricing, setSelectedPricing] = useState("");
  const [paymentSession, setPaymentSession] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [toast, setToast] = useState(null);

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
      console.log("MACHINES:", res.data);
      setMachines(res.data);
    } catch (e) {
      console.error("LOAD MACHINES ERROR", e);
      showToast("Erreur chargement machines: " + (e.response?.data?.message || e.message), "error");
    }
  };

  const loadGames = async () => {
    try {
      console.log("🔄 Chargement des jeux...");
      const res = await api.get("/games");
      console.log("✅ GAMES LOADED:", res.data);

      if (!res.data || res.data.length === 0) {
        console.warn("⚠️ Aucun jeu trouvé dans la base de données");
        showToast("Aucun jeu disponible. Ajoutez des jeux dans la base de données.", "warning");
      }

      setGames(res.data);
    } catch (e) {
      console.error("❌ LOAD GAMES ERROR:", e);
      console.error("Response:", e.response?.data);
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
        console.error('Auto-stop check error:', e);
      }
    }, 30000);

    return () => {
      clearInterval(machineInterval);
      clearInterval(autoStopInterval);
    };
  }, []);

  // ================= START SESSION =================
  const startSession = async () => {
    console.log("START SESSION PAYLOAD:", {
      machine_id: selectedMachine?.id,
      game_id: Number(selectedGame),
      game_pricing_id: Number(selectedPricing),
      pricing_mode_id: 1,
      customer_id: null,
    });

    if (!selectedMachine || !selectedGame || !selectedPricing) {
      showToast("Veuillez sélectionner machine, jeu et durée", "warning");
      return;
    }

    try {
      const response = await api.post("/sessions/start", {
        machine_id: selectedMachine.id,
        game_id: Number(selectedGame),
        game_pricing_id: Number(selectedPricing),
        pricing_mode_id: 1,
        customer_id: null,
      });

      console.log("SESSION STARTED:", response.data);
      showToast("Session démarrée avec succès!", "success");

      // Reset modal
      setSelectedMachine(null);
      setSelectedGame("");
      setSelectedPricing("");

      // Reload machines
      await loadMachines();
    } catch (e) {
      console.error("START SESSION ERROR:", e.response?.data || e);
      showToast("Erreur démarrage session: " + (e.response?.data?.message || e.message), "error");
    }
  };

  // ================= STOP SESSION =================
  const stopSession = async (sessionId) => {
    try {
      const res = await api.post(`/sessions/stop/${sessionId}`);
      console.log("SESSION STOPPED:", res.data);

      // Ouvrir le modal de paiement
      setPaymentSession(res.data);
      await loadMachines();
    } catch (e) {
      console.error("STOP SESSION ERROR:", e.response?.data || e);
      showToast("Erreur arrêt session: " + (e.response?.data?.message || e.message), "error");
    }
  };

  // ================= PROCESS PAYMENT =================
  const processPayment = async (sessionId, amountGiven) => {
    try {
      console.log("💰 Processing payment:", { sessionId, amountGiven });

      const res = await api.post('/payments', {
        session_id: sessionId,
        amount_given: amountGiven
      });

      console.log("✅ PAYMENT SUCCESS:", res.data);

      const receipt = res.data.receipt;

      if (!receipt) {
        console.error("❌ NO RECEIPT in response!");
        showToast("Erreur: Reçu non généré par le serveur", "error");
        return;
      }

      console.log("📄 Receipt data:", receipt);

      // Générer et télécharger le reçu
      try {
        generateReceipt(receipt);
        console.log("✅ Receipt generated and downloaded!");
      } catch (receiptError) {
        console.error("❌ Receipt generation error:", receiptError);
        showToast("Erreur lors de la génération du reçu: " + receiptError.message, "error");
      }

      showToast(`Paiement enregistré avec succès! Montant: ${receipt.amount} - Monnaie: ${receipt.change}`, "success", 5000);

      setPaymentSession(null);
      await loadMachines();
    } catch (e) {
      console.error("❌ PAYMENT ERROR:", e.response?.data || e);
      showToast("Erreur paiement: " + (e.response?.data?.message || e.message), "error");
    }
  };

  // ================= GENERATE RECEIPT =================
  const generateReceipt = (receipt) => {
    console.log("📝 Generating receipt with data:", receipt);

    const receiptContent = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         ZSTATION
     Gaming Station Management
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Date: ${receipt.date}
Session: #${receipt.session_id}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉTAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Machine: ${receipt.machine}
Jeu: ${receipt.game}
Durée: ${receipt.duration}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAIEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Montant: ${receipt.amount}
Donné: ${receipt.amount_given}
Monnaie: ${receipt.change}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Merci et à bientôt !
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

    console.log("📄 Receipt content created, length:", receiptContent.length);

    try {
      // Créer un blob et le télécharger
      const blob = new Blob([receiptContent], { type: 'text/plain' });
      console.log("📦 Blob created, size:", blob.size);

      const url = window.URL.createObjectURL(blob);
      console.log("🔗 URL created:", url);

      const link = document.createElement('a');
      link.href = url;
      const filename = `Recu_${receipt.session_id}_${new Date().getTime()}.txt`;
      link.download = filename;

      console.log("💾 Downloading file:", filename);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("✅ Receipt download triggered successfully!");
    } catch (error) {
      console.error("❌ Error in receipt generation:", error);
      throw error;
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
      console.error("EXTEND SESSION ERROR:", e.response?.data || e);
      alert("Erreur prolongation: " + (e.response?.data?.message || e.message));
    }
  };

  // Calculer les stats en temps réel
  const activeSessions = machines.filter(m => m.status === 'occupied').length;
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

      <div style={contentWrapper}>
        {/* Header */}
        <div style={header}>
          <div>
            <h1 style={headerTitle}>
              <Gamepad2 size={32} />
              Point de Vente ZSTATION
            </h1>
            <p style={headerSubtitle}>
              {user.role === "agent" ? <User size={16} /> : <Crown size={16} />} {user.role === "agent" ? "Agent" : "Admin"} - {user.name}
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <ThemeToggle />
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
          <div style={statsGrid}>
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
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                gap: "20px"
              }}>
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

        {paymentSession && (
          <PaymentModal
            session={paymentSession}
            onConfirm={processPayment}
            onClose={() => setPaymentSession(null)}
          />
        )}

        {showProducts && (
          <ProductsModal
            onClose={() => setShowProducts(false)}
            onSale={(message) => {
              showToast(message, "success");
              loadMachines();
            }}
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

export default Dashboard;
