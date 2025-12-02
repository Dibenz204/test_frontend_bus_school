import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const BaoCaoSuCoXe = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false); // trạng thái mở popup
  const [loaiSuCo, setLoaiSuCo] = useState(""); // chọn loại sự cố
  const [ghiChu, setGhiChu] = useState(""); // tự điền

  const handleSend = () => {
    if (!loaiSuCo && !ghiChu) {
      alert(t("incident_report.please_select_or_enter"));
      return;
    }
    alert(t("incident_report.incident_reported", { incident: loaiSuCo || ghiChu }));
    setOpen(false);
    setLoaiSuCo("");
    setGhiChu("");
    // TODO: Gọi API gửi dữ liệu cho phụ huynh + admin
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Nút chính */}
      <button
        onClick={() => setOpen(!open)}
        className="bg-red-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-600 transition animate-pulse"
      >
        🚨 {t("incident_report.report_incident")}
      </button>

      {/* Popup lựa chọn sự cố */}
      {open && (
        <div className="mt-2 w-64 bg-white shadow-lg rounded-lg p-4 border border-gray-200">
          <h3 className="font-bold text-red-600 mb-2">{t("incident_report.select_incident_type")}</h3>
          <select
            className="w-full p-2 border rounded mb-2"
            value={loaiSuCo}
            onChange={(e) => setLoaiSuCo(e.target.value)}
          >
            <option value="">{t("incident_report.select_incident")}</option>
            <option value={t("incident_report.broken_bus")}>{t("incident_report.broken_bus")}</option>
            <option value={t("incident_report.traffic_jam")}>{t("incident_report.traffic_jam")}</option>
            <option value={t("incident_report.late_schedule")}>{t("incident_report.late_schedule")}</option>
          </select>
          <p className="text-sm text-gray-500 mb-2">{t("incident_report.or_enter_freely")}</p>
          <input
            type="text"
            placeholder={t("incident_report.enter_incident_type")}
            className="w-full p-2 border rounded mb-2"
            value={ghiChu}
            onChange={(e) => setGhiChu(e.target.value)}
          />
          <button
            onClick={handleSend}
            className="w-full bg-red-500 text-white font-bold py-2 rounded hover:bg-red-600 transition"
          >
            {t("incident_report.send")}
          </button>
        </div>
      )}
    </div>
  );
};

export default BaoCaoSuCoXe;


// import React, { useState } from "react";

// const BaoCaoSuCoXe = () => {
//   const [open, setOpen] = useState(false); // trạng thái mở popup
//   const [loaiSuCo, setLoaiSuCo] = useState(""); // chọn loại sự cố
//   const [ghiChu, setGhiChu] = useState(""); // tự điền

//   const handleSend = () => {
//     if (!loaiSuCo && !ghiChu) {
//       alert("Vui lòng chọn hoặc điền loại sự cố!");
//       return;
//     }
//     alert(`🚨 Đã báo sự cố: ${loaiSuCo || ghiChu}`);
//     setOpen(false);
//     setLoaiSuCo("");
//     setGhiChu("");
//     // TODO: Gọi API gửi dữ liệu cho phụ huynh + admin
//   };

//   return (
//     <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
//       {/* Nút chính */}
//       <button
//         onClick={() => setOpen(!open)}
//         className="bg-red-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-600 transition animate-pulse"
//       >
//         🚨 Báo sự cố xe
//       </button>

//       {/* Popup lựa chọn sự cố */}
//       {open && (
//         <div className="mt-2 w-64 bg-white shadow-lg rounded-lg p-4 border border-gray-200">
//           <h3 className="font-bold text-red-600 mb-2">Chọn loại sự cố</h3>
//           <select
//             className="w-full p-2 border rounded mb-2"
//             value={loaiSuCo}
//             onChange={(e) => setLoaiSuCo(e.target.value)}
//           >
//             <option value="">Chọn sự cố</option>
//             <option value="Hư xe">Hư xe</option>
//             <option value="Kẹt xe">Kẹt xe</option>
//             <option value="Trễ giờ">Trễ giờ</option>
//           </select>
//           <p className="text-sm text-gray-500 mb-2">Hoặc điền tự do:</p>
//           <input
//             type="text"
//             placeholder="Nhập loại sự cố"
//             className="w-full p-2 border rounded mb-2"
//             value={ghiChu}
//             onChange={(e) => setGhiChu(e.target.value)}
//           />
//           <button
//             onClick={handleSend}
//             className="w-full bg-red-500 text-white font-bold py-2 rounded hover:bg-red-600 transition"
//           >
//             Gửi
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BaoCaoSuCoXe;
