// import React, { useEffect, useState } from "react";
// import "../../styles/ScheduleManagement.css";
// import { getAllBuses, createNewBus, updateBus, deleteBus, getRoutes, getDrivers } from "../../services/busService";
// import { getAllSchedules, createNewSchedule, updateSchedule, deleteSchedule } from "../../services/scheduleService";

import React, { useEffect, useState } from "react";
import { getAllBuses, createNewBus, updateBus, deleteBus, getRoutes, getDrivers } from "../../services/busService";
import { getAllSchedules, createNewSchedule, updateSchedule, deleteSchedule, getScheduleStatuses } from "../../services/scheduleService";
import "../../styles/ScheduleManagement.css";

const BusManagement = () => {
    const [activeTab, setActiveTab] = useState("view");
    const [selectedType, setSelectedType] = useState("bus");
    const [busBuffer, setBusBuffer] = useState([]);
    const [scheduleBuffer, setScheduleBuffer] = useState([]);
    const [loading, setLoading] = useState(false);
    const [routes, setRoutes] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [statuses, setStatuses] = useState([]);

    // Filter states cho schedule
    const [scheduleFilters, setScheduleFilters] = useState({
        id_driver: "",
        id_route: "",
        status: "",
        date: ""
    });
    const [timeSort, setTimeSort] = useState(""); // "ASC" hoặc "DESC"

    // Form states
    const [busFormData, setBusFormData] = useState({
        bien_so: "",
        id_driver: "",
        id_route: ""
    });

    const [scheduleFormData, setScheduleFormData] = useState({
        id_route: "",
        id_driver: "",
        Stime: "",
        Sdate: ""
        // Bỏ status, sẽ luôn mặc định "Đã lên lịch"
    });

    const [editingBus, setEditingBus] = useState(null);
    const [editingSchedule, setEditingSchedule] = useState(null);

    useEffect(() => {
        if (selectedType === "bus") {
            fetchBuses();
            fetchRoutes();
            fetchDrivers();
        } else {
            fetchSchedules();
            fetchRoutes();
            fetchDrivers();
            fetchStatuses();
        }
    }, [selectedType]);

    // Lấy danh sách schedules với filter và sort
    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const sortBy = {};
            if (timeSort) {
                sortBy.time = timeSort;
            }

            const res = await getAllSchedules('ALL', scheduleFilters, sortBy);
            if (res.data && Array.isArray(res.data.data)) {
                setScheduleBuffer(res.data.data);
            } else {
                setScheduleBuffer([]);
            }
        } catch (e) {
            console.error("Error fetching schedules:", e);
            setScheduleBuffer([]);
        } finally {
            setLoading(false);
        }
    };

    // Lấy danh sách status
    const fetchStatuses = async () => {
        try {
            const res = await getScheduleStatuses();
            if (res.data && Array.isArray(res.data.data)) {
                setStatuses(res.data.data);
            }
        } catch (e) {
            console.error("Error fetching statuses:", e);
        }
    };

    // Xử lý thay đổi filter
    const handleScheduleFilterChange = (filterName, value) => {
        setScheduleFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    // Xử lý sort thời gian
    const handleTimeSort = () => {
        const newSort = timeSort === "ASC" ? "DESC" : "ASC";
        setTimeSort(newSort);
    };

    // Áp dụng filter
    const applyScheduleFilters = () => {
        fetchSchedules();
    };

    // Reset filter
    const resetScheduleFilters = () => {
        setScheduleFilters({
            id_driver: "",
            id_route: "",
            status: "",
            date: ""
        });
        setTimeSort("");
    };

    // Các hàm khác (fetchBuses, fetchRoutes, fetchDrivers, handleBusInputChange, handleScheduleInputChange, resetForm, handleBusSubmit, handleScheduleSubmit, handleEditBus, handleEditSchedule, handleDeleteBus, handleDeleteSchedule) giữ nguyên...
    // THÊM CÁC HÀM NÀY VÀO COMPONENT

    // Lấy danh sách buses
    const fetchBuses = async () => {
        setLoading(true);
        try {
            const res = await getAllBuses('ALL');
            if (res.data && Array.isArray(res.data.data)) {
                setBusBuffer(res.data.data);
            } else {
                setBusBuffer([]);
            }
        } catch (e) {
            console.error("Error fetching buses:", e);
            setBusBuffer([]);
        } finally {
            setLoading(false);
        }
    };

    // Lấy danh sách routes
    const fetchRoutes = async () => {
        try {
            const res = await getRoutes();
            if (res.data && Array.isArray(res.data.data)) {
                setRoutes(res.data.data);
            }
        } catch (e) {
            console.error("Error fetching routes:", e);
        }
    };

    // Lấy danh sách drivers
    const fetchDrivers = async () => {
        try {
            const res = await getDrivers();
            if (res.data && Array.isArray(res.data.data)) {
                setDrivers(res.data.data);
            }
        } catch (e) {
            console.error("Error fetching drivers:", e);
        }
    };

    // Xử lý input change cho bus
    const handleBusInputChange = (e) => {
        const { name, value } = e.target;
        setBusFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Xử lý input change cho schedule
    const handleScheduleInputChange = (e) => {
        const { name, value } = e.target;
        setScheduleFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Reset form
    const resetForm = () => {
        if (selectedType === "bus") {
            setBusFormData({
                bien_so: "",
                id_driver: "",
                id_route: ""
            });
            setEditingBus(null);
        } else {
            setScheduleFormData({
                id_route: "",
                id_driver: "",
                Stime: "",
                Sdate: ""
            });
            setEditingSchedule(null);
        }
    };

    // Xử lý submit bus
    const handleBusSubmit = async (e) => {
        e.preventDefault();
        try {
            let result;

            if (editingBus) {
                result = await updateBus({
                    id_bus: editingBus.id_bus,
                    ...busFormData
                });
            } else {
                result = await createNewBus(busFormData);
            }

            if (result.data.errCode === 0) {
                alert(editingBus ? "Cập nhật xe bus thành công!" : "Thêm xe bus thành công!");
                resetForm();
                fetchBuses();
                setActiveTab("view");
            } else {
                alert(result.data.message);
            }
        } catch (error) {
            console.error("Error saving bus:", error);
            alert("Có lỗi xảy ra!");
        }
    };

    // Xử lý submit schedule
    const handleScheduleSubmit = async (e) => {
        e.preventDefault();
        try {
            let result;

            if (editingSchedule) {
                result = await updateSchedule({
                    id_schedule: editingSchedule.id_schedule,
                    ...scheduleFormData
                });
            } else {
                result = await createNewSchedule(scheduleFormData);
            }

            if (result.data.errCode === 0) {
                alert(editingSchedule ? "Cập nhật lịch trình thành công!" : "Thêm lịch trình thành công!");
                resetForm();
                fetchSchedules();
                setActiveTab("view");
            } else {
                alert(result.data.message);
            }
        } catch (error) {
            console.error("Error saving schedule:", error);
            alert("Có lỗi xảy ra!");
        }
    };

    // Xử lý edit bus
    const handleEditBus = (bus) => {
        setEditingBus(bus);
        setBusFormData({
            bien_so: bus.bien_so,
            id_driver: bus.id_driver,
            id_route: bus.id_route
        });
        setActiveTab("add");
    };

    // Xử lý edit schedule
    const handleEditSchedule = (schedule) => {
        setEditingSchedule(schedule);
        setScheduleFormData({
            id_route: schedule.id_route,
            id_driver: schedule.id_driver,
            Stime: schedule.Stime,
            Sdate: schedule.Sdate,
            status: schedule.status || "Đã lên lịch"
        });
        setActiveTab("add");
    };

    // Xử lý delete bus
    const handleDeleteBus = async (busId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa xe bus này?")) {
            try {
                const result = await deleteBus(busId);
                if (result.data.errCode === 0) {
                    alert("Xóa xe bus thành công!");
                    fetchBuses();
                } else {
                    alert(result.data.message);
                }
            } catch (error) {
                console.error("Error deleting bus:", error);
                alert("Có lỗi xảy ra khi xóa!");
            }
        }
    };

    // Xử lý delete schedule
    const handleDeleteSchedule = async (scheduleId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa lịch trình này?")) {
            try {
                const result = await deleteSchedule(scheduleId);
                if (result.data.errCode === 0) {
                    alert("Xóa lịch trình thành công!");
                    fetchSchedules();
                } else {
                    alert(result.data.message);
                }
            } catch (error) {
                console.error("Error deleting schedule:", error);
                alert("Có lỗi xảy ra khi xóa!");
            }
        }
    };

    const renderRightContent = () => {
        switch (activeTab) {
            case "view":
                return selectedType === "bus" ? renderBusViewTab() : renderScheduleViewTab();
            case "add":
                return selectedType === "bus" ? renderBusAddTab() : renderScheduleAddTab();
            default:
                return null;
        }
    };

    // THÊM 2 HÀM NÀY

    // Tab xem danh sách bus
    const renderBusViewTab = () => {
        return (
            <div>
                {loading ? (
                    <div className="bus-mgmt-loading-text">Đang tải dữ liệu...</div>
                ) : !Array.isArray(busBuffer) || busBuffer.length === 0 ? (
                    <div className="bus-mgmt-empty-text">Không có dữ liệu xe bus</div>
                ) : (
                    <div className="bus-mgmt-table-container">
                        <table className="bus-mgmt-table">
                            <thead>
                                <tr>
                                    <th>Mã xe</th>
                                    <th>Biển số</th>
                                    <th>Tài xế</th>
                                    <th>Tuyến đường</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {busBuffer.map((bus, index) => (
                                    <tr key={index}>
                                        <td>{bus.id_bus}</td>
                                        <td>{bus.bien_so}</td>
                                        <td>{bus.driver?.user?.name || 'N/A'}</td>
                                        <td>{bus.route?.name_street || 'N/A'}</td>
                                        <td>
                                            <button
                                                className="bus-mgmt-edit-btn"
                                                onClick={() => handleEditBus(bus)}
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                className="bus-mgmt-delete-btn"
                                                onClick={() => handleDeleteBus(bus.id_bus)}
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    // Tab thêm/sửa bus
    const renderBusAddTab = () => {
        return (
            <div className="bus-mgmt-form-container">
                <h3 className="bus-mgmt-form-title">
                    {editingBus ? `Sửa xe bus: ${editingBus.id_bus}` : "Thêm xe bus mới"}
                </h3>

                <form onSubmit={handleBusSubmit}>
                    <div className="bus-mgmt-form-group">
                        <label className="bus-mgmt-form-label">Biển số xe</label>
                        <input
                            type="text"
                            name="bien_so"
                            value={busFormData.bien_so}
                            onChange={handleBusInputChange}
                            placeholder="Nhập biển số xe"
                            required
                            className="bus-mgmt-form-input"
                        />
                    </div>

                    <div className="bus-mgmt-form-group">
                        <label className="bus-mgmt-form-label">Tài xế</label>
                        <select
                            name="id_driver"
                            value={busFormData.id_driver}
                            onChange={handleBusInputChange}
                            required
                            className="bus-mgmt-form-select"
                        >
                            <option value="">Chọn tài xế</option>
                            {drivers.map(driver => (
                                <option key={driver.id_driver} value={driver.id_driver}>
                                    {driver.driver_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="bus-mgmt-form-group">
                        <label className="bus-mgmt-form-label">Tuyến đường</label>
                        <select
                            name="id_route"
                            value={busFormData.id_route}
                            onChange={handleBusInputChange}
                            required
                            className="bus-mgmt-form-select"
                        >
                            <option value="">Chọn tuyến đường</option>
                            {routes.map(route => (
                                <option key={route.id_route} value={route.id_route}>
                                    {route.name_street}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="bus-mgmt-form-actions">
                        <button type="submit" className="bus-mgmt-submit-btn">
                            {editingBus ? "Cập nhật xe bus" : "Thêm xe bus"}
                        </button>
                        {editingBus && (
                            <button
                                type="button"
                                className="bus-mgmt-cancel-btn"
                                onClick={resetForm}
                            >
                                Hủy
                            </button>
                        )}
                    </div>
                </form>
            </div>
        );
    };

    // Tab xem danh sách schedule với filter
    const renderScheduleViewTab = () => {
        return (
            <div>
                {/* Filter Section */}
                <div className="bus-mgmt-filter-section">
                    <h4>Bộ lọc lịch trình:</h4>
                    <div className="bus-mgmt-filter-grid">
                        <div className="bus-mgmt-filter-group">
                            <label>Tài xế:</label>
                            <select
                                value={scheduleFilters.id_driver}
                                onChange={(e) => handleScheduleFilterChange('id_driver', e.target.value)}
                                className="bus-mgmt-filter-select"
                            >
                                <option value="">Tất cả tài xế</option>
                                {drivers.map(driver => (
                                    <option key={driver.id_driver} value={driver.id_driver}>
                                        {driver.driver_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="bus-mgmt-filter-group">
                            <label>Tuyến đường:</label>
                            <select
                                value={scheduleFilters.id_route}
                                onChange={(e) => handleScheduleFilterChange('id_route', e.target.value)}
                                className="bus-mgmt-filter-select"
                            >
                                <option value="">Tất cả tuyến đường</option>
                                {routes.map(route => (
                                    <option key={route.id_route} value={route.id_route}>
                                        {route.name_street}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="bus-mgmt-filter-group">
                            <label>Trạng thái:</label>
                            <select
                                value={scheduleFilters.status}
                                onChange={(e) => handleScheduleFilterChange('status', e.target.value)}
                                className="bus-mgmt-filter-select"
                            >
                                <option value="">Tất cả trạng thái</option>
                                {statuses.map(status => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="bus-mgmt-filter-group">
                            <label>Ngày:</label>
                            <input
                                type="date"
                                value={scheduleFilters.date}
                                onChange={(e) => handleScheduleFilterChange('date', e.target.value)}
                                className="bus-mgmt-filter-input"
                            />
                        </div>

                        <div className="bus-mgmt-filter-group">
                            <label>Sắp xếp thời gian:</label>
                            <button
                                onClick={handleTimeSort}
                                className={`bus-mgmt-sort-btn ${timeSort ? 'active' : ''}`}
                            >
                                {timeSort === "ASC" ? "⏫ Sớm nhất" :
                                    timeSort === "DESC" ? "⏬ Trễ nhất" : "🕒 Thời gian"}
                            </button>
                        </div>
                    </div>

                    <div className="bus-mgmt-filter-actions">
                        <button onClick={applyScheduleFilters} className="bus-mgmt-apply-btn">
                            Áp dụng
                        </button>
                        <button onClick={resetScheduleFilters} className="bus-mgmt-reset-btn">
                            Reset
                        </button>
                    </div>
                </div>

                {/* Table Section với scroll */}
                {loading ? (
                    <div className="bus-mgmt-loading-text">Đang tải dữ liệu...</div>
                ) : !Array.isArray(scheduleBuffer) || scheduleBuffer.length === 0 ? (
                    <div className="bus-mgmt-empty-text">Không có dữ liệu lịch trình</div>
                ) : (
                    <div className="bus-mgmt-table-container">
                        <table className="bus-mgmt-table">
                            <thead>
                                <tr>
                                    <th>Mã lịch</th>
                                    <th>Tuyến đường</th>
                                    <th>Tài xế</th>
                                    <th>Thời gian</th>
                                    <th>Ngày</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {scheduleBuffer.map((schedule, index) => (
                                    <tr key={index}>
                                        <td>{schedule.id_schedule}</td>
                                        <td>{schedule.routes?.name_street || 'N/A'}</td>
                                        <td>{schedule.driver?.user?.name || 'N/A'}</td>
                                        <td>{schedule.Stime}</td>
                                        <td>{schedule.Sdate}</td>
                                        <td>
                                            <span className={`status-badge status-${schedule.status.replace(/\s+/g, '-').toLowerCase()}`}>
                                                {schedule.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="bus-mgmt-edit-btn"
                                                onClick={() => handleEditSchedule(schedule)}
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                className="bus-mgmt-delete-btn"
                                                onClick={() => handleDeleteSchedule(schedule.id_schedule)}
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    // Tab thêm/sửa schedule - BỎ STATUS
    const renderScheduleAddTab = () => {
        return (
            <div className="bus-mgmt-form-container">
                <h3 className="bus-mgmt-form-title">
                    {editingSchedule ? `Sửa lịch trình: ${editingSchedule.id_schedule}` : "Thêm lịch trình mới"}
                </h3>

                <form onSubmit={handleScheduleSubmit}>
                    <div className="bus-mgmt-form-group">
                        <label className="bus-mgmt-form-label">Tuyến đường</label>
                        <select
                            name="id_route"
                            value={scheduleFormData.id_route}
                            onChange={handleScheduleInputChange}
                            required
                            className="bus-mgmt-form-select"
                        >
                            <option value="">Chọn tuyến đường</option>
                            {routes.map(route => (
                                <option key={route.id_route} value={route.id_route}>
                                    {route.name_street}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="bus-mgmt-form-group">
                        <label className="bus-mgmt-form-label">Tài xế</label>
                        <select
                            name="id_driver"
                            value={scheduleFormData.id_driver}
                            onChange={handleScheduleInputChange}
                            required
                            className="bus-mgmt-form-select"
                        >
                            <option value="">Chọn tài xế</option>
                            {drivers.map(driver => (
                                <option key={driver.id_driver} value={driver.id_driver}>
                                    {driver.driver_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="bus-mgmt-form-group">
                        <label className="bus-mgmt-form-label">Thời gian</label>
                        <input
                            type="time"
                            name="Stime"
                            value={scheduleFormData.Stime}
                            onChange={handleScheduleInputChange}
                            required
                            className="bus-mgmt-form-input"
                        />
                    </div>

                    <div className="bus-mgmt-form-group">
                        <label className="bus-mgmt-form-label">Ngày</label>
                        <input
                            type="date"
                            name="Sdate"
                            value={scheduleFormData.Sdate}
                            onChange={handleScheduleInputChange}
                            required
                            className="bus-mgmt-form-input"
                        />
                    </div>

                    {/* CHỈ HIỆN STATUS KHI EDIT */}
                    {editingSchedule && (
                        <div className="bus-mgmt-form-group">
                            <label className="bus-mgmt-form-label">Trạng thái</label>
                            <select
                                name="status"
                                value={scheduleFormData.status}
                                onChange={handleScheduleInputChange}
                                required
                                className="bus-mgmt-form-select"
                            >
                                <option value="Đã lên lịch">Đã lên lịch</option>
                                <option value="Vận hành">Vận hành</option>
                                <option value="Hoàn thành">Hoàn thành</option>
                                <option value="Hủy bỏ">Hủy bỏ</option>
                            </select>
                        </div>
                    )}

                    <div className="bus-mgmt-form-actions">
                        <button type="submit" className="bus-mgmt-submit-btn">
                            {editingSchedule ? "Cập nhật lịch trình" : "Thêm lịch trình"}
                        </button>
                        {editingSchedule && (
                            <button
                                type="button"
                                className="bus-mgmt-cancel-btn"
                                onClick={resetForm}
                            >
                                Hủy
                            </button>
                        )}
                    </div>
                </form>
            </div>
        );
    };

    return (
        <div className="bus-mgmt-container">
            {/* LEFT PANEL */}
            <div className="bus-mgmt-left-panel">
                {/* Section 1: Chọn loại */}
                <div className="bus-mgmt-section">
                    <span className="bus-mgmt-section-label">Chọn loại:</span>
                    <div className="bus-mgmt-type-selection">
                        <button
                            className={`bus-mgmt-type-btn ${selectedType === "bus" ? "active" : ""}`}
                            onClick={() => {
                                setSelectedType("bus");
                                setActiveTab("view");
                                resetForm();
                            }}
                        >
                            Xe Bus
                        </button>
                        <button
                            className={`bus-mgmt-type-btn ${selectedType === "schedule" ? "active" : ""}`}
                            onClick={() => {
                                setSelectedType("schedule");
                                setActiveTab("view");
                                resetForm();
                            }}
                        >
                            Lịch trình
                        </button>
                    </div>
                </div>

                {/* Section 2: Chức năng */}
                <div className="bus-mgmt-section">
                    <span className="bus-mgmt-section-label">Chức năng:</span>
                    <div className="bus-mgmt-tab-navigation">
                        <button
                            className={`bus-mgmt-tab-btn ${activeTab === "view" ? "active" : ""}`}
                            onClick={() => {
                                setActiveTab("view");
                                resetForm();
                            }}
                        >
                            👁️ Xem
                        </button>
                        <button
                            className={`bus-mgmt-tab-btn ${activeTab === "add" ? "active" : ""}`}
                            onClick={() => {
                                setActiveTab("add");
                                resetForm();
                            }}
                        >
                            ➕ Thêm
                        </button>
                    </div>
                </div>

                {/* Section 3: Thống kê */}
                <div className="bus-mgmt-stats-container">
                    <h3 className="bus-mgmt-stats-title">Thống kê</h3>
                    <div className="bus-mgmt-stats-grid">
                        <div className="bus-mgmt-stat-item">
                            <span className="bus-mgmt-stat-value">{busBuffer.length}</span>
                            <span className="bus-mgmt-stat-label">Tổng số xe</span>
                        </div>
                        <div className="bus-mgmt-stat-item">
                            <span className="bus-mgmt-stat-value">{scheduleBuffer.length}</span>
                            <span className="bus-mgmt-stat-label">Lịch trình</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="bus-mgmt-right-panel">
                {renderRightContent()}
            </div>
        </div>
    );

};

export default BusManagement;

// const BusManagement = () => {
//     const [activeTab, setActiveTab] = useState("view");
//     const [selectedType, setSelectedType] = useState("bus"); // "bus" hoặc "schedule"
//     const [busBuffer, setBusBuffer] = useState([]);
//     const [scheduleBuffer, setScheduleBuffer] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [routes, setRoutes] = useState([]);
//     const [drivers, setDrivers] = useState([]);

//     // Form state cho bus
//     const [busFormData, setBusFormData] = useState({
//         bien_so: "",
//         id_driver: "",
//         id_route: ""
//     });

//     // Form state cho schedule
//     const [scheduleFormData, setScheduleFormData] = useState({
//         id_route: "",
//         id_driver: "",
//         Stime: "",
//         Sdate: "",
//         status: "Đã lên lịch"
//     });

//     // Edit state
//     const [editingBus, setEditingBus] = useState(null);
//     const [editingSchedule, setEditingSchedule] = useState(null);

//     // Fetch data khi component mount hoặc type thay đổi
//     useEffect(() => {
//         if (selectedType === "bus") {
//             fetchBuses();
//             fetchRoutes();
//             fetchDrivers();
//         } else {
//             fetchSchedules();
//             fetchRoutes();
//             fetchDrivers();
//         }
//     }, [selectedType]);

//     // Lấy danh sách buses
//     const fetchBuses = async () => {
//         setLoading(true);
//         try {
//             const res = await getAllBuses('ALL');
//             if (res.data && Array.isArray(res.data.data)) {
//                 setBusBuffer(res.data.data);
//             } else {
//                 setBusBuffer([]);
//             }
//         } catch (e) {
//             console.error("Error fetching buses:", e);
//             setBusBuffer([]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Lấy danh sách schedules
//     const fetchSchedules = async () => {
//         setLoading(true);
//         try {
//             const res = await getAllSchedules('ALL');
//             if (res.data && Array.isArray(res.data.data)) {
//                 setScheduleBuffer(res.data.data);
//             } else {
//                 setScheduleBuffer([]);
//             }
//         } catch (e) {
//             console.error("Error fetching schedules:", e);
//             setScheduleBuffer([]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Lấy danh sách routes
//     const fetchRoutes = async () => {
//         try {
//             const res = await getRoutes();
//             if (res.data && Array.isArray(res.data.data)) {
//                 setRoutes(res.data.data);
//             }
//         } catch (e) {
//             console.error("Error fetching routes:", e);
//         }
//     };

//     // Lấy danh sách drivers
//     const fetchDrivers = async () => {
//         try {
//             const res = await getDrivers();
//             if (res.data && Array.isArray(res.data.data)) {
//                 setDrivers(res.data.data);
//             }
//         } catch (e) {
//             console.error("Error fetching drivers:", e);
//         }
//     };

//     // Xử lý thay đổi form input cho bus
//     const handleBusInputChange = (e) => {
//         const { name, value } = e.target;
//         setBusFormData(prev => ({
//             ...prev,
//             [name]: value
//         }));
//     };

//     // Xử lý thay đổi form input cho schedule
//     const handleScheduleInputChange = (e) => {
//         const { name, value } = e.target;
//         setScheduleFormData(prev => ({
//             ...prev,
//             [name]: value
//         }));
//     };

//     // Reset form
//     const resetForm = () => {
//         if (selectedType === "bus") {
//             setBusFormData({
//                 bien_so: "",
//                 id_driver: "",
//                 id_route: ""
//             });
//             setEditingBus(null);
//         } else {
//             setScheduleFormData({
//                 id_route: "",
//                 id_driver: "",
//                 Stime: "",
//                 Sdate: "",
//                 status: "Đã lên lịch"
//             });
//             setEditingSchedule(null);
//         }
//     };

//     // Xử lý submit form bus
//     const handleBusSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             let result;

//             if (editingBus) {
//                 result = await updateBus({
//                     id_bus: editingBus.id_bus,
//                     ...busFormData
//                 });
//             } else {
//                 result = await createNewBus(busFormData);
//             }

//             if (result.data.errCode === 0) {
//                 alert(editingBus ? "Cập nhật xe bus thành công!" : "Thêm xe bus thành công!");
//                 resetForm();
//                 fetchBuses();
//                 setActiveTab("view");
//             } else {
//                 alert(result.data.message);
//             }
//         } catch (error) {
//             console.error("Error saving bus:", error);
//             alert("Có lỗi xảy ra!");
//         }
//     };

//     // Xử lý submit form schedule
//     const handleScheduleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             let result;

//             if (editingSchedule) {
//                 result = await updateSchedule({
//                     id_schedule: editingSchedule.id_schedule,
//                     ...scheduleFormData
//                 });
//             } else {
//                 result = await createNewSchedule(scheduleFormData);
//             }

//             if (result.data.errCode === 0) {
//                 alert(editingSchedule ? "Cập nhật lịch trình thành công!" : "Thêm lịch trình thành công!");
//                 resetForm();
//                 fetchSchedules();
//                 setActiveTab("view");
//             } else {
//                 alert(result.data.message);
//             }
//         } catch (error) {
//             console.error("Error saving schedule:", error);
//             alert("Có lỗi xảy ra!");
//         }
//     };

//     // Xử lý sửa bus
//     const handleEditBus = (bus) => {
//         setEditingBus(bus);
//         setBusFormData({
//             bien_so: bus.bien_so,
//             id_driver: bus.id_driver,
//             id_route: bus.id_route
//         });
//         setActiveTab("add");
//     };

//     // Xử lý sửa schedule
//     const handleEditSchedule = (schedule) => {
//         setEditingSchedule(schedule);
//         setScheduleFormData({
//             id_route: schedule.id_route,
//             id_driver: schedule.id_driver,
//             Stime: schedule.Stime,
//             Sdate: schedule.Sdate,
//             status: schedule.status
//         });
//         setActiveTab("add");
//     };

//     // Xử lý xóa bus
//     const handleDeleteBus = async (busId) => {
//         if (window.confirm("Bạn có chắc chắn muốn xóa xe bus này?")) {
//             try {
//                 const result = await deleteBus(busId);
//                 if (result.data.errCode === 0) {
//                     alert("Xóa xe bus thành công!");
//                     fetchBuses();
//                 } else {
//                     alert(result.data.message);
//                 }
//             } catch (error) {
//                 console.error("Error deleting bus:", error);
//                 alert("Có lỗi xảy ra khi xóa!");
//             }
//         }
//     };

//     // Xử lý xóa schedule
//     const handleDeleteSchedule = async (scheduleId) => {
//         if (window.confirm("Bạn có chắc chắn muốn xóa lịch trình này?")) {
//             try {
//                 const result = await deleteSchedule(scheduleId);
//                 if (result.data.errCode === 0) {
//                     alert("Xóa lịch trình thành công!");
//                     fetchSchedules();
//                 } else {
//                     alert(result.data.message);
//                 }
//             } catch (error) {
//                 console.error("Error deleting schedule:", error);
//                 alert("Có lỗi xảy ra khi xóa!");
//             }
//         }
//     };

//     // Render nội dung theo tab
// const renderRightContent = () => {
//     switch (activeTab) {
//         case "view":
//             return selectedType === "bus" ? renderBusViewTab() : renderScheduleViewTab();
//         case "add":
//             return selectedType === "bus" ? renderBusAddTab() : renderScheduleAddTab();
//         default:
//             return null;
//     }
// };

//     // Tab xem danh sách bus
//     const renderBusViewTab = () => {
//         return (
//             <div>
//                 {loading ? (
//                     <div className="bus-mgmt-loading-text">Đang tải dữ liệu...</div>
//                 ) : !Array.isArray(busBuffer) || busBuffer.length === 0 ? (
//                     <div className="bus-mgmt-empty-text">Không có dữ liệu xe bus</div>
//                 ) : (
//                     <table className="bus-mgmt-table">
//                         <thead>
//                             <tr>
//                                 <th>Mã xe</th>
//                                 <th>Biển số</th>
//                                 <th>Tài xế</th>
//                                 <th>Tuyến đường</th>
//                                 <th>Thao tác</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {busBuffer.map((bus, index) => (
//                                 <tr key={index}>
//                                     <td>{bus.id_bus}</td>
//                                     <td>{bus.bien_so}</td>
//                                     <td>{bus.driver?.user?.name || 'N/A'}</td>
//                                     <td>{bus.route?.name_street || 'N/A'}</td>
//                                     <td>
//                                         <button
//                                             className="bus-mgmt-edit-btn"
//                                             onClick={() => handleEditBus(bus)}
//                                         >
//                                             Sửa
//                                         </button>
//                                         <button
//                                             className="bus-mgmt-delete-btn"
//                                             onClick={() => handleDeleteBus(bus.id_bus)}
//                                         >
//                                             Xóa
//                                         </button>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 )}
//             </div>
//         );
//     };

//     // Tab xem danh sách schedule
//     const renderScheduleViewTab = () => {
//         return (
//             <div>
//                 {loading ? (
//                     <div className="bus-mgmt-loading-text">Đang tải dữ liệu...</div>
//                 ) : !Array.isArray(scheduleBuffer) || scheduleBuffer.length === 0 ? (
//                     <div className="bus-mgmt-empty-text">Không có dữ liệu lịch trình</div>
//                 ) : (
//                     <table className="bus-mgmt-table">
//                         <thead>
//                             <tr>
//                                 <th>Mã lịch</th>
//                                 <th>Tuyến đường</th>
//                                 <th>Tài xế</th>
//                                 <th>Thời gian</th>
//                                 <th>Ngày</th>
//                                 <th>Trạng thái</th>
//                                 <th>Thao tác</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {scheduleBuffer.map((schedule, index) => (
//                                 <tr key={index}>
//                                     <td>{schedule.id_schedule}</td>
//                                     <td>{schedule.routes?.name_street || 'N/A'}</td>
//                                     <td>{schedule.driver?.user?.name || 'N/A'}</td>
//                                     <td>{schedule.Stime}</td>
//                                     <td>{schedule.Sdate}</td>
//                                     <td>{schedule.status}</td>
//                                     <td>
//                                         <button
//                                             className="bus-mgmt-edit-btn"
//                                             onClick={() => handleEditSchedule(schedule)}
//                                         >
//                                             Sửa
//                                         </button>
//                                         <button
//                                             className="bus-mgmt-delete-btn"
//                                             onClick={() => handleDeleteSchedule(schedule.id_schedule)}
//                                         >
//                                             Xóa
//                                         </button>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 )}
//             </div>
//         );
//     };

//     // Tab thêm/sửa bus
//     const renderBusAddTab = () => {
//         return (
//             <div className="bus-mgmt-form-container">
//                 <h3 className="bus-mgmt-form-title">
//                     {editingBus ? `Sửa xe bus: ${editingBus.id_bus}` : "Thêm xe bus mới"}
//                 </h3>

//                 <form onSubmit={handleBusSubmit}>
//                     <div className="bus-mgmt-form-group">
//                         <label className="bus-mgmt-form-label">Biển số xe</label>
//                         <input
//                             type="text"
//                             name="bien_so"
//                             value={busFormData.bien_so}
//                             onChange={handleBusInputChange}
//                             placeholder="Nhập biển số xe"
//                             required
//                             className="bus-mgmt-form-input"
//                         />
//                     </div>

//                     <div className="bus-mgmt-form-group">
//                         <label className="bus-mgmt-form-label">Tài xế</label>
//                         <select
//                             name="id_driver"
//                             value={busFormData.id_driver}
//                             onChange={handleBusInputChange}
//                             required
//                             className="bus-mgmt-form-select"
//                         >
//                             <option value="">Chọn tài xế</option>
//                             {drivers.map(driver => (
//                                 <option key={driver.id_driver} value={driver.id_driver}>
//                                     {driver.driver_name}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>

//                     <div className="bus-mgmt-form-group">
//                         <label className="bus-mgmt-form-label">Tuyến đường</label>
//                         <select
//                             name="id_route"
//                             value={busFormData.id_route}
//                             onChange={handleBusInputChange}
//                             required
//                             className="bus-mgmt-form-select"
//                         >
//                             <option value="">Chọn tuyến đường</option>
//                             {routes.map(route => (
//                                 <option key={route.id_route} value={route.id_route}>
//                                     {route.name_street}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>

//                     <div className="bus-mgmt-form-actions">
//                         <button type="submit" className="bus-mgmt-submit-btn">
//                             {editingBus ? "Cập nhật xe bus" : "Thêm xe bus"}
//                         </button>
//                         {editingBus && (
//                             <button
//                                 type="button"
//                                 className="bus-mgmt-cancel-btn"
//                                 onClick={resetForm}
//                             >
//                                 Hủy
//                             </button>
//                         )}
//                     </div>
//                 </form>
//             </div>
//         );
//     };

//     // Tab thêm/sửa schedule
//     const renderScheduleAddTab = () => {
//         return (
//             <div className="bus-mgmt-form-container">
//                 <h3 className="bus-mgmt-form-title">
//                     {editingSchedule ? `Sửa lịch trình: ${editingSchedule.id_schedule}` : "Thêm lịch trình mới"}
//                 </h3>

//                 <form onSubmit={handleScheduleSubmit}>
//                     <div className="bus-mgmt-form-group">
//                         <label className="bus-mgmt-form-label">Tuyến đường</label>
//                         <select
//                             name="id_route"
//                             value={scheduleFormData.id_route}
//                             onChange={handleScheduleInputChange}
//                             required
//                             className="bus-mgmt-form-select"
//                         >
//                             <option value="">Chọn tuyến đường</option>
//                             {routes.map(route => (
//                                 <option key={route.id_route} value={route.id_route}>
//                                     {route.name_street}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>

//                     <div className="bus-mgmt-form-group">
//                         <label className="bus-mgmt-form-label">Tài xế</label>
//                         <select
//                             name="id_driver"
//                             value={scheduleFormData.id_driver}
//                             onChange={handleScheduleInputChange}
//                             required
//                             className="bus-mgmt-form-select"
//                         >
//                             <option value="">Chọn tài xế</option>
//                             {drivers.map(driver => (
//                                 <option key={driver.id_driver} value={driver.id_driver}>
//                                     {driver.driver_name}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>

//                     <div className="bus-mgmt-form-group">
//                         <label className="bus-mgmt-form-label">Thời gian</label>
//                         <input
//                             type="time"
//                             name="Stime"
//                             value={scheduleFormData.Stime}
//                             onChange={handleScheduleInputChange}
//                             required
//                             className="bus-mgmt-form-input"
//                         />
//                     </div>

//                     <div className="bus-mgmt-form-group">
//                         <label className="bus-mgmt-form-label">Ngày</label>
//                         <input
//                             type="date"
//                             name="Sdate"
//                             value={scheduleFormData.Sdate}
//                             onChange={handleScheduleInputChange}
//                             required
//                             className="bus-mgmt-form-input"
//                         />
//                     </div>

//                     <div className="bus-mgmt-form-group">
//                         <label className="bus-mgmt-form-label">Trạng thái</label>
//                         <select
//                             name="status"
//                             value={scheduleFormData.status}
//                             onChange={handleScheduleInputChange}
//                             required
//                             className="bus-mgmt-form-select"
//                         >
//                             <option value="Đã lên lịch">Đã lên lịch</option>
//                             <option value="Vận hành">Vận hành</option>
//                             <option value="Hoàn thành">Hoàn thành</option>
//                             <option value="Hủy bỏ">Hủy bỏ</option>
//                         </select>
//                     </div>

//                     <div className="bus-mgmt-form-actions">
//                         <button type="submit" className="bus-mgmt-submit-btn">
//                             {editingSchedule ? "Cập nhật lịch trình" : "Thêm lịch trình"}
//                         </button>
//                         {editingSchedule && (
//                             <button
//                                 type="button"
//                                 className="bus-mgmt-cancel-btn"
//                                 onClick={resetForm}
//                             >
//                                 Hủy
//                             </button>
//                         )}
//                     </div>
//                 </form>
//             </div>
//         );
//     };

//     return (
//         <div className="bus-mgmt-container">
//             {/* LEFT PANEL */}
//             <div className="bus-mgmt-left-panel">
//                 {/* Section 1: Chọn loại */}
//                 <div className="bus-mgmt-section">
//                     <span className="bus-mgmt-section-label">Chọn loại:</span>
//                     <div className="bus-mgmt-type-selection">
//                         <button
//                             className={`bus-mgmt-type-btn ${selectedType === "bus" ? "active" : ""}`}
//                             onClick={() => {
//                                 setSelectedType("bus");
//                                 setActiveTab("view");
//                                 resetForm();
//                             }}
//                         >
//                             Xe Bus
//                         </button>
//                         <button
//                             className={`bus-mgmt-type-btn ${selectedType === "schedule" ? "active" : ""}`}
//                             onClick={() => {
//                                 setSelectedType("schedule");
//                                 setActiveTab("view");
//                                 resetForm();
//                             }}
//                         >
//                             Lịch trình
//                         </button>
//                     </div>
//                 </div>

//                 {/* Section 2: Chức năng */}
//                 <div className="bus-mgmt-section">
//                     <span className="bus-mgmt-section-label">Chức năng:</span>
//                     <div className="bus-mgmt-tab-navigation">
//                         <button
//                             className={`bus-mgmt-tab-btn ${activeTab === "view" ? "active" : ""}`}
//                             onClick={() => {
//                                 setActiveTab("view");
//                                 resetForm();
//                             }}
//                         >
//                             👁️ Xem
//                         </button>
//                         <button
//                             className={`bus-mgmt-tab-btn ${activeTab === "add" ? "active" : ""}`}
//                             onClick={() => {
//                                 setActiveTab("add");
//                                 resetForm();
//                             }}
//                         >
//                             ➕ Thêm
//                         </button>
//                     </div>
//                 </div>

//                 {/* Section 3: Thống kê */}
//                 <div className="bus-mgmt-stats-container">
//                     <h3 className="bus-mgmt-stats-title">Thống kê</h3>
//                     <div className="bus-mgmt-stats-grid">
//                         <div className="bus-mgmt-stat-item">
//                             <span className="bus-mgmt-stat-value">{busBuffer.length}</span>
//                             <span className="bus-mgmt-stat-label">Tổng số xe</span>
//                         </div>
//                         <div className="bus-mgmt-stat-item">
//                             <span className="bus-mgmt-stat-value">{scheduleBuffer.length}</span>
//                             <span className="bus-mgmt-stat-label">Lịch trình</span>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* RIGHT PANEL */}
//             <div className="bus-mgmt-right-panel">
//                 {renderRightContent()}
//             </div>
//         </div>
//     );
// };

// export default BusManagement;