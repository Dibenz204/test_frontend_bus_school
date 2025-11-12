import React, { useState, useEffect } from "react";
import { Mail, Lock, Quote } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/userService";

export default function LoginPage() {
  const navigate = useNavigate();
  const fullText =
    '"Cảm ơn bạn đã tin tưởng Smart School Bus – cùng nhau mang đến hành trình an toàn và tiện lợi cho học sinh mỗi ngày."';
  const [displayedText, setDisplayedText] = useState("");

  // State cho form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);

  // ⭐ Kiểm tra xem đã đăng nhập chưa
  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      setAlreadyLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText(fullText.substring(0, index + 1));
      index++;
      if (index === fullText.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // ⭐ Xử lý quay lại trang đúng role
  const handleBackToRole = () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const roleRoutes = {
      "Quản trị viên": "/test_parent",
      "Phụ huynh": "/PhuHuynh",
      "Tài xế": "/Taixe",
    };
    navigate(roleRoutes[userInfo.role] || "/");
  };

  // Xử lý đăng nhập
  // const handleLogin = async (e) => {
  //   e.preventDefault();
  //   setErrorMessage("");
  //   setLoading(true);

  //   try {
  //     const response = await loginUser(email, password);

  //     if (response.data.errCode === 0) {
  //       const user = response.data.user;

  //       // ⭐ Lưu thông tin user vào localStorage (luôn lưu nếu đăng nhập thành công)
  //       localStorage.setItem("userInfo", JSON.stringify(user));

  //       // ⭐ Lưu thêm flag "rememberMe" nếu người dùng chọn
  //       if (rememberMe) {
  //         localStorage.setItem("rememberMe", "true");
  //       }

  //       // Chuyển trang theo role
  //       switch (user.role) {
  //         case "Quản trị viên":
  //           navigate("/test_parent");
  //           break;
  //         case "Phụ huynh":
  //           navigate("/PhuHuynh");
  //           break;
  //         case "Tài xế":
  //           navigate("/Taixe");
  //           break;
  //         default:
  //           setErrorMessage("Vai trò không hợp lệ!");
  //       }
  //     } else {
  //       setErrorMessage(response.data.message);
  //     }
  //   } catch (error) {
  //     console.error("Lỗi đăng nhập:", error);
  //     setErrorMessage(
  //       error.response?.data?.message || "Lỗi kết nối đến server!"
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const response = await loginUser(email, password);

      if (response.data.errCode === 0) {
        const user = response.data.user;

        // ⭐ DEBUG: Kiểm tra user data nhận được
        console.log("🔍 USER DATA NHẬN ĐƯỢC TỪ LOGIN:", user);

        // ⭐ Lưu thông tin user vào localStorage (luôn lưu nếu đăng nhập thành công)
        localStorage.setItem("userInfo", JSON.stringify(user));

        // ⭐ DEBUG: Kiểm tra localStorage sau khi lưu
        const storedUser = JSON.parse(localStorage.getItem("userInfo"));
        console.log("💾 USER DATA TRONG LOCALSTORAGE:", storedUser);

        // ⭐ Lưu thêm flag "rememberMe" nếu người dùng chọn
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        }

        // Chuyển trang theo role
        switch (user.role) {
          case "Quản trị viên":
            navigate("/test_parent");
            break;
          case "Phụ huynh":
            navigate("/PhuHuynh");
            break;
          case "Tài xế":
            navigate("/Taixe");
            break;
          default:
            setErrorMessage("Vai trò không hợp lệ!");
        }
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      setErrorMessage(
        error.response?.data?.message || "Lỗi kết nối đến server!"
      );
    } finally {
      setLoading(false);
    }
  };

  // ⭐ Hiển thị thông báo đã đăng nhập
  if (alreadyLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Tài khoản đã được đăng nhập
          </h2>
          <p className="text-gray-600 mb-6">
            Bạn đã đăng nhập vào hệ thống. Vui lòng quay lại trang chính.
          </p>
          <button
            onClick={handleBackToRole}
            className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            Quay lại
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("userInfo");
              localStorage.removeItem("rememberMe");
              setAlreadyLoggedIn(false);
            }}
            className="w-full mt-3 bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
          >
            Đăng xuất và đăng nhập tài khoản khác
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      {/* LEFT: Login form */}
      <div className="flex flex-col justify-center px-8 py-16 sm:w-1/2 bg-white">
        <div className="max-w-md mx-auto w-full">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">
            Welcome back to
          </h1>
          <h2 className="text-5xl font-bold text-gray-900 mb-8">
            Smart School Bus
          </h2>

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div className="mb-4 relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* Password */}
            <div className="mb-4 relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 text-red-500 text-sm text-center">
                {errorMessage}
              </div>
            )}

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between mb-6 text-gray-600">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  className="w-4 h-4 border-gray-300"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Ghi nhớ tôi</span>
              </label>
              <a href="#" className="text-sm text-gray-500 hover:underline">
                Quên mật khẩu?
              </a>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-orange-500 text-white font-semibold shadow-md hover:bg-gray-900 transition-transform transform hover:scale-[1.02] disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT: Quote Section */}
      <div className="relative flex items-center justify-center sm:w-1/2 bg-[#0b0b0b] text-white p-12 overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full opacity-20"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="none"
            stroke="white"
            strokeWidth="0.5"
            d="M0,150 C480,80 960,240 1440,160"
          />
          <path
            fill="none"
            stroke="white"
            strokeWidth="0.5"
            d="M0,200 C480,120 960,280 1440,200"
          />
          <path
            fill="none"
            stroke="white"
            strokeWidth="0.5"
            d="M0,240 C480,160 960,320 1440,240"
          />
        </svg>

        <div className="relative max-w-md z-10">
          <div className="bg-[#2b2b2b] p-4 rounded-2xl inline-flex mb-6">
            <Quote className="w-6 h-6 text-white" />
          </div>

          <p className="text-3xl font-semibold leading-snug mb-6 min-h-[8rem]">
            {displayedText}
            <span className="animate-pulse text-orange-400">|</span>
          </p>
        </div>
      </div>
    </div>
  );
}