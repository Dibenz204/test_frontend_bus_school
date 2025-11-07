import React from "react";

const LichLamViec = () => {
  // Dữ liệu mẫu
  const schedule = [
    {
      ngay: "Thứ 2",
      ca: "Sáng",
      tuyen: "Tuyến A - Trường THPT Nguyễn Trãi",
      gio: "06:30 - 09:00",
    },
    {
      ngay: "Thứ 2",
      ca: "Chiều",
      tuyen: "Tuyến B - Trường THCS Lê Quý Đôn",
      gio: "15:00 - 17:00",
    },
    {
      ngay: "Thứ 3",
      ca: "Sáng",
      tuyen: "Tuyến C - Trường Tiểu học Hòa Bình",
      gio: "06:45 - 09:00",
    },
    {
      ngay: "Thứ 4",
      ca: "Chiều",
      tuyen: "Tuyến A - Trường THPT Nguyễn Trãi",
      gio: "15:00 - 17:00",
    },
    {
      ngay: "Thứ 5",
      ca: "Sáng",
      tuyen: "Tuyến B - Trường THCS Lê Quý Đôn",
      gio: "06:30 - 09:00",
    },
    {
      ngay: "Thứ 6",
      ca: "Chiều",
      tuyen: "Tuyến C - Trường Tiểu học Hòa Bình",
      gio: "15:00 - 17:00",
    },
  ];

  return (
    <div className="bg-white shadow-md rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-orange-600 mb-4">
        📅 Lịch làm việc
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-orange-100 text-orange-800 text-left">
              <th className="py-3 px-4 border-b">Ngày</th>
              <th className="py-3 px-4 border-b">Ca</th>
              <th className="py-3 px-4 border-b">Tuyến đường</th>
              <th className="py-3 px-4 border-b">Giờ làm</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((item, index) => (
              <tr
                key={index}
                className={`hover:bg-orange-50 transition ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <td className="py-3 px-4 border-b">{item.ngay}</td>
                <td className="py-3 px-4 border-b">{item.ca}</td>
                <td className="py-3 px-4 border-b">{item.tuyen}</td>
                <td className="py-3 px-4 border-b">{item.gio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Responsive info */}
      <p className="text-sm text-gray-500 mt-3 italic">
        👉 Lưu ý: Lịch có thể thay đổi theo tuần. Vui lòng kiểm tra thông báo
        mới nhất.
      </p>
    </div>
  );
};

export default LichLamViec;
