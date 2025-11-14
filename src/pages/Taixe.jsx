import React, { useState, useEffect, useRef } from "react";
import Header from "@/components/ui/Header";
import { useTranslation } from "react-i18next";
import LichLamViec from "@/components/ui/LichLamViec";
import DanhSachHocSinh from "@/components/ui/DanhSachHocSinh";
import BaoCaoSuCoXe from "@/components/ui/BaoCaoSuCoXe";
import Map_Driver from "@/components/ui/Map_Driver";
import { io } from 'socket.io-client';

const Taixe = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState("danhsachhocsinh");

  // GPS States
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isGPSActive, setIsGPSActive] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const watchIdRef = useRef(null);

  // Lấy thông tin driver
  const getDriverInfo = () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      return userInfo;
    } catch (error) {
      console.error("❌ Lỗi lấy thông tin driver:", error);
      return null;
    }
  };

  const driverInfo = getDriverInfo();

  // 🔌 Kết nối Socket.IO khi component mount
  useEffect(() => {
    if (!driverInfo || driverInfo.role !== "Tài xế") {
      console.log("❌ Không phải tài xế hoặc chưa đăng nhập");
      return;
    }

    const SOCKET_URL = window.location.hostname === 'localhost'
      ? 'http://localhost:5001'
      : 'https://be-bus-school.onrender.com';

    console.log(`🔌 Đang kết nối tới ${SOCKET_URL}/gps...`);

    const socketInstance = io(`${SOCKET_URL}/gps`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketInstance.on('connect', () => {
      console.log(`✅ Socket connected: ${socketInstance.id}`);
      setIsConnected(true);

      // Đăng ký driver
      socketInstance.emit('register-driver', {
        id_driver: driverInfo.id_driver
      });

      console.log(`🟢 Driver ${driverInfo.id_driver} registered`);
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('location-error', (error) => {
      console.error('❌ Location error from server:', error);
    });

    setSocket(socketInstance);

    // Cleanup khi unmount
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  // 📍 Bật GPS tracking khi socket đã kết nối
  useEffect(() => {
    if (!socket || !isConnected || !driverInfo) return;

    const startGPSTracking = () => {
      if (!navigator.geolocation) {
        console.error('❌ Trình duyệt không hỗ trợ GPS!');
        alert('Trình duyệt không hỗ trợ GPS!');
        return;
      }

      console.log(`🟢 Bắt đầu tracking GPS cho driver: ${driverInfo.id_driver}`);
      setIsGPSActive(true);

      // Thông báo GPS đã bật
      socket.emit('toggle-gps-status', {
        id_driver: driverInfo.id_driver,
        status: true
      });

      // Lấy vị trí ngay lập tức
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          sendLocationUpdate(latitude, longitude);
        },
        (error) => {
          console.error(`❌ GPS Error: ${error.message}`);
        }
      );

      // Theo dõi realtime
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          sendLocationUpdate(latitude, longitude);
        },
        (error) => {
          console.error(`❌ GPS Error: ${error.message}`);
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
        id_driver: driverInfo.id_driver,
        toado_x: latitude,
        toado_y: longitude,
        id_user: driverInfo.id_user
      };

      console.log(`📤 Sending location: [${latitude.toFixed(5)}, ${longitude.toFixed(5)}]`);
      socket.emit('update-location', locationData);
    };

    // Bật GPS sau khi socket connected
    startGPSTracking();

    // Cleanup: Tắt GPS khi component unmount
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      if (socket) {
        socket.emit('toggle-gps-status', {
          id_driver: driverInfo.id_driver,
          status: false
        });
      }

      console.log('🔴 GPS tracking stopped');
      setIsGPSActive(false);
    };
  }, [socket, isConnected]);

  const handleMenuClick = (section) => {
    console.log("🟡 " + t("driverPage.logs.selectedItem"), section);
    setActiveSection(section);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* HEADER */}
      <Header
        variant="parent"
        menuItems={[
          { label: t("driverPage.menu.workSchedule"), link: "lichlamviec", linkType: "section" },
          { label: t("driverPage.menu.studentList"), link: "danhsachhocsinh", linkType: "section" },
          { label: t("driverPage.menu.route"), link: "tuyenduong", linkType: "section" },
        ]}
        onMenuClick={handleMenuClick}
        showLogin={false}
        showLanguage={false}
      />

      {/* GPS Status Indicator - Fixed ở góc trên phải */}
      <div className="fixed top-20 right-6 z-40 bg-white rounded-lg shadow-lg p-3 border-2 border-green-500">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isGPSActive && isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
          <span className="text-sm font-semibold">
            {isGPSActive && isConnected ? '🟢 GPS Active' : '⚪ GPS Inactive'}
          </span>
        </div>
        {currentLocation && (
          <div className="text-xs text-gray-600 mt-1 font-mono">
            📍 {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
          </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 mt-8 overflow-y-auto">
        <div key={activeSection}>
          {activeSection === "lichlamviec" && <LichLamViec />}
          {activeSection === "danhsachhocsinh" && <DanhSachHocSinh />}

          {activeSection === "tuyenduong" && (
            <div className="relative z-0">
              <Map_Driver currentLocation={currentLocation} driverInfo={driverInfo} />
            </div>
          )}
        </div>
      </main>

      {/* ALWAYS AT THE BOTTOM */}
      <div className="mt-auto z-50 relative">
        <BaoCaoSuCoXe />
      </div>
    </div>
  );
};

export default Taixe;

// import React, { useState } from "react";
// import Header from "@/components/ui/Header";
// import LiveMap from "@/components/LiveMap";
// import { useTranslation } from "react-i18next";
// import LichLamViec from "@/components/ui/LichLamViec";
// import DanhSachHocSinh from "@/components/ui/DanhSachHocSinh";
// import BaoCaoSuCoXe from "@/components/ui/BaoCaoSuCoXe";
// import Map_Driver from "@/components/ui/Map_Driver";

// const Taixe = () => {
//   const { t } = useTranslation();
//   const [activeSection, setActiveSection] = useState("danhsachhocsinh");

//   const handleMenuClick = (section) => {
//     console.log("🟡 " + t("driverPage.logs.selectedItem"), section);
//     setActiveSection(section);
//   };

//   return (
//     <div className="min-h-screen flex flex-col bg-gray-50">
//       {/* HEADER */}
//       <Header
//         variant="parent"
//         menuItems={[
//           { label: t("driverPage.menu.workSchedule"), link: "lichlamviec", linkType: "section" },
//           { label: t("driverPage.menu.studentList"), link: "danhsachhocsinh", linkType: "section" },
//           { label: t("driverPage.menu.route"), link: "tuyenduong", linkType: "section" },
//         ]}
//         onMenuClick={handleMenuClick}
//         showLogin={false}
//         showLanguage={false}
//       />

//       {/* MAIN CONTENT */}
//       <main className="flex-1 p-8 mt-8 overflow-y-auto">
//         <div key={activeSection}>
//           {activeSection === "lichlamviec" && <LichLamViec />}
//           {activeSection === "danhsachhocsinh" && <DanhSachHocSinh />}

//           {activeSection === "tuyenduong" && (
//             <div className="relative z-0">
//               <Map_Driver />
//             </div>
//           )}
//         </div>
//       </main>

//       {/* ALWAYS AT THE BOTTOM */}
//       <div className="mt-auto z-50 relative">
//         <BaoCaoSuCoXe />
//       </div>
//     </div>
//   );
// };

// export default Taixe;

// // import React, { useState } from "react";
// // import Header from "@/components/ui/Header";
// // import LiveMap from "@/components/LiveMap";
// // import { useTranslation } from "react-i18next";
// // import LichLamViec from "@/components/ui/LichLamViec";
// // import DanhSachHocSinh from "@/components/ui/DanhSachHocSinh";
// // import BaoCaoSuCoXe from "@/components/ui/BaoCaoSuCoXe";
// // import Map_Driver from "@/components/ui/Map_Driver";

// // const Taixe = () => {
// //   const { t } = useTranslation();
// //   const [activeSection, setActiveSection] = useState("danhsachhocsinh");

// //   const handleMenuClick = (section) => {
// //     console.log("🟡 " + t("driverPage.logs.selectedItem"), section);
// //     setActiveSection(section);
// //   };

// //   return (
// //     <div className="min-h-screen flex flex-col bg-gray-50">
// //       {/* HEADER */}
// //       <Header
// //         variant="parent"
// //         menuItems={[
// //           { label: t("driverPage.menu.workSchedule"), link: "lichlamviec", linkType: "section" },
// //           { label: t("driverPage.menu.studentList"), link: "danhsachhocsinh", linkType: "section" },
// //           // { label: t("driverPage.menu.pickupReport"), link: "baocao", linkType: "section" },
// //           { label: t("driverPage.menu.route"), link: "tuyenduong", linkType: "section" },
// //         ]}
// //         onMenuClick={handleMenuClick}
// //         showLogin={false}
// //         showLanguage={false}
// //       />

// //       {/* MAIN CONTENT */}
// //       <main className="flex-1 p-8 mt-8 overflow-y-auto">
// //         <div key={activeSection}>
// //           {activeSection === "lichlamviec" && <LichLamViec />}
// //           {activeSection === "danhsachhocsinh" && <DanhSachHocSinh />}

// //           {/* {activeSection === "baocao" && (
// //             <div className="bg-white shadow-lg p-6 rounded-2xl">
// //               <h1 className="text-3xl font-bold mb-4">
// //                 📝 {t("driverPage.report.title")}
// //               </h1>
// //               <p className="text-gray-700">
// //                 {t("driverPage.report.description")}
// //               </p>
// //             </div>
// //           )} */}

// //           {activeSection === "tuyenduong" && (
// //             <div className="relative z-0">
// //               <Map_Driver />
// //             </div>
// //           )}
// //         </div>
// //       </main>

// //       {/* ALWAYS AT THE BOTTOM */}
// //       <div className="mt-auto z-50 relative">
// //         <BaoCaoSuCoXe />
// //       </div>
// //     </div>
// //   );
// // };

// // export default Taixe;