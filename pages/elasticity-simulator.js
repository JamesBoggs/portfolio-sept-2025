import { useState } from 'react';
import dynamic from 'next/dynamic';
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function ElasticitySimulator() {
  const [basePrice, setBasePrice] = useState(100);
  const [baseQuantity, setBaseQuantity] = useState(1000);
  const [elasticity, setElasticity] = useState(-1.5);

  // Compute curves
  const prices = Array.from({ length: 100 }, (_, i) => basePrice * (0.5 + i / 100));
  const quantities = prices.map(p => baseQuantity * Math.pow(p / basePrice, elasticity));
  const revenues = prices.map((p, i) => p * quantities[i]);

  return (
    <div className="p-6 text-gray-100">
      <h1 className="text-3xl font-bold mb-4 text-white">Price Elasticity Simulator</h1>
      <p className="text-slate-300 mb-6">
        Adjust price elasticity, base price, and quantity to visualize how changes in pricing affect demand and revenue.
      </p>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <label>
          Base Price ($)
          <input
            type="number"
            value={basePrice}
            onChange={e => setBasePrice(+e.target.value)}
            className="border border-slate-700 bg-slate-800 text-white p-2 w-full rounded"
          />
        </label>

        <label>
          Base Quantity
          <input
            type="number"
            value={baseQuantity}
            onChange={e => setBaseQuantity(+e.target.value)}
            className="border border-slate-700 bg-slate-800 text-white p-2 w-full rounded"
          />
        </label>

        <label>
          Elasticity (negative)
          <input
            type="number"
            step="0.1"
            value={elasticity}
            onChange={e => setElasticity(+e.target.value)}
            className="border border-slate-700 bg-slate-800 text-white p-2 w-full rounded"
          />
        </label>
      </div>

      <Plot
        data={[
          {
            x: prices,
            y: quantities,
            type: 'scatter',
            mode: 'lines',
            name: 'Demand Curve',
            line: { color: '#38BDF8', width: 3 },
          },
          {
            x: prices,
            y: revenues,
            type: 'scatter',
            mode: 'lines',
            name: 'Revenue Curve',
            line: { color: '#0EA5E9', dash: 'dot' },
            yaxis: 'y2',
          },
        ]}
        layout={{
          title: 'Demand and Revenue vs. Price',
          plot_bgcolor: '#0f172a',
          paper_bgcolor: '#0f172a',
          font: { color: '#e2e8f0' },
          xaxis: { title: 'Price ($)' },
          yaxis: { title: 'Quantity Demanded' },
          yaxis2: {
            title: 'Revenue ($)',
            overlaying: 'y',
            side: 'right',
          },
          legend: { x: 0.05, y: 1.1, orientation: 'h' },
        }}
        style={{ width: '100%', height: '500px' }}
      />
    </div>
  );
}
