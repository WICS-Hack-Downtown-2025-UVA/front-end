import React from "react";
import { useLocation } from "react-router-dom";

const ChatPage = () => {
    const location = useLocation();
    const { placeId, city, recommendations } = location.state || {};

    console.log("Received recommendations:", recommendations);
    console.log("Type of recommendations:", typeof recommendations);

    // ✅ Extract only the 5 places from the recommendation string
    const extractPlaces = (recommendations) => {
        if (typeof recommendations !== "string") return [];

        // Split by newline and remove markdown formatting
        return recommendations
            .split("\n") // Split by new lines
            .filter(line => line.match(/^\d+\./)) // Only keep lines that start with "1.", "2.", etc.
            .map(line => line.replace(/^\d+\.\s*/, "").trim()); // Remove numbering (1., 2., etc.)
    };

    const placesArray = extractPlaces(recommendations);

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            {/* Left Side: Chat Room Placeholder */}
            <div style={{ width: "50%", borderRight: "1px solid gray", padding: "20px" }}>
                <h2>Chat Room</h2>
                <p>Chat Room ID: {placeId}</p>
                <p>Java WebSocket Chat Here</p>
            </div>

            {/* Right Side: Place Recommendations */}
            <div style={{ width: "50%", padding: "20px" }}>
                <h2>Recommended Places in {city}</h2>
                <ul>
                    {placesArray.length > 0 ? (
                        placesArray.map((place, index) => (
                            <li key={index}>{place}</li>
                        ))
                    ) : (
                        <p>No recommendations available.</p>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default ChatPage;