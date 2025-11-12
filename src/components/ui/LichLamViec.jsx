import React, { useEffect, useState } from "react";
import { getAllSchedules } from "../../services/scheduleService";

const LichLamViec = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState([]);

  // Lấy thông tin tài xế từ localStorage
  const getTaiXeInfo = () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    return userInfo;
  };

  // Tạo danh sách 7 ngày trong tuần
  const generateWeekDates = () => {
    const today = new Date();
    const week = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      week.push({
        date: date.toISOString().split('T')[0],
        displayDate: date.toLocaleDateString('vi-VN'),
        dayName: date.toLocaleDateString('vi-VN', { weekday: 'long' })
      });
    }

    return week;
  };

  // Lấy ca làm việc từ Stime
  const getCaLamViec = (stime) => {
    const hour = parseInt(stime.split(':')[0]);
    if (hour < 12) return "Ca sáng";
    if (hour < 18) return "Ca chiều";
    return "Ca tối";
  };

  // Định dạng giờ làm
  const formatGioLam = (stime) => {
    return stime.substring(0, 5);
  };


  // ⭐ THÊM HÀM NÀY - tính trạng thái real-time
  const calculateRealTimeStatus = (schedule) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Chỉ tính cho schedule của ngày hôm nay
    if (schedule.Sdate !== today) {
      return schedule.status; // Giữ nguyên status cho ngày khác
    }

    const scheduleTime = new Date(`${schedule.Sdate}T${schedule.Stime}`);
    const scheduleEndTime = new Date(scheduleTime.getTime() + (60 * 60 * 1000)); // +1 giờ

    if (now >= scheduleTime && now < scheduleEndTime) {
      return 'Vận hành';
    } else if (now >= scheduleEndTime) {
      return 'Hoàn thành';
    } else {
      return 'Đã lên lịch';
    }
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const taiXeInfo = getTaiXeInfo();

      if (!taiXeInfo) {
        console.error("Chưa đăng nhập");
        setLoading(false);
        return;
      }

      // ⭐ THÊM FILTER THEO ID_DRIVER
      const response = await getAllSchedules('ALL', {
        id_driver: taiXeInfo.id_driver // Lọc theo tài xế đang đăng nhập
      });

      const allSchedules = response.data.data;

      console.log("📦 All schedules data:", allSchedules);

      // Tạo danh sách tuần hiện tại
      const weekDates = generateWeekDates();
      setCurrentWeek(weekDates);

      // Lọc schedules theo tuần hiện tại và sắp xếp
      const weeklySchedules = allSchedules
        .filter(schedule => {
          const scheduleDate = schedule.Sdate;
          return weekDates.some(day => day.date === scheduleDate);
        })
        .map(schedule => {
          // ⭐ DEBUG: Kiểm tra cấu trúc data
          console.log("🔍 Schedule data:", {
            id: schedule.id_schedule,
            driver: schedule.driver,
            user: schedule.driver?.user,
            userName: schedule.driver?.user?.name
          });

          const realTimeStatus = calculateRealTimeStatus(schedule);

          return {
            id_schedule: schedule.id_schedule,
            ngay: new Date(schedule.Sdate).toLocaleDateString('vi-VN'),
            ca: getCaLamViec(schedule.Stime),
            tuyen: schedule.routes?.name_street || "Chưa xác định",
            gio: formatGioLam(schedule.Stime),
            status: realTimeStatus, // ⭐ SỬA: dùng realTimeStatus thay vì schedule.status
            ten_tai_xe: schedule.driver?.user?.name || "Chưa xác định", // ⭐ LẤY TÊN TÀI XẾ
            originalDate: schedule.Sdate,
            originalTime: schedule.Stime
          };
        })
        .sort((a, b) => new Date(a.originalDate) - new Date(b.originalDate));

      console.log("📋 Schedules trong tuần:", weeklySchedules);
      setSchedules(weeklySchedules);

    } catch (error) {
      console.error("❌ Lỗi khi lấy dữ liệu:", error);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, []);

  // ⭐ THÊM USE EFFECT NÀY - tự động refresh trạng thái mỗi phút
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     // Cập nhật trạng thái real-time mà không cần gọi API lại
  //     setSchedules(prevSchedules =>
  //       prevSchedules.map(schedule => {
  //         const realTimeStatus = calculateRealTimeStatus({
  //           Sdate: schedule.originalDate,
  //           Stime: schedule.originalTime,
  //           status: schedule.originalStatus
  //         });

  //         return {
  //           ...schedule,
  //           status: realTimeStatus
  //         };
  //       })
  //     );
  //   }, 60000); // 1 phút

  //   return () => clearInterval(interval);
  // }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('⏰ Cập nhật status real-time...');
      setSchedules(prev =>
        prev.map(schedule => ({
          ...schedule,
          status: calculateRealTimeStatus({
            Sdate: schedule.originalDate,
            Stime: schedule.originalTime,
            status: schedule.originalStatus
          })
        }))
      );
    }, 60000); // 30 giây

    return () => clearInterval(interval);
  }, []);

  // Hiển thị tuần hiện tại
  const displayCurrentWeek = () => {
    if (currentWeek.length === 0) return "";
    const start = currentWeek[0].displayDate;
    const end = currentWeek[6].displayDate;
    return `(${start} - ${end})`;
  };

  if (loading) {
    return (
      <div className="bg-white shadow-md rounded-2xl p-6">
        <div className="flex justify-center items-center h-40">
          <div className="text-lg text-gray-600">Đang tải lịch làm việc...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-orange-600 mb-4">
        📅 Lịch làm việc tuần này {displayCurrentWeek()}
      </h2>

      {schedules.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-orange-100 text-orange-800 text-left">
                <th className="py-3 px-4 border-b">Ngày</th>
                <th className="py-3 px-4 border-b">Ca</th>
                <th className="py-3 px-4 border-b">Giờ làm</th>
                <th className="py-3 px-4 border-b">Tuyến đường</th>
                <th className="py-3 px-4 border-b">Tên tài xế</th> {/* ⭐ THÊM CỘT NÀY */}
                <th className="py-3 px-4 border-b">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((item, index) => (
                <tr
                  key={index}
                  className={`hover:bg-orange-50 transition ${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } ${item.status === "Vận hành"
                      ? "bg-green-50 border-l-4 border-l-green-500"
                      : ""
                    }`}
                >
                  <td className="py-3 px-4 border-b font-medium">
                    {item.ngay}
                  </td>
                  <td className="py-3 px-4 border-b">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${item.ca === "Ca sáng" ? "bg-yellow-100 text-yellow-800" :
                      item.ca === "Ca chiều" ? "bg-orange-100 text-orange-800" :
                        "bg-blue-100 text-blue-800"
                      }`}>
                      {item.ca}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b font-mono">{item.gio}</td> {/* ⭐ CHUYỂN TRƯỚC TUYẾN */}
                  <td className="py-3 px-4 border-b">{item.tuyen}</td>
                  <td className="py-3 px-4 border-b font-medium text-gray-700"> {/* ⭐ THÊM Ô NÀY */}
                    {item.ten_tai_xe}
                  </td>
                  <td className="py-3 px-4 border-b">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${item.status === "Vận hành" ? "bg-green-100 text-green-800" :
                      item.status === "Đã lên lịch" ? "bg-blue-100 text-blue-800" :
                        item.status === "Hoàn thành" ? "bg-gray-100 text-gray-800" :
                          "bg-red-100 text-red-800"
                      }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">📅</div>
          <p className="text-gray-500 text-lg">Không có lịch làm việc trong tuần này</p>
          <p className="text-gray-400 text-sm mt-2">Vui lòng kiểm tra lại hoặc liên hệ quản lý</p>
        </div>
      )}

      {/* Thống kê nhanh */}
      {schedules.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="text-gray-600">
              Tổng số ca: <strong>{schedules.length}</strong>
            </span>
            <span className="text-blue-600">
              Đã lên lịch: <strong>{schedules.filter(s => s.status === "Đã lên lịch").length}</strong>
            </span>
            <span className="text-green-600">
              Đang vận hành: <strong>{schedules.filter(s => s.status === "Vận hành").length}</strong>
            </span>
            <span className="text-gray-600">
              Hoàn thành: <strong>{schedules.filter(s => s.status === "Hoàn thành").length}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Responsive info */}
      <p className="text-sm text-gray-500 mt-3 italic">
        👉 Lịch làm việc được cập nhật tự động theo tuần. Dòng màu xanh nhạt là ca đang vận hành.
      </p>
    </div>
  );
};

export default LichLamViec;