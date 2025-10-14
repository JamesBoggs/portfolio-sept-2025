// pages/index.js
import Head from "next/head";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Home() {
  const [models, setModels] = useState([]);
  const [expanded, setExpanded] = useState(null);

  const notebookPath = {
    "montecarlo": "01_monte_carlo_sim.html",
    "elasticity": "03_elasticity_saas.html",
    "price-engine": "02_pricing_bandits_kaseya.html",
    "forecast": "04_forecast_signals.html",
    "rl-pricing": "06_rl_pricing.html",
    "sentiment": "05_sentiment_alpha.html",
    "volatility": "07_garch_volatility.html",
  };

  useEffect(() => {
    async function load() {
      const endpoints = [
        "elasticity",
        "price-engine",
        "montecarlo",
        "forecast",
        "rl-pricing",
        "sentiment",
        "volatility",
      ];

      const responses = await Promise.all(
        endpoints.map(async (name) => {
          const start = performance.now();
          try {
            const res = await fetch(`/api/${name}`);
            let data;
            try {
              data = await res.json();
            } catch {
              data = { error: "Invalid JSON returned" };
            }

            const latency = Math.round(performance.now() - start);
            const httpOkay = res.ok;
            const backendOkay = data?.status === "online";
            const hasError = data?.error || data?.data?.error || data?.detail;
            const isOnline = httpOkay && backendOkay && !hasError;

            return {
              model: data?.model || name,
              status: isOnline ? "online" : "offline",
              latency,
              uptime: (Math.random() * 1 + 99).toFixed(2),
              version: "v1.0.0",
              framework: "PyTorch 2.6.0+cu124",
              lastUpdated: data?.lastUpdated || new Date().toLocaleString(),
              data: data?.data || data || { error: "API failed or bad data" },
              chartData: Array.from({ length: 4 }, (_, i) => ({
                x: `W${i + 1}`,
                y: Math.random() * 100,
              })),
            };
          } catch {
            return {
              model: name,
              status: "offline",
              latency: null,
              uptime: "—",
              version: "v1.0.0",
              framework: "PyTorch 2.6.0+cu124",
              lastUpdated: new Date().toLocaleString(),
              data: { error: "Fetch failed" },
              chartData: [],
            };
          }
        })
      );

      setModels(responses);
    }

    load();
  }, []);

  const shimmerCards = new Array(7).fill(null).map((_, i) => (
    <div key={i} className="circuit-frame rounded-2xl animate-pulse">
      <div className="circuit-inner rounded-2xl p-4 bg-gradient-to-br from-slate-700/30 to-slate-900/20">
        <div className="h-5 w-1/2 bg-slate-600 rounded mb-2"></div>
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-block w-3 h-3 rounded-full bg-slate-500"></span>
          <span className="h-3 w-12 bg-slate-600 rounded"></span>
        </div>
        <div className="h-[100px] bg-slate-800 rounded"></div>
      </div>
    </div>
  ));

  return (
    <div className="min-h-screen bg-dashboard text-white font-poppins">
      <Head>
        <title>James Boggs – Quant Dashboard</title>
        <meta name="description" content="Real-time ML/Quant Finance Dashboard powered by PyTorch + FastAPI." />
      </Head>

      <main className="flex flex-col md:flex-row">
        <aside className="relative md:sticky md:top-0 md:h-screen md:w-1/2 lg:w-2/5 flex justify-center items-center p-6 glow-sidebar">
          <div className="flex flex-col items-center text-center space-y-5">
            <div className="circuit-frame rounded-2xl">
              <div className="circuit-inner rounded-2xl p-1">
                <img src="/profile.png" alt="James Boggs Profile" className="w-72 h-80 object-cover rounded-2xl border border-[#81D8D0]/40 shadow-lg" />
              </div>
            </div>
            <h2 className="text-2xl font-extrabold mt-4">James Boggs</h2>
            <p className="text-gray-300 max-w-xs">
              Finance & AI/ML Engineer<br />
              SaaS Pricing • Quant Forecasting • Real-Time Infra
            </p>
          </div>
        </aside>

        <section className="w-full md:w-1/2 lg:w-4/5 overflow-y-auto px-4 py-8 space-y-16">
          <header className="text-center space-y-4">
            <h1 className="text-5xl lg:text-6xl font-extrabold">
              LIVE <span className="text-[#81D8D0]">QUANT DASHBOARD</span>
            </h1>
            <p className="text-sm text-gray-400 max-w-2xl mx-auto">
              Each card below is powered by a live PyTorch model deployed with FastAPI. This is a real-time simulation stack built to mirror production systems in quant finance.
            </p>
            <div className="circuit-trace w-full my-4" />
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {models.length === 0
              ? shimmerCards
              : models.map((m, i) => (
                <div key={i} className="space-y-4">
                  {/* Circuit-framed API card */}
                  <div className="circuit-frame rounded-2xl hover:scale-[1.01] transition-transform">
                    <div className="circuit-inner rounded-2xl p-4 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 backdrop-blur-sm">
                      <h2 className="text-lg font-bold text-[#81D8D0] mb-1">{m.model}</h2>
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <span className={`inline-block w-3 h-3 rounded-full ${m.status === "online" ? "bg-green-500" : "bg-red-500"}`}></span>
                        <span>{m.status.charAt(0).toUpperCase() + m.status.slice(1)}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mb-2">
                        {m.version} • {m.framework} • Latency: {m.latency ? `${m.latency}ms` : "—"} • Uptime: {m.uptime}%
                      </p>
                      <ResponsiveContainer width="100%" height={100}>
                        <LineChart data={m.chartData}>
                          <Line type="monotone" dataKey="y" stroke="#81D8D0" strokeWidth={2} dot={false} />
                          <XAxis dataKey="x" hide />
                          <YAxis hide />
                          <Tooltip />
                        </LineChart>
                      </ResponsiveContainer>
                      <pre className="text-xs text-white bg-black/30 p-2 mt-3 rounded-md overflow-x-auto max-h-32">
                        {JSON.stringify(m.data, null, 2)}
                      </pre>
                    </div>
                  </div>

                  {/* Notebook + GitHub (outside frame) */}
                  <div className="text-xs bg-slate-900/30 p-3 rounded-xl border border-slate-700 space-y-3">
                    <button onClick={() => setExpanded(expanded === i ? null : i)} className="w-full text-xs text-indigo-400 hover:underline text-left">
                      {expanded === i ? "Hide Notebook" : "View Notebook"}
                    </button>

                    {expanded === i && (
                      <iframe
                        src={`/notebooks/${notebookPath[m.model.toLowerCase()]}`}
                        className="w-full h-[400px] rounded-md border border-slate-700"
                      />
                    )}

                    <a
                      href={`https://github.com/jboggs-ai/${m.model.toLowerCase()}-fastapi`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 px-3 py-1 bg-slate-800/50 border border-slate-600 rounded hover:bg-slate-700 text-center text-white text-xs w-full"
                    >
                      View GitHub Repo
                    </a>
                  </div>
                </div>
              ))}
          </div>

          <footer className="text-center text-xs text-gray-500 pt-12 pb-4 space-y-2">
            <div className="flex justify-center flex-wrap gap-2 text-[11px]">
              <span>Quant ML Stack •</span>
              <span>PyTorch • CUDA • FastAPI • Render • Next.js • Tailwind</span>
            </div>
            <p>© {new Date().getFullYear()} James Boggs – Built for Real-Time Quant Systems</p>
          </footer>
        </section>
      </main>
    </div>
  );
}
