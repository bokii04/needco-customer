import { useApp } from "../context/AppContext";

const MOCK_WORKERS = [
  { id: 1, name: "Miguel Santos", initials: "MS", skills: ["Plumbing","Electrical"], rating: 4.9, jobs: 147, distance: 0.8, responseTime: "Usually responds in 2 min", verified: true, price: { Electrical: 420, Plumbing: 380, Cleaning: 300, Aircon: 520, Carpentry: 460, Moving: 650, Mechanic: 520, "Custom Job": 350 } },
  { id: 2, name: "Ana Reyes", initials: "AR", skills: ["Cleaning","Aircon"], rating: 4.8, jobs: 203, distance: 1.2, responseTime: "Usually responds in 5 min", verified: true, price: { Electrical: 400, Plumbing: 360, Cleaning: 260, Aircon: 500, Carpentry: 440, Moving: 600, Mechanic: 500, "Custom Job": 320 } },
  { id: 3, name: "Carlo Dizon", initials: "CD", skills: ["Electrical","Carpentry"], rating: 4.7, jobs: 89, distance: 2.1, responseTime: "Usually responds in 8 min", verified: true, price: { Electrical: 390, Plumbing: 350, Cleaning: 250, Aircon: 490, Carpentry: 450, Moving: 580, Mechanic: 490, "Custom Job": 310 } },
  { id: 4, name: "Luz Fernandez", initials: "LF", skills: ["Cleaning","Moving"], rating: 4.9, jobs: 312, distance: 2.8, responseTime: "Usually responds in 3 min", verified: true, price: { Electrical: 410, Plumbing: 370, Cleaning: 270, Aircon: 510, Carpentry: 450, Moving: 620, Mechanic: 510, "Custom Job": 330 } },
];

export default function MatchScreen() {
  const { navigate, selectedService, selectedWorker, setSelectedWorker, jobForm, setActiveJob } = useApp();

  const handleHire = () => {
    setActiveJob({ ...jobForm, service: selectedService?.name, worker: selectedWorker });
    navigate("tracking");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div className="topbar">
        <button className="back-btn" onClick={() => navigate("postjob")}>←</button>
        <span className="topbar-title">Choose a worker</span>
        <span className="badge badge-gold">{MOCK_WORKERS.length} available</span>
      </div>

      <div className="scroll-body">
        {/* Info banner */}
        <div className="fade-up card-gold" style={{ marginBottom: 20, display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 20 }}>🎯</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Workers ranked for you</div>
            <div style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 2 }}>By distance, rating & response time</div>
          </div>
        </div>

        {MOCK_WORKERS.map((w, i) => {
          const price = w.price[selectedService?.name] || selectedService?.base;
          const selected = selectedWorker?.id === w.id;
          return (
            <div key={w.id} className={`fade-up-${Math.min(i+1,5)}`} onClick={() => setSelectedWorker(w)} style={{
              padding: "16px", marginBottom: 12,
              background: selected ? "linear-gradient(135deg, #FBF6EA, #F5EDD6)" : "var(--white)",
              border: selected ? "1.5px solid var(--gold)" : "1.5px solid var(--gray-200)",
              borderRadius: "var(--radius-lg)", cursor: "pointer", transition: "all 0.2s",
              boxShadow: selected ? "var(--shadow-gold)" : "var(--shadow-sm)"
            }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div className="avatar" style={{ width: 48, height: 48, background: selected ? "var(--gold)" : "var(--black)", color: selected ? "var(--black)" : "var(--white)", fontSize: 15, fontWeight: 700 }}>{w.initials}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{w.name}</div>
                    {w.verified && <span className="badge badge-gold" style={{ fontSize: 9, padding: "2px 7px" }}>✓ Verified</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--gray-400)", marginBottom: 6 }}>
                    ⭐ {w.rating} · {w.jobs} jobs · {w.distance} km away
                  </div>
                  <div style={{ fontSize: 11, color: "var(--gray-400)", marginBottom: 8 }}>{w.responseTime}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {w.skills.map(s => <span key={s} className="badge badge-gray" style={{ fontSize: 10 }}>{s}</span>)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 18, color: selected ? "var(--gold-dark)" : "var(--black)" }}>₱{price}</div>
                  <div style={{ fontSize: 10, color: "var(--gray-400)", marginTop: 2 }}>{w.distance} km</div>
                </div>
              </div>
            </div>
          );
        })}

        <button className="btn btn-gold" style={{ marginTop: 8 }} disabled={!selectedWorker} onClick={handleHire}>
          {selectedWorker ? `Book ${selectedWorker.name.split(" ")[0]} →` : "Select a worker"}
        </button>
      </div>
    </div>
  );
}
