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
                        recommendations.places.map((place, index) => (
                            <li key={index}>
                                <span dangerouslySetInnerHTML={{ __html: place }} />
                            </li>
                        ))
                    ) : (
                        <p>No recommendations available.</p>
                    )}
                </ul>

                <h2>Top Restaurants in {city}</h2>
                <ul>
                    {recommendations.restaurants.length > 0 ? (
                        recommendations.restaurants.map((restaurant, index) => (
                            <li key={index}>
                                <span dangerouslySetInnerHTML={{ __html: restaurant }} />
                            </li>
                        ))
                    ) : (
                        <p>No restaurant recommendations available.</p>
                    )}
                </ul>
            </div>

            {/* Right Side: Chatbot */}
            <div style={{ width: "33%", padding: "20px" }}>
                <ChatBotComponent city={city} onUpdateRecommendations={handleUpdateRecommendations} />
            </div>
        </div>
    );
};

export default ChatPage;