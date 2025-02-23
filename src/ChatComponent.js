import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";

const WEBSOCKET_URL = "ws://localhost:8080/ws";

const ChatComponent = () => {
    const location = useLocation();
    const { placeId } = location.state || {};
    
    const [messages, setMessages] = useState([]);
    const [userCount, setUserCount] = useState(0);
    const [message, setMessage] = useState("");
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
                console.log(`✅ Connected to chat room: ${placeId}`);
            };

            ws.current.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (data.type === "message") {
                    // ✅ Prevent duplicates by checking existing messages
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
                console.log(`🔴 Disconnected from ${placeId}`);
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
            content: message,
            timestamp: new Date().toISOString(),
        };

        ws.current.send(JSON.stringify({ type: "message", chatMessage }));
        setMessage("");
    };

    return (
        <div>
            <h2>Chat Room</h2>
            <p>Room ID: {placeId}</p>
            <p>Users Online: {userCount}</p>

            <div style={{ height: "400px", overflowY: "auto", border: "1px solid black", padding: "10px", display: "flex", flexDirection: "column" }}>
                {messages.length > 0 ? (
                    messages.map((msg, index) => (
                        <div key={index} style={{ marginBottom: "10px" }}>
                            <strong>{msg.sender || "User"}:</strong> {msg.content}
                            <p style={{ fontSize: "12px", color: "gray" }}>{msg.timestamp}</p>
                        </div>
                    ))
                ) : (
                    <p>No messages yet.</p>
                )}
                <div ref={messagesEndRef} />
            </div>

            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
};

export default ChatComponent;