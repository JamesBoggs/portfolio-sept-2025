export default async function handler(req, res) {
  try {
    const response = await fetch("https://montecarlo-fastapi.onrender.com/elasticity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const msg = await response.text();
      throw new Error(`Backend error: ${msg}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error("Elasticity API error:", err.message);
    res.status(500).json({
      model: "elasticity-v1.2.3",
      status: "offline",
      lastUpdated: "2025-10-11",
      data: { error: "API failed", detail: err.message },
    });
  }
}
