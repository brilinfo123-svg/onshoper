import { useEffect, useState } from "react";
import { haversineDistance } from '@/utils/location';

const ShopList = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);

  // Function to fetch the user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLat(position.coords.latitude);
          setUserLng(position.coords.longitude);
        },
        (error) => {
          console.error("Error getting user's location:", error);
          setError("Unable to retrieve your location.");
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  };

  useEffect(() => {
    // Fetch the user's location first
    getUserLocation();
  }, []);

  useEffect(() => {
    const fetchShops = async () => {
      if (userLat && userLng) {  // Make sure the user's location is available
        try {
          const response = await fetch("/api/localShop");
          if (!response.ok) {
            throw new Error("Failed to fetch local shops");
          }
          const data = await response.json();

          console.log("Fetched Shops Data:", data.data);

          // Extract latitudes and longitudes for all shops
          const latitudes = data?.data?.map(shop => shop.latitude ?? 0);
          const longitudes = data?.data?.map(shop => shop.longitude ?? 0);

          console.log("Latitudes:", latitudes);
          console.log("Longitudes:", longitudes);

          // Loop through each shop and calculate the distance based on latitude and longitude
          const nearbyShops = data.data.map((shop, index) => {
            const shopLat = latitudes[index];  // Latitude of the current shop
            const shopLng = longitudes[index]; // Longitude of the current shop

            console.log(`Shop: ${shop.businessName}, Shop Latitude: ${shopLat}, Shop Longitude: ${shopLng}`);
            
            // Calculate the distance between the user's location and the shop's location in kilometers
            const distanceKm = haversineDistance(userLat, userLng, shopLat, shopLng);

            // Convert kilometers to meters
            let distanceM = distanceKm * 1000;

            // Round the distance to the nearest 100 meters
            distanceM = Math.round(distanceM / 100) * 100;

            console.log(`Distance for ${shop.businessName}: ${distanceKm.toFixed(2)} KM / ${distanceM.toFixed(0)} meters`);

            // If the shop is within 5KM (5000 meters), return the shop data with calculated distance
            return { ...shop, distanceKm, distanceM };
          }).filter(shop => shop && shop.distanceKm <= 5); // Only include shops within 5KM

          console.log("Nearby Shops (Within 5KM):", nearbyShops);
          setShops(nearbyShops);
        } catch (err) {
          setError(err.message);
          console.error("Error fetching shops:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchShops();
  }, [userLat, userLng]); // Trigger fetching shops when user's location is available

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Nearby Shops (Within 5KM)</h2>
      <ul>
        {shops.length > 0 ? (
          shops.map(shop => (
            <li key={shop._id}>
              <div>
                <strong>{shop.businessName}</strong>
                <br />
                Location: {shop.latitude}, {shop.longitude}
                <br />
                Distance: {shop.distanceKm.toFixed(2)} KM / {shop.distanceM.toFixed(0)} meters
              </div>
            </li>
          ))
        ) : (
          <p>No shops found within 5KM.</p>
        )}
      </ul>
    </div>
  );
};

export default ShopList;
