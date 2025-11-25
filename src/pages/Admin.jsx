import React, { useState } from "react";
import Header from "@/components/ui/Header";
import { useTranslation } from "react-i18next";
import AdminDashboard from "@/components/Admin/AdminDashboard";
import UserManagement from "@/components/Admin/UserManagement";
import RouteManagement from "@/components/Admin/RouteManagement";
import StudentManagement from "@/components/Admin/StudentManagement";
import ScheduleManagement from "@/components/Admin/ScheduleManagement";
import Observation from "@/components/Admin/Observation";

const Admin = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleMenuClick = (section) => {
    if (section !== activeSection) {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveSection(section);
        setIsTransitioning(false);
      }, 150);
    }
  };


  const renderSection = () => {
    switch (activeSection) {
      case "user-management":
        return <UserManagement />;
      case "dashboard":
        return <AdminDashboard />;
      case "route-management":
        return <RouteManagement />;
      case "student-management":
        return <StudentManagement />;
      case "schedule-management":
        return <ScheduleManagement />;
      case "observation":
        return <Observation />;
      default:
        return <UserManagement />;
    }
  };


  return (
    <div>
      <Header
        variant="admin"
        menuItems={[
          { label: "Thống kê", link: "dashboard", linkType: "section" },
          { label: "Người dùng", link: "user-management", linkType: "section" },
          { label: "Tuyến đường", link: "route-management", linkType: "section" },
          { label: "Học sinh", link: "student-management", linkType: "section" },
          { label: "Bus & Lịch trình", link: "schedule-management", linkType: "section" },
          { label: "Giám sát", link: "observation", linkType: "section" },
        ]}
        onMenuClick={handleMenuClick}
        showLogin={false}
      />

      <main className="mt-20">
        {renderSection()}  {/* ✅ Component sẽ thay đổi ở đây */}
      </main>
    </div>
  );
};

export default Admin;
