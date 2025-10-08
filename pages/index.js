import Head from "next/head";
import Link from "next/link";
import { FaEnvelope, FaBook } from "react-icons/fa";
import PricingEngineShowcase from "./components/PricingEngineShowcase";

const socialLinks = [
  {
    href: "mailto:jboggs.econ@gmail.com",
    label: "Email",
    icon: FaEnvelope,
  },
  {
    href: "/notebooks",
    label: "Notebooks",
    icon: FaBook,
  },
];

const serviceCard = [
  {
    title: "Pricing & SaaS Analytics",
    gradient: "from-indigo-400 to-purple-600",
    textColor: "text-white",
    hoverShadow: "hover:shadow-[0_25px_50px_rgba(79,70,229,0.4)]",
  },
  {
    title: "AI/ML Engineering (Python, PyTorch, NLP)",
    gradient: "from-green-400 to-emerald-600",
    textColor: "text-black",
    hoverShadow: "hover:shadow-[0_25px_50px_rgba(16,185,129,0.3)]",
  },
  {
    title: "Financial Modeling & Treasury Strategy",
    gradient: "from-orange-400 to-red-500",
    textColor: "text-white",
    hoverShadow: "hover:shadow-[0_25px_50px_rgba(255,87,34,0.4)]",
  },
  {
    title: "Data Pipelines & Automation",
    gradient: "from-blue-400 to-cyan-500",
    textColor: "text-black",
    hoverShadow: "hover:shadow-[0_25px_50px_rgba(59,130,246,0.3)]",
  },
];

export default function Home() {
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
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-1">
              <img
                src="/profile.png"
                alt="James Boggs Profile Picture"
                className="w-80 h-96 object-cover rounded-2xl"
                loading="lazy"
              />
            </div>
            <h2 className="text-2xl font-extrabold">James Boggs</h2>
            <p className="text-gray-600 max-w-xs">
              Finance & AI/ML Engineer | SaaS Pricing, Treasury Strategy, and ML Systems
            </p>

            {/* Sidebar links (Email + Notebooks) */}
            <nav aria-label="Contact">
              <ul className="flex space-x-4 text-indigo-500 text-xl">
                {socialLinks.map(({ href, label, icon: Icon }) => {
                  const isInternal = href.startsWith("/");
                  return (
                    <li key={label}>
                      <Link
                        href={href}
                        aria-label={label}
                        className="transition-transform hover:scale-150"
                        {...(!isInternal
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        <Icon />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <section className="w-full md:w-1/2 lg:w-4/5 overflow-y-auto p-8 space-y-16">
          {/* Hero Section */}
          <header className="p-8 text-center sm:text-left">
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight relative inline-block pb-6">
              FINANCE & AI/ML <br />
              <span className="text-[#6a6a6a] font-extrabold">ENGINEER</span>
              <span className="absolute bottom-0 left-12 sm:left-0 w-40 h-1 bg-gradient-to-r from-indigo-500 to-purple-400 rounded-full"></span>
            </h1>
           <PricingEngineShowcase />
          <p className="mt-6 text-gray-400 w-full lg:w-3/4">
              I build scalable ML systems, design SaaS pricing strategies, and
              create financial models that align technology with business growth.
              Experience at Kaseya (SaaS strategy, OCR automation) and Humanscale
              (treasury automation, pricing elasticity).
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

            {/* CTA Button to Notebooks */}
            <div className="mt-12 text-center lg:text-left">
              <Link
                href="/notebooks"
                className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-500 transition"
              >
                View My Notebooks →
              </Link>
            </div>
          </header>

          {/* Services Cards */}
          <section
            className="w-full xl:w-4/5 sm:pb-8 sm:pe-8"
            aria-label="Service Highlights"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 perspective-[1000px]">
              {serviceCard.map(({ title, gradient, textColor, hoverShadow }, index) => (
                <div
                  key={index}
                  className={`group [transform-style:preserve-3d] transition-transform duration-500 hover:rotate-x-[6deg] hover:rotate-y-[6deg] bg-gradient-to-br ${gradient} ${textColor} p-6 rounded-xl relative overflow-hidden backdrop-blur-md bg-opacity-60 border border-white/10 ${hoverShadow}`}
                >
                  <div className="absolute inset-0 opacity-10 bg-cover" />
                  <div className="relative z-10">
                    <h3 className="text-lg font-semibold leading-snug">
                      {title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="text-center text-xs text-gray-500">
            © {new Date().getFullYear()} James Boggs | Powered by{" "}
            <span className="text-indigo-400">Next.js</span>
          </footer>
        </section>
      </main>
    </div>
  );
}
