import { useState, useEffect } from "react";
import api from "../services/api";
import {
  Wallet,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  History,
  X
} from "lucide-react";

function CashRegister({ isAdmin = false, accentColor = "#f59e0b" }) {
  const [register, setRegister] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showOpeningModal, setShowOpeningModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [history, setHistory] = useState([]);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRegister();
    const interval = setInterval(() => loadRegister(false), 60000);
    return () => clearInterval(interval);
  }, []);

  const loadRegister = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await api.get("/cash-register/today");
      setRegister(res.data.register);
      setError(null);
    } catch (e) {
      setError("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await api.get("/cash-register/history?limit=14");
      setHistory(res.data.registers || []);
      setShowHistoryModal(true);
    } catch (e) {
      setError("Erreur de chargement historique");
    }
  };

  const handleSetOpeningBalance = async () => {
    if (!amount || parseFloat(amount) < 0) return;
    setProcessing(true);
    try {
      const res = await api.post("/cash-register/opening-balance", {
        amount: parseFloat(amount)
      });
      setRegister(res.data.register);
      setShowOpeningModal(false);
      setAmount("");
    } catch (e) {
      setError(e.response?.data?.message || "Erreur");
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setProcessing(true);
    try {
      const res = await api.post("/cash-register/withdraw", {
        amount: parseFloat(amount),
        notes: notes
      });
      setRegister(res.data.register);
      setShowWithdrawModal(false);
      setAmount("");
      setNotes("");
    } catch (e) {
      setError(e.response?.data?.message || "Erreur");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <RefreshCw size={24} color={accentColor} className="spin" />
        <span style={styles.loadingText}>Chargement caisse...</span>
      </div>
    );
  }

  if (!register) {
    return (
      <div style={styles.errorContainer}>
        <AlertCircle size={24} color="#ef4444" />
        <span style={styles.errorText}>{error || "Caisse non disponible"}</span>
        <button onClick={() => loadRegister()} style={{...styles.retryBtn, background: accentColor}}>
          Reessayer
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={{...styles.iconBox, background: `${accentColor}20`}}>
            <Wallet size={20} color={accentColor} />
          </div>
          <div>
            <h3 style={styles.title}>Fond de Caisse</h3>
            <span style={styles.date}>{register.date_formatted}</span>
          </div>
        </div>
        <div style={styles.headerRight}>
          <button onClick={loadHistory} style={styles.historyBtn}>
            <History size={16} />
          </button>
          <button onClick={() => loadRegister()} style={styles.refreshBtn}>
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        {/* Fond Initial */}
        <div style={styles.statCard} onClick={isAdmin ? () => setShowOpeningModal(true) : undefined}>
          <div style={{...styles.statIcon, background: 'rgba(59, 130, 246, 0.1)'}}>
            <DollarSign size={18} color="#3b82f6" />
          </div>
          <div style={styles.statInfo}>
            <span style={styles.statLabel}>Fond Initial</span>
            <span style={{...styles.statValue, color: '#3b82f6'}}>
              {register.opening_balance.toFixed(2)} DH
            </span>
          </div>
          {isAdmin && <span style={styles.editHint}>Modifier</span>}
        </div>

        {/* Cash Recu */}
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: 'rgba(16, 185, 129, 0.1)'}}>
            <ArrowDownLeft size={18} color="#10b981" />
          </div>
          <div style={styles.statInfo}>
            <span style={styles.statLabel}>Cash Recu</span>
            <span style={{...styles.statValue, color: '#10b981'}}>
              +{register.total_cash_in.toFixed(2)} DH
            </span>
          </div>
        </div>

        {/* Monnaie Rendue */}
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: 'rgba(239, 68, 68, 0.1)'}}>
            <ArrowUpRight size={18} color="#ef4444" />
          </div>
          <div style={styles.statInfo}>
            <span style={styles.statLabel}>Monnaie Rendue</span>
            <span style={{...styles.statValue, color: '#ef4444'}}>
              -{register.total_change_out.toFixed(2)} DH
            </span>
          </div>
        </div>

        {/* Retraits */}
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: 'rgba(139, 92, 246, 0.1)'}}>
            <Wallet size={18} color="#8b5cf6" />
          </div>
          <div style={styles.statInfo}>
            <span style={styles.statLabel}>Retraits</span>
            <span style={{...styles.statValue, color: '#8b5cf6'}}>
              -{register.withdrawn_amount.toFixed(2)} DH
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={styles.summaryGrid}>
        {/* Profit Net */}
        <div style={{...styles.summaryCard, borderColor: '#10b981'}}>
          <div style={styles.summaryHeader}>
            <TrendingUp size={20} color="#10b981" />
            <span style={{...styles.summaryLabel, color: '#10b981'}}>Profit Net du Jour</span>
          </div>
          <div style={{...styles.summaryValue, color: '#10b981'}}>
            {register.net_profit.toFixed(2)} DH
          </div>
        </div>

        {/* Solde Actuel */}
        <div style={{...styles.summaryCard, borderColor: accentColor}}>
          <div style={styles.summaryHeader}>
            <Wallet size={20} color={accentColor} />
            <span style={{...styles.summaryLabel, color: accentColor}}>Solde en Caisse</span>
          </div>
          <div style={{...styles.summaryValue, color: accentColor}}>
            {register.current_balance.toFixed(2)} DH
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      {isAdmin && (
        <div style={styles.actionsRow}>
          <button
            onClick={() => setShowWithdrawModal(true)}
            style={{...styles.actionBtn, background: accentColor}}
            disabled={register.current_balance <= 0}
          >
            <ArrowUpRight size={18} />
            Retirer Profit
          </button>
        </div>
      )}

      {/* Status */}
      <div style={styles.statusRow}>
        <div style={styles.statusItem}>
          <Clock size={14} color="#64748b" />
          <span>Ouvert a {register.opened_at || '--:--'}</span>
        </div>
        {register.closed_at && (
          <div style={styles.statusItem}>
            <CheckCircle size={14} color="#10b981" />
            <span>Ferme a {register.closed_at}</span>
          </div>
        )}
      </div>

      {/* Opening Balance Modal */}
      {showOpeningModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Modifier Fond de Caisse</h3>
              <button onClick={() => setShowOpeningModal(false)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>
            <div style={styles.modalBody}>
              <label style={styles.inputLabel}>Montant initial (DH)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ex: 500"
                style={styles.input}
                autoFocus
              />
              <p style={styles.hint}>
                Ce montant represente l'argent laisse dans la caisse au debut de la journee.
              </p>
            </div>
            <div style={styles.modalFooter}>
              <button onClick={() => setShowOpeningModal(false)} style={styles.cancelBtn}>
                Annuler
              </button>
              <button
                onClick={handleSetOpeningBalance}
                disabled={processing || !amount}
                style={{...styles.confirmBtn, background: accentColor}}
              >
                {processing ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Retirer le Profit</h3>
              <button onClick={() => setShowWithdrawModal(false)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.availableBox}>
                <span>Disponible en caisse:</span>
                <strong style={{color: accentColor}}>{register.current_balance.toFixed(2)} DH</strong>
              </div>
              <label style={styles.inputLabel}>Montant a retirer (DH)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ex: 1000"
                style={styles.input}
                max={register.current_balance}
                autoFocus
              />
              <label style={styles.inputLabel}>Note (optionnel)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Retrait fin de journee"
                style={styles.input}
              />
              {amount && parseFloat(amount) > register.current_balance && (
                <p style={styles.errorHint}>
                  Montant superieur au solde disponible!
                </p>
              )}
            </div>
            <div style={styles.modalFooter}>
              <button onClick={() => setShowWithdrawModal(false)} style={styles.cancelBtn}>
                Annuler
              </button>
              <button
                onClick={handleWithdraw}
                disabled={processing || !amount || parseFloat(amount) > register.current_balance}
                style={{...styles.confirmBtn, background: '#10b981'}}
              >
                {processing ? 'Retrait...' : `Retirer ${amount || 0} DH`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div style={styles.modalOverlay}>
          <div style={{...styles.modal, maxWidth: '500px'}}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Historique Caisse (14 derniers jours)</h3>
              <button onClick={() => setShowHistoryModal(false)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>
            <div style={{...styles.modalBody, maxHeight: '400px', overflowY: 'auto'}}>
              {history.length === 0 ? (
                <p style={styles.emptyHistory}>Aucun historique disponible</p>
              ) : (
                <div style={styles.historyList}>
                  {history.map((item) => (
                    <div key={item.id} style={styles.historyItem}>
                      <div style={styles.historyDate}>{item.date_formatted}</div>
                      <div style={styles.historyDetails}>
                        <div style={styles.historyRow}>
                          <span>Fond:</span>
                          <span>{item.opening_balance.toFixed(2)} DH</span>
                        </div>
                        <div style={styles.historyRow}>
                          <span>Cash recu:</span>
                          <span style={{color: '#10b981'}}>+{item.total_cash_in.toFixed(2)} DH</span>
                        </div>
                        <div style={styles.historyRow}>
                          <span>Monnaie:</span>
                          <span style={{color: '#ef4444'}}>-{item.total_change_out.toFixed(2)} DH</span>
                        </div>
                        <div style={styles.historyRow}>
                          <span>Retraits:</span>
                          <span style={{color: '#8b5cf6'}}>-{item.withdrawn_amount.toFixed(2)} DH</span>
                        </div>
                        <div style={{...styles.historyRow, fontWeight: '700', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #334155'}}>
                          <span>Profit net:</span>
                          <span style={{color: '#10b981'}}>{item.net_profit.toFixed(2)} DH</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={styles.modalFooter}>
              <button onClick={() => setShowHistoryModal(false)} style={styles.cancelBtn}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    background: '#1e293b',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #334155',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '40px',
    color: '#94a3b8',
  },
  loadingText: {
    fontSize: '14px',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '40px',
  },
  errorText: {
    color: '#ef4444',
    fontSize: '14px',
  },
  retryBtn: {
    padding: '8px 16px',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  iconBox: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '700',
    color: '#f1f5f9',
  },
  date: {
    fontSize: '12px',
    color: '#64748b',
  },
  headerRight: {
    display: 'flex',
    gap: '8px',
  },
  historyBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: '#334155',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: '#334155',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginBottom: '16px',
  },
  statCard: {
    background: '#0f172a',
    borderRadius: '12px',
    padding: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    position: 'relative',
    cursor: 'default',
  },
  statIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  statLabel: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: '500',
  },
  statValue: {
    fontSize: '15px',
    fontWeight: '700',
  },
  editHint: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    fontSize: '9px',
    color: '#64748b',
    background: '#334155',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginBottom: '16px',
  },
  summaryCard: {
    background: '#0f172a',
    borderRadius: '12px',
    padding: '16px',
    borderLeft: '4px solid',
    textAlign: 'center',
  },
  summaryHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  summaryLabel: {
    fontSize: '12px',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: '24px',
    fontWeight: '800',
  },
  actionsRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
  },
  actionBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  statusRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    fontSize: '12px',
    color: '#64748b',
  },
  statusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    background: '#1e293b',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '400px',
    border: '1px solid #334155',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #334155',
  },
  modalTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '700',
    color: '#f1f5f9',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '4px',
  },
  modalBody: {
    padding: '20px',
  },
  modalFooter: {
    display: 'flex',
    gap: '12px',
    padding: '16px 20px',
    borderTop: '1px solid #334155',
  },
  inputLabel: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#f1f5f9',
    fontSize: '16px',
    marginBottom: '16px',
    boxSizing: 'border-box',
  },
  hint: {
    fontSize: '12px',
    color: '#64748b',
    margin: 0,
  },
  errorHint: {
    fontSize: '12px',
    color: '#ef4444',
    margin: 0,
  },
  availableBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    background: '#0f172a',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
    color: '#94a3b8',
  },
  cancelBtn: {
    flex: 1,
    padding: '12px',
    background: '#334155',
    color: '#94a3b8',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    padding: '12px',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  emptyHistory: {
    textAlign: 'center',
    color: '#64748b',
    padding: '20px',
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  historyItem: {
    background: '#0f172a',
    borderRadius: '10px',
    padding: '14px',
  },
  historyDate: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: '10px',
    paddingBottom: '8px',
    borderBottom: '1px solid #334155',
  },
  historyDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  historyRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#94a3b8',
  },
};

export default CashRegister;
