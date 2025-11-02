import React, { useState } from "react";
import { createNewUser } from "../services/userService"; // ⭐ IMPORT SERVICE

const AddUserModal = ({ show, onClose, onUserAdded }) => {
    if (!show) return null;

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        birthday: "",
        gender: "Nam",
        address: "",
        role: "Phụ huynh",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };



    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setMessage("");

        try {
            // ⭐ DÙNG SERVICE THAY VÌ AXIOS TRỰC TIẾP
            const res = await createNewUser(formData);

            // ✅ Check errCode từ backend
            if (res.data.errCode === 0) {
                setMessage("✅ Thêm người dùng thành công!");

                // Reset form
                setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    birthday: "",
                    gender: "Nam",
                    address: "",
                    role: "Phụ huynh",
                });

                // ⭐ GỌI CALLBACK ĐỂ RELOAD DANH SÁCH
                if (onUserAdded) {
                    onUserAdded();
                }

                // Đóng modal sau 1.2s
                setTimeout(() => {
                    setMessage("");
                    onClose();
                }, 500);
            } else {
                setMessage("❌ " + (res.data.message || "Lỗi khi thêm người dùng"));
            }
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.message || "Lỗi khi thêm người dùng";
            setMessage("❌ " + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        // ⭐ DIV BACKDROP - Click đóng modal
        <div
            // onClick={onClose}    
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
                backdropFilter: "blur(4px)",
            }}
        >
            {/* ⭐ DIV MODAL CONTENT - Click không đóng */}
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "white",
                    borderRadius: "16px",
                    padding: "25px 30px",
                    width: "420px",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                    animation: "fadeIn 0.3s ease",
                }}
            >
                <h3
                    style={{
                        textAlign: "center",
                        marginBottom: "20px",
                        color: "#0d6efd",
                        fontWeight: "bold",
                        letterSpacing: "0.5px",
                    }}
                >
                    ➕ Thêm phụ huynh mới
                </h3>

                <form onSubmit={handleSubmit}>
                    {[
                        { label: "Tên", name: "name", type: "text" },
                        { label: "Email", name: "email", type: "email" },
                        { label: "SĐT", name: "phone", type: "tel" },
                        { label: "Ngày sinh", name: "birthday", type: "date" },
                        { label: "Địa chỉ", name: "address", type: "text" },
                    ].map((item) => (
                        <div
                            className="form-group"
                            key={item.name}
                            style={{ marginBottom: "12px" }}
                        >
                            <label style={{ fontWeight: 600 }}>{item.label}</label>
                            <input
                                type={item.type}
                                name={item.name}
                                value={formData[item.name]}
                                onChange={handleChange}
                                required
                                style={{
                                    width: "100%",
                                    padding: "8px 10px",
                                    borderRadius: "8px",
                                    border: "1px solid #ccc",
                                    outline: "none",
                                    transition: "0.2s",
                                }}
                                onFocus={(e) =>
                                    (e.target.style.border = "1px solid #0d6efd")
                                }
                                onBlur={(e) =>
                                    (e.target.style.border = "1px solid #ccc")
                                }
                            />
                        </div>
                    ))}

                    <div className="form-group" style={{ marginBottom: "12px" }}>
                        <label style={{ fontWeight: 600 }}>Giới tính</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            style={{
                                width: "100%",
                                padding: "8px 10px",
                                borderRadius: "8px",
                                border: "1px solid #ccc",
                            }}
                        >
                            <option>Nam</option>
                            <option>Nữ</option>
                            <option>Khác</option>
                        </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: "12px" }}>
                        <label style={{ fontWeight: 600 }}>Vai trò</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            style={{
                                width: "100%",
                                padding: "8px 10px",
                                borderRadius: "8px",
                                border: "1px solid #ccc",
                            }}
                        >
                            <option>Phụ huynh</option>
                            <option>Quản trị viên</option>
                            <option>Tài xế</option>
                        </select>
                    </div>

                    {message && (
                        <p
                            style={{
                                color: message.includes("✅") ? "green" : "red",
                                textAlign: "center",
                                marginTop: "10px",
                                fontWeight: 600,
                            }}
                        >
                            {message}
                        </p>
                    )}

                    <div style={{ marginTop: "20px", textAlign: "center" }}>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                background: loading ? "#6c757d" : "#0d6efd",
                                color: "white",
                                padding: "8px 18px",
                                border: "none",
                                borderRadius: "8px",
                                cursor: loading ? "not-allowed" : "pointer",
                                marginRight: "10px",
                                fontWeight: 600,
                            }}
                        >
                            {loading ? "Đang thêm..." : "Xác nhận"}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            style={{
                                background: "#6c757d",
                                color: "white",
                                padding: "8px 18px",
                                border: "none",
                                borderRadius: "8px",
                                cursor: loading ? "not-allowed" : "pointer",
                                fontWeight: 600,
                            }}
                        >
                            Đóng
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUserModal;




/* Nháp

import React, { useState } from "react";

const AddUserModal = ({ show, onClose }) => {
    if (!show) return null; // ẩn modal khi chưa bật

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        birthday: "",
        gender: "Nam",
        address: "",
        role: "Phụ huynh",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Dữ liệu thêm mới:", formData);
        onClose();
    };

    return (
        <div
            className="modal-overlay"
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.4)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
            }}
        >
            <div
                className="modal-container"
                style={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    padding: "20px",
                    width: "400px",
                    boxShadow: "0 0 10px rgba(0,0,0,0.3)",
                }}
            >
                <h3 style={{ textAlign: "center", marginBottom: "15px" }}>Thêm phụ huynh mới</h3>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Tên</label>
                        <input
                            type="text"
                            name="name"
                            className="form-control"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>SĐT</label>
                        <input
                            type="tel"
                            name="phone"
                            className="form-control"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Ngày sinh</label>
                        <input
                            type="date"
                            name="birthday"
                            className="form-control"
                            value={formData.birthday}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Giới tính</label>
                        <select
                            name="gender"
                            className="form-control"
                            value={formData.gender}
                            onChange={handleChange}
                        >
                            <option>Nam</option>
                            <option>Nữ</option>
                            <option>Khác</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Địa chỉ</label>
                        <input
                            type="text"
                            name="address"
                            className="form-control"
                            value={formData.address}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Vai trò</label>
                        <select
                            name="role"
                            className="form-control"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option>Phụ huynh</option>
                            <option>Quản trị viên</option>
                            <option>Tài xế</option>
                        </select>
                    </div>

                    <div style={{ marginTop: "15px", textAlign: "center" }}>
                        <button type="submit" className="btn btn-primary mx-1">Xác nhận</button>
                        <button
                            type="button"
                            className="btn btn-secondary mx-1"
                            onClick={onClose}
                        >
                            Đóng
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUserModal;
*/
