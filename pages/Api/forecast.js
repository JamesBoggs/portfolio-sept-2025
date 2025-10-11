export default function handler(req, res) {
  res.status(200).json({
    model: "forecast-transformer-v0.9.1",
    status: "beta",
    latency: "92ms",
    lastUpdated: "2025-10-11",
    data: {
      days: 90,
      predictedARR: [102.1, 106.4, 109.7],
      accuracy: "±6.3%",
    },
  });
}
