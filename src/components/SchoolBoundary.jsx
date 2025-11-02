
import L from 'leaflet';
import '../styles/schoolBoundary.css';


/**
 * Vẽ vùng trường học lên bản đồ
 * @param {L.Map} map - Leaflet map instance
 * @returns {L.Polygon} - Polygon layer đã tạo
 */
export const drawSchoolBoundary = (map) => {
    const schoolCenter = [10.759784, 106.682308];

    // Tọa độ các điểm tạo thành vùng bao quanh trường
    // (Mày có thể điều chỉnh các tọa độ này cho chính xác)
    const schoolBoundary = [
        [10.760197, 106.681137],  // Góc trên trái
        [10.760792, 106.682591],  // Góc trên phải
        [10.759204, 106.683131],  // Góc dưới phải
        [10.758684, 106.681782]   // Góc dưới trái
    ];

    // Vẽ polygon (vùng khoanh)
    const polygon = L.polygon(schoolBoundary, {
        color: '#FF6B6B',        // Màu viền đỏ
        fillColor: '#FF6B6B',    // Màu tô đỏ nhạt
        fillOpacity: 0.2,        // Độ trong suốt
        weight: 3,               // Độ dày viền
        dashArray: '10, 5'       // Viền đứt nét (tùy chọn)
    }).addTo(map);

    // Thêm popup khi click vào vùng
    polygon.bindPopup(`
        <div style="text-align: center; padding: 5px;">
            <b style="font-size: 16px; color: #FF6B6B;">🏫 Trường Đại học Sài Gòn</b><br>
            <small style="color: #666;">
                273 An Dương Vương<br>
                Phường 3, Quận 5, TP.HCM
            </small>
        </div>
    `);

    // Thêm marker ở trung tâm trường (tùy chọn)
    const schoolIcon = L.divIcon({
        className: 'school-icon',
        html: `
            <div style="
                background: #FF6B6B;
                color: white;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ">🏫</div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });

    const schoolMarker = L.marker(schoolCenter, { icon: schoolIcon })
        .addTo(map)
        .bindPopup(`
            <div style="text-align: center; padding: 5px;">
                <b style="font-size: 16px; color: #FF6B6B;">🏫 Trường ĐH Sài Gòn</b><br>
                <small style="color: #666;">273 An Dương Vương</small>
            </div>
        `);

    // Trả về cả polygon và marker để có thể xóa sau này
    return { polygon, marker: schoolMarker };
};

/**
 * Xóa vùng trường khỏi bản đồ
 * @param {L.Map} map 
 * @param {Object} layers - Object chứa polygon và marker
 */
export const removeSchoolBoundary = (map, layers) => {
    if (layers.polygon) {
        map.removeLayer(layers.polygon);
    }
    if (layers.marker) {
        map.removeLayer(layers.marker);
    }
};
