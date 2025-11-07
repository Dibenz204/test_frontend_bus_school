// <<<<<<< HEAD


// import React, { useState, useEffect } from "react";
// import { useTranslation } from "react-i18next";
// import { Menu, X, Globe } from "lucide-react";

// const Header = () => {
//   const [open, setOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);
//   const { t, i18n } = useTranslation();

//   // Lấy ngôn ngữ hiện tại từ i18n
//   const currentLanguage = i18n.language.toUpperCase();

//   // Lắng nghe sự kiện cuộn trang
//   useEffect(() => {
//     const handleScroll = () => {
//       setScrolled(window.scrollY > 50);
//     };
// =======
// import React, { useState, useEffect } from "react";
// import { useTranslation } from "react-i18next";
// import { Menu, X, Globe } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// const Header = ({
//   menuItems = [],
//   loginButton = true,
//   showLogin = true,
//   showLanguage = true,
//   onMenuClick,
//   variant = "normal",
// }) => {
//   const [open, setOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);
//   const { t, i18n } = useTranslation();
//   const currentLanguage = i18n.language.toUpperCase();
//   const navigate = useNavigate();

//   const isParent = variant === "parent";

//   useEffect(() => {
//     const handleScroll = () => setScrolled(window.scrollY > 50);
// >>>>>>> bus/main
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

// <<<<<<< HEAD
//   const scrollToSection = (id) => {
//     const element = document.getElementById(id);
//     if (element) {
//       element.scrollIntoView({ behavior: "smooth" });
//       setOpen(false);
//     }
//   };

//   // Chuyển đổi ngôn ngữ thông qua i18n
// =======
// >>>>>>> bus/main
//   const toggleLanguage = () => {
//     const newLang = i18n.language === "vi" ? "en" : "vi";
//     i18n.changeLanguage(newLang);
//   };

// <<<<<<< HEAD
//   return (
//     <header
//       className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled
//         ? "bg-white/95 shadow-md backdrop-blur-md"
//         : "bg-transparent shadow-none"
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
// =======
//   const handleClick = (item) => {
//     if (onMenuClick && item.linkType === "section") {
//       onMenuClick(item.link);
//       setOpen(false);
//       return;
//     }

//     if (item.linkType === "scroll") {
//       const element = document.getElementById(item.link);
//       if (element) element.scrollIntoView({ behavior: "smooth" });
//       setOpen(false);
//       return;
//     }

//     if (item.linkType === "link") {
//       navigate(item.link);
//       setOpen(false);
//       return;
//     }
//   };

//   return (
//     <header
//       className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 mt-2 ${
//         isParent
//           ? "bg-orange-500 rounded-xl shadow-md max-w-[97%] mx-auto px-6"
//           : scrolled
//           ? "bg-white/95 shadow-md backdrop-blur-md max-w-[95%] mx-auto px-6"
//           : "bg-transparent shadow-none max-w-[95%] mx-auto px-6"
//       }`}
//     >
//       <nav className="w-full flex items-center justify-between px-4 md:px-12 py-4">
//         {/* Logo */}
//         <div
//           onClick={() => navigate("/")}
//           className="flex items-center gap-2 cursor-pointer"
//         >
//           <img src="logo.png" alt="Logo" className="w-10 h-10 object-contain" />
//           <span
//             className={`text-2xl font-bold transition-colors duration-300 ${
//               isParent
//                 ? "text-white"
//                 : scrolled
//                 ? "text-gray-800"
//                 : "text-black"
//             }`}
//           >
//             Smart
//             <span className={isParent ? "text-black" : "text-orange-500"}>
//               Bus
//             </span>
// >>>>>>> bus/main
//           </span>
//         </div>

//         {/* Menu desktop */}
//         <div
// <<<<<<< HEAD
//           className={`hidden md:flex items-center gap-15 text-lg font-medium transition-colors duration-500 ${scrolled ? "text-gray-600" : "text-black"
//             }`}
//         >
//           <button
//             onClick={() => scrollToSection("about")}
//             className="hover:text-orange-500 transition-colors"
//           >
//             {t("header.about")}
//           </button>
//           <button
//             onClick={() => scrollToSection("menu")}
//             className="hover:text-orange-500 transition-colors"
//           >
//             {t("header.features")}
//           </button>
//           <button
//             onClick={() => scrollToSection("docs")}
//             className="hover:text-orange-500 transition-colors"
//           >
//             {t("header.docs")}
//           </button>
//         </div>
//         <div className="hidden md:flex items-center gap-4">
//           <button className="px-5 py-2 rounded-full border border-orange-500 bg-orange-500 text-black font-medium active:bg-black active:text-white transition">
//             {t("header.login")}
//           </button>

//           {/* Nút đổi ngôn ngữ */}
//           <button
//             onClick={toggleLanguage}
//             className={`flex items-center gap-1 px-3 py-2 rounded-full border transition ${scrolled
//               ? "border-gray-300 text-gray-700 hover:bg-gray-100"
//               : "border-black text-black hover:bg-white/20"
//               }`}
//           >
//             <Globe size={18} />
//             <span className="text-sm font-medium">{currentLanguage}</span>
//           </button>
//         </div>

//         {/* Nút menu mobile */}
//         <button
//           className={`md:hidden transition-colors ${scrolled ? "text-gray-800" : "text-white"
//             }`}
// =======
//           className={`hidden md:flex items-center gap-10 text-lg font-medium transition-colors duration-500 ${
//             isParent ? "text-white" : scrolled ? "text-gray-600" : "text-black"
//           }`}
//         >
//           {menuItems.map((item) => (
//             <button
//               key={item.label}
//               onClick={() => handleClick(item)}
//               className={`transition-colors ${
//                 isParent ? "hover:text-black" : "hover:text-orange-500"
//               }`}
//             >
//               {item.label}
//             </button>
//           ))}
//         </div>

//         {/* Login + Language */}
//         <div className="hidden md:flex items-center gap-4">
//           {showLogin &&
//             (loginButton ? (
//               <button
//                 onClick={() => navigate("/login")}
//                 className={`px-5 py-2 rounded-full border font-medium transition ${
//                   isParent
//                     ? "border-white bg-white text-black hover:bg-black hover:text-white"
//                     : "border-orange-500 bg-orange-500 text-black hover:bg-black hover:text-white"
//                 }`}
//               >
//                 {t("header.login")}
//               </button>
//             ) : (
//               <button
//                 onClick={() => navigate("/logout")}
//                 className="px-5 py-2 rounded-full border border-red-500 bg-red-500 text-white font-medium hover:bg-black transition"
//               >
//                 {t("header.logout")}
//               </button>
//             ))}

//           {showLanguage && (
//             <button
//               onClick={toggleLanguage}
//               className={`flex items-center gap-1 px-3 py-2 rounded-full border transition ${
//                 isParent
//                   ? "border-white text-white hover:bg-white hover:text-black"
//                   : scrolled
//                   ? "border-gray-300 text-gray-700 hover:bg-gray-100"
//                   : "border-black text-black hover:bg-white/20"
//               }`}
//             >
//               <Globe size={18} />
//               <span className="text-sm font-medium">{currentLanguage}</span>
//             </button>
//           )}
//         </div>

//         {/* Mobile toggle */}
//         <button
//           className={`md:hidden transition-colors ${
//             isParent ? "text-white" : scrolled ? "text-gray-800" : "text-black"
//           }`}
// >>>>>>> bus/main
//           onClick={() => setOpen(!open)}
//         >
//           {open ? <X size={28} /> : <Menu size={28} />}
//         </button>

// <<<<<<< HEAD
//         {/* mobile */}
//         {open && (
//           <div className="absolute top-16 right-6 bg-white shadow-lg rounded-xl flex flex-col items-center gap-4 py-4 px-8 text-gray-800 text-lg font-medium md:hidden animate-fadeIn">
//             <button
//               onClick={() => scrollToSection("about")}
//               className="hover:text-orange-500"
//             >
//               {t("header.about")}
//             </button>
//             <button
//               onClick={() => scrollToSection("menu")}
//               className="hover:text-orange-500"
//             >
//               {t("header.features")}
//             </button>
//             <button
//               onClick={() => scrollToSection("docs")}
//               className="hover:text-orange-500"
//             >
//               {t("header.docs")}
//             </button>

//             <div className="flex gap-3 mt-2">
//               <button className="px-4 py-1 rounded-full border border-orange-500 text-orange-500 font-medium">
//                 {t("header.login")}
//               </button>
//             </div>

//             {/* Nút đổi ngôn ngữ cho mobile */}
//             <button
//               onClick={toggleLanguage}
//               className="flex items-center gap-1 px-3 py-2 rounded-full border border-gray-300 hover:bg-gray-100 transition text-gray-700 mt-2"
//             >
//               <Globe size={18} />
//               <span className="text-sm font-medium">{currentLanguage}</span>
//             </button>
// =======
//         {/* Mobile menu */}
//         {open && (
//           <div
//             className={`absolute top-16 right-6 ${
//               isParent ? "bg-orange-500 text-white" : "bg-white text-gray-800"
//             } shadow-lg rounded-xl flex flex-col items-center gap-4 py-4 px-8 text-lg font-medium md:hidden animate-fadeIn`}
//           >
//             {menuItems.map((item) => (
//               <button
//                 key={item.label}
//                 onClick={() => handleClick(item)}
//                 className={`transition-colors ${
//                   isParent ? "hover:text-black" : "hover:text-orange-500"
//                 }`}
//               >
//                 {item.label}
//               </button>
//             ))}

//             {showLogin && (
//               <div className="flex gap-3 mt-2">
//                 {loginButton ? (
//                   <button
//                     onClick={() => navigate("/login")}
//                     className={`px-4 py-1 rounded-full border font-medium ${
//                       isParent
//                         ? "border-white text-white hover:bg-white hover:text-black"
//                         : "border-orange-500 text-orange-500"
//                     }`}
//                   >
//                     {t("header.login")}
//                   </button>
//                 ) : (
//                   <button
//                     onClick={() => navigate("/logout")}
//                     className="px-4 py-1 rounded-full border border-red-500 text-red-500 font-medium"
//                   >
//                     {t("header.logout")}
//                   </button>
//                 )}
//               </div>
//             )}

//             {showLanguage && (
//               <button
//                 onClick={toggleLanguage}
//                 className={`flex items-center gap-1 px-3 py-2 rounded-full border transition mt-2 ${
//                   isParent
//                     ? "border-white text-white hover:bg-white hover:text-black"
//                     : "border-gray-300 text-gray-700 hover:bg-gray-100"
//                 }`}
//               >
//                 <Globe size={18} />
//                 <span className="text-sm font-medium">{currentLanguage}</span>
//               </button>
//             )}
// >>>>>>> bus/main
//           </div>
//         )}
//       </nav>
//     </header>
//   );
// };

// <<<<<<< HEAD
// export default Header;
// =======
// export default Header;
// >>>>>>> bus/main

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Menu, X, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = ({
  menuItems = [],
  loginButton = true,
  showLogin = true,
  showLanguage = true,
  onMenuClick,
  variant = "normal",
}) => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language.toUpperCase();
  const navigate = useNavigate();

  const isParent = variant === "parent";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language === "vi" ? "en" : "vi";
    i18n.changeLanguage(newLang);
  };

  const handleClick = (item) => {
    if (onMenuClick && item.linkType === "section") {
      onMenuClick(item.link);
      setOpen(false);
      return;
    }

    if (item.linkType === "scroll") {
      const element = document.getElementById(item.link);
      if (element) element.scrollIntoView({ behavior: "smooth" });
      setOpen(false);
      return;
    }

    if (item.linkType === "link") {
      navigate(item.link);
      setOpen(false);
      return;
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 mt-2 ${isParent
          ? "bg-orange-500 rounded-xl shadow-md max-w-[97%] mx-auto px-6"
          : scrolled
            ? "bg-white/95 shadow-md backdrop-blur-md max-w-[95%] mx-auto px-6"
            : "bg-transparent shadow-none max-w-[95%] mx-auto px-6"
        }`}
    >
      <nav className="w-full flex items-center justify-between px-4 md:px-12 py-4">
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <img src="logo.png" alt="Logo" className="w-10 h-10 object-contain" />
          <span
            className={`text-2xl font-bold transition-colors duration-300 ${isParent
                ? "text-white"
                : scrolled
                  ? "text-gray-800"
                  : "text-black"
              }`}
          >
            Smart
            <span className={isParent ? "text-black" : "text-orange-500"}>
              Bus
            </span>
          </span>
        </div>

        {/* Menu desktop */}
        <div
          className={`hidden md:flex items-center gap-10 text-lg font-medium transition-colors duration-500 ${isParent ? "text-white" : scrolled ? "text-gray-600" : "text-black"
            }`}
        >
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleClick(item)}
              className={`transition-colors ${isParent ? "hover:text-black" : "hover:text-orange-500"
                }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Login + Language */}
        <div className="hidden md:flex items-center gap-4">
          {showLogin &&
            (loginButton ? (
              <button
                onClick={() => navigate("/login")}
                className={`px-5 py-2 rounded-full border font-medium transition ${isParent
                    ? "border-white bg-white text-black hover:bg-black hover:text-white"
                    : "border-orange-500 bg-orange-500 text-black hover:bg-black hover:text-white"
                  }`}
              >
                {t("header.login")}
              </button>
            ) : (
              <button
                onClick={() => navigate("/logout")}
                className="px-5 py-2 rounded-full border border-red-500 bg-red-500 text-white font-medium hover:bg-black transition"
              >
                {t("header.logout")}
              </button>
            ))}

          {showLanguage && (
            <button
              onClick={toggleLanguage}
              className={`flex items-center gap-1 px-3 py-2 rounded-full border transition ${isParent
                  ? "border-white text-white hover:bg-white hover:text-black"
                  : scrolled
                    ? "border-gray-300 text-gray-700 hover:bg-gray-100"
                    : "border-black text-black hover:bg-white/20"
                }`}
            >
              <Globe size={18} />
              <span className="text-sm font-medium">{currentLanguage}</span>
            </button>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className={`md:hidden transition-colors ${isParent ? "text-white" : scrolled ? "text-gray-800" : "text-black"
            }`}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Mobile menu */}
        {open && (
          <div
            className={`absolute top-16 right-6 ${isParent ? "bg-orange-500 text-white" : "bg-white text-gray-800"
              } shadow-lg rounded-xl flex flex-col items-center gap-4 py-4 px-8 text-lg font-medium md:hidden animate-fadeIn`}
          >
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleClick(item)}
                className={`transition-colors ${isParent ? "hover:text-black" : "hover:text-orange-500"
                  }`}
              >
                {item.label}
              </button>
            ))}

            {showLogin && (
              <div className="flex gap-3 mt-2">
                {loginButton ? (
                  <button
                    onClick={() => navigate("/login")}
                    className={`px-4 py-1 rounded-full border font-medium ${isParent
                        ? "border-white text-white hover:bg-white hover:text-black"
                        : "border-orange-500 text-orange-500"
                      }`}
                  >
                    {t("header.login")}
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/logout")}
                    className="px-4 py-1 rounded-full border border-red-500 text-red-500 font-medium"
                  >
                    {t("header.logout")}
                  </button>
                )}
              </div>
            )}

            {showLanguage && (
              <button
                onClick={toggleLanguage}
                className={`flex items-center gap-1 px-3 py-2 rounded-full border transition mt-2 ${isParent
                    ? "border-white text-white hover:bg-white hover:text-black"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
              >
                <Globe size={18} />
                <span className="text-sm font-medium">{currentLanguage}</span>
              </button>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;