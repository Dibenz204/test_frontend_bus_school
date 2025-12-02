import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { MapPin, Wifi, WifiOff, Users, Eye, EyeOff, RefreshCw, Route, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
const MARKER_COLORS = [
    'blue', 'red', 'green', 'orange', 'violet', 'yellow', 'grey', 'black'
];

const Observation = () => {
    const { t } = useTranslation();
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [drivers, setDrivers] = useState([]);
    const [visibleDrivers, setVisibleDrivers] = useState({});
    const [logs, setLogs] = useState([]);
    const [onlineDrivers, setOnlineDrivers] = useState({});
    const [selectedDriver, setSelectedDriver] = useState(null);
    // const [driverSchedule, setDriverSchedule] = useState(null);
    // const [routePolyline, setRoutePolyline] = useState(null);
    const mapRef = useRef(null);
    const markersRef = useRef({});
    const routeLayerRef = useRef(null);

    // ✅ FIX: Dùng ref để luôn có latest state
    const driversRef = useRef([]);
    const visibleDriversRef = useRef({});

    // ✅ Sync refs với state
    useEffect(() => {
        driversRef.current = drivers;
    }, [drivers]);

    useEffect(() => {
        visibleDriversRef.current = visibleDrivers;
    }, [visibleDrivers]);

    const addLog = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString('vi-VN');
        const id = Date.now() + Math.random(); // ✅ THÊM RANDOM ĐỂ TRÁNH TRÙNG

        setLogs(prev => [{
            id: id,
            time: timestamp,
            message,
            type
        }, ...prev].slice(0, 20));
    };

    // ========== FETCH DRIVER SCHEDULE & ROUTE ==========
    const fetchDriverSchedule = async (id_driver) => {
        try {
            const BACKEND_URL = window.location.hostname === 'localhost'
                ? 'http://localhost:5001'
                : 'https://be-bus-school.onrender.com';

            addLog(`🔄 ${t("observation.fetching_schedule", { driver: id_driver })}`, 'info');

            const response = await fetch(`${BACKEND_URL}/api/schedule/driver/${id_driver}`);
            const data = await response.json();

            if (data.errCode === 0 && data.schedule) {
                setDriverSchedule(data.schedule);
                addLog(`✅ ${t("observation.schedule_loaded", { driver: id_driver })}`, 'success');

                // Nếu có route, hiển thị trên map
                if (data.schedule.route_coordinates) {
                    displayRouteOnMap(data.schedule.route_coordinates);
                }

                return data.schedule;
            } else {
                addLog(`⚠️ ${t("observation.no_schedule_found", { driver: id_driver })}`, 'warning');
                return null;
            }
        } catch (error) {
            addLog(`❌ ${t("observation.schedule_error", { error: error.message })}`, 'error');
            return null;
        }
    };

    // ========== DISPLAY ROUTE WITH LEAFLET ROUTING MACHINE ==========
    const displayRouteWithRouting = (busStops) => {
        if (!mapRef.current || !window.L || !busStops || busStops.length === 0) {
            console.error('❌ Map not initialized or no bus stops');
            return;
        }

        const L = window.L;

        // Xóa route cũ
        if (routeLayerRef.current) {
            mapRef.current.removeControl(routeLayerRef.current);
            routeLayerRef.current = null;
        }

        try {
            console.log('🗺️ Creating route with bus stops:', busStops);

            // Tạo waypoints từ bus stops
            const waypoints = busStops.map(stop =>
                L.latLng(stop.coordinates[0], stop.coordinates[1])
            );

            // Tạo routing control
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
                        { color: '#3B82F6', opacity: 0.8, weight: 6 }
                    ]
                },
                createMarker: (i, waypoint, n) => {
                    // Tạo marker cho các điểm dừng
                    const isFirst = i === 0;
                    const isLast = i === n - 1;

                    let iconHtml = '';
                    if (isFirst) iconHtml = '🟢'; // Điểm bắt đầu
                    else if (isLast) iconHtml = '🔴'; // Điểm kết thúc
                    else iconHtml = '🔵'; // Điểm trung gian

                    const marker = L.marker(waypoint.latLng, {
                        icon: L.divIcon({
                            className: 'bus-stop-marker',
                            html: `
                            <div style="
                                background: ${isFirst ? '#10B981' : isLast ? '#EF4444' : '#3B82F6'}; 
                                color: white; 
                                border-radius: 50%; 
                                width: 30px; 
                                height: 30px; 
                                display: flex; 
                                align-items: center; 
                                justify-content: center;
                                font-weight: bold;
                                border: 3px solid white;
                                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                                font-size: 14px;
                            ">
                                ${isFirst ? 'S' : isLast ? 'E' : i}
                            </div>
                        `,
                            iconSize: [30, 30],
                            iconAnchor: [15, 15]
                        })
                    });

                    // Thêm popup cho điểm dừng
                    const stop = busStops[i];
                    marker.bindPopup(`
                    <div style="font-family: sans-serif; min-width: 200px;">
                        <strong>${isFirst ? '🟢' : isLast ? '🔴' : '🔵'} ${stop.name}</strong><br/>
                        <span style="font-size: 12px;">📍 ${t("observation.bus_stop")} ${stop.order}</span><br/>
                        <span style="font-size: 11px; color: #666;">${stop.address || t("observation.no_description")}</span>
                    </div>
                `);

                    return marker;
                }
            }).addTo(mapRef.current);

            // Ẩn control panel của routing machine
            const container = routingControl.getContainer();
            if (container) {
                container.style.display = 'none';
            }

            routeLayerRef.current = routingControl;

            // Fit map để hiển thị toàn bộ route
            const group = L.featureGroup(waypoints.map(wp => L.marker(wp.latLng)));
            mapRef.current.fitBounds(group.getBounds().pad(0.1));

            addLog(`🗺️ ${t("observation.route_drawn", { count: busStops.length })}`, 'success');

        } catch (error) {
            console.error('❌ Error displaying route with routing machine:', error);
            addLog(`❌ ${t("observation.route_error")}`, 'error');
        }
    };

    // ========== CLEAR ROUTE ==========
    const clearRoute = () => {
        if (routeLayerRef.current && mapRef.current) {
            mapRef.current.removeControl(routeLayerRef.current);
            routeLayerRef.current = null;
        }
    };

    // ========== UPDATE MARKER - useCallback để stable ==========
    const updateDriverMarker = useCallback((id_driver, toado_x, toado_y, driver_name, isSelected = false) => {
        if (!mapRef.current || !window.L) {
            return;
        }

        const L = window.L;

        // ✅ FIX: Dùng ref thay vì state
        const currentDrivers = driversRef.current;
        const driverIndex = currentDrivers.findIndex(d => d.id_driver === id_driver);
        const colorIndex = driverIndex >= 0 ? driverIndex % MARKER_COLORS.length : 0;
        const markerColor = MARKER_COLORS[colorIndex];

        try {
            if (!markersRef.current[id_driver]) {
                const icon = L.icon({
                    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${markerColor}.png`,
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: isSelected ? [35, 55] : [25, 41],
                    iconAnchor: isSelected ? [17, 55] : [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                });

                const marker = L.marker([toado_x, toado_y], { icon })
                    .addTo(mapRef.current)
                    .bindPopup(`
                        <div style="font-family: sans-serif;">
                            <strong style="font-size: 14px;">🚗 ${id_driver}</strong><br/>
                            <span style="font-size: 12px;">👤 ${driver_name || '${t("observation.unknown")}'}</span><br/>
                            <span style="font-size: 11px; color: #666;">📍 ${toado_x.toFixed(5)}, ${toado_y.toFixed(5)}</span>
                            ${isSelected ? `<br/><span style="font-size: 10px; color: #3B82F6;">📍 ${t("observation.tracking")}</span>` : ''}
                        </div>
                    `);

                markersRef.current[id_driver] = marker;
            } else {
                // ✅ FIX: Update ngay lập tức
                markersRef.current[id_driver].setLatLng([toado_x, toado_y]);

                // Update icon size nếu là driver được chọn
                if (isSelected) {
                    const icon = L.icon({
                        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${markerColor}.png`,
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                        iconSize: [35, 55],
                        iconAnchor: [17, 55],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                    });
                    markersRef.current[id_driver].setIcon(icon);
                }

                markersRef.current[id_driver].setPopupContent(`
                    <div style="font-family: sans-serif;">
                        <strong style="font-size: 14px;">🚗 ${id_driver}</strong><br/>
                        <span style="font-size: 12px;">👤 ${driver_name || '${t("observation.unknown")}'}</span><br/>
                        <span style="font-size: 11px; color: #666;">📍 ${toado_x.toFixed(5)}, ${toado_y.toFixed(5)}</span>
                        ${isSelected ? `<br/><span style="font-size: 10px; color: #3B82F6;">📍 ${t("observation.tracking")}</span>` : ''}
                    </div>
                `);
            }
        } catch (error) {
            console.error(`Error updating marker ${id_driver}:`, error);
        }
    }, []); // ✅ Empty deps vì dùng refs

    // ========== SELECT DRIVER ==========
    // const selectDriver = async (driver) => {
    //     // Clear previous selection
    //     if (selectedDriver && markersRef.current[selectedDriver.id_driver]) {
    //         updateDriverMarker(
    //             selectedDriver.id_driver,
    //             selectedDriver.toado_x,
    //             selectedDriver.toado_y,
    //             selectedDriver.driver_name,
    //             false
    //         );
    //     }

    //     setSelectedDriver(driver);

    //     // Update marker to show selection
    //     updateDriverMarker(
    //         driver.id_driver,
    //         driver.toado_x,
    //         driver.toado_y,
    //         driver.driver_name,
    //         true
    //     );

    //     // Center map on selected driver
    //     if (mapRef.current) {
    //         mapRef.current.setView([driver.toado_x, driver.toado_y], 15);
    //     }

    //     // Fetch and display schedule & route
    //     clearRoute();
    //     await fetchDriverSchedule(driver.id_driver);

    //     addLog(`📍 ${t("observation.tracking_driver", { driver: driver.id_driver, name: driver.driver_name })}`, 'success');
    // };

    // Trong AdminTrackingView.js - Sửa hàm selectDriver
    const selectDriver = async (driver) => {
        // Clear previous selection
        if (selectedDriver && markersRef.current[selectedDriver.id_driver]) {
            updateDriverMarker(
                selectedDriver.id_driver,
                selectedDriver.toado_x,
                selectedDriver.toado_y,
                selectedDriver.driver_name,
                false
            );
        }

        setSelectedDriver(driver);

        // Update marker to show selection
        updateDriverMarker(
            driver.id_driver,
            driver.toado_x,
            driver.toado_y,
            driver.driver_name,
            true
        );

        // Center map on selected driver
        if (mapRef.current) {
            mapRef.current.setView([driver.toado_x, driver.toado_y], 15);
        }

        // ✅ GỌI API CÓ SẴN VÀ DÙNG ROUTING MACHINE
        try {
            const BACKEND_URL = window.location.hostname === 'localhost'
                ? 'http://localhost:5001'
                : 'https://be-bus-school.onrender.com';

            addLog(`🔄 ${t("observation.fetching_schedule", { driver: driver.id_driver })}`, 'info');

            // API đã có sẵn: /api/schedule/get-schedule-by-driver
            const response = await fetch(`${BACKEND_URL}/api/schedule/get-schedule-by-driver?id_driver=${driver.id_driver}`);

            if (!response.ok) {
                addLog(`⚠️ ${t("observation.cannot_get_schedule", { driver: driver.id_driver })}`, 'warning');
                return;
            }

            const data = await response.json();

            console.log('📋 Schedule API Response:', data);

            if (data.errCode === 0 && data.data) {
                // ✅ SỬA: KIỂM TRA CẢ route_coordinates VÀ bus_stops
                if (data.data.bus_stops) {
                    // Nếu có bus_stops, dùng routing machine
                    displayRouteWithRouting(data.data.bus_stops);
                    addLog(`🗺️ ${t("observation.display_route_with_stops", { driver: driver.id_driver, count: data.data.bus_stops.length })}`, 'success');
                } else if (data.data.route_coordinates) {
                    // ✅ NẾU CHỈ CÓ route_coordinates, TẠO BUS STOPS TỪ ĐÓ
                    const mockBusStops = data.data.route_coordinates.map((coord, index) => ({
                        name: `${t("observation.bus_stop")} ${index + 1}`,
                        coordinates: coord,
                        order: index + 1,
                        address: `${t("observation.route_point", { number: index + 1 })}`
                    }));

                    displayRouteWithRouting(mockBusStops);
                    addLog(`🗺️ ${t("observation.display_route_with_points", { driver: driver.id_driver, count: mockBusStops.length })}`, 'success');
                } else {
                    addLog(`⚠️ ${t("observation.no_route_data", { driver: driver.id_driver })}`, 'warning');
                }

                // Hiển thị thông tin schedule
                if (data.data.route_name) {
                    addLog(`📅 ${t("observation.schedule_info", { route: data.data.route_name, time: data.data.Stime })}`, 'info');
                }
            } else {
                addLog(`⚠️ ${t("observation.no_schedule", { driver: driver.id_driver })}`, 'warning');
            }
        } catch (error) {
            console.log(`⚠️ ${t("observation.schedule_load_error", { error: error.message })}`);
            addLog(`❌ ${t("observation.schedule_load_failed")}`, 'error');
        }

        addLog(`📍 ${t("observation.tracking_driver_simple", { driver: driver.id_driver })}`, 'success');
    };

    // ========== UPDATE DRIVER LOCATION - useCallback ==========
    const updateDriverLocation = useCallback((data) => {
        const { id_driver, toado_x, toado_y, driver_name, driver_phone, timestamp } = data;

        setDrivers(prev => {
            const existing = prev.find(d => d.id_driver === id_driver);
            if (existing) {
                return prev.map(d =>
                    d.id_driver === id_driver
                        ? {
                            ...d,
                            toado_x,
                            toado_y,
                            driver_name: driver_name || d.driver_name,
                            driver_phone: driver_phone || d.driver_phone,
                            timestamp: timestamp || new Date().toISOString()
                        }
                        : d
                );
            }

            // ✅ FIX: Tự động set visible cho driver mới
            setVisibleDrivers(prevVisible => ({
                ...prevVisible,
                [id_driver]: true
            }));

            return [...prev, {
                id_driver,
                toado_x,
                toado_y,
                driver_name: driver_name || t("observation.unknown"),
                driver_phone: driver_phone || 'N/A',
                timestamp: timestamp || new Date().toISOString()
            }];
        });

        // ✅ FIX: Update marker ngay lập tức nếu visible
        setTimeout(() => {
            if (visibleDriversRef.current[id_driver]) {
                const isSelected = selectedDriver && selectedDriver.id_driver === id_driver;
                updateDriverMarker(id_driver, toado_x, toado_y, driver_name, isSelected);
            }
        }, 0);
    }, [updateDriverMarker, selectedDriver, t]);

    // ========== REMOVE MARKER ==========
    const removeDriverMarker = useCallback((id_driver) => {
        if (markersRef.current[id_driver] && mapRef.current) {
            mapRef.current.removeLayer(markersRef.current[id_driver]);
            delete markersRef.current[id_driver];
            addLog(`🗑️ ${t("observation.marker_removed", { driver: id_driver })}`, 'info');
        }
    }, [t]);

    // ========== SOCKET CONNECTION ==========
    useEffect(() => {
        const SOCKET_URL = window.location.hostname === 'localhost'
            ? 'http://localhost:5001'
            : 'https://be-bus-school.onrender.com';

        addLog(`🔌 ${t("observation.connecting_to_socket", { url: SOCKET_URL })}`, 'info');

        const socketInstance = io(`${SOCKET_URL}/gps`, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        socketInstance.on('connect', () => {
            addLog(`✅ ${t("observation.socket_connected", { id: socketInstance.id })}`, 'success');
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            addLog(`❌ ${t("observation.socket_disconnected")}`, 'error');
            setIsConnected(false);
        });

        // ✅ FIX: Listeners với stable callbacks
        socketInstance.on('driver-location-updated', (data) => {
            addLog(`📍 ${data.id_driver} ${t("observation.updated_location", { x: data.toado_x.toFixed(5), y: data.toado_y.toFixed(5) })}`, 'success');
            updateDriverLocation(data);
        });

        socketInstance.on('driver-status-changed', (data) => {
            addLog(`🔄 ${data.id_driver} GPS ${data.status ? 'ON' : 'OFF'}`, 'info');
            if (!data.status) {
                removeDriverMarker(data.id_driver);
                if (selectedDriver && selectedDriver.id_driver === data.id_driver) {
                    setSelectedDriver(null);
                    clearRoute();
                }
            }
        });

        socketInstance.on('driver-connected', (data) => {
            setOnlineDrivers(prev => ({ ...prev, [data.id_driver]: true }));
            addLog(`🟢 ${data.id_driver} ${t("observation.connected")}`, 'success');
        });

        socketInstance.on('driver-disconnected', (data) => {
            setOnlineDrivers(prev => ({ ...prev, [data.id_driver]: false }));
            removeDriverMarker(data.id_driver);
            if (selectedDriver && selectedDriver.id_driver === data.id_driver) {
                setSelectedDriver(null);
                clearRoute();
            }
            addLog(`🔴 ${data.id_driver} ${t("observation.disconnected")}`, 'error');
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [updateDriverLocation, removeDriverMarker, t]); // ✅ Đầy đủ deps

    // ========== INIT MAP ==========
    useEffect(() => {
        if (!mapRef.current && window.L) {
            const L = window.L;
            const map = L.map('map').setView([10.8231, 106.6297], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap'
            }).addTo(map);

            mapRef.current = map;
            addLog(`✅ ${t("observation.map_initialized")}`, 'success');
        }
    }, [t]);

    // ========== FETCH ALL DRIVERS ==========
    useEffect(() => {
        fetchAllDrivers();
    }, []);

    const fetchAllDrivers = async () => {
        try {
            const BACKEND_URL = window.location.hostname === 'localhost'
                ? 'http://localhost:5001'
                : 'https://be-bus-school.onrender.com';

            addLog(`🔄 ${t("observation.fetching_all_drivers")}`, 'info');
            const response = await fetch(`${BACKEND_URL}/api/driver/all-locations`);
            const data = await response.json();

            if (data.errCode === 0 && data.locations) {
                const driversWithVisibility = {};

                const mappedDrivers = data.locations.map(driver => ({
                    id_driver: driver.id_driver,
                    driver_name: driver.user?.name || t("observation.unknown"),
                    driver_phone: driver.user?.phone || 'N/A',
                    toado_x: driver.toado_x,
                    toado_y: driver.toado_y,
                    timestamp: driver.updatedAt || new Date().toISOString()
                }));

                setDrivers(mappedDrivers);

                mappedDrivers.forEach(driver => {
                    driversWithVisibility[driver.id_driver] = true;
                });
                setVisibleDrivers(driversWithVisibility);

                addLog(`✅ ${t("observation.drivers_loaded", { count: mappedDrivers.length })}`, 'success');

                // ✅ FIX: Delay nhỏ để đảm bảo state đã update
                setTimeout(() => {
                    mappedDrivers.forEach(driver => {
                        if (driver.toado_x && driver.toado_y) {
                            updateDriverMarker(driver.id_driver, driver.toado_x, driver.toado_y, driver.driver_name);
                        }
                    });
                }, 100);
            } else {
                addLog(`⚠️ ${t("observation.no_drivers_found")}`, 'error');
            }
        } catch (error) {
            addLog(`❌ ${t("observation.drivers_fetch_error", { error: error.message })}`, 'error');
        }
    };

    // ========== TOGGLE VISIBILITY ==========
    // const toggleDriverVisibility = (id_driver) => {
    //     setVisibleDrivers(prev => {
    //         const newVisibility = { ...prev, [id_driver]: !prev[id_driver] };

    //         if (!newVisibility[id_driver]) {
    //             removeDriverMarker(id_driver);
    //             if (selectedDriver && selectedDriver.id_driver === id_driver) {
    //                 setSelectedDriver(null);
    //                 clearRoute();
    //             }
    //         } else {
    //             const driver = driversRef.current.find(d => d.id_driver === id_driver);
    //             if (driver) {
    //                 const isSelected = selectedDriver && selectedDriver.id_driver === id_driver;
    //                 updateDriverMarker(id_driver, driver.toado_x, driver.toado_y, driver.driver_name, isSelected);
    //             }
    //         }

    //         return newVisibility;
    //     });
    // };
    const toggleDriverVisibility = (id_driver, e) => {
        e.stopPropagation(); // ✅ QUAN TRỌNG: Ngăn không bubble lên card

        setVisibleDrivers(prev => {
            const newVisibility = { ...prev, [id_driver]: !prev[id_driver] };

            if (!newVisibility[id_driver]) {
                removeDriverMarker(id_driver);
                if (selectedDriver && selectedDriver.id_driver === id_driver) {
                    setSelectedDriver(null);
                    clearRoute();
                }
            } else {
                const driver = driversRef.current.find(d => d.id_driver === id_driver);
                if (driver) {
                    const isSelected = selectedDriver && selectedDriver.id_driver === id_driver;
                    updateDriverMarker(id_driver, driver.toado_x, driver.toado_y, driver.driver_name, isSelected);
                }
            }

            return newVisibility;
        });
    };

    const toggleAllDrivers = (show) => {
        const newVisibility = {};
        const currentDrivers = driversRef.current;

        currentDrivers.forEach(driver => {
            newVisibility[driver.id_driver] = show;

            if (!show) {
                removeDriverMarker(driver.id_driver);
                // ❌ KHÔNG clear selected driver khi toggle all
                // if (selectedDriver && selectedDriver.id_driver === driver.id_driver) {
                //     setSelectedDriver(null);
                //     clearRoute();
                // }
            } else {
                const isSelected = selectedDriver && selectedDriver.id_driver === driver.id_driver;
                updateDriverMarker(driver.id_driver, driver.toado_x, driver.toado_y, driver.driver_name, isSelected);
            }
        });
        setVisibleDrivers(newVisibility);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* ĐÃ XÓA HEADER Ở ĐÂY */}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Selected Driver Info */}
                        {selectedDriver && (
                            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-500">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
                                    <Route className="text-blue-600" size={24} />
                                    {t("observation.currently_tracking")}
                                </h2>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                                        <p className="font-bold text-gray-800">{selectedDriver.id_driver}</p>
                                    </div>

                                    <p className="text-sm text-gray-700">
                                        👤 {selectedDriver.driver_name}
                                    </p>

                                    <p className="text-xs text-gray-600 font-mono">
                                        📍 {selectedDriver.toado_x?.toFixed(5)}, {selectedDriver.toado_y?.toFixed(5)}
                                    </p>

                                    <button
                                        onClick={() => {
                                            setSelectedDriver(null);
                                            clearRoute();
                                        }}
                                        className="w-full mt-3 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                                    >
                                        {t("observation.stop_tracking")}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Drivers List */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <Users size={24} className="text-purple-600" />
                                    {t("observation.drivers")} ({drivers.length})
                                </h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toggleAllDrivers(true)}
                                        className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                                        title={t("observation.show_all")}
                                    >
                                        <Eye size={14} />
                                    </button>
                                    <button
                                        onClick={() => toggleAllDrivers(false)}
                                        className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                        title={t("observation.hide_all")}
                                    >
                                        <EyeOff size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {drivers.length === 0 ? (
                                    <p className="text-gray-500 text-sm">{t("observation.no_drivers_online")}</p>
                                ) : (
                                    drivers.map((driver, index) => {
                                        const colorIndex = index % MARKER_COLORS.length;
                                        const markerColor = MARKER_COLORS[colorIndex];
                                        const isSelected = selectedDriver && selectedDriver.id_driver === driver.id_driver;

                                        return (
                                            <div
                                                key={driver.id_driver}
                                                className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${selectedDriver?.id_driver === driver.id_driver
                                                    ? 'bg-gradient-to-r from-blue-100 to-blue-200 border-blue-500 shadow-md'
                                                    : visibleDrivers[driver.id_driver]
                                                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300'
                                                        : 'bg-gray-50 border-gray-200 opacity-50'
                                                    }`}
                                                onClick={() => selectDriver(driver)} // ✅ Click card → select driver
                                            >
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={visibleDrivers[driver.id_driver] || false}
                                                        onChange={(e) => toggleDriverVisibility(driver.id_driver, e)} // ✅ Thêm event
                                                        className="mt-1 w-4 h-4 cursor-pointer"
                                                    />

                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-3 h-3 rounded-full ${onlineDrivers[driver.id_driver] ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                                                                }`}></div>

                                                            <div
                                                                className="w-3 h-3 rounded-full"
                                                                style={{
                                                                    backgroundColor: markerColor === 'grey' ? '#999' : markerColor
                                                                }}
                                                            ></div>

                                                            <p className="font-bold text-gray-800">{driver.id_driver}</p>
                                                            {isSelected && (
                                                                <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                                                                    {t("observation.selected")}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <p className="text-sm text-gray-700 mt-1">
                                                            👤 {driver.driver_name}
                                                        </p>
                                                        <p className="text-xs text-gray-600 font-mono mt-1">
                                                            📍 {driver.toado_x?.toFixed(5)}, {driver.toado_y?.toFixed(5)}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            🕒 {driver.timestamp ? new Date(driver.timestamp).toLocaleTimeString('vi-VN') : 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Debug Logs */}
                        {/* <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-3">Debug Logs</h2>
                            <div className="space-y-1 max-h-64 overflow-y-auto text-xs font-mono">
                                {logs.length === 0 ? (
                                    <p className="text-gray-500">No logs yet...</p>
                                ) : (
                                    logs.map((log) => (
                                        <div
                                            key={log.id} // ✅ ĐẢM BẢO DÙNG id CỦA LOG
                                            className={`p-2 rounded ${log.type === 'success' ? 'bg-green-50 text-green-800' :
                                                log.type === 'error' ? 'bg-red-50 text-red-800' :
                                                    'bg-gray-50 text-gray-800'
                                                }`}
                                        >
                                            <span className="text-gray-500">[{log.time}]</span> {log.message}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div> */}
                    </div>

                    {/* Map */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-lg p-6 h-[800px]">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                {/* <MapPin size={24} className="text-red-600" /> */}
                                {/* Tracking Map */}
                                {selectedDriver && (
                                    <span className="text-sm font-normal text-blue-600 ml-2">
                                        📍 {t("observation.tracking")}: {selectedDriver.driver_name}
                                    </span>
                                )}
                            </h2>
                            <div id="map" className="w-full h-[720px] rounded-lg"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Observation;

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { io } from 'socket.io-client';
// import { MapPin, Wifi, WifiOff, Users, Eye, EyeOff, RefreshCw, Route, Clock } from 'lucide-react';

// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
// import 'leaflet-routing-machine';

// // Fix Leaflet default icons
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//     iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
//     iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
//     shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
// });
// const MARKER_COLORS = [
//     'blue', 'red', 'green', 'orange', 'violet', 'yellow', 'grey', 'black'
// ];

// const Observation = () => {
//     const [socket, setSocket] = useState(null);
//     const [isConnected, setIsConnected] = useState(false);
//     const [drivers, setDrivers] = useState([]);
//     const [visibleDrivers, setVisibleDrivers] = useState({});
//     const [logs, setLogs] = useState([]);
//     const [onlineDrivers, setOnlineDrivers] = useState({});
//     const [selectedDriver, setSelectedDriver] = useState(null);
//     // const [driverSchedule, setDriverSchedule] = useState(null);
//     // const [routePolyline, setRoutePolyline] = useState(null);
//     const mapRef = useRef(null);
//     const markersRef = useRef({});
//     const routeLayerRef = useRef(null);

//     // ✅ FIX: Dùng ref để luôn có latest state
//     const driversRef = useRef([]);
//     const visibleDriversRef = useRef({});

//     // ✅ Sync refs với state
//     useEffect(() => {
//         driversRef.current = drivers;
//     }, [drivers]);

//     useEffect(() => {
//         visibleDriversRef.current = visibleDrivers;
//     }, [visibleDrivers]);

//     const addLog = (message, type = 'info') => {
//         const timestamp = new Date().toLocaleTimeString('vi-VN');
//         const id = Date.now() + Math.random(); // ✅ THÊM RANDOM ĐỂ TRÁNH TRÙNG

//         setLogs(prev => [{
//             id: id,
//             time: timestamp,
//             message,
//             type
//         }, ...prev].slice(0, 20));
//     };

//     // ========== FETCH DRIVER SCHEDULE & ROUTE ==========
//     const fetchDriverSchedule = async (id_driver) => {
//         try {
//             const BACKEND_URL = window.location.hostname === 'localhost'
//                 ? 'http://localhost:5001'
//                 : 'https://be-bus-school.onrender.com';

//             addLog(`🔄 Fetching schedule for ${id_driver}...`, 'info');

//             const response = await fetch(`${BACKEND_URL}/api/schedule/driver/${id_driver}`);
//             const data = await response.json();

//             if (data.errCode === 0 && data.schedule) {
//                 setDriverSchedule(data.schedule);
//                 addLog(`✅ Loaded schedule for ${id_driver}`, 'success');

//                 // Nếu có route, hiển thị trên map
//                 if (data.schedule.route_coordinates) {
//                     displayRouteOnMap(data.schedule.route_coordinates);
//                 }

//                 return data.schedule;
//             } else {
//                 addLog(`⚠️ No schedule found for ${id_driver}`, 'warning');
//                 return null;
//             }
//         } catch (error) {
//             addLog(`❌ Error fetching schedule: ${error.message}`, 'error');
//             return null;
//         }
//     };

//     // ========== DISPLAY ROUTE WITH LEAFLET ROUTING MACHINE ==========
//     const displayRouteWithRouting = (busStops) => {
//         if (!mapRef.current || !window.L || !busStops || busStops.length === 0) {
//             console.error('❌ Map not initialized or no bus stops');
//             return;
//         }

//         const L = window.L;

//         // Xóa route cũ
//         if (routeLayerRef.current) {
//             mapRef.current.removeControl(routeLayerRef.current);
//             routeLayerRef.current = null;
//         }

//         try {
//             console.log('🗺️ Creating route with bus stops:', busStops);

//             // Tạo waypoints từ bus stops
//             const waypoints = busStops.map(stop =>
//                 L.latLng(stop.coordinates[0], stop.coordinates[1])
//             );

//             // Tạo routing control
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
//                         { color: '#3B82F6', opacity: 0.8, weight: 6 }
//                     ]
//                 },
//                 createMarker: (i, waypoint, n) => {
//                     // Tạo marker cho các điểm dừng
//                     const isFirst = i === 0;
//                     const isLast = i === n - 1;

//                     let iconHtml = '';
//                     if (isFirst) iconHtml = '🟢'; // Điểm bắt đầu
//                     else if (isLast) iconHtml = '🔴'; // Điểm kết thúc
//                     else iconHtml = '🔵'; // Điểm trung gian

//                     const marker = L.marker(waypoint.latLng, {
//                         icon: L.divIcon({
//                             className: 'bus-stop-marker',
//                             html: `
//                             <div style="
//                                 background: ${isFirst ? '#10B981' : isLast ? '#EF4444' : '#3B82F6'};
//                                 color: white;
//                                 border-radius: 50%;
//                                 width: 30px;
//                                 height: 30px;
//                                 display: flex;
//                                 align-items: center;
//                                 justify-content: center;
//                                 font-weight: bold;
//                                 border: 3px solid white;
//                                 box-shadow: 0 2px 4px rgba(0,0,0,0.2);
//                                 font-size: 14px;
//                             ">
//                                 ${isFirst ? 'S' : isLast ? 'E' : i}
//                             </div>
//                         `,
//                             iconSize: [30, 30],
//                             iconAnchor: [15, 15]
//                         })
//                     });

//                     // Thêm popup cho điểm dừng
//                     const stop = busStops[i];
//                     marker.bindPopup(`
//                     <div style="font-family: sans-serif; min-width: 200px;">
//                         <strong>${isFirst ? '🟢' : isLast ? '🔴' : '🔵'} ${stop.name}</strong><br/>
//                         <span style="font-size: 12px;">📍 Điểm dừng ${stop.order}</span><br/>
//                         <span style="font-size: 11px; color: #666;">${stop.address || 'Không có mô tả'}</span>
//                     </div>
//                 `);

//                     return marker;
//                 }
//             }).addTo(mapRef.current);

//             // Ẩn control panel của routing machine
//             const container = routingControl.getContainer();
//             if (container) {
//                 container.style.display = 'none';
//             }

//             routeLayerRef.current = routingControl;

//             // Fit map để hiển thị toàn bộ route
//             const group = L.featureGroup(waypoints.map(wp => L.marker(wp.latLng)));
//             mapRef.current.fitBounds(group.getBounds().pad(0.1));

//             addLog(`🗺️ Đã vẽ tuyến đường với ${busStops.length} điểm dừng`, 'success');

//         } catch (error) {
//             console.error('❌ Error displaying route with routing machine:', error);
//             addLog('❌ Lỗi khi vẽ tuyến đường', 'error');
//         }
//     };

//     // ========== CLEAR ROUTE ==========
//     const clearRoute = () => {
//         if (routeLayerRef.current && mapRef.current) {
//             mapRef.current.removeControl(routeLayerRef.current);
//             routeLayerRef.current = null;
//         }
//     };

//     // ========== UPDATE MARKER - useCallback để stable ==========
//     const updateDriverMarker = useCallback((id_driver, toado_x, toado_y, driver_name, isSelected = false) => {
//         if (!mapRef.current || !window.L) {
//             return;
//         }

//         const L = window.L;

//         // ✅ FIX: Dùng ref thay vì state
//         const currentDrivers = driversRef.current;
//         const driverIndex = currentDrivers.findIndex(d => d.id_driver === id_driver);
//         const colorIndex = driverIndex >= 0 ? driverIndex % MARKER_COLORS.length : 0;
//         const markerColor = MARKER_COLORS[colorIndex];

//         try {
//             if (!markersRef.current[id_driver]) {
//                 const icon = L.icon({
//                     iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${markerColor}.png`,
//                     shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
//                     iconSize: isSelected ? [35, 55] : [25, 41],
//                     iconAnchor: isSelected ? [17, 55] : [12, 41],
//                     popupAnchor: [1, -34],
//                     shadowSize: [41, 41]
//                 });

//                 const marker = L.marker([toado_x, toado_y], { icon })
//                     .addTo(mapRef.current)
//                     .bindPopup(`
//                         <div style="font-family: sans-serif;">
//                             <strong style="font-size: 14px;">🚗 ${id_driver}</strong><br/>
//                             <span style="font-size: 12px;">👤 ${driver_name || 'Unknown'}</span><br/>
//                             <span style="font-size: 11px; color: #666;">📍 ${toado_x.toFixed(5)}, ${toado_y.toFixed(5)}</span>
//                             ${isSelected ? '<br/><span style="font-size: 10px; color: #3B82F6;">📍 Đang theo dõi</span>' : ''}
//                         </div>
//                     `);

//                 markersRef.current[id_driver] = marker;
//             } else {
//                 // ✅ FIX: Update ngay lập tức
//                 markersRef.current[id_driver].setLatLng([toado_x, toado_y]);

//                 // Update icon size nếu là driver được chọn
//                 if (isSelected) {
//                     const icon = L.icon({
//                         iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${markerColor}.png`,
//                         shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
//                         iconSize: [35, 55],
//                         iconAnchor: [17, 55],
//                         popupAnchor: [1, -34],
//                         shadowSize: [41, 41]
//                     });
//                     markersRef.current[id_driver].setIcon(icon);
//                 }

//                 markersRef.current[id_driver].setPopupContent(`
//                     <div style="font-family: sans-serif;">
//                         <strong style="font-size: 14px;">🚗 ${id_driver}</strong><br/>
//                         <span style="font-size: 12px;">👤 ${driver_name || 'Unknown'}</span><br/>
//                         <span style="font-size: 11px; color: #666;">📍 ${toado_x.toFixed(5)}, ${toado_y.toFixed(5)}</span>
//                         ${isSelected ? '<br/><span style="font-size: 10px; color: #3B82F6;">📍 Đang theo dõi</span>' : ''}
//                     </div>
//                 `);
//             }
//         } catch (error) {
//             console.error(`Error updating marker ${id_driver}:`, error);
//         }
//     }, []); // ✅ Empty deps vì dùng refs

//     // ========== SELECT DRIVER ==========
//     // const selectDriver = async (driver) => {
//     //     // Clear previous selection
//     //     if (selectedDriver && markersRef.current[selectedDriver.id_driver]) {
//     //         updateDriverMarker(
//     //             selectedDriver.id_driver,
//     //             selectedDriver.toado_x,
//     //             selectedDriver.toado_y,
//     //             selectedDriver.driver_name,
//     //             false
//     //         );
//     //     }

//     //     setSelectedDriver(driver);

//     //     // Update marker to show selection
//     //     updateDriverMarker(
//     //         driver.id_driver,
//     //         driver.toado_x,
//     //         driver.toado_y,
//     //         driver.driver_name,
//     //         true
//     //     );

//     //     // Center map on selected driver
//     //     if (mapRef.current) {
//     //         mapRef.current.setView([driver.toado_x, driver.toado_y], 15);
//     //     }

//     //     // Fetch and display schedule & route
//     //     clearRoute();
//     //     await fetchDriverSchedule(driver.id_driver);

//     //     addLog(`📍 Đang theo dõi tài xế ${driver.id_driver} - ${driver.driver_name}`, 'success');
//     // };

//     // Trong AdminTrackingView.js - Sửa hàm selectDriver
//     const selectDriver = async (driver) => {
//         // Clear previous selection
//         if (selectedDriver && markersRef.current[selectedDriver.id_driver]) {
//             updateDriverMarker(
//                 selectedDriver.id_driver,
//                 selectedDriver.toado_x,
//                 selectedDriver.toado_y,
//                 selectedDriver.driver_name,
//                 false
//             );
//         }

//         setSelectedDriver(driver);

//         // Update marker to show selection
//         updateDriverMarker(
//             driver.id_driver,
//             driver.toado_x,
//             driver.toado_y,
//             driver.driver_name,
//             true
//         );

//         // Center map on selected driver
//         if (mapRef.current) {
//             mapRef.current.setView([driver.toado_x, driver.toado_y], 15);
//         }

//         // ✅ GỌI API CÓ SẴN VÀ DÙNG ROUTING MACHINE
//         try {
//             const BACKEND_URL = window.location.hostname === 'localhost'
//                 ? 'http://localhost:5001'
//                 : 'https://be-bus-school.onrender.com';

//             addLog(`🔄 Fetching schedule for ${driver.id_driver}...`, 'info');

//             // API đã có sẵn: /api/schedule/get-schedule-by-driver
//             const response = await fetch(`${BACKEND_URL}/api/schedule/get-schedule-by-driver?id_driver=${driver.id_driver}`);

//             if (!response.ok) {
//                 addLog(`⚠️ Không thể lấy schedule cho ${driver.id_driver}`, 'warning');
//                 return;
//             }

//             const data = await response.json();

//             console.log('📋 Schedule API Response:', data);

//             if (data.errCode === 0 && data.data) {
//                 // ✅ SỬA: KIỂM TRA CẢ route_coordinates VÀ bus_stops
//                 if (data.data.bus_stops) {
//                     // Nếu có bus_stops, dùng routing machine
//                     displayRouteWithRouting(data.data.bus_stops);
//                     addLog(`🗺️ Hiển thị tuyến đường cho ${driver.id_driver} với ${data.data.bus_stops.length} điểm dừng`, 'success');
//                 } else if (data.data.route_coordinates) {
//                     // ✅ NẾU CHỈ CÓ route_coordinates, TẠO BUS STOPS TỪ ĐÓ
//                     const mockBusStops = data.data.route_coordinates.map((coord, index) => ({
//                         name: `Điểm dừng ${index + 1}`,
//                         coordinates: coord,
//                         order: index + 1,
//                         address: `Điểm thứ ${index + 1} trên tuyến đường`
//                     }));

//                     displayRouteWithRouting(mockBusStops);
//                     addLog(`🗺️ Hiển thị tuyến đường cho ${driver.id_driver} với ${mockBusStops.length} điểm`, 'success');
//                 } else {
//                     addLog(`⚠️ Không có dữ liệu tuyến đường cho ${driver.id_driver}`, 'warning');
//                 }

//                 // Hiển thị thông tin schedule
//                 if (data.data.route_name) {
//                     addLog(`📅 Lịch trình: ${data.data.route_name} - ${data.data.Stime}`, 'info');
//                 }
//             } else {
//                 addLog(`⚠️ Không có schedule cho ${driver.id_driver}`, 'warning');
//             }
//         } catch (error) {
//             console.log(`⚠️ Lỗi khi load schedule: ${error.message}`);
//             addLog(`❌ Lỗi khi tải lịch trình`, 'error');
//         }

//         addLog(`📍 Đang theo dõi tài xế ${driver.id_driver}`, 'success');
//     };

//     // ========== UPDATE DRIVER LOCATION - useCallback ==========
//     const updateDriverLocation = useCallback((data) => {
//         const { id_driver, toado_x, toado_y, driver_name, driver_phone, timestamp } = data;

//         setDrivers(prev => {
//             const existing = prev.find(d => d.id_driver === id_driver);
//             if (existing) {
//                 return prev.map(d =>
//                     d.id_driver === id_driver
//                         ? {
//                             ...d,
//                             toado_x,
//                             toado_y,
//                             driver_name: driver_name || d.driver_name,
//                             driver_phone: driver_phone || d.driver_phone,
//                             timestamp: timestamp || new Date().toISOString()
//                         }
//                         : d
//                 );
//             }

//             // ✅ FIX: Tự động set visible cho driver mới
//             setVisibleDrivers(prevVisible => ({
//                 ...prevVisible,
//                 [id_driver]: true
//             }));

//             return [...prev, {
//                 id_driver,
//                 toado_x,
//                 toado_y,
//                 driver_name: driver_name || 'Unknown',
//                 driver_phone: driver_phone || 'N/A',
//                 timestamp: timestamp || new Date().toISOString()
//             }];
//         });

//         // ✅ FIX: Update marker ngay lập tức nếu visible
//         setTimeout(() => {
//             if (visibleDriversRef.current[id_driver]) {
//                 const isSelected = selectedDriver && selectedDriver.id_driver === id_driver;
//                 updateDriverMarker(id_driver, toado_x, toado_y, driver_name, isSelected);
//             }
//         }, 0);
//     }, [updateDriverMarker, selectedDriver]);

//     // ========== REMOVE MARKER ==========
//     const removeDriverMarker = useCallback((id_driver) => {
//         if (markersRef.current[id_driver] && mapRef.current) {
//             mapRef.current.removeLayer(markersRef.current[id_driver]);
//             delete markersRef.current[id_driver];
//             addLog(`🗑️ Removed marker for ${id_driver}`, 'info');
//         }
//     }, []);

//     // ========== SOCKET CONNECTION ==========
//     useEffect(() => {
//         const SOCKET_URL = window.location.hostname === 'localhost'
//             ? 'http://localhost:5001'
//             : 'https://be-bus-school.onrender.com';

//         addLog(`🔌 Connecting to ${SOCKET_URL}/gps...`, 'info');

//         const socketInstance = io(`${SOCKET_URL}/gps`, {
//             transports: ['websocket', 'polling'],
//             reconnection: true,
//             reconnectionDelay: 1000,
//             reconnectionAttempts: 5
//         });

//         socketInstance.on('connect', () => {
//             addLog(`✅ Socket connected: ${socketInstance.id}`, 'success');
//             setIsConnected(true);
//         });

//         socketInstance.on('disconnect', () => {
//             addLog('❌ Socket disconnected', 'error');
//             setIsConnected(false);
//         });

//         // ✅ FIX: Listeners với stable callbacks
//         socketInstance.on('driver-location-updated', (data) => {
//             addLog(`📍 ${data.id_driver} updated: [${data.toado_x.toFixed(5)}, ${data.toado_y.toFixed(5)}]`, 'success');
//             updateDriverLocation(data);
//         });

//         socketInstance.on('driver-status-changed', (data) => {
//             addLog(`🔄 ${data.id_driver} GPS ${data.status ? 'ON' : 'OFF'}`, 'info');
//             if (!data.status) {
//                 removeDriverMarker(data.id_driver);
//                 if (selectedDriver && selectedDriver.id_driver === data.id_driver) {
//                     setSelectedDriver(null);
//                     clearRoute();
//                 }
//             }
//         });

//         socketInstance.on('driver-connected', (data) => {
//             setOnlineDrivers(prev => ({ ...prev, [data.id_driver]: true }));
//             addLog(`🟢 ${data.id_driver} connected`, 'success');
//         });

//         socketInstance.on('driver-disconnected', (data) => {
//             setOnlineDrivers(prev => ({ ...prev, [data.id_driver]: false }));
//             removeDriverMarker(data.id_driver);
//             if (selectedDriver && selectedDriver.id_driver === data.id_driver) {
//                 setSelectedDriver(null);
//                 clearRoute();
//             }
//             addLog(`🔴 ${data.id_driver} disconnected`, 'error');
//         });

//         setSocket(socketInstance);

//         return () => {
//             socketInstance.disconnect();
//         };
//     }, [updateDriverLocation, removeDriverMarker]); // ✅ Đầy đủ deps

//     // ========== INIT MAP ==========
//     useEffect(() => {
//         if (!mapRef.current && window.L) {
//             const L = window.L;
//             const map = L.map('map').setView([10.8231, 106.6297], 13);
//             L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//                 attribution: '© OpenStreetMap'
//             }).addTo(map);

//             mapRef.current = map;
//             addLog('✅ Map initialized', 'success');
//         }
//     }, []);

//     // ========== FETCH ALL DRIVERS ==========
//     useEffect(() => {
//         fetchAllDrivers();
//     }, []);

//     const fetchAllDrivers = async () => {
//         try {
//             const BACKEND_URL = window.location.hostname === 'localhost'
//                 ? 'http://localhost:5001'
//                 : 'https://be-bus-school.onrender.com';

//             addLog('🔄 Fetching all drivers...', 'info');
//             const response = await fetch(`${BACKEND_URL}/api/driver/all-locations`);
//             const data = await response.json();

//             if (data.errCode === 0 && data.locations) {
//                 const driversWithVisibility = {};

//                 const mappedDrivers = data.locations.map(driver => ({
//                     id_driver: driver.id_driver,
//                     driver_name: driver.user?.name || 'Unknown',
//                     driver_phone: driver.user?.phone || 'N/A',
//                     toado_x: driver.toado_x,
//                     toado_y: driver.toado_y,
//                     timestamp: driver.updatedAt || new Date().toISOString()
//                 }));

//                 setDrivers(mappedDrivers);

//                 mappedDrivers.forEach(driver => {
//                     driversWithVisibility[driver.id_driver] = true;
//                 });
//                 setVisibleDrivers(driversWithVisibility);

//                 addLog(`✅ Loaded ${mappedDrivers.length} drivers`, 'success');

//                 // ✅ FIX: Delay nhỏ để đảm bảo state đã update
//                 setTimeout(() => {
//                     mappedDrivers.forEach(driver => {
//                         if (driver.toado_x && driver.toado_y) {
//                             updateDriverMarker(driver.id_driver, driver.toado_x, driver.toado_y, driver.driver_name);
//                         }
//                     });
//                 }, 100);
//             } else {
//                 addLog(`⚠️ No drivers found`, 'error');
//             }
//         } catch (error) {
//             addLog(`❌ Error fetching drivers: ${error.message}`, 'error');
//         }
//     };

//     // ========== TOGGLE VISIBILITY ==========
//     // const toggleDriverVisibility = (id_driver) => {
//     //     setVisibleDrivers(prev => {
//     //         const newVisibility = { ...prev, [id_driver]: !prev[id_driver] };

//     //         if (!newVisibility[id_driver]) {
//     //             removeDriverMarker(id_driver);
//     //             if (selectedDriver && selectedDriver.id_driver === id_driver) {
//     //                 setSelectedDriver(null);
//     //                 clearRoute();
//     //             }
//     //         } else {
//     //             const driver = driversRef.current.find(d => d.id_driver === id_driver);
//     //             if (driver) {
//     //                 const isSelected = selectedDriver && selectedDriver.id_driver === id_driver;
//     //                 updateDriverMarker(id_driver, driver.toado_x, driver.toado_y, driver.driver_name, isSelected);
//     //             }
//     //         }

//     //         return newVisibility;
//     //     });
//     // };
//     const toggleDriverVisibility = (id_driver, e) => {
//         e.stopPropagation(); // ✅ QUAN TRỌNG: Ngăn không bubble lên card

//         setVisibleDrivers(prev => {
//             const newVisibility = { ...prev, [id_driver]: !prev[id_driver] };

//             if (!newVisibility[id_driver]) {
//                 removeDriverMarker(id_driver);
//                 if (selectedDriver && selectedDriver.id_driver === id_driver) {
//                     setSelectedDriver(null);
//                     clearRoute();
//                 }
//             } else {
//                 const driver = driversRef.current.find(d => d.id_driver === id_driver);
//                 if (driver) {
//                     const isSelected = selectedDriver && selectedDriver.id_driver === id_driver;
//                     updateDriverMarker(id_driver, driver.toado_x, driver.toado_y, driver.driver_name, isSelected);
//                 }
//             }

//             return newVisibility;
//         });
//     };

//     const toggleAllDrivers = (show) => {
//         const newVisibility = {};
//         const currentDrivers = driversRef.current;

//         currentDrivers.forEach(driver => {
//             newVisibility[driver.id_driver] = show;

//             if (!show) {
//                 removeDriverMarker(driver.id_driver);
//                 // ❌ KHÔNG clear selected driver khi toggle all
//                 // if (selectedDriver && selectedDriver.id_driver === driver.id_driver) {
//                 //     setSelectedDriver(null);
//                 //     clearRoute();
//                 // }
//             } else {
//                 const isSelected = selectedDriver && selectedDriver.id_driver === driver.id_driver;
//                 updateDriverMarker(driver.id_driver, driver.toado_x, driver.toado_y, driver.driver_name, isSelected);
//             }
//         });
//         setVisibleDrivers(newVisibility);
//     };

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-6">
//             <div className="max-w-7xl mx-auto">
//                 {/* ĐÃ XÓA HEADER Ở ĐÂY */}

//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                     {/* Sidebar */}
//                     <div className="lg:col-span-1 space-y-6">
//                         {/* Selected Driver Info */}
//                         {selectedDriver && (
//                             <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-500">
//                                 <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
//                                     <Route className="text-blue-600" size={24} />
//                                     Đang theo dõi
//                                 </h2>

//                                 <div className="space-y-3">
//                                     <div className="flex items-center gap-2">
//                                         <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
//                                         <p className="font-bold text-gray-800">{selectedDriver.id_driver}</p>
//                                     </div>

//                                     <p className="text-sm text-gray-700">
//                                         👤 {selectedDriver.driver_name}
//                                     </p>

//                                     <p className="text-xs text-gray-600 font-mono">
//                                         📍 {selectedDriver.toado_x?.toFixed(5)}, {selectedDriver.toado_y?.toFixed(5)}
//                                     </p>

//                                     <button
//                                         onClick={() => {
//                                             setSelectedDriver(null);
//                                             clearRoute();
//                                         }}
//                                         className="w-full mt-3 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
//                                     >
//                                         Dừng theo dõi
//                                     </button>
//                                 </div>
//                             </div>
//                         )}

//                         {/* Drivers List */}
//                         <div className="bg-white rounded-xl shadow-lg p-6">
//                             <div className="flex items-center justify-between mb-4">
//                                 <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
//                                     <Users size={24} className="text-purple-600" />
//                                     Drivers ({drivers.length})
//                                 </h2>
//                                 <div className="flex gap-2">
//                                     <button
//                                         onClick={() => toggleAllDrivers(true)}
//                                         className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
//                                         title="Show all"
//                                     >
//                                         <Eye size={14} />
//                                     </button>
//                                     <button
//                                         onClick={() => toggleAllDrivers(false)}
//                                         className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
//                                         title="Hide all"
//                                     >
//                                         <EyeOff size={14} />
//                                     </button>
//                                 </div>
//                             </div>

//                             <div className="space-y-2 max-h-96 overflow-y-auto">
//                                 {drivers.length === 0 ? (
//                                     <p className="text-gray-500 text-sm">No drivers online</p>
//                                 ) : (
//                                     drivers.map((driver, index) => {
//                                         const colorIndex = index % MARKER_COLORS.length;
//                                         const markerColor = MARKER_COLORS[colorIndex];
//                                         const isSelected = selectedDriver && selectedDriver.id_driver === driver.id_driver;

//                                         return (
//                                             <div
//                                                 key={driver.id_driver}
//                                                 className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${selectedDriver?.id_driver === driver.id_driver
//                                                     ? 'bg-gradient-to-r from-blue-100 to-blue-200 border-blue-500 shadow-md'
//                                                     : visibleDrivers[driver.id_driver]
//                                                         ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300'
//                                                         : 'bg-gray-50 border-gray-200 opacity-50'
//                                                     }`}
//                                                 onClick={() => selectDriver(driver)} // ✅ Click card → select driver
//                                             >
//                                                 <div className="flex items-start gap-3">
//                                                     <input
//                                                         type="checkbox"
//                                                         checked={visibleDrivers[driver.id_driver] || false}
//                                                         onChange={(e) => toggleDriverVisibility(driver.id_driver, e)} // ✅ Thêm event
//                                                         className="mt-1 w-4 h-4 cursor-pointer"
//                                                     />

//                                                     <div className="flex-1">
//                                                         <div className="flex items-center gap-2">
//                                                             <div className={`w-3 h-3 rounded-full ${onlineDrivers[driver.id_driver] ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
//                                                                 }`}></div>

//                                                             <div
//                                                                 className="w-3 h-3 rounded-full"
//                                                                 style={{
//                                                                     backgroundColor: markerColor === 'grey' ? '#999' : markerColor
//                                                                 }}
//                                                             ></div>

//                                                             <p className="font-bold text-gray-800">{driver.id_driver}</p>
//                                                             {isSelected && (
//                                                                 <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
//                                                                     Đang chọn
//                                                                 </span>
//                                                             )}
//                                                         </div>

//                                                         <p className="text-sm text-gray-700 mt-1">
//                                                             👤 {driver.driver_name}
//                                                         </p>
//                                                         <p className="text-xs text-gray-600 font-mono mt-1">
//                                                             📍 {driver.toado_x?.toFixed(5)}, {driver.toado_y?.toFixed(5)}
//                                                         </p>
//                                                         <p className="text-xs text-gray-500 mt-1">
//                                                             🕒 {driver.timestamp ? new Date(driver.timestamp).toLocaleTimeString('vi-VN') : 'N/A'}
//                                                         </p>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         );
//                                     })
//                                 )}
//                             </div>
//                         </div>

//                         {/* Debug Logs */}
//                         {/* <div className="bg-white rounded-xl shadow-lg p-6">
//                             <h2 className="text-lg font-bold text-gray-800 mb-3">Debug Logs</h2>
//                             <div className="space-y-1 max-h-64 overflow-y-auto text-xs font-mono">
//                                 {logs.length === 0 ? (
//                                     <p className="text-gray-500">No logs yet...</p>
//                                 ) : (
//                                     logs.map((log) => (
//                                         <div
//                                             key={log.id} // ✅ ĐẢM BẢO DÙNG id CỦA LOG
//                                             className={`p-2 rounded ${log.type === 'success' ? 'bg-green-50 text-green-800' :
//                                                 log.type === 'error' ? 'bg-red-50 text-red-800' :
//                                                     'bg-gray-50 text-gray-800'
//                                                 }`}
//                                         >
//                                             <span className="text-gray-500">[{log.time}]</span> {log.message}
//                                         </div>
//                                     ))
//                                 )}
//                             </div>
//                         </div> */}
//                     </div>

//                     {/* Map */}
//                     <div className="lg:col-span-2">
//                         <div className="bg-white rounded-xl shadow-lg p-6 h-[800px]">
//                             <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
//                                 {/* <MapPin size={24} className="text-red-600" /> */}
//                                 {/* Tracking Map */}
//                                 {selectedDriver && (
//                                     <span className="text-sm font-normal text-blue-600 ml-2">
//                                         📍 Đang theo dõi: {selectedDriver.driver_name}
//                                     </span>
//                                 )}
//                             </h2>
//                             <div id="map" className="w-full h-[720px] rounded-lg"></div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Observation;