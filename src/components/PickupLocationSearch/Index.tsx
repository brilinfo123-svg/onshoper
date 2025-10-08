import { useState, useEffect } from "react";
import styles from "./Index.module.scss";
import { tree } from "next/dist/build/templates/app-page";

const PickupLocationSearch = ({ 
  setLat, 
  setLng, 
  setAddress, 
  onLocationUpdate // Only this callback is needed
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLocating, setIsLocating] = useState(false);
  const API_KEY = "DCAhUBNQ5E55C0OJRgQd";

  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    const fetchPlaces = async () => {
      try {
        const response = await fetch(
          `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${API_KEY}&country=IN`
        );
        const data = await response.json();

        const filtered = data.features?.filter((item) =>
          item.place_type?.includes("place") ||
          item.place_type?.includes("locality") ||
          item.place_type?.includes("address") ||
          item.place_type?.includes("street") ||
          item.place_type?.includes("neighborhood") ||
          item.place_type?.includes("poi")
        );

        // Enhance results with complete address information
        const enhancedSuggestions = (filtered || []).map((place) => {
          const addressContext = place.context || [];
          
          // Extract different address components
          const locality = addressContext.find(ctx => 
            ctx.id.startsWith("locality.")
          )?.text || "";
          
          const neighborhood = addressContext.find(ctx => 
            ctx.id.startsWith("neighborhood.")
          )?.text || "";
          
          const placeName = addressContext.find(ctx => 
            ctx.id.startsWith("place.")
          )?.text || "";
          
          const district = addressContext.find(ctx => 
            ctx.id.startsWith("district.")
          )?.text || "";
          
          const region = addressContext.find(ctx => 
            ctx.id.startsWith("region.")
          )?.text || "";
          
          const postcode = addressContext.find(ctx => 
            ctx.id.startsWith("postcode.")
          )?.text || "";

          // Try to extract sector/phase from the text or place_name
          let sectorPhase = "";
          const text = place.text || "";
          const placeNameFull = place.place_name || "";
          
          // Look for sector/phase patterns in the text
          if (text.match(/\b(sector|phase|sec|ph)\s*[0-9]+\b/i)) {
            sectorPhase = text;
          } else if (placeNameFull.match(/\b(sector|phase|sec|ph)\s*[0-9]+\b/i)) {
            const match = placeNameFull.match(/\b(sector|phase|sec|ph)\s*[0-9]+\b/i);
            sectorPhase = match[0];
          } else if (neighborhood) {
            sectorPhase = neighborhood;
          }

          // Create a more readable address format
          let readableAddress = "";
          
          // If we have a sector/phase, use it as the primary identifier
          if (sectorPhase) {
            readableAddress = sectorPhase;
            
            // Add locality if different
            if (locality && locality !== sectorPhase) {
              readableAddress += `, ${locality}`;
            }
          } else if (locality) {
            readableAddress = locality;
          } else if (neighborhood) {
            readableAddress = neighborhood;
          } else {
            readableAddress = place.text || place.place_name;
          }
          
          // Add place name (city) if different
          if (placeName && placeName !== readableAddress && !readableAddress.includes(placeName)) {
            readableAddress += `, ${placeName}`;
          }
          
          // Add district if available and different
          if (district && district !== placeName && district !== readableAddress && !readableAddress.includes(district)) {
            readableAddress += `, ${district}`;
          }
          
          // Add region (state) if available
          if (region && !readableAddress.includes(region)) {
            readableAddress += `, ${region}`;
          }

          return {
            ...place,
            readableAddress,
            locality,
            neighborhood,
            placeName,
            district,
            region,
            postcode,
            sectorPhase
          };
        });
        
        setSuggestions(enhancedSuggestions);
      } catch (error) {
        console.error("Places fetch karne mein error:", error);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchPlaces();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (place) => {
    setQuery(place.readableAddress);
    setAddress(place.readableAddress);
    setSuggestions([]);

    const [lng, lat] = place.center;
    setLat(lat);
    setLng(lng);
    
    // Call the update function with the location data
    if (onLocationUpdate) {
      onLocationUpdate(place.readableAddress, lat, lng);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Your browser doesn't support geolocation");
      return;
    }

    setIsLocating(true);
    setSuggestions([]);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const response = await fetch(
            `https://api.maptiler.com/geocoding/${longitude},${latitude}.json?key=${API_KEY}`
          );
          const data = await response.json();
          
          if (data.features && data.features.length > 0) {
            // Find the most relevant feature (usually the first one)
            const primaryFeature = data.features[0];
            const addressContext = primaryFeature.context || [];
            
            // Extract address components
            const locality = addressContext.find(ctx => 
              ctx.id.startsWith("locality.")
            )?.text || "";
            
            const neighborhood = addressContext.find(ctx => 
              ctx.id.startsWith("neighborhood.")
            )?.text || "";
            
            const placeName = addressContext.find(ctx => 
              ctx.id.startsWith("place.")
            )?.text || "";
            
            const district = addressContext.find(ctx => 
              ctx.id.startsWith("district.")
            )?.text || "";
            
            const region = addressContext.find(ctx => 
              ctx.id.startsWith("region.")
            )?.text || "";
            
            // Try to extract sector/phase
            let sectorPhase = "";
            const text = primaryFeature.text || "";
            const placeNameFull = primaryFeature.place_name || "";
            
            if (text.match(/\b(sector|phase|sec|ph)\s*[0-9]+\b/i)) {
              sectorPhase = text;
            } else if (placeNameFull.match(/\b(sector|phase|sec|ph)\s*[0-9]+\b/i)) {
              const match = placeNameFull.match(/\b(sector|phase|sec|ph)\s*[0-9]+\b/i);
              sectorPhase = match[0];
            } else if (neighborhood) {
              sectorPhase = neighborhood;
            }

            // Create readable address
            let readableAddress = "";
            
            // If we have a sector/phase, use it as the primary identifier
            if (sectorPhase) {
              readableAddress = sectorPhase;
              
              // Add locality if different
              if (locality && locality !== sectorPhase) {
                readableAddress += `, ${locality}`;
              }
            } else if (locality) {
              readableAddress = locality;
            } else if (neighborhood) {
              readableAddress = neighborhood;
            } else {
              readableAddress = primaryFeature.text || primaryFeature.place_name;
            }
            
            // Add place name (city) if different
            if (placeName && placeName !== readableAddress && !readableAddress.includes(placeName)) {
              readableAddress += `, ${placeName}`;
            }
            
            // Add district if available and different
            if (district && district !== placeName && district !== readableAddress && !readableAddress.includes(district)) {
              readableAddress += `, ${district}`;
            }
            
            // Add region (state) if available
            if (region && !readableAddress.includes(region)) {
              readableAddress += `, ${region}`;
            }
            
            setQuery(readableAddress);
            setAddress(readableAddress);
            setLat(latitude);
            setLng(longitude);
            
            // Call the update function
            if (onLocationUpdate) {
              onLocationUpdate(readableAddress, latitude, longitude);
            }
          }
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          setQuery("Current Location");
          setAddress("Current Location");
          setLat(latitude);
          setLng(longitude);
          
          // Call the update function even with basic info
          if (onLocationUpdate) {
            onLocationUpdate("Current Location", latitude, longitude);
          }
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Location fetch error:", error);
        alert("Unable to retrieve your location. Please check browser permissions.");
        setIsLocating(false);
        setSuggestions([]);
      }
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputContainer}>
      <button type="button" onClick={getCurrentLocation} className={styles.locationButton} disabled={isLocating} title="Use current location" >
        <svg width="20" height="20" 
              viewBox="0 0 24 24" fill="none" 
              xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8C9.79 8 8 9.79 8 12C8 14.21 9.79 16 12 16C14.21 16 16 14.21 16 12C16 9.79 14.21 8 12 8ZM20.94 11C20.48 6.83 17.17 3.52 13 3.06V1H11V3.06C6.83 3.52 3.52 6.83 3.06 11H1V13H3.06C3.52 17.17 6.83 20.48 11 20.94V23H13V20.94C17.17 20.48 20.48 17.17 20.94 13H23V11H20.94ZM12 19C8.13 19 5 15.87 5 12C5 8.13 8.13 5 12 5C15.87 5 19 8.13 19 12C19 15.87 15.87 19 12 19Z" 
                fill="currentColor"
              />
            </svg>
            
            Use Current Location {isLocating ? (
            <span className={styles.spinner}></span>
          ) : (

             <></>
          )}
        </button>
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search area, sector, phase, city or state"
          className={styles.input} disabled onBlur={() => setTimeout(() => setSuggestions([]), 200)}
        />
        
      </div>
      {/* {suggestions.length > 0 && (
        <ul className={styles.suggestions}>
          {suggestions.map((place) => (
            <li key={place.id} onClick={() => handleSelect(place)}>
              {place.readableAddress}
            </li>
          ))}
        </ul>
      )} */}
    </div>
  );
};

export default PickupLocationSearch;