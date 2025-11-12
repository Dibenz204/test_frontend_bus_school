import React, { useState } from "react";
import Header from "@/components/ui/Header";
import LiveMap from "@/components/LiveMap";
import { useTranslation } from "react-i18next";
import LichLamViec from "@/components/ui/LichLamViec";
import DanhSachHocSinh from "@/components/ui/DanhSachHocSinh";
import BaoCaoSuCoXe from "@/components/ui/BaoCaoSuCoXe";
import Map_Driver from "@/components/ui/Map_Driver"

const Taixe = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState("danhsachhocsinh");

  const handleMenuClick = (section) => {
    console.log("🟡 Đã chọn mục:", section);
    setActiveSection(section);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* HEADER */}
      <Header
        variant="parent"
        menuItems={[
          {
            label: t("Lịch làm việc"),
            link: "lichlamviec",
            linkType: "section",
          },
          {
            label: t("Danh sách học sinh"),
            link: "danhsachhocsinh",
            linkType: "section",
          },
          { label: t("Báo cáo đón trả"), link: "baocao", linkType: "section" },
          { label: t("Tuyến đường"), link: "tuyenduong", linkType: "section" },
        ]}
        onMenuClick={handleMenuClick}
        showLogin={false}
        showLanguage={false}
      />

      {/* NỘI DUNG CHÍNH */}
      <main className="flex-1 p-8 mt-8">
        <div key={activeSection}>
          {activeSection === "lichlamviec" && <LichLamViec />}
          {activeSection === "danhsachhocsinh" && <DanhSachHocSinh />}

          {activeSection === "baocao" && (
            <div className="bg-white shadow-lg p-6 rounded-2xl">
              <h1 className="text-3xl font-bold mb-4">
                📝 Báo cáo tình trạng đón trả
              </h1>
              <p className="text-gray-700">
                Báo cáo học sinh đã đón/trả, học sinh vắng hoặc trường hợp đặc
                biệt.
              </p>
            </div>
          )}

          {activeSection === "tuyenduong" && <Map_Driver />}
          {/* {activeSection === "tuyenduong" && (
            <div className="bg-white shadow-lg p-6 rounded-2xl">
              <h1 className="text-3xl font-bold mb-4">🗺️ Tuyến đường chạy</h1>
              <p className="text-gray-700">
                Xem bản đồ tuyến đường, các điểm dừng và vị trí xe hiện tại.
              </p>
              <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                (Bản đồ giả lập)
              </div>
            </div>
          )} */}
        </div>
      </main>

      {/* COMPONENT LUÔN HIỆN DƯỚI CÙNG */}
      <BaoCaoSuCoXe />
    </div>
  );
};

export default Taixe;