import React, { useState, useEffect } from "react";
import { Mail, Lock, Quote } from "lucide-react";

export default function LoginPage() {
  const fullText =
    "“Cảm ơn bạn đã tin tưởng Smart School Bus – cùng nhau mang đến hành trình an toàn và tiện lợi cho học sinh mỗi ngày.”";
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText(fullText.substring(0, index + 1));
      index++;
      if (index === fullText.length) clearInterval(interval);
    }, 40); // tốc độ (ms mỗi ký tự)
    return () => clearInterval(interval);
  }, []);

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

          {/* Username */}
          <div className="mb-4 relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Email"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Password */}
          <div className="mb-4 relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="password"
              placeholder="Mật khẩu (tối đa 8 kí tự)"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between mb-6 text-gray-600">
            <label className="flex items-center space-x-2 text-sm">
              <input type="checkbox" className="w-4 h-4 border-gray-300" />
              <span>Ghi nhớ tôi</span>
            </label>
            <a href="#" className="text-sm text-gray-500 hover:underline">
              Quên mật khẩu?
            </a>
          </div>

          {/* Sign In Button */}
          <button className="w-full py-3 rounded-full bg-orange-500 text-white font-semibold shadow-md hover:bg-gray-900 transition-transform transform hover:scale-[1.02]">
            Đăng Nhập
          </button>
        </div>
      </div>

      {/* RIGHT: Quote Section */}
      <div className="relative flex items-center justify-center sm:w-1/2 bg-[#0b0b0b] text-white p-12 overflow-hidden">
        {/* Decorative wave background */}
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

        {/* Quote content */}
        <div className="relative max-w-md z-10">
          <div className="bg-[#2b2b2b] p-4 rounded-2xl inline-flex mb-6">
            <Quote className="w-6 h-6 text-white" />
          </div>

          {/* Typing Text */}
          <p className="text-3xl font-semibold leading-snug mb-6 min-h-[8rem]">
            {displayedText}
            <span className="animate-pulse text-orange-400">|</span>
          </p>
        </div>
      </div >
    </div >
  );
}
