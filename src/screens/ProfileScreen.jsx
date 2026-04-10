import { useApp } from "../context/AppContext";

export default function ProfileScreen() {
  const { user, logout, navigate } = useApp();

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div className="topbar">
        <span className="topbar-title">Profile</span>
      </div>

      <div className="scroll-body">
        {/* Profile header */}
        <div className="fade-up card-gold" style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--gold)" }} />
          ) : (
            <div className="avatar" style={{ width: 60, height: 60, background: "var(--gold)", color: "var(--black)", fontSize: 20, fontWeight: 700 }}>
              {user?.initials || "JD"}
            </div>
          )}
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 18 }}>{user?.name}</div>
            <div style={{ fontSize: 13, color: "var(--gray-400)", marginTop: 3 }}>{user?.email}</div>
            <span className="badge badge-gold" style={{ marginTop: 6 }}>Customer</span>
          </div>
        </div>

        {/* Account details */}
        <p className="section-label fade-up-1">Account</p>
        <div className="fade-up-1 card" style={{ marginBottom: 20 }}>
          {[
            ["Email", user?.email || "—"],
            ["Location", "Iloilo City, PH"],
            ["Member since", new Date().getFullYear().toString()],
            ["App version", "Need.co v2.0"],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid var(--gray-200)" }}>
              <span style={{ fontSize: 14, color: "var(--gray-400)" }}>{k}</span>
              <span style={{ fontSize: 14, color: "var(--black)", fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Settings */}
        <p className="section-label fade-up-2">Settings</p>
        <div className="fade-up-2 card" style={{ marginBottom: 20 }}>
          {["Notifications", "Payment methods", "Privacy & security", "Help & support", "Terms of service"].map((item, i, arr) => (
            <div key={item} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--gray-200)" : "none", cursor: "pointer" }}>
              <span style={{ fontSize: 14, color: "var(--black)" }}>{item}</span>
              <span style={{ color: "var(--gray-400)" }}>›</span>
            </div>
          ))}
        </div>

        <button className="btn btn-danger fade-up-3" onClick={logout}>Sign out</button>
      </div>
    </div>
  );
}
