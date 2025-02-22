import React from "react";
import { useLocation } from "react-router-dom";

const ChatPage = () => {
    const location = useLocation();
    let { placeId, city, recommendations } = location.state || {};

    console.log("🔹 Raw Recommendations Object:", recommendations);
    console.log("🔹 Type of Recommendations:", typeof recommendations);

    // ✅ Ensure recommendations is an object
    if (!recommendations || typeof recommendations !== "object") {
        console.error("❌ `recommendations` is missing or invalid!");
        recommendations = { places: [], restaurants: [] };
    }

    // ✅ Extract places and restaurants (default to empty array if undefined)
    const places = Array.isArray(recommendations.places) ? recommendations.places : [];
    const restaurants = Array.isArray(recommendations.restaurants) ? recommendations.restaurants : [];

    console.log("🔹 Extracted Places:", places);
    console.log("🔹 Extracted Restaurants:", restaurants);

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            {/* Left Side: Chat Room */}
            <div style={{ width: "50%", borderRight: "1px solid gray", padding: "20px" }}>
                <h2>Chat Room</h2>
                <p>Chat Room ID: {placeId}</p>
                <p>Java WebSocket Chat Here</p>
            </div>

            {/* Right Side: Recommendations */}
            <div style={{ width: "50%", padding: "20px" }}>
                <h2>Recommended Places in {city}</h2>
                <ul>
                    {places.length > 0 ? (
                        places.map((place, index) => <li key={index}>{place}</li>)
                    ) : (
                        <p>No place recommendations available.</p>
                    )}
                </ul>

                <h2>Top Restaurants in {city}</h2>
                <ul>
                    {restaurants.length > 0 ? (
                        restaurants.map((restaurant, index) => <li key={index}>{restaurant}</li>)
                    ) : (
                        <p>No restaurant recommendations available.</p>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default ChatPage;