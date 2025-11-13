import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { BrowserMultiFormatReader } from "@zxing/library";
import { getAllSchedules, updateStudentPickupStatus } from "../../services/scheduleService";

const DanhSachHocSinhTaiXe = () => {
  const { t } = useTranslation();
  const [hocSinhQuet, setHocSinhQuet] = useState(null);
  const [maQuet, setMaQuet] = useState("");
  const [danhSachHocSinh, setDanhSachHocSinh] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [allSchedulesToday, setAllSchedulesToday] = useState([]);
  const [activeSchedules, setActiveSchedules] = useState([]);
  const videoRef = useRef(null);
  const codeReader = useRef(null);

  // Lấy thông tin tài xế từ localStorage
  const getTaiXeInfo = () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    return userInfo;
  };

  // Hàm format ngày về dạng YYYY-MM-DD để so sánh chính xác
  const formatDateToYYYYMMDD = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Hàm chuyển đổi Stime (HH:MM:SS) thành phút từ 00:00
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Hàm tìm lịch trình phù hợp nhất với thời gian hiện tại (CHỈ LẤY "Vận hành")
  const findCurrentSchedule = (schedules) => {
    if (!schedules || schedules.length === 0) return null;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Sắp xếp lịch trình theo thời gian
    const sortedSchedules = [...schedules].sort((a, b) =>
      timeToMinutes(a.Stime) - timeToMinutes(b.Stime)
    );

    console.log("⏰ " + t("studentList.info.currentTime", { time: now.toLocaleTimeString('vi-VN') }));
    console.log("📋 " + t("studentList.info.activeSchedulesToday"), sortedSchedules.map(s =>
      `${s.id_schedule} (${s.Stime}) - ${s.status}`
    ));

    // Tìm lịch trình đang diễn ra (status = "Vận hành")
    let selectedSchedule = null;

    for (let i = sortedSchedules.length - 1; i >= 0; i--) {
      const schedule = sortedSchedules[i];
      const scheduleMinutes = timeToMinutes(schedule.Stime);

      // CHỈ CHỌN schedule có status = "Vận hành"
      if (schedule.status === "Vận hành" && scheduleMinutes <= currentMinutes) {
        selectedSchedule = schedule;
        console.log("✅ " + t("studentList.info.selectedActiveSchedule"), selectedSchedule.id_schedule, selectedSchedule.Stime);
        break;
      }
    }

    // Nếu không có lịch nào "Vận hành", lấy lịch "Vận hành" đầu tiên (nếu có)
    if (!selectedSchedule) {
      selectedSchedule = sortedSchedules.find(schedule => schedule.status === "Vận hành");
      if (selectedSchedule) {
        console.log("🕐 " + t("studentList.info.selectedFirstActiveSchedule"), selectedSchedule.id_schedule, selectedSchedule.Stime);
      }
    }

    return selectedSchedule;
  };

  const fetchSchedulesByDriver = async () => {
    try {
      setLoading(true);
      const taiXeInfo = getTaiXeInfo();

      if (!taiXeInfo || taiXeInfo.role !== "Tài xế") {
        console.error("❌ " + t("studentList.errors.notDriverOrNotLoggedIn"));
        setLoading(false);
        return;
      }

      // Lấy ngày hôm nay định dạng YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];
      console.log("🔍 " + t("studentList.info.searchingSchedules"), today, t("studentList.info.ofDriver"), taiXeInfo.id_driver);

      // Gọi API với filters: driver hiện tại và ngày hôm nay
      const response = await getAllSchedules('ALL', {
        id_driver: taiXeInfo.id_driver,
        date: today
      });

      const schedules = response.data.data;
      console.log("📋 " + t("studentList.info.allSchedulesReceived"), schedules);

      if (schedules && schedules.length > 0) {
        // Lọc schedule cho ngày hôm nay
        const todaySchedules = schedules.filter(schedule => {
          const scheduleDate = formatDateToYYYYMMDD(schedule.Sdate);
          return scheduleDate === today;
        });

        console.log("🎯 " + t("studentList.info.todaySchedulesCount"), todaySchedules.length);

        if (todaySchedules.length > 0) {
          setAllSchedulesToday(todaySchedules);

          // CHỈ LẤY CÁC SCHEDULE CÓ STATUS "Vận hành"
          const activeSchedules = todaySchedules.filter(schedule => schedule.status === "Vận hành");
          setActiveSchedules(activeSchedules);

          console.log("🚀 " + t("studentList.info.activeSchedulesCount"), activeSchedules.length);

          if (activeSchedules.length > 0) {
            // Tìm lịch trình hiện tại phù hợp (chỉ trong activeSchedules)
            const selectedSchedule = findCurrentSchedule(activeSchedules);

            if (selectedSchedule) {
              setCurrentSchedule(selectedSchedule);

              if (selectedSchedule.students && selectedSchedule.students.length > 0) {
                const formattedStudents = selectedSchedule.students.map((student, index) => ({
                  stt: index + 1,
                  id_student: student.id_student,
                  tenHocSinh: student.name,
                  id_busstop: student.id_busstop || "BS001",
                  mssv: student.mssv,
                  trangThai: student.ScheduleStudent?.status || t("studentList.status.waiting")
                }));

                setDanhSachHocSinh(formattedStudents);
                console.log("👥 " + t("studentList.info.studentList"), formattedStudents.length, t("studentList.info.students"));
              } else {
                console.log("⚠️ " + t("studentList.warnings.activeScheduleNoStudents"));
                setDanhSachHocSinh([]);
              }
            } else {
              console.log("⏸️ " + t("studentList.warnings.noSuitableActiveSchedule"));
              setCurrentSchedule(null);
              setDanhSachHocSinh([]);
            }
          } else {
            console.log("⏸️ " + t("studentList.warnings.noActiveSchedules"));
            setCurrentSchedule(null);
            setDanhSachHocSinh([]);
          }
        } else {
          console.log("📭 " + t("studentList.warnings.noSchedulesAfterFilter"));
          setActiveSchedules([]);
          setCurrentSchedule(null);
          setDanhSachHocSinh([]);
        }
      } else {
        console.log("📭 " + t("studentList.warnings.noSchedulesToday"));
        setActiveSchedules([]);
        setCurrentSchedule(null);
        setDanhSachHocSinh([]);
      }
    } catch (error) {
      console.error("❌ " + t("studentList.errors.loadData"), error);
      setActiveSchedules([]);
      setCurrentSchedule(null);
      setDanhSachHocSinh([]);
    } finally {
      setLoading(false);
    }
  };

  // Hàm chuyển đổi sang lịch trình khác (CHỈ CHO PHÉP CHỌN TRONG ACTIVE SCHEDULES)
  const switchSchedule = (schedule) => {
    // CHỈ cho phép chuyển đổi nếu schedule có status "Vận hành"
    if (schedule.status !== "Vận hành") {
      console.log("🚫 " + t("studentList.errors.cannotSelectNonActive"));
      return;
    }

    setCurrentSchedule(schedule);

    if (schedule.students && schedule.students.length > 0) {
      const formattedStudents = schedule.students.map((student, index) => ({
        stt: index + 1,
        id_student: student.id_student,
        tenHocSinh: student.name,
        id_busstop: student.id_busstop || "BS001",
        mssv: student.mssv,
        trangThai: student.ScheduleStudent?.status || t("studentList.status.waiting")
      }));

      setDanhSachHocSinh(formattedStudents);
    } else {
      setDanhSachHocSinh([]);
    }

    // Reset camera state
    setHocSinhQuet(null);
    setMaQuet("");
  };

  // Hàm cập nhật trạng thái học sinh VÀ RELOAD
  const capNhatTrangThaiHocSinh = async (studentId, newStatus) => {
    try {
      if (!currentSchedule) return;

      const response = await updateStudentPickupStatus(
        currentSchedule.id_schedule,
        studentId,
        newStatus
      );

      if (response.data.errCode === 0) {
        console.log(`✅ ${t("studentList.success.updatedStatus")} ${studentId} ${t("studentList.success.to")} ${newStatus}`);

        // RELOAD TRANG SAU KHI CẬP NHẬT THÀNH CÔNG
        setTimeout(() => {
          fetchSchedulesByDriver();
          setHocSinhQuet(null);
          setMaQuet("");
        }, 1500);
      }
    } catch (error) {
      console.error("❌ " + t("studentList.errors.updateStatus"), error);
    }
  };

  // Hàm xử lý trả khách
  const handleTraKhach = async (studentId) => {
    await capNhatTrangThaiHocSinh(studentId, t("studentList.status.pickedUp"));
  };

  useEffect(() => {
    fetchSchedulesByDriver();

    // Auto refresh mỗi 2 phút để cập nhật trạng thái
    const interval = setInterval(() => {
      fetchSchedulesByDriver();
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
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
              if (found.trangThai === t("studentList.status.waiting")) {
                capNhatTrangThaiHocSinh(found.id_student, t("studentList.status.present"));
              } else if (found.trangThai === t("studentList.status.pickedUp")) {
                console.log(`ℹ️ ${t("studentList.info.studentGotOff")} ${found.tenHocSinh}`);
                setTimeout(() => {
                  fetchSchedulesByDriver();
                }, 1000);
              } else if (found.trangThai === t("studentList.status.present")) {
                console.log(`ℹ️ ${t("studentList.info.studentAlreadyPresent")} ${found.tenHocSinh}`);
                setTimeout(() => {
                  fetchSchedulesByDriver();
                }, 1000);
              }
            } else {
              setHocSinhQuet(null);
              setTimeout(() => {
                fetchSchedulesByDriver();
              }, 2000);
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
      case t("studentList.status.present"):
        return "text-green-600 bg-green-100";
      case t("studentList.status.pickedUp"):
        return "text-blue-600 bg-blue-100";
      case t("studentList.status.waiting"):
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getTrangThaiText = (status) => {
    switch (status) {
      case t("studentList.status.present"):
        return "✅ " + t("studentList.status.present");
      case t("studentList.status.pickedUp"):
        return "🚌 " + t("studentList.status.pickedUp");
      case t("studentList.status.waiting"):
        return "⏳ " + t("studentList.status.waiting");
      default:
        return status;
    }
  };

  const isTraKhachDisabled = (trangThai) => {
    return trangThai !== t("studentList.status.present");
  };

  const getTraKhachButtonColor = (trangThai) => {
    if (trangThai === t("studentList.status.present")) {
      return "bg-green-500 hover:bg-green-600 text-white";
    } else {
      return "bg-gray-300 text-gray-500 cursor-not-allowed";
    }
  };

  return (
    <>
      {loading ? (
        <div className="bg-white shadow-md rounded-2xl p-6">
          <div className="flex justify-center items-center h-40">
            <div className="text-lg text-gray-600">⏳ {t("studentList.loading.loadingData")}</div>
          </div>
        </div>
      ) : activeSchedules.length === 0 ? (
        <div className="bg-white shadow-md rounded-2xl p-6">
          <div className="flex justify-center items-center h-40">
            <div className="text-center">
              <div className="text-lg text-gray-600 mb-2">⏸️ {t("studentList.noActiveSchedules.title")}</div>
              <p className="text-gray-500">
                {t("studentList.noActiveSchedules.description", { date: new Date().toLocaleDateString('vi-VN') })}
              </p>
              <button
                onClick={fetchSchedulesByDriver}
                className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                🔄 {t("studentList.buttons.tryAgain")}
              </button>
            </div>
          </div>
        </div>
      ) : !currentSchedule ? (
        <div className="bg-white shadow-md rounded-2xl p-6">
          <div className="flex justify-center items-center h-40">
            <div className="text-center">
              <div className="text-lg text-gray-600 mb-2">🕐 {t("studentList.noSuitableSchedule.title")}</div>
              <p className="text-gray-500">{t("studentList.noSuitableSchedule.description")}</p>
              <button
                onClick={fetchSchedulesByDriver}
                className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                🔄 {t("studentList.buttons.tryAgain")}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-orange-600 mb-4">
            🧑‍🎓 {t("studentList.title")}
          </h2>

          {/* Tabs chuyển đổi lịch trình - CHỈ HIỂN THỊ ACTIVE SCHEDULES */}
          {activeSchedules.length > 1 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">📋 {t("studentList.scheduleSelection.title")}:</p>
              <div className="flex gap-2 flex-wrap">
                {activeSchedules
                  .sort((a, b) => timeToMinutes(a.Stime) - timeToMinutes(b.Stime))
                  .map((schedule) => (
                    <button
                      key={schedule.id_schedule}
                      onClick={() => switchSchedule(schedule)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${currentSchedule.id_schedule === schedule.id_schedule
                        ? "bg-green-500 text-white shadow-lg"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    >
                      🕐 {schedule.Stime} - {schedule.routes?.name_street || `${t("studentList.scheduleSelection.id")}: ${schedule.id_schedule}`}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {currentSchedule && (
            <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-700">
                <strong>🚀 {t("studentList.currentSchedule.operating")}:</strong> {currentSchedule.id_schedule} |
                <strong> {t("studentList.currentSchedule.date")}:</strong> {new Date(currentSchedule.Sdate).toLocaleDateString('vi-VN')} |
                <strong> {t("studentList.currentSchedule.time")}:</strong> {currentSchedule.Stime} |
                <strong> {t("studentList.currentSchedule.route")}:</strong> {currentSchedule.routes?.name_street || 'N/A'}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {t("studentList.currentSchedule.driver")}: {currentSchedule.driver?.user?.name} (ID: {currentSchedule.id_driver})
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cột trái - Danh sách học sinh */}
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-orange-100 text-orange-800 text-left">
                    <th className="py-3 px-4 border-b">{t("studentList.tableHeaders.number")}</th>
                    <th className="py-3 px-4 border-b">{t("studentList.tableHeaders.studentName")}</th>
                    <th className="py-3 px-4 border-b">{t("studentList.tableHeaders.busstop")}</th>
                    <th className="py-3 px-4 border-b">{t("studentList.tableHeaders.status")}</th>
                    <th className="py-3 px-4 border-b">{t("studentList.tableHeaders.actions")}</th>
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
                            {t("studentList.buttons.dropOff")}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-4 px-4 text-center text-gray-500">
                        {t("studentList.noStudentsInSchedule")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Cột phải - Camera quét mã */}
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-semibold mb-3 text-orange-700">
                📷 {t("studentList.scanner.title")}
              </h3>
              <video
                ref={videoRef}
                className="border-2 border-orange-400 rounded-xl w-[300px] h-[220px]"
              />
              {hocSinhQuet ? (
                <div className={`mt-4 text-center p-3 rounded-lg ${hocSinhQuet.trangThai === t("studentList.status.pickedUp")
                  ? "bg-blue-50 border border-blue-200"
                  : "bg-green-50"
                  }`}>
                  <p className={`font-semibold ${hocSinhQuet.trangThai === t("studentList.status.pickedUp") ? "text-blue-600" : "text-green-600"
                    }`}>
                    {hocSinhQuet.trangThai === t("studentList.status.pickedUp") ? "ℹ️" : "✅"} {t("studentList.scanner.identified")}: {hocSinhQuet.tenHocSinh}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {t("studentList.tableHeaders.mssv")}: {hocSinhQuet.mssv} | {t("studentList.tableHeaders.busstop")}: {hocSinhQuet.id_busstop}
                  </p>
                  <p className={`text-sm mt-1 ${hocSinhQuet.trangThai === t("studentList.status.pickedUp")
                    ? "text-blue-500"
                    : "text-green-500"
                    }`}>
                    {hocSinhQuet.trangThai === t("studentList.status.pickedUp")
                      ? t("studentList.scanner.studentGotOffReloading")
                      : hocSinhQuet.trangThai === t("studentList.status.present")
                        ? t("studentList.scanner.attendanceSuccessReloading")
                        : t("studentList.scanner.statusUpdatedReloading")}
                  </p>
                </div>
              ) : maQuet ? (
                <div className="mt-4 text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-red-600 font-semibold">
                    ❌ {t("studentList.scanner.studentNotFound")}
                  </p>
                  <p className="text-gray-600 text-sm">{t("studentList.tableHeaders.mssv")}: {maQuet}</p>
                  <p className="text-red-500 text-sm mt-1">
                    {t("studentList.scanner.mssvNotExistReloading")}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 mt-4 italic text-center">
                  {t("studentList.scanner.instruction")}
                </p>
              )}
            </div>
          </div>

          {/* Thống kê */}
          {danhSachHocSinh.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="text-gray-600">
                  {t("studentList.statistics.total")}: <strong>{danhSachHocSinh.length}</strong> {t("studentList.statistics.students")}
                </span>
                <span className="text-green-600">
                  {t("studentList.status.present")}: <strong>{danhSachHocSinh.filter(hs => hs.trangThai === t("studentList.status.present")).length}</strong>
                </span>
                <span className="text-yellow-600">
                  {t("studentList.status.waiting")}: <strong>{danhSachHocSinh.filter(hs => hs.trangThai === t("studentList.status.waiting")).length}</strong>
                </span>
                <span className="text-blue-600">
                  {t("studentList.status.pickedUp")}: <strong>{danhSachHocSinh.filter(hs => hs.trangThai === t("studentList.status.pickedUp")).length}</strong>
                </span>
              </div>
            </div>
          )}

          {/* Nút reload manual */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={fetchSchedulesByDriver}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
            >
              🔄 {t("studentList.buttons.updateData")}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DanhSachHocSinhTaiXe;