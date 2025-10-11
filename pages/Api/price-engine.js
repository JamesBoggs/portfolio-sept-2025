export default function handler(req, res) {
  res.status(200).json({
    model: "price-engine-v2.1.0",
    status: "beta",
    latency: "68ms",
    lastUpdated: "2025-10-11",
    data: {
      tiers: ["Free", "Pro", "Enterprise"],
      recommendedPrices: [0, 29, 149],
      marginFloor: "35%",
    },
  });
}
