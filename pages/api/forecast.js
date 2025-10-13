export default async function handler(req, res) {
  try {
    const apiRes = await fetch("https://forecast-fastapi.onrender.com/forecast");
    const data = await apiRes.json();

    res.status(apiRes.status).json(data);
  } catch (err) {
    res.status(500).json({ error: "API call failed.", details: err.message });
  }
}
