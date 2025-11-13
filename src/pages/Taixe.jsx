import React, { useState } from "react";
import Header from "@/components/ui/Header";
import LiveMap from "@/components/LiveMap";
import { useTranslation } from "react-i18next";
import LichLamViec from "@/components/ui/LichLamViec";
import DanhSachHocSinh from "@/components/ui/DanhSachHocSinh";
import BaoCaoSuCoXe from "@/components/ui/BaoCaoSuCoXe";
import Map_Driver from "@/components/ui/Map_Driver";

const Taixe = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState("danhsachhocsinh");

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
          // { label: t("driverPage.menu.pickupReport"), link: "baocao", linkType: "section" },
          { label: t("driverPage.menu.route"), link: "tuyenduong", linkType: "section" },
        ]}
        onMenuClick={handleMenuClick}
        showLogin={false}
        showLanguage={false}
      />

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 mt-8 overflow-y-auto">
        <div key={activeSection}>
          {activeSection === "lichlamviec" && <LichLamViec />}
          {activeSection === "danhsachhocsinh" && <DanhSachHocSinh />}

          {/* {activeSection === "baocao" && (
            <div className="bg-white shadow-lg p-6 rounded-2xl">
              <h1 className="text-3xl font-bold mb-4">
                📝 {t("driverPage.report.title")}
              </h1>
              <p className="text-gray-700">
                {t("driverPage.report.description")}
              </p>
            </div>
          )} */}

          {activeSection === "tuyenduong" && (
            <div className="relative z-0">
              <Map_Driver />
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
//     console.log("🟡 Đã chọn mục:", section);
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
//           // { label: t("driverPage.menu.pickupReport"), link: "baocao", linkType: "section" },
//           { label: t("driverPage.menu.route"), link: "tuyenduong", linkType: "section" },
//         ]}
//         onMenuClick={handleMenuClick}
//         showLogin={false}
//         showLanguage={false}
//       />

//       {/* NỘI DUNG CHÍNH */}
//       <main className="flex-1 p-8 mt-8 overflow-y-auto">
//         <div key={activeSection}>
//           {activeSection === "lichlamviec" && <LichLamViec />}
//           {activeSection === "danhsachhocsinh" && <DanhSachHocSinh />}

//           {/* {activeSection === "baocao" && (
//             <div className="bg-white shadow-lg p-6 rounded-2xl">
//               <h1 className="text-3xl font-bold mb-4">
//                 📝 Báo cáo tình trạng đón trả
//               </h1>
//               <p className="text-gray-700">
//                 Báo cáo học sinh đã đón/trả, học sinh vắng hoặc trường hợp đặc biệt.
//               </p>
//             </div>
//           )} */}

//           {activeSection === "tuyenduong" && (
//             <div className="relative z-0">
//               <Map_Driver />
//             </div>
//           )}
//         </div>
//       </main>

//       {/* COMPONENT LUÔN Ở DƯỚI CÙNG */}
//       <div className="mt-auto z-50 relative">
//         <BaoCaoSuCoXe />
//       </div>
//     </div>
//   );
// };

// export default Taixe;