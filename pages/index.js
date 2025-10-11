import Head from "next/head";
import Link from "next/link";
import { FaEnvelope } from "react-icons/fa";
import { useState } from "react";
import PricingEngineShowcase from "./components/PricingEngineShowcase";

const socialLinks = [
  {
    href: "mailto:jboggs.econ@gmail.com",
    label: "Email",
    icon: FaEnvelope,
  },
];

export default function Home() {
  const [openCard, setOpenCard] = useState(null);

  const notebookCards = [
    {
      id: "pricing",
      title: "Pricing & SaaS Analytics",
      gradient: "from-indigo-400 to-purple-600",
      textColor: "text-white",
      src: "/notebooks/02_pricing_bandits_kaseya.html",
    },
    {
      id: "ml",
      title: "AI/ML Engineering (Python, PyTorch, NLP)",
      gradient: "from-green-400 to-emerald-600",
      textColor: "text-black",
      src: "/notebooks/01_bayesian_ab_cuped_kaseya.html",
    },
    {
      id: "finance",
      title: "Financial Modeling & Treasury Strategy",
      gradient: "from-orange-400 to-red-500",
      textColor: "text-white",
      src: "/notebooks/04_uplift_modeling_churn_kaseya.html",
    },
    {
      id: "data",
      title: "Data Pipelines & Automation",
      gradient: "from-blue-400 to-cyan-500",
      textColor: "text-black",
      src: "/notebooks/03_did_automation_humanscale.html",
    },
  ];

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
        {/* Sidebar with Profile */}
        <aside className="md:sticky md:top-0 md:h-screen md:w-1/2 lg:w-2/5 bg-white text-black p-8 md:rounded-r-3xl shadow-lg flex justify-center items-center">
          <div className="flex flex-col items-center text-center space-y-5">
            {/* photo wrapped */}
            <div className="relative rounded-2xl p-[2px] rainbow-border">
              <img
                src="/profile.png"
                alt="James Boggs Profile Picture"
                className="w-80 h-96 object-cover rounded-2xl"
                loading="lazy"
              />
            </div>

            <h2 className="text-2xl font-extrabold mt-4">James Boggs</h2>
            <p className="text-gray-600 max-w-xs">
              Finance & AI/ML Engineer | SaaS Pricing, Treasury Strategy, and ML Systems
            </p>

            <nav aria-label="Contact">
              <ul className="flex space-x-4 text-indigo-500 text-xl">
                {socialLinks.map(({ href, label, icon: Icon }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      aria-label={label}
                      className="transition-transform hover:scale-150"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <section className="w-full md:w-1/2 lg:w-4/5 overflow-y-auto p-8 space-y-16">
          {/* Hero */}
          <header className="p-8 text-center sm:text-left">
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight relative inline-block pb-6">
              FINANCE & AI/ML <br />
              <span className="text-[#6a6a6a] font-extrabold">ENGINEER</span>
              <span className="absolute bottom-0 left-12 sm:left-0 w-40 h-1 bg-gradient-to-r from-indigo-500 to-purple-400 rounded-full"></span>
            </h1>

            {/* pricing demo wrapped */}
            <div className="relative rounded-xl p-[2px] rainbow-border mt-8">
              <div className="bg-slate-900 rounded-xl p-4">
                <PricingEngineShowcase />
              </div>
            </div>

            {/* simulators wrapped */}
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="relative rounded-xl p-[2px] rainbow-border">
                <Link
                  href="/monte-carlo"
                  className="block bg-slate-900 rounded-xl p-6 transition-transform hover:scale-[1.02]"
                >
                  <h2 className="text-xl font-semibold mb-2 text-tiffany">
                    Monte Carlo Forecast
                  </h2>
                  <p className="text-slate-300 text-sm">
                    Simulate ARR outcomes with stochastic growth and churn.
                  </p>
                </Link>
              </div>

              <div className="relative rounded-xl p-[2px] rainbow-border">
                <Link
                  href="/elasticity-simulator"
                  className="block bg-slate-900 rounded-xl p-6 transition-transform hover:scale-[1.02]"
                >
                  <h2 className="text-xl font-semibold mb-2 text-tiffany">
                    Elasticity Simulator
                  </h2>
                  <p className="text-slate-300 text-sm">
                    Visualize how pricing moves affect demand and revenue.
                  </p>
                </Link>
              </div>
            </div>

            <p className="mt-6 text-gray-400 w-full lg:w-3/4">
              I build scalable ML systems, design SaaS pricing strategies, and create
              financial models that align technology with business growth. Experience at
              Kaseya (SaaS strategy, OCR automation) and Humanscale (treasury automation,
              pricing elasticity).
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-12 mt-10 justify-center lg:justify-start">
              {[
                { value: "6+", label: "Years in Finance & Strategy" },
                { value: "10+", label: "ML/AI Projects Delivered" },
                { value: "100M+", label: "SaaS ARR Forecasted" },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-5xl font-semibold">{value}</p>
                  <h3 className="text-m text-gray-400 uppercase">{label}</h3>
                </div>
              ))}
            </div>
          </header>

          {/* Notebook Cards wrapped */}
          <section
            className="w-full xl:w-4/5 sm:pb-8 sm:pe-8"
            aria-label="Notebook Demos"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 perspective-[1000px]">
              {notebookCards.map(({ id, title, gradient, textColor, src }) => (
                <div
                  key={id}
                  onClick={() => setOpenCard(openCard === id ? null : id)}
                  className="relative rounded-xl p-[2px] rainbow-border cursor-pointer"
                >
                  <div
                    className={`group bg-gradient-to-br ${gradient} ${textColor} p-6 rounded-xl relative overflow-hidden backdrop-blur-md bg-opacity-60 border border-white/10 transition-transform duration-500 hover:rotate-x-[6deg] hover:rotate-y-[6deg]`}
                  >
                    <h3 className="text-lg font-semibold leading-snug">{title}</h3>
                    <p className="text-sm mt-1 opacity-80">
                      {openCard === id
                        ? "Click to close notebook"
                        : "Click to preview notebook"}
                    </p>

                    {openCard === id && (
                      <iframe
                        src={src}
                        className="w-full h-72 mt-4 rounded-lg border border-white/20 transition-all duration-500"
                        loading="lazy"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <footer className="text-center text-xs text-gray-500 mt-20 pb-6">
            © {new Date().getFullYear()} James Boggs | Powered by{" "}
            <span className="text-indigo-400">Next.js</span>
          </footer>
        </section>
      </main>
    </div>
  );
}
