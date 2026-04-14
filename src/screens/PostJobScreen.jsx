import { useState } from "react";
import { useApp, SERVICES } from "../context/AppContext";
import { supabase } from "../lib/supabase";

export default function PostJobScreen() {
  const { navigate, selectedService, setJobForm, setActiveJob, user } = useApp();
  const [form, setForm] = useState({ desc: "", address: "", when: "ASAP", budget: selectedService?.base || "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [posted, setPosted] = useState(false);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handlePost = async () => {
    setLoading(true);
    setError("");

    // Default Iloilo coords — skip geolocation entirely to avoid hanging
    const lat = 10.7202;
    const lng = 122.5621;

    try {
      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .insert({
          customer_id: user.id,
          service: selectedService?.name,
          description: form.desc,
          address: form.address || "Iloilo City",
          lat, lng,
          status: "pending",
          price: Number(form.budget) || selectedService?.base,
          budget: Number(form.budget) || selectedService?.base,
          when_needed: form.when,
          customer_name: user?.name || "Customer",
          customer_phone: user?.phone || null,
          customer_avatar: user?.avatar || null,
        })
        .select();

      if (jobError) throw jobError;

      const job = Array.isArray(jobData) ? jobData[0] : jobData;
      if (!job) throw new Error("No job returned");
      console.log("[Customer] Job posted:", job.id);

      // Notify workers — fire and forget
      supabase.from("workers")
        .select("user_id")
        .eq("is_available", true)
        .eq("status", "approved")
        .then(({ data: workers }) => {
          if (workers && workers.length > 0) {
            supabase.from("notifications").insert(
              workers.map(w => ({
                user_id: w.user_id,
                title: "New " + selectedService?.name + " job!",
                body: (user?.name || "Customer") + " needs help — P" + (form.budget || selectedService?.base),
                type: "job_request",
              }))
            );
          }
        });

      setJobForm({ ...form, jobId: job.id });
      setActiveJob(job);
      setPosted(true);
      setTimeout(() => navigate("waiting"), 2000);

    } catch (e) {
      console.error("[Customer] Post failed:", e);
      setError("Failed to post job. Please try again.");
      setLoading(false);
    }
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
        <button className="back-btn" onClick={() => navigate("home")}>←</button>
        <span className="topbar-title">Job details</span>
      </div>
      <div className="scroll-body">
        <div className="fade-up card-gold" style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <div style={{ width: 52, height: 52, background: "var(--white)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, boxShadow: "var(--shadow-sm)" }}>{selectedService?.icon}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "var(--black)" }}>{selectedService?.name}</div>
            <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 2 }}>{selectedService?.desc}</div>
          </div>
          <span className="badge badge-gold" style={{ marginLeft: "auto" }}>P{selectedService?.base}+</span>
        </div>

        <div className="fade-up-1 input-wrap">
          <label className="input-label">Describe the job *</label>
          <textarea className="input-field" rows={4} placeholder="What needs to be done?" value={form.desc} onChange={e => update("desc", e.target.value)} />
          <div style={{ fontSize: 11, color: form.desc.length < 10 ? "var(--warning)" : "var(--success)", marginTop: 4 }}>
            {form.desc.length < 10 ? (10 - form.desc.length) + " more characters needed" : "Good description"}
          </div>
        </div>

        <div className="fade-up-2 input-wrap">
          <label className="input-label">Your address *</label>
          <input className="input-field" placeholder="Street, Barangay, City" value={form.address} onChange={e => update("address", e.target.value)} />
        </div>

        <div className="fade-up-3 input-wrap">
          <label className="input-label">When do you need it?</label>
          <div style={{ display: "flex", gap: 8 }}>
            {["ASAP","Today PM","Tomorrow","Schedule"].map(opt => (
              <button key={opt} onClick={() => update("when", opt)} style={{ flex: 1, padding: "10px 4px", border: form.when === opt ? "1.5px solid var(--gold)" : "1.5px solid var(--gray-200)", borderRadius: "var(--radius-sm)", background: form.when === opt ? "var(--gold-light)" : "none", fontSize: 11, fontWeight: 600, cursor: "pointer", color: form.when === opt ? "var(--gold-dark)" : "var(--gray-400)" }}>{opt}</button>
            ))}
          </div>
        </div>

        <div className="fade-up-4 input-wrap" style={{ marginBottom: 28 }}>
          <label className="input-label">Your budget (P)</label>
          <input className="input-field" type="number" placeholder={"Suggested: P" + selectedService?.base} value={form.budget} onChange={e => update("budget", e.target.value)} />
        </div>

        {error && (
          <div style={{ background: "var(--danger-light)", border: "1px solid var(--danger)", borderRadius: "var(--radius-md)", padding: "12px 14px", marginBottom: 16, fontSize: 13, color: "var(--danger)" }}>{error}</div>
        )}

        <button className="btn btn-gold fade-up-5" onClick={handlePost} disabled={form.desc.length < 10 || !form.address || loading}>
          {loading ? "Posting job..." : "Post job and find workers"}
        </button>
      </div>
    </div>
  );
}
