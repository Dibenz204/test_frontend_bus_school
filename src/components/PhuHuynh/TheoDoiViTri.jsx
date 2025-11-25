import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import { getStudentsByParent } from "../../services/studentService";
import { getBusStopsByRoute } from "../../services/routeService";
import { drawSchoolBoundary } from "../SchoolBoundary";

// Fix Leaflet default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Map_PhuHuynh = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const routeLayersRef = useRef({});
  const schoolBoundaryRef = useRef(null);

  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Icon cho bus stop
  const busIcon = new L.Icon({
    iconUrl: "/busstop.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  // Check responsive
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    try {
      const map = L.map(mapRef.current).setView([10.762913, 106.682171], 15);
      map.zoomControl.setPosition('bottomleft');

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      mapInstanceRef.current = map;
      setMapReady(true);

      schoolBoundaryRef.current = drawSchoolBoundary(map);
      addResetViewControl(map);
      fetchStudentsData();

    } catch (error) {
      console.error("❌ Lỗi khởi tạo map:", error);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Fetch students data
  const fetchStudentsData = async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

      if (!userInfo) {
        console.error("❌ Chưa đăng nhập");
        return;
      }

      const response = await getStudentsByParent(userInfo.id_user);

      if (response.data.errCode === 0) {
        const studentsData = response.data.students || [];

        // ✅ DEBUG CHI TIẾT
        console.log("🔍 DEBUG STUDENTS DATA:", studentsData);
        studentsData.forEach((student, index) => {
          console.log(`📝 Student ${index + 1}:`, {
            name: student.name,
            hasBusStop: !!student.busstop,
            busstop: student.busstop,
            busstopId: student.busstop?.id_busstop,
            coordinates: student.busstop ? {
              toado_x: student.busstop.toado_x,
              toado_y: student.busstop.toado_y
            } : 'NO BUS STOP'
          });
        });

        setStudents(studentsData);
      }
    } catch (error) {
      console.error("❌ Lỗi load students:", error);
    } finally {
      setLoading(false);
    }
  };

  const addResetViewControl = (map) => {
    const resetControl = L.control({ position: 'topright' });

    resetControl.onAdd = function () {
      const div = L.DomUtil.create('div', 'reset-control');
      div.innerHTML = `
                <button style="
                    background: white;
                    border: 2px solid #007bff;
                    border-radius: 4px;
                    padding: ${isMobile ? '6px 8px' : '8px 12px'};
                    cursor: pointer;
                    font-weight: bold;
                    color: #007bff;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                    margin-top: ${isMobile ? '40px' : '48px'};
                    font-size: ${isMobile ? '12px' : '14px'};
                ">🏫 Về trường</button>
            `;

      div.onclick = () => {
        map.setView([10.758995, 106.682527], 16);
      };

      return div;
    };

    resetControl.addTo(map);
  };

  // Clear all markers and routes
  const clearMap = () => {
    // Clear markers
    markersRef.current.forEach(marker => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(marker);
      }
    });
    markersRef.current = [];

    // Clear routes
    Object.values(routeLayersRef.current).forEach(layer => {
      if (mapInstanceRef.current && layer) {
        mapInstanceRef.current.removeControl(layer);
      }
    });
    routeLayersRef.current = {};
  };

  // Handle student selection
  const handleStudentSelect = (studentId, checked) => {
    let newSelectedStudents;

    if (checked) {
      newSelectedStudents = [...selectedStudents, studentId];
    } else {
      newSelectedStudents = selectedStudents.filter(id => id !== studentId);
    }

    setSelectedStudents(newSelectedStudents);

    // Update map based on selection
    updateMapForSelectedStudents(newSelectedStudents);
  };

  // Select/deselect all
  const handleSelectAll = (checked) => {
    if (checked) {
      const allStudentIds = students.map(student => student.id_student);
      setSelectedStudents(allStudentIds);
      updateMapForSelectedStudents(allStudentIds);
    } else {
      setSelectedStudents([]);
      clearMap();
    }
  };

  // Update map based on selected students
  const updateMapForSelectedStudents = async (studentIds) => {
    if (!mapInstanceRef.current) return;

    clearMap();

    if (studentIds.length === 0) return;

    const selectedStudentsData = students.filter(student =>
      studentIds.includes(student.id_student)
    );

    console.log("🎯 Selected students:", selectedStudentsData);

    // Draw routes for each selected student
    for (const student of selectedStudentsData) {
      await drawStudentRoute(student);
    }

    // Fit map to show all routes
    if (markersRef.current.length > 0) {
      const group = new L.featureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  };

  // ✅ FIXED: Draw route for a single student với validation
  const drawStudentRoute = async (student) => {
    try {
      console.log(`🔄 Drawing route for student:`, student);

      // ✅ KIỂM TRA BUS STOP CÓ TỒN TẠI VÀ CÓ TỌA ĐỘ HỢP LỆ KHÔNG
      if (!student.busstop || !student.busstop.id_busstop) {
        console.warn(`⚠️ Student ${student.name} không có bus stop`);
        return;
      }

      const busStop = student.busstop;

      // ✅ KIỂM TRA TỌA ĐỘ
      if (typeof busStop.toado_x !== 'number' || typeof busStop.toado_y !== 'number' ||
        isNaN(busStop.toado_x) || isNaN(busStop.toado_y)) {
        console.warn(`⚠️ Tọa độ không hợp lệ cho student ${student.name}:`, {
          toado_x: busStop.toado_x,
          toado_y: busStop.toado_y
        });
        return;
      }

      console.log(`📍 Bus stop coordinates:`, {
        lat: busStop.toado_x,
        lng: busStop.toado_y
      });

      // ✅ THÊM MARKER CHO BUS STOP
      const busStopMarker = L.marker(
        [busStop.toado_x, busStop.toado_y],
        { icon: busIcon }
      ).addTo(mapInstanceRef.current);

      busStopMarker.bindPopup(`
                <div style="text-align: center; min-width: ${isMobile ? '150px' : '200px'};">
                    <b style="font-size: ${isMobile ? '12px' : '14px'};">
                        🚌 ${busStop.name_station || 'Điểm dừng'}
                    </b><br>
                    <small style="color: #666; font-size: ${isMobile ? '10px' : '12px'};">
                        Học sinh: ${student.name}
                    </small><br>
                    <small style="color: #666; font-size: ${isMobile ? '10px' : '12px'};">
                        Lớp: ${student.class}
                    </small><br>
                    <small style="color: #999; font-size: ${isMobile ? '9px' : '11px'};">
                        📍 ${busStop.toado_x.toFixed(6)}, ${busStop.toado_y.toFixed(6)}
                    </small>
                </div>
            `);

      markersRef.current.push(busStopMarker);

      // ✅ THỬ LẤY ROUTE TỪ BUS STOP (nếu có API)
      try {
        const routeResponse = await getBusStopsByRoute(busStop.id_busstop);

        if (routeResponse.data.errCode === 0 && routeResponse.data.data &&
          routeResponse.data.data.length > 0) {

          const routeBusStops = routeResponse.data.data;
          console.log(`🛣️ Found route with ${routeBusStops.length} stops`);

          // ✅ LỌC CÁC BUS STOP CÓ TỌA ĐỘ HỢP LỆ
          const validBusStops = routeBusStops.filter(rbs =>
            rbs.busStop &&
            typeof rbs.busStop.toado_x === 'number' &&
            typeof rbs.busStop.toado_y === 'number' &&
            !isNaN(rbs.busStop.toado_x) &&
            !isNaN(rbs.busStop.toado_y)
          );

          if (validBusStops.length >= 2) {
            const waypoints = validBusStops.map(rbs =>
              L.latLng(rbs.busStop.toado_x, rbs.busStop.toado_y)
            );

            console.log(`📍 Valid waypoints:`, waypoints);

            const routingControl = L.Routing.control({
              waypoints: waypoints,
              routeWhileDragging: false,
              addWaypoints: false,
              draggableWaypoints: false,
              fitSelectedRoutes: false,
              showAlternatives: false,
              lineOptions: {
                styles: [
                  { color: 'white', opacity: 1, weight: 8 },
                  { color: '#007bff', opacity: 0.8, weight: 4 }
                ]
              },
              createMarker: () => null,
            }).addTo(mapInstanceRef.current);

            // Hide routing control UI
            const container = routingControl.getContainer();
            if (container) {
              container.style.display = 'none';
            }

            routeLayersRef.current[student.id_student] = routingControl;
            console.log(`✅ Route drawn for student ${student.name}`);
          } else {
            console.warn(`⚠️ Không đủ bus stop hợp lệ để vẽ route cho ${student.name}`);
          }
        } else {
          console.log(`ℹ️ Không tìm thấy route cho bus stop ${busStop.id_busstop}`);
        }
      } catch (routeError) {
        console.warn(`⚠️ Không thể lấy route cho student ${student.name}:`, routeError);
        // Vẫn hiển thị marker bus stop dù không có route
      }

    } catch (error) {
      console.error(`❌ Lỗi vẽ route cho học sinh ${student.name}:`, error);
    }
  };

  return (
    <div style={{
      position: "relative",
      height: "calc(100vh - 60px)",
      width: "100%",
      display: "flex"
    }}>
      {/* Sidebar - Danh sách học sinh */}
      <div style={{
        width: isMobile ? "100%" : "350px",
        height: "100%",
        backgroundColor: "white",
        boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
        zIndex: 1000,
        display: isMobile ? (selectedStudents.length > 0 ? "none" : "block") : "block",
        overflowY: "auto",
        padding: "16px"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          paddingBottom: "12px",
          borderBottom: "1px solid #e5e5e5"
        }}>
          <h3 style={{ margin: 0, color: "#333" }}>
            👨‍👩‍👧‍👦 Học sinh ({students.length})
          </h3>
          <button
            onClick={fetchStudentsData}
            style={{
              background: "#007bff",
              border: "none",
              borderRadius: "4px",
              padding: "6px 10px",
              cursor: "pointer",
              color: "white",
              fontSize: "12px"
            }}
          >
            🔄
          </button>
        </div>

        {/* Select All */}
        <div style={{ marginBottom: "12px" }}>
          <label style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold"
          }}>
            <input
              type="checkbox"
              checked={selectedStudents.length === students.length && students.length > 0}
              onChange={(e) => handleSelectAll(e.target.checked)}
              style={{ cursor: "pointer" }}
            />
            Chọn tất cả
          </label>
        </div>

        {/* Students List */}
        <div style={{ maxHeight: "calc(100% - 100px)", overflowY: "auto" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
              🔄 Đang tải...
            </div>
          ) : students.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
              📝 Chưa có học sinh nào
            </div>
          ) : (
            students.map((student) => (
              <div
                key={student.id_student}
                style={{
                  padding: "12px",
                  marginBottom: "8px",
                  border: "1px solid #e5e5e5",
                  borderRadius: "8px",
                  backgroundColor: selectedStudents.includes(student.id_student)
                    ? "#f0f8ff"
                    : "white",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onClick={() => {
                  const isSelected = selectedStudents.includes(student.id_student);
                  handleStudentSelect(student.id_student, !isSelected);
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id_student)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleStudentSelect(student.id_student, e.target.checked);
                    }}
                    style={{ cursor: "pointer" }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: "bold",
                      fontSize: "14px",
                      color: "#333"
                    }}>
                      {student.name}
                    </div>
                    <div style={{
                      fontSize: "12px",
                      color: "#666",
                      marginTop: "4px"
                    }}>
                      Lớp: {student.class}
                    </div>
                    <div style={{
                      fontSize: "11px",
                      color: student.busstop ? "#28a745" : "#dc3545",
                      marginTop: "2px"
                    }}>
                      {student.busstop ?
                        `🚌 ${student.busstop.name_station}` :
                        "❌ Chưa có điểm dừng"}
                    </div>
                    {student.busstop && (
                      <div style={{
                        fontSize: "10px",
                        color: "#999",
                        marginTop: "2px"
                      }}>
                        📍 {student.busstop.toado_x?.toFixed(6)}, {student.busstop.toado_y?.toFixed(6)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Map */}
      <div style={{
        flex: 1,
        height: "100%",
        position: "relative"
      }}>
        {!mapReady && (
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            backgroundColor: "#f5f5f5",
            color: "#666"
          }}>
            <div>🔄 Đang khởi tạo bản đồ...</div>
          </div>
        )}

        <div
          ref={mapRef}
          style={{
            width: "100%",
            height: "100%",
            minHeight: "500px"
          }}
        />

        {/* Mobile toggle button */}
        {isMobile && selectedStudents.length > 0 && (
          <button
            onClick={() => setSelectedStudents([])}
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              zIndex: 1000,
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "8px 12px",
              cursor: "pointer",
              fontSize: "12px"
            }}
          >
            ← Danh sách
          </button>
        )}
      </div>
    </div>
  );
};

export default Map_PhuHuynh;