// import { Bus } from "lucide-react";

// const MainLayout = ({ children }) => {
//   return (
//     <div className="min-h-screen w-full relative bg-white text-gray-800 font-sans overflow-hidden">
//       {/* Orange Soft Glow */}
//       <div
//         className="absolute inset-0 z-0"
//         style={{
//           backgroundImage: `radial-gradient(circle at center, #FF7112, transparent)`,
//           opacity: 0.25,
//           mixBlendMode: "multiply",
//         }}
//       />

//       {/* Nội dung chính */}
//       <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8 py-10">
//         <main className="flex flex-col md:flex-row items-center justify-between gap-12 max-w-6xl w-full">
//           {/* Cột trái */}
//           <div className="flex-1 text-center md:text-left space-y-8">
//             {/* <h1 className="text-[3.5rem] sm:text-[4rem] lg:text-[4.5rem] font-extrabold text-gray-900 leading-[1.1] tracking-tight">
//               Smart School <br />
//               Bus Tracking System
//             </h1>

//             <p className="text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed max-w-2xl mx-auto md:mx-0">
//               Ứng dụng bản đồ định tuyến giúp người dùng tra cứu lộ trình, điểm
//               dừng, thời gian di chuyển và các tuyến xe buýt một cách nhanh
//               chóng, thuận tiện.
//             </p> */}
//             <h1 className="text-4xl font-bold text-black sm:text-6xl lg:text-7xl mt-15">
//               Smart School Bus Tracking
//               <div className="relative inline-flex">
//                 <span className="absolute inset-x-0 bottom-0 border-b-[30px] border-orange-500"></span>
//                 <h1 className="relative text-4xl font-bold text-black sm:text-6xl lg:text-7xl">
//                   <span className="relative z-10">System</span>
//                   <span className="absolute inset-x-0 bottom-0 h-3 bg-orange-500 -z-10"></span>
//                 </h1>
//               </div>
//             </h1>
//             <p className="mt-10 text-base text-black sm:text-xl">
//               Ứng dụng bản đồ định tuyến giúp người dùng tra cứu lộ trình, điểm
//               dừng, thời gian di chuyển và các tuyến xe buýt một cách nhanh
//               chóng, thuận tiện.
//             </p>
//             <div className="mt-10 sm:flex sm:items-center sm:space-x-8">
//               {/* <button className="px-8 py-3 rounded-full bg-[#ff7112] text-white font-semibold border border-[#ffd1b3] shadow-sm hover:bg-[#e85f00] hover:shadow-md hover:scale-105 transition-all duration-300">
//                 View Map
//               </button>

//               <button className="px-8 py-3 rounded-full bg-[#fff4ef] text-[#e35f00] font-semibold border border-[#ffdac6] hover:bg-[#ff7112] hover:text-white hover:shadow-md hover:scale-105 transition-all duration-300">
//                 Đăng Nhập
//               </button> */}
//               <button className="px-8 py-3 rounded-full bg-[#ff7112] text-white font-semibold border border-[#ffd1b3] shadow-sm hover:bg-[#e85f00] hover:shadow-md hover:scale-105 transition-all duration-300">
//                 View Map
//               </button>

//               {/* <button className="px-8 py-3 rounded-full bg-[#fff4ef] text-[#e35f00] font-semibold border border-[#ffdac6] hover:bg-[#ff7112] hover:text-white hover:shadow-md hover:scale-105 transition-all duration-300">
//                 Đăng Nhập
//               </button> */}
//             </div>
//           </div>

//           {/* Cột phải */}
//           <div className="flex-1 flex items-center justify-center relative w-full mt-10 md:mt-10">
//             <div className="w-full max-w-md h-[360px] rounded-3xl shadow-xl overflow-hidden bg-gray-100 relative">
//               <img
//                 src="/bd.png"
//                 alt="Bus Map"
//                 className="w-full h-full object-cover opacity-90"
//               />
//               <div className="absolute inset-0 flex items-center justify-center">
//                 <div className="animate-bounce bg-white/90 p-3 rounded-full shadow-lg backdrop-blur-sm">
//                   <Bus className="w-8 h-8 text-[#ff7112]" />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </main>

//         {/* Nội dung con */}
//         <div className="mt-16 w-full">{children}</div>
//       </div>
//     </div>
//   );
// };

// export default MainLayout;
import { Bus } from "lucide-react";

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen w-full relative bg-white text-gray-800 font-sans overflow-hidden">
      {/* Orange Soft Glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(circle at center, #FF7112, transparent)`,
          opacity: 0.25,
          mixBlendMode: "multiply",
        }}
      />

      {/* Nội dung chính */}

      <div className="relative z-10 flex flex-col items-start justify-start min-h-screen px-8 py-10">
        <main className="flex flex-col md:flex-row items-center justify-between gap-9 max-w-6xl w-full">
          {/* Cột trái */}
          <div className="flex-1 text-start md:text-left space-y-8 -mt-15">
            {" "}
            {/* giảm space-y */}
            {/* Tiêu đề */}
            <h1 className="text-4xl font-bold text-black sm:text-6xl lg:text-7xl -mt-6">
              {" "}
              {/* thêm margin-top âm */}
              Smart School Bus Tracking
              <div className="relative inline-flex">
                <span className="absolute inset-x-0 bottom-0 border-b-[30px] border-orange-500"></span>
                <h1 className="relative text-4xl font-bold text-black sm:text-6xl lg:text-7xl">
                  <span className="relative z-10">System</span>
                  <span className="absolute inset-x-0 bottom-0 h-3 bg-orange-500 -z-10"></span>
                </h1>
              </div>
            </h1>
            {/* Mô tả */}
            <p className="mt-10 text-base text-black sm:text-xl">
              {/* Ứng dụng bản đồ định tuyến giúp người dùng tra cứu lộ trình, điểm
              dừng, thời gian di chuyển và các tuyến xe buýt một cách nhanh
              chóng, thuận tiện. */}
            </p>
          </div>

          {/* Cột phải */}
          <div className="flex-1 flex items-center justify-center relative w-full mt-10 md:mt-20">
            <div className="w-full max-w-md h-[360px] rounded-3xl shadow-xl overflow-hidden bg-gray-100 relative">
              <img
                src="/bd.png"
                alt="Bus Map"
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-bounce bg-white/90 p-3 rounded-full shadow-lg backdrop-blur-sm">
                  <Bus className="w-8 h-8 text-[#ff7112]" />
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* 📌 Vị trí render các phần con như nút Đăng Nhập, View Map... */}
        <div className="mt-1 w-full flex justify-start">{children}</div>
      </div>
    </div>
  );
};

export default MainLayout;
