import { useState, useEffect } from 'react';
import { Gamepad2, Plus, Edit2, Trash2, Clock, Trophy, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import Toast from '../components/Toast';

function SuperAdminGames({ onBack }) {
  const [games, setGames] = useState([]);
  const [pricingModes, setPricingModes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showGameModal, setShowGameModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [editingPricing, setEditingPricing] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);

  // Form states
  const [gameName, setGameName] = useState('');
  const [pricingForm, setPricingForm] = useState({
    pricing_mode_id: '',
    duration_minutes: '',
    matches_count: '',
    price: ''
  });

  useEffect(() => {
    loadGames();
    loadPricingModes();
  }, []);

  const loadGames = async () => {
    setLoading(true);
    try {
      const response = await api.get('/super-admin/games');
      setGames(response.data.games);
    } catch (error) {
      showToast('Erreur lors du chargement des jeux', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadPricingModes = async () => {
    try {
      const response = await api.get('/super-admin/pricing-modes');
      setPricingModes(response.data.pricing_modes);
    } catch (error) {
      console.error('Error loading pricing modes:', error);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateGame = async () => {
    if (!gameName.trim()) {
      showToast('Le nom du jeu est requis', 'error');
      return;
    }

    try {
      await api.post('/super-admin/games', {
        name: gameName,
        price_6min: 6,
        price_30min: 10,
        price_1h: 20,
        price_2h: 35,
        price_3h: 50
      });
      showToast('Jeu créé avec succès');
      setShowGameModal(false);
      setGameName('');
      loadGames();
    } catch (error) {
      showToast('Erreur lors de la création du jeu', 'error');
    }
  };

  const handleUpdateGame = async () => {
    try {
      await api.put(`/super-admin/games/${editingGame.id}`, {
        name: gameName
      });
      showToast('Jeu modifié avec succès');
      setShowGameModal(false);
      setEditingGame(null);
      setGameName('');
      loadGames();
    } catch (error) {
      showToast('Erreur lors de la modification du jeu', 'error');
    }
  };

  const handleDeleteGame = async (gameId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce jeu ?')) return;

    try {
      await api.delete(`/super-admin/games/${gameId}`);
      showToast('Jeu supprimé avec succès');
      loadGames();
    } catch (error) {
      showToast('Erreur lors de la suppression du jeu', 'error');
    }
  };

  const handleAddPricing = async () => {
    if (!pricingForm.pricing_mode_id || !pricingForm.price) {
      showToast('Veuillez remplir tous les champs requis', 'error');
      return;
    }

    const pricingMode = pricingModes.find(pm => pm.id === parseInt(pricingForm.pricing_mode_id));
    if (pricingMode?.code === 'fixed' && !pricingForm.duration_minutes) {
      showToast('La durée est requise pour le mode par temps', 'error');
      return;
    }
    if (pricingMode?.code === 'per_match' && !pricingForm.matches_count) {
      showToast('Le nombre de matchs est requis pour le mode par match', 'error');
      return;
    }

    try {
      await api.post(`/super-admin/games/${selectedGame.id}/pricings`, pricingForm);
      showToast('Tarif ajouté avec succès');
      setShowPricingModal(false);
      resetPricingForm();
      loadGames();
    } catch (error) {
      showToast('Erreur lors de l\'ajout du tarif', 'error');
    }
  };

  const handleUpdatePricing = async () => {
    try {
      await api.put(`/super-admin/games/${selectedGame.id}/pricings/${editingPricing.id}`, {
        price: pricingForm.price,
        duration_minutes: pricingForm.duration_minutes || null,
        matches_count: pricingForm.matches_count || null
      });
      showToast('Tarif modifié avec succès');
      setShowPricingModal(false);
      setEditingPricing(null);
      resetPricingForm();
      loadGames();
    } catch (error) {
      showToast('Erreur lors de la modification du tarif', 'error');
    }
  };

  const handleDeletePricing = async (pricingId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce tarif ?')) return;

    try {
      await api.delete(`/super-admin/games/${selectedGame.id}/pricings/${pricingId}`);
      showToast('Tarif supprimé avec succès');
      loadGames();
    } catch (error) {
      showToast('Erreur lors de la suppression du tarif', 'error');
    }
  };

  const resetPricingForm = () => {
    setPricingForm({
      pricing_mode_id: '',
      duration_minutes: '',
      matches_count: '',
      price: ''
    });
  };

  const openGameModal = (game = null) => {
    if (game) {
      setEditingGame(game);
      setGameName(game.name);
    } else {
      setEditingGame(null);
      setGameName('');
    }
    setShowGameModal(true);
  };

  const openPricingModal = (game, pricing = null) => {
    setSelectedGame(game);
    if (pricing) {
      setEditingPricing(pricing);
      setPricingForm({
        pricing_mode_id: pricing.pricing_mode.id,
        duration_minutes: pricing.duration_minutes || '',
        matches_count: pricing.matches_count || '',
        price: pricing.price
      });
    } else {
      setEditingPricing(null);
      resetPricingForm();
    }
    setShowPricingModal(true);
  };

  const selectedPricingMode = pricingModes.find(pm => pm.id === parseInt(pricingForm.pricing_mode_id));

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onBack}
            style={{
              padding: '8px 12px',
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <ArrowLeft size={20} />
            Retour
          </button>
          <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
            <Gamepad2 size={32} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '12px' }} />
            Gestion des Jeux
          </h1>
        </div>
        <button
          onClick={() => openGameModal()}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus size={20} />
          Nouveau Jeu
        </button>
      </div>

      {/* Games List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Chargement...</div>
      ) : (
        <div style={{ display: 'grid', gap: '24px' }}>
          {games.map(game => (
            <div
              key={game.id}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              {/* Game Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: '700', margin: 0 }}>{game.name}</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => openGameModal(game)}
                    style={{
                      padding: '8px 16px',
                      background: '#f3f4f6',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Edit2 size={16} />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteGame(game.id)}
                    style={{
                      padding: '8px 16px',
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Trash2 size={16} />
                    Supprimer
                  </button>
                </div>
              </div>

              {/* Pricings */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Tarifs</h4>
                  <button
                    onClick={() => openPricingModal(game)}
                    style={{
                      padding: '6px 12px',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Plus size={16} />
                    Ajouter un tarif
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                  {game.pricings.map(pricing => {
                    const isPerMatch = pricing.pricing_mode.code === 'per_match';
                    return (
                      <div
                        key={pricing.id}
                        style={{
                          padding: '12px',
                          borderRadius: '8px',
                          border: `2px solid ${isPerMatch ? '#10b981' : '#3b82f6'}`,
                          backgroundColor: isPerMatch ? '#f0fdf4' : '#eff6ff'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: isPerMatch ? '#059669' : '#1e40af', marginBottom: '4px' }}>
                              {isPerMatch ? <Trophy size={14} style={{ display: 'inline', marginRight: '4px' }} /> : <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} />}
                              {pricing.pricing_mode.label}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                              {isPerMatch
                                ? `${pricing.matches_count} match(s)`
                                : `${pricing.duration_minutes} min`}
                            </div>
                          </div>
                          <div style={{ fontSize: '16px', fontWeight: '700', color: isPerMatch ? '#059669' : '#1e40af' }}>
                            {pricing.price} DH
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => openPricingModal(game, pricing)}
                            style={{
                              flex: 1,
                              padding: '4px 8px',
                              background: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            <Edit2 size={12} style={{ verticalAlign: 'middle' }} />
                          </button>
                          <button
                            onClick={() => handleDeletePricing(pricing.id)}
                            style={{
                              flex: 1,
                              padding: '4px 8px',
                              background: '#fee2e2',
                              color: '#dc2626',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            <Trash2 size={12} style={{ verticalAlign: 'middle' }} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Game Modal */}
      {showGameModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '22px', fontWeight: '700' }}>
              {editingGame ? 'Modifier le jeu' : 'Nouveau jeu'}
            </h3>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                Nom du jeu
              </label>
              <input
                type="text"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '15px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                placeholder="Ex: FIFA 24"
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={editingGame ? handleUpdateGame : handleCreateGame}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600'
                }}
              >
                {editingGame ? 'Modifier' : 'Créer'}
              </button>
              <button
                onClick={() => setShowGameModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600'
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Modal */}
      {showPricingModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '22px', fontWeight: '700' }}>
              {editingPricing ? 'Modifier le tarif' : `Nouveau tarif - ${selectedGame?.name}`}
            </h3>

            {/* Pricing Mode Selection (only for new pricing) */}
            {!editingPricing && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Mode de tarification
                </label>
                <select
                  value={pricingForm.pricing_mode_id}
                  onChange={(e) => setPricingForm({ ...pricingForm, pricing_mode_id: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '15px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                >
                  <option value="">-- Choisir --</option>
                  {pricingModes.map(mode => (
                    <option key={mode.id} value={mode.id}>{mode.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Duration (for fixed mode) */}
            {(selectedPricingMode?.code === 'fixed' || editingPricing?.pricing_mode.code === 'fixed') && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Durée (minutes)
                </label>
                <input
                  type="number"
                  value={pricingForm.duration_minutes}
                  onChange={(e) => setPricingForm({ ...pricingForm, duration_minutes: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '15px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  placeholder="Ex: 30"
                />
              </div>
            )}

            {/* Matches Count (for per_match mode) */}
            {(selectedPricingMode?.code === 'per_match' || editingPricing?.pricing_mode.code === 'per_match') && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Nombre de matchs
                </label>
                <input
                  type="number"
                  value={pricingForm.matches_count}
                  onChange={(e) => setPricingForm({ ...pricingForm, matches_count: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '15px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  placeholder="Ex: 1"
                />
              </div>
            )}

            {/* Price */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                Prix (DH)
              </label>
              <input
                type="number"
                step="0.01"
                value={pricingForm.price}
                onChange={(e) => setPricingForm({ ...pricingForm, price: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '15px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                placeholder="Ex: 6"
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={editingPricing ? handleUpdatePricing : handleAddPricing}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600'
                }}
              >
                {editingPricing ? 'Modifier' : 'Ajouter'}
              </button>
              <button
                onClick={() => {
                  setShowPricingModal(false);
                  setEditingPricing(null);
                  resetPricingForm();
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600'
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

const modalOverlay = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
};

const modalContent = {
  background: 'white',
  borderRadius: '16px',
  padding: '28px',
  width: '500px',
  maxWidth: '90%'
};

export default SuperAdminGames;
