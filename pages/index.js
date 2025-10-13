import Head from "next/head";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Home() {
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
          try {
            const res = await fetch(`/api/${name}`);
            let data;

            try {
              data = await res.json();
            } catch {
              data = { error: "Invalid JSON returned" };
            }

            const httpOkay = res.ok;
            const backendOkay = data?.status === "online";
            const hasError = data?.error || data?.data?.error || data?.detail;
            const isOnline = httpOkay && backendOkay && !hasError;

            return {
              model: data?.model || name,
              status: isOnline ? "online" : "offline",
              lastUpdated: data?.lastUpdated || new Date().toLocaleString(),
              data: data?.data || data || { error: "API failed or bad data" },
              chartData: [
                { x: "W1", y: Math.random() * 100 },
                { x: "W2", y: Math.random() * 100 },
                { x: "W3", y: Math.random() * 100 },
                { x: "W4", y: Math.random() * 100 },
              ],
            };
          } catch (error) {
            return {
              model: name,
              status: "offline",
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
        <div className="h-3 w-3/4 bg-slate-700 rounded mb-3"></div>
        <div className="h-[100px] bg-slate-800 rounded mb-3"></div>
        <div className="h-20 bg-slate-700 rounded"></div>
      </div>
    </div>
  ));

  return (
    <div className="min-h-screen bg-dashboard text-white font-poppins">
      <Head>
        <title>James Boggs – Quant Dashboard</title>
        <meta
          name="description"
          content="Live Quant Dashboard by James Boggs – Finance & AI/ML Engineer"
        />
      </Head>

      <main className="flex flex-col md:flex-row">
        {/* SIDEBAR */}
        <aside className="relative md:sticky md:top-0 md:h-screen md:w-1/2 lg:w-2/5 flex justify-center items-center p-6 glow-sidebar">
          <div className="flex flex-col items-center text-center space-y-5">
            <div className="circuit-frame rounded-2xl">
              <div className="circuit-inner rounded-2xl p-1">
                <img
                  src="/profile.png"
                  alt="James Boggs Profile"
                  className="w-72 h-80 object-cover rounded-2xl border border-[#81D8D0]/40 shadow-lg"
                />
              </div>
            </div>
            <h2 className="text-2xl font-extrabold mt-4">James Boggs</h2>
            <p className="text-gray-300 max-w-xs">
              Finance & AI/ML Engineer <br /> SaaS Pricing • Treasury • ML Systems
            </p>
          </div>
        </aside>

        {/* DASHBOARD */}
        <section className="w-full md:w-1/2 lg:w-4/5 overflow-y-auto px-4 py-8 space-y-16">
          <header className="text-center space-y-4">
            <h1 className="text-5xl lg:text-6xl font-extrabold">
              LIVE <span className="text-[#81D8D0]">QUANT DASHBOARD</span>
            </h1>
            <div className="circuit-trace w-full my-4" />
          </header>

          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {models.length === 0
                ? shimmerCards
                : models.map((m, i) => (
                    <div key={i} className="circuit-frame rounded-2xl">
                      <div className="circuit-inner rounded-2xl p-4 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 backdrop-blur-sm">
                        <h2 className="text-lg font-bold text-[#81D8D0] mb-1">{m.model}</h2>
                        <div className="flex items-center gap-2 text-sm mb-2">
                          <span
                            className={`inline-block w-3 h-3 rounded-full ${
                              m.status === "online" ? "bg-green-500" : "bg-red-500"
                            }`}
                          ></span>
                          <span>
                            {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">
                          Last Updated: {m.lastUpdated}
                        </p>
                        <ResponsiveContainer width="100%" height={100}>
                          <LineChart data={m.chartData}>
                            <Line
                              type="monotone"
                              dataKey="y"
                              stroke="#81D8D0"
                              strokeWidth={2}
                              dot={false}
                            />
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
                  ))}
            </div>
          </section>

          <footer className="text-center text-xs text-gray-500 pt-12 pb-4">
            © {new Date().getFullYear()} James Boggs | Powered by{" "}
            <span className="text-indigo-400">Next.js</span>
          </footer>
        </section>
      </main>
    </div>
  );
}
