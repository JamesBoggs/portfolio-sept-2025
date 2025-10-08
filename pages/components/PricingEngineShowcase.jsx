"use client";
import React, { useState } from "react";

const PricingEngineShowcase = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const simulatePricing = () => {
    setLoading(true);
    setTimeout(() => {
      const rows = Array.from({ length: 10 }, (_, i) => {
        const arr = Math.floor(Math.random() * 200000 + 50000);
        const seats = Math.floor(Math.random() * 500 + 50);
        const discount = (Math.random() * 25).toFixed(1);
        const usage = (Math.random() * 1.5).toFixed(2);
        const score = arr * 0.0004 + seats * 0.02 - discount * 0.1 + usage * 10;
        const tiers = ["Basic", "Pro", "Enterprise", "Custom"];
        const tier = tiers[Math.min(3, Math.floor(score / 40))];

        return {
          id: i + 1,
          arr: `$${arr.toLocaleString()}`,
          seats,
          discount: `${discount}%`,
          usage,
          tier,
        };
      });
      setData(rows);
      setLoading(false);
    }, 800);
  };

  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "10px",
        padding: "2rem",
        maxWidth: "750px",
        margin: "2rem auto",
        textAlign: "center",
      }}
    >
      <h2>AI Pricing Engine Demo</h2>
      <p>
        This simulation mimics a PyTorch-based SaaS pricing model that groups
        clients by behavior and recommends tiers.
      </p>

      <button
        onClick={simulatePricing}
        style={{
          background: "#0070f3",
          color: "#fff",
          border: "none",
          padding: "0.7rem 1.4rem",
          borderRadius: "6px",
          cursor: "pointer",
          marginTop: "1rem",
        }}
      >
        {loading ? "Running Simulation..." : "Generate Pricing Data"}
      </button>

      {data.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "2rem",
          }}
        >
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th>ID</th>
              <th>ARR</th>
              <th>Seats</th>
              <th>Discount</th>
              <th>Usage</th>
              <th>Tier</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                <td style={{ padding: "8px" }}>{row.id}</td>
                <td style={{ padding: "8px" }}>{row.arr}</td>
                <td style={{ padding: "8px" }}>{row.seats}</td>
                <td style={{ padding: "8px" }}>{row.discount}</td>
                <td style={{ padding: "8px" }}>{row.usage}</td>
                <td style={{ padding: "8px", fontWeight: "bold" }}>{row.tier}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PricingEngineShowcase;
