import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom bus icon
const busIcon = new L.Icon({
  iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23FF6A2C'%3E%3Cpath d='M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z'/%3E%3C/svg%3E",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const LiveMap = () => {
  const [userPosition, setUserPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState([10.8231, 106.6297]); // Default: Ho Chi Minh City

  // Mock bus data
  const busPosition = [10.8291, 106.6397];
  const busRoute = [
    [10.8231, 106.6297],
    [10.8251, 106.6317],
    [10.8271, 106.6357],
    [10.8291, 106.6397],
  ];

  useEffect(() => {
    // Request geolocation
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = [position.coords.latitude, position.coords.longitude];
          setUserPosition(pos);
          setMapCenter(pos);
        },
        (error) => {
          console.log("Geolocation denied or unavailable, using default location");
        }
      );
    }
  }, []);

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Loading indicator or attribution */}
      <div className="absolute bottom-2 left-2 z-[1000] bg-white/90 px-2 py-1 rounded text-xs text-gray-600">
        Theo dõi trực tiếp đã bật
      </div>

      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        zoomControl={window.innerWidth >= 768} // Show zoom controls on desktop only
        scrollWheelZoom={false}
        dragging={true}
        touchZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User's current position with pulsing circle */}
        {userPosition && (
          <>
            <Circle
              center={userPosition}
              radius={100}
              pathOptions={{ color: "#FF6A2C", fillColor: "#FF6A2C", fillOpacity: 0.3 }}
            />
            <Circle
              center={userPosition}
              radius={50}
              pathOptions={{ color: "#FF6A2C", fillColor: "#FF6A2C", fillOpacity: 0.5 }}
            />
            <Marker position={userPosition}>
              <Popup>
                <div className="text-center">
                  <p className="font-bold text-orange-600">📍 Vị Trí Của Bạn</p>
                  <p className="text-xs text-gray-500">Đang theo dõi trực tiếp</p>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Bus position */}
        <Marker position={busPosition} icon={busIcon}>
          <Popup>
            <div className="text-center">
              <p className="font-bold text-orange-600">🚌 Xe Buýt #101</p>
              <p className="text-sm text-gray-600">Tuyến: Trung tâm - Trường học</p>
              <p className="text-xs text-gray-500">Thời gian đến dự kiến: 5 phút</p>
            </div>
          </Popup>
        </Marker>

        {/* Bus route polyline */}
        <Polyline positions={busRoute} pathOptions={{ color: "#FF6A2C", weight: 4, dashArray: "10, 5" }} />
      </MapContainer>
    </div>
  );
};

export default LiveMap;
