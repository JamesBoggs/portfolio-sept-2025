export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ detail: "Method Not Allowed" });
  }

  try {
    const response = await fetch("https://montecarlo-fastapi.onrender.com/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trials: 10000,
        mu: 0.05,
        sigma: 0.2,
      }),
    });

    const data = await response.json();
    return res.status(200).json({
      model: "montecarlo-v1.0.0",
      ...data,
    });
  } catch (err) {
    return res.status(500).json({
      error: "API call failed.",
      details: err.message,
    });
  }
}
