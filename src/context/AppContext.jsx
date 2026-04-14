import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const AppContext = createContext(null);

export const SERVICES = [
  { id: "electrical", name: "Electrical", icon: "⚡", base: 400, desc: "Wiring, panels, outlets", eta: "15-30 min" },
  { id: "plumbing", name: "Plumbing", icon: "🔧", base: 350, desc: "Leaks, pipes, fixtures", eta: "20-35 min" },
  { id: "cleaning", name: "Cleaning", icon: "🧹", base: 250, desc: "Deep clean, maintenance", eta: "30-45 min" },
  { id: "aircon", name: "Aircon", icon: "❄️", base: 500, desc: "Install, clean, repair", eta: "20-40 min" },
  { id: "carpentry", name: "Carpentry", icon: "🔨", base: 450, desc: "Furniture, repairs", eta: "25-45 min" },
  { id: "moving", name: "Moving", icon: "📦", base: 600, desc: "Packing, transport", eta: "45-90 min" },
  { id: "mechanic", name: "Mechanic", icon: "🚗", base: 500, desc: "Car repair, maintenance", eta: "30-60 min" },
  { id: "custom", name: "Custom Job", icon: "✨", base: 300, desc: "Something else?", eta: "Varies" },
];

export function AppProvider({ children }) {
  const [screen, setScreen] = useState("splash");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [jobForm, setJobForm] = useState({});
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [activeJob, setActiveJob] = useState(null);
  const [jobs, setJobs] = useState([]);

  const saveAndSetUser = async (u) => {
    try {
      // Check if user already exists and is onboarded
      const { data: existing } = await supabase
        .from("users")
        .select("*")
        .eq("id", u.id)
        .maybeSingle();

      if (!existing) {
        await supabase.from("users").upsert({
          id: u.id,
          name: u.user_metadata?.full_name || u.email,
          phone: u.phone || null,
          role: "customer",
          is_onboarded: false,
        }, { onConflict: "id" });
      }

      const isOnboarded = existing?.is_onboarded || false;

      setUser({
        id: u.id,
        name: existing?.name || u.user_metadata?.full_name || u.email,
        email: u.email,
        avatar: u.user_metadata?.avatar_url || null,
        phone: existing?.phone || null,
        address: existing?.address || null,
        is_onboarded: isOnboarded,
        role: "customer",
        initials: (existing?.name || u.user_metadata?.full_name || u.email || "U")
          .split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
      });

      // Route based on onboarding status
      setScreen(isOnboarded ? "home" : "onboarding");

    } catch(e) {
      setUser({
        id: u.id,
        name: u.user_metadata?.full_name || u.email,
        email: u.email,
        avatar: u.user_metadata?.avatar_url || null,
        is_onboarded: false,
        role: "customer",
        initials: (u.user_metadata?.full_name || u.email || "U")
          .split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
      });
      setScreen("onboarding");
    }

    setLoading(false);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
      setScreen("login");
    }, 3000);

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearTimeout(timeout);
      if (session?.user) await saveAndSetUser(session.user);
      else { setLoading(false); setScreen("login"); }
    }).catch(() => {
      clearTimeout(timeout);
      setLoading(false);
      setScreen("login");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) await saveAndSetUser(session.user);
      else { setUser(null); setScreen("login"); }
    });

    return () => { clearTimeout(timeout); subscription.unsubscribe(); };
  }, []);

  const navigate = (s) => setScreen(s);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("login");
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0A0A0A", gap: 16 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, color: "#C9A84C", letterSpacing: "0.05em" }}>Need.co</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "Inter, sans-serif" }}>Premium Services</div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ screen, navigate, user, setUser, logout, selectedService, setSelectedService, jobForm, setJobForm, selectedWorker, setSelectedWorker, activeJob, setActiveJob, jobs, setJobs }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() { return useContext(AppContext); }
