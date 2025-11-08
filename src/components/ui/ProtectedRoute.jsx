import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const userInfo = localStorage.getItem("userInfo");

    // Nếu chưa đăng nhập
    if (!userInfo) {
        return <Navigate to="/login" replace />;
    }

    const user = JSON.parse(userInfo);

    // Kiểm tra quyền truy cập
    if (!allowedRoles.includes(user.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                    <div className="mb-4">
                        <svg
                            className="mx-auto h-16 w-16 text-red-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Truy cập bị từ chối
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Bạn không có quyền truy cập trang này!
                    </p>
                    <button
                        onClick={() => {
                            // Điều hướng về trang đúng với role
                            const roleRoutes = {
                                "Quản trị viên": "/test_parent",
                                "Phụ huynh": "/PhuHuynh",
                                "Tài xế": "/Taixe",
                            };
                            window.location.href = roleRoutes[user.role] || "/login";
                        }}
                        className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;