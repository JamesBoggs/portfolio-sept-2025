import { useState } from 'react';
import dynamic from 'next/dynamic';
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function MonteCarlo() {
  const [start, setStart] = useState(1000000);
  const [growth, setGrowth] = useState(0.05);
  const [churn, setChurn] = useState(0.02);
  const [sigma, setSigma] = useState(0.03);
  const [months, setMonths] = useState(12);
  const [sims, setSims] = useState(5000);
  const [data, setData] = useState([]);

  const runSim = () => {
    const arrs = [];
    for (let s = 0; s < sims; s++) {
      let series = [start];
      for (let t = 1; t < months; t++) {
        const shock = (growth - churn) + sigma * (Math.random() - 0.5);
        series.push(series[t - 1] * (1 + shock));
      }
      arrs.push(series);
    }
    const mean = Array.from({ length: months }, (_, i) =>
      arrs.reduce((a, b) => a + b[i], 0) / sims
    );
    setData(mean);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-4">Monte Carlo ARR Forecast</h1>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <label>Start ARR ($)
          <input type="number" value={start} onChange={e => setStart(+e.target.value)} className="border p-1 w-full"/>
        </label>
        <label>Mean Growth (e.g. 0.05)
          <input type="number" step="0.01" value={growth} onChange={e => setGrowth(+e.target.value)} className="border p-1 w-full"/>
        </label>
        <label>Mean Churn
          <input type="number" step="0.01" value={churn} onChange={e => setChurn(+e.target.value)} className="border p-1 w-full"/>
        </label>
        <label>Volatility (σ)
          <input type="number" step="0.01" value={sigma} onChange={e => setSigma(+e.target.value)} className="border p-1 w-full"/>
        </label>
        <label>Months
          <input type="number" value={months} onChange={e => setMonths(+e.target.value)} className="border p-1 w-full"/>
        </label>
        <label>Simulations
          <input type="number" value={sims} onChange={e => setSims(+e.target.value)} className="border p-1 w-full"/>
        </label>
      </div>
      <button onClick={runSim} className="bg-blue-600 text-white px-4 py-2 rounded">Run Simulation</button>

      {data.length > 0 && (
        <Plot
          data={[{ y: data, type: 'scatter', mode: 'lines', line: { color: 'blue' } }]}
          layout={{
            title: 'Expected ARR Over Time',
            xaxis: { title: 'Months' },
            yaxis: { title: 'ARR ($)' },
          }}
        />
      )}
    </div>
  );
}
