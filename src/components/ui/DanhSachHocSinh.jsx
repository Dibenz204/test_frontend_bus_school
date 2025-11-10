import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { getAllSchedules, updateStudentPickupStatus } from "../../services/scheduleService";

const DanhSachHocSinhTaiXe = () => {
  const [hocSinhQuet, setHocSinhQuet] = useState(null);
  const [maQuet, setMaQuet] = useState("");
  const [danhSachHocSinh, setDanhSachHocSinh] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const videoRef = useRef(null);
  const codeReader = useRef(null);

  // Lấy thông tin tài xế từ localStorage
  const getTaiXeInfo = () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    return userInfo;
  };

  const fetchSchedulesByDriver = async () => {
    try {
      setLoading(true);
      const taiXeInfo = getTaiXeInfo();

      if (!taiXeInfo || taiXeInfo.role !== "Tài xế") {
        console.error("Không phải tài xế hoặc chưa đăng nhập");
        setLoading(false);
        return;
      }

      const response = await getAllSchedules('ALL');
      const schedules = response.data.data;
      const allSchedules = schedules;

      if (allSchedules.length > 0) {
        const activeSchedule = allSchedules[0];
        setCurrentSchedule(activeSchedule);

        if (activeSchedule.students && activeSchedule.students.length > 0) {
          const formattedStudents = activeSchedule.students.map((student, index) => ({
            stt: index + 1,
            id_student: student.id_student,
            tenHocSinh: student.name,
            id_busstop: student.id_busstop || "BS001",
            mssv: student.mssv,
            trangThai: student.ScheduleStudent?.status || "Đang chờ"
          }));

          setDanhSachHocSinh(formattedStudents);
        } else {
          setDanhSachHocSinh([]);
        }
      } else {
        setDanhSachHocSinh([]);
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      setDanhSachHocSinh([]);
    } finally {
      setLoading(false);
    }
  };

  // Hàm cập nhật trạng thái học sinh
  const capNhatTrangThaiHocSinh = async (studentId, newStatus) => {
    try {
      if (!currentSchedule) return;

      const response = await updateStudentPickupStatus(
        currentSchedule.id_schedule,
        studentId,
        newStatus
      );

      if (response.data.errCode === 0) {
        setDanhSachHocSinh(prev =>
          prev.map(student =>
            student.id_student === studentId
              ? { ...student, trangThai: newStatus }
              : student
          )
        );

        console.log(`Đã cập nhật trạng thái học sinh ${studentId} thành ${newStatus}`);

        setTimeout(() => {
          setHocSinhQuet(null);
          setMaQuet("");
        }, 2000);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
    }
  };

  // Hàm xử lý trả khách
  const handleTraKhach = async (studentId) => {
    await capNhatTrangThaiHocSinh(studentId, "Đã đưa/đón");
  };

  useEffect(() => {
    fetchSchedulesByDriver();
  }, []);

  // Khởi tạo máy quét mã
  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();

    if (videoRef.current) {
      codeReader.current.decodeFromVideoDevice(
        null,
        videoRef.current,
        (result, err) => {
          if (result) {
            const code = result.getText();
            setMaQuet(code);

            // Tìm học sinh theo MSSV quét được
            const found = danhSachHocSinh.find((hs) => hs.mssv === code);

            if (found) {
              setHocSinhQuet(found);

              // Kiểm tra các trạng thái
              if (found.trangThai === "Đang chờ") {
                // Cập nhật trạng thái thành "Có mặt" nếu đang là "Đang chờ"
                capNhatTrangThaiHocSinh(found.id_student, "Có mặt");
              } else if (found.trangThai === "Đã đưa/đón") {
                // Nếu đã đưa/đón rồi, chỉ thông báo, không làm gì cả
                console.log(`Học sinh ${found.tenHocSinh} đã xuống xe`);
                // Không cần gọi API, chỉ hiển thị thông báo
              }
              // Nếu trạng thái là "Có mặt" thì không làm gì, để nút "Trả khách" xử lý
            } else {
              setHocSinhQuet(null);
            }
          }
          if (err && !(err.name === "NotFoundException")) {
            console.error(err);
          }
        }
      );
    }

    return () => {
      if (codeReader.current) {
        codeReader.current.reset();
      }
    };
  }, [danhSachHocSinh]);

  const getTrangThaiColor = (status) => {
    switch (status) {
      case "Có mặt":
        return "text-green-600 bg-green-100";
      case "Đã đưa/đón":
        return "text-blue-600 bg-blue-100";
      case "Đang chờ":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getTrangThaiText = (status) => {
    switch (status) {
      case "Có mặt":
        return "✅ Có mặt";
      case "Đã đưa/đón":
        return "🚌 Đã đưa/đón";
      case "Đang chờ":
        return "⏳ Đang chờ";
      default:
        return status;
    }
  };

  // Hàm kiểm tra nút Trả khách có được bấm không
  const isTraKhachDisabled = (trangThai) => {
    return trangThai !== "Có mặt";
  };

  // Hàm lấy màu nút Trả khách
  const getTraKhachButtonColor = (trangThai) => {
    if (trangThai === "Có mặt") {
      return "bg-green-500 hover:bg-green-600 text-white";
    } else {
      return "bg-gray-300 text-gray-500 cursor-not-allowed";
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow-md rounded-2xl p-6">
        <div className="flex justify-center items-center h-40">
          <div className="text-lg text-gray-600">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-orange-600 mb-4">
        🧑‍🎓 Danh sách học sinh trên tuyến đường
      </h2>

      {currentSchedule && (
        <div className="mb-4 p-3 bg-orange-50 rounded-lg">
          <p className="text-sm text-orange-700">
            <strong>Lịch trình:</strong> {currentSchedule.id_schedule} |
            <strong> Ngày:</strong> {new Date(currentSchedule.Sdate).toLocaleDateString('vi-VN')} |
            <strong> Giờ:</strong> {currentSchedule.Stime} |
            <strong> Trạng thái:</strong> {currentSchedule.status}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cột trái - Danh sách học sinh (5 CỘT với nút Trả khách) */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-orange-100 text-orange-800 text-left">
                <th className="py-3 px-4 border-b">STT</th>
                <th className="py-3 px-4 border-b">Tên học sinh</th>
                <th className="py-3 px-4 border-b">Busstop</th>
                <th className="py-3 px-4 border-b">Trạng thái</th>
                <th className="py-3 px-4 border-b">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {danhSachHocSinh.length > 0 ? (
                danhSachHocSinh.map((hs, index) => (
                  <tr
                    key={hs.id_student}
                    className={`hover:bg-orange-50 transition ${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } ${hocSinhQuet?.id_student === hs.id_student ? "ring-2 ring-orange-400 bg-orange-100" : ""
                      }`}
                  >
                    <td className="py-3 px-4 border-b">{hs.stt}</td>
                    <td className="py-3 px-4 border-b font-medium">
                      {hs.tenHocSinh}
                    </td>
                    <td className="py-3 px-4 border-b text-sm text-gray-600">
                      {hs.id_busstop}
                    </td>
                    <td className="py-3 px-4 border-b">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getTrangThaiColor(
                          hs.trangThai
                        )}`}
                      >
                        {getTrangThaiText(hs.trangThai)}
                      </span>
                    </td>
                    <td className="py-3 px-4 border-b">
                      <button
                        onClick={() => handleTraKhach(hs.id_student)}
                        disabled={isTraKhachDisabled(hs.trangThai)}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${getTraKhachButtonColor(hs.trangThai)}`}
                      >
                        Trả khách
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-4 px-4 text-center text-gray-500">
                    Không có học sinh nào trong lịch trình hiện tại
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Cột phải - Camera quét mã (giữ nguyên) */}
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-3 text-orange-700">
            📷 Quét mã học sinh (MSSV)
          </h3>
          <video
            ref={videoRef}
            className="border-2 border-orange-400 rounded-xl w-[300px] h-[220px]"
          />
          {hocSinhQuet ? (
            <div className={`mt-4 text-center p-3 rounded-lg ${hocSinhQuet.trangThai === "Đã đưa/đón"
                ? "bg-blue-50 border border-blue-200"
                : "bg-green-50"
              }`}>
              <p className={`font-semibold ${hocSinhQuet.trangThai === "Đã đưa/đón" ? "text-blue-600" : "text-green-600"
                }`}>
                {hocSinhQuet.trangThai === "Đã đưa/đón" ? "ℹ️" : "✅"} Đã nhận dạng: {hocSinhQuet.tenHocSinh}
              </p>
              <p className="text-gray-600 text-sm">
                MSSV: {hocSinhQuet.mssv} | Busstop: {hocSinhQuet.id_busstop}
              </p>
              <p className={`text-sm mt-1 ${hocSinhQuet.trangThai === "Đã đưa/đón"
                  ? "text-blue-500"
                  : "text-green-500"
                }`}>
                {hocSinhQuet.trangThai === "Đã đưa/đón"
                  ? "Học sinh đã xuống xe"
                  : hocSinhQuet.trangThai === "Có mặt"
                    ? "Đã điểm danh thành công!"
                    : "Trạng thái đã được cập nhật: Có mặt"}
              </p>
            </div>
          ) : maQuet ? (
            <div className="mt-4 text-center p-3 bg-red-50 rounded-lg">
              <p className="text-red-600 font-semibold">
                ❌ Không tìm thấy học sinh
              </p>
              <p className="text-gray-600 text-sm">MSSV: {maQuet}</p>
              <p className="text-red-500 text-sm mt-1">
                MSSV không tồn tại trong lịch trình này
              </p>
            </div>
          ) : (
            <p className="text-gray-500 mt-4 italic text-center">
              Đưa mã vạch MSSV <br />trước camera để quét...
            </p>
          )}
        </div>
      </div>

      {/* Thống kê */}
      {danhSachHocSinh.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="text-gray-600">
              Tổng số: <strong>{danhSachHocSinh.length}</strong> học sinh
            </span>
            <span className="text-green-600">
              Có mặt: <strong>{danhSachHocSinh.filter(hs => hs.trangThai === 'Có mặt').length}</strong>
            </span>
            <span className="text-yellow-600">
              Đang chờ: <strong>{danhSachHocSinh.filter(hs => hs.trangThai === 'Đang chờ').length}</strong>
            </span>
            <span className="text-blue-600">
              Đã đưa/đón: <strong>{danhSachHocSinh.filter(hs => hs.trangThai === 'Đã đưa/đón').length}</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DanhSachHocSinhTaiXe;