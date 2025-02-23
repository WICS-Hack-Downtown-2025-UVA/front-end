import "./Styles/ChatPage.css"
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
        <div className="chat-page-container">
            <div className="chat-section">
                <ChatComponent placeId={placeId} />
            </div>
    
            <div className="recommendations-section">
                <h2 className="section-title">Recommended Places in {city}</h2>
                <ul className="recommendations-list">
                    {recommendations.places.length > 0 ? (
                        recommendations.places.map((place, index) => {
                            const placeName = place.split(" - ")[0];
                            const placeWithLink = `${place} <a href="${generateGoogleMapsLink(placeName, city)}" target="_blank" rel="noopener noreferrer">📍</a>`;
                            return (
                                <li key={index} dangerouslySetInnerHTML={{ __html: placeWithLink }} className="recommendation-item"/>
                            );
                        })
                    ) : (
                        <p className="no-recommendations">No recommendations available.</p>
                    )}
                </ul>
    
                <h2 className="section-title">Top Restaurants in {city}</h2>
                <ul className="recommendations-list">
                    {recommendations.restaurants.length > 0 ? (
                        recommendations.restaurants.map((restaurant, index) => {
                            const restaurantName = restaurant.split(" - ")[0];
                            const restaurantWithLink = `${restaurant} <a href="${generateGoogleMapsLink(restaurantName, city)}" target="_blank" rel="noopener noreferrer">📍</a>`;
                            return (
                                <li key={index} dangerouslySetInnerHTML={{ __html: restaurantWithLink }} className="recommendation-item"/>
                            );
                        })
                    ) : (
                        <p className="no-recommendations">No restaurant recommendations available.</p>
                    )}
                </ul>
            </div>
    
            <div className="chatbot-section">
                <ChatBotComponent
                    city={city}
                    recommendations={recommendations}
                    onUpdateRecommendations={handleUpdateRecommendations}
                />
            </div>
        </div>
    );
};

export default ChatPage;