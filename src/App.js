import React from "react";
import ReverseGeocodeMap from "./reverseGeocoder";  // ✅ Import ReverseGeocodeMap

function App() {
    return (
        <div>
            <h1>AI Travel Assistant</h1>
            <ReverseGeocodeMap />  {/* ✅ Render the map component */}
        </div>
    );
}

export default App;