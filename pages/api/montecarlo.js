export default function handler(req, res) {
  res.status(200).json({
    model: "montecarlo-v1.0.2",
    status: "online",
    latency: "85ms",
    lastUpdated: "2025-10-11",
    data: {
      trials: 5000,
      meanARR: 122.4,
      stdDev: 14.8,
      confidenceInterval: "±11.2%",
    },
  });
}
