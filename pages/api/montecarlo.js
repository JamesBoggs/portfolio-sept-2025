export default async function handler(req, res) {
  try {
    const response = await fetch("https://montecarlo-fastapi.onrender.com/montecarlo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Bad response: ${response.status} – ${err}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error("Monte Carlo API error:", err);
    res.status(500).json({
      model: "montecarlo-v1.0.0",
      status: "offline",
      lastUpdated: "2025-10-11",
      data: { error: "API call failed.", details: err.message }
    });
  }
}
