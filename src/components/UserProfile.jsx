import { useState, useEffect } from "react";
import { User, Lock, Eye, EyeOff, Save, X, Gamepad2 } from "lucide-react";
import api from "../services/api";
import useSanitize from "../hooks/useSanitize";

function UserProfile({ user, onClose, showToast }) {
  const { sanitize } = useSanitize();
  const [activeSessions, setActiveSessions] = useState(0);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load active sessions count for agent
  useEffect(() => {
    const loadActiveSessions = async () => {
      try {
        const res = await api.get("/machines");
        const activeCount = res.data.filter(m => m.status === 'occupied').length;
        setActiveSessions(activeCount);
      } catch (e) {
        // Silent fail - not critical
      }
    };

    if (user.role === 'agent') {
      loadActiveSessions();
      // Refresh every 10 seconds
      const interval = setInterval(loadActiveSessions, 10000);
      return () => clearInterval(interval);
    }
  }, [user.role]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Tous les champs sont obligatoires");
      return;
    }

    if (newPassword.length < 6) {
      setError("Le nouveau mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);

    try {
      await api.post("/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword
      });

      showToast("Mot de passe modifié avec succès", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Erreur lors du changement de mot de passe";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-content">
            <User size={24} className="modal-icon" />
            <h2>Mon Profil</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="profile-info">
          <div className="info-row">
            <span className="info-label">Nom:</span>
            <span className="info-value">{sanitize(user.name)}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Email:</span>
            <span className="info-value">{sanitize(user.email)}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Rôle:</span>
            <span className={`role-badge ${sanitize(user.role)}`}>
              {user.role === "admin" ? "Administrateur" : "Agent"}
            </span>
          </div>
          {user.role === 'agent' && (
            <div className="info-row">
              <span className="info-label">
                <Gamepad2 size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                Sessions actives:
              </span>
              <span className="info-value" style={{ fontSize: '18px', fontWeight: '700', color: '#f59e0b' }}>
                {activeSessions}
              </span>
            </div>
          )}
        </div>

        <div className="divider"></div>

        <form onSubmit={handleChangePassword} className="password-form">
          <h3>
            <Lock size={20} />
            Changer le mot de passe
          </h3>

          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="current-password">Mot de passe actuel</label>
            <div className="password-input-wrapper">
              <input
                id="current-password"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Entrez votre mot de passe actuel"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="new-password">Nouveau mot de passe</label>
            <div className="password-input-wrapper">
              <input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Au moins 6 caractères"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password">Confirmer le nouveau mot de passe</label>
            <div className="password-input-wrapper">
              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Retapez le nouveau mot de passe"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              <Save size={18} />
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>

        <style>{`
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
          }

          .profile-modal {
            background: var(--card-bg, #fff);
            border-radius: 12px;
            width: 100%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          }

          .modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 24px;
            border-bottom: 1px solid var(--border-color, #e5e7eb);
          }

          .modal-header-content {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .modal-header h2 {
            margin: 0;
            font-size: 20px;
            font-weight: 700;
            color: var(--text-primary, #111827);
          }

          .modal-icon {
            color: var(--primary-color, #3b82f6);
          }

          .close-btn {
            background: none;
            border: none;
            cursor: pointer;
            padding: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            color: var(--text-secondary, #6b7280);
            transition: all 0.2s;
          }

          .close-btn:hover {
            background: var(--hover-bg, #f3f4f6);
            color: var(--text-primary, #111827);
          }

          .profile-info {
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .info-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .info-label {
            font-weight: 600;
            color: var(--text-secondary, #6b7280);
            font-size: 14px;
          }

          .info-value {
            font-weight: 500;
            color: var(--text-primary, #111827);
            font-size: 14px;
          }

          .role-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
          }

          .role-badge.admin {
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            color: #78350f;
          }

          .role-badge.agent {
            background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
            color: #1e3a8a;
          }

          .divider {
            height: 1px;
            background: var(--border-color, #e5e7eb);
            margin: 0 24px;
          }

          .password-form {
            padding: 24px;
          }

          .password-form h3 {
            margin: 0 0 20px 0;
            font-size: 16px;
            font-weight: 700;
            color: var(--text-primary, #111827);
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .form-group {
            margin-bottom: 16px;
          }

          .form-group label {
            display: block;
            margin-bottom: 6px;
            font-size: 13px;
            font-weight: 600;
            color: var(--text-secondary, #6b7280);
          }

          .password-input-wrapper {
            position: relative;
          }

          .password-input-wrapper input {
            width: 100%;
            padding: 10px 40px 10px 12px;
            border: 1px solid var(--border-color, #d1d5db);
            border-radius: 8px;
            font-size: 14px;
            background: var(--input-bg, #fff);
            color: var(--text-primary, #111827);
            transition: all 0.2s;
          }

          .password-input-wrapper input:focus {
            outline: none;
            border-color: var(--primary-color, #3b82f6);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .toggle-password {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-secondary, #6b7280);
            transition: color 0.2s;
          }

          .toggle-password:hover {
            color: var(--text-primary, #111827);
          }

          .error-message {
            padding: 10px 12px;
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            color: #dc2626;
            font-size: 13px;
            font-weight: 500;
            margin-bottom: 16px;
          }

          [data-theme="dark"] .error-message {
            background: rgba(239, 68, 68, 0.1);
            border-color: rgba(239, 68, 68, 0.3);
            color: #fca5a5;
          }

          .form-actions {
            display: flex;
            gap: 12px;
            margin-top: 24px;
          }

          .btn {
            flex: 1;
            padding: 10px 16px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: all 0.2s;
          }

          .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .btn-secondary {
            background: var(--secondary-bg, #f3f4f6);
            color: var(--text-primary, #111827);
          }

          .btn-secondary:hover:not(:disabled) {
            background: var(--secondary-hover, #e5e7eb);
          }

          .btn-primary {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
          }

          .btn-primary:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          }

          /* Dark theme */
          [data-theme="dark"] .profile-modal {
            background: #1f2937;
          }

          [data-theme="dark"] .modal-header {
            border-bottom-color: #374151;
          }

          [data-theme="dark"] .modal-header h2,
          [data-theme="dark"] .password-form h3,
          [data-theme="dark"] .info-value {
            color: #f9fafb;
          }

          [data-theme="dark"] .close-btn:hover {
            background: #374151;
          }

          [data-theme="dark"] .divider {
            background: #374151;
          }

          [data-theme="dark"] .password-input-wrapper input {
            background: #111827;
            border-color: #374151;
            color: #f9fafb;
          }

          [data-theme="dark"] .password-input-wrapper input:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
          }

          [data-theme="dark"] .btn-secondary {
            background: #374151;
            color: #f9fafb;
          }

          [data-theme="dark"] .btn-secondary:hover:not(:disabled) {
            background: #4b5563;
          }

          /* Responsive */
          @media (max-width: 640px) {
            .profile-modal {
              max-width: 100%;
              margin: 0;
              border-radius: 0;
              max-height: 100vh;
            }

            .modal-header,
            .profile-info,
            .password-form {
              padding: 16px;
            }

            .form-actions {
              flex-direction: column;
            }

            .btn {
              width: 100%;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

export default UserProfile;
