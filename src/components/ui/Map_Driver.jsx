import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import { getAllBusStops } from "../../services/busStopService";
import { getBusStopsByRoute, getAllRoutes } from "../../services/routeService";
import { getSchedulesByDriver, getAllSchedules } from "../../services/scheduleService";
import { drawSchoolBoundary } from "../SchoolBoundary";

// Fix Leaflet default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Map_Driver = ({ currentLocation, driverInfo }) => {
    const { t } = useTranslation();
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const routeLayers = useRef({});
    const schoolBoundaryRef = useRef(null);
    const driverMarkerRef = useRef(null); // ✅ Marker cho vị trí driver

    const [searchQuery, setSearchQuery] = useState("");
    const [currentSchedule, setCurrentSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mapReady, setMapReady] = useState(false);
    const [allSchedules, setAllSchedules] = useState([]);
    const [showAllSchedules, setShowAllSchedules] = useState(false);

    // Icon trạm
    const busIcon = new L.Icon({
        iconUrl: "/busstop.png",
        iconSize: [50, 50],
        iconAnchor: [25, 50],
        popupAnchor: [0, -50],
    });

    // ✅ Icon xe bus cho vị trí driver
    const busIconCurrent = new L.Icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [35, 55],
        iconAnchor: [17, 55],
        popupAnchor: [1, -44],
        shadowSize: [55, 55]
    });

    useEffect(() => {
        if (!mapRef.current) {
            console.log("❌ " + t("mapDriver.errors.mapNotReady"));
            return;
        }

        if (mapInstanceRef.current) {
            console.log("ℹ️ " + t("mapDriver.info.mapAlreadyInitialized"));
            return;
        }

        console.log("🔄 " + t("mapDriver.info.initializingMap"));

        try {
            const map = L.map(mapRef.current).setView([10.762913, 106.682171], 16);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                attribution: "© OpenStreetMap contributors",
            }).addTo(map);

            mapInstanceRef.current = map;
            setMapReady(true);

            console.log("✅ " + t("mapDriver.info.mapInitialized"));

            schoolBoundaryRef.current = drawSchoolBoundary(map);
            addResetViewControl(map);
            fetchDriverSchedule();

        } catch (error) {
            console.error("❌ " + t("mapDriver.errors.mapInitialization"), error);
        }

        return () => {
            console.log("🧹 " + t("mapDriver.info.cleaningUp"));
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                setMapReady(false);
            }
        };
    }, [t]);

    // ✅ Cập nhật vị trí driver realtime
    useEffect(() => {
        if (!mapInstanceRef.current || !currentLocation) return;

        const { lat, lng } = currentLocation;

        if (!driverMarkerRef.current) {
            // Tạo marker lần đầu
            driverMarkerRef.current = L.marker([lat, lng], {
                icon: busIconCurrent,
                zIndexOffset: 1000
            }).addTo(mapInstanceRef.current);

            driverMarkerRef.current.bindPopup(`
                <div style="text-align: center; min-width: 200px;">
                    <b style="font-size: 14px;">🚌 ${driverInfo?.name || 'Tài xế'}</b><br>
                    <small style="color: #666;">ID: ${driverInfo?.id_driver}</small><br>
                    <hr style="margin: 8px 0; border: none; border-top: 1px solid #ddd;">
                    <small style="color: #999;">
                        📍 Lat: ${lat.toFixed(6)}<br>
                        📍 Lng: ${lng.toFixed(6)}
                    </small>
                </div>
            `);

            console.log('✅ Driver marker created');
        } else {
            // Cập nhật vị trí marker
            driverMarkerRef.current.setLatLng([lat, lng]);

            // Cập nhật popup content
            driverMarkerRef.current.setPopupContent(`
                <div style="text-align: center; min-width: 200px;">
                    <b style="font-size: 14px;">🚌 ${driverInfo?.name || 'Tài xế'}</b><br>
                    <small style="color: #666;">ID: ${driverInfo?.id_driver}</small><br>
                    <hr style="margin: 8px 0; border: none; border-top: 1px solid #ddd;">
                    <small style="color: #999;">
                        📍 Lat: ${lat.toFixed(6)}<br>
                        📍 Lng: ${lng.toFixed(6)}
                    </small>
                </div>
            `);

            console.log(`📍 Driver marker updated: [${lat.toFixed(6)}, ${lng.toFixed(6)}]`);
        }

        // Auto center map khi driver di chuyển (optional)
        // mapInstanceRef.current.setView([lat, lng], 16);
    }, [currentLocation, driverInfo]);

    const addResetViewControl = (map) => {
        const resetControl = L.control({ position: 'topright' });

        resetControl.onAdd = function () {
            const div = L.DomUtil.create('div', 'reset-control');
            div.innerHTML = `
                <button style="
                    background: white;
                    border: 2px solid #007bff;
                    border-radius: 4px;
                    padding: 8px 12px;
                    cursor: pointer;
                    font-weight: bold;
                    color: #007bff;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                    margin-top: 48px;
                ">🏫 ${t("mapDriver.controls.backToSchool")}</button>
            `;

            div.onclick = () => {
                map.setView([10.758995, 106.682527], 17);
            };

            return div;
        };

        resetControl.addTo(map);
    };

    const getTaiXeInfo = () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            return userInfo;
        } catch (error) {
            console.error("❌ " + t("mapDriver.errors.getUserInfo"), error);
            return null;
        }
    };

    const fetchDriverSchedule = async () => {
        try {
            setLoading(true);
            const taiXeInfo = getTaiXeInfo();

            if (!taiXeInfo) {
                console.error("❌ " + t("mapDriver.errors.notLoggedIn"));
                setLoading(false);
                return;
            }

            console.log("👤 " + t("mapDriver.info.driverId") + taiXeInfo.id_driver);

            const today = new Date().toISOString().split('T')[0];
            console.log("📅 " + t("mapDriver.info.today") + today);

            const response = await getAllSchedules('ALL', {
                id_driver: taiXeInfo.id_driver,
                date: today
            });

            const schedules = response.data.data;
            console.log("📋 " + t("mapDriver.info.allSchedulesReceived"), schedules);

            if (schedules && schedules.length > 0) {
                setAllSchedules(schedules);

                let selectedSchedule = schedules.find(schedule => schedule.status === 'Vận hành');

                if (!selectedSchedule) {
                    const now = new Date();
                    const currentTime = now.toTimeString().split(' ')[0];

                    selectedSchedule = schedules.find(schedule => {
                        return schedule.status === 'Đã lên lịch' && schedule.Stime > currentTime;
                    });
                }

                if (!selectedSchedule) {
                    selectedSchedule = schedules[0];
                }

                setCurrentSchedule(selectedSchedule);
                console.log("🎯 " + t("mapDriver.info.selectedSchedule"), selectedSchedule);

                if (selectedSchedule.routes && selectedSchedule.routes.id_route) {
                    const routeId = selectedSchedule.routes.id_route;
                    console.log("🛣️ " + t("mapDriver.info.drawingRoute"), routeId);

                    setTimeout(() => {
                        drawRouteAndStops(routeId);
                    }, 1000);
                } else {
                    setLoading(false);
                }
            } else {
                console.log("ℹ️ " + t("mapDriver.info.noSchedulesToday"));
                setLoading(false);
            }
        } catch (error) {
            console.error("❌ " + t("mapDriver.errors.loadSchedule"), error);
            setLoading(false);
        }
    };

    const clearMarkers = () => {
        markersRef.current.forEach(marker => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.removeLayer(marker);
            }
        });
        markersRef.current = [];
    };

    const drawRouteAndStops = async (routeId) => {
        if (!mapInstanceRef.current) {
            console.log("❌ " + t("mapDriver.errors.mapNotReadyForDrawing"));
            return;
        }

        try {
            console.log(`🛣️ ${t("mapDriver.info.drawingRouteAndStops")} ${routeId}`);

            clearMarkers();

            if (routeLayers.current[routeId]) {
                mapInstanceRef.current.removeControl(routeLayers.current[routeId]);
                delete routeLayers.current[routeId];
            }

            const res = await getBusStopsByRoute(routeId);

            if (res?.data?.errCode !== 0 || !res?.data?.data) {
                console.log("❌ " + t("mapDriver.errors.noRouteData"));
                setLoading(false);
                return;
            }

            const routeBusStops = res.data.data;
            if (routeBusStops.length < 2) {
                console.log("❌ " + t("mapDriver.errors.needTwoStops"));
                setLoading(false);
                return;
            }

            console.log(`📍 ${t("mapDriver.info.routeHasStops")} ${routeBusStops.length}`);

            routeBusStops.forEach((rbs, index) => {
                const stop = rbs.busStop;
                const marker = L.marker([stop.toado_x, stop.toado_y], { icon: busIcon })
                    .addTo(mapInstanceRef.current);

                const isFirstStop = index === 0;
                const isLastStop = index === routeBusStops.length - 1;

                let stopType = "";
                if (isFirstStop) stopType = t("mapDriver.stopTypes.first");
                else if (isLastStop) stopType = t("mapDriver.stopTypes.last");
                else stopType = "🚌";

                marker.bindPopup(
                    `<div style="text-align:center; min-width: 220px;">
                        <b style="font-size: 14px;">
                            ${stopType} ${stop.name_station}
                        </b><br>
                        <small style="color: #666;">${stop.describe || t("mapDriver.stopTypes.noDescription")}</small><br>
                        <hr style="margin: 8px 0; border: none; border-top: 1px solid #ddd;">
                        <small style="color: #999;">
                            ${t("mapDriver.stopTypes.stopNumber", { current: index + 1, total: routeBusStops.length })}<br>
                            ${t("mapDriver.stopTypes.lat")} ${stop.toado_x.toFixed(6)}<br>
                            ${t("mapDriver.stopTypes.lng")} ${stop.toado_y.toFixed(6)}
                        </small>
                    </div>`
                );

                markersRef.current.push(marker);
            });

            const waypoints = routeBusStops.map(rbs =>
                L.latLng(rbs.busStop.toado_x, rbs.busStop.toado_y)
            );

            const routingControl = L.Routing.control({
                waypoints: waypoints,
                routeWhileDragging: false,
                addWaypoints: false,
                draggableWaypoints: false,
                fitSelectedRoutes: true,
                showAlternatives: false,
                lineOptions: {
                    styles: [
                        { color: 'white', opacity: 1, weight: 10 },
                        { color: '#FF0000', opacity: 0.8, weight: 6 }
                    ]
                },
                createMarker: () => null,
            }).addTo(mapInstanceRef.current);

            const container = routingControl.getContainer();
            if (container) {
                container.style.display = 'none';
            }

            routeLayers.current[routeId] = routingControl;
            console.log(`✅ ${t("mapDriver.info.routeDrawn", { routeId, stopCount: routeBusStops.length })}`);

            const group = new L.featureGroup(markersRef.current);
            mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));

        } catch (e) {
            console.error("❌ " + t("mapDriver.errors.drawingRoute"), e);
        } finally {
            setLoading(false);
        }
    };

    const switchSchedule = (schedule) => {
        setCurrentSchedule(schedule);
        if (schedule.routes && schedule.routes.id_route) {
            drawRouteAndStops(schedule.routes.id_route);
        }
    };

    const handleRefresh = () => {
        fetchDriverSchedule();
    };

    return (
        <div style={{
            position: "relative",
            height: "calc(100vh - 60px)",
            width: "100%"
        }}>
            {loading && (
                <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 2000,
                    backgroundColor: "rgba(255,255,255,0.9)",
                    padding: "20px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                }}>
                    <div style={{ textAlign: "center" }}>
                        <div>🔄 {t("mapDriver.loading.loadingSchedule")}</div>
                    </div>
                </div>
            )}

            {currentSchedule && (
                <div style={{
                    position: "absolute",
                    top: "90px",
                    left: "10px",
                    zIndex: 1000,
                    backgroundColor: "white",
                    padding: "15px",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    maxWidth: "400px",
                    maxHeight: "80vh",
                    overflowY: "auto"
                }}>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "10px"
                    }}>
                        <h4 style={{
                            margin: "0",
                            color: "#007bff",
                            fontSize: "16px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                        }}>
                            🚌 {t("mapDriver.scheduleInfo.yourSchedule")}
                            {currentSchedule.status === 'Vận hành' && (
                                <span style={{
                                    fontSize: "10px",
                                    backgroundColor: "#28a745",
                                    color: "white",
                                    padding: "2px 6px",
                                    borderRadius: "4px"
                                }}>
                                    {t("mapDriver.scheduleStatus.running")}
                                </span>
                            )}
                        </h4>
                        <button
                            onClick={handleRefresh}
                            style={{
                                background: "#007bff",
                                border: "none",
                                borderRadius: "4px",
                                padding: "4px 8px",
                                cursor: "pointer",
                                color: "white",
                                fontSize: "12px"
                            }}
                        >
                            🔄
                        </button>
                    </div>

                    <div style={{ fontSize: "14px", marginBottom: "8px" }}>
                        <strong>{t("mapDriver.scheduleInfo.route")}:</strong> {currentSchedule.routes?.name_street || "N/A"}
                    </div>

                    <div style={{ fontSize: "14px", marginBottom: "8px" }}>
                        <strong>{t("mapDriver.scheduleInfo.time")}:</strong> {currentSchedule.Stime || "N/A"}
                    </div>

                    <div style={{ fontSize: "14px", marginBottom: "8px" }}>
                        <strong>{t("mapDriver.scheduleInfo.date")}:</strong> {currentSchedule.Sdate || "N/A"}
                    </div>

                    <div style={{
                        fontSize: "12px",
                        padding: "4px 8px",
                        backgroundColor:
                            currentSchedule.status === 'Vận hành' ? '#d4edda' :
                                currentSchedule.status === 'Đã lên lịch' ? '#fff3cd' : '#f8d7da',
                        color:
                            currentSchedule.status === 'Vận hành' ? '#155724' :
                                currentSchedule.status === 'Đã lên lịch' ? '#856404' : '#721c24',
                        borderRadius: "4px",
                        display: "inline-block",
                        marginBottom: "8px"
                    }}>
                        <strong>{t("mapDriver.scheduleInfo.status")}:</strong> {currentSchedule.status || "N/A"}
                    </div>
                </div>
            )}

            {!loading && !currentSchedule && (
                <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 1000,
                    backgroundColor: "white",
                    padding: "25px",
                    borderRadius: "10px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    textAlign: "center",
                    maxWidth: "450px"
                }}>
                    <div style={{ fontSize: "20px", marginBottom: "10px", color: "#007bff" }}>
                        📅 {t("mapDriver.noSchedule.title")}
                    </div>
                    <div style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>
                        {t("mapDriver.noSchedule.description")}
                    </div>

                    <button
                        onClick={handleRefresh}
                        style={{
                            background: "#007bff",
                            border: "none",
                            borderRadius: "6px",
                            padding: "10px 20px",
                            cursor: "pointer",
                            color: "white",
                            fontSize: "14px",
                            fontWeight: "bold",
                            marginBottom: "15px"
                        }}
                    >
                        🔄 {t("mapDriver.noSchedule.tryAgain")}
                    </button>

                    <div style={{
                        backgroundColor: "#e7f3ff",
                        padding: "15px",
                        borderRadius: "8px",
                        border: "1px solid #b3d9ff"
                    }}>
                        <div style={{ fontSize: "14px", fontWeight: "bold", color: "#0066cc", marginBottom: "8px" }}>
                            💡 {t("mapDriver.noSchedule.suggestions.title")}:
                        </div>
                        <div style={{ fontSize: "12px", color: "#004d99", textAlign: "left" }}>
                            {t("mapDriver.noSchedule.suggestions.items")}
                        </div>
                    </div>
                </div>
            )}

            <div
                ref={mapRef}
                style={{
                    width: "100%",
                    height: "100%",
                    minHeight: "500px"
                }}
            >
                {!mapReady && (
                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                        backgroundColor: "#f5f5f5",
                        color: "#666"
                    }}>
                        <div>🔄 {t("mapDriver.loading.initializingMap")}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Map_Driver;

// import React, { useEffect, useRef, useState } from "react";
// import { useTranslation } from "react-i18next";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
// import "leaflet-routing-machine";
// import { getAllBusStops } from "../../services/busStopService";
// import { getBusStopsByRoute, getAllRoutes } from "../../services/routeService";
// import { getSchedulesByDriver, getAllSchedules } from "../../services/scheduleService";
// import { drawSchoolBoundary } from "../SchoolBoundary";

// // Fix Leaflet default markers
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//     iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
//     iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
//     shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
// });

// const Map_Driver = () => {
//     const { t } = useTranslation();
//     const mapRef = useRef(null);
//     const mapInstanceRef = useRef(null);
//     const markersRef = useRef([]);
//     const routeLayers = useRef({});
//     const schoolBoundaryRef = useRef(null);

//     const [searchQuery, setSearchQuery] = useState("");
//     const [currentSchedule, setCurrentSchedule] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [mapReady, setMapReady] = useState(false);
//     const [allSchedules, setAllSchedules] = useState([]);
//     const [showAllSchedules, setShowAllSchedules] = useState(false);

//     // Lấy thông tin tài xế từ localStorage
//     const getTaiXeInfo = () => {
//         try {
//             const userInfo = JSON.parse(localStorage.getItem("userInfo"));
//             return userInfo;
//         } catch (error) {
//             console.error("❌ " + t("mapDriver.errors.getUserInfo"), error);
//             return null;
//         }
//     };

//     // Icon trạm - chỉ hiển thị các trạm thuộc route của driver
//     const busIcon = new L.Icon({
//         iconUrl: "/busstop.png",
//         iconSize: [50, 50],
//         iconAnchor: [25, 50],
//         popupAnchor: [0, -50],
//     });

//     // Icon xe bus cho vị trí hiện tại của driver
//     // const busIconCurrent = new L.Icon({
//     //     iconUrl: "/bus-icon.png",
//     //     iconSize: [40, 40],
//     //     iconAnchor: [20, 40],
//     //     popupAnchor: [0, -40],
//     // });

//     useEffect(() => {
//         if (!mapRef.current) {
//             console.log("❌ " + t("mapDriver.errors.mapNotReady"));
//             return;
//         }

//         if (mapInstanceRef.current) {
//             console.log("ℹ️ " + t("mapDriver.info.mapAlreadyInitialized"));
//             return;
//         }

//         console.log("🔄 " + t("mapDriver.info.initializingMap"));

//         try {
//             const map = L.map(mapRef.current).setView([10.762913, 106.682171], 16);

//             L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//                 maxZoom: 19,
//                 attribution: "© OpenStreetMap contributors",
//             }).addTo(map);

//             mapInstanceRef.current = map;
//             setMapReady(true);

//             console.log("✅ " + t("mapDriver.info.mapInitialized"));

//             schoolBoundaryRef.current = drawSchoolBoundary(map);
//             addResetViewControl(map);
//             fetchDriverSchedule();

//         } catch (error) {
//             console.error("❌ " + t("mapDriver.errors.mapInitialization"), error);
//         }

//         return () => {
//             console.log("🧹 " + t("mapDriver.info.cleaningUp"));
//             if (mapInstanceRef.current) {
//                 mapInstanceRef.current.remove();
//                 mapInstanceRef.current = null;
//                 setMapReady(false);
//             }
//         };
//     }, [t]);

//     // Thêm nút reset view về trường học
//     const addResetViewControl = (map) => {
//         const resetControl = L.control({ position: 'topright' });

//         resetControl.onAdd = function () {
//             const div = L.DomUtil.create('div', 'reset-control');
//             div.innerHTML = `
//                 <button style="
//                     background: white;
//                     border: 2px solid #007bff;
//                     border-radius: 4px;
//                     padding: 8px 12px;
//                     cursor: pointer;
//                     font-weight: bold;
//                     color: #007bff;
//                     box-shadow: 0 2px 5px rgba(0,0,0,0.2);
//                     margin-top: 48px;
//                 ">🏫 ${t("mapDriver.controls.backToSchool")}</button>
//             `;

//             div.onclick = () => {
//                 map.setView([10.758995, 106.682527], 17);
//             };

//             return div;
//         };

//         resetControl.addTo(map);
//     };

//     // Lấy lịch trình của driver đang đăng nhập trong ngày hôm nay
//     const fetchDriverSchedule = async () => {
//         try {
//             setLoading(true);
//             const taiXeInfo = getTaiXeInfo();

//             if (!taiXeInfo) {
//                 console.error("❌ " + t("mapDriver.errors.notLoggedIn"));
//                 setLoading(false);
//                 return;
//             }

//             console.log("👤 " + t("mapDriver.info.driverId") + taiXeInfo.id_driver);

//             // Lấy ngày hôm nay
//             const today = new Date().toISOString().split('T')[0];
//             console.log("📅 " + t("mapDriver.info.today") + today);

//             // Lấy schedule của driver trong ngày hôm nay
//             const response = await getAllSchedules('ALL', {
//                 id_driver: taiXeInfo.id_driver,
//                 date: today
//             });

//             const schedules = response.data.data;
//             console.log("📋 " + t("mapDriver.info.allSchedulesReceived"), schedules);

//             if (schedules && schedules.length > 0) {
//                 setAllSchedules(schedules);

//                 // ƯU TIÊN: Tìm schedule có trạng thái "Vận hành" trước
//                 let selectedSchedule = schedules.find(schedule => schedule.status === 'Vận hành');

//                 // Nếu không có "Vận hành", tìm schedule "Đã lên lịch" sắp tới
//                 if (!selectedSchedule) {
//                     const now = new Date();
//                     const currentTime = now.toTimeString().split(' ')[0];

//                     selectedSchedule = schedules.find(schedule => {
//                         return schedule.status === 'Đã lên lịch' && schedule.Stime > currentTime;
//                     });
//                 }

//                 // Nếu vẫn không có, lấy schedule đầu tiên
//                 if (!selectedSchedule) {
//                     selectedSchedule = schedules[0];
//                 }

//                 setCurrentSchedule(selectedSchedule);
//                 console.log("🎯 " + t("mapDriver.info.selectedSchedule"), selectedSchedule);

//                 // Vẽ route của schedule này
//                 if (selectedSchedule.routes && selectedSchedule.routes.id_route) {
//                     const routeId = selectedSchedule.routes.id_route;
//                     console.log("🛣️ " + t("mapDriver.info.drawingRoute"), routeId);

//                     setTimeout(() => {
//                         drawRouteAndStops(routeId);
//                         addDriverLocation();
//                     }, 1000);
//                 } else {
//                     setLoading(false);
//                 }
//             } else {
//                 console.log("ℹ️ " + t("mapDriver.info.noSchedulesToday"));
//                 setLoading(false);
//             }
//         } catch (error) {
//             console.error("❌ " + t("mapDriver.errors.loadSchedule"), error);
//             setLoading(false);
//         }
//     };

//     // Thêm vị trí giả định của driver
//     const addDriverLocation = () => {
//         if (!mapInstanceRef.current) return;

//         const driverLocation = [10.7635, 106.6825];
//         const driverMarker = L.marker(driverLocation, {
//             icon: busIconCurrent,
//             zIndexOffset: 1000
//         }).addTo(mapInstanceRef.current);

//         // driverMarker.bindPopup(`
//         //     <div style="text-align: center;">
//         //         <b>🚌 ${t("mapDriver.driverLocation.title")}</b><br>
//         //         <small>${t("mapDriver.driverLocation.description")}</small>
//         //     </div>
//         // `);

//         driverMarker.openPopup();
//     };

//     const clearMarkers = () => {
//         markersRef.current.forEach(marker => {
//             if (mapInstanceRef.current) {
//                 mapInstanceRef.current.removeLayer(marker);
//             }
//         });
//         markersRef.current = [];
//     };

//     // Vẽ route VÀ các trạm của route đó
//     const drawRouteAndStops = async (routeId) => {
//         if (!mapInstanceRef.current) {
//             console.log("❌ " + t("mapDriver.errors.mapNotReadyForDrawing"));
//             return;
//         }

//         try {
//             console.log(`🛣️ ${t("mapDriver.info.drawingRouteAndStops")} ${routeId}`);

//             clearMarkers();

//             if (routeLayers.current[routeId]) {
//                 mapInstanceRef.current.removeControl(routeLayers.current[routeId]);
//                 delete routeLayers.current[routeId];
//             }

//             const res = await getBusStopsByRoute(routeId);

//             if (res?.data?.errCode !== 0 || !res?.data?.data) {
//                 console.log("❌ " + t("mapDriver.errors.noRouteData"));
//                 setLoading(false);
//                 return;
//             }

//             const routeBusStops = res.data.data;
//             if (routeBusStops.length < 2) {
//                 console.log("❌ " + t("mapDriver.errors.needTwoStops"));
//                 setLoading(false);
//                 return;
//             }

//             console.log(`📍 ${t("mapDriver.info.routeHasStops")} ${routeBusStops.length}`);

//             // Vẽ các trạm
//             routeBusStops.forEach((rbs, index) => {
//                 const stop = rbs.busStop;
//                 const marker = L.marker([stop.toado_x, stop.toado_y], { icon: busIcon })
//                     .addTo(mapInstanceRef.current);

//                 const isFirstStop = index === 0;
//                 const isLastStop = index === routeBusStops.length - 1;

//                 let stopType = "";
//                 if (isFirstStop) stopType = t("mapDriver.stopTypes.first");
//                 else if (isLastStop) stopType = t("mapDriver.stopTypes.last");
//                 else stopType = "🚌";

//                 marker.bindPopup(
//                     `<div style="text-align:center; min-width: 220px;">
//                         <b style="font-size: 14px;">
//                             ${stopType} ${stop.name_station}
//                         </b><br>
//                         <small style="color: #666;">${stop.describe || t("mapDriver.stopTypes.noDescription")}</small><br>
//                         <hr style="margin: 8px 0; border: none; border-top: 1px solid #ddd;">
//                         <small style="color: #999;">
//                             ${t("mapDriver.stopTypes.stopNumber", { current: index + 1, total: routeBusStops.length })}<br>
//                             ${t("mapDriver.stopTypes.lat")} ${stop.toado_x.toFixed(6)}<br>
//                             ${t("mapDriver.stopTypes.lng")} ${stop.toado_y.toFixed(6)}
//                         </small>
//                     </div>`
//                 );

//                 markersRef.current.push(marker);
//             });

//             // Lấy tọa độ các trạm để vẽ route
//             const waypoints = routeBusStops.map(rbs =>
//                 L.latLng(rbs.busStop.toado_x, rbs.busStop.toado_y)
//             );

//             const routingControl = L.Routing.control({
//                 waypoints: waypoints,
//                 routeWhileDragging: false,
//                 addWaypoints: false,
//                 draggableWaypoints: false,
//                 fitSelectedRoutes: true,
//                 showAlternatives: false,
//                 lineOptions: {
//                     styles: [
//                         { color: 'white', opacity: 1, weight: 10 },
//                         { color: '#FF0000', opacity: 0.8, weight: 6 }
//                     ]
//                 },
//                 createMarker: () => null,
//             }).addTo(mapInstanceRef.current);

//             const container = routingControl.getContainer();
//             if (container) {
//                 container.style.display = 'none';
//             }

//             routeLayers.current[routeId] = routingControl;
//             console.log(`✅ ${t("mapDriver.info.routeDrawn", { routeId, stopCount: routeBusStops.length })}`);

//             const group = new L.featureGroup(markersRef.current);
//             mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));

//         } catch (e) {
//             console.error("❌ " + t("mapDriver.errors.drawingRoute"), e);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Chuyển đổi giữa các schedules nếu có nhiều schedule trong ngày
//     const switchSchedule = (schedule) => {
//         setCurrentSchedule(schedule);
//         if (schedule.routes && schedule.routes.id_route) {
//             drawRouteAndStops(schedule.routes.id_route);
//         }
//     };

//     // Refresh dữ liệu
//     const handleRefresh = () => {
//         fetchDriverSchedule();
//     };

//     return (
//         <div style={{
//             position: "relative",
//             height: "calc(100vh - 60px)",
//             width: "100%"
//         }}>
//             {/* Loading indicator */}
//             {loading && (
//                 <div style={{
//                     position: "absolute",
//                     top: "50%",
//                     left: "50%",
//                     transform: "translate(-50%, -50%)",
//                     zIndex: 2000,
//                     backgroundColor: "rgba(255,255,255,0.9)",
//                     padding: "20px",
//                     borderRadius: "8px",
//                     boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
//                 }}>
//                     <div style={{ textAlign: "center" }}>
//                         <div>🔄 {t("mapDriver.loading.loadingSchedule")}</div>
//                     </div>
//                 </div>
//             )}

//             {/* Current Schedule Info */}
//             {currentSchedule && (
//                 <div style={{
//                     position: "absolute",
//                     top: "90px",
//                     left: "10px",
//                     zIndex: 1000,
//                     backgroundColor: "white",
//                     padding: "15px",
//                     borderRadius: "8px",
//                     boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
//                     maxWidth: "400px",
//                     maxHeight: "80vh",
//                     overflowY: "auto"
//                 }}>
//                     {/* Header với refresh button */}
//                     <div style={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                         alignItems: "center",
//                         marginBottom: "10px"
//                     }}>
//                         <h4 style={{
//                             margin: "0",
//                             color: "#007bff",
//                             fontSize: "16px",
//                             display: "flex",
//                             alignItems: "center",
//                             gap: "8px"
//                         }}>
//                             🚌 {t("mapDriver.scheduleInfo.yourSchedule")}
//                             {currentSchedule.status === 'Vận hành' && (
//                                 <span style={{
//                                     fontSize: "10px",
//                                     backgroundColor: "#28a745",
//                                     color: "white",
//                                     padding: "2px 6px",
//                                     borderRadius: "4px"
//                                 }}>
//                                     {t("mapDriver.scheduleStatus.running")}
//                                 </span>
//                             )}
//                         </h4>
//                         <button
//                             onClick={handleRefresh}
//                             style={{
//                                 background: "#007bff",
//                                 border: "none",
//                                 borderRadius: "4px",
//                                 padding: "4px 8px",
//                                 cursor: "pointer",
//                                 color: "white",
//                                 fontSize: "12px"
//                             }}
//                         >
//                             🔄
//                         </button>
//                     </div>

//                     <div style={{ fontSize: "14px", marginBottom: "8px" }}>
//                         <strong>{t("mapDriver.scheduleInfo.route")}:</strong> {currentSchedule.routes?.name_street || "N/A"}
//                     </div>

//                     <div style={{ fontSize: "14px", marginBottom: "8px" }}>
//                         <strong>{t("mapDriver.scheduleInfo.time")}:</strong> {currentSchedule.Stime || "N/A"}
//                     </div>

//                     <div style={{ fontSize: "14px", marginBottom: "8px" }}>
//                         <strong>{t("mapDriver.scheduleInfo.date")}:</strong> {currentSchedule.Sdate || "N/A"}
//                     </div>

//                     <div style={{
//                         fontSize: "12px",
//                         padding: "4px 8px",
//                         backgroundColor:
//                             currentSchedule.status === 'Vận hành' ? '#d4edda' :
//                                 currentSchedule.status === 'Đã lên lịch' ? '#fff3cd' : '#f8d7da',
//                         color:
//                             currentSchedule.status === 'Vận hành' ? '#155724' :
//                                 currentSchedule.status === 'Đã lên lịch' ? '#856404' : '#721c24',
//                         borderRadius: "4px",
//                         display: "inline-block",
//                         marginBottom: "8px"
//                     }}>
//                         <strong>{t("mapDriver.scheduleInfo.status")}:</strong> {currentSchedule.status || "N/A"}
//                     </div>

//                     {/* Hiển thị các schedules khác nếu có */}
//                     {/* {allSchedules.length > 1 && (
//                         <div style={{ marginTop: "10px", borderTop: "1px solid #eee", paddingTop: "10px" }}>
//                             <div
//                                 style={{
//                                     fontSize: "12px",
//                                     fontWeight: "bold",
//                                     marginBottom: "5px",
//                                     color: "#666",
//                                     cursor: "pointer",
//                                     display: "flex",
//                                     alignItems: "center",
//                                     gap: "5px"
//                                 }}
//                                 onClick={() => setShowAllSchedules(!showAllSchedules)}
//                             >
//                                 {showAllSchedules ? '▼' : '▶'} {t("mapDriver.scheduleInfo.otherSchedules", { count: allSchedules.length - 1 })}
//                             </div>
//                             {showAllSchedules && (
//                                 <div style={{ maxHeight: "150px", overflowY: "auto" }}>
//                                     {allSchedules
//                                         .filter(s => s.id_schedule !== currentSchedule.id_schedule)
//                                         .map((schedule, index) => (
//                                             <div
//                                                 key={schedule.id_schedule}
//                                                 onClick={() => switchSchedule(schedule)}
//                                                 style={{
//                                                     padding: "8px",
//                                                     marginBottom: "5px",
//                                                     backgroundColor: schedule.status === 'Vận hành' ? '#e8f5e8' : "#f8f9fa",
//                                                     border: schedule.status === 'Vận hành' ? "2px solid #28a745" : "1px solid #dee2e6",
//                                                     borderRadius: "4px",
//                                                     cursor: "pointer",
//                                                     fontSize: "11px",
//                                                     transition: "all 0.2s"
//                                                 }}
//                                                 onMouseEnter={(e) => {
//                                                     e.currentTarget.style.backgroundColor = schedule.status === 'Vận hành' ? '#d4edda' : '#e9ecef';
//                                                 }}
//                                                 onMouseLeave={(e) => {
//                                                     e.currentTarget.style.backgroundColor = schedule.status === 'Vận hành' ? '#e8f5e8' : "#f8f9fa";
//                                                 }}
//                                             >
//                                                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                                                     <div>
//                                                         <strong>{schedule.routes?.name_street}</strong>
//                                                     </div>
//                                                     <div style={{
//                                                         color: schedule.status === 'Vận hành' ? '#28a745' :
//                                                             schedule.status === 'Đã lên lịch' ? '#ffc107' : '#dc3545',
//                                                         fontSize: "10px",
//                                                         fontWeight: "bold"
//                                                     }}>
//                                                         {schedule.Stime}
//                                                     </div>
//                                                 </div>
//                                                 <div style={{
//                                                     color: schedule.status === 'Vận hành' ? '#28a745' :
//                                                         schedule.status === 'Đã lên lịch' ? '#ffc107' : '#dc3545',
//                                                     fontSize: "10px"
//                                                 }}>
//                                                     {schedule.status}
//                                                 </div>
//                                             </div>
//                                         ))
//                                     }
//                                 </div>
//                             )}
//                         </div>
//                     )} */}

//                     {/* <div style={{
//                         fontSize: "11px",
//                         color: "#666",
//                         fontStyle: "italic",
//                         marginTop: "8px",
//                         textAlign: "center"
//                     }}>
//                         {t("mapDriver.scheduleInfo.note")}
//                     </div> */}
//                 </div>
//             )}

//             {/* No schedule message */}
//             {!loading && !currentSchedule && (
//                 <div style={{
//                     position: "absolute",
//                     top: "50%",
//                     left: "50%",
//                     transform: "translate(-50%, -50%)",
//                     zIndex: 1000,
//                     backgroundColor: "white",
//                     padding: "25px",
//                     borderRadius: "10px",
//                     boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
//                     textAlign: "center",
//                     maxWidth: "450px"
//                 }}>
//                     <div style={{ fontSize: "20px", marginBottom: "10px", color: "#007bff" }}>
//                         📅 {t("mapDriver.noSchedule.title")}
//                     </div>
//                     <div style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>
//                         {t("mapDriver.noSchedule.description")}
//                     </div>

//                     <button
//                         onClick={handleRefresh}
//                         style={{
//                             background: "#007bff",
//                             border: "none",
//                             borderRadius: "6px",
//                             padding: "10px 20px",
//                             cursor: "pointer",
//                             color: "white",
//                             fontSize: "14px",
//                             fontWeight: "bold",
//                             marginBottom: "15px"
//                         }}
//                     >
//                         🔄 {t("mapDriver.noSchedule.tryAgain")}
//                     </button>

//                     {/* Gợi ý cho ngày mới */}
//                     <div style={{
//                         backgroundColor: "#e7f3ff",
//                         padding: "15px",
//                         borderRadius: "8px",
//                         border: "1px solid #b3d9ff"
//                     }}>
//                         <div style={{ fontSize: "14px", fontWeight: "bold", color: "#0066cc", marginBottom: "8px" }}>
//                             💡 {t("mapDriver.noSchedule.suggestions.title")}:
//                         </div>
//                         <div style={{ fontSize: "12px", color: "#004d99", textAlign: "left" }}>
//                             {t("mapDriver.noSchedule.suggestions.items")}
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Map container */}
//             <div
//                 ref={mapRef}
//                 style={{
//                     width: "100%",
//                     height: "100%",
//                     minHeight: "500px"
//                 }}
//             >
//                 {!mapReady && (
//                     <div style={{
//                         display: "flex",
//                         justifyContent: "center",
//                         alignItems: "center",
//                         height: "100%",
//                         backgroundColor: "#f5f5f5",
//                         color: "#666"
//                     }}>
//                         <div>🔄 {t("mapDriver.loading.initializingMap")}</div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Map_Driver;