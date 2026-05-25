import { useState, useRef, useEffect } from "react";

// ─── CLAUDE AI HELPER (via Vercel proxy) ─────────────────────────────────────
const gemini = async (systemPrompt, userPrompt) => {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1200,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  const data = await res.json();
  return data.content?.map(i => i.text || "").join("") || "";
};

// ─── SUPABASE CONFIG ──────────────────────────────────────────────────────────
const SB_URL = "https://rnrzifixbecsvbnxavus.supabase.co";
const SB_KEY = "sb_publishable_M4XCdb1bVj86biRwJXubCQ_OQJA74UP";

// Supabase REST helpers
const sbFetch = async (path, options = {}) => {
  const token = localStorage.getItem("sb_token");
  const res = await fetch(`${SB_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "apikey": SB_KEY,
      "Authorization": `Bearer ${token || SB_KEY}`,
      "Prefer": "return=representation",
      ...(options.headers || {}),
    },
  });
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || res.statusText);
  }
  if (res.status === 204) return null;
  return res.json();
};

// Auth helpers
const sbSignUp = async (email, password) => {
  const res = await fetch(`${SB_URL}/auth/v1/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SB_KEY,
      "Authorization": `Bearer ${SB_KEY}`,
    },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

const sbSignIn = async (email, password) => {
  const res = await fetch(`${SB_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SB_KEY,
      "Authorization": `Bearer ${SB_KEY}`,
    },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

// DB helpers
const dbSelect = (table, query = "") => sbFetch(`/rest/v1/${table}?${query}`);
const dbInsert = (table, body) => sbFetch(`/rest/v1/${table}`, { method: "POST", body: JSON.stringify(body) });
const dbUpdate = (table, match, body) => sbFetch(`/rest/v1/${table}?${match}`, { method: "PATCH", body: JSON.stringify(body) });
const dbDelete = (table, match) => sbFetch(`/rest/v1/${table}?${match}`, { method: "DELETE" });

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const CATEGORIES = ["Tops","Pantalones","Vestidos","Zapatos","Accesorios","Abrigos"];
const SEASONS    = ["Primavera","Verano","Otoño","Invierno","Todo el año"];
const OCCASIONS  = ["Casual","Trabajo","Formal","Deportivo","Fiesta","Viaje"];
const EVENTS     = ["Trabajo / Oficina","Cita romántica","Reunión de negocios","Evento formal","Día casual","Fiesta / Antro","Deporte / Gym","Viaje"];
const CAT_EMOJI  = { Tops:"👕", Pantalones:"👖", Vestidos:"👗", Zapatos:"👟", Accesorios:"💍", Abrigos:"🧥" };
const BUDGETS    = [
  { label:"Económico",  desc:"Hasta $300 MXN / $15 USD", icon:"💚", value:"budget"  },
  { label:"Moderado",   desc:"$300–$1,000 MXN / $15–50 USD", icon:"💛", value:"mid" },
  { label:"Premium",    desc:"$1,000–$3,000 MXN / $50–150 USD", icon:"🧡", value:"premium" },
  { label:"Lujo",       desc:"$3,000+ MXN / $150+ USD", icon:"💜", value:"luxury"  },
];
const STORE_META = {
  "Zara":             { maps:true,  web:"https://www.zara.com" },
  "H&M":              { maps:true,  web:"https://www.hm.com" },
  "Mango":            { maps:true,  web:"https://www.mango.com" },
  "Shein":            { maps:false, web:"https://www.shein.com" },
  "ASOS":             { maps:false, web:"https://www.asos.com" },
  "Amazon":           { maps:false, web:"https://www.amazon.com", amazon:true },
  "Nordstrom":        { maps:true,  web:"https://www.nordstrom.com" },
  "Nike":             { maps:true,  web:"https://www.nike.com", amazon:true },
  "Adidas":           { maps:true,  web:"https://www.adidas.com", amazon:true },
  "Uniqlo":           { maps:true,  web:"https://www.uniqlo.com" },
  "Gap":              { maps:true,  web:"https://www.gap.com", amazon:true },
  "Primark":          { maps:true,  web:"https://www.primark.com" },
  "Pull&Bear":        { maps:true,  web:"https://www.pullandbear.com" },
  "Bershka":          { maps:true,  web:"https://www.bershka.com" },
  "Liverpool":        { maps:true,  web:"https://www.liverpool.com.mx" },
  "Palacio de Hierro":{ maps:true,  web:"https://www.elpalaciodehierro.com" },
  "Forever 21":       { maps:true,  web:"https://www.forever21.com" },
  "Stradivarius":     { maps:true,  web:"https://www.stradivarius.com" },
};

const mapsUrl  = (s, lat, lng) => lat ? `https://www.google.com/maps/search/${encodeURIComponent(s)}/@${lat},${lng},14z` : `https://www.google.com/maps/search/${encodeURIComponent(s)}`;
const amazonUrl = (item) => `https://www.amazon.com/s?k=${encodeURIComponent(item)}`;

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#b8965a;border-radius:2px}
.sv{font-family:'DM Sans',sans-serif;background:#060606;min-height:100vh;color:#ede9e0}
.pf{font-family:'Playfair Display',serif}
.gold{color:#b8965a}
.btn-g{background:linear-gradient(135deg,#c9a96e,#8a6d38);color:#060606;border:none;padding:12px 24px;border-radius:2px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;transition:all .3s;width:100%}
.btn-g:hover{filter:brightness(1.12);transform:translateY(-1px);box-shadow:0 8px 28px rgba(184,150,90,.35)}
.btn-g:disabled{opacity:.35;cursor:not-allowed;transform:none;box-shadow:none}
.btn-o{background:transparent;color:#b8965a;border:1px solid #b8965a44;padding:9px 20px;border-radius:2px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;transition:all .25s}
.btn-o:hover{border-color:#b8965a;background:#b8965a0d}
.btn-o:disabled{opacity:.3;cursor:not-allowed}
.btn-d{background:#7f1d1d22;color:#f87171;border:1px solid #7f1d1d44;padding:7px 14px;border-radius:2px;cursor:pointer;font-size:11px;font-family:'DM Sans',sans-serif;letter-spacing:1px;transition:all .2s}
.btn-d:hover{background:#7f1d1d44}
.btn-ok{background:#14532d22;color:#4ade80;border:1px solid #14532d44;padding:7px 14px;border-radius:2px;cursor:pointer;font-size:11px;font-family:'DM Sans',sans-serif;letter-spacing:1px;transition:all .2s}
.btn-ok:hover{background:#14532d44}
.inp{background:#0f0f0f;border:1px solid #1e1e1e;color:#ede9e0;padding:12px 14px;border-radius:2px;font-family:'DM Sans',sans-serif;font-size:13px;width:100%;outline:none;transition:border .25s}
.inp:focus{border-color:#b8965a55}
.inp::placeholder{color:#333}
.sel{background:#0f0f0f;border:1px solid #1e1e1e;color:#ede9e0;padding:12px 14px;border-radius:2px;font-family:'DM Sans',sans-serif;font-size:13px;width:100%;cursor:pointer;outline:none}
.card{background:#0d0d0d;border:1px solid #181818;border-radius:4px;padding:18px;transition:border .25s}
.card:hover{border-color:#b8965a1a}
.pill{padding:6px 14px;border-radius:20px;font-family:'DM Sans',sans-serif;font-size:11px;letter-spacing:1px;cursor:pointer;border:1px solid #1e1e1e;background:transparent;color:#555;transition:all .2s;white-space:nowrap}
.pill.on{background:#b8965a;color:#060606;border-color:#b8965a;font-weight:600}
.pill:hover:not(.on){border-color:#b8965a44;color:#b8965a88}
.tab{color:#444;border-bottom:2px solid transparent;cursor:pointer;padding:13px 0;font-family:'DM Sans',sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;transition:all .25s;background:none;border-left:none;border-right:none;border-top:none;flex:1;min-width:0}
.tab.on{color:#b8965a;border-bottom-color:#b8965a}
.cu{background:#b8965a1a;border:1px solid #b8965a2a;border-radius:14px 14px 2px 14px;padding:10px 15px;max-width:78%;margin-left:auto;font-size:13px;line-height:1.6}
.ca{background:#111;border:1px solid #1e1e1e;border-radius:14px 14px 14px 2px;padding:10px 15px;max-width:86%;font-size:13px;line-height:1.65;color:#bbb}
.dot{width:6px;height:6px;border-radius:50%;background:#b8965a;animation:bop 1.1s infinite}
.dot:nth-child(2){animation-delay:.18s}.dot:nth-child(3){animation-delay:.36s}
@keyframes bop{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-7px)}}
.divider{height:1px;background:linear-gradient(90deg,transparent,#b8965a2a,transparent);margin:18px 0}
.fade{animation:fu .35s ease}
@keyframes fu{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.pbox{width:100%;aspect-ratio:1;border:2px dashed #222;border-radius:4px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;transition:border .2s;overflow:hidden;position:relative;background:#0a0a0a}
.pbox:hover{border-color:#b8965a44}
.sb-a{padding:3px 9px;border-radius:20px;font-size:9px;letter-spacing:1.2px;background:#14532d22;color:#4ade80;border:1px solid #14532d44}
.sb-b{padding:3px 9px;border-radius:20px;font-size:9px;letter-spacing:1.2px;background:#7f1d1d22;color:#f87171;border:1px solid #7f1d1d44}
.sb-p{padding:3px 9px;border-radius:20px;font-size:9px;letter-spacing:1.2px;background:#78350f22;color:#fb923c;border:1px solid #78350f44}
.sb-ad{padding:3px 9px;border-radius:20px;font-size:9px;letter-spacing:1.2px;background:#1e3a5f22;color:#60a5fa;border:1px solid #1e3a5f44}
.loc-bar{background:#0d1a0d;border:1px solid #14532d33;border-radius:4px;padding:11px 14px;display:flex;align-items:center;gap:10px;margin-bottom:14px}
.loc-err{background:#1a0d0d;border-color:#7f1d1d33}
.st-row{background:#0a0a0a;border:1px solid #181818;border-radius:4px;padding:10px 12px;margin-bottom:6px}
.lnk{display:inline-flex;align-items:center;gap:4px;padding:5px 10px;border-radius:2px;font-size:10px;letter-spacing:1px;text-transform:uppercase;font-family:'DM Sans',sans-serif;font-weight:500;cursor:pointer;text-decoration:none;transition:all .2s}
.lnk-m{background:#0d1f0d;color:#4ade80;border:1px solid #14532d44}.lnk-m:hover{background:#14532d33}
.lnk-a{background:#1f1200;color:#fb923c;border:1px solid #92400e44}.lnk-a:hover{background:#92400e33}
.lnk-w{background:#0d0d1f;color:#818cf8;border:1px solid #3730a344}.lnk-w:hover{background:#3730a333}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1a1a1a;border:1px solid #b8965a44;color:#ede9e0;padding:10px 20px;border-radius:3px;font-size:12px;font-family:'DM Sans',sans-serif;letter-spacing:1px;z-index:999;animation:fu .3s ease}
.stat{background:#0a0a0a;border:1px solid #161616;border-radius:4px;padding:16px;text-align:center}
.pulse{animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}
`;

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function StyleVault() {
  const [screen, setScreen]     = useState("login");
  const [profile, setProfile]   = useState(null);
  const [lf, setLf]             = useState({ name:"", email:"", password:"" });
  const [lmode, setLmode]       = useState("login");
  const [lerr, setLerr]         = useState("");
  const [aloading, setAL]       = useState(false);

  const [tab, setTab]           = useState("wardrobe");
  const [clothes, setClothes]   = useState([]);
  const [fc, setFc]             = useState("Todo");
  const [showForm, setSF]       = useState(false);
  const [ni, setNi]             = useState({ name:"", category:"Tops", color:"#b8965a", season:"", occasion:"" });
  const [pp, setPp]             = useState(null);
  const [pfile, setPfile]       = useState(null);
  const [cloading, setCL]       = useState(false);

  const [selEv, setSelEv]       = useState("");
  const [selSe, setSelSe]       = useState("Todo el año");
  const [outfitR, setOR]        = useState(null);
  const [outfitL, setOL]        = useState(false);

  const [msgs, setMsgs]         = useState([{ role:"assistant", text:"¡Hola! Soy tu asesor de estilo con IA. ¿En qué puedo ayudarte?" }]);
  const [cin, setCin]           = useState("");
  const [cload, setCload]       = useState(false);
  const chatEnd                 = useRef(null);

  const [budget, setBudget]     = useState("");
  const [shopCat, setShopCat]   = useState("");
  const [shopSt, setShopSt]     = useState("");
  const [shopR, setShopR]       = useState(null);
  const [shopL, setShopL]       = useState(false);
  const [loc, setLoc]           = useState(null);
  const [locSt, setLocSt]       = useState("idle");
  const [locErr, setLocErr]     = useState("");

  const [adminTab, setAT]       = useState("overview");
  const [allUsers, setAllU]     = useState([]);
  const [adminL, setAdminL]     = useState(false);

  const [toast, setToast]       = useState("");
  const fileRef = useRef(null);
  const camRef  = useRef(null);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(""), 2800); };

  // Check saved session
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
      if (auth.error || !auth.access_token) {
        setLerr(auth.error?.message || "Correo o contraseña incorrectos.");
        setAL(false); return;
      }
      localStorage.setItem("sb_token", auth.access_token);
      // Buscar perfil usando el token de sesión
      const res = await fetch(`${SB_URL}/rest/v1/users?email=eq.${encodeURIComponent(lf.email)}&limit=1`, {
        headers: {
          "apikey": SB_KEY,
          "Authorization": `Bearer ${auth.access_token}`,
          "Content-Type": "application/json",
        }
      });
      const users = await res.json();
      if (!users || users.length === 0) { setLerr("Perfil no encontrado."); setAL(false); return; }
      const p = users[0];
      if (p.status === "blocked") { setLerr("Tu cuenta está bloqueada. Contacta soporte."); setAL(false); return; }
      // Actualizar last_login
      await fetch(`${SB_URL}/rest/v1/users?id=eq.${p.id}`, {
        method: "PATCH",
        headers: { "apikey": SB_KEY, "Authorization": `Bearer ${auth.access_token}`, "Content-Type": "application/json", "Prefer": "return=minimal" },
        body: JSON.stringify({ last_login: new Date().toISOString() })
      });
      localStorage.setItem("sb_profile", JSON.stringify(p));
      setProfile(p);
      setScreen(p.plan === "Admin" ? "admin" : "app");
    } catch (e) { setLerr("Error de conexión. Intenta de nuevo."); }
    setAL(false);
  };

  const handleForgotPassword = async () => {
    setLerr("");
    if (!lf.email) { setLerr("Escribe tu correo primero."); return; }
    setAL(true);
    try {
      const res = await fetch(`${SB_URL}/auth/v1/recover`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SB_KEY,
          "Authorization": `Bearer ${SB_KEY}`,
        },
        body: JSON.stringify({ email: lf.email }),
      });
      if (res.ok) {
        setLerr("✅ Te enviamos un correo para recuperar tu contraseña.");
      } else {
        setLerr("Error al enviar el correo. Intenta de nuevo.");
      }
    } catch { setLerr("Error de conexión."); }
    setAL(false);
  };
    setLerr(""); setAL(true);
    if (!lf.name || !lf.email || !lf.password) { setLerr("Completa todos los campos."); setAL(false); return; }
    try {
      const auth = await sbSignUp(lf.email, lf.password);
      if (auth.error) { setLerr(auth.error.message || "Error al registrar."); setAL(false); return; }
      localStorage.setItem("sb_token", auth.access_token || SB_KEY);
      const newProfile = { id: auth.user?.id, name: lf.name, email: lf.email, plan: "Basic", status: "active", created_at: new Date().toISOString(), last_login: new Date().toISOString() };
      await dbInsert("users", newProfile);
      localStorage.setItem("sb_profile", JSON.stringify(newProfile));
      setProfile(newProfile);
      setScreen("app");
      showToast("✦ Bienvenido a StyleVault");
    } catch (e) { setLerr("Error al crear cuenta. Intenta de nuevo."); }
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
    try {
      const data = await dbSelect("clothes", `user_id=eq.${profile.id}&order=created_at.desc`);
      if (data) setClothes(data);
    } catch {}
    setCL(false);
  };

  const handlePhoto = (e) => {
    const f = e.target.files[0]; if (!f) return;
    setPfile(f);
    const r = new FileReader();
    r.onload = (ev) => setPp(ev.target.result);
    r.readAsDataURL(f);
  };

  const addItem = async () => {
    if (!ni.name) return;
    try {
      const inserted = await dbInsert("clothes", { user_id: profile.id, ...ni, photo_url: pp });
      if (inserted && inserted[0]) setClothes([inserted[0], ...clothes]);
      else setClothes([{ id: Date.now(), user_id: profile.id, ...ni, photo_url: pp }, ...clothes]);
      setNi({ name:"", category:"Tops", color:"#b8965a", season:"", occasion:"" });
      setPp(null); setPfile(null); setSF(false);
      showToast("✦ Prenda guardada");
    } catch { showToast("Error al guardar. Intenta de nuevo."); }
  };

  const removeItem = async (id) => {
    try { await dbDelete("clothes", `id=eq.${id}`); } catch {}
    setClothes(clothes.filter(c => c.id !== id));
    showToast("Prenda eliminada");
  };

  // ── OUTFIT ────────────────────────────────────────────────────────────────
  const generateOutfit = async () => {
    if (!selEv) return;
    setOL(true); setOR(null);
    const list = clothes.map(c => `${c.name} (${c.category}, ${c.occasion})`).join("\n");
    try {
      const raw = await gemini(
        "Eres experto asesor de moda. Responde SOLO en JSON válido sin markdown ni backticks. JSON con: outfit (array: emoji, name, why), explanation (string reglas moda).",
        `Armario:\n${list}\n\nEvento: ${selEv}\nTemporada: ${selSe}\n\nCrea el outfit ideal y explica las reglas de moda.`
      );
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setOR(parsed);
      try { await dbInsert("outfits", { user_id: profile.id, event: selEv, season: selSe, items: parsed.outfit, explanation: parsed.explanation }); } catch {}
      showToast("✦ Outfit guardado");
    } catch { setOR({ outfit:[], explanation:"Error al generar. Intenta de nuevo." }); }
    setOL(false);
  };

  // ── CHAT ──────────────────────────────────────────────────────────────────
  const sendChat = async (msg) => {
    const m = msg || cin; if (!m.trim()) return;
    const next = [...msgs, { role:"user", text:m }];
    setMsgs(next); setCin(""); setCload(true);
    try {
      const historial = next.map(x => `${x.role === "assistant" ? "Asesor" : "Usuario"}: ${x.text}`).join("\n");
      const reply = await gemini(
        "Eres StyleVault, asesor de moda experto y sofisticado. Explicas reglas de moda, colores, siluetas, dress codes. Siempre responde en español. Responde solo como asesor, sin prefijos.",
        historial
      );
      setMsgs([...next, { role:"assistant", text: reply }]);
    } catch { setMsgs([...next, { role:"assistant", text:"Error de conexión." }]); }
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
        } catch { setLoc({ lat, lng, city:"tu zona", country:"" }); setLocSt("ok"); }
      },
      (e) => { setLocSt("err"); setLocErr(e.code===1?"Permiso denegado.":"No se pudo obtener ubicación."); },
      { timeout:10000 }
    );
  };

  // ── SHOP ──────────────────────────────────────────────────────────────────
  const searchShop = async () => {
    if (!budget || !shopCat) return;
    setShopL(true); setShopR(null);
    const bLabel = BUDGETS.find(b=>b.value===budget)?.label || budget;
    const locCtx = loc ? `en ${loc.city}, ${loc.country}` : "globalmente";
    try {
      const raw = await gemini(
        "Eres experto en moda y retail global. Responde SOLO en JSON válido sin markdown ni backticks. JSON: intro (string), items (array: name, description, priceRange, stores (array strings), hasAmazon (boolean), tip, why).",
        `Recomienda ropa "${shopCat}" con presupuesto ${bLabel} ${locCtx}${shopSt?`, estilo ${shopSt}`:""}.  Usa tiendas reales: Zara, H&M, Mango, Shein, ASOS, Amazon, Nike, Adidas, Uniqlo, Gap, Primark, Pull&Bear, Bershka, Liverpool, Palacio de Hierro. Precios realistas en USD y moneda local.`
      );
      setShopR(JSON.parse(raw.replace(/```json|```/g,"").trim()));
    } catch { setShopR({ intro:"Error al buscar.", items:[] }); }
    setShopL(false);
  };

  // ── ADMIN ─────────────────────────────────────────────────────────────────
  useEffect(() => { if (screen === "admin") loadAdminUsers(); }, [screen]);

  const loadAdminUsers = async () => {
    setAdminL(true);
    try { const d = await dbSelect("users", "order=created_at.desc"); if (d) setAllU(d); } catch {}
    setAdminL(false);
  };

  const toggleBlock = async (u) => {
    const ns = u.status === "blocked" ? "active" : "blocked";
    try { await dbUpdate("users", `id=eq.${u.id}`, { status: ns }); } catch {}
    setAllU(allUsers.map(x => x.id===u.id ? { ...x, status:ns } : x));
    showToast(ns==="blocked" ? "Usuario bloqueado" : "Usuario desbloqueado");
  };

  const cancelPlan = async (u) => {
    try { await dbUpdate("users", `id=eq.${u.id}`, { plan:"Basic" }); } catch {}
    setAllU(allUsers.map(x => x.id===u.id ? { ...x, plan:"Basic" } : x));
    showToast("Plan cancelado");
  };

  const filtered  = clothes.filter(c => fc==="Todo" || c.category===fc);
  const premiums  = allUsers.filter(u => u.plan==="Premium");
  const actives   = allUsers.filter(u => u.status==="active" && u.plan!=="Admin");
  const blocked   = allUsers.filter(u => u.status==="blocked");

  // ══════════════════════════════════════════════════════════════════════════
  // LOGIN
  if (screen === "login") return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background:"#060606", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <style>{CSS}</style>
      <div style={{ width:"100%", maxWidth:"380px" }}>
        <div style={{ textAlign:"center", marginBottom:"40px" }}>
          <div className="pf" style={{ fontSize:"38px", letterSpacing:"8px", color:"#b8965a" }}>STYLE<i>VAULT</i></div>
          <div style={{ fontSize:"9px", letterSpacing:"5px", color:"#2a2a2a", marginTop:"6px" }}>ARMARIO INTELIGENTE CON IA</div>
        </div>
        <div className="card" style={{ padding:"28px" }}>
          <div style={{ display:"flex", marginBottom:"24px", borderBottom:"1px solid #161616" }}>
            {["login","register"].map(m => (
              <button key={m} onClick={() => { setLmode(m); setLerr(""); }} style={{ flex:1, padding:"10px", background:"none", border:"none", borderBottom:`2px solid ${lmode===m?"#b8965a":"transparent"}`, color:lmode===m?"#b8965a":"#3a3a3a", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:"11px", letterSpacing:"2px", textTransform:"uppercase", transition:"all .2s" }}>
                {m==="login" ? "Iniciar Sesión" : "Registrarse"}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:"11px" }}>
            {lmode==="register" && <input className="inp" placeholder="Tu nombre completo" value={lf.name} onChange={e=>setLf(p=>({...p,name:e.target.value}))} />}
            <input className="inp" placeholder="Correo electrónico" type="email" value={lf.email} onChange={e=>setLf(p=>({...p,email:e.target.value}))} />
            <input className="inp" placeholder="Contraseña" type="password" value={lf.password} onChange={e=>setLf(p=>({...p,password:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&(lmode==="login"?handleLogin():handleRegister())} />
            {lerr && <div style={{ color: lerr.startsWith("✅") ? "#4ade80" : "#f87171", fontSize:"12px", textAlign:"center", lineHeight:1.5 }}>{lerr}</div>}
            <button className="btn-g" style={{ marginTop:"4px" }} onClick={lmode==="login"?handleLogin:handleRegister} disabled={aloading}>
              {aloading ? "..." : `✦ ${lmode==="login"?"Entrar":"Crear Cuenta"}`}
            </button>
            {lmode==="login" && (
              <button onClick={handleForgotPassword} disabled={aloading} style={{ background:"none", border:"none", color:"#555", fontSize:"11px", cursor:"pointer", letterSpacing:"1px", fontFamily:"'DM Sans',sans-serif", textDecoration:"underline", textAlign:"center" }}>
                ¿Olvidaste tu contraseña?
              </button>
            )}
          </div>
          <div className="divider"/>
          <div style={{ fontSize:"10px", color:"#1e1e1e", textAlign:"center", letterSpacing:"1px", lineHeight:1.9 }}>
            Admin: <span style={{ color:"#60a5fa55" }}>admin@stylevault.com</span>
          </div>
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // ADMIN
  if (screen === "admin") return (
    <div className="sv fade">
      <style>{CSS}</style>
      {toast && <div className="toast">{toast}</div>}
      <header style={{ padding:"12px 16px", borderBottom:"1px solid #141414", display:"flex", justifyContent:"space-between", alignItems:"center", background:"#080808", position:"sticky", top:0, zIndex:50 }}>
        <div>
          <div className="pf" style={{ fontSize:"18px", letterSpacing:"5px", color:"#b8965a" }}>STYLE<i>VAULT</i></div>
          <div style={{ fontSize:"9px", color:"#60a5fa", letterSpacing:"3px", marginTop:"1px" }}>PANEL ADMIN</div>
        </div>
        <button className="btn-o" style={{ fontSize:"10px", padding:"6px 12px" }} onClick={handleLogout}>Salir</button>
      </header>
      <nav style={{ display:"flex", borderBottom:"1px solid #141414", padding:"0 8px", background:"#080808", overflowX:"auto" }}>
        {[["overview","📊 Resumen"],["users","👥 Usuarios"],["subscriptions","💳 Suscripciones"]].map(([k,l]) => (
          <button key={k} className={`tab ${adminTab===k?"on":""}`} style={{ padding:"13px 14px", flex:"unset", minWidth:"fit-content" }} onClick={()=>setAT(k)}>{l}</button>
        ))}
      </nav>
      <main style={{ padding:"16px 14px", maxWidth:"680px", margin:"0 auto" }}>
        {adminL ? <div style={{ display:"flex", justifyContent:"center", gap:"5px", padding:"40px" }}><div className="dot"/><div className="dot"/><div className="dot"/></div> : (
          <>
            {adminTab==="overview" && (
              <div className="fade">
                <div className="pf" style={{ fontSize:"22px", marginBottom:"18px" }}>Panel de Control</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"18px" }}>
                  {[{ label:"Activos", value:actives.length, color:"#4ade80" },{ label:"Premium", value:premiums.length, color:"#b8965a" },{ label:"Bloqueados", value:blocked.length, color:"#f87171" },{ label:"Ingresos/mes", value:`$${(premiums.length*299).toLocaleString()} MXN`, color:"#60a5fa" }].map(s => (
                    <div key={s.label} className="stat">
                      <div className="pf" style={{ fontSize:"26px", color:s.color, marginBottom:"4px" }}>{s.value}</div>
                      <div style={{ fontSize:"9px", color:"#3a3a3a", letterSpacing:"1.5px", textTransform:"uppercase" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <div style={{ fontSize:"10px", color:"#b8965a", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"14px" }}>✦ Usuarios Recientes</div>
                  {allUsers.filter(u=>u.plan!=="Admin").slice(0,5).map(u => (
                    <div key={u.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid #111" }}>
                      <div><div style={{ fontSize:"13px" }}>{u.name}</div><div style={{ fontSize:"10px", color:"#333", marginTop:"2px" }}>{u.email}</div></div>
                      <div style={{ display:"flex", gap:"5px" }}>
                        <span className={u.plan==="Premium"?"sb-p":"sb-a"}>{u.plan}</span>
                        <span className={u.status==="blocked"?"sb-b":"sb-a"}>{u.status==="active"?"ACTIVO":"BLOQ."}</span>
                      </div>
                    </div>
                  ))}
                  {allUsers.length===0 && <div style={{ fontSize:"12px", color:"#2a2a2a", textAlign:"center", padding:"20px" }}>Sin usuarios aún</div>}
                </div>
              </div>
            )}
            {adminTab==="users" && (
              <div className="fade">
                <div className="pf" style={{ fontSize:"22px", marginBottom:"18px" }}>Gestión de Usuarios</div>
                {allUsers.filter(u=>u.plan!=="Admin").length===0 && <div style={{ textAlign:"center", padding:"40px", color:"#2a2a2a", fontSize:"13px" }}>Sin usuarios aún.</div>}
                <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                  {allUsers.filter(u=>u.plan!=="Admin").map(u => (
                    <div key={u.id} className="card" style={{ padding:"14px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"10px" }}>
                        <div><div style={{ fontSize:"14px", fontWeight:500 }}>{u.name}</div><div style={{ fontSize:"11px", color:"#333", marginTop:"2px" }}>{u.email}</div></div>
                        <div style={{ display:"flex", gap:"5px", flexWrap:"wrap", justifyContent:"flex-end" }}>
                          <span className={u.plan==="Premium"?"sb-p":"sb-a"}>{u.plan}</span>
                          <span className={u.status==="blocked"?"sb-b":"sb-a"}>{u.status==="active"?"ACTIVO":"BLOQ."}</span>
                        </div>
                      </div>
                      <div style={{ fontSize:"10px", color:"#333", marginBottom:"12px" }}>Registrado: {u.created_at?.split("T")[0]}</div>
                      <div style={{ display:"flex", gap:"8px" }}>
                        <button className={u.status==="blocked"?"btn-ok":"btn-d"} onClick={()=>toggleBlock(u)}>{u.status==="blocked"?"🔓 Desbloquear":"🔒 Bloquear"}</button>
                        {u.plan==="Premium" && <button className="btn-d" onClick={()=>cancelPlan(u)}>❌ Cancelar Plan</button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {adminTab==="subscriptions" && (
              <div className="fade">
                <div className="pf" style={{ fontSize:"22px", marginBottom:"18px" }}>Suscripciones</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"18px" }}>
                  <div className="stat" style={{ borderColor:"#b8965a22" }}>
                    <div style={{ fontSize:"10px", color:"#b8965a", letterSpacing:"2px", marginBottom:"8px" }}>PREMIUM</div>
                    <div className="pf" style={{ fontSize:"28px", color:"#b8965a" }}>{premiums.length}</div>
                    <div style={{ fontSize:"10px", color:"#333", marginTop:"4px" }}>$299 MXN/mes c/u</div>
                  </div>
                  <div className="stat">
                    <div style={{ fontSize:"10px", color:"#4ade80", letterSpacing:"2px", marginBottom:"8px" }}>INGRESOS</div>
                    <div className="pf" style={{ fontSize:"24px", color:"#4ade80" }}>${(premiums.length*299).toLocaleString()}</div>
                    <div style={{ fontSize:"10px", color:"#333", marginTop:"4px" }}>MXN este mes</div>
                  </div>
                </div>
                <div className="card">
                  <div style={{ fontSize:"10px", color:"#b8965a", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"14px" }}>✦ Detalle</div>
                  {allUsers.filter(u=>u.plan!=="Admin").map(u => (
                    <div key={u.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 0", borderBottom:"1px solid #111" }}>
                      <div><div style={{ fontSize:"13px" }}>{u.name}</div><div style={{ fontSize:"10px", color:"#333", marginTop:"2px" }}>{u.email}</div></div>
                      <div style={{ textAlign:"right" }}>
                        <span className={u.plan==="Premium"?"sb-p":"sb-a"}>{u.plan}</span>
                        <div style={{ fontSize:"10px", color:"#333", marginTop:"4px" }}>{u.plan==="Premium"?"$299 MXN/mes":"Gratis"}</div>
                      </div>
                    </div>
                  ))}
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
      <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handlePhoto} />
      <input ref={camRef} type="file" accept="image/*" capture="environment" style={{ display:"none" }} onChange={handlePhoto} />

      <header style={{ padding:"11px 14px", borderBottom:"1px solid #141414", display:"flex", justifyContent:"space-between", alignItems:"center", background:"#080808", position:"sticky", top:0, zIndex:50 }}>
        <div>
          <div className="pf" style={{ fontSize:"19px", letterSpacing:"5px", color:"#b8965a" }}>STYLE<i>VAULT</i></div>
          <div style={{ fontSize:"9px", letterSpacing:"3px", color:"#2a2a2a", marginTop:"1px" }}>ARMARIO INTELIGENTE</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:"12px" }}>{profile?.name?.split(" ")[0]}</div>
            <div style={{ fontSize:"9px", color:"#b8965a77", letterSpacing:"1px" }}>{profile?.plan}</div>
          </div>
          <button className="btn-o" style={{ fontSize:"10px", padding:"6px 11px" }} onClick={handleLogout}>Salir</button>
        </div>
      </header>

      <nav style={{ display:"flex", borderBottom:"1px solid #141414", padding:"0 4px", background:"#080808", overflowX:"auto" }}>
        {[["wardrobe","👗 Armario"],["outfit","✦ Outfit"],["shop","🛍 Tiendas"],["advisor","💬 Asesor"]].map(([k,l]) => (
          <button key={k} className={`tab ${tab===k?"on":""}`} onClick={()=>setTab(k)}>{l}</button>
        ))}
      </nav>

      <main style={{ flex:1, overflowY:"auto", padding:"16px 13px", maxWidth:"620px", width:"100%", margin:"0 auto" }}>

        {/* WARDROBE */}
        {tab==="wardrobe" && (
          <div className="fade">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
              <div className="pf" style={{ fontSize:"22px" }}>Mi Armario</div>
              <button className="btn-o" onClick={()=>setSF(!showForm)}>+ Agregar</button>
            </div>
            {showForm && (
              <div className="card fade" style={{ marginBottom:"16px" }}>
                <div style={{ marginBottom:"12px" }}>
                  <div className="pbox" style={{ height:"150px" }} onClick={()=>fileRef.current?.click()}>
                    {pp ? <img src={pp} alt="preview" style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : (
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", color:"#2a2a2a" }}>
                        <div style={{ fontSize:"28px" }}>📷</div>
                        <div style={{ fontSize:"11px", letterSpacing:"1px" }}>Toca para agregar foto</div>
                      </div>
                    )}
                  </div>
                  <div style={{ display:"flex", gap:"7px", marginTop:"7px" }}>
                    <button className="btn-o" style={{ flex:1, padding:"8px" }} onClick={()=>fileRef.current?.click()}>📁 Galería</button>
                    <button className="btn-o" style={{ flex:1, padding:"8px" }} onClick={()=>camRef.current?.click()}>📷 Cámara</button>
                    {pp && <button className="btn-o" style={{ padding:"8px 11px" }} onClick={()=>{ setPp(null); setPfile(null); }}>✕</button>}
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:"9px" }}>
                  <input className="inp" placeholder="Nombre de la prenda" value={ni.name} onChange={e=>setNi(p=>({...p,name:e.target.value}))} />
                  <select className="sel" value={ni.category} onChange={e=>setNi(p=>({...p,category:e.target.value}))}>
                    {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                  </select>
                  <div style={{ display:"flex", gap:"9px", alignItems:"center" }}>
                    <input type="color" value={ni.color} onChange={e=>setNi(p=>({...p,color:e.target.value}))} style={{ width:"42px", height:"42px", border:"1px solid #1e1e1e", borderRadius:"2px", background:"none", cursor:"pointer", padding:"2px" }} />
                    <span style={{ fontSize:"12px", color:"#333" }}>Color principal</span>
                  </div>
                  <select className="sel" value={ni.season} onChange={e=>setNi(p=>({...p,season:e.target.value}))}>
                    <option value="">Temporada</option>{SEASONS.map(s=><option key={s}>{s}</option>)}
                  </select>
                  <select className="sel" value={ni.occasion} onChange={e=>setNi(p=>({...p,occasion:e.target.value}))}>
                    <option value="">Ocasión</option>{OCCASIONS.map(o=><option key={o}>{o}</option>)}
                  </select>
                  <div style={{ display:"flex", gap:"8px", marginTop:"4px" }}>
                    <button className="btn-g" onClick={addItem} style={{ flex:1 }}>Guardar Prenda</button>
                    <button className="btn-o" onClick={()=>{ setSF(false); setPp(null); setPfile(null); }}>Cancelar</button>
                  </div>
                </div>
              </div>
            )}
            <div style={{ display:"flex", gap:"7px", overflowX:"auto", paddingBottom:"10px", marginBottom:"14px" }}>
              {["Todo",...CATEGORIES].map(c=><button key={c} className={`pill ${fc===c?"on":""}`} onClick={()=>setFc(c)}>{c}</button>)}
            </div>
            {cloading ? (
              <div style={{ display:"flex", justifyContent:"center", gap:"5px", padding:"40px" }}><div className="dot"/><div className="dot"/><div className="dot"/></div>
            ) : filtered.length===0 ? (
              <div style={{ textAlign:"center", padding:"60px 20px", color:"#1e1e1e", fontSize:"13px" }}>
                {clothes.length===0 ? "Tu armario está vacío. ¡Agrega tu primera prenda!" : "No hay prendas en esta categoría."}
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"11px" }}>
                {filtered.map(item => (
                  <div key={item.id} className="card" style={{ padding:0, overflow:"hidden", position:"relative" }}>
                    <button onClick={()=>removeItem(item.id)} style={{ position:"absolute", top:"7px", right:"7px", zIndex:2, background:"#000000bb", border:"none", color:"#888", cursor:"pointer", fontSize:"11px", width:"20px", height:"20px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                    {item.photo_url ? (
                      <div style={{ width:"100%", aspectRatio:"1", overflow:"hidden" }}>
                        <img src={item.photo_url} alt={item.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                      </div>
                    ) : (
                      <div style={{ width:"100%", aspectRatio:"1", background:"#0f0f0f", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"8px" }}>
                        <div style={{ width:"28px", height:"28px", borderRadius:"50%", background:item.color||"#b8965a", border:"2px solid #1e1e1e" }} />
                        <div style={{ fontSize:"28px" }}>{CAT_EMOJI[item.category]||"👔"}</div>
                      </div>
                    )}
                    <div style={{ padding:"9px 11px" }}>
                      <div style={{ fontSize:"12px", fontWeight:500, lineHeight:1.3, marginBottom:"3px" }}>{item.name}</div>
                      <div style={{ fontSize:"10px", color:"#333", letterSpacing:"1px" }}>{item.category}</div>
                      {item.occasion && <div style={{ fontSize:"10px", color:"#b8965a66", marginTop:"3px" }}>{item.occasion}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* OUTFIT */}
        {tab==="outfit" && (
          <div className="fade">
            <div className="pf" style={{ fontSize:"22px", marginBottom:"18px" }}>Outfit del Día</div>
            {clothes.length===0 ? <div style={{ textAlign:"center", padding:"60px 20px", color:"#1e1e1e", fontSize:"13px" }}>Agrega ropa a tu armario primero.</div> : (
              <>
                <div className="card" style={{ marginBottom:"13px" }}>
                  <div style={{ fontSize:"10px", color:"#444", letterSpacing:"2.5px", textTransform:"uppercase", marginBottom:"11px" }}>¿Para qué evento?</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"7px" }}>
                    {EVENTS.map(ev=><button key={ev} onClick={()=>setSelEv(ev)} style={{ padding:"9px 7px", background:selEv===ev?"#b8965a":"#0f0f0f", color:selEv===ev?"#060606":"#555", border:`1px solid ${selEv===ev?"#b8965a":"#1a1a1a"}`, borderRadius:"2px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:"11px", transition:"all .2s", textAlign:"left" }}>{ev}</button>)}
                  </div>
                </div>
                <div className="card" style={{ marginBottom:"16px" }}>
                  <div style={{ fontSize:"10px", color:"#444", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"10px" }}>Temporada</div>
                  <div style={{ display:"flex", gap:"7px", flexWrap:"wrap" }}>
                    {SEASONS.map(s=><button key={s} className={`pill ${selSe===s?"on":""}`} onClick={()=>setSelSe(s)}>{s}</button>)}
                  </div>
                </div>
                <button className="btn-g" onClick={generateOutfit} disabled={!selEv||outfitL} style={{ marginBottom:"18px" }}>
                  {outfitL?"Creando outfit...":"✦ Generar Outfit con IA"}
                </button>
                {outfitL && <div style={{ display:"flex", justifyContent:"center", gap:"5px", padding:"20px" }}><div className="dot"/><div className="dot"/><div className="dot"/></div>}
                {outfitR && !outfitL && (
                  <div className="fade">
                    <div className="divider"/>
                    <div style={{ fontSize:"10px", color:"#b8965a", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"13px" }}>✦ Tu Outfit</div>
                    <div style={{ display:"flex", flexDirection:"column", gap:"9px", marginBottom:"16px" }}>
                      {outfitR.outfit?.map((item,i)=>(
                        <div key={i} style={{ display:"flex", gap:"11px", padding:"12px", background:"#0d0d0d", border:"1px solid #181818", borderRadius:"4px" }}>
                          <div style={{ fontSize:"24px", minWidth:"32px", textAlign:"center" }}>{item.emoji}</div>
                          <div><div style={{ fontSize:"13px", fontWeight:500, marginBottom:"4px" }}>{item.name}</div><div style={{ fontSize:"11px", color:"#555", lineHeight:1.5 }}>{item.why}</div></div>
                        </div>
                      ))}
                    </div>
                    {outfitR.explanation && (
                      <div style={{ background:"#0a0a0a", borderLeft:"3px solid #b8965a", padding:"14px", borderRadius:"0 4px 4px 0" }}>
                        <div style={{ fontSize:"10px", color:"#b8965a", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"7px" }}>✦ Por qué funciona</div>
                        <div style={{ fontSize:"13px", color:"#888", lineHeight:1.7 }}>{outfitR.explanation}</div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* SHOP */}
        {tab==="shop" && (
          <div className="fade">
            <div className="pf" style={{ fontSize:"22px", marginBottom:"6px" }}>Dónde Comprar</div>
            <div style={{ fontSize:"12px", color:"#333", marginBottom:"16px", lineHeight:1.5 }}>Recomendaciones con links a Google Maps, Amazon y tiendas de marca.</div>
            <div className={`loc-bar ${locSt==="err"?"loc-err":""}`}>
              <div style={{ fontSize:"20px", flexShrink:0 }}>{locSt==="idle"&&"📍"}{locSt==="loading"&&<span className="pulse">🔍</span>}{locSt==="ok"&&"✅"}{locSt==="err"&&"⚠️"}</div>
              <div style={{ flex:1 }}>
                {locSt==="idle"&&<div style={{ fontSize:"12px", color:"#555" }}>Activa tu ubicación para encontrar tiendas cercanas</div>}
                {locSt==="loading"&&<div style={{ fontSize:"12px", color:"#d97706" }} className="pulse">Obteniendo ubicación...</div>}
                {locSt==="ok"&&loc&&<div style={{ fontSize:"12px", color:"#4ade80" }}>📍 {loc.city}{loc.country?`, ${loc.country}`:""}</div>}
                {locSt==="err"&&<div style={{ fontSize:"11px", color:"#f87171" }}>{locErr}</div>}
              </div>
              {locSt!=="ok"&&<button className="btn-o" style={{ flexShrink:0, padding:"6px 12px", fontSize:"10px" }} onClick={requestLoc} disabled={locSt==="loading"}>{locSt==="loading"?"...":"Activar"}</button>}
              {locSt==="ok"&&<button className="btn-o" style={{ flexShrink:0, padding:"6px 10px", fontSize:"10px" }} onClick={()=>{ setLocSt("idle"); setLoc(null); }}>✕</button>}
            </div>
            <div className="card" style={{ marginBottom:"13px" }}>
              <div style={{ fontSize:"10px", color:"#444", letterSpacing:"2.5px", textTransform:"uppercase", marginBottom:"11px" }}>Presupuesto</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
                {BUDGETS.map(b=>(
                  <button key={b.value} onClick={()=>setBudget(b.value)} style={{ padding:"11px 9px", background:budget===b.value?"#b8965a11":"#0f0f0f", border:`1px solid ${budget===b.value?"#b8965a":"#1a1a1a"}`, borderRadius:"3px", cursor:"pointer", textAlign:"left", transition:"all .2s" }}>
                    <div style={{ fontSize:"16px", marginBottom:"3px" }}>{b.icon}</div>
                    <div style={{ fontSize:"12px", fontWeight:500, color:budget===b.value?"#b8965a":"#aaa" }}>{b.label}</div>
                    <div style={{ fontSize:"10px", color:"#333", marginTop:"2px", lineHeight:1.4 }}>{b.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="card" style={{ marginBottom:"13px" }}>
              <div style={{ marginBottom:"13px" }}>
                <div style={{ fontSize:"10px", color:"#444", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"9px" }}>Categoría</div>
                <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                  {["Tops","Pantalones","Vestidos","Zapatos","Accesorios","Abrigos","Ropa interior","Deportivo"].map(c=><button key={c} className={`pill ${shopCat===c?"on":""}`} onClick={()=>setShopCat(c)}>{c}</button>)}
                </div>
              </div>
              <div>
                <div style={{ fontSize:"10px", color:"#444", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"9px" }}>Estilo (opcional)</div>
                <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                  {["Casual","Elegante","Minimalista","Streetwear","Bohemio","Deportivo"].map(s=><button key={s} className={`pill ${shopSt===s?"on":""}`} onClick={()=>setShopSt(shopSt===s?"":s)}>{s}</button>)}
                </div>
              </div>
            </div>
            <button className="btn-g" onClick={searchShop} disabled={!budget||!shopCat||shopL} style={{ marginBottom:"18px" }}>
              {shopL?"Buscando...":`🛍 Buscar${locSt==="ok"?` cerca de ${loc?.city}`:""}`}
            </button>
            {shopL&&<div style={{ display:"flex", justifyContent:"center", gap:"5px", padding:"30px" }}><div className="dot"/><div className="dot"/><div className="dot"/></div>}
            {shopR&&!shopL&&(
              <div className="fade">
                <div className="divider"/>
                {shopR.intro&&<div style={{ fontSize:"13px", color:"#555", lineHeight:1.6, marginBottom:"16px", fontStyle:"italic", borderLeft:"2px solid #b8965a33", paddingLeft:"12px" }}>{shopR.intro}</div>}
                <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
                  {shopR.items?.map((item,i)=>(
                    <div key={i} style={{ background:"#0d0d0d", border:"1px solid #181818", borderRadius:"5px", padding:"15px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"7px" }}>
                        <div style={{ fontSize:"14px", fontWeight:500, flex:1, lineHeight:1.3 }}>{item.name}</div>
                        <div className="pf" style={{ fontSize:"13px", color:"#b8965a", marginLeft:"10px", whiteSpace:"nowrap" }}>{item.priceRange}</div>
                      </div>
                      <div style={{ fontSize:"12px", color:"#555", marginBottom:"12px", lineHeight:1.5 }}>{item.description}</div>
                      <div style={{ marginBottom:"10px" }}>
                        <div style={{ fontSize:"10px", color:"#333", letterSpacing:"1.5px", textTransform:"uppercase", marginBottom:"8px" }}>{locSt==="ok"?`📍 Cerca de ${loc?.city}`:"🌍 Disponible en"}</div>
                        {item.stores?.map((s,j)=>{
                          const meta=STORE_META[s]||{};
                          return (
                            <div key={j} className="st-row">
                              <div style={{ fontSize:"12px", fontWeight:500, marginBottom:"7px", color:"#ccc" }}>{s}</div>
                              <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                                {meta.maps&&<a href={mapsUrl(s,loc?.lat,loc?.lng)} target="_blank" rel="noopener noreferrer" className="lnk lnk-m">📍 Maps</a>}
                                {meta.amazon&&<a href={amazonUrl(item.name)} target="_blank" rel="noopener noreferrer" className="lnk lnk-a">📦 Amazon</a>}
                                <a href={meta.web||`https://www.google.com/search?q=${encodeURIComponent(s+" "+item.name)}`} target="_blank" rel="noopener noreferrer" className="lnk lnk-w">🌐 Tienda</a>
                              </div>
                            </div>
                          );
                        })}
                        {item.hasAmazon&&!item.stores?.includes("Amazon")&&(
                          <div className="st-row">
                            <div style={{ fontSize:"12px", fontWeight:500, marginBottom:"7px", color:"#ccc" }}>Amazon</div>
                            <div style={{ display:"flex", gap:"6px" }}><a href={amazonUrl(item.name)} target="_blank" rel="noopener noreferrer" className="lnk lnk-a">📦 Buscar en Amazon</a></div>
                          </div>
                        )}
                      </div>
                      {item.tip&&<div style={{ background:"#080808", borderLeft:"2px solid #b8965a33", padding:"8px 10px", borderRadius:"0 3px 3px 0", fontSize:"11px", color:"#666", lineHeight:1.5, marginBottom:"7px" }}>💡 {item.tip}</div>}
                      {item.why&&<div style={{ fontSize:"11px", color:"#b8965a55", lineHeight:1.5 }}>✦ {item.why}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ADVISOR */}
        {tab==="advisor" && (
          <div className="fade" style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 170px)" }}>
            <div className="pf" style={{ fontSize:"22px", marginBottom:"13px" }}>Asesor de Estilo IA</div>
            <div style={{ display:"flex", gap:"6px", overflowX:"auto", paddingBottom:"10px", marginBottom:"11px" }}>
              {["¿Qué colores van con azul marino?","¿Cómo vestir para una entrevista?","Tips para vestirse más elegante","¿Qué es el dress code Smart Casual?"].map(s=>(
                <button key={s} onClick={()=>sendChat(s)} style={{ padding:"6px 11px", background:"#0f0f0f", border:"1px solid #1a1a1a", color:"#444", borderRadius:"20px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:"11px", whiteSpace:"nowrap", transition:"all .2s" }}>{s}</button>
              ))}
            </div>
            <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:"11px", paddingBottom:"11px" }}>
              {msgs.map((m,i)=>(
                <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start", gap:"7px", alignItems:"flex-start" }}>
                  {m.role==="assistant"&&<div style={{ fontSize:"14px", marginTop:"4px", flexShrink:0, color:"#b8965a" }}>✦</div>}
                  <div className={m.role==="user"?"cu":"ca"}>{m.text}</div>
                </div>
              ))}
              {cload&&<div style={{ display:"flex", gap:"7px", alignItems:"center" }}><div style={{ color:"#b8965a", fontSize:"14px" }}>✦</div><div className="ca"><div style={{ display:"flex", gap:"4px" }}><div className="dot"/><div className="dot"/><div className="dot"/></div></div></div>}
              <div ref={chatEnd}/>
            </div>
            <div style={{ display:"flex", gap:"7px", paddingTop:"11px", borderTop:"1px solid #141414" }}>
              <input className="inp" style={{ flex:1 }} placeholder="Pregunta sobre moda, outfits, dress codes..." value={cin} onChange={e=>setCin(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!cload&&sendChat()} />
              <button className="btn-o" style={{ flexShrink:0 }} onClick={()=>sendChat()} disabled={cload||!cin.trim()}>Enviar</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
