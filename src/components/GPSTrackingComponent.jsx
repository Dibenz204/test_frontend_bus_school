import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { MapPin, Navigation, Power, Wifi, WifiOff, Users, Radio } from 'lucide-react';

const GPSTrackingComponent = () => {
    const [isGPSActive, setIsGPSActive] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [drivers, setDrivers] = useState([]);
    const [driverId] = useState('DV01'); // Demo: Hardcode driver ID
    const [logs, setLogs] = useState([]); // Debug logs
    const watchIdRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef({});

    // Helper: Thêm log
    const addLog = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString('vi-VN');
        setLogs(prev => [{
            id: Date.now(),
            time: timestamp,
            message,
            type
        }, ...prev].slice(0, 20)); // Giữ 20 logs gần nhất

        console.log(`[${timestamp}] ${message}`);
    };

    // Socket.IO Connection
    useEffect(() => {
        // ⚠️ ĐỔI URL NÀY NẾU DEPLOY
        const SOCKET_URL = 'http://localhost:5001'; // Local
        // const SOCKET_URL = 'https://test-backend-bus-school.onrender.com'; // Production

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

        socketInstance.on('connect_error', (error) => {
            addLog(`❌ Connection error: ${error.message}`, 'error');
        });

        // ✅ QUAN TRỌNG: Lắng nghe location updates từ tất cả drivers
        socketInstance.on('driver-location-updated', (data) => {
            addLog(`📍 Received location: ${data.id_driver} at [${data.toado_x.toFixed(4)}, ${data.toado_y.toFixed(4)}]`, 'success');
            updateDriverMarker(data);
        });

        // Lắng nghe status changes
        socketInstance.on('driver-status-changed', (data) => {
            addLog(`🔄 Driver ${data.id_driver} status: ${data.status ? 'ON' : 'OFF'}`, 'info');
        });

        setSocket(socketInstance);

        return () => {
            addLog('🔌 Disconnecting socket...', 'info');
            socketInstance.disconnect();
        };
    }, []);

    // Khởi tạo Leaflet Map
    useEffect(() => {
        if (!mapRef.current) {
            const L = window.L;
            if (!L) {
                addLog('❌ Leaflet chưa được load!', 'error');
                return;
            }

            addLog('🗺️ Initializing map...', 'info');
            const map = L.map('map').setView([10.8231, 106.6297], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            mapRef.current = map;
            addLog('✅ Map initialized', 'success');
        }
    }, []);

    // Update marker của driver trên map
    const updateDriverMarker = (data) => {
        if (!mapRef.current || !window.L) return;

        const { id_driver, toado_x, toado_y } = data;
        const L = window.L;

        try {
            // Nếu chưa có marker cho driver này, tạo mới
            if (!markersRef.current[id_driver]) {
                const icon = L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                });

                const marker = L.marker([toado_x, toado_y], { icon })
                    .addTo(mapRef.current)
                    .bindPopup(`<b>🚗 Tài xế: ${id_driver}</b><br/>📍 ${toado_x.toFixed(5)}, ${toado_y.toFixed(5)}`);

                markersRef.current[id_driver] = marker;
                addLog(`✅ Created marker for ${id_driver}`, 'success');
            } else {
                // Cập nhật vị trí marker
                markersRef.current[id_driver].setLatLng([toado_x, toado_y]);
                markersRef.current[id_driver].setPopupContent(
                    `<b>🚗 Tài xế: ${id_driver}</b><br/>📍 ${toado_x.toFixed(5)}, ${toado_y.toFixed(5)}`
                );
                addLog(`✅ Updated marker for ${id_driver}`, 'success');
            }

            // Cập nhật danh sách drivers
            setDrivers(prev => {
                const existing = prev.find(d => d.id_driver === id_driver);
                if (existing) {
                    return prev.map(d =>
                        d.id_driver === id_driver
                            ? { ...d, toado_x, toado_y, timestamp: data.timestamp || new Date().toISOString() }
                            : d
                    );
                }
                return [...prev, {
                    id_driver,
                    toado_x,
                    toado_y,
                    timestamp: data.timestamp || new Date().toISOString()
                }];
            });
        } catch (error) {
            addLog(`❌ Error updating marker: ${error.message}`, 'error');
        }
    };

    // Bật GPS Tracking
    const startGPSTracking = () => {
        if (!navigator.geolocation) {
            addLog('❌ Trình duyệt không hỗ trợ GPS!', 'error');
            alert('Trình duyệt không hỗ trợ GPS!');
            return;
        }

        if (!socket || !isConnected) {
            addLog('❌ Socket chưa kết nối!', 'error');
            alert('Socket chưa kết nối! Đợi vài giây...');
            return;
        }

        setIsGPSActive(true);
        addLog(`🟢 GPS activated for driver: ${driverId}`, 'success');

        // Gửi trạng thái GPS = ON
        socket.emit('toggle-gps-status', {
            id_driver: driverId,
            status: true
        });

        // Lấy vị trí ngay lập tức
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                sendLocationUpdate(latitude, longitude);
            },
            (error) => {
                addLog(`❌ GPS Error: ${error.message}`, 'error');
            }
        );

        // Theo dõi vị trí realtime
        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                sendLocationUpdate(latitude, longitude);
            },
            (error) => {
                addLog(`❌ GPS Error: ${error.message}`, 'error');
                alert('Không thể lấy vị trí GPS!');
                stopGPSTracking();
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    // Hàm gửi location update
    const sendLocationUpdate = (latitude, longitude) => {
        setCurrentLocation({ lat: latitude, lng: longitude });

        const locationData = {
            id_driver: driverId,
            toado_x: latitude,
            toado_y: longitude,
            id_user: 'U001'
        };

        addLog(`📤 Sending location: [${latitude.toFixed(5)}, ${longitude.toFixed(5)}]`, 'info');

        // Gửi qua Socket.IO
        socket.emit('update-location', locationData);

        // Cập nhật map center
        if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 15);
        }
    };

    // Tắt GPS Tracking
    const stopGPSTracking = () => {
        setIsGPSActive(false);
        addLog(`🔴 GPS deactivated for driver: ${driverId}`, 'info');

        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }

        if (socket) {
            socket.emit('toggle-gps-status', {
                id_driver: driverId,
                status: false
            });
        }
    };

    const toggleGPS = () => {
        if (isGPSActive) {
            stopGPSTracking();
        } else {
            startGPSTracking();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                                <Navigation className="text-blue-600" size={36} />
                                GPS Tracking System
                            </h1>
                            <p className="text-gray-600 mt-2">Driver ID: <span className="font-mono font-bold">{driverId}</span></p>
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
                    {/* Control Panel */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* GPS Control */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Power size={24} className="text-indigo-600" />
                                Điều khiển GPS
                            </h2>

                            <button
                                onClick={toggleGPS}
                                disabled={!isConnected}
                                className={`w-full py-4 rounded-lg font-bold text-white text-lg transition-all transform hover:scale-105 ${isGPSActive
                                    ? 'bg-red-500 hover:bg-red-600'
                                    : 'bg-green-500 hover:bg-green-600'
                                    } disabled:bg-gray-300 disabled:cursor-not-allowed`}
                            >
                                {isGPSActive ? '🔴 TẮT GPS' : '🟢 BẬT GPS'}
                            </button>

                            {currentLocation && (
                                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm font-semibold text-gray-700 mb-2">Vị trí hiện tại:</p>
                                    <p className="text-xs text-gray-600 font-mono">
                                        📍 {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Drivers List */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Users size={24} className="text-purple-600" />
                                Tài xế online ({drivers.length})
                            </h2>

                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {drivers.length === 0 ? (
                                    <p className="text-gray-500 text-sm">Chưa có tài xế nào online</p>
                                ) : (
                                    drivers.map((driver) => (
                                        <div
                                            key={driver.id_driver}
                                            className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200"
                                        >
                                            <p className="font-semibold text-gray-800">{driver.id_driver}</p>
                                            <p className="text-xs text-gray-600 mt-1 font-mono">
                                                {driver.toado_x?.toFixed(5)}, {driver.toado_y?.toFixed(5)}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {driver.timestamp ? new Date(driver.timestamp).toLocaleTimeString('vi-VN') : 'N/A'}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Debug Logs */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Radio size={24} className="text-orange-600" />
                                Debug Logs
                            </h2>

                            <div className="space-y-2 max-h-64 overflow-y-auto text-xs font-mono">
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

export default GPSTrackingComponent;


// import React, { useState, useEffect, useRef } from 'react';
// import { io } from 'socket.io-client';
// import { MapPin, Navigation, Power, Wifi, WifiOff, Users } from 'lucide-react';

// const GPSTrackingComponent = () => {
//     const [isGPSActive, setIsGPSActive] = useState(false);
//     const [currentLocation, setCurrentLocation] = useState(null);
//     const [socket, setSocket] = useState(null);
//     const [isConnected, setIsConnected] = useState(false);
//     const [drivers, setDrivers] = useState([]);
//     const [driverId] = useState('DV01'); // Demo: Hardcode driver ID
//     const watchIdRef = useRef(null);
//     const mapRef = useRef(null);
//     const markersRef = useRef({});

//     // Socket.IO Connection
//     useEffect(() => {
//         const SOCKET_URL = 'http://localhost:5001'; // Thay bằng URL Render của mày

//         const socketInstance = io(`${SOCKET_URL}/gps`, {
//             transports: ['websocket', 'polling'],
//             reconnection: true,
//             reconnectionDelay: 1000,
//             reconnectionAttempts: 5
//         });

//         socketInstance.on('connect', () => {
//             console.log('✅ Socket connected:', socketInstance.id);
//             setIsConnected(true);
//         });

//         socketInstance.on('disconnect', () => {
//             console.log('❌ Socket disconnected');
//             setIsConnected(false);
//         });

//         // Lắng nghe vị trí của TẤT CẢ drivers (cho Admin/Phụ huynh)
//         socketInstance.on('driver-location-updated', (data) => {
//             console.log('📍 Driver location updated:', data);
//             updateDriverMarker(data);
//         });

//         setSocket(socketInstance);

//         return () => {
//             socketInstance.disconnect();
//         };
//     }, []);

//     // Khởi tạo Leaflet Map
//     useEffect(() => {
//         if (!mapRef.current) {
//             const L = window.L;
//             if (!L) {
//                 console.error('Leaflet chưa được load!');
//                 return;
//             }

//             const map = L.map('map').setView([10.8231, 106.6297], 13); // Mặc định: TP.HCM

//             L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//                 attribution: '© OpenStreetMap contributors'
//             }).addTo(map);

//             mapRef.current = map;
//         }
//     }, []);

//     // Update marker của driver trên map
//     const updateDriverMarker = (data) => {
//         if (!mapRef.current || !window.L) return;

//         const { id_driver, toado_x, toado_y } = data;
//         const L = window.L;

//         // Nếu chưa có marker cho driver này, tạo mới
//         if (!markersRef.current[id_driver]) {
//             const icon = L.icon({
//                 iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
//                 shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
//                 iconSize: [25, 41],
//                 iconAnchor: [12, 41],
//                 popupAnchor: [1, -34],
//                 shadowSize: [41, 41]
//             });

//             const marker = L.marker([toado_x, toado_y], { icon })
//                 .addTo(mapRef.current)
//                 .bindPopup(`<b>Tài xế: ${id_driver}</b><br/>Vị trí: ${toado_x.toFixed(4)}, ${toado_y.toFixed(4)}`);

//             markersRef.current[id_driver] = marker;
//         } else {
//             // Cập nhật vị trí marker hiện tại
//             markersRef.current[id_driver].setLatLng([toado_x, toado_y]);
//             markersRef.current[id_driver].setPopupContent(
//                 `<b>Tài xế: ${id_driver}</b><br/>Vị trí: ${toado_x.toFixed(4)}, ${toado_y.toFixed(4)}`
//             );
//         }

//         // Cập nhật state drivers
//         setDrivers(prev => {
//             const existing = prev.find(d => d.id_driver === id_driver);
//             if (existing) {
//                 return prev.map(d =>
//                     d.id_driver === id_driver
//                         ? { ...d, toado_x, toado_y, timestamp: data.timestamp }
//                         : d
//                 );
//             }
//             return [...prev, { id_driver, toado_x, toado_y, timestamp: data.timestamp }];
//         });
//     };

//     // Bật/Tắt GPS Tracking
//     const toggleGPS = () => {
//         if (isGPSActive) {
//             stopGPSTracking();
//         } else {
//             startGPSTracking();
//         }
//     };

//     const startGPSTracking = () => {
//         if (!navigator.geolocation) {
//             alert('Trình duyệt không hỗ trợ GPS!');
//             return;
//         }

//         if (!socket || !isConnected) {
//             alert('Socket chưa kết nối! Đợi vài giây...');
//             return;
//         }

//         setIsGPSActive(true);

//         // Gửi trạng thái GPS = ON
//         socket.emit('toggle-gps-status', {
//             id_driver: driverId,
//             status: true
//         });

//         // Theo dõi vị trí realtime (cập nhật mỗi 5 giây)
//         watchIdRef.current = navigator.geolocation.watchPosition(
//             (position) => {
//                 const { latitude, longitude } = position.coords;

//                 setCurrentLocation({ lat: latitude, lng: longitude });

//                 // Gửi vị trí qua Socket.IO
//                 socket.emit('update-location', {
//                     id_driver: driverId,
//                     toado_x: latitude,
//                     toado_y: longitude,
//                     id_user: 'U001' // Demo: thay bằng user thật từ context/redux
//                 });

//                 console.log('📍 Location sent:', { latitude, longitude });

//                 // Cập nhật map center
//                 if (mapRef.current) {
//                     mapRef.current.setView([latitude, longitude], 15);
//                 }
//             },
//             (error) => {
//                 console.error('❌ GPS Error:', error);
//                 alert('Không thể lấy vị trí GPS!');
//                 stopGPSTracking();
//             },
//             {
//                 enableHighAccuracy: true,
//                 timeout: 10000,
//                 maximumAge: 0
//             }
//         );
//     };

//     const stopGPSTracking = () => {
//         setIsGPSActive(false);

//         if (watchIdRef.current) {
//             navigator.geolocation.clearWatch(watchIdRef.current);
//             watchIdRef.current = null;
//         }

//         if (socket) {
//             socket.emit('toggle-gps-status', {
//                 id_driver: driverId,
//                 status: false
//             });
//         }
//     };

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
//             <div className="max-w-7xl mx-auto">
//                 {/* Header */}
//                 <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
//                                 <Navigation className="text-blue-600" size={36} />
//                                 GPS Tracking System
//                             </h1>
//                             <p className="text-gray-600 mt-2">Theo dõi vị trí tài xế realtime</p>
//                         </div>

//                         {/* Connection Status */}
//                         <div className="flex items-center gap-3">
//                             {isConnected ? (
//                                 <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
//                                     <Wifi size={20} />
//                                     <span className="font-semibold">Online</span>
//                                 </div>
//                             ) : (
//                                 <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
//                                     <WifiOff size={20} />
//                                     <span className="font-semibold">Offline</span>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                     {/* Control Panel */}
//                     <div className="lg:col-span-1 space-y-6">
//                         {/* GPS Control */}
//                         <div className="bg-white rounded-xl shadow-lg p-6">
//                             <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
//                                 <Power size={24} className="text-indigo-600" />
//                                 Điều khiển GPS
//                             </h2>

//                             <button
//                                 onClick={toggleGPS}
//                                 disabled={!isConnected}
//                                 className={`w-full py-4 rounded-lg font-bold text-white text-lg transition-all transform hover:scale-105 ${isGPSActive
//                                     ? 'bg-red-500 hover:bg-red-600'
//                                     : 'bg-green-500 hover:bg-green-600'
//                                     } disabled:bg-gray-300 disabled:cursor-not-allowed`}
//                             >
//                                 {isGPSActive ? '🔴 TẮT GPS' : '🟢 BẬT GPS'}
//                             </button>

//                             {currentLocation && (
//                                 <div className="mt-4 p-4 bg-blue-50 rounded-lg">
//                                     <p className="text-sm font-semibold text-gray-700 mb-2">Vị trí hiện tại:</p>
//                                     <p className="text-xs text-gray-600">
//                                         📍 Lat: {currentLocation.lat.toFixed(6)}
//                                     </p>
//                                     <p className="text-xs text-gray-600">
//                                         📍 Lng: {currentLocation.lng.toFixed(6)}
//                                     </p>
//                                 </div>
//                             )}
//                         </div>

//                         {/* Drivers List */}
//                         <div className="bg-white rounded-xl shadow-lg p-6">
//                             <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
//                                 <Users size={24} className="text-purple-600" />
//                                 Tài xế online ({drivers.length})
//                             </h2>

//                             <div className="space-y-3 max-h-96 overflow-y-auto">
//                                 {drivers.length === 0 ? (
//                                     <p className="text-gray-500 text-sm">Chưa có tài xế nào online</p>
//                                 ) : (
//                                     drivers.map((driver) => (
//                                         <div
//                                             key={driver.id_driver}
//                                             className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200"
//                                         >
//                                             <p className="font-semibold text-gray-800">{driver.id_driver}</p>
//                                             <p className="text-xs text-gray-600 mt-1">
//                                                 {driver.toado_x?.toFixed(4)}, {driver.toado_y?.toFixed(4)}
//                                             </p>
//                                             <p className="text-xs text-gray-500 mt-1">
//                                                 {driver.timestamp ? new Date(driver.timestamp).toLocaleTimeString('vi-VN') : 'N/A'}
//                                             </p>
//                                         </div>
//                                     ))
//                                 )}
//                             </div>
//                         </div>
//                     </div>

//                     {/* Map */}
//                     <div className="lg:col-span-2">
//                         <div className="bg-white rounded-xl shadow-lg p-6 h-[600px]">
//                             <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
//                                 <MapPin size={24} className="text-red-600" />
//                                 Bản đồ theo dõi
//                             </h2>
//                             <div id="map" className="w-full h-[520px] rounded-lg"></div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default GPSTrackingComponent;