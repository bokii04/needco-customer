import { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { supabase } from "../lib/supabase";

export default function ChatScreen() {
  const { navigate, user, selectedWorker, activeJob } = useApp();
  const [messages, setMessages] = useState([
    { id: 1, sender_id: "worker", message: "Hi! I'm on my way to your location.", created_at: new Date(Date.now() - 300000).toISOString() },
    { id: 2, sender_id: user?.id, message: "Great! The gate is open, just come in.", created_at: new Date(Date.now() - 240000).toISOString() },
    { id: 3, sender_id: "worker", message: "I'll be there in about 5 minutes.", created_at: new Date(Date.now() - 180000).toISOString() },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const msg = { id: Date.now(), sender_id: user?.id, message: input.trim(), created_at: new Date().toISOString() };
    setMessages(prev => [...prev, msg]);
    setInput("");
  };

  const isMe = (id) => id === user?.id;
  const formatTime = (ts) => new Date(ts).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div className="topbar">
        <button className="back-btn" onClick={() => navigate("tracking")}>←</button>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
          <div className="avatar" style={{ width: 36, height: 36, background: "var(--gold)", color: "var(--black)", fontSize: 12, fontWeight: 700 }}>
            {selectedWorker?.initials || "WK"}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{selectedWorker?.name || "Worker"}</div>
            <div style={{ fontSize: 11, color: "var(--success)", fontWeight: 600 }}>● Online</div>
          </div>
        </div>
        <button onClick={() => navigate("tracking")} className="btn btn-outline btn-sm">Track</button>
      </div>

      {/* Safety banner */}
      <div style={{ background: "var(--gold-light)", padding: "8px 16px", borderBottom: "1px solid var(--gold-mid)" }}>
        <p style={{ fontSize: 11, color: "var(--gold-dark)", margin: 0, textAlign: "center", fontWeight: 500 }}>
          🔒 Keep all payments and transactions inside Need.co
        </p>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
        {messages.map((msg, i) => {
          const mine = isMe(msg.sender_id);
          return (
            <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: mine ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "78%", padding: "12px 16px",
                borderRadius: mine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: mine ? "var(--black)" : "var(--gray-50)",
                border: mine ? "none" : "1px solid var(--gray-200)",
                color: mine ? "var(--white)" : "var(--black)",
                fontSize: 14, lineHeight: 1.5,
                boxShadow: "var(--shadow-sm)"
              }}>
                {msg.message}
              </div>
              <span style={{ fontSize: 10, color: "var(--gray-400)", marginTop: 4 }}>{formatTime(msg.created_at)}</span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid var(--gray-200)", display: "flex", gap: 10, background: "var(--white)" }}>
        <input className="input-field" placeholder="Type a message..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} style={{ flex: 1, marginBottom: 0 }} />
        <button onClick={send} disabled={!input.trim()} style={{
          width: 44, height: 44, borderRadius: "50%",
          background: input.trim() ? "linear-gradient(135deg, var(--gold), var(--gold-mid))" : "var(--gray-100)",
          border: "none", cursor: input.trim() ? "pointer" : "default",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, boxShadow: input.trim() ? "var(--shadow-gold)" : "none",
          transition: "all 0.2s", flexShrink: 0
        }}>➤</button>
      </div>
    </div>
  );
}
