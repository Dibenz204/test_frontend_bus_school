import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

const LogoutButton = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Xóa thông tin đăng nhập
        localStorage.removeItem("userInfo");
        localStorage.removeItem("rememberMe");

        // Chuyển về trang login
        navigate("/login");
    };

    return (
        <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
            <LogOut size={20} />
            <span>Đăng xuất</span>
        </button>
    );
};

export default LogoutButton;