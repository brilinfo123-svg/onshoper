// pages/api/reverse-geocode.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Latitude and longitude required" });
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
    );
    const data = await response.json();

    const location = {
      city: data.address.city || data.address.town || data.address.village,
      state: data.address.state,
      country: data.address.country,
      main_area:
        data.address.state_district || data.address.county || null,
      road: data.address.road || null,
    };

    res.status(200).json({ location });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch location" });
  }
}
