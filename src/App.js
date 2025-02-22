import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ReverseGeocodeMap from "./reverseGeocoder";
import ChatPage from "./chatPage";
import CitySearch from "./CitySearch";

function App() {
    return (
        <Router>  {/* ✅ Wrap everything inside Router */}
            <Routes>
                <Route path="/" element={<CitySearch />} />
                <Route path="/chat" element={<ChatPage />} />
            </Routes>
        </Router>
    );
}

export default App;