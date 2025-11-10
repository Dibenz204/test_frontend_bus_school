

// import React, { useState } from "react";
// import Header from "@/components/ui/Header";
// import { useTranslation } from "react-i18next";
// import { motion, AnimatePresence } from "framer-motion";
// import { Bell } from "lucide-react";

// // 👩‍👩‍👧 Các component con cơ bản (có thể tách riêng sau)
// const TheoDoiViTri = () => (
//   <div className="bg-white shadow-lg p-6 rounded-2xl">
//     <h1 className="text-3xl font-bold mb-4">📍 Theo dõi vị trí con</h1>
//     <p className="mb-4 text-gray-600">
//       Bản đồ hiển thị vị trí hiện tại của xe đưa đón con bạn.
//     </p>
//     <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
//       (Bản đồ giả lập)
//     </div>
//   </div>
// );

// const ThongTinPhuHuynh = () => (
//   <div className="bg-white shadow-lg p-6 rounded-2xl">
//     <h2 className="text-2xl font-semibold mb-4">👨‍👩‍👧 Thông tin phụ huynh</h2>
//     <div className="text-gray-700 space-y-2">
//       <p>
//         <strong>Họ tên:</strong> Trương Thị Ngọc Nhi
//       </p>
//       <p>
//         <strong>Số điện thoại:</strong> 0909 123 456
//       </p>
//       <p>
//         <strong>Con:</strong> Nguyễn Văn A – Lớp 5A
//       </p>
//       <p>
//         <strong>Tuyến xe:</strong> Xe số 03 – Trường Tiểu học Bình Minh
//       </p>
//     </div>
//   </div>
// );

// const LichSuThongBao = () => (
//   <div className="bg-white shadow-lg p-6 rounded-2xl">
//     <h2 className="text-2xl font-semibold mb-4">🔔 Lịch sử thông báo</h2>
//     <ul className="list-disc pl-6 space-y-2 text-gray-700">
//       <li>Xe 03 sắp đến điểm đón lúc 7:10 sáng</li>
//       <li>Xe 03 bị trễ 5 phút do kẹt xe</li>
//       <li>Xe 03 đã đón học sinh lúc 7:18 sáng</li>
//     </ul>
//   </div>
// );

// const PhuHuynh = () => {
//   const { t } = useTranslation();
//   const [activeSection, setActiveSection] = useState("theodoivitr");
//   const [showOptions, setShowOptions] = useState(false);
//   const [showNotification, setShowNotification] = useState(false);
//   const [notificationType, setNotificationType] = useState(null);

//   const handleMenuClick = (section) => {
//     console.log("🟡 Đã chọn mục:", section);
//     setActiveSection(section);
//   };

//   const handleNotification = (type) => {
//     setNotificationType(type);
//     setShowNotification(true);
//     setShowOptions(false);
//     setTimeout(() => setShowNotification(false), 4000);
//   };

//   return (
//     <div className="min-h-screen flex flex-col bg-gray-50">
//       {/* Header */}
//       <Header
//         variant="parent"
//         menuItems={[
//           {
//             label: t("Theo dõi vị trí"),
//             link: "theodoivitr",
//             linkType: "section",
//           },
//           {
//             label: t("Thông tin phụ huynh"),
//             link: "thongtinphuhuynh",
//             linkType: "section",
//           },
//           {
//             label: t("Lịch sử thông báo"),
//             link: "lichsuthongbao",
//             linkType: "section",
//           },
//         ]}
//         onMenuClick={handleMenuClick}
//         showLogin={false}
//         showLanguage={false}
//       />

//       {/* Nội dung chính */}
//       <main className="flex-1 p-8 mt-8 space-y-8">
//         <AnimatePresence mode="wait">
//           <motion.div
//             key={activeSection}
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -10 }}
//             transition={{ duration: 0.3 }}
//           >
//             {activeSection === "theodoivitr" && <TheoDoiViTri />}
//             {activeSection === "thongtinphuhuynh" && <ThongTinPhuHuynh />}
//             {activeSection === "lichsuthongbao" && <LichSuThongBao />}
//           </motion.div>
//         </AnimatePresence>
//       </main>

//       {/* Nút tròn thông báo */}
//       <motion.button
//         animate={{ opacity: [1, 0.6, 1] }}
//         transition={{ repeat: Infinity, duration: 1 }}
//         onClick={() => setShowOptions(!showOptions)}
//         className="fixed bottom-8 right-8 bg-yellow-500 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
//       >
//         <Bell size={28} />
//       </motion.button>

//       {/* Menu chọn thông báo */}
//       <AnimatePresence>
//         {showOptions && (
//           <motion.div
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: 10 }}
//             className="fixed bottom-28 right-8 bg-white shadow-lg rounded-2xl p-4 w-60 space-y-3 border border-gray-100"
//           >
//             <button
//               onClick={() => handleNotification("denGan")}
//               className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
//             >
//               🚍 Xe sắp đến gần
//             </button>
//             <button
//               onClick={() => handleNotification("tre")}
//               className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
//             >
//               ⏰ Xe bị trễ
//             </button>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Thông báo nổi */}
//       <AnimatePresence>
//         {showNotification && (
//           <motion.div
//             initial={{ opacity: 0, y: 50 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: 50 }}
//             className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-lg text-white ${notificationType === "denGan" ? "bg-green-600" : "bg-red-600"
//               }`}
//           >
//             {notificationType === "denGan"
//               ? "🚍 Xe sắp đến điểm đón!"
//               : "⏰ Xe đang bị trễ, vui lòng chờ thêm một chút."}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default PhuHuynh;

import React, { useState } from "react";
import Header from "@/components/ui/Header";
import { useTranslation } from "react-i18next";
import { Bell } from "lucide-react";

// 👩‍👩‍👧 Các component con cơ bản (có thể tách riêng sau)
const TheoDoiViTri = () => (
  <div className="bg-white shadow-lg p-6 rounded-2xl">
    <h1 className="text-3xl font-bold mb-4">📍 Theo dõi vị trí con</h1>
    <p className="mb-4 text-gray-600">
      Bản đồ hiển thị vị trí hiện tại của xe đưa đón con bạn.
    </p>
    <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
      (Bản đồ giả lập)
    </div>
  </div>
);

const ThongTinPhuHuynh = () => (
  <div className="bg-white shadow-lg p-6 rounded-2xl">
    <h2 className="text-2xl font-semibold mb-4">👨‍👩‍👧 Thông tin phụ huynh</h2>
    <div className="text-gray-700 space-y-2">
      <p>
        <strong>Họ tên:</strong> Trương Thị Ngọc Nhi
      </p>
      <p>
        <strong>Số điện thoại:</strong> 0909 123 456
      </p>
      <p>
        <strong>Con:</strong> Nguyễn Văn A – Lớp 5A
      </p>
      <p>
        <strong>Tuyến xe:</strong> Xe số 03 – Trường Tiểu học Bình Minh
      </p>
    </div>
  </div>
);

const LichSuThongBao = () => (
  <div className="bg-white shadow-lg p-6 rounded-2xl">
    <h2 className="text-2xl font-semibold mb-4">🔔 Lịch sử thông báo</h2>
    <ul className="list-disc pl-6 space-y-2 text-gray-700">
      <li>Xe 03 sắp đến điểm đón lúc 7:10 sáng</li>
      <li>Xe 03 bị trễ 5 phút do kẹt xe</li>
      <li>Xe 03 đã đón học sinh lúc 7:18 sáng</li>
    </ul>
  </div>
);

const PhuHuynh = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState("theodoivitr");
  const [showOptions, setShowOptions] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState(null);

  const handleMenuClick = (section) => {
    console.log("🟡 Đã chọn mục:", section);
    setActiveSection(section);
  };

  const handleNotification = (type) => {
    setNotificationType(type);
    setShowNotification(true);
    setShowOptions(false);
    setTimeout(() => setShowNotification(false), 4000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header
        variant="parent"
        menuItems={[
          {
            label: t("Theo dõi vị trí"),
            link: "theodoivitr",
            linkType: "section",
          },
          {
            label: t("Thông tin phụ huynh"),
            link: "thongtinphuhuynh",
            linkType: "section",
          },
          {
            label: t("Lịch sử thông báo"),
            link: "lichsuthongbao",
            linkType: "section",
          },
        ]}
        onMenuClick={handleMenuClick}
        showLogin={false}
        showLanguage={false}
      />

      {/* Nội dung chính */}
      <main className="flex-1 p-8 mt-8 space-y-8">
        <div key={activeSection} className="transition-all duration-300">
          {activeSection === "theodoivitr" && <TheoDoiViTri />}
          {activeSection === "thongtinphuhuynh" && <ThongTinPhuHuynh />}
          {activeSection === "lichsuthongbao" && <LichSuThongBao />}
        </div>
      </main>

      {/* Nút tròn thông báo */}
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="fixed bottom-8 right-8 bg-yellow-500 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      >
        <Bell size={28} />
      </button>

      {/* Menu chọn thông báo */}
      {showOptions && (
        <div className="fixed bottom-28 right-8 bg-white shadow-lg rounded-2xl p-4 w-60 space-y-3 border border-gray-100 transition-all duration-300">
          <button
            onClick={() => handleNotification("denGan")}
            className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
          >
            🚍 Xe sắp đến gần
          </button>
          <button
            onClick={() => handleNotification("tre")}
            className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
          >
            ⏰ Xe bị trễ
          </button>
        </div>
      )}

      {/* Thông báo nổi */}
      {showNotification && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-lg text-white transition-all duration-300 ${notificationType === "denGan" ? "bg-green-600" : "bg-red-600"
          }`}>
          {notificationType === "denGan"
            ? "🚍 Xe sắp đến điểm đón!"
            : "⏰ Xe đang bị trễ, vui lòng chờ thêm một chút."}
        </div>
      )}
    </div>
  );
};

export default PhuHuynh;