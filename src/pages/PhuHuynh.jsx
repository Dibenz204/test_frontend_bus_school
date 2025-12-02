import React, { useState } from "react";
import Header from "../components/ui/Header";
import { useTranslation } from "react-i18next";

import TheoDoiViTri from "../components/PhuHuynh/TheoDoiViTri";
import ThongTinPhuHuynh from "../components/PhuHuynh/ThongTinPhuHuynh";
import NotificationPanel from "../components/PhuHuynh/NotificationPanel";
import FloatingNotificationButton from "../components/PhuHuynh/FloatingNotificationButton";
import RequestEvaluate from "../components/PhuHuynh/RequestEvaluate";

import { useAuth } from "../components/ui/AuthContext";

const PhuHuynh = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState("theodoivitr");
  const [showOptions, setShowOptions] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { user } = useAuth();

  const handleMenuClick = (section) => {
    if (section !== activeSection) {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveSection(section);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const handleNotification = (type) => {
    setNotificationType(type);
    setShowNotification(true);
    setShowOptions(false);
    setTimeout(() => setShowNotification(false), 4000);
  };

  const renderSection = () => {
    switch (activeSection) {
      case "theodoivitri":
        return <TheoDoiViTri />;
      case "thongtinphuhuynh":
        return <ThongTinPhuHuynh />;
      case "thongbao":
        return <NotificationPanel />;
      case "yeucau":
        return <RequestEvaluate />;
      default:
        return <TheoDoiViTri />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header
        variant="parent"
        user={user}
        menuItems={[
          {
            label: t("header_parent.tracking"),
            link: "theodoivitri",
            linkType: "section",
          },
          {
            label: t("header_parent.infor"),
            link: "thongtinphuhuynh",
            linkType: "section",
          },
          {
            label: t("header_parent.notifications"),
            link: "thongbao",
            linkType: "section",
          },
          {
            label: t("header_parent.requests"),
            link: "yeucau",
            linkType: "section",
          }
        ]}

        onMenuClick={handleMenuClick}
        showLogin={false}
        showLanguage={false}
      />

      <main className="flex-1 p-8 mt-8 space-y-8">
        <div
          className={`transition-all duration-150 ease-in-out ${isTransitioning ? "opacity-0 transform translate-y-2" : "opacity-100 transform translate-y-0"
            }`}
        >
          {renderSection()}
        </div>
      </main>

      <FloatingNotificationButton
        onClick={() => setShowOptions(!showOptions)}
      />

      {/* {showOptions && (
        <div className="fixed bottom-20 right-6 animate-fade-in">
          <NotificationMenu onSelect={handleNotification} />
        </div>
      )} */}

      {showNotification && (
        <div
          className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-lg text-white transition-all duration-300 ${notificationType === "denGan" ? "bg-green-600" : "bg-red-600"
            } animate-slide-up`}
        >
          {notificationType === "denGan"
            ? "🚍 Xe sắp đến điểm đón!"
            : "⏰ Xe đang bị trễ, vui lòng chờ thêm một chút."}
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-in-out;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default PhuHuynh;
