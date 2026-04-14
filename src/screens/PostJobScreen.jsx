import { useState } from "react";
import { useApp } from "../context/AppContext";

export default function PostJobScreen() {
  const { navigate, selectedService, setJobForm, setActiveJob, setSelectedWorker } = useApp();
  const [form, setForm] = useState({ desc: "", address: "", when: "ASAP", budget: selectedService?.base || "" });
  const [loading, setLoading] = useState(false);
  const [posted, setPosted] = useState(false);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handlePost = () => {
    setLoading(true);
    var job = {
      id: "job_" + Date.now(),
      service: selectedService?.name,
      description: form.desc,
      address: form.address || "Iloilo City",
      price: Number(form.budget) || selectedService?.base,
      when_needed: form.when,
      status: "pending",
    };
    setJobForm({ ...form, jobId: job.id });
    setActiveJob(job);
    setTimeout(function() { setLoading(false); setPosted(true); }, 800);
    setTimeout(function() { navigate("waiting"); }, 2500);
  };

  if (posted) {
    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, alignItems: "center", justifyContent: "center", padding: 32, background: "var(--white)" }}>
        <div style={{ width: 88, height: 88, background: "linear-gradient(135deg, var(--gold), var(--gold-mid))", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, marginBottom: 24, boxShadow: "var(--shadow-gold)", animation: "fadeUp 0.4s ease both" }}>✅</div>
        <h2 style={{ marginBottom: 8, textAlign: "center" }}>Job posted!</h2>
        <p style={{ color: "var(--gray-400)", textAlign: "center", fontSize: 14 }}>Searching for nearby workers...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div className="topbar">
        <button className="back-btn" onClick={function() { navigate("home"); }}>←</button>
        <span className="topbar-title">Job details</span>
      </div>
      <div className="scroll-body">
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
          <textarea className="input-field" rows={4} placeholder="What needs to be done?" value={form.desc} onChange={function(e) { update("desc", e.target.value); }} />
          <div style={{ fontSize: 11, color: form.desc.length < 10 ? "var(--warning)" : "var(--success)", marginTop: 4 }}>
            {form.desc.length < 10 ? (10 - form.desc.length) + " more characters needed" : "✓ Good description"}
          </div>
        </div>
        <div className="fade-up-2 input-wrap">
          <label className="input-label">Your address *</label>
          <input className="input-field" placeholder="Street, Barangay, City" value={form.address} onChange={function(e) { update("address", e.target.value); }} />
        </div>
        <div className="fade-up-3 input-wrap">
          <label className="input-label">When do you need it?</label>
          <div style={{ display: "flex", gap: 8 }}>
            {["ASAP","Today PM","Tomorrow","Schedule"].map(function(opt) {
              return <button key={opt} onClick={function() { update("when", opt); }} style={{ flex: 1, padding: "10px 4px", border: form.when === opt ? "1.5px solid var(--gold)" : "1.5px solid var(--gray-200)", borderRadius: "var(--radius-sm)", background: form.when === opt ? "var(--gold-light)" : "none", fontSize: 11, fontWeight: 600, cursor: "pointer", color: form.when === opt ? "var(--gold-dark)" : "var(--gray-400)" }}>{opt}</button>;
            })}
          </div>
        </div>
        <div className="fade-up-4 input-wrap" style={{ marginBottom: 28 }}>
          <label className="input-label">Your budget (₱)</label>
          <input className="input-field" type="number" placeholder={"Suggested: ₱" + selectedService?.base} value={form.budget} onChange={function(e) { update("budget", e.target.value); }} />
        </div>
        <button className="btn btn-gold fade-up-5" onClick={handlePost} disabled={form.desc.length < 10 || !form.address || loading}>
          {loading ? "Posting job..." : "Post job & find workers →"}
        </button>
      </div>
    </div>
  );
}
