// của Phong

import React, { useEffect, useState } from "react";
import "../styles/Test.css";
import { getUserByRole, getUserCountByRole, deleteUser } from "../services/userService";
import AddUserModal from "../components/AddUserModal.jsx"; // dùng thằng này nè
import EditUserModal from "../components/EditUserModal.jsx";
import { toast } from "sonner";

const Parent = () => {
    const [userBuffer, setUserBuffer] = useState([]);
    const [roleCount, setRoleCount] = useState({ "Phụ huynh": 0 });
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchUser = async () => {
        try {
            const res = await getUserByRole("Phụ huynh");
            setUserBuffer(res.data.users);
        } catch (e) {
            console.error("Error fetching users:", e);
        }
    };

    const fetchRoleCount = async () => {
        try {
            const res = await getUserCountByRole();
            const roleData = res.data.data;
            const roleMap = { "Phụ huynh": 0 };
            roleData.forEach((r) => {
                roleMap[r.role] = r.count;
            });
            setRoleCount(roleMap);
        } catch (e) {
            console.error("Error fetching role count:", e);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Mày có chắc muốn xóa user này không?")) return;

        try {
            const res = await deleteUser(userId);
            if (res.data.errCode === 0) {
                toast.success("✅ Xóa người dùng thành công!");
                fetchUser(); // reload lại danh sách
                fetchRoleCount(); // cập nhật lại số lượng
            } else {
                toast.error("❌ Xóa thất bại: " + res.data.message);
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Có lỗi khi xóa người dùng!");
        }
    };

    useEffect(() => {
        fetchUser();
        fetchRoleCount();
    }, []);

    return (
        <div style={{ padding: "20px" }}>
            <h2 style={{ marginBottom: "10px" }}>Danh sách người dùng</h2>

            <div style={{ marginBottom: "20px" }}>
                <h3>Tổng số phụ huynh: {roleCount["Phụ huynh"]}</h3>
            </div>

            <div className="mx-1" style={{ marginBottom: "10px" }}>
                <button
                    className="btn btn-primary px-3 border border-success"
                    onClick={() => setShowModal(true)}
                >
                    ➕ Thêm phụ huynh
                </button>
            </div>

            {userBuffer.length === 0 ? (
                <p>Đang tải dữ liệu...</p>
            ) : (
                <table id="customers">
                    <thead>
                        <tr>
                            <th>Mã user</th>
                            <th>Tên</th>
                            <th>Email</th>
                            <th>SĐT</th>
                            <th>Ngày sinh</th>
                            <th>Vai trò</th>
                            <th>Tùy chỉnh</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userBuffer.map((user, index) => (
                            <tr key={user.id_user}>
                                <td>{user.id_user}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.phone}</td>
                                <td>{user.birthday}</td>
                                <td>{user.role}</td>
                                <td>
                                    <button
                                        onClick={() => {
                                            setSelectedUser(user);
                                            setShowEditModal(true);
                                        }}
                                    >
                                        Chỉnh sửa
                                    </button>
                                    <button onClick={() => handleDeleteUser(user.id_user)}>Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <AddUserModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onUserAdded={fetchUser}
            />

            {/* Modal chỉnh sửa user */}
            <EditUserModal
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
                userData={selectedUser}
                onUserUpdated={fetchUser}
            />
        </div>
    );
};

export default Parent;

