import "./Styles/ChatComponents.css";
import React, { useState } from "react";
import axios from "axios";

const CHATBOT_API_URL = "http://localhost:5001/recommendations/chatbot";

const ChatBotComponent = ({ city, recommendations, onUpdateRecommendations, theme }) => {  // ✅ Receive theme prop  
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
        <div className={`chatbot-container ${theme}`}> {/* ✅ Apply theme */}
            <h2 className="chatbot-title">Chatbot</h2>
            <div className="chatbot-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`chatbot-message ${msg.sender.toLowerCase()}`}>
                        <strong>{msg.sender}:</strong> {msg.text}
                    </div>
                ))}
            </div>
            <div className="chatbot-input-area">
                <input
                    className="chatbot-input"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything..."
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button className="chatbot-send-btn" onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
};

export default ChatBotComponent;