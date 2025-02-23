import React, { useState } from "react";
import axios from "axios";

const CHATBOT_API_URL = "http://localhost:5001/recommendations/chatbot";

const ChatBotComponent = ({ city, recommendations, onUpdateRecommendations }) => {  
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const sendMessage = async () => {
        if (!input.trim()) return;
    
        const userMessage = { sender: "User", text: input };
        setMessages((prev) => [...prev, userMessage]);
    
        try {
            const response = await axios.post(CHATBOT_API_URL, {
                city,
                message: input,
                current_recommendations: recommendations,  // ✅ Pass current recommendations
            });
    
            if (response.data.updated) {
                // ✅ Update only the changed recommendations
                onUpdateRecommendations(response.data.recommendations);
    
                // ✅ Show chatbot response confirming update
                const botMessage = { sender: "Chatbot", text: "✅ Updated the recommendations!" };
                setMessages((prev) => [...prev, botMessage]);
            } else {
                // ✅ If no update, show normal chatbot response
                const botMessage = { sender: "Chatbot", text: response.data.response };
                setMessages((prev) => [...prev, botMessage]);
            }
        } catch (error) {
            console.error("Error fetching chatbot response:", error);
            const errorMessage = { sender: "Chatbot", text: "❌ Error processing request." };
            setMessages((prev) => [...prev, errorMessage]);
        }
    
        setInput(""); // Clear input after sending
    };

    return (
        <div>
            <h2>Chatbot</h2>
            <div style={{ height: "400px", overflowY: "auto", border: "1px solid black", padding: "10px" }}>
                {messages.map((msg, index) => (
                    <div key={index}>
                        <strong>{msg.sender}:</strong> {msg.text}
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
};

export default ChatBotComponent;