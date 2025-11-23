import React, { useEffect, useState } from "react";
import { getUserCountByRole, getUserByRole, createNewUser } from "../../services/userService";
import "../../styles/UserManagement.css";

const UserManagement = () => {
    const [activeTab, setActiveTab] = useState("view");
    const [selectedRole, setSelectedRole] = useState("Phụ huynh");
    const [userBuffer, setUserBuffer] = useState([]);
    const [roleCount, setRoleCount] = useState({
        "Quản trị viên": 0,
        "Tài xế": 0,
        "Phụ huynh": 0,
    });
    const [loading, setLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        birthday: "",
        gender: "Nam",
        address: "",
    });

    // Fetch users khi role hoặc tab thay đổi
    useEffect(() => {
        if (activeTab === "view") {
            fetchUsersByRole();
        }
        fetchRoleCount();
    }, [selectedRole, activeTab]);

    // Lấy danh sách user theo role
    const fetchUsersByRole = async () => {
        setLoading(true);
        try {
            const res = await getUserByRole(selectedRole);
            console.log("API Response:", res);

            // Xử lý nhiều định dạng response
            if (res.data && Array.isArray(res.data)) {
                setUserBuffer(res.data);
            } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
                setUserBuffer(res.data.data);
            } else if (res.data && Array.isArray(res.data.users)) {
                setUserBuffer(res.data.users);
            } else {
                console.warn("Unexpected response structure:", res.data);
                setUserBuffer([]);
            }
        } catch (e) {
            console.error("Error fetching users by role:", e);
            setUserBuffer([]);
        } finally {
            setLoading(false);
        }
    };

    // Lấy thống kê số lượng user theo role
    const fetchRoleCount = async () => {
        try {
            const res = await getUserCountByRole();
            console.log("Role count response:", res);
            const roleData = res.data.data;
            const roleMap = {
                "Quản trị viên": 0,
                "Tài xế": 0,
                "Phụ huynh": 0,
            };

            if (Array.isArray(roleData)) {
                roleData.forEach(r => {
                    if (r.role && roleMap.hasOwnProperty(r.role)) {
                        roleMap[r.role] = r.count;
                    }
                });
            }
            setRoleCount(roleMap);
        } catch (e) {
            console.error("Error fetching role count:", e);
        }
    };

    // Xử lý thay đổi form input
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Xử lý submit form thêm user
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submitData = {
                ...formData,
                role: selectedRole
            };

            await createNewUser(submitData);
            alert("Thêm người dùng thành công!");

            // Reset form
            setFormData({
                name: "",
                email: "",
                phone: "",
                birthday: "",
                gender: "Nam",
                address: "",
            });

            // Refresh data
            fetchRoleCount();
            if (activeTab === "view") {
                fetchUsersByRole();
            }
        } catch (error) {
            console.error("Error creating user:", error);
            alert("Có lỗi xảy ra khi thêm người dùng!");
        }
    };

    // Render nội dung theo tab - CHỈ TRONG RIGHT PANEL
    const renderRightContent = () => {
        switch (activeTab) {
            case "view":
                return renderViewTab();
            case "add":
                return renderAddTab();
            case "update":
                return renderUpdateTab();
            case "delete":
                return renderDeleteTab();
            default:
                return null;
        }
    };

    // Tab xem danh sách
    const renderViewTab = () => {
        return (
            <div>
                {loading ? (
                    <div className="loading-text">Đang tải dữ liệu...</div>
                ) : !Array.isArray(userBuffer) || userBuffer.length === 0 ? (
                    <div className="empty-text">Không có dữ liệu người dùng cho role {selectedRole}</div>
                ) : (
                    <table className="user-table">
                        <thead>
                            <tr>
                                <th style={{ width: '15%' }}>Mã user</th>
                                <th style={{ width: '20%' }}>Tên</th>
                                <th style={{ width: '25%' }}>Email</th>
                                <th style={{ width: '15%' }}>SĐT</th>
                                <th style={{ width: '15%' }}>Ngày sinh</th>
                                <th style={{ width: '10%' }}>Vai trò</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userBuffer.map((user, index) => (
                                <tr key={index}>
                                    <td>{user.id_user}</td>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.phone}</td>
                                    <td>{user.birthday}</td>
                                    <td>{user.role}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        );
    };

    // Tab thêm user
    const renderAddTab = () => {
        return (
            <div className="form-container">
                <h3 className="form-title">Thêm người dùng mới - {selectedRole}</h3>

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Tên người dùng</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Nhập tên người dùng"
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Số điện thoại</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="Nhập số điện thoại"
                                required
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Nhập địa chỉ email"
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Giới tính</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                className="form-select"
                            >
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                                <option value="Khác">Khác</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Ngày sinh</label>
                            <input
                                type="date"
                                name="birthday"
                                value={formData.birthday}
                                onChange={handleInputChange}
                                required
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Địa chỉ</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Nhập địa chỉ"
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="submit-btn">
                            Thêm người dùng
                        </button>
                    </div>
                </form>
            </div>
        );
    };

    // Tab cập nhật (đang phát triển)
    const renderUpdateTab = () => {
        return (
            <div className="empty-text">
                <h3>Cập nhật người dùng</h3>
                <p>Chức năng đang được phát triển...</p>
            </div>
        );
    };

    // Tab xóa (đang phát triển)
    const renderDeleteTab = () => {
        return (
            <div className="empty-text">
                <h3>Xóa người dùng</h3>
                <p>Chức năng đang được phát triển...</p>
            </div>
        );
    };

    return (
        <div className="user-management-container">
            {/* LEFT PANEL - Cố định width */}
            <div className="left-panel">
                {/* <h1 className="main-title">Danh sách người dùng</h1> */}

                {/* Section 1: Chọn vai trò */}
                <div className="section">
                    <span className="section-label">Chọn vai trò:</span>
                    <div className="role-selection">
                        <button
                            className={`role-btn ${selectedRole === "Phụ huynh" ? "active" : ""}`}
                            onClick={() => setSelectedRole("Phụ huynh")}
                        >
                            Phụ huynh
                        </button>
                        <button
                            className={`role-btn ${selectedRole === "Tài xế" ? "active" : ""}`}
                            onClick={() => setSelectedRole("Tài xế")}
                        >
                            Tài xế
                        </button>
                        <button
                            className={`role-btn ${selectedRole === "Quản trị viên" ? "active" : ""}`}
                            onClick={() => setSelectedRole("Quản trị viên")}
                        >
                            Quản trị viên
                        </button>
                    </div>
                </div>

                {/* Section 2: Chức năng */}
                <div className="section">
                    <span className="section-label">Chức năng:</span>
                    <div className="tab-navigation">
                        <button
                            className={`tab-btn ${activeTab === "view" ? "active" : ""}`}
                            onClick={() => setActiveTab("view")}
                        >
                            👁️ Xem
                        </button>
                        <button
                            className={`tab-btn ${activeTab === "add" ? "active" : ""}`}
                            onClick={() => setActiveTab("add")}
                        >
                            ➕ Thêm
                        </button>
                        <button
                            className={`tab-btn ${activeTab === "update" ? "active" : ""}`}
                            onClick={() => setActiveTab("update")}
                        >
                            ✏️ Sửa
                        </button>
                        <button
                            className={`tab-btn ${activeTab === "delete" ? "active" : ""}`}
                            onClick={() => setActiveTab("delete")}
                        >
                            🗑️ Xóa
                        </button>
                    </div>
                </div>

                {/* Section 3: Thống kê */}
                {/* <div className="stats-container">
                    <h3 className="stats-title">Thống kê người dùng</h3>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-value">{roleCount["Quản trị viên"]}</span>
                            <span className="stat-label">Quản trị viên</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{roleCount["Tài xế"]}</span>
                            <span className="stat-label">Tài xế</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{roleCount["Phụ huynh"]}</span>
                            <span className="stat-label">Phụ huynh</span>
                        </div>
                    </div>
                </div> */}
            </div>

            {/* RIGHT PANEL - Cố định, render bảng hoặc form */}
            <div className="right-panel">
                {renderRightContent()}
            </div>
        </div>
    );
};

export default UserManagement;