// pages/api/forecast.js
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
const toChart = (d)=>{ const s=deepSeries(d)||[]; const step=Math.ceil(s.length/400)||1; return s.filter((_,i)=>i%step===0).map((y,i)=>({x:i,y:Number(y)})); };

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
      final = final || r;      // keep first attempt for debug
      if(r.ok){ final=r; break; }
    }catch(e){
      const msg=e?.message || String(e);
      final = final || { ok:false, status:0, latency:null, url, data:{error:msg} };
    }
  }

  let status = "offline";
  if(healthy && final?.ok) status = "online";
  else if(healthy && !final?.ok) status = "degraded";

  const niceErr = (!final?.ok && final?.data && typeof final.data==="object" && final.data.detail) ? String(final.data.detail) : null;
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
