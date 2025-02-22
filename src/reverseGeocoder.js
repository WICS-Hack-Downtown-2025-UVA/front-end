import React, { useState, useEffect, useRef } from "react";
import { LoadScript, GoogleMap, Marker } from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const PYTHON_API_URL = "http://localhost:5001/recommendations"; // Python API base URL

const DEFAULT_COORDS = { lat: 38.033554, lng: -78.507980 }; // ✅ Default coordinates

const ReverseGeocodeMap = () => {
    const [clickedPosition, setClickedPosition] = useState(DEFAULT_COORDS);
    const [center, setCenter] = useState(DEFAULT_COORDS);
    const [placeId, setPlaceId] = useState("");
    const [city, setCity] = useState("");

    const navigate = useNavigate();
    const mapRef = useRef(null);

    /** ✅ Function 1: Reverse Geocode when user clicks on the map */
    const onMapClick = async (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        
        setClickedPosition({ lat, lng });
        setCenter({ lat, lng });

        // ✅ Reverse Geocode to Get Place ID
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === "OK" && results.length > 0) {
                const extractedPlaceId = results[0].place_id;
                setPlaceId(extractedPlaceId);

                // ✅ Fetch City Name using PlacesService
                fetchCityFromPlaceId(extractedPlaceId);
            } else {
                console.error("Error fetching place ID:", status);
            }
        });
    };

    const fetchCityFromPlaceId = async (placeId) => {
        if (!placeId || !mapRef.current) return;
    
        const service = new window.google.maps.places.PlacesService(mapRef.current);
    
        const request = {
            placeId: placeId,
            fields: ["name", "formatted_address", "geometry", "address_components"], // ✅ Log all relevant fields
            language: "en",
        };
    
        service.getDetails(request, (place, status) => {
            console.log("🔹 Fetching details for Place ID:", placeId); // ✅ Log Place ID
            console.log("🔹 Full Place Details Response:", place); // ✅ Log everything from Google API
    
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                let extractedCity = "Unknown City";
    
                if (place.name) {
                    extractedCity = place.name; // ✅ Try using place.name first
                } else {
                    extractedCity = place.formattedAddress
                }
    
                console.log("✅ Final Extracted City:", extractedCity); // ✅ Log extracted city name
    
                setCity(extractedCity);
    
                // ✅ Fetch recommendations using city name
                fetchRecommendations(extractedCity, placeId);
            } else {
                console.error("❌ Error fetching place details:", status);
            }
        });
    };

    /** ✅ Function 3: Fetch Place Recommendations from Flask */
    const fetchRecommendations = async (city, placeId) => {
        if (!city) return;

        try {
            const response = await fetch(`${PYTHON_API_URL}/${city}`);
            const data = await response.json();

            if (response.ok) {
                // ✅ Navigate to ChatPage with Place ID & Recommendations
                navigate("/chat", { state: { placeId, city, recommendations: data.places } });
            } else {
                console.error("Error fetching recommendations:", data);
            }
        } catch (error) {
            console.error("Error fetching recommendations from Flask:", error);
        }
    };

    /** ✅ Helper Function: Extract City from Address */
    const extractCityFromAddress = (formattedAddress) => {
        if (!formattedAddress) return "Unknown City";
        const parts = formattedAddress.split(", ");
        return parts.length >= 2 ? parts[parts.length - 2] : formattedAddress;
    };

    return (
        <div>
            <h2>Google Maps Reverse Geocoder</h2>

            {/* Google Map */}
            <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}>
                <GoogleMap
                    onLoad={(map) => (mapRef.current = map)}
                    center={center} // ✅ Now starts at Charlottesville
                    zoom={12}
                    onClick={onMapClick}
                    mapContainerStyle={{ width: "100%", height: "400px" }}
                >
                    {clickedPosition && <Marker position={clickedPosition} />}
                </GoogleMap>
            </LoadScript>
        </div>
    );
};

export default ReverseGeocodeMap;