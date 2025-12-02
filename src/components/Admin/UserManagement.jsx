import React, { useEffect, useState } from "react";
import { getUserCountByRole, getUserByRole, createNewUser, deleteUser, updateUser } from "../../services/userService";
import { useTranslation } from "react-i18next";
import "../../styles/UserManagement.css";

const UserManagement = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("view");
    const [selectedRole, setSelectedRole] = useState("Phụ huynh");
    const [userBuffer, setUserBuffer] = useState([]);
    const [roleCount, setRoleCount] = useState({
        "Quản trị viên": 0,
        "Tài xế": 0,
        "Phụ huynh": 0,
    });
    const [loading, setLoading] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        birthday: "",
        gender: "Nam",
        address: "",
    });

    // Edit form state
    const [editFormData, setEditFormData] = useState({
        id_user: "",
        name: "",
        email: "",
        phone: "",
        password: "",
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
            console.error(t("user_management.fetch_users_error"), e);
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
            console.error(t("user_management.fetch_role_count_error"), e);
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

    // Xử lý thay đổi edit form input
    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
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
            alert(t("user_management.add_user_success"));

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
            console.error(t("user_management.add_user_error"), error);
            alert(t("user_management.add_user_generic_error"));
        }
    };

    // Xử lý xóa user
    const handleDeleteUser = async (userId) => {
        if (window.confirm(t("user_management.confirm_delete_user"))) {
            try {
                await deleteUser(userId);
                alert(t("user_management.delete_user_success"));
                fetchUsersByRole();
                fetchRoleCount();
            } catch (error) {
                console.error(t("user_management.delete_user_error"), error);
                alert(t("user_management.delete_user_generic_error"));
            }
        }
    };

    // Xử lý mở modal chỉnh sửa
    const handleEditUser = (user) => {
        setEditingUser(user);
        setEditFormData({
            id_user: user.id_user,
            name: user.name,
            email: user.email,
            phone: user.phone,
            password: user.password,
            address: user.address,
            gender: user.gender,
            birthday: user.birthday,
        });
        setShowEditModal(true);
    };

    // Xử lý submit form chỉnh sửa
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateUser(editFormData);
            alert(t("user_management.update_user_success"));
            setShowEditModal(false);
            fetchUsersByRole();
        } catch (error) {
            console.error(t("user_management.update_user_error"), error);
            alert(t("user_management.update_user_generic_error"));
        }
    };

    // Render nội dung theo tab - CHỈ TRONG RIGHT PANEL
    const renderRightContent = () => {
        switch (activeTab) {
            case "view":
                return renderViewTab();
            case "add":
                return renderAddTab();
            default:
                return null;
        }
    };

    // Tab xem danh sách với các nút hành động
    const renderViewTab = () => {
        return (
            <div>
                {loading ? (
                    <div className="loading-text">{t("user_management.loading_data")}</div>
                ) : !Array.isArray(userBuffer) || userBuffer.length === 0 ? (
                    <div className="empty-text">{t("user_management.no_user_data", { role: selectedRole })}</div>
                ) : (
                    <div className="table-container">
                        <table className="user-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '15%' }}>{t("user_management.name")}</th>
                                    <th style={{ width: '25%' }}>{t("user_management.email")}</th>
                                    <th style={{ width: '13%' }}>{t("user_management.phone")}</th>
                                    <th style={{ width: '12%' }}>{t("user_management.birthday")}</th>
                                    <th style={{ width: '20%' }}>{t("user_management.account_created")}</th>
                                    <th style={{ width: '15%' }}>{t("user_management.actions")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userBuffer.map((user, index) => (
                                    <tr key={index}>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.phone}</td>
                                        <td>{user.birthday}</td>
                                        <td>
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="edit-btn"
                                                    onClick={() => handleEditUser(user)}
                                                >
                                                    {t("user_management.edit")}
                                                </button>
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => handleDeleteUser(user.id_user)}
                                                >
                                                    {t("user_management.delete")}
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
        );
    };

    // Tab thêm user
    const renderAddTab = () => {
        return (
            <div className="form-container">
                <h3 className="form-title">{t("user_management.add_new_user")} - {selectedRole}</h3>

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">{t("user_management.name")}</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder={t("user_management.name_placeholder")}
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t("user_management.phone")}</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder={t("user_management.phone_placeholder")}
                                required
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t("user_management.email")}</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder={t("user_management.email_placeholder")}
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">{t("user_management.gender")}</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                className="form-select"
                            >
                                <option value="Nam">{t("user_management.male")}</option>
                                <option value="Nữ">{t("user_management.female")}</option>
                                <option value="Khác">{t("user_management.other")}</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t("user_management.birthday")}</label>
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
                        <label className="form-label">{t("user_management.address")}</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder={t("user_management.address_placeholder")}
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="submit-btn">
                            {t("user_management.add_user")}
                        </button>
                    </div>
                </form>
            </div>
        );
    };

    // Modal chỉnh sửa user
    const renderEditModal = () => {
        if (!showEditModal) return null;

        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="modal-header">
                        <h3>{t("user_management.edit_user_info")}</h3>
                        <button
                            className="close-btn"
                            onClick={() => setShowEditModal(false)}
                        >
                            ×
                        </button>
                    </div>

                    <form onSubmit={handleEditSubmit}>
                        <div className="form-group">
                            <label className="form-label">{t("user_management.name")}</label>
                            <input
                                type="text"
                                name="name"
                                value={editFormData.name}
                                onChange={handleEditInputChange}
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t("user_management.email")}</label>
                            <input
                                type="email"
                                name="email"
                                value={editFormData.email}
                                onChange={handleEditInputChange}
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t("user_management.phone")}</label>
                            <input
                                type="tel"
                                name="phone"
                                value={editFormData.phone}
                                onChange={handleEditInputChange}
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t("user_management.new_password")}</label>
                            <input
                                type="password"
                                name="password"
                                value={editFormData.password}
                                onChange={handleEditInputChange}
                                placeholder={t("user_management.new_password_placeholder")}
                                className="form-input"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">{t("user_management.gender")}</label>
                                <select
                                    name="gender"
                                    value={editFormData.gender}
                                    onChange={handleEditInputChange}
                                    className="form-select"
                                    required
                                >
                                    <option value="Nam">{t("user_management.male")}</option>
                                    <option value="Nữ">{t("user_management.female")}</option>
                                    <option value="Khác">{t("user_management.other")}</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">{t("user_management.birthday")}</label>
                                <input
                                    type="date"
                                    name="birthday"
                                    value={editFormData.birthday}
                                    onChange={handleEditInputChange}
                                    required
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t("user_management.address")}</label>
                            <input
                                type="text"
                                name="address"
                                value={editFormData.address}
                                onChange={handleEditInputChange}
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => setShowEditModal(false)}
                            >
                                {t("user_management.cancel")}
                            </button>
                            <button type="submit" className="save-btn">
                                {t("user_management.save_changes")}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div className="user-management-container">
            {/* LEFT PANEL - Cố định width */}
            <div className="left-panel">
                {/* Section 1: Chọn vai trò */}
                <div className="section">
                    <span className="section-label">{t("user_management.select_role")}:</span>
                    <div className="role-selection">
                        <button
                            className={`role-btn ${selectedRole === "Phụ huynh" ? "active" : ""}`}
                            onClick={() => setSelectedRole("Phụ huynh")}
                        >
                            {t("user_management.parent")}
                        </button>
                        <button
                            className={`role-btn ${selectedRole === "Tài xế" ? "active" : ""}`}
                            onClick={() => setSelectedRole("Tài xế")}
                        >
                            {t("user_management.driver")}
                        </button>
                        <button
                            className={`role-btn ${selectedRole === "Quản trị viên" ? "active" : ""}`}
                            onClick={() => setSelectedRole("Quản trị viên")}
                        >
                            {t("user_management.admin")}
                        </button>
                    </div>
                </div>

                {/* Section 2: Chức năng */}
                <div className="section">
                    <span className="section-label">{t("user_management.functions")}:</span>
                    <div className="tab-navigation">
                        <button
                            className={`tab-btn ${activeTab === "view" ? "active" : ""}`}
                            onClick={() => setActiveTab("view")}
                        >
                            👁️ {t("user_management.view")}
                        </button>
                        <button
                            className={`tab-btn ${activeTab === "add" ? "active" : ""}`}
                            onClick={() => setActiveTab("add")}
                        >
                            ➕ {t("user_management.add")}
                        </button>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL - Cố định, render bảng hoặc form */}
            <div className="right-panel">
                {renderRightContent()}
            </div>

            {/* Modal chỉnh sửa */}
            {renderEditModal()}
        </div>
    );
};

export default UserManagement;

// import React, { useEffect, useState } from "react";
// import { getUserCountByRole, getUserByRole, createNewUser, deleteUser, updateUser } from "../../services/userService";
// import "../../styles/UserManagement.css";

// const UserManagement = () => {
//     const [activeTab, setActiveTab] = useState("view");
//     const [selectedRole, setSelectedRole] = useState("Phụ huynh");
//     const [userBuffer, setUserBuffer] = useState([]);
//     const [roleCount, setRoleCount] = useState({
//         "Quản trị viên": 0,
//         "Tài xế": 0,
//         "Phụ huynh": 0,
//     });
//     const [loading, setLoading] = useState(false);
//     const [showEditModal, setShowEditModal] = useState(false);
//     const [editingUser, setEditingUser] = useState(null);

//     // Form state
//     const [formData, setFormData] = useState({
//         name: "",
//         email: "",
//         phone: "",
//         birthday: "",
//         gender: "Nam",
//         address: "",
//     });

//     // Edit form state
//     const [editFormData, setEditFormData] = useState({
//         id_user: "",
//         name: "",
//         email: "",
//         phone: "",
//         password: "",
//         address: "",
//     });

//     // Fetch users khi role hoặc tab thay đổi
//     useEffect(() => {
//         if (activeTab === "view") {
//             fetchUsersByRole();
//         }
//         fetchRoleCount();
//     }, [selectedRole, activeTab]);

//     // Lấy danh sách user theo role
//     const fetchUsersByRole = async () => {
//         setLoading(true);
//         try {
//             const res = await getUserByRole(selectedRole);
//             console.log("API Response:", res);

//             // Xử lý nhiều định dạng response
//             if (res.data && Array.isArray(res.data)) {
//                 setUserBuffer(res.data);
//             } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
//                 setUserBuffer(res.data.data);
//             } else if (res.data && Array.isArray(res.data.users)) {
//                 setUserBuffer(res.data.users);
//             } else {
//                 console.warn("Unexpected response structure:", res.data);
//                 setUserBuffer([]);
//             }
//         } catch (e) {
//             console.error("Error fetching users by role:", e);
//             setUserBuffer([]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Lấy thống kê số lượng user theo role
//     const fetchRoleCount = async () => {
//         try {
//             const res = await getUserCountByRole();
//             console.log("Role count response:", res);
//             const roleData = res.data.data;
//             const roleMap = {
//                 "Quản trị viên": 0,
//                 "Tài xế": 0,
//                 "Phụ huynh": 0,
//             };

//             if (Array.isArray(roleData)) {
//                 roleData.forEach(r => {
//                     if (r.role && roleMap.hasOwnProperty(r.role)) {
//                         roleMap[r.role] = r.count;
//                     }
//                 });
//             }
//             setRoleCount(roleMap);
//         } catch (e) {
//             console.error("Error fetching role count:", e);
//         }
//     };

//     // Xử lý thay đổi form input
//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: value
//         }));
//     };

//     // Xử lý thay đổi edit form input
//     const handleEditInputChange = (e) => {
//         const { name, value } = e.target;
//         setEditFormData(prev => ({
//             ...prev,
//             [name]: value
//         }));
//     };

//     // Xử lý submit form thêm user
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             const submitData = {
//                 ...formData,
//                 role: selectedRole
//             };

//             await createNewUser(submitData);
//             alert("Thêm người dùng thành công!");

//             // Reset form
//             setFormData({
//                 name: "",
//                 email: "",
//                 phone: "",
//                 birthday: "",
//                 gender: "Nam",
//                 address: "",
//             });

//             // Refresh data
//             fetchRoleCount();
//             if (activeTab === "view") {
//                 fetchUsersByRole();
//             }
//         } catch (error) {
//             console.error("Error creating user:", error);
//             alert("Có lỗi xảy ra khi thêm người dùng!");
//         }
//     };

//     // Xử lý xóa user
//     const handleDeleteUser = async (userId) => {
//         if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
//             try {
//                 await deleteUser(userId);
//                 alert("Xóa người dùng thành công!");
//                 fetchUsersByRole();
//                 fetchRoleCount();
//             } catch (error) {
//                 console.error("Error deleting user:", error);
//                 alert("Có lỗi xảy ra khi xóa người dùng!");
//             }
//         }
//     };

//     // Xử lý mở modal chỉnh sửa
//     const handleEditUser = (user) => {
//         setEditingUser(user);
//         setEditFormData({
//             id_user: user.id_user,
//             name: user.name,
//             email: user.email,
//             phone: user.phone,
//             password: "", // Mật khẩu để trống, người dùng có thể đổi nếu muốn
//             address: user.address,
//             gender: user.gender,
//             birthday: user.birthday,
//         });
//         setShowEditModal(true);
//     };

//     // Xử lý submit form chỉnh sửa
//     const handleEditSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             await updateUser(editFormData);
//             alert("Cập nhật thông tin người dùng thành công!");
//             setShowEditModal(false);
//             fetchUsersByRole();
//         } catch (error) {
//             console.error("Error updating user:", error);
//             alert("Có lỗi xảy ra khi cập nhật thông tin người dùng!");
//         }
//     };

//     // Render nội dung theo tab - CHỈ TRONG RIGHT PANEL
//     const renderRightContent = () => {
//         switch (activeTab) {
//             case "view":
//                 return renderViewTab();
//             case "add":
//                 return renderAddTab();
//             default:
//                 return null;
//         }
//     };

//     // Tab xem danh sách với các nút hành động
//     const renderViewTab = () => {
//         return (
//             <div>
//                 {loading ? (
//                     <div className="loading-text">Đang tải dữ liệu...</div>
//                 ) : !Array.isArray(userBuffer) || userBuffer.length === 0 ? (
//                     <div className="empty-text">Không có dữ liệu người dùng cho role {selectedRole}</div>
//                 ) : (
//                     <div className="table-container">
//                         <table className="user-table">
//                             <thead>
//                                 <tr>
//                                     <th style={{ width: '15%' }}>Tên</th>
//                                     <th style={{ width: '25%' }}>Email</th>
//                                     <th style={{ width: '13%' }}>SĐT</th>
//                                     <th style={{ width: '12%' }}>Ngày sinh</th>
//                                     <th style={{ width: '20%' }}>Ngày lập tài khoản</th>
//                                     <th style={{ width: '15%' }}>Tùy chỉnh</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {userBuffer.map((user, index) => (
//                                     <tr key={index}>
//                                         <td>{user.name}</td>
//                                         <td>{user.email}</td>
//                                         <td>{user.phone}</td>
//                                         <td>{user.birthday}</td>
//                                         <td>
//                                             {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
//                                         </td>
//                                         <td>
//                                             <div className="action-buttons">
//                                                 <button
//                                                     className="edit-btn"
//                                                     onClick={() => handleEditUser(user)}
//                                                 >
//                                                     Sửa
//                                                 </button>
//                                                 <button
//                                                     className="delete-btn"
//                                                     onClick={() => handleDeleteUser(user.id_user)}
//                                                 >
//                                                     Xóa
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
//         );
//     };

//     // Tab thêm user
//     const renderAddTab = () => {
//         return (
//             <div className="form-container">
//                 <h3 className="form-title">Thêm người dùng mới - {selectedRole}</h3>

//                 <form onSubmit={handleSubmit}>
//                     <div className="form-row">
//                         <div className="form-group">
//                             <label className="form-label">Tên người dùng</label>
//                             <input
//                                 type="text"
//                                 name="name"
//                                 value={formData.name}
//                                 onChange={handleInputChange}
//                                 placeholder="Nhập tên người dùng"
//                                 required
//                                 className="form-input"
//                             />
//                         </div>

//                         <div className="form-group">
//                             <label className="form-label">Số điện thoại</label>
//                             <input
//                                 type="tel"
//                                 name="phone"
//                                 value={formData.phone}
//                                 onChange={handleInputChange}
//                                 placeholder="Nhập số điện thoại"
//                                 required
//                                 className="form-input"
//                             />
//                         </div>
//                     </div>

//                     <div className="form-group">
//                         <label className="form-label">Email</label>
//                         <input
//                             type="email"
//                             name="email"
//                             value={formData.email}
//                             onChange={handleInputChange}
//                             placeholder="Nhập địa chỉ email"
//                             required
//                             className="form-input"
//                         />
//                     </div>

//                     <div className="form-row">
//                         <div className="form-group">
//                             <label className="form-label">Giới tính</label>
//                             <select
//                                 name="gender"
//                                 value={formData.gender}
//                                 onChange={handleInputChange}
//                                 className="form-select"
//                             >
//                                 <option value="Nam">Nam</option>
//                                 <option value="Nữ">Nữ</option>
//                                 <option value="Khác">Khác</option>
//                             </select>
//                         </div>

//                         <div className="form-group">
//                             <label className="form-label">Ngày sinh</label>
//                             <input
//                                 type="date"
//                                 name="birthday"
//                                 value={formData.birthday}
//                                 onChange={handleInputChange}
//                                 required
//                                 className="form-input"
//                             />
//                         </div>
//                     </div>

//                     <div className="form-group">
//                         <label className="form-label">Địa chỉ</label>
//                         <input
//                             type="text"
//                             name="address"
//                             value={formData.address}
//                             onChange={handleInputChange}
//                             placeholder="Nhập địa chỉ"
//                             required
//                             className="form-input"
//                         />
//                     </div>

//                     <div className="form-actions">
//                         <button type="submit" className="submit-btn">
//                             Thêm người dùng
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         );
//     };

//     // Modal chỉnh sửa user
//     const renderEditModal = () => {
//         if (!showEditModal) return null;

//         return (
//             <div className="modal-overlay">
//                 <div className="modal-content">
//                     <div className="modal-header">
//                         <h3>Chỉnh sửa thông tin người dùng</h3>
//                         <button
//                             className="close-btn"
//                             onClick={() => setShowEditModal(false)}
//                         >
//                             ×
//                         </button>
//                     </div>

//                     <form onSubmit={handleEditSubmit}>
//                         <div className="form-group">
//                             <label className="form-label">Tên người dùng</label>
//                             <input
//                                 type="text"
//                                 name="name"
//                                 value={editFormData.name}
//                                 onChange={handleEditInputChange}
//                                 required
//                                 className="form-input"
//                             />
//                         </div>

//                         <div className="form-group">
//                             <label className="form-label">Email</label>
//                             <input
//                                 type="email"
//                                 name="email"
//                                 value={editFormData.email}
//                                 onChange={handleEditInputChange}
//                                 required
//                                 className="form-input"
//                             />
//                         </div>

//                         <div className="form-group">
//                             <label className="form-label">Số điện thoại</label>
//                             <input
//                                 type="tel"
//                                 name="phone"
//                                 value={editFormData.phone}
//                                 onChange={handleEditInputChange}
//                                 required
//                                 className="form-input"
//                             />
//                         </div>

//                         <div className="form-group">
//                             <label className="form-label">Mật khẩu mới (để trống nếu không đổi)</label>
//                             <input
//                                 type="password"
//                                 name="password"
//                                 value={editFormData.password}
//                                 onChange={handleEditInputChange}
//                                 placeholder="Nhập mật khẩu mới"
//                                 className="form-input"
//                             />
//                         </div>

//                         <div className="form-row">
//                             <div className="form-group">
//                                 <label className="form-label">Giới tính</label>
//                                 <select
//                                     name="gender"
//                                     value={editFormData.gender}
//                                     onChange={handleEditInputChange}
//                                     className="form-select"
//                                     required
//                                 >
//                                     <option value="Nam">Nam</option>
//                                     <option value="Nữ">Nữ</option>
//                                     <option value="Khác">Khác</option>
//                                 </select>
//                             </div>

//                             <div className="form-group">
//                                 <label className="form-label">Ngày sinh</label>
//                                 <input
//                                     type="date"
//                                     name="birthday"
//                                     value={editFormData.birthday}
//                                     onChange={handleEditInputChange}
//                                     required
//                                     className="form-input"
//                                 />
//                             </div>
//                         </div>

//                         <div className="form-group">
//                             <label className="form-label">Địa chỉ</label>
//                             <input
//                                 type="text"
//                                 name="address"
//                                 value={editFormData.address}
//                                 onChange={handleEditInputChange}
//                                 required
//                                 className="form-input"
//                             />
//                         </div>

//                         <div className="modal-actions">
//                             <button
//                                 type="button"
//                                 className="cancel-btn"
//                                 onClick={() => setShowEditModal(false)}
//                             >
//                                 Hủy
//                             </button>
//                             <button type="submit" className="save-btn">
//                                 Lưu thay đổi
//                             </button>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         );
//     };

//     return (
//         <div className="user-management-container">
//             {/* LEFT PANEL - Cố định width */}
//             <div className="left-panel">
//                 {/* Section 1: Chọn vai trò */}
//                 <div className="section">
//                     <span className="section-label">Chọn vai trò:</span>
//                     <div className="role-selection">
//                         <button
//                             className={`role-btn ${selectedRole === "Phụ huynh" ? "active" : ""}`}
//                             onClick={() => setSelectedRole("Phụ huynh")}
//                         >
//                             Phụ huynh
//                         </button>
//                         <button
//                             className={`role-btn ${selectedRole === "Tài xế" ? "active" : ""}`}
//                             onClick={() => setSelectedRole("Tài xế")}
//                         >
//                             Tài xế
//                         </button>
//                         <button
//                             className={`role-btn ${selectedRole === "Quản trị viên" ? "active" : ""}`}
//                             onClick={() => setSelectedRole("Quản trị viên")}
//                         >
//                             Quản trị viên
//                         </button>
//                     </div>
//                 </div>

//                 {/* Section 2: Chức năng */}
//                 <div className="section">
//                     <span className="section-label">Chức năng:</span>
//                     <div className="tab-navigation">
//                         <button
//                             className={`tab-btn ${activeTab === "view" ? "active" : ""}`}
//                             onClick={() => setActiveTab("view")}
//                         >
//                             👁️ Xem
//                         </button>
//                         <button
//                             className={`tab-btn ${activeTab === "add" ? "active" : ""}`}
//                             onClick={() => setActiveTab("add")}
//                         >
//                             ➕ Thêm
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {/* RIGHT PANEL - Cố định, render bảng hoặc form */}
//             <div className="right-panel">
//                 {renderRightContent()}
//             </div>

//             {/* Modal chỉnh sửa */}
//             {renderEditModal()}
//         </div>
//     );
// };

// export default UserManagement;
