import { useApp } from "../context/AppContext";
import { useNotifications } from "../lib/useNotifications";

export default function NotificationsScreen() {
  const { navigate, user } = useApp();
  const { notifications, unread, markAllRead } = useNotifications(user?.id);

  const typeIcon = {
    job_request: "🔔", job_accepted: "✅",
    payment: "💰", review: "⭐",
    system: "ℹ️", general: "📢"
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    const diff = Math.floor((new Date() - d) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return d.toLocaleDateString("en-PH");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div className="topbar">
        <button className="back-btn" onClick={() => navigate("home")}>←</button>
        <span className="topbar-title" style={{ fontFamily: "var(--font-display)" }}>Notifications</span>
        {unread > 0 && (
          <button className="btn btn-outline btn-sm" onClick={markAllRead}>Mark all read</button>
        )}
      </div>

      <div className="scroll-body">
        {notifications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔔</div>
            <h3 style={{ marginBottom: 8, fontFamily: "var(--font-display)" }}>No notifications</h3>
            <p style={{ color: "var(--gray-400)" }}>We'll notify you about your bookings here</p>
          </div>
        ) : notifications.map(n => (
          <div key={n.id} style={{
            display: "flex", gap: 14, padding: "14px",
            background: n.is_read ? "var(--white)" : "linear-gradient(135deg, #FBF6EA, #F5EDD6)",
            border: `1.5px solid ${n.is_read ? "var(--gray-200)" : "var(--gold-mid)"}`,
            borderRadius: "var(--radius-lg)", marginBottom: 10,
            boxShadow: n.is_read ? "none" : "var(--shadow-gold)"
          }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: n.is_read ? "var(--gray-100)" : "var(--gold-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
              {typeIcon[n.type] || "📢"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ fontWeight: n.is_read ? 400 : 700, fontSize: 14 }}>{n.title}</div>
                <div style={{ fontSize: 11, color: "var(--gray-400)", flexShrink: 0 }}>{formatTime(n.created_at)}</div>
              </div>
              <div style={{ fontSize: 13, color: "var(--gray-400)", lineHeight: 1.5 }}>{n.body}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
