import { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import { supabase } from "../lib/supabase";

export default function OnboardingScreen() {
  const { user, navigate, setUser } = useApp();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ")[1] || "",
    phone: "",
    address: "",
    lat: null,
    lng: null,
    selfieFile: null,
    selfiePreview: null,
  });
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locating, setLocating] = useState(false);
  const videoRef = useRef(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const streamRef = useRef(null);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const getPhone = () => "+63" + form.phone.replace(/\D/g, "").replace(/^0/, "");

  const detectLocation = () => {
    setLocating(true);
    navigator.geolocation?.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        update("lat", latitude);
        update("lng", longitude);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          const addr = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          update("address", addr.split(",").slice(0, 3).join(", "));
        } catch {
          update("address", `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  const handleSendOTP = async () => {
    setLoading(true);
    setError("");
    try {
      const { error: e } = await supabase.auth.signInWithOtp({ phone: getPhone() });
      if (e) throw e;
      setOtpSent(true);
    } catch (e) {
      setError(e.message || "Failed to send OTP.");
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    setError("");
    try {
      const { error: e } = await supabase.auth.verifyOtp({
        phone: getPhone(),
        token: otp.trim(),
        type: "sms"
      });
      if (e) throw e;
      setOtpVerified(true);
    } catch (e) {
      setError("Invalid OTP. Please try again.");
    }
    setLoading(false);
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      setCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 100);
    } catch {
      setError("Camera access denied. Please upload a photo instead.");
    }
  };

  const takeSelfie = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    canvas.toBlob(blob => {
      const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
      update("selfieFile", file);
      update("selfiePreview", canvas.toDataURL("image/jpeg"));
      stopCamera();
    }, "image/jpeg", 0.8);
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    setCameraOpen(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    // Step 1 — try selfie upload but never block on failure
    let selfieUrl = null;
    if (form.selfieFile) {
      try {
        const fileName = `${user.id}_${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("selfies")
          .upload(fileName, form.selfieFile, { upsert: true });
        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("selfies")
            .getPublicUrl(fileName);
          selfieUrl = urlData?.publicUrl || null;
        }
      } catch (e) {
        console.warn("Selfie upload failed, continuing:", e);
      }
    }

    // Step 2 — save profile regardless of selfie result
    try {
      const { error: updateError } = await supabase.from("users").upsert({
        id: user.id,
        name: `${form.firstName} ${form.lastName}`.trim(),
        first_name: form.firstName,
        last_name: form.lastName,
        phone: form.phone ? getPhone() : null,
        address: form.address || null,
        lat: form.lat || null,
        lng: form.lng || null,
        selfie_url: selfieUrl,
        role: "customer",
        is_onboarded: true,
        onboarded_at: new Date().toISOString(),
      }, { onConflict: "id" });

      if (updateError) throw updateError;

      setUser(prev => ({
        ...prev,
        name: `${form.firstName} ${form.lastName}`.trim(),
        phone: form.phone ? getPhone() : prev.phone,
        is_onboarded: true,
      }));

      navigate("home");
    } catch (e) {
      console.error("Profile save error:", e);
      setError("Failed to save profile. Please try again.");
      setLoading(false);
    }
  };

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: "100vh" }}>

      <div style={{ height: 3, background: "var(--gray-200)" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, var(--gold), var(--gold-mid))", transition: "width 0.4s ease" }} />
      </div>

      <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "center", gap: 12 }}>
        {step > 1 && <button className="back-btn" onClick={() => setStep(s => s - 1)}>←</button>}
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Step {step} of {totalSteps}</p>
          <h3 style={{ marginTop: 2 }}>
            {step === 1 && "Your name"}
            {step === 2 && "Phone number"}
            {step === 3 && "Your location"}
            {step === 4 && "Your selfie"}
          </h3>
        </div>
      </div>

      <div className="scroll-body" style={{ paddingTop: 24 }}>

        {step === 1 && (
          <>
            <div style={{ marginBottom: 28, padding: "16px", background: "var(--gold-light)", borderRadius: "var(--radius-lg)", border: "1px solid var(--gold-mid)" }}>
              <p style={{ fontSize: 13, color: "var(--gold-dark)", margin: 0, lineHeight: 1.6 }}>
                👋 Welcome to Need.co! Let's set up your profile so workers can know who they're helping.
              </p>
            </div>
            <div className="fade-up input-wrap">
              <label className="input-label">First name *</label>
              <input className="input-field" placeholder="e.g. Juan" value={form.firstName} onChange={e => update("firstName", e.target.value)} />
            </div>
            <div className="fade-up-1 input-wrap" style={{ marginBottom: 28 }}>
              <label className="input-label">Last name *</label>
              <input className="input-field" placeholder="e.g. Dela Cruz" value={form.lastName} onChange={e => update("lastName", e.target.value)} />
            </div>
            <button className="btn btn-gold fade-up-2" disabled={!form.firstName || !form.lastName} onClick={() => setStep(2)}>
              Continue →
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ marginBottom: 24, padding: "14px", background: "var(--gold-light)", borderRadius: "var(--radius-lg)", border: "1px solid var(--gold-mid)" }}>
              <p style={{ fontSize: 13, color: "var(--gold-dark)", margin: 0, lineHeight: 1.6 }}>
                📱 We use your phone number to send you job updates and connect you with workers.
              </p>
            </div>
            <div className="fade-up input-wrap">
              <label className="input-label">Phone number *</label>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ padding: "13px 14px", border: "1.5px solid var(--gray-200)", borderRadius: "var(--radius-sm)", fontSize: 14, background: "var(--gray-50)", whiteSpace: "nowrap", color: "var(--black)", fontWeight: 600 }}>
                  🇵🇭 +63
                </div>
                <input
                  className="input-field"
                  placeholder="9xx xxx xxxx"
                  value={form.phone}
                  onChange={e => update("phone", e.target.value.replace(/\D/g, "").substring(0, 10))}
                  style={{ flex: 1 }}
                  disabled={otpVerified}
                />
              </div>
              {form.phone.length >= 10 && (
                <p style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 4 }}>Will send to: {getPhone()}</p>
              )}
            </div>

            {!otpVerified && !otpSent && (
              <button className="btn btn-gold fade-up-1" disabled={form.phone.length < 10 || loading} onClick={handleSendOTP}>
                {loading ? "Sending OTP..." : "Send verification code →"}
              </button>
            )}

            {otpSent && !otpVerified && (
              <>
                <div className="fade-up input-wrap">
                  <label className="input-label">Enter 6-digit OTP</label>
                  <input
                    className="input-field"
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, "").substring(0, 6))}
                    maxLength={6}
                    style={{ letterSpacing: "0.3em", fontSize: 20, textAlign: "center" }}
                  />
                  <p style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 6 }}>
                    Sent to {getPhone()} ·{" "}
                    <button onClick={() => { setOtpSent(false); setOtp(""); setError(""); }} style={{ background: "none", border: "none", color: "var(--gold-dark)", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                      Change number
                    </button>
                  </p>
                </div>
                <button className="btn btn-gold fade-up-1" disabled={otp.length < 6 || loading} onClick={handleVerifyOTP}>
                  {loading ? "Verifying..." : "Verify OTP →"}
                </button>
              </>
            )}

            {otpVerified && (
              <>
                <div className="fade-up" style={{ background: "var(--success-light)", border: "1px solid var(--success)", borderRadius: "var(--radius-md)", padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 18 }}>✅</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--success)" }}>Phone verified!</span>
                </div>
                <button className="btn btn-gold fade-up-1" onClick={() => setStep(3)}>Continue →</button>
              </>
            )}

            {!otpVerified && (
              <button className="btn btn-outline fade-up-2" style={{ marginTop: 10 }} onClick={() => setStep(3)}>
                Skip for now (testing only)
              </button>
            )}

            {error && <p style={{ color: "var(--danger)", fontSize: 13, marginTop: 12, textAlign: "center" }}>{error}</p>}
          </>
        )}

        {step === 3 && (
          <>
            <div style={{ marginBottom: 24, padding: "14px", background: "var(--gold-light)", borderRadius: "var(--radius-lg)", border: "1px solid var(--gold-mid)" }}>
              <p style={{ fontSize: 13, color: "var(--gold-dark)", margin: 0, lineHeight: 1.6 }}>
                📍 We use your location to match you with nearby workers in Iloilo City & Pavia.
              </p>
            </div>
            <div className="fade-up input-wrap">
              <label className="input-label">Your address *</label>
              <input className="input-field" placeholder="Street, Barangay, City" value={form.address} onChange={e => update("address", e.target.value)} style={{ marginBottom: 8 }} />
              <button onClick={detectLocation} disabled={locating} style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "none", border: "1.5px solid var(--gold-mid)",
                borderRadius: "var(--radius-sm)", padding: "9px 14px",
                fontSize: 13, fontWeight: 600, color: "var(--gold-dark)",
                cursor: "pointer", width: "100%", justifyContent: "center"
              }}>
                {locating ? "📡 Detecting..." : "📍 Use my current location"}
              </button>
            </div>
            {form.lat && form.lng && (
              <div className="fade-up" style={{ background: "var(--success-light)", border: "1px solid var(--success)", borderRadius: "var(--radius-md)", padding: "10px 14px", marginBottom: 20, fontSize: 12, color: "var(--success)" }}>
                ✅ GPS detected: {form.lat.toFixed(4)}, {form.lng.toFixed(4)}
              </div>
            )}
            <button className="btn btn-gold fade-up-1" disabled={!form.address} onClick={() => setStep(4)} style={{ marginTop: 8 }}>
              Continue →
            </button>
          </>
        )}

        {step === 4 && (
          <>
            <div style={{ marginBottom: 24, padding: "14px", background: "var(--gold-light)", borderRadius: "var(--radius-lg)", border: "1px solid var(--gold-mid)" }}>
              <p style={{ fontSize: 13, color: "var(--gold-dark)", margin: 0, lineHeight: 1.6 }}>
                🤳 A selfie helps workers recognize you and builds trust on both sides.
              </p>
            </div>

            {cameraOpen && (
              <div className="fade-up" style={{ marginBottom: 20 }}>
                <video ref={videoRef} autoPlay playsInline style={{ width: "100%", borderRadius: "var(--radius-lg)", background: "#000" }} />
                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <button className="btn btn-gold" style={{ flex: 2 }} onClick={takeSelfie}>📸 Take selfie</button>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={stopCamera}>Cancel</button>
                </div>
              </div>
            )}

            {form.selfiePreview && !cameraOpen && (
              <div className="fade-up" style={{ marginBottom: 20, textAlign: "center" }}>
                <img src={form.selfiePreview} alt="Selfie" style={{ width: 140, height: 140, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--gold)", boxShadow: "var(--shadow-gold)" }} />
                <div style={{ marginTop: 10 }}>
                  <button onClick={openCamera} style={{ background: "none", border: "none", color: "var(--gold-dark)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Retake selfie</button>
                </div>
              </div>
            )}

            {!form.selfiePreview && !cameraOpen && (
              <div className="fade-up" style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button onClick={openCamera} style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    border: "2px dashed var(--gold-mid)", borderRadius: "var(--radius-lg)",
                    padding: "28px 20px", cursor: "pointer", background: "var(--gold-light)"
                  }}>
                    <span style={{ fontSize: 28 }}>📸</span>
                    <span style={{ fontWeight: 600, fontSize: 14, color: "var(--gold-dark)" }}>Open camera</span>
                  </button>
                  <label style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    border: "1.5px solid var(--gray-200)", borderRadius: "var(--radius-lg)",
                    padding: "14px 20px", cursor: "pointer", background: "var(--gray-50)"
                  }}>
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
                      const file = e.target.files[0];
                      if (!file) return;
                      update("selfieFile", file);
                      const reader = new FileReader();
                      reader.onload = ev => update("selfiePreview", ev.target.result);
                      reader.readAsDataURL(file);
                    }} />
                    <span style={{ fontSize: 18 }}>🖼</span>
                    <span style={{ fontWeight: 600, fontSize: 13, color: "var(--gray-600)" }}>Upload from gallery</span>
                  </label>
                </div>
              </div>
            )}

            {error && <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{error}</p>}

            <button className="btn btn-gold fade-up-1" disabled={loading} onClick={handleSubmit}>
              {loading ? "Saving profile..." : "Complete setup 🚀"}
            </button>
            <button className="btn btn-outline fade-up-2" style={{ marginTop: 10 }} onClick={handleSubmit} disabled={loading}>
              Skip selfie (testing only)
            </button>
          </>
        )}

      </div>
    </div>
  );
}
