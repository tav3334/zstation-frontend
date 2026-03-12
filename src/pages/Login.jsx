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
              Plateforme de gestion <br />
              <span className="lp-title-accent">de salle de jeux</span>
            </h1>
            <div className="lp-badge">
              <span className="lp-badge-dot" />
              Gaming Station
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
          <div className="lp-copyright">© 2025 Zstation Corner — Système Gaming</div>
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
            <p className="lp-kingdom">ZSTATION CORNER</p>
            <div className="lp-sep" />
            <h2 className="lp-inst-title">
              GESTION INTELLIGENTE<br />DE SALLE DE JEUX
            </h2>
            <p className="lp-zone">PS5 · XBOX · PC GAMING</p>

            <p className="lp-direction">
              Suivi des sessions, paiements et abonnements<br />en temps réel
            </p>

            <div className="lp-division-badge">ESPACE GAMING</div>
          </div>

          {/* Gaming features grid */}
          <div className="lp-features">
            <div className="lp-feat">
              <div className="lp-feat-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="12" rx="3"/>
                  <circle cx="8" cy="12" r="1.5" fill="currentColor"/>
                  <line x1="16" y1="10" x2="16" y2="14"/><line x1="14" y1="12" x2="18" y2="12"/>
                </svg>
              </div>
              <div>
                <div className="lp-feat-title">Sessions en temps réel</div>
                <div className="lp-feat-desc">Suivi PS5, Xbox & PC</div>
              </div>
            </div>
            <div className="lp-feat">
              <div className="lp-feat-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              </div>
              <div>
                <div className="lp-feat-title">Paiements intégrés</div>
                <div className="lp-feat-desc">Cash, carte & abonnement</div>
              </div>
            </div>
            <div className="lp-feat">
              <div className="lp-feat-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div>
                <div className="lp-feat-title">Gestion membres</div>
                <div className="lp-feat-desc">Profils & historique</div>
              </div>
            </div>
            <div className="lp-feat">
              <div className="lp-feat-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              </div>
              <div>
                <div className="lp-feat-title">Statistiques</div>
                <div className="lp-feat-desc">Revenus & fréquentation</div>
              </div>
            </div>
          </div>

          {/* Animated consoles row */}
          <div className="lp-consoles">
            <div className="lp-console-tag">PS5</div>
            <div className="lp-console-tag">XBOX</div>
            <div className="lp-console-tag">PC</div>
            <div className="lp-console-tag">VR</div>
          </div>

          <div className="lp-right-footer">
            <span className="lp-rf-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </span>
            Plateforme de Gestion de Salle de Jeux<br />
            <span>© 2025 — Zstation Corner</span>
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
          background:linear-gradient(160deg,#0f2027 0%,#0b4d3e 50%,#0d6b55 100%);
          display:flex;
          align-items:center;
          justify-content:center;
          position:relative;
          overflow:hidden;
          padding:48px 40px;
        }

        /* decorative blurred circles */
        .lp-deco{position:absolute;border-radius:50%}
        .lp-deco-1{
          width:380px;height:380px;
          background:radial-gradient(circle,rgba(0,230,180,0.12),transparent 70%);
          top:-120px;right:-120px;
        }
        .lp-deco-2{
          width:260px;height:260px;
          background:radial-gradient(circle,rgba(100,220,200,0.08),transparent 70%);
          bottom:60px;left:-80px;
        }
        .lp-deco-3{
          width:500px;height:500px;
          background:radial-gradient(circle,rgba(0,80,60,0.35),transparent 70%);
          bottom:-200px;right:-150px;
        }

        /* animated grid lines */
        .lp-right::before{
          content:'';position:absolute;inset:0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),
            linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px);
          background-size:40px 40px;
          pointer-events:none;
        }

        .lp-right-inner{
          position:relative;z-index:1;
          display:flex;flex-direction:column;align-items:center;
          text-align:center;gap:22px;
          width:100%;max-width:440px;
        }

        .lp-plus-icon{
          width:54px;height:54px;
          background:linear-gradient(135deg,rgba(0,230,160,0.2),rgba(0,180,120,0.1));
          border-radius:16px;
          backdrop-filter:blur(10px);
          display:flex;align-items:center;justify-content:center;
          font-size:28px;font-weight:300;color:#7efcd8;
          border:1px solid rgba(0,230,160,0.25);
          box-shadow:0 0 30px rgba(0,230,160,0.1);
          animation:lpPulseGlow 3s ease-in-out infinite;
        }

        .lp-institution{display:flex;flex-direction:column;align-items:center;gap:10px}
        .lp-kingdom{
          font-size:11px;font-weight:700;letter-spacing:4px;
          color:rgba(255,255,255,0.5);text-transform:uppercase;
        }
        .lp-sep{
          width:50px;height:2px;
          background:linear-gradient(90deg,transparent,rgba(0,230,160,0.6),transparent);
          border-radius:2px;
        }
        .lp-inst-title{
          font-size:20px;font-weight:800;color:#ffffff;letter-spacing:.5px;line-height:1.35;
          text-shadow:0 2px 20px rgba(0,0,0,0.3);
        }
        .lp-zone{
          font-size:12px;font-weight:700;color:#7efcd8;letter-spacing:2.5px;
          text-transform:uppercase;
        }
        .lp-direction{
          font-size:13px;color:rgba(255,255,255,0.65);line-height:1.7;margin-top:2px;
        }
        .lp-division-badge{
          display:inline-block;
          background:rgba(0,230,160,0.1);
          border:1.5px solid rgba(0,230,160,0.4);
          border-radius:24px;
          padding:6px 20px;
          color:#7efcd8;
          font-size:12px;font-weight:700;letter-spacing:2px;
          text-transform:uppercase;
          margin-top:4px;
          backdrop-filter:blur(6px);
        }

        /* features grid */
        .lp-features{
          display:grid;grid-template-columns:1fr 1fr;
          gap:12px;width:100%;
        }
        .lp-feat{
          display:flex;align-items:flex-start;gap:12px;
          background:rgba(255,255,255,0.05);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:14px;
          padding:14px;
          text-align:left;
          backdrop-filter:blur(8px);
          transition:background .2s,transform .2s;
        }
        .lp-feat:hover{
          background:rgba(0,230,160,0.08);
          border-color:rgba(0,230,160,0.2);
          transform:translateY(-2px);
        }
        .lp-feat-icon{
          width:36px;height:36px;min-width:36px;
          background:rgba(0,230,160,0.12);
          border-radius:10px;
          display:flex;align-items:center;justify-content:center;
          color:#7efcd8;
        }
        .lp-feat-title{font-size:13px;font-weight:700;color:#fff;margin-bottom:2px}
        .lp-feat-desc{font-size:11.5px;color:rgba(255,255,255,0.5)}

        /* consoles row */
        .lp-consoles{
          display:flex;gap:10px;flex-wrap:wrap;justify-content:center;
        }
        .lp-console-tag{
          padding:6px 16px;
          border-radius:20px;
          background:rgba(255,255,255,0.06);
          border:1px solid rgba(255,255,255,0.12);
          color:rgba(255,255,255,0.7);
          font-size:12px;font-weight:700;letter-spacing:1.5px;
          transition:all .2s;
        }
        .lp-console-tag:hover{
          background:rgba(0,230,160,0.12);
          border-color:rgba(0,230,160,0.3);
          color:#7efcd8;
        }

        .lp-right-footer{
          color:rgba(255,255,255,0.4);
          font-size:12px;line-height:1.8;
          display:flex;flex-direction:column;align-items:center;gap:2px;
          padding-top:6px;
          border-top:1px solid rgba(255,255,255,0.07);
          width:100%;
        }
        .lp-rf-icon{display:flex;align-items:center;margin-bottom:4px;color:rgba(0,230,160,0.5)}

        /* animations */
        @keyframes lpSpin{to{transform:rotate(360deg)}}
        @keyframes lpPulseGlow{
          0%,100%{box-shadow:0 0 30px rgba(0,230,160,0.1)}
          50%{box-shadow:0 0 50px rgba(0,230,160,0.25),0 0 0 1px rgba(0,230,160,0.15)}
        }
        @keyframes lpShake{
          0%,100%{transform:translateX(0)}
          20%,60%{transform:translateX(-5px)}
          40%,80%{transform:translateX(5px)}
        }

        /* responsive — mobile : panneau droit masqué */
        @media(max-width:820px){
          .lp-left{width:100%;min-width:0;padding:40px 24px}
          .lp-right{display:none}
        }
      `}</style>
    </div>
  );
}

export default Login;
