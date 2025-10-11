import Head from "next/head";
import Link from "next/link";
import { FaEnvelope } from "react-icons/fa";
import { useEffect, useState } from "react";
import PricingEngineShowcase from "./components/PricingEngineShowcase";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const socialLinks = [
  { href: "mailto:jboggs.econ@gmail.com", label: "Email", icon: FaEnvelope },
];

export default function Home() {
  const [openCard, setOpenCard] = useState(null);
  const [models, setModels] = useState([]);

  const notebookCards = [
    {
      id: "pricing",
      title: "Pricing & SaaS Analytics",
      gradient: "from-indigo-400 to-purple-600",
      src: "/notebooks/02_pricing_bandits_kaseya.html",
    },
    {
      id: "ml",
      title: "AI/ML Engineering (Python, PyTorch, NLP)",
      gradient: "from-green-400 to-emerald-600",
      src: "/notebooks/01_bayesian_ab_cuped_kaseya.html",
    },
    {
      id: "finance",
      title: "Financial Modeling & Treasury Strategy",
      gradient: "from-orange-400 to-red-500",
      src: "/notebooks/04_uplift_modeling_churn_kaseya.html",
    },
    {
      id: "data",
      title: "Data Pipelines & Automation",
      gradient: "from-blue-400 to-cyan-500",
      src: "/notebooks/03_did_automation_humanscale.html",
    },
  ];

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
            const data = await res.json();

            return {
              model: data.model || name,
              status: "online",
              lastUpdated: new Date().toLocaleString(),
              data,
              chartData: [
                { x: "W1", y: Math.random() * 100 },
                { x: "W2", y: Math.random() * 100 },
                { x: "W3", y: Math.random() * 100 },
                { x: "W4", y: Math.random() * 100 },
              ],
            };
          } catch (err) {
            return {
              model: name,
              status: "offline",
              lastUpdated: new Date().toLocaleString(),
              data: { error: "API failed" },
              chartData: [],
            };
          }
        })
      );

      setModels(responses);
    }

    load();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-poppins">
      <Head>
        <title>James Boggs – Portfolio</title>
        <meta
          name="description"
          content="Portfolio of James Boggs – Finance & AI/ML Engineer specializing in SaaS pricing, analytics, and ML pipelines."
        />
      </Head>

      <main className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="md:sticky md:top-0 md:h-screen md:w-1/2 lg:w-2/5 bg-white text-black p-6 flex justify-center items-center shadow-lg">
          <div className="flex flex-col items-center text-center space-y-5">
            <div className="circuit-frame rounded-2xl">
              <div className="circuit-inner rounded-2xl p-1">
                <img
                  src="/profile.png"
                  alt="James Boggs Profile Picture"
                  className="w-72 h-80 object-cover rounded-2xl"
                />
              </div>
            </div>
            <h2 className="text-2xl font-extrabold mt-4">James Boggs</h2>
            <p className="text-gray-600 max-w-xs">
              Finance & AI/ML Engineer | SaaS Pricing, Treasury Strategy, ML Systems
            </p>
            <nav>
              <ul className="flex space-x-4 text-indigo-500 text-xl">
                {socialLinks.map(({ href, label, icon: Icon }) => (
                  <li key={label}>
                    <Link href={href} aria-label={label} className="hover:scale-150 transition-transform" target="_blank" rel="noopener noreferrer">
                      <Icon />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main */}
        <section className="w-full md:w-1/2 lg:w-4/5 overflow-y-auto px-4 py-8 space-y-16">
          <header className="text-center space-y-4">
            <h1 className="text-5xl lg:text-6xl font-extrabold">FINANCE & AI/ML <br /><span className="text-[#81D8D0]">ENGINEER</span></h1>
            <div className="circuit-trace w-full my-4" />
          </header>

          {/* Pricing Engine */}
          <div className="circuit-frame rounded-2xl">
            <div className="circuit-inner rounded-2xl p-4 md:p-6 overflow-hidden">
              <PricingEngineShowcase />
            </div>
          </div>

          {/* Live Dashboard */}
          <section>
            <h2 className="text-2xl font-bold text-[#81D8D0] text-center mb-4">Live Quant Dashboard</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {models.map((m, i) => (
                <div key={i} className="circuit-frame rounded-2xl">
                  <div className="circuit-inner rounded-2xl p-4 bg-gradient-to-br from-indigo-500/20 to-purple-600/20">
                    <h2 className="text-lg font-bold text-[#81D8D0] mb-1">{m.model}</h2>
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <span className={`inline-block w-3 h-3 rounded-full ${m.status === "online" ? "bg-green-500" : "bg-red-500"}`}></span>
                      <span>{m.status.charAt(0).toUpperCase() + m.status.slice(1)}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">Last Updated: {m.lastUpdated}</p>
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
              ))}
            </div>
          </section>

          {/* Notebook Cards */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#81D8D0] text-center">Notebook Case Studies</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {notebookCards.map(({ id, title, gradient, src }) => (
                <div key={id} className="circuit-frame rounded-2xl cursor-pointer" onClick={() => setOpenCard(openCard === id ? null : id)}>
                  <div className={`circuit-inner rounded-2xl p-6 text-center bg-gradient-to-br ${gradient} hover:scale-[1.01] transition-transform`}>
                    <h3 className="text-xl font-semibold text-[#81D8D0]">{title}</h3>
                    <p className="text-sm text-white/90">{openCard === id ? "Click to close" : "Click to preview"}</p>
                    {openCard === id && (
                      <iframe src={src} className="w-full h-72 mt-4 rounded-xl" loading="lazy" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <footer className="text-center text-xs text-gray-500 pt-12 pb-4">
            © {new Date().getFullYear()} James Boggs | Powered by <span className="text-indigo-400">Next.js</span>
          </footer>
        </section>
      </main>
    </div>
  );
}
