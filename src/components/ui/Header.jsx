// import React, { useState, useEffect } from "react";
// import { Menu, X, Globe } from "lucide-react";

// const Header = () => {
//   const [open, setOpen] = useState(false);
//   const [language, setLanguage] = useState("EN");
//   const [scrolled, setScrolled] = useState(false);

//   // Lắng nghe sự kiện cuộn trang
//   useEffect(() => {
//     const handleScroll = () => {
//       setScrolled(window.scrollY > 50); // Đổi màu khi cuộn xuống > 50px
//     };
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const scrollToSection = (id) => {
//     const element = document.getElementById(id);
//     if (element) {
//       element.scrollIntoView({ behavior: "smooth" });
//       setOpen(false);
//     }
//   };

//   // Chuyển đổi ngôn ngữ
//   const toggleLanguage = () => {
//     setLanguage((prev) => (prev === "EN" ? "VI" : "EN"));
//   };

//   return (
//     <header
//       className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled
//           ? "bg-white/95 shadow-md backdrop-blur-md"
//           : "bg-transparent shadow-none"
//         }`}
//     >
//       <nav className="w-full flex items-center justify-between px-4 md:px-12 py-4">
//         <div
//           onClick={() => scrollToSection("home")}
//           className="flex items-Start gap-2 cursor-pointer pl-0 ml-0"
//         >
//           <img src="logo.png" alt="Logo" className="w-10 h-10 object-contain" />
//           <span
//             className={`text-2xl font-bold transition-colors duration-300 ${scrolled ? "text-gray-800" : "text-black"
//               }`}
//           >
//             Smart<span className="text-orange-500">Bus</span>
//           </span>
//         </div>

//         {/* Menu desktop */}
//         <div
//           className={`hidden md:flex items-center gap-15 text-lg font-medium transition-colors duration-500 ${scrolled ? "text-gray-600" : "text-black"
//             }`}
//         >
//           <button
//             onClick={() => scrollToSection("about")}
//             className="hover:text-orange-500 transition-colors"
//           >
//             Giới thiệu
//           </button>
//           <button
//             onClick={() => scrollToSection("menu")}
//             className="hover:text-orange-500 transition-colors"
//           >
//             Nổi bật
//           </button>
//           <button
//             onClick={() => scrollToSection("docs")}
//             className="hover:text-orange-500 transition-colors"
//           >
//             Tài liệu
//           </button>
//         </div>
//         <div className="hidden md:flex items-center gap-4">
//           {/* <button className="px-5 py-2 rounded-full border border-orange-500 text-black font-medium bg-orange-500 hover:bg-black transition">
//             Sign In
//           </button> */}
//           <button className="px-5 py-2 rounded-full border border-orange-500 bg-orange-500 text-black font-medium active:bg-black active:text-white transition">
//             Đăng nhập
//           </button>

//           {/* Nút đổi ngôn ngữ */}
//           <button
//             onClick={toggleLanguage}
//             className={`flex items-center gap-1 px-3 py-2 rounded-full border transition ${scrolled
//                 ? "border-gray-300 text-gray-700 hover:bg-gray-100"
//                 : "border-black text-black hover:bg-white/20"
//               }`}
//           >
//             <Globe size={18} />
//             <span className="text-sm font-medium">{language}</span>
//           </button>
//         </div>

//         {/* Nút menu mobile */}
//         <button
//           className={`md:hidden transition-colors ${scrolled ? "text-gray-800" : "text-white"
//             }`}
//           onClick={() => setOpen(!open)}
//         >
//           {open ? <X size={28} /> : <Menu size={28} />}
//         </button>

//         {/* mobile */}
//         {open && (
//           <div className="absolute top-16 right-6 bg-white shadow-lg rounded-xl flex flex-col items-center gap-4 py-4 px-8 text-gray-800 text-lg font-medium md:hidden animate-fadeIn">
//             <button
//               onClick={() => scrollToSection("about")}
//               className="hover:text-orange-500"
//             >
//               Giới thiệu
//             </button>
//             <button
//               onClick={() => scrollToSection("menu")}
//               className="hover:text-orange-500"
//             >
//               Nổi bật
//             </button>
//             <button
//               onClick={() => scrollToSection("docs")}
//               className="hover:text-orange-500"
//             >
//               Tài liệu
//             </button>

//             <div className="flex gap-3 mt-2">
//               <button className="px-4 py-1 rounded-full border border-orange-500 text-orange-500 font-medium">
//                 Đăng nhập
//               </button>
//             </div>

//             {/* Nút đổi ngôn ngữ cho mobile */}
//             <button
//               onClick={toggleLanguage}
//               className="flex items-center gap-1 px-3 py-2 rounded-full border border-gray-300 hover:bg-gray-100 transition text-gray-700 mt-2"
//             >
//               <Globe size={18} />
//               <span className="text-sm font-medium">{language}</span>
//             </button>
//           </div>
//         )}
//       </nav>
//     </header>
//   );
// };

// export default Header;

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Menu, X, Globe } from "lucide-react";

const Header = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t, i18n } = useTranslation();

  // Lấy ngôn ngữ hiện tại từ i18n
  const currentLanguage = i18n.language.toUpperCase();

  // Lắng nghe sự kiện cuộn trang
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setOpen(false);
    }
  };

  // Chuyển đổi ngôn ngữ thông qua i18n
  const toggleLanguage = () => {
    const newLang = i18n.language === "vi" ? "en" : "vi";
    i18n.changeLanguage(newLang);
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled
        ? "bg-white/95 shadow-md backdrop-blur-md"
        : "bg-transparent shadow-none"
        }`}
    >
      <nav className="w-full flex items-center justify-between px-4 md:px-12 py-4">
        <div
          onClick={() => scrollToSection("home")}
          className="flex items-Start gap-2 cursor-pointer pl-0 ml-0"
        >
          <img src="logo.png" alt="Logo" className="w-10 h-10 object-contain" />
          <span
            className={`text-2xl font-bold transition-colors duration-300 ${scrolled ? "text-gray-800" : "text-black"
              }`}
          >
            Smart<span className="text-orange-500">Bus</span>
          </span>
        </div>

        {/* Menu desktop */}
        <div
          className={`hidden md:flex items-center gap-15 text-lg font-medium transition-colors duration-500 ${scrolled ? "text-gray-600" : "text-black"
            }`}
        >
          <button
            onClick={() => scrollToSection("about")}
            className="hover:text-orange-500 transition-colors"
          >
            {t("header.about")}
          </button>
          <button
            onClick={() => scrollToSection("menu")}
            className="hover:text-orange-500 transition-colors"
          >
            {t("header.features")}
          </button>
          <button
            onClick={() => scrollToSection("docs")}
            className="hover:text-orange-500 transition-colors"
          >
            {t("header.docs")}
          </button>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <button className="px-5 py-2 rounded-full border border-orange-500 bg-orange-500 text-black font-medium active:bg-black active:text-white transition">
            {t("header.login")}
          </button>

          {/* Nút đổi ngôn ngữ */}
          <button
            onClick={toggleLanguage}
            className={`flex items-center gap-1 px-3 py-2 rounded-full border transition ${scrolled
              ? "border-gray-300 text-gray-700 hover:bg-gray-100"
              : "border-black text-black hover:bg-white/20"
              }`}
          >
            <Globe size={18} />
            <span className="text-sm font-medium">{currentLanguage}</span>
          </button>
        </div>

        {/* Nút menu mobile */}
        <button
          className={`md:hidden transition-colors ${scrolled ? "text-gray-800" : "text-white"
            }`}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* mobile */}
        {open && (
          <div className="absolute top-16 right-6 bg-white shadow-lg rounded-xl flex flex-col items-center gap-4 py-4 px-8 text-gray-800 text-lg font-medium md:hidden animate-fadeIn">
            <button
              onClick={() => scrollToSection("about")}
              className="hover:text-orange-500"
            >
              {t("header.about")}
            </button>
            <button
              onClick={() => scrollToSection("menu")}
              className="hover:text-orange-500"
            >
              {t("header.features")}
            </button>
            <button
              onClick={() => scrollToSection("docs")}
              className="hover:text-orange-500"
            >
              {t("header.docs")}
            </button>

            <div className="flex gap-3 mt-2">
              <button className="px-4 py-1 rounded-full border border-orange-500 text-orange-500 font-medium">
                {t("header.login")}
              </button>
            </div>

            {/* Nút đổi ngôn ngữ cho mobile */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-3 py-2 rounded-full border border-gray-300 hover:bg-gray-100 transition text-gray-700 mt-2"
            >
              <Globe size={18} />
              <span className="text-sm font-medium">{currentLanguage}</span>
            </button>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;