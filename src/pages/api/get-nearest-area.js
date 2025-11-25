import indianAreas from "@/indiaArea/indian-areas.json";

// 👇 Add this at the top of your file
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default async function handler(req, res) {
  const { lat, lng } = req.body;

  let nearestArea = null;
  let nearestCity = null;
  let nearestState = null;
  let nearestLat = null;
  let nearestLng = null;
  let minDistance = Infinity;

  for (const state of Object.keys(indianAreas)) {
    const cities = indianAreas[state];
    for (const city of Object.keys(cities)) {
      const areas = cities[city];
      for (const area of Object.keys(areas)) {
        const { lat: aLat, lng: aLng } = areas[area];
        const distance = getDistance(lat, lng, aLat, aLng); // 👈 Use here
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

  return res.status(200).json({
    area: nearestArea,
    city: nearestCity,
    state: nearestState,
    lat: nearestLat,
    lng: nearestLng
  });
}
