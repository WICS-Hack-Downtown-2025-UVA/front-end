import "./Styles/ChatComponents.css";
import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";

const WEBSOCKET_URL = "ws://localhost:8080/ws";

const ChatComponent = ({ theme }) => {  // ✅ Receive theme prop
    const location = useLocation();
    const { placeId, city } = location.state || {};
    
    const [messages, setMessages] = useState([]);
    const [userCount, setUserCount] = useState(0);
    const [message, setMessage] = useState("");
    const [username, setUsername] = useState("Anonymous"); // ✅ Default username
    const messagesEndRef = useRef(null);
    const ws = useRef(null);

    useEffect(() => {
        if (!placeId) return;

        if (ws.current) {
            console.warn("WebSocket already exists. Not creating a new one.");
            return;
        }

        setTimeout(() => {
            ws.current = new WebSocket(`${WEBSOCKET_URL}?placeId=${placeId}`);

            ws.current.onopen = () => {
                console.log(`✅ Connected to chat room: ${city}`);
            };

            ws.current.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (data.type === "message") {
                    setMessages((prev) => {
                        const exists = prev.some(msg => msg.timestamp === data.chatMessage.timestamp);
                        return exists ? prev : [...prev, data.chatMessage];
                    });
                } else if (data.type === "history") {
                    setMessages(data.messages.reverse());
                } else if (data.type === "user_count") {
                    setUserCount(data.count);
                }
            };

            ws.current.onerror = (error) => {
                console.error("❌ WebSocket Error:", error);
            };

            ws.current.onclose = () => {
                console.log(`🔴 Disconnected from ${city}`);
            };
        }, 500);

        return () => {
            if (ws.current) {
                ws.current.close();
                ws.current = null;
            }
        };
    }, [placeId]);

    /** ✅ Scroll to latest message */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (!message.trim() || !ws.current) return;

        const chatMessage = {
            sender: username || "Anonymous", // ✅ Use set username or default
            content: message,
            timestamp: new Date().toISOString(),
        };

        ws.current.send(JSON.stringify({ type: "message", chatMessage }));
        setMessage("");
    };

    return (
        <div className={`chatroom-container ${theme}`}>  {/* ✅ Apply theme */}
            <h2 className="chatroom-title">Chat Room - {city || "Unknown City"}</h2>
            <p className="chatroom-users">Users Online: {userCount}</p>

            <div className="chatroom-username">
                <label>Username: </label>
                <input
                    className="chatroom-username-input"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your name"
                />
            </div>

            <div className="chatroom-messages">
                {messages.length > 0 ? (
                    messages.map((msg, index) => {
                        const isCurrentUser = msg.sender?.toLowerCase() === username.toLowerCase(); // ✅ Case-insensitive check
                        return (
                            <div key={index} className={`chatroom-message ${isCurrentUser ? "current-user" : "other-user"}`}>
                                <strong>{msg.sender || "Anonymous"}:</strong> {msg.content}
                                <span className="chatroom-timestamp">{new Date(msg.timestamp).toLocaleString()}</span>
                            </div>
                        );
                    })
                ) : (
                    <p className="no-chatroom-messages">No messages yet.</p>
                )}
                <div ref={messagesEndRef} /> {/* ✅ Keeps auto-scroll behavior */}
            </div>

            <div className="chatroom-input-area">
                <input
                    className="chatroom-input"
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button className="chatroom-send-btn" onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
};

export default ChatComponent;