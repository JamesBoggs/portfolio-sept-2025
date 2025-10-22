// pages/api/montecarlo.js
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
function toChart(d){ const s=deepSeries(d)||[]; const step=Math.ceil(s.length/400)||1; return s.filter((_,i)=>i%step===0).map((y,i)=>({x:i,y:Number(y)})); }

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
