import { useState } from "react";
import { useApp } from "../context/AppContext";
import { supabase } from "../lib/supabase";

export default function PostJobScreen() {
  const { navigate, selectedService, setJobForm, user } = useApp();
  const [form, setForm] = useState({ desc: "", address: "", when: "ASAP", budget: selectedService?.base || "" });
  const [loading, setLoading] = useState(false);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleNext = async () => {
    setLoading(true);
    try {
      let jobId = null;
      if (user?.id) {
        const { data } = await supabase.from("jobs").insert({
          customer_id: user.id,
          service: selectedService?.name,
          description: form.desc,
          address: form.address || "Iloilo City",
          status: "pending",
          price: Number(form.budget) || selectedService?.base
        }).select().single();
        if (data) jobId = data.id;
      }
      setJobForm({ ...form, jobId });
      navigate("match");
    } catch(e) {
      setJobForm({ ...form });
      navigate("match");
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div className="topbar">
        <button className="back-btn" onClick={() => navigate("home")}>←</button>
        <span className="topbar-title">Job details</span>
      </div>

      <div className="scroll-body">
        {/* Service header */}
        <div className="fade-up card-gold" style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <div style={{ width: 52, height: 52, background: "var(--white)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, boxShadow: "var(--shadow-sm)" }}>{selectedService?.icon}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "var(--black)" }}>{selectedService?.name}</div>
            <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 2 }}>{selectedService?.desc}</div>
            <div style={{ fontSize: 11, color: "var(--gold-dark)", fontWeight: 600, marginTop: 4 }}>⏱ ETA {selectedService?.eta}</div>
          </div>
          <span className="badge badge-gold" style={{ marginLeft: "auto" }}>₱{selectedService?.base}+</span>
        </div>

        <div className="fade-up-1 input-wrap">
          <label className="input-label">Describe the job *</label>
          <textarea className="input-field" rows={4} placeholder="Be specific — what needs to be done? Include any important details." value={form.desc} onChange={e => update("desc", e.target.value)} />
          <div style={{ fontSize: 11, color: form.desc.length < 20 ? "var(--warning)" : "var(--success)", marginTop: 4 }}>
            {form.desc.length < 20 ? `${20 - form.desc.length} more characters required` : "✓ Good description"}
          </div>
        </div>

        <div className="fade-up-2 input-wrap">
          <label className="input-label">Your address *</label>
          <input className="input-field" placeholder="Street, Barangay, City" value={form.address} onChange={e => update("address", e.target.value)} />
        </div>

        <div className="fade-up-3 input-wrap">
          <label className="input-label">When do you need it?</label>
          <div style={{ display: "flex", gap: 8 }}>
            {["ASAP", "Today PM", "Tomorrow", "Schedule"].map(opt => (
              <button key={opt} onClick={() => update("when", opt)} style={{
                flex: 1, padding: "10px 4px",
                border: form.when === opt ? "1.5px solid var(--gold)" : "1.5px solid var(--gray-200)",
                borderRadius: "var(--radius-sm)",
                background: form.when === opt ? "var(--gold-light)" : "none",
                fontSize: 11, fontWeight: 600, cursor: "pointer",
                color: form.when === opt ? "var(--gold-dark)" : "var(--gray-400)",
                transition: "all 0.15s"
              }}>{opt}</button>
            ))}
          </div>
        </div>

        <div className="fade-up-4 input-wrap" style={{ marginBottom: 28 }}>
          <label className="input-label">Your budget (₱)</label>
          <input className="input-field" type="number" placeholder={`Suggested: ₱${selectedService?.base}`} value={form.budget} onChange={e => update("budget", e.target.value)} />
          <div style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 4 }}>Workers will see your budget and may offer quotes</div>
        </div>

        <button className="btn btn-gold fade-up-5" onClick={handleNext} disabled={form.desc.length < 20 || !form.address || loading}>
          {loading ? "Finding workers..." : "Find workers nearby →"}
        </button>
      </div>
    </div>
  );
}
