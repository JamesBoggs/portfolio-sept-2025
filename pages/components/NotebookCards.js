import { useState } from "react";

export default function NotebookCards() {
  const [openCard, setOpenCard] = useState(null);

  const cards = [
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
      {cards.map(({ id, title, gradient, src }) => (
        <div
          key={id}
          onClick={() => setOpenCard(openCard === id ? null : id)}
          className={`cursor-pointer bg-gradient-to-br ${gradient} p-6 rounded-xl font-semibold text-black shadow-md transition-transform duration-300 hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(129,216,208,0.35)]`}
        >
          <h3 className="text-lg font-bold mb-2">{title}</h3>
          <p className="text-slate-900/80 text-sm">
            {openCard === id
              ? "Click again to close notebook."
              : "Click to preview this notebook."}
          </p>

          {openCard === id && (
            <iframe
              src={src}
              className="w-full h-72 mt-4 rounded border border-white/20"
              loading="lazy"
            />
          )}
        </div>
      ))}
    </div>
  );
}
