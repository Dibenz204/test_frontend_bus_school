

import React, { useState, useEffect } from "react";
import Header from "@/components/ui/Header";
import { useTranslation } from "react-i18next";

const ParentPage = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [currentNotice, setCurrentNotice] = useState("");
  const [visible, setVisible] = useState(false);

  const handleMenuClick = (section) => {
    setActiveSection(section);
  };

  // 🔔 Danh sách thông báo tuần tự
  const notifications = [
    "Xe số 1 đang đến trường ABC",
    "Xe số 2 đã khởi hành từ điểm đón",
    "Xe số 3 sắp đến nhà học sinh Nguyễn An",
    "Xe số 4 đang đến điểm tập kết",
    "Xe số 5 đã hoàn thành chuyến sáng nay",
  ];

  useEffect(() => {
    let index = 0;
    setCurrentNotice(notifications[index]);
    setVisible(true);

    // 🎵 Hàm phát âm thanh khi có thông báo
    const playSound = () => {
      const audio = new Audio(
        "https://cdn.pixabay.com/download/audio/2022/03/15/audio_5d92a40a8e.mp3?filename=notification-2-126517.mp3"
      );
      audio.volume = 0.3;
      audio.play().catch(() => { });
    };

    playSound();

    // 🔄 Cứ mỗi 5s đổi thông báo kế tiếp
    const interval = setInterval(() => {
      setVisible(false); // ẩn dần thông báo

      setTimeout(() => {
        index = (index + 1) % notifications.length; // chuyển tuần tự
        setCurrentNotice(notifications[index]);
        setVisible(true);
        playSound();
      }, 500); // sau 0.5s mới đổi nội dung để hiệu ứng ẩn mượt
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* 🧭 Header */}
      <Header
        variant="parent"
        menuItems={[
          { label: t("Phụ huynh"), link: "phuhuynh", linkType: "section" },
          { label: t("Tài xế"), link: "taixe", linkType: "section" },
          { label: t("Học sinh"), link: "hocsinh", linkType: "section" },
          { label: t("Tuyến đường"), link: "tuyenduong", linkType: "section" },
          { label: t("Đánh giá"), link: "danhgia", linkType: "section" },
          { label: t("Lịch chạy"), link: "lichchay", linkType: "section" },
          { label: t("Thông báo"), link: "thongbao", linkType: "section" },
        ]}
        onMenuClick={handleMenuClick}
        showLogin={false}
        showLanguage={false}
      />

      {/* 📄 Nội dung từng section */}
      <main className="flex-1 p-8">
        {activeSection === "phuhuynh" && (
          <h1 className="text-3xl font-bold">Trang phụ huynh</h1>
        )}
        {activeSection === "taixe" && (
          <h1 className="text-3xl font-bold">Trang tài xế</h1>
        )}
        {activeSection === "hocsinh" && (
          <h1 className="text-3xl font-bold">Trang học sinh</h1>
        )}
        {activeSection === "tuyenduong" && (
          <h1 className="text-3xl font-bold">Tuyến đường</h1>
        )}
        {activeSection === "lichchay" && (
          <h1 className="text-3xl font-bold">Lịch chạy</h1>
        )}
        {activeSection === "thongbao" && (
          <h1 className="text-3xl font-bold">Trang thông báo</h1>
        )}
      </main>

      {/* 🚍 Cục thông báo nổi */}
      <div
        className={`fixed right-4 bottom-4 sm:right-8 sm:bottom-8 bg-orange-500 text-white px-5 py-3 sm:px-6 sm:py-4 rounded-2xl shadow-lg font-medium text-sm sm:text-base w-[90%] sm:w-auto max-w-sm transition-all duration-500 transform ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
      >
        🚍 {currentNotice}
      </div>
    </div>
  );
};

export default ParentPage;
