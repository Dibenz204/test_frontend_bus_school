
import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/ui/Header";
import MainLayout from "@/components/ui/MainLayout"; // ✅ đúng vị trí bạn nói

const Home_TrangChu = () => {
  const navigate = useNavigate(); // ✅ đặt trong component

  return (
    <div className="min-h-screen w-full relative bg-white">
      {/* Orange Soft Glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(circle at center, #FF7112, transparent)`,
          opacity: 0.3,
          mixBlendMode: "multiply",
        }}
      />

      {/* <Header /> */}

      <MainLayout>
        <div className="sm:flex sm:items-center sm:space-x-8 -mt-35">
          {/* Nút xem bản đồ */}
          <button className="px-8 py-3 rounded-full bg-[#ff7112] text-white font-semibold border border-[#ffd1b3] shadow-sm hover:bg-[#e85f00] hover:shadow-md hover:scale-105 transition-all duration-300">
            View Map
          </button>

          {/* Nút đăng nhập */}
          <button
            onClick={() => navigate("/login")}
            className="px-8 py-3 rounded-full bg-[#fff4ef] text-[#e35f00] font-semibold border border-[#ffdac6] hover:bg-[#ff7112] hover:text-white hover:shadow-md hover:scale-105 transition-all duration-300"
          >
            Đăng Nhập
          </button>
        </div>
      </MainLayout>
    </div>
  );
};

export default Home_TrangChu;
