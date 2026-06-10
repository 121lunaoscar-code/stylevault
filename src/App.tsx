import { useState, useRef, useEffect } from "react";

const API_URL = "https://stylevault-api.121lunaoscar.workers.dev";
const MODEL = "claude-sonnet-4-5";

const callClaude = async (systemPrompt: string, messages: any[]) => {
  const res = await fetch(API_URL, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, max_tokens: 2000, system: systemPrompt, messages }),
  });
  const data = await res.json();
  return data.content?.map((i: any) => i.text || "").join("") || "";
};

const callClaudeVision = async (systemPrompt: string, images: {base64: string, type: string}[], text: string) => {
  const content: any[] = images.map(img => ({
    type: "image", source: { type: "base64", media_type: img.type, data: img.base64 }
  }));
  content.push({ type: "text", text });
  const res = await fetch(API_URL, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, max_tokens: 3000, system: systemPrompt, messages: [{ role: "user", content }] }),
  });
  const data = await res.json();
  return data.content?.map((i: any) => i.text || "").join("") || "";
};

// Supabase
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

// Constants
const BASE_CATS = ["Tops","Pantalones","Vestidos","Zapatos","Accesorios","Abrigos","Deportivo"];
const OCCASIONS = ["Casual","Trabajo","Formal","Deportivo","Fiesta","Viaje"];
const SEASONS = ["Todo el año","Primavera","Verano","Otoño","Invierno"];
const EVENTS = ["Trabajo / Oficina","Cita romántica","Reunión de negocios","Evento formal","Día casual","Fiesta / Antro","Deporte / Gym","Viaje"];
const CAT_ICON: Record<string,string> = { Tops:"👕", Pantalones:"👖", Vestidos:"👗", Zapatos:"👟", Accesorios:"💍", Abrigos:"🧥", Deportivo:"🏃" };

// System prompts
const ADVISOR_SYSTEM = `Eres StyleVault, asesor de moda experto y sofisticado. Usa markdown: **negrita**, listas. Sé conciso (máx 4 párrafos). Responde en español. Termina con pregunta de seguimiento.`;
const OUTFIT_SYSTEM = `Eres experto en moda. SOLO JSON sin markdown: { outfit: [{emoji,name,why}], explanation: string, colorPalette: string, rating: number 1-5, ratingExplanation: string }`;
const PHOTO_SYSTEM = `Analiza esta prenda. SOLO JSON: { name: string, category: "Tops"|"Pantalones"|"Vestidos"|"Zapatos"|"Accesorios"|"Abrigos"|"Deportivo", color: string, occasion: "Casual"|"Trabajo"|"Formal"|"Deportivo"|"Fiesta"|"Viaje", season: "Todo el año"|"Primavera"|"Verano"|"Otoño"|"Invierno" }`;
const TRIP_SYSTEM = `Eres experto en moda y viajes. SOLO JSON: { intro: string, llevar: [{categoria: string, items: [string], tip: string}], faltan: [{name: string, why: string, urgente: boolean}], consejo: string }`;

const DNA_SYSTEM = `Eres experto en análisis de imagen personal y moda. Analiza estas fotos (selfie frontal, cuerpo completo frontal, cuerpo completo lateral) junto con los datos del usuario.

SOLO responde en JSON válido sin markdown:
{
  "faceShape": string,
  "skinTone": string,
  "skinUndertone": "frío"|"cálido"|"neutro",
  "eyeShape": string,
  "neckType": string,
  "bodyType": string,
  "bodyProportions": { "shoulders": string, "waist": string, "hips": string, "torso": string, "legs": string },
  "posture": string,
  "hairAnalysis": { "length": string, "volume": string, "texture": string },
  "idealColors": [string],
  "colorsToAvoid": [string],
  "recommendedStyles": [string],
  "recommendedClothes": [string],
  "clothesToAvoid": [string],
  "fashionPersonality": string,
  "precisionLevel": number,
  "styleAdvice": string,
  "topTips": [string]
}`;

const VIRTUAL_SYSTEM = `Eres estilista virtual experto. Dado el Fashion DNA del usuario y las prendas seleccionadas, describe detalladamente cómo luciría el outfit en esa persona específicamente. Incluye: cómo cada prenda favorece su tipo de cuerpo, qué colores complementan su tono de piel, y cómo se ve el conjunto completo. Máx 3 párrafos. En español.`;

function renderMd(text: string) {
  return text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\*(.*?)\*/g,'<em>$1</em>').replace(/^- (.*?)$/gm,'<li>$1</li>').replace(/(<li>.*<\/li>\n?)+/g,m=>`<ul>${m}</ul>`).replace(/\n\n/g,'</p><p>').replace(/\n/g,'<br/>');
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&family=Poppins:wght@400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}

/* ── TEMA MUJER (rosa/crema) ── */
:root.mujer {
  --accent:#8B3A52;
  --accent2:#C4748A;
  --accent-light:rgba(139,58,82,.1);
  --accent-glow:rgba(139,58,82,.2);
  --bg:#FBF7F4;
  --bg2:#FFFFFF;
  --bg3:#F5EEE9;
  --border:#E8DDD6;
  --border2:#D4C4BA;
  --text:#2D1B1E;
  --text2:#7A5C64;
  --text3:#B09AA0;
  --card-shadow:0 2px 16px rgba(139,58,82,.08);
  --green:#2E7D52;
  --red:#C0392B;
  --font:'Poppins',sans-serif;
  --font-serif:'Cormorant Garamond',serif;
  --radius:16px;
  --radius-sm:10px;
  --nav-bg:#FFFFFF;
  --header-bg:#FBF7F4;
}

/* ── TEMA HOMBRE (verde oscuro) ── */
:root.hombre {
  --accent:#2D5A3D;
  --accent2:#4A8C5C;
  --accent-light:rgba(45,90,61,.15);
  --accent-glow:rgba(45,90,61,.25);
  --bg:#1A2B1E;
  --bg2:#243328;
  --bg3:#1F2E23;
  --border:#2E4035;
  --border2:#3A5244;
  --text:#F0EDE6;
  --text2:#9DB89F;
  --text3:#5A7A60;
  --card-shadow:0 2px 16px rgba(0,0,0,.3);
  --green:#4CAF70;
  --red:#E74C3C;
  --font:'Jost',sans-serif;
  --font-serif:'Cormorant Garamond',serif;
  --radius:12px;
  --radius-sm:8px;
  --nav-bg:#1A2B1E;
  --header-bg:#1A2B1E;
}

/* ── DEFAULT NEUTRO (login/registro) ── */
:root {
  --accent:#2C2C2C;
  --accent2:#555555;
  --accent-light:rgba(44,44,44,.08);
  --accent-glow:rgba(44,44,44,.15);
  --bg:#F8F8F6;
  --bg2:#FFFFFF;
  --bg3:#F0F0EE;
  --border:#E0E0DC;
  --border2:#CACAC6;
  --text:#1A1A1A;
  --text2:#6B6B6B;
  --text3:#ABABAB;
  --card-shadow:0 2px 16px rgba(0,0,0,.06);
  --green:#2E7D52;
  --red:#C0392B;
  --font:'Poppins',sans-serif;
  --font-serif:'Cormorant Garamond',serif;
  --radius:16px;
  --radius-sm:10px;
  --nav-bg:#FFFFFF;
  --header-bg:#F8F8F6;
}

::-webkit-scrollbar{width:2px}::-webkit-scrollbar-thumb{background:var(--accent2);border-radius:1px}
body{background:var(--bg);font-family:var(--font)}

.sv{background:var(--bg);min-height:100vh;color:var(--text);font-weight:400;max-width:430px;margin:0 auto;position:relative;font-family:var(--font)}
.serif{font-family:var(--font-serif)}

/* Bottom Nav */
.bnav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:var(--nav-bg);border-top:1px solid var(--border);display:flex;z-index:100;padding-bottom:env(safe-area-inset-bottom);box-shadow:0 -4px 20px rgba(0,0,0,.08)}
.bnav-item{flex:1;display:flex;flex-direction:column;align-items:center;padding:10px 0 8px;cursor:pointer;gap:3px;border:none;background:none;transition:all .2s;position:relative}
.bnav-icon{font-size:20px;transition:transform .2s}
.bnav-label{font-size:7px;letter-spacing:1px;text-transform:uppercase;color:var(--text3);font-family:var(--font);transition:color .2s;font-weight:500}
.bnav-item.on .bnav-label{color:var(--accent)}
.bnav-item.on .bnav-icon{transform:scale(1.1)}
.bnav-center{width:52px;height:52px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;margin-top:-20px;box-shadow:0 4px 16px var(--accent-glow);border:3px solid var(--bg);font-size:22px;cursor:pointer;transition:all .2s}
.bnav-center:hover{transform:scale(1.05)}

/* Buttons */
.btn-p{background:var(--accent);color:#fff;border:none;padding:15px 24px;border-radius:var(--radius-sm);cursor:pointer;font-family:var(--font);font-size:13px;font-weight:600;letter-spacing:.5px;width:100%;transition:all .2s;box-shadow:0 4px 14px var(--accent-glow)}
.btn-p:hover{filter:brightness(1.08);transform:translateY(-1px)}
.btn-p:disabled{opacity:.4;cursor:not-allowed;transform:none;box-shadow:none}
.btn-o{background:transparent;color:var(--accent);border:1.5px solid var(--accent);padding:12px 20px;border-radius:var(--radius-sm);cursor:pointer;font-family:var(--font);font-size:12px;font-weight:600;letter-spacing:.3px;transition:all .2s}
.btn-o:hover{background:var(--accent-light)}
.btn-o:disabled{opacity:.3;cursor:not-allowed}
.btn-g{background:transparent;border:none;color:var(--text2);cursor:pointer;font-family:var(--font);font-size:12px;padding:6px 10px;transition:color .2s;font-weight:500}
.btn-g:hover{color:var(--accent)}

/* Inputs */
.inp{background:var(--bg3);border:1.5px solid var(--border);color:var(--text);padding:14px 16px;border-radius:var(--radius-sm);font-family:var(--font);font-size:13px;font-weight:400;width:100%;outline:none;transition:all .2s}
.inp:focus{border-color:var(--accent);background:var(--bg2);box-shadow:0 0 0 3px var(--accent-light)}
.inp::placeholder{color:var(--text3)}
.sel{background:var(--bg3);border:1.5px solid var(--border);color:var(--text);padding:14px 16px;border-radius:var(--radius-sm);font-family:var(--font);font-size:13px;width:100%;cursor:pointer;outline:none}

/* Cards */
.card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:18px;box-shadow:var(--card-shadow)}
.card-accent{border-color:var(--accent2);background:var(--bg2)}
.card-dark{background:var(--accent);color:#fff;border:none}

/* Pills */
.pill{padding:8px 16px;border-radius:30px;font-family:var(--font);font-size:11px;letter-spacing:.3px;cursor:pointer;border:1.5px solid var(--border);background:var(--bg3);color:var(--text2);transition:all .2s;white-space:nowrap;font-weight:500}
.pill.on{background:var(--accent);color:#fff;border-color:var(--accent);font-weight:600;box-shadow:0 3px 10px var(--accent-glow)}
.pill:hover:not(.on){border-color:var(--accent);color:var(--accent);background:var(--accent-light)}

/* Dots loader */
.dot{width:6px;height:6px;border-radius:50%;background:var(--accent);animation:bop 1.2s ease-in-out infinite}
.dot:nth-child(2){animation-delay:.2s}.dot:nth-child(3){animation-delay:.4s}
@keyframes bop{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-8px);opacity:1}}

.divider{height:1px;background:var(--border);margin:18px 0}
.fade{animation:fu .3s ease both}
@keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

.toast{position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:var(--text);color:var(--bg);padding:11px 22px;border-radius:30px;font-size:12px;font-family:var(--font);font-weight:500;letter-spacing:.3px;z-index:999;animation:fu .3s ease;white-space:nowrap;box-shadow:0 4px 20px rgba(0,0,0,.2)}

.pbox{width:100%;border:2px dashed var(--border2);border-radius:var(--radius);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;overflow:hidden;background:var(--bg3);transition:all .2s}
.pbox:hover{border-color:var(--accent);background:var(--accent-light)}

.chip{padding:8px 14px;background:var(--bg3);border:1px solid var(--border);color:var(--text2);border-radius:30px;cursor:pointer;font-family:var(--font);font-size:12px;white-space:nowrap;transition:all .2s;font-weight:500}
.chip:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-light)}

.stars{color:var(--accent);font-size:16px;letter-spacing:1px}

.bubble-u{background:var(--accent);color:#fff;border-radius:18px 18px 4px 18px;padding:12px 16px;max-width:78%;margin-left:auto;font-size:13px;line-height:1.6;box-shadow:0 3px 10px var(--accent-glow)}
.bubble-a{background:var(--bg2);border:1px solid var(--border);border-radius:18px 18px 18px 4px;padding:13px 16px;max-width:86%;font-size:13px;line-height:1.7;color:var(--text2);box-shadow:var(--card-shadow)}
.bubble-a strong{color:var(--text);font-weight:600}
.bubble-a ul{padding-left:16px;margin:6px 0}
.bubble-a li{margin-bottom:4px}
.bubble-a p{margin-bottom:8px}
.bubble-a p:last-child{margin-bottom:0}

.stat-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:16px 12px;text-align:center;flex:1;box-shadow:var(--card-shadow)}

.premium-badge{background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff;font-size:9px;letter-spacing:1px;text-transform:uppercase;padding:4px 10px;border-radius:30px;font-weight:600}

.dna-tag{display:inline-block;padding:5px 12px;border-radius:30px;font-size:11px;letter-spacing:.3px;margin:3px;font-family:var(--font);font-weight:500}
.dna-good{background:rgba(46,125,82,.12);color:var(--green);border:1px solid rgba(46,125,82,.25)}
.dna-avoid{background:rgba(192,57,43,.1);color:var(--red);border:1px solid rgba(192,57,43,.2)}
.dna-style{background:var(--accent-light);color:var(--accent);border:1px solid var(--accent-glow)}

.onboard-step{display:flex;align-items:center;gap:8px;margin-bottom:32px}
.onboard-dot{width:8px;height:8px;border-radius:50%;background:var(--border2);transition:all .3s}
.onboard-dot.on{background:var(--accent);width:24px;border-radius:4px}

.photo-upload-box{border:2px dashed var(--border2);border-radius:var(--radius);padding:20px;text-align:center;cursor:pointer;transition:all .2s;background:var(--bg3)}
.photo-upload-box:hover{border-color:var(--accent);background:var(--accent-light)}
.photo-upload-box.done{border-color:var(--green);background:rgba(46,125,82,.06)}

/* Category icon grid */
.cat-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:16px}
.cat-item{display:flex;flex-direction:column;align-items:center;gap:5px;cursor:pointer;padding:10px 4px;border-radius:var(--radius-sm);transition:all .2s;background:var(--bg3);border:1px solid var(--border)}
.cat-item.on{background:var(--accent-light);border-color:var(--accent)}
.cat-item:hover{background:var(--accent-light)}

/* Section header */
.sec-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
.sec-title{font-size:17px;font-weight:700;color:var(--text)}
`;

export default function StyleVault() {
  // Auth
  const [screen, setScreen] = useState("login");
  const [resetToken, setResetToken] = useState<string|null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [resetL, setResetL] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [lf, setLf] = useState({ name:"", email:"", password:"", genero:"" });
  const [lmode, setLmode] = useState("login");
  const [lerr, setLerr] = useState("");
  const [aloading, setAL] = useState(false);

  // Onboarding
  const [obStep, setObStep] = useState(1);
  const [obInfo, setObInfo] = useState({ nombre:"", edad:"", altura:"", peso:"", ojos:"", cabello:"Lacio", genero:"" });
  const [obPhotos, setObPhotos] = useState<{selfie:string|null, front:string|null, side:string|null}>({ selfie:null, front:null, side:null });
  const [obPhotoFiles, setObPhotoFiles] = useState<{selfie:File|null, front:File|null, side:File|null}>({ selfie:null, front:null, side:null });
  const [obAnalyzing, setObAnalyzing] = useState(false);
  const [obAnalysisStep, setObAnalysisStep] = useState("");
  const selfieRef = useRef<HTMLInputElement>(null);
  const frontRef = useRef<HTMLInputElement>(null);
  const sideRef = useRef<HTMLInputElement>(null);

  // DNA
  const [dna, setDna] = useState<any>(() => {
    const d = localStorage.getItem("sv_dna");
    return d ? JSON.parse(d) : null;
  });

  // Apply theme based on gender
  const applyTheme = (genero: string) => {
    const root = document.documentElement;
    if (genero === "Mujer") { root.className = "mujer"; }
    else if (genero === "Hombre") { root.className = "hombre"; }
    else { root.className = ""; }
  };

  useEffect(() => {
    const savedDna = localStorage.getItem("sv_dna");
    if (savedDna) {
      const d = JSON.parse(savedDna);
      applyTheme(d.genero || d.userInfo?.genero || "");
    }
  }, []);

  // App
  const [tab, setTab] = useState("home");
  const [clothes, setClothes] = useState<any[]>([]);
  const [customCats, setCustomCats] = useState<string[]>(() => JSON.parse(localStorage.getItem("sv_custom_cats") || "[]"));
  const [newCatInput, setNewCatInput] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);
  const [favorites, setFavorites] = useState<number[]>(() => JSON.parse(localStorage.getItem("sv_favorites") || "[]"));
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

  // Virtual try
  const [selectedForTry, setSelectedForTry] = useState<number[]>([]);
  const [tryResult, setTryResult] = useState<string|null>(null);
  const [tryL, setTryL] = useState(false);

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
    // Check recovery token
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
    const saved = localStorage.getItem("sb_profile");
    if (saved) {
      const p = JSON.parse(saved);
      setProfile(p);
      const savedDna = localStorage.getItem("sv_dna");
      const savedGenero = localStorage.getItem("sv_genero") || p.genero || "";
      applyTheme(savedDna ? (JSON.parse(savedDna).genero || savedGenero) : savedGenero);
      setScreen("app");
    }
  }, []);

  // Auth
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
      setProfile(p);
      setScreen("app");
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
      const newProfile = { id: auth.user?.id, name: lf.name, email: lf.email, plan: "Basic", status: "active", created_at: new Date().toISOString(), genero: lf.genero };
      await dbInsert("users", newProfile);
      localStorage.setItem("sb_profile", JSON.stringify(newProfile));
      localStorage.setItem("sv_genero", lf.genero);
      setProfile(newProfile);
      applyTheme(lf.genero);
      setScreen("app");
    } catch { setLerr("Error al crear cuenta."); }
    setAL(false);
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) { setResetMsg("La contraseña debe tener al menos 6 caracteres."); return; }
    setResetL(true);
    try {
      const res = await fetch(`${SB_URL}/auth/v1/user`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", apikey: SB_KEY, Authorization: `Bearer ${resetToken}` },
        body: JSON.stringify({ password: newPassword }),
      });
      if (res.ok) { setResetMsg("✅ Contraseña actualizada. Ahora puedes iniciar sesión."); setTimeout(() => setScreen("login"), 2500); }
      else setResetMsg("Error al actualizar. El link puede haber expirado.");
    } catch { setResetMsg("Error de conexión."); }
    setResetL(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("sb_token"); localStorage.removeItem("sb_profile");
    setProfile(null); setClothes([]); setScreen("login");
  };

  // Onboarding photo handler
  const handleObPhoto = (type: "selfie"|"front"|"side") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setObPhotos(prev => ({ ...prev, [type]: dataUrl }));
      setObPhotoFiles(prev => ({ ...prev, [type]: f }));
    };
    r.readAsDataURL(f);
  };

  // Analyze with AI
  const analyzeWithAI = async () => {
    if (!obPhotos.selfie || !obPhotos.front || !obPhotos.side) { showToast("Sube las 3 fotos para continuar"); return; }
    setObAnalyzing(true);

    try {
      setObAnalysisStep("Analizando rasgos faciales...");
      await new Promise(r => setTimeout(r, 800));
      setObAnalysisStep("Analizando tipo de cuerpo y proporciones...");
      await new Promise(r => setTimeout(r, 800));
      setObAnalysisStep("Analizando tono de piel y colores ideales...");
      await new Promise(r => setTimeout(r, 800));
      setObAnalysisStep("Creando tu Fashion DNA™...");

      const images = [
        { base64: obPhotos.selfie.split(',')[1], type: obPhotoFiles.selfie!.type },
        { base64: obPhotos.front.split(',')[1], type: obPhotoFiles.front!.type },
        { base64: obPhotos.side.split(',')[1], type: obPhotoFiles.side!.type },
      ];

      const userContext = `Datos del usuario: Nombre: ${obInfo.nombre}, Edad: ${obInfo.edad} años, Altura: ${obInfo.altura} cm, Peso: ${obInfo.peso} kg, Color de ojos: ${obInfo.ojos}, Tipo de cabello: ${obInfo.cabello}, Género: ${obInfo.genero}.`;

      const raw = await callClaudeVision(DNA_SYSTEM, images, userContext + " Analiza las 3 fotos y genera el Fashion DNA completo.");
      const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());

      const dnaData = { ...parsed, userInfo: obInfo, genero: obInfo.genero, createdAt: new Date().toISOString() };
      setDna(dnaData);
      localStorage.setItem("sv_dna", JSON.stringify(dnaData));
      applyTheme(obInfo.genero);

      // Save to Supabase if possible
      try {
        await dbUpdate("users", `id=eq.${profile?.id}`, { dna_profile: dnaData });
      } catch {}

      setObAnalysisStep("¡Tu Fashion DNA™ está listo!");
      await new Promise(r => setTimeout(r, 1000));
      setObStep(4); // Result step
    } catch {
      showToast("Error al analizar. Intenta de nuevo.");
    }
    setObAnalyzing(false);
  };

  // Clothes
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
      setPp(dataUrl); setAnalyzing(true);
      try {
        const base64 = dataUrl.split(',')[1];
        const images = [{ base64, type: f.type }];
        const text = await callClaudeVision(PHOTO_SYSTEM, images, "Analiza esta prenda.");
        const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
        setNi(prev => ({ ...prev, name: parsed.name||prev.name, category: parsed.category||prev.category, season: parsed.season||prev.season, occasion: parsed.occasion||prev.occasion }));
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
  };

  const toggleFav = (id: number) => {
    const next = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
    setFavorites(next); localStorage.setItem("sv_favorites", JSON.stringify(next));
  };

  // Outfit
  const generateOutfit = async () => {
    if (!selEv) return;
    setOL(true); setOR(null);
    const list = clothes.map(c => `${c.name} (${c.category}, ${c.occasion||""})`).join("\n");
    const dnaCtx = dna ? `\nFashion DNA del usuario: Tipo de cuerpo: ${dna.bodyType}, Tono: ${dna.skinTone}, Subtono: ${dna.skinUndertone}, Colores ideales: ${dna.idealColors?.join(", ")}.` : "";
    try {
      const raw = await callClaude(OUTFIT_SYSTEM, [{ role:"user", content:`Armario:\n${list}\n\nEvento: ${selEv}\nTemporada: ${selSe}${dnaCtx}\n\nCrea el outfit ideal personalizado para este usuario y califícalo.` }]);
      setOR(JSON.parse(raw.replace(/```json|```/g,"").trim()));
      showToast("✦ Outfit creado");
    } catch { setOR({ outfit:[], explanation:"Error.", colorPalette:"", rating:0, ratingExplanation:"" }); }
    setOL(false);
  };

  // Chat
  const sendChat = async (msg?: string) => {
    const m = msg || cin; if (!m.trim()) return;
    const next = [...msgs, { role:"user", text:m }];
    setMsgs(next); setCin(""); setCload(true);
    const dnaCtx = dna ? `\nFashion DNA: Tipo de cuerpo: ${dna.bodyType}, Tono: ${dna.skinTone}, Subtono: ${dna.skinUndertone}, Colores ideales: ${dna.idealColors?.join(", ")}, Prendas recomendadas: ${dna.recommendedClothes?.slice(0,5).join(", ")}.` : "";
    const wardrobeCtx = clothes.length > 0 ? `\nArmario: ${clothes.slice(0,15).map(c=>`${c.name} (${c.category})`).join(", ")}` : "";
    try {
      const reply = await callClaude(ADVISOR_SYSTEM + dnaCtx + wardrobeCtx, next.map(x=>({ role:x.role==="assistant"?"assistant":"user", content:x.text })));
      setMsgs([...next, { role:"assistant", text:reply }]);
    } catch { setMsgs([...next, { role:"assistant", text:"Error de conexión." }]); }
    setCload(false);
  };

  // Virtual try
  const virtualTryOn = async () => {
    if (!dna || selectedForTry.length === 0) return;
    setTryL(true); setTryResult(null);
    const prendas = clothes.filter(c => selectedForTry.includes(c.id)).map(c => `${c.name} (${c.category}, color: ${c.color})`).join(", ");
    const perfil = `Tipo de cuerpo: ${dna.bodyType}, Proporciones: hombros ${dna.bodyProportions?.shoulders}, cintura ${dna.bodyProportions?.waist}, caderas ${dna.bodyProportions?.hips}. Tono de piel: ${dna.skinTone} (${dna.skinUndertone}). Colores ideales: ${dna.idealColors?.join(", ")}.`;
    try {
      const result = await callClaude(VIRTUAL_SYSTEM, [{ role:"user", content:`Fashion DNA:\n${perfil}\n\nOutfit seleccionado:\n${prendas}\n\nDescribe cómo luciría este outfit en esta persona específicamente.` }]);
      setTryResult(result);
    } catch { setTryResult("Error al procesar."); }
    setTryL(false);
  };

  // Trip
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

  const allCategories = [...BASE_CATS, ...customCats];
  const addCustomCategory = () => {
    const cat = newCatInput.trim();
    if (!cat || allCategories.includes(cat)) return;
    const next = [...customCats, cat];
    setCustomCats(next); localStorage.setItem("sv_custom_cats", JSON.stringify(next));
    setNewCatInput(""); setShowAddCat(false); showToast("✦ Categoría agregada");
  };
  const removeCustomCategory = (cat: string) => {
    const next = customCats.filter(c => c !== cat);
    setCustomCats(next); localStorage.setItem("sv_custom_cats", JSON.stringify(next));
  };

  const filtered = clothes.filter(c => fc === "Todo" || c.category === fc);
  const favClothes = clothes.filter(c => favorites.includes(c.id));
  const isPremium = profile?.plan === "Premium" || profile?.plan === "Admin";
  const renderStars = (n: number) => "★".repeat(Math.min(5,Math.max(0,Math.round(n)))) + "☆".repeat(5-Math.min(5,Math.max(0,Math.round(n))));
  const suggestions = ["¿Qué colores van con mi tono de piel?","Armario cápsula para mi tipo de cuerpo","¿Cómo vestir para entrevista?","Prendas que me favorecen más"];

  // Reset to neutral theme on login/reset screens
  if (screen === "login" || screen === "reset") {
    document.documentElement.className = "";
  }

  // ── RESET PASSWORD ────────────────────────────────────────────────────────
  if (screen === "reset") return (
    <div style={{ fontFamily:"'Jost',sans-serif", background:"#080808", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <style>{CSS}</style>
      <div style={{ width:"100%", maxWidth:"360px" }}>
        <div style={{ textAlign:"center", marginBottom:"40px" }}>
          <div className="serif" style={{ fontSize:"36px", letterSpacing:"8px", color:"#C4973F", fontWeight:300 }}>STYLE<em>VAULT</em></div>
        </div>
        <div className="card">
          <div style={{ fontSize:"9px", color:"var(--gold)", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"20px" }}>✦ Nueva Contraseña</div>
          <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
            <input className="inp" placeholder="Nueva contraseña (mínimo 6 caracteres)" type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleResetPassword()} />
            {resetMsg && <div style={{ color:resetMsg.startsWith("✅")?"var(--green)":"var(--red)", fontSize:"12px", textAlign:"center" }}>{resetMsg}</div>}
            <button className="btn-p" onClick={handleResetPassword} disabled={resetL}>{resetL?"Actualizando...":"✦  Actualizar Contraseña"}</button>
            <button onClick={()=>setScreen("login")} style={{ background:"none", border:"none", color:"var(--text3)", fontSize:"10px", cursor:"pointer", letterSpacing:"1.5px", fontFamily:"'Jost',sans-serif", textDecoration:"underline", textAlign:"center" }}>Volver al inicio</button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  if (screen === "login") return (
    <div style={{ fontFamily:"'Jost',sans-serif", background:"#080808", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <style>{CSS}</style>
      <div style={{ width:"100%", maxWidth:"360px" }}>
        <div style={{ textAlign:"center", marginBottom:"40px" }}>
          <div style={{ fontSize:"26px", fontWeight:800, color:"var(--text)", letterSpacing:"-0.5px", marginBottom:"4px" }}>
            STYLE<span style={{ color:"var(--accent)" }}>VAULT</span>
          </div>
          <div style={{ fontSize:"11px", letterSpacing:"2px", color:"var(--text3)", textTransform:"uppercase", fontWeight:500 }}>Armario Inteligente con IA</div>
        </div>
        <div className="card">
          <div style={{ display:"flex", marginBottom:"24px", borderBottom:"1px solid var(--border)" }}>
            {["login","register"].map(m => (
              <button key={m} onClick={()=>{setLmode(m);setLerr("");}} style={{ flex:1, padding:"11px", background:"none", border:"none", borderBottom:`2px solid ${lmode===m?"var(--gold)":"transparent"}`, color:lmode===m?"var(--gold)":"var(--text3)", cursor:"pointer", fontFamily:"'Jost',sans-serif", fontSize:"9px", letterSpacing:"3px", textTransform:"uppercase", fontWeight:500 }}>
                {m==="login"?"Iniciar Sesión":"Registrarse"}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:"11px" }}>
            {lmode==="register" && (
              <>
                <input className="inp" placeholder="Tu nombre completo" value={lf.name} onChange={e=>setLf(p=>({...p,name:e.target.value}))} />
                <div>
                  <div style={{ fontSize:"11px", color:"var(--text2)", fontWeight:600, marginBottom:"8px" }}>¿Cómo te identificas?</div>
                  <div style={{ display:"flex", gap:"8px" }}>
                    {[{id:"Mujer",icon:"👩",label:"Mujer"},{id:"Hombre",icon:"👨",label:"Hombre"},{id:"Otro",icon:"⭐",label:"Otro"}].map(g => (
                      <button key={g.id} type="button" onClick={()=>setLf(p=>({...p,genero:g.id}))}
                        style={{ flex:1, padding:"12px 6px", background:lf.genero===g.id?"var(--accent)":"var(--bg3)", color:lf.genero===g.id?"#fff":"var(--text2)", border:`2px solid ${lf.genero===g.id?"var(--accent)":"var(--border)"}`, borderRadius:"var(--radius-sm)", cursor:"pointer", fontFamily:"var(--font)", fontSize:"12px", fontWeight:600, transition:"all .2s" }}>
                        <div style={{ fontSize:"18px", marginBottom:"2px" }}>{g.icon}</div>
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            <input className="inp" placeholder="Correo electrónico" type="email" value={lf.email} onChange={e=>setLf(p=>({...p,email:e.target.value}))} />
            <input className="inp" placeholder="Contraseña" type="password" value={lf.password} onChange={e=>setLf(p=>({...p,password:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&(lmode==="login"?handleLogin():handleRegister())} />
            {lerr && <div style={{ color:"var(--red)", fontSize:"12px", textAlign:"center" }}>{lerr}</div>}
            <button className="btn-p" style={{ marginTop:"6px" }} onClick={lmode==="login"?handleLogin:handleRegister} disabled={aloading}>
              {aloading?"...":lmode==="login"?"✦  Entrar":"✦  Crear Cuenta"}
            </button>
            {lmode==="login" && (
              <button onClick={async()=>{
                if (!lf.email) { setLerr("Escribe tu correo primero"); return; }
                const res = await fetch(`${SB_URL}/auth/v1/recover`, { method:"POST", headers:{"Content-Type":"application/json", apikey:SB_KEY, Authorization:`Bearer ${SB_KEY}`}, body:JSON.stringify({ email:lf.email }) });
                setLerr(res.ok?"✅ Revisa tu correo para recuperar tu contraseña":"Error al enviar.");
              }} style={{ background:"none", border:"none", color:"var(--text3)", fontSize:"10px", cursor:"pointer", letterSpacing:"1.5px", fontFamily:"'Jost',sans-serif", textDecoration:"underline", textAlign:"center" }}>
                ¿Olvidaste tu contraseña?
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // ── ONBOARDING ────────────────────────────────────────────────────────────
  if (screen === "onboarding") return (
    <div className="sv fade">
      <style>{CSS}</style>
      {toast && <div className="toast">{toast}</div>}
      <div style={{ padding:"24px 20px 40px", minHeight:"100vh", background:"var(--bg)" }}>

        {/* Step indicators */}
        {obStep < 4 && (
          <div className="onboard-step">
            {[1,2,3].map(s => <div key={s} className={`onboard-dot ${obStep===s?"on":""}`} />)}
          </div>
        )}

        {/* STEP 1: Welcome */}
        {obStep===1 && (
          <div className="fade">
            <div style={{ textAlign:"center", marginBottom:"40px" }}>
              <div className="serif" style={{ fontSize:"22px", letterSpacing:"6px", color:"var(--gold)", fontWeight:300, marginBottom:"24px" }}>STYLE<em>VAULT</em></div>
              <div style={{ fontSize:"48px", marginBottom:"20px" }}>🧬</div>
              <div className="serif" style={{ fontSize:"32px", fontWeight:300, marginBottom:"12px" }}>Crea tu Avatar IA</div>
              <div style={{ fontSize:"14px", color:"var(--text2)", lineHeight:1.7, maxWidth:"320px", margin:"0 auto" }}>
                Tu estilista personal necesita conocerte para crear una versión digital de ti y darte recomendaciones perfectas.
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"12px", marginBottom:"32px" }}>
              {["Análisis facial y corporal con IA", "Fashion DNA™ personalizado", "Recomendaciones basadas en tu cuerpo real", "Prueba outfits antes de vestirte"].map(f => (
                <div key={f} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"12px", background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"2px" }}>
                  <div style={{ color:"var(--gold)", fontSize:"14px" }}>✦</div>
                  <div style={{ fontSize:"13px", color:"var(--text2)" }}>{f}</div>
                </div>
              ))}
            </div>
            <button className="btn-p" onClick={()=>setObStep(2)}>Comenzar →</button>
            <button onClick={()=>{ setScreen("app"); }} style={{ background:"none", border:"none", color:"var(--text2)", fontSize:"11px", cursor:"pointer", letterSpacing:"1px", fontFamily:"'Jost',sans-serif", textDecoration:"underline", textAlign:"center", width:"100%", marginTop:"16px", padding:"8px" }}>
              Omitir — configurar después
            </button>
          </div>
        )}

        {/* STEP 2: Basic info */}
        {obStep===2 && (
          <div className="fade">
            <div style={{ marginBottom:"28px" }}>
              <div className="serif" style={{ fontSize:"28px", fontWeight:300, marginBottom:"8px" }}>Información básica</div>
              <div style={{ fontSize:"12px", color:"var(--text2)" }}>Solo lo que la IA no puede detectar por sí sola</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"12px", marginBottom:"24px" }}>
              <div>
                <div style={{ fontSize:"13px", fontWeight:600, color:"var(--text)", marginBottom:"12px" }}>¿Cómo te identificas?</div>
                <div style={{ display:"flex", gap:"10px", marginBottom:"20px" }}>
                  {["Mujer","Hombre","Prefiero no decir"].map(g => (
                    <button key={g} onClick={()=>{ setObInfo(p=>({...p,genero:g})); applyTheme(g); }}
                      style={{ flex:1, padding:"14px 8px", background:obInfo.genero===g?"var(--accent)":"var(--bg3)", color:obInfo.genero===g?"#fff":"var(--text2)", border:`2px solid ${obInfo.genero===g?"var(--accent)":"var(--border)"}`, borderRadius:"var(--radius-sm)", cursor:"pointer", fontFamily:"var(--font)", fontSize:"12px", fontWeight:600, transition:"all .2s" }}>
                      {g==="Mujer"?"👩":g==="Hombre"?"👨":"⭐"} {g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize:"11px", fontWeight:600, color:"var(--text2)", letterSpacing:".5px", marginBottom:"6px" }}>Nombre</div>
                <input className="inp" placeholder="Tu nombre" value={obInfo.nombre} onChange={e=>setObInfo(p=>({...p,nombre:e.target.value}))} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
                <div>
                  <div style={{ fontSize:"9px", color:"var(--text2)", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"6px" }}>Edad</div>
                  <input className="inp" placeholder="Años" type="number" value={obInfo.edad} onChange={e=>setObInfo(p=>({...p,edad:e.target.value}))} />
                </div>
                <div>
                  <div style={{ fontSize:"9px", color:"var(--text2)", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"6px" }}>Altura (cm)</div>
                  <input className="inp" placeholder="170" type="number" value={obInfo.altura} onChange={e=>setObInfo(p=>({...p,altura:e.target.value}))} />
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
                <div>
                  <div style={{ fontSize:"9px", color:"var(--text2)", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"6px" }}>Peso aprox. (kg)</div>
                  <input className="inp" placeholder="70" type="number" value={obInfo.peso} onChange={e=>setObInfo(p=>({...p,peso:e.target.value}))} />
                </div>
                <div>
                  <div style={{ fontSize:"9px", color:"var(--text2)", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"6px" }}>Color de ojos</div>
                  <input className="inp" placeholder="Café, verde..." value={obInfo.ojos} onChange={e=>setObInfo(p=>({...p,ojos:e.target.value}))} />
                </div>
              </div>
              <div>
                <div style={{ fontSize:"9px", color:"var(--text2)", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"10px" }}>Tipo de cabello</div>
                <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                  {["Lacio","Ondulado","Rizado","Afro"].map(t => (
                    <button key={t} className={`pill ${obInfo.cabello===t?"on":""}`} onClick={()=>setObInfo(p=>({...p,cabello:t}))}>{t}</button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display:"flex", gap:"10px" }}>
              <button className="btn-o" onClick={()=>setObStep(1)}>← Atrás</button>
              <button className="btn-p" onClick={()=>setObStep(3)} disabled={!obInfo.nombre||!obInfo.altura} style={{ flex:1 }}>Continuar →</button>
            </div>
          </div>
        )}

        {/* STEP 3: Photos */}
        {obStep===3 && (
          <div className="fade">
            <div style={{ marginBottom:"24px" }}>
              <div className="serif" style={{ fontSize:"28px", fontWeight:300, marginBottom:"8px" }}>Escaneo Inteligente</div>
              <div style={{ fontSize:"12px", color:"var(--text2)" }}>3 fotos para crear tu avatar con máxima precisión</div>
            </div>

            <input ref={selfieRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleObPhoto("selfie")} />
            <input ref={frontRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleObPhoto("front")} />
            <input ref={sideRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleObPhoto("side")} />

            <div style={{ display:"flex", flexDirection:"column", gap:"14px", marginBottom:"24px" }}>
              {[
                { key:"selfie", ref:selfieRef, label:"Foto 1 · Selfie frontal", tips:["Buena iluminación","Sin lentes oscuros","Rostro completamente visible"], icon:"🤳" },
                { key:"front", ref:frontRef, label:"Foto 2 · Cuerpo completo frontal", tips:["De pie","Brazos relajados","Fondo simple"], icon:"🧍" },
                { key:"side", ref:sideRef, label:"Foto 3 · Cuerpo completo lateral", tips:["Perfil completo","Fondo simple"], icon:"🚶" },
              ].map(({ key, ref, label, tips, icon }) => (
                <div key={key} className={`photo-upload-box ${obPhotos[key as keyof typeof obPhotos]?"done":""}`} onClick={()=>ref.current?.click()}>
                  {obPhotos[key as keyof typeof obPhotos] ? (
                    <div style={{ display:"flex", alignItems:"center", gap:"12px", padding:"4px 0" }}>
                      <img src={obPhotos[key as keyof typeof obPhotos]!} alt={key} style={{ width:"60px", height:"60px", objectFit:"cover", borderRadius:"2px" }} />
                      <div>
                        <div style={{ fontSize:"12px", color:"var(--green)", marginBottom:"4px" }}>✓ {label}</div>
                        <div style={{ fontSize:"10px", color:"var(--text2)" }}>Toca para cambiar</div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize:"32px", marginBottom:"8px" }}>{icon}</div>
                      <div style={{ fontSize:"12px", fontWeight:500, marginBottom:"8px" }}>{label}</div>
                      <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", justifyContent:"center" }}>
                        {tips.map(t => <span key={t} style={{ fontSize:"10px", color:"var(--text2)", background:"var(--bg2)", padding:"3px 8px", borderRadius:"20px", border:"1px solid var(--border)" }}>{t}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {obAnalyzing ? (
              <div style={{ textAlign:"center", padding:"20px" }}>
                <div style={{ display:"flex", justifyContent:"center", gap:"6px", marginBottom:"16px" }}>
                  <div className="dot"/><div className="dot"/><div className="dot"/>
                </div>
                <div style={{ fontSize:"13px", color:"var(--gold)" }}>{obAnalysisStep}</div>
              </div>
            ) : (
              <div style={{ display:"flex", gap:"10px" }}>
                <button className="btn-o" onClick={()=>setObStep(2)}>← Atrás</button>
                <button className="btn-p" onClick={analyzeWithAI} disabled={!obPhotos.selfie||!obPhotos.front||!obPhotos.side} style={{ flex:1 }}>
                  🧬 Analizar con IA
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: DNA Result */}
        {obStep===4 && dna && (
          <div className="fade">
            <div style={{ textAlign:"center", marginBottom:"28px" }}>
              <div style={{ fontSize:"40px", marginBottom:"12px" }}>🎉</div>
              <div className="serif" style={{ fontSize:"28px", fontWeight:300, marginBottom:"8px" }}>Tu Avatar IA está listo</div>
              <div style={{ fontSize:"12px", color:"var(--text2)" }}>Nivel de precisión: {dna.precisionLevel || 92}%</div>
            </div>

            {/* DNA Card */}
            <div className="card card-accent" style={{ marginBottom:"14px" }}>
              <div style={{ fontSize:"9px", color:"var(--gold)", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"16px" }}>✦ Fashion DNA™</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"16px" }}>
                {[
                  { label:"Tipo de cuerpo", value:dna.bodyType },
                  { label:"Tono de piel", value:dna.skinTone },
                  { label:"Subtono", value:dna.skinUndertone },
                  { label:"Forma de rostro", value:dna.faceShape },
                  { label:"Cuello", value:dna.neckType },
                  { label:"Postura", value:dna.posture },
                ].map(item => (
                  <div key={item.label} style={{ background:"var(--bg)", border:"1px solid var(--border)", borderRadius:"2px", padding:"10px" }}>
                    <div style={{ fontSize:"9px", color:"var(--text3)", letterSpacing:"1px", textTransform:"uppercase", marginBottom:"4px" }}>{item.label}</div>
                    <div style={{ fontSize:"12px", color:"var(--text)" }}>{item.value || "—"}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom:"14px" }}>
                <div style={{ fontSize:"9px", color:"var(--text2)", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"8px" }}>Colores ideales</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"4px" }}>
                  {dna.idealColors?.map((c: string) => <span key={c} className="dna-tag dna-good">{c}</span>)}
                </div>
              </div>

              <div style={{ marginBottom:"14px" }}>
                <div style={{ fontSize:"9px", color:"var(--text2)", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"8px" }}>Estilos recomendados</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"4px" }}>
                  {dna.recommendedStyles?.map((s: string) => <span key={s} className="dna-tag dna-style">{s}</span>)}
                </div>
              </div>

              {dna.styleAdvice && (
                <div style={{ background:"var(--bg)", borderLeft:"2px solid rgba(196,151,63,.3)", padding:"12px", borderRadius:"0 2px 2px 0" }}>
                  <div style={{ fontSize:"12px", color:"var(--text2)", lineHeight:1.7 }}>{dna.styleAdvice}</div>
                </div>
              )}
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
              <button className="btn-p" onClick={()=>{ setScreen("app"); }}>Ver mi Armario →</button>
              <button className="btn-o" onClick={()=>{ setTab("outfit"); setScreen("app"); }}>Crear mi primer outfit</button>
            </div>
          </div>
        )}
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

      <header style={{ padding:"16px 18px 12px", background:"var(--header-bg)", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, zIndex:50, borderBottom:"1px solid var(--border)" }}>
        <div>
          <div style={{ fontSize:"18px", fontWeight:700, color:"var(--text)", letterSpacing:"-0.5px", fontFamily:"var(--font)" }}>
            STYLE<span style={{ color:"var(--accent)" }}>VAULT</span>
          </div>
          <div style={{ fontSize:"9px", letterSpacing:"2px", color:"var(--text3)", marginTop:"1px", textTransform:"uppercase", fontWeight:500 }}>Armario Inteligente</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          {isPremium && <span className="premium-badge">Premium</span>}
          <div style={{ textAlign:"right", cursor:"pointer", padding:"6px 10px", background:"var(--bg3)", borderRadius:"30px", border:"1px solid var(--border)" }} onClick={handleLogout}>
            <div style={{ fontSize:"12px", fontWeight:600, color:"var(--text)" }}>{profile?.name?.split(" ")[0]}</div>
            <div style={{ fontSize:"9px", color:"var(--accent)", fontWeight:500 }}>Salir</div>
          </div>
        </div>
      </header>

      <main style={{ padding:"16px 14px 90px", overflowY:"auto" }}>

        {/* HOME */}
        {tab==="home" && (
          <div className="fade">
            {/* Hero */}
            <div style={{ background:`linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%)`, borderRadius:"var(--radius)", padding:"22px 20px", marginBottom:"18px", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", right:"-10px", top:"-10px", width:"120px", height:"120px", background:"rgba(255,255,255,.08)", borderRadius:"50%" }}/>
              <div style={{ position:"absolute", right:"20px", bottom:"-20px", width:"80px", height:"80px", background:"rgba(255,255,255,.06)", borderRadius:"50%" }}/>
              <div style={{ fontSize:"22px", fontWeight:700, color:"#fff", marginBottom:"4px" }}>Hola, {profile?.name?.split(" ")[0]} 👋</div>
              <div style={{ fontSize:"13px", color:"rgba(255,255,255,.75)", marginBottom:"16px" }}>
                {dna?.bodyType ? `Tu estilo personal está listo` : "Tu armario inteligente te espera"}
              </div>
              {dna?.bodyType && (
                <div style={{ display:"inline-flex", alignItems:"center", gap:"6px", background:"rgba(255,255,255,.15)", borderRadius:"30px", padding:"6px 14px" }}>
                  <span style={{ fontSize:"11px", color:"#fff", fontWeight:600 }}>✦ {dna.bodyType}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div style={{ display:"flex", gap:"10px", marginBottom:"18px" }}>
              {[
                { label:"Prendas", value:clothes.length, icon:"👗" },
                { label:"Favoritas", value:favClothes.length, icon:"❤️" },
                { label:"Outfits", value:outfitR?1:0, icon:"✨" },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <div style={{ fontSize:"22px", marginBottom:"6px" }}>{s.icon}</div>
                  <div style={{ fontSize:"24px", fontWeight:700, color:"var(--accent)", marginBottom:"2px" }}>{s.value}</div>
                  <div style={{ fontSize:"10px", color:"var(--text2)", fontWeight:500 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* DNA Preview */}
            {dna?.bodyType ? (
              <div className="card card-accent" style={{ marginBottom:"14px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
                  <div style={{ fontSize:"9px", color:"var(--gold)", letterSpacing:"3px", textTransform:"uppercase" }}>✦ Tu Fashion DNA™</div>
                  <button className="btn-g" onClick={()=>setTab("dna")}>Ver completo →</button>
                </div>
                <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                  {dna.idealColors?.slice(0,4).map((c: string) => <span key={c} className="dna-tag dna-good">{c}</span>)}
                  {dna.recommendedStyles?.slice(0,2).map((s: string) => <span key={s} className="dna-tag dna-style">{s}</span>)}
                </div>
              </div>
            ) : (
              <div className="card" style={{ marginBottom:"14px", borderColor:"rgba(196,151,63,.15)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ fontSize:"9px", color:"var(--gold)", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"6px" }}>🧬 Fashion DNA™</div>
                    <div style={{ fontSize:"12px", color:"var(--text2)", lineHeight:1.5 }}>Crea tu perfil para recomendaciones personalizadas</div>
                  </div>
                  <button className="btn-o" style={{ fontSize:"9px", padding:"7px 12px", flexShrink:0, marginLeft:"12px" }} onClick={()=>setScreen("onboarding")}>Crear →</button>
                </div>
              </div>
            )}

            {/* Outfit del día */}
            <div className="card card-accent" style={{ marginBottom:"14px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
                <div>
                  <div style={{ fontSize:"13px", fontWeight:700, color:"var(--text)" }}>Outfit del día</div>
                  <div style={{ fontSize:"12px", color:"var(--text2)", marginTop:"2px" }}>Personalizado para ti ✦</div>
                </div>
                <button className="btn-o" style={{ fontSize:"9px", padding:"7px 12px" }} onClick={()=>setTab("outfit")}>Crear →</button>
              </div>
              {outfitR ? (
                <div>
                  <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"8px" }}>
                    {outfitR.outfit?.slice(0,3).map((item: any, i: number) => (
                      <div key={i} style={{ background:"var(--bg)", border:"1px solid var(--border)", borderRadius:"2px", padding:"7px 11px", fontSize:"12px" }}>{item.emoji} {item.name}</div>
                    ))}
                  </div>
                  {outfitR.rating > 0 && <div className="stars">{renderStars(outfitR.rating)} <span style={{ fontSize:"11px", color:"var(--text3)" }}>{outfitR.rating}/5</span></div>}
                </div>
              ) : (
                <div style={{ textAlign:"center", padding:"16px", color:"var(--text3)", fontSize:"12px" }}>
                  {clothes.length === 0 ? "Agrega prendas para generar outfits" : "Toca 'Crear' para generar tu outfit"}
                </div>
              )}
            </div>

            {/* Virtual Try promo */}
            <div className="card" style={{ marginBottom:"14px", background:"linear-gradient(135deg,var(--bg2),var(--bg3))", borderColor:"rgba(196,151,63,.2)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"9px", color:"var(--gold)", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"6px" }}>✦ Prueba Virtual</div>
                  <div style={{ fontSize:"14px", fontWeight:400, marginBottom:"6px" }}>Ve cómo te queda el outfit</div>
                  <div style={{ fontSize:"11px", color:"var(--text2)", lineHeight:1.5, marginBottom:"12px" }}>Basado en tu Fashion DNA™ personal</div>
                  <button className="btn-p" style={{ width:"auto", padding:"10px 18px" }} onClick={()=>setTab("avatar")}>
                    {isPremium ? "Probar ahora →" : "Ver función Premium →"}
                  </button>
                </div>
                <div style={{ fontSize:"44px", opacity:.25 }}>🧍</div>
              </div>
            </div>

            {clothes.length > 0 && (
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
                  <div style={{ fontSize:"9px", color:"var(--text2)", letterSpacing:"2px", textTransform:"uppercase" }}>Prendas recientes</div>
                  <button className="btn-g" onClick={()=>setTab("wardrobe")}>Ver todas →</button>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"8px" }}>
                  {clothes.slice(0,6).map(item => (
                    <div key={item.id} style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"2px", overflow:"hidden", position:"relative" }}>
                      <button onClick={()=>toggleFav(item.id)} style={{ position:"absolute", top:"4px", right:"4px", background:"rgba(0,0,0,.6)", border:"none", fontSize:"11px", cursor:"pointer", width:"20px", height:"20px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {favorites.includes(item.id)?"❤️":"🤍"}
                      </button>
                      {item.photo_url ? <img src={item.photo_url} alt={item.name} style={{ width:"100%", aspectRatio:"1", objectFit:"cover" }} /> : <div style={{ width:"100%", aspectRatio:"1", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"26px" }}>{CAT_ICON[item.category]||"👔"}</div>}
                      <div style={{ padding:"6px 7px" }}><div style={{ fontSize:"10px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* DNA TAB */}
        {tab==="dna" && (
          <div className="fade">
            <div style={{ marginBottom:"20px" }}>
              <div className="serif" style={{ fontSize:"26px", fontWeight:300 }}>Fashion DNA™</div>
              <div style={{ fontSize:"11px", color:"var(--text2)", marginTop:"3px" }}>Tu perfil de moda personalizado</div>
            </div>

            {!dna?.bodyType ? (
              <div style={{ textAlign:"center", padding:"60px 20px" }}>
                <div style={{ fontSize:"40px", marginBottom:"16px", opacity:.3 }}>🧬</div>
                <div style={{ fontSize:"13px", color:"var(--text2)", marginBottom:"20px" }}>Aún no has creado tu Fashion DNA™</div>
                <button className="btn-p" onClick={()=>setScreen("onboarding")}>Crear mi Fashion DNA™</button>
              </div>
            ) : (
              <>
                <div className="card card-accent" style={{ marginBottom:"14px" }}>
                  <div style={{ fontSize:"9px", color:"var(--gold)", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"16px" }}>✦ Análisis corporal</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginBottom:"14px" }}>
                    {[
                      { label:"Tipo de cuerpo", value:dna.bodyType },
                      { label:"Tono de piel", value:dna.skinTone },
                      { label:"Subtono", value:dna.skinUndertone },
                      { label:"Forma de rostro", value:dna.faceShape },
                      { label:"Tipo de cuello", value:dna.neckType },
                      { label:"Postura", value:dna.posture },
                    ].map(item => (
                      <div key={item.label} style={{ background:"var(--bg)", border:"1px solid var(--border)", borderRadius:"2px", padding:"10px" }}>
                        <div style={{ fontSize:"9px", color:"var(--text3)", letterSpacing:"1px", textTransform:"uppercase", marginBottom:"4px" }}>{item.label}</div>
                        <div style={{ fontSize:"12px" }}>{item.value || "—"}</div>
                      </div>
                    ))}
                  </div>
                  {dna.bodyProportions && (
                    <div style={{ background:"var(--bg)", border:"1px solid var(--border)", borderRadius:"2px", padding:"12px", marginBottom:"14px" }}>
                      <div style={{ fontSize:"9px", color:"var(--text3)", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"10px" }}>Proporciones</div>
                      {Object.entries(dna.bodyProportions).map(([k, v]) => (
                        <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px solid var(--border)" }}>
                          <span style={{ fontSize:"11px", color:"var(--text2)", textTransform:"capitalize" }}>{k}</span>
                          <span style={{ fontSize:"11px" }}>{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="card" style={{ marginBottom:"14px" }}>
                  <div style={{ fontSize:"9px", color:"var(--gold)", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"14px" }}>✦ Colores que te favorecen</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", marginBottom:"14px" }}>
                    {dna.idealColors?.map((c: string) => <span key={c} className="dna-tag dna-good">{c}</span>)}
                  </div>
                  <div style={{ fontSize:"9px", color:"var(--red)", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"8px" }}>Colores a evitar</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
                    {dna.colorsToAvoid?.map((c: string) => <span key={c} className="dna-tag dna-avoid">{c}</span>)}
                  </div>
                </div>

                <div className="card" style={{ marginBottom:"14px" }}>
                  <div style={{ fontSize:"9px", color:"var(--gold)", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"14px" }}>✦ Prendas recomendadas</div>
                  {dna.recommendedClothes?.map((r: string, i: number) => (
                    <div key={i} style={{ display:"flex", gap:"8px", padding:"6px 0", borderBottom:"1px solid var(--border)" }}>
                      <span style={{ color:"var(--green)" }}>✓</span>
                      <span style={{ fontSize:"12px", color:"var(--text2)" }}>{r}</span>
                    </div>
                  ))}
                  <div style={{ fontSize:"9px", color:"var(--red)", letterSpacing:"2px", textTransform:"uppercase", margin:"14px 0 10px" }}>Prendas a evitar</div>
                  {dna.clothesToAvoid?.map((r: string, i: number) => (
                    <div key={i} style={{ display:"flex", gap:"8px", padding:"6px 0", borderBottom:"1px solid var(--border)" }}>
                      <span style={{ color:"var(--red)" }}>✗</span>
                      <span style={{ fontSize:"12px", color:"var(--text2)" }}>{r}</span>
                    </div>
                  ))}
                </div>

                {dna.topTips && (
                  <div className="card card-accent" style={{ marginBottom:"14px" }}>
                    <div style={{ fontSize:"9px", color:"var(--gold)", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"14px" }}>✦ Tips personalizados</div>
                    {dna.topTips.map((tip: string, i: number) => (
                      <div key={i} style={{ display:"flex", gap:"10px", padding:"8px 0", borderBottom:"1px solid var(--border)" }}>
                        <span style={{ color:"var(--gold)", flexShrink:0 }}>✦</span>
                        <span style={{ fontSize:"12px", color:"var(--text2)", lineHeight:1.6 }}>{tip}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button className="btn-o" onClick={()=>setScreen("onboarding")} style={{ width:"100%" }}>🔄 Actualizar mi Fashion DNA™</button>
              </>
            )}
          </div>
        )}

        {/* WARDROBE */}
        {tab==="wardrobe" && (
          <div className="fade">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"18px" }}>
              <div>
                <div className="serif" style={{ fontSize:"26px", fontWeight:300 }}>Mi Armario</div>
                <div style={{ fontSize:"10px", color:"var(--text2)", marginTop:"3px" }}>{clothes.length} prendas</div>
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
                {analyzing && <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"6px 0", color:"var(--gold)", fontSize:"11px" }}><div className="dot"/><div className="dot"/><div className="dot"/><span style={{ marginLeft:"6px" }}>Analizando...</span></div>}
                <div style={{ display:"flex", gap:"7px", marginBottom:"12px" }}>
                  <button className="btn-g" style={{ flex:1, border:"1px solid var(--border)", borderRadius:"1px" }} onClick={()=>fileRef.current?.click()}>📁 Galería</button>
                  <button className="btn-g" style={{ flex:1, border:"1px solid var(--border)", borderRadius:"1px" }} onClick={()=>camRef.current?.click()}>📷 Cámara</button>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:"9px" }}>
                  <input className="inp" placeholder="Nombre de la prenda" value={ni.name} onChange={e=>setNi(p=>({...p,name:e.target.value}))} />
                  <select className="sel" value={ni.category} onChange={e=>setNi(p=>({...p,category:e.target.value}))}>
                    {allCategories.map(c=><option key={c}>{c}</option>)}
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

            <div style={{ display:"flex", gap:"7px", overflowX:"auto", paddingBottom:"10px", marginBottom:"14px", flexWrap:"nowrap" }}>
              {["Todo",...allCategories].map(c => <button key={c} className={`pill ${fc===c?"on":""}`} onClick={()=>setFc(c)}>{c}</button>)}
              {customCats.map(c => <button key={c+"_x"} onClick={()=>removeCustomCategory(c)} style={{ padding:"3px 7px", background:"rgba(231,76,60,.08)", border:"1px solid rgba(231,76,60,.2)", borderRadius:"20px", color:"var(--red)", fontSize:"9px", cursor:"pointer", flexShrink:0 }}>✕</button>)}
              <button onClick={()=>setShowAddCat(!showAddCat)} className="pill" style={{ borderStyle:"dashed", color:"var(--gold)", borderColor:"rgba(196,151,63,.3)", flexShrink:0 }}>+ Cat</button>
            </div>
            {showAddCat && (
              <div style={{ display:"flex", gap:"7px", marginBottom:"12px" }}>
                <input className="inp" placeholder="Nueva categoría..." value={newCatInput} onChange={e=>setNewCatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCustomCategory()} style={{ flex:1, padding:"9px 12px", fontSize:"12px" }} />
                <button onClick={addCustomCategory} className="btn-o" style={{ padding:"9px 14px", fontSize:"10px" }}>+</button>
              </div>
            )}

            {cloading ? <div style={{ display:"flex", justifyContent:"center", gap:"6px", padding:"50px" }}><div className="dot"/><div className="dot"/><div className="dot"/></div>
            : filtered.length===0 ? <div style={{ textAlign:"center", padding:"60px 20px", color:"var(--text3)", fontSize:"12px" }}>{clothes.length===0?"Tu armario está vacío":"Sin prendas en esta categoría"}</div>
            : (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"11px" }}>
                {filtered.map(item => (
                  <div key={item.id} className="card" style={{ padding:0, overflow:"hidden", position:"relative" }}>
                    <div style={{ position:"absolute", top:"7px", right:"7px", zIndex:2, display:"flex", gap:"4px" }}>
                      <button onClick={()=>toggleFav(item.id)} style={{ background:"rgba(0,0,0,.7)", border:"none", fontSize:"11px", cursor:"pointer", width:"22px", height:"22px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>{favorites.includes(item.id)?"❤️":"🤍"}</button>
                      <button onClick={()=>removeItem(item.id)} style={{ background:"rgba(0,0,0,.7)", border:"none", color:"var(--text2)", cursor:"pointer", fontSize:"10px", width:"22px", height:"22px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                    </div>
                    {item.photo_url ? <img src={item.photo_url} alt={item.name} style={{ width:"100%", aspectRatio:"1", objectFit:"cover" }} /> : <div style={{ width:"100%", aspectRatio:"1", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"36px" }}>{CAT_ICON[item.category]||"👔"}</div>}
                    <div style={{ padding:"9px 11px" }}>
                      <div style={{ fontSize:"12px", fontWeight:400, marginBottom:"2px" }}>{item.name}</div>
                      <div style={{ fontSize:"9px", color:"var(--text2)", letterSpacing:"1.5px", textTransform:"uppercase" }}>{item.category}</div>
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
              <div style={{ fontSize:"11px", color:"var(--text2)", marginTop:"3px" }}>{dna?.bodyType ? `Personalizado para tu tipo ${dna.bodyType}` : "La IA selecciona el look ideal"}</div>
            </div>
            {clothes.length===0 ? <div style={{ textAlign:"center", padding:"60px", color:"var(--text3)", fontSize:"13px" }}>Agrega prendas a tu armario primero</div> : (
              <>
                <div className="card" style={{ marginBottom:"12px" }}>
                  <div style={{ fontSize:"9px", color:"var(--text2)", letterSpacing:"2.5px", textTransform:"uppercase", marginBottom:"12px" }}>¿Para qué evento?</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"7px" }}>
                    {EVENTS.map(ev => <button key={ev} onClick={()=>setSelEv(ev)} style={{ padding:"9px 7px", background:selEv===ev?"rgba(196,151,63,.1)":"var(--bg)", color:selEv===ev?"var(--gold)":"var(--text2)", border:`1px solid ${selEv===ev?"rgba(196,151,63,.3)":"var(--border)"}`, borderRadius:"1px", cursor:"pointer", fontFamily:"'Jost',sans-serif", fontSize:"11px", textAlign:"left", transition:"all .2s" }}>{ev}</button>)}
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
                      <div style={{ background:"var(--bg)", border:"1px solid rgba(196,151,63,.15)", borderRadius:"2px", padding:"14px", marginBottom:"14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div style={{ fontSize:"12px", color:"var(--text2)", flex:1 }}>{outfitR.ratingExplanation}</div>
                        <div style={{ textAlign:"right", marginLeft:"12px" }}>
                          <div className="stars">{renderStars(outfitR.rating)}</div>
                          <div style={{ fontSize:"9px", color:"var(--gold)", marginTop:"3px" }}>{outfitR.rating}/5</div>
                        </div>
                      </div>
                    )}
                    {outfitR.colorPalette && <div style={{ padding:"10px 14px", background:"var(--bg)", border:"1px solid rgba(196,151,63,.08)", borderRadius:"2px", marginBottom:"14px" }}><div style={{ fontSize:"9px", color:"var(--text3)", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"4px" }}>Paleta</div><div style={{ fontSize:"12px", color:"rgba(196,151,63,.7)", fontStyle:"italic" }}>{outfitR.colorPalette}</div></div>}
                    <div style={{ display:"flex", flexDirection:"column", gap:"9px", marginBottom:"16px" }}>
                      {outfitR.outfit?.map((item: any, i: number) => (
                        <div key={i} style={{ display:"flex", gap:"12px", padding:"13px", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:"2px" }}>
                          <div style={{ fontSize:"26px", minWidth:"34px", textAlign:"center" }}>{item.emoji}</div>
                          <div><div style={{ fontSize:"13px", fontWeight:400, marginBottom:"4px" }}>{item.name}</div><div style={{ fontSize:"11px", color:"var(--text2)", lineHeight:1.6 }}>{item.why}</div></div>
                        </div>
                      ))}
                    </div>
                    {outfitR.explanation && <div style={{ background:"var(--bg)", borderLeft:"2px solid rgba(196,151,63,.3)", padding:"14px" }}><div style={{ fontSize:"9px", color:"var(--gold)", letterSpacing:"2.5px", textTransform:"uppercase", marginBottom:"8px" }}>✦ Por qué funciona</div><div style={{ fontSize:"12px", color:"var(--text2)", lineHeight:1.8 }}>{outfitR.explanation}</div></div>}
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
              <div style={{ fontSize:"11px", color:"var(--text2)", marginTop:"3px" }}>{isPremium ? "Basada en tu Fashion DNA™" : "Función exclusiva Premium"}</div>
            </div>
            {!isPremium ? (
              <div className="card card-accent" style={{ textAlign:"center", padding:"32px 20px" }}>
                <div style={{ fontSize:"48px", marginBottom:"16px" }}>👑</div>
                <div className="serif" style={{ fontSize:"22px", fontWeight:300, marginBottom:"10px" }}>Función Premium</div>
                <div style={{ fontSize:"13px", color:"var(--text2)", lineHeight:1.6, marginBottom:"20px" }}>Prueba virtualmente cualquier outfit de tu armario basado en tu Fashion DNA™ personal.</div>
                <button className="btn-p">✦  Mejorar a Premium — $299 MXN/mes</button>
              </div>
            ) : !dna?.bodyType ? (
              <div style={{ textAlign:"center", padding:"60px 20px" }}>
                <div style={{ fontSize:"40px", marginBottom:"16px", opacity:.3 }}>🧬</div>
                <div style={{ fontSize:"13px", color:"var(--text2)", marginBottom:"20px" }}>Primero crea tu Fashion DNA™</div>
                <button className="btn-p" onClick={()=>setScreen("onboarding")}>Crear mi Fashion DNA™</button>
              </div>
            ) : (
              <>
                <div className="card card-accent" style={{ marginBottom:"14px" }}>
                  <div style={{ fontSize:"9px", color:"var(--green)", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"10px" }}>✓ Fashion DNA™ detectado</div>
                  <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                    <span className="dna-tag dna-style">{dna.bodyType}</span>
                    <span className="dna-tag dna-good">{dna.skinTone}</span>
                    {dna.idealColors?.slice(0,2).map((c: string) => <span key={c} className="dna-tag dna-good">{c}</span>)}
                  </div>
                </div>

                <div className="card" style={{ marginBottom:"14px" }}>
                  <div style={{ fontSize:"9px", color:"var(--gold)", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"12px" }}>Selecciona prendas para probar</div>
                  {clothes.length === 0 ? (
                    <div style={{ textAlign:"center", padding:"20px", color:"var(--text3)", fontSize:"12px" }}>Agrega prendas a tu armario primero</div>
                  ) : (
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"8px", maxHeight:"280px", overflowY:"auto" }}>
                      {clothes.map(item => (
                        <div key={item.id} onClick={()=>setSelectedForTry(prev=>prev.includes(item.id)?prev.filter(i=>i!==item.id):[...prev,item.id])}
                          style={{ background:selectedForTry.includes(item.id)?"rgba(196,151,63,.1)":"var(--bg)", border:`1px solid ${selectedForTry.includes(item.id)?"rgba(196,151,63,.4)":"var(--border)"}`, borderRadius:"2px", overflow:"hidden", cursor:"pointer", transition:"all .2s", position:"relative" }}>
                          {selectedForTry.includes(item.id) && <div style={{ position:"absolute", top:"3px", right:"3px", background:"var(--gold)", borderRadius:"50%", width:"14px", height:"14px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"8px", color:"#080808", fontWeight:600, zIndex:1 }}>✓</div>}
                          {item.photo_url ? <img src={item.photo_url} alt={item.name} style={{ width:"100%", aspectRatio:"1", objectFit:"cover" }} /> : <div style={{ width:"100%", aspectRatio:"1", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"22px" }}>{CAT_ICON[item.category]||"👔"}</div>}
                          <div style={{ padding:"5px 7px" }}><div style={{ fontSize:"9px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name}</div></div>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedForTry.length > 0 && <div style={{ marginTop:"10px", fontSize:"11px", color:"var(--gold)" }}>{selectedForTry.length} prenda{selectedForTry.length>1?"s":""} seleccionada{selectedForTry.length>1?"s":""}</div>}
                </div>

                {selectedForTry.length > 0 && (
                  <div>
                    <button className="btn-p" onClick={virtualTryOn} disabled={tryL} style={{ marginBottom:"16px" }}>
                      {tryL?"Generando prueba virtual...":"🧍 Probar outfit virtualmente"}
                    </button>
                    {tryL && <div style={{ display:"flex", justifyContent:"center", gap:"6px", padding:"24px" }}><div className="dot"/><div className="dot"/><div className="dot"/></div>}
                    {tryResult && !tryL && (
                      <div className="card card-gold fade">
                        <div style={{ fontSize:"9px", color:"var(--gold)", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"12px" }}>✦ Cómo luciría en ti</div>
                        <div style={{ fontSize:"13px", color:"var(--text2)", lineHeight:1.8 }}>{tryResult}</div>
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
              <div style={{ fontSize:"10px", color:"var(--text2)", marginTop:"3px" }}>{favClothes.length} prendas guardadas</div>
            </div>
            {favClothes.length===0 ? (
              <div style={{ textAlign:"center", padding:"60px 20px" }}>
                <div style={{ fontSize:"40px", marginBottom:"14px", opacity:.3 }}>❤️</div>
                <div style={{ fontSize:"12px", color:"var(--text3)" }}>Toca ❤️ en cualquier prenda para guardarla</div>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"11px" }}>
                {favClothes.map(item => (
                  <div key={item.id} className="card" style={{ padding:0, overflow:"hidden", position:"relative" }}>
                    <button onClick={()=>toggleFav(item.id)} style={{ position:"absolute", top:"7px", right:"7px", zIndex:2, background:"rgba(0,0,0,.7)", border:"none", fontSize:"11px", cursor:"pointer", width:"22px", height:"22px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>❤️</button>
                    {item.photo_url ? <img src={item.photo_url} alt={item.name} style={{ width:"100%", aspectRatio:"1", objectFit:"cover" }} /> : <div style={{ width:"100%", aspectRatio:"1", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"36px" }}>{CAT_ICON[item.category]||"👔"}</div>}
                    <div style={{ padding:"9px 11px" }}>
                      <div style={{ fontSize:"12px", fontWeight:400, marginBottom:"2px" }}>{item.name}</div>
                      <div style={{ fontSize:"9px", color:"var(--text2)", letterSpacing:"1.5px", textTransform:"uppercase" }}>{item.category}</div>
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
              <div style={{ fontSize:"10px", color:"var(--text2)", marginTop:"3px" }}>Powered by Claude AI · Personalizado con tu DNA</div>
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
              {cload && <div style={{ display:"flex", gap:"7px", alignItems:"center" }}><div style={{ color:"var(--gold)", fontSize:"12px", fontFamily:"'Cormorant Garamond',serif" }}>✦</div><div className="bubble-a"><div style={{ display:"flex", gap:"4px", padding:"2px 0" }}><div className="dot"/><div className="dot"/><div className="dot"/></div></div></div>}
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
              <div style={{ fontSize:"11px", color:"var(--text2)", marginTop:"3px" }}>La IA organiza tu maleta con tu armario</div>
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
                    {g.items?.map((item: string, j: number) => <div key={j} style={{ display:"flex", alignItems:"center", gap:"9px", padding:"6px 0", borderBottom:"1px solid var(--border)" }}><div style={{ width:"5px", height:"5px", borderRadius:"50%", background:"var(--gold)", flexShrink:0 }}/><div style={{ fontSize:"13px" }}>{item}</div></div>)}
                    {g.tip && <div style={{ fontSize:"11px", color:"var(--text2)", marginTop:"8px", fontStyle:"italic" }}>💡 {g.tip}</div>}
                  </div>
                ))}
                {tripR.faltan?.length > 0 && (
                  <div className="card" style={{ marginBottom:"10px", borderColor:"rgba(231,76,60,.2)" }}>
                    <div style={{ fontSize:"9px", color:"var(--red)", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"10px" }}>⚠ Te falta comprar</div>
                    {tripR.faltan?.map((item: any, i: number) => (
                      <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid var(--border)" }}>
                        <div><div style={{ fontSize:"13px" }}>{item.name}</div><div style={{ fontSize:"11px", color:"var(--text2)", marginTop:"2px" }}>{item.why}</div></div>
                        {item.urgente && <span style={{ fontSize:"9px", color:"var(--red)", border:"1px solid rgba(231,76,60,.3)", padding:"3px 8px", borderRadius:"20px" }}>Urgente</span>}
                      </div>
                    ))}
                  </div>
                )}
                {tripR.consejo && <div style={{ background:"var(--bg)", borderLeft:"2px solid rgba(196,151,63,.3)", padding:"14px" }}><div style={{ fontSize:"9px", color:"var(--gold)", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"8px" }}>✦ Consejo del estilista</div><div style={{ fontSize:"12px", color:"var(--text2)", lineHeight:1.8 }}>{tripR.consejo}</div></div>}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="bnav">
        <button className={`bnav-item ${tab==="home"?"on":""}`} onClick={()=>setTab("home")}>
          <span className="bnav-icon">🏠</span>
          <span className="bnav-label">Inicio</span>
        </button>
        <button className={`bnav-item ${tab==="wardrobe"?"on":""}`} onClick={()=>setTab("wardrobe")}>
          <span className="bnav-icon">👗</span>
          <span className="bnav-label">Armario</span>
        </button>
        <button className="bnav-item" onClick={()=>{setSF(true);setTab("wardrobe");}}>
          <div className="bnav-center">＋</div>
        </button>
        <button className={`bnav-item ${tab==="outfit"?"on":""}`} onClick={()=>setTab("outfit")}>
          <span className="bnav-icon">✨</span>
          <span className="bnav-label">Outfit IA</span>
        </button>
        <button className={`bnav-item ${tab==="advisor"?"on":""}`} onClick={()=>setTab("advisor")}>
          <span className="bnav-icon">💬</span>
          <span className="bnav-label">Asesor IA</span>
        </button>
      </nav>
    </div>
  );
}
