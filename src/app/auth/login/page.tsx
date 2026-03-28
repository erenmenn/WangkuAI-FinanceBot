"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LandingLoginPage() {
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<'none' | 'login' | 'register'>('none');
  
  // States Login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  // States Register
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    
    if (res?.error) {
      setLoginError("Email atau password salah.");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(""); setRegSuccess("");
    if (regPassword !== regConfirm) return setRegError("Password tidak cocok!");
    if (regPassword.length < 6) return setRegError("Minimal 6 karakter.");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword }),
      });
      const data = await res.json();
      if (!res.ok) setRegError((data.error || "Gagal mendaftar.") + (data.detail ? ` [${data.detail}]` : ''));
      else {
        setRegSuccess("✅ Akun berhasil dibuat! Silakan login.");
        setTimeout(() => {
           setActiveModal('login');
           setEmail(regEmail);
           setPassword(regPassword);
        }, 1500);
      }
    } catch {
      setRegError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  const playClickSound = () => {
    const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");
    audio.volume = 0.6;
    audio.play().catch(() => {});
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;500;600;700&family=Press+Start+2P&family=VT323&display=swap');
        
        body, html { margin: 0; padding: 0; overflow: hidden; background: #000; }
        
        .landing-bg {
          width: 100vw; height: 100vh;
          background-image: url('/img/image.png');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          touch-action: pan-y; /* Mencegah pinch-to-zoom di perangkat layar sentuh */
          position: relative;
        }

        .pixel-btn {
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: 1px;
          padding: 14px 40px;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.1s ease;
          border: 4px solid #1C1917;
          box-shadow: 6px 6px 0px #1C1917;
          animation: pulseBtn 2.5s infinite ease-in-out;
        }

        @keyframes pulseBtn {
          0%, 100% { transform: scale(1); filter: brightness(1); box-shadow: 6px 6px 0px #1C1917; }
          50% { transform: scale(1.05); filter: brightness(1.2); box-shadow: 8px 8px 0px #1C1917; }
        }
        
        .pixel-btn.primary { background: #E65100; color: white; }
        .pixel-btn.primary:hover { background: #FF8F00; animation: none; transform: translate(2px, 2px); box-shadow: 4px 4px 0px #1C1917; }
        
        .pixel-btn.secondary { background: #ffffff; color: #1C1917; }
        .pixel-btn.secondary:hover { background: #fdfdfd; animation: none; transform: translate(2px, 2px); box-shadow: 4px 4px 0px #1C1917; }

        .modal-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          animation: fadeIn 0.3s ease;
        }

        .modal-card {
          width: 90%;
          maxWidth: 380px;
          background: #fff;
          border: 4px solid #1C1917;
          box-shadow: 8px 8px 0px #1C1917;
          border-radius: 12px;
          padding: 32px;
          position: relative;
          animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .close-btn {
          position: absolute;
          top: -12px; right: -12px;
          width: 30px; height: 30px;
          background: #ef4444;
          border: 3px solid #1C1917;
          color: white; font-weight: bold; font-family: 'VT323'; fontSize: 18px;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 2px 2px 0px #1C1917;
          display: flex; align-items: center; justify-content: center;
        }
        .close-btn:hover { background: #b91c1c; transform: translate(2px, 2px); box-shadow: 1px 1px 0px #1C1917; }

        .input-field {
          width: 100%;
          padding: 12px;
          border: 3px solid #1C1917;
          border-radius: 6px;
          font-family: 'VT323', monospace;
          font-size: 16px;
          outline: none;
          box-sizing: border-box;
          margin-bottom: 12px;
        }
        .input-field:focus { background: #FFFDE7; border-color: #E65100; box-shadow: inset 4px 4px 0px rgba(0,0,0,0.05); }

        .label-text {
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #1C1917;
          margin-bottom: 4px;
          display: block;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      <div className="landing-bg">
        {/* Bagian Tombol Login & Daftar */}
        <div style={{ position: "absolute", top: 120, right: 48, display: "flex", flexDirection: "column", gap: "20px" }}>
          <button onClick={() => { playClickSound(); setActiveModal('login'); }} className="pixel-btn primary">Login</button>
          <button onClick={() => { playClickSound(); setActiveModal('register'); }} className="pixel-btn secondary">Daftar Baru</button>
        </div>

        {/* MODAL AREA */}
        {activeModal !== 'none' && (
          <div className="modal-overlay">
            <div className="modal-card">
              <button className="close-btn" onClick={() => setActiveModal('none')}>X</button>
              
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <h1 style={{ fontFamily: "'Pixelify Sans'", fontSize: 24, margin: 0, color: "#E65100", textShadow: "1px 1px 0px #1C1917" }}>
                  {activeModal === 'login' ? 'MULAI MAIN!' : 'GABUNG SEKARANG!'}
                </h1>
                <p style={{ fontFamily: "'VT323'", fontSize: 15, margin: "4px 0 0", color: "#666" }}>
                  {activeModal === 'login' ? 'Masuk ke portal WangkuAI' : 'Buat karakter pertamamu'}
                </p>
              </div>

              {/* FORM LOGIN */}
              {activeModal === 'login' && (
                <form onSubmit={handleLogin}>
                  {loginError && <div style={{ background: "#fee2e2", border: "2px solid #ef4444", padding: 8, fontFamily: "'VT323'", color: "#b91c1c", marginBottom: 12 }}>⚠️ {loginError}</div>}
                  <label className="label-text">EMAIL PLAYER</label>
                  <input type="email" className="input-field" placeholder="contoh@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  
                  <label className="label-text">KATA SANDI</label>
                  <input type="password" className="input-field" placeholder="******" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  
                  <button type="submit" disabled={loading} className="pixel-btn primary" style={{ width: "100%", marginTop: 8 }}>
                    {loading ? 'MEMUAT...' : 'START GAME'}
                  </button>
                  <p style={{ textAlign: "center", fontFamily: "'VT323'", fontSize: 14, marginTop: 16 }}>Belum punya akun? <span onClick={() => setActiveModal('register')} style={{ color: "#E65100", cursor: "pointer", fontWeight: "bold" }}>Daftar →</span></p>
                </form>
              )}

              {/* FORM REGISTER */}
              {activeModal === 'register' && (
                <form onSubmit={handleRegister}>
                  {regError && <div style={{ background: "#fee2e2", border: "2px solid #ef4444", padding: 8, fontFamily: "'VT323'", color: "#b91c1c", marginBottom: 12 }}>⚠️ {regError}</div>}
                  {regSuccess && <div style={{ background: "#d1fae5", border: "2px solid #10b981", padding: 8, fontFamily: "'VT323'", color: "#065f46", marginBottom: 12 }}>{regSuccess}</div>}
                  
                  <label className="label-text">NICKNAME</label>
                  <input type="text" className="input-field" placeholder="Nama Player" value={regName} onChange={(e) => setRegName(e.target.value)} required />

                  <label className="label-text">EMAIL PLAYER</label>
                  <input type="email" className="input-field" placeholder="contoh@email.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
                  
                  <label className="label-text">KATA SANDI BARU</label>
                  <input type="password" className="input-field" placeholder="******" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
                  
                  <label className="label-text">ULANGI SANDI</label>
                  <input type="password" className="input-field" placeholder="******" value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)} required />

                  <button type="submit" disabled={loading} className="pixel-btn secondary" style={{ width: "100%", marginTop: 8 }}>
                    {loading ? 'MEMBUAT...' : 'CREATE ACCOUNT'}
                  </button>
                  <p style={{ textAlign: "center", fontFamily: "'VT323'", fontSize: 14, marginTop: 16 }}>Sudah punya akun? <span onClick={() => setActiveModal('login')} style={{ color: "#E65100", cursor: "pointer", fontWeight: "bold" }}>Login →</span></p>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
