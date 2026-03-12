import { useState } from "react";
import api from "../services/api";
import logo from "../assets/logo.png";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      api.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
      onLogin(res.data.user);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Identifiants incorrects. Veuillez réessayer.";
      setError(errorMessage);
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lp-root">
      {/* LEFT PANEL — form */}
      <div className="lp-left">
        <div className="lp-left-inner">
          {/* Logo + title */}
          <div className="lp-brand">
            <div className="lp-logo-wrap">
              <img src={logo} alt="Logo" className="lp-logo-img" />
            </div>
            <h1 className="lp-title">
              Gestion des Produits <br />
              <span className="lp-title-accent">Pharmaceutiques</span>
            </h1>
            <div className="lp-badge">
              <span className="lp-badge-dot" />
              Division Santé · Forces Auxiliaires
            </div>
            <p className="lp-connect-hint">Connectez-vous pour accéder au système</p>
          </div>

          {/* Divider label */}
          <div className="lp-section-label">IDENTIFICATION</div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="lp-form" noValidate>
            <div className="lp-field">
              <label htmlFor="lp-email">Nom d&apos;utilisateur</label>
              <div className="lp-input-wrap">
                <input
                  id="lp-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Entrer votre identifiant"
                  autoComplete="email"
                  required
                />
                <span className="lp-input-icon">
                  {/* user icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                </span>
              </div>
            </div>

            <div className="lp-field">
              <label htmlFor="lp-password">Mot de passe</label>
              <div className="lp-input-wrap">
                <span className="lp-input-icon lp-icon-left">
                  {/* lock icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  id="lp-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrer votre mot de passe"
                  autoComplete="current-password"
                  required
                  className="lp-has-left-icon"
                />
                <button
                  type="button"
                  className="lp-eye-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Masquer" : "Afficher"}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="lp-error" role="alert">
                {error}
              </div>
            )}

            <button className="lp-btn" type="submit" disabled={loading}>
              {loading ? (
                <span className="lp-spinner" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
              )}
              {loading ? "Connexion..." : "Se Connecter"}
            </button>
          </form>

          <div className="lp-footer">
            <span className="lp-footer-icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </span>
            Accès réservé au personnel autorisé
          </div>
          <div className="lp-copyright">© 2025 Forces Auxiliaires — Système Pharmaceutique</div>
        </div>
      </div>

      {/* RIGHT PANEL — institutional info */}
      <div className="lp-right">
        {/* decorative circles */}
        <div className="lp-deco lp-deco-1" />
        <div className="lp-deco lp-deco-2" />
        <div className="lp-deco lp-deco-3" />

        <div className="lp-right-inner">
          <div className="lp-plus-icon">+</div>

          <div className="lp-institution">
            <p className="lp-kingdom">ROYAUME DU MAROC</p>
            <div className="lp-sep" />
            <h2 className="lp-inst-title">
              INSPECTION GÉNÉRALE<br />DES FORCES AUXILIAIRES
            </h2>
            <p className="lp-zone">ZONE NORD</p>

            <p className="lp-direction">
              Direction des Ressources Humaines<br />et Action Sociale
            </p>

            <div className="lp-division-badge">DIVISION SANTÉ</div>
          </div>

          {/* Pharmacy cross + logo */}
          <div className="lp-cross-wrap">
            <div className="lp-cross">
              <div className="lp-cross-h" />
              <div className="lp-cross-v" />
              <div className="lp-cross-logo">
                <img src={logo} alt="Emblème" className="lp-cross-img" />
              </div>
            </div>
          </div>

          <div className="lp-right-footer">
            <span className="lp-rf-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </span>
            Système de Gestion des Produits Pharmaceutiques<br />
            <span>© 2025 — Forces Auxiliaires</span>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        *{box-sizing:border-box;margin:0;padding:0}
        html,body,#root{height:100%}

        .lp-root{
          display:flex;
          min-height:100vh;
          font-family:'Inter',system-ui,sans-serif;
        }

        /* ===== LEFT ===== */
        .lp-left{
          width:480px;
          min-width:380px;
          background:#1a1d2e;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:48px 40px;
        }
        .lp-left-inner{
          width:100%;
          max-width:380px;
          display:flex;
          flex-direction:column;
          gap:0;
        }

        /* brand */
        .lp-brand{
          display:flex;
          flex-direction:column;
          align-items:center;
          text-align:center;
          margin-bottom:28px;
          gap:10px;
        }
        .lp-logo-wrap{
          width:80px;height:80px;
          border-radius:16px;
          background:#111320;
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 4px 20px rgba(0,0,0,0.4);
          margin-bottom:4px;
        }
        .lp-logo-img{width:60px;height:60px;object-fit:contain}
        .lp-title{
          color:#ffffff;
          font-size:22px;
          font-weight:800;
          line-height:1.3;
        }
        .lp-title-accent{color:#7c6fcd;font-weight:700}
        .lp-badge{
          display:inline-flex;align-items:center;gap:7px;
          background:#252840;
          border-radius:20px;
          padding:5px 14px;
          font-size:12.5px;
          color:#c8c8e8;
          font-weight:500;
        }
        .lp-badge-dot{
          width:8px;height:8px;border-radius:50%;
          background:#5de87a;
          display:inline-block;
          box-shadow:0 0 6px #5de87a88;
        }
        .lp-connect-hint{color:#8888aa;font-size:13px;margin-top:4px}

        /* section label */
        .lp-section-label{
          font-size:11px;
          font-weight:700;
          letter-spacing:2.5px;
          color:#666890;
          text-align:center;
          margin-bottom:18px;
        }

        /* form */
        .lp-form{display:flex;flex-direction:column;gap:16px}
        .lp-field{display:flex;flex-direction:column;gap:7px}
        .lp-field label{font-size:13px;font-weight:600;color:#c8c8e0}
        .lp-input-wrap{position:relative;display:flex;align-items:center}
        .lp-input-wrap input{
          width:100%;
          padding:11px 42px 11px 14px;
          border-radius:10px;
          border:1px solid #2e3050;
          background:#111320;
          color:#e0e0f0;
          font-size:14px;
          font-family:inherit;
          outline:none;
          transition:border-color .18s,box-shadow .18s;
        }
        .lp-input-wrap input.lp-has-left-icon{
          padding-left:42px;
        }
        .lp-input-wrap input::placeholder{color:#44445a}
        .lp-input-wrap input:focus{
          border-color:#5b52cc;
          box-shadow:0 0 0 3px rgba(91,82,204,0.15);
        }
        .lp-input-icon{
          position:absolute;
          right:13px;
          color:#55557a;
          display:flex;align-items:center;pointer-events:none;
        }
        .lp-icon-left{
          left:13px;right:auto;
        }
        .lp-eye-btn{
          position:absolute;right:12px;
          background:none;border:none;cursor:pointer;
          color:#55557a;display:flex;align-items:center;padding:0;
          transition:color .15s;
        }
        .lp-eye-btn:hover{color:#a0a0cc}

        .lp-error{
          padding:9px 13px;
          border-radius:9px;
          background:rgba(220,50,50,0.08);
          border:1px solid rgba(220,50,50,0.2);
          color:#ff9a9a;
          font-size:13px;
          font-weight:500;
          animation:lpShake .35s ease-out;
        }

        .lp-btn{
          margin-top:4px;
          padding:13px;
          border-radius:10px;
          border:none;
          background:linear-gradient(135deg,#5b52cc,#7c6fcd);
          color:#fff;
          font-weight:700;
          font-size:15px;
          cursor:pointer;
          display:inline-flex;align-items:center;justify-content:center;gap:9px;
          box-shadow:0 6px 22px rgba(91,82,204,0.35);
          transition:transform .15s,box-shadow .15s,opacity .15s;
          font-family:inherit;
        }
        .lp-btn:hover:not([disabled]){
          transform:translateY(-2px);
          box-shadow:0 10px 30px rgba(91,82,204,0.45);
        }
        .lp-btn:active:not([disabled]){transform:translateY(0)}
        .lp-btn[disabled]{opacity:.55;cursor:not-allowed}

        .lp-spinner{
          width:16px;height:16px;border-radius:50%;
          border:2px solid rgba(255,255,255,0.3);
          border-top-color:#fff;
          animation:lpSpin .7s linear infinite;
        }

        .lp-footer{
          margin-top:20px;
          display:flex;align-items:center;justify-content:center;gap:6px;
          color:#55557a;font-size:12px;
        }
        .lp-footer-icon{display:flex;align-items:center}
        .lp-copyright{
          text-align:center;color:#3a3a55;font-size:11.5px;margin-top:6px;
        }

        /* ===== RIGHT ===== */
        .lp-right{
          flex:1;
          background:linear-gradient(135deg,#0d9e8a 0%,#0b7a6b 40%,#0a5e56 100%);
          display:flex;
          align-items:center;
          justify-content:center;
          position:relative;
          overflow:hidden;
          padding:40px;
        }

        /* decorative blurred circles */
        .lp-deco{position:absolute;border-radius:50%;opacity:.18}
        .lp-deco-1{
          width:220px;height:220px;
          background:#ffffff;
          top:-60px;right:-60px;
        }
        .lp-deco-2{
          width:160px;height:160px;
          background:#ffffff;
          top:30px;left:-50px;
          opacity:.08;
        }
        .lp-deco-3{
          width:300px;height:300px;
          background:#0a4040;
          bottom:-100px;right:-80px;
          opacity:.3;
        }

        .lp-right-inner{
          position:relative;z-index:1;
          display:flex;flex-direction:column;align-items:center;
          text-align:center;gap:20px;
          width:100%;max-width:420px;
        }

        .lp-plus-icon{
          width:52px;height:52px;
          background:rgba(255,255,255,0.15);
          border-radius:14px;
          backdrop-filter:blur(8px);
          display:flex;align-items:center;justify-content:center;
          font-size:28px;font-weight:300;color:#fff;
          border:1px solid rgba(255,255,255,0.2);
        }

        .lp-institution{display:flex;flex-direction:column;align-items:center;gap:8px}
        .lp-kingdom{
          font-size:12px;font-weight:600;letter-spacing:3px;
          color:rgba(255,255,255,0.7);text-transform:uppercase;
        }
        .lp-sep{width:40px;height:1px;background:rgba(255,255,255,0.3)}
        .lp-inst-title{
          font-size:18px;font-weight:800;color:#ffffff;letter-spacing:.5px;line-height:1.4;
        }
        .lp-zone{
          font-size:13px;font-weight:700;color:#7efcd8;letter-spacing:1.5px;
        }
        .lp-direction{
          font-size:13px;color:rgba(255,255,255,0.75);line-height:1.6;margin-top:4px;
        }
        .lp-division-badge{
          display:inline-block;
          border:1.5px solid #7efcd8;
          border-radius:20px;
          padding:5px 18px;
          color:#7efcd8;
          font-size:12.5px;font-weight:700;letter-spacing:1.5px;
          margin-top:4px;
        }

        /* pharmacy cross */
        .lp-cross-wrap{
          position:relative;
          width:160px;height:160px;
          display:flex;align-items:center;justify-content:center;
        }
        .lp-cross{
          position:relative;
          width:140px;height:140px;
          display:flex;align-items:center;justify-content:center;
        }
        .lp-cross-h,.lp-cross-v{
          position:absolute;
          background:rgba(255,255,255,0.18);
          border-radius:8px;
          backdrop-filter:blur(6px);
        }
        .lp-cross-h{width:140px;height:48px}
        .lp-cross-v{width:48px;height:140px}
        .lp-cross-logo{
          position:absolute;z-index:2;
          width:80px;height:80px;
          display:flex;align-items:center;justify-content:center;
        }
        .lp-cross-img{width:72px;height:72px;object-fit:contain;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.3))}

        .lp-right-footer{
          color:rgba(255,255,255,0.55);
          font-size:12px;line-height:1.7;
          display:flex;flex-direction:column;align-items:center;gap:2px;
        }
        .lp-rf-icon{display:flex;align-items:center;margin-bottom:4px}

        /* animations */
        @keyframes lpSpin{to{transform:rotate(360deg)}}
        @keyframes lpShake{
          0%,100%{transform:translateX(0)}
          20%,60%{transform:translateX(-5px)}
          40%,80%{transform:translateX(5px)}
        }

        /* responsive */
        @media(max-width:820px){
          .lp-root{flex-direction:column}
          .lp-left{width:100%;min-width:0;padding:40px 24px}
          .lp-right{padding:48px 24px;min-height:50vh}
        }
      `}</style>
    </div>
  );
}

export default Login;
