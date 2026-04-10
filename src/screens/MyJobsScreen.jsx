import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { supabase } from "../lib/supabase";

export default function MyJobsScreen() {
  const { navigate, user } = useApp();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    if (!user?.id) { setLoading(false); return; }
    const { data } = await supabase.from("jobs").select("*").eq("customer_id", user.id).order("created_at", { ascending: false });
    if (data) setJobs(data);
    setLoading(false);
  };

  const statusConfig = {
    active: { label: "Active", bg: "var(--success-light)", color: "var(--success)" },
    pending: { label: "Pending", bg: "var(--warning-light)", color: "var(--warning)" },
    done: { label: "Completed", bg: "var(--gray-100)", color: "var(--gray-600)" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div className="topbar">
        <span className="topbar-title">My bookings</span>
        <span className="badge badge-gold">{jobs.length}</span>
      </div>

      <div className="scroll-body">
        {loading && <div style={{ textAlign: "center", padding: 40, color: "var(--gray-400)" }}>Loading...</div>}

        {!loading && jobs.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <h3 style={{ marginBottom: 8 }}>No bookings yet</h3>
            <p style={{ color: "var(--gray-400)", marginBottom: 24 }}>Book your first service today</p>
            <button className="btn btn-gold" style={{ width: "auto", padding: "12px 28px" }} onClick={() => navigate("home")}>
              Book a service →
            </button>
          </div>
        )}

        {jobs.map((job, i) => {
          const st = statusConfig[job.status] || statusConfig.pending;
          return (
            <div key={job.id} className={`fade-up-${Math.min(i+1,5)}`} style={{
              background: "var(--white)", border: "1.5px solid var(--gray-200)",
              borderRadius: "var(--radius-lg)", padding: "16px", marginBottom: 12,
              boxShadow: "var(--shadow-sm)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{job.service}</div>
                  <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 3 }}>{job.description}</div>
                </div>
                <span style={{ background: st.bg, color: st.color, padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{st.label}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: "var(--gray-400)", borderTop: "1px solid var(--gray-200)", paddingTop: 10 }}>
                <span>📍 {job.address}</span>
                <span style={{ marginLeft: "auto", fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 16, color: "var(--black)" }}>₱{job.price}</span>
              </div>
              {job.status === "active" && (
                <button className="btn btn-gold btn-sm" style={{ marginTop: 12, width: "100%" }} onClick={() => navigate("tracking")}>
                  Track job →
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
