import React from "react";
import { useLocation } from "react-router-dom";
import ChatComponent from "./ChatComponent";

const ChatPage = () => {
    const location = useLocation();
    const { placeId, city, recommendations } = location.state || {};

    const places = recommendations?.places || [];
    const restaurants = recommendations?.restaurants || [];

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            {/* Left Side: Chat Room */}
            <div style={{ width: "50%", borderRight: "1px solid gray", padding: "20px" }}>
                <ChatComponent placeId={placeId} />
            </div>

            {/* Right Side: Recommendations */}
            <div style={{ width: "50%", padding: "20px" }}>
                <h2>Recommended Places in {city}</h2>
                <ul>
                    {places.length > 0 ? places.map((place, index) => <li key={index}>{place}</li>) : <p>No recommendations available.</p>}
                </ul>

                <h2>Top Restaurants in {city}</h2>
                <ul>
                    {restaurants.length > 0 ? restaurants.map((restaurant, index) => <li key={index}>{restaurant}</li>) : <p>No restaurant recommendations available.</p>}
                </ul>
            </div>
        </div>
    );
};

export default ChatPage;