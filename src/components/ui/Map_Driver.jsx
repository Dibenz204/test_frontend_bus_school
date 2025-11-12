import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import { drawSchoolBoundary } from "../SchoolBoundary";

import { getAllBusStops } from "../../services/busStopService";
import { getAllRoutes, getBusStopsByRoute } from "../../services/routeService";

const Map_Driver = () => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const routeLayers = useRef({});

    const [busStops, setBusStops] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [visibleFilter, setVisibleFilter] = useState('1');
    const [visibleRoutes, setVisibleRoutes] = useState([]);

    // Icon trạm
    // const busIconVisible = L.icon({
    //     iconUrl: "/busstop.png",
    //     iconSize: [70, 70],
    //     iconAnchor: [35, 70],
    //     popupAnchor: [0, -70],
    // });

    // const busIconHidden = L.icon({
    //     iconUrl: "/hehe.png",
    //     iconSize: [50, 50],
    //     iconAnchor: [25, 50],
    //     popupAnchor: [0, -50],
    // });

    // Màu cho các route
    const routeColors = [
        '#FF5733', '#FF9500', '#FFCC00', '#34C759', '#007AFF', '#AF52DE', '#1C1C1E'
    ];

    useEffect(() => {
        if (!mapInstanceRef.current) {
            const map = L.map(mapRef.current).setView([10.762913, 106.682171], 16);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                attribution: "© OpenStreetMap contributors",
            }).addTo(map);

            mapInstanceRef.current = map;

            // Vẽ vùng trường học đơn giản
            drawSimpleSchoolBoundary(map);
        }

        fetchBusStops();
        fetchRoutes();

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Hàm vẽ trường học đơn giản
    const drawSimpleSchoolBoundary = (map) => {
        // Tọa độ trường học (SGU làm ví dụ)
        const schoolCoordinates = [
            [10.762913, 106.682171],
            [10.763913, 106.683171],
            [10.764913, 106.682171],
            [10.763913, 106.681171]
        ];

        // Vẽ polygon trường học
        const schoolPolygon = L.polygon(schoolCoordinates, {
            color: 'blue',
            fillColor: '#1e90ff',
            fillOpacity: 0.1,
            weight: 2
        }).addTo(map);

        // Thêm popup
        schoolPolygon.bindPopup(`
            <div style="text-align: center;">
                <b>🏫 Trường Đại học Sài Gòn (SGU)</b><br>
                <small>Khu vực trường học</small>
            </div>
        `);

        return schoolPolygon;
    };

    useEffect(() => {
        if (mapInstanceRef.current) {
            fetchBusStops();
        }
    }, [visibleFilter]);

    // Load routes
    const fetchRoutes = async () => {
        try {
            const res = await getAllRoutes('ALL');
            if (res?.data?.errCode === 0) {
                setRoutes(res.data.routes);
            }
        } catch (e) {
            console.error("❌ Lỗi khi load routes:", e);
        }
    };

    // Load trạm
    const fetchBusStops = async () => {
        try {
            const filterValue = visibleFilter === 'all' ? null : visibleFilter;
            const res = await getAllBusStops(filterValue);

            if (res?.data?.errCode === 0) {
                setBusStops(res.data.data);
                renderBusStops(res.data.data);
            } else if (res?.errCode === 0) {
                setBusStops(res.data);
                renderBusStops(res.data);
            }
        } catch (e) {
            console.error("❌ Lỗi khi load trạm:", e);
        }
    };

    const clearMarkers = () => {
        markersRef.current.forEach(marker => {
            mapInstanceRef.current.removeLayer(marker);
        });
        markersRef.current = [];
    };

    // Render trạm
    const renderBusStops = (stops) => {
        const map = mapInstanceRef.current;
        if (!map) return;

        clearMarkers();

        stops.forEach((stop) => {
            const icon = stop.visible === 1 ? busIconVisible : busIconHidden;
            const visibleText = stop.visible === 1 ? '🟢 Hiển thị' : '🔴 Ẩn';
            const bgColor = stop.visible === 1 ? '#d4edda' : '#f8d7da';

            const marker = L.marker([stop.toado_x, stop.toado_y], { icon })
                .addTo(map);

            marker.bindPopup(
                `<div style="text-align:center; min-width: 220px;">
                    <b style="font-size: 14px;">🚌 ${stop.name_station}</b><br>
                    <span style="
                        display: inline-block;
                        background: ${bgColor};
                        padding: 2px 8px;
                        border-radius: 4px;
                        font-size: 11px;
                        margin: 5px 0;
                    ">${visibleText}</span><br>
                    <small style="color: #666;">${stop.describe || "Không có mô tả"}</small><br>
                    <hr style="margin: 8px 0; border: none; border-top: 1px solid #ddd;">
                    <small style="color: #999;">
                        ID: ${stop.id_busstop}<br>
                        Lat: ${stop.toado_x.toFixed(6)}<br>
                        Lng: ${stop.toado_y.toFixed(6)}
                    </small>
                </div>`
            );

            markersRef.current.push(marker);
        });
    };

    // Tìm kiếm địa chỉ
    const handleSearch = (e) => {
        if (e.key === "Enter" && searchQuery.trim()) {
            fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    searchQuery
                )}`
            )
                .then((res) => res.json())
                .then((data) => {
                    if (data && data.length > 0) {
                        const { lat, lon } = data[0];
                        mapInstanceRef.current.setView([lat, lon], 18);

                        L.popup()
                            .setLatLng([lat, lon])
                            .setContent(`
                                <div style="text-align: center; padding: 5px;">
                                    <b>📍 ${data[0].display_name}</b>
                                </div>
                            `)
                            .openOn(mapInstanceRef.current);
                    } else {
                        alert("❌ Không tìm thấy địa chỉ!");
                    }
                })
                .catch((err) => {
                    console.error("❌ Lỗi khi tìm kiếm:", err);
                    alert("❌ Lỗi khi tìm kiếm địa chỉ!");
                });
        }
    };

    // Vẽ đường route
    const drawRoute = async (routeId, color) => {
        try {
            const res = await getBusStopsByRoute(routeId);
            if (res?.data?.errCode !== 0 || !res?.data?.data) return;

            const routeBusStops = res.data.data;
            if (routeBusStops.length < 2) return;

            // Lấy tọa độ các trạm
            const waypoints = routeBusStops.map(rbs =>
                L.latLng(rbs.busStop.toado_x, rbs.busStop.toado_y)
            );

            // Tạo routing control
            const routingControl = L.Routing.control({
                waypoints: waypoints,
                routeWhileDragging: false,
                addWaypoints: false,
                draggableWaypoints: false,
                fitSelectedRoutes: false,
                showAlternatives: false,
                lineOptions: {
                    styles: [
                        { color: 'white', opacity: 1, weight: 9 },
                        { color: color, opacity: 0.8, weight: 5 }
                    ]
                },
                createMarker: () => null,
            }).addTo(mapInstanceRef.current);

            // Ẩn hướng dẫn
            const container = routingControl.getContainer();
            if (container) {
                container.style.display = 'none';
            }

            routeLayers.current[routeId] = routingControl;
        } catch (e) {
            console.error("❌ Lỗi vẽ route:", e);
        }
    };

    // Xóa route khỏi map
    const removeRoute = (routeId) => {
        if (routeLayers.current[routeId]) {
            mapInstanceRef.current.removeControl(routeLayers.current[routeId]);
            delete routeLayers.current[routeId];
        }
    };

    // Toggle hiển thị route
    const handleToggleRouteVisibility = (routeId) => {
        if (visibleRoutes.includes(routeId)) {
            setVisibleRoutes(prev => prev.filter(id => id !== routeId));
            removeRoute(routeId);
        } else {
            setVisibleRoutes(prev => [...prev, routeId]);
            const colorIndex = routes.findIndex(r => r.id_route === routeId);
            drawRoute(routeId, routeColors[colorIndex % routeColors.length]);
        }
    };

    return (
        <div style={{ position: "relative", height: "100%", width: "100%" }}>
            {/* Search bar */}
            <div style={{
                position: "absolute",
                top: "15px",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 1000,
                display: "flex",
                gap: "8px",
                alignItems: "center",
                backgroundColor: "white",
                padding: "8px 12px",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
            }}>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleSearch}
                    placeholder="🔍 Tìm kiếm địa chỉ..."
                    style={{
                        width: "300px",
                        padding: "8px 12px",
                        fontSize: "14px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        outline: "none"
                    }}
                />

                <select
                    value={visibleFilter}
                    onChange={(e) => setVisibleFilter(e.target.value)}
                    style={{
                        padding: "8px 12px",
                        fontSize: "13px",
                        border: "1px solid #007bff",
                        borderRadius: "4px",
                        backgroundColor: "white",
                        cursor: "pointer",
                        fontWeight: "600",
                        color: "#007bff",
                        outline: "none"
                    }}
                >
                    <option value="1">🟢 Hiển thị</option>
                    <option value="0">🔴 Ẩn</option>
                    <option value="all">🔵 Tất cả</option>
                </select>
            </div>

            {/* Route controls */}
            <div style={{
                position: "absolute",
                top: "80px",
                right: "20px",
                zIndex: 1000,
                backgroundColor: "white",
                padding: "15px",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                maxWidth: "300px",
                maxHeight: "400px",
                overflowY: "auto"
            }}>
                <h4 style={{ margin: "0 0 10px 0", color: "#007bff", fontSize: "16px" }}>
                    🗺️ Tuyến đường
                </h4>

                <div style={{
                    maxHeight: "300px",
                    overflowY: "auto",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    padding: "8px"
                }}>
                    {routes.length === 0 ? (
                        <p style={{ color: "#6c757d", fontSize: "13px", textAlign: "center" }}>
                            Chưa có route nào
                        </p>
                    ) : (
                        routes.map((route, index) => (
                            <div
                                key={route.id_route}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "8px",
                                    marginBottom: "5px",
                                    backgroundColor: visibleRoutes.includes(route.id_route) ? "#e7f3ff" : "white",
                                    borderRadius: "4px",
                                    border: "1px solid #e0e0e0"
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={visibleRoutes.includes(route.id_route)}
                                    onChange={() => handleToggleRouteVisibility(route.id_route)}
                                    style={{
                                        width: "18px",
                                        height: "18px",
                                        cursor: "pointer",
                                        marginRight: "10px"
                                    }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: "14px", fontWeight: "600" }}>
                                        {route.name_street}
                                    </div>
                                    <div style={{ fontSize: "11px", color: "#6c757d" }}>
                                        ID: {route.id_route}
                                    </div>
                                </div>
                                <div
                                    style={{
                                        width: "20px",
                                        height: "20px",
                                        borderRadius: "50%",
                                        backgroundColor: routeColors[index % routeColors.length],
                                        border: "2px solid white",
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
                                    }}
                                ></div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div ref={mapRef} style={{ width: "100%", height: "100%" }}></div>
        </div>
    );
};

export default Map_Driver;