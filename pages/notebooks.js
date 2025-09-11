export default function Notebooks() {
  const notebooks = [
    { file: "01_bayesian_ab_cuped_kaseya.html", title: "Bayesian A/B (CUPED) – Kaseya" },
    { file: "02_pricing_bandits_kaseya.html", title: "Pricing with Multi-Armed Bandits – Kaseya" },
    { file: "03_did_automation_humanscale.html", title: "Difference-in-Differences Automation – Humanscale" },
    { file: "04_uplift_modeling_churn_kaseya.html", title: "Uplift Modeling for Churn – Kaseya" },
    { file: "05_offpolicy_eval_ips_dr.html", title: "Off-Policy Evaluation (IPS/DR)" },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold mb-8">My Jupyter Notebooks</h1>
      <ul className="space-y-4">
        {notebooks.map(({ file, title }) => (
          <li key={file}>
            <a
              href={`/notebooks/${file}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 underline hover:text-indigo-200"
            >
              {title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
