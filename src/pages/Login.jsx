import { useState, useEffect, useRef } from "react";
import api from "../services/api";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bgRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // subtle parallax for the background container
    const onMove = (e) => {
      const el = bgRef.current;
      if (!el) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const px = (e.clientX / w - 0.5) * 18;
      const py = (e.clientY / h - 0.5) * 10;
      el.style.transform = `translate3d(${px}px, ${py}px, 0)`;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    // lightweight particle system on canvas (for full-screen futuristic feel)
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const particles = [];
    const count = Math.max(40, Math.floor((w * h) / 80000));

    function rand(min, max) {
      return Math.random() * (max - min) + min;
    }

    for (let i = 0; i < count; i++) {
      particles.push({
        x: rand(0, w),
        y: rand(0, h),
        r: rand(0.9, 3.2),
        vx: rand(-0.25, 0.25),
        vy: rand(-0.1, 0.4),
        hue: rand(170, 290),
        alpha: rand(0.08, 0.26)
      });
    }

    let raf = null;
    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (let p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y > h + 20) p.y = -20;
        ctx.beginPath();
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 8);
        grad.addColorStop(0, `hsla(${p.hue},85%,64%,${p.alpha})`);
        grad.addColorStop(1, `rgba(10,12,20,0)`);
        ctx.fillStyle = grad;
        ctx.arc(p.x, p.y, p.r * 8, 0, Math.PI * 2);
        ctx.fill();
      }
      // subtle connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.strokeStyle = `rgba(120,96,255,${(0.12 * (120 - d)) / 120})`;
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

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
      console.error("Erreur de connexion:", err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Identifiants incorrects. Veuillez réessayer.";
      setError(errorMessage);
      setLoading(false);

      // Vider le mot de passe en cas d'erreur
      setPassword("");
    }
  };

  return (
    <div className="ui-fs-root" role="application" aria-label="ZSTATION login">
      <canvas ref={canvasRef} className="ui-bg-canvas" />
      <div className="ui-bg-layer" ref={bgRef} aria-hidden="true">
        <div className="ui-aurora" />
        <div className="ui-grid" />
        <svg className="ui-controller" viewBox="0 0 160 90" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="gcF" x1="0" x2="1">
              <stop offset="0" stopColor="#00e6ff" />
              <stop offset="1" stopColor="#7b5cff" />
            </linearGradient>
            <filter id="gloF"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <g fill="url(#gcF)" filter="url(#gloF)">
            <path d="M12 46c3-12 16-24 44-24h48c28 0 41 12 44 24 3.5 10.5-1 23-11 28-11 5.8-30 4.7-61 4.7H65C34 104 23 105 12 94 1 83-1 59 12 46z" transform="scale(.7) translate(8 -8)"/>
          </g>
        </svg>
      </div>

      <main className="ui-main">
        <section className="ui-hero">
          <div className="ui-panel ui-left">
            <div className="ui-brand">
              <div className="ui-logo" aria-hidden="true">
                {/* PlayStation 5 inspired logo */}
                <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
                  <defs>
                    <linearGradient id="lg2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00e6ff"/>
                      <stop offset="50%" stopColor="#7b5cff"/>
                      <stop offset="100%" stopColor="#ff00ff"/>
                    </linearGradient>
                    <filter id="glow2">
                      <feGaussianBlur stdDeviation="4" result="b"/>
                      <feMerge>
                        <feMergeNode in="b"/>
                        <feMergeNode in="b"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <g filter="url(#glow2)">
                    {/* PS5 Circle */}
                    <circle cx="50" cy="50" r="38" fill="none" stroke="url(#lg2)" strokeWidth="3" opacity="0.8"/>
                    {/* Inner details */}
                    <path d="M 30 50 Q 50 30, 70 50 Q 50 70, 30 50 Z" fill="url(#lg2)" opacity="0.3"/>
                    {/* Gaming symbol - modified PlayStation buttons style */}
                    <circle cx="50" cy="35" r="5" fill="#00e6ff" opacity="0.9"/>
                    <circle cx="65" cy="50" r="5" fill="#7b5cff" opacity="0.9"/>
                    <circle cx="50" cy="65" r="5" fill="#ff00ff" opacity="0.9"/>
                    <circle cx="35" cy="50" r="5" fill="#00ff88" opacity="0.9"/>
                    {/* Center glow */}
                    <circle cx="50" cy="50" r="8" fill="url(#lg2)" opacity="0.6"/>
                  </g>
                </svg>
              </div>
              <h1 className="ui-title">ZSTATION</h1>
              <p className="ui-sub">Gaming Station Management · PS5 Pro</p>

              <div className="ui-feats">
                <div><strong>⚡</strong> Temps Réel</div>
                <div><strong>🎮</strong> Multi-Stations</div>
                <div><strong>💰</strong> Paiements</div>
              </div>
            </div>
          </div>

          <aside className="ui-panel ui-right" aria-labelledby="loginHeading">
            <div className="ui-card" role="dialog" aria-modal="true" aria-labelledby="loginHeading">
              <div className="ui-card-head">
                <h2 id="loginHeading">Connexion</h2>
                <p className="ui-muted">Accès sécurisé</p>
              </div>

              <form onSubmit={handleSubmit} className="ui-form" noValidate>
                <div className="ui-field">
                  <label htmlFor="email">Adresse Email</label>
                  <input id="email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@exemple.com" autoComplete="email" required />
                </div>

                <div className="ui-field">
                  <label htmlFor="password">Mot de passe</label>
                  <input id="password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" required />
                </div>

                {error && <div className="ui-error" role="alert">{error}</div>}

                <button className="ui-btn" type="submit" disabled={loading} aria-busy={loading}>
                  {loading ? <span className="ui-spinner" /> : null}
                  {loading ? "Connexion..." : "Se connecter"}
                </button>
              </form>

              <div className="ui-card-foot" style={{marginTop: '20px'}}>© 2026 ZSTATION — support@zstation.ma</div>
            </div>
          </aside>
        </section>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        :root{
          --bg-0: #060712;
          --glass: rgba(255,255,255,0.04);
          --muted: #98a6b3;
          --accent-a: #7b5cff;
          --accent-b: #00e6ff;
          --card-bg: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.008));
        }
        *{box-sizing:border-box}
        html,body,#root{height:100%;margin:0}
        .ui-fs-root{
          min-height:100vh;
          background: radial-gradient(1200px 600px at 10% 10%, rgba(123,92,255,0.06), transparent 10%),
                      radial-gradient(900px 500px at 90% 80%, rgba(0,230,255,0.04), transparent 8%),
                      var(--bg-0);
          color: #eaf9ff;
          font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
          overflow:hidden;
        }

        /* canvas background (particles) sits behind everything */
        .ui-bg-canvas{position:fixed;inset:0;z-index:0;display:block;pointer-events:none;opacity:0.7}
        .ui-bg-layer{position:fixed;inset:0;z-index:1;pointer-events:none;transition:transform .35s ease}
        .ui-aurora{position:absolute;inset:auto;width:140%;height:64%;left:-20%;top:-18%;filter:blur(56px);mix-blend-mode:screen;opacity:.95}
        .ui-grid{position:absolute;inset:0;opacity:0.03;mix-blend-mode:overlay}
        .ui-controller{position:absolute;bottom:10%;right:8%;width:280px;opacity:0.04;animation:floatCtrl 8s ease-in-out infinite}

        .ui-main{position:relative;z-index:2;min-height:100vh;display:flex;align-items:stretch;justify-content:stretch;padding:0}
        .ui-hero{display:flex;gap:0;align-items:stretch;width:100%;height:100vh;max-width:100%;animation:fadeInUp 0.8s ease-out}

        /* LEFT HERO */
        .ui-left{flex:1;padding:48px 64px;display:flex;flex-direction:column;justify-content:center;gap:20px;background:linear-gradient(135deg, rgba(6,7,18,0.95) 0%, rgba(20,15,40,0.9) 100%);backdrop-filter:blur(20px)}
        .ui-brand{animation:slideInLeft 0.6s ease-out}
        .ui-logo{width:100px;height:100px;border-radius:20px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg, rgba(123,92,255,0.1), rgba(0,230,255,0.05));box-shadow:0 20px 50px rgba(11,12,30,0.6), 0 0 60px rgba(123,92,255,0.2);animation:pulse 3s ease-in-out infinite}
        .ui-title{font-size:48px;margin:12px 0 0 0;font-weight:900;letter-spacing:-1px;color: #f6fbff;background:linear-gradient(135deg, #fff 0%, #00e6ff 50%, #7b5cff 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;text-shadow:0 0 40px rgba(123,92,255,0.3)}
        .ui-sub{color:var(--muted);margin:8px 0 0;font-weight:600;font-size:15px;opacity:0.85}
        .ui-feats{display:flex;flex-wrap:wrap;gap:16px;color:#bfeeff;font-weight:700;margin-top:24px;font-size:14px}
        .ui-feats > div{opacity:0;animation:fadeIn 0.5s ease-out forwards}
        .ui-feats > div:nth-child(1){animation-delay:0.3s}
        .ui-feats > div:nth-child(2){animation-delay:0.5s}
        .ui-feats > div:nth-child(3){animation-delay:0.7s}

        /* RIGHT CARD (modern glass) */
        .ui-right{width:480px;display:flex;align-items:center;justify-content:center;padding:48px;background:rgba(10,12,25,0.4);backdrop-filter:blur(30px);animation:slideInRight 0.6s ease-out;border-left:1px solid rgba(255,255,255,0.03)}
        .ui-card{
          width:100%;
          max-width:420px;
          border-radius:24px;
          padding:32px 28px;
          background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
          box-shadow: 0 30px 90px rgba(3,6,18,0.6), 0 0 0 1px rgba(123,92,255,0.15) inset;
          backdrop-filter: blur(16px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.08);
          display:flex;
          flex-direction:column;
          gap:12px;
          position:relative;
          overflow:hidden;
        }
        .ui-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg, var(--accent-a), var(--accent-b));opacity:0.6}
        .ui-card-head h2{margin:0;font-size:22px;font-weight:900;color:#e9fbff;letter-spacing:-0.3px}
        .ui-muted{color:var(--muted);margin:4px 0 8px;font-size:13px}

        .ui-form{display:flex;flex-direction:column;gap:10px}
        .ui-field{display:flex;flex-direction:column;gap:6px}
        .ui-field label{font-size:11px;color:var(--muted);font-weight:800;text-transform:uppercase;letter-spacing:0.5px}
        .ui-field input{
          width:100%;
          padding:11px 13px;
          border-radius:10px;
          border:1px solid rgba(255,255,255,0.05);
          background: rgba(255,255,255,0.01);
          color:#e6fbff;
          font-weight:600;
          font-size:14px;
          outline:none;
          transition: box-shadow .18s ease, border-color .18s ease, transform .14s ease, background .18s ease;
        }
        .ui-field input::placeholder{color:rgba(230,250,255,0.15)}
        .ui-field input:focus{
          border-color: rgba(123,92,255,0.7);
          background: rgba(255,255,255,0.02);
          box-shadow: 0 10px 32px rgba(123,92,255,0.08), 0 0 0 3px rgba(123,92,255,0.08);
          transform: translateY(-1px);
        }

        .ui-error{
          padding:9px 12px;border-radius:10px;background:linear-gradient(90deg, rgba(255,20,60,0.05), rgba(255,255,255,0.01));
          border:1px solid rgba(255,20,60,0.12);color:#ffdcdc;font-weight:700;font-size:13px;
          animation:shake 0.4s ease-out
        }

        .ui-btn{
          margin-top:8px;padding:12px;border-radius:10px;border:none;
          background: linear-gradient(135deg, var(--accent-a) 0%, var(--accent-b) 100%);
          color:#fff;font-weight:900;cursor:pointer;font-size:14px;
          display:inline-flex;align-items:center;justify-content:center;gap:8px;
          box-shadow: 0 12px 36px rgba(123,92,255,0.16);
          transition: transform .16s ease, box-shadow .16s ease;
          position:relative;
          overflow:hidden;
        }
        .ui-btn::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg, rgba(255,255,255,0.2), transparent);opacity:0;transition:opacity .16s ease}
        .ui-btn:hover:not([disabled])::before{opacity:1}
        .ui-btn:hover:not([disabled]){transform: translateY(-2px);box-shadow:0 18px 54px rgba(123,92,255,0.24)}
        .ui-btn:active:not([disabled]){transform: translateY(0);box-shadow:0 8px 24px rgba(123,92,255,0.2)}
        .ui-btn[disabled]{opacity:.5;cursor:not-allowed}

        .ui-spinner{width:14px;height:14px;border-radius:50%;border:2px solid rgba(255,255,255,0.3);border-top-color:#ffffff;animation:spin .7s linear infinite}

        .ui-quick{margin-top:12px;display:flex;flex-direction:column;gap:6px}
        .ui-quick-title{font-weight:900;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:0.8px}
        .ui-chips{display:flex;gap:8px;margin-top:4px}
        .ui-chip{padding:7px 14px;border-radius:8px;border:1px solid rgba(255,255,255,0.05);background:rgba(255,255,255,0.02);color:#bfefff;font-weight:800;font-size:13px;cursor:pointer;transition:all .16s ease;position:relative;overflow:hidden}
        .ui-chip::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg, rgba(123,92,255,0.1), rgba(0,230,255,0.05));opacity:0;transition:opacity .16s ease}
        .ui-chip:hover::before{opacity:1}
        .ui-chip:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(11,12,30,0.08);border-color:rgba(123,92,255,0.2)}
        .ui-chip.alt{background:linear-gradient(135deg, rgba(123,92,255,0.08), rgba(0,230,255,0.03));color:#fff;border-color:rgba(123,92,255,0.1)}

        .ui-card-foot{margin-top:8px;color:var(--muted);font-size:12px;opacity:0.7}

        /* animations */
        @keyframes fadeInUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideInLeft{from{opacity:0;transform:translateX(-30px)}to{opacity:1;transform:translateX(0)}}
        @keyframes slideInRight{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes pulse{0%,100%{box-shadow:0 16px 36px rgba(11,12,30,0.5)}50%{box-shadow:0 16px 36px rgba(123,92,255,0.3), 0 0 40px rgba(123,92,255,0.2)}}
        @keyframes floatCtrl{0%,100%{transform:translateY(0) rotate(-5deg)}50%{transform:translateY(-20px) rotate(-3deg)}}
        @keyframes shake{0%,100%{transform:translateX(0)}10%,30%,50%,70%,90%{transform:translateX(-4px)}20%,40%,60%,80%{transform:translateX(4px)}}
        @keyframes spin{to{transform:rotate(360deg)}}

        /* responsive */
        @media (max-width:1100px){
          .ui-hero{flex-direction:column;gap:0;height:auto;min-height:100vh}
          .ui-left{padding:32px 24px;min-height:40vh}
          .ui-right{width:100%;padding:32px 24px;border-left:none;border-top:1px solid rgba(255,255,255,0.03)}
          .ui-card{max-width:100%}
          .ui-title{font-size:36px}
          .ui-logo{width:80px;height:80px}
          .ui-main{padding:0}
          .ui-controller{display:none}
        }
      `}</style>
    </div>
  );
}

export default Login;
