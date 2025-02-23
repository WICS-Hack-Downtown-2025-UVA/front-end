import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LoadScript, GoogleMap, Marker } from "@react-google-maps/api";

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const PYTHON_API_URL = "http://localhost:5001/recommendations"; // Flask API

const mapStyles = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { featureType: "administrative", elementType: "geometry", stylers: [{ visibility: "off" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi", stylers: [{ visibility: "off" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
    { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
    { featureType: "transit", stylers: [{ visibility: "off" }] },
    { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
    { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
    { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] }
];

const CitySearch = () => {
    const [query, setQuery] = useState("");
    const [placeId, setPlaceId] = useState("");
    const [city, setCity] = useState("");
    const [apiLoaded, setApiLoaded] = useState(false);
    const [clickedLocation, setClickedLocation] = useState(null);
    const [citySuggestions, setCitySuggestions] = useState([]);
    const [customMarkerIcon, setCustomMarkerIcon] = useState(null);
    const [mapCenter, setMapCenter] = useState({ lat: 38.033554, lng: -78.507980 });
    const inputRef = useRef(null);
    const autocompleteRef = useRef(null);
    const suggestionRef = useRef(null);
    const navigate = useNavigate();
    const [minZoom, setMinZoom] = useState(5);

    useEffect(() => {
        if (apiLoaded && window.google && window.google.maps) {
            console.log("Google API 로딩 완료");
    
            setCustomMarkerIcon({
                url: "/google-maps (1).png",
                scaledSize: new window.google.maps.Size(40, 40),
                origin: new window.google.maps.Point(0, 0),
                anchor: new window.google.maps.Point(20, 40),
            });
    
            autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
                types: ["(cities)"],
                fields: ["place_id", "name", "geometry"],
            });
    
            autocompleteRef.current.addListener("place_changed", () => {
                const place = autocompleteRef.current.getPlace();
                console.log("선택한 장소:", place);
    
                if (!place.place_id || !place.name) return;
    
                setPlaceId(place.place_id);
                setCity(place.name);
                setQuery(place.name);
    
                if (place.geometry && place.geometry.location) {
                    setMapCenter({
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                    });
                    setClickedLocation({
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                    });
                }
    
                console.log("🔍 fetchRecommendations 실행:", place.name, place.place_id);
                fetchRecommendations(place.name, place.place_id);
            });
        }
    }, [apiLoaded]);

    /** ✅ 바깥 클릭 감지하여 드롭다운 닫기 */
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                suggestionRef.current &&
                !suggestionRef.current.contains(event.target) &&
                inputRef.current &&
                !inputRef.current.contains(event.target)
            ) {
                setCitySuggestions([]);
            }
        }

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    /** ✅ 추천 데이터 가져오기 */
    const fetchRecommendations = async (city, placeId) => {
        if (!city) {
            console.error("❌ fetchRecommendations 실행 실패: city 값이 없음");
            return;
        }
        try {
            console.log(`📡 Fetching recommendations from: ${PYTHON_API_URL}/${city}`);
    
            const response = await fetch(`${PYTHON_API_URL}/${city}`);
            const data = await response.json();
    
            if (response.ok) {
                console.log("✅ 추천 데이터 가져오기 성공:", data);
                navigate("/chat", { state: { placeId, city, recommendations: data } });
            } else {
                console.error("⚠️ 추천 데이터 가져오기 실패:", response.status, data);
            }
        } catch (error) {
            console.error("❌ Error fetching recommendations:", error);
        }
    };

    /** ✅ 맵 클릭 이벤트 */
    const onMapClick = (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        setClickedLocation({ lat, lng });
        fetchNearbyCities(lat, lng);
    };

    /** ✅ 주변 도시 검색 */
    const fetchNearbyCities = (lat, lng) => {
        if (!window.google || !window.google.maps) return;
        const placesService = new window.google.maps.places.PlacesService(document.createElement("div"));
        const request = { location: new window.google.maps.LatLng(lat, lng), radius: 50000, type: "locality" };
        placesService.nearbySearch(request, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                setCitySuggestions(results);
            }
        });
    };

    return (
        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]} language="en"
            onLoad={() => setApiLoaded(true)}>
            <div style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                // paddingTop: "px",
                backgroundColor: "#282e3d",
            }}>
                <div style={{
                    width: "100%",
                    backgroundColor: "#282e3d", // ✅ 배경색 추가
                    border: "3px solid #D9A577", // ✅ 네 방향 테두리 추가 (상하좌우)
                    padding: "10px", // ✅ 내부 여백 추가
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center"
                }}>
                    <h2 style={{
                        fontSize: "2.5rem",
                        fontWeight: "bold",
                        color: "#D9A577",
                        textAlign: "center",
                        fontFamily: "'Poppins', 'Arial', sans-serif",
                        padding: "10px",
                        borderRadius: "10px"
                    }}>
                        ✈️ <span style={{ color: "#D9A577" }}>CityLink</span>: <br />
                        <span style={{ color: "#D9A577" }}>Connecting You to New Adventures</span> 🌍
                    </h2>

                    {/* 검색 바 */}
                    <div style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        position: "relative",
                        // marginTop: "1px", 
                        marginBottom: "25px" 
                    }}>
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Type a city or click on the map..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            style={{
                                width: "80%",
                                maxWidth: "500px",
                                padding: "12px 16px",
                                fontSize: "1.2rem",
                                border: "2px solid #d4a373",
                                borderRadius: "10px",
                                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                                outline: "none",
                                textAlign: "center"
                            }}
                        />

                        {/* 도시 추천 드롭다운 */}
                        {citySuggestions.length > 0 && (
                            <ul ref={suggestionRef} style={{
                                position: "absolute",
                                top: "100%",
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: "80%",
                                maxWidth: "500px",
                                backgroundColor: "white",
                                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                                borderRadius: "10px",
                                padding: "10px",
                                listStyle: "none",
                                zIndex: 10
                            }}>
                                <li style={{ display: "flex", justifyContent: "flex-end", padding: "5px" }}>
                                    <button onClick={() => setCitySuggestions([])} style={{
                                        background: "transparent",
                                        border: "none",
                                        fontSize: "1.2rem",
                                        cursor: "pointer"
                                    }}>✖</button>
                                </li>
                                {citySuggestions.map((suggestion) => (
                                    <li key={suggestion.place_id} onClick={() => setQuery(suggestion.name)}
                                        style={{
                                            padding: "10px",
                                            cursor: "pointer",
                                            fontSize: "1.1rem",
                                            borderBottom: "1px solid #d4a373",
                                            transition: "background 0.3s"
                                        }}>
                                        {suggestion.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div style={{ width: "100%", height: "calc(100vh - 100px)", marginTop: "20px" }}>
                    <GoogleMap options={{ styles: mapStyles, disableDefaultUI: true, zoomControl: false, minZoom }}
                        center={mapCenter} zoom={10} onClick={onMapClick}
                        mapContainerStyle={{ width: "100%", height: "100%" }}>
                        {clickedLocation && <Marker position={clickedLocation} icon={customMarkerIcon} />}
                    </GoogleMap>
                </div>
            </div>
        </LoadScript>
    );
};

export default CitySearch;