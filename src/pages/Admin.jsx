import React, { useState } from "react";
import Header from "@/components/ui/Header";
import { useTranslation } from "react-i18next";
import AdminDashboard from "@/components/Admin/AdminDashboard";
import UserManagement from "@/components/Admin/UserManagement";
import RouteManagement from "@/components/Admin/RouteManagement";


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

  // const renderSection = () => {
  //   switch (activeSection) {
  //     case "dashboard":
  //       return <AdminDashboard />;
  //     case "phuhuynh":
  //       return <div className="text-2xl font-bold">Trang Quản lý Phụ huynh</div>;
  //     case "taixe":
  //       return <div className="text-2xl font-bold">Trang Quản lý Tài xế</div>;
  //     case "hocsinh":
  //       return <div className="text-2xl font-bold">Trang Quản lý Học sinh</div>;
  //     case "tuyenduong":
  //       return <h1 className="text-2xl font-bold">Trang Tuyến đường</h1>;
  //     case "danhgia":
  //       return <h1 className="text-2xl font-bold">Trang Đánh giá</h1>;
  //     case "lichchay":
  //       return <h1 className="text-2xl font-bold">Trang Lịch chạy</h1>;
  //     case "thongbao":
  //       return <h1 className="text-2xl font-bold">Trang Thông báo</h1>;
  //     case "quantrivien":
  //       return <h1 className="text-2xl font-bold">Trang Quản trị viên</h1>;
  //     default:
  //       return <AdminDashboard />;
  //   }
  // };

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
      case "obsrvation":
        return <Obsrvation />;
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
          { label: "Lịch trình", link: "schedule-management", linkType: "section" },
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
