import React, { useState } from "react";
import Header from "@/components/ui/Header";
import { useTranslation } from "react-i18next";
import AdminDashboard from "@/components/Admin/AdminDashboard";
import UserManagement from "@/components/Admin/UserManagement";
import RouteManagement from "@/components/Admin/RouteManagement";
import StudentManagement from "@/components/Admin/StudentManagement";
import ScheduleManagement from "@/components/Admin/ScheduleManagement";
import Observation from "@/components/Admin/Observation";
import RequestEvaluateManagement from "@/components/Admin/RequestEvaluationManagement";

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
      case "request-evaluate-management":
        return <RequestEvaluateManagement />;
      default:
        return <UserManagement />;
    }
  };


  return (
    <div>
      <Header
        variant="admin"
        menuItems={[
          { label: t("header_admin.dashboard"), link: "dashboard", linkType: "section" },
          { label: t("header_admin.user"), link: "user-management", linkType: "section" },
          { label: t("header_admin.route"), link: "route-management", linkType: "section" },
          { label: t("header_admin.student"), link: "student-management", linkType: "section" },
          { label: t("header_admin.schedule_bus"), link: "schedule-management", linkType: "section" },
          { label: t("header_admin.observation"), link: "observation", linkType: "section" },
          { label: t("header_admin.request&evaluation"), link: "request-evaluate-management", linkType: "section" },
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
