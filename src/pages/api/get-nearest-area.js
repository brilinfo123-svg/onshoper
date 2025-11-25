import indianAreas from "@/indiaArea/indian-areas.json";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { lat, lng } = req.body;
  if (!lat || !lng) {
    return res.status(400).json({ error: "Missing lat/lng" });
  }

  let nearestArea = null;
  let nearestCity = null;
  let nearestState = null;
  let nearestLat = null;
  let nearestLng = null;
  let minDistance = Infinity;

  // Loop through all states → cities → areas
  for (const state of Object.keys(indianAreas)) {
    const cities = indianAreas[state];
    for (const city of Object.keys(cities)) {
      const areas = cities[city];
      for (const area of Object.keys(areas)) {
        const { lat: aLat, lng: aLng } = areas[area];
        const distance = Math.sqrt(
          Math.pow(lat - aLat, 2) + Math.pow(lng - aLng, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestArea = area;
          nearestCity = city;
          nearestState = state;
          nearestLat = aLat;
          nearestLng = aLng;
        }
      }
    }
  }

  if (!nearestArea) {
    return res.status(404).json({ error: "No nearby area found" });
  }

  return res.status(200).json({
    area: nearestArea,
    city: nearestCity,
    state: nearestState,
    lat: nearestLat,
    lng: nearestLng
  });
}
