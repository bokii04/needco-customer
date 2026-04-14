import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";

var MOCK_WORKER = {
  id: "w1", name: "Miguel Santos", full_name: "Miguel Santos", initials: "MS",
  rating: 4.9, total_jobs: 147, city: "Iloilo City",
};

export default function WaitingScreen() {
  const { navigate, activeJob, setActiveJob, setSelectedWorker } = useApp();
  const [elapsed, setElapsed] = useState(0);
  const [workerFound, setWorkerFound] = useState(false);

  useEffect(function() {
    var t = setTimeout(function() {
      setSelectedWorker({
        id: MOCK_WORKER.id, name: MOCK_WORKER.name, initials: MOCK_WORKER.initials,
        rating: MOCK_WORKER.rating, jobs: MOCK_WORKER.total_jobs, distance: 1.2,
        skills: [], price: { [activeJob?.service]: activeJob?.price },
      });
      setActiveJob(function(prev) { return { ...prev, status: "accepted", worker_name: MOCK_WORKER.name }; });
      setWorkerFound(true);
      setTimeout(function() { navigate("tracking"); }, 3000);
    }, 5000);
    return function() { clearTimeout(t); };
  }, []);

  useEffect(function() {
    var t = setInterval(function() { setElapsed(function(e) { return e + 1; }); }, 1000);
    return function() { clearInterval(t); };
  }, []);

  var fmt = function(s) { return Math.floor(s/60) + ":" + String(s%60).padStart(2,"0"); };

  if (workerFound) {
    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, alignItems: "center", justifyContent: "center", padding: 32, background: "var(--white)" }}>
        <div className="fade-up" style={{ width: 96, height: 96, background: "linear-gradient(135deg, var(--gold), var(--gold-mid))", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, marginBottom: 24, boxShadow: "var(--shadow-gold)" }}>🎉</div>
        <h2 className="fade-up-1" style={{ marginBottom: 8 }}>Worker found!</h2>
        <p className="fade-up-2" style={{ color: "var(--gray-400)", textAlign: "center", fontSize: 14 }}>
          <strong style={{ color: "var(--black)" }}>{MOCK_WORKER.name}</strong> accepted your {activeJob?.service} job
        </p>
        <div className="fade-up-3 card" style={{ marginTop: 20, width: "100%", display: "flex", alignItems: "center", gap: 14 }}>
          <div className="avatar" style={{ width: 52, height: 52, background: "var(--gold)", color: "var(--black)", fontSize: 18, fontWeight: 700 }}>{MOCK_WORKER.initials}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{MOCK_WORKER.name}</div>
            <div style={{ fontSize: 13, color: "var(--gray-400)", marginTop: 2 }}>⭐ {MOCK_WORKER.rating} · {MOCK_WORKER.total_jobs} jobs · {MOCK_WORKER.city}</div>
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 20, color: "var(--gold-dark)" }}>₱{activeJob?.price}</div>
        </div>
        <p className="fade-up-4" style={{ color: "var(--gray-400)", fontSize: 13, marginTop: 16 }}>Redirecting to live tracking...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div className="topbar">
        <span className="topbar-title">Finding a worker</span>
        <span className="badge badge-success" style={{ animation: "pulse 2s infinite" }}>● Live</span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px", textAlign: "center" }}>
        <div style={{ position: "relative", width: 160, height: 160, marginBottom: 32 }}>
          {[0,1,2].map(function(i) { return <div key={i} style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1.5px solid var(--gold-mid)", opacity: 0.3, animation: "ping "+(2+i*0.5)+"s "+(i*0.7)+"s infinite" }} />; })}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 72, height: 72, background: "linear-gradient(135deg, var(--gold), var(--gold-mid))", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, boxShadow: "var(--shadow-gold)" }}>🔍</div>
        </div>
        <h2 style={{ marginBottom: 8 }}>Searching for workers...</h2>
        <p style={{ color: "var(--gray-400)", fontSize: 14, lineHeight: 1.7, marginBottom: 8 }}>Nearby workers are being notified of your {activeJob?.service} request.</p>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "var(--gold-dark)", marginBottom: 28 }}>{fmt(elapsed)}</div>
        <div className="card" style={{ width: "100%", marginBottom: 20, textAlign: "left" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{activeJob?.service}</div>
              <div style={{ fontSize: 13, color: "var(--gray-400)", marginTop: 4 }}>{activeJob?.description}</div>
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 22, color: "var(--black)" }}>₱{activeJob?.price}</div>
          </div>
          <div style={{ fontSize: 13, color: "var(--gray-400)", borderTop: "1px solid var(--gray-200)", paddingTop: 10 }}>📍 {activeJob?.address} · ⏰ {activeJob?.when_needed || "ASAP"}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "var(--gold-light)", borderRadius: 20, border: "1px solid var(--gold-mid)", marginBottom: 20 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--gold)", animation: "pulse 1.5s infinite" }} />
          <span style={{ fontSize: 13, color: "var(--gold-dark)", fontWeight: 600 }}>Live — waiting for worker to accept</span>
        </div>
        <button className="btn btn-outline" style={{ width: "100%" }} onClick={function() { navigate("home"); }}>Cancel request</button>
      </div>
    </div>
  );
}
