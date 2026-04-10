import { useState, useEffect } from "react";
import { useApp, SERVICES } from "../context/AppContext";

const ILOILO = { lat: 10.7202, lng: 122.5621 };
const PAVIA = { lat: 10.7799, lng: 122.5464 };

function getArea(lat, lng) {
  const dI = Math.hypot(lat - ILOILO.lat, lng - ILOILO.lng);
  const dP = Math.hypot(lat - PAVIA.lat, lng - PAVIA.lng);
  return dP < dI ? "Pavia, Iloilo" : "Iloilo City";
}

export default function HomeScreen() {
  const { user, selectedService, setSelectedService, navigate } = useApp();
  const [area, setArea] = useState("Iloilo City");
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    const h = new Date().getHours();
    if (h >= 12 && h < 17) setGreeting("Good afternoon");
    else if (h >= 17) setGreeting("Good evening");

    navigator.geolocation?.getCurrentPosition(
      pos => setArea(getArea(pos.coords.latitude, pos.coords.longitude)),
      () => {}
    );
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, background: "var(--white)" }}>
      {/* Header */}
      <div style={{ padding: "20px 20px 0", background: "var(--white)" }}>
        <div className="fade-up" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 12, color: "var(--gray-400)", margin: 0, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{greeting}</p>
            <h2 style={{ fontSize: 22, marginTop: 2 }}>{user?.name?.split(" ")[0]} 👋</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--gold-light)", padding: "8px 14px", borderRadius: 20, border: "1px solid var(--gold-mid)" }}>
            <span style={{ fontSize: 12 }}>📍</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--gold-dark)" }}>{area}</span>
          </div>
        </div>

        {/* Hero banner */}
        <div className="fade-up-1 card-dark" style={{ marginBottom: 24, padding: "20px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(201,168,76,0.1)" }} />
          <div style={{ position: "absolute", bottom: -30, right: 20, fontSize: 48, opacity: 0.15 }}>🏠</div>
          <div style={{ position: "relative" }}>
            <span className="badge badge-gold" style={{ marginBottom: 10, display: "inline-flex" }}>⚡ Fast booking</span>
            <h3 style={{ color: "var(--white)", fontSize: 18, marginBottom: 6 }}>Book a service in under 2 minutes</h3>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: 0 }}>Verified workers · Real-time tracking</p>
          </div>
        </div>
      </div>

      <div className="scroll-body" style={{ paddingTop: 0 }}>
        {/* Services */}
        <p className="section-label fade-up-2">What do you need?</p>
        <div className="fade-up-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          {SERVICES.map((svc, i) => (
            <button key={svc.id} onClick={() => setSelectedService(svc)} style={{
              background: selectedService?.id === svc.id ? "linear-gradient(135deg, #FBF6EA, #F5EDD6)" : "var(--gray-50)",
              border: selectedService?.id === svc.id ? "1.5px solid var(--gold)" : "1.5px solid var(--gray-200)",
              borderRadius: "var(--radius-md)", padding: "16px 14px",
              cursor: "pointer", textAlign: "left", transition: "all 0.2s",
              boxShadow: selectedService?.id === svc.id ? "var(--shadow-gold)" : "none"
            }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>{svc.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 13, color: "var(--black)", marginBottom: 2 }}>{svc.name}</div>
              <div style={{ fontSize: 11, color: "var(--gray-400)", marginBottom: 8 }}>{svc.desc}</div>
              <div style={{ fontWeight: 700, fontSize: 12, color: "var(--gold-dark)" }}>from ₱{svc.base}</div>
            </button>
          ))}
        </div>

        <button className="btn btn-gold fade-up-3" disabled={!selectedService} onClick={() => navigate("postjob")}>
          {selectedService ? `Book ${selectedService.name} →` : "Select a service to continue"}
        </button>
      </div>
    </div>
  );
}
