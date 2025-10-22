cd "$HOME/Portfolio October 2025/portfolio-sept-2025"

# 1) make sure there isn't a second file shadowing it
ls -1 pages | grep -i 'monte' || true
# if you see pages/monte-carlo.tsx (or .jsx), remove it:
git rm -f pages/monte-carlo.tsx 2>/dev/null || true

# 2) overwrite the page with a client-only version
cat > pages/monte-carlo.js <<'EOF'
// pages/monte-carlo.js — client-only
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function StatusBadge({ status }) {
  if (status === "online") {
    return (
      <div className="flex items-center gap-2 text-sm mb-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
        </span>
        <span>Online</span>
      </div>
    );
  }
  if (status === "degraded") {
    return (
      <div className="flex items-center gap-2 text-sm mb-2">
        <span className="inline-block w-3 h-3 rounded-full bg-amber-400" />
        <span>Degraded</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-sm mb-2">
      <span className="inline-block w-3 h-3 rounded-full bg-rose-500" />
      <span>Offline</span>
    </div>
  );
}

function MonteCarloInner() {
  const [card, setCard] = useState({
    status: "offline",
    latency: null,
    data: { note: "loading…" },
    chartData: [],
    endpoint_url: null,
    endpoint_status: null,
  });

  useEffect(() => {
    (async () => {
      try {
        const t0 = performance.now();
        const r = await fetch("/api/montecarlo");
        const j = await r.json();
        setCard({
          status: j?.status || (r.ok ? "online" : "offline"),
          latency: j?.latency_ms ?? Math.round(performance.now() - t0),
          data: j?.data || {},
          chartData: j?.chartData || [],
          endpoint_url: j?.endpoint_url || j?.source || null,
          endpoint_status: j?.endpoint_status ?? null,
        });
      } catch (e) {
        setCard((c) => ({ ...c, status: "offline", data: { error: e?.message || "fetch failed" } }));
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-dashboard text-white p-6">
      <h1 className="text-3xl font-bold mb-4">Monte Carlo</h1>

      <div className="circuit-frame rounded-2xl max-w-3xl">
        <div className="circuit-inner rounded-2xl p-4 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 backdrop-blur-sm">
          <StatusBadge status={card.status} />
          <p className="text-[10px] text-gray-400 mb-2">Latency: {card.latency ? `${card.latency}ms` : "—"}</p>

          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={card.chartData}>
                <Line type="monotone" dataKey="y" stroke="#81D8D0" strokeWidth={2} dot={false} />
                <XAxis dataKey="x" hide />
                <YAxis hide />
                <Tooltip />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <pre className="text-xs text-white bg-black/30 p-2 mt-3 rounded-md overflow-x-auto max-h-64">
            {JSON.stringify(card.data, null, 2)}
          </pre>

          {card.endpoint_url && (
            <p className="text-[10px] text-gray-500 mt-2 break-all">
              Endpoint: {card.endpoint_url} • {card.endpoint_status ?? ""}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// prevent any server-side render/prerender
export const getStaticProps = async () => ({ props: {} });
export default dynamic(() => Promise.resolve(MonteCarloInner), { ssr: false });
EOF
