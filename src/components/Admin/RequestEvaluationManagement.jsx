import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../../styles/RequestEvaluateManagement.css";
import "../../styles/NotificationManagement.css";
import { getAllRequests, deleteRequest } from "../../services/requestService";
import { getAllEvaluates, deleteEvaluate } from "../../services/evaluateService";
import { getAllNotification, sendNotificationByAdmin, getAllUsers, deleteNotification } from "../../services/notificationService";
import "../../styles/AdminManagementSystem.css";

const AdminManagementSystem = () => {
    const { t } = useTranslation();
    const [activeSection, setActiveSection] = useState("notification");
    const [notifications, setNotifications] = useState([]);
    const [requests, setRequests] = useState([]);
    const [evaluates, setEvaluates] = useState([]);
    const [loading, setLoading] = useState(false);

    // Notification specific state
    const [notificationTab, setNotificationTab] = useState("view"); // "send" or "view"
    const [sending, setSending] = useState(false);
    const [formData, setFormData] = useState({
        message: "",
        recipient_type: "all",
        notification_type: "Khác",
        role: "",
        name_search: "",
        phone_search: "",
        id_user: ""
    });
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [filters, setFilters] = useState({
        recipient_type: "",
        notification_type: "",
        date_from: "",
        date_to: ""
    });

    // Load all data
    useEffect(() => {
        loadData();
        loadUsers();
    }, [activeSection]);

    // Load data for current section
    const loadData = async () => {
        setLoading(true);
        try {
            if (activeSection === "request") {
                const requestsRes = await getAllRequests('ALL');
                if (requestsRes.data.errCode === 0) {
                    setRequests(requestsRes.data.data || []);
                }
            } else if (activeSection === "evaluate") {
                const evaluatesRes = await getAllEvaluates('ALL');
                if (evaluatesRes.data.errCode === 0) {
                    setEvaluates(evaluatesRes.data.data || []);
                }
            } else if (activeSection === "notification") {
                const notificationsRes = await getAllNotification('ALL');
                if (notificationsRes.data.errCode === 0) {
                    setNotifications(notificationsRes.data.notifications || []);
                }
            }
        } catch (error) {
            console.error("Lỗi load data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Load users for notification
    const loadUsers = async () => {
        try {
            const response = await getAllUsers();
            if (response.data.errCode === 0) {
                setUsers(response.data.users || []);
            }
        } catch (error) {
            console.error("Error loading users:", error);
        }
    };

    // Filter users based on search
    const getFilteredUsers = () => {
        const { name_search, phone_search } = formData;
        let filtered = [...users];

        if (name_search) {
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(name_search.toLowerCase())
            );
        }

        if (phone_search) {
            filtered = filtered.filter(user =>
                user.phone.includes(phone_search)
            );
        }

        return filtered;
    };

    // Send notification
    const handleSendNotification = async (e) => {
        e.preventDefault();

        if (!formData.message.trim()) {
            alert(t("admin_management.alerts.missing_message"));
            return;
        }

        if (formData.recipient_type === "specific" && !formData.id_user) {
            alert(t("admin_management.alerts.missing_recipient"));
            return;
        }

        if (window.confirm(t("admin_management.alerts.confirm_send"))) {
            setSending(true);
            try {
                const notificationData = {
                    message: formData.message,
                    notification_type: formData.notification_type,
                    recipient_type: formData.recipient_type,
                    role: formData.recipient_type === "role" ? formData.role : null,
                    id_user: formData.recipient_type === "specific" ? formData.id_user : null
                };

                const res = await sendNotificationByAdmin(notificationData);
                if (res.data.errCode === 0) {
                    alert(t("admin_management.alerts.send_success", { count: res.data.data.sent_count }));
                    setFormData({
                        message: "",
                        recipient_type: "all",
                        notification_type: "Khác",
                        name_search: "",
                        phone_search: "",
                        id_user: ""
                    });
                    setSelectedUser(null);
                    loadData();
                } else {
                    alert(res.data.message);
                }
            } catch (error) {
                console.error("Lỗi gửi thông báo:", error);
                alert(t("admin_management.alerts.send_error"));
            } finally {
                setSending(false);
            }
        }
    };

    // Delete functions
    const handleDeleteRequest = async (requestId) => {
        if (window.confirm(t("admin_management.alerts.confirm_delete"))) {
            try {
                const res = await deleteRequest(requestId);
                if (res.data.errCode === 0) {
                    alert(t("admin_management.alerts.delete_success"));
                    loadData();
                } else {
                    alert(res.data.message);
                }
            } catch (error) {
                console.error("Lỗi xóa yêu cầu:", error);
                alert(t("admin_management.alerts.delete_error"));
            }
        }
    };

    const handleDeleteEvaluate = async (evaluateId) => {
        if (window.confirm(t("admin_management.alerts.confirm_delete"))) {
            try {
                const res = await deleteEvaluate(evaluateId);
                if (res.data.errCode === 0) {
                    alert(t("admin_management.alerts.delete_success"));
                    loadData();
                } else {
                    alert(res.data.message);
                }
            } catch (error) {
                console.error("Lỗi xóa đánh giá:", error);
                alert(t("admin_management.alerts.delete_error"));
            }
        }
    };

    const handleDeleteNotification = async (notificationId) => {
        if (window.confirm(t("admin_management.alerts.confirm_delete"))) {
            try {
                const res = await deleteNotification(notificationId);
                if (res.data.errCode === 0) {
                    alert(t("admin_management.alerts.delete_success"));
                    loadData();
                } else {
                    alert(res.data.message);
                }
            } catch (error) {
                console.error("Lỗi xóa thông báo:", error);
                alert(t("admin_management.alerts.delete_error"));
            }
        }
    };

    // Select user
    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setFormData({
            ...formData,
            id_user: user.id_user,
            name_search: user.name,
            phone_search: user.phone
        });
    };

    // Filter notifications
    const filterNotifications = (data) => {
        let filtered = data;

        if (filters.recipient_type) {
            filtered = filtered.filter(item => item.recipient_type === filters.recipient_type);
        }

        if (filters.notification_type) {
            filtered = filtered.filter(item => item.notification_type === filters.notification_type);
        }

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

    const filteredNotifications = filterNotifications(notifications);

    // View notification detail
    const handleViewDetail = (notification) => {
        setSelectedNotification(notification);
    };

    // ========== RENDER FUNCTIONS ==========
    const renderRequestSection = () => (
        <div className="tab-content">
            <div className="filter-section">
                <div className="filter-form">
                    <div className="filter-row">
                        <div className="filter-group">
                            <label>{t("admin_management.requests.filter.request_type")}:</label>
                            <select
                                className="filter-input"
                            >
                                <option value="">{t("admin_management.requests.filter.all")}</option>
                                <option value="Xe bus">{t("admin_management.requests.filter.bus")}</option>
                                <option value="Trạm đón/trả">{t("admin_management.requests.filter.bus_stop")}</option>
                                <option value="Tuyến đường">{t("admin_management.requests.filter.route")}</option>
                                <option value="Khác">{t("admin_management.requests.filter.other")}</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>{t("admin_management.requests.filter.from_date")}:</label>
                            <input type="date" className="filter-input" />
                        </div>
                        <div className="filter-group">
                            <label>{t("admin_management.requests.filter.to_date")}:</label>
                            <input type="date" className="filter-input" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="list-section">
                <div className="section-header">
                    <h3>{t("admin_management.requests.title", { count: requests.length })}</h3>
                    <button onClick={loadData} className="refresh-btn">{t("admin_management.requests.actions.refresh")}</button>
                </div>

                {loading ? (
                    <div className="loading">{t("admin_management.requests.states.loading")}</div>
                ) : requests.length === 0 ? (
                    <div className="empty-state">{t("admin_management.requests.states.empty")}</div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>{t("admin_management.requests.table.parent")}</th>
                                    <th>{t("admin_management.requests.table.request_type")}</th>
                                    <th>{t("admin_management.requests.table.content")}</th>
                                    <th>{t("admin_management.requests.table.send_date")}</th>
                                    <th>{t("admin_management.requests.table.actions")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map(request => (
                                    <tr key={request.id_request}>
                                        <td>
                                            <div className="user-info">
                                                <strong>{request.user?.name || "N/A"}</strong>
                                                <small>{request.user?.email || ""}</small>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`request-type ${request.request_type?.replace('/', '-') || ''}`}>
                                                {request.request_type}
                                            </span>
                                        </td>
                                        <td className="content-cell">
                                            <div className="content-text">
                                                {request.content}
                                            </div>
                                        </td>
                                        <td>
                                            {request.createdAt ? new Date(request.createdAt).toLocaleDateString('vi-VN') : ''}
                                            <br />
                                            <small>
                                                {request.createdAt ? new Date(request.createdAt).toLocaleTimeString('vi-VN') : ''}
                                            </small>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    onClick={() => handleDeleteRequest(request.id_request)}
                                                    className="delete-btn"
                                                    title={t("admin_management.requests.actions.delete")}
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

    const renderEvaluateSection = () => (
        <div className="tab-content">
            <div className="filter-section">
                <div className="filter-form">
                    <div className="filter-row">
                        <div className="filter-group">
                            <label>{t("admin_management.evaluations.filter.stars")}:</label>
                            <select className="filter-input">
                                <option value="">{t("admin_management.evaluations.filter.all")}</option>
                                <option value="5">{t("admin_management.evaluations.filter.5_stars")}</option>
                                <option value="4">{t("admin_management.evaluations.filter.4_stars")}</option>
                                <option value="3">{t("admin_management.evaluations.filter.3_stars")}</option>
                                <option value="2">{t("admin_management.evaluations.filter.2_stars")}</option>
                                <option value="1">{t("admin_management.evaluations.filter.1_star")}</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>{t("admin_management.evaluations.filter.from_date")}:</label>
                            <input type="date" className="filter-input" />
                        </div>
                        <div className="filter-group">
                            <label>{t("admin_management.evaluations.filter.to_date")}:</label>
                            <input type="date" className="filter-input" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="list-section">
                <div className="section-header">
                    <h3>{t("admin_management.evaluations.title", { count: evaluates.length })}</h3>
                    <button onClick={loadData} className="refresh-btn">{t("admin_management.evaluations.actions.refresh")}</button>
                </div>

                {loading ? (
                    <div className="loading">{t("admin_management.evaluations.states.loading")}</div>
                ) : evaluates.length === 0 ? (
                    <div className="empty-state">{t("admin_management.evaluations.states.empty")}</div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>{t("admin_management.evaluations.table.parent")}</th>
                                    <th>{t("admin_management.evaluations.table.schedule")}</th>
                                    <th>{t("admin_management.evaluations.table.rating")}</th>
                                    <th>{t("admin_management.evaluations.table.comment")}</th>
                                    <th>{t("admin_management.evaluations.table.send_date")}</th>
                                    <th>{t("admin_management.evaluations.table.actions")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {evaluates.map(evaluate => (
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
                                                    {'★'.repeat(evaluate.star || 0)}
                                                    {'☆'.repeat(5 - (evaluate.star || 0))}
                                                </span>
                                                <span className="rating-text">
                                                    ({evaluate.star || 0}/5)
                                                </span>
                                            </div>
                                        </td>
                                        <td className="content-cell">
                                            <div className="content-text">
                                                {evaluate.content || t("admin_management.evaluations.states.no_comment")}
                                            </div>
                                        </td>
                                        <td>
                                            {evaluate.createdAt ? new Date(evaluate.createdAt).toLocaleDateString('vi-VN') : ''}
                                            <br />
                                            <small>
                                                {evaluate.createdAt ? new Date(evaluate.createdAt).toLocaleTimeString('vi-VN') : ''}
                                            </small>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    onClick={() => handleDeleteEvaluate(evaluate.id_evaluate)}
                                                    className="delete-btn"
                                                    title={t("admin_management.evaluations.actions.delete")}
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

    const renderNotificationSendTab = () => (
        <form onSubmit={handleSendNotification} className="notification-form">
            {/* Hàng 1: Người nhận và Loại thông báo */}
            <div className="form-row compact-row">
                <div className="form-group">
                    <label>{t("admin_management.notifications.send_form.recipient")}:</label>
                    <select
                        value={formData.recipient_type}
                        onChange={(e) => {
                            const newType = e.target.value;
                            setFormData({
                                ...formData,
                                recipient_type: newType,
                                role: newType === 'role' ? 'Phụ huynh' : null
                            });
                        }}
                        className="filter-input"
                    >
                        <option value="all">{t("admin_management.notifications.send_form.all_people")}</option>
                        <option value="role">{t("admin_management.notifications.send_form.by_role")}</option>
                    </select>
                </div>

                {/* Chọn role nếu recipient_type = 'role' */}
                {formData.recipient_type === "role" && (
                    <div className="form-group">
                        <label>{t("admin_management.notifications.send_form.select_role")}:</label>
                        <select
                            value={formData.role || "Phụ huynh"}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="filter-input"
                        >
                            <option value="Phụ huynh">{t("admin_management.notifications.send_form.parent_role")}</option>
                            <option value="Tài xế">{t("admin_management.notifications.send_form.driver_role")}</option>
                            <option value="Quản trị viên">{t("admin_management.notifications.send_form.admin_role")}</option>
                        </select>
                    </div>
                )}

                <div className="form-group">
                    <label>{t("admin_management.notifications.send_form.notification_type")}:</label>
                    <select
                        value={formData.notification_type}
                        onChange={(e) => setFormData({ ...formData, notification_type: e.target.value })}
                        className="filter-input"
                    >
                        <option value="Trạm">{t("admin_management.notifications.send_form.bus_stop_type")}</option>
                        <option value="Lịch trình">{t("admin_management.notifications.send_form.schedule_type")}</option>
                        <option value="Sự cố">{t("admin_management.notifications.send_form.incident_type")}</option>
                        <option value="Khác">{t("admin_management.notifications.send_form.other_type")}</option>
                    </select>
                </div>
            </div>

            {/* Hàng 2: Tìm kiếm người dùng (chỉ hiện khi chọn người cụ thể) */}
            {formData.recipient_type === "specific" && (
                <div className="form-row compact-row">
                    <div className="form-group">
                        <label>{t("admin_management.notifications.send_form.recipient_name")}:</label>
                        <input
                            type="text"
                            placeholder={t("admin_management.notifications.send_form.search_placeholder_name")}
                            value={formData.name_search}
                            onChange={(e) => setFormData({ ...formData, name_search: e.target.value })}
                            className="filter-input"
                        />
                    </div>
                    <div className="form-group">
                        <label>{t("admin_management.notifications.send_form.recipient_phone")}:</label>
                        <input
                            type="text"
                            placeholder={t("admin_management.notifications.send_form.search_placeholder_phone")}
                            value={formData.phone_search}
                            onChange={(e) => setFormData({ ...formData, phone_search: e.target.value })}
                            className="filter-input"
                        />
                    </div>
                </div>
            )}

            {/* Danh sách users tìm được (chỉ hiện khi tìm người cụ thể) */}
            {formData.recipient_type === "specific" && (formData.name_search || formData.phone_search) && (
                <div className="user-results">
                    <h4>{t("admin_management.notifications.send_form.search_results")}:</h4>
                    <div className="user-list">
                        {getFilteredUsers().slice(0, 5).map(user => (
                            <div
                                key={user.id_user}
                                className={`user-item ${selectedUser?.id_user === user.id_user ? 'selected' : ''}`}
                                onClick={() => handleSelectUser(user)}
                            >
                                <div className="user-info">
                                    <strong>{user.name}</strong>
                                    <small>{user.role} • {user.phone}</small>
                                </div>
                                <span className="select-indicator">
                                    {selectedUser?.id_user === user.id_user ? '✓' : t("admin_management.notifications.send_form.selected")}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Người đã chọn (chỉ hiện khi chọn người cụ thể) */}
            {formData.recipient_type === "specific" && selectedUser && (
                <div className="selected-user-info">
                    <span className="selected-label">{t("admin_management.notifications.send_form.selected")}: </span>
                    <span className="selected-user">{selectedUser.name} ({selectedUser.role})</span>
                    <button
                        type="button"
                        className="remove-user-btn"
                        onClick={() => {
                            setSelectedUser(null);
                            setFormData({ ...formData, id_user: "", name_search: "", phone_search: "" });
                        }}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Hàng 3: Nội dung thông báo */}
            <div className="form-row">
                <div className="form-group full-width">
                    <label>{t("admin_management.notifications.send_form.message_content")}:</label>
                    <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="notification-textarea"
                        rows="4"
                        placeholder={t("admin_management.notifications.send_form.message_placeholder")}
                        required
                    />
                    <div className="char-count">
                        {formData.message.length}/500 {t("admin_management.notifications.send_form.characters")}
                    </div>
                </div>
            </div>

            {/* Nút gửi */}
            <div className="form-actions">
                <button
                    type="button"
                    className="reset-btn"
                    onClick={() => {
                        setFormData({
                            message: "",
                            recipient_type: "all",
                            notification_type: "Khác",
                            role: "Phụ huynh",
                            name_search: "",
                            phone_search: "",
                            id_user: ""
                        });
                        setSelectedUser(null);
                    }}
                >
                    {t("admin_management.notifications.send_form.reset")}
                </button>
                <button
                    type="submit"
                    className="send-btn"
                    disabled={sending}
                >
                    {sending ? t("admin_management.notifications.send_form.sending") : t("admin_management.notifications.send_form.send_notification")}
                </button>
            </div>
        </form>
    );

    const renderNotificationViewTab = () => (
        <div className="tab-content">
            <div className="filter-section">
                <div className="filter-form">
                    <div className="filter-row">
                        <div className="filter-group">
                            <label>{t("admin_management.notifications.view_filter.recipient_type")}:</label>
                            <select
                                value={filters.recipient_type}
                                onChange={(e) => setFilters({ ...filters, recipient_type: e.target.value })}
                                className="filter-input"
                            >
                                <option value="">{t("admin_management.notifications.view_filter.all_recipients")}</option>
                                <option value="parent">{t("admin_management.notifications.view_filter.parent_recipient")}</option>
                                <option value="admin">{t("admin_management.notifications.view_filter.admin_recipient")}</option>
                                <option value="driver">{t("admin_management.notifications.view_filter.driver_recipient")}</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>{t("admin_management.notifications.view_filter.notification_type")}:</label>
                            <select
                                value={filters.notification_type}
                                onChange={(e) => setFilters({ ...filters, notification_type: e.target.value })}
                                className="filter-input"
                            >
                                <option value="">{t("admin_management.notifications.view_filter.all_recipients")}</option>
                                <option value="Khác">{t("admin_management.notifications.view_filter.other_type_filter")}</option>
                                <option value="Trạm">{t("admin_management.notifications.send_form.bus_stop_type")}</option>
                                <option value="Lịch trình">{t("admin_management.notifications.send_form.schedule_type")}</option>
                                <option value="Sự cố">{t("admin_management.notifications.send_form.incident_type")}</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>{t("admin_management.notifications.view_filter.from_date")}:</label>
                            <input
                                type="date"
                                value={filters.date_from}
                                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                                className="filter-input"
                            />
                        </div>
                        <div className="filter-group">
                            <label>{t("admin_management.notifications.view_filter.to_date")}:</label>
                            <input
                                type="date"
                                value={filters.date_to}
                                onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                                className="filter-input"
                            />
                        </div>
                    </div>
                    <div className="filter-actions">
                        <button
                            onClick={() => setFilters({ recipient_type: "", notification_type: "", date_from: "", date_to: "" })}
                            className="reset-btn"
                        >
                            {t("admin_management.notifications.view_filter.reset")}
                        </button>
                    </div>
                </div>
            </div>

            <div className="list-section">
                <div className="section-header">
                    <h3>{t("admin_management.notifications.view_table.title", { count: filteredNotifications.length })}</h3>
                    <button onClick={loadData} className="refresh-btn">{t("admin_management.notifications.actions.refresh")}</button>
                </div>

                {loading ? (
                    <div className="loading">{t("admin_management.notifications.states.loading")}</div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="empty-state">{t("admin_management.notifications.states.empty")}</div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>{t("admin_management.notifications.view_table.recipient")}</th>
                                    <th>{t("admin_management.notifications.view_table.role")}</th>
                                    <th>{t("admin_management.notifications.view_table.send_type")}</th>
                                    <th>{t("admin_management.notifications.view_table.send_date")}</th>
                                    <th>{t("admin_management.notifications.view_table.details")}</th>
                                    <th>{t("admin_management.notifications.view_table.actions")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredNotifications.map(notification => (
                                    <tr key={notification.id_notification}>
                                        <td>
                                            <div className="user-info">
                                                <strong>{notification.user?.name || t("admin_management.notifications.states.all_people")}</strong>
                                                {notification.user && <small>{notification.user.email}</small>}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`recipient-type ${notification.recipient_type}`}>
                                                {notification.recipient_type === 'parent' ? t("admin_management.notifications.view_filter.parent_recipient") :
                                                    notification.recipient_type === 'admin' ? t("admin_management.notifications.view_filter.admin_recipient") :
                                                        notification.recipient_type === 'driver' ? t("admin_management.notifications.view_filter.driver_recipient") : t("admin_management.notifications.states.all_people")}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`notification-type ${notification.notification_type?.replace(/\s+/g, '-')}`}>
                                                {notification.notification_type}
                                            </span>
                                        </td>
                                        <td>
                                            {notification.createdAt ? new Date(notification.createdAt).toLocaleDateString('vi-VN') : ''}
                                            <br />
                                            <small>
                                                {notification.createdAt ? new Date(notification.createdAt).toLocaleTimeString('vi-VN') : ''}
                                            </small>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleViewDetail(notification)}
                                                className="detail-btn"
                                                title={t("admin_management.notifications.actions.view")}
                                            >
                                                {t("admin_management.notifications.actions.view")}
                                            </button>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    onClick={() => handleDeleteNotification(notification.id_notification)}
                                                    className="delete-btn"
                                                    title={t("admin_management.notifications.actions.delete")}
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

    const renderNotificationSection = () => (
        <div className="tab-content">
            {/* Nút chuyển tab Gửi/Xem */}
            <div className="notification-tabs">
                <button
                    className={`notification-tab-btn ${notificationTab === "send" ? "active" : ""}`}
                    onClick={() => setNotificationTab("send")}
                >
                    📤 {t("admin_management.notifications.send")}
                </button>
                <button
                    className={`notification-tab-btn ${notificationTab === "view" ? "active" : ""}`}
                    onClick={() => setNotificationTab("view")}
                >
                    📋 {t("admin_management.notifications.view")}
                </button>
            </div>

            {/* Nội dung theo tab */}
            {notificationTab === "send" ? renderNotificationSendTab() : renderNotificationViewTab()}
        </div>
    );

    // Popup chi tiết thông báo
    const renderDetailPopup = () => {
        if (!selectedNotification) return null;

        return (
            <div className="popup-overlay" onClick={() => setSelectedNotification(null)}>
                <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                    <div className="popup-header">
                        <h3>{t("admin_management.notifications.detail_popup.title")}</h3>
                        <button className="close-btn" onClick={() => setSelectedNotification(null)}>✕</button>
                    </div>
                    <div className="popup-body">
                        <div className="detail-section">
                            <div className="detail-row">
                                <span className="detail-label">{t("admin_management.notifications.detail_popup.id")}:</span>
                                <span className="detail-value">{selectedNotification.id_notification}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">{t("admin_management.notifications.detail_popup.recipient")}:</span>
                                <span className="detail-value">
                                    {selectedNotification.user ? selectedNotification.user.name : t("admin_management.notifications.states.all_people")}
                                    {selectedNotification.user && <small> ({selectedNotification.user.role})</small>}
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">{t("admin_management.notifications.detail_popup.send_type")}:</span>
                                <span className="detail-value">
                                    <span className={`recipient-type ${selectedNotification.recipient_type}`}>
                                        {selectedNotification.recipient_type === 'parent' ? t("admin_management.notifications.view_filter.parent_recipient") :
                                            selectedNotification.recipient_type === 'admin' ? t("admin_management.notifications.view_filter.admin_recipient") :
                                                selectedNotification.recipient_type === 'driver' ? t("admin_management.notifications.view_filter.driver_recipient") : t("admin_management.notifications.states.all_people")}
                                    </span>
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">{t("admin_management.notifications.detail_popup.notification_type")}:</span>
                                <span className="detail-value">
                                    <span className={`notification-type ${selectedNotification.notification_type?.replace(/\s+/g, '-')}`}>
                                        {selectedNotification.notification_type}
                                    </span>
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">{t("admin_management.notifications.detail_popup.time")}:</span>
                                <span className="detail-value">
                                    {selectedNotification.createdAt ? new Date(selectedNotification.createdAt).toLocaleDateString('vi-VN') : ''} {' '}
                                    {selectedNotification.createdAt ? new Date(selectedNotification.createdAt).toLocaleTimeString('vi-VN') : ''}
                                </span>
                            </div>
                        </div>
                        <div className="message-section">
                            <h4>{t("admin_management.notifications.detail_popup.message_content")}:</h4>
                            <div className="message-content">
                                {selectedNotification.message}
                            </div>
                        </div>
                    </div>
                    <div className="popup-footer">
                        <button className="close-popup-btn" onClick={() => setSelectedNotification(null)}>
                            {t("admin_management.notifications.detail_popup.close")}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="request-evaluate-management">
            {/* Sidebar bên trái */}
            <div className="left-panel">
                <div className="section">
                    <span className="section-label">{t("admin_management.management")}:</span>
                    <div className="tab-navigation">
                        <button
                            className={`tab-btn ${activeSection === "request" ? "active" : ""}`}
                            onClick={() => setActiveSection("request")}
                        >
                            📝 {t("admin_management.tabs.requests")}
                        </button>
                        <button
                            className={`tab-btn ${activeSection === "evaluate" ? "active" : ""}`}
                            onClick={() => setActiveSection("evaluate")}
                        >
                            ⭐ {t("admin_management.tabs.evaluations")}
                        </button>
                        <button
                            className={`tab-btn ${activeSection === "notification" ? "active" : ""}`}
                            onClick={() => setActiveSection("notification")}
                        >
                            🔔 {t("admin_management.tabs.notifications")}
                        </button>
                    </div>
                </div>

                <div className="section">
                    <span className="section-label">{t("admin_management.statistics")}:</span>
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
                            <span className="stat-value">{notifications.length}</span>
                            <span className="stat-label">Tổng thông báo</span>
                        </div>
                    </div>
                </div>

                {/* <div className="section">
                    <span className="section-label">{t("admin_management.notes")}:</span>
                    <div className="notes-section">
                        <p>{t("admin_management.check_before_delete")}</p>
                        <p>{t("admin_management.clear_concise")}</p>
                        <p>{t("admin_management.correct_category")}</p>
                    </div>
                </div> */}
            </div>

            {/* Nội dung bên phải */}
            <div className="right-panel">
                {activeSection === "request" && renderRequestSection()}
                {activeSection === "evaluate" && renderEvaluateSection()}
                {activeSection === "notification" && renderNotificationSection()}
            </div>

            {/* Popup chi tiết */}
            {renderDetailPopup()}
        </div>
    );
};

export default AdminManagementSystem;

// import React, { useState, useEffect } from "react";

// import "../../styles/RequestEvaluateManagement.css";
// import "../../styles/NotificationManagement.css";
// import { getAllRequests, deleteRequest } from "../../services/requestService";
// import { getAllEvaluates, deleteEvaluate } from "../../services/evaluateService";

// import { getAllNotification, sendNotificationByAdmin, getAllUsers, deleteNotification } from "../../services/notificationService";
// import "../../styles/AdminManagementSystem.css";

// const AdminManagementSystem = () => {
//     const [activeSection, setActiveSection] = useState("notification");
//     const [notifications, setNotifications] = useState([]);
//     const [requests, setRequests] = useState([]);
//     const [evaluates, setEvaluates] = useState([]);
//     const [loading, setLoading] = useState(false);

//     // Notification specific state
//     const [notificationTab, setNotificationTab] = useState("view"); // "send" or "view"
//     const [sending, setSending] = useState(false);
//     const [formData, setFormData] = useState({
//         message: "",
//         recipient_type: "all",
//         notification_type: "Khác",
//         role: "",
//         name_search: "",
//         phone_search: "",
//         id_user: ""
//     });
//     const [users, setUsers] = useState([]);
//     const [selectedUser, setSelectedUser] = useState(null);
//     const [selectedNotification, setSelectedNotification] = useState(null);
//     const [filters, setFilters] = useState({
//         recipient_type: "",
//         notification_type: "",
//         date_from: "",
//         date_to: ""
//     });

//     // Load all data
//     useEffect(() => {
//         loadData();
//         loadUsers();
//     }, [activeSection]);

//     // Load data for current section
//     const loadData = async () => {
//         setLoading(true);
//         try {
//             if (activeSection === "request") {
//                 const requestsRes = await getAllRequests('ALL');
//                 if (requestsRes.data.errCode === 0) {
//                     setRequests(requestsRes.data.data || []);
//                 }
//             } else if (activeSection === "evaluate") {
//                 const evaluatesRes = await getAllEvaluates('ALL');
//                 if (evaluatesRes.data.errCode === 0) {
//                     setEvaluates(evaluatesRes.data.data || []);
//                 }
//             } else if (activeSection === "notification") {
//                 const notificationsRes = await getAllNotification('ALL');
//                 if (notificationsRes.data.errCode === 0) {
//                     setNotifications(notificationsRes.data.notifications || []);
//                 }
//             }
//         } catch (error) {
//             console.error("Lỗi load data:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Load users for notification
//     const loadUsers = async () => {
//         try {
//             // Đoạn này cần API getUsers (đã có trong notificationAPI.js)
//             const response = await getAllUsers();
//             if (response.data.errCode === 0) {
//                 setUsers(response.data.users || []);
//             }
//         } catch (error) {
//             console.error("Error loading users:", error);
//         }
//     };

//     // Filter users based on search
//     const getFilteredUsers = () => {
//         const { name_search, phone_search } = formData;
//         let filtered = [...users];

//         if (name_search) {
//             filtered = filtered.filter(user =>
//                 user.name.toLowerCase().includes(name_search.toLowerCase())
//             );
//         }

//         if (phone_search) {
//             filtered = filtered.filter(user =>
//                 user.phone.includes(phone_search)
//             );
//         }

//         return filtered;
//     };

//     // Send notification
//     const handleSendNotification = async (e) => {
//         e.preventDefault();

//         if (!formData.message.trim()) {
//             alert("Vui lòng nhập nội dung thông báo!");
//             return;
//         }

//         if (formData.recipient_type === "specific" && !formData.id_user) {
//             alert("Vui lòng chọn người nhận!");
//             return;
//         }

//         if (window.confirm("Bạn có chắc muốn gửi thông báo này?")) {
//             setSending(true);
//             try {
//                 const notificationData = {
//                     message: formData.message,
//                     notification_type: formData.notification_type,
//                     recipient_type: formData.recipient_type,
//                     role: formData.recipient_type === "role" ? formData.role : null,
//                     id_user: formData.recipient_type === "specific" ? formData.id_user : null
//                 };

//                 const res = await sendNotificationByAdmin(notificationData);
//                 if (res.data.errCode === 0) {
//                     alert(`Gửi thông báo thành công! Đã gửi ${res.data.data.sent_count} thông báo.`);
//                     setFormData({
//                         message: "",
//                         recipient_type: "all",
//                         notification_type: "Khác",
//                         name_search: "",
//                         phone_search: "",
//                         id_user: ""
//                     });
//                     setSelectedUser(null);
//                     loadData();
//                 } else {
//                     alert(res.data.message);
//                 }
//             } catch (error) {
//                 console.error("Lỗi gửi thông báo:", error);
//                 alert("Lỗi khi gửi thông báo!");
//             } finally {
//                 setSending(false);
//             }
//         }
//     };

//     // Delete functions
//     const handleDeleteRequest = async (requestId) => {
//         if (window.confirm("Bạn có chắc muốn xóa yêu cầu này?")) {
//             try {
//                 const res = await deleteRequest(requestId);
//                 if (res.data.errCode === 0) {
//                     alert("Xóa yêu cầu thành công!");
//                     loadData();
//                 } else {
//                     alert(res.data.message);
//                 }
//             } catch (error) {
//                 console.error("Lỗi xóa yêu cầu:", error);
//                 alert("Lỗi khi xóa yêu cầu!");
//             }
//         }
//     };

//     const handleDeleteEvaluate = async (evaluateId) => {
//         if (window.confirm("Bạn có chắc muốn xóa đánh giá này?")) {
//             try {
//                 const res = await deleteEvaluate(evaluateId);
//                 if (res.data.errCode === 0) {
//                     alert("Xóa đánh giá thành công!");
//                     loadData();
//                 } else {
//                     alert(res.data.message);
//                 }
//             } catch (error) {
//                 console.error("Lỗi xóa đánh giá:", error);
//                 alert("Lỗi khi xóa đánh giá!");
//             }
//         }
//     };

//     const handleDeleteNotification = async (notificationId) => {
//         if (window.confirm("Bạn có chắc muốn xóa thông báo này?")) {
//             try {
//                 const res = await deleteNotification(notificationId);
//                 if (res.data.errCode === 0) {
//                     alert("Xóa thông báo thành công!");
//                     loadData();
//                 } else {
//                     alert(res.data.message);
//                 }
//             } catch (error) {
//                 console.error("Lỗi xóa thông báo:", error);
//                 alert("Lỗi khi xóa thông báo!");
//             }
//         }
//     };

//     // Select user
//     const handleSelectUser = (user) => {
//         setSelectedUser(user);
//         setFormData({
//             ...formData,
//             id_user: user.id_user,
//             name_search: user.name,
//             phone_search: user.phone
//         });
//     };

//     // Filter notifications
//     const filterNotifications = (data) => {
//         let filtered = data;

//         if (filters.recipient_type) {
//             filtered = filtered.filter(item => item.recipient_type === filters.recipient_type);
//         }

//         if (filters.notification_type) {
//             filtered = filtered.filter(item => item.notification_type === filters.notification_type);
//         }

//         if (filters.date_from) {
//             filtered = filtered.filter(item => new Date(item.createdAt) >= new Date(filters.date_from));
//         }
//         if (filters.date_to) {
//             const toDate = new Date(filters.date_to);
//             toDate.setHours(23, 59, 59, 999);
//             filtered = filtered.filter(item => new Date(item.createdAt) <= toDate);
//         }

//         return filtered;
//     };

//     const filteredNotifications = filterNotifications(notifications);

//     // View notification detail
//     const handleViewDetail = (notification) => {
//         setSelectedNotification(notification);
//     };

//     // ========== RENDER FUNCTIONS ==========
//     const renderRequestSection = () => (
//         <div className="tab-content">
//             <div className="filter-section">
//                 <div className="filter-form">
//                     <div className="filter-row">
//                         <div className="filter-group">
//                             <label>Loại yêu cầu:</label>
//                             <select
//                                 className="filter-input"
//                             >
//                                 <option value="">Tất cả</option>
//                                 <option value="Xe bus">Xe bus</option>
//                                 <option value="Trạm đón/trả">Trạm đón/trả</option>
//                                 <option value="Tuyến đường">Tuyến đường</option>
//                                 <option value="Khác">Khác</option>
//                             </select>
//                         </div>
//                         <div className="filter-group">
//                             <label>Từ ngày:</label>
//                             <input type="date" className="filter-input" />
//                         </div>
//                         <div className="filter-group">
//                             <label>Đến ngày:</label>
//                             <input type="date" className="filter-input" />
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <div className="list-section">
//                 <div className="section-header">
//                     <h3>Danh sách yêu cầu ({requests.length})</h3>
//                     <button onClick={loadData} className="refresh-btn">🔄 Refresh</button>
//                 </div>

//                 {loading ? (
//                     <div className="loading">Đang tải...</div>
//                 ) : requests.length === 0 ? (
//                     <div className="empty-state">Không có yêu cầu nào</div>
//                 ) : (
//                     <div className="table-container">
//                         <table className="data-table">
//                             <thead>
//                                 <tr>
//                                     <th>Phụ huynh</th>
//                                     <th>Loại yêu cầu</th>
//                                     <th>Nội dung</th>
//                                     <th>Ngày gửi</th>
//                                     <th>Thao tác</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {requests.map(request => (
//                                     <tr key={request.id_request}>
//                                         <td>
//                                             <div className="user-info">
//                                                 <strong>{request.user?.name || "N/A"}</strong>
//                                                 <small>{request.user?.email || ""}</small>
//                                             </div>
//                                         </td>
//                                         <td>
//                                             <span className={`request-type ${request.request_type?.replace('/', '-') || ''}`}>
//                                                 {request.request_type}
//                                             </span>
//                                         </td>
//                                         <td className="content-cell">
//                                             <div className="content-text">
//                                                 {request.content}
//                                             </div>
//                                         </td>
//                                         <td>
//                                             {request.createdAt ? new Date(request.createdAt).toLocaleDateString('vi-VN') : ''}
//                                             <br />
//                                             <small>
//                                                 {request.createdAt ? new Date(request.createdAt).toLocaleTimeString('vi-VN') : ''}
//                                             </small>
//                                         </td>
//                                         <td>
//                                             <div className="action-buttons">
//                                                 <button
//                                                     onClick={() => handleDeleteRequest(request.id_request)}
//                                                     className="delete-btn"
//                                                     title="Xóa yêu cầu"
//                                                 >
//                                                     🗑️
//                                                 </button>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );

//     const renderEvaluateSection = () => (
//         <div className="tab-content">
//             <div className="filter-section">
//                 <div className="filter-form">
//                     <div className="filter-row">
//                         <div className="filter-group">
//                             <label>Số sao:</label>
//                             <select className="filter-input">
//                                 <option value="">Tất cả</option>
//                                 <option value="5">5 sao</option>
//                                 <option value="4">4 sao</option>
//                                 <option value="3">3 sao</option>
//                                 <option value="2">2 sao</option>
//                                 <option value="1">1 sao</option>
//                             </select>
//                         </div>
//                         <div className="filter-group">
//                             <label>Từ ngày:</label>
//                             <input type="date" className="filter-input" />
//                         </div>
//                         <div className="filter-group">
//                             <label>Đến ngày:</label>
//                             <input type="date" className="filter-input" />
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <div className="list-section">
//                 <div className="section-header">
//                     <h3>Danh sách đánh giá ({evaluates.length})</h3>
//                     <button onClick={loadData} className="refresh-btn">🔄 Refresh</button>
//                 </div>

//                 {loading ? (
//                     <div className="loading">Đang tải...</div>
//                 ) : evaluates.length === 0 ? (
//                     <div className="empty-state">Không có đánh giá nào</div>
//                 ) : (
//                     <div className="table-container">
//                         <table className="data-table">
//                             <thead>
//                                 <tr>
//                                     <th>Phụ huynh</th>
//                                     <th>Lịch trình</th>
//                                     <th>Đánh giá</th>
//                                     <th>Nhận xét</th>
//                                     <th>Ngày gửi</th>
//                                     <th>Thao tác</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {evaluates.map(evaluate => (
//                                     <tr key={evaluate.id_evaluate}>
//                                         <td>
//                                             <div className="user-info">
//                                                 <strong>{evaluate.user?.name || "N/A"}</strong>
//                                                 <small>{evaluate.user?.email || ""}</small>
//                                             </div>
//                                         </td>
//                                         <td>
//                                             <div className="schedule-info">
//                                                 <strong>{evaluate.schedule?.Sdate}</strong>
//                                                 <br />
//                                                 <small>{evaluate.schedule?.Stime}</small>
//                                                 <br />
//                                                 <small>{evaluate.schedule?.routes?.name_street}</small>
//                                             </div>
//                                         </td>
//                                         <td>
//                                             <div className="rating-display">
//                                                 <span className="stars">
//                                                     {'★'.repeat(evaluate.star || 0)}
//                                                     {'☆'.repeat(5 - (evaluate.star || 0))}
//                                                 </span>
//                                                 <span className="rating-text">
//                                                     ({evaluate.star || 0}/5)
//                                                 </span>
//                                             </div>
//                                         </td>
//                                         <td className="content-cell">
//                                             <div className="content-text">
//                                                 {evaluate.content || "Không có nhận xét"}
//                                             </div>
//                                         </td>
//                                         <td>
//                                             {evaluate.createdAt ? new Date(evaluate.createdAt).toLocaleDateString('vi-VN') : ''}
//                                             <br />
//                                             <small>
//                                                 {evaluate.createdAt ? new Date(evaluate.createdAt).toLocaleTimeString('vi-VN') : ''}
//                                             </small>
//                                         </td>
//                                         <td>
//                                             <div className="action-buttons">
//                                                 <button
//                                                     onClick={() => handleDeleteEvaluate(evaluate.id_evaluate)}
//                                                     className="delete-btn"
//                                                     title="Xóa đánh giá"
//                                                 >
//                                                     🗑️
//                                                 </button>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );

//     const renderNotificationSendTab = () => (
//         <form onSubmit={handleSendNotification} className="notification-form">
//             {/* Hàng 1: Người nhận và Loại thông báo */}
//             <div className="form-row compact-row">
//                 <div className="form-group">
//                     <label>Người nhận:</label>
//                     <select
//                         value={formData.recipient_type}
//                         onChange={(e) => {
//                             const newType = e.target.value;
//                             setFormData({
//                                 ...formData,
//                                 recipient_type: newType,
//                                 // Reset role khi thay đổi loại người nhận
//                                 role: newType === 'role' ? 'Phụ huynh' : null
//                             });
//                         }}
//                         className="filter-input"
//                     >
//                         <option value="all">Tất cả mọi người</option>
//                         <option value="role">Theo vai trò</option>
//                         {/* <option value="specific">Người cụ thể</option> */}
//                     </select>
//                 </div>

//                 {/* Chọn role nếu recipient_type = 'role' */}
//                 {formData.recipient_type === "role" && (
//                     <div className="form-group">
//                         <label>Chọn vai trò:</label>
//                         <select
//                             value={formData.role || "Phụ huynh"}
//                             onChange={(e) => setFormData({ ...formData, role: e.target.value })}
//                             className="filter-input"
//                         >
//                             <option value="Phụ huynh">Phụ huynh</option>
//                             <option value="Tài xế">Tài xế</option>
//                             <option value="Quản trị viên">Quản trị viên</option>
//                         </select>
//                     </div>
//                 )}

//                 <div className="form-group">
//                     <label>Loại thông báo:</label>
//                     <select
//                         value={formData.notification_type}
//                         onChange={(e) => setFormData({ ...formData, notification_type: e.target.value })}
//                         className="filter-input"
//                     >
//                         <option value="Trạm">Thông báo trạm</option>
//                         <option value="Lịch trình">Thông báo lịch trình</option>
//                         <option value="Sự cố">Thông báo sự cố</option>
//                         <option value="Khác">Thông báo khác</option>
//                     </select>
//                 </div>
//             </div>

//             {/* Hàng 2: Tìm kiếm người dùng (chỉ hiện khi chọn người cụ thể) */}
//             {formData.recipient_type === "specific" && (
//                 <div className="form-row compact-row">
//                     <div className="form-group">
//                         <label>Tên người nhận:</label>
//                         <input
//                             type="text"
//                             placeholder="Nhập tên..."
//                             value={formData.name_search}
//                             onChange={(e) => setFormData({ ...formData, name_search: e.target.value })}
//                             className="filter-input"
//                         />
//                     </div>
//                     <div className="form-group">
//                         <label>Số điện thoại:</label>
//                         <input
//                             type="text"
//                             placeholder="Nhập SĐT..."
//                             value={formData.phone_search}
//                             onChange={(e) => setFormData({ ...formData, phone_search: e.target.value })}
//                             className="filter-input"
//                         />
//                     </div>
//                 </div>
//             )}

//             {/* Danh sách users tìm được (chỉ hiện khi tìm người cụ thể) */}
//             {formData.recipient_type === "specific" && (formData.name_search || formData.phone_search) && (
//                 <div className="user-results">
//                     <h4>Kết quả tìm kiếm:</h4>
//                     <div className="user-list">
//                         {getFilteredUsers().slice(0, 5).map(user => (
//                             <div
//                                 key={user.id_user}
//                                 className={`user-item ${selectedUser?.id_user === user.id_user ? 'selected' : ''}`}
//                                 onClick={() => handleSelectUser(user)}
//                             >
//                                 <div className="user-info">
//                                     <strong>{user.name}</strong>
//                                     <small>{user.role} • {user.phone}</small>
//                                 </div>
//                                 <span className="select-indicator">
//                                     {selectedUser?.id_user === user.id_user ? '✓' : 'Chọn'}
//                                 </span>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             )}

//             {/* Người đã chọn (chỉ hiện khi chọn người cụ thể) */}
//             {formData.recipient_type === "specific" && selectedUser && (
//                 <div className="selected-user-info">
//                     <span className="selected-label">Đã chọn: </span>
//                     <span className="selected-user">{selectedUser.name} ({selectedUser.role})</span>
//                     <button
//                         type="button"
//                         className="remove-user-btn"
//                         onClick={() => {
//                             setSelectedUser(null);
//                             setFormData({ ...formData, id_user: "", name_search: "", phone_search: "" });
//                         }}
//                     >
//                         ✕
//                     </button>
//                 </div>
//             )}

//             {/* Hàng 3: Nội dung thông báo */}
//             <div className="form-row">
//                 <div className="form-group full-width">
//                     <label>Nội dung thông báo:</label>
//                     <textarea
//                         value={formData.message}
//                         onChange={(e) => setFormData({ ...formData, message: e.target.value })}
//                         className="notification-textarea"
//                         rows="4"
//                         placeholder="Nhập nội dung thông báo..."
//                         required
//                     />
//                     <div className="char-count">
//                         {formData.message.length}/500 ký tự
//                     </div>
//                 </div>
//             </div>

//             {/* Nút gửi */}
//             <div className="form-actions">
//                 <button
//                     type="button"
//                     className="reset-btn"
//                     onClick={() => {
//                         setFormData({
//                             message: "",
//                             recipient_type: "all",
//                             notification_type: "Khác",
//                             role: "Phụ huynh",
//                             name_search: "",
//                             phone_search: "",
//                             id_user: ""
//                         });
//                         setSelectedUser(null);
//                     }}
//                 >
//                     Reset
//                 </button>
//                 <button
//                     type="submit"
//                     className="send-btn"
//                     disabled={sending}
//                 >
//                     {sending ? "Đang gửi..." : "📤 Gửi thông báo"}
//                 </button>
//             </div>
//         </form>
//     );

//     const renderNotificationViewTab = () => (
//         <div className="tab-content">
//             <div className="filter-section">
//                 <div className="filter-form">
//                     <div className="filter-row">
//                         <div className="filter-group">
//                             <label>Loại người nhận:</label>
//                             <select
//                                 value={filters.recipient_type}
//                                 onChange={(e) => setFilters({ ...filters, recipient_type: e.target.value })}
//                                 className="filter-input"
//                             >
//                                 {/* <option value="">Tất cả</option> */}
//                                 <option value="all">Tất cả</option>
//                                 <option value="parent">Phụ huynh</option>
//                                 <option value="admin">Quản trị viên</option>
//                                 <option value="driver">Tài xế</option>
//                             </select>
//                         </div>
//                         <div className="filter-group">
//                             <label>Loại thông báo:</label>
//                             <select
//                                 value={filters.notification_type}
//                                 onChange={(e) => setFilters({ ...filters, notification_type: e.target.value })}
//                                 className="filter-input"
//                             >
//                                 {/* <option value="">Tất cả</option> */}
//                                 <option value="Khác">Khác</option>
//                                 <option value="Trạm">Trạm</option>
//                                 <option value="Lịch trình">Lịch trình</option>
//                                 <option value="Sự cố">Sự cố</option>
//                             </select>
//                         </div>
//                         <div className="filter-group">
//                             <label>Từ ngày:</label>
//                             <input
//                                 type="date"
//                                 value={filters.date_from}
//                                 onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
//                                 className="filter-input"
//                             />
//                         </div>
//                         <div className="filter-group">
//                             <label>Đến ngày:</label>
//                             <input
//                                 type="date"
//                                 value={filters.date_to}
//                                 onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
//                                 className="filter-input"
//                             />
//                         </div>
//                     </div>
//                     <div className="filter-actions">
//                         <button
//                             onClick={() => setFilters({ recipient_type: "", notification_type: "", date_from: "", date_to: "" })}
//                             className="reset-btn"
//                         >
//                             Reset
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             <div className="list-section">
//                 <div className="section-header">
//                     <h3>Danh sách thông báo ({filteredNotifications.length})</h3>
//                     <button onClick={loadData} className="refresh-btn">🔄 Refresh</button>
//                 </div>

//                 {loading ? (
//                     <div className="loading">Đang tải...</div>
//                 ) : filteredNotifications.length === 0 ? (
//                     <div className="empty-state">Không có thông báo nào</div>
//                 ) : (
//                     <div className="table-container">
//                         <table className="data-table">
//                             <thead>
//                                 <tr>
//                                     <th>Người nhận</th>
//                                     <th>Vai trò</th>
//                                     <th>Loại gửi</th>
//                                     <th>Ngày gửi</th>
//                                     <th>Chi tiết</th>
//                                     <th>Thao tác</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {filteredNotifications.map(notification => (
//                                     <tr key={notification.id_notification}>
//                                         <td>
//                                             <div className="user-info">
//                                                 <strong>{notification.user?.name || "Tất cả"}</strong>
//                                                 {notification.user && <small>{notification.user.email}</small>}
//                                             </div>
//                                         </td>
//                                         <td>
//                                             <span className={`recipient-type ${notification.recipient_type}`}>
//                                                 {notification.recipient_type === 'parent' ? 'Phụ huynh' :
//                                                     notification.recipient_type === 'admin' ? 'Quản trị viên' :
//                                                         notification.recipient_type === 'driver' ? 'Tài xế' : 'Tất cả'}
//                                             </span>
//                                         </td>
//                                         <td>
//                                             <span className={`notification-type ${notification.notification_type?.replace(/\s+/g, '-')}`}>
//                                                 {notification.notification_type}
//                                             </span>
//                                         </td>
//                                         <td>
//                                             {notification.createdAt ? new Date(notification.createdAt).toLocaleDateString('vi-VN') : ''}
//                                             <br />
//                                             <small>
//                                                 {notification.createdAt ? new Date(notification.createdAt).toLocaleTimeString('vi-VN') : ''}
//                                             </small>
//                                         </td>
//                                         <td>
//                                             <button
//                                                 onClick={() => handleViewDetail(notification)}
//                                                 className="detail-btn"
//                                                 title="Xem chi tiết"
//                                             >
//                                                 👁️ Xem
//                                             </button>
//                                         </td>
//                                         <td>
//                                             <div className="action-buttons">
//                                                 <button
//                                                     onClick={() => handleDeleteNotification(notification.id_notification)}
//                                                     className="delete-btn"
//                                                     title="Xóa thông báo"
//                                                 >
//                                                     🗑️
//                                                 </button>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );

//     const renderNotificationSection = () => (
//         <div className="tab-content">
//             {/* Nút chuyển tab Gửi/Xem */}
//             <div className="notification-tabs">
//                 <button
//                     className={`notification-tab-btn ${notificationTab === "send" ? "active" : ""}`}
//                     onClick={() => setNotificationTab("send")}
//                 >
//                     📤 Gửi thông báo
//                 </button>
//                 <button
//                     className={`notification-tab-btn ${notificationTab === "view" ? "active" : ""}`}
//                     onClick={() => setNotificationTab("view")}
//                 >
//                     📋 Xem thông báo
//                 </button>
//             </div>

//             {/* Nội dung theo tab */}
//             {notificationTab === "send" ? renderNotificationSendTab() : renderNotificationViewTab()}
//         </div>
//     );

//     // Popup chi tiết thông báo
//     const renderDetailPopup = () => {
//         if (!selectedNotification) return null;

//         return (
//             <div className="popup-overlay" onClick={() => setSelectedNotification(null)}>
//                 <div className="popup-content" onClick={(e) => e.stopPropagation()}>
//                     <div className="popup-header">
//                         <h3>Chi tiết thông báo</h3>
//                         <button className="close-btn" onClick={() => setSelectedNotification(null)}>✕</button>
//                     </div>
//                     <div className="popup-body">
//                         <div className="detail-section">
//                             <div className="detail-row">
//                                 <span className="detail-label">ID:</span>
//                                 <span className="detail-value">{selectedNotification.id_notification}</span>
//                             </div>
//                             <div className="detail-row">
//                                 <span className="detail-label">Người nhận:</span>
//                                 <span className="detail-value">
//                                     {selectedNotification.user ? selectedNotification.user.name : "Tất cả"}
//                                     {selectedNotification.user && <small> ({selectedNotification.user.role})</small>}
//                                 </span>
//                             </div>
//                             <div className="detail-row">
//                                 <span className="detail-label">Loại gửi:</span>
//                                 <span className="detail-value">
//                                     <span className={`recipient-type ${selectedNotification.recipient_type}`}>
//                                         {selectedNotification.recipient_type === 'parent' ? 'Phụ huynh' :
//                                             selectedNotification.recipient_type === 'admin' ? 'Quản trị viên' :
//                                                 selectedNotification.recipient_type === 'driver' ? 'Tài xế' : 'Tất cả'}
//                                     </span>
//                                 </span>
//                             </div>
//                             <div className="detail-row">
//                                 <span className="detail-label">Loại thông báo:</span>
//                                 <span className="detail-value">
//                                     <span className={`notification-type ${selectedNotification.notification_type?.replace(/\s+/g, '-')}`}>
//                                         {selectedNotification.notification_type}
//                                     </span>
//                                 </span>
//                             </div>
//                             <div className="detail-row">
//                                 <span className="detail-label">Thời gian:</span>
//                                 <span className="detail-value">
//                                     {selectedNotification.createdAt ? new Date(selectedNotification.createdAt).toLocaleDateString('vi-VN') : ''} {' '}
//                                     {selectedNotification.createdAt ? new Date(selectedNotification.createdAt).toLocaleTimeString('vi-VN') : ''}
//                                 </span>
//                             </div>
//                         </div>
//                         <div className="message-section">
//                             <h4>Nội dung thông báo:</h4>
//                             <div className="message-content">
//                                 {selectedNotification.message}
//                             </div>
//                         </div>
//                     </div>
//                     <div className="popup-footer">
//                         <button className="close-popup-btn" onClick={() => setSelectedNotification(null)}>
//                             Đóng
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     return (
//         <div className="request-evaluate-management">
//             {/* Sidebar bên trái */}
//             <div className="left-panel">
//                 <div className="section">
//                     <span className="section-label">Quản lý:</span>
//                     <div className="tab-navigation">
//                         <button
//                             className={`tab-btn ${activeSection === "request" ? "active" : ""}`}
//                             onClick={() => setActiveSection("request")}
//                         >
//                             📝 Quản lý yêu cầu
//                         </button>
//                         <button
//                             className={`tab-btn ${activeSection === "evaluate" ? "active" : ""}`}
//                             onClick={() => setActiveSection("evaluate")}
//                         >
//                             ⭐ Quản lý đánh giá
//                         </button>
//                         <button
//                             className={`tab-btn ${activeSection === "notification" ? "active" : ""}`}
//                             onClick={() => setActiveSection("notification")}
//                         >
//                             🔔 Quản lý thông báo
//                         </button>
//                     </div>
//                 </div>

//                 <div className="section">
//                     <span className="section-label">Thống kê:</span>
//                     <div className="stats-container">
//                         <div className="stat-item">
//                             <span className="stat-value">{requests.length}</span>
//                             <span className="stat-label">Tổng yêu cầu</span>
//                         </div>
//                         <div className="stat-item">
//                             <span className="stat-value">{evaluates.length}</span>
//                             <span className="stat-label">Tổng đánh giá</span>
//                         </div>
//                         <div className="stat-item">
//                             <span className="stat-value">{notifications.length}</span>
//                             <span className="stat-label">Tổng thông báo</span>
//                         </div>
//                     </div>
//                 </div>

//                 {/* <div className="section">
//                     <span className="section-label">Lưu ý:</span>
//                     <div className="notes-section">
//                         <p>• Kiểm tra kỹ trước khi xóa</p>
//                         <p>• Thông báo cần rõ ràng, ngắn gọn</p>
//                         <p>• Phân loại đúng loại thông báo</p>
//                     </div>
//                 </div> */}
//             </div>

//             {/* Nội dung bên phải */}
//             <div className="right-panel">
//                 {activeSection === "request" && renderRequestSection()}
//                 {activeSection === "evaluate" && renderEvaluateSection()}
//                 {activeSection === "notification" && renderNotificationSection()}
//             </div>

//             {/* Popup chi tiết */}
//             {renderDetailPopup()}
//         </div>
//     );
// };

// export default AdminManagementSystem;

