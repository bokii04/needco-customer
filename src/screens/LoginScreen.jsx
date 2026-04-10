import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function LoginScreen() {
  const [loading, setLoading] = useState(null);

  const handleGoogle = async () => {
    setLoading("google");
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin }
    });
  };

  const handleFacebook = async () => {
    setLoading("facebook");
    await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: { redirectTo: window.location.origin }
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#0A0A0A" }}>
      {/* Hero */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 32px 40px", position: "relative", overflow: "hidden" }}>
        {/* Background decoration */}
        <div style={{ position: "absolute", top: -100, right: -100, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: -50, left: -80, width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)" }} />

        <div className="fade-up" style={{ textAlign: "center", position: "relative" }}>
          {/* Logo */}
          <div style={{ width: 72, height: 72, background: "linear-gradient(135deg, #C9A84C, #E2C070)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 8px 32px rgba(201,168,76,0.4)" }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 28, color: "#0A0A0A" }}>N</span>
          </div>
          <h1 style={{ color: "#FFFFFF", fontSize: 40, marginBottom: 8, fontFamily: "'Playfair Display', serif" }}>Need.co</h1>
          <div style={{ width: 40, height: 2, background: "linear-gradient(90deg, #C9A84C, #E2C070)", borderRadius: 1, margin: "0 auto 16px" }} />
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "Inter, sans-serif" }}>Premium Home Services</p>
        </div>

        {/* Features */}
        <div className="fade-up-2" style={{ display: "flex", gap: 24, marginTop: 48 }}>
          {[["⚡","Fast"],["🛡","Trusted"],["📍","Nearby"]].map(([icon, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Login form */}
      <div style={{ background: "#FFFFFF", borderRadius: "28px 28px 0 0", padding: "32px 24px 40px" }}>
        <div className="fade-up" style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 22, marginBottom: 6 }}>Welcome back</h2>
          <p style={{ fontSize: 14, color: "var(--gray-400)" }}>Sign in to book premium services</p>
        </div>

        <div className="fade-up-1" style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          <button onClick={handleGoogle} disabled={loading === "google"} className="btn btn-dark" style={{ gap: 12 }}>
            <div style={{ width: 20, height: 20, background: "#fff", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#4285F4" }}>G</div>
            {loading === "google" ? "Signing in..." : "Continue with Google"}
          </button>

          <button onClick={handleFacebook} disabled={loading === "facebook"} className="btn" style={{ background: "#1877F2", color: "#fff", gap: 12 }}>
            <div style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700 }}>f</div>
            {loading === "facebook" ? "Signing in..." : "Continue with Facebook"}
          </button>
        </div>

        <div className="fade-up-2 divider"><span>Iloilo City & Pavia only</span></div>

        <p className="fade-up-3" style={{ textAlign: "center", fontSize: 12, color: "var(--gray-400)", lineHeight: 1.6 }}>
          By continuing you agree to Need.co's Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
