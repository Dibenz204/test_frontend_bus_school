import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const DriverGPSTracker = ({ driverId, driverName }) => {
    const [isTracking, setIsTracking] = useState(false);
    const [location, setLocation] = useState(null);
    const socketRef = useRef(null);
    const watchIdRef = useRef(null);

    useEffect(() => {
        // Kết nối Socket.IO
        socketRef.current = io('http://your-backend-url:8080');

        socketRef.current.on('connect', () => {
            console.log('✅ Kết nối Socket.IO thành công');

            // Đăng nhập tài xế
            socketRef.current.emit('driver-login', {
                driverId,
                driverName
            });
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            stopTracking();
        };
    }, [driverId, driverName]);

    const startTracking = () => {
        if (!navigator.geolocation) {
            alert('❌ Trình duyệt không hỗ trợ GPS');
            return;
        }

        setIsTracking(true);

        // Theo dõi vị trí liên tục
        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const gpsData = {
                    driverId,
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    speed: position.coords.speed || 0,
                    heading: position.coords.heading || 0,
                    timestamp: new Date().toISOString()
                };

                setLocation(gpsData);

                // Gửi GPS qua Socket.IO
                if (socketRef.current) {
                    socketRef.current.emit('send-gps', gpsData);
                }
            },
            (error) => {
                console.error('❌ Lỗi GPS:', error);
                alert('Không thể lấy vị trí GPS. Vui lòng bật GPS!');
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    };

    const stopTracking = () => {
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setIsTracking(false);
    };

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>🚗 Tracking GPS - {driverName}</h2>

            {location && (
                <div style={{
                    background: '#e7f3ff',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>
                    <p><b>📍 Vị trí hiện tại:</b></p>
                    <p>Lat: {location.lat.toFixed(6)}</p>
                    <p>Lng: {location.lng.toFixed(6)}</p>
                    <p>Tốc độ: {location.speed} m/s</p>
                </div>
            )}

            {!isTracking ? (
                <button
                    onClick={startTracking}
                    style={{
                        padding: '15px 30px',
                        fontSize: '18px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                    }}
                >
                    ▶️ Bắt đầu Tracking
                </button>
            ) : (
                <button
                    onClick={stopTracking}
                    style={{
                        padding: '15px 30px',
                        fontSize: '18px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                    }}
                >
                    ⏸️ Dừng Tracking
                </button>
            )}

            <div style={{
                marginTop: '20px',
                fontSize: '14px',
                color: isTracking ? '#28a745' : '#dc3545'
            }}>
                {isTracking ? '🟢 Đang gửi GPS...' : '🔴 Chưa kích hoạt'}
            </div>
        </div>
    );
};

export default DriverGPSTracker;