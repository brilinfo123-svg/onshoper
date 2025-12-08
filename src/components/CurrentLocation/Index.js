"use client";
import { useEffect, useState } from "react";

export default function CurrentLocation() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          const res = await fetch(`/api/geocode/reverse-geocode?lat=${lat}&lon=${lon}`);
          const data = await res.json();

          setLocation({ ...data.location, lat, lon });
        } catch (error) {
          console.error("Failed to fetch location:", error);
        }

        setLoading(false);
      }, (error) => {
        console.error("Geolocation error:", error);
        alert("Could not get your location");
        setLoading(false);
      });
    } else {
      alert("Geolocation is not supported by your browser");
      setLoading(false);
    }
  }, []);

  if (loading) return <p>Loading location...</p>;

  return (
    <div>
      <h2>Your Current Location:</h2>
      <p>Latitude: {location.lat}</p>
      <p>Longitude: {location.lon}</p>
      <p>City: {location.city}</p>
      <p>State: {location.state}</p>
      <p>Country: {location.country}</p>
      {location.main_area && <p>Main Area: {location.main_area}</p>}

    </div>
  );
}
