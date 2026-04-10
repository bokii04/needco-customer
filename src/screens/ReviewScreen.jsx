import { useState } from "react";
import { useApp } from "../context/AppContext";
import { supabase } from "../lib/supabase";

export default function ReviewScreen() {
  const { navigate, selectedWorker, selectedService, activeJob, user } = useApp();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [paid, setPaid] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const price = selectedWorker?.price?.[selectedService?.name] || activeJob?.price || 400;
  const labels = ["", "Poor", "Fair", "Good", "Great", "Excellent!"];

  const handleSubmit = async () => {
    try {
      if (activeJob?.jobId) {
        await supabase.from("jobs").update({ status: "done" }).eq("id", activeJob.jobId);
      }
      if (rating > 0) {
        await supabase.from("reviews").insert({
          job_id: activeJob?.jobId || null,
          customer_id: user?.id,
          worker_id: null,
          rating,
          comment
        });
      }
    } catch(e) {}
    setSubmitted(true);
    setTimeout(() => navigate("home"), 2500);
  };

  if (submitted) {
    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, alignItems: "center", justifyContent: "center", padding: 40 }}>
        <div style={{ width: 80, height: 80, background: "linear-gradient(135deg, var(--gold), var(--gold-mid))", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, marginBottom: 20, boxShadow: "var(--shadow-gold)" }}>🎉</div>
        <h2 style={{ textAlign: "center", marginBottom: 8 }}>All done!</h2>
        <p style={{ textAlign: "center", color: "var(--gray-400)" }}>Thank you for using Need.co</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div className="topbar">
        <span className="topbar-title">Complete job</span>
      </div>

      <div className="scroll-body">
        {/* Payment */}
        <div className="fade-up card" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Payment</div>
              <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 2 }}>Cash on delivery</div>
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 28, color: "var(--black)" }}>₱{price}</div>
          </div>

          <div style={{ borderTop: "1px solid var(--gray-200)", paddingTop: 12, marginBottom: 14 }}>
            {[["Service fee", `₱${price}`], ["Platform fee", "₱0"], ["Total", `₱${price}`]].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: l === "Total" ? "var(--black)" : "var(--gray-400)", fontWeight: l === "Total" ? 600 : 400 }}>{l}</span>
                <span style={{ fontSize: 13, fontWeight: l === "Total" ? 700 : 400, color: "var(--black)" }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ background: "var(--gray-50)", borderRadius: "var(--radius-sm)", padding: "12px 14px", marginBottom: 14, display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 20 }}>💵</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Cash payment</div>
              <div style={{ fontSize: 11, color: "var(--gray-400)" }}>Pay the worker directly in cash</div>
            </div>
          </div>

          {!paid ? (
            <button className="btn btn-dark" onClick={() => setPaid(true)}>Confirm cash payment ✓</button>
          ) : (
            <div style={{ background: "var(--success-light)", borderRadius: "var(--radius-sm)", padding: "12px 14px", display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 18 }}>✅</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--success)" }}>Payment confirmed!</span>
            </div>
          )}
        </div>

        {/* Rating */}
        <div className="fade-up-1 card" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
            <div className="avatar" style={{ width: 46, height: 46, background: "var(--gold)", color: "var(--black)", fontSize: 14, fontWeight: 700 }}>
              {selectedWorker?.initials || "WK"}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{selectedWorker?.name || "Worker"}</div>
              <div style={{ fontSize: 12, color: "var(--gray-400)" }}>{selectedService?.name}</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 8 }}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)} onClick={() => setRating(n)} style={{
                background: "none", border: "none", cursor: "pointer", fontSize: 36, padding: 2,
                color: n <= (hovered || rating) ? "var(--gold)" : "var(--gray-200)",
                transform: n <= (hovered || rating) ? "scale(1.2)" : "scale(1)",
                transition: "all 0.15s"
              }}>★</button>
            ))}
          </div>

          <p style={{ textAlign: "center", fontSize: 14, fontWeight: 600, color: "var(--gold-dark)", marginBottom: 16, height: 20 }}>
            {labels[hovered || rating]}
          </p>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {["On time", "Professional", "Great quality", "Would hire again"].map(tag => (
              <button key={tag} onClick={() => setComment(c => c ? c + ". " + tag : tag)} style={{
                padding: "7px 12px", border: "1.5px solid var(--gray-200)", borderRadius: 20,
                background: "none", fontSize: 12, fontWeight: 500, cursor: "pointer", color: "var(--gray-600)",
                transition: "all 0.15s"
              }}>{tag}</button>
            ))}
          </div>

          <textarea className="input-field" rows={2} placeholder="Leave a comment (optional)" value={comment} onChange={e => setComment(e.target.value)} />
        </div>

        <button className="btn btn-gold fade-up-2" disabled={!paid || !rating} onClick={handleSubmit}>
          Submit & complete ✓
        </button>
        <button className="btn btn-outline fade-up-3" style={{ marginTop: 10 }} onClick={() => navigate("home")}>
          Skip rating
        </button>
      </div>
    </div>
  );
}
