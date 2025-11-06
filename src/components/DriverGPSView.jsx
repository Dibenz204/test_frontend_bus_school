import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { MapPin, Navigation, Power, Wifi, WifiOff } from 'lucide-react';

const DriverGPSView = () => {
    const [isGPSActive, setIsGPSActive] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [driverId] = useState('DV01'); // Hardcode tạm, sau này lấy từ login
    const [logs, setLogs] = useState([]);
    const watchIdRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const [onlineDrivers, setOnlineDrivers] = useState({});

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
    // useEffect(() => {
    //     const SOCKET_URL = window.location.hostname === 'localhost'
    //         ? 'http://localhost:5001'
    //         : 'https://be-bus-school.onrender.com';

    //     addLog(`🔌 Đang kết nối tới ${SOCKET_URL}/gps...`, 'info');

    //     const socketInstance = io(`${SOCKET_URL}/gps`, {
    //         transports: ['websocket', 'polling'],
    //         reconnection: true,
    //         reconnectionDelay: 1000,
    //         reconnectionAttempts: 5
    //     });

    //     socketInstance.on('connect', () => {
    //         setOnlineDrivers(prev => ({ ...prev, [data.id_driver]: true }));
    //         addLog(`🟢 ${data.id_driver} connected`, 'success');
    //         // addLog(`✅ Socket connected: ${socketInstance.id}`, 'success');
    //         setIsConnected(true);

    //         socketInstance.emit('register-driver', {
    //             id_driver: driverId
    //         });
    //     });

    //     socketInstance.on('disconnect', () => {
    //         setOnlineDrivers(prev => ({ ...prev, [data.id_driver]: false }));
    //         addLog(`🔴 ${data.id_driver} disconnected`, 'error');
    //         // addLog('❌ Socket disconnected', 'error');
    //         // setIsConnected(false);
    //     });

    //     setSocket(socketInstance);

    //     return () => {
    //         socketInstance.disconnect();
    //     };
    // }, []);

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
            setOnlineDrivers(prev => ({ ...prev, [driverId]: true })); // ✅ FIX: dùng driverId
            addLog(`🟢 ${driverId} connected`, 'success'); // ✅ FIX: dùng driverId
            addLog(`✅ Socket connected: ${socketInstance.id}`, 'success');
            setIsConnected(true);

            socketInstance.emit('register-driver', {
                id_driver: driverId
            });
        });

        socketInstance.on('disconnect', () => {
            setOnlineDrivers(prev => ({ ...prev, [driverId]: false })); // ✅ FIX: dùng driverId
            addLog(`🔴 ${driverId} disconnected`, 'error'); // ✅ FIX: dùng driverId
            addLog('❌ Socket disconnected', 'error');
            setIsConnected(false);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    // Khởi tạo Map
    // useEffect(() => {
    //     if (!mapRef.current) {
    //         const L = window.L;
    //         if (!L) {
    //             addLog('❌ Leaflet chưa được load!', 'error');
    //             return;
    //         }

    //         const map = L.map('map').setView([10.8231, 106.6297], 13);
    //         L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //             attribution: '© OpenStreetMap'
    //         }).addTo(map);

    //         mapRef.current = map;
    //         addLog('✅ Map initialized', 'success');
    //     }
    // }, []);

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

        socket.emit('toggle-gps-status', {
            id_driver: driverId,
            status: true
        });

        // Lấy vị trí ngay
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                sendLocationUpdate(latitude, longitude);
            },
            (error) => {
                addLog(`❌ GPS Error: ${error.message}`, 'error');
            }
        );

        // Theo dõi realtime
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

    const sendLocationUpdate = (latitude, longitude) => {
        setCurrentLocation({ lat: latitude, lng: longitude });

        const locationData = {
            id_driver: driverId,
            toado_x: latitude,
            toado_y: longitude,
            id_user: 'U001'
        };

        addLog(`📤 Sending: [${latitude.toFixed(5)}, ${longitude.toFixed(5)}]`, 'info');
        socket.emit('update-location', locationData);

        // Cập nhật marker
        // if (mapRef.current && window.L) {
        //     const L = window.L;

        //     if (!markerRef.current) {
        //         const icon = L.icon({
        //             iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        //             shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        //             iconSize: [25, 41],
        //             iconAnchor: [12, 41],
        //             popupAnchor: [1, -34],
        //             shadowSize: [41, 41]
        //         });

        //         markerRef.current = L.marker([latitude, longitude], { icon })
        //             .addTo(mapRef.current)
        //             .bindPopup(`<b>🚗 ${driverId}</b><br/>📍 Vị trí của bạn`);
        //     } else {
        //         markerRef.current.setLatLng([latitude, longitude]);
        //     }

        //     mapRef.current.setView([latitude, longitude], 15);
        // }
    };

    const stopGPSTracking = () => {
        setIsGPSActive(false);
        addLog(`🔴 GPS deactivated`, 'info');

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
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                                <Navigation className="text-green-600" size={36} />
                                GPS Tracking - Tài xế
                            </h1>
                            <p className="text-gray-600 mt-2">Mã tài xế: <span className="font-mono font-bold">{driverId}</span></p>
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
                                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                                    <p className="text-sm font-semibold text-gray-700 mb-2">Vị trí hiện tại:</p>
                                    <p className="text-xs text-gray-600 font-mono">
                                        📍 {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Debug Logs */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-3">Debug Logs</h2>
                            <div className="space-y-1 max-h-96 overflow-y-auto text-xs font-mono">
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
                    {/* <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-lg p-6 h-[800px]">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <MapPin size={24} className="text-green-600" />
                                Vị trí của bạn
                            </h2>
                            <div id="map" className="w-full h-[720px] rounded-lg"></div>
                        </div>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default DriverGPSView;