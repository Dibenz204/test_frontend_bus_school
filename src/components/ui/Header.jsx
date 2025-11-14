import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Menu, X, Globe, User, LogOut, Home } from "lucide-react";
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
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language.toUpperCase();
  const navigate = useNavigate();

  const isParent = variant === "parent";

  const getDriverInfo = () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      return userInfo;
    } catch (error) {
      return null;
    }
  };

  const driverInfo = getDriverInfo();
  const isDriverLoggedIn = driverInfo && driverInfo.role === "Tài xế";

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

  // ✅ XỬ LÝ LOGOUT - TẮT GPS TRƯỚC KHI ĐĂNG XUẤT
  const handleLogout = () => {
    const confirmLogout = window.confirm("Bạn có chắc chắn muốn đăng xuất không?");
    if (confirmLogout) {
      // ✅ Tắt GPS trước khi logout (sẽ được xử lý bởi cleanup function trong Taixe.jsx)
      console.log("🔴 Đăng xuất - GPS sẽ tự động tắt");

      // Xóa thông tin user
      localStorage.removeItem("userInfo");

      // Chuyển về trang login
      navigate("/login");
      setUserDropdownOpen(false);
      setOpen(false);
    }
  };

  const handleBackToDashboard = () => {
    if (!driverInfo) return;

    switch (driverInfo.role) {
      case "Tài xế":
        navigate("/taixe");
        break;
      case "Admin":
        navigate("/admin");
        break;
      case "Phụ huynh":
        navigate("/parent");
        break;
      default:
        navigate("/");
        break;
    }
    setUserDropdownOpen(false);
    setOpen(false);
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
      <nav className="w-full flex items-center justify-between px-4 md:px-6 py-3">
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

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleLanguage}
            className={`flex items-center gap-1 px-3 py-2 rounded-full border transition ${isParent
              ? "border-white text-white hover:bg-white hover:text-black"
              : scrolled
                ? "border-gray-300 text-gray-700 hover:bg-gray-100"
                : "border-gray-400 text-gray-700 hover:bg-gray-100"
              }`}
          >
            <Globe size={18} />
            <span className="text-sm font-medium">{currentLanguage}</span>
          </button>

          {isDriverLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition ${isParent
                  ? "border-white text-white hover:bg-white hover:text-black"
                  : scrolled
                    ? "border-orange-500 bg-orange-500 text-white hover:bg-orange-600"
                    : "border-orange-500 bg-orange-500 text-white hover:bg-orange-600"
                  }`}
              >
                <User size={18} />
                <span className="font-medium">
                  {driverInfo.name || driverInfo.id_driver}
                </span>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 top-12 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={handleBackToDashboard}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Home size={16} />
                    Quay lại giao diện
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    {t("header_driver.logout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            showLogin &&
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
            ))
          )}
        </div>

        <button
          className={`md:hidden transition-colors ${isParent ? "text-white" : scrolled ? "text-gray-800" : "text-black"
            }`}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>

        {open && (
          <div
            className={`absolute top-16 right-6 ${isParent ? "bg-orange-500 text-white" : "bg-white text-gray-800"
              } shadow-lg rounded-xl flex flex-col items-center gap-4 py-4 px-8 text-lg font-medium md:hidden animate-fadeIn z-50`}
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

            <button
              onClick={toggleLanguage}
              className={`flex items-center gap-1 px-3 py-2 rounded-full border transition ${isParent
                ? "border-white text-white hover:bg-white hover:text-black"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
            >
              <Globe size={18} />
              <span className="text-sm font-medium">{currentLanguage}</span>
            </button>

            {isDriverLoggedIn ? (
              <div className="flex flex-col gap-3 mt-2 w-full items-center border-t pt-4 border-gray-300">
                <div className="text-center mb-2">
                  <p className={`font-semibold ${isParent ? "text-white" : "text-gray-800"}`}>
                    👋 {t("header_driver.hello")}, {driverInfo.name || driverInfo.id_driver}
                  </p>
                  <p className={`text-sm ${isParent ? "text-white opacity-80" : "text-gray-600"}`}>
                    ID: {driverInfo.id_driver} | {t("header_driver.role")}: {driverInfo.role}
                  </p>
                </div>
                <button
                  onClick={handleBackToDashboard}
                  className="flex items-center gap-2 w-full justify-center px-4 py-2 rounded-full border border-white text-white font-medium hover:bg-white hover:text-black transition-colors"
                >
                  <Home size={16} />
                  Quay lại giao diện
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full justify-center px-4 py-2 rounded-full border border-white text-white font-medium hover:bg-white hover:text-black transition-colors"
                >
                  <LogOut size={16} />
                  {t("header_driver.logout")}
                </button>
              </div>
            ) : showLogin ? (
              <div className="flex flex-col gap-3 mt-2 w-full items-center border-t pt-4 border-gray-300">
                {loginButton ? (
                  <button
                    onClick={() => {
                      navigate("/login");
                      setOpen(false);
                    }}
                    className={`px-4 py-2 rounded-full border font-medium transition ${isParent
                      ? "border-white text-white hover:bg-white hover:text-black"
                      : "border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                      }`}
                  >
                    {t("header.login")}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      navigate("/logout");
                      setOpen(false);
                    }}
                    className="px-4 py-2 rounded-full border border-red-500 text-red-500 font-medium hover:bg-red-500 hover:text-white transition-colors"
                  >
                    {t("header.logout")}
                  </button>
                )}
              </div>
            ) : null}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;

// import React, { useState, useEffect } from "react";
// import { useTranslation } from "react-i18next";
// import { Menu, X, Globe, User, LogOut, Home } from "lucide-react";
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
//   const [userDropdownOpen, setUserDropdownOpen] = useState(false);
//   const { t, i18n } = useTranslation();
//   const currentLanguage = i18n.language.toUpperCase();
//   const navigate = useNavigate();

//   const isParent = variant === "parent";

//   // Lấy thông tin driver từ localStorage
//   const getDriverInfo = () => {
//     try {
//       const userInfo = JSON.parse(localStorage.getItem("userInfo"));
//       return userInfo;
//     } catch (error) {
//       return null;
//     }
//   };

//   const driverInfo = getDriverInfo();
//   const isDriverLoggedIn = driverInfo && driverInfo.role === "Tài xế";

//   useEffect(() => {
//     const handleScroll = () => setScrolled(window.scrollY > 50);
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const toggleLanguage = () => {
//     const newLang = i18n.language === "vi" ? "en" : "vi";
//     i18n.changeLanguage(newLang);
//   };

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

//   const handleLogout = () => {
//     const confirmLogout = window.confirm("Bạn có chắc chắn muốn đăng xuất không?");
//     if (confirmLogout) {
//       localStorage.removeItem("userInfo");
//       navigate("/login");
//       setUserDropdownOpen(false);
//       setOpen(false);
//     }
//   };

//   // Hàm quay lại giao diện theo role
//   const handleBackToDashboard = () => {
//     if (!driverInfo) return;

//     switch (driverInfo.role) {
//       case "Tài xế":
//         navigate("/taixe");
//         break;
//       case "Admin":
//         navigate("/admin");
//         break;
//       case "Phụ huynh":
//         navigate("/parent");
//         break;
//       default:
//         navigate("/");
//         break;
//     }
//     setUserDropdownOpen(false);
//     setOpen(false);
//   };

//   return (
//     <header
//       className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 mt-2 ${isParent
//         ? "bg-orange-500 rounded-xl shadow-md max-w-[97%] mx-auto px-6"
//         : scrolled
//           ? "bg-white/95 shadow-md backdrop-blur-md max-w-[95%] mx-auto px-6"
//           : "bg-transparent shadow-none max-w-[95%] mx-auto px-6"
//         }`}
//     >
//       <nav className="w-full flex items-center justify-between px-4 md:px-6 py-3">
//         {/* Logo */}
//         <div
//           onClick={() => navigate("/")}
//           className="flex items-center gap-2 cursor-pointer"
//         >
//           <img src="logo.png" alt="Logo" className="w-10 h-10 object-contain" />
//           <span
//             className={`text-2xl font-bold transition-colors duration-300 ${isParent
//               ? "text-white"
//               : scrolled
//                 ? "text-gray-800"
//                 : "text-black"
//               }`}
//           >
//             Smart
//             <span className={isParent ? "text-black" : "text-orange-500"}>
//               Bus
//             </span>
//           </span>
//         </div>

//         {/* Menu desktop */}
//         <div
//           className={`hidden md:flex items-center gap-10 text-lg font-medium transition-colors duration-500 ${isParent ? "text-white" : scrolled ? "text-gray-600" : "text-black"
//             }`}
//         >
//           {menuItems.map((item) => (
//             <button
//               key={item.label}
//               onClick={() => handleClick(item)}
//               className={`transition-colors ${isParent ? "hover:text-black" : "hover:text-orange-500"
//                 }`}
//             >
//               {item.label}
//             </button>
//           ))}
//         </div>

//         {/* Language + Driver Info */}
//         <div className="hidden md:flex items-center gap-3">
//           {/* Nút ngôn ngữ - KẾ BÊN nút driver */}
//           <button
//             onClick={toggleLanguage}
//             className={`flex items-center gap-1 px-3 py-2 rounded-full border transition ${isParent
//               ? "border-white text-white hover:bg-white hover:text-black"
//               : scrolled
//                 ? "border-gray-300 text-gray-700 hover:bg-gray-100"
//                 : "border-gray-400 text-gray-700 hover:bg-gray-100"
//               }`}
//           >
//             <Globe size={18} />
//             <span className="text-sm font-medium">{currentLanguage}</span>
//           </button>

//           {/* Nút driver dropdown (nếu đã đăng nhập) */}
//           {isDriverLoggedIn ? (
//             <div className="relative">
//               <button
//                 onClick={() => setUserDropdownOpen(!userDropdownOpen)}
//                 className={`flex items-center gap-2 px-4 py-2 rounded-full border transition ${isParent
//                   ? "border-white text-white hover:bg-white hover:text-black"
//                   : scrolled
//                     ? "border-orange-500 bg-orange-500 text-white hover:bg-orange-600"
//                     : "border-orange-500 bg-orange-500 text-white hover:bg-orange-600"
//                   }`}
//               >
//                 <User size={18} />
//                 <span className="font-medium">
//                   {driverInfo.name || driverInfo.id_driver}
//                 </span>
//               </button>

//               {/* Dropdown menu - ĐÃ SỬA: QUAY LẠI GIAO DIỆN + ĐĂNG XUẤT */}
//               {userDropdownOpen && (
//                 <div className="absolute right-0 top-12 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
//                   <button
//                     onClick={handleBackToDashboard}
//                     className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
//                   >
//                     <Home size={16} />
//                     Quay lại giao diện
//                   </button>
//                   <button
//                     onClick={handleLogout}
//                     className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
//                   >
//                     <LogOut size={16} />
//                     {t("header_driver.logout")}
//                   </button>
//                 </div>
//               )}
//             </div>
//           ) : (
//             /* Nút đăng nhập (nếu chưa đăng nhập) */
//             showLogin &&
//             (loginButton ? (
//               <button
//                 onClick={() => navigate("/login")}
//                 className={`px-5 py-2 rounded-full border font-medium transition ${isParent
//                   ? "border-white bg-white text-black hover:bg-black hover:text-white"
//                   : "border-orange-500 bg-orange-500 text-black hover:bg-black hover:text-white"
//                   }`}
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
//             ))
//           )}
//         </div>

//         {/* Mobile toggle */}
//         <button
//           className={`md:hidden transition-colors ${isParent ? "text-white" : scrolled ? "text-gray-800" : "text-black"
//             }`}
//           onClick={() => setOpen(!open)}
//         >
//           {open ? <X size={28} /> : <Menu size={28} />}
//         </button>

//         {/* Mobile menu - ĐÃ SỬA: QUAY LẠI GIAO DIỆN + ĐĂNG XUẤT */}
//         {open && (
//           <div
//             className={`absolute top-16 right-6 ${isParent ? "bg-orange-500 text-white" : "bg-white text-gray-800"
//               } shadow-lg rounded-xl flex flex-col items-center gap-4 py-4 px-8 text-lg font-medium md:hidden animate-fadeIn z-50`}
//           >
//             {menuItems.map((item) => (
//               <button
//                 key={item.label}
//                 onClick={() => handleClick(item)}
//                 className={`transition-colors ${isParent ? "hover:text-black" : "hover:text-orange-500"
//                   }`}
//               >
//                 {item.label}
//               </button>
//             ))}

//             {/* Mobile: Language button */}
//             <button
//               onClick={toggleLanguage}
//               className={`flex items-center gap-1 px-3 py-2 rounded-full border transition ${isParent
//                 ? "border-white text-white hover:bg-white hover:text-black"
//                 : "border-gray-300 text-gray-700 hover:bg-gray-100"
//                 }`}
//             >
//               <Globe size={18} />
//               <span className="text-sm font-medium">{currentLanguage}</span>
//             </button>

//             {/* Mobile: Driver info or Login - ĐÃ SỬA: QUAY LẠI GIAO DIỆN + ĐĂNG XUẤT */}
//             {isDriverLoggedIn ? (
//               <div className="flex flex-col gap-3 mt-2 w-full items-center border-t pt-4 border-gray-300">
//                 <div className="text-center mb-2">
//                   <p className={`font-semibold ${isParent ? "text-white" : "text-gray-800"}`}>
//                     👋 {t("header_driver.hello")}, {driverInfo.name || driverInfo.id_driver}
//                   </p>
//                   <p className={`text-sm ${isParent ? "text-white opacity-80" : "text-gray-600"}`}>
//                     ID: {driverInfo.id_driver} |  {t("header_driver.role")}: {driverInfo.role}
//                   </p>
//                 </div>
//                 <button
//                   onClick={handleBackToDashboard}
//                   className="flex items-center gap-2 w-full justify-center px-4 py-2 rounded-full border border-white text-white font-medium hover:text-black transition-colors"
//                 >
//                   <Home size={16} />
//                   Quay lại giao diện
//                 </button>
//                 <button
//                   onClick={handleLogout}
//                   className="flex items-center gap-2 w-full justify-center px-4 py-2 rounded-full border border-white text-white font-medium hover:text-black transition-colors"
//                 >
//                   <LogOut size={16} />
//                   {t("header_driver.logout")}
//                 </button>
//               </div>
//             ) : showLogin ? (
//               <div className="flex flex-col gap-3 mt-2 w-full items-center border-t pt-4 border-gray-300">
//                 {loginButton ? (
//                   <button
//                     onClick={() => {
//                       navigate("/login");
//                       setOpen(false);
//                     }}
//                     className={`px-4 py-2 rounded-full border font-medium transition ${isParent
//                       ? "border-white text-white hover:bg-white hover:text-black"
//                       : "border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
//                       }`}
//                   >
//                     {t("header.login")}
//                   </button>
//                 ) : (
//                   <button
//                     onClick={() => {
//                       navigate("/logout");
//                       setOpen(false);
//                     }}
//                     className="px-4 py-2 rounded-full border border-red-500 text-red-500 font-medium hover:bg-red-500 hover:text-white transition-colors"
//                   >
//                     {t("header.logout")}
//                   </button>
//                 )}
//               </div>
//             ) : null}
//           </div>
//         )}
//       </nav>
//     </header>
//   );
// };

// export default Header;

// // import React, { useState, useEffect } from "react";
// // import { useTranslation } from "react-i18next";
// // import { Menu, X, Globe, User, LogOut, User as UserIcon } from "lucide-react";
// // import { useNavigate } from "react-router-dom";


// // const Header = ({
// //   menuItems = [],
// //   loginButton = true,
// //   showLogin = true,
// //   showLanguage = true,
// //   onMenuClick,
// //   variant = "normal",
// // }) => {
// //   const [open, setOpen] = useState(false);
// //   const [scrolled, setScrolled] = useState(false);
// //   const [userDropdownOpen, setUserDropdownOpen] = useState(false);
// //   const { t, i18n } = useTranslation();
// //   const currentLanguage = i18n.language.toUpperCase();
// //   const navigate = useNavigate();


// //   const isParent = variant === "parent";

// //   // Lấy thông tin driver từ localStorage
// //   const getDriverInfo = () => {
// //     try {
// //       const userInfo = JSON.parse(localStorage.getItem("userInfo"));
// //       return userInfo;
// //     } catch (error) {
// //       return null;
// //     }
// //   };

// //   const driverInfo = getDriverInfo();
// //   const isDriverLoggedIn = driverInfo && driverInfo.role === "Tài xế";

// //   useEffect(() => {
// //     const handleScroll = () => setScrolled(window.scrollY > 50);
// //     window.addEventListener("scroll", handleScroll);
// //     return () => window.removeEventListener("scroll", handleScroll);
// //   }, []);

// //   const toggleLanguage = () => {
// //     const newLang = i18n.language === "vi" ? "en" : "vi";
// //     i18n.changeLanguage(newLang);
// //   };

// //   const handleClick = (item) => {
// //     if (onMenuClick && item.linkType === "section") {
// //       onMenuClick(item.link);
// //       setOpen(false);
// //       return;
// //     }

// //     if (item.linkType === "scroll") {
// //       const element = document.getElementById(item.link);
// //       if (element) element.scrollIntoView({ behavior: "smooth" });
// //       setOpen(false);
// //       return;
// //     }

// //     if (item.linkType === "link") {
// //       navigate(item.link);
// //       setOpen(false);
// //       return;
// //     }
// //   };

// //   const handleLogout = () => {
// //     const confirmLogout = window.confirm("Bạn có chắc chắn muốn đăng xuất không?");
// //     if (confirmLogout) {
// //       localStorage.removeItem("userInfo");
// //       navigate("/login");
// //       setUserDropdownOpen(false);
// //       setOpen(false); // Đóng mobile menu khi đăng xuất
// //     }
// //   };

// //   const handleProfile = () => {
// //     // Điều hướng đến trang thông tin cá nhân (có thể thay đổi route sau)
// //     console.log("Navigate to profile page");
// //     setUserDropdownOpen(false);
// //     setOpen(false); // Đóng mobile menu
// //   };

// //   return (
// //     <header
// //       className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 mt-2 ${isParent
// //         ? "bg-orange-500 rounded-xl shadow-md max-w-[97%] mx-auto px-6"
// //         : scrolled
// //           ? "bg-white/95 shadow-md backdrop-blur-md max-w-[95%] mx-auto px-6"
// //           : "bg-transparent shadow-none max-w-[95%] mx-auto px-6"
// //         }`}
// //     >
// //       <nav className="w-full flex items-center justify-between px-4 md:px-6 py-3">
// //         {/* Logo */}
// //         <div
// //           onClick={() => navigate("/")}
// //           className="flex items-center gap-2 cursor-pointer"
// //         >
// //           <img src="logo.png" alt="Logo" className="w-10 h-10 object-contain" />
// //           <span
// //             className={`text-2xl font-bold transition-colors duration-300 ${isParent
// //               ? "text-white"
// //               : scrolled
// //                 ? "text-gray-800"
// //                 : "text-black"
// //               }`}
// //           >
// //             Smart
// //             <span className={isParent ? "text-black" : "text-orange-500"}>
// //               Bus
// //             </span>
// //           </span>
// //         </div>

// //         {/* Menu desktop */}
// //         <div
// //           className={`hidden md:flex items-center gap-10 text-lg font-medium transition-colors duration-500 ${isParent ? "text-white" : scrolled ? "text-gray-600" : "text-black"
// //             }`}
// //         >
// //           {menuItems.map((item) => (
// //             <button
// //               key={item.label}
// //               onClick={() => handleClick(item)}
// //               className={`transition-colors ${isParent ? "hover:text-black" : "hover:text-orange-500"
// //                 }`}
// //             >
// //               {item.label}
// //             </button>
// //           ))}
// //         </div>

// //         {/* Language + Driver Info */}
// //         <div className="hidden md:flex items-center gap-3">
// //           {/* Nút ngôn ngữ - KẾ BÊN nút driver */}
// //           <button
// //             onClick={toggleLanguage}
// //             className={`flex items-center gap-1 px-3 py-2 rounded-full border transition ${isParent
// //               ? "border-white text-white hover:bg-white hover:text-black"
// //               : scrolled
// //                 ? "border-gray-300 text-gray-700 hover:bg-gray-100"
// //                 : "border-gray-400 text-gray-700 hover:bg-gray-100"
// //               }`}
// //           >
// //             <Globe size={18} />
// //             <span className="text-sm font-medium">{currentLanguage}</span>
// //           </button>

// //           {/* Nút driver dropdown (nếu đã đăng nhập) */}
// //           {isDriverLoggedIn ? (
// //             <div className="relative">
// //               <button
// //                 onClick={() => setUserDropdownOpen(!userDropdownOpen)}
// //                 className={`flex items-center gap-2 px-4 py-2 rounded-full border transition ${isParent
// //                   ? "border-white text-white hover:bg-white hover:text-black"
// //                   : scrolled
// //                     ? "border-orange-500 bg-orange-500 text-white hover:bg-orange-600"
// //                     : "border-orange-500 bg-orange-500 text-white hover:bg-orange-600"
// //                   }`}
// //               >
// //                 <User size={18} />
// //                 <span className="font-medium">
// //                   {driverInfo.name || driverInfo.id_driver}
// //                 </span>
// //               </button>

// //               {/* Dropdown menu */}
// //               {userDropdownOpen && (
// //                 <div className="absolute right-0 top-12 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
// //                   {/* <button
// //                     onClick={handleProfile}
// //                     className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
// //                   >
// //                     <UserIcon size={16} />
// //                     Thông tin cá nhân
// //                   </button> */}
// //                   <button
// //                     onClick={handleLogout}
// //                     className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
// //                   >
// //                     <LogOut size={16} />
// //                     {t("header_driver.logout")}
// //                   </button>
// //                 </div>
// //               )}
// //             </div>
// //           ) : (
// //             /* Nút đăng nhập (nếu chưa đăng nhập) */
// //             showLogin &&
// //             (loginButton ? (
// //               <button
// //                 onClick={() => navigate("/login")}
// //                 className={`px-5 py-2 rounded-full border font-medium transition ${isParent
// //                   ? "border-white bg-white text-black hover:bg-black hover:text-white"
// //                   : "border-orange-500 bg-orange-500 text-black hover:bg-black hover:text-white"
// //                   }`}
// //               >
// //                 {t("header.login")}
// //               </button>
// //             ) : (
// //               <button
// //                 onClick={() => navigate("/logout")}
// //                 className="px-5 py-2 rounded-full border border-red-500 bg-red-500 text-white font-medium hover:bg-black transition"
// //               >
// //                 {t("header.logout")}
// //               </button>
// //             ))
// //           )}
// //         </div>

// //         {/* Mobile toggle */}
// //         <button
// //           className={`md:hidden transition-colors ${isParent ? "text-white" : scrolled ? "text-gray-800" : "text-black"
// //             }`}
// //           onClick={() => setOpen(!open)}
// //         >
// //           {open ? <X size={28} /> : <Menu size={28} />}
// //         </button>

// //         {/* Mobile menu - ĐÃ SỬA: HIỂN THỊ ĐÚNG THÔNG TIN DRIVER */}
// //         {open && (
// //           <div
// //             className={`absolute top-16 right-6 ${isParent ? "bg-orange-500 text-white" : "bg-white text-gray-800"
// //               } shadow-lg rounded-xl flex flex-col items-center gap-4 py-4 px-8 text-lg font-medium md:hidden animate-fadeIn z-50`}
// //           >
// //             {menuItems.map((item) => (
// //               <button
// //                 key={item.label}
// //                 onClick={() => handleClick(item)}
// //                 className={`transition-colors ${isParent ? "hover:text-black" : "hover:text-orange-500"
// //                   }`}
// //               >
// //                 {item.label}
// //               </button>
// //             ))}

// //             {/* Mobile: Language button */}
// //             <button
// //               onClick={toggleLanguage}
// //               className={`flex items-center gap-1 px-3 py-2 rounded-full border transition ${isParent
// //                 ? "border-white text-white hover:bg-white hover:text-black"
// //                 : "border-gray-300 text-gray-700 hover:bg-gray-100"
// //                 }`}
// //             >
// //               <Globe size={18} />
// //               <span className="text-sm font-medium">{currentLanguage}</span>
// //             </button>

// //             {/* Mobile: Driver info or Login - ĐÃ SỬA LOGIC HIỂN THỊ */}
// //             {isDriverLoggedIn ? (
// //               <div className="flex flex-col gap-3 mt-2 w-full items-center border-t pt-4 border-gray-300">
// //                 <div className="text-center mb-2">
// //                   <p className={`font-semibold ${isParent ? "text-white" : "text-gray-800"}`}>
// //                     👋 {t("header_driver.hello")}, {driverInfo.name || driverInfo.id_driver}
// //                   </p>
// //                   <p className={`text-sm ${isParent ? "text-white opacity-80" : "text-gray-600"}`}>
// //                     ID: {driverInfo.id_driver} |  {t("header_driver.role")}: {driverInfo.role}
// //                   </p>
// //                 </div>
// //                 {/* <button
// //                   onClick={handleProfile}
// //                   className={`flex items-center gap-2 w-full justify-center px-4 py-2 rounded-full border transition ${isParent
// //                     ? "border-white text-white hover:bg-white hover:text-black"
// //                     : "border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
// //                     }`}
// //                 >
// //                   <UserIcon size={16} />
// //                   Thông tin cá nhân
// //                 </button> */}
// //                 <button
// //                   onClick={handleLogout}
// //                   className="flex items-center gap-2 w-full justify-center px-4 py-2 rounded-full border border-white text-white font-medium hover:text-black transition-colors"
// //                 >
// //                   <LogOut size={16} />
// //                   {t("header_driver.logout")}
// //                 </button>
// //               </div>
// //             ) : showLogin ? (
// //               <div className="flex flex-col gap-3 mt-2 w-full items-center border-t pt-4 border-gray-300">
// //                 {loginButton ? (
// //                   <button
// //                     onClick={() => {
// //                       navigate("/login");
// //                       setOpen(false);
// //                     }}
// //                     className={`px-4 py-2 rounded-full border font-medium transition ${isParent
// //                       ? "border-white text-white hover:bg-white hover:text-black"
// //                       : "border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
// //                       }`}
// //                   >
// //                     {t("header.login")}
// //                   </button>
// //                 ) : (
// //                   <button
// //                     onClick={() => {
// //                       navigate("/logout");
// //                       setOpen(false);
// //                     }}
// //                     className="px-4 py-2 rounded-full border border-red-500 text-red-500 font-medium hover:bg-red-500 hover:text-white transition-colors"
// //                   >
// //                     {t("header.logout")}
// //                   </button>
// //                 )}
// //               </div>
// //             ) : null}
// //           </div>
// //         )}
// //       </nav>
// //     </header>
// //   );
// // };

// // export default Header;