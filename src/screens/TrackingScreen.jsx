import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";

const STEPS = [
  { key: "posted", label: "Job posted", icon: "📋" },
  { key: "accepted", label: "Worker accepted", icon: "✅" },
  { key: "enroute", label: "On the way", icon: "🚗" },
  { key: "arrived", label: "Worker arrived", icon: "📍" },
  { key: "working", label: "Work in progress", icon: "🔧" },
  { key: "complete", label: "Completed", icon: "🎉" },
];

export default function TrackingScreen() {
  const { navigate, selectedWorker, selectedService, activeJob } = useApp();
  const [step, setStep] = useState(2);
  const [eta, setEta] = useState(8);

  useEffect(() => {
    const t = setInterval(() => {
      setEta(e => {
        if (e <= 1) { clearInterval(t); setStep(s => Math.min(s+1,3)); return 0; }
        return e - 1;
      });
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const price = selectedWorker?.price?.[selectedService?.name] || activeJob?.price || 400;

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div className="topbar">
        <span className="topbar-title">Tracking</span>
        <span className="badge badge-success" style={{ animation: "pulse 2s infinite" }}>● Live</span>
      </div>

      <div className="scroll-body">
        {/* Map placeholder */}
        <div className="fade-up" style={{ height: 200, background: "linear-gradient(145deg, #E8F4E8 0%, #D4EDD4 40%, #C8E6E8 100%)", borderRadius: "var(--radius-lg)", position: "relative", overflow: "hidden", marginBottom: 20 }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)", backgroundSize: "40px 40px", opacity: 0.5 }} />
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-80%)", fontSize: 28 }}>📍</div>
          <div style={{ position: "absolute", top: "25%", left: "35%", width: 36, height: 36, background: "var(--gold-light)", border: "2px solid var(--gold)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "var(--gold-dark)", transition: "all 2s ease" }}>
            {selectedWorker?.initials?.[0] || "W"}
          </div>
          <div style={{ position: "absolute", top: "25%", left: "35%", width: 36, height: 36, background: "rgba(201,168,76,0.3)", borderRadius: "50%", animation: "ping 2s infinite" }} />
          <div style={{ position: "absolute", bottom: 12, left: 12, background: "rgba(255,255,255,0.95)", borderRadius: "var(--radius-sm)", padding: "6px 12px", fontSize: 12, fontWeight: 600, color: "var(--black)" }}>
            {eta > 0 ? `ETA: ${eta} min` : "Worker arrived!"}
          </div>
        </div>

        {/* Worker card */}
        <div className="fade-up-1 card-gold" style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <div className="avatar" style={{ width: 50, height: 50, background: "var(--gold)", color: "var(--black)", fontSize: 16, fontWeight: 700 }}>
            {selectedWorker?.initials || "WK"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{selectedWorker?.name || "Worker"}</div>
            <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 2 }}>{selectedService?.name} · ₱{price}</div>
            <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
              {"★".repeat(Math.floor(selectedWorker?.rating || 5)).split("").map((s, i) => (
                <span key={i} style={{ color: "var(--gold)", fontSize: 12 }}>★</span>
              ))}
              <span style={{ fontSize: 12, color: "var(--gray-400)", marginLeft: 4 }}>{selectedWorker?.rating}</span>
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => navigate("chat")}>💬 Chat</button>
        </div>

        {/* Progress steps */}
        <p className="section-label fade-up-2">Job progress</p>
        <div className="fade-up-2" style={{ marginBottom: 24 }}>
          {STEPS.map((s, i) => {
            const done = i < step;
            const current = i === step;
            return (
              <div key={s.key}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "10px 0" }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: done ? 14 : current ? 16 : 14,
                    background: done ? "var(--black)" : current ? "var(--gold)" : "var(--gray-100)",
                    border: current ? "2px solid var(--gold-mid)" : "none",
                    boxShadow: current ? "var(--shadow-gold)" : "none",
                    transition: "all 0.3s"
                  }}>
                    {done ? "✓" : s.icon}
                  </div>
                  <div style={{ paddingTop: 6 }}>
                    <div style={{ fontSize: 14, fontWeight: current ? 700 : 400, color: done || current ? "var(--black)" : "var(--gray-400)" }}>{s.label}</div>
                    {current && s.key === "enroute" && (
                      <div style={{ fontSize: 12, color: "var(--gold-dark)", marginTop: 2, fontWeight: 600 }}>
                        {eta > 0 ? `${eta} minutes away` : "Just arrived!"}
                      </div>
                    )}
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ width: 2, height: 16, background: done ? "var(--black)" : "var(--gray-200)", marginLeft: 17, transition: "background 0.3s" }} />
                )}
              </div>
            );
          })}
        </div>

        <button className="btn btn-gold fade-up-3" onClick={() => navigate("review")}>
          Mark as completed ✓
        </button>
        <button className="btn btn-outline fade-up-4" style={{ marginTop: 10 }} onClick={() => navigate("chat")}>
          💬 Chat with worker
        </button>
      </div>
    </div>
  );
}
