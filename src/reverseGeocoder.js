import React, { useState } from "react";
import { LoadScript, GoogleMap, Marker } from "@react-google-maps/api";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const ReverseGeocodeMap = () => {
    const [clickedPosition, setClickedPosition] = useState(null);
    const [center, setCenter] = useState({ lat: 37.7749, lng: -122.4194 });
    const [placeId, setPlaceId] = useState("");
    const [city, setCity] = useState("");

    const navigate = useNavigate();

    /** Function 1: Reverse Geocode when user clicks on the map */
    const onMapClick = async (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        
        setClickedPosition({ lat, lng });
        setCenter({ lat, lng });

        // ✅ Get Place ID and City from Reverse Geocoding
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=en&key=${GOOGLE_MAPS_API_KEY}`;
        try {
            const response = await axios.get(geocodeUrl);
            if (response.data.status === "OK") {
                const components = response.data.results;
                const extractedPlaceId = components[0].place_id || "No Place ID found";
                setPlaceId(extractedPlaceId);

                // Extract city name
                let extractedCity = extractCity(components[0].address_components);
                setCity(extractedCity);

                // ✅ Call Chat API for chat room info
                fetchChatRoom(extractedPlaceId, extractedCity);
            }
        } catch (error) {
            console.error("Error fetching reverse geocode:", error);
        }
    };

    /** Function 2: Call `/chat/{placeId}` API to get chat room info */
    const fetchChatRoom = async (placeId, city) => {
        if (!placeId) return;

        try {
            const response = await axios.get(`http://localhost:8080/chat/${placeId}`);
            if (response.status === 200) {
                const chatRoomData = response.data;

                // ✅ Navigate to ChatPage.js and pass `placeId` & `city`
                navigate("/chat", { state: { placeId, city, chatRoomData } });
            } else {
                console.error("Chat room not found");
            }
        } catch (error) {
            console.error("Error fetching chat room:", error);
        }
    };

    /** Helper Function: Extract City */
    const extractCity = (components) => {
        for (const component of components) {
            if (component.types.includes("locality")) {
                return component.long_name;
            }
        }
        return "Unknown City";
    };

    return (
        <div>
            <h2>Google Maps Reverse Geocoder</h2>

            {/* Google Map */}
            <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                    center={center}
                    zoom={10}
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