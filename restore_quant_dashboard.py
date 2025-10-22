#!/usr/bin/env python3
"""
Restores the Quant dashboard wiring for Next.js (pages router):
- .env.local with controller + service URLs
- pages/api/montecarlo.js  (controller-first, fallback direct; GET/POST)
- pages/api/forecast.js    (POST-only; 12-value body; controller-first, fallback direct)
- pages/index.js            (circuit UI, two cards, chart + JSON + endpoint info)
- styles/globals.css        (circuit-frame + background)
- .gitignore                (ignore venv, node_modules, env files)
- Ensures `recharts` dependency
Usage:
  python restore_quant_dashboard.py --install
  # or override URLs:
  python restore_quant_dashboard.py \
    --controller https://portfolio-api-ize1.onrender.com \
    --monte https://montecarlo-fastapi.onrender.com \
    --forecast https://forecast-fastapi.onrender.com \
    --install
"""
import argparse, json, os, shutil, sys
from pathlib import Path
from datetime import datetime

ROOT   = Path.cwd()
PAGES  = ROOT / "pages"
API    = PAGES / "api"
STYLES = ROOT / "styles"
PUBLIC = ROOT / "public"

DEF = {
    "controller": "https://portfolio-api-ize1.onrender.com",
    "monte":      "https://montecarlo-fastapi.onrender.com",
    "forecast":   "https://forecast-fastapi.onrender.com",
}

CIRCUIT_CSS = """/* === CIRCUIT UI === */
.bg-dashboard {
  background:
    radial-gradient(40% 60% at 60% 10%, rgba(129,216,208,.08), transparent 60%),
    radial-gradient(30% 40% at 10% 90%, rgba(99,102,241,.08), transparent 60%),
    #0b1020;
}
.glow-sidebar {
  background:
    radial-gradient(50% 60% at 50% 10%, rgba(129,216,208,.12), transparent 60%),
    radial-gradient(40% 40% at 10% 90%, rgba(139,92,246,.10), transparent 60%);
}
.circuit-frame { position:relative; border-radius:1rem; border:1px solid rgba(129,216,208,.25); }
.circuit-frame::before {
  content:""; position:absolute; inset:-1px; border-radius:inherit; padding:1px;
  background: linear-gradient(135deg, rgba(129,216,208,.6), rgba(139,92,246,.35));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude; pointer-events:none;
}
.circuit-inner {
  background:
    radial-gradient(120% 120% at 0% 0%, rgba(129,216,208,.06), transparent 50%),
    linear-gradient(to bottom right, rgba(15,23,42,.75), rgba(30,27,75,.6));
}
"""

MONTE_API = r"""// pages/api/montecarlo.js
export const config = { api: { bodyParser: true } };

const CONTROLLER = (process.env.CONTROLLER_BASE || "https://portfolio-api-ize1.onrender.com").trim().replace(/\/+$/,"");
const DIRECT     = (process.env.MONTECARLO_BASE || "https://montecarlo-fastapi.onrender.com").trim().replace(/\/+$/,"");
const DEBUG      = process.env.FRONTEND_DEBUG === "1";

const withTimeout = (p, ms = 6500) =>
  Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);

async function call(url, method="GET", body) {
  const t0 = Date.now();
  const opts = { method, headers: { accept: "application/json" } };
  if (body) { opts.headers["content-type"] = "application/json"; opts.body = JSON.stringify(body); }
  const resp = await withTimeout(fetch(url, opts));
  const latency = Date.now() - t0;
  let data=null, text=null;
  try { data = await resp.json(); } catch { try { text = await resp.text(); } catch {} }
  const payload = data && typeof data==="object" && "data" in data ? data.data : (data ?? text);
  return { ok: resp.ok, status: resp.status, latency, url, payload };
}

function isNum(v){ return typeof v==="number" || (!!v && !isNaN(Number(v))); }
function deepSeries(x){
  const arr=x;
  if(Array.isArray(arr)){
    if(arr.length>1 && arr.every(isNum)) return arr;
    for(const v of arr){ const f=deepSeries(v); if(f) return f; }
  }else if(x && typeof x==="object"){
    for(const k of ["series","path","values","prices","y","trajectory","samples","paths"]){
      const v=x[k];
      if(Array.isArray(v) && v.length>1 && v.every(isNum)) return v;
      if(Array.isArray(v) && v[0] && Array.isArray(v[0]) && v[0].every(isNum)) return v[0];
    }
    for(const v of Object.values(x)){ const f=deepSeries(v); if(f) return f; }
  }
  return null;
}
function toChart(d){ const s=deepSeries(d)||[]; const step=Math.ceil(s.length/400)||1; return s.filter((_,i)=>i%%step===0).map((y,i)=>({x:i,y:Number(y)})); }

export default async function handler(req,res){
  const q = new URLSearchParams(req.query||{}).toString();
  const candidates = [
    `${CONTROLLER}/v1/montecarlo/simulate${q ? `?${q}` : ""}`,      // GET
    `${DIRECT}/simulate${q ? `?${q}` : ""}`,                         // GET
    `${CONTROLLER}/v1/montecarlo/simulate`,                         // POST
    `${DIRECT}/simulate`,                                           // POST
  ];

  let result=null;
  for(const [i,url] of candidates.entries()){
    try{
      const method = i<2 ? "GET" : "POST";
      const body = method==="POST" ? (req.body || {}) : undefined;
      const r = await call(url, method, body);
      result = result || r;
      if(r.ok && r.payload!==undefined) { result=r; break; }
    }catch(e){
      result = result || { ok:false, status:0, latency:null, url, payload: { error: e?.message || String(e) } };
    }
  }

  // health
  let healthy=false;
  for(const base of [CONTROLLER,DIRECT]){
    for(const hp of ["health","healthz"]){
      try{ const h=await withTimeout(fetch(`${base}/${hp}`,{headers:{accept:"application/json"}}),1500); if(h.ok){healthy=true;break;} }catch{}
    }
    if(healthy) break;
  }

  const status = healthy ? (result?.ok ? "online" : "degraded") : "offline";
  const data = result?.payload ?? { error:"No payload" };
  return res.status(200).json({
    status,
    endpoint_status: result?.status ?? null,
    endpoint_url: result?.url ?? null,
    latency_ms: result?.latency ?? null,
    lastUpdated: new Date().toISOString(),
    data,
    chartData: result?.ok ? toChart(data) : [],
    debug: DEBUG ? { tried: candidates } : undefined
  });
}
"""

FORECAST_API = r"""// pages/api/forecast.js
export const config = { api: { bodyParser: true } };

const CONTROLLER = (process.env.CONTROLLER_BASE || "https://portfolio-api-ize1.onrender.com").trim().replace(/\/+$/,"");
const DIRECT     = (process.env.FORECAST_BASE  || "https://forecast-fastapi.onrender.com").trim().replace(/\/+$/,"");
const DEBUG      = process.env.FRONTEND_DEBUG === "1";

const withTimeout = (p, ms = 7000) =>
  Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);

function defaultSeed(n=12){ let x=100,out=[]; for(let i=0;i<n;i++){ x += (Math.random()-0.5)*2 + 0.1; out.push(+x.toFixed(2)); } return out; }

async function post(url, body){
  const t0=Date.now();
  const resp = await withTimeout(fetch(url, { method:"POST", headers:{accept:"application/json","content-type":"application/json"}, body: JSON.stringify(body)}));
  const latency=Date.now()-t0;
  let data=null, text=null;
  try{ data=await resp.json(); }catch{ try{ text=await resp.text(); }catch{} }
  return { ok:resp.ok, status:resp.status, latency, url, data: data ?? text };
}

function isNum(v){ return typeof v==="number" || (!!v && !isNaN(Number(v))); }
function deepSeries(x){
  if(Array.isArray(x)){ if(x.length>1 && x.every(isNum)) return x; for(const v of x){ const f=deepSeries(v); if(f) return f; } }
  else if(x && typeof x==="object"){
    for(const k of ["forecast","yhat","pred","y","values","series","path","trajectory","output"]){
      const v=x[k]; if(Array.isArray(v)&&v.length>1&&v.every(isNum)) return v;
      if(Array.isArray(v)&&v[0]&&Array.isArray(v[0])&&v[0].every(isNum)) return v[0];
    }
    for(const v of Object.values(x)){ const f=deepSeries(v); if(f) return f; }
  }
  return null;
}
const toChart = (d)=>{ const s=deepSeries(d)||[]; const step=Math.ceil(s.length/400)||1; return s.filter((_,i)=>i%%step===0).map((y,i)=>({x:i,y:Number(y)})); };

export default async function handler(req,res){
  // exactly 12 values per service requirement
  const body = (req?.body && Array.isArray(req.body.values))
    ? { values: req.body.values.slice(0,12) }
    : { values: defaultSeed(12) };

  // health (so badge reflects reality)
  let healthy=false;
  for(const base of [CONTROLLER,DIRECT]){
    for(const hp of ["health","healthz"]){
      try{ const r=await withTimeout(fetch(`${base}/${hp}`,{headers:{accept:"application/json"}}),1500); if(r.ok){healthy=true;break;} }catch{}
    }
    if(healthy) break;
  }

  // Always POST /predict; controller first, then direct
  const endpoints = [
    `${CONTROLLER}/v1/forecast/predict`,
    `${DIRECT}/predict`
  ];

  let final=null;
  for(const url of endpoints){
    try{
      const r = await post(url, body);
      final = final or r;      // keep first attempt for debug
      if(r.ok){ final=r; break; }
    }catch(e){
      const msg=e?.message || String(e);
      final = final or { ok:false, status:0, latency:null, url, data:{error:msg} };
    }
  }

  let status = "offline";
  if(healthy and final?.ok) status = "online";
  else if(healthy and !final?.ok) status = "degraded";

  const niceErr = (!final?.ok and final?.data and typeof final.data==="object" and final.data.detail) ? String(final.data.detail) : null;
  const data = final?.data ?? { error:"No payload" };
  return res.status(200).json({
    status,
    endpoint_status: final?.status ?? null,
    endpoint_url: final?.url ?? null,
    latency_ms: final?.latency ?? null,
    lastUpdated: new Date().toISOString(),
    data: niceErr ? { error: niceErr } : data,
    chartData: final?.ok ? toChart(data) : [],
    debug: DEBUG ? { sent_values_len: body.values.length } : undefined
  });
}
""".replace(" or ", " || ").replace(" and ", " && ")

INDEX_JS = r"""// pages/index.js
import Head from "next/head";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function StatusBadge({ status }) {
  if (status === "online") {
    return (
      <div className="flex items-center gap-2 text-sm mb-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
        </span>
        <span>Online</span>
      </div>
    );
  }
  if (status === "degraded") {
    return (
      <div className="flex items-center gap-2 text-sm mb-2">
        <span className="inline-block w-3 h-3 rounded-full bg-amber-400" />
        <span>Degraded</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-sm mb-2">
      <span className="inline-block w-3 h-3 rounded-full bg-rose-500" />
      <span>Offline</span>
    </div>
  );
}

export default function Home() {
  const [cards, setCards] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetchCard = async (name, path) => {
      const t0 = performance.now();
      try {
        const r = await fetch(path);
        const j = await r.json();
        return {
          model: name,
          status: j?.status || (r.ok ? "online" : "offline"),
          latency: j?.latency_ms ?? Math.round(performance.now() - t0),
          version: "v1.0.0",
          framework: "PyTorch 2.6.0+cu124",
          lastUpdated: j?.lastUpdated || new Date().toISOString(),
          data: j?.data || {},
          chartData: j?.chartData || [],
          endpoint_url: j?.endpoint_url,
          endpoint_status: j?.endpoint_status,
        };
      } catch (e) {
        return {
          model: name,
          status: "offline",
          latency: null,
          version: "v1.0.0",
          framework: "PyTorch 2.6.0+cu124",
          lastUpdated: new Date().toISOString(),
          data: { error: e?.message || "fetch failed" },
          chartData: [],
        };
      }
    };
    (async () => {
      const [mc, fc] = await Promise.all([
        fetchCard("montecarlo", "/api/montecarlo"),
        fetchCard("forecast", "/api/forecast"),
      ]);
      setCards([mc, fc]);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-dashboard text-white">
      <Head><title>James Boggs – Quant Dashboard</title></Head>

      <main className="flex flex-col md:flex-row">
        <aside className="relative md:sticky md:top-0 md:h-screen md:w-1/2 lg:w-2/5 flex justify-center items-center p-6 glow-sidebar">
          <div className="flex flex-col items-center text-center space-y-5">
            <div className="circuit-frame rounded-2xl">
              <div className="circuit-inner rounded-2xl p-1">
                <img src="/profile.png" alt="Profile" className="w-72 h-80 object-cover rounded-2xl border border-[#81D8D0]/40 shadow-lg" />
              </div>
            </div>
            <h2 className="text-2xl font-extrabold mt-4">James Boggs</h2>
            <p className="text-gray-300 max-w-xs">Finance & AI/ML Engineer • Pricing • Volatility • Forecasting</p>
          </div>
        </aside>

        <section className="w-full md:w-1/2 lg:w-4/5 overflow-y-auto px-4 py-8 space-y-10">
          <header className="text-center space-y-3">
            <h1 className="text-5xl lg:text-6xl font-extrabold">LIVE <span className="text-[#81D8D0]">QUANT DASHBOARD</span></h1>
            <p className="text-sm text-gray-400 max-w-xl mx-auto">Controller-first calls, fallback direct. Forecast posts 12 points to /predict.</p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((m, i) => (
              <div key={i}>
                <div className="circuit-frame rounded-2xl hover:scale-[1.01] transition-transform">
                  <div className="circuit-inner rounded-2xl p-4 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 backdrop-blur-sm">
                    <h2 className="text-lg font-bold text-[#81D8D0] mb-1">
                      {m.model === "montecarlo" ? "Monte Carlo" : "Forecast"}
                    </h2>
                    <StatusBadge status={m.status} />
                    <p className="text-[10px] text-gray-400 mb-2">
                      {m.version} • {m.framework} • Latency: {m.latency ? `${m.latency}ms` : "—"}
                    </p>
                    <div className="h-[140px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={m.chartData}>
                          <Line type="monotone" dataKey="y" stroke="#81D8D0" strokeWidth={2} dot={false} />
                          <XAxis dataKey="x" hide /><YAxis hide /><Tooltip />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <pre className="text-xs text-white bg-black/30 p-2 mt-3 rounded-md overflow-x-auto max-h-40">
                      {JSON.stringify(m.data, null, 2)}
                    </pre>
                    {m.endpoint_url && (
                      <p className="text-[10px] text-gray-500 mt-2 break-all">Endpoint: {m.endpoint_url} • {m.endpoint_status ?? ""}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <footer className="text-center text-xs text-gray-500 pt-12 pb-4 space-y-2">
            <p>Production-style ML stack with PyTorch, FastAPI, and Render.</p>
            <p>© {new Date().getFullYear()} James Boggs — Quant ML Portfolio</p>
          </footer>
        </section>
      </main>
    </div>
  );
}
"""

def write(path: Path, content: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    print(f"✓ wrote {path.relative_to(ROOT)}")

def append_or_create(path: Path, extra: str):
    if path.exists():
        txt = path.read_text(encoding="utf-8")
        if extra.strip() not in txt:
            path.write_text(txt.rstrip() + "\n" + extra + "\n", encoding="utf-8")
            print(f"✓ appended {path.relative_to(ROOT)}")
        else:
            print(f"• already present: {path.relative_to(ROOT)}")
    else:
        write(path, extra + "\n")

def ensure_env(controller, monte, forecast):
    envp = ROOT / ".env.local"
    lines = []
    if envp.exists():
        existing = envp.read_text(encoding="utf-8").splitlines()
        # drop any existing keys to rewrite clean
        keep = [ln for ln in existing if not any(ln.startswith(k+"=") for k in ["CONTROLLER_BASE","MONTECARLO_BASE","FORECAST_BASE","FRONTEND_DEBUG"])]
        lines.extend(keep)
    lines += [
        f"CONTROLLER_BASE={controller}",
        f"MONTECARLO_BASE={monte}",
        f"FORECAST_BASE={forecast}",
        "FRONTEND_DEBUG=0",
    ]
    write(envp, "\n".join(lines) + "\n")

def ensure_gitignore():
    gi = ROOT / ".gitignore"
    blob = "\n".join([
        "node_modules/",
        ".next/",
        "out/",
        "venv/",
        "__pycache__/",
        "*.pyc",
        ".env",
        ".env.local",
        ".DS_Store"
    ])
    append_or_create(gi, blob)

def ensure_package():
    pj = ROOT / "package.json"
    if not pj.exists():
        print("! package.json not found. Run inside your Next.js repo.")
        return
    data = json.loads(pj.read_text(encoding="utf-8"))
    deps = data.setdefault("dependencies", {})
    if "recharts" not in deps:
        deps["recharts"] = "^2.10.0"
        print("• added recharts to dependencies")
    pj.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    print("✓ updated package.json")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--controller", default=DEF["controller"])
    ap.add_argument("--monte",      default=DEF["monte"])
    ap.add_argument("--forecast",   default=DEF["forecast"])
    ap.add_argument("--install",    action="store_true")
    args = ap.parse_args()

    if not PAGES.exists():
        print("! pages/ not found (this expects Next.js pages router).")
        sys.exit(1)

    ensure_env(args.controller, args.monte, args.forecast)
    ensure_gitignore()

    # Write API routes
    write(API / "montecarlo.js", MONTE_API)
    write(API / "forecast.js",   FORECAST_API)

    # Write index + CSS
    write(PAGES / "index.js", INDEX_JS)
    append_or_create(STYLES / "globals.css", CIRCUIT_CSS)

    ensure_package()

    if args.install:
        try:
            import subprocess
            subprocess.check_call(["npm","i"])
            print("✓ npm install complete")
        except Exception as e:
            print(f"! npm install failed: {e}")

    print("\nDone. Next:")
    print("  npm run dev")
    print("Open http://localhost:3000 (Monte + Forecast cards).")

if __name__ == "__main__":
    main()