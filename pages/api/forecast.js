// pages/api/forecast.js
const CONTROLLER = process.env.CONTROLLER_BASE || "https://portfolio-api-ize1.onrender.com";
const DIRECT     = process.env.FORECAST_BASE  || "https://forecast-fastapi.onrender.com";
const DEBUG      = process.env.FRONTEND_DEBUG === "1";

const withTimeout = (p, ms = 6000) =>
  Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);

async function fetchEither(url, method = "GET", body = undefined) {
  const t0 = Date.now();
  const opt = { method, headers: { accept: "application/json" } };
  if (body) {
    opt.headers["content-type"] = "application/json";
    opt.body = JSON.stringify(body);
  }
  const resp = await withTimeout(fetch(url, opt));
  const latency = Date.now() - t0;

  let text = null, json = null;
  try { json = await resp.json(); }
  catch {
    try { text = await resp.text(); } catch {}
  }
  let payload = json && typeof json === "object" && "data" in json ? json.data : json ?? text;
  return { ok: resp.ok, status: resp.status, latency, payload, headers: Object.fromEntries(resp.headers.entries()) };
}

function deepNumericSeries(any) {
  const isNum = (v) => typeof v === "number" || (!!v && !isNaN(Number(v)));
  const isNumArr = (a) => Array.isArray(a) && a.length > 1 && a.every(isNum);
  const isNumArrArr = (a) => Array.isArray(a) && a.length > 0 && Array.isArray(a[0]) && a[0].every(isNum);
  if (isNumArr(any)) return any;
  if (isNumArrArr(any)) return any[0];
  if (any && typeof any === "object" && !Array.isArray(any)) {
    const common = ["forecast", "yhat", "pred", "values", "series", "y", "path"];
    for (const k of common) {
      if (isNumArr(any[k])) return any[k];
      if (isNumArrArr(any[k])) return any[k][0];
    }
    for (const v of Object.values(any)) {
      const found = deepNumericSeries(v);
      if (found) return found;
    }
  }
  if (Array.isArray(any)) {
    for (const v of any) {
      const found = deepNumericSeries(v);
      if (found) return found;
    }
  }
  return null;
}

function toChart(data) {
  const series = deepNumericSeries(data);
  if (!series) return [];
  const step = Math.ceil(series.length / 400) || 1;
  return series.filter((_, i) => i % step === 0).map((y, i) => ({ x: i, y: Number(y) }));
}

export default async function handler(req, res) {
  const q = new URLSearchParams(req.query || {}).toString();

  const calls = [
    { url: `${CONTROLLER.replace(/\/+$/, "")}/v1/forecast/predict${q ? `?${q}` : ""}`, method: "GET" },
    { url: `${CONTROLLER.replace(/\/+$/, "")}/v1/forecast/predict`, method: "POST", body: req.body || {} },
    { url: `${DIRECT.replace(/\/+$/, "")}/predict${q ? `?${q}` : ""}`, method: "GET" },
    { url: `${DIRECT.replace(/\/+$/, "")}/predict`, method: "POST", body: req.body || {} },
  ];

  let used = null, result = null;
  for (const c of calls) {
    try {
      const r = await fetchEither(c.url, c.method, c.body);
      used = { url: c.url, method: c.method };
      if (r.ok && (r.payload !== null && r.payload !== undefined)) { result = r; break; }
      if (!result) result = r;
    } catch (e) {
      if (!result) result = { ok: false, status: 0, latency: null, payload: { error: String(e) } };
    }
  }

  let healthy = false;
  const healths = [
    `${CONTROLLER.replace(/\/+$/, "")}/health`,
    `${DIRECT.replace(/\/+$/, "")}/health`,
  ];
  for (const h of healths) {
    try {
      const r = await withTimeout(fetch(h, { headers: { accept: "application/json" } }), 1500);
      if (r.ok) { healthy = true; break; }
    } catch {}
  }

  const data = result?.payload ?? { error: "No payload" };
  const chartData = toChart(data);

  res.status(200).json({
    status: healthy ? "online" : "offline",
    latency_ms: result?.latency ?? null,
    lastUpdated: new Date().toISOString(),
    data,
    chartData,
    source: used?.url,
    method: used?.method,
    debug: DEBUG ? { http_status: result?.status, headers: result?.headers } : undefined,
  });
}
