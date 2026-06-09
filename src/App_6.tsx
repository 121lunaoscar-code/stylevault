import { useState, useRef, useEffect } from "react";

// ─── CLAUDE AI HELPER ─────────────────────────────────────────────────────────
const callClaude = async (systemPrompt: string, messages: {role: string, content: string}[]) => {
  const res = await fetch("https://stylevault-api.121lunaoscar.workers.dev", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 1500,
      system: systemPrompt,
      messages,
    }),
  });
  const data = await res.json();
  return data.content?.map((i: any) => i.text || "").join("") || "";
};

// ─── SUPABASE CONFIG ──────────────────────────────────────────────────────────
const SB_URL = "https://rnrzifixbecsvbnxavus.supabase.co";
const SB_KEY = "sb_publishable_M4XCdb1bVj86biRwJXubCQ_OQJA74UP";

const sbFetch = async (path: string, options: any = {}) => {
  const token = localStorage.getItem("sb_token");
  const res = await fetch(`${SB_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      apikey: SB_KEY,
      Authorization: `Bearer ${token || SB_KEY}`,
      Prefer: "return=representation",
      ...(options.headers || {}),
    },
  });
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message || res.statusText);
  }
  if (res.status === 204) return null;
  return res.json();
};

const sbSignUp = async (email: string, password: string) => {
  const res = await fetch(`${SB_URL}/auth/v1/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

const sbSignIn = async (email: string, password: string) => {
  const res = await fetch(`${SB_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

const dbSelect = (table: string, query = "") => sbFetch(`/rest/v1/${table}?${query}`);
const dbInsert = (table: string, body: any) => sbFetch(`/rest/v1/${table}`, { method: "POST", body: JSON.stringify(body) });
const dbUpdate = (table: string, match: string, body: any) => sbFetch(`/rest/v1/${table}?${match}`, { method: "PATCH", body: JSON.stringify(body) });
const dbDelete = (table: string, match: string) => sbFetch(`/rest/v1/${table}?${match}`, { method: "DELETE" });

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const CATEGORIES = ["Tops", "Pantalones", "Vestidos", "Zapatos", "Accesorios", "Abrigos"];
const SEASONS = ["Primavera", "Verano", "Otoño", "Invierno", "Todo el año"];
const OCCASIONS = ["Casual", "Trabajo", "Formal", "Deportivo", "Fiesta", "Viaje"];
const EVENTS = ["Trabajo / Oficina", "Cita romántica", "Reunión de negocios", "Evento formal", "Día casual", "Fiesta / Antro", "Deporte / Gym", "Viaje"];
const CAT_EMOJI: Record<string, string> = { Tops: "👕", Pantalones: "👖", Vestidos: "👗", Zapatos: "👟", Accesorios: "💍", Abrigos: "🧥" };
const BUDGETS = [
  { label: "Económico", desc: "Hasta $300 MXN", icon: "💚", value: "budget" },
  { label: "Moderado", desc: "$300–$1,000 MXN", icon: "💛", value: "mid" },
  { label: "Premium", desc: "$1,000–$3,000 MXN", icon: "🧡", value: "premium" },
  { label: "Lujo", desc: "$3,000+ MXN", icon: "💜", value: "luxury" },
];
const STORE_META: Record<string, any> = {
  Zara: { maps: true, web: "https://www.zara.com" },
  "H&M": { maps: true, web: "https://www.hm.com" },
  Mango: { maps: true, web: "https://www.mango.com" },
  Shein: { maps: false, web: "https://www.shein.com" },
  ASOS: { maps: false, web: "https://www.asos.com" },
  Amazon: { maps: false, web: "https://www.amazon.com", amazon: true },
  Nike: { maps: true, web: "https://www.nike.com", amazon: true },
  Adidas: { maps: true, web: "https://www.adidas.com", amazon: true },
  Uniqlo: { maps: true, web: "https://www.uniqlo.com" },
  Gap: { maps: true, web: "https://www.gap.com", amazon: true },
  Primark: { maps: true, web: "https://www.primark.com" },
  Liverpool: { maps: true, web: "https://www.liverpool.com.mx" },
  "Palacio de Hierro": { maps: true, web: "https://www.elpalaciodehierro.com" },
};

const mapsUrl = (s: string, lat?: number, lng?: number) =>
  lat ? `https://www.google.com/maps/search/${encodeURIComponent(s)}/@${lat},${lng},14z` : `https://www.google.com/maps/search/${encodeURIComponent(s)}`;
const amazonUrl = (item: string) => `https://www.amazon.com/s?k=${encodeURIComponent(item)}`;

// ─── SYSTEM PROMPTS ───────────────────────────────────────────────────────────
const ADVISOR_SYSTEM = `Eres StyleVault, un asesor de moda sofisticado, experto y empático. Tu tono es elegante pero accesible — como un estilista personal de alta gama.

Especialidades:
- Reglas de moda y combinación de colores (teoría del color, paletas)
- Dress codes: Smart Casual, Business Casual, Black Tie, White Tie, Cocktail, Casual
- Siluetas y proporciones para diferentes tipos de cuerpo
- Tendencias actuales y atemporales
- Cómo construir un armario cápsula
- Cuidado de prendas y materiales

Formato de respuestas:
- Usa formato markdown: **negrita** para términos clave, listas con viñetas para puntos múltiples
- Máximo 3-4 párrafos o 5-6 bullets — sé conciso y útil
- Termina con una pregunta de seguimiento relevante
- Responde SIEMPRE en español`;

const OUTFIT_SYSTEM = `Eres experto asesor de moda. Responde SOLO en JSON válido sin markdown ni backticks.
JSON con: outfit (array de objetos: emoji, name, why), explanation (string), colorPalette (string), rating (número del 1 al 5), ratingExplanation (string).`;

const SHOP_SYSTEM = `Eres experto en moda y retail global. Responde SOLO en JSON válido sin markdown ni backticks.
JSON: intro (string), items (array: name, description, priceRange, stores (array strings), hasAmazon (boolean), tip, why).`;

const TRIP_SYSTEM = `Eres experto en moda y planificación de viajes. Responde SOLO en JSON válido sin markdown ni backticks.
JSON: intro (string), llevar (array de objetos: categoria string, items array de strings, tip string), faltan (array de objetos: name string, why string, urgente boolean), consejo (string).`;

const PHOTO_SYSTEM = `Eres experto en moda. Analiza la imagen de la prenda y responde SOLO en JSON válido sin markdown.
JSON: name (string, nombre descriptivo), category (una de: Tops, Pantalones, Vestidos, Zapatos, Accesorios, Abrigos), color (color principal en español), occasion (una de: Casual, Trabajo, Formal, Deportivo, Fiesta, Viaje), season (una de: Primavera, Verano, Otoño, Invierno, Todo el año), description (string, descripción breve del estilo).`;

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --gold: #C4973F;
  --gold-dim: #8a6b2a;
  --gold-glow: rgba(196,151,63,.12);
  --bg: #080808;
  --bg2: #0e0e0e;
  --bg3: #141414;
  --border: #1c1c1c;
  --border2: #242424;
  --text: #e8e2d9;
  --text2: #7a7269;
  --text3: #3a3632;
}
::-webkit-scrollbar { width: 2px; }
::-webkit-scrollbar-thumb { background: var(--gold-dim); border-radius: 1px; }

body { background: var(--bg); }

.sv { font-family: 'Jost', sans-serif; background: var(--bg); min-height: 100vh; color: var(--text); font-weight: 300; letter-spacing: .015em; }
.serif { font-family: 'Cormorant Garamond', serif; }

.btn-primary { background: var(--gold); color: #080808; border: none; padding: 13px 28px; border-radius: 1px; cursor: pointer; font-family: 'Jost', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; transition: all .3s ease; width: 100%; }
.btn-primary:hover { filter: brightness(1.1); }
.btn-primary:disabled { opacity: .3; cursor: not-allowed; }

.btn-outline { background: transparent; color: var(--gold); border: 1px solid rgba(196,151,63,.25); padding: 10px 20px; border-radius: 1px; cursor: pointer; font-family: 'Jost', sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; transition: all .25s; }
.btn-outline:hover { border-color: var(--gold); background: var(--gold-glow); }
.btn-outline:disabled { opacity: .3; cursor: not-allowed; }

.btn-ghost { background: transparent; border: none; color: var(--text2); cursor: pointer; font-family: 'Jost', sans-serif; font-size: 11px; letter-spacing: 1px; transition: color .2s; padding: 6px 10px; }
.btn-ghost:hover { color: var(--text); }

.btn-danger { background: rgba(192,57,43,.1); color: #e74c3c; border: 1px solid rgba(192,57,43,.2); padding: 7px 14px; border-radius: 1px; cursor: pointer; font-family: 'Jost', sans-serif; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; transition: all .2s; }
.btn-success { background: rgba(39,174,96,.1); color: #2ecc71; border: 1px solid rgba(39,174,96,.2); padding: 7px 14px; border-radius: 1px; cursor: pointer; font-family: 'Jost', sans-serif; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; transition: all .2s; }

.inp { background: var(--bg2); border: 1px solid var(--border); color: var(--text); padding: 13px 16px; border-radius: 1px; font-family: 'Jost', sans-serif; font-size: 13px; font-weight: 300; width: 100%; outline: none; transition: border-color .25s; letter-spacing: .02em; }
.inp:focus { border-color: rgba(196,151,63,.4); }
.inp::placeholder { color: var(--text3); }

.sel { background: var(--bg2); border: 1px solid var(--border); color: var(--text); padding: 13px 16px; border-radius: 1px; font-family: 'Jost', sans-serif; font-size: 13px; font-weight: 300; width: 100%; cursor: pointer; outline: none; }

.card { background: var(--bg2); border: 1px solid var(--border); border-radius: 2px; padding: 20px; transition: border-color .3s; }
.card-gold { border-color: rgba(196,151,63,.15); }

.pill { padding: 7px 14px; border-radius: 20px; font-family: 'Jost', sans-serif; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; cursor: pointer; border: 1px solid var(--border); background: transparent; color: var(--text3); transition: all .2s; white-space: nowrap; font-weight: 400; }
.pill.active { background: var(--gold); color: #080808; border-color: var(--gold); font-weight: 600; }
.pill:hover:not(.active) { border-color: rgba(196,151,63,.3); color: var(--gold); }

.tab-nav { display: flex; border-bottom: 1px solid var(--border); background: var(--bg2); overflow-x: auto; position: sticky; top: 60px; z-index: 40; }
.tab { color: var(--text3); border-bottom: 2px solid transparent; cursor: pointer; padding: 14px 0; font-family: 'Jost', sans-serif; font-size: 9px; letter-spacing: 3px; text-transform: uppercase; transition: all .25s; background: none; border-left: none; border-right: none; border-top: none; flex: 1; min-width: 0; font-weight: 500; }
.tab.active { color: var(--gold); border-bottom-color: var(--gold); }

.bubble-user { background: rgba(196,151,63,.08); border: 1px solid rgba(196,151,63,.15); border-radius: 16px 16px 3px 16px; padding: 12px 16px; max-width: 80%; margin-left: auto; font-size: 13px; line-height: 1.6; }
.bubble-ai { background: var(--bg2); border: 1px solid var(--border); border-radius: 16px 16px 16px 3px; padding: 14px 18px; max-width: 88%; font-size: 13px; line-height: 1.75; color: var(--text2); }
.bubble-ai strong { color: var(--text); font-weight: 500; }
.bubble-ai ul { padding-left: 16px; margin: 8px 0; }
.bubble-ai li { margin-bottom: 5px; }
.bubble-ai p { margin-bottom: 8px; }
.bubble-ai p:last-child { margin-bottom: 0; }

.dot { width: 5px; height: 5px; border-radius: 50%; background: var(--gold); animation: bop 1.2s ease-in-out infinite; }
.dot:nth-child(2) { animation-delay: .2s; }
.dot:nth-child(3) { animation-delay: .4s; }
@keyframes bop { 0%, 60%, 100% { transform: translateY(0); opacity: .4; } 30% { transform: translateY(-8px); opacity: 1; } }

.divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(196,151,63,.15), transparent); margin: 20px 0; }
.fade { animation: fadeUp .35s ease both; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.photo-box { width: 100%; aspect-ratio: 1; border: 1px dashed var(--border2); border-radius: 2px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: border-color .2s; overflow: hidden; background: var(--bg); }
.photo-box:hover { border-color: rgba(196,151,63,.3); }

.toast { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%); background: var(--bg3); border: 1px solid rgba(196,151,63,.25); color: var(--text); padding: 11px 22px; border-radius: 2px; font-size: 11px; font-family: 'Jost', sans-serif; letter-spacing: 1.5px; z-index: 999; animation: fadeUp .3s ease; white-space: nowrap; }

.badge-plan { padding: 3px 9px; border-radius: 20px; font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 600; }
.badge-active { background: rgba(39,174,96,.1); color: #2ecc71; border: 1px solid rgba(39,174,96,.2); }
.badge-blocked { background: rgba(192,57,43,.1); color: #e74c3c; border: 1px solid rgba(192,57,43,.2); }
.badge-premium { background: rgba(196,151,63,.1); color: var(--gold); border: 1px solid rgba(196,151,63,.2); }
.badge-basic { background: var(--bg3); color: var(--text2); border: 1px solid var(--border); }

.lnk { display: inline-flex; align-items: center; gap: 5px; padding: 6px 11px; border-radius: 2px; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; font-family: 'Jost', sans-serif; font-weight: 500; cursor: pointer; text-decoration: none; transition: all .2s; }
.lnk-maps { background: rgba(39,174,96,.08); color: #2ecc71; border: 1px solid rgba(39,174,96,.2); }
.lnk-amazon { background: rgba(255,153,0,.08); color: #ff9900; border: 1px solid rgba(255,153,0,.2); }
.lnk-web { background: rgba(99,102,241,.08); color: #818cf8; border: 1px solid rgba(99,102,241,.2); }

.pulse { animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .4; } }

.loc-bar { background: var(--bg2); border: 1px solid var(--border); border-radius: 2px; padding: 12px 14px; display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.stat-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 2px; padding: 18px; text-align: center; }

.md-content p { margin-bottom: 10px; }
.md-content p:last-child { margin-bottom: 0; }
.md-content ul, .md-content ol { padding-left: 18px; margin: 8px 0; }
.md-content li { margin-bottom: 6px; line-height: 1.6; }
.md-content strong { color: var(--text); font-weight: 500; }
.md-content em { color: var(--gold); font-style: italic; }
.md-content h3 { font-family: 'Cormorant Garamond', serif; font-size: 16px; color: var(--gold); margin: 12px 0 8px; font-weight: 400; }

.chip { padding: 7px 12px; background: var(--bg2); border: 1px solid var(--border); color: var(--text2); border-radius: 20px; cursor: pointer; font-family: 'Jost', sans-serif; font-size: 11px; white-space: nowrap; transition: all .2s; }
.chip:hover { border-color: rgba(196,151,63,.3); color: var(--gold); }

.stars { color: var(--gold); font-size: 18px; letter-spacing: 2px; }
`;

// ─── MARKDOWN RENDERER ────────────────────────────────────────────────────────
function renderMarkdown(text: string) {
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/### (.*?)(\n|$)/g, '<h3>$1</h3>')
    .replace(/^- (.*?)(\n|$)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');
  if (!html.startsWith('<')) html = `<p>${html}</p>`;
  return html;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function StyleVault() {
  const [screen, setScreen] = useState("login");
  const [profile, setProfile] = useState<any>(null);
  const [lf, setLf] = useState({ name: "", email: "", password: "" });
  const [lmode, setLmode] = useState("login");
  const [lerr, setLerr] = useState("");
  const [aloading, setAL] = useState(false);

  const [tab, setTab] = useState("wardrobe");
  const [clothes, setClothes] = useState<any[]>([]);
  const [fc, setFc] = useState("Todo");
  const [showForm, setSF] = useState(false);
  const [ni, setNi] = useState({ name: "", category: "Tops", color: "#C4973F", season: "", occasion: "" });
  const [pp, setPp] = useState<string | null>(null);
  const [pfile, setPfile] = useState<File | null>(null);
  const [cloading, setCL] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const [selEv, setSelEv] = useState("");
  const [selSe, setSelSe] = useState("Todo el año");
  const [outfitR, setOR] = useState<any>(null);
  const [outfitL, setOL] = useState(false);

  const [msgs, setMsgs] = useState<{ role: string; text: string }[]>([
    { role: "assistant", text: "Hola, soy tu **asesor de estilo personal**. Puedo ayudarte con combinaciones de colores, dress codes, armario cápsula, tendencias y mucho más.\n\n¿En qué te puedo ayudar hoy?" },
  ]);
  const [cin, setCin] = useState("");
  const [cload, setCload] = useState(false);
  const chatEnd = useRef<HTMLDivElement>(null);

  const [budget, setBudget] = useState("");
  const [shopCat, setShopCat] = useState("");
  const [shopSt, setShopSt] = useState("");
  const [shopR, setShopR] = useState<any>(null);
  const [shopL, setShopL] = useState(false);
  const [loc, setLoc] = useState<any>(null);
  const [locSt, setLocSt] = useState("idle");
  const [locErr, setLocErr] = useState("");

  const [tripDest, setTripDest] = useState("");
  const [tripDays, setTripDays] = useState("7");
  const [tripClima, setTripClima] = useState("");
  const [tripTipo, setTripTipo] = useState("");
  const [tripR, setTripR] = useState<any>(null);
  const [tripL, setTripL] = useState(false);

  const [adminTab, setAT] = useState("overview");
  const [allUsers, setAllU] = useState<any[]>([]);
  const [adminL, setAdminL] = useState(false);

  const [toast, setToast] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2800); };

  useEffect(() => {
    const saved = localStorage.getItem("sb_profile");
    if (saved) {
      const p = JSON.parse(saved);
      setProfile(p);
      setScreen(p.plan === "Admin" ? "admin" : "app");
    }
  }, []);

  // ── AUTH ──────────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    setLerr(""); setAL(true);
    try {
      const auth = await sbSignIn(lf.email, lf.password);
      if (auth.error || !auth.access_token) { setLerr(auth.error?.message || "Correo o contraseña incorrectos."); setAL(false); return; }
      localStorage.setItem("sb_token", auth.access_token);
      const res = await fetch(`${SB_URL}/rest/v1/users?email=eq.${encodeURIComponent(lf.email)}&limit=1`, {
        headers: { apikey: SB_KEY, Authorization: `Bearer ${auth.access_token}`, "Content-Type": "application/json" },
      });
      const users = await res.json();
      if (!users || users.length === 0) { setLerr("Perfil no encontrado."); setAL(false); return; }
      const p = users[0];
      if (p.status === "blocked") { setLerr("Tu cuenta está bloqueada."); setAL(false); return; }
      localStorage.setItem("sb_profile", JSON.stringify(p));
      setProfile(p);
      setScreen(p.plan === "Admin" ? "admin" : "app");
    } catch { setLerr("Error de conexión."); }
    setAL(false);
  };

  const handleRegister = async () => {
    setLerr(""); setAL(true);
    if (!lf.name || !lf.email || !lf.password) { setLerr("Completa todos los campos."); setAL(false); return; }
    try {
      const auth = await sbSignUp(lf.email, lf.password);
      if (auth.error) { setLerr(auth.error.message || "Error al registrar."); setAL(false); return; }
      localStorage.setItem("sb_token", auth.access_token || SB_KEY);
      const newProfile = { id: auth.user?.id, name: lf.name, email: lf.email, plan: "Basic", status: "active", created_at: new Date().toISOString() };
      await dbInsert("users", newProfile);
      localStorage.setItem("sb_profile", JSON.stringify(newProfile));
      setProfile(newProfile);
      setScreen("app");
      showToast("✦ Bienvenido a StyleVault");
    } catch { setLerr("Error al crear cuenta."); }
    setAL(false);
  };

  const handleForgotPassword = async () => {
    if (!lf.email) { setLerr("Escribe tu correo primero."); return; }
    setAL(true);
    try {
      const res = await fetch(`${SB_URL}/auth/v1/recover`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
        body: JSON.stringify({ email: lf.email }),
      });
      setLerr(res.ok ? "✅ Revisa tu correo para recuperar tu contraseña." : "Error al enviar.");
    } catch { setLerr("Error de conexión."); }
    setAL(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("sb_token");
    localStorage.removeItem("sb_profile");
    setProfile(null); setClothes([]); setScreen("login");
  };

  // ── CLOTHES ───────────────────────────────────────────────────────────────
  useEffect(() => { if (screen === "app" && profile) loadClothes(); }, [screen, profile]);

  const loadClothes = async () => {
    setCL(true);
    try { const data = await dbSelect("clothes", `user_id=eq.${profile.id}&order=created_at.desc`); if (data) setClothes(data); } catch {}
    setCL(false);
  };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setPfile(f);
    const r = new FileReader();
    r.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setPp(dataUrl);
      // Auto-analyze with AI
      setAnalyzing(true);
      try {
        const base64 = dataUrl.split(',')[1];
        const res = await fetch("https://stylevault-api.121lunaoscar.workers.dev", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-5",
            max_tokens: 500,
            system: PHOTO_SYSTEM,
            messages: [{ role: "user", content: [
              { type: "image", source: { type: "base64", media_type: f.type, data: base64 } },
              { type: "text", text: "Analiza esta prenda de ropa." }
            ]}],
          }),
        });
        const data = await res.json();
        const text = data.content?.map((i: any) => i.text || "").join("") || "";
        const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
        setNi(prev => ({
          ...prev,
          name: parsed.name || prev.name,
          category: parsed.category || prev.category,
          season: parsed.season || prev.season,
          occasion: parsed.occasion || prev.occasion,
        }));
        showToast("✦ Prenda analizada con IA");
      } catch { showToast("No se pudo analizar automáticamente"); }
      setAnalyzing(false);
    };
    r.readAsDataURL(f);
  };

  const addItem = async () => {
    if (!ni.name) return;
    try {
      const inserted = await dbInsert("clothes", { user_id: profile.id, ...ni, photo_url: pp });
      if (inserted && inserted[0]) setClothes([inserted[0], ...clothes]);
      else setClothes([{ id: Date.now(), user_id: profile.id, ...ni, photo_url: pp }, ...clothes]);
      setNi({ name: "", category: "Tops", color: "#C4973F", season: "", occasion: "" });
      setPp(null); setPfile(null); setSF(false);
      showToast("✦ Prenda guardada");
    } catch { showToast("Error al guardar."); }
  };

  const removeItem = async (id: number) => {
    try { await dbDelete("clothes", `id=eq.${id}`); } catch {}
    setClothes(clothes.filter((c) => c.id !== id));
    showToast("Prenda eliminada");
  };

  // ── OUTFIT ────────────────────────────────────────────────────────────────
  const generateOutfit = async () => {
    if (!selEv) return;
    setOL(true); setOR(null);
    const list = clothes.map((c) => `${c.name} (${c.category}, ${c.occasion || "sin ocasión"})`).join("\n");
    try {
      const raw = await callClaude(OUTFIT_SYSTEM, [
        { role: "user", content: `Armario:\n${list}\n\nEvento: ${selEv}\nTemporada: ${selSe}\n\nCrea el outfit ideal y califícalo del 1 al 5 estrellas.` },
      ]);
      setOR(JSON.parse(raw.replace(/```json|```/g, "").trim()));
      showToast("✦ Outfit creado");
    } catch { setOR({ outfit: [], explanation: "Error al generar.", colorPalette: "", rating: 0, ratingExplanation: "" }); }
    setOL(false);
  };

  // ── CHAT ──────────────────────────────────────────────────────────────────
  const sendChat = async (msg?: string) => {
    const m = msg || cin;
    if (!m.trim()) return;
    const next = [...msgs, { role: "user", text: m }];
    setMsgs(next); setCin(""); setCload(true);
    const wardrobeCtx = clothes.length > 0
      ? `\n\nArmario del usuario (${clothes.length} prendas): ${clothes.slice(0, 20).map(c => `${c.name} (${c.category})`).join(", ")}`
      : "";
    const history = next.map((x) => ({ role: x.role === "assistant" ? "assistant" : "user", content: x.text }));
    try {
      const reply = await callClaude(ADVISOR_SYSTEM + wardrobeCtx, history);
      setMsgs([...next, { role: "assistant", text: reply }]);
    } catch {
      setMsgs([...next, { role: "assistant", text: "Error de conexión. Por favor intenta de nuevo." }]);
    }
    setCload(false);
  };

  // ── GEO ───────────────────────────────────────────────────────────────────
  const requestLoc = () => {
    if (!navigator.geolocation) { setLocSt("err"); setLocErr("Tu navegador no soporta geolocalización."); return; }
    setLocSt("loading");
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lng } }) => {
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const d = await r.json();
          const city = d.address?.city || d.address?.town || d.address?.village || "tu ciudad";
          setLoc({ lat, lng, city, country: d.address?.country || "" }); setLocSt("ok");
        } catch { setLoc({ lat, lng, city: "tu zona", country: "" }); setLocSt("ok"); }
      },
      (e) => { setLocSt("err"); setLocErr(e.code === 1 ? "Permiso denegado." : "No se pudo obtener ubicación."); },
      { timeout: 10000 }
    );
  };

  // ── SHOP ──────────────────────────────────────────────────────────────────
  const searchShop = async () => {
    if (!budget || !shopCat) return;
    setShopL(true); setShopR(null);
    const bLabel = BUDGETS.find((b) => b.value === budget)?.label || budget;
    const locCtx = loc ? `en ${loc.city}, ${loc.country}` : "globalmente";
    try {
      const raw = await callClaude(SHOP_SYSTEM, [
        { role: "user", content: `Recomienda ropa "${shopCat}" con presupuesto ${bLabel} ${locCtx}${shopSt ? `, estilo ${shopSt}` : ""}. Usa tiendas reales: Zara, H&M, Mango, Shein, ASOS, Amazon, Nike, Adidas, Uniqlo, Gap, Primark, Liverpool, Palacio de Hierro. Precios realistas.` },
      ]);
      setShopR(JSON.parse(raw.replace(/```json|```/g, "").trim()));
    } catch { setShopR({ intro: "Error al buscar.", items: [] }); }
    setShopL(false);
  };

  // ── TRIP ──────────────────────────────────────────────────────────────────
  const planTrip = async () => {
    if (!tripDest || !tripDays) return;
    setTripL(true); setTripR(null);
    const armario = clothes.length > 0
      ? clothes.map((c: any) => `${c.name} (${c.category}, ${c.occasion || ""})`).join(", ")
      : "Sin prendas registradas";
    try {
      const raw = await callClaude(TRIP_SYSTEM, [
        { role: "user", content: `Destino: ${tripDest}\nDías: ${tripDays}\nClima: ${tripClima || "templado"}\nTipo: ${tripTipo || "turismo"}\nArmario: ${armario}\n\nCrea plan de maleta usando el armario. Indica qué llevar de su armario y qué le falta comprar.` },
      ]);
      setTripR(JSON.parse(raw.replace(/```json|```/g, "").trim()));
    } catch { setTripR({ intro: "Error al generar.", llevar: [], faltan: [], consejo: "" }); }
    setTripL(false);
  };

  // ── ADMIN ─────────────────────────────────────────────────────────────────
  useEffect(() => { if (screen === "admin") loadAdminUsers(); }, [screen]);

  const loadAdminUsers = async () => {
    setAdminL(true);
    try { const d = await dbSelect("users", "order=created_at.desc"); if (d) setAllU(d); } catch {}
    setAdminL(false);
  };

  const toggleBlock = async (u: any) => {
    const ns = u.status === "blocked" ? "active" : "blocked";
    try { await dbUpdate("users", `id=eq.${u.id}`, { status: ns }); } catch {}
    setAllU(allUsers.map((x) => (x.id === u.id ? { ...x, status: ns } : x)));
    showToast(ns === "blocked" ? "Usuario bloqueado" : "Usuario desbloqueado");
  };

  const cancelPlan = async (u: any) => {
    try { await dbUpdate("users", `id=eq.${u.id}`, { plan: "Basic" }); } catch {}
    setAllU(allUsers.map((x) => (x.id === u.id ? { ...x, plan: "Basic" } : x)));
    showToast("Plan cancelado");
  };

  const filtered = clothes.filter((c) => fc === "Todo" || c.category === fc);
  const premiums = allUsers.filter((u) => u.plan === "Premium");
  const actives = allUsers.filter((u) => u.status === "active" && u.plan !== "Admin");
  const blocked = allUsers.filter((u) => u.status === "blocked");

  const suggestions = [
    "¿Qué colores combinan con azul marino?",
    "Armario cápsula esencial",
    "¿Cómo vestir para una entrevista?",
    "Reglas del dress code Smart Casual",
    "Tips para parecer más alto/a",
    "¿Qué es el tono sobre tono?",
  ];

  const renderStars = (n: number) => "★".repeat(Math.min(5, Math.max(0, Math.round(n)))) + "☆".repeat(5 - Math.min(5, Math.max(0, Math.round(n))));

  // ══════════════════════════════════════════════════════════════════════════
  // LOGIN
  if (screen === "login") return (
    <div style={{ fontFamily: "'Jost', sans-serif", background: "#080808", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <style>{CSS}</style>
      <div style={{ width: "100%", maxWidth: "360px" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "6px", color: "#3a3632", marginBottom: "12px" }}>✦</div>
          <div className="serif" style={{ fontSize: "42px", letterSpacing: "10px", color: "#C4973F", fontWeight: 300 }}>STYLE<em>VAULT</em></div>
          <div style={{ fontSize: "8px", letterSpacing: "6px", color: "#2a2826", marginTop: "8px", textTransform: "uppercase" }}>Armario Inteligente</div>
        </div>
        <div className="card">
          <div style={{ display: "flex", marginBottom: "28px", borderBottom: "1px solid #1c1c1c" }}>
            {["login", "register"].map((m) => (
              <button key={m} onClick={() => { setLmode(m); setLerr(""); }} style={{ flex: 1, padding: "11px", background: "none", border: "none", borderBottom: `2px solid ${lmode === m ? "#C4973F" : "transparent"}`, color: lmode === m ? "#C4973F" : "#3a3632", cursor: "pointer", fontFamily: "'Jost', sans-serif", fontSize: "9px", letterSpacing: "3px", textTransform: "uppercase", transition: "all .2s", fontWeight: 500 }}>
                {m === "login" ? "Iniciar Sesión" : "Registrarse"}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {lmode === "register" && <input className="inp" placeholder="Tu nombre completo" value={lf.name} onChange={(e) => setLf((p) => ({ ...p, name: e.target.value }))} />}
            <input className="inp" placeholder="Correo electrónico" type="email" value={lf.email} onChange={(e) => setLf((p) => ({ ...p, email: e.target.value }))} />
            <input className="inp" placeholder="Contraseña" type="password" value={lf.password} onChange={(e) => setLf((p) => ({ ...p, password: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && (lmode === "login" ? handleLogin() : handleRegister())} />
            {lerr && <div style={{ color: lerr.startsWith("✅") ? "#2ecc71" : "#e74c3c", fontSize: "12px", textAlign: "center", lineHeight: 1.5 }}>{lerr}</div>}
            <button className="btn-primary" style={{ marginTop: "6px" }} onClick={lmode === "login" ? handleLogin : handleRegister} disabled={aloading}>
              {aloading ? "..." : `✦  ${lmode === "login" ? "Entrar" : "Crear Cuenta"}`}
            </button>
            {lmode === "login" && (
              <button onClick={handleForgotPassword} disabled={aloading} style={{ background: "none", border: "none", color: "#3a3632", fontSize: "10px", cursor: "pointer", letterSpacing: "1.5px", fontFamily: "'Jost', sans-serif", textDecoration: "underline", textAlign: "center" }}>
                ¿Olvidaste tu contraseña?
              </button>
            )}
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: "28px", fontSize: "9px", color: "#1e1e1e", letterSpacing: "2px" }}>STYLEVAULT © 2025</div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // ADMIN
  if (screen === "admin") return (
    <div className="sv fade">
      <style>{CSS}</style>
      {toast && <div className="toast">{toast}</div>}
      <header style={{ padding: "13px 18px", borderBottom: "1px solid #141414", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0a0a0a", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <div className="serif" style={{ fontSize: "20px", letterSpacing: "6px", color: "#C4973F", fontWeight: 300 }}>STYLE<em>VAULT</em></div>
          <div style={{ fontSize: "8px", color: "#60a5fa", letterSpacing: "4px", marginTop: "2px", textTransform: "uppercase" }}>Panel Admin</div>
        </div>
        <button className="btn-outline" onClick={handleLogout}>Salir</button>
      </header>
      <nav className="tab-nav" style={{ top: 60 }}>
        {[["overview", "Resumen"], ["users", "Usuarios"], ["subscriptions", "Suscripciones"]].map(([k, l]) => (
          <button key={k} className={`tab ${adminTab === k ? "active" : ""}`} onClick={() => setAT(k)}>{l}</button>
        ))}
      </nav>
      <main style={{ padding: "20px 16px", maxWidth: "680px", margin: "0 auto" }}>
        {adminL ? <div style={{ display: "flex", justifyContent: "center", gap: "6px", padding: "60px" }}><div className="dot" /><div className="dot" /><div className="dot" /></div> : (
          <>
            {adminTab === "overview" && (
              <div className="fade">
                <div className="serif" style={{ fontSize: "28px", marginBottom: "20px", fontWeight: 300 }}>Panel de Control</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                  {[{ label: "Activos", value: actives.length, color: "#2ecc71" }, { label: "Premium", value: premiums.length, color: "#C4973F" }, { label: "Bloqueados", value: blocked.length, color: "#e74c3c" }, { label: "Ingresos/mes", value: `$${(premiums.length * 299).toLocaleString()} MXN`, color: "#60a5fa" }].map((s) => (
                    <div key={s.label} className="stat-card">
                      <div className="serif" style={{ fontSize: "28px", color: s.color, marginBottom: "6px", fontWeight: 300 }}>{s.value}</div>
                      <div style={{ fontSize: "9px", color: "#3a3632", letterSpacing: "2px", textTransform: "uppercase" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <div style={{ fontSize: "9px", color: "#C4973F", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "16px" }}>✦ Usuarios Recientes</div>
                  {allUsers.filter((u) => u.plan !== "Admin").slice(0, 5).map((u) => (
                    <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: "1px solid #141414" }}>
                      <div><div style={{ fontSize: "13px" }}>{u.name}</div><div style={{ fontSize: "10px", color: "#3a3632", marginTop: "2px" }}>{u.email}</div></div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <span className={`badge-plan ${u.plan === "Premium" ? "badge-premium" : "badge-basic"}`}>{u.plan}</span>
                        <span className={`badge-plan ${u.status === "blocked" ? "badge-blocked" : "badge-active"}`}>{u.status === "active" ? "Activo" : "Bloq."}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {adminTab === "users" && (
              <div className="fade">
                <div className="serif" style={{ fontSize: "28px", marginBottom: "20px", fontWeight: 300 }}>Gestión de Usuarios</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {allUsers.filter((u) => u.plan !== "Admin").map((u) => (
                    <div key={u.id} className="card">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                        <div><div style={{ fontSize: "14px", fontWeight: 400 }}>{u.name}</div><div style={{ fontSize: "11px", color: "#3a3632", marginTop: "3px" }}>{u.email}</div></div>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <span className={`badge-plan ${u.plan === "Premium" ? "badge-premium" : "badge-basic"}`}>{u.plan}</span>
                          <span className={`badge-plan ${u.status === "blocked" ? "badge-blocked" : "badge-active"}`}>{u.status === "active" ? "Activo" : "Bloq."}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button className={u.status === "blocked" ? "btn-success" : "btn-danger"} onClick={() => toggleBlock(u)}>{u.status === "blocked" ? "Desbloquear" : "Bloquear"}</button>
                        {u.plan === "Premium" && <button className="btn-danger" onClick={() => cancelPlan(u)}>Cancelar Plan</button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {adminTab === "subscriptions" && (
              <div className="fade">
                <div className="serif" style={{ fontSize: "28px", marginBottom: "20px", fontWeight: 300 }}>Suscripciones</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                  <div className="stat-card"><div style={{ fontSize: "9px", color: "#C4973F", letterSpacing: "2px", marginBottom: "10px", textTransform: "uppercase" }}>Premium</div><div className="serif" style={{ fontSize: "32px", color: "#C4973F", fontWeight: 300 }}>{premiums.length}</div></div>
                  <div className="stat-card"><div style={{ fontSize: "9px", color: "#2ecc71", letterSpacing: "2px", marginBottom: "10px", textTransform: "uppercase" }}>Ingresos</div><div className="serif" style={{ fontSize: "28px", color: "#2ecc71", fontWeight: 300 }}>${(premiums.length * 299).toLocaleString()}</div></div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // MAIN APP
  return (
    <div className="sv">
      <style>{CSS}</style>
      {toast && <div className="toast">{toast}</div>}
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />
      <input ref={camRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handlePhoto} />

      <header style={{ padding: "12px 18px", borderBottom: "1px solid #141414", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0a0a0a", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <div className="serif" style={{ fontSize: "20px", letterSpacing: "6px", color: "#C4973F", fontWeight: 300 }}>STYLE<em>VAULT</em></div>
          <div style={{ fontSize: "8px", letterSpacing: "4px", color: "#2a2826", marginTop: "1px", textTransform: "uppercase" }}>Armario Inteligente</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "12px", fontWeight: 400 }}>{profile?.name?.split(" ")[0]}</div>
            <div style={{ fontSize: "9px", color: "rgba(196,151,63,.5)", letterSpacing: "1.5px", textTransform: "uppercase" }}>{profile?.plan}</div>
          </div>
          <button className="btn-outline" onClick={handleLogout}>Salir</button>
        </div>
      </header>

      <nav className="tab-nav">
        {[["wardrobe", "Armario"], ["outfit", "Outfit IA"], ["shop", "Tiendas"], ["trip", "Viajes"], ["advisor", "Asesor IA"]].map(([k, l]) => (
          <button key={k} className={`tab ${tab === k ? "active" : ""}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </nav>

      <main style={{ flex: 1, padding: "20px 16px", maxWidth: "640px", width: "100%", margin: "0 auto" }}>

        {/* ── WARDROBE ── */}
        {tab === "wardrobe" && (
          <div className="fade">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <div className="serif" style={{ fontSize: "28px", fontWeight: 300 }}>Mi Armario</div>
                <div style={{ fontSize: "10px", color: "#3a3632", marginTop: "3px", letterSpacing: "1px" }}>{clothes.length} prendas</div>
              </div>
              <button className="btn-outline" onClick={() => setSF(!showForm)}>+ Agregar</button>
            </div>

            {showForm && (
              <div className="card card-gold fade" style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "9px", color: "#C4973F", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "16px" }}>✦ Nueva Prenda</div>
                <div style={{ marginBottom: "16px" }}>
                  <div className="photo-box" style={{ height: "160px" }} onClick={() => fileRef.current?.click()}>
                    {pp ? <img src={pp} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", color: "#3a3632" }}>
                        <div style={{ fontSize: "32px" }}>📷</div>
                        <div style={{ fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase" }}>Foto → IA analiza automáticamente</div>
                      </div>
                    )}
                  </div>
                  {analyzing && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 0", color: "#C4973F", fontSize: "11px" }}>
                      <div className="dot" /><div className="dot" /><div className="dot" />
                      <span style={{ marginLeft: "4px" }}>Analizando prenda con IA...</span>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                    <button className="btn-ghost" style={{ flex: 1, border: "1px solid #1c1c1c", borderRadius: "1px" }} onClick={() => fileRef.current?.click()}>Galería</button>
                    <button className="btn-ghost" style={{ flex: 1, border: "1px solid #1c1c1c", borderRadius: "1px" }} onClick={() => camRef.current?.click()}>Cámara</button>
                    {pp && <button className="btn-ghost" style={{ border: "1px solid #1c1c1c", borderRadius: "1px" }} onClick={() => { setPp(null); setPfile(null); }}>✕</button>}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <input className="inp" placeholder="Nombre de la prenda" value={ni.name} onChange={(e) => setNi((p) => ({ ...p, name: e.target.value }))} />
                  <select className="sel" value={ni.category} onChange={(e) => setNi((p) => ({ ...p, category: e.target.value }))}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <input type="color" value={ni.color} onChange={(e) => setNi((p) => ({ ...p, color: e.target.value }))} style={{ width: "44px", height: "44px", border: "1px solid #1c1c1c", borderRadius: "1px", background: "none", cursor: "pointer", padding: "3px" }} />
                    <span style={{ fontSize: "12px", color: "#3a3632" }}>Color principal</span>
                  </div>
                  <select className="sel" value={ni.season} onChange={(e) => setNi((p) => ({ ...p, season: e.target.value }))}>
                    <option value="">Temporada</option>
                    {SEASONS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <select className="sel" value={ni.occasion} onChange={(e) => setNi((p) => ({ ...p, occasion: e.target.value }))}>
                    <option value="">Ocasión</option>
                    {OCCASIONS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                    <button className="btn-primary" onClick={addItem} style={{ flex: 1 }}>Guardar</button>
                    <button className="btn-outline" onClick={() => { setSF(false); setPp(null); setPfile(null); }}>Cancelar</button>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "12px", marginBottom: "16px" }}>
              {["Todo", ...CATEGORIES].map((c) => (
                <button key={c} className={`pill ${fc === c ? "active" : ""}`} onClick={() => setFc(c)}>{c}</button>
              ))}
            </div>

            {cloading ? (
              <div style={{ display: "flex", justifyContent: "center", gap: "6px", padding: "60px" }}><div className="dot" /><div className="dot" /><div className="dot" /></div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "70px 20px" }}>
                <div style={{ fontSize: "40px", marginBottom: "16px", opacity: .3 }}>👗</div>
                <div style={{ fontSize: "12px", color: "#1e1e1e", letterSpacing: "1px" }}>{clothes.length === 0 ? "Tu armario está vacío. ¡Agrega tu primera prenda!" : "No hay prendas en esta categoría."}</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {filtered.map((item) => (
                  <div key={item.id} className="card" style={{ padding: 0, overflow: "hidden", position: "relative" }}>
                    <button onClick={() => removeItem(item.id)} style={{ position: "absolute", top: "8px", right: "8px", zIndex: 2, background: "rgba(0,0,0,.7)", border: "none", color: "#7a7269", cursor: "pointer", fontSize: "10px", width: "22px", height: "22px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                    {item.photo_url ? (
                      <div style={{ width: "100%", aspectRatio: "1", overflow: "hidden" }}>
                        <img src={item.photo_url} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    ) : (
                      <div style={{ width: "100%", aspectRatio: "1", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "10px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: item.color || "#C4973F", border: "2px solid #1c1c1c" }} />
                        <div style={{ fontSize: "32px" }}>{CAT_EMOJI[item.category] || "👔"}</div>
                      </div>
                    )}
                    <div style={{ padding: "10px 12px" }}>
                      <div style={{ fontSize: "12px", fontWeight: 400, lineHeight: 1.3, marginBottom: "3px" }}>{item.name}</div>
                      <div style={{ fontSize: "9px", color: "#3a3632", letterSpacing: "1.5px", textTransform: "uppercase" }}>{item.category}</div>
                      {item.occasion && <div style={{ fontSize: "10px", color: "rgba(196,151,63,.5)", marginTop: "3px" }}>{item.occasion}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── OUTFIT ── */}
        {tab === "outfit" && (
          <div className="fade">
            <div style={{ marginBottom: "24px" }}>
              <div className="serif" style={{ fontSize: "28px", fontWeight: 300 }}>Outfit del Día</div>
              <div style={{ fontSize: "11px", color: "#3a3632", marginTop: "4px" }}>La IA selecciona y califica el look ideal de tu armario</div>
            </div>
            {clothes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "70px 20px" }}>
                <div style={{ fontSize: "40px", marginBottom: "16px", opacity: .3 }}>✦</div>
                <div style={{ fontSize: "12px", color: "#1e1e1e" }}>Agrega ropa a tu armario primero.</div>
              </div>
            ) : (
              <>
                <div className="card" style={{ marginBottom: "14px" }}>
                  <div style={{ fontSize: "9px", color: "#7a7269", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "14px" }}>¿Para qué evento?</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    {EVENTS.map((ev) => (
                      <button key={ev} onClick={() => setSelEv(ev)} style={{ padding: "10px 8px", background: selEv === ev ? "rgba(196,151,63,.1)" : "#0e0e0e", color: selEv === ev ? "#C4973F" : "#3a3632", border: `1px solid ${selEv === ev ? "rgba(196,151,63,.3)" : "#1c1c1c"}`, borderRadius: "1px", cursor: "pointer", fontFamily: "'Jost', sans-serif", fontSize: "11px", transition: "all .2s", textAlign: "left" }}>{ev}</button>
                    ))}
                  </div>
                </div>
                <div className="card" style={{ marginBottom: "18px" }}>
                  <div style={{ fontSize: "9px", color: "#7a7269", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "12px" }}>Temporada</div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {SEASONS.map((s) => <button key={s} className={`pill ${selSe === s ? "active" : ""}`} onClick={() => setSelSe(s)}>{s}</button>)}
                  </div>
                </div>
                <button className="btn-primary" onClick={generateOutfit} disabled={!selEv || outfitL} style={{ marginBottom: "20px" }}>
                  {outfitL ? "Creando outfit..." : "✦  Generar Outfit con IA"}
                </button>
                {outfitL && <div style={{ display: "flex", justifyContent: "center", gap: "6px", padding: "24px" }}><div className="dot" /><div className="dot" /><div className="dot" /></div>}
                {outfitR && !outfitL && (
                  <div className="fade">
                    <div className="divider" />
                    {/* Rating */}
                    {outfitR.rating && (
                      <div style={{ background: "#0a0a0a", border: "1px solid rgba(196,151,63,.15)", borderRadius: "2px", padding: "14px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: "9px", color: "#7a7269", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px" }}>Calificación del look</div>
                          <div style={{ fontSize: "13px", color: "#7a7269" }}>{outfitR.ratingExplanation}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div className="stars">{renderStars(outfitR.rating)}</div>
                          <div style={{ fontSize: "9px", color: "#C4973F", marginTop: "4px" }}>{outfitR.rating}/5</div>
                        </div>
                      </div>
                    )}
                    {outfitR.colorPalette && (
                      <div style={{ marginBottom: "16px", padding: "10px 14px", background: "#0a0a0a", border: "1px solid rgba(196,151,63,.1)", borderRadius: "2px" }}>
                        <div style={{ fontSize: "9px", color: "#7a7269", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px" }}>Paleta de colores</div>
                        <div style={{ fontSize: "12px", color: "rgba(196,151,63,.7)", fontStyle: "italic" }}>{outfitR.colorPalette}</div>
                      </div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "18px" }}>
                      {outfitR.outfit?.map((item: any, i: number) => (
                        <div key={i} style={{ display: "flex", gap: "14px", padding: "14px", background: "#0d0d0d", border: "1px solid #1c1c1c", borderRadius: "2px", alignItems: "flex-start" }}>
                          <div style={{ fontSize: "28px", minWidth: "36px", textAlign: "center" }}>{item.emoji}</div>
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: 400, marginBottom: "5px" }}>{item.name}</div>
                            <div style={{ fontSize: "11px", color: "#7a7269", lineHeight: 1.6 }}>{item.why}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {outfitR.explanation && (
                      <div style={{ background: "#0a0a0a", borderLeft: "2px solid rgba(196,151,63,.3)", padding: "16px", borderRadius: "0 2px 2px 0" }}>
                        <div style={{ fontSize: "9px", color: "#C4973F", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "10px" }}>✦ Por qué funciona</div>
                        <div style={{ fontSize: "12px", color: "#7a7269", lineHeight: 1.8 }}>{outfitR.explanation}</div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── SHOP ── */}
        {tab === "shop" && (
          <div className="fade">
            <div style={{ marginBottom: "20px" }}>
              <div className="serif" style={{ fontSize: "28px", fontWeight: 300 }}>Dónde Comprar</div>
              <div style={{ fontSize: "11px", color: "#3a3632", marginTop: "4px" }}>Links a Google Maps, Amazon y tiendas oficiales</div>
            </div>
            <div className="loc-bar" style={locSt === "err" ? { borderColor: "rgba(192,57,43,.3)" } : {}}>
              <div style={{ fontSize: "18px", flexShrink: 0 }}>
                {locSt === "idle" && "📍"}{locSt === "loading" && <span className="pulse">🔍</span>}{locSt === "ok" && "✅"}{locSt === "err" && "⚠️"}
              </div>
              <div style={{ flex: 1 }}>
                {locSt === "idle" && <div style={{ fontSize: "11px", color: "#3a3632" }}>Activa tu ubicación para ver tiendas cercanas</div>}
                {locSt === "loading" && <div style={{ fontSize: "11px", color: "#C4973F" }} className="pulse">Obteniendo ubicación...</div>}
                {locSt === "ok" && loc && <div style={{ fontSize: "12px", color: "#2ecc71" }}>📍 {loc.city}{loc.country ? `, ${loc.country}` : ""}</div>}
                {locSt === "err" && <div style={{ fontSize: "11px", color: "#e74c3c" }}>{locErr}</div>}
              </div>
              {locSt !== "ok" && <button className="btn-outline" style={{ flexShrink: 0 }} onClick={requestLoc} disabled={locSt === "loading"}>{locSt === "loading" ? "..." : "Activar"}</button>}
              {locSt === "ok" && <button className="btn-ghost" onClick={() => { setLocSt("idle"); setLoc(null); }}>✕</button>}
            </div>
            <div className="card" style={{ marginBottom: "14px" }}>
              <div style={{ fontSize: "9px", color: "#7a7269", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "14px" }}>Presupuesto</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {BUDGETS.map((b) => (
                  <button key={b.value} onClick={() => setBudget(b.value)} style={{ padding: "12px 10px", background: budget === b.value ? "rgba(196,151,63,.06)" : "#0e0e0e", border: `1px solid ${budget === b.value ? "rgba(196,151,63,.3)" : "#1c1c1c"}`, borderRadius: "1px", cursor: "pointer", textAlign: "left", transition: "all .2s" }}>
                    <div style={{ fontSize: "18px", marginBottom: "5px" }}>{b.icon}</div>
                    <div style={{ fontSize: "12px", fontWeight: 400, color: budget === b.value ? "#C4973F" : "#7a7269" }}>{b.label}</div>
                    <div style={{ fontSize: "10px", color: "#3a3632", marginTop: "3px" }}>{b.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="card" style={{ marginBottom: "14px" }}>
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "9px", color: "#7a7269", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "10px" }}>Categoría</div>
                <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
                  {["Tops", "Pantalones", "Vestidos", "Zapatos", "Accesorios", "Abrigos", "Ropa interior", "Deportivo"].map((c) => (
                    <button key={c} className={`pill ${shopCat === c ? "active" : ""}`} onClick={() => setShopCat(c)}>{c}</button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "9px", color: "#7a7269", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "10px" }}>Estilo (opcional)</div>
                <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
                  {["Casual", "Elegante", "Minimalista", "Streetwear", "Bohemio", "Deportivo"].map((s) => (
                    <button key={s} className={`pill ${shopSt === s ? "active" : ""}`} onClick={() => setShopSt(shopSt === s ? "" : s)}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
            <button className="btn-primary" onClick={searchShop} disabled={!budget || !shopCat || shopL} style={{ marginBottom: "20px" }}>
              {shopL ? "Buscando..." : `🛍  Buscar${locSt === "ok" ? ` cerca de ${loc?.city}` : ""}`}
            </button>
            {shopL && <div style={{ display: "flex", justifyContent: "center", gap: "6px", padding: "32px" }}><div className="dot" /><div className="dot" /><div className="dot" /></div>}
            {shopR && !shopL && (
              <div className="fade">
                <div className="divider" />
                {shopR.intro && <div style={{ fontSize: "13px", color: "#7a7269", lineHeight: 1.7, marginBottom: "18px", fontStyle: "italic", borderLeft: "2px solid rgba(196,151,63,.2)", paddingLeft: "14px" }}>{shopR.intro}</div>}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {shopR.items?.map((item: any, i: number) => (
                    <div key={i} style={{ background: "#0d0d0d", border: "1px solid #1c1c1c", borderRadius: "2px", padding: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <div style={{ fontSize: "14px", fontWeight: 400, flex: 1 }}>{item.name}</div>
                        <div className="serif" style={{ fontSize: "14px", color: "#C4973F", marginLeft: "12px", whiteSpace: "nowrap", fontWeight: 300 }}>{item.priceRange}</div>
                      </div>
                      <div style={{ fontSize: "12px", color: "#3a3632", marginBottom: "14px", lineHeight: 1.6 }}>{item.description}</div>
                      <div style={{ marginBottom: "12px" }}>
                        {item.stores?.map((s: string, j: number) => {
                          const meta = STORE_META[s] || {};
                          return (
                            <div key={j} style={{ background: "#0a0a0a", border: "1px solid #181818", borderRadius: "2px", padding: "10px 12px", marginBottom: "7px" }}>
                              <div style={{ fontSize: "12px", fontWeight: 400, marginBottom: "8px", color: "#7a7269" }}>{s}</div>
                              <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
                                {meta.maps && <a href={mapsUrl(s, loc?.lat, loc?.lng)} target="_blank" rel="noopener noreferrer" className="lnk lnk-maps">📍 Maps</a>}
                                {meta.amazon && <a href={amazonUrl(item.name)} target="_blank" rel="noopener noreferrer" className="lnk lnk-amazon">📦 Amazon</a>}
                                <a href={meta.web || `https://www.google.com/search?q=${encodeURIComponent(s + " " + item.name)}`} target="_blank" rel="noopener noreferrer" className="lnk lnk-web">🌐 Tienda</a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {item.tip && <div style={{ background: "#080808", borderLeft: "2px solid rgba(196,151,63,.15)", padding: "9px 12px", fontSize: "11px", color: "#3a3632", lineHeight: 1.6, marginBottom: "8px" }}>💡 {item.tip}</div>}
                      {item.why && <div style={{ fontSize: "11px", color: "rgba(196,151,63,.4)", lineHeight: 1.5 }}>✦ {item.why}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TRIP ── */}
        {tab === "trip" && (
          <div className="fade">
            <div style={{ marginBottom: "20px" }}>
              <div className="serif" style={{ fontSize: "28px", fontWeight: 300 }}>Planificador de Viaje</div>
              <div style={{ fontSize: "11px", color: "#3a3632", marginTop: "4px" }}>La IA organiza tu maleta usando tu armario</div>
            </div>
            <div className="card" style={{ marginBottom: "14px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <input className="inp" placeholder="¿A dónde vas? (París, Cancún, Nueva York...)" value={tripDest} onChange={e => setTripDest(e.target.value)} />
                <div style={{ display: "flex", gap: "10px" }}>
                  <input className="inp" placeholder="Días" type="number" min="1" max="30" value={tripDays} onChange={e => setTripDays(e.target.value)} style={{ width: "100px" }} />
                  <select className="sel" value={tripClima} onChange={e => setTripClima(e.target.value)}>
                    <option value="">Clima esperado</option>
                    {["Caluroso", "Templado", "Frío", "Lluvioso", "Variable"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ fontSize: "9px", color: "#7a7269", letterSpacing: "2px", textTransform: "uppercase", marginTop: "4px" }}>Tipo de viaje</div>
                <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
                  {["Turismo", "Playa", "Montaña", "Negocios", "Romántico", "Aventura"].map(t => (
                    <button key={t} className={`pill ${tripTipo === t ? "active" : ""}`} onClick={() => setTripTipo(tripTipo === t ? "" : t)}>{t}</button>
                  ))}
                </div>
              </div>
            </div>
            <button className="btn-primary" onClick={planTrip} disabled={!tripDest || tripL} style={{ marginBottom: "20px" }}>
              {tripL ? "Planificando..." : "✈  Planificar Maleta con IA"}
            </button>
            {tripL && <div style={{ display: "flex", justifyContent: "center", gap: "6px", padding: "32px" }}><div className="dot" /><div className="dot" /><div className="dot" /></div>}
            {tripR && !tripL && (
              <div className="fade">
                <div className="divider" />
                {tripR.intro && <div style={{ fontSize: "13px", color: "#7a7269", lineHeight: 1.7, marginBottom: "16px", fontStyle: "italic", borderLeft: "2px solid rgba(196,151,63,.2)", paddingLeft: "14px" }}>{tripR.intro}</div>}
                {tripR.llevar?.map((grupo: any, i: number) => (
                  <div key={i} className="card" style={{ marginBottom: "12px" }}>
                    <div style={{ fontSize: "9px", color: "#C4973F", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "12px" }}>✦ {grupo.categoria}</div>
                    {grupo.items?.map((item: string, j: number) => (
                      <div key={j} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "7px 0", borderBottom: "1px solid #141414" }}>
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#C4973F", flexShrink: 0 }} />
                        <div style={{ fontSize: "13px" }}>{item}</div>
                      </div>
                    ))}
                    {grupo.tip && <div style={{ fontSize: "11px", color: "#7a7269", marginTop: "10px", fontStyle: "italic" }}>💡 {grupo.tip}</div>}
                  </div>
                ))}
                {tripR.faltan?.length > 0 && (
                  <div className="card" style={{ marginBottom: "12px", borderColor: "rgba(192,57,43,.15)" }}>
                    <div style={{ fontSize: "9px", color: "#e74c3c", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "12px" }}>⚠ Te falta comprar</div>
                    {tripR.faltan?.map((item: any, i: number) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #141414" }}>
                        <div>
                          <div style={{ fontSize: "13px" }}>{item.name}</div>
                          <div style={{ fontSize: "11px", color: "#7a7269", marginTop: "2px" }}>{item.why}</div>
                        </div>
                        {item.urgente && <span style={{ fontSize: "9px", color: "#e74c3c", border: "1px solid rgba(192,57,43,.3)", padding: "3px 8px", borderRadius: "20px" }}>Urgente</span>}
                      </div>
                    ))}
                  </div>
                )}
                {tripR.consejo && (
                  <div style={{ background: "#0a0a0a", borderLeft: "2px solid rgba(196,151,63,.3)", padding: "14px", borderRadius: "0 2px 2px 0" }}>
                    <div style={{ fontSize: "9px", color: "#C4973F", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>✦ Consejo del estilista</div>
                    <div style={{ fontSize: "12px", color: "#7a7269", lineHeight: 1.8 }}>{tripR.consejo}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── ADVISOR ── */}
        {tab === "advisor" && (
          <div className="fade" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 175px)" }}>
            <div style={{ marginBottom: "16px" }}>
              <div className="serif" style={{ fontSize: "28px", fontWeight: 300 }}>Asesor de Estilo</div>
              <div style={{ fontSize: "10px", color: "#3a3632", marginTop: "3px" }}>Powered by Claude AI · Historial completo de conversación</div>
            </div>
            <div style={{ display: "flex", gap: "7px", overflowX: "auto", paddingBottom: "12px", marginBottom: "14px" }}>
              {suggestions.map((s) => (
                <button key={s} className="chip" onClick={() => sendChat(s)}>{s}</button>
              ))}
            </div>
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px", paddingBottom: "14px" }}>
              {msgs.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: "8px", alignItems: "flex-start" }}>
                  {m.role === "assistant" && <div style={{ fontSize: "12px", marginTop: "6px", flexShrink: 0, color: "#C4973F", fontFamily: "'Cormorant Garamond', serif" }}>✦</div>}
                  <div className={m.role === "user" ? "bubble-user" : "bubble-ai"}>
                    {m.role === "assistant" ? (
                      <div className="md-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(m.text) }} />
                    ) : m.text}
                  </div>
                </div>
              ))}
              {cload && (
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <div style={{ color: "#C4973F", fontSize: "12px", fontFamily: "'Cormorant Garamond', serif" }}>✦</div>
                  <div className="bubble-ai"><div style={{ display: "flex", gap: "5px", padding: "2px 0" }}><div className="dot" /><div className="dot" /><div className="dot" /></div></div>
                </div>
              )}
              <div ref={chatEnd} />
            </div>
            <div style={{ display: "flex", gap: "8px", paddingTop: "14px", borderTop: "1px solid #141414" }}>
              <input className="inp" style={{ flex: 1 }} placeholder="Pregunta sobre moda, outfits, dress codes, tendencias..." value={cin} onChange={(e) => setCin(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !cload && sendChat()} />
              <button className="btn-outline" style={{ flexShrink: 0 }} onClick={() => sendChat()} disabled={cload || !cin.trim()}>Enviar</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
