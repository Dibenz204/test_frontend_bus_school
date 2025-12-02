import React, { useState, useEffect } from "react";
import { getAllRequests, deleteRequest } from "../../services/requestService";
import { getAllEvaluates, deleteEvaluate } from "../../services/evaluateService";
import "../../styles/RequestEvaluateManagement.css";

const RequestEvaluateManagement = () => {
    const [activeTab, setActiveTab] = useState("request");
    const [requests, setRequests] = useState([]);
    const [evaluates, setEvaluates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        request_type: "",
        star: "",
        date_from: "",
        date_to: ""
    });

    // Load data khi tab thay đổi
    useEffect(() => {
        loadData();
    }, [activeTab]);

    // Load tất cả data
    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === "request") {
                const requestsRes = await getAllRequests('ALL');
                if (requestsRes.data.errCode === 0) {
                    setRequests(requestsRes.data.data || []);
                }
            } else {
                const evaluatesRes = await getAllEvaluates('ALL');
                if (evaluatesRes.data.errCode === 0) {
                    setEvaluates(evaluatesRes.data.data || []);
                }
            }
        } catch (error) {
            console.error("Lỗi load data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Xóa request
    const handleDeleteRequest = async (requestId) => {
        if (window.confirm("Bạn có chắc muốn xóa yêu cầu này?")) {
            try {
                const res = await deleteRequest(requestId);
                if (res.data.errCode === 0) {
                    alert("Xóa yêu cầu thành công!");
                    loadData();
                } else {
                    alert(res.data.message);
                }
            } catch (error) {
                console.error("Lỗi xóa yêu cầu:", error);
                alert("Lỗi khi xóa yêu cầu!");
            }
        }
    };

    // Xóa evaluate
    const handleDeleteEvaluate = async (evaluateId) => {
        if (window.confirm("Bạn có chắc muốn xóa đánh giá này?")) {
            try {
                const res = await deleteEvaluate(evaluateId);
                if (res.data.errCode === 0) {
                    alert("Xóa đánh giá thành công!");
                    loadData();
                } else {
                    alert(res.data.message);
                }
            } catch (error) {
                console.error("Lỗi xóa đánh giá:", error);
                alert("Lỗi khi xóa đánh giá!");
            }
        }
    };

    // Lọc data
    const filterData = (data) => {
        let filtered = data;

        if (activeTab === "request") {
            if (filters.request_type) {
                filtered = filtered.filter(item => item.request_type === filters.request_type);
            }
        } else {
            if (filters.star) {
                filtered = filtered.filter(item => item.star === parseInt(filters.star));
            }
        }

        // Filter theo ngày
        if (filters.date_from) {
            filtered = filtered.filter(item => new Date(item.createdAt) >= new Date(filters.date_from));
        }
        if (filters.date_to) {
            const toDate = new Date(filters.date_to);
            toDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(item => new Date(item.createdAt) <= toDate);
        }

        return filtered;
    };

    const filteredRequests = filterData(requests);
    const filteredEvaluates = filterData(evaluates);

    // Reset filters
    const resetFilters = () => {
        setFilters({
            request_type: "",
            star: "",
            date_from: "",
            date_to: ""
        });
    };

    // ========== RENDER FUNCTIONS ==========
    const renderRequestTab = () => (
        <div className="tab-content">
            <div className="filter-section">
                {/* <h3>Bộ lọc</h3> */}
                <div className="filter-form">
                    <div className="filter-row">
                        <div className="filter-group">
                            <label>Loại yêu cầu:</label>
                            <select
                                value={filters.request_type}
                                onChange={(e) => setFilters({ ...filters, request_type: e.target.value })}
                                className="filter-input"
                            >
                                <option value="">Tất cả</option>
                                <option value="Xe bus">Xe bus</option>
                                <option value="Trạm đón/trả">Trạm đón/trả</option>
                                <option value="Tuyến đường">Tuyến đường</option>
                                <option value="Khác">Khác</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Từ ngày:</label>
                            <input
                                type="date"
                                value={filters.date_from}
                                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                                className="filter-input"
                            />
                        </div>

                        <div className="filter-group">
                            <label>Đến ngày:</label>
                            <input
                                type="date"
                                value={filters.date_to}
                                onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                                className="filter-input"
                            />
                        </div>
                    </div>

                    <div className="filter-actions">
                        <button onClick={resetFilters} className="reset-btn">
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            <div className="list-section">
                <div className="section-header">
                    <h3>Danh sách yêu cầu ({filteredRequests.length})</h3>
                    <button onClick={loadData} className="refresh-btn">
                        🔄 Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="loading">Đang tải...</div>
                ) : filteredRequests.length === 0 ? (
                    <div className="empty-state">Không có yêu cầu nào</div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Phụ huynh</th>
                                    <th>Loại yêu cầu</th>
                                    <th>Nội dung</th>
                                    <th>Ngày gửi</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRequests.map(request => (
                                    <tr key={request.id_request}>
                                        <td>
                                            <div className="user-info">
                                                <strong>{request.user?.name || "N/A"}</strong>
                                                <small>{request.user?.email || ""}</small>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`request-type ${request.request_type.replace('/', '-')}`}>
                                                {request.request_type}
                                            </span>
                                        </td>
                                        <td className="content-cell">
                                            <div className="content-text">
                                                {request.content}
                                            </div>
                                        </td>
                                        <td>
                                            {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                                            <br />
                                            <small>
                                                {new Date(request.createdAt).toLocaleTimeString('vi-VN')}
                                            </small>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    onClick={() => handleDeleteRequest(request.id_request)}
                                                    className="delete-btn"
                                                    title="Xóa yêu cầu"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );

    const renderEvaluateTab = () => (
        <div className="tab-content">
            <div className="filter-section">
                <h3>Bộ lọc</h3>
                <div className="filter-form">
                    <div className="filter-row">
                        <div className="filter-group">
                            <label>Số sao:</label>
                            <select
                                value={filters.star}
                                onChange={(e) => setFilters({ ...filters, star: e.target.value })}
                                className="filter-input"
                            >
                                <option value="">Tất cả</option>
                                <option value="5">5 sao</option>
                                <option value="4">4 sao</option>
                                <option value="3">3 sao</option>
                                <option value="2">2 sao</option>
                                <option value="1">1 sao</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Từ ngày:</label>
                            <input
                                type="date"
                                value={filters.date_from}
                                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                                className="filter-input"
                            />
                        </div>

                        <div className="filter-group">
                            <label>Đến ngày:</label>
                            <input
                                type="date"
                                value={filters.date_to}
                                onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                                className="filter-input"
                            />
                        </div>
                    </div>

                    <div className="filter-actions">
                        <button onClick={resetFilters} className="reset-btn">
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            <div className="list-section">
                <div className="section-header">
                    <h3>Danh sách đánh giá ({filteredEvaluates.length})</h3>
                    <button onClick={loadData} className="refresh-btn">
                        🔄 Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="loading">Đang tải...</div>
                ) : filteredEvaluates.length === 0 ? (
                    <div className="empty-state">Không có đánh giá nào</div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Phụ huynh</th>
                                    <th>Lịch trình</th>
                                    <th>Đánh giá</th>
                                    <th>Nhận xét</th>
                                    <th>Ngày gửi</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEvaluates.map(evaluate => (
                                    <tr key={evaluate.id_evaluate}>
                                        <td>
                                            <div className="user-info">
                                                <strong>{evaluate.user?.name || "N/A"}</strong>
                                                <small>{evaluate.user?.email || ""}</small>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="schedule-info">
                                                <strong>{evaluate.schedule?.Sdate}</strong>
                                                <br />
                                                <small>{evaluate.schedule?.Stime}</small>
                                                <br />
                                                <small>{evaluate.schedule?.routes?.name_street}</small>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="rating-display">
                                                <span className="stars">
                                                    {'★'.repeat(evaluate.star)}
                                                    {'☆'.repeat(5 - evaluate.star)}
                                                </span>
                                                <span className="rating-text">
                                                    ({evaluate.star}/5)
                                                </span>
                                            </div>
                                        </td>
                                        <td className="content-cell">
                                            <div className="content-text">
                                                {evaluate.content || "Không có nhận xét"}
                                            </div>
                                        </td>
                                        <td>
                                            {new Date(evaluate.createdAt).toLocaleDateString('vi-VN')}
                                            <br />
                                            <small>
                                                {new Date(evaluate.createdAt).toLocaleTimeString('vi-VN')}
                                            </small>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    onClick={() => handleDeleteEvaluate(evaluate.id_evaluate)}
                                                    className="delete-btn"
                                                    title="Xóa đánh giá"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="request-evaluate-management">
            <div className="left-panel">
                <div className="section">
                    <span className="section-label">Chức năng:</span>
                    <div className="tab-navigation">
                        <button
                            className={`tab-btn ${activeTab === "request" ? "active" : ""}`}
                            onClick={() => setActiveTab("request")}
                        >
                            📝 Quản lý yêu cầu
                        </button>
                        <button
                            className={`tab-btn ${activeTab === "evaluate" ? "active" : ""}`}
                            onClick={() => setActiveTab("evaluate")}
                        >
                            ⭐ Quản lý đánh giá
                        </button>
                    </div>
                </div>

                <div className="section">
                    <span className="section-label">Thống kê:</span>
                    <div className="stats-container">
                        <div className="stat-item">
                            <span className="stat-value">{requests.length}</span>
                            <span className="stat-label">Tổng yêu cầu</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{evaluates.length}</span>
                            <span className="stat-label">Tổng đánh giá</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">
                                {evaluates.length > 0
                                    ? (evaluates.reduce((sum, evaluateItem) => sum + evaluateItem.star, 0) / evaluates.length).toFixed(1)
                                    : "0.0"
                                }
                            </span>
                            <span className="stat-label">Điểm đánh giá TB</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="right-panel">
                {activeTab === "request" ? renderRequestTab() : renderEvaluateTab()}
            </div>
        </div>
    );
};

export default RequestEvaluateManagement;