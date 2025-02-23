import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import ChatComponent from "./ChatComponent";
import ChatBotComponent from "./ChatBotComponent";

const ChatPage = () => {
    const location = useLocation();
    const { placeId, city, recommendations: initialRecommendations } = location.state || {};

    const [recommendations, setRecommendations] = useState(initialRecommendations || { places: [], restaurants: [] });

    const handleUpdateRecommendations = (newRecommendations) => {
        setRecommendations(newRecommendations);
    };

    // ✅ Function to generate Google Maps links (removes first 3 chars from place name)
    const generateGoogleMapsLink = (placeName, city) => {
        const trimmedName = placeName.slice(3).trim(); // Remove first 3 characters (e.g., "1. ")
        const query = encodeURIComponent(`${trimmedName} ${city}`);
        return `https://www.google.com/maps/search/?api=1&query=${query}`;
    };

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            {/* Left Side: Chat Room */}
            <div style={{ width: "33%", borderRight: "1px solid gray", padding: "20px" }}>
                <ChatComponent placeId={placeId} />
            </div>

            {/* Middle: Recommendations */}
            <div style={{ width: "34%", borderRight: "1px solid gray", padding: "20px" }}>
                <h2>Recommended Places in {city}</h2>
                <ul>
                    {recommendations.places.length > 0 ? (
                        recommendations.places.map((place, index) => {
                            const placeName = place.split(" - ")[0]; // Extract name before "-"
                            const placeWithLink = `${place} <a href="${generateGoogleMapsLink(placeName, city)}" target="_blank" rel="noopener noreferrer">📍</a>`;
                            return (
                                <li key={index} dangerouslySetInnerHTML={{ __html: placeWithLink }} />
                            );
                        })
                    ) : (
                        <p>No recommendations available.</p>
                    )}
                </ul>

                <h2>Top Restaurants in {city}</h2>
                <ul>
                    {recommendations.restaurants.length > 0 ? (
                        recommendations.restaurants.map((restaurant, index) => {
                            const restaurantName = restaurant.split(" - ")[0]; // Extract name before "-"
                            const restaurantWithLink = `${restaurant} <a href="${generateGoogleMapsLink(restaurantName, city)}" target="_blank" rel="noopener noreferrer">📍</a>`;
                            return (
                                <li key={index} dangerouslySetInnerHTML={{ __html: restaurantWithLink }} />
                            );
                        })
                    ) : (
                        <p>No restaurant recommendations available.</p>
                    )}
                </ul>
            </div>

            {/* Right Side: Chatbot */}
            <div style={{ width: "33%", padding: "20px" }}>
                <ChatBotComponent 
                    city={city} 
                    recommendations={recommendations}  // ✅ Pass current recommendations
                    onUpdateRecommendations={handleUpdateRecommendations} 
                />
            </div>
        </div>
    );
};

export default ChatPage;