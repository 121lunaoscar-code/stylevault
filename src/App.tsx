import { useState, useRef, useEffect } from "react";

const API_URL = "https://stylevault-api.121lunaoscar.workers.dev";
const MODEL = "claude-sonnet-4-5";

const callClaude = async (systemPrompt: string, messages: any[]) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, max_tokens: 1500, system: systemPrompt, messages }),
  });
  const data = await res.json();
  return data.content?.map((i: any) => i.text || "").join("") || "";
};

const callClaudeWithImage = async (systemPrompt: string, base64: string, mediaType: string, text: string) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL, max_tokens: 1000, system: systemPrompt,
      messages: [{ role: "user", content: [
        { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
        { type: "text", text }
      ]}],
    }),
  });
  const data = await res.json();
  return data.content?.map((i: any) => i.text || "").join("") || "";
};

const SB_URL = "https://rnrzifixbecsvbnxavus.supabase.co";
const SB_KEY = "sb_publishable_M4XCdb1bVj86biRwJXubCQ_OQJA74UP";

const sbFetch = async (path: string, options: any = {}) => {
  const token = localStorage.getItem("sb_token");
  const res = await fetch(`${SB_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", apikey: SB_KEY, Authorization: `Bearer ${token || SB_KEY}`, Prefer: "return=representation", ...(options.headers || {}) },
  });
  if (!res.ok && res.status !== 204) { const err = await res.json().catch(() => ({})); throw new Error((err as any).message || res.statusText); }
  if (res.status === 204) return null;
  return res.json();
};

const sbSignIn = async (email: string, password: string) => {
  const res = await fetch(`${SB_URL}/auth/v1/token?grant_type=password`, { method: "POST", headers: { "Content-Type": "application/json", apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }, body: JSON.stringify({ email, password }) });
  return res.json();
};
const sbSignUp = async (email: string, password: string) => {
  const res = await fetch(`${SB_URL}/auth/v1/signup`, { method: "POST", headers: { "Content-Type": "application/json", apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }, body: JSON.stringify({ email, password }) });
  return res.json();
};
const dbSelect = (table: string, query = "") => sbFetch(`/rest/v1/${table}?${query}`);
const dbInsert = (table: string, body: any) => sbFetch(`/rest/v1/${table}`, { method: "POST", body: JSON.stringify(body) });
const dbDelete = (table: string, match: string) => sbFetch(`/rest/v1/${table}?${match}`, { method: "DELETE" });
const dbUpdate = (table: string, match: string, body: any) => sbFetch(`/rest/v1/${table}?${match}`, { method: "PATCH", body: JSON.stringify(body) });

const CATEGORIES = ["Tops","Pantalones","Vestidos","Zapatos","Accesorios","Abrigos","Deportivo"];
const OCCASIONS = ["Casual","Trabajo","Formal","Deportivo","Fiesta","Viaje"];
const SEASONS = ["Todo el año","Primavera","Verano","Otoño","Invierno"];
const EVENTS = ["Trabajo / Oficina","Cita romántica","Reunión de negocios","Evento formal","Día casual","Fiesta / Antro","Deporte / Gym","Viaje"];
const CAT_ICON: Record<string,string> = { Tops:"👕", Pantalones:"👖", Vestidos:"👗", Zapatos:"👟", Accesorios:"💍", Abrigos:"🧥", Deportivo:"🏃" };

const ADVISOR_SYSTEM = `Eres StyleVault, asesor de moda experto. Usa markdown: **negrita**, listas con guiones. Sé conciso (máx 4 párrafos). Responde en español. Termina con una pregunta de seguimiento.`;
const OUTFIT_SYSTEM = `Eres experto en moda. SOLO JSON sin markdown: { outfit: [{emoji,name,why}], explanation: string, colorPalette: string, rating: number 1-5, ratingExplanation: string }`;
const PHOTO_SYSTEM = `Analiza esta prenda de ropa. SOLO JSON: { name: string, category: "Tops"|"Pantalones"|"Vestidos"|"Zapatos"|"Accesorios"|"Abrigos"|"Deportivo", color: string, occasion: "Casual"|"Trabajo"|"Formal"|"Deportivo"|"Fiesta"|"Viaje", season: "Todo el año"|"Primavera"|"Verano"|"Otoño"|"Invierno" }`;
const AVATAR_SYSTEM = `Eres experto en moda y análisis corporal. Analiza la foto de cuerpo completo. SOLO JSON: { bodyType: string, height: string, build: string, skinTone: string, recommendations: [string], styleAdvice: string }`;
const VIRTUAL_TRY_SYSTEM = `Eres estilista virtual experto. Dado un perfil corporal y prendas seleccionadas, describe cómo luciría el outfit en esa persona específicamente. Sé descriptivo y específico. Responde en español, máx 3 párrafos.`;
const TRIP_SYSTEM = `Eres experto en moda y viajes. SOLO JSON: { intro: string, llevar: [{categoria: string, items: [string], tip: string}], faltan: [{name: string, why: string, urgente: boolean}], consejo: string }`;

function renderMd(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.*?)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Jost:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
:root{--gold:#C4973F;--bg:#080808;--bg2:#0e0e0e;--bg3:#141414;--border:#1c1c1c;--text:#e8e2d9;--text2:#7a7269;--text3:#3a3632;--red:#e74c3c;--green:#2ecc71}
::-webkit-scrollbar{width:2px}::-webkit-scrollbar-thumb{background:#8a6b2a;border-radius:1px}
body{background:var(--bg);font-family:'Jost',sans-serif}
.sv{background:var(--bg);min-height:100vh;color:var(--text);font-weight:300;max-width:430px;margin:0 auto;position:relative}
.serif{font-family:'Cormorant Garamond',serif}

/* Bottom Nav */
.bnav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:#0a0a0a;border-top:1px solid var(--border);display:flex;z-index:100;padding-bottom:env(safe-area-inset-bottom)}
.bnav-item{flex:1;display:flex;flex-direction:column;align-items:center;padding:10px 0 8px;cursor:pointer;gap:3px;transition:all .2s;border:none;background:none}
.bnav-icon{font-size:20px;transition:transform .2s}
.bnav-label{font-size:8px;letter-spacing:1.5px;text-transform:uppercase;color:var(--text3);font-family:'Jost',sans-serif;transition:color .2s}
.bnav-item.on .bnav-label{color:var(--gold)}
.bnav-item.on .bnav-icon{transform:scale(1.15)}

/* Buttons */
.btn-p{background:var(--gold);color:#080808;border:none;padding:14px 24px;border-radius:1px;cursor:pointer;font-family:'Jost',sans-serif;font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;width:100%;transition:filter .2s}
.btn-p:hover{filter:brightness(1.1)}
.btn-p:disabled{opacity:.3;cursor:not-allowed}
.btn-o{background:transparent;color:var(--gold);border:1px solid rgba(196,151,63,.3);padding:10px 18px;border-radius:1px;cursor:pointer;font-family:'Jost',sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;transition:all .2s}
.btn-o:hover{background:rgba(196,151,63,.08)}
.btn-o:disabled{opacity:.3;cursor:not-allowed}
.btn-g{background:transparent;border:none;color:var(--text2);cursor:pointer;font-family:'Jost',sans-serif;font-size:11px;padding:6px 10px;transition:color .2s}
.btn-g:hover{color:var(--text)}

/* Inputs */
.inp{background:var(--bg2);border:1px solid var(--border);color:var(--text);padding:13px 15px;border-radius:1px;font-family:'Jost',sans-serif;font-size:13px;font-weight:300;width:100%;outline:none;transition:border-color .2s}
.inp:focus{border-color:rgba(196,151,63,.4)}
.inp::placeholder{color:var(--text3)}
.sel{background:var(--bg2);border:1px solid var(--border);color:var(--text);padding:13px 15px;border-radius:1px;font-family:'Jost',sans-serif;font-size:13px;width:100%;cursor:pointer;outline:none}

/* Cards */
.card{background:var(--bg2);border:1px solid var(--border);border-radius:2px;padding:16px}
.card-gold{border-color:rgba(196,151,63,.2)}

/* Pills */
.pill{padding:6px 14px;border-radius:20px;font-family:'Jost',sans-serif;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;border:1px solid var(--border);background:transparent;color:var(--text3);transition:all .2s;white-space:nowrap}
.pill.on{background:var(--gold);color:#080808;border-color:var(--gold);font-weight:600}
.pill:hover:not(.on){border-color:rgba(196,151,63,.3);color:var(--gold)}

/* Dots */
.dot{width:5px;height:5px;border-radius:50%;background:var(--gold);animation:bop 1.2s ease-in-out infinite}
.dot:nth-child(2){animation-delay:.2s}.dot:nth-child(3){animation-delay:.4s}
@keyframes bop{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-7px);opacity:1}}

/* Misc */
.divider{height:1px;background:linear-gradient(90deg,transparent,rgba(196,151,63,.15),transparent);margin:18px 0}
.fade{animation:fu .3s ease both}
@keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.toast{position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--bg3);border:1px solid rgba(196,151,63,.3);color:var(--text);padding:10px 20px;border-radius:2px;font-size:11px;font-family:'Jost',sans-serif;letter-spacing:1.5px;z-index:999;animation:fu .3s ease;white-space:nowrap}
.pbox{width:100%;border:1px dashed var(--border);border-radius:2px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;overflow:hidden;background:var(--bg);transition:border-color .2s}
.pbox:hover{border-color:rgba(196,151,63,.3)}
.chip{padding:7px 12px;background:var(--bg2);border:1px solid var(--border);color:var(--text2);border-radius:20px;cursor:pointer;font-family:'Jost',sans-serif;font-size:11px;white-space:nowrap;transition:all .2s}
.chip:hover{border-color:rgba(196,151,63,.3);color:var(--gold)}
.stars{color:var(--gold);font-size:16px;letter-spacing:1px}
.bubble-u{background:rgba(196,151,63,.08);border:1px solid rgba(196,151,63,.15);border-radius:16px 16px 3px 16px;padding:11px 14px;max-width:78%;margin-left:auto;font-size:13px;line-height:1.6}
.bubble-a{background:var(--bg2);border:1px solid var(--border);border-radius:16px 16px 16px 3px;padding:13px 16px;max-width:86%;font-size:13px;line-height:1.7;color:var(--text2)}
.bubble-a strong{color:var(--text);font-weight:500}
.bubble-a ul{padding-left:16px;margin:6px 0}
.bubble-a li{margin-bottom:4px}
.bubble-a p{margin-bottom:8px}
.bubble-a p:last-child{margin-bottom:0}
.stat-mini{background:var(--bg2);border:1px solid var(--border);border-radius:2px;padding:14px 10px;text-align:center;flex:1}
.premium-badge{background:linear-gradient(135deg,#C4973F,#8a6b2a);color:#080808;font-size:8px;letter-spacing:2px;text-transform:uppercase;padding:3px 8px;border-radius:20px;font-weight:600}
.lock-overlay{position:absolute;inset:0;background:rgba(8,8,8,.85);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;border-radius:2px;z-index:5}
`;

export default function StyleVault() {
  const [screen, setScreen] = useState("login");
  const [resetToken, setResetToken] = useState<string|null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [resetL, setResetL] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [lf, setLf] = useState({ name:"", email:"", password:"" });
  const [lmode, setLmode] = useState("login");
  const [lerr, setLerr] = useState("");
  const [aloading, setAL] = useState(false);

  const [tab, setTab] = useState("home");
  const [clothes, setClothes] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [fc, setFc] = useState("Todo");
  const [showForm, setSF] = useState(false);
  const [ni, setNi] = useState({ name:"", category:"Tops", color:"#C4973F", season:"Todo el año", occasion:"" });
  const [pp, setPp] = useState<string|null>(null);
  const [cloading, setCL] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const [selEv, setSelEv] = useState("");
  const [selSe, setSelSe] = useState("Todo el año");
  const [outfitR, setOR] = useState<any>(null);
  const [outfitL, setOL] = useState(false);

  const [msgs, setMsgs] = useState<{role:string;text:string}[]>([
    { role:"assistant", text:"Hola, soy tu **asesor de estilo personal**. Puedo ayudarte con combinaciones, dress codes, tendencias y mucho más.\n\n¿En qué te ayudo hoy?" }
  ]);
  const [cin, setCin] = useState("");
  const [cload, setCload] = useState(false);
  const chatEnd = useRef<HTMLDivElement>(null);

  // Avatar / Virtual Try
  const [avatarPhoto, setAvatarPhoto] = useState<string|null>(null);
  const [avatarData, setAvatarData] = useState<any>(null);
  const [avatarL, setAvatarL] = useState(false);
  const [selectedForTry, setSelectedForTry] = useState<number[]>([]);
  const [tryResult, setTryResult] = useState<string|null>(null);
  const [tryL, setTryL] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);

  // Trip
  const [tripDest, setTripDest] = useState("");
  const [tripDays, setTripDays] = useState("7");
  const [tripClima, setTripClima] = useState("");
  const [tripTipo, setTripTipo] = useState("");
  const [tripR, setTripR] = useState<any>(null);
  const [tripL, setTripL] = useState(false);

  const [toast, setToast] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2600); };

  useEffect(() => {
    const saved = localStorage.getItem("sb_profile");
    const saved = localStorage.getItem("sb_profile");
    // Check for password recovery token in URL
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace("#", "?"));
    const accessToken = params.get("access_token");
    const type = params.get("type");
    if (accessToken && type === "recovery") {
      setResetToken(accessToken);
      setScreen("reset");
      window.history.replaceState(null, "", window.location.pathname);
      return;
    }
    if (saved) { const p = JSON.parse(saved); setProfile(p); setScreen("app"); }
    const favs = JSON.parse(localStorage.getItem("sv_favorites") || "[]");
    setFavorites(favs);
  }, []);

  // ── AUTH ──────────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    setLerr(""); setAL(true);
    try {
      const auth = await sbSignIn(lf.email, lf.password);
      if (auth.error || !auth.access_token) { setLerr("Correo o contraseña incorrectos."); setAL(false); return; }
      localStorage.setItem("sb_token", auth.access_token);
      const res = await fetch(`${SB_URL}/rest/v1/users?email=eq.${encodeURIComponent(lf.email)}&limit=1`, {
        headers: { apikey: SB_KEY, Authorization: `Bearer ${auth.access_token}`, "Content-Type": "application/json" }
      });
      const users = await res.json();
      if (!users?.length) { setLerr("Perfil no encontrado."); setAL(false); return; }
      const p = users[0];
      if (p.status === "blocked") { setLerr("Tu cuenta está bloqueada."); setAL(false); return; }
      localStorage.setItem("sb_profile", JSON.stringify(p));
      setProfile(p); setScreen("app");
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
      setProfile(newProfile); setScreen("app");
      showToast("✦ Bienvenido a StyleVault");
    } catch { setLerr("Error al crear cuenta."); }
    setAL(false);
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) { setResetMsg("La contraseña debe tener al menos 6 caracteres."); return; }
    setResetL(true); setResetMsg("");
    try {
      const res = await fetch(`${SB_URL}/auth/v1/user`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", apikey: SB_KEY, Authorization: `Bearer ${resetToken}` },
        body: JSON.stringify({ password: newPassword }),
      });
      if (res.ok) {
        setResetMsg("✅ Contraseña actualizada. Ahora puedes iniciar sesión.");
        setTimeout(() => setScreen("login"), 2500);
      } else {
        setResetMsg("Error al actualizar. El link puede haber expirado.");
      }
    } catch { setResetMsg("Error de conexión."); }
    setResetL(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("sb_token"); localStorage.removeItem("sb_profile");
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
    const r = new FileReader();
    r.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setPp(dataUrl);
      setAnalyzing(true);
      try {
        const base64 = dataUrl.split(',')[1];
        const text = await callClaudeWithImage(PHOTO_SYSTEM, base64, f.type, "Analiza esta prenda.");
        const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
        setNi(prev => ({ ...prev, name: parsed.name || prev.name, category: parsed.category || prev.category, season: parsed.season || prev.season, occasion: parsed.occasion || prev.occasion }));
        showToast("✦ Prenda analizada con IA");
      } catch {}
      setAnalyzing(false);
    };
    r.readAsDataURL(f);
  };

  const addItem = async () => {
    if (!ni.name) return;
    try {
      const inserted = await dbInsert("clothes", { user_id: profile.id, ...ni, photo_url: pp });
      const item = inserted?.[0] || { id: Date.now(), user_id: profile.id, ...ni, photo_url: pp };
      setClothes([item, ...clothes]);
      setNi({ name:"", category:"Tops", color:"#C4973F", season:"Todo el año", occasion:"" });
      setPp(null); setSF(false); showToast("✦ Prenda guardada");
    } catch { showToast("Error al guardar."); }
  };

  const removeItem = async (id: number) => {
    try { await dbDelete("clothes", `id=eq.${id}`); } catch {}
    setClothes(clothes.filter(c => c.id !== id));
    showToast("Prenda eliminada");
  };

  const toggleFav = (id: number) => {
    const next = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
    setFavorites(next);
    localStorage.setItem("sv_favorites", JSON.stringify(next));
  };

  // ── OUTFIT ────────────────────────────────────────────────────────────────
  const generateOutfit = async () => {
    if (!selEv) return;
    setOL(true); setOR(null);
    const list = clothes.map(c => `${c.name} (${c.category}, ${c.occasion||"sin ocasión"})`).join("\n");
    try {
      const raw = await callClaude(OUTFIT_SYSTEM, [{ role:"user", content:`Armario:\n${list}\n\nEvento: ${selEv}\nTemporada: ${selSe}\n\nCrea el outfit ideal y califícalo.` }]);
      setOR(JSON.parse(raw.replace(/```json|```/g,"").trim()));
      showToast("✦ Outfit creado");
    } catch { setOR({ outfit:[], explanation:"Error.", colorPalette:"", rating:0, ratingExplanation:"" }); }
    setOL(false);
  };

  // ── CHAT ──────────────────────────────────────────────────────────────────
  const sendChat = async (msg?: string) => {
    const m = msg || cin; if (!m.trim()) return;
    const next = [...msgs, { role:"user", text:m }];
    setMsgs(next); setCin(""); setCload(true);
    const ctx = clothes.length > 0 ? `\n\nArmario: ${clothes.slice(0,15).map(c=>`${c.name} (${c.category})`).join(", ")}` : "";
    try {
      const reply = await callClaude(ADVISOR_SYSTEM + ctx, next.map(x => ({ role: x.role==="assistant"?"assistant":"user", content: x.text })));
      setMsgs([...next, { role:"assistant", text:reply }]);
    } catch { setMsgs([...next, { role:"assistant", text:"Error de conexión." }]); }
    setCload(false);
  };

  // ── AVATAR / VIRTUAL TRY ──────────────────────────────────────────────────
  const analyzeAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setAvatarPhoto(dataUrl);
      setAvatarL(true);
      try {
        const base64 = dataUrl.split(',')[1];
        const text = await callClaudeWithImage(AVATAR_SYSTEM, base64, f.type, "Analiza el cuerpo completo de esta persona para crear su perfil de moda.");
        const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
        setAvatarData(parsed);
        showToast("✦ Avatar analizado");
      } catch { showToast("Error al analizar. Intenta de nuevo."); }
      setAvatarL(false);
    };
    r.readAsDataURL(f);
  };

  const virtualTryOn = async () => {
    if (!avatarData || selectedForTry.length === 0) return;
    setTryL(true); setTryResult(null);
    const prendas = clothes.filter(c => selectedForTry.includes(c.id)).map(c => `${c.name} (${c.category}, color: ${c.color})`).join(", ");
    const perfil = `Tipo de cuerpo: ${avatarData.bodyType}, Complexión: ${avatarData.build}, Tono de piel: ${avatarData.skinTone}`;
    try {
      const result = await callClaude(VIRTUAL_TRY_SYSTEM, [{ role:"user", content:`Perfil corporal:\n${perfil}\n\nPrendas seleccionadas:\n${prendas}\n\nDescribe detalladamente cómo luciría este outfit en esta persona específicamente, incluyendo cómo cada prenda favorece su tipo de cuerpo.` }]);
      setTryResult(result);
    } catch { setTryResult("Error al procesar."); }
    setTryL(false);
  };

  // ── TRIP ──────────────────────────────────────────────────────────────────
  const planTrip = async () => {
    if (!tripDest || !tripDays) return;
    setTripL(true); setTripR(null);
    const armario = clothes.length > 0 ? clothes.map(c => `${c.name} (${c.category})`).join(", ") : "Sin prendas";
    try {
      const raw = await callClaude(TRIP_SYSTEM, [{ role:"user", content:`Destino: ${tripDest}\nDías: ${tripDays}\nClima: ${tripClima||"templado"}\nTipo: ${tripTipo||"turismo"}\nArmario: ${armario}` }]);
      setTripR(JSON.parse(raw.replace(/```json|```/g,"").trim()));
    } catch { setTripR({ intro:"Error.", llevar:[], faltan:[], consejo:"" }); }
    setTripL(false);
  };

  const filtered = clothes.filter(c => fc === "Todo" || c.category === fc);
  const favClothes = clothes.filter(c => favorites.includes(c.id));
  const isPremium = profile?.plan === "Premium" || profile?.plan === "Admin";
  const renderStars = (n: number) => "★".repeat(Math.min(5,Math.max(0,Math.round(n)))) + "☆".repeat(5-Math.min(5,Math.max(0,Math.round(n))));

  const suggestions = ["¿Qué colores van con azul marino?","Armario cápsula esencial","¿Cómo vestir para entrevista?","Smart Casual dress code","Tips para parecer más alto"];

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  // ── RESET PASSWORD SCREEN ────────────────────────────────────────────────
  if (screen === "reset") return (
    <div style={{ fontFamily:"'Jost',sans-serif", background:"#080808", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <style>{CSS}</style>
      <div style={{ width:"100%", maxWidth:"360px" }}>
        <div style={{ textAlign:"center", marginBottom:"40px" }}>
          <div className="serif" style={{ fontSize:"36px", letterSpacing:"8px", color:"#C4973F", fontWeight:300 }}>STYLE<em>VAULT</em></div>
        </div>
        <div className="card">
          <div style={{ fontSize:"9px", color:"#C4973F", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"20px" }}>✦ Nueva Contraseña</div>
          <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
            <input className="inp" placeholder="Nueva contraseña (mínimo 6 caracteres)" type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleResetPassword()} />
            {resetMsg && <div style={{ color:resetMsg.startsWith("✅")?"#2ecc71":"#e74c3c", fontSize:"12px", textAlign:"center", lineHeight:1.5 }}>{resetMsg}</div>}
            <button className="btn-p" onClick={handleResetPassword} disabled={resetL}>
              {resetL?"Actualizando...":"✦  Actualizar Contraseña"}
            </button>
            <button onClick={()=>setScreen("login")} style={{ background:"none", border:"none", color:"#3a3632", fontSize:"10px", cursor:"pointer", letterSpacing:"1.5px", fontFamily:"'Jost',sans-serif", textDecoration:"underline", textAlign:"center" }}>Volver al inicio de sesión</button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  if (screen === "login") return (
    <div style={{ fontFamily:"'Jost',sans-serif", background:"#080808", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <style>{CSS}</style>
      <div style={{ width:"100%", maxWidth:"360px" }}>
        <div style={{ textAlign:"center", marginBottom:"48px" }}>
          <div className="serif" style={{ fontSize:"40px", letterSpacing:"10px", color:"#C4973F", fontWeight:300 }}>STYLE<em>VAULT</em></div>
          <div style={{ fontSize:"8px", letterSpacing:"6px", color:"#2a2826", marginTop:"8px", textTransform:"uppercase" }}>Armario Inteligente con IA</div>
        </div>
        <div className="card">
          <div style={{ display:"flex", marginBottom:"24px", borderBottom:"1px solid #1c1c1c" }}>
            {["login","register"].map(m => (
              <button key={m} onClick={()=>{setLmode(m);setLerr("");}} style={{ flex:1, padding:"11px", background:"none", border:"none", borderBottom:`2px solid ${lmode===m?"#C4973F":"transparent"}`, color:lmode===m?"#C4973F":"#3a3632", cursor:"pointer", fontFamily:"'Jost',sans-serif", fontSize:"9px", letterSpacing:"3px", textTransform:"uppercase", fontWeight:500 }}>
                {m==="login"?"Iniciar Sesión":"Registrarse"}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:"11px" }}>
            {lmode==="register" && <input className="inp" placeholder="Tu nombre completo" value={lf.name} onChange={e=>setLf(p=>({...p,name:e.target.value}))} />}
            <input className="inp" placeholder="Correo electrónico" type="email" value={lf.email} onChange={e=>setLf(p=>({...p,email:e.target.value}))} />
            <input className="inp" placeholder="Contraseña" type="password" value={lf.password} onChange={e=>setLf(p=>({...p,password:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&(lmode==="login"?handleLogin():handleRegister())} />
            {lerr && <div style={{ color:lerr.startsWith("✅")?"#2ecc71":"#e74c3c", fontSize:"12px", textAlign:"center" }}>{lerr}</div>}
            <button className="btn-p" style={{ marginTop:"6px" }} onClick={lmode==="login"?handleLogin:handleRegister} disabled={aloading}>
              {aloading?"...":lmode==="login"?"✦  Entrar":"✦  Crear Cuenta"}
            </button>
            {lmode==="login" && (
              <button onClick={async()=>{
                if (!lf.email) { alert("Escribe tu correo primero"); return; }
                const res = await fetch(`${SB_URL}/auth/v1/recover`, { method:"POST", headers:{"Content-Type":"application/json", apikey:SB_KEY, Authorization:`Bearer ${SB_KEY}`}, body:JSON.stringify({ email:lf.email }) });
                alert(res.ok?"✅ Revisa tu correo para recuperar tu contraseña":"Error al enviar. Intenta de nuevo.");
              }} style={{ background:"none", border:"none", color:"#3a3632", fontSize:"10px", cursor:"pointer", letterSpacing:"1.5px", fontFamily:"Jost,sans-serif", textDecoration:"underline", textAlign:"center", width:"100%", padding:"4px" }}>
                ¿Olvidaste tu contraseña?
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // ── MAIN APP ──────────────────────────────────────────────────────────────
  return (
    <div className="sv">
      <style>{CSS}</style>
      {toast && <div className="toast">{toast}</div>}
      <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handlePhoto} />
      <input ref={camRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={handlePhoto} />
      <input ref={avatarRef} type="file" accept="image/*" style={{display:"none"}} onChange={analyzeAvatar} />

      {/* ── Header ── */}
      <header style={{ padding:"14px 16px 10px", borderBottom:"1px solid var(--border)", background:"#0a0a0a", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, zIndex:50 }}>
        <div>
          <div className="serif" style={{ fontSize:"22px", letterSpacing:"6px", color:"#C4973F", fontWeight:300, lineHeight:1 }}>STYLE<em>VAULT</em></div>
          <div style={{ fontSize:"7px", letterSpacing:"4px", color:"#2a2826", marginTop:"2px" }}>ARMARIO INTELIGENTE</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          {isPremium && <span className="premium-badge">Premium</span>}
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:"12px" }}>{profile?.name?.split(" ")[0]}</div>
            <div style={{ fontSize:"8px", color:"rgba(196,151,63,.5)", letterSpacing:"1px", textTransform:"uppercase" }}>{profile?.plan}</div>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main style={{ padding:"16px 14px 90px", overflowY:"auto" }}>

        {/* HOME */}
        {tab==="home" && (
          <div className="fade">
            {/* Welcome */}
            <div style={{ marginBottom:"20px" }}>
              <div className="serif" style={{ fontSize:"26px", fontWeight:300 }}>Hola, {profile?.name?.split(" ")[0]} 👋</div>
              <div style={{ fontSize:"11px", color:"var(--text3)", marginTop:"4px" }}>Aquí está tu resumen de hoy</div>
            </div>

            {/* Stats */}
            <div style={{ display:"flex", gap:"10px", marginBottom:"18px" }}>
              {[
                { label:"Prendas", value:clothes.length, icon:"👗" },
                { label:"Favoritas", value:favClothes.length, icon:"❤️" },
                { label:"Outfits", value:outfitR?1:0, icon:"✦" },
              ].map(s => (
                <div key={s.label} className="stat-mini">
                  <div style={{ fontSize:"22px", marginBottom:"4px" }}>{s.icon}</div>
                  <div className="serif" style={{ fontSize:"22px", color:"var(--gold)", fontWeight:300 }}>{s.value}</div>
                  <div style={{ fontSize:"8px", color:"var(--text3)", letterSpacing:"1.5px", textTransform:"uppercase", marginTop:"2px" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Outfit del día */}
            <div className="card card-gold" style={{ marginBottom:"14px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"14px" }}>
                <div>
                  <div style={{ fontSize:"9px", color:"var(--gold)", letterSpacing:"3px", textTransform:"uppercase" }}>✦ Outfit del día</div>
                  <div style={{ fontSize:"12px", color:"var(--text3)", marginTop:"3px" }}>Generado por IA para ti</div>
                </div>
                <button className="btn-o" style={{ fontSize:"9px", padding:"7px 12px" }} onClick={()=>setTab("outfit")}>Crear →</button>
              </div>
              {outfitR ? (
                <div>
                  <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"10px" }}>
                    {outfitR.outfit?.slice(0,3).map((item: any, i: number) => (
                      <div key={i} style={{ background:"#0a0a0a", border:"1px solid var(--border)", borderRadius:"2px", padding:"8px 12px", fontSize:"12px" }}>
                        {item.emoji} {item.name}
                      </div>
                    ))}
                  </div>
                  {outfitR.rating && <div className="stars">{renderStars(outfitR.rating)} <span style={{ fontSize:"11px", color:"var(--text3)" }}>{outfitR.rating}/5</span></div>}
                </div>
              ) : (
                <div style={{ textAlign:"center", padding:"20px", color:"var(--text3)", fontSize:"12px" }}>
                  {clothes.length === 0 ? "Agrega prendas para generar outfits" : "Toca 'Crear' para generar tu outfit de hoy"}
                </div>
              )}
            </div>

            {/* Prueba Virtual promo */}
            <div style={{ position:"relative", overflow:"hidden" }}>
              <div className="card" style={{ background:"linear-gradient(135deg,#0e0e0e,#141414)", borderColor:"rgba(196,151,63,.2)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <div style={{ fontSize:"9px", color:"var(--gold)", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"6px" }}>✦ Prueba Virtual</div>
                    <div style={{ fontSize:"14px", fontWeight:400, marginBottom:"6px" }}>Ve cómo te queda antes de vestirte</div>
                    <div style={{ fontSize:"11px", color:"var(--text3)", lineHeight:1.5, marginBottom:"12px" }}>Crea tu avatar IA con una foto de cuerpo completo</div>
                    <button className="btn-p" style={{ width:"auto", padding:"10px 18px" }} onClick={()=>setTab("avatar")}>
                      {isPremium ? "Probar ahora →" : "Ver función Premium →"}
                    </button>
                  </div>
                  <div style={{ fontSize:"48px", opacity:.3 }}>🧍</div>
                </div>
              </div>
            </div>

            {/* Recent clothes */}
            {clothes.length > 0 && (
              <div style={{ marginTop:"18px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
                  <div style={{ fontSize:"9px", color:"var(--text3)", letterSpacing:"2px", textTransform:"uppercase" }}>Prendas recientes</div>
                  <button className="btn-g" onClick={()=>setTab("wardrobe")}>Ver todas →</button>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"8px" }}>
                  {clothes.slice(0,6).map(item => (
                    <div key={item.id} style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"2px", overflow:"hidden", position:"relative" }}>
                      <button onClick={()=>toggleFav(item.id)} style={{ position:"absolute", top:"5px", right:"5px", background:"rgba(0,0,0,.6)", border:"none", fontSize:"12px", cursor:"pointer", width:"22px", height:"22px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {favorites.includes(item.id)?"❤️":"🤍"}
                      </button>
                      {item.photo_url ? (
                        <img src={item.photo_url} alt={item.name} style={{ width:"100%", aspectRatio:"1", objectFit:"cover" }} />
                      ) : (
                        <div style={{ width:"100%", aspectRatio:"1", background:"#0a0a0a", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"28px" }}>
                          {CAT_ICON[item.category]||"👔"}
                        </div>
                      )}
                      <div style={{ padding:"6px 8px" }}>
                        <div style={{ fontSize:"10px", fontWeight:400, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* WARDROBE */}
        {tab==="wardrobe" && (
          <div className="fade">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"18px" }}>
              <div>
                <div className="serif" style={{ fontSize:"26px", fontWeight:300 }}>Mi Armario</div>
                <div style={{ fontSize:"10px", color:"var(--text3)", marginTop:"3px" }}>{clothes.length} prendas</div>
              </div>
              <button className="btn-o" onClick={()=>setSF(!showForm)}>+ Agregar</button>
            </div>

            {showForm && (
              <div className="card card-gold fade" style={{ marginBottom:"18px" }}>
                <div style={{ fontSize:"9px", color:"var(--gold)", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"14px" }}>✦ Nueva Prenda</div>
                <div className="pbox" style={{ height:"150px", marginBottom:"10px" }} onClick={()=>fileRef.current?.click()}>
                  {pp ? <img src={pp} alt="preview" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : (
                    <div style={{ textAlign:"center", color:"var(--text3)" }}>
                      <div style={{ fontSize:"28px", marginBottom:"6px" }}>📷</div>
                      <div style={{ fontSize:"10px", letterSpacing:"1px" }}>Foto → IA analiza automáticamente</div>
                    </div>
                  )}
                </div>
                {analyzing && (
                  <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"6px 0", color:"var(--gold)", fontSize:"11px" }}>
                    <div className="dot"/><div className="dot"/><div className="dot"/>
                    <span style={{ marginLeft:"6px" }}>Analizando con IA...</span>
                  </div>
                )}
                <div style={{ display:"flex", gap:"7px", marginBottom:"12px" }}>
                  <button className="btn-g" style={{ flex:1, border:"1px solid var(--border)", borderRadius:"1px" }} onClick={()=>fileRef.current?.click()}>📁 Galería</button>
                  <button className="btn-g" style={{ flex:1, border:"1px solid var(--border)", borderRadius:"1px" }} onClick={()=>camRef.current?.click()}>📷 Cámara</button>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:"9px" }}>
                  <input className="inp" placeholder="Nombre de la prenda" value={ni.name} onChange={e=>setNi(p=>({...p,name:e.target.value}))} />
                  <select className="sel" value={ni.category} onChange={e=>setNi(p=>({...p,category:e.target.value}))}>
                    {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                  </select>
                  <select className="sel" value={ni.occasion} onChange={e=>setNi(p=>({...p,occasion:e.target.value}))}>
                    <option value="">Ocasión</option>
                    {OCCASIONS.map(o=><option key={o}>{o}</option>)}
                  </select>
                  <select className="sel" value={ni.season} onChange={e=>setNi(p=>({...p,season:e.target.value}))}>
                    {SEASONS.map(s=><option key={s}>{s}</option>)}
                  </select>
                  <div style={{ display:"flex", gap:"9px", marginTop:"4px" }}>
                    <button className="btn-p" onClick={addItem} style={{ flex:1 }}>Guardar</button>
                    <button className="btn-o" onClick={()=>{setSF(false);setPp(null);}}>Cancelar</button>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display:"flex", gap:"7px", overflowX:"auto", paddingBottom:"10px", marginBottom:"14px" }}>
              {["Todo",...CATEGORIES].map(c => <button key={c} className={`pill ${fc===c?"on":""}`} onClick={()=>setFc(c)}>{c}</button>)}
            </div>

            {cloading ? (
              <div style={{ display:"flex", justifyContent:"center", gap:"6px", padding:"50px" }}><div className="dot"/><div className="dot"/><div className="dot"/></div>
            ) : filtered.length===0 ? (
              <div style={{ textAlign:"center", padding:"60px 20px", color:"var(--text3)", fontSize:"12px" }}>
                {clothes.length===0?"Tu armario está vacío":"No hay prendas en esta categoría"}
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"11px" }}>
                {filtered.map(item => (
                  <div key={item.id} className="card" style={{ padding:0, overflow:"hidden", position:"relative" }}>
                    <div style={{ position:"absolute", top:"7px", right:"7px", zIndex:2, display:"flex", gap:"4px" }}>
                      <button onClick={()=>toggleFav(item.id)} style={{ background:"rgba(0,0,0,.7)", border:"none", fontSize:"12px", cursor:"pointer", width:"24px", height:"24px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {favorites.includes(item.id)?"❤️":"🤍"}
                      </button>
                      <button onClick={()=>removeItem(item.id)} style={{ background:"rgba(0,0,0,.7)", border:"none", color:"#888", cursor:"pointer", fontSize:"10px", width:"24px", height:"24px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                    </div>
                    {item.photo_url ? (
                      <img src={item.photo_url} alt={item.name} style={{ width:"100%", aspectRatio:"1", objectFit:"cover" }} />
                    ) : (
                      <div style={{ width:"100%", aspectRatio:"1", background:"#0a0a0a", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"36px" }}>
                        {CAT_ICON[item.category]||"👔"}
                      </div>
                    )}
                    <div style={{ padding:"9px 11px" }}>
                      <div style={{ fontSize:"12px", fontWeight:400, marginBottom:"2px" }}>{item.name}</div>
                      <div style={{ fontSize:"9px", color:"var(--text3)", letterSpacing:"1.5px", textTransform:"uppercase" }}>{item.category}</div>
                      {item.occasion && <div style={{ fontSize:"10px", color:"rgba(196,151,63,.5)", marginTop:"2px" }}>{item.occasion}</div>}
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
            <div style={{ marginBottom:"20px" }}>
              <div className="serif" style={{ fontSize:"26px", fontWeight:300 }}>Outfit IA</div>
              <div style={{ fontSize:"11px", color:"var(--text3)", marginTop:"3px" }}>La IA selecciona y califica tu look ideal</div>
            </div>
            {clothes.length===0 ? (
              <div style={{ textAlign:"center", padding:"60px", color:"var(--text3)", fontSize:"13px" }}>Agrega prendas a tu armario primero</div>
            ) : (
              <>
                <div className="card" style={{ marginBottom:"12px" }}>
                  <div style={{ fontSize:"9px", color:"var(--text2)", letterSpacing:"2.5px", textTransform:"uppercase", marginBottom:"12px" }}>¿Para qué evento?</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"7px" }}>
                    {EVENTS.map(ev => (
                      <button key={ev} onClick={()=>setSelEv(ev)} style={{ padding:"9px 7px", background:selEv===ev?"rgba(196,151,63,.1)":"#0e0e0e", color:selEv===ev?"var(--gold)":"var(--text3)", border:`1px solid ${selEv===ev?"rgba(196,151,63,.3)":"var(--border)"}`, borderRadius:"1px", cursor:"pointer", fontFamily:"'Jost',sans-serif", fontSize:"11px", textAlign:"left", transition:"all .2s" }}>{ev}</button>
                    ))}
                  </div>
                </div>
                <div className="card" style={{ marginBottom:"16px" }}>
                  <div style={{ fontSize:"9px", color:"var(--text2)", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"10px" }}>Temporada</div>
                  <div style={{ display:"flex", gap:"7px", flexWrap:"wrap" }}>
                    {SEASONS.map(s => <button key={s} className={`pill ${selSe===s?"on":""}`} onClick={()=>setSelSe(s)}>{s}</button>)}
                  </div>
                </div>
                <button className="btn-p" onClick={generateOutfit} disabled={!selEv||outfitL} style={{ marginBottom:"18px" }}>
                  {outfitL?"Creando outfit...":"✦  Generar Outfit con IA"}
                </button>
                {outfitL && <div style={{ display:"flex", justifyContent:"center", gap:"6px", padding:"24px" }}><div className="dot"/><div className="dot"/><div className="dot"/></div>}
                {outfitR && !outfitL && (
                  <div className="fade">
                    <div className="divider"/>
                    {outfitR.rating > 0 && (
                      <div style={{ background:"#0a0a0a", border:"1px solid rgba(196,151,63,.15)", borderRadius:"2px", padding:"14px", marginBottom:"14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div style={{ fontSize:"12px", color:"var(--text2)", flex:1 }}>{outfitR.ratingExplanation}</div>
                        <div style={{ textAlign:"right", marginLeft:"12px" }}>
                          <div className="stars">{renderStars(outfitR.rating)}</div>
                          <div style={{ fontSize:"9px", color:"var(--gold)", marginTop:"3px" }}>{outfitR.rating}/5</div>
                        </div>
                      </div>
                    )}
                    {outfitR.colorPalette && (
                      <div style={{ padding:"10px 14px", background:"#0a0a0a", border:"1px solid rgba(196,151,63,.08)", borderRadius:"2px", marginBottom:"14px" }}>
                        <div style={{ fontSize:"9px", color:"var(--text3)", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"4px" }}>Paleta</div>
                        <div style={{ fontSize:"12px", color:"rgba(196,151,63,.7)", fontStyle:"italic" }}>{outfitR.colorPalette}</div>
                      </div>
                    )}
                    <div style={{ display:"flex", flexDirection:"column", gap:"9px", marginBottom:"16px" }}>
                      {outfitR.outfit?.map((item: any, i: number) => (
                        <div key={i} style={{ display:"flex", gap:"12px", padding:"13px", background:"#0d0d0d", border:"1px solid var(--border)", borderRadius:"2px" }}>
                          <div style={{ fontSize:"26px", minWidth:"34px", textAlign:"center" }}>{item.emoji}</div>
                          <div><div style={{ fontSize:"13px", fontWeight:400, marginBottom:"4px" }}>{item.name}</div><div style={{ fontSize:"11px", color:"var(--text2)", lineHeight:1.6 }}>{item.why}</div></div>
                        </div>
                      ))}
                    </div>
                    {outfitR.explanation && (
                      <div style={{ background:"#0a0a0a", borderLeft:"2px solid rgba(196,151,63,.3)", padding:"14px" }}>
                        <div style={{ fontSize:"9px", color:"var(--gold)", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"8px" }}>✦ Por qué funciona</div>
                        <div style={{ fontSize:"12px", color:"var(--text2)", lineHeight:1.8 }}>{outfitR.explanation}</div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* AVATAR / VIRTUAL TRY */}
        {tab==="avatar" && (
          <div className="fade">
            <div style={{ marginBottom:"20px" }}>
              <div className="serif" style={{ fontSize:"26px", fontWeight:300 }}>Prueba Virtual</div>
              <div style={{ fontSize:"11px", color:"var(--text3)", marginTop:"3px" }}>
                {isPremium ? "Crea tu avatar y prueba outfits virtualmente" : "Función exclusiva Premium"}
              </div>
            </div>

            {!isPremium ? (
              <div className="card card-gold" style={{ textAlign:"center", padding:"32px 20px" }}>
                <div style={{ fontSize:"48px", marginBottom:"16px" }}>👑</div>
                <div className="serif" style={{ fontSize:"22px", fontWeight:300, marginBottom:"10px" }}>Función Premium</div>
                <div style={{ fontSize:"13px", color:"var(--text2)", lineHeight:1.6, marginBottom:"20px" }}>
                  Sube una foto de cuerpo completo para crear tu avatar IA personal y prueba virtualmente cualquier outfit de tu armario.
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:"8px", marginBottom:"20px", textAlign:"left" }}>
                  {["✦ Avatar IA personalizado con tu cuerpo real", "✦ Prueba virtual de cualquier outfit", "✦ Análisis de tipo de cuerpo", "✦ Recomendaciones personalizadas"].map(f => (
                    <div key={f} style={{ fontSize:"12px", color:"var(--text2)" }}>{f}</div>
                  ))}
                </div>
                <button className="btn-p">✦  Mejorar a Premium — $299 MXN/mes</button>
              </div>
            ) : (
              <>
                {/* Step 1: Upload photo */}
                <div className="card" style={{ marginBottom:"14px" }}>
                  <div style={{ fontSize:"9px", color:"var(--gold)", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"12px" }}>Paso 1 · Tu foto de cuerpo completo</div>
                  <div className="pbox" style={{ height:"280px", marginBottom:"10px" }} onClick={()=>avatarRef.current?.click()}>
                    {avatarPhoto ? (
                      <img src={avatarPhoto} alt="avatar" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                    ) : (
                      <div style={{ textAlign:"center", color:"var(--text3)" }}>
                        <div style={{ fontSize:"40px", marginBottom:"8px" }}>🧍</div>
                        <div style={{ fontSize:"11px", letterSpacing:"1px", marginBottom:"4px" }}>Sube una foto de cuerpo completo</div>
                        <div style={{ fontSize:"10px", color:"var(--text3)" }}>La IA analizará tu tipo de cuerpo</div>
                      </div>
                    )}
                  </div>
                  {avatarL && (
                    <div style={{ display:"flex", alignItems:"center", gap:"8px", color:"var(--gold)", fontSize:"11px", padding:"6px 0" }}>
                      <div className="dot"/><div className="dot"/><div className="dot"/>
                      <span style={{ marginLeft:"6px" }}>Analizando tu perfil corporal...</span>
                    </div>
                  )}
                  {avatarData && !avatarL && (
                    <div className="fade" style={{ marginTop:"12px" }}>
                      <div style={{ fontSize:"9px", color:"var(--gold)", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"10px" }}>✦ Tu perfil corporal</div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginBottom:"10px" }}>
                        {[
                          { label:"Tipo de cuerpo", value:avatarData.bodyType },
                          { label:"Complexión", value:avatarData.build },
                          { label:"Tono de piel", value:avatarData.skinTone },
                        ].map(item => (
                          <div key={item.label} style={{ background:"#0a0a0a", border:"1px solid var(--border)", borderRadius:"2px", padding:"10px" }}>
                            <div style={{ fontSize:"9px", color:"var(--text3)", letterSpacing:"1px", textTransform:"uppercase", marginBottom:"4px" }}>{item.label}</div>
                            <div style={{ fontSize:"12px" }}>{item.value}</div>
                          </div>
                        ))}
                      </div>
                      {avatarData.styleAdvice && (
                        <div style={{ background:"#0a0a0a", borderLeft:"2px solid rgba(196,151,63,.3)", padding:"12px", marginBottom:"8px" }}>
                          <div style={{ fontSize:"9px", color:"var(--gold)", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"6px" }}>✦ Consejo de estilo</div>
                          <div style={{ fontSize:"12px", color:"var(--text2)", lineHeight:1.7 }}>{avatarData.styleAdvice}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Step 2: Select clothes */}
                {avatarData && (
                  <div className="card" style={{ marginBottom:"14px" }}>
                    <div style={{ fontSize:"9px", color:"var(--gold)", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"12px" }}>Paso 2 · Selecciona prendas para probar</div>
                    {clothes.length === 0 ? (
                      <div style={{ textAlign:"center", padding:"20px", color:"var(--text3)", fontSize:"12px" }}>Agrega prendas a tu armario primero</div>
                    ) : (
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"8px", maxHeight:"300px", overflowY:"auto" }}>
                        {clothes.map(item => (
                          <div key={item.id} onClick={()=>setSelectedForTry(prev=>prev.includes(item.id)?prev.filter(i=>i!==item.id):[...prev,item.id])}
                            style={{ background:selectedForTry.includes(item.id)?"rgba(196,151,63,.1)":"#0a0a0a", border:`1px solid ${selectedForTry.includes(item.id)?"rgba(196,151,63,.4)":"var(--border)"}`, borderRadius:"2px", overflow:"hidden", cursor:"pointer", transition:"all .2s", position:"relative" }}>
                            {selectedForTry.includes(item.id) && (
                              <div style={{ position:"absolute", top:"4px", right:"4px", background:"var(--gold)", borderRadius:"50%", width:"16px", height:"16px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"9px", color:"#080808", fontWeight:600, zIndex:1 }}>✓</div>
                            )}
                            {item.photo_url ? (
                              <img src={item.photo_url} alt={item.name} style={{ width:"100%", aspectRatio:"1", objectFit:"cover" }} />
                            ) : (
                              <div style={{ width:"100%", aspectRatio:"1", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"24px" }}>{CAT_ICON[item.category]||"👔"}</div>
                            )}
                            <div style={{ padding:"5px 7px" }}>
                              <div style={{ fontSize:"9px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedForTry.length > 0 && (
                      <div style={{ marginTop:"12px", fontSize:"11px", color:"var(--gold)" }}>{selectedForTry.length} prenda{selectedForTry.length>1?"s":""} seleccionada{selectedForTry.length>1?"s":""}</div>
                    )}
                  </div>
                )}

                {/* Step 3: Virtual try result */}
                {avatarData && selectedForTry.length > 0 && (
                  <div>
                    <button className="btn-p" onClick={virtualTryOn} disabled={tryL} style={{ marginBottom:"16px" }}>
                      {tryL?"Generando prueba virtual...":"🧍 Probar outfit virtualmente"}
                    </button>
                    {tryL && <div style={{ display:"flex", justifyContent:"center", gap:"6px", padding:"24px" }}><div className="dot"/><div className="dot"/><div className="dot"/></div>}
                    {tryResult && !tryL && (
                      <div className="card card-gold fade">
                        <div style={{ fontSize:"9px", color:"var(--gold)", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"12px" }}>✦ Cómo lucirías</div>
                        <div style={{ fontSize:"13px", color:"var(--text2)", lineHeight:1.8 }}>{tryResult}</div>
                        {avatarData.recommendations && (
                          <div style={{ marginTop:"14px" }}>
                            <div style={{ fontSize:"9px", color:"var(--text3)", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"8px" }}>Recomendaciones adicionales</div>
                            {avatarData.recommendations.slice(0,3).map((r: string, i: number) => (
                              <div key={i} style={{ display:"flex", gap:"8px", padding:"5px 0", borderTop:"1px solid var(--border)" }}>
                                <span style={{ color:"var(--gold)" }}>✦</span>
                                <span style={{ fontSize:"12px", color:"var(--text2)" }}>{r}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* FAVORITES */}
        {tab==="favorites" && (
          <div className="fade">
            <div style={{ marginBottom:"18px" }}>
              <div className="serif" style={{ fontSize:"26px", fontWeight:300 }}>Favoritas</div>
              <div style={{ fontSize:"10px", color:"var(--text3)", marginTop:"3px" }}>{favClothes.length} prendas guardadas</div>
            </div>
            {favClothes.length===0 ? (
              <div style={{ textAlign:"center", padding:"60px 20px" }}>
                <div style={{ fontSize:"40px", marginBottom:"14px", opacity:.3 }}>❤️</div>
                <div style={{ fontSize:"12px", color:"var(--text3)" }}>Aún no tienes favoritas. Toca ❤️ en cualquier prenda.</div>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"11px" }}>
                {favClothes.map(item => (
                  <div key={item.id} className="card" style={{ padding:0, overflow:"hidden", position:"relative" }}>
                    <button onClick={()=>toggleFav(item.id)} style={{ position:"absolute", top:"7px", right:"7px", zIndex:2, background:"rgba(0,0,0,.7)", border:"none", fontSize:"12px", cursor:"pointer", width:"24px", height:"24px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>❤️</button>
                    {item.photo_url ? (
                      <img src={item.photo_url} alt={item.name} style={{ width:"100%", aspectRatio:"1", objectFit:"cover" }} />
                    ) : (
                      <div style={{ width:"100%", aspectRatio:"1", background:"#0a0a0a", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"36px" }}>{CAT_ICON[item.category]||"👔"}</div>
                    )}
                    <div style={{ padding:"9px 11px" }}>
                      <div style={{ fontSize:"12px", fontWeight:400, marginBottom:"2px" }}>{item.name}</div>
                      <div style={{ fontSize:"9px", color:"var(--text3)", letterSpacing:"1.5px", textTransform:"uppercase" }}>{item.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ADVISOR */}
        {tab==="advisor" && (
          <div className="fade" style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 180px)" }}>
            <div style={{ marginBottom:"14px" }}>
              <div className="serif" style={{ fontSize:"26px", fontWeight:300 }}>Asesor IA</div>
              <div style={{ fontSize:"10px", color:"var(--text3)", marginTop:"3px" }}>Powered by Claude AI</div>
            </div>
            <div style={{ display:"flex", gap:"7px", overflowX:"auto", paddingBottom:"10px", marginBottom:"12px" }}>
              {suggestions.map(s => <button key={s} className="chip" onClick={()=>sendChat(s)}>{s}</button>)}
            </div>
            <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:"12px", paddingBottom:"12px" }}>
              {msgs.map((m,i) => (
                <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start", gap:"7px", alignItems:"flex-start" }}>
                  {m.role==="assistant" && <div style={{ fontSize:"12px", marginTop:"5px", color:"var(--gold)", fontFamily:"'Cormorant Garamond',serif", flexShrink:0 }}>✦</div>}
                  <div className={m.role==="user"?"bubble-u":"bubble-a"}>
                    {m.role==="assistant" ? <div dangerouslySetInnerHTML={{ __html:`<p>${renderMd(m.text)}</p>` }} /> : m.text}
                  </div>
                </div>
              ))}
              {cload && (
                <div style={{ display:"flex", gap:"7px", alignItems:"center" }}>
                  <div style={{ color:"var(--gold)", fontSize:"12px", fontFamily:"'Cormorant Garamond',serif" }}>✦</div>
                  <div className="bubble-a"><div style={{ display:"flex", gap:"4px", padding:"2px 0" }}><div className="dot"/><div className="dot"/><div className="dot"/></div></div>
                </div>
              )}
              <div ref={chatEnd}/>
            </div>
            <div style={{ display:"flex", gap:"8px", paddingTop:"12px", borderTop:"1px solid var(--border)" }}>
              <input className="inp" style={{ flex:1 }} placeholder="Pregunta sobre moda, estilo, tendencias..." value={cin} onChange={e=>setCin(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!cload&&sendChat()} />
              <button className="btn-o" style={{ flexShrink:0 }} onClick={()=>sendChat()} disabled={cload||!cin.trim()}>Enviar</button>
            </div>
          </div>
        )}

        {/* TRIP */}
        {tab==="trip" && (
          <div className="fade">
            <div style={{ marginBottom:"20px" }}>
              <div className="serif" style={{ fontSize:"26px", fontWeight:300 }}>Planificador de Viaje</div>
              <div style={{ fontSize:"11px", color:"var(--text3)", marginTop:"3px" }}>La IA organiza tu maleta con tu armario</div>
            </div>
            <div className="card" style={{ marginBottom:"14px" }}>
              <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                <input className="inp" placeholder="¿A dónde vas? (París, Cancún...)" value={tripDest} onChange={e=>setTripDest(e.target.value)} />
                <div style={{ display:"flex", gap:"10px" }}>
                  <input className="inp" placeholder="Días" type="number" min="1" max="30" value={tripDays} onChange={e=>setTripDays(e.target.value)} style={{ width:"90px" }} />
                  <select className="sel" value={tripClima} onChange={e=>setTripClima(e.target.value)}>
                    <option value="">Clima</option>
                    {["Caluroso","Templado","Frío","Lluvioso","Variable"].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ display:"flex", gap:"7px", flexWrap:"wrap" }}>
                  {["Turismo","Playa","Montaña","Negocios","Romántico","Aventura"].map(t => (
                    <button key={t} className={`pill ${tripTipo===t?"on":""}`} onClick={()=>setTripTipo(tripTipo===t?"":t)}>{t}</button>
                  ))}
                </div>
              </div>
            </div>
            <button className="btn-p" onClick={planTrip} disabled={!tripDest||tripL} style={{ marginBottom:"18px" }}>
              {tripL?"Planificando...":"✈  Planificar Maleta con IA"}
            </button>
            {tripL && <div style={{ display:"flex", justifyContent:"center", gap:"6px", padding:"30px" }}><div className="dot"/><div className="dot"/><div className="dot"/></div>}
            {tripR && !tripL && (
              <div className="fade">
                <div className="divider"/>
                {tripR.intro && <div style={{ fontSize:"13px", color:"var(--text2)", lineHeight:1.7, marginBottom:"16px", fontStyle:"italic", borderLeft:"2px solid rgba(196,151,63,.2)", paddingLeft:"12px" }}>{tripR.intro}</div>}
                {tripR.llevar?.map((g: any, i: number) => (
                  <div key={i} className="card" style={{ marginBottom:"10px" }}>
                    <div style={{ fontSize:"9px", color:"var(--gold)", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"10px" }}>✦ {g.categoria}</div>
                    {g.items?.map((item: string, j: number) => (
                      <div key={j} style={{ display:"flex", alignItems:"center", gap:"9px", padding:"6px 0", borderBottom:"1px solid #141414" }}>
                        <div style={{ width:"5px", height:"5px", borderRadius:"50%", background:"var(--gold)", flexShrink:0 }}/>
                        <div style={{ fontSize:"13px" }}>{item}</div>
                      </div>
                    ))}
                    {g.tip && <div style={{ fontSize:"11px", color:"var(--text2)", marginTop:"8px", fontStyle:"italic" }}>💡 {g.tip}</div>}
                  </div>
                ))}
                {tripR.faltan?.length > 0 && (
                  <div className="card" style={{ marginBottom:"10px", borderColor:"rgba(192,57,43,.2)" }}>
                    <div style={{ fontSize:"9px", color:"var(--red)", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"10px" }}>⚠ Te falta comprar</div>
                    {tripR.faltan?.map((item: any, i: number) => (
                      <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid #141414" }}>
                        <div>
                          <div style={{ fontSize:"13px" }}>{item.name}</div>
                          <div style={{ fontSize:"11px", color:"var(--text2)", marginTop:"2px" }}>{item.why}</div>
                        </div>
                        {item.urgente && <span style={{ fontSize:"9px", color:"var(--red)", border:"1px solid rgba(192,57,43,.3)", padding:"3px 8px", borderRadius:"20px" }}>Urgente</span>}
                      </div>
                    ))}
                  </div>
                )}
                {tripR.consejo && (
                  <div style={{ background:"#0a0a0a", borderLeft:"2px solid rgba(196,151,63,.3)", padding:"14px", borderRadius:"0 2px 2px 0" }}>
                    <div style={{ fontSize:"9px", color:"var(--gold)", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"8px" }}>✦ Consejo del estilista</div>
                    <div style={{ fontSize:"12px", color:"var(--text2)", lineHeight:1.8 }}>{tripR.consejo}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </main>

      {/* ── Bottom Navigation ── */}
      <nav className="bnav">
        {[
          { key:"home", icon:"🏠", label:"Inicio" },
          { key:"wardrobe", icon:"👗", label:"Armario" },
          { key:"outfit", icon:"✦", label:"Outfit IA" },
          { key:"avatar", icon:"🧍", label:"Virtual" },
          { key:"favorites", icon:"❤️", label:"Favoritos" },
          { key:"advisor", icon:"💬", label:"Asesor" },
          { key:"trip", icon:"✈️", label:"Viajes" },
        ].map(item => (
          <button key={item.key} className={`bnav-item ${tab===item.key?"on":""}`} onClick={()=>setTab(item.key)}>
            <span className="bnav-icon">{item.icon}</span>
            <span className="bnav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
