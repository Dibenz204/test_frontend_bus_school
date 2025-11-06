import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { MapPin, Wifi, WifiOff, Users, Eye, EyeOff } from 'lucide-react';

// Màu marker cho từng tài xế
const MARKER_COLORS = [
    'blue', 'red', 'green', 'orange', 'violet', 'yellow', 'grey', 'black'
];

const AdminTrackingView = () => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [drivers, setDrivers] = useState([]);
    const [visibleDrivers, setVisibleDrivers] = useState({}); // {DV01: true, DV02: false}
    const [logs, setLogs] = useState([]);
    const mapRef = useRef(null);
    const markersRef = useRef({});

    const addLog = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString('vi-VN');
        setLogs(prev => [{
            id: Date.now(),
            time: timestamp,
            message,
            type
        }, ...prev].slice(0, 15));
    };

    // Socket.IO Connection
    useEffect(() => {
        const SOCKET_URL = window.location.hostname === 'localhost'
            ? 'http://localhost:5001'
            : 'https://be-bus-school.onrender.com';

        addLog(`🔌 Đang kết nối tới ${SOCKET_URL}/gps...`, 'info');

        const socketInstance = io(`${SOCKET_URL}/gps`, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        socketInstance.on('connect', () => {
            addLog(`✅ Socket connected: ${socketInstance.id}`, 'success');
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            addLog('❌ Socket disconnected', 'error');
            setIsConnected(false);
        });

        socketInstance.on('driver-location-updated', (data) => {
            addLog(`📍 ${data.id_driver} cập nhật vị trí: [${data.toado_x.toFixed(5)}, ${data.toado_y.toFixed(5)}]`, 'success');
            updateDriverLocation(data);
        });

        socketInstance.on('driver-status-changed', (data) => {
            addLog(`🔄 ${data.id_driver} ${data.status ? 'BẬT' : 'TẮT'} GPS`, 'info');
            if (!data.status) {
                removeDriverMarker(data.id_driver);
            }
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    // Khởi tạo Map
    useEffect(() => {
        if (!mapRef.current) {
            const L = window.L;
            if (!L) {
                addLog('❌ Leaflet chưa được load!', 'error');
                return;
            }

            const map = L.map('map').setView([10.8231, 106.6297], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap'
            }).addTo(map);

            mapRef.current = map;
            addLog('✅ Map initialized', 'success');
        }
    }, []);

    // Fetch danh sách drivers khi mount
    useEffect(() => {
        fetchAllDrivers();
    }, []);

    const fetchAllDrivers = async () => {
        try {
            const BACKEND_URL = window.location.hostname === 'localhost'
                ? 'http://localhost:5001'
                : 'https://test-backend-bus-school.onrender.com';

            const response = await fetch(`${BACKEND_URL}/api/driver/all-locations`);
            const data = await response.json();

            if (data.errCode === 0 && data.locations) {
                const driversWithVisibility = {};
                data.locations.forEach(driver => {
                    driversWithVisibility[driver.id_driver] = true; // Mặc định hiển thị tất cả
                });
                setVisibleDrivers(driversWithVisibility);

                // Cập nhật drivers và hiển thị trên map
                data.locations.forEach(driver => {
                    updateDriverLocation({
                        id_driver: driver.id_driver,
                        toado_x: driver.toado_x,
                        toado_y: driver.toado_y,
                        driver_name: driver.driver_name,
                        driver_phone: driver.driver_phone
                    });
                });

                addLog(`✅ Đã load ${data.locations.length} tài xế`, 'success');
            }
        } catch (error) {
            addLog(`❌ Lỗi fetch drivers: ${error.message}`, 'error');
        }
    };

    const updateDriverLocation = (data) => {
        const { id_driver, toado_x, toado_y, driver_name, driver_phone } = data;

        // Cập nhật state drivers
        setDrivers(prev => {
            const existing = prev.find(d => d.id_driver === id_driver);
            if (existing) {
                return prev.map(d =>
                    d.id_driver === id_driver
                        ? { ...d, toado_x, toado_y, driver_name, driver_phone, timestamp: new Date().toISOString() }
                        : d
                );
            }
            return [...prev, {
                id_driver,
                toado_x,
                toado_y,
                driver_name: driver_name || 'Unknown',
                driver_phone: driver_phone || 'N/A',
                timestamp: new Date().toISOString()
            }];
        });

        // Cập nhật marker trên map (nếu driver được hiển thị)
        if (visibleDrivers[id_driver]) {
            updateDriverMarker(id_driver, toado_x, toado_y, driver_name);
        }
    };

    const updateDriverMarker = (id_driver, toado_x, toado_y, driver_name) => {
        if (!mapRef.current || !window.L) return;

        const L = window.L;
        const driverIndex = drivers.findIndex(d => d.id_driver === id_driver);
        const colorIndex = driverIndex >= 0 ? driverIndex % MARKER_COLORS.length : 0;
        const markerColor = MARKER_COLORS[colorIndex];

        if (!markersRef.current[id_driver]) {
            const icon = L.icon({
                iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${markerColor}.png`,
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            const marker = L.marker([toado_x, toado_y], { icon })
                .addTo(mapRef.current)
                .bindPopup(`
          <div style="font-family: sans-serif;">
            <strong style="font-size: 14px;">🚗 ${id_driver}</strong><br/>
            <span style="font-size: 12px;">👤 ${driver_name || 'Unknown'}</span><br/>
            <span style="font-size: 11px; color: #666;">📍 ${toado_x.toFixed(5)}, ${toado_y.toFixed(5)}</span>
          </div>
        `);

            markersRef.current[id_driver] = marker;
        } else {
            markersRef.current[id_driver].setLatLng([toado_x, toado_y]);
            markersRef.current[id_driver].setPopupContent(`
        <div style="font-family: sans-serif;">
          <strong style="font-size: 14px;">🚗 ${id_driver}</strong><br/>
          <span style="font-size: 12px;">👤 ${driver_name || 'Unknown'}</span><br/>
          <span style="font-size: 11px; color: #666;">📍 ${toado_x.toFixed(5)}, ${toado_y.toFixed(5)}</span>
        </div>
      `);
        }
    };

    const removeDriverMarker = (id_driver) => {
        if (markersRef.current[id_driver] && mapRef.current) {
            mapRef.current.removeLayer(markersRef.current[id_driver]);
            delete markersRef.current[id_driver];
            addLog(`🗑️ Removed marker for ${id_driver}`, 'info');
        }
    };

    const toggleDriverVisibility = (id_driver) => {
        setVisibleDrivers(prev => {
            const newVisibility = { ...prev, [id_driver]: !prev[id_driver] };

            // Ẩn/hiện marker
            if (!newVisibility[id_driver]) {
                removeDriverMarker(id_driver);
            } else {
                const driver = drivers.find(d => d.id_driver === id_driver);
                if (driver) {
                    updateDriverMarker(id_driver, driver.toado_x, driver.toado_y, driver.driver_name);
                }
            }

            return newVisibility;
        });
    };

    const toggleAllDrivers = (show) => {
        const newVisibility = {};
        drivers.forEach(driver => {
            newVisibility[driver.id_driver] = show;

            if (!show) {
                removeDriverMarker(driver.id_driver);
            } else {
                updateDriverMarker(driver.id_driver, driver.toado_x, driver.toado_y, driver.driver_name);
            }
        });
        setVisibleDrivers(newVisibility);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                                <MapPin className="text-purple-600" size={36} />
                                Admin - Theo dõi GPS
                            </h1>
                            <p className="text-gray-600 mt-2">Giám sát vị trí tài xế realtime</p>
                        </div>

                        <div className="flex items-center gap-3">
                            {isConnected ? (
                                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                                    <Wifi size={20} />
                                    <span className="font-semibold">Online</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                                    <WifiOff size={20} />
                                    <span className="font-semibold">Offline</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Drivers List */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <Users size={24} className="text-purple-600" />
                                    Tài xế online ({drivers.length})
                                </h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toggleAllDrivers(true)}
                                        className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                                        title="Hiển thị tất cả"
                                    >
                                        <Eye size={14} />
                                    </button>
                                    <button
                                        onClick={() => toggleAllDrivers(false)}
                                        className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                        title="Ẩn tất cả"
                                    >
                                        <EyeOff size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {drivers.length === 0 ? (
                                    <p className="text-gray-500 text-sm">Chưa có tài xế nào online</p>
                                ) : (
                                    drivers.map((driver, index) => {
                                        const colorIndex = index % MARKER_COLORS.length;
                                        const markerColor = MARKER_COLORS[colorIndex];

                                        return (
                                            <div
                                                key={driver.id_driver}
                                                className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${visibleDrivers[driver.id_driver]
                                                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300'
                                                    : 'bg-gray-50 border-gray-200 opacity-50'
                                                    }`}
                                                onClick={() => toggleDriverVisibility(driver.id_driver)}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={visibleDrivers[driver.id_driver] || false}
                                                        onChange={() => toggleDriverVisibility(driver.id_driver)}
                                                        className="mt-1 w-4 h-4 cursor-pointer"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />

                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-3 h-3 rounded-full"
                                                                style={{
                                                                    backgroundColor: markerColor === 'grey' ? '#999' : markerColor
                                                                }}
                                                            ></div>
                                                            <p className="font-bold text-gray-800">{driver.id_driver}</p>
                                                        </div>
                                                        <p className="text-sm text-gray-700 mt-1">
                                                            👤 {driver.driver_name || 'Unknown'}
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
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-3">Debug Logs</h2>
                            <div className="space-y-1 max-h-64 overflow-y-auto text-xs font-mono">
                                {logs.length === 0 ? (
                                    <p className="text-gray-500">No logs yet...</p>
                                ) : (
                                    logs.map((log) => (
                                        <div
                                            key={log.id}
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
                        </div>
                    </div>

                    {/* Map */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-lg p-6 h-[800px]">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <MapPin size={24} className="text-red-600" />
                                Bản đồ theo dõi
                            </h2>
                            <div id="map" className="w-full h-[720px] rounded-lg"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminTrackingView;