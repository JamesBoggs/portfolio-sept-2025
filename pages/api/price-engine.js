// pages/api/price-engine.js

export default async function handler(req, res) {
  try {
    const response = await fetch("https://price-engine-fastapi.onrender.com/price-engine");
    
    if (!response.ok) {
      throw new Error("Backend error: " + (await response.text()));
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "API failed", detail: err.message });
  }
}
