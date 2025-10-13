import Head from "next/head";
import { useEffect, useState, useRef } from "react";
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
  const cardsRef = useRef([]);

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

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        expanded !== null &&
        cardsRef.current[expanded] &&
        !cardsRef.current[expanded].contains(event.target)
      ) {
        setExpanded(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expanded]);

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

          {/* MODEL CARDS */}
          <div className="grid
