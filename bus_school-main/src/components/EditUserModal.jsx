import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { updateUser } from "../services/userService";
import "../styles/Modal.css"; // để style đẹp hơn

const EditUserModal = ({ show, onClose, userData, onUserUpdated }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        password: "",
    });

    useEffect(() => {
        if (userData) {
            setFormData({
                name: userData.name || "",
                email: userData.email || "",
                phone: userData.phone || "",
                address: userData.address || "",
                password: "",
            });
        }
    }, [userData]);

    if (!show) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await updateUser(userData.id_user, formData);
            if (res.data.errCode === 0) {
                toast.success("✅ Cập nhật người dùng thành công!");
                onUserUpdated();
                onClose();
            } else {
                toast.error("❌ Cập nhật thất bại: " + res.data.message);
            }
        } catch (error) {
            console.error("Error updating user:", error);
            toast.error("Lỗi server khi cập nhật người dùng!");
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <h3 className="text-center mb-3">📝 Chỉnh sửa thông tin phụ huynh</h3>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Tên</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>Số điện thoại</label>
                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Địa chỉ</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Mật khẩu (để trống nếu không đổi)</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} />
                    </div>

                    <div className="modal-actions">
                        <button type="submit" className="btn btn-success">💾 Lưu thay đổi</button>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>❌ Hủy</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUserModal;
