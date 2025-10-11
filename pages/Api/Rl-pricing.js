export default function handler(req, res) {
  res.status(200).json({
    model: "rl-pricing-agent-v0.5.4",
    status: "offline",
    latency: "N/A",
    lastUpdated: "2025-10-11",
    data: {
      note: "Training new policy — model temporarily offline.",
    },
  });
}
