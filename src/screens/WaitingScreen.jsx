import { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { supabase } from "../lib/supabase";

export default function WaitingScreen() {
  const { navigate, activeJob, setActiveJob, setSelectedWorker } = useApp();
  const [job, setJob] = useState(activeJob);
  const [elapsed, setElapsed] = useState(0);
  const [workerFound, setWorkerFound] = useState(false);
  const [workerInfo, setWorkerInfo] = useState(null);
  const channelRef = useRef(null);
  const pollRef = useRef(null);

  const handleJobAccepted = async (updated) => {
    console.log("[Customer] Worker accepted!", updated);
    setJob(updated);
    setActiveJob(updated);

    if (updated.worker_id) {
      var { data: w } = await supabase.from("workers").select("*").eq("user_id", updated.worker_id).maybeSingle();
      if (w) {
        setWorkerInfo(w);
        setSelectedWorker({
          id: w.id,
          name: updated.worker_name || w.full_name,
          initials: (updated.worker_name || w.full_name || "WK").split(" ").map(function(n) { return n[0]; }).join("").substring(0, 2).toUpperCase(),
          rating: w.rating || 4.8,
          jobs: w.total_jobs || 0,
          distance: 1.2,
          skills: w.skills || [],
          price: {},
        });
      }
    }
    setWorkerFound(true);
    setTimeout(function() { navigate("tracking"); }, 3000);
  };

  // Realtime listener
  useEffect(() => {
    if (!job?.id) return;
    console.log("[Customer] Listening for updates on job:", job.id);

    channelRef.current = supabase
      .channel("waiting_" + job.id)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "jobs",
        filter: "id=eq." + job.id,
      }, function(payload) {
        console.log("[Customer] Realtime update:", payload.new.status);
        if (payload.new.status === "accepted" || payload.new.status === "active") {
          handleJobAccepted(payload.new);
        }
        if (payload.new.status === "cancelled") navigate("home");
      })
      .subscribe(function(status) {
        console.log("[Customer] Realtime channel:", status);
      });

    return function() { if (channelRef.current) supabase.removeChannel(channelRef.current); };
  }, [job?.id]);

  // POLLING FALLBACK — check every 3 seconds in case Realtime fails
  useEffect(() => {
    if (!job?.id || workerFound) return;

    pollRef.current = setInterval(async function() {
      var { data } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", job.id)
        .maybeSingle();

      if (data && (data.status === "accepted" || data.status === "active")) {
        console.log("[Customer] Poll detected accepted job!");
        clearInterval(pollRef.current);
        handleJobAccepted(data);
      }
      if (data && data.status === "cancelled") {
        clearInterval(pollRef.current);
        navigate("home");
      }
    }, 3000);

    return function() { if (pollRef.current) clearInterval(pollRef.current); };
  }, [job?.id, workerFound]);

  // Elapsed timer
  useEffect(() => {
    var t = setInterval(function() { setElapsed(function(e) { return e + 1; }); }, 1000);
    return function() { clearInterval(t); };
  }, []);

  var formatElapsed = function(s) {
    var m = Math.floor(s / 60);
    var sec = s % 60;
    return m + ":" + String(sec).padStart(2, "0");
  };

  var cancelJob = async function() {
    if (!job?.id) return;
    await supabase.from("jobs").update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
    }).eq("id", job.id);
    navigate("home");
  };

  if (workerFound) {
    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, alignItems: "center", justifyContent: "center", padding: 32, background: "var(--white)" }}>
        <div className="fade-up" style={{ width: 96, height: 96, background: "linear-gradient(135deg, var(--gold), var(--gold-mid))", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, marginBottom: 24, boxShadow: "var(--shadow-gold)" }}>🎉</div>
        <h2 className="fade-up-1" style={{ marginBottom: 8 }}>Worker found!</h2>
        <p className="fade-up-2" style={{ color: "var(--gray-400)", textAlign: "center", fontSize: 14 }}>
          <strong style={{ color: "var(--black)" }}>{workerInfo?.full_name || job?.worker_name || "A worker"}</strong> accepted your {job?.service} job
        </p>
        {workerInfo && (
          <div className="fade-up-3 card" style={{ marginTop: 20, width: "100%", display: "flex", alignItems: "center", gap: 14 }}>
            <div className="avatar" style={{ width: 52, height: 52, background: "var(--gold)", color: "var(--black)", fontSize: 18, fontWeight: 700 }}>
              {(workerInfo.full_name || "WK").split(" ").map(function(n) { return n[0]; }).join("").substring(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{workerInfo.full_name}</div>
              <div style={{ fontSize: 13, color: "var(--gray-400)", marginTop: 2 }}>{workerInfo.rating || "New"} | {workerInfo.total_jobs || 0} jobs</div>
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 20, color: "var(--gold-dark)" }}>P{job?.price}</div>
          </div>
        )}
        <p className="fade-up-4" style={{ color: "var(--gray-400)", fontSize: 13, marginTop: 16 }}>Redirecting to live tracking...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div className="topbar">
        <span className="topbar-title">Finding a worker</span>
        <span className="badge badge-success" style={{ animation: "pulse 2s infinite" }}>Live</span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px", textAlign: "center" }}>
        <div style={{ position: "relative", width: 160, height: 160, marginBottom: 32 }}>
          {[0, 1, 2].map(function(i) { return (
            <div key={i} style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1.5px solid var(--gold-mid)", opacity: 0.3, animation: "ping " + (2 + i * 0.5) + "s " + (i * 0.7) + "s infinite" }} />
          ); })}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 72, height: 72, background: "linear-gradient(135deg, var(--gold), var(--gold-mid))", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, boxShadow: "var(--shadow-gold)" }}>🔍</div>
        </div>
        <h2 style={{ marginBottom: 8 }}>Searching for workers...</h2>
        <p style={{ color: "var(--gray-400)", fontSize: 14, lineHeight: 1.7, marginBottom: 8 }}>
          Nearby workers are being notified. You will be matched as soon as someone accepts.
        </p>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "var(--gold-dark)", marginBottom: 28 }}>{formatElapsed(elapsed)}</div>
        <div className="card" style={{ width: "100%", marginBottom: 20, textAlign: "left" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{job?.service}</div>
              <div style={{ fontSize: 13, color: "var(--gray-400)", marginTop: 4 }}>{job?.description}</div>
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 22, color: "var(--black)" }}>P{job?.price}</div>
          </div>
          <div style={{ fontSize: 13, color: "var(--gray-400)", borderTop: "1px solid var(--gray-200)", paddingTop: 10 }}>
            {job?.address} | {job?.when_needed || "ASAP"}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "var(--gold-light)", borderRadius: 20, border: "1px solid var(--gold-mid)", marginBottom: 20 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--gold)", animation: "pulse 1.5s infinite" }} />
          <span style={{ fontSize: 13, color: "var(--gold-dark)", fontWeight: 600 }}>Live — checking every 3 seconds</span>
        </div>
        <button className="btn btn-outline" style={{ width: "100%" }} onClick={cancelJob}>Cancel request</button>
      </div>
    </div>
  );
}
