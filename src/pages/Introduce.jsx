// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { useTranslation } from "react-i18next";
// import { MapPin, LayoutDashboard, BellRing, Server } from "lucide-react";
// import Header from "@/components/ui/Header";
// import Footer from "@/components/ui/Footer";
// import LiveMap from "@/components/LiveMap";

// const Introduce = () => {
//   const navigate = useNavigate();
//   const { t } = useTranslation();

//   return (
//     <div className="relative min-h-screen font-sans overflow-x-hidden">
//       {/* 🔶 Orange Soft Glow Background */}
//       <div
//         className="absolute inset-0 -z-10"
//         style={{
//           backgroundImage: `radial-gradient(circle at center, #FF7112, transparent 70%)`,
//           opacity: 0.3,
//           mixBlendMode: "multiply",
//         }}
//       />

//       {/* Header cố định trên cùng */}
//       <Header
//         variant="normal"
//         menuItems={[
//           { label: t("header.about"), link: "about", linkType: "scroll" },
//           {
//             label: t("header.features"),
//             link: "why-choose-us",
//             linkType: "scroll",
//           },
//           { label: t("header.docs"), link: "docs", linkType: "scroll" },
//         ]}
//         loginButton={true}
//       />

//       {/* Section Home - Hero Banner */}
//       <section
//         id="home"
//         className="min-h-screen flex items-center justify-center bg-transparent px-6 py-20"
//       >
//         <div className="max-w-7xl w-full grid md:grid-cols-2 gap-12 items-center">
//           {/* Left Column - Content */}
//           <div className="space-y-8 text-left">
//             <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
//               {t("home.title")}
//               {/* Chào mừng đến với */}
//             </h1>

//             <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-2xl">
//               {t("home.description")}
//             </p>

//             {/* CTA Buttons */}
//             <div className="flex flex-col sm:flex-row gap-4 pt-4">
//               <button
//                 onClick={() => navigate("/map")}
//                 className="px-8 py-4 rounded-full bg-[#ff7112] text-white font-semibold text-lg shadow-lg hover:bg-[#e85f00] hover:shadow-xl hover:scale-105 transition-all duration-300"
//               >
//                 {t("home.viewMap")}
//               </button>
//             </div>
//           </div>

//           {/* Right Column - Image/Visual */}
//           <div className="relative flex items-center justify-center">
//             {/* Main circular background */}
//             <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-br from-orange-400 to-orange-600 opacity-90"></div>

//             {/* Decorative elements */}
//             <div className="absolute top-10 left-10 w-16 h-16 rounded-full bg-yellow-400 animate-pulse"></div>
//             <div className="absolute top-5 right-20 w-12 h-12 rounded-lg bg-blue-400 transform rotate-12"></div>
//             <div className="absolute bottom-10 right-10 w-20 h-20 rounded-full bg-orange-300"></div>

//             {/* Main Live Map Container */}
//             <div className="relative z-10 w-full max-w-md h-[480px]">
//               <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-white">
//                 <LiveMap />
//               </div>

//               {/* Feature badge - positioned outside map */}
//               <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 z-20">
//                 <div className="w-16 h-16 rounded-lg bg-orange-100 flex items-center justify-center overflow-hidden">
//                   <span className="text-3xl animate-bounce">🚌</span>
//                 </div>
//                 <div className="text-left">
//                   <p className="text-gray-900 font-bold text-lg">
//                     {t("home.realTimeTracking")}
//                   </p>
//                   <p className="text-gray-600 text-sm">
//                     {t("home.trackingSystem")}
//                   </p>
//                 </div>
//               </div>

//               {/* Stats badge - top right */}
//               <div className="absolute -top-4 -right-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-4 z-20">
//                 <div className="text-center">
//                   <p className="text-white font-bold text-2xl">~3s</p>
//                   <p className="text-blue-100 text-xs">{t("home.updates")}</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Section About */}
//       <section
//         id="about"
//         className="min-h-screen flex items-center justify-center bg-white/70 px-6 py-20 backdrop-blur-sm"
//       >
//         <div className="max-w-7xl w-full grid md:grid-cols-2 gap-12 items-center">
//           {/* Left Column - Live Map Visual */}
//           <div className="relative flex items-center justify-center order-2 md:order-1">
//             {/* Yellow circular/semicircle background shape */}
//             <div className="absolute w-[450px] h-[450px] rounded-full bg-gradient-to-br from-yellow-300 to-yellow-400 opacity-90 -left-10"></div>

//             {/* Decorative floating vegetables (replaced with bus-related icons) */}
//             <div className="absolute top-16 -left-8 w-20 h-20 z-20">
//               <span className="text-6xl">🚍</span>
//             </div>
//             <div className="absolute bottom-20 -right-8 w-24 h-24 z-20">
//               <span className="text-7xl">📍</span>
//             </div>

//             {/* Main map container */}
//             <div className="relative z-10 w-full max-w-md h-[420px] rounded-3xl overflow-hidden shadow-2xl bg-white">
//               <LiveMap />
//             </div>

//             {/* Decorative small circles */}
//             <div className="absolute bottom-28 right-16 w-16 h-16 rounded-full bg-yellow-300 z-0"></div>
//             <div className="absolute top-20 right-10 w-10 h-10 rounded-lg bg-blue-400 transform rotate-12 z-0"></div>
//           </div>

//           {/* Right Column - Content */}
//           <div className="space-y-6 text-left order-1 md:order-2">
//             {/* Overline */}
//             <p className="text-orange-400 uppercase tracking-widest text-sm font-semibold">
//               {t("about.overline")}
//             </p>

//             {/* Headline */}
//             <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
//               {t("about.title")}
//             </h2>

//             {/* Paragraph 1 */}
//             <p className="text-base md:text-lg text-gray-700 leading-relaxed">
//               {t("about.paragraph1")}
//             </p>

//             {/* Paragraph 2 */}
//             <p className="text-base md:text-lg text-gray-700 leading-relaxed">
//               {t("about.paragraph2")}
//             </p>

//             {/* CTA Button */}
//             <div className="pt-4">
//               <button
//                 onClick={() => navigate("/about")}
//                 className="px-8 py-4 rounded-full bg-[#FF6A2C] text-white font-semibold text-lg shadow-lg hover:bg-[#e85f00] hover:shadow-xl hover:scale-105 transition-all duration-300"
//               >
//                 {t("about.learnMore")}
//               </button>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Section Why Choose Us */}
//       <section
//         id="why-choose-us"
//         className="min-h-screen flex flex-col items-center justify-center bg-orange-50/80 px-6 py-20 backdrop-blur-sm"
//       >
//         <div className="max-w-7xl w-full">
//           {/* Header */}
//           <div className="text-center mb-16">
//             <p className="text-orange-400 uppercase tracking-widest text-sm font-semibold mb-4">
//               {t("whyChooseUs.overline")}
//             </p>
//             <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
//               {t("whyChooseUs.title")}
//             </h2>
//           </div>

//           {/* Cards Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//             {/* Card 1: Real-Time GPS Tracking */}
//             <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
//               {/* Icon Circle */}
//               <div className="mb-6 flex justify-center">
//                 <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center shadow-md">
//                   <MapPin
//                     className="w-12 h-12 text-[#FF6A2C]"
//                     aria-hidden="true"
//                   />
//                 </div>
//               </div>

//               {/* Title */}
//               <h3 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-4">
//                 {t("whyChooseUs.card1.title")}
//               </h3>

//               {/* Description */}
//               <p className="text-gray-600 text-center leading-relaxed">
//                 {t("whyChooseUs.card1.description")}
//               </p>
//             </div>

//             {/* Card 2: Unified Operations */}
//             <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
//               {/* Icon Circle */}
//               <div className="mb-6 flex justify-center">
//                 <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center shadow-md">
//                   <LayoutDashboard
//                     className="w-12 h-12 text-[#FF6A2C]"
//                     aria-hidden="true"
//                   />
//                 </div>
//               </div>

//               {/* Title */}
//               <h3 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-4">
//                 {t("whyChooseUs.card2.title")}
//               </h3>

//               {/* Description */}
//               <p className="text-gray-600 text-center leading-relaxed">
//                 {t("whyChooseUs.card2.description")}
//               </p>
//             </div>

//             {/* Card 3: Smart Alerts for Everyone */}
//             <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
//               {/* Icon Circle */}
//               <div className="mb-6 flex justify-center">
//                 <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center shadow-md">
//                   <BellRing
//                     className="w-12 h-12 text-[#FF6A2C]"
//                     aria-hidden="true"
//                   />
//                 </div>
//               </div>

//               {/* Title */}
//               <h3 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-4">
//                 {t("whyChooseUs.card3.title")}
//               </h3>

//               {/* Description */}
//               <p className="text-gray-600 text-center leading-relaxed">
//                 {t("whyChooseUs.card3.description")}
//               </p>
//             </div>

//             {/* Card 4: Built to Scale */}
//             <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
//               {/* Icon Circle */}
//               <div className="mb-6 flex justify-center">
//                 <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center shadow-md">
//                   <Server
//                     className="w-12 h-12 text-[#FF6A2C]"
//                     aria-hidden="true"
//                   />
//                 </div>
//               </div>

//               {/* Title */}
//               <h3 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-4">
//                 {t("whyChooseUs.card4.title")}
//               </h3>

//               {/* Description */}
//               <p className="text-gray-600 text-center leading-relaxed">
//                 {t("whyChooseUs.card4.description")}
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Section Docs */}
//       <section
//         id="docs"
//         className="min-h-screen flex flex-col items-center justify-center bg-white/80 text-center px-6 backdrop-blur-sm"
//       >
//         <h2 className="text-4xl font-bold text-gray-800 mb-4">
//           {t("docs.title")}
//         </h2>
//         <p className="text-gray-700 max-w-2xl">{t("docs.description")}</p>
//       </section>
//       <Footer />
//     </div>
//   );
// };

// export default Introduce;

import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MapPin, LayoutDashboard, BellRing, Server } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import LiveMap from "@/components/LiveMap";

const Introduce = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const letterAnimation = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08, duration: 0.4 },
    }),
  };

  const text1 = "KẾT NỐI";
  const text2 = "HÀNH TRÌNH AN TOÀN";

  return (
    <div className="relative min-h-screen font-sans overflow-x-hidden">
      {/* 🔶 Orange Soft Glow Background */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: `radial-gradient(circle at center, #FF7112, transparent 70%)`,
          opacity: 0.3,
          mixBlendMode: "multiply",
        }}
      />

      {/* Header cố định trên cùng */}
      <Header
        variant="normal"
        className="bg-white shadow-md"
        menuItems={[
          { label: t("header.about"), link: "about", linkType: "scroll" },
          {
            label: t("header.features"),
            link: "why-choose-us",
            linkType: "scroll",
          },
          {
            label: t("header.docs"),
            link: "smartbus-services",
            linkType: "scroll",
          },
        ]}
        loginButton={true}
      />

      {/* 🟠 Section Home - Hero Banner */}
      <section
        id="home"
        className="relative min-h-screen flex flex-col items-center justify-center bg-cover bg-center text-center px-6 py-20"
        style={{
          backgroundImage: "url('/23.png')",
        }}
      >
        <div className="flex flex-col items-center -mt-6 leading-[0.9] text-white h-[500px]">
          {/* <div className="flex flex-col items-center -mt-6 leading-[0.9] text-white"> */}

          {/* Dòng 1 */}
          <motion.h1
            className="
      text-4xl sm:text-5xl md:text-7xl lg:text-8xl 
      font-extrabold tracking-wide text-center
    "
            initial="hidden"
            animate="visible"
          >
            {text1.split("").map((char, i) => (
              <motion.span key={i} custom={i} variants={letterAnimation}>
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </motion.h1>

          {/* Dòng 2 */}
          <motion.h2
            className="
      text-2xl sm:text-3xl md:text-4xl lg:text-5xl 
      font-bold text-center mt-3
    "
            initial="hidden"
            animate="visible"
          >
            {text2.split("").map((char, i) => (
              <motion.span
                key={i}
                custom={i + text1.length}
                variants={letterAnimation}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </motion.h2>

        </div>


      </section>

      {/* 🔷 Section About */}
      <section
        id="about"
        className="min-h-screen flex items-center justify-center bg-white/70 px-6 py-20 backdrop-blur-sm"
      >
        <div className="max-w-7xl w-full grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Live Map Visual */}
          <div className="relative flex items-center justify-center order-2 md:order-1">
            <div className="absolute w-[450px] h-[450px] rounded-full bg-gradient-to-br from-yellow-300 to-yellow-400 opacity-90 -left-10"></div>
            <div className="absolute top-16 -left-8 w-20 h-20 z-20">
              <span className="text-6xl">🚍</span>
            </div>
            <div className="absolute bottom-20 -right-8 w-24 h-24 z-20">
              <span className="text-7xl">📍</span>
            </div>
            <div className="relative z-10 w-full max-w-md h-[420px] rounded-3xl overflow-hidden shadow-2xl bg-white">
              <LiveMap />
            </div>
            <div className="absolute bottom-28 right-16 w-16 h-16 rounded-full bg-yellow-300 z-0"></div>
            <div className="absolute top-20 right-10 w-10 h-10 rounded-lg bg-blue-400 transform rotate-12 z-0"></div>
          </div>

          {/* Right Column */}
          <div className="space-y-6 text-left order-1 md:order-2">
            <p className="text-orange-400 uppercase tracking-widest text-sm font-semibold">
              {t("about.overline")}
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
              {t("about.title")}
            </h2>
            <p className="text-base md:text-lg text-gray-700 leading-relaxed">
              {t("about.paragraph1")}
            </p>
            <p className="text-base md:text-lg text-gray-700 leading-relaxed">
              {t("about.paragraph2")}
            </p>
            <div className="pt-4">
              <button
                onClick={() => navigate("/about")}
                className="px-8 py-4 rounded-full bg-[#FF6A2C] text-white font-semibold text-lg shadow-lg hover:bg-[#e85f00] hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                {t("about.learnMore")}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 🔸 Section Why Choose Us */}
      <section
        id="why-choose-us"
        className="min-h-screen flex flex-col items-center justify-center bg-orange-50/80 px-6 py-20 backdrop-blur-sm"
      >
        <div className="max-w-7xl w-full">
          <div className="text-center mb-16">
            <p className="text-orange-400 uppercase tracking-widest text-sm font-semibold mb-4">
              {t("whyChooseUs.overline")}
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
              {t("whyChooseUs.title")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="mb-6 flex justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center shadow-md">
                  <MapPin className="w-12 h-12 text-[#FF6A2C]" />
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-4">
                {t("whyChooseUs.card1.title")}
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                {t("whyChooseUs.card1.description")}
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="mb-6 flex justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center shadow-md">
                  <LayoutDashboard className="w-12 h-12 text-[#FF6A2C]" />
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-4">
                {t("whyChooseUs.card2.title")}
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                {t("whyChooseUs.card2.description")}
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="mb-6 flex justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center shadow-md">
                  <BellRing className="w-12 h-12 text-[#FF6A2C]" />
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-4">
                {t("whyChooseUs.card3.title")}
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                {t("whyChooseUs.card3.description")}
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="mb-6 flex justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center shadow-md">
                  <Server className="w-12 h-12 text-[#FF6A2C]" />
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-4">
                {t("whyChooseUs.card4.title")}
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                {t("whyChooseUs.card4.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Giải Pháp Toàn Diện */}
      <section
        id="smartbus-services"
        className="relative py-24 px-6 md:px-20 bg-gradient-to-b from-orange-50 to-white text-gray-800 overflow-hidden"
      >
        {/* Tiêu đề chính */}
        <div className="text-center mb-14">
          <p className="uppercase text-orange-500 tracking-widest text-sm font-semibold mb-3">
            Dịch vụ cung cấp
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">
            Giải pháp vận hành xe buýt thông minh
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            SmartBus mang đến hệ thống kết nối toàn diện giữa{" "}
            <span className="font-semibold text-orange-600">
              phụ huynh, nhà trường và tài xế
            </span>{" "}
            giúp đảm bảo an toàn, minh bạch và tối ưu hoá hành trình mỗi ngày.
          </p>
        </div>

        {/* Tabs danh mục */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <button className="bg-orange-600 text-white px-5 py-2 rounded-full font-medium shadow-md">
            Phụ huynh
          </button>
          <button className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-5 py-2 rounded-full font-medium">
            Tài xế
          </button>
          <button className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-5 py-2 rounded-full font-medium">
            Nhà trường
          </button>
          <button className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-5 py-2 rounded-full font-medium">
            Quản lý tuyến
          </button>
        </div>

        {/* Khung nội dung chính */}
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-lg p-10 text-center space-y-10">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Giải pháp cho Phụ huynh
            </h3>
            <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Phụ huynh có thể theo dõi vị trí xe buýt theo thời gian thực, nhận
              thông báo khi con lên – xuống xe và xem lịch trình thuận tiện.
              SmartBus giúp phụ huynh an tâm tuyệt đối và chủ động trên mỗi hành
              trình.
            </p>
          </div>

          {/* Số liệu thống kê (bên trong khung) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-6 border-t border-orange-100">
            <div>
              <p className="text-3xl font-bold text-orange-600">200+</p>
              <p className="text-gray-600 mt-1">Tuyến xe buýt hoạt động</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-orange-600">1K+</p>
              <p className="text-gray-600 mt-1">Phụ huynh đang sử dụng</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-orange-600">98%</p>
              <p className="text-gray-600 mt-1">Mức độ hài lòng</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-orange-600">40+</p>
              <p className="text-gray-600 mt-1">Tài xế được chứng nhận</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Introduce;
