"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Terjadi kesalahan.");
      } else {
        setSuccess("✅ Akun berhasil dibuat! Mengalihkan ke halaman login...");
        setTimeout(() => router.push("/auth/login"), 2000);
      }
    } catch {
      setError("Gagal terhubung ke server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Background sama persis dengan page.tsx */}
      <div className="smoke-container">
        <div className="smoke-blob" style={{ width: 750, height: 750, background: "rgba(255, 193, 7,0.38)", left: -220, top: -220, opacity: 1 }} />
        <div className="smoke-blob" style={{ width: 850, height: 850, background: "rgba(255, 160, 0,0.30)", right: -260, bottom: -260, animationDelay: "-7s", opacity: 0.95 }} />
        <div className="smoke-blob" style={{ width: 650, height: 650, background: "rgba(255, 224, 130,0.28)", left: "25%", top: "8%", animationDelay: "-12s" }} />
        <div className="smoke-blob" style={{ width: 580, height: 580, background: "rgba(255, 236, 179,0.25)", right: "6%", top: "30%", animationDelay: "-18s" }} />
        <div className="smoke-blob" style={{ width: 500, height: 500, background: "rgba(230, 81, 0,0.22)", left: "8%", bottom: 0, animationDelay: "-4s" }} />
      </div>

      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
        zIndex: 1,
      }}>
        <div style={{
          width: "100%",
          maxWidth: 440,
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRadius: 24,
          border: "1.5px solid rgba(255,255,255,0.7)",
          boxShadow: "0 20px 60px rgba(255, 160, 0,0.18), 0 4px 16px rgba(0,0,0,0.06)",
          padding: "40px 36px",
          animation: "fadeIn 0.6s ease",
        }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#E65100,#FFCA28)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
              boxShadow: "0 8px 24px rgba(255, 160, 0,0.35)",
            }}>
              <svg viewBox="0 0 24 24" width="28" height="28" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
              </svg>
            </div>
            <div style={{
              fontFamily: "'Pixelify Sans', sans-serif",
              fontSize: 26,
              fontWeight: 700,
              color: "#E65100",
              letterSpacing: "-0.5px",
            }}>MinoAI</div>
            <div style={{
              fontFamily: "'VT323', monospace",
              fontSize: 13,
              color: "#1C1917",
              marginTop: 4,
            }}>Asisten Keuangan Pribadi Berbasis AI</div>
          </div>

          {/* Divider */}
          <div style={{
            height: 1,
            background: "linear-gradient(90deg,transparent,rgba(255, 193, 7,0.3),transparent)",
            marginBottom: 24,
          }} />

          {/* Title */}
          <div style={{ marginBottom: 22 }}>
            <div style={{
              fontFamily: "'Pixelify Sans', sans-serif",
              fontSize: 22,
              color: "#BF360C",
              marginBottom: 4,
            }}>Buat Akun Baru ✨</div>
            <div style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: "#1C1917" }}>
              Gratis! Mulai kelola keuanganmu bersama AI
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {error && (
              <div style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 10,
                padding: "10px 14px",
                fontFamily: "'VT323', monospace",
                fontSize: 13,
                color: "#dc2626",
              }}>
                ⚠️ {error}
              </div>
            )}
            {success && (
              <div style={{
                background: "rgba(5,150,105,0.08)",
                border: "1px solid rgba(5,150,105,0.3)",
                borderRadius: 10,
                padding: "10px 14px",
                fontFamily: "'VT323', monospace",
                fontSize: 13,
                color: "#059669",
              }}>
                {success}
              </div>
            )}

            {[ 
              { label: "Nama Lengkap", type: "text", value: name, setter: setName, placeholder: "John Doe" },
              { label: "Email", type: "email", value: email, setter: setEmail, placeholder: "nama@email.com" },
              { label: "Password", type: "password", value: password, setter: setPassword, placeholder: "Minimal 6 karakter" },
              { label: "Konfirmasi Password", type: "password", value: confirmPassword, setter: setConfirmPassword, placeholder: "Ulangi password" },
            ].map(({ label, type, value, setter, placeholder }) => (
              <div key={label}>
                <label style={{
                  fontFamily: "'VT323', monospace",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#374151",
                  display: "block",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.6px",
                }}>{label}</label>
                <input
                  type={type}
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  placeholder={placeholder}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 12,
                    border: "1.5px solid rgba(255, 193, 7,0.25)",
                    background: "rgba(255,255,255,0.9)",
                    fontFamily: "'VT323', monospace",
                    fontSize: 14,
                    color: "#1e293b",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "rgba(255, 160, 0,0.6)"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(255, 193, 7,0.25)"}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: 12,
                border: "none",
                background: loading
                  ? "rgba(255, 193, 7,0.5)"
                  : "linear-gradient(135deg,#E65100,#FFCA28)",
                color: "white",
                fontFamily: "'VT323', monospace",
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: "0.3px",
                marginTop: 4,
                boxShadow: loading ? "none" : "0 4px 16px rgba(255, 160, 0,0.35)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!loading) (e.target as HTMLButtonElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.transform = "translateY(0)";
              }}
            >
              {loading ? "⏳ Membuat akun..." : "🎉 Daftar Sekarang"}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            height: 1,
            background: "linear-gradient(90deg,transparent,rgba(255, 193, 7,0.2),transparent)",
            margin: "24px 0",
          }} />

          {/* Login link */}
          <div style={{ textAlign: "center", fontFamily: "'VT323', monospace", fontSize: 13, color: "#1C1917" }}>
            Sudah punya akun?{" "}
            <Link
              href="/auth/login"
              style={{
                color: "#E65100",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Masuk di sini →
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
