export default function handler(req, res) {
  res.status(200).json({
    model: "elasticity-v1.2.3",
    status: "online",
    latency: "74ms",
    lastUpdated: "2025-10-11",
    data: {
      elasticity: 1.24,
      rSquared: 0.87,
      optimalPrice: 18.99,
    },
  });
}
