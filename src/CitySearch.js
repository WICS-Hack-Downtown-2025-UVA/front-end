import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LoadScript, GoogleMap, Marker } from "@react-google-maps/api";

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const PYTHON_API_URL = "http://localhost:5001/recommendations"; // Flask API

const CitySearch = () => {
    const [query, setQuery] = useState(""); // Stores user input
    const [placeId, setPlaceId] = useState(""); // Stores selected Place ID
    const [city, setCity] = useState(""); // Stores selected City Name
    const [apiLoaded, setApiLoaded] = useState(false); // Track API load status
    const [clickedLocation, setClickedLocation] = useState(null); // Stores clicked coordinates
    const [citySuggestions, setCitySuggestions] = useState([]); // Stores nearby cities
    const [mapCenter, setMapCenter] = useState({ lat: 38.033554, lng: -78.507980 }); // Default center
    const inputRef = useRef(null); // Reference for input field
    const autocompleteRef = useRef(null); // Reference for Autocomplete
    const navigate = useNavigate();

    /** ✅ Ensure Google Maps API is Loaded Before Using `Autocomplete` */
    useEffect(() => {
        if (apiLoaded && window.google && window.google.maps) {
            console.log("✅ Google Maps API Loaded");

            autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
                types: ["(cities)"], // ✅ Only return cities
                fields: ["place_id", "name", "geometry"], // ✅ Added "geometry" to prevent errors
            });

            console.log("✅ Google Places Autocomplete Initialized");

            autocompleteRef.current.addListener("place_changed", () => {
                const place = autocompleteRef.current.getPlace();
                console.log("🔹 Autocomplete Selected Place:", place);

                if (!place.place_id || !place.name) {
                    console.error("❌ No valid place_id or city name returned.");
                    return;
                }

                setPlaceId(place.place_id);
                setCity(place.name);
                setQuery(place.name); // Update input field

                // ✅ Check if geometry exists before using it
                if (place.geometry && place.geometry.location) {
                    setMapCenter({
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                    });
                    setClickedLocation({
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                    });
                } else {
                    console.warn("⚠️ No geometry found for this place.");
                }

                console.log("✅ Selected City:", place.name);
                console.log("✅ Place ID:", place.place_id);

                // ✅ Fetch recommendations from Flask API
                fetchRecommendations(place.name, place.place_id);
            });
        }
    }, [apiLoaded]); // Runs only after API is loaded

    /** ✅ Fetch Recommendations from Flask API */
    const fetchRecommendations = async (city, placeId) => {
        if (!city) return;
    
        try {
            const response = await fetch(`${PYTHON_API_URL}/${city}`);
            const data = await response.json();
    
            if (response.ok) {
                console.log("✅ Full Recommendations Data:", data);
    
                // ✅ Ensure both places & restaurants are passed to ChatPage
                navigate("/chat", { state: { placeId, city, recommendations: data } });
            } else {
                console.error("❌ Error fetching recommendations:", data);
            }
        } catch (error) {
            console.error("❌ Error fetching recommendations from Flask:", error);
        }
    };

    /** ✅ Detect Click on Map & Find Nearby Cities */
    const onMapClick = (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        setClickedLocation({ lat, lng });
        setMapCenter({ lat, lng }); // ✅ Center map on clicked location

        console.log("✅ Clicked Location:", lat, lng);
        fetchNearbyCities(lat, lng);
    };

    /** ✅ Fetch Nearby Cities using Google Places API */
    const fetchNearbyCities = (lat, lng) => {
        if (!window.google || !window.google.maps) {
            console.error("❌ Google Maps API not loaded.");
            return;
        }

        const placesService = new window.google.maps.places.PlacesService(document.createElement("div"));
        const request = {
            location: new window.google.maps.LatLng(lat, lng),
            radius: 50000, // Search within 50km
            type: "locality", // Ensure it returns cities
        };

        placesService.nearbySearch(request, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                console.log("🔹 Nearby Cities:", results);
                setCitySuggestions(results);
            } else {
                console.error("❌ No cities found near this location.");
            }
        });
    };

    /** ✅ Handle City Selection from Map Suggestions */
    const handleCitySelect = (selectedCity) => {
        console.log("✅ Selected City from Map:", selectedCity);
        setQuery(selectedCity.name);
        setPlaceId(selectedCity.place_id);
        setCity(selectedCity.name);
        setCitySuggestions([]); // Hide suggestions

        // ✅ Fetch recommendations from Flask API
        fetchRecommendations(selectedCity.name, selectedCity.place_id);
    };

    return (
        <LoadScript
            googleMapsApiKey={GOOGLE_MAPS_API_KEY}
            libraries={["places"]}
            language="en" // ✅ Forces API to return English results
            onLoad={() => {
                console.log("✅ Google Maps API Loaded via `onLoad`");
                setApiLoaded(true);
            }}
        >
            <div>
                <h2>Search for a City</h2>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Type a city or click on map..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{ width: "300px", padding: "8px" }}
                />

                {/* Display Nearby City Suggestions */}
                {citySuggestions.length > 0 && (
                    <ul style={{ border: "1px solid gray", padding: "10px", listStyle: "none" }}>
                        {citySuggestions.map((suggestion) => (
                            <li
                                key={suggestion.place_id}
                                onClick={() => handleCitySelect(suggestion)}
                                style={{ cursor: "pointer", padding: "5px" }}
                            >
                                {suggestion.name}
                            </li>
                        ))}
                    </ul>
                )}

                {/* Google Map */}
                <GoogleMap
                    center={mapCenter} // ✅ Center updates dynamically
                    zoom={10}
                    onClick={onMapClick}
                    mapContainerStyle={{ width: "100%", height: "600px", marginTop: "20px" }} // ✅ Increased height to 600px
                >
                    {clickedLocation && <Marker position={clickedLocation} />} {/* ✅ Marker placed at clicked location */}
                </GoogleMap>
            </div>
        </LoadScript>
    );
};

export default CitySearch;