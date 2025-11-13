import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import { createBusStop, getAllBusStops, deleteBusStop } from "../services/busStopService";
import { drawSchoolBoundary } from "./SchoolBoundary";
import { getAllRoutes, createNewRoute, deleteRoute, getBusStopsByRoute, saveRouteBusStops } from "../services/routeService";

const MapComponent = () => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const tempMarkerRef = useRef(null);
    const markersRef = useRef([]);
    const routeLayers = useRef({}); // Lưu các đường route đang hiển thị
    const schoolBoundaryRef = useRef(null); // Lưu vùng trường học

    const [busStops, setBusStops] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [visibleFilter, setVisibleFilter] = useState('1');
    const [selectedRoute, setSelectedRoute] = useState('');
    const [visibleRoutes, setVisibleRoutes] = useState([]); // Routes được tick để hiển thị
    const [isEditMode, setIsEditMode] = useState(false);
    const [isCreateMode, setIsCreateMode] = useState(false); // Chế độ tạo route mới
    const [newRouteName, setNewRouteName] = useState(""); // Tên route mới
    const [selectedBusStops, setSelectedBusStops] = useState([]); // Trạm đã chọn khi edit/create

    // Icon trạm
    const busIconVisible = L.icon({
        iconUrl: "busstop.png",
        iconSize: [70, 70],
        iconAnchor: [35, 70],
        popupAnchor: [0, -70],
    });

    const busIconHidden = L.icon({
        iconUrl: "hehe.png",
        iconSize: [50, 50],
        iconAnchor: [25, 50],
        popupAnchor: [0, -50],
    });

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
            map.on("click", handleMapClick);

            // Vẽ vùng trường học
            schoolBoundaryRef.current = drawSchoolBoundary(map);
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

            // Kiểm tra xem trạm này có trong selectedBusStops không
            const orderIndex = selectedBusStops.indexOf(stop.id_busstop);
            const orderNumber = orderIndex >= 0 ? orderIndex + 1 : null;

            const marker = L.marker([stop.toado_x, stop.toado_y], { icon })
                .addTo(map);

            // Nếu đang ở chế độ edit và trạm đã được chọn, hiển thị số thứ tự
            if ((isEditMode || isCreateMode) && orderNumber) {
                const divIcon = L.divIcon({
                    className: 'bus-order-label',
                    html: `<div style="
                        background: #007bff;
                        color: white;
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        font-size: 16px;
                        border: 3px solid white;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    ">${orderNumber}</div>`,
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                });

                const orderMarker = L.marker([stop.toado_x, stop.toado_y], { icon: divIcon }).addTo(map);
                markersRef.current.push(orderMarker);
            }

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
                    </small><br>
                    ${!isEditMode ? `<button 
                        onclick="window.deleteStation('${stop.id_busstop}')"
                        style="
                            margin-top: 8px;
                            background-color: #dc3545;
                            color: white;
                            border: none;
                            padding: 5px 10px;
                            cursor: pointer;
                            border-radius: 4px;
                            font-size: 12px;
                        "
                    >🗑️ Xóa trạm</button>` : ''}
                </div>`
            );

            // Thêm sự kiện click cho marker khi ở chế độ edit hoặc create
            if (isEditMode || isCreateMode) {
                marker.on('click', () => handleBusStopClick(stop.id_busstop));
            }

            markersRef.current.push(marker);
        });
    };

    // Xử lý click trạm khi đang edit route
    const handleBusStopClick = (busStopId) => {
        const index = selectedBusStops.indexOf(busStopId);

        if (index >= 0) {
            // Nếu đã có trong danh sách, xóa nó và tất cả các trạm sau nó
            setSelectedBusStops(prev => prev.slice(0, index));
        } else {
            // Thêm vào cuối danh sách
            setSelectedBusStops(prev => [...prev, busStopId]);
        }
    };

    // Re-render markers khi selectedBusStops thay đổi
    useEffect(() => {
        if (isEditMode || isCreateMode) {
            renderBusStops(busStops);
        }
    }, [selectedBusStops, isEditMode, isCreateMode]);

    // Xóa trạm
    useEffect(() => {
        window.deleteStation = async (id) => {
            if (!window.confirm("⚠️ Bạn có chắc muốn xóa trạm này?")) {
                return;
            }

            try {
                const res = await deleteBusStop(id);

                if (res?.data?.errCode === 0 || res?.errCode === 0) {
                    alert("✅ Xóa trạm thành công!");
                    mapInstanceRef.current.closePopup();
                    fetchBusStops();
                } else {
                    alert("❌ " + (res?.data?.message || res?.message || "Lỗi khi xóa trạm"));
                }
            } catch (e) {
                console.error("❌ Lỗi khi xóa trạm:", e);
                alert("❌ Lỗi khi xóa trạm!");
            }
        };

        return () => {
            delete window.deleteStation;
        };
    }, []);

    // Click vào map để thêm trạm mới
    const handleMapClick = (e) => {
        if (isEditMode || isCreateMode) return; // Không cho thêm trạm khi đang edit/create route

        const { lat, lng } = e.latlng;
        const map = mapInstanceRef.current;

        if (tempMarkerRef.current) {
            map.removeLayer(tempMarkerRef.current);
        }

        const tempMarker = L.marker([lat, lng], { icon: busIconVisible }).addTo(map);
        tempMarkerRef.current = tempMarker;

        const popupContent = `
            <div style="padding: 10px; min-width: 220px;">
                <h4 style="margin: 0 0 10px 0; color: #007bff;">➕ Thêm trạm mới</h4>
                
                <label style="font-weight: 600; font-size: 13px;">🚌 Tên trạm:</label><br>
                <input 
                    id="busName" 
                    type="text" 
                    placeholder="VD: Trạm SGU" 
                    style="
                        width: 100%; 
                        padding: 6px; 
                        margin: 5px 0 10px 0; 
                        border-radius: 4px; 
                        border: 1px solid #ccc;
                        box-sizing: border-box;
                        font-size: 13px;
                    "
                ><br>
                
                <label style="font-weight: 600; font-size: 13px;">📝 Mô tả:</label><br>
                <textarea 
                    id="busDesc" 
                    placeholder="Mô tả trạm..." 
                    style="
                        width: 100%; 
                        padding: 6px; 
                        margin: 5px 0 10px 0; 
                        border-radius: 4px; 
                        border: 1px solid #ccc;
                        box-sizing: border-box;
                        font-size: 13px;
                        resize: vertical;
                        min-height: 50px;
                    "
                ></textarea><br>
                
                <label style="font-weight: 600; font-size: 13px;">👁️ Trạng thái:</label><br>
                <select 
                    id="busVisible"
                    style="
                        width: 100%; 
                        padding: 6px; 
                        margin: 5px 0 10px 0; 
                        border-radius: 4px; 
                        border: 1px solid #ccc;
                        box-sizing: border-box;
                        font-size: 13px;
                    "
                >
                    <option value="1">🟢 Hiển thị</option>
                    <option value="0">🔴 Ẩn</option>
                </select><br>
                
                <div style="display: flex; gap: 5px; margin-top: 10px;">
                    <button id="saveBtn" style="
                        flex: 1;
                        background-color: #28a745; 
                        color: white; 
                        border: none; 
                        padding: 8px 12px; 
                        cursor: pointer; 
                        border-radius: 4px;
                        font-weight: 600;
                        font-size: 13px;
                    ">✅ Lưu</button>
                    
                    <button id="cancelBtn" style="
                        flex: 1;
                        background-color: #6c757d; 
                        color: white; 
                        border: none; 
                        padding: 8px 12px; 
                        cursor: pointer; 
                        border-radius: 4px;
                        font-weight: 600;
                        font-size: 13px;
                    ">❌ Hủy</button>
                </div>
            </div>
        `;

        tempMarker.bindPopup(popupContent, {
            maxWidth: 320,
            className: 'custom-popup'
        }).openPopup();

        setTimeout(() => {
            const saveBtn = document.getElementById("saveBtn");
            const cancelBtn = document.getElementById("cancelBtn");
            const nameInput = document.getElementById("busName");
            const visibleSelect = document.getElementById("busVisible");

            if (nameInput) {
                nameInput.focus();
            }

            if (visibleSelect) {
                visibleSelect.addEventListener('change', (e) => {
                    const newIcon = e.target.value === '1' ? busIconVisible : busIconHidden;
                    tempMarkerRef.current.setIcon(newIcon);
                });
            }

            if (saveBtn) {
                saveBtn.onclick = () => saveBusStop(lat, lng);
            }

            if (cancelBtn) {
                cancelBtn.onclick = () => {
                    map.removeLayer(tempMarkerRef.current);
                    tempMarkerRef.current = null;
                    map.closePopup();
                };
            }

            if (nameInput) {
                nameInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        saveBusStop(lat, lng);
                    }
                });
            }
        }, 100);
    };

    const saveBusStop = async (lat, lng) => {
        const nameInput = document.getElementById("busName");
        const descInput = document.getElementById("busDesc");
        const visibleSelect = document.getElementById("busVisible");

        const name = nameInput?.value.trim();
        const describe = descInput?.value.trim() || "";
        const visible = parseInt(visibleSelect?.value || '1');

        if (!name) {
            alert("⚠️ Vui lòng nhập tên trạm!");
            nameInput?.focus();
            return;
        }

        const data = {
            name_station: name,
            toado_x: lat,
            toado_y: lng,
            describe: describe,
            visible: visible
        };

        try {
            const res = await createBusStop(data);

            const isSuccess = res?.data?.errCode === 0 || res?.errCode === 0;
            const errorMsg = res?.data?.message || res?.message;

            if (isSuccess) {
                alert("✅ Lưu trạm thành công!");

                if (tempMarkerRef.current) {
                    mapInstanceRef.current.removeLayer(tempMarkerRef.current);
                    tempMarkerRef.current = null;
                }

                mapInstanceRef.current.closePopup();

                if (visibleFilter !== 'all') {
                    if ((visibleFilter === '1' && visible === 0) || (visibleFilter === '0' && visible === 1)) {
                        setVisibleFilter('all');
                    } else {
                        await fetchBusStops();
                    }
                } else {
                    await fetchBusStops();
                }
            } else {
                alert("❌ " + (errorMsg || "Lỗi khi lưu trạm"));
            }
        } catch (e) {
            console.error("❌ Lỗi khi lưu trạm:", e);
            alert("❌ Lỗi khi lưu trạm: " + (e.message || "Không xác định"));
        }
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
                        { color: 'white', opacity: 1, weight: 9 }, // Viền trắng
                        { color: color, opacity: 0.8, weight: 5 }  // Màu chính
                    ]
                },
                createMarker: () => null, // Không tạo marker mặc định
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

    // Chọn route để edit
    const handleSelectRoute = async (routeId) => {
        setSelectedRoute(routeId);
        if (!routeId) return;

        // Load trạm của route
        try {
            const res = await getBusStopsByRoute(routeId);
            if (res?.data?.errCode === 0 && res?.data?.data) {
                const busStopIds = res.data.data.map(rbs => rbs.id_busstop);
                setSelectedBusStops(busStopIds);
            }
        } catch (e) {
            console.error("❌ Lỗi load route:", e);
        }
    };

    // Bắt đầu tạo route mới
    const handleStartCreateRoute = () => {
        setIsCreateMode(true);
        setNewRouteName("");
        setSelectedBusStops([]);
        setVisibleFilter('all'); // Hiện tất cả trạm
    };

    // Lưu route mới
    const handleSaveNewRoute = async () => {
        const routeName = newRouteName.trim();

        if (!routeName) {
            alert("⚠️ Vui lòng nhập tên tuyến đường!");
            return;
        }

        try {
            // Tạo route trước
            const createRes = await createNewRoute({ name_street: routeName });
            console.log("📤 Create route response:", createRes);

            if (createRes?.data?.errCode === 0 || createRes?.errCode === 0) {
                // Nếu có chọn trạm thì lưu luôn
                if (selectedBusStops.length >= 2) {
                    // Lấy route vừa tạo (route mới nhất)
                    await fetchRoutes();
                    const allRoutesRes = await getAllRoutes('ALL');

                    if (allRoutesRes?.data?.routes && allRoutesRes.data.routes.length > 0) {
                        const newRoute = allRoutesRes.data.routes[allRoutesRes.data.routes.length - 1];

                        // Lưu trạm vào route
                        const saveRes = await saveRouteBusStops(newRoute.id_route, selectedBusStops);

                        if (saveRes?.data?.errCode === 0 || saveRes?.errCode === 0) {
                            alert("✅ Tạo tuyến đường và lưu trạm thành công!");
                        } else {
                            alert("⚠️ Tạo tuyến thành công nhưng lỗi khi lưu trạm!");
                        }
                    }
                } else {
                    alert("✅ Tạo tuyến đường thành công!");
                }

                // Reset và tải lại
                setIsCreateMode(false);
                setNewRouteName("");
                setSelectedBusStops([]);
                await fetchRoutes();
                renderBusStops(busStops);

                window.location.reload()
            } else {
                const errorMsg = createRes?.data?.message || createRes?.message || "Lỗi không xác định";
                alert("❌ Lỗi khi tạo route: " + errorMsg);
            }
        } catch (e) {
            console.error("❌ Lỗi:", e);
            alert("❌ Lỗi khi tạo route: " + (e.response?.data?.message || e.message || "Không rõ"));
        }
    };

    // Hủy tạo route
    const handleCancelCreateRoute = () => {
        setIsCreateMode(false);
        setNewRouteName("");
        setSelectedBusStops([]);
        renderBusStops(busStops);
    };
    // Bắt đầu edit route
    const handleEditRoute = () => {
        if (!selectedRoute) {
            alert("⚠️ Vui lòng chọn route!");
            return;
        }
        if (isCreateMode) {
            alert("⚠️ Đang trong chế độ tạo route. Vui lòng hoàn tất trước!");
            return;
        }
        setIsEditMode(true);
        setVisibleFilter('all'); // Hiện tất cả trạm khi edit
    };

    // Lưu route sau khi edit
    const handleSaveRoute = async () => {
        if (!selectedRoute) {
            alert("⚠️ Vui lòng chọn route!");
            return;
        }

        if (selectedBusStops.length < 2) {
            alert("⚠️ Route phải có ít nhất 2 trạm!");
            return;
        }

        console.log("📤 Saving route:", selectedRoute);
        console.log("📤 Selected bus stops:", selectedBusStops);

        try {
            const res = await saveRouteBusStops(selectedRoute, selectedBusStops);
            console.log("📥 Response from API:", res);

            if (res?.data?.errCode === 0 || res?.errCode === 0) {
                alert("✅ Lưu route thành công!");
                setIsEditMode(false);
                setSelectedBusStops([]);

                // Refresh route trên map
                removeRoute(selectedRoute);
                if (visibleRoutes.includes(selectedRoute)) {
                    const colorIndex = routes.findIndex(r => r.id_route === selectedRoute);
                    drawRoute(selectedRoute, routeColors[colorIndex % routeColors.length]);
                }
            } else {
                const errorMsg = res?.data?.message || res?.message || "Không rõ lỗi";
                console.error("❌ Lỗi từ server:", errorMsg);
                alert("❌ Lỗi khi lưu route: " + errorMsg);
            }
        } catch (e) {
            console.error("❌ Lỗi chi tiết:", e);
            console.error("❌ Error response:", e.response);
            alert("❌ Lỗi khi lưu route: " + (e.response?.data?.message || e.message || "Không rõ"));
        }
    };

    // Hủy edit
    const handleCancelEdit = () => {
        setIsEditMode(false);
        setSelectedBusStops([]);
        renderBusStops(busStops);
    };

    // Xóa route
    const handleDeleteRoute = async () => {
        if (!selectedRoute) {
            alert("⚠️ Vui lòng chọn route!");
            return;
        }

        if (!window.confirm("⚠️ Bạn có chắc muốn xóa route này?")) {
            return;
        }

        try {
            const res = await deleteRoute(selectedRoute);
            if (res?.data?.errCode === 0 || res?.errCode === 0) {
                alert("✅ Xóa route thành công!");
                removeRoute(selectedRoute);
                setSelectedRoute('');
                setVisibleRoutes(prev => prev.filter(id => id !== selectedRoute));
                fetchRoutes();
            } else {
                alert("❌ Lỗi khi xóa route!");
            }
        } catch (e) {
            console.error("❌ Lỗi:", e);
            alert("❌ Lỗi khi xóa route!");
        }
    };

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            {/* Map */}
            <div style={{ flex: 1, position: "relative" }}>
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
                        disabled={isEditMode || isCreateMode}
                        style={{
                            padding: "8px 12px",
                            fontSize: "13px",
                            border: "1px solid #007bff",
                            borderRadius: "4px",
                            backgroundColor: (isEditMode || isCreateMode) ? "#e9ecef" : "white",
                            cursor: (isEditMode || isCreateMode) ? "not-allowed" : "pointer",
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

                <div ref={mapRef} style={{ width: "100%", height: "100%" }}></div>
            </div>

            {/* Sidebar */}
            <div style={{
                width: "320px",
                backgroundColor: "white",
                padding: "20px",
                boxShadow: "-2px 0 8px rgba(0,0,0,0.1)",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "20px"
            }}>
                <h3 style={{ margin: 0, color: "#007bff" }}>🗺️ Quản lý Route</h3>

                {/* Tạo Route mới */}
                {!isEditMode && !isCreateMode && (
                    <button
                        onClick={handleStartCreateRoute}
                        style={{
                            width: "100%",
                            padding: "10px",
                            backgroundColor: "#28a745",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontWeight: "600",
                            fontSize: "14px"
                        }}
                    >
                        ➕ Tạo tuyến mới
                    </button>
                )}

                {/* Form tạo route mới */}
                {isCreateMode && (
                    <div style={{
                        padding: "15px",
                        backgroundColor: "#e7f9ef",
                        border: "2px solid #28a745",
                        borderRadius: "4px"
                    }}>
                        <h4 style={{ margin: "0 0 10px 0", color: "#28a745" }}>➕ Tạo tuyến mới</h4>

                        <label style={{ fontWeight: "600", fontSize: "13px", display: "block", marginBottom: "5px" }}>
                            📝 Tên tuyến đường:
                        </label>
                        <input
                            type="text"
                            value={newRouteName}
                            onChange={(e) => setNewRouteName(e.target.value)}
                            placeholder="VD: Tuyến 01 - SGU"
                            style={{
                                width: "100%",
                                padding: "8px",
                                fontSize: "14px",
                                border: "1px solid #28a745",
                                borderRadius: "4px",
                                marginBottom: "10px",
                                boxSizing: "border-box"
                            }}
                        />

                        <div style={{
                            padding: "10px",
                            backgroundColor: "white",
                            borderRadius: "4px",
                            marginBottom: "10px",
                            fontSize: "13px",
                            color: "#495057"
                        }}>
                            <b>📌 Hướng dẫn:</b><br />
                            • Nhập tên tuyến<br />
                            • Click trạm trên map để thêm<br />
                            • Đã chọn: <b style={{ color: "#28a745" }}>{selectedBusStops.length}</b> trạm
                        </div>

                        <div style={{ display: "flex", gap: "8px" }}>
                            <button
                                onClick={handleSaveNewRoute}
                                style={{
                                    flex: 1,
                                    padding: "10px",
                                    backgroundColor: "#28a745",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                    fontSize: "13px"
                                }}
                            >
                                ✅ Xác nhận
                            </button>
                            <button
                                onClick={handleCancelCreateRoute}
                                style={{
                                    flex: 1,
                                    padding: "10px",
                                    backgroundColor: "#6c757d",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                    fontSize: "13px"
                                }}
                            >
                                ❌ Hủy
                            </button>
                        </div>
                    </div>
                )}

                {/* Chọn Route để Edit */}
                {!isCreateMode && (
                    <div>
                        <label
                            style={{
                                fontWeight: "600",
                                fontSize: "14px",
                                marginBottom: "8px",
                                display: "block"
                            }}
                        >
                            📍 Chọn Route:
                        </label>

                        <select
                            value={selectedRoute}
                            onChange={(e) => handleSelectRoute(e.target.value)}
                            disabled={isEditMode}
                            style={{
                                width: "100%",
                                padding: "8px",
                                fontSize: "14px",
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                                cursor: isEditMode ? "not-allowed" : "pointer",
                                backgroundColor: isEditMode ? "#e9ecef" : "white"
                            }}
                        >
                            <option value="">----- Chọn route -----</option>
                            {routes.map((route) => (
                                <option key={route.id_route} value={route.id_route}>
                                    {route.name_street}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Nút Edit/Delete */}
                <div style={{ display: "flex", gap: "10px" }}>
                    {!isEditMode ? (
                        <>
                            <button
                                onClick={handleEditRoute}
                                disabled={!selectedRoute}
                                style={{
                                    flex: 1,
                                    padding: "10px",
                                    backgroundColor: selectedRoute ? "#ffc107" : "#e9ecef",
                                    color: selectedRoute ? "white" : "#6c757d",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: selectedRoute ? "pointer" : "not-allowed",
                                    fontWeight: "600",
                                    fontSize: "13px"
                                }}
                            >
                                ✏️ Sửa
                            </button>
                            <button
                                onClick={handleDeleteRoute}
                                disabled={!selectedRoute}
                                style={{
                                    flex: 1,
                                    padding: "10px",
                                    backgroundColor: selectedRoute ? "#dc3545" : "#e9ecef",
                                    color: selectedRoute ? "white" : "#6c757d",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: selectedRoute ? "pointer" : "not-allowed",
                                    fontWeight: "600",
                                    fontSize: "13px"
                                }}
                            >
                                🗑️ Xóa
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleSaveRoute}
                                style={{
                                    flex: 1,
                                    padding: "10px",
                                    backgroundColor: "#28a745",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                    fontSize: "13px"
                                }}
                            >
                                ✅ Lưu
                            </button>
                            <button
                                onClick={handleCancelEdit}
                                style={{
                                    flex: 1,
                                    padding: "10px",
                                    backgroundColor: "#6c757d",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                    fontSize: "13px"
                                }}
                            >
                                ❌ Hủy
                            </button>
                        </>
                    )}
                </div>

                {/* Thông báo chế độ Edit */}
                {isEditMode && (
                    <div style={{
                        padding: "12px",
                        backgroundColor: "#fff3cd",
                        border: "1px solid #ffc107",
                        borderRadius: "4px",
                        fontSize: "13px",
                        color: "#856404"
                    }}>
                        <b>📌 Chế độ chỉnh sửa:</b><br />
                        • Click vào trạm để thêm/xóa<br />
                        • Đã chọn: <b>{selectedBusStops.length}</b> trạm
                    </div>
                )}

                <hr style={{ border: "none", borderTop: "1px solid #dee2e6" }} />

                {/* Hiển thị Routes */}
                <div>
                    <label style={{ fontWeight: "600", fontSize: "14px", marginBottom: "8px", display: "block" }}>
                        👁️ Hiển thị Routes:
                    </label>
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

            </div>
        </div>
    );
};

export default MapComponent;