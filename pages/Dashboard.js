import { useEffect, useState } from "react";
import Head from "next/head";

export default function Dashboard() {
  const [models, setModels] = useState([]);

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
          const res = await fetch(`/api/${name}`);
          return res.json();
        })
      );

      setModels(responses);
    }

    load();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-poppins p-6 md:p-12">
      <Head>
        <title>Quant Dashboard – James Boggs</title>
        <meta name="description" content="Live AI-powered pricing dashboard by James Boggs" />
      </Head>

      {/* Metrics Strip */}
      <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400 mb-8">
        <span>Latency: 74 ms</span>
        <span>Uptime: 99.9%</span>
        <span>Last Deploy: Oct 2025</span>
      </div>

      <h1 className="text-3xl font-extrabold mb-6 text-center">
        Pricing & Forecasting Models
      </h1>

      {/* Dashboard Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models.map((m, i) => (
          <div key={i} className="circuit-frame rounded-2xl">
            <div className="circuit-inner rounded-2xl p-6 bg-gradient-to-br from-indigo-500/30 to-purple-600/30">
              <h2 className="text-xl font-bold text-[#81D8D0] mb-1">{m.model}</h2>
              <p className="text-sm text-gray-300 mb-1">
                Status:{" "}
                <span
                  className={
                    m.status === "online"
                      ? "text-green-400"
                      : m.status === "beta"
                      ? "text-yellow-400"
                      : "text-red-400"
                  }
                >
                  {m.status}
                </span>
              </p>
              <p className="text-xs text-gray-400 mb-3">
                Last Updated: {m.lastUpdated}
              </p>
              <pre className="text-xs text-white bg-black/40 p-3 rounded-xl overflow-x-auto">
                {JSON.stringify(m.data, null, 2)}
              </pre>
            </div>
          </div>
        ))}
      </div>

      {/* Architecture Diagram */}
      <div className="mt-12 text-center">
        <h3 className="text-xl font-semibold mb-3 text-[#81D8D0]">Architecture</h3>
        <img
          src="/images/architecture.svg"
          alt="System Architecture"
          className="mx-auto max-w-md rounded-lg shadow-lg"
        />
        <p className="text-sm text-gray-500 mt-2">
          Next.js (Vercel) → API Routes → FastAPI (PyTorch) → Data Sources
        </p>
      </div>

      {/* Case Studies */}
      <section className="mt-16 text-left max-w-3xl mx-auto">
        <h3 className="text-2xl font-semibold text-[#81D8D0] mb-4 text-center">
          Case Studies
        </h3>
        <ul className="text-gray-300 space-y-4 text-sm">
          <li>
            📈 <strong>Kaseya:</strong> Reduced pricing turnaround 40% via elasticity & scenario testing.
          </li>
          <li>
            🏢 <strong>Humanscale:</strong> Margin guardrails deployed across 300+ SKUs.
          </li>
          <li>
            🤖 <strong>Forecast Module:</strong> ARR projections within ±6% accuracy over 90 days.
          </li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-500 pt-12">
        © {new Date().getFullYear()} James Boggs | Powered by Next.js
      </footer>
    </div>
  );
}
