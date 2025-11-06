import React, { useState } from 'react';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';

const TestGPSLocation = () => {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const testGPS = () => {
        setLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError('Trình duyệt không hỗ trợ GPS!');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                setLocation({
                    lat: latitude,
                    lng: longitude,
                    accuracy: accuracy,
                    timestamp: new Date(position.timestamp).toLocaleString('vi-VN')
                });
                setLoading(false);
                console.log('📍 GPS Position:', position);
            },
            (err) => {
                let errorMsg = '';
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        errorMsg = 'Bạn đã chặn quyền truy cập GPS. Vào Settings → Site Settings → Location → Allow';
                        break;
                    case err.POSITION_UNAVAILABLE:
                        errorMsg = 'Không thể lấy vị trí GPS. Kiểm tra GPS thiết bị đã bật chưa.';
                        break;
                    case err.TIMEOUT:
                        errorMsg = 'Timeout khi lấy GPS. Thử lại.';
                        break;
                    default:
                        errorMsg = `Lỗi GPS: ${err.message}`;
                }
                setError(errorMsg);
                setLoading(false);
                console.error('❌ GPS Error:', err);
            },
            {
                enableHighAccuracy: true, // Bật GPS chính xác cao
                timeout: 10000,
                maximumAge: 0 // Không dùng cache
            }
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Navigation className="text-blue-600" size={32} />
                        <h1 className="text-3xl font-bold text-gray-800">Test GPS Location</h1>
                    </div>

                    <button
                        onClick={testGPS}
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg transition-all disabled:bg-gray-400"
                    >
                        {loading ? '⏳ Đang lấy GPS...' : '📍 Lấy vị trí hiện tại'}
                    </button>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                                <div>
                                    <p className="font-semibold text-red-800">Lỗi GPS:</p>
                                    <p className="text-red-700 text-sm mt-1">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {location && (
                        <div className="mt-6 space-y-4">
                            <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <MapPin className="text-green-600" size={24} />
                                    <h2 className="text-xl font-bold text-gray-800">Vị trí của bạn:</h2>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 font-medium">Latitude (Vĩ độ):</span>
                                        <span className="font-mono text-gray-800 font-bold">{location.lat.toFixed(6)}</span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 font-medium">Longitude (Kinh độ):</span>
                                        <span className="font-mono text-gray-800 font-bold">{location.lng.toFixed(6)}</span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 font-medium">Độ chính xác:</span>
                                        <span className="text-gray-800 font-bold">±{Math.round(location.accuracy)}m</span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 font-medium">Thời gian:</span>
                                        <span className="text-gray-800 text-sm">{location.timestamp}</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-sm text-gray-600">
                                        <strong>Google Maps:</strong>
                                    </p>
                                    <a
                                        href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline text-sm break-all"
                                    >
                                        https://www.google.com/maps?q={location.lat},{location.lng}
                                    </a>
                                </div>
                            </div>

                            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
                                <p className="text-sm text-yellow-800">
                                    <strong>Lưu ý:</strong>
                                </p>
                                <ul className="text-sm text-yellow-700 mt-2 space-y-1 list-disc list-inside">
                                    <li>Trên PC/Laptop: GPS dựa vào IP (sai số cao, có thể sai vài km)</li>
                                    <li>Trên điện thoại: GPS chính xác đến vài mét</li>
                                    <li>Độ chính xác {'<'}50m = tốt, {'>'}100m = kém</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TestGPSLocation;